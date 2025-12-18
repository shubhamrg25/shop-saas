from django.contrib import admin
from .models import (
    Shop,
    Product,
    Customer,
    Bill,
    BillItem,
)

# ---------------------------------
# SHOP
# ---------------------------------
@admin.register(Shop)
class ShopAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "owner")
    search_fields = ("name", "owner__username")


# ---------------------------------
# PRODUCT
# ---------------------------------
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "unit",
        "selling_price",
        "stock",
    )
    list_filter = ("unit",)
    search_fields = ("name",)


# ---------------------------------
# CUSTOMER
# ---------------------------------
@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "mobile")
    search_fields = ("name", "mobile")


# ---------------------------------
# BILL ITEM (INLINE)
# ---------------------------------
class BillItemInline(admin.TabularInline):
    model = BillItem
    extra = 0


# ---------------------------------
# BILL (INVOICE HEADER)
# ---------------------------------
@admin.register(Bill)
class BillAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "customer",
        "total_amount",
        "paid_amount",
        "due_amount",
        "created_at",
    )
    search_fields = ("customer__name",)
    date_hierarchy = "created_at"
    inlines = [BillItemInline]
