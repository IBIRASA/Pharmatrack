import React, { useState } from 'react';
import { Search, Navigation, Mail, Package, DollarSign, Loader, AlertCircle } from 'lucide-react';
import { getMedicines, type Medicine as APIMedicine, getCurrentUser } from '../../utils/api';
import { showInfo } from '../../utils/notifications';
import CreateOrderModal from '../../components/modals/CreateOrderModal';
import PatientOrdersModal from '../../components/modals/PatientOrdersModal';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n';
import ContactPharmacyModal from '../../components/modals/ContactPharmacyModal'; // <-- added

interface Medicine extends APIMedicine {
  pharmacy_name: string;
  pharmacy_email: string;
  pharmacy_id: number;
}

interface GroupedPharmacy {
  pharmacy_name: string;
  pharmacy_email: string;
  pharmacy_phone?: string | null;
  pharmacy_address?: string | null;
  medicines: Medicine[];
}

export default function MedicineSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Medicine[]>([]);
  const [orderOpen, setOrderOpen] = useState(false);
  const [selectedMedForOrder, setSelectedMedForOrder] = useState<Medicine | null>(null);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string>('');

  // contact modal state
  const [contactModalOpen, setContactModalOpen] = useState(false);
  // use a permissive type so modal prop shape mismatches don't raise TS errors
  const [contactPharmacy, setContactPharmacy] = useState<any | null>(null);

  function openContactModalFor(ph: { name?: string; email?: string | null; phone?: string | null; address?: string | null }) {
    if (!ph) return;
    setContactPharmacy(ph);
    setContactModalOpen(true);
  }

  function closeContactModal() {
    setContactModalOpen(false);
    setContactPharmacy(null);
  }

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!searchQuery.trim()) {
      setError('Please enter a medicine name');
      return;
    }

    setLoading(true);
    setSearched(true);
    setError('');

    // Try getting user's location first (non-blocking fallback to search without location)
    const doSearch = async (latitude?: number, longitude?: number) => {
      try {
        const params: any = { search: searchQuery };
        if (latitude != null && longitude != null) {
          params.latitude = latitude;
          params.longitude = longitude;
        }
        const data = await getMedicines(params) as Medicine[];
        console.log('Search results:', data);
        setResults(data);
      } catch (err: any) {
        console.error('Search error:', err);
        setError('Failed to search medicines. Please try again.');
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    if (navigator.geolocation) {
      let resolved = false;
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolved = true;
          doSearch(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          if (!resolved) doSearch();
        },
        { timeout: 5000 }
      );
      // If geolocation hangs, fallback after timeout
      setTimeout(() => {
        if (!resolved) doSearch();
      }, 6000);
    } else {
      await doSearch();
    }
  };

  const groupedByPharmacy = results.reduce((acc, medicine) => {
    const pharmacyId = medicine.pharmacy_id;

    // robust phone/address detection from API shapes
    const phone =
      (medicine as any).pharmacy_phone ||
      (medicine as any).pharmacy?.phone ||
      (medicine as any).pharmacy_phone_number ||
      (medicine as any).phone ||
      null;

    const address =
      (medicine as any).pharmacy_address ||
      (medicine as any).pharmacy?.address ||
      (medicine as any).address ||
      null;

    if (!acc[pharmacyId]) {
      acc[pharmacyId] = {
        pharmacy_name: medicine.pharmacy_name,
        pharmacy_email: medicine.pharmacy_email,
        pharmacy_phone: phone,
        pharmacy_address: address,
        medicines: [],
      };
    } else {
      // prefer first non-null phone/address we encounter
      if (!acc[pharmacyId].pharmacy_phone && phone) acc[pharmacyId].pharmacy_phone = phone;
      if (!acc[pharmacyId].pharmacy_address && address) acc[pharmacyId].pharmacy_address = address;
    }

    acc[pharmacyId].medicines.push(medicine);
    return acc;
  }, {} as { [key: number]: GroupedPharmacy });

  const getDirections = (pharmacyName: string) => {
    const query = encodeURIComponent(`${pharmacyName} pharmacy`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const { t } = useTranslation();

  // Robust check for patient user: prefer context, fall back to localStorage parsing
  const [authUserLocal, setAuthUserLocal] = React.useState<any | null>(null);

  // fetch authoritative user from server when token exists
  React.useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return;
    let mounted = true;
    (async () => {
      try {
        const u = await getCurrentUser();
        if (mounted) setAuthUserLocal(u);
      } catch (err) {
        // ignore; leave authUserLocal null
        console.debug('getCurrentUser failed', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Debug logging to help surface auth detection problems
  React.useEffect(() => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      console.debug('MedicineSearch auth debug', { tokenPresent: !!token, authUserLocal, contextUser: user });
    } catch (e) {
      console.debug('MedicineSearch debug error', e);
    }
  }, [authUserLocal, user]);

  // Listen for global request to open the My Orders modal (dispatched from header)
  React.useEffect(() => {
    const onOpenOrders = () => setOrdersOpen(true);
    window.addEventListener('pharmatrack:openOrders', onOpenOrders as EventListener);
    return () => window.removeEventListener('pharmatrack:openOrders', onOpenOrders as EventListener);
  }, []);

  const isPatientUser = () => {
    try {
      // Prefer server-verified user
      if (authUserLocal && (authUserLocal.user_type === 'patient' || authUserLocal.userType === 'patient')) return true;
      if (user && (user.user_type === 'patient' || (user as any).userType === 'patient')) return true;
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        // support multiple storage shapes: user, auth.user, nested
        const candidate = parsed?.user ?? parsed;
        if (candidate && (candidate.user_type === 'patient' || candidate.userType === 'patient')) return true;
      }
      // fallback: token presence allows optimistic button (server will validate on submit)
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) return true;
    } catch (e) {
      // ignore parse errors
    }
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white shadow-sm relative">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">{t('medicine_search.title')}</h2>
            <p className="text-green-50">{t('medicine_search.subtitle')}</p>
          </div>
          <div>
            {user?.user_type === 'patient' && (
              <button onClick={() => setOrdersOpen(true)} className="bg-white text-green-700 px-4 py-2 rounded-lg font-semibold">
                My Orders
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl  border border-gray-200 p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-3 ">
            <div className="flex-1 relative ">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('medicine_search.placeholder')}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setError('');
                }}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-400 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-lg"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white px-8 py-4 rounded-xl hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold flex items-center gap-2 transition-all shadow-sm hover:shadow-xl"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  {t('medicine_search.searching')}
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  {t('medicine_search.search_button')}
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}
        </form>
      </div>

      {/* Results Section */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader className="w-12 h-12 animate-spin text-green-600 mb-4" />
          <p className="text-gray-600 font-medium">{t('medicine_search.searching')}</p>
        </div>
      ) : searched && results.length === 0 ? (
        <div className="bg-white rounded-xl  border border-gray-200 p-12 text-center">
          <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{t('medicine_search.no_results_title')}</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            {t('medicine_search.no_results_desc').replace('{query}', searchQuery)}
          </p>
        </div>
      ) : searched && results.length > 0 ? (
        <div className="space-y-6">
          {/* Results Summary */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-green-800">
              <Package className="w-5 h-5" />
              <span className="font-semibold">
                {t('medicine_search.found_summary').replace('{count}', String(results.length)).replace('{pharmacies}', String(Object.keys(groupedByPharmacy).length))}
              </span>
            </div>
          </div>

          {/* Pharmacy Cards */}
          {Object.entries(groupedByPharmacy).map(([pharmacyId, data]) => (
            <div key={pharmacyId} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
              {/* Pharmacy Header */}
              <div className="bg-linear-to-r from-green-500 to-blue-500 p-6 text-white">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="bg-white text-green-600 w-14 h-14 rounded-xl flex items-center justify-center font-bold text-2xl flex-shrink-0">
                      {data.pharmacy_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-2xl font-bold mb-2">{data.pharmacy_name}</h3>
                      <div className="flex items-center gap-2 text-green-50 mb-4">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm">{data.pharmacy_email}</span>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => openContactModalFor({
                            name: data.pharmacy_name,
                            email: data.pharmacy_email || null,
                            phone: (data as any).pharmacy_phone ?? null,
                            address: (data as any).pharmacy_address ?? null,
                          })}
                          className="bg-green-700 text-white px-5 py-2.5 rounded-lg hover:bg-green-800 font-semibold flex items-center gap-2 text-sm transition-all"
                          title={`Contact ${data.pharmacy_name}`}
                        >
                          <Mail className="w-4 h-4" />
                          Contact Pharmacy
                        </button>

                        <button
                          onClick={() => getDirections(data.pharmacy_name)}
                          className="bg-white text-green-600 px-5 py-2.5 rounded-lg hover:bg-green-50 font-semibold flex items-center gap-2 text-sm transition-all"
                        >
                          <Navigation className="w-4 h-4" />
                          {t('medicine_search.get_directions')}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white text-green-600 px-4 py-2 rounded-full font-bold text-sm  flex-shrink-0">
                    {data.medicines.length} Available
                  </div>
                </div>
              </div>

              {/* Medicines List */}
              <div className="divide-y divide-gray-100">
                {data.medicines.map((medicine) => (
                  <div
                    key={medicine.id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="bg-linear-to-br from-green-100 to-blue-100 text-green-700 w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Package className="w-8 h-8" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="text-xl font-bold text-gray-900">{medicine.name}</h4>
                            <p className="text-gray-600 mt-1">{medicine.dosage}</p>
                          </div>
                          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                            {medicine.category}
                          </span>
                        </div>
                        
                        {medicine.generic_name && (
                          <p className="text-sm text-gray-500 mb-3">
                            <span className="font-semibold">Generic:</span> {medicine.generic_name}
                          </p>
                        )}

                        <p className="text-sm text-gray-500 mb-3">
                          <span className="font-semibold">Manufacturer:</span> {medicine.manufacturer}
                        </p>

                          <div className="flex flex-wrap items-center gap-6">
                          {/* <div className="flex items-center gap-2">
                            <div className="bg-green-100 p-2 rounded-lg">
                              <Package className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">In Stock</p>
                              <p className="font-bold text-green-600 text-lg">{medicine.stock_quantity} units</p>
                            </div>
                          </div> */}
                          {/* <div className="flex items-center gap-2">
                            <div className="bg-blue-100 p-2 rounded-lg">
                              <DollarSign className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Price per unit</p>
                              <p className="font-bold text-blue-600 text-lg">
                                ${parseFloat(medicine.unit_price).toFixed(2)}
                              </p>
                            </div>
                          </div> */}
                          <div className="ml-auto flex items-center gap-2 flex-shrink-0 sm:ml-auto sm:mt-0 mt-3">
                            {/* Order button: always visible when in-stock. On small screens it appears below and expands full-width so it's visible. */}
                            {Number(medicine.stock_quantity) > 0 ? (
                              <button
                                onClick={async () => {
                                  // If already clearly a patient, open modal immediately
                                  if (isPatientUser()) {
                                    setSelectedMedForOrder(medicine);
                                    setOrderOpen(true);
                                    return;
                                  }

                                  // Try to verify server-side if token exists
                                  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                                  if (token) {
                                    try {
                                      const u = await getCurrentUser();
                                      // if server says patient, open
                                      if (u && (u.user_type === 'patient' || (u as any).userType === 'patient')) {
                                        setAuthUserLocal(u);
                                        setSelectedMedForOrder(medicine);
                                        setOrderOpen(true);
                                        return;
                                      }
                                      // otherwise not allowed
                                      try { showInfo('Only patients can place orders. Please sign in with a patient account.'); } catch {}
                                      window.location.href = '/login';
                                    } catch (err) {
                                      // If verification fails, fall back to login
                                      console.debug('getCurrentUser failed on order click', err);
                                      window.location.href = '/login';
                                    }
                                  } else {
                                    // No token: redirect to login
                                    window.location.href = '/login';
                                  }
                                }}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold text-sm shadow-sm min-w-max w-full sm:w-auto text-center"
                              >
                                Order
                              </button>
                            ) : (
                              <span className="text-sm font-semibold text-red-600">Out of stock</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {/* Order modal */}
          <CreateOrderModal
            open={orderOpen}
            onClose={() => { setOrderOpen(false); setSelectedMedForOrder(null); }}
            medicine={selectedMedForOrder ? {
              id: selectedMedForOrder.id,
              name: selectedMedForOrder.name,
              unit_price: selectedMedForOrder.unit_price,
              stock_quantity: selectedMedForOrder.stock_quantity,
              pharmacy_id: selectedMedForOrder.pharmacy_id,
            } : null}
            onPlaced={(result) => {

              console.log('Order placed', result);
            }}
          />
          <PatientOrdersModal open={ordersOpen} onClose={() => setOrdersOpen(false)} />

          {/* Contact pharmacy modal */}
          <ContactPharmacyModal
            open={contactModalOpen}
            onClose={closeContactModal}
            pharmacy={contactPharmacy ?? undefined}
          />
        </div>
      ) : null}
    </div>
  );
}

