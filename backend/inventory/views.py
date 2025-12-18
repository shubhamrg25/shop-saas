from decimal import Decimal
from django.db import transaction
from django.db.models import Sum, Q
from django.utils.timezone import now
from django.core.paginator import Paginator

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Product, Customer, Bill, BillItem


# =================================================
# PRODUCTS LIST
# =================================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def product_list(request):
    shop = request.user.shop
    products = Product.objects.filter(shop=shop)

    return Response([
        {
            "id": p.id,
            "name": p.name,
            "unit": p.unit,
            "selling_price": str(p.selling_price),
            "stock": str(p.stock),
        }
        for p in products
    ])


# =================================================
# CREATE BILL
# =================================================
@api_view(["POST"])
@permission_classes([IsAuthenticated])
@transaction.atomic
def create_bill(request):
    shop = request.user.shop
    data = request.data

    customer_name = (data.get("customer_name") or "").strip()
    customer_mobile = (data.get("customer_mobile") or "").strip()
    items = data.get("items", [])
    paid_amount = Decimal(str(data.get("paid_amount", "0")))

    if not items or not isinstance(items, list):
        return Response({"error": "Items required"}, status=400)

    # CUSTOMER
    customer = None
    if customer_name or customer_mobile:
        customer, _ = Customer.objects.get_or_create(
            shop=shop,
            mobile=customer_mobile,
            defaults={"name": customer_name or "Customer"}
        )

    # BILL HEADER
    bill = Bill.objects.create(
        shop=shop,
        customer=customer,
        total_amount=Decimal("0"),
        paid_amount=paid_amount,
        due_amount=Decimal("0"),
    )

    total = Decimal("0")

    # ITEMS
    for item in items:
        try:
            product = Product.objects.select_for_update().get(
                id=item["product_id"], shop=shop
            )
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=404)

        qty = Decimal(str(item["quantity"]))
        if qty <= 0:
            return Response({"error": "Invalid quantity"}, status=400)

        if product.stock < qty:
            return Response(
                {"error": f"Insufficient stock for {product.name}"},
                status=400
            )

        rate = product.selling_price
        line_total = qty * rate

        BillItem.objects.create(
            bill=bill,
            product=product,
            quantity=qty,
            unit=product.unit,
            rate=rate,
            line_total=line_total,
        )

        product.stock -= qty
        product.save()

        total += line_total

    bill.total_amount = total
    bill.due_amount = total - paid_amount
    bill.save()

    return Response({
        "bill_id": bill.id,
        "total": str(bill.total_amount),
        "paid": str(bill.paid_amount),
        "due": str(bill.due_amount),
    }, status=201)


# =================================================
# PAY BILL DUE (INDIVIDUAL BILL)
# =================================================
@api_view(["POST"])
@permission_classes([IsAuthenticated])
@transaction.atomic
def pay_bill_due(request, bill_id):
    shop = request.user.shop
    amount = Decimal(str(request.data.get("amount", "0")))

    if amount <= 0:
        return Response({"error": "Invalid amount"}, status=400)

    try:
        bill = Bill.objects.select_for_update().get(
            id=bill_id, shop=shop
        )
    except Bill.DoesNotExist:
        return Response({"error": "Bill not found"}, status=404)

    if bill.due_amount <= 0:
        return Response({"error": "Bill already cleared"}, status=400)

    if amount > bill.due_amount:
        amount = bill.due_amount

    bill.paid_amount += amount
    bill.due_amount -= amount
    bill.save()

    return Response({
        "message": "Payment successful",
        "paid": str(bill.paid_amount),
        "due": str(bill.due_amount),
    })


# =================================================
# DASHBOARD STATS
# =================================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    shop = request.user.shop
    today = now().date()

    total_sales = Bill.objects.filter(
        shop=shop,
        created_at__date=today
    ).aggregate(Sum("total_amount"))["total_amount__sum"] or Decimal("0")

    total_due = Bill.objects.filter(
        shop=shop,
        due_amount__gt=0
    ).aggregate(Sum("due_amount"))["due_amount__sum"] or Decimal("0")

    return Response({
        "total_sales": str(total_sales),
        "total_due": str(total_due),
    })


