"""
accounts/urls.py
────────────────
All auth URL patterns, mounted at /api/auth/ in the root urls.py.

Note: We use our own TokenRefreshView (not SimpleJWT's default) because
the default expects { refresh } in the request body. Ours reads the
refresh token from the HttpOnly cookie instead.
"""

from django.urls import path
from .views import RegisterView, LoginView, TokenRefreshView, LogoutView, MeView

urlpatterns = [
    # Account lifecycle
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("login/", LoginView.as_view(), name="auth-login"),
    path("logout/", LogoutView.as_view(), name="auth-logout"),

    # Token management — cookie-based refresh
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),

    # Profile
    path("me/", MeView.as_view(), name="auth-me"),
]