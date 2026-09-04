from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from django.core import mail
from django.urls import reverse
from django.utils import timezone
from datetime import timedelta
from io import StringIO
from contextlib import redirect_stdout
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.authentication.models import EmailVerificationToken, PasswordResetToken
from apps.authentication.emails import send_verification_email

User = get_user_model()


class RegistrationTests(TestCase):
    def test_successful_registration(self):
        payload = {
            "first_name": "Test",
            "last_name": "User",
            "email": "test@example.com",
            "phone_number": "+1234567890",
            "password": "TestPass123!",
            "password_confirm": "TestPass123!",
        }
        response = self.client.post(reverse("auth-register"), payload)
        self.assertEqual(response.status_code, 201)
        self.assertTrue(User.objects.filter(email="test@example.com").exists())
        self.assertNotIn("password", response.data)

    def test_email_normalization(self):
        payload = {
            "first_name": "Test",
            "last_name": "User",
            "email": "Test@Example.COM",
            "phone_number": "",
            "password": "TestPass123!",
            "password_confirm": "TestPass123!",
        }
        response = self.client.post(reverse("auth-register"), payload)
        self.assertEqual(response.status_code, 201)
        user = User.objects.get(email__iexact="test@example.com")
        self.assertEqual(user.email, "test@example.com")

    def test_duplicate_email(self):
        User.objects.create_user(email="test@example.com", password="TestPass123!")
        payload = {
            "first_name": "Test",
            "last_name": "User",
            "email": "test@example.com",
            "phone_number": "",
            "password": "TestPass123!",
            "password_confirm": "TestPass123!",
        }
        response = self.client.post(reverse("auth-register"), payload)
        self.assertEqual(response.status_code, 400)

    def test_mismatched_passwords(self):
        payload = {
            "first_name": "Test",
            "last_name": "User",
            "email": "test@example.com",
            "phone_number": "",
            "password": "TestPass123!",
            "password_confirm": "DifferentPass123!",
        }
        response = self.client.post(reverse("auth-register"), payload)
        self.assertEqual(response.status_code, 400)

    def test_weak_password(self):
        payload = {
            "first_name": "Test",
            "last_name": "User",
            "email": "test@example.com",
            "phone_number": "",
            "password": "weak",
            "password_confirm": "weak",
        }
        response = self.client.post(reverse("auth-register"), payload)
        self.assertEqual(response.status_code, 400)

    def test_required_fields(self):
        response = self.client.post(reverse("auth-register"), {})
        self.assertEqual(response.status_code, 400)

    def test_password_not_returned(self):
        payload = {
            "first_name": "Test",
            "last_name": "User",
            "email": "test@example.com",
            "phone_number": "",
            "password": "TestPass123!",
            "password_confirm": "TestPass123!",
        }
        response = self.client.post(reverse("auth-register"), payload)
        self.assertEqual(response.status_code, 201)
        response_str = str(response.data)
        self.assertNotIn("TestPass123!", response_str)

    def _register_payload(self, email="newuser@example.com"):
        return {
            "first_name": "New",
            "last_name": "User",
            "email": email,
            "phone_number": "+1234567890",
            "password": "TestPass123!",
            "password_confirm": "TestPass123!",
        }

    def test_registration_creates_verification_token(self):
        response = self.client.post(reverse("auth-register"), self._register_payload())
        self.assertEqual(response.status_code, 201)
        user = User.objects.get(email="newuser@example.com")
        self.assertTrue(
            EmailVerificationToken.objects.filter(user=user).exists(),
            "Registration must create an EmailVerificationToken.",
        )

    def test_registration_sends_verification_email(self):
        response = self.client.post(reverse("auth-register"), self._register_payload())
        self.assertEqual(response.status_code, 201)
        user = User.objects.get(email="newuser@example.com")
        token = EmailVerificationToken.objects.get(user=user)

        self.assertEqual(len(mail.outbox), 1)
        email = mail.outbox[0]
        self.assertEqual(email.to, [user.email])
        self.assertIn("Verify your email", email.subject)
        # The token surfaced to the user must be the verification code emailed.
        self.assertIn(token.token, email.body)

    @override_settings(EMAIL_BACKEND="django.core.mail.backends.console.EmailBackend")
    def test_registration_email_is_output_by_console_backend(self):
        user = User.objects.create_user(
            email="console@example.com", password="TestPass123!"
        )
        token, _ = EmailVerificationToken.objects.get_or_create(
            user=user,
            defaults={
                "token": EmailVerificationToken.generate_token(),
                "expires_at": timezone.now() + timedelta(hours=24),
            },
        )
        buf = StringIO()
        with redirect_stdout(buf):
            send_verification_email(user, token.token)
        output = buf.getvalue()
        self.assertIn(token.token, output)
        self.assertIn(user.email, output)


class LoginTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="login@example.com", password="TestPass123!")

    def test_successful_login(self):
        payload = {"email": "login@example.com", "password": "TestPass123!"}
        response = self.client.post(reverse("auth-login"), payload)
        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertIn("user", response.data)

    def test_incorrect_password(self):
        payload = {"email": "login@example.com", "password": "WrongPass123!"}
        response = self.client.post(reverse("auth-login"), payload)
        self.assertEqual(response.status_code, 401)

    def test_nonexistent_account(self):
        payload = {"email": "nonexistent@example.com", "password": "TestPass123!"}
        response = self.client.post(reverse("auth-login"), payload)
        self.assertEqual(response.status_code, 401)

    def test_inactive_account(self):
        self.user.is_active = False
        self.user.save()
        payload = {"email": "login@example.com", "password": "TestPass123!"}
        response = self.client.post(reverse("auth-login"), payload)
        self.assertEqual(response.status_code, 403)


class CurrentUserTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="me@example.com", password="TestPass123!")
        self.client = APIClient()

    def test_authenticated_request_succeeds(self):
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
        response = self.client.get(reverse("auth-me"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["email"], "me@example.com")

    def test_unauthenticated_request_fails(self):
        response = self.client.get(reverse("auth-me"))
        self.assertEqual(response.status_code, 401)

    def test_sensitive_fields_not_exposed(self):
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
        response = self.client.get(reverse("auth-me"))
        self.assertNotIn("password", response.data)


class LogoutTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="logout@example.com", password="TestPass123!")
        self.client = APIClient()

    def test_valid_refresh_token(self):
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
        response = self.client.post(reverse("auth-logout"), {"refresh": str(refresh)})
        self.assertEqual(response.status_code, 200)

    def test_invalid_refresh_token(self):
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
        response = self.client.post(reverse("auth-logout"), {"refresh": "invalid-token"})
        self.assertEqual(response.status_code, 400)

    def test_token_invalidated(self):
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
        self.client.post(reverse("auth-logout"), {"refresh": str(refresh)})
        from rest_framework_simplejwt.exceptions import TokenError
        with self.assertRaises(TokenError):
            RefreshToken(refresh)


