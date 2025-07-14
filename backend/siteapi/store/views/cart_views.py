from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ..models import Cart, CartItem
from ..serializers import CartSerializer, CartItemSerializer

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
            return Response(CartItemSerializer(cart_item).data, status=201)
        return Response(serializer.errors, status=400)

class UpdateCartItemAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, item_id):
        cart_item = CartItem.objects.filter(id=item_id, cart__user=request.user).first()
        if not cart_item:
            return Response({'error': 'Item not found'}, status=404)
        serializer = CartItemSerializer(cart_item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

class RemoveFromCartAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, item_id):
        cart_item = CartItem.objects.filter(id=item_id, cart__user=request.user).first()
        if not cart_item:
            return Response({'error': 'Item not found'}, status=404)
        cart_item.delete()
        return Response(status=204)
