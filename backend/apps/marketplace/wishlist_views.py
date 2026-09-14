"""
Wishlist API views.

All endpoints require authentication and operate exclusively on the
authenticated user's wishlist. The user is always derived from
``request.user``; the API never accepts a user identifier from the
client to determine whose wishlist is being accessed.
"""

from django.db import IntegrityError, transaction
from django.db.models import Q
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Product, Wishlist, WishlistItem
from .serializers import (
    WishlistItemCreateSerializer,
    WishlistSerializer,
)


VISIBLE_PRODUCT_FILTER = Q(
    status__in=["active", "out_of_stock"],
    approval_status="approved",
    is_visible=True,
)


def _get_or_create_wishlist(user):
    """Return the user's wishlist, creating it if necessary.

    Uses ``get_or_create`` to remain safe under concurrent requests
    because the Wishlist model has a unique-per-user constraint via
    the ``OneToOneField`` to ``user``.
    """
    wishlist, _ = Wishlist.objects.get_or_create(user=user)
    return wishlist


def _visible_product_or_error(product_id):
    """Return the product if it is publicly visible, else (None, error)."""
    try:
        product = Product.objects.filter(VISIBLE_PRODUCT_FILTER, id=product_id).first()
    except (ValueError, TypeError):
        return None, Response(
            {"detail": "Invalid product id.", "code": "invalid_product_id"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if product is None:
        # Distinguish "not found" from "not visible" only at a generic
        # level to avoid leaking inventory information.
        return None, Response(
            {"detail": "Product is not available.", "code": "product_unavailable"},
            status=status.HTTP_404_NOT_FOUND,
        )
    return product, None


class WishlistView(APIView):
    """``GET /api/wishlist/`` and ``POST /api/wishlist/``."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        wishlist = _get_or_create_wishlist(request.user)
        serializer = WishlistSerializer(wishlist, context={"request": request})
        return Response(serializer.data)

    def post(self, request):
        serializer = WishlistItemCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product_id = serializer.validated_data["product_id"]

        product, error = _visible_product_or_error(product_id)
        if error is not None:
            return error

        wishlist = _get_or_create_wishlist(request.user)
        with transaction.atomic():
            item, created = WishlistItem.objects.get_or_create(
                wishlist=wishlist,
                product=product,
            )
        if not created:
            return Response(
                {
                    "detail": "Product already in wishlist.",
                    "code": "already_in_wishlist",
                    "item_id": item.id,
                },
                status=status.HTTP_200_OK,
            )
        return Response(
            {
                "detail": "Product added to wishlist.",
                "code": "added_to_wishlist",
                "item_id": item.id,
            },
            status=status.HTTP_201_CREATED,
        )


class WishlistRemoveView(APIView):
    """``DELETE /api/wishlist/<product_id>/``."""

    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, product_id):
        try:
            product_id_int = int(product_id)
        except (TypeError, ValueError):
            return Response(
                {"detail": "Invalid product id.", "code": "invalid_product_id"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        wishlist = _get_or_create_wishlist(request.user)
        deleted_count, _ = WishlistItem.objects.filter(
            wishlist=wishlist,
            product_id=product_id_int,
        ).delete()
        if deleted_count == 0:
            return Response(
                {"detail": "Product not in wishlist.", "code": "not_in_wishlist"},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(
            {"detail": "Product removed from wishlist.", "code": "removed_from_wishlist"},
            status=status.HTTP_200_OK,
        )


class WishlistToggleView(APIView):
    """``POST /api/wishlist/toggle/``."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = WishlistItemCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product_id = serializer.validated_data["product_id"]

        product, error = _visible_product_or_error(product_id)
        if error is not None:
            return error

        wishlist = _get_or_create_wishlist(request.user)
        with transaction.atomic():
            existing = WishlistItem.objects.select_for_update().filter(
                wishlist=wishlist,
                product=product,
            ).first()
            if existing is not None:
                existing.delete()
                return Response(
                    {
                        "detail": "Product removed from wishlist.",
                        "code": "removed_from_wishlist",
                        "wishlisted": False,
                    },
                    status=status.HTTP_200_OK,
                )
            try:
                WishlistItem.objects.create(wishlist=wishlist, product=product)
            except IntegrityError:
                # Concurrent insert; treat as already wishlisted.
                return Response(
                    {
                        "detail": "Product is already in your wishlist.",
                        "code": "already_in_wishlist",
                        "wishlisted": True,
                    },
                    status=status.HTTP_200_OK,
                )
            return Response(
                {
                    "detail": "Product added to wishlist.",
                    "code": "added_to_wishlist",
                    "wishlisted": True,
                },
                status=status.HTTP_200_OK,
            )
