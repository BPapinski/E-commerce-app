from django.db import models
from django.conf import settings
from authuser.models import User


class CategoryGroup(models.Model):
    name = models.CharField(max_length=256)
    def __str__(self):
        return self.name

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    group = models.ForeignKey(CategoryGroup, on_delete=models.CASCADE, null=True, blank=True, default=None)

    def __str__(self):
        return self.name

def product_image_upload_path(instance, filename):
    # Jeśli nie ma ID (np. obiekt jeszcze nie zapisany), wrzuci tymczasowo do "products/temp/"
    return f"products/{instance.pk or 'temp'}/{filename}"

class Product(models.Model):

    CONDITION_CHOICES = [
        ('new', 'New'),
        ('used', 'Used'),
    ]

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to=product_image_upload_path, default="products/default.jpg")
    available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)

    seller = models.ForeignKey(User, on_delete=models.SET_DEFAULT, default=1)
    condition = models.CharField(max_length=10, choices=CONDITION_CHOICES, default='new')
    
    likes_count = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.name

class Cart(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Koszyk {self.user.email}'


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f'{self.quantity}x {self.product.name}'

    def get_total_price(self):
        return self.product.price * self.quantity
    
class Order(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    is_paid = models.BooleanField(default=False)

    def __str__(self):
        return f'Zamówienie {self.id} - {self.user.email}'

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f'{self.quantity}x {self.product.name}'

class FavouriteItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateField(auto_now=True)
    is_active = models.BooleanField()
    
    class Meta:
        unique_together = ('user', 'product') # Zapobiega duplikatom

    def __str__(self):
        return f'Użytkownik {self.user.email} lubi produkt {self.product.name}'
    
class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Powiadomienie dla {self.user.email}: {self.message[:50]}...'
    
    class Meta:
        ordering = ['-created_at']  # Najnowsze powiadomienia na górze