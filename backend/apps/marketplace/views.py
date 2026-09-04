from django.db.models import Q
from rest_framework import generics, permissions, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from .models import Category, Product
from .serializers import CategorySerializer, ProductDetailSerializer, ProductListSerializer


class CategoryPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = "page_size"
    max_page_size = 200


class ProductPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.filter(is_active=True).select_related("parent")
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = CategoryPagination


class CategoryDetailView(generics.RetrieveAPIView):
    queryset = Category.objects.filter(is_active=True).select_related("parent").prefetch_related("children")
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "slug"


class ProductListView(generics.ListAPIView):
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = ProductPagination

    def get_queryset(self):
        return (
            Product.objects.filter(
                status="active",
                approval_status="approved",
                is_visible=True,
            )
            .select_related("seller__user", "category")
            .prefetch_related("images")
            .order_by("-created_at")
        )

    def filter_queryset(self, queryset):
        queryset = super().filter_queryset(queryset)

        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )

        category_slug = self.request.query_params.get("category")
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)

        min_price = self.request.query_params.get("min_price")
        if min_price is not None:
            try:
                queryset = queryset.filter(price__gte=float(min_price))
            except (ValueError, TypeError):
                pass

        max_price = self.request.query_params.get("max_price")
        if max_price is not None:
            try:
                queryset = queryset.filter(price__lte=float(max_price))
            except (ValueError, TypeError):
                pass

        seller = self.request.query_params.get("seller")
        if seller:
            seller_q = Q()
            if seller.isdigit():
                seller_q |= Q(seller__id=seller)
            else:
                seller_q |= Q(seller__store_slug=seller)
            queryset = queryset.filter(seller_q)

        ordering = self.request.query_params.get("ordering")
        if ordering == "price":
            queryset = queryset.order_by("price")
        elif ordering == "-price":
            queryset = queryset.order_by("-price")
        elif ordering == "newest":
            queryset = queryset.order_by("-created_at")
        elif ordering == "-newest":
            queryset = queryset.order_by("created_at")
        elif ordering:
            queryset = queryset.order_by(ordering)

        return queryset


class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(
        status="active",
        approval_status="approved",
        is_visible=True,
    ).select_related("seller__user", "category").prefetch_related("images")
    serializer_class = ProductDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "id"
