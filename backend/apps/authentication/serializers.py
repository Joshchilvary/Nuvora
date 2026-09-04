from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils import timezone
from rest_framework import serializers

from apps.authentication.models import EmailVerificationToken, PasswordResetToken

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={"input_type": "password"})
    password_confirm = serializers.CharField(write_only=True, required=True, style={"input_type": "password"})

    class Meta:
        model = User
        fields = ["first_name", "last_name", "email", "phone_number", "password", "password_confirm"]

    def validate_email(self, value):
        return value.lower().strip()

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        try:
            validate_password(attrs["password"])
        except DjangoValidationError as e:
            raise serializers.ValidationError({"password": list(e.messages)})
        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        password = validated_data.pop("password")
        user = User.objects.create_user(password=password, **validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={"input_type": "password"})


class CurrentUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "profile_picture",
            "bio",
            "is_verified",
            "date_joined",
        ]
        read_only_fields = fields


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()

    def validate_refresh(self, value):
        from rest_framework_simplejwt.tokens import RefreshToken
        try:
            RefreshToken(value)
        except Exception:
            raise serializers.ValidationError("Invalid refresh token.")
        return value


class VerifyEmailSerializer(serializers.Serializer):
    token = serializers.CharField()

    def validate_token(self, value):
        try:
            token_obj = EmailVerificationToken.objects.get(token=value)
        except EmailVerificationToken.DoesNotExist:
            raise serializers.ValidationError("Invalid verification token.")
        if token_obj.is_used:
            raise serializers.ValidationError("This verification token has already been used.")
        if token_obj.is_expired:
            raise serializers.ValidationError("This verification token has expired.")
        if token_obj.user.is_verified:
            raise serializers.ValidationError("This email is already verified.")
        self.token_obj = token_obj
        return value

    def save(self):
        user = self.token_obj.user
        user.is_verified = True
        user.save(update_fields=["is_verified"])
        self.token_obj.is_used = True
        self.token_obj.save(update_fields=["is_used"])


class ResendVerificationSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        return value.lower().strip()


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    password = serializers.CharField(write_only=True, style={"input_type": "password"})
    password_confirm = serializers.CharField(write_only=True, style={"input_type": "password"})

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        try:
            validate_password(attrs["password"])
        except DjangoValidationError as e:
            raise serializers.ValidationError({"password": list(e.messages)})
        try:
            token_obj = PasswordResetToken.objects.get(token=attrs["token"])
        except PasswordResetToken.DoesNotExist:
            raise serializers.ValidationError({"token": "Invalid reset token."})
        if token_obj.is_used:
            raise serializers.ValidationError({"token": "This reset token has already been used."})
        if token_obj.is_expired:
            raise serializers.ValidationError({"token": "This reset token has expired."})
        self.token_obj = token_obj
        return attrs

    def save(self):
        user = self.token_obj.user
        user.set_password(self.validated_data["password"])
        user.save(update_fields=["password"])
        self.token_obj.is_used = True
        self.token_obj.save(update_fields=["is_used"])


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True, style={"input_type": "password"})
    new_password = serializers.CharField(write_only=True, style={"input_type": "password"})
    new_password_confirm = serializers.CharField(write_only=True, style={"input_type": "password"})

    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop("user", None)
        super().__init__(*args, **kwargs)

    def validate_current_password(self, value):
        if not self.user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value

    def validate(self, attrs):
        if attrs["new_password"] != attrs["new_password_confirm"]:
            raise serializers.ValidationError({"new_password_confirm": "Passwords do not match."})
        try:
            validate_password(attrs["new_password"])
        except DjangoValidationError as e:
            raise serializers.ValidationError({"new_password": list(e.messages)})
        return attrs

    def save(self):
        user = self.user
        user.set_password(self.validated_data["new_password"])
        user.save(update_fields=["password"])
