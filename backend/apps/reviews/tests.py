from django.test import TestCase


class ReviewsAppTests(TestCase):
    def test_app_imports(self):
        import apps.reviews

        self.assertTrue(True)
