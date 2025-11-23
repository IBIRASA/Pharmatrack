from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from inventory.models import Medicine
from .models import Pharmacy
from django.contrib.auth.models import User
import math
from django.utils import timezone
from django.db.models import Q

class SearchMedicineView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        medicine_name = (request.query_params.get('name') or
                         request.query_params.get('q') or '').strip()
        if not medicine_name:
            return Response({"error": "Medicine name required"}, status=400)

        today = timezone.localdate()

        # Prefer a centralized manager if present, otherwise apply inline filter
        if hasattr(Medicine.objects, "available_for_patient"):
            base_qs = Medicine.objects.available_for_patient()
        else:
            # stock_quantity > 0 and not expired (expiry_date is null OR expiry_date >= today)
            base_qs = Medicine.objects.filter(
                stock_quantity__gt=0
            ).filter(
                Q(expiry_date__isnull=True) | Q(expiry_date__gte=today)
            )

        medicines_qs = base_qs.filter(name__icontains=medicine_name).select_related('pharmacy')

        results = []
        seen_pharmacies = set()

        for med in medicines_qs:
            pharmacy = getattr(med, 'pharmacy', None)
            pharmacy_id = pharmacy.id if pharmacy else None
            if pharmacy_id in seen_pharmacies:
                continue

            if pharmacy:
                results.append({
                    "medicine_name": med.name,
                    "pharmacy_name": pharmacy.name,
                    "pharmacy_address": pharmacy.address,
                    "pharmacy_phone": pharmacy.phone or "N/A",
                    "quantity": med.stock_quantity,
                    "price": float(med.unit_price),
                    "latitude": pharmacy.latitude,
                    "longitude": pharmacy.longitude,
                })
                seen_pharmacies.add(pharmacy_id)
            else:
                # fallback: try to resolve user info if pharmacy relation missing
                try:
                    user = User.objects.get(id=getattr(med, 'user_id', None))
                    results.append({
                        "medicine_name": med.name,
                        "pharmacy_name": f"{user.username}'s Pharmacy",
                        "pharmacy_address": "Address not set",
                        "pharmacy_phone": "N/A",
                        "quantity": med.stock_quantity,
                        "price": float(med.unit_price),
                        "latitude": 0.0,
                        "longitude": 0.0,
                    })
                    seen_pharmacies.add(user.id)
                except:
                    # skip if no pharmacy/user info
                    continue

        if not results:
            return Response({
                "message": "No pharmacies found with this medicine",
                "results": []
            })

        return Response(results)

class NearbyPharmaciesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            lat = float(request.query_params.get('latitude', 0))
            lng = float(request.query_params.get('longitude', 0))
            radius = float(request.query_params.get('radius', 10))  # km
        except ValueError:
            return Response({"error": "Invalid coordinates"}, status=400)
        
        if lat == 0 and lng == 0:
            return Response({"error": "Valid location required"}, status=400)
        
        pharmacies = Pharmacy.objects.all()
        
        today = timezone.localdate()
        nearby = []
        for pharmacy in pharmacies:
            # Skip pharmacies without coordinates
            if pharmacy.latitude is None or pharmacy.longitude is None:
                continue

            # Only include pharmacies that have at least one in-stock, non-expired medicine
            has_available = Medicine.objects.filter(
                pharmacy=pharmacy,
                stock_quantity__gt=0
            ).filter(
                Q(expiry_date__isnull=True) | Q(expiry_date__gte=today)
            ).exists()

            if not has_available:
                # behave like patient UI: don't show pharmacies with only out-of-stock or expired items
                continue

            distance = self.calculate_distance(lat, lng, pharmacy.latitude, pharmacy.longitude)
            if distance <= radius:
                # optionally include a count of available medicines for display
                available_count = Medicine.objects.filter(
                    pharmacy=pharmacy,
                    stock_quantity__gt=0
                ).filter(
                    Q(expiry_date__isnull=True) | Q(expiry_date__gte=today)
                ).count()

                nearby.append({
                    "id": pharmacy.id,
                    "name": pharmacy.name,
                    "address": pharmacy.address,
                    "phone": pharmacy.phone or "N/A",
                    "latitude": pharmacy.latitude,
                    "longitude": pharmacy.longitude,
                    "distance": round(distance, 2),
                    "available_medicines": available_count,
                })
        
        # Sort by distance (nearest first)
        nearby.sort(key=lambda x: x['distance'])
        
        if not nearby:
            return Response({
                "message": f"No pharmacies found within {radius}km",
                "results": []
            })
        
        return Response(nearby)
    
    def calculate_distance(self, lat1, lon1, lat2, lon2):
        """Calculate distance between two coordinates in km using Haversine formula"""
        R = 6371  
        
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        
        a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * \
            math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        
        return R * c

def _exclude_expired_medicines(qs):
    """
    Helper for Django ORM querysets: exclude expiry_date in the past.
    """
    today = timezone.localdate()
    return qs.filter(Q(expiry_date__isnull=True) | Q(expiry_date__gte=today))