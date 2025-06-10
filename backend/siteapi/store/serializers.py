
import os
import shutil
from django.core.files import File
from django.conf import settings


from rest_framework import serializers
from .models import Product, Category, CategoryGroup

# store/serializers.py
import os
import shutil
from django.conf import settings
from rest_framework import serializers
from .models import Product, Category # Upewnij się, że Category jest zaimportowane!

class ProductSerializer(serializers.ModelSerializer):
    # SerializerMethodField dla category_name do ODCZYTU
    category_name = serializers.SerializerMethodField(read_only=True)
    # Pole do PRZYJMOWANIA ID kategorii podczas ZAPISU (POST/PUT)
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), write_only=True)
    seller_email = serializers.EmailField(source='seller.email', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 'image', 'available',
            'created_at', 'category', 'category_name', 'seller', 'seller_email', 'condition'
        ]
        read_only_fields = ['id', 'created_at', 'seller', 'seller_email', 'category_name'] # Te pola są tylko do odczytu

    def get_category_name(self, obj):
        # Ta metoda służy do odczytu nazwy kategorii
        return obj.category.name if obj.category else None

    def create(self, validated_data):
        # Dane do validated_data przekazywane są już po przetworzeniu przez
        # self.context.get('request').user w widoku (perform_create)
        # Więc validated_data['seller'] powinno już być obiektem User.

        image = validated_data.pop('image', None)
        category_obj = validated_data.pop('category', None) # Pobierz obiekt kategorii

        # Upewnij się, że seller jest poprawnie przekazany do validated_data
        # z perform_create w widoku.
        product = Product.objects.create(category=category_obj, **validated_data) # Przypisz kategorię

        if image:
            # Użyj os.path.join do bezpiecznego łączenia ścieżek
            # Upewnij się, że settings.MEDIA_ROOT jest poprawnie skonfigurowane
            temp_dir = os.path.join(settings.MEDIA_ROOT, 'products', 'temp')
            os.makedirs(temp_dir, exist_ok=True)
            temp_path = os.path.join(temp_dir, image.name)

            # Zapisz plik tymczasowo
            with open(temp_path, 'wb+') as temp_file:
                for chunk in image.chunks():
                    temp_file.write(chunk)

            # Wyznacz nową ścieżkę z użyciem product.pk
            final_dir = os.path.join(settings.MEDIA_ROOT, 'products', str(product.pk))
            os.makedirs(final_dir, exist_ok=True)
            final_path = os.path.join(final_dir, image.name)

            # Przenieś plik z temp do docelowego folderu
            shutil.move(temp_path, final_path)

            # Zaktualizuj pole image (ścieżka względna dla Django)
            relative_path = os.path.join('products', str(product.pk), image.name)
            product.image.name = relative_path # Użyj .name do przypisania ścieżki
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
