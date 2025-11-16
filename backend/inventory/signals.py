from django.db.models.signals import pre_save
from django.dispatch import receiver
from django.db import transaction

from .models import Order, OrderItem, Medicine


def _display_name(user):
    try:
        if not user:
            return 'User'
        full = getattr(user, 'get_full_name', None)
        if callable(full):
            fn = full()
            if fn:
                return fn
        nm = getattr(user, 'name', None)
        if nm:
            return nm
        un = getattr(user, 'username', None)
        if un:
            return un
        em = getattr(user, 'email', None)
        if em:
            try:
                return em.split('@')[0]
            except Exception:
                return em
        return str(user)
    except Exception:
        return 'User'


@receiver(pre_save, sender=Order)
def reserve_stock_on_approval(sender, instance, **kwargs):
    """
    If an Order's status is being changed to 'approved' and stock hasn't been reserved yet,
    attempt to reserve stock atomically and mark stock_reserved=True. This ensures approvals
    done via different endpoints (admin, PUT, etc.) still run reservation + notification logic.
    We raise an exception if reservation cannot be completed so the save is aborted.
    """
    if not instance.pk:
        return

    try:
        old = Order.objects.get(pk=instance.pk)
    except Order.DoesNotExist:
        return
    if old.status == 'approved' or instance.status != 'approved':
        return
    if instance.stock_reserved:
        return
    items = OrderItem.objects.filter(order=instance)
    try:
        with transaction.atomic():
            for it in items.select_for_update():
                med = Medicine.objects.select_for_update().get(pk=it.medicine.id)
                if med.stock_quantity < it.quantity:
                    raise ValueError(f'Insufficient stock for {med.name}')
            for it in items:
                med = Medicine.objects.select_for_update().get(pk=it.medicine.id)
                med.stock_quantity = med.stock_quantity - it.quantity
                med.save()
            instance.stock_reserved = True
            try:
                from .models import Notification
                if instance.patient:
                    Notification.objects.create(
                        recipient=instance.patient,
                        actor=None,
                        verb='order_approved',
                        message=f'Your order #{instance.id} has been approved by {_display_name(instance.pharmacy)}.',
                        data={'order_id': instance.id}
                    )
            except Exception:
                pass

    except Exception:
        raise
