REFRESH_TOKEN_COOKIE = {
    "key": "hirehub_refresh",
    "httponly": True,
    "secure": True,
    "samesite": "None",
    "max_age": 60 * 60 * 24 * config("REFRESH_TOKEN_LIFETIME_DAYS", default=7, cast=int),
    "path": "/api/auth/",
}