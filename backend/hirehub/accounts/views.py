"""
accounts/views.py
─────────────────
API endpoints for authentication:

  POST /api/auth/register/        → Create account
  POST /api/auth/login/           → Access token (JSON) + Refresh token (HttpOnly cookie)
  POST /api/auth/token/refresh/   → New access token (reads cookie, returns JSON)
  POST /api/auth/logout/          → Blacklist token + clear cookie
  GET  /api/auth/me/              → Get my profile
  PATCH /api/auth/me/             → Update my profile

HttpOnly Cookie Flow:
  Login  → Django sets Set-Cookie: hirehub_refresh=eyJ...; HttpOnly; Path=/api/auth/
  Refresh → Browser auto-sends cookie → Django reads it → returns new access token
  Logout  → Django blacklists token → clears the cookie
  JS never touches the refresh token at any point.
"""

from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.exceptions import TokenError

from .serializers import (
    RegisterSerializer,
    UserProfileSerializer,
    CustomTokenObtainPairSerializer,
)

User = get_user_model()

# ─── Helper ───────────────────────────────────────────────────────────────────

def _set_refresh_cookie(response, refresh_token: str) -> None:
    """
    Attach the refresh token as an HttpOnly cookie to a response.
    All cookie settings are driven by REFRESH_TOKEN_COOKIE in settings.py
    so behaviour is consistent and easily changed per environment.
    """
    cfg = settings.REFRESH_TOKEN_COOKIE
    response.set_cookie(
        key=cfg["key"],
        value=refresh_token,
        max_age=cfg["max_age"],
        httponly=cfg["httponly"],
        secure=cfg["secure"],
        samesite=cfg["samesite"],
        path=cfg["path"],
    )


def _clear_refresh_cookie(response) -> None:
    """Delete the HttpOnly refresh token cookie."""
    cfg = settings.REFRESH_TOKEN_COOKIE
    response.delete_cookie(
        key=cfg["key"],
        path=cfg["path"],
        samesite=cfg["samesite"],
    )


# ─── Views ───────────────────────────────────────────────────────────────────

class RegisterView(generics.CreateAPIView):
    """
    POST /api/auth/register/

    Public. Creates the user account. Does NOT issue tokens — user must login.
    This keeps the door open for email verification in a future phase.
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        return Response(
            {
                "message": "Account created successfully. Please log in.",
                "user": UserProfileSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(TokenObtainPairView):
    """
    POST /api/auth/login/

    Body:    { email, password }
    Returns: { access, user }  +  Set-Cookie: hirehub_refresh (HttpOnly)

    The refresh token never appears in the JSON body.
    The browser stores it in the cookie jar automatically.
    JavaScript cannot read HttpOnly cookies — this blocks XSS token theft.
    """
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Extract refresh token BEFORE building response
        refresh_token = serializer.validated_data.pop("refresh")

        # Build the JSON response — no refresh token in the body
        response = Response(
            {
                "access": serializer.validated_data["access"],
                "user": serializer.validated_data["user"],
            },
            status=status.HTTP_200_OK,
        )

        # Set refresh token as HttpOnly cookie — JS cannot read this
        _set_refresh_cookie(response, refresh_token)

        return response


class TokenRefreshView(APIView):
    """
    POST /api/auth/token/refresh/

    Body:    {} (empty — refresh token is read from HttpOnly cookie)
    Returns: { access }  +  refreshed Set-Cookie (rotated refresh token)

    We override SimpleJWT's default TokenRefreshView because the default
    expects { refresh } in the request body. Our cookie-based approach
    reads it from request.COOKIES instead.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        cookie_cfg = settings.REFRESH_TOKEN_COOKIE
        refresh_token = request.COOKIES.get(cookie_cfg["key"])

        if not refresh_token:
            return Response(
                {"detail": "Refresh token not found. Please log in again."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            token = RefreshToken(refresh_token)
            new_access = str(token.access_token)

            response = Response(
                {"access": new_access},
                status=status.HTTP_200_OK,
            )

            # ROTATE_REFRESH_TOKENS=True means token.access_token call
            # already rotated the token. Set the new refresh cookie.
            _set_refresh_cookie(response, str(token))

            return response

        except TokenError as e:
            # Refresh token is expired or blacklisted — force re-login
            response = Response(
                {"detail": "Session expired. Please log in again."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
            _clear_refresh_cookie(response)
            return response


class LogoutView(APIView):
    """
    POST /api/auth/logout/

    Body:    {} (empty)
    Returns: { message }  +  clears HttpOnly cookie

    Blacklists the refresh token from the cookie (making it permanently invalid),
    then deletes the cookie. The access token expires naturally after its lifetime.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        cookie_cfg = settings.REFRESH_TOKEN_COOKIE
        refresh_token = request.COOKIES.get(cookie_cfg["key"])

        response = Response(
            {"message": "Successfully logged out."},
            status=status.HTTP_200_OK,
        )

        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except TokenError:
                # Token already expired/blacklisted — still clear the cookie
                pass

        _clear_refresh_cookie(response)
        return response


class MeView(generics.RetrieveUpdateAPIView):
    """
    GET   /api/auth/me/   → Returns the logged-in user's full profile
    PATCH /api/auth/me/   → Partial update (name, avatar)

    The user is derived from the JWT access token in the Authorization header.
    No user_id needed in the URL — you can only ever see/edit your own profile.
    """
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "patch", "head", "options"]  # No PUT

    def get_object(self):
        return self.request.user