# =================================================
# BILL HISTORY (SEARCH)
# =================================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def bill_history(request):
    shop = request.user.shop
    search = request.GET.get("search", "").strip()
    page_no = request.GET.get("page", 1)

    bills = Bill.objects.filter(shop=shop).select_related("customer")

    if search:
        bills = bills.filter(
            Q(id__icontains=search) |
            Q(customer__name__icontains=search) |
            Q(customer__mobile__icontains=search)
        )

    bills = bills.order_by("-created_at")
    paginator = Paginator(bills, 10)
    page = paginator.get_page(page_no)

    return Response({
        "results": [
            {
                "id": b.id,
                "customer": b.customer.name if b.customer else "Walk-in",
                "mobile": b.customer.mobile if b.customer else "",
                "total": str(b.total_amount),
                "paid": str(b.paid_amount),
                "due": str(b.due_amount),
                "date": b.created_at.strftime("%d-%m-%Y"),
            }
            for b in page
        ],
        "total_pages": paginator.num_pages,
        "current_page": page.number,
    })


# =================================================
# CUSTOMER LEDGER (ALL BILLS)
# =================================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def customer_ledger(request):
    shop = request.user.shop
    search = request.GET.get("search", "").strip()

    customers = Customer.objects.filter(shop=shop)
    if search:
        customers = customers.filter(
            Q(name__icontains=search) |
            Q(mobile__icontains=search)
        )

    result = []
    for c in customers:
        bills = Bill.objects.filter(
            shop=shop,
            customer=c
        ).order_by("-created_at")

        total_due = bills.aggregate(
            Sum("due_amount")
        )["due_amount__sum"] or Decimal("0")

        result.append({
            "customer_id": c.id,
            "customer_name": c.name,
            "mobile": c.mobile,
            "total_due": str(total_due),
            "bills": [
                {
                    "bill_id": b.id,
                    "date": b.created_at.strftime("%d-%m-%Y"),
                    "total": str(b.total_amount),
                    "paid": str(b.paid_amount),
                    "due": str(b.due_amount),
                }
                for b in bills
            ],
        })

    return Response(result)


# =================================================
# CUSTOMER STATEMENT (PRINT)
# =================================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def customer_statement(request, customer_id):
    shop = request.user.shop

    try:
        customer = Customer.objects.get(id=customer_id, shop=shop)
    except Customer.DoesNotExist:
        return Response({"error": "Customer not found"}, status=404)

    bills = Bill.objects.filter(
        customer=customer,
        shop=shop
    ).order_by("created_at")

    total_due = bills.aggregate(
        Sum("due_amount")
    )["due_amount__sum"] or Decimal("0")

    return Response({
        "customer_id": customer.id,
        "customer_name": customer.name,
        "mobile": customer.mobile,
        "total_due": str(total_due),
        "bills": [
            {
                "bill_id": b.id,
                "date": b.created_at.strftime("%d-%m-%Y"),
                "total": str(b.total_amount),
                "paid": str(b.paid_amount),
                "due": str(b.due_amount),
            }
            for b in bills
        ],
    })


# =================================================
# SINGLE BILL (PRINT)
# =================================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_bill(request, bill_id):
    shop = request.user.shop

    try:
        bill = Bill.objects.select_related(
            "customer", "shop"
        ).prefetch_related("items__product").get(
            id=bill_id, shop=shop
        )
    except Bill.DoesNotExist:
        return Response({"error": "Bill not found"}, status=404)

    return Response({
        "id": bill.id,
        "date": bill.created_at.strftime("%d-%m-%Y %H:%M"),
        "shop": bill.shop.name,
        "customer_name": bill.customer.name if bill.customer else "Walk-in",
        "customer_mobile": bill.customer.mobile if bill.customer else "",
        "items": [
            {
                "name": i.product.name,
                "qty": float(i.quantity),
                "unit": i.unit,
                "rate": float(i.rate),
                "line_total": float(i.line_total),
            }
            for i in bill.items.all()
        ],
        "total": float(bill.total_amount),
        "paid": float(bill.paid_amount),
        "due": float(bill.due_amount),
    })
