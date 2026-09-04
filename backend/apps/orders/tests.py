from django.test import TestCase


class OrdersAppTests(TestCase):
    def test_app_imports(self):
        import apps.orders

        self.assertTrue(True)
