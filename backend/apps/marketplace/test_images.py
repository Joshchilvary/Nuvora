"""
Tests for Cloudinary configuration and product image handling.

These tests focus on the local-side configuration and image validation.
Real Cloudinary uploads are not exercised because credentials are not
guaranteed in the test environment, but the configuration code is
covered so that enabling Cloudinary via environment variables is safe
and does not break the test suite.
"""

import io
import os
from decimal import Decimal
from unittest import mock

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from django.urls import reverse
from PIL import Image
from rest_framework.test import APIClient

from apps.users.models import SellerProfile
from config import cloudinary
from .models import Category, Product, ProductImage, validate_product_image


User = get_user_model()


def _make_image_bytes(format="PNG", size=(10, 10), color=(255, 0, 0)):
    """Return bytes for a tiny valid image."""
    buffer = io.BytesIO()
    image = Image.new("RGB", size, color)
    image.save(buffer, format=format)
    return buffer.getvalue()


def _make_uploaded_file(name="test.png", format="PNG", size=(10, 10)):
    content = _make_image_bytes(format=format, size=size)
    return SimpleUploadedFile(name, content, content_type=f"image/{format.lower()}")


def _make_text_uploaded_file(name="evil.txt"):
    return SimpleUploadedFile(name, b"not an image at all", content_type="text/plain")


class CloudinaryConfigurationTests(TestCase):
    def test_is_disabled_without_credentials(self):
        with mock.patch.dict(os.environ, {}, clear=True):
            os.environ.pop("CLOUDINARY_CLOUD_NAME", None)
            os.environ.pop("CLOUDINARY_API_KEY", None)
            os.environ.pop("CLOUDINARY_API_SECRET", None)
            self.assertFalse(cloudinary.is_cloudinary_enabled())
            self.assertEqual(
                cloudinary.get_storage_backend(),
                "django.core.files.storage.FileSystemStorage",
            )

    def test_configure_is_noop_without_credentials(self):
        with mock.patch.dict(os.environ, {}, clear=True):
            os.environ.pop("CLOUDINARY_CLOUD_NAME", None)
            os.environ.pop("CLOUDINARY_API_KEY", None)
            os.environ.pop("CLOUDINARY_API_SECRET", None)
            result = cloudinary.configure_cloudinary()
            self.assertFalse(result)

    @override_settings(
        CLOUDINARY_STORAGE={},
        DEFAULT_FILE_STORAGE="django.core.files.storage.FileSystemStorage",
    )
    def test_configure_enables_cloudinary_storage_when_creds_present(self):
        env = {
            "CLOUDINARY_CLOUD_NAME": "test-cloud",
            "CLOUDINARY_API_KEY": "test-key",
            "CLOUDINARY_API_SECRET": "test-secret",
        }
        with mock.patch.dict(os.environ, env, clear=True):
            with self.settings():
                result = cloudinary.configure_cloudinary()
                self.assertTrue(result)
                from django.conf import settings as dj_settings

                self.assertEqual(
                    dj_settings.DEFAULT_FILE_STORAGE,
                    "cloudinary_storage.storage.MediaCloudinaryStorage",
                )
                self.assertEqual(dj_settings.CLOUDINARY_STORAGE["CLOUD_NAME"], "test-cloud")
                self.assertEqual(dj_settings.CLOUDINARY_STORAGE["API_KEY"], "test-key")
                self.assertEqual(dj_settings.CLOUDINARY_STORAGE["API_SECRET"], "test-secret")
                self.assertEqual(
                    dj_settings.CLOUDINARY_STORAGE["CLOUDINARY_FOLDER"],
                    "nuvora/products",
                )


class ProductImageValidationTests(TestCase):
    def setUp(self):
        self.seller_user = User.objects.create_user(
            email="seller@example.com",
            password="sellerpass123",
        )
        self.seller = SellerProfile.objects.create(
            user=self.seller_user,
            store_name="Test Store",
            store_slug="test-store",
            status="active",
        )
        self.category = Category.objects.create(name="Electronics", slug="electronics", is_active=True)
        self.product = Product.objects.create(
            seller=self.seller,
            category=self.category,
            name="Test Product",
            slug="test-product",
            sku="SKU-IMG-1",
            price=Decimal("99.99"),
            status="active",
            approval_status="approved",
            is_visible=True,
        )

    def test_valid_png_upload_accepted(self):
        product_image = ProductImage(
            product=self.product,
            image=_make_uploaded_file("ok.png", "PNG"),
            display_order=0,
            is_primary=True,
        )
        product_image.full_clean()

    def test_valid_jpeg_upload_accepted(self):
        product_image = ProductImage(
            product=self.product,
            image=_make_uploaded_file("ok.jpg", "JPEG"),
            display_order=0,
        )
        product_image.full_clean()

    def test_valid_webp_upload_accepted(self):
        product_image = ProductImage(
            product=self.product,
            image=_make_uploaded_file("ok.webp", "WEBP"),
            display_order=0,
        )
        product_image.full_clean()

    def test_text_file_rejected(self):
        product_image = ProductImage(
            product=self.product,
            image=_make_text_uploaded_file("evil.txt"),
        )
        with self.assertRaises(ValidationError):
            product_image.full_clean()

    def test_oversized_file_rejected(self):
        big_content = _make_image_bytes("PNG", size=(2000, 2000)) + (b"\x00" * (9 * 1024 * 1024))
        big_file = SimpleUploadedFile("big.png", big_content, content_type="image/png")
        with self.assertRaises(ValidationError):
            validate_product_image(big_file)

    def test_validate_product_image_accepts_valid_bytes(self):
        f = _make_uploaded_file("ok.png", "PNG")
        validate_product_image(f)

    def test_validate_product_image_rejects_text(self):
        f = _make_text_uploaded_file("evil.txt")
        with self.assertRaises(ValidationError):
            validate_product_image(f)

    def test_product_image_associated_with_correct_product(self):
        product_image = ProductImage.objects.create(
            product=self.product,
            image=_make_uploaded_file("ok.png", "PNG"),
            display_order=0,
            is_primary=True,
        )
        self.assertEqual(product_image.product_id, self.product.id)
        self.assertIn(product_image, self.product.images.all())


class ProductImageApiResponseTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.seller_user = User.objects.create_user(
            email="seller@example.com",
            password="sellerpass123",
        )
        self.seller = SellerProfile.objects.create(
            user=self.seller_user,
            store_name="Store",
            store_slug="store",
            status="active",
        )
        self.category = Category.objects.create(name="Electronics", slug="electronics", is_active=True)
        self.product = Product.objects.create(
            seller=self.seller,
            category=self.category,
            name="Image Product",
            slug="image-product",
            sku="SKU-IMG-API-1",
            price=Decimal("50.00"),
            status="active",
            approval_status="approved",
            is_visible=True,
        )
        ProductImage.objects.create(
            product=self.product,
            image=_make_uploaded_file("primary.png", "PNG"),
            display_order=0,
            is_primary=True,
        )
        ProductImage.objects.create(
            product=self.product,
            image=_make_uploaded_file("secondary.png", "PNG"),
            display_order=1,
            is_primary=False,
        )

    def test_product_list_returns_image_url(self):
        response = self.client.get(reverse("product-list"))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        product = data["results"][0]
        self.assertIsNotNone(product["primary_image"])
        self.assertIn("id", product["primary_image"])
        self.assertIn("is_primary", product["primary_image"])

    def test_product_detail_returns_multiple_images(self):
        response = self.client.get(reverse("product-detail", kwargs={"id": self.product.id}))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data["images"]), 2)
        self.assertTrue(any(img["is_primary"] for img in data["images"]))


class ProductImageSecurityTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.seller_user = User.objects.create_user(
            email="seller@example.com",
            password="sellerpass123",
        )
        self.seller = SellerProfile.objects.create(
            user=self.seller_user,
            store_name="Store",
            store_slug="store",
            status="active",
        )
        self.category = Category.objects.create(name="Electronics", slug="electronics", is_active=True)
        self.product = Product.objects.create(
            seller=self.seller,
            category=self.category,
            name="Image Product",
            slug="image-product",
            sku="SKU-IMG-SEC-1",
            price=Decimal("50.00"),
            status="active",
            approval_status="approved",
            is_visible=True,
        )
        ProductImage.objects.create(
            product=self.product,
            image=_make_uploaded_file("primary.png", "PNG"),
            display_order=0,
            is_primary=True,
        )

    def test_public_api_remains_read_only(self):
        response = self.client.post(
            reverse("product-list"),
            data={"name": "X", "slug": "x", "sku": "x", "price": "1.00"},
            format="json",
        )
        self.assertIn(response.status_code, (401, 403, 405))

    def test_unauthenticated_user_cannot_upload_image(self):
        upload_file = _make_uploaded_file("evil.png", "PNG")
        response = self.client.post(
            "/api/products/",
            data={"product": self.product.id, "image": upload_file},
            format="multipart",
        )
        self.assertIn(response.status_code, (401, 403, 405))

    def test_cloudinary_credentials_not_in_product_response(self):
        response = self.client.get(reverse("product-detail", kwargs={"id": self.product.id}))
        self.assertEqual(response.status_code, 200)
        body = response.content.decode("utf-8")
        for needle in (
            "CLOUDINARY_API_SECRET",
            "CLOUDINARY_API_KEY",
            "API_SECRET",
        ):
            self.assertNotIn(needle, body)

    def test_cloudinary_credentials_not_in_list_response(self):
        response = self.client.get(reverse("product-list"))
        self.assertEqual(response.status_code, 200)
        body = response.content.decode("utf-8")
        for needle in ("CLOUDINARY_API_SECRET", "CLOUDINARY_API_KEY"):
            self.assertNotIn(needle, body)
