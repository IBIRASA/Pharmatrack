from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Pharmacy as UsersPharmacy


@receiver(post_save, sender=UsersPharmacy)
def sync_inventory_pharmacy(sender, instance: UsersPharmacy, created, **kwargs):
    """Keep the inventory.Pharmacy record in sync with users.Pharmacy.

    This ensures the inventory app has latitude/longitude/address available for
    proximity filtering and that updates to the users' profile propagate.
    """
    try:
        # Import locally to avoid circular imports at module import time
        from inventory.models import Pharmacy as InventoryPharmacy

        lat = None
        lon = None
        try:
            lat = float(instance.latitude) if instance.latitude is not None else None
        except Exception:
            lat = None
        try:
            lon = float(instance.longitude) if instance.longitude is not None else None
        except Exception:
            lon = None

        defaults = {
            'name': instance.name or (instance.user.username if instance.user else ''),
            'address': instance.address or '',
            'phone': instance.phone or '',
            'latitude': lat if lat is not None else 0.0,
            'longitude': lon if lon is not None else 0.0,
        }

        InventoryPharmacy.objects.update_or_create(user=instance.user, defaults=defaults)
    except Exception:
        # If inventory app is not installed or an error occurs, ignore to keep
        # users app functional. Admin can be used to sync manually.
        pass
