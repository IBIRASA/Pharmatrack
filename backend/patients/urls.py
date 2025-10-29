from django.urls import path
from .views import SearchMedicineView, NearbyPharmaciesView

urlpatterns = [
    path('search-medicine/', SearchMedicineView.as_view()),
    path('nearby-pharmacies/', NearbyPharmaciesView.as_view()),
]