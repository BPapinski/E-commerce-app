# twoja_aplikacja/signals.py

from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from .models import FavouriteItem, Product, Notification

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



@receiver(post_save, sender=FavouriteItem)
def create_notification_on_create(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(
            user=instance.product.seller,
            message=(
                f'Użytkownik {instance.user.email} dodał twój produkt "{instance.product.name}" '
                f'do ulubionych.'
            )
        )

@receiver(pre_save, sender=FavouriteItem)
def create_notification_on_status_change(sender, instance, **kwargs):
    if not instance.pk:
        return

    previous = FavouriteItem.objects.get(pk=instance.pk)
    if previous.is_active != instance.is_active:
        if instance.is_active:
            message = (f'Użytkownik {instance.user.email} ponownie polubił twój produkt "{instance.product.name}"')
        else:
            message = (
                f'Użytkownik {instance.user.email} zrezygnował z polubienia twojego produktu "{instance.product.name}"'
            )

        Notification.objects.create(
            user=instance.product.seller,
            message=message
        )
