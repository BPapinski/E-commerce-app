import stripe
import os
from dotenv import load_dotenv
from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ..models import Order

load_dotenv(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '.env')))

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
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        order_id = session.get('metadata', {}).get('order_id')
        if order_id:
            order = Order.objects.filter(id=order_id).first()
            if order:
                order.is_paid = True
                order.save(update_fields=['is_paid'])
    return Response({'status': 'success'})

class StripeCheckoutAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            order_id = request.data.get("order_id")
            order = Order.objects.filter(id=order_id, user=request.user).first()
            if not order:
                return Response({"error": "Order not found"}, status=404)
            print("Loaded STRIPE_SECRET_KEY:", os.getenv("STRIPE_SECRET_KEY"))
            stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
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
            return Response({"error": str(e)}, status=500)
