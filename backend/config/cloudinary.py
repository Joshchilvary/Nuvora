"""
Cloudinary configuration for NUVORA product images.

Cloudinary is used ONLY for user-uploaded media (product images, category
images). Static files continue to be served by Django's standard static
storage backend.

The configuration is loaded from environment variables. When the credentials
are not set, Cloudinary storage is not configured and the project falls back
to the local FileSystem storage backend. This keeps the test suite and
local development usable without requiring real Cloudinary credentials.
"""

import os


def _is_configured():
    """Return True when all required Cloudinary env vars are present."""
    return all(
        os.environ.get(key)
        for key in (
            "CLOUDINARY_CLOUD_NAME",
            "CLOUDINARY_API_KEY",
            "CLOUDINARY_API_SECRET",
        )
    )


def configure_cloudinary():
    """Apply Cloudinary settings to Django when credentials are available.

    This configures `DEFAULT_FILE_STORAGE` for media uploads only. Static
    files are not affected. When credentials are missing, this is a no-op
    and the project continues to use the local file system backend so that
    tests and local development can run without a real Cloudinary account.
    """
    if not _is_configured():
        return False

    from django.conf import settings

    settings.CLOUDINARY_STORAGE = {
        "CLOUD_NAME": os.environ["CLOUDINARY_CLOUD_NAME"],
        "API_KEY": os.environ["CLOUDINARY_API_KEY"],
        "API_SECRET": os.environ["CLOUDINARY_API_SECRET"],
        "CLOUDINARY_FOLDER": os.environ.get("CLOUDINARY_FOLDER", "nuvora/products"),
    }
    settings.DEFAULT_FILE_STORAGE = "cloudinary_storage.storage.MediaCloudinaryStorage"
    return True


def get_storage_backend():
    """Return the storage backend to use for media uploads."""
    if _is_configured():
        return "cloudinary_storage.storage.MediaCloudinaryStorage"
    return "django.core.files.storage.FileSystemStorage"


def is_cloudinary_enabled():
    """Public helper used by tests and the health endpoint."""
    return _is_configured()
