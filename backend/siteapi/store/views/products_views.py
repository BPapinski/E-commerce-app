from rest_framework import generics, filters, permissions, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from ..models import Category, CategoryGroup, Product, User
from ..serializers import CategorySerializer, CategoryGroupSerializer, ProductSerializer
from ..permissions import IsAdminOrSellerOrReadOnly

class UserProductsListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, user_id=None):
        if user_id == "me":
            if not request.user.is_authenticated:
                return Response({"detail": "Musisz być zalogowany, by zobaczyć swoje produkty."}, status=status.HTTP_401_UNAUTHORIZED)
            user = request.user
        else:
            try:
                user = User.objects.get(pk=int(user_id))
            except User.DoesNotExist:
                return Response({"detail": "Użytkownik nie istnieje."}, status=status.HTTP_404_NOT_FOUND)
        products = Product.objects.filter(seller=user)
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

class CategoryGroupListView(generics.ListAPIView):
    queryset = CategoryGroup.objects.all()
    serializer_class = CategoryGroupSerializer
    permission_classes = [permissions.AllowAny]
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from ..models import Product
from ..permissions import IsAdminOrSellerOrReadOnly
from rest_framework.permissions import IsAuthenticated

class ProductAvailabilityToggle(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrSellerOrReadOnly]

    def post(self, request, product_id):
        product = get_object_or_404(Product, id=product_id)
        self.check_object_permissions(request, product)
        product.available = not product.available
        product.save()
        return Response({
            'status': 'success',
            'available': product.available,
        }, status=status.HTTP_200_OK)
from rest_framework import generics, filters
from ..models import Product
from ..serializers import ProductSerializer
from ..permissions import IsAdminOrSellerOrReadOnly
from rest_framework.pagination import PageNumberPagination

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
        queryset = Product.objects.all().order_by('-id')
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
        condition = params.get('condition')
        if condition:
            if condition.lower() in ['new', 'used']:
                queryset = queryset.filter(condition=condition.lower())
        return queryset

class ProductDetailView(generics.RetrieveUpdateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrSellerOrReadOnly]
    lookup_field = 'id'

class ProductCreateAPIView(generics.CreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)

class ProductDeleteAPIView(generics.DestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrSellerOrReadOnly]

    def perform_destroy(self, instance):
        user = self.request.user
        if instance.seller == user or user.is_staff:
            instance.delete()
        else:
            raise PermissionDenied("Nie masz uprawnień do usunięcia tego produktu.")
