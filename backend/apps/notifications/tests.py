from django.test import TestCase


class NotificationsAppTests(TestCase):
    def test_app_imports(self):
        import apps.notifications

        self.assertTrue(True)
