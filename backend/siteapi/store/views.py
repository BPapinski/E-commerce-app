import stripe
import os
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))
print('STRIPE_SECRET_KEY:', os.getenv('STRIPE_SECRET_KEY'))  # Sprawdź w konsoli czy klucz się ładuje
import os
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env'))
from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Order

# Stripe webhook endpoint
@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    endpoint_secret = os.getenv('STRIPE_WEBHOOK_SECRET')
    event = None
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError as e:
        return Response({'error': 'Invalid payload'}, status=400)
    except stripe.error.SignatureVerificationError as e:
        return Response({'error': 'Invalid signature'}, status=400)

    # Obsługa eventu płatności
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        # Pobierz order_id z session.metadata (dodaj w StripeCheckoutAPIView)
        order_id = session.get('metadata', {}).get('order_id')
        if order_id:
            order = Order.objects.filter(id=order_id).first()
            if order:
                order.is_paid = True
                order.save(update_fields=['is_paid'])
    return Response({'status': 'success'})

import stripe
from rest_framework import generics, permissions, filters, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
# Widok zwracający ulubione produkty zalogowanego użytkownika
class FavouriteListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        favourites = FavouriteItem.objects.filter(user=request.user, is_active=True)
        products = []
        for fav in favourites:
            product = fav.product
            if product:
                products.append({
                    "id": product.id,
                    "name": product.name,
                    "description": product.description,
                    "price": product.price,
                    "image": product.image.url if product.image else "",
                })
        return Response({"favourites": products})


# Widok zwracający zamówienia zalogowanego użytkownika
class UserOrdersAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(user=request.user).order_by('-created_at')
        data = []
        for order in orders:
            items = [
                {
                    "id": item.id,
                    "name": item.product.name if item.product else "Produkt usunięty",
                    "price": item.product.price if item.product else 0,
                    "quantity": item.quantity,
                }
                for item in order.items.all()
            ]
            data.append({
                "id": order.id,
                "name": f"Zamówienie #{order.id}",
                "description": "",
                "price": sum(i["price"] * i["quantity"] for i in items),
                "paid": order.is_paid,
                "available": True,
                "products": items,
                "created_at": order.created_at,
            })
        return Response({"orders": data})
# products/views.py


from .permissions import IsAdminOrSellerOrReadOnly  # importuj nową klasę
from django.shortcuts import get_object_or_404

from .models import Product, Category, CategoryGroup, Cart, CartItem, FavouriteItem, Order, OrderItem
from .serializers import ProductSerializer, CategorySerializer, CategoryGroupSerializer, CartSerializer, CartItemSerializer

# Tworzenie zamówienia na podstawie koszyka
class CreateOrderAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        if not cart.items.exists():
            return Response({'error': 'Koszyk jest pusty'}, status=status.HTTP_400_BAD_REQUEST)

        order = Order.objects.create(user=request.user)
        total_price = 0
        for cart_item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                quantity=cart_item.quantity
            )
            total_price += cart_item.product.price * cart_item.quantity

        # Opcjonalnie: wyczyść koszyk po utworzeniu zamówienia
        cart.items.all().delete()

        return Response({
            'order_id': order.id,
            'total_price': total_price,
            'created_at': order.created_at,
        }, status=status.HTTP_201_CREATED)
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from .permissions import IsAdminOrSellerOrReadOnly  # importuj nową klasę
from django.shortcuts import get_object_or_404
from authuser.models import User


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
        # To jest miejsce, gdzie przypisujesz zalogowanego użytkownika jako sprzedawcę.
        serializer.save(seller=self.request.user)

class ProductDeleteAPIView(generics.DestroyAPIView): # do wywalenia wkrótce --> usuwanie będzie polegało na aminie "available" a nie usuwaniu produktu z bazy
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_destroy(self, instance):
        user = self.request.user
        if instance.seller == user or user.is_staff:
            instance.delete()
        else:
            raise PermissionDenied("Nie masz uprawnień do usunięcia tego produktu.")
        
class ProductAvailabilityToggle(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrSellerOrReadOnly]

    def post(self, request, product_id):
        product = get_object_or_404(Product, id=product_id)
        self.check_object_permissions(request, product)  # ważne!

        product.available = not product.available
        product.save()
        return Response({
            'status': 'success',
            'available': product.available,
        }, status=status.HTTP_200_OK)
    
class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

