"""
Tests for the Wishlist API.

Covers authentication, isolation between users, duplicate prevention,
product visibility rules, toggle behavior, error handling, and the
response structure that the React frontend will consume.
"""

import io
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from PIL import Image
from rest_framework.test import APIClient

from apps.users.models import SellerProfile
from .models import Category, Product, ProductImage, Wishlist, WishlistItem


User = get_user_model()


def _make_image_bytes(format="PNG", size=(10, 10), color=(255, 0, 0)):
    buffer = io.BytesIO()
    Image.new("RGB", size, color).save(buffer, format=format)
    return buffer.getvalue()


def _make_product(
    seller,
    category,
    *,
    name,
    slug,
    sku,
    price="99.99",
    status="active",
    approval_status="approved",
    is_visible=True,
):
    return Product.objects.create(
        seller=seller,
        category=category,
        name=name,
        slug=slug,
        sku=sku,
        price=Decimal(price),
        stock_quantity=10,
        status=status,
        approval_status=approval_status,
        is_visible=is_visible,
    )


class WishlistApiTestBase(TestCase):
    @classmethod
    def setUpTestData(cls):
        seller_user = User.objects.create_user(email="seller@example.com", password="sellerpass123")
        cls.seller = SellerProfile.objects.create(
            user=seller_user,
            store_name="Store",
            store_slug="store",
            status="active",
        )
        cls.category = Category.objects.create(
            name="Electronics", slug="electronics", is_active=True
        )

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="buyer@example.com", password="buyerpass123"
        )
        self.other_user = User.objects.create_user(
            email="other@example.com", password="otherpass123"
        )

        self.visible_product = _make_product(
            self.seller, self.category,
            name="Visible", slug="visible", sku="SKU-V1",
        )
        self.hidden_product = _make_product(
            self.seller, self.category,
            name="Hidden", slug="hidden", sku="SKU-H1",
            is_visible=False,
        )
        self.pending_product = _make_product(
            self.seller, self.category,
            name="Pending", slug="pending", sku="SKU-P1",
            approval_status="pending",
        )
        self.draft_product = _make_product(
            self.seller, self.category,
            name="Draft", slug="draft", sku="SKU-D1",
            status="draft",
        )
        self.archived_product = _make_product(
            self.seller, self.category,
            name="Archived", slug="archived", sku="SKU-A1",
            status="archived",
        )
        self.out_of_stock_product = _make_product(
            self.seller, self.category,
            name="OOS", slug="oos", sku="SKU-O1",
            status="out_of_stock",
        )

        ProductImage.objects.create(
            product=self.visible_product,
            image="products/visible.png",
            is_primary=True,
        )


class WishlistAuthenticationTests(WishlistApiTestBase):
    def test_unauthenticated_get_fails(self):
        response = self.client.get(reverse("wishlist"))
        self.assertIn(response.status_code, (401, 403))

    def test_unauthenticated_post_fails(self):
        response = self.client.post(
            reverse("wishlist"), {"product_id": self.visible_product.id}, format="json"
        )
        self.assertIn(response.status_code, (401, 403))

    def test_unauthenticated_delete_fails(self):
        response = self.client.delete(
            reverse("wishlist-remove", kwargs={"product_id": self.visible_product.id})
        )
        self.assertIn(response.status_code, (401, 403))

    def test_unauthenticated_toggle_fails(self):
        response = self.client.post(
            reverse("wishlist-toggle"),
            {"product_id": self.visible_product.id},
            format="json",
        )
        self.assertIn(response.status_code, (401, 403))


