"""
Comprehensive test suite for the NUVORA Cart API.

Covers authentication, cart isolation, creation, add/update/remove/clear
items, response structure, database constraints, URL routing, and
security/trust boundaries.

NOTE: SQLite (the dev database) silently disables SELECT FOR UPDATE row
locking. True concurrency/locking tests require PostgreSQL and are
explicitly out of scope here. The test suite documents this limitation
rather than pretending to test row-level locking behavior.
"""

from decimal import Decimal

from django.contrib.auth import get_user_model
from django.db import IntegrityError
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.users.models import SellerProfile
from apps.marketplace.models import Category, Product
from .models import Cart, CartItem


User = get_user_model()


def _make_product(
    seller,
    category,
    *,
    name,
    slug,
    sku,
    price="99.99",
    stock_quantity=10,
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
        stock_quantity=stock_quantity,
        status=status,
        approval_status=approval_status,
        is_visible=is_visible,
    )


class CartApiTestBase(TestCase):
    """Shared fixtures for all cart API tests."""

    @classmethod
    def setUpTestData(cls):
        seller_user = User.objects.create_user(
            email="seller@example.com", password="sellerpass123"
        )
        cls.seller = SellerProfile.objects.create(
            user=seller_user,
            store_name="Test Store",
            store_slug="test-store",
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
        self.product = _make_product(
            self.seller, self.category,
            name="Widget", slug="widget", sku="SKU-001",
        )
        self.product_b = _make_product(
            self.seller, self.category,
            name="Gadget", slug="gadget", sku="SKU-002", price="49.50",
        )


# ---------------------------------------------------------------------------
# 1. AUTHENTICATION (tests 1-5)
# ---------------------------------------------------------------------------

class CartAuthenticationTests(CartApiTestBase):

    def test_unauthenticated_get_cart_rejected(self):
        response = self.client.get(reverse("cart"))
        self.assertIn(response.status_code, (401, 403))

    def test_unauthenticated_add_item_rejected(self):
        response = self.client.post(
            reverse("cart-add"),
            {"product_id": self.product.id},
            format="json",
        )
        self.assertIn(response.status_code, (401, 403))

    def test_unauthenticated_update_item_rejected(self):
        response = self.client.patch(
            reverse("cart-item-detail", kwargs={"product_id": self.product.id}),
            {"quantity": 2},
            format="json",
        )
        self.assertIn(response.status_code, (401, 403))

    def test_unauthenticated_remove_item_rejected(self):
        response = self.client.delete(
            reverse("cart-item-detail", kwargs={"product_id": self.product.id})
        )
        self.assertIn(response.status_code, (401, 403))

    def test_unauthenticated_clear_cart_rejected(self):
        response = self.client.delete(reverse("cart-clear"))
        self.assertIn(response.status_code, (401, 403))


# ---------------------------------------------------------------------------
# 2. CART ISOLATION (tests 6-10)
# ---------------------------------------------------------------------------

class CartIsolationTests(CartApiTestBase):

    def test_user_a_cannot_see_user_b_cart(self):
        cart_b = Cart.objects.create(user=self.other_user)
        CartItem.objects.create(cart=cart_b, product=self.product, quantity=3)

        self.client.force_authenticate(self.user)
        response = self.client.get(reverse("cart"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["item_count"], 0)

    def test_user_a_cart_contains_only_a_items(self):
        cart_a = Cart.objects.create(user=self.user)
        cart_b = Cart.objects.create(user=self.other_user)
        CartItem.objects.create(cart=cart_a, product=self.product, quantity=1)
        CartItem.objects.create(cart=cart_b, product=self.product_b, quantity=2)

        self.client.force_authenticate(self.user)
        response = self.client.get(reverse("cart"))
        data = response.json()
        self.assertEqual(data["item_count"], 1)
        product_ids = [item["product"]["id"] for item in data["items"]]
        self.assertIn(self.product.id, product_ids)
        self.assertNotIn(self.product_b.id, product_ids)

    def test_user_a_cannot_modify_user_b_cart_item(self):
        cart_b = Cart.objects.create(user=self.other_user)
        CartItem.objects.create(cart=cart_b, product=self.product, quantity=5)

        self.client.force_authenticate(self.user)
        response = self.client.patch(
            reverse("cart-item-detail", kwargs={"product_id": self.product.id}),
            {"quantity": 1},
            format="json",
        )
        self.assertEqual(response.status_code, 404)

        cart_b.refresh_from_db()
        item = CartItem.objects.get(cart=cart_b, product=self.product)
        self.assertEqual(item.quantity, 5)

    def test_user_a_cannot_delete_user_b_cart_item(self):
        cart_b = Cart.objects.create(user=self.other_user)
        CartItem.objects.create(cart=cart_b, product=self.product, quantity=5)

        self.client.force_authenticate(self.user)
        response = self.client.delete(
            reverse("cart-item-detail", kwargs={"product_id": self.product.id})
        )
        self.assertEqual(response.status_code, 404)
        self.assertTrue(CartItem.objects.filter(cart=cart_b, product=self.product).exists())

    def test_clear_user_a_does_not_affect_user_b(self):
        cart_a = Cart.objects.create(user=self.user)
        cart_b = Cart.objects.create(user=self.other_user)
        CartItem.objects.create(cart=cart_a, product=self.product, quantity=1)
        CartItem.objects.create(cart=cart_b, product=self.product, quantity=2)

        self.client.force_authenticate(self.user)
        response = self.client.delete(reverse("cart-clear"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["item_count"], 0)

        self.assertTrue(CartItem.objects.filter(cart=cart_b, product=self.product).exists())
        item_b = CartItem.objects.get(cart=cart_b, product=self.product)
        self.assertEqual(item_b.quantity, 2)


# ---------------------------------------------------------------------------
# 3. CART CREATION (tests 11-12)
# ---------------------------------------------------------------------------

class CartCreationTests(CartApiTestBase):

    def test_get_cart_creates_cart_when_absent(self):
        self.assertFalse(Cart.objects.filter(user=self.user).exists())
        self.client.force_authenticate(self.user)
        response = self.client.get(reverse("cart"))
        self.assertEqual(response.status_code, 200)
        self.assertTrue(Cart.objects.filter(user=self.user).exists())

    def test_cart_reused_on_subsequent_requests(self):
        self.client.force_authenticate(self.user)
        self.client.get(reverse("cart"))
        cart_id = Cart.objects.get(user=self.user).id
        self.client.get(reverse("cart"))
        self.assertEqual(Cart.objects.filter(user=self.user).count(), 1)
        self.assertEqual(Cart.objects.get(user=self.user).id, cart_id)


# ---------------------------------------------------------------------------
# 4. ADD ITEM (tests 13-28)
# ---------------------------------------------------------------------------

class CartAddItemTests(CartApiTestBase):

    def _add(self, product_id, **kwargs):
        self.client.force_authenticate(self.user)
        payload = {"product_id": product_id, **kwargs}
        return self.client.post(reverse("cart-add"), payload, format="json")

    def test_add_product_default_quantity_1(self):
        response = self._add(self.product.id)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        item = CartItem.objects.get(
            cart__user=self.user, product=self.product
        )
        self.assertEqual(item.quantity, 1)

    def test_add_product_explicit_quantity(self):
        response = self._add(self.product.id, quantity=3)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        item = CartItem.objects.get(
            cart__user=self.user, product=self.product
        )
        self.assertEqual(item.quantity, 3)

    def test_add_same_product_increments_quantity(self):
        self._add(self.product.id, quantity=2)
        self._add(self.product.id, quantity=3)
        item = CartItem.objects.get(
            cart__user=self.user, product=self.product
        )
        self.assertEqual(item.quantity, 5)

    def test_product_price_from_database_not_request(self):
        self._add(self.product.id)
        item = CartItem.objects.get(
            cart__user=self.user, product=self.product
        )
        self.assertEqual(item.product.price, Decimal("99.99"))

    def test_client_cannot_inject_price(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(
            reverse("cart-add"),
            {"product_id": self.product.id, "price": "0.01"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        item = CartItem.objects.get(
            cart__user=self.user, product=self.product
        )
        self.assertEqual(item.product.price, Decimal("99.99"))

    def test_quantity_below_1_rejected(self):
        response = self._add(self.product.id, quantity=0)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_quantity_above_max_rejected(self):
        response = self._add(self.product.id, quantity=1000)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_quantity_rejected(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(
            reverse("cart-add"),
            {"product_id": self.product.id, "quantity": "abc"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_product_id_rejected(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(
            reverse("cart-add"),
            {"product_id": "not-a-number"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_nonexistent_product_returns_error(self):
        response = self._add(999999)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.json()["code"], "product_unavailable")

    def test_inactive_product_cannot_be_added(self):
        inactive = _make_product(
            self.seller, self.category,
            name="Inactive", slug="inactive", sku="SKU-IN",
            status="inactive",
        )
        response = self._add(inactive.id)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_unapproved_product_cannot_be_added(self):
        pending = _make_product(
            self.seller, self.category,
            name="Pending", slug="pending", sku="SKU-PN",
            approval_status="pending",
        )
        response = self._add(pending.id)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_hidden_product_cannot_be_added(self):
        hidden = _make_product(
            self.seller, self.category,
            name="Hidden", slug="hidden", sku="SKU-HN",
            is_visible=False,
        )
        response = self._add(hidden.id)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_out_of_stock_product_cannot_be_added(self):
        oos = _make_product(
            self.seller, self.category,
            name="OOS", slug="oos", sku="SKU-OO",
            stock_quantity=0,
        )
        response = self._add(oos.id)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.json()["code"], "out_of_stock")

    def test_quantity_exceeding_stock_rejected(self):
        low_stock = _make_product(
            self.seller, self.category,
            name="Low", slug="low", sku="SKU-LS",
            stock_quantity=2,
        )
        response = self._add(low_stock.id, quantity=3)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json()["code"], "insufficient_stock")

    def test_add_exactly_available_stock_succeeds(self):
        limited = _make_product(
            self.seller, self.category,
            name="Limited", slug="limited", sku="SKU-LM",
            stock_quantity=5,
        )
        response = self._add(limited.id, quantity=5)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        item = CartItem.objects.get(
            cart__user=self.user, product=limited
        )
        self.assertEqual(item.quantity, 5)


# ---------------------------------------------------------------------------
# 5. UPDATE ITEM (tests 29-36)
# ---------------------------------------------------------------------------

class CartUpdateItemTests(CartApiTestBase):

    def _patch(self, product_id, **kwargs):
        self.client.force_authenticate(self.user)
        return self.client.patch(
            reverse("cart-item-detail", kwargs={"product_id": product_id}),
            kwargs,
            format="json",
        )

    def setUp(self):
        super().setUp()
        self.cart = Cart.objects.create(user=self.user)
        self.cart_item = CartItem.objects.create(
            cart=self.cart, product=self.product, quantity=2
        )

    def test_update_quantity(self):
        response = self._patch(self.product.id, quantity=5)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.cart_item.refresh_from_db()
        self.assertEqual(self.cart_item.quantity, 5)

    def test_quantity_below_1_rejected(self):
        response = self._patch(self.product.id, quantity=0)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.cart_item.refresh_from_db()
        self.assertEqual(self.cart_item.quantity, 2)

    def test_quantity_above_max_rejected(self):
        response = self._patch(self.product.id, quantity=1000)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.cart_item.refresh_from_db()
        self.assertEqual(self.cart_item.quantity, 2)

    def test_quantity_exceeding_stock_rejected(self):
        response = self._patch(self.product.id, quantity=self.product.stock_quantity + 1)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json()["code"], "insufficient_stock")
        self.cart_item.refresh_from_db()
        self.assertEqual(self.cart_item.quantity, 2)

    def test_update_item_not_in_cart_returns_404(self):
        response = self._patch(self.product_b.id, quantity=1)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.json()["code"], "not_in_cart")

    def test_update_unavailable_product_rejected(self):
        self.product.status = "inactive"
        self.product.save()
        response = self._patch(self.product.id, quantity=1)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.json()["code"], "product_unavailable")

    def test_update_out_of_stock_product_rejected(self):
        self.product.stock_quantity = 0
        self.product.save()
        response = self._patch(self.product.id, quantity=1)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.json()["code"], "out_of_stock")

    def test_price_remains_server_authoritative_after_update(self):
        response = self._patch(self.product.id, quantity=3)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        item = next(
            i for i in data["items"]
            if i["product"]["id"] == self.product.id
        )
        self.assertEqual(Decimal(item["unit_price"]), Decimal("99.99"))


# ---------------------------------------------------------------------------
# 6. REMOVE ITEM (tests 37-39)
# ---------------------------------------------------------------------------

class CartRemoveItemTests(CartApiTestBase):

    def setUp(self):
        super().setUp()
        self.cart = Cart.objects.create(user=self.user)
        self.cart_item = CartItem.objects.create(
            cart=self.cart, product=self.product, quantity=2
        )

    def test_remove_existing_item(self):
        self.client.force_authenticate(self.user)
        response = self.client.delete(
            reverse("cart-item-detail", kwargs={"product_id": self.product.id})
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(
            CartItem.objects.filter(cart=self.cart, product=self.product).exists()
        )

    def test_remove_item_not_in_cart_returns_404(self):
        self.client.force_authenticate(self.user)
        response = self.client.delete(
            reverse("cart-item-detail", kwargs={"product_id": self.product_b.id})
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.json()["code"], "not_in_cart")

    def test_remove_item_cannot_remove_other_users_item(self):
        other_cart = Cart.objects.create(user=self.other_user)
        CartItem.objects.create(
            cart=other_cart, product=self.product_b, quantity=5
        )

        self.client.force_authenticate(self.user)
        response = self.client.delete(
            reverse("cart-item-detail", kwargs={"product_id": self.product_b.id})
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(
            CartItem.objects.filter(
                cart=other_cart, product=self.product_b
            ).exists()
        )


# ---------------------------------------------------------------------------
# 7. CLEAR CART (tests 40-42)
# ---------------------------------------------------------------------------

class CartClearTests(CartApiTestBase):

    def test_clear_removes_all_items(self):
        cart = Cart.objects.create(user=self.user)
        CartItem.objects.create(cart=cart, product=self.product, quantity=1)
        CartItem.objects.create(cart=cart, product=self.product_b, quantity=2)

        self.client.force_authenticate(self.user)
        response = self.client.delete(reverse("cart-clear"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["item_count"], 0)
        self.assertFalse(CartItem.objects.filter(cart=cart).exists())

    def test_clear_empty_cart_succeeds(self):
        Cart.objects.create(user=self.user)
        self.client.force_authenticate(self.user)
        response = self.client.delete(reverse("cart-clear"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["item_count"], 0)

    def test_clear_does_not_affect_other_user(self):
        cart_a = Cart.objects.create(user=self.user)
        cart_b = Cart.objects.create(user=self.other_user)
        CartItem.objects.create(cart=cart_a, product=self.product, quantity=1)
        CartItem.objects.create(cart=cart_b, product=self.product, quantity=3)

        self.client.force_authenticate(self.user)
        response = self.client.delete(reverse("cart-clear"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        item_b = CartItem.objects.get(cart=cart_b, product=self.product)
        self.assertEqual(item_b.quantity, 3)


# ---------------------------------------------------------------------------
# 8. RESPONSE STRUCTURE (tests 43-49)
# ---------------------------------------------------------------------------

class CartResponseStructureTests(CartApiTestBase):

    def setUp(self):
        super().setUp()
        self.cart = Cart.objects.create(user=self.user)
        CartItem.objects.create(
            cart=self.cart, product=self.product, quantity=2
        )

    def test_cart_response_has_expected_fields(self):
        self.client.force_authenticate(self.user)
        response = self.client.get(reverse("cart"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        for field in ("id", "items", "item_count", "subtotal", "created_at", "updated_at"):
            self.assertIn(field, data)

    def test_cart_item_response_has_product_and_quantity(self):
        self.client.force_authenticate(self.user)
        response = self.client.get(reverse("cart"))
        item = response.json()["items"][0]
        for field in ("id", "product", "quantity", "unit_price", "line_total", "created_at", "updated_at"):
            self.assertIn(field, item)
        self.assertIn("id", item["product"])
        self.assertIn("name", item["product"])
        self.assertIn("price", item["product"])

    def test_item_count_is_correct(self):
        CartItem.objects.create(
            cart=self.cart, product=self.product_b, quantity=1
        )
        self.client.force_authenticate(self.user)
        response = self.client.get(reverse("cart"))
        self.assertEqual(response.json()["item_count"], 2)

    def test_subtotal_is_correct(self):
        CartItem.objects.create(
            cart=self.cart, product=self.product_b, quantity=3
        )
        self.client.force_authenticate(self.user)
        response = self.client.get(reverse("cart"))
        expected = Decimal("99.99") * 2 + Decimal("49.50") * 3
        self.assertEqual(Decimal(response.json()["subtotal"]), expected)

    def test_line_totals_are_correct(self):
        self.client.force_authenticate(self.user)
        response = self.client.get(reverse("cart"))
        item = response.json()["items"][0]
        expected = Decimal("99.99") * 2
        self.assertEqual(Decimal(item["line_total"]), expected)
        self.assertEqual(Decimal(item["unit_price"]), Decimal("99.99"))

    def test_decimal_money_serialized_as_strings(self):
        self.client.force_authenticate(self.user)
        response = self.client.get(reverse("cart"))
        data = response.json()
        self.assertIsInstance(data["subtotal"], str)
        item = data["items"][0]
        self.assertIsInstance(item["unit_price"], str)
        self.assertIsInstance(item["line_total"], str)

    def test_unavailable_product_does_not_corrupt_cart_data(self):
        CartItem.objects.create(
            cart=self.cart, product=self.product_b, quantity=1
        )
        self.product.status = "inactive"
        self.product.save()

        self.client.force_authenticate(self.user)
        response = self.client.get(reverse("cart"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["item_count"], 2)


# ---------------------------------------------------------------------------
# 9. DATABASE / MODEL BEHAVIOR (tests 50-51)
# ---------------------------------------------------------------------------

class CartModelTests(CartApiTestBase):

    def test_cart_is_one_to_one_with_user(self):
        Cart.objects.create(user=self.user)
        with self.assertRaises(IntegrityError):
            Cart.objects.create(user=self.user)

    def test_duplicate_cartitem_prevented_by_constraint(self):
        cart = Cart.objects.create(user=self.user)
        CartItem.objects.create(cart=cart, product=self.product, quantity=1)
        with self.assertRaises(IntegrityError):
            CartItem.objects.create(cart=cart, product=self.product, quantity=2)


# ---------------------------------------------------------------------------
# 10. URL / METHOD BEHAVIOR (tests 52-54)
# ---------------------------------------------------------------------------

class CartUrlMethodTests(CartApiTestBase):

    def setUp(self):
        super().setUp()
        self.cart = Cart.objects.create(user=self.user)
        CartItem.objects.create(
            cart=self.cart, product=self.product, quantity=1
        )
        self.client.force_authenticate(self.user)

    def test_patch_reaches_update_handler(self):
        response = self.client.patch(
            reverse("cart-item-detail", kwargs={"product_id": self.product.id}),
            {"quantity": 5},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.cart_item = CartItem.objects.get(
            cart=self.cart, product=self.product
        )
        self.assertEqual(self.cart_item.quantity, 5)

    def test_delete_reaches_remove_handler(self):
        response = self.client.delete(
            reverse("cart-item-detail", kwargs={"product_id": self.product.id})
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(
            CartItem.objects.filter(cart=self.cart, product=self.product).exists()
        )

    def test_put_on_cart_item_returns_405(self):
        response = self.client.put(
            reverse("cart-item-detail", kwargs={"product_id": self.product.id}),
            {"quantity": 1},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_get_on_cart_item_returns_405(self):
        response = self.client.get(
            reverse("cart-item-detail", kwargs={"product_id": self.product.id})
        )
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_post_on_cart_item_returns_405(self):
        response = self.client.post(
            reverse("cart-item-detail", kwargs={"product_id": self.product.id}),
            {"quantity": 1},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)


# ---------------------------------------------------------------------------
# 11. SECURITY / TRUST BOUNDARIES (tests 55-57)
# ---------------------------------------------------------------------------

class CartSecurityTests(CartApiTestBase):

    def test_no_endpoint_accepts_client_cart_owner(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(
            reverse("cart-add"),
            {"product_id": self.product.id, "user": self.other_user.id},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        cart = Cart.objects.get(user=self.user)
        self.assertFalse(Cart.objects.filter(user=self.other_user).exists())

    def test_no_endpoint_accepts_client_supplied_price(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(
            reverse("cart-add"),
            {"product_id": self.product.id, "price": "0.01"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        item = CartItem.objects.get(cart__user=self.user, product=self.product)
        self.assertEqual(item.product.price, Decimal("99.99"))

    def test_cannot_retrieve_other_user_cart_by_id(self):
        other_cart = Cart.objects.create(user=self.other_user)
        CartItem.objects.create(cart=other_cart, product=self.product, quantity=5)

        self.client.force_authenticate(self.user)
        response = self.client.get(reverse("cart"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["item_count"], 0)
        data = response.json()
        self.assertNotEqual(data.get("id"), other_cart.id)