class CategoryGroupListView(generics.ListAPIView):
    queryset = CategoryGroup.objects.all()
    serializer_class = CategoryGroupSerializer
    permission_classes = [permissions.AllowAny]

class UserProductsListView(APIView):
    permission_classes = [permissions.AllowAny]  # Każdy może wejść

    def get(self, request, user_id=None):
        if user_id == "me":
            if not request.user.is_authenticated:
                return Response({"detail": "Musisz być zalogowany, by zobaczyć swoje produkty."},
                                status=status.HTTP_401_UNAUTHORIZED)
            user = request.user
        else:
            try:
                user = User.objects.get(pk=int(user_id))
            except User.DoesNotExist:
                return Response({"detail": "Użytkownik nie istnieje."}, status=status.HTTP_404_NOT_FOUND)

        products = Product.objects.filter(seller=user)
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

# logika koszyka

class CartAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)


class AddToCartAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        serializer = CartItemSerializer(data=request.data)
        if serializer.is_valid():
            product = serializer.validated_data['product']
            quantity = serializer.validated_data['quantity']

            cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)
            if not created:
                cart_item.quantity += quantity
            else:
                cart_item.quantity = quantity
            cart_item.save()
            return Response(CartItemSerializer(cart_item).data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UpdateCartItemAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, item_id):
        cart_item = CartItem.objects.filter(id=item_id, cart__user=request.user).first()
        if not cart_item:
            return Response({'error': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = CartItemSerializer(cart_item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RemoveFromCartAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, item_id):
        cart_item = CartItem.objects.filter(id=item_id, cart__user=request.user).first()
        if not cart_item:
            return Response({'error': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)
        cart_item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
class AddToFavorites(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, product_id):
        user = request.user
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({"error": "Produkt nie istnieje"}, status=status.HTTP_404_NOT_FOUND)

        fav, created = FavouriteItem.objects.get_or_create(
            user=user, product=product,
            defaults={"is_active": True} 
        )

        if not created and not fav.is_active:
            fav.is_active = True
            fav.save(update_fields=['is_active']) 
            return Response({"message": "Aktywowano ulubiony produkt", "action": "reactivated"}, status=status.HTTP_200_OK)
        elif not created:
            return Response({"message": "Już dodano do ulubionych", "action": "already_active"}, status=status.HTTP_200_OK)
        
        return Response({"message": "Dodano do ulubionych", "action": "created"}, status=status.HTTP_201_CREATED)
    
class RemoveFromFavourite(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, product_id):
        user = request.user
        try:
            fav = FavouriteItem.objects.get(user=user, product_id=product_id)
            fav.is_active = False
            fav.save()
            return Response({"message": "Usunięto z ulubionych"}, status=status.HTTP_200_OK)
        except FavouriteItem.DoesNotExist:
            return Response({"detail": "Nie znaleziono ulubionego produktu"}, status=status.HTTP_404_NOT_FOUND)

class IsFavouriteView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, product_id):
        user = request.user
        is_fav = FavouriteItem.objects.filter(user=user, product_id=product_id, is_active=True).exists()
        return Response({"isFavourite": is_fav}, status=status.HTTP_200_OK)
    
# Stripe Checkout endpoint
class StripeCheckoutAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            order_id = request.data.get("order_id")
            order = Order.objects.filter(id=order_id, user=request.user).first()
            if not order:
                return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)
            stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
            print('Używany STRIPE_SECRET_KEY:', stripe.api_key)  # Sprawdź czy jest ustawiony przed płatnością

            amount = sum(
                (item.product.price if item.product else 0) * item.quantity
                for item in order.items.all()
            )
            amount = int(amount * 100)
            session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                line_items=[{
                    "price_data": {
                        "currency": "pln",
                        "product_data": {
                            "name": f"Zamówienie #{order.id}",
                        },
                        "unit_amount": amount,
                    },
                    "quantity": 1,
                }],
                mode="payment",
                success_url="http://localhost:3000/orders?success=true",
                cancel_url="http://localhost:3000/orders?cancel=true",
                customer_email=request.user.email if request.user.email else None,
                metadata={"order_id": str(order.id)},
            )
            return Response({"checkout_url": session.url})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class MarkOrderPaidAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_id = request.data.get("order_id")
        order = Order.objects.filter(id=order_id, user=request.user).first()
        if not order:
            return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)
        order.is_paid = True
        order.save(update_fields=["is_paid"])
        return Response({"success": True, "order_id": order.id, "is_paid": order.is_paid})