
import os
import shutil
from django.core.files import File
from django.conf import settings


from rest_framework import serializers
from .models import Product, Category, CategoryGroup, CartItem, Cart,  Notification

# store/serializers.py
import os
import shutil
from django.conf import settings



class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.SerializerMethodField(read_only=True)
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), write_only=True)
    seller_email = serializers.EmailField(source='seller.email', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 'image', 'available',
            'created_at', 'category', 'category_name', 'seller', 'seller_email', 'condition', 'likes_count'
        ]
        read_only_fields = ['id', 'created_at', 'seller', 'seller_email', 'category_name', 'likes_count'] 

    def get_category_name(self, obj):
        return obj.category.name if obj.category else None

    def create(self, validated_data):
        image = validated_data.pop('image', None)
        category_obj = validated_data.pop('category', None) 
        product = Product.objects.create(category=category_obj, **validated_data) 

        if image:
            temp_dir = os.path.join(settings.MEDIA_ROOT, 'products', 'temp')
            os.makedirs(temp_dir, exist_ok=True)
            temp_path = os.path.join(temp_dir, image.name)

            with open(temp_path, 'wb+') as temp_file:
                for chunk in image.chunks():
                    temp_file.write(chunk)
                    
            final_dir = os.path.join(settings.MEDIA_ROOT, 'products', str(product.pk))
            os.makedirs(final_dir, exist_ok=True)
            final_path = os.path.join(final_dir, image.name)

            shutil.move(temp_path, final_path)

            relative_path = os.path.join('products', str(product.pk), image.name)
            product.image.name = relative_path
            product.save()

        return product

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class CategoryGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoryGroup
        fields = '__all__'


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), write_only=True, source='product'
    )

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'quantity', 'get_total_price']


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'created_at']
        read_only_fields = ['user']
        


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'message', 'is_read', 'created_at']
