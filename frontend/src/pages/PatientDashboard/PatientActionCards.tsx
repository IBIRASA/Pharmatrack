import { Search, MapPin } from 'lucide-react';

interface PatientActionCardsProps {
  onSearchMedicine: () => void;
  onFindNearby: () => void;
}

export default function PatientActionCards({ onSearchMedicine, onFindNearby }: PatientActionCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Search Medicine Card */}
      <button
        onClick={onSearchMedicine}
        className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-8 text-left border border-gray-200 hover:border-green-500 group"
      >
        <div className="flex items-start gap-4">
          <div className="bg-green-100 group-hover:bg-green-500 transition-colors rounded-xl p-4">
            <Search className="w-8 h-8 text-green-600 group-hover:text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Search Medicines</h3>
            <p className="text-gray-600 mb-4">
              Find medicines and see which pharmacies have them in stock
            </p>
            <div className="flex items-center gap-2 text-green-600 font-semibold group-hover:gap-3 transition-all">
              <span>Start Searching</span>
              <span>→</span>
            </div>
          </div>
        </div>
      </button>

      {/* Find Nearby Card */}
      <button
        onClick={onFindNearby}
        className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-8 text-left border border-gray-200 hover:border-blue-500 group"
      >
        <div className="flex items-start gap-4">
          <div className="bg-blue-100 group-hover:bg-blue-500 transition-colors rounded-xl p-4">
            <MapPin className="w-8 h-8 text-blue-600 group-hover:text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Nearby Pharmacies</h3>
            <p className="text-gray-600 mb-4">
              Discover pharmacies near your location with directions
            </p>
            <div className="flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all">
              <span>Find Nearby</span>
              <span>→</span>
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}
