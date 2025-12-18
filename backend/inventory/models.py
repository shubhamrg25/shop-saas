from django.db import models
from django.contrib.auth.models import User


# -------------------------
# SHOP
# -------------------------
class Shop(models.Model):
    owner = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="shop"
    )
    name = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


# -------------------------
# PRODUCT
# -------------------------
class Product(models.Model):
    shop = models.ForeignKey(
        Shop,
        on_delete=models.CASCADE,
        related_name="products"
    )

    name = models.CharField(max_length=200)

    unit = models.CharField(
        max_length=20,
        choices=[
            ("kg", "Kilogram"),
            ("gm", "Gram"),
            ("pcs", "Pieces"),
            ("ltr", "Litre"),
        ],
        default="pcs"
    )

    purchase_price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )
    selling_price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    stock = models.DecimalField(
        max_digits=10,
        decimal_places=3  # supports 0.5, 0.25 etc
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.unit})"


# -------------------------
# CUSTOMER
# -------------------------
class Customer(models.Model):
    shop = models.ForeignKey(
        Shop,
        on_delete=models.CASCADE,
        related_name="customers"
    )
    name = models.CharField(max_length=200)
    mobile = models.CharField(max_length=15, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.mobile})"


# -------------------------
# BILL (HEADER)
# -------------------------
class Bill(models.Model):
    shop = models.ForeignKey(
        Shop,
        on_delete=models.CASCADE,
        related_name="bills"
    )

    customer = models.ForeignKey(
        Customer,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )
    paid_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )
    due_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Bill #{self.id}"


# -------------------------
# BILL ITEMS (LINE ITEMS)
# -------------------------
class BillItem(models.Model):
    bill = models.ForeignKey(
        Bill,
        related_name="items",
        on_delete=models.CASCADE
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE
    )

    quantity = models.DecimalField(
        max_digits=10,
        decimal_places=3  # 0.5 kg, 1.25 kg etc
    )

    unit = models.CharField(max_length=20)

    rate = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    line_total = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    def __str__(self):
        return f"{self.product.name} - {self.quantity} {self.unit}"
