from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Product, Sale


@api_view(['GET'])
def product_list(request):
    products = Product.objects.all()
    data = []

    for p in products:
        data.append({
            "id": p.id,
            "name": p.name,
            "selling_price": p.selling_price,
            "stock": p.stock,
            "gst_percent": p.gst_percent
        })

    return Response(data)


@api_view(['POST'])
def create_sale(request):
    product_id = request.data.get('product_id')
    quantity = int(request.data.get('quantity'))

    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response({"error": "Product not found"}, status=404)

    if product.stock < quantity:
        return Response({"error": "Insufficient stock"}, status=400)

    total_amount = product.selling_price * quantity
    profit = (product.selling_price - product.purchase_price) * quantity

    product.stock -= quantity
    product.save()

    Sale.objects.create(
        product=product,
        quantity=quantity,
        selling_price=product.selling_price,
        purchase_price=product.purchase_price,
        total_amount=total_amount,
        profit=profit
    )

    return Response(
        {
            "total_amount": total_amount,
            "profit": profit
        },
        status=status.HTTP_201_CREATED
    )
