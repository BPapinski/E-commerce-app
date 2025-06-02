# products/views.py

from rest_framework import generics, permissions
from rest_framework.pagination import PageNumberPagination
from .models import Product, Category, CategoryGroup
from .serializers import ProductSerializer, CategorySerializer, CategoryGroupSerializer

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'


class ProductListCreateView(generics.ListCreateAPIView):
    queryset = Product.objects.all().order_by('-created_at')
    serializer_class = ProductSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        queryset = Product.objects.all()

        category = self.request.query_params.get('category')

        if category:
            queryset = queryset.filter(category__name__iexact=category)
        return queryset


# 🔽 Szczegóły pojedynczego produktu
class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'id'


class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

class CategoryGroupListView(generics.ListAPIView):
    queryset = CategoryGroup.objects.all()
    serializer_class = CategoryGroupSerializer
    permission_classes = [permissions.AllowAny]