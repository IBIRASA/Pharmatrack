import{ useState, useEffect } from 'react';
import { Loader, AlertCircle, MapPin, Navigation, ExternalLink, Clock } from 'lucide-react';

interface PharmacyItem {
  opening_hours: any;
  id: string;
  name: string;
  lat: number;
  lon: number;
  address: string;
  phone: string;
  distance: number;
  place_id?: string;
  rating?: number;
  open_now?: boolean;
}

export default function NearbyPharmacies() {
  const [pharmacies, setPharmacies] = useState<PharmacyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [searchRadius, setSearchRadius] = useState<number>(5); // Default 5km radius

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  };

  // Get user's approximate address for better context
  const getUserAddress = async (lat: number, lon: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=16`
      );
      const data = await response.json();
      return data.display_name || 'Your location';
    } catch (error) {
      return 'Your location';
    }
  };

  // Smart pharmacy search - focuses on truly nearby pharmacies
  const findNearbyPharmacies = async (lat: number, lon: number, radius: number = 5) => {
    setLoading(true);
    setError('');
    setPharmacies([]);
    
    console.log(' User location:', lat, lon, 'Search radius:', radius, 'km');
    
    try {
      let foundPharmacies: PharmacyItem[] = [];

      // Method 1: Try OpenStreetMap (free, no API key needed)
      try {
        foundPharmacies = await fetchFromOpenStreetMap(lat, lon, radius);
        console.log('Found pharmacies from OSM:', foundPharmacies.length);
      } catch (osmError) {
        console.log('OSM search failed:', osmError);
      }
      if (foundPharmacies.length < 3) {
        try {
          const broaderResults = await fetchFromOpenStreetMap(lat, lon, radius * 2);
          // Filter to only include very close pharmacies from broader search
          const closePharmacies = broaderResults.filter(pharmacy => pharmacy.distance <= radius);
          foundPharmacies = [...foundPharmacies, ...closePharmacies];
          console.log('Added close pharmacies from broader search:', closePharmacies.length);
        } catch (error) {
          console.log('Broader search failed');
        }
      }

      // Remove duplicates and sort by distance
      const uniquePharmacies = foundPharmacies.filter((pharmacy, index, self) =>
        index === self.findIndex(p => p.id === pharmacy.id)
      );
      
      uniquePharmacies.sort((a, b) => a.distance - b.distance);
      
      // Limit to closest 10 pharmacies maximum
      const finalPharmacies = uniquePharmacies.slice(0, 10);
      setPharmacies(finalPharmacies);

      if (finalPharmacies.length === 0) {
        setError(`No pharmacies found within ${radius}km of your location. Try increasing the search radius.`);
      } else {
        console.log('Final pharmacies found:', finalPharmacies.length);
      }

    } catch (err: any) {
      console.error(' Error finding nearby pharmacies:', err);
      setError('Failed to load nearby pharmacies. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };
  const fetchFromOpenStreetMap = async (lat: number, lon: number, radius: number): Promise<PharmacyItem[]> => {
    try {
      // Convert km to meters for OSM query (1000 meters = 1km)
      const radiusMeters = radius * 1000;
      const query = `
        [out:json];
        (
          node[amenity=pharmacy](around:${radiusMeters},${lat},${lon});
          way[amenity=pharmacy](around:${radiusMeters},${lat},${lon});
          relation[amenity=pharmacy](around:${radiusMeters},${lat},${lon});
        );
        out center;
      `;
      
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query
      });
      
      if (!response.ok) {
        throw new Error(`OSM API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      const pharmaciesList: PharmacyItem[] = data.elements.map((element: any) => {
        let elementLat, elementLon;
        if (element.type === 'node') {
          elementLat = element.lat;
          elementLon = element.lon;
        } else if (element.center) {
          elementLat = element.center.lat;
          elementLon = element.center.lon;
        } else {
          elementLat = lat; 
          elementLon = lon;
        }

        const distance = calculateDistance(lat, lon, elementLat, elementLon);
        
        return {
          id: `osm-${element.id}`,
          name: element.tags?.name || 'Local Pharmacy',
          lat: elementLat,
          lon: elementLon,
          address: element.tags?.['addr:street'] ? 
            `${element.tags['addr:street']}${element.tags['addr:housenumber'] ? ` ${element.tags['addr:housenumber']}` : ''}, ${element.tags['addr:city'] || element.tags['addr:suburb'] || ''}`.trim().replace(/,$/, '') : 
            (element.tags?.['addr:full'] || 'Address not available'),
          phone: element.tags?.['phone'] || element.tags?.['contact:phone'] || 'Phone not available',
          distance: distance,
          opening_hours: element.tags?.['opening_hours']
        };
      }).filter((pharmacy: PharmacyItem) => pharmacy.distance <= radius); 

      return pharmaciesList;
    } catch (error) {
      console.error('OSM API error:', error);
      throw error;
    }
  };

  // Get directions function
  const getDirections = (pharmacy: PharmacyItem) => {
    if (userLocation) {
      const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lon}/${pharmacy.lat},${pharmacy.lon}`;
      window.open(url, '_blank');
    } else {
      const url = `https://www.google.com/maps/search/?api=1&query=${pharmacy.lat},${pharmacy.lon}&query_place_id=${pharmacy.name}`;
      window.open(url, '_blank');
    }
  };

  // View on Google Maps
  const viewOnGoogleMaps = (pharmacy: PharmacyItem) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${pharmacy.lat},${pharmacy.lon}&query_place_id=${pharmacy.name}`;
    window.open(url, '_blank');
  };

  // Automatically get location when component mounts
  useEffect(() => {
    if (!navigator.geolocation) { 
      setError('Geolocation not supported by your browser. Please enable location services or use a different browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const location = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude
        };
        setUserLocation(location);
        const userAddress = await getUserAddress(location.lat, location.lon);
        console.log(' User address:', userAddress);
        // Start searching for nearby pharmacies
        findNearbyPharmacies(location.lat, location.lon, searchRadius);
      },
      (err) => {
        console.error('Location error:', err);
        let errorMessage = 'Location access denied. ';
        
        if (err.code === err.PERMISSION_DENIED) {
          errorMessage += 'Please allow location access in your browser settings to find nearby pharmacies.';
        } else if (err.code === err.TIMEOUT) {
          errorMessage += 'Location request timed out. Please check your connection and try again.';
        } else {
          errorMessage += 'Please enable location services to find nearby pharmacies.';
        }
        
        setError(errorMessage);
        setLoading(false);
      },
      { 
        timeout: 15000,
        enableHighAccuracy: true,
        maximumAge: 60000 // 1 minute
      }
    );
  }, [searchRadius]);

  const handleRetry = () => {
    if (userLocation) {
      findNearbyPharmacies(userLocation.lat, userLocation.lon, searchRadius);
    } else {
      window.location.reload();
    }
  };

  const handleRadiusChange = (newRadius: number) => {
    setSearchRadius(newRadius);
    if (userLocation) {
      findNearbyPharmacies(userLocation.lat, userLocation.lon, newRadius);
    }
  };
  const getDistanceColor = (distance: number) => {
    if (distance <= 1) return 'text-green-600 bg-green-100';
    if (distance <= 3) return 'text-blue-600 bg-blue-100';
    if (distance <= 5) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  // Get distance text
  const getDistanceText = (distance: number) => {
    if (distance < 1) return `${(distance * 1000).toFixed(0)}m`;
    return `${distance.toFixed(1)}km`;
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <MapPin className="text-blue-600" size={28} />
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-800">Nearby Pharmacies</h2>
          <p className="text-gray-600 text-sm">
            {userLocation 
              ? `Pharmacies within ${searchRadius}km of your current location`
              : 'Finding your location...'
            }
          </p>
        </div>
        
        {/* Radius Selector */}
        <div className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2">
          <span className="text-sm text-gray-600 whitespace-nowrap">Search radius:</span>
          <select 
            value={searchRadius}
            onChange={(e) => handleRadiusChange(Number(e.target.value))}
            className="border-none text-sm focus:ring-0 focus:outline-none bg-transparent"
            disabled={loading}
          >
            <option value={2}>2km</option>
            <option value={5}>5km</option>
            <option value={10}>10km</option>
            <option value={15}>15km</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center gap-3 text-blue-600 py-12">
          <Loader className="animate-spin" size={32} /> 
          <span className="text-lg">Searching for nearby pharmacies...</span>
          <span className="text-sm text-gray-500">
            Looking within {searchRadius}km radius
          </span>
        </div>
      )}
      
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-red-700 mb-2">
            <AlertCircle size={18} /> 
            <span className="font-medium">Unable to find pharmacies</span>
          </div>
          <p className="text-red-600 text-sm mb-3">{error}</p>
          <div className="flex gap-2 flex-wrap">
            <button 
              onClick={handleRetry}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              Try Again
            </button>
            <button 
              onClick={() => handleRadiusChange(searchRadius + 5)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              Increase Search Radius
            </button>
            <button 
              onClick={() => window.open('https://www.google.com/maps/search/pharmacy/', '_blank')}
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              <ExternalLink size={14} />
              Search Google Maps
            </button>
          </div>
        </div>
      )}

      {!loading && pharmacies.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Found {pharmacies.length} pharmacy{pharmacies.length !== 1 ? 's' : ''} nearby
            </div>
            <div className="text-xs text-gray-500">
              Sorted by distance • Updated just now
            </div>
          </div>
          
          {pharmacies.map((pharmacy, index) => (
            <div key={pharmacy.id} className="border border-gray-200 rounded-lg hover:shadow-md transition-all bg-white p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <div className="font-bold text-lg text-gray-800">{pharmacy.name}</div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getDistanceColor(pharmacy.distance)}`}>
                      {getDistanceText(pharmacy.distance)}
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-start gap-2">
                      <MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      <span>{pharmacy.address}</span>
                    </div>
                    
                    {pharmacy.phone !== 'Phone not available' && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Phone:</span>
                        <a 
                          href={`tel:${pharmacy.phone}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {pharmacy.phone}
                        </a>
                      </div>
                    )}
                    
                    {pharmacy.opening_hours && (
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-gray-400 flex-shrink-0" />
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {pharmacy.opening_hours}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => getDirections(pharmacy)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors whitespace-nowrap"
                  >
                    <Navigation size={16} />
                    Directions
                  </button>
                  <button
                    onClick={() => viewOnGoogleMaps(pharmacy)}
                    className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors whitespace-nowrap"
                  >
                    <ExternalLink size={16} />
                    View Map
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && pharmacies.length === 0 && !error && (
        <div className="text-center py-12 text-gray-500">
          <MapPin size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-lg mb-2">No pharmacies found nearby</p>
          <p className="text-sm mb-4">Try increasing the search radius or check Google Maps directly</p>
          <div className="flex gap-2 justify-center">
            <button 
              onClick={() => handleRadiusChange(searchRadius + 5)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium transition-colors"
            >
              Increase Radius to {searchRadius + 5}km
            </button>
            <button 
              onClick={() => window.open('https://www.google.com/maps/search/pharmacy/', '_blank')}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition-colors"
            >
              <ExternalLink size={16} />
              Search Google Maps
            </button>
          </div>
        </div>
      )}
    </div>
  );
}