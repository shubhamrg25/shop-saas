from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from django.db.models import Sum, Q
from django.core.paginator import Paginator
from django.utils.timezone import now

from .models import Product, Sale, Customer


# -------------------------------------------------
# PRODUCTS LIST
# -------------------------------------------------
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


# -------------------------------------------------
# CREATE SALE (BILLING)
# -------------------------------------------------
@api_view(['POST'])
def create_sale(request):
    try:
        product_id = int(request.data.get("product_id"))
        quantity = int(request.data.get("quantity"))
        paid_amount = float(request.data.get("paid_amount", 0))

        customer_name = request.data.get("customer_name")
        customer_mobile = request.data.get("customer_mobile")
        due_date = request.data.get("due_date")
    except Exception:
        return Response({"error": "Invalid input"}, status=400)

    # Product
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response({"error": "Product not found"}, status=404)

    if product.stock < quantity:
        return Response({"error": "Insufficient stock"}, status=400)

    # Customer (create or fetch)
    customer = None
    if customer_name:
        customer, _ = Customer.objects.get_or_create(
            name=customer_name.strip(),
            mobile=customer_mobile.strip() if customer_mobile else ""
        )

    # Calculations
    total_amount = product.selling_price * quantity
    profit = (product.selling_price - product.purchase_price) * quantity
    due_amount = total_amount - paid_amount
    payment_status = "PAID" if due_amount <= 0 else "DUE"

    # Update stock
    product.stock -= quantity
    product.save()

    # Create sale
    Sale.objects.create(
        customer=customer,
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
        status=status.HTTP_201_CREATED
    )


# -------------------------------------------------
# DASHBOARD ANALYTICS
# -------------------------------------------------
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


# -------------------------------------------------
# BILL HISTORY + SEARCH + PAGINATION
# -------------------------------------------------
@api_view(['GET'])
def bill_history(request):
    search = request.GET.get("search", "")
    start_date = request.GET.get("start_date")
    end_date = request.GET.get("end_date")
    page_number = request.GET.get("page", 1)

    sales = Sale.objects.select_related(
        "product", "customer"
    ).order_by("-created_at")

    # Search by customer
    if search:
        sales = sales.filter(
            Q(customer__name__icontains=search) |
            Q(customer__mobile__icontains=search)
        )

    # Date filter
    if start_date and end_date:
        sales = sales.filter(created_at__date__range=[start_date, end_date])

    paginator = Paginator(sales, 10)  # 10 bills per page
    page = paginator.get_page(page_number)

    data = []
    for s in page:
        data.append({
            "id": s.id,
            "customer": s.customer.name if s.customer else "Walk-in",
            "mobile": s.customer.mobile if s.customer else "",
            "product": s.product.name,
            "quantity": s.quantity,
            "total_amount": s.total_amount,
            "paid_amount": s.paid_amount,
            "due_amount": s.due_amount,
            "payment_status": s.payment_status,
            "created_at": s.created_at.strftime("%d-%m-%Y %H:%M"),
        })

    return Response({
        "results": data,
        "total_pages": paginator.num_pages,
        "current_page": page.number,
    })
