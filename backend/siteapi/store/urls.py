# products/urls.py

from django.urls import path
from .views import ProductListCreateView, ProductDetailView, CategoryListView, CategoryGroupListView, ProductDetailView, ProductCreateAPIView, CartAPIView, AddToCartAPIView, UpdateCartItemAPIView, RemoveFromCartAPIView


urlpatterns = [
    path('', ProductListCreateView.as_view(), name='product-list'),
    path('product/<int:id>/', ProductDetailView.as_view(), name='product-detail'),
    path('category/', CategoryListView.as_view(), name="categories"),
    path('categorygroup/', CategoryGroupListView.as_view(), name='category-groups'),
    path('product/add/', ProductCreateAPIView.as_view(), name='product-add'),
    path('cart/', CartAPIView.as_view(), name='api-cart'),
    path('cart/add/', AddToCartAPIView.as_view(), name='api-cart-add'),
    path('cart/update/<int:item_id>/', UpdateCartItemAPIView.as_view(), name='api-cart-update'),
    path('cart/remove/<int:item_id>/', RemoveFromCartAPIView.as_view(), name='api-cart-remove'),

]
