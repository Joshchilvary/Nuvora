from django.urls import path
from .cart_views import (
    CartAddView,
    CartClearView,
    CartItemDetailView,
    CartView,
)

urlpatterns = [
    path("cart/", CartView.as_view(), name="cart"),
    path("cart/items/", CartAddView.as_view(), name="cart-add"),
    path("cart/items/<int:product_id>/", CartItemDetailView.as_view(), name="cart-item-detail"),
    path("cart/clear/", CartClearView.as_view(), name="cart-clear"),
]
