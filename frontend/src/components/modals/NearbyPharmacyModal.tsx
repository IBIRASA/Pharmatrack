import React, { useEffect, useMemo, useState } from 'react';
import { MapPin, Phone, Clock, Loader, ExternalLink, RefreshCcw } from 'lucide-react';
import { getNearbyPharmacies } from '../../utils/api';
import type { NearbyPharmacy } from '../../utils/api';

// --- Types ---
interface NearbyPharmacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// --- Component ---
const NearbyPharmacyModal: React.FC<NearbyPharmacyModalProps> = ({ isOpen, onClose }) => {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [radius, setRadius] = useState(3000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<NearbyPharmacy[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    setError(null); 
    if (!navigator.geolocation) {
      setError('Geolocation not supported in this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => setError(err.message || 'Unable to get your location.')
    );
  }, [isOpen]);

  const loadPharmacies = async () => {
    if (!coords) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getNearbyPharmacies(coords.lat, coords.lon, radius);
      setResults(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load nearby pharmacies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && coords) loadPharmacies();
  }, [isOpen, coords, radius]);

  const sorted = useMemo(() => {
    if (!coords) return results;
    return [...results].sort(
      (a, b) =>
        haversineKm(coords.lat, coords.lon, a.lat, a.lon) -
        haversineKm(coords.lat, coords.lon, b.lat, b.lon)
    );
  }, [results, coords]);

  function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">Nearby Pharmacies</h3>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">Close</button>
        </div>

        <div className="px-6 py-4 flex items-center gap-3">
          <label className="text-sm text-gray-600">Radius:</label>
          <select
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value={1000}>1 km</option>
            <option value={3000}>3 km</option>
            <option value={5000}>5 km</option>
            <option value={10000}>10 km</option>
          </select>
          <button
            onClick={loadPharmacies}
            className="ml-auto inline-flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-gray-50 text-sm"
          >
            <RefreshCcw className="w-4 h-4" /> Refresh
          </button>
        </div>

        <div className="px-6 pb-6">
          {!coords && !error && (
            <div className="py-10 text-center text-gray-500">
              <Loader className="w-6 h-6 animate-spin mx-auto mb-3 text-green-600" />
              Getting your location...
            </div>
          )}
          {error && (
            <div className="py-6 px-4 bg-red-50 text-red-700 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}
          {coords && loading && (
            <div className="py-10 text-center text-gray-500">
              <Loader className="w-6 h-6 animate-spin mx-auto mb-3 text-green-600" />
              Searching pharmacies within {(radius / 1000).toFixed(1)} km...
            </div>
          )}
          {coords && !loading && sorted.length === 0 && !error && (
            <div className="py-10 text-center text-gray-500">
              No pharmacies found nearby.
            </div>
          )}
          {coords && !loading && sorted.length > 0 && (
            <ul className="divide-y">
              {sorted.map((p) => {
                const dist = coords ? haversineKm(coords.lat, coords.lon, p.lat, p.lon) : 0;
                const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lon}`;
                const telUrl = p.phone ? `tel:${p.phone.replace(/\s+/g, '')}` : null;
                return (
                  <li key={p.id} className="py-4 flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold text-gray-900 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-green-600" />
                        {p.name}
                        <span className="text-xs text-gray-500">({dist.toFixed(1)} km)</span>
                      </div>
                      {p.address && <div className="text-sm text-gray-600 mt-1">{p.address}</div>}
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        {p.phone && (
                          <span className="inline-flex items-center gap-1">
                            <Phone className="w-4 h-4" /> {p.phone}
                          </span>
                        )}
                        {p.opening_hours && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-4 h-4" /> {p.opening_hours}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50"
                      >
                        <ExternalLink className="w-4 h-4" /> Open in Maps
                      </a>
                      {telUrl && (
                        <a
                          href={telUrl}
                          className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50"
                        >
                          <Phone className="w-4 h-4" /> Call
                        </a>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default NearbyPharmacyModal;
