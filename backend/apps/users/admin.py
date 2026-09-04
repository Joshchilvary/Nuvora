from django.contrib import admin
from .models import User, SellerProfile


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("email", "first_name", "last_name", "is_verified", "is_active", "date_joined")
    search_fields = ("email", "first_name", "last_name", "phone_number")
    list_filter = ("is_verified", "is_active", "is_staff", "date_joined")
    readonly_fields = ("date_joined", "created_at", "updated_at")


@admin.register(SellerProfile)
class SellerProfileAdmin(admin.ModelAdmin):
    list_display = ("store_name", "user", "verification_status", "status", "created_at")
    search_fields = ("store_name", "store_slug", "user__email", "phone")
    list_filter = ("verification_status", "status", "created_at")
    readonly_fields = ("created_at", "updated_at")
