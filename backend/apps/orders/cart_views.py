"""
Cart API views.

All endpoints require authentication and operate exclusively on the
authenticated user's cart. The user is always derived from
``request.user``; the API never accepts a user/cart identifier from
the client to determine ownership.
"""

from django.db import IntegrityError, transaction
from django.db.models import Q
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.marketplace.models import Product
from .models import Cart, CartItem


PURCHASABLE_PRODUCT_FILTER = Q(
    status="active",
    approval_status="approved",
    is_visible=True,
)


def _get_or_create_cart(user):
    """Return the user's cart, creating it if necessary.

    Safe under concurrent requests because Cart.user is a OneToOneField
    with a unique constraint.
    """
    cart, _ = Cart.objects.get_or_create(user=user)
    return cart


def _purchasable_or_error(product_id):
    """Return the product if it is purchasable, else (None, Response)."""
    try:
        product = Product.objects.filter(
            PURCHASABLE_PRODUCT_FILTER, id=product_id
        ).select_related("seller__user", "category").prefetch_related("images").first()
    except (ValueError, TypeError):
        return None, Response(
            {"detail": "Invalid product id.", "code": "invalid_product_id"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if product is None:
        return None, Response(
            {"detail": "This product is not available for purchase.",
             "code": "product_unavailable"},
            status=status.HTTP_404_NOT_FOUND,
        )
    if product.stock_quantity == 0:
        return None, Response(
            {"detail": "This product is out of stock.",
             "code": "out_of_stock"},
            status=status.HTTP_404_NOT_FOUND,
        )
    return product, None


def _purchasability_error(product):
    """Return an error Response if the product is not purchasable, else None.

    Used to re-validate a product that is already loaded (e.g. when
    adding to an existing cart item or updating quantity). This keeps
    the visibility/stock rules consistent with the initial add path.
    """
    if product.status != "active":
        return Response(
            {"detail": "This product is not available for purchase.",
             "code": "product_unavailable"},
            status=status.HTTP_404_NOT_FOUND,
        )
    if product.approval_status != "approved":
        return Response(
            {"detail": "This product is not available for purchase.",
             "code": "product_unavailable"},
            status=status.HTTP_404_NOT_FOUND,
        )
    if not product.is_visible:
        return Response(
            {"detail": "This product is not available for purchase.",
             "code": "product_unavailable"},
            status=status.HTTP_404_NOT_FOUND,
        )
    if product.stock_quantity == 0:
        return Response(
            {"detail": "This product is out of stock.",
             "code": "out_of_stock"},
            status=status.HTTP_404_NOT_FOUND,
        )
    return None


class CartView(APIView):
    """``GET /api/cart/`` — Retrieve the authenticated user's cart."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        cart = _get_or_create_cart(request.user)
        from .serializers import CartSerializer
        serializer = CartSerializer(cart, context={"request": request})
        return Response(serializer.data)


class CartAddView(APIView):
    """``POST /api/cart/items/`` — Add a product to the user's cart."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        from .serializers import CartItemCreateSerializer, CartSerializer
        serializer = CartItemCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product_id = serializer.validated_data["product_id"]
        requested_qty = serializer.validated_data.get("quantity", 1)

        product, error = _purchasable_or_error(product_id)
        if error is not None:
            return error

        cart = _get_or_create_cart(request.user)
        with transaction.atomic():
            existing = CartItem.objects.select_for_update().filter(
                cart=cart, product=product
            ).first()
            if existing is not None:
                purchasability_error = _purchasability_error(product)
                if purchasability_error is not None:
                    return purchasability_error
                new_quantity = existing.quantity + requested_qty
                if new_quantity > product.stock_quantity:
                    return Response(
                        {"detail": "Requested quantity exceeds available stock.",
                         "code": "insufficient_stock"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                existing.quantity = new_quantity
                existing.save()
                item = existing
            else:
                if requested_qty > product.stock_quantity:
                    return Response(
                        {"detail": "Requested quantity exceeds available stock.",
                         "code": "insufficient_stock"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                try:
                    item = CartItem.objects.create(
                        cart=cart, product=product, quantity=requested_qty
                    )
                except IntegrityError:
                    existing = CartItem.objects.select_for_update().filter(
                        cart=cart, product=product
                    ).first()
                    if existing is None:
                        return Response(
                            {"detail": "Unable to add product to cart.",
                             "code": "cart_error"},
                            status=status.HTTP_400_BAD_REQUEST,
                        )
                    new_quantity = existing.quantity + requested_qty
                    if new_quantity > product.stock_quantity:
                        return Response(
                            {"detail": "Requested quantity exceeds available stock.",
                             "code": "insufficient_stock"},
                            status=status.HTTP_400_BAD_REQUEST,
                        )
                    existing.quantity = new_quantity
                    existing.save()
                    item = existing

        cart.refresh_from_db()
        return Response(
            CartSerializer(cart, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class CartItemDetailView(APIView):
    """``PATCH`` (update quantity) and ``DELETE`` (remove item) for a cart product."""

    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, product_id):
        from .serializers import CartItemUpdateSerializer, CartSerializer
        serializer = CartItemUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_quantity = serializer.validated_data["quantity"]

        if new_quantity < 1:
            return Response(
                {"detail": "Quantity must be at least 1.",
                 "code": "invalid_quantity"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cart = _get_or_create_cart(request.user)
        with transaction.atomic():
            try:
                item = CartItem.objects.select_for_update().get(
                    cart=cart, product_id=product_id
                )
            except CartItem.DoesNotExist:
                return Response(
                    {"detail": "Product is not in your cart.",
                     "code": "not_in_cart"},
                    status=status.HTTP_404_NOT_FOUND,
                )
            purchasability_error = _purchasability_error(item.product)
            if purchasability_error is not None:
                return purchasability_error
            if new_quantity > item.product.stock_quantity:
                return Response(
                    {"detail": "Requested quantity exceeds available stock.",
                     "code": "insufficient_stock"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            item.quantity = new_quantity
            item.save()
        cart.refresh_from_db()
        return Response(
            CartSerializer(cart, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )

    def delete(self, request, product_id):
        from .serializers import CartSerializer
        cart = _get_or_create_cart(request.user)
        deleted_count, _ = CartItem.objects.filter(
            cart=cart, product_id=product_id
        ).delete()
        if deleted_count == 0:
            return Response(
                {"detail": "Product is not in your cart.",
                 "code": "not_in_cart"},
                status=status.HTTP_404_NOT_FOUND,
            )
        cart.refresh_from_db()
        return Response(
            CartSerializer(cart, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )


class CartClearView(APIView):
    """``DELETE /api/cart/clear/`` — Clear all items from the user's cart."""

    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request):
        from .serializers import CartSerializer
        cart = _get_or_create_cart(request.user)
        cart.items.all().delete()
        cart.refresh_from_db()
        return Response(
            CartSerializer(cart, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )
