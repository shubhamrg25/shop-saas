from django.contrib import admin
from .models import Product, Sale

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "selling_price", "stock", "gst_percent")

@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = (
        "product",
        "quantity",
        "total_amount",
        "paid_amount",
        "due_amount",
        "payment_status",
        "created_at",
    )
