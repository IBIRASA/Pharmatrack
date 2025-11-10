import { Search, MapPin } from 'lucide-react';
import { useTranslation } from '../../i18n';

interface PatientActionCardsProps {
  onSearchMedicine: () => void;
  onFindNearby: () => void;
}

export default function PatientActionCards({ onSearchMedicine, onFindNearby }: PatientActionCardsProps) {
  const { t } = useTranslation();
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
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('patient.search.card')}</h3>
            <p className="text-gray-600 mb-4">{t('search.desc')}</p>
            <div className="flex items-center gap-2 text-green-600 font-semibold group-hover:gap-3 transition-all">
              <span>{t('search.cta')}</span>
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
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('patient.nearby.card')}</h3>
            <p className="text-gray-600 mb-4">{t('feature.2.desc')}</p>
            <div className="flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all">
              <span>{t('search.cta')}</span>
              <span>→</span>
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}