class EmailVerificationTests(TestCase):
    def test_valid_token(self):
        user = User.objects.create_user(email="verify@example.com", password="TestPass123!")
        token = EmailVerificationToken.objects.create(
            user=user,
            token=EmailVerificationToken.generate_token(),
            expires_at=timezone.now() + timedelta(hours=24),
        )
        response = self.client.post(reverse("auth-verify-email"), {"token": token.token})
        self.assertEqual(response.status_code, 200)
        user.refresh_from_db()
        self.assertTrue(user.is_verified)

    def test_token_is_single_use(self):
        user = User.objects.create_user(email="verify@example.com", password="TestPass123!")
        token = EmailVerificationToken.objects.create(
            user=user,
            token=EmailVerificationToken.generate_token(),
            expires_at=timezone.now() + timedelta(hours=24),
        )
        response1 = self.client.post(reverse("auth-verify-email"), {"token": token.token})
        self.assertEqual(response1.status_code, 200)
        response2 = self.client.post(reverse("auth-verify-email"), {"token": token.token})
        self.assertEqual(response2.status_code, 400)
        token.refresh_from_db()
        self.assertTrue(token.is_used)

    def test_invalid_token(self):
        response = self.client.post(reverse("auth-verify-email"), {"token": "invalid-token"})
        self.assertEqual(response.status_code, 400)

    def test_expired_token(self):
        user = User.objects.create_user(email="verify@example.com", password="TestPass123!")
        token = EmailVerificationToken.objects.create(
            user=user,
            token=EmailVerificationToken.generate_token(),
            expires_at=timezone.now() - timedelta(hours=1),
        )
        response = self.client.post(reverse("auth-verify-email"), {"token": token.token})
        self.assertEqual(response.status_code, 400)

    def test_already_verified_user(self):
        user = User.objects.create_user(email="verify@example.com", password="TestPass123!")
        user.is_verified = True
        user.save()
        token = EmailVerificationToken.objects.create(
            user=user,
            token=EmailVerificationToken.generate_token(),
            expires_at=timezone.now() + timedelta(hours=24),
        )
        response = self.client.post(reverse("auth-verify-email"), {"token": token.token})
        self.assertEqual(response.status_code, 400)


class ResendVerificationTests(TestCase):
    def test_resend_for_unverified_user(self):
        user = User.objects.create_user(email="resend@example.com", password="TestPass123!")
        response = self.client.post(reverse("auth-resend-verification"), {"email": "resend@example.com"})
        self.assertEqual(response.status_code, 200)

    def test_resend_for_nonexistent_email(self):
        response = self.client.post(reverse("auth-resend-verification"), {"email": "nonexistent@example.com"})
        self.assertEqual(response.status_code, 200)

    def test_resend_sends_new_verification_email(self):
        user = User.objects.create_user(email="resend@example.com", password="TestPass123!")
        EmailVerificationToken.objects.create(
            user=user,
            token=EmailVerificationToken.generate_token(),
            expires_at=timezone.now() + timedelta(hours=24),
        )
        response = self.client.post(reverse("auth-resend-verification"), {"email": "resend@example.com"})
        self.assertEqual(response.status_code, 200)

        self.assertEqual(len(mail.outbox), 1)
        email = mail.outbox[0]
        self.assertEqual(email.to, [user.email])
        self.assertIn("Verify your email", email.subject)

        fresh_token = EmailVerificationToken.objects.filter(
            user=user, is_used=False
        ).first()
        self.assertIsNotNone(fresh_token)
        self.assertIn(fresh_token.token, email.body)


