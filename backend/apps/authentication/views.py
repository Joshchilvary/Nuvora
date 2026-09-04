import logging
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView

from apps.authentication.emails import send_verification_email
from apps.authentication.models import EmailVerificationToken, PasswordResetToken
from apps.authentication.serializers import (
    ChangePasswordSerializer,
    CurrentUserSerializer,
    LoginSerializer,
    LogoutSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    RegisterSerializer,
    ResendVerificationSerializer,
    VerifyEmailSerializer,
)

logger = logging.getLogger(__name__)
User = get_user_model()


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, _ = EmailVerificationToken.objects.get_or_create(
            user=user,
            defaults={
                "token": EmailVerificationToken.generate_token(),
                "expires_at": timezone.now() + timedelta(hours=24),
            },
        )
        send_verification_email(user, token.token)
        return Response(
            {
                "detail": "Registration successful. Please verify your email.",
                "user_id": user.id,
                "email": user.email,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].lower().strip()
        password = serializer.validated_data["password"]

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            user = None

        if user is None or not user.check_password(password):
            return Response(
                {"detail": "Invalid credentials.", "code": "invalid_credentials"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.is_active:
            return Response(
                {"detail": "Account is inactive.", "code": "inactive_account"},
                status=status.HTTP_403_FORBIDDEN,
            )

        refresh = RefreshToken.for_user(user)
        access = refresh.access_token

        return Response(
            {
                "access": str(access),
                "refresh": str(refresh),
                "user": CurrentUserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        refresh_token = serializer.validated_data["refresh"]
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            return Response(
                {"detail": "Invalid refresh token.", "code": "invalid_token"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response({"detail": "Logout successful."}, status=status.HTTP_200_OK)


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = CurrentUserSerializer(request.user)
        return Response(serializer.data)


class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerifyEmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Email verified successfully."}, status=status.HTTP_200_OK)


class ResendVerificationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResendVerificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].lower().strip()
        try:
            user = User.objects.get(email=email)
            if user.is_verified:
                return Response(
                    {"detail": "Email is already verified.", "code": "already_verified"},
                    status=status.HTTP_200_OK,
                )
            EmailVerificationToken.objects.filter(user=user, is_used=False).update(is_used=True)
            token = EmailVerificationToken.objects.create(
                user=user,
                token=EmailVerificationToken.generate_token(),
                expires_at=timezone.now() + timedelta(hours=24),
            )
            try:
                send_verification_email(user, token.token)
            except Exception:
                logger.exception("Failed to send verification email to %s", user.email)
        except User.DoesNotExist:
            pass
        return Response(
            {"detail": "If an account exists, a verification email has been sent."},
            status=status.HTTP_200_OK,
        )


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].lower().strip()
        try:
            user = User.objects.get(email=email)
            PasswordResetToken.objects.filter(user=user, is_used=False).update(is_used=True)
            token = PasswordResetToken.objects.create(
                user=user,
                token=PasswordResetToken.generate_token(),
                expires_at=timezone.now() + timedelta(hours=2),
            )
        except User.DoesNotExist:
            pass
        return Response(
            {"detail": "If an account exists, a password reset email has been sent."},
            status=status.HTTP_200_OK,
        )


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Password reset successful."}, status=status.HTTP_200_OK)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, user=request.user)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Password changed successfully."}, status=status.HTTP_200_OK)
