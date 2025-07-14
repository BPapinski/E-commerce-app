from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ..models import Order, OrderItem, Cart

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

class CreateOrderAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        if not cart.items.exists():
            return Response({'error': 'Koszyk jest pusty'}, status=400)

        order = Order.objects.create(user=request.user)
        total_price = 0
        for cart_item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                quantity=cart_item.quantity
            )
            total_price += cart_item.product.price * cart_item.quantity
        cart.items.all().delete()
        return Response({
            'order_id': order.id,
            'total_price': total_price,
            'created_at': order.created_at,
        }, status=201)

class MarkOrderPaidAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_id = request.data.get("order_id")
        order = Order.objects.filter(id=order_id, user=request.user).first()
        if not order:
            return Response({"error": "Order not found"}, status=404)
        order.is_paid = True
        order.save(update_fields=["is_paid"])
        return Response({"success": True, "order_id": order.id, "is_paid": order.is_paid})
