from django.test import TestCase


class SecurityAppTests(TestCase):
    def test_app_imports(self):
        import apps.security

        self.assertTrue(True)
