from django.contrib import admin
from django.urls import include, path
from config.views import ApiHealthView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", ApiHealthView.as_view(), name="api-health"),
    path("api/auth/", include("apps.authentication.urls")),
]
