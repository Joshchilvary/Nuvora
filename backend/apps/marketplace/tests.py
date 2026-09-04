from django.test import TestCase


class MarketplaceAppTests(TestCase):
    def test_app_imports(self):
        import apps.marketplace

        self.assertTrue(True)
