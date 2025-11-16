from django.apps import AppConfig
from django.conf import settings
from mongoengine import connect

class InventoryConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'inventory'

    def ready(self):
        connect(
            db=getattr(settings, 'MONGODB_DB', 'pharmatrack'),
            host=getattr(settings, 'MONGODB_URI', 'mongodb://127.0.0.1:27017'),
            alias='default',
        )
        try:
            import inventory.signals 
        except Exception:
            pass
