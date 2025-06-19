# twoja_aplikacja/signals.py

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import FavouriteItem, Product # !!! Upewnij się, że importujesz poprawnie !!!

@receiver(post_save, sender=FavouriteItem)
def update_product_likes_on_save(sender, instance, created, **kwargs):
    if created and instance.is_active:
        instance.product.likes_count += 1
        instance.product.save(update_fields=['likes_count'])
    elif not created:
        try:
            old_instance = FavouriteItem.objects.get(pk=instance.pk)
            if old_instance.is_active != instance.is_active:
                if instance.is_active: # Zostało zmienione na aktywne
                    instance.product.likes_count += 1
                else:
                    instance.product.likes_count -= 1
                instance.product.save(update_fields=['likes_count'])
        except FavouriteItem.DoesNotExist:
            pass 
        except Exception as e:
            print(f"Błąd podczas aktualizacji w post_save: {e}")


@receiver(post_delete, sender=FavouriteItem)
def update_product_likes_on_delete(sender, instance, **kwargs):
    if instance.is_active and instance.product.likes_count > 0:
        instance.product.likes_count -= 1
        instance.product.save(update_fields=['likes_count'])
    elif not instance.is_active:
        print("Usuwam nieaktywne polubienie: Licznik bez zmian.")
    else:
        print("Licznik już na zero lub problem z is_active.")