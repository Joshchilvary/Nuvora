"""
Order API views.

All endpoints require authentication and operate exclusively on the
authenticated user's data.  The user is always derived from
``request.user``; the API never accepts a user identifier from the client.
"""

from decimal import Decimal

from django.db import transaction
from django.db.models import Q
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.marketplace.models import Product, ProductImage

from .models import Cart, CartItem, Order, OrderItem
from .serializers import OrderCreateSerializer, OrderDetailSerializer, OrderListSerializer


PURCHASABLE_PRODUCT_FILTER = Q(
    status="active",
    approval_status="approved",
    is_visible=True,
)


DELIVERY_COSTS = {
    "standard": Decimal("0.00"),
    "express": Decimal("25.00"),
}


def _get_primary_image_url(product):
    """Return the absolute URL of the product's primary image, or blank."""
    image = product.images.filter(is_primary=True).first()
    if image is None:
        image = product.images.first()
    if image is None:
        return ""
    try:
        url = image.image.url
    except Exception:
        return ""
    return url


class OrderCreateView(APIView):
    """``POST /api/orders/`` — Create an order from the user's cart.

    Also handles ``GET /api/orders/`` to list the authenticated user's
    orders, keeping the RESTful convention of a single collection URL.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(user=request.user).order_by("-created_at")
        return Response(OrderListSerializer(orders, many=True).data)

    def post(self, request):
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        with transaction.atomic():
            # Lock the user's cart
            cart = Cart.objects.select_for_update().filter(user=request.user).first()
            if cart is None:
                return Response(
                    {"detail": "Your cart is empty.",
                     "code": "empty_cart"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            cart_items = list(
                cart.items.select_for_update()
                .select_related("product")
            )

            if not cart_items:
                return Response(
                    {"detail": "Your cart is empty.",
                     "code": "empty_cart"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Validate each product and check stock atomically.
            # Each product is re-fetched with select_for_update() to acquire
            # a row-level lock, preventing concurrent stock modifications.
            order_items_data = []
            subtotal = Decimal("0.00")

            for ci in cart_items:
                # Lock the product row for the duration of this transaction
                product = Product.objects.select_for_update().get(pk=ci.product_id)

                # Validate product is still purchasable
                if product.status != "active":
                    return Response(
                        {"detail": f"'{product.name}' is no longer available.",
                         "code": "product_unavailable"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                if product.approval_status != "approved":
                    return Response(
                        {"detail": f"'{product.name}' is no longer available.",
                         "code": "product_unavailable"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                if not product.is_visible:
                    return Response(
                        {"detail": f"'{product.name}' is no longer available.",
                         "code": "product_unavailable"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                if product.stock_quantity < ci.quantity:
                    return Response(
                        {"detail": f"Insufficient stock for '{product.name}'.",
                         "code": "insufficient_stock"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                unit_price = product.price
                line_total = unit_price * ci.quantity
                product_image = _get_primary_image_url(product)

                order_items_data.append({
                    "product": product,
                    "product_name": product.name,
                    "product_image": product_image,
                    "unit_price": unit_price,
                    "quantity": ci.quantity,
                    "line_total": line_total,
                })

                subtotal += line_total

            # Calculate totals
            delivery_method = data["delivery_method"]
            shipping_cost = DELIVERY_COSTS.get(delivery_method, Decimal("0.00"))
            discount = Decimal("0.00")
            total = subtotal + shipping_cost - discount

            # Create the order
            order = Order.objects.create(
                user=request.user,
                email=data["email"],
                full_name=data["full_name"],
                phone_number=data.get("phone_number", ""),
                shipping_address=data["shipping_address"],
                shipping_city=data["shipping_city"],
                shipping_region=data["shipping_region"],
                shipping_postal_code=data["shipping_postal_code"],
                shipping_country=data["shipping_country"],
                subtotal=subtotal,
                shipping_cost=shipping_cost,
                discount=discount,
                total=total,
                delivery_method=delivery_method,
                delivery_description=data.get("delivery_description", ""),
            )

            # Create order items and decrement stock
            order_items = []
            for item_data in order_items_data:
                order_items.append(OrderItem(
                    order=order,
                    product=item_data["product"],
                    product_name=item_data["product_name"],
                    product_image=item_data["product_image"],
                    unit_price=item_data["unit_price"],
                    quantity=item_data["quantity"],
                    line_total=item_data["line_total"],
                ))
                # Decrement stock
                product = item_data["product"]
                product.stock_quantity -= item_data["quantity"]
                product.save(update_fields=["stock_quantity"])

            OrderItem.objects.bulk_create(order_items)

            # Clear the cart
            cart.items.all().delete()

        return Response(
            OrderDetailSerializer(order).data,
            status=status.HTTP_201_CREATED,
        )


class OrderListView(APIView):
    """``GET /api/orders/`` — List the authenticated user's orders."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(user=request.user).order_by("-created_at")
        return Response(OrderListSerializer(orders, many=True).data)


class OrderDetailView(APIView):
    """``GET /api/orders/<order_number>/`` — Retrieve a single order."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, order_number):
        try:
            order = Order.objects.prefetch_related("items").get(
                order_number=order_number,
                user=request.user,
            )
        except Order.DoesNotExist:
            return Response(
                {"detail": "Order not found.",
                 "code": "order_not_found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(OrderDetailSerializer(order).data)
