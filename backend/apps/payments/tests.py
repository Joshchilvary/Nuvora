from django.test import TestCase


class PaymentsAppTests(TestCase):
    def test_app_imports(self):
        import apps.payments

        self.assertTrue(True)
