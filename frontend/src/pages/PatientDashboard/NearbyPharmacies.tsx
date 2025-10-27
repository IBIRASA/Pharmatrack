import { useState } from 'react';
import { MapPin, Navigation, Loader, Phone, Clock, AlertCircle } from 'lucide-react';

interface Pharmacy {
  id: number;
  name: string;
  lat: number;
  lon: number;
  address?: string;
  phone?: string;
  opening_hours?: string;
  distance?: number;
}

export default function NearbyPharmacies() {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [error, setError] = useState<string>('');

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getCurrentLocation = () => {
    setLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser. Please use a modern browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lon: longitude });
        await fetchNearbyPharmacies(latitude, longitude);
      },
      (err) => {
        console.error('Location error:', err);
        setError('Unable to access your location. Please enable location services in your browser settings.');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const fetchNearbyPharmacies = async (lat: number, lon: number) => {
    try {
      const radius = 5000; // 5km
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="pharmacy"](around:${radius},${lat},${lon});
          way["amenity"="pharmacy"](around:${radius},${lat},${lon});
        );
        out body;
        >;
        out skel qt;
      `;

      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query,
      });

      if (!response.ok) throw new Error('Failed to fetch pharmacies');

      const data = await response.json();
      const pharmacyList = data.elements
        .filter((el: any) => el.type === 'node' && el.tags?.name)
        .map((el: any) => {
          const distance = calculateDistance(lat, lon, el.lat, el.lon);
          return {
            id: el.id,
            name: el.tags.name,
            lat: el.lat,
            lon: el.lon,
            address: el.tags['addr:street']
              ? `${el.tags['addr:street']} ${el.tags['addr:housenumber'] || ''}, ${el.tags['addr:city'] || ''}`
              : undefined,
            phone: el.tags.phone,
            opening_hours: el.tags.opening_hours,
            distance,
          };
        })
        .sort((a: Pharmacy, b: Pharmacy) => (a.distance || 0) - (b.distance || 0));

      setPharmacies(pharmacyList);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load nearby pharmacies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openInGoogleMaps = (lat: number, lon: number) => {
    if (userLocation) {
      const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lon}/${lat},${lon}`;
      window.open(url, '_blank');
    } else {
      const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
        <div className="bg-linear-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white shadow-lg">
        <h2 className="text-3xl font-bold mb-2">Find Nearby Pharmacies</h2>
        <p className="text-blue-50">Discover pharmacies near your current location with directions</p>
      </div>

      {/* Get Location Button */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <button
          onClick={getCurrentLocation}
          disabled={loading}
          className="w-full bg-linear-to-r  from-green-600 to-blue-600  text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl"
        >
          {loading ? (
            <>
              <Loader className="w-6 h-6 animate-spin" />
              Finding pharmacies near you...
            </>
          ) : (
            <>
              <MapPin className="w-6 h-6" />
              Find Nearby Pharmacies
            </>
          )}
        </button>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-semibold mb-1">Location Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {userLocation && !error && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl text-center">
            <p className="text-green-800 font-semibold mb-1"> Location Detected</p>
            <p className="text-green-700 text-sm">
              Latitude: {userLocation.lat.toFixed(6)}, Longitude: {userLocation.lon.toFixed(6)}
            </p>
          </div>
        )}
      </div>

      {/* Pharmacies List */}
      {pharmacies.length > 0 && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-500">
              <MapPin className="w-5 h-5" />
              <span className="font-semibold">
                Found {pharmacies.length} pharmacies within 5km of your location
              </span>
            </div>
          </div>

          <div className="grid gap-4">
            {pharmacies.map((pharmacy, index) => (
              <div
                key={pharmacy.id}
                className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-xl transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-linear-to-br from-blue-100 to-purple-100 text-green-700 w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl shrink-0 shadow-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{pharmacy.name}</h3>

                    {pharmacy.distance && (
                      <p className="text-sm font-semibold text-green-600 mb-2">
                         {pharmacy.distance.toFixed(2)} km away
                      </p>
                    )}

                    {pharmacy.address && (
                      <p className="text-sm text-gray-600 mb-2 flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" />
                        {pharmacy.address}
                      </p>
                    )}

                    {pharmacy.phone && (
                      <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <a href={`tel:${pharmacy.phone}`} className="hover:text-green-600 font-medium">
                          {pharmacy.phone}
                        </a>
                      </p>
                    )}

                    {pharmacy.opening_hours && (
                      <p className="text-sm text-gray-600 mb-4 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {pharmacy.opening_hours}
                      </p>
                    )}

                    <button
                      onClick={() => openInGoogleMaps(pharmacy.lat, pharmacy.lon)}
                      className="bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 font-semibold flex items-center gap-2 text-sm shadow-md transition-all"
                    >
                      <Navigation className="w-4 h-4" />
                      Get Directions
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}