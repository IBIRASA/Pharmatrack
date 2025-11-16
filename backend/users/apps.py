from django.apps import AppConfig


class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'users'

    def ready(self):
        # Import signals to ensure synchronization between users.Pharmacy and inventory.Pharmacy
        try:
            import users.signals  # noqa: F401
        except Exception:
            # Avoid breaking app startup if signals fail to import
            pass
