import React, { useState } from 'react';
import { Search, Navigation, Mail, Package, DollarSign, Loader, AlertCircle } from 'lucide-react';
import { getMedicines, type Medicine as APIMedicine } from '../../utils/api';

interface Medicine extends APIMedicine {
  pharmacy_name: string;
  pharmacy_email: string;
  pharmacy_id: number;
}

interface GroupedPharmacy {
  pharmacy_name: string;
  pharmacy_email: string;
  medicines: Medicine[];
}

export default function MedicineSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!searchQuery.trim()) {
      setError('Please enter a medicine name');
      return;
    }

    setLoading(true);
    setSearched(true);
    setError('');
    
    try {
      const data = await getMedicines({ search: searchQuery }) as Medicine[];
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

  const groupedByPharmacy = results.reduce((acc, medicine) => {
    const pharmacyId = medicine.pharmacy_id;
    if (!acc[pharmacyId]) {
      acc[pharmacyId] = {
        pharmacy_name: medicine.pharmacy_name,
        pharmacy_email: medicine.pharmacy_email,
        medicines: [],
      };
    }
    acc[pharmacyId].medicines.push(medicine);
    return acc;
  }, {} as { [key: number]: GroupedPharmacy });

  const getDirections = (pharmacyName: string) => {
    const query = encodeURIComponent(`${pharmacyName} pharmacy`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white shadow-lg">
        <h2 className="text-3xl font-bold mb-2">Find Your Medicine</h2>
        <p className="text-green-50">Search for medicines and discover pharmacies that have them in stock</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Enter medicine name (e.g., Paracetamol, Aspirin, Ibuprofen...)"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setError('');
                }}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-lg"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white px-8 py-4 rounded-xl hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold flex items-center gap-2 transition-all shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Search
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
          <p className="text-gray-600 font-medium">Searching for medicines...</p>
        </div>
      ) : searched && results.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Results Found</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            We couldn't find any pharmacies with "<span className="font-semibold">{searchQuery}</span>" in stock. 
            Try searching with a different name or check the spelling.
          </p>
        </div>
      ) : searched && results.length > 0 ? (
        <div className="space-y-6">
          {/* Results Summary */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-green-800">
              <Package className="w-5 h-5" />
              <span className="font-semibold">
                Found {results.length} medicine(s) available in {Object.keys(groupedByPharmacy).length} pharmacy(ies)
              </span>
            </div>
          </div>

          {/* Pharmacy Cards */}
          {Object.entries(groupedByPharmacy).map(([pharmacyId, data]) => (
            <div
              key={pharmacyId}
              className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* Pharmacy Header */}
              <div className="bg-linear-to-r from-green-500 to-blue-500 p-6 text-white">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="bg-white text-green-600 w-14 h-14 rounded-xl flex items-center justify-center font-bold text-2xl shadow-lg flex-shrink-0">
                      {data.pharmacy_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2">{data.pharmacy_name}</h3>
                      <div className="flex items-center gap-2 text-green-50 mb-4">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm">{data.pharmacy_email}</span>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => getDirections(data.pharmacy_name)}
                          className="bg-white text-green-600 px-5 py-2.5 rounded-lg hover:bg-green-50 font-semibold flex items-center gap-2 text-sm shadow-md transition-all"
                        >
                          <Navigation className="w-4 h-4" />
                          Get Directions
                        </button>
                        <a
                          href={`mailto:${data.pharmacy_email}?subject=Medicine Inquiry: ${searchQuery}`}
                          className="bg-green-700 text-white px-5 py-2.5 rounded-lg hover:bg-green-800 font-semibold flex items-center gap-2 text-sm shadow-md transition-all"
                        >
                          <Mail className="w-4 h-4" />
                          Contact Pharmacy
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white text-green-600 px-4 py-2 rounded-full font-bold text-sm shadow-lg flex-shrink-0">
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
                      <div className="bg-linear-to-br from-green-100 to-blue-100 text-green-700 w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
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

                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <div className="bg-green-100 p-2 rounded-lg">
                              <Package className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">In Stock</p>
                              <p className="font-bold text-green-600 text-lg">{medicine.stock_quantity} units</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="bg-blue-100 p-2 rounded-lg">
                              <DollarSign className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Price per unit</p>
                              <p className="font-bold text-blue-600 text-lg">
                                ${parseFloat(medicine.unit_price).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}