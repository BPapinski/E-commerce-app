# products/urls.py

from django.urls import path
from .views import ProductListCreateView, ProductDetailView, CategoryListView, CategoryGroupListView, ProductDetailView, ProductCreateAPIView


urlpatterns = [
    path('', ProductListCreateView.as_view(), name='product-list'),
    path('product/<int:id>/', ProductDetailView.as_view(), name='product-detail'),
    path('category/', CategoryListView.as_view(), name="categories"),
    path('categorygroup/', CategoryGroupListView.as_view(), name='category-groups'),
    path('product/add/', ProductCreateAPIView.as_view(), name='product-add'),
]
