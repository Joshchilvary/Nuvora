from django.urls import path
from .views import CategoryDetailView, CategoryListView, ProductDetailView, ProductListView
from .wishlist_views import WishlistRemoveView, WishlistToggleView, WishlistView

urlpatterns = [
    path("categories/", CategoryListView.as_view(), name="category-list"),
    path("categories/<slug:slug>/", CategoryDetailView.as_view(), name="category-detail"),
    path("products/", ProductListView.as_view(), name="product-list"),
    path("products/<int:id>/", ProductDetailView.as_view(), name="product-detail"),
    path("wishlist/", WishlistView.as_view(), name="wishlist"),
    path("wishlist/toggle/", WishlistToggleView.as_view(), name="wishlist-toggle"),
    path("wishlist/<int:product_id>/", WishlistRemoveView.as_view(), name="wishlist-remove"),
]
