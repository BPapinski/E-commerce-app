# products/views.py

from rest_framework import generics, permissions, filters
from rest_framework.pagination import PageNumberPagination
from .models import Product, Category, CategoryGroup
from .serializers import ProductSerializer, CategorySerializer, CategoryGroupSerializer
from rest_framework.permissions import IsAuthenticated

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
        queryset = Product.objects.all().order_by('-id')  # gwarantuje unikalność i stabilność sortowania
        params = self.request.query_params

        category = params.get('category')
        if category:
            queryset = queryset.filter(category__name__iexact=category)

        min_price = params.get('min_price')
        if min_price is not None:
            try:
                min_price = float(min_price)
                queryset = queryset.filter(price__gte=min_price)
            except ValueError:
                pass

        max_price = params.get('max_price')
        if max_price is not None:
            try:
                max_price = float(max_price)
                queryset = queryset.filter(price__lte=max_price)
            except ValueError:
                pass

        seller_id = params.get('sellerId')
        if seller_id is not None:
            try:
                seller_id = int(seller_id)
                queryset = queryset.filter(seller_id=seller_id)
            except ValueError:
                pass

        return queryset

# 🔽 Szczegóły pojedynczego produktu
class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'id'

class ProductCreateAPIView(generics.CreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # To jest miejsce, gdzie przypisujesz zalogowanego użytkownika jako sprzedawcę.
        serializer.save(seller=self.request.user)


class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

class CategoryGroupListView(generics.ListAPIView):
    queryset = CategoryGroup.objects.all()
    serializer_class = CategoryGroupSerializer
    permission_classes = [permissions.AllowAny]