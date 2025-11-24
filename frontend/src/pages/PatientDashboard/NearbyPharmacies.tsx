import{ useState, useEffect } from 'react';
import { Loader, AlertCircle, MapPin, Navigation, Clock } from 'lucide-react';
import { useTranslation } from '../../i18n';

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
  const { t } = useTranslation();
  const [pharmacies, setPharmacies] = useState<PharmacyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [searchRadius, setSearchRadius] = useState<number>(5); // Default 5km radius

  const requestAndFindNearby = () => {
    setError('');
    setLoading(true);
    if (!navigator.geolocation) {
      setError(t('patient.nearby.geolocation_unsupported'));
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        console.debug('Geolocation obtained', { lat: loc.lat, lon: loc.lon, accuracy: pos.coords.accuracy });
        setUserLocation(loc);

        if (typeof pos.coords.accuracy === 'number' && pos.coords.accuracy > 5000) {
          console.warn('Location accuracy is low (>5km). Browser may be using coarse/IP location or a VPN. Allow high-accuracy GPS or disable VPN for better results.');
        }
   
        findNearbyPharmacies(loc.lat, loc.lon, searchRadius);
      },
      (err) => {
        console.error('Location error:', err);
        if (err.code === err.PERMISSION_DENIED) {
          setError(t('patient.nearby.permission_denied'));
        } else if (err.code === err.TIMEOUT) {
          setError(t('patient.nearby.request_timeout'));
        } else {
          setError(t('patient.nearby.enable_services'));
        }
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  
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
    return distance; 
  };

  const findNearbyPharmacies = async (lat: number, lon: number, radius: number = 5) => {
    setLoading(true);
    setError('');
    setPharmacies([]);
    
    
    try {
      let foundPharmacies: PharmacyItem[] = [];

      try {
        foundPharmacies = await fetchFromOpenStreetMap(lat, lon, radius);
      } catch (osmError) {

      }
      if (foundPharmacies.length < 3) {
        try {
          const broaderResults = await fetchFromOpenStreetMap(lat, lon, radius * 2);
         
          const closePharmacies = broaderResults.filter(pharmacy => pharmacy.distance <= radius);
          foundPharmacies = [...foundPharmacies, ...closePharmacies];
          
        } catch (error) {
       
        }
      }

  
      const uniquePharmacies = foundPharmacies.filter((pharmacy, index, self) =>
        index === self.findIndex(p => p.id === pharmacy.id)
      );
      
      uniquePharmacies.sort((a, b) => a.distance - b.distance);
      
    
      const recomputed = uniquePharmacies.map((p) => ({
        ...p,
        distance: calculateDistance(lat, lon, p.lat, p.lon),
      }));
      
     
      const withinRadius = recomputed.filter((p) => typeof p.distance === 'number' && p.distance <= Number(radius));
      
      if (withinRadius.length !== recomputed.length) {
        const removed = recomputed.filter(p => p.distance > Number(radius)).map(p => ({ id: p.id, name: p.name, distance: p.distance }));
        console.debug('NearbyPharmacies: removed items outside radius', { requestedRadiusKm: radius, removedCount: removed.length, removed });
      }
      
  
      const finalPharmacies = withinRadius.slice(0, 10);
      setPharmacies(finalPharmacies);

      if (finalPharmacies.length === 0) {
        setError(t('patient.nearby.no_within').replace('{km}', String(radius)));
      } else {

      }

    } catch (err: any) {
      console.error(' Error finding nearby pharmacies:', err);
      setError(t('modals.nearby.failed'));
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
      
     
      const pharmaciesList: PharmacyItem[] = data.elements.reduce((acc: PharmacyItem[], element: any) => {
        let elementLat: number | null = null;
        let elementLon: number | null = null;
        if (element.type === 'node' && typeof element.lat === 'number' && typeof element.lon === 'number') {
          elementLat = element.lat;
          elementLon = element.lon;
        } else if (element.center && typeof element.center.lat === 'number' && typeof element.center.lon === 'number') {
          elementLat = element.center.lat;
          elementLon = element.center.lon;
        }

      
        if (elementLat === null || elementLon === null) return acc;

        const distance = calculateDistance(lat, lon, elementLat, elementLon);

    
        if (distance <= radius) {
          acc.push({
            id: `osm-${element.id}`,
            name: element.tags?.name || 'Local Pharmacy',
            lat: elementLat,
            lon: elementLon,
            address: element.tags?.['addr:street'] ? 
              `${element.tags['addr:street']}${element.tags['addr:housenumber'] ? ` ${element.tags['addr:housenumber']}` : ''}, ${element.tags['addr:city'] || element.tags['addr:suburb'] || ''}`.trim().replace(/,$/, '') : 
              (element.tags?.['addr:full'] || 'Address not available'),
            phone: element.tags?.['phone'] || element.tags?.['contact:phone'] || 'Phone not available',
            distance,
            opening_hours: element.tags?.['opening_hours']
          });
        }

        return acc;
      }, []);

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
  // (view on map removed — keep only directions)

  // Automatically get location when component mounts and whenever radius changes
  useEffect(() => {
    // always request fresh position and search when component mounts or radius changes
    requestAndFindNearby();
  }, [searchRadius]);

  const handleRetry = () => {
    // re-request device location and rerun search
    requestAndFindNearby();
  };

  const handleRadiusChange = (newRadius: number) => {
    setSearchRadius(newRadius);
    // effect will trigger requestAndFindNearby because searchRadius is in dependency
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
      {/* quick manual location refresh */}
      <div className="mb-4 flex justify-end">
        <button onClick={requestAndFindNearby} className="text-sm px-3 py-1 bg-white border rounded shadow-sm">
          {t('patient.nearby.use_my_location') || 'Use my location'}
        </button>
      </div>
      <div className="flex items-center gap-3 mb-6">
        <MapPin className="text-green-600" size={28} />
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-800">{t('modals.nearby.title')}</h2>
          <p className="text-gray-600 text-sm">
            {userLocation
              ? t('patient.nearby.within').replace('{km}', String(searchRadius))
              : t('patient.nearby.finding_location')
            }
          </p>
        </div>
        
        {/* Radius Selector */}
        {/* <div className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2">
          <span className="text-sm text-gray-600 whitespace-nowrap">{t('patient.nearby.radius_label')}</span>
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
        </div> */}
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center gap-3 text-blue-600 py-12">
          <Loader className="animate-spin" size={32} /> 
          <span className="text-lg">{t('patient.nearby.searching')}</span>
          <span className="text-sm text-gray-500">
            {t('patient.nearby.looking_within').replace('{km}', String(searchRadius))}
          </span>
        </div>
      )}
      
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-red-700 mb-2">
            <AlertCircle size={18} /> 
            <span className="font-medium">{t('patient.nearby.unable_title')}</span>
          </div>
          <p className="text-red-600 text-sm mb-3">{error}</p>
          <div className="flex gap-2 flex-wrap">
            <button 
              onClick={handleRetry}
              className="bg-green-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              {t('patient.nearby.try_again')}
            </button>
            <button 
              onClick={() => handleRadiusChange(searchRadius + 5)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              {t('patient.nearby.increase_radius')}
            </button>
            <button 
              onClick={() => window.open('https://www.google.com/maps/search/pharmacy/', '_blank')}
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              <MapPin size={14} />
              {t('patient.nearby.search_google_maps')}
            </button>
          </div>
        </div>
      )}

      {!loading && pharmacies.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {t('patient.nearby.found_count').replace('{count}', String(pharmacies.length))}
            </div>
            <div className="text-xs text-gray-500">
              {t('patient.nearby.sorted_updated')}
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
                      <div className="font-bold text-lg text-gray-900 dark:text-white">{pharmacy.name}</div>
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
                        <span className="font-medium">{t('patient.nearby.phone_label')}</span>
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
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors whitespace-nowrap"
                  >
                    <Navigation size={16} />
                    {t('patient.nearby.directions')}
                  </button>
                  {/* removed: view on map button - keep only directions to reduce UI clutter */}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && pharmacies.length === 0 && !error && (
        <div className="text-center py-12 text-gray-500">
          <MapPin size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-lg mb-2">{t('modals.nearby.none_found')}</p>
          <p className="text-sm mb-4">{t('patient.nearby.search_google_maps')}</p>
          <div className="flex gap-2 justify-center">
            <button 
              onClick={() => handleRadiusChange(searchRadius + 5)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium transition-colors"
            >
              {t('patient.nearby.increase_radius')} {searchRadius + 5}km
            </button>
            <button 
              onClick={() => window.open('https://www.google.com/maps/search/pharmacy/', '_blank')}
              className="flex items-center gap-2 bg-green-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition-colors"
            >
              <MapPin size={16} />
              {t('patient.nearby.search_google_maps')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}