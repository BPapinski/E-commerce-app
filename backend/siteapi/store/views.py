# products/views.py

from rest_framework import generics, permissions, filters
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

    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']

    def get_queryset(self):
        queryset = super().get_queryset()
        params = self.request.query_params

        # Filtrowanie po kategorii
        category = params.get('category')
        if category:
            queryset = queryset.filter(category__name__iexact=category)

        # Filtrowanie po cenie minimalnej
        min_price = params.get('min_price')
        if min_price is not None:
            try:
                min_price = float(min_price)
                queryset = queryset.filter(price__gte=min_price)
            except ValueError:
                pass  # możesz dodać logowanie błędu

        # Filtrowanie po cenie maksymalnej
        max_price = params.get('max_price')
        if max_price is not None:
            try:
                max_price = float(max_price)
                queryset = queryset.filter(price__lte=max_price)
            except ValueError:
                pass

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