# products/urls.py

from django.urls import path
from .views import UserProductsListView, ProductAvailabilityToggle, IsFavouriteView, RemoveFromFavourite, AddToFavorites, ProductListCreateView, ProductDetailView, CategoryListView, CategoryGroupListView, ProductDetailView, ProductCreateAPIView, CartAPIView, AddToCartAPIView, UpdateCartItemAPIView, RemoveFromCartAPIView, ProductDeleteAPIView, CreateOrderAPIView, UserOrdersAPIView, FavouriteListAPIView



urlpatterns = [
    path('', ProductListCreateView.as_view(), name='product-list'),
    path('product/<int:id>/', ProductDetailView.as_view(), name='product-detail'),
    path('category/', CategoryListView.as_view(), name="categories"),
    path('categorygroup/', CategoryGroupListView.as_view(), name='category-groups'),
    path('product/add/', ProductCreateAPIView.as_view(), name='product-add'),
    path('product/<int:pk>/delete/', ProductDeleteAPIView.as_view(), name='product-delete'),
    path('cart/', CartAPIView.as_view(), name='api-cart'),
    path('cart/add/', AddToCartAPIView.as_view(), name='api-cart-add'),
    path('cart/update/<int:item_id>/', UpdateCartItemAPIView.as_view(), name='api-cart-update'),
    path('cart/remove/<int:item_id>/', RemoveFromCartAPIView.as_view(), name='api-cart-remove'),
    path('favourite/add/<int:product_id>/', AddToFavorites.as_view(), name='add-to-favourites'),
    path('favourite/remove/<int:product_id>/', RemoveFromFavourite.as_view(), name='favourite-remove'),
    path('favourite/is_favourite/<int:product_id>/', IsFavouriteView.as_view(), name='is-favourite'),
    path('product/<int:product_id>/toggle/', ProductAvailabilityToggle.as_view(), name='api_toggle_product'),
    path("userproducts/<str:user_id>/", UserProductsListView.as_view(), name="user-products"),
    path('order/create/', CreateOrderAPIView.as_view(), name='order-create'),
    path('orders/me/', UserOrdersAPIView.as_view(), name='user-orders'),
    path('favourite/list/', FavouriteListAPIView.as_view(), name='favourite-list'),
]


