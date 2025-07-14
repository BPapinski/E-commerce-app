import nested_admin
from django.contrib import admin
from .models import (
    CategoryGroup, Category, Product,
    Cart, CartItem,
    Order, OrderItem, FavouriteItem,Notification
)





# ----------------------
# Category & Products
# ----------------------

@admin.register(CategoryGroup)
class CategoryGroupAdmin(admin.ModelAdmin):
    list_display = ['name']


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'group']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'price', 'available', 'category', 'created_at', 'image_filename', 'seller', 'condition']
    list_filter = ['available', 'category']
    search_fields = ['name', 'description']

    def image_filename(self, obj):
        return obj.image.name.split('/')[-1] if obj.image else 'brak'
    image_filename.short_description = 'Nazwa pliku'


# ----------------------
# Cart & Items
# ----------------------

class CartItemInline(nested_admin.NestedTabularInline):
    model = CartItem
    extra = 1


@admin.register(Cart)
class CartAdmin(nested_admin.NestedModelAdmin):
    inlines = [CartItemInline]
    list_display = ['user', 'created_at']


# ----------------------
# Order & Items
# ----------------------

class OrderItemInline(nested_admin.NestedTabularInline):
    model = OrderItem
    extra = 1


@admin.register(Order)
class OrderAdmin(nested_admin.NestedModelAdmin):
    inlines = [OrderItemInline]
    list_display = ['user', 'created_at', 'is_paid']
    list_filter = ['is_paid', 'created_at']


@admin.register(FavouriteItem)
class FavouriteItemAdmin(admin.ModelAdmin):
    list_display = ['user', 'product', 'is_active', 'created_at', 'updated_at']
    list_filter = ['is_active', 'created_at', 'user', 'product']
    search_fields = ['user__email', 'product__name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'message', 'is_read', 'created_at']
    list_filter = ['is_read', 'created_at', 'user']
    search_fields = ['user__email', 'message']
    readonly_fields = ['created_at']

