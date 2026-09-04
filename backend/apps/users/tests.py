from django.test import TestCase
from django.contrib.auth import get_user_model
from apps.marketplace.models import Category, Product, ProductImage, Wishlist, WishlistItem
from apps.orders.models import Cart, CartItem
from apps.reviews.models import Review
from apps.notifications.models import Notification
from apps.security.models import AuditLog, SecurityEvent
from apps.users.models import SellerProfile



User = get_user_model()


class UserModelTests(TestCase):
    def test_create_user_with_email(self):
        user = User.objects.create_user(
            email="test@example.com",
            password="testpass123",
        )
        self.assertEqual(user.email, "test@example.com")
        self.assertTrue(user.check_password("testpass123"))
        self.assertFalse(user.is_verified)
        self.assertTrue(user.is_active)

    def test_email_normalization(self):
        email = "Test@Example.COM"
        user = User.objects.create_user(email=email, password="testpass123")
        self.assertEqual(user.email, "test@example.com")

    def test_user_str(self):
        user = User.objects.create_user(email="str@example.com", password="testpass123")
        self.assertEqual(str(user), "str@example.com")


class SellerProfileTests(TestCase):
    def test_seller_profile_relationship(self):
        user = User.objects.create_user(email="seller@example.com", password="testpass123")
        profile = SellerProfile.objects.create(
            user=user,
            store_name="Test Store",
            store_slug="test-store",
        )
        self.assertEqual(profile.user, user)
        self.assertEqual(str(profile), "Test Store")
        self.assertEqual(user.seller_profile, profile)


class CategoryTests(TestCase):
    def test_create_category(self):
        category = Category.objects.create(
            name="Electronics",
            slug="electronics",
            description="Electronic devices",
        )
        self.assertEqual(str(category), "Electronics")
        self.assertTrue(category.is_active)

    def test_parent_category(self):
        parent = Category.objects.create(name="Electronics", slug="electronics")
        child = Category.objects.create(
            name="Phones",
            slug="phones",
            parent=parent,
        )
        self.assertEqual(child.parent, parent)
        self.assertIn(child, parent.children.all())


class ProductTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="seller@example.com", password="testpass123")
        self.profile = SellerProfile.objects.create(
            user=self.user,
            store_name="Test Store",
            store_slug="test-store",
        )
        self.category = Category.objects.create(name="Electronics", slug="electronics")

    def test_create_product(self):
        product = Product.objects.create(
            seller=self.profile,
            category=self.category,
            name="Test Product",
            slug="test-product",
            price=1000.00,
            stock_quantity=10,
        )
        self.assertEqual(product.seller, self.profile)
        self.assertEqual(product.category, self.category)
        self.assertEqual(str(product), "Test Product")

    def test_product_image_relationship(self):
        product = Product.objects.create(
            seller=self.profile,
            category=self.category,
            name="Test Product",
            slug="test-product",
            price=1000.00,
        )
        image = ProductImage.objects.create(product=product, display_order=1)
        self.assertEqual(image.product, product)
        self.assertIn(image, product.images.all())


class WishlistTests(TestCase):
    def test_wishlist_creation(self):
        user = User.objects.create_user(email="customer@example.com", password="testpass123")
        wishlist, _ = Wishlist.objects.get_or_create(user=user)
        self.assertIsNotNone(wishlist)

    def test_wishlist_item_duplicate_prevention(self):
        user = User.objects.create_user(email="customer2@example.com", password="testpass123")
        profile = SellerProfile.objects.create(
            user=User.objects.create_user(email="seller4@example.com", password="testpass123"),
            store_name="Store",
            store_slug="store",
        )
        category = Category.objects.create(name="Cat", slug="cat")
        product = Product.objects.create(
            seller=profile,
            category=category,
            name="Product",
            slug="product",
            price=500.00,
        )
        wishlist, _ = Wishlist.objects.get_or_create(user=user)
        WishlistItem.objects.create(wishlist=wishlist, product=product)
        with self.assertRaises(Exception):
            WishlistItem.objects.create(wishlist=wishlist, product=product)


class CartTests(TestCase):
    def test_cart_creation(self):
        user = User.objects.create_user(email="cartuser@example.com", password="testpass123")
        cart, _ = Cart.objects.get_or_create(user=user)
        self.assertIsNotNone(cart)

    def test_cart_item_duplicate_prevention(self):
        user = User.objects.create_user(email="cartuser2@example.com", password="testpass123")
        profile = SellerProfile.objects.create(
            user=User.objects.create_user(email="seller5@example.com", password="testpass123"),
            store_name="Store",
            store_slug="store",
        )
        category = Category.objects.create(name="Cat", slug="cat")
        product = Product.objects.create(
            seller=profile,
            category=category,
            name="Product",
            slug="product",
            price=500.00,
        )
        cart, _ = Cart.objects.get_or_create(user=user)
        CartItem.objects.create(cart=cart, product=product, quantity=1)
        with self.assertRaises(Exception):
            CartItem.objects.create(cart=cart, product=product, quantity=2)


class ReviewTests(TestCase):
    def test_review_relationship(self):
        user = User.objects.create_user(email="reviewer@example.com", password="testpass123")
        profile = SellerProfile.objects.create(
            user=User.objects.create_user(email="seller3@example.com", password="testpass123"),
            store_name="Store",
            store_slug="store",
        )
        category = Category.objects.create(name="Cat", slug="cat")
        product = Product.objects.create(
            seller=profile,
            category=category,
            name="Product",
            slug="product",
            price=500.00,
        )
        review = Review.objects.create(customer=user, product=product, rating=5)
        self.assertEqual(review.customer, user)
        self.assertEqual(review.product, product)


class NotificationTests(TestCase):
    def test_notification_creation(self):
        user = User.objects.create_user(email="notif@example.com", password="testpass123")
        notification = Notification.objects.create(
            user=user,
            notification_type="system",
            title="Test",
            message="Test message",
        )
        self.assertEqual(notification.user, user)
        self.assertFalse(notification.is_read)


class SecurityTests(TestCase):
    def test_audit_log_creation(self):
        user = User.objects.create_user(email="audit@example.com", password="testpass123")
        log = AuditLog.objects.create(
            actor=user,
            action="test_action",
            resource_type="user",
            resource_id=str(user.id),
            description="Test audit log",
        )
        self.assertEqual(log.actor, user)
        self.assertEqual(log.result, "success")

    def test_security_event_creation(self):
        user = User.objects.create_user(email="secevent@example.com", password="testpass123")
        event = SecurityEvent.objects.create(
            user=user,
            event_type="failed_login",
            description="Test security event",
        )
        self.assertEqual(event.user, user)
        self.assertEqual(event.event_type, "failed_login")