class PasswordResetTests(TestCase):
    def test_request_reset(self):
        user = User.objects.create_user(email="reset@example.com", password="TestPass123!")
        response = self.client.post(reverse("auth-password-reset-request"), {"email": "reset@example.com"})
        self.assertEqual(response.status_code, 200)

    def test_request_reset_nonexistent(self):
        response = self.client.post(reverse("auth-password-reset-request"), {"email": "nonexistent@example.com"})
        self.assertEqual(response.status_code, 200)

    def test_successful_reset(self):
        user = User.objects.create_user(email="reset@example.com", password="TestPass123!")
        token = PasswordResetToken.objects.create(
            user=user,
            token=PasswordResetToken.generate_token(),
            expires_at=timezone.now() + timedelta(hours=2),
        )
        payload = {
            "token": token.token,
            "password": "NewPass123!",
            "password_confirm": "NewPass123!",
        }
        response = self.client.post(reverse("auth-password-reset-confirm"), payload)
        self.assertEqual(response.status_code, 200)
        user.refresh_from_db()
        self.assertTrue(user.check_password("NewPass123!"))

    def test_invalid_token(self):
        payload = {
            "token": "invalid-token",
            "password": "NewPass123!",
            "password_confirm": "NewPass123!",
        }
        response = self.client.post(reverse("auth-password-reset-confirm"), payload)
        self.assertEqual(response.status_code, 400)

    def test_expired_token(self):
        user = User.objects.create_user(email="reset@example.com", password="TestPass123!")
        token = PasswordResetToken.objects.create(
            user=user,
            token=PasswordResetToken.generate_token(),
            expires_at=timezone.now() - timedelta(hours=1),
        )
        payload = {
            "token": token.token,
            "password": "NewPass123!",
            "password_confirm": "NewPass123!",
        }
        response = self.client.post(reverse("auth-password-reset-confirm"), payload)
        self.assertEqual(response.status_code, 400)

    def test_weak_password_rejected(self):
        user = User.objects.create_user(email="reset@example.com", password="TestPass123!")
        token = PasswordResetToken.objects.create(
            user=user,
            token=PasswordResetToken.generate_token(),
            expires_at=timezone.now() + timedelta(hours=2),
        )
        payload = {
            "token": token.token,
            "password": "weak",
            "password_confirm": "weak",
        }
        response = self.client.post(reverse("auth-password-reset-confirm"), payload)
        self.assertEqual(response.status_code, 400)

    def test_token_cannot_be_reused(self):
        user = User.objects.create_user(email="reset@example.com", password="TestPass123!")
        token = PasswordResetToken.objects.create(
            user=user,
            token=PasswordResetToken.generate_token(),
            expires_at=timezone.now() + timedelta(hours=2),
        )
        payload = {
            "token": token.token,
            "password": "NewPass123!",
            "password_confirm": "NewPass123!",
        }
        response1 = self.client.post(reverse("auth-password-reset-confirm"), payload)
        self.assertEqual(response1.status_code, 200)
        response2 = self.client.post(reverse("auth-password-reset-confirm"), payload)
        self.assertEqual(response2.status_code, 400)


class ChangePasswordTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="changepass@example.com", password="TestPass123!")
        self.client = APIClient()

    def test_correct_current_password(self):
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
        payload = {
            "current_password": "TestPass123!",
            "new_password": "NewPass123!",
            "new_password_confirm": "NewPass123!",
        }
        response = self.client.post(reverse("auth-change-password"), payload)
        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("NewPass123!"))

    def test_incorrect_current_password(self):
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
        payload = {
            "current_password": "WrongPass123!",
            "new_password": "NewPass123!",
            "new_password_confirm": "NewPass123!",
        }
        response = self.client.post(reverse("auth-change-password"), payload)
        self.assertEqual(response.status_code, 400)

    def test_password_mismatch(self):
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
        payload = {
            "current_password": "TestPass123!",
            "new_password": "NewPass123!",
            "new_password_confirm": "DifferentPass123!",
        }
        response = self.client.post(reverse("auth-change-password"), payload)
        self.assertEqual(response.status_code, 400)

    def test_weak_password_rejected(self):
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
        payload = {
            "current_password": "TestPass123!",
            "new_password": "weak",
            "new_password_confirm": "weak",
        }
        response = self.client.post(reverse("auth-change-password"), payload)
        self.assertEqual(response.status_code, 400)

    def test_unauthenticated_access_denied(self):
        payload = {
            "current_password": "TestPass123!",
            "new_password": "NewPass123!",
            "new_password_confirm": "NewPass123!",
        }
        response = self.client.post(reverse("auth-change-password"), payload)
        self.assertEqual(response.status_code, 401)


class PermissionTests(TestCase):
    def test_authenticated_access(self):
        user = User.objects.create_user(email="perm@example.com", password="TestPass123!")
        client = APIClient()
        refresh = RefreshToken.for_user(user)
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
        response = client.get(reverse("auth-me"))
        self.assertEqual(response.status_code, 200)

    def test_unauthenticated_access_denied(self):
        client = APIClient()
        response = client.get(reverse("auth-me"))
        self.assertEqual(response.status_code, 401)
