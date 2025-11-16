from django.urls import path
from . import views

urlpatterns = [
    path('dashboard-stats/', views.dashboard_stats, name='dashboard_stats'),
    path('medicines/', views.medicine_list, name='medicine_list'),
    path('medicines/<int:pk>/', views.medicine_detail, name='medicine_detail'),
    
    path('medicines/low-stock/', views.low_stock_medicines, name='low_stock_medicines'),
    path('orders/', views.order_list, name='order_list'),
    path('orders/<int:pk>/', views.order_detail, name='order_detail'),
    path('orders/place/', views.place_order, name='place_order'),
    path('orders/my/', views.my_orders, name='my_orders'),
    path('orders/<int:order_id>/approve/', views.approve_order, name='approve_order'),
    path('orders/<int:order_id>/reject/', views.reject_order, name='reject_order'),
    path('orders/<int:order_id>/ship/', views.mark_shipped, name='mark_shipped'),
    path('orders/<int:order_id>/accept/', views.accept_order_approval, name='accept_order_approval'),
    path('orders/<int:order_id>/complete/', views.complete_order, name='complete_order'),
    path('orders/<int:order_id>/confirm/', views.confirm_delivery, name='confirm_delivery'),
    path('notifications/', views.notifications_list, name='notifications_list'),
    path('notifications/<int:pk>/mark-read/', views.notification_mark_read, name='notification_mark_read'),
     path('sell/', views.sell_medicine, name='inventory-sell'),
    path('sales/', views.pharmacy_sales, name='pharmacy_sales'),
    path('customers/', views.customers_list, name='customers_list'),
]