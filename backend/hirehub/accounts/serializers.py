"""
accounts/serializers.py
───────────────────────
Serializers handle the translation between:
  Python objects (Django models) ↔ JSON (HTTP request/response)

They also do VALIDATION — ensuring data is correct before hitting the DB.

Cookie Architecture Note:
  The refresh token is NOT included in any serializer response.
  It is set as an HttpOnly cookie by the view layer (LoginView, TokenRefreshView).
  Serializers only deal with: user data + access token.
"""

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    """
    Handles new user registration.

    Validates:
      - Email is unique
      - Password meets Django's complexity requirements
      - Password confirmation matches
      - Role is a valid choice (SEEKER or EMPLOYER)
    """

    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
    )
    password_confirm = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "role",
            "password",
            "password_confirm",
        ]
        extra_kwargs = {
            "first_name": {"required": False},
            "last_name": {"required": False},
        }

    def validate(self, attrs):
        """Cross-field validation: passwords must match."""
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError(
                {"password_confirm": "Passwords do not match."}
            )
        return attrs

    def validate_role(self, value):
        """Ensure role is one of our valid choices."""
        valid_roles = [choice[0] for choice in User.Role.choices]
        if value not in valid_roles:
            raise serializers.ValidationError(
                f"Role must be one of: {', '.join(valid_roles)}"
            )
        return value

    def create(self, validated_data):
        """
        Use create_user() — NOT User.objects.create()
        create_user() properly hashes the password.
        """
        validated_data.pop("password_confirm")
        password = validated_data.pop("password")

        user = User.objects.create_user(
            password=password,
            **validated_data,
        )
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializes user data for the /me/ endpoint and embedded in login response.
    Read-only for sensitive fields; editable for profile info.
    """

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "role",
            "avatar",
            "date_joined",
            "last_login",
        ]
        read_only_fields = ["id", "email", "role", "date_joined", "last_login"]


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Extends SimpleJWT's default login serializer.

    The default returns: { access, refresh }
    We change this to:   { access, user: { ... } }

    The refresh token is REMOVED from the JSON body entirely.
    The view (LoginView) takes the refresh token from this serializer's
    validated_data and sets it as an HttpOnly cookie on the response.
    JavaScript never sees the refresh token.

    Response body shape:
    {
        "access": "eyJ...",
        "user": {
            "id": 1,
            "email": "alice@example.com",
            "role": "EMPLOYER",
            ...
        }
    }
    """

    def validate(self, attrs):
        # Call parent — this sets self.user and populates data with access + refresh
        data = super().validate(attrs)

        # Attach user profile — frontend needs role to redirect correctly
        data["user"] = UserProfileSerializer(self.user).data

        # We intentionally keep "refresh" in data here so the VIEW can extract
        # it and set the cookie. The view then removes it from the response body.
        return data

    @classmethod
    def get_token(cls, user):
        """
        Embed custom claims into the JWT payload.
        Avoids a DB lookup on every permission check.
        """
        token = super().get_token(user)
        token["role"] = user.role
        token["email"] = user.email
        return token