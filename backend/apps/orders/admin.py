from django.contrib import admin
from .models import Cart, CartItem, Order, OrderItem


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 1
    readonly_fields = ("created_at", "updated_at")


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ("user", "created_at", "updated_at")
    search_fields = ("user__email",)
    list_filter = ("created_at",)
    readonly_fields = ("created_at", "updated_at")
    inlines = [CartItemInline]


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ("cart", "product", "quantity", "created_at", "updated_at")
    search_fields = ("cart__user__email", "product__name")
    list_filter = ("created_at",)
    readonly_fields = ("created_at", "updated_at")


# ---------------------------------------------------------------------------
# Order admin
# ---------------------------------------------------------------------------


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = (
        "product", "product_name", "product_image",
        "unit_price", "quantity", "line_total", "created_at",
    )
    can_delete = False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "order_number", "user", "status", "total",
        "delivery_method", "created_at",
    )
    search_fields = ("order_number", "user__email", "full_name")
    list_filter = ("status", "delivery_method", "created_at")
    readonly_fields = (
        "user", "order_number", "email", "full_name", "phone_number",
        "shipping_address", "shipping_city", "shipping_region",
        "shipping_postal_code", "shipping_country",
        "subtotal", "shipping_cost", "discount", "total",
        "delivery_method", "delivery_description",
        "created_at", "updated_at",
    )
    inlines = [OrderItemInline]


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = (
        "order", "product_name", "unit_price", "quantity",
        "line_total", "created_at",
    )
    search_fields = ("order__order_number", "product_name")
    list_filter = ("created_at",)
    readonly_fields = (
        "order", "product", "product_name", "product_image",
        "unit_price", "quantity", "line_total", "created_at",
    )
