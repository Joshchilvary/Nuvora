from rest_framework import serializers

from apps.users.models import SellerProfile
from .models import Category, Product, ProductImage


class SellerSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = SellerProfile
        fields = ["id", "store_name", "store_slug", "logo", "description", "verification_status", "status"]


class CategorySerializer(serializers.ModelSerializer):
    parent = serializers.SerializerMethodField()
    children = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "description", "image", "parent", "children"]

    def get_parent(self, obj):
        if obj.parent:
            return {
                "id": obj.parent.id,
                "name": obj.parent.name,
                "slug": obj.parent.slug,
            }
        return None

    def get_children(self, obj):
        children = obj.children.filter(is_active=True)
        return [
            {
                "id": child.id,
                "name": child.name,
                "slug": child.slug,
            }
            for child in children
        ]


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ["id", "image", "alt_text", "display_order", "is_primary"]


class ProductListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    seller = SellerSummarySerializer(read_only=True)
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "price",
            "compare_at_price",
            "stock_quantity",
            "category",
            "seller",
            "primary_image",
            "created_at",
        ]

    def get_primary_image(self, obj):
        image = obj.images.filter(is_primary=True).first()
        if image:
            return ProductImageSerializer(image, context=self.context).data
        first = obj.images.first()
        if first:
            return ProductImageSerializer(first, context=self.context).data
        return None


class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    seller = SellerSummarySerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "price",
            "compare_at_price",
            "stock_quantity",
            "category",
            "seller",
            "images",
            "created_at",
            "updated_at",
        ]
