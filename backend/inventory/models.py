from django.db import models

class Product(models.Model):
    name = models.CharField(max_length=200)
    purchase_price = models.FloatField()
    selling_price = models.FloatField()
    stock = models.IntegerField(default=0)
    gst_percent = models.FloatField(default=0)

    def __str__(self):
        return self.name

class Sale(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()

    total_amount = models.FloatField()
    paid_amount = models.FloatField()
    due_amount = models.FloatField()

    profit = models.FloatField()
    payment_status = models.CharField(max_length=10)  # PAID / DUE
    due_date = models.DateField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product.name} - {self.payment_status}"
