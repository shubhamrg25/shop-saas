from django.apps import AppConfig


class InventoryConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'inventory'

    def ready(self):
        from django.contrib.auth.models import User
        from django.db.models.signals import post_save
        from .models import Shop

        def create_shop_for_user(sender, instance, created, **kwargs):
            if created and not hasattr(instance, "shop"):
                Shop.objects.create(
                    owner=instance,
                    name=f"{instance.username}'s Shop"
                )

        post_save.connect(create_shop_for_user, sender=User)
