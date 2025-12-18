from django.urls import path

from .views import (
    product_list,
    create_bill,
    pay_bill_due,
    dashboard_stats,
    bill_history,
    customer_ledger,
    customer_statement,   # ✅ ADD THIS
    get_bill,
)

urlpatterns = [

    # -------------------------------------------------
    # PRODUCTS
    # -------------------------------------------------
    path("products/", product_list, name="product-list"),

    # -------------------------------------------------
    # BILLING
    # -------------------------------------------------
    path("bill/", create_bill, name="create-bill"),
    path("bill/<int:bill_id>/", get_bill, name="get-bill"),
    path("bill/<int:bill_id>/pay/", pay_bill_due, name="pay-bill-due"),

    # -------------------------------------------------
    # BILL HISTORY
    # -------------------------------------------------
    path("bills/", bill_history, name="bill-history"),

    # -------------------------------------------------
    # CUSTOMERS
    # -------------------------------------------------
    path("customers/", customer_ledger, name="customer-ledger"),

    # 🔥 CUSTOMER STATEMENT (PRINT / VIEW)
    path(
        "customers/<int:customer_id>/statement/",
        customer_statement,
        name="customer-statement"
    ),

    # -------------------------------------------------
    # DASHBOARD
    # -------------------------------------------------
    path("dashboard/", dashboard_stats, name="dashboard-stats"),
]
