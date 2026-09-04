from decimal import Decimal
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from django.contrib.auth import get_user_model

from apps.users.models import SellerProfile
from .models import Category, Product, ProductImage


User = get_user_model()


class CategoryApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.parent = Category.objects.create(name="Electronics", slug="electronics", is_active=True)
        self.child = Category.objects.create(name="Phones", slug="phones", parent=self.parent, is_active=True)
        self.inactive = Category.objects.create(name="Hidden", slug="hidden", is_active=False)

    def test_active_categories_returned(self):
        response = self.client.get(reverse("category-list"))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        slugs = [item["slug"] for item in data["results"]]
        self.assertIn("electronics", slugs)
        self.assertIn("phones", slugs)
        self.assertNotIn("hidden", slugs)

    def test_category_hierarchy(self):
        response = self.client.get(reverse("category-list"))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        electronics = next(item for item in data["results"] if item["slug"] == "electronics")
        self.assertIsNone(electronics["parent"])
        children_slugs = [child["slug"] for child in electronics["children"]]
        self.assertIn("phones", children_slugs)

    def test_category_detail(self):
        response = self.client.get(reverse("category-detail", kwargs={"slug": "electronics"}))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["slug"], "electronics")
        self.assertEqual(data["name"], "Electronics")

    def test_inactive_category_detail_returns_404(self):
        response = self.client.get(reverse("category-detail", kwargs={"slug": "hidden"}))
        self.assertEqual(response.status_code, 404)


class ProductListApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(email="seller@example.com", password="pass123")
        self.seller = SellerProfile.objects.create(
            user=self.user,
            store_name="Seller Store",
            store_slug="seller-store",
            status="active",
        )
        self.category = Category.objects.create(name="Electronics", slug="electronics", is_active=True)
        self.visible = Product.objects.create(
            seller=self.seller,
            category=self.category,
            name="iPhone 15",
            slug="iphone-15",
            sku="SKU-1",
            price=Decimal("999.99"),
            status="active",
            approval_status="approved",
            is_visible=True,
        )
        self.invisible = Product.objects.create(
            seller=self.seller,
            category=self.category,
            name="Hidden Product",
            slug="hidden-product",
            sku="SKU-2",
            price=Decimal("10.00"),
            status="active",
            approval_status="approved",
            is_visible=False,
        )
        self.draft = Product.objects.create(
            seller=self.seller,
            category=self.category,
            name="Draft Product",
            slug="draft-product",
            sku="SKU-3",
            price=Decimal("20.00"),
            status="draft",
            approval_status="pending",
            is_visible=True,
        )
        ProductImage.objects.create(product=self.visible, image="products/a.jpg", is_primary=True, display_order=0)

    def test_visible_products_returned(self):
        response = self.client.get(reverse("product-list"))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        names = [item["name"] for item in data["results"]]
        self.assertIn("iPhone 15", names)
        self.assertNotIn("Hidden Product", names)
        self.assertNotIn("Draft Product", names)

    def test_search_filter(self):
        response = self.client.get(reverse("product-list"), {"search": "iphone"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        names = [item["name"] for item in data["results"]]
        self.assertIn("iPhone 15", names)
        self.assertEqual(len(data["results"]), 1)

    def test_category_filter(self):
        response = self.client.get(reverse("product-list"), {"category": "electronics"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        names = [item["name"] for item in data["results"]]
        self.assertIn("iPhone 15", names)

    def test_min_price_filter(self):
        response = self.client.get(reverse("product-list"), {"min_price": "500"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        names = [item["name"] for item in data["results"]]
        self.assertIn("iPhone 15", names)
        self.assertNotIn("Draft Product", names)

    def test_max_price_filter(self):
        response = self.client.get(reverse("product-list"), {"max_price": "500"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        names = [item["name"] for item in data["results"]]
        self.assertNotIn("iPhone 15", names)

    def test_seller_filter_by_id(self):
        response = self.client.get(reverse("product-list"), {"seller": str(self.seller.id)})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        names = [item["name"] for item in data["results"]]
        self.assertIn("iPhone 15", names)

    def test_seller_filter_by_slug(self):
        response = self.client.get(reverse("product-list"), {"seller": "seller-store"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        names = [item["name"] for item in data["results"]]
        self.assertIn("iPhone 15", names)

    def test_ordering_price(self):
        Product.objects.create(
            seller=self.seller,
            category=self.category,
            name="Cheap",
            slug="cheap",
            sku="SKU-4",
            price=Decimal("5.00"),
            status="active",
            approval_status="approved",
            is_visible=True,
        )
        response = self.client.get(reverse("product-list"), {"ordering": "price"})
        self.assertEqual(response.status_code, 200)
        prices = [Decimal(str(item["price"])) for item in response.json()["results"]]
        self.assertEqual(prices, sorted(prices))

    def test_ordering_newest(self):
        response = self.client.get(reverse("product-list"), {"ordering": "newest"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["results"][0]["name"], "iPhone 15")

    def test_pagination(self):
        response = self.client.get(reverse("product-list"))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("count", data)
        self.assertIn("results", data)


class ProductDetailApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(email="seller@example.com", password="pass123")
        self.seller = SellerProfile.objects.create(
            user=self.user,
            store_name="Seller Store",
            store_slug="seller-store",
            status="active",
        )
        self.category = Category.objects.create(name="Electronics", slug="electronics", is_active=True)
        self.visible = Product.objects.create(
            seller=self.seller,
            category=self.category,
            name="iPhone 15",
            slug="iphone-15",
            sku="SKU-1",
            price=Decimal("999.99"),
            status="active",
            approval_status="approved",
            is_visible=True,
        )
        self.invisible = Product.objects.create(
            seller=self.seller,
            category=self.category,
            name="Hidden",
            slug="hidden",
            sku="SKU-2",
            price=Decimal("10.00"),
            status="active",
            approval_status="approved",
            is_visible=False,
        )
        self.draft = Product.objects.create(
            seller=self.seller,
            category=self.category,
            name="Draft",
            slug="draft",
            sku="SKU-3",
            price=Decimal("20.00"),
            status="draft",
            approval_status="pending",
            is_visible=True,
        )
        ProductImage.objects.create(product=self.visible, image="products/a.jpg", is_primary=True, display_order=0)

    def test_product_detail(self):
        response = self.client.get(reverse("product-detail", kwargs={"id": self.visible.id}))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["id"], self.visible.id)
        self.assertEqual(data["name"], "iPhone 15")
        self.assertEqual(Decimal(str(data["price"])), Decimal("999.99"))
        self.assertEqual(data["category"]["slug"], "electronics")
        self.assertEqual(data["seller"]["store_slug"], "seller-store")
        self.assertEqual(len(data["images"]), 1)

    def test_invisible_product_detail_returns_404(self):
        response = self.client.get(reverse("product-detail", kwargs={"id": self.invisible.id}))
        self.assertEqual(response.status_code, 404)

    def test_draft_product_detail_returns_404(self):
        response = self.client.get(reverse("product-detail", kwargs={"id": self.draft.id}))
        self.assertEqual(response.status_code, 404)

    def test_invalid_product_detail_returns_404(self):
        response = self.client.get(reverse("product-detail", kwargs={"id": 9999}))
        self.assertEqual(response.status_code, 404)


class MarketplaceSecurityTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(email="seller@example.com", password="pass123")
        self.seller = SellerProfile.objects.create(
            user=self.user,
            store_name="Seller Store",
            store_slug="seller-store",
            status="active",
        )
        self.category = Category.objects.create(name="Electronics", slug="electronics", is_active=True)
        self.product = Product.objects.create(
            seller=self.seller,
            category=self.category,
            name="iPhone 15",
            slug="iphone-15",
            sku="SKU-1",
            price=Decimal("999.99"),
            status="active",
            approval_status="approved",
            is_visible=True,
        )

    def test_sensitive_fields_not_exposed_in_list(self):
        response = self.client.get(reverse("product-list"))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        product = data["results"][0]
        self.assertNotIn("email", product)
        self.assertNotIn("password", product)
        self.assertNotIn("user", product["seller"])
        self.assertNotIn("email", product["seller"])

    def test_sensitive_fields_not_exposed_in_detail(self):
        response = self.client.get(reverse("product-detail", kwargs={"id": self.product.id}))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertNotIn("email", data)
        self.assertNotIn("password", data)
        self.assertNotIn("email", data["seller"])
