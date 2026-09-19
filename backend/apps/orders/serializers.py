from decimal import Decimal
from rest_framework import serializers

from apps.marketplace.serializers import ProductListSerializer
from .models import Cart, CartItem, Order, OrderItem


class CartItemCreateSerializer(serializers.Serializer):
    product_id = serializers.IntegerField(min_value=1)
    quantity = serializers.IntegerField(min_value=1, max_value=999, default=1)


class CartItemUpdateSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=1, max_value=999)


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    unit_price = serializers.SerializerMethodField()
    line_total = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ["id", "product", "quantity", "unit_price", "line_total", "created_at", "updated_at"]

    def get_unit_price(self, obj):
        return str(obj.product.price)

    def get_line_total(self, obj):
        unit = Decimal(str(obj.product.price))
        return str(unit * obj.quantity)


class CartSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()
    item_count = serializers.SerializerMethodField()
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ["id", "items", "item_count", "subtotal", "created_at", "updated_at"]

    def _get_items_list(self, obj):
        if not hasattr(self, "_items_list"):
            self._items_list = list(
                obj.items.select_related("product__category", "product__seller__user")
                .prefetch_related("product__images")
                .order_by("-created_at")
            )
        return self._items_list

    def get_items(self, obj):
        items = self._get_items_list(obj)
        return CartItemSerializer(items, many=True, context=self.context).data

    def get_item_count(self, obj):
        return len(self._get_items_list(obj))

    def get_subtotal(self, obj):
        items = self._get_items_list(obj)
        total = sum(
            Decimal(str(item.product.price)) * item.quantity for item in items
        )
        return str(total)


# ---------------------------------------------------------------------------
# Order serializers
# ---------------------------------------------------------------------------


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product",
            "product_name",
            "product_image",
            "unit_price",
            "quantity",
            "line_total",
            "created_at",
        ]


class OrderListSerializer(serializers.ModelSerializer):
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "status",
            "total",
            "item_count",
            "created_at",
        ]

    def get_item_count(self, obj):
        return obj.items.count()


class OrderDetailSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "status",
            "email",
            "full_name",
            "phone_number",
            "shipping_address",
            "shipping_city",
            "shipping_region",
            "shipping_postal_code",
            "shipping_country",
            "subtotal",
            "shipping_cost",
            "discount",
            "total",
            "delivery_method",
            "delivery_description",
            "items",
            "item_count",
            "created_at",
            "updated_at",
        ]

    def get_item_count(self, obj):
        return obj.items.count()


class OrderCreateSerializer(serializers.Serializer):
    """Accepts only customer/checkout information.

    All pricing, product, and order data is determined server-side from the
    authenticated user's cart.
    """

    email = serializers.EmailField(max_length=255)
    full_name = serializers.CharField(max_length=255)
    phone_number = serializers.CharField(max_length=30, required=False, default="")

    shipping_address = serializers.CharField()
    shipping_city = serializers.CharField(max_length=255)
    shipping_region = serializers.CharField(max_length=255)
    shipping_postal_code = serializers.CharField(max_length=20)
    shipping_country = serializers.CharField(max_length=255)

    delivery_method = serializers.ChoiceField(
        choices=[("standard", "Standard"), ("express", "Express")],
        default="standard",
    )
    delivery_description = serializers.CharField(max_length=255, required=False, default="")
