from pathlib import Path
from datetime import timedelta
from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent

# Security ---------------------------------------------------
SECRET_KEY = config('SECRET_KEY')
Debug= config('DEBUG', cast=bool)
ALLOWED_HOSTS = ["localhost", "127.0.0.1"]


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
#     third party
     "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",
    # Local
    "accounts",
    "jobs",
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'hirehub.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                "django.template.context_processors.debug",
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'hirehub.wsgi.application'


# ─── DATABASE ────────────────────────────────────────────────────────────────
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": config("DB_NAME"),
        "USER": config("DB_USER"),
        "PASSWORD": config("DB_PASSWORD"),
        "HOST": config("DB_HOST", default="localhost"),
        "PORT": config("DB_PORT", default="5432"),
    }
}

# ─── CUSTOM USER MODEL ───────────────────────────────────────────────────────
# CRITICAL: Must be set BEFORE running any migrations
AUTH_USER_MODEL = "accounts.User"

# Password validation
# https://docs.djangoproject.com/en/6.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/6.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

# ─── STATIC & MEDIA FILES ────────────────────────────────────────────────────
STATIC_URL = "/static/"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ─── DJANGO REST FRAMEWORK ───────────────────────────────────────────────────
REST_FRAMEWORK = {
    # Use JWT for all endpoints by default
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    # Require login by default — opt-out with AllowAny on public endpoints
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
}

# ─── SIMPLE JWT ──────────────────────────────────────────────────────────────
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(
        minutes=config("ACCESS_TOKEN_LIFETIME_MINUTES", default=60, cast=int)
    ),
    "REFRESH_TOKEN_LIFETIME": timedelta(
        days=config("REFRESH_TOKEN_LIFETIME_DAYS", default=7, cast=int)
    ),
    "ROTATE_REFRESH_TOKENS": True,  # New refresh token on every refresh
    "BLACKLIST_AFTER_ROTATION": True,  # Old refresh token is invalidated
    "UPDATE_LAST_LOGIN": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
}

# ─── CORS ────────────────────────────────────────────────────────────────────
CORS_ALLOWED_ORIGINS = config(
    "CORS_ALLOWED_ORIGINS",
    default="http://localhost:5173"
).split(",")

# Allow cookies to be sent cross-origin (needed for HttpOnly refresh token)
CORS_ALLOW_CREDENTIALS = True


# ─── REFRESH TOKEN COOKIE SETTINGS ──────────────────────────────────────────
# These settings are read by our custom LoginView and TokenRefreshView
# to configure the HttpOnly cookie that carries the refresh token.
#
# HttpOnly=True  → JavaScript cannot read this cookie (blocks XSS token theft)
# Secure=False   → Allow over HTTP in development (set True in production)
# SameSite=Lax   → Cookie sent on same-site requests + top-level navigations
#                  Use "None" in production if frontend/backend on different domains
#                  (requires Secure=True when SameSite=None)
REFRESH_TOKEN_COOKIE = {
    "key": "hirehub_refresh",          # Cookie name visible in browser DevTools
    "httponly": True,                   # ← The critical security flag
    "secure": config("COOKIE_SECURE", default=False, cast=bool),
    "samesite": config("COOKIE_SAMESITE", default="Lax"),
    "max_age": 60 * 60 * 24 * config("REFRESH_TOKEN_LIFETIME_DAYS", default=7, cast=int),
    "path": "/api/auth/",              # Cookie only sent to auth endpoints (least privilege)
}