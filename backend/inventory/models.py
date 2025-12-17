from django.db import models

class Product(models.Model):
    name = models.CharField(max_length=200)
    purchase_price = models.FloatField()
    selling_price = models.FloatField()
    stock = models.IntegerField(default=0)
    gst_percent = models.FloatField(default=0)

    def __str__(self):
        return self.name
