#!/usr/bin/env python3
"""
Database Explorer Script for Pharmatrack
Run this to view your database tables and data
"""

import os
import sys
import django

# Add the backend directory to Python path
sys.path.append('/home/digital-axis/Music/Pharmatrack/backend')

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pharmatrack_backend.settings')
django.setup()

# Import models
from django.contrib.auth import get_user_model
from inventory.models import Medicine, Order, OrderItem, Sale, Customer, Pharmacy
from users.models import Pharmacy as UserPharmacy

User = get_user_model()

def show_table_counts():
    """Show count of records in each table"""
    print("=" * 50)
    print("DATABASE OVERVIEW")
    print("=" * 50)
    print(f"Users: {User.objects.count()}")
    print(f"User Pharmacies: {UserPharmacy.objects.count()}")
    print(f"Inventory Pharmacies: {Pharmacy.objects.count()}")
    print(f"Medicines: {Medicine.objects.count()}")
    print(f"Orders: {Order.objects.count()}")
    print(f"Order Items: {OrderItem.objects.count()}")
    print(f"Sales: {Sale.objects.count()}")
    print(f"Customers: {Customer.objects.count()}")
    print()

def show_users():
    """Show all users"""
    print("=" * 50)
    print("USERS")
    print("=" * 50)
    for user in User.objects.all():
        print(f"ID: {user.id}, Email: {user.email}, Type: {user.user_type}, Active: {user.is_active}")
    print()

def show_medicines():
    """Show all medicines"""
    print("=" * 50)
    print("MEDICINES")
    print("=" * 50)
    for med in Medicine.objects.all()[:10]:  # Show first 10
        print(f"ID: {med.id}, Name: {med.name}, Price: ${med.unit_price}, Stock: {med.stock_quantity}, Expiry: {med.expiry_date}")
    
    total = Medicine.objects.count()
    if total > 10:
        print(f"... and {total - 10} more medicines")
    print()

def show_orders():
    """Show all orders"""
    print("=" * 50)
    print("ORDERS")
    print("=" * 50)
    for order in Order.objects.all()[:10]:  # Show first 10
        print(f"ID: {order.id}, Customer: {order.customer_name}, Total: ${order.total_amount}, Status: {order.status}, Date: {order.created_at.date()}")
    
    total = Order.objects.count()
    if total > 10:
        print(f"... and {total - 10} more orders")
    print()

def show_sales():
    """Show all sales"""
    print("=" * 50)
    print("SALES")
    print("=" * 50)
    for sale in Sale.objects.all()[:10]:  # Show first 10
        customer_name = sale.customer.name if sale.customer else "Unknown"
        print(f"ID: {sale.id}, Medicine: {sale.medicine.name}, Qty: {sale.quantity}, Total: ${sale.total_price}, Customer: {customer_name}, Date: {sale.sale_date.date()}")
    
    total = Sale.objects.count()
    if total > 10:
        print(f"... and {total - 10} more sales")
    print()

def show_expiring_medicines():
    """Show medicines expiring soon"""
    from datetime import date, timedelta
    
    print("=" * 50)
    print("MEDICINES EXPIRING IN NEXT 60 DAYS")
    print("=" * 50)
    
    today = date.today()
    expiry_threshold = today + timedelta(days=60)
    
    expiring = Medicine.objects.filter(
        expiry_date__lte=expiry_threshold,
        expiry_date__gte=today
    ).order_by('expiry_date')
    
    if expiring:
        for med in expiring:
            days_left = (med.expiry_date - today).days
            print(f"Name: {med.name}, Expiry: {med.expiry_date}, Days Left: {days_left}, Stock: {med.stock_quantity}")
    else:
        print("No medicines expiring in the next 60 days!")
    print()

def main():
    """Main function to run all database queries"""
    try:
        show_table_counts()
        show_users()
        show_medicines()
        show_orders()
        show_sales()
        show_expiring_medicines()
        
        print("=" * 50)
        print("DATABASE EXPLORATION COMPLETE")
        print("=" * 50)
        print("Database file location: /home/digital-axis/Music/Pharmatrack/backend/db.sqlite3")
        print("To run custom queries, use: ./venv/bin/python manage.py shell")
        print()
        
    except Exception as e:
        print(f"Error: {e}")
        print("Make sure you're in the backend directory and Django is properly set up.")

if __name__ == "__main__":
    main()