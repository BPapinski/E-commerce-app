from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from ..models import FavouriteItem, Product

class AddToFavorites(APIView):
    permission_classes = [IsAuthenticated]

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
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ..models import FavouriteItem

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
