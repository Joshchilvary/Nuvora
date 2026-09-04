from django.contrib import admin
from .models import Category, Product, ProductImage


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "parent", "is_active", "created_at")
    search_fields = ("name", "slug", "description")
    list_filter = ("is_active", "parent")
    readonly_fields = ("created_at", "updated_at")


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    readonly_fields = ("created_at",)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "seller", "category", "price", "stock_quantity", "status", "approval_status", "is_visible", "created_at")
    search_fields = ("name", "slug", "sku", "seller__store_name", "category__name")
    list_filter = ("status", "approval_status", "is_visible", "category", "seller", "created_at")
    readonly_fields = ("created_at", "updated_at")
    inlines = [ProductImageInline]


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ("product", "display_order", "is_primary", "created_at")
    search_fields = ("product__name", "alt_text")
    list_filter = ("is_primary", "created_at")
    readonly_fields = ("created_at",)
