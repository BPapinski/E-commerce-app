# store/tests.py

import datetime
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from authuser.models import User # Twój własny model użytkownika
from .models import Product, Category # Twoje modele

# Importuj narzędzia do generowania tokenów z Simple JWT
from rest_framework_simplejwt.tokens import RefreshToken

class ProductAPITestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()

        # Tworzymy użytkowników
        self.seller = User.objects.create_user(
            email='seller@example.com',
            date_of_birth=datetime.date(1985, 1, 1),
            password='password123'
        )
        self.other_user = User.objects.create_user(
            email='other@example.com',
            date_of_birth=datetime.date(1992, 7, 20),
            password='password123'
        )
        self.admin = User.objects.create_superuser(
            email='admin@example.com',
            date_of_birth=datetime.date(1970, 1, 1),
            password='adminpass'
        )

        # *** Generowanie tokenów JWT dla użytkowników ***
        # Funkcja pomocnicza do generowania tokenu dostępu
        def get_tokens_for_user(user):
            refresh = RefreshToken.for_user(user)
            return {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }

        self.seller_tokens = get_tokens_for_user(self.seller)
        self.other_user_tokens = get_tokens_for_user(self.other_user)
        self.admin_tokens = get_tokens_for_user(self.admin)

        # Tworzymy kategorię dla testów
        self.category_for_product = Category.objects.create(name='Test Category')

        # Tworzymy produkt przypisany do sprzedawcy
        self.product = Product.objects.create(
            name='Test Produkt',
            description='Opis produktu',
            price=10.0,
            seller=self.seller,
            category=self.category_for_product,
            condition='new'
        )

    def test_create_product_as_authenticated_user(self):
        # Używamy tokenu dostępu (access token) z Simple JWT
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.seller_tokens['access'])

        response = self.client.post('/api/store/product/add/', {
            'name': 'Nowy Produkt',
            'description': 'Opis nowego',
            'price': 99.99,
            'category': self.category_for_product.id,
            'condition': "new",
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Product.objects.last().seller, self.seller)
        self.assertEqual(Product.objects.last().category, self.category_for_product)

    def test_delete_product_as_owner(self):
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.seller_tokens['access'])
        response = self.client.delete(f'/api/store/product/{self.product.id}/delete/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Product.objects.filter(id=self.product.id).exists())

    def test_delete_product_as_other_user_forbidden(self):
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.other_user_tokens['access'])
        response = self.client.delete(f'/api/store/product/{self.product.id}/delete/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_product_as_admin(self):
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.admin_tokens['access'])
        response = self.client.delete(f'/api/store/product/{self.product.id}/delete/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)