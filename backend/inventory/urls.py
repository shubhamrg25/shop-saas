from django.urls import path
from .views import product_list, create_sale

urlpatterns = [
    path('products/', product_list),
    path('sale/', create_sale),
]
