
import os
import shutil
from django.core.files import File
from django.conf import settings


from rest_framework import serializers
from .models import Product, Category, CategoryGroup

class ProductSerializer(serializers.ModelSerializer):
    category = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'image', 'available', 'created_at', 'category', 'seller', 'condition']

    def get_category(self, obj):
        return obj.category.name if obj.category else None

    def create(self, validated_data):
        image = validated_data.pop('image', None)

        # 1. Zapisz produkt bez zdjęcia, by dostać pk
        product = Product.objects.create(**validated_data)

        if image:
            # 2. Zapisz plik tymczasowo
            temp_path = os.path.join(settings.MEDIA_ROOT, 'products', 'temp', image.name)
            with open(temp_path, 'wb+') as temp_file:
                for chunk in image.chunks():
                    temp_file.write(chunk)

            # 3. Wyznacz nową ścieżkę
            final_dir = os.path.join(settings.MEDIA_ROOT, 'products', str(product.pk))
            os.makedirs(final_dir, exist_ok=True)
            final_path = os.path.join(final_dir, image.name)

            # 4. Przenieś plik z temp do docelowego folderu
            shutil.move(temp_path, final_path)

            # 5. Zaktualizuj pole image
            relative_path = f'products/{product.pk}/{image.name}'
            product.image = relative_path
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