class WishlistGetTests(WishlistApiTestBase):
    def test_authenticated_get_creates_wishlist_when_absent(self):
        self.client.force_authenticate(self.user)
        self.assertFalse(Wishlist.objects.filter(user=self.user).exists())
        response = self.client.get(reverse("wishlist"))
        self.assertEqual(response.status_code, 200)
        self.assertTrue(Wishlist.objects.filter(user=self.user).exists())
        data = response.json()
        self.assertIn("items", data)
        self.assertEqual(data["items"], [])
        self.assertEqual(data["item_count"], 0)

    def test_authenticated_get_returns_wishlist_with_items(self):
        WishlistItem.objects.create(
            wishlist=Wishlist.objects.create(user=self.user),
            product=self.visible_product,
        )
        self.client.force_authenticate(self.user)
        response = self.client.get(reverse("wishlist"))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["item_count"], 1)
        self.assertEqual(len(data["items"]), 1)
        item = data["items"][0]
        self.assertIn("product", item)
        self.assertEqual(item["product"]["id"], self.visible_product.id)
        self.assertEqual(item["product"]["name"], "Visible")


class WishlistAddTests(WishlistApiTestBase):
    def test_authenticated_add_product(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(
            reverse("wishlist"),
            {"product_id": self.visible_product.id},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertTrue(
            WishlistItem.objects.filter(
                wishlist__user=self.user, product=self.visible_product
            ).exists()
        )

    def test_adding_same_product_twice_does_not_duplicate(self):
        self.client.force_authenticate(self.user)
        first = self.client.post(
            reverse("wishlist"),
            {"product_id": self.visible_product.id},
            format="json",
        )
        self.assertEqual(first.status_code, 201)
        second = self.client.post(
            reverse("wishlist"),
            {"product_id": self.visible_product.id},
            format="json",
        )
        self.assertEqual(second.status_code, 200)
        self.assertEqual(
            WishlistItem.objects.filter(
                wishlist__user=self.user, product=self.visible_product
            ).count(),
            1,
        )

    def test_add_wishlist_created_safely_when_absent(self):
        self.client.force_authenticate(self.user)
        self.assertFalse(Wishlist.objects.filter(user=self.user).exists())
        self.client.post(
            reverse("wishlist"),
            {"product_id": self.visible_product.id},
            format="json",
        )
        self.assertTrue(Wishlist.objects.filter(user=self.user).exists())

    def test_add_hidden_product_rejected(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(
            reverse("wishlist"),
            {"product_id": self.hidden_product.id},
            format="json",
        )
        self.assertEqual(response.status_code, 404)

    def test_add_pending_product_rejected(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(
            reverse("wishlist"),
            {"product_id": self.pending_product.id},
            format="json",
        )
        self.assertEqual(response.status_code, 404)

    def test_add_draft_product_rejected(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(
            reverse("wishlist"),
            {"product_id": self.draft_product.id},
            format="json",
        )
        self.assertEqual(response.status_code, 404)

    def test_add_archived_product_rejected(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(
            reverse("wishlist"),
            {"product_id": self.archived_product.id},
            format="json",
        )
        self.assertEqual(response.status_code, 404)

    def test_add_out_of_stock_product_is_allowed(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(
            reverse("wishlist"),
            {"product_id": self.out_of_stock_product.id},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertTrue(
            WishlistItem.objects.filter(
                wishlist__user=self.user, product=self.out_of_stock_product
            ).exists()
        )

    def test_add_nonexistent_product_returns_404(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(
            reverse("wishlist"), {"product_id": 999999}, format="json"
        )
        self.assertEqual(response.status_code, 404)

    def test_add_missing_product_id_rejected(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(reverse("wishlist"), {}, format="json")
        self.assertEqual(response.status_code, 400)

    def test_add_invalid_product_id_rejected(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(
            reverse("wishlist"), {"product_id": "abc"}, format="json"
        )
        self.assertEqual(response.status_code, 400)


class WishlistRemoveTests(WishlistApiTestBase):
    def test_remove_existing_item(self):
        wishlist = Wishlist.objects.create(user=self.user)
        WishlistItem.objects.create(wishlist=wishlist, product=self.visible_product)
        self.client.force_authenticate(self.user)
        response = self.client.delete(
            reverse("wishlist-remove", kwargs={"product_id": self.visible_product.id})
        )
        self.assertEqual(response.status_code, 200)
        self.assertFalse(
            WishlistItem.objects.filter(wishlist__user=self.user, product=self.visible_product).exists()
        )

    def test_remove_nonexistent_item_returns_404(self):
        self.client.force_authenticate(self.user)
        response = self.client.delete(
            reverse("wishlist-remove", kwargs={"product_id": self.visible_product.id})
        )
        self.assertEqual(response.status_code, 404)


class WishlistToggleTests(WishlistApiTestBase):
    def test_toggle_adds_product(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(
            reverse("wishlist-toggle"),
            {"product_id": self.visible_product.id},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["wishlisted"])
        self.assertTrue(
            WishlistItem.objects.filter(
                wishlist__user=self.user, product=self.visible_product
            ).exists()
        )

    def test_toggle_removes_product(self):
        wishlist = Wishlist.objects.create(user=self.user)
        WishlistItem.objects.create(wishlist=wishlist, product=self.visible_product)
        self.client.force_authenticate(self.user)
        response = self.client.post(
            reverse("wishlist-toggle"),
            {"product_id": self.visible_product.id},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.json()["wishlisted"])
        self.assertFalse(
            WishlistItem.objects.filter(
                wishlist__user=self.user, product=self.visible_product
            ).exists()
        )

    def test_toggle_rejects_invalid_product(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(
            reverse("wishlist-toggle"), {"product_id": 99999}, format="json"
        )
        self.assertEqual(response.status_code, 404)


class WishlistIsolationTests(WishlistApiTestBase):
    def test_users_have_isolated_wishlists(self):
        wishlist_a = Wishlist.objects.create(user=self.user)
        wishlist_b = Wishlist.objects.create(user=self.other_user)
        WishlistItem.objects.create(wishlist=wishlist_a, product=self.visible_product)
        WishlistItem.objects.create(wishlist=wishlist_b, product=self.hidden_product)

        self.client.force_authenticate(self.user)
        response = self.client.get(reverse("wishlist"))
        self.assertEqual(response.status_code, 200)
        ids = [item["product"]["id"] for item in response.json()["items"]]
        self.assertIn(self.visible_product.id, ids)
        self.assertNotIn(self.hidden_product.id, ids)

        self.client.force_authenticate(self.other_user)
        response = self.client.get(reverse("wishlist"))
        self.assertEqual(response.status_code, 200)
        ids = [item["product"]["id"] for item in response.json()["items"]]
        self.assertIn(self.hidden_product.id, ids)
        self.assertNotIn(self.visible_product.id, ids)

    def test_user_cannot_remove_another_users_item(self):
        other_wishlist = Wishlist.objects.create(user=self.other_user)
        WishlistItem.objects.create(wishlist=other_wishlist, product=self.visible_product)
        self.client.force_authenticate(self.user)
        response = self.client.delete(
            reverse("wishlist-remove", kwargs={"product_id": self.visible_product.id})
        )
        self.assertEqual(response.status_code, 404)
        self.assertTrue(
            WishlistItem.objects.filter(
                wishlist__user=self.other_user, product=self.visible_product
            ).exists()
        )


class WishlistResponseStructureTests(WishlistApiTestBase):
    def test_response_includes_react_consumable_product_data(self):
        wishlist = Wishlist.objects.create(user=self.user)
        WishlistItem.objects.create(wishlist=wishlist, product=self.visible_product)
        self.client.force_authenticate(self.user)
        response = self.client.get(reverse("wishlist"))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("id", data)
        self.assertIn("item_count", data)
        self.assertIn("items", data)
        product = data["items"][0]["product"]
        for field in ("id", "name", "slug", "price", "category", "seller", "primary_image"):
            self.assertIn(field, product)
        for forbidden in ("email", "password", "user"):
            self.assertNotIn(forbidden, product["seller"])

    def test_response_does_not_expose_seller_email(self):
        wishlist = Wishlist.objects.create(user=self.user)
        WishlistItem.objects.create(wishlist=wishlist, product=self.visible_product)
        self.client.force_authenticate(self.user)
        body = self.client.get(reverse("wishlist")).content.decode("utf-8")
        for forbidden in (
            "CLOUDINARY_API_SECRET",
            "CLOUDINARY_API_KEY",
            f'"{self.seller.user.email}"',
        ):
            self.assertNotIn(forbidden, body)
