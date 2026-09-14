from rest_framework import serializers

from apps.users.models import SellerProfile
from .models import Category, Product, ProductImage, Wishlist, WishlistItem


def absolute_image_url(image_field, request=None):
    """Return an absolute URL for an image field, or None.

    Works with both local storage and Cloudinary because Cloudinary's
    ImageField returns a full Cloudinary URL string while local storage
    returns a relative path under MEDIA_URL.
    """
    if not image_field:
        return None
    try:
        url = image_field.url
    except Exception:
        return None
    if not url:
        return None
    if url.startswith("http://") or url.startswith("https://"):
        return url
    if request is not None:
        return request.build_absolute_uri(url)
    return url


class SellerSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = SellerProfile
        fields = ["id", "store_name", "store_slug", "logo", "description", "verification_status", "status"]


class CategorySerializer(serializers.ModelSerializer):
    parent = serializers.SerializerMethodField()
    children = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "description", "image", "parent", "children"]

    def get_image(self, obj):
        return absolute_image_url(obj.image, request=self.context.get("request"))

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
    image = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ["id", "image", "alt_text", "display_order", "is_primary"]

    def get_image(self, obj):
        return absolute_image_url(obj.image, request=self.context.get("request"))


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


class WishlistItemCreateSerializer(serializers.Serializer):
    product_id = serializers.IntegerField(min_value=1)


class WishlistItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)

    class Meta:
        model = WishlistItem
        fields = ["id", "product", "created_at"]


class WishlistSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Wishlist
        fields = ["id", "items", "item_count", "created_at", "updated_at"]

    def get_items(self, obj):
        qs = (
            obj.items.select_related("product__category", "product__seller__user")
            .prefetch_related("product__images")
            .order_by("-created_at")
        )
        return WishlistItemSerializer(qs, many=True, context=self.context).data

    def get_item_count(self, obj):
        return obj.items.count()
