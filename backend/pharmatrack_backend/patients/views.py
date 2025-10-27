from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from inventory.models import Medicine
from .models import Pharmacy
from django.contrib.auth.models import User
import math

class SearchMedicineView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        medicine_name = request.query_params.get('name', '').strip()
        if not medicine_name:
            return Response({"error": "Medicine name required"}, status=400)
        
        # Find all medicines that match the search (case-insensitive, partial match)
        medicines = Medicine.objects(name__icontains=medicine_name, quantity__gt=0)
        
        results = []
        seen_pharmacies = set()  # Avoid duplicate pharmacies
        
        for med in medicines:
            # Skip if we already added this pharmacy
            if med.user_id in seen_pharmacies:
                continue
            
            try:
                # Get pharmacy details
                pharmacy = Pharmacy.objects.get(user_id=med.user_id)
                
                results.append({
                    "medicine_name": med.name,
                    "pharmacy_name": pharmacy.name,
                    "pharmacy_address": pharmacy.address,
                    "pharmacy_phone": pharmacy.phone or "N/A",
                    "quantity": med.quantity,
                    "price": med.price,
                    "latitude": pharmacy.latitude,
                    "longitude": pharmacy.longitude,
                })
                
                seen_pharmacies.add(med.user_id)
                
            except Pharmacy.DoesNotExist:
                # If pharmacy doesn't exist, try to get user info
                try:
                    user = User.objects.get(id=med.user_id)
                    results.append({
                        "medicine_name": med.name,
                        "pharmacy_name": f"{user.username}'s Pharmacy",
                        "pharmacy_address": "Address not set",
                        "pharmacy_phone": "N/A",
                        "quantity": med.quantity,
                        "price": med.price,
                        "latitude": 0.0,
                        "longitude": 0.0,
                    })
                    seen_pharmacies.add(med.user_id)
                except:
                    pass
        
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
        
        nearby = []
        for pharmacy in pharmacies:
            distance = self.calculate_distance(lat, lng, pharmacy.latitude, pharmacy.longitude)
            if distance <= radius:
                nearby.append({
                    "name": pharmacy.name,
                    "address": pharmacy.address,
                    "phone": pharmacy.phone or "N/A",
                    "latitude": pharmacy.latitude,
                    "longitude": pharmacy.longitude,
                    "distance": round(distance, 2),
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
        R = 6371  # Earth radius in km
        
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        
        a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * \
            math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        
        return R * c