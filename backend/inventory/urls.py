from django.urls import path
from .views import product_list, create_sale, dashboard_stats, bill_history

urlpatterns = [
    path('products/', product_list),
    path('sale/', create_sale),
    path('dashboard/', dashboard_stats),
    path('bills/', bill_history),
]
