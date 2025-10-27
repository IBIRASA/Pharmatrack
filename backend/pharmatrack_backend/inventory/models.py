from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Pharmacy(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='pharmacy')
    name = models.CharField(max_length=200)
    address = models.TextField()
    phone = models.CharField(max_length=20)
    latitude = models.FloatField(default=0.0)
    longitude = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Pharmacies"

class Medicine(models.Model):
    pharmacy = models.ForeignKey(User, on_delete=models.CASCADE, related_name='medicines')
    name = models.CharField(max_length=200)
    generic_name = models.CharField(max_length=200, blank=True)
    manufacturer = models.CharField(max_length=200)
    category = models.CharField(max_length=100)
    dosage = models.CharField(max_length=100)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    stock_quantity = models.IntegerField()
    minimum_stock = models.IntegerField(default=50)
    expiry_date = models.DateField()
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Medicines'

    def __str__(self):
        return f"{self.name} - {self.dosage}"

    @property
    def is_low_stock(self):
        return self.stock_quantity <= self.minimum_stock

class Sale(models.Model):
    pharmacy = models.ForeignKey(Pharmacy, on_delete=models.CASCADE, related_name='sales')
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    sale_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.medicine.name} - {self.quantity} units"

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    pharmacy = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    customer_name = models.CharField(max_length=200)
    customer_phone = models.CharField(max_length=20, blank=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order {self.id} - {self.customer_name}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.medicine.name} x {self.quantity}"
