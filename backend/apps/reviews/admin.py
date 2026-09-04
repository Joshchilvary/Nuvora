from django.contrib import admin
from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("customer", "product", "rating", "status", "created_at")
    search_fields = ("customer__email", "product__name", "title", "body")
    list_filter = ("status", "rating", "created_at")
    readonly_fields = ("created_at", "updated_at")
