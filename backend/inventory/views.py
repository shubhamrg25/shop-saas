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
    try:
        product_id = int(request.data.get('product_id'))
        quantity = int(request.data.get('quantity'))
        paid_amount = float(request.data.get('paid_amount', 0))
        due_date = request.data.get('due_date')
    except Exception:
        return Response({"error": "Invalid input"}, status=400)

    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response({"error": "Product not found"}, status=404)

    if product.stock < quantity:
        return Response({"error": "Insufficient stock"}, status=400)

    total_amount = product.selling_price * quantity
    profit = (product.selling_price - product.purchase_price) * quantity
    due_amount = total_amount - paid_amount

    payment_status = "PAID" if due_amount <= 0 else "DUE"

    product.stock -= quantity
    product.save()

    Sale.objects.create(
        product=product,
        quantity=quantity,
        total_amount=total_amount,
        paid_amount=paid_amount,
        due_amount=due_amount,
        profit=profit,
        payment_status=payment_status,
        due_date=due_date if payment_status == "DUE" else None,
    )

    return Response(
        {
            "total_amount": total_amount,
            "paid_amount": paid_amount,
            "due_amount": due_amount,
            "status": payment_status,
        },
        status=201,
    )
from django.utils.timezone import now
from django.db.models import Sum

@api_view(['GET'])
def dashboard_stats(request):
    today = now().date()

    sales_today = Sale.objects.filter(created_at__date=today)
    total_sales = sales_today.aggregate(Sum('total_amount'))['total_amount__sum'] or 0
    total_profit = sales_today.aggregate(Sum('profit'))['profit__sum'] or 0
    total_due = Sale.objects.filter(payment_status="DUE").aggregate(
        Sum('due_amount')
    )['due_amount__sum'] or 0

    low_stock = Product.objects.filter(stock__lte=5).values(
        'id', 'name', 'stock'
    )

    return Response({
        "total_sales": total_sales,
        "total_profit": total_profit,
        "total_due": total_due,
        "low_stock": list(low_stock)
    })
