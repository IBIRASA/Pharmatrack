import { useEffect, useState } from 'react';
import { useTranslation } from '../../i18n';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Search as SearchIcon,
  Loader as LoaderIcon,
  CheckCircle,
} from 'lucide-react';
import { getMedicines, sellMedicineEnhanced } from '../../utils/api';
import { showSuccess, showError, showInfo } from '../../utils/notifications';

interface Medicine {
  id: number;
  name: string;
  dosage: string;
  unit_price: string;
  stock_quantity: number;
  category: string;
}

interface CartItem extends Medicine {
  quantity: number;
  subtotal: number;
}

export default function Sales() {
  const { t } = useTranslation();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [saleCompleted, setSaleCompleted] = useState(false);
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    loadMedicines();
  }, []);

  const loadMedicines = async () => {
    try {
      const data = await getMedicines();
      const available = data.filter((m: Medicine) => m.stock_quantity > 0);
      setMedicines(available);
      const initialQty: { [key: number]: number } = {};
      available.forEach((m: Medicine) => {
        initialQty[m.id] = 1;
      });
      setQuantities(initialQty);
    } catch (error) {
      console.error('Error loading medicines:', error);
    }
  };

  const filteredMedicines = medicines.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const updateMedicineQuantity = (id: number, delta: number) => {
    const medicine = medicines.find((m) => m.id === id);
    if (!medicine) return;

    const currentQty = quantities[id] || 1;
    const newQty = currentQty + delta;

    if (newQty < 1) return;
    if (newQty > medicine.stock_quantity) {
      try { showInfo(t('sales.only_x_available').replace('{count}', String(medicine.stock_quantity))); } catch {}
      return;
    }

    setQuantities({ ...quantities, [id]: newQty });
  };

  const addToCart = (medicine: Medicine) => {
    const qtyToAdd = quantities[medicine.id] || 1;
    const existing = cart.find((item) => item.id === medicine.id);

    if (existing) {
      const newQty = existing.quantity + qtyToAdd;
      if (newQty > medicine.stock_quantity) {
        try { showInfo(t('sales.not_enough_stock')); } catch {}
        return;
      }
      setCart(
        cart.map((item) =>
          item.id === medicine.id
            ? {
                ...item,
                quantity: newQty,
                subtotal: newQty * parseFloat(item.unit_price),
              }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          ...medicine,
          quantity: qtyToAdd,
          subtotal: qtyToAdd * parseFloat(medicine.unit_price),
        },
      ]);
    }

    setQuantities({ ...quantities, [medicine.id]: 1 });
  };

  const updateCartQuantity = (id: number, delta: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.stock_quantity) {
              try { showInfo('Not enough stock'); } catch {}
              return item;
            }
            return {
              ...item,
              quantity: newQty,
              subtotal: newQty * parseFloat(item.unit_price),
            };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.subtotal, 0);

  const handleCompleteSale = async () => {
    if (cart.length === 0) {
      try { showInfo(t('sales.cart.empty')); } catch {}
      return;
    }
    if (!customerName.trim()) {
      try { showInfo(t('sales.enter_customer_name')); } catch {}
      return;
    }

    setLoading(true);
    try {
      // For in-person sales, call the sell API per medicine so Sale records are created
      for (const item of cart) {
        await sellMedicineEnhanced({
          medicine_id: item.id,
          quantity: item.quantity,
          customer_name: customerName,
          customer_phone: customerPhone,
          total_price: item.subtotal
        });
      }

  // Refresh UI
  setCart([]);
  setCustomerName('');
  setCustomerPhone('');
  setSaleCompleted(true);
  try { showSuccess(t('sales.success') || 'Sale completed successfully!'); } catch {}
  await loadMedicines();
    // notify other parts of the app (dashboard, customers list, reports) to refresh
    try {
      window.dispatchEvent(new Event('pharmatrack:sale:created'));
    } catch (e) {}
  setTimeout(() => setSaleCompleted(false), 3000);
    } catch (error) {
      console.error('Sale error:', error);
      try { showError(t('sales.failed')); } catch {}
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{t('sales.title')}</h2>
        <p className="text-gray-600 mt-1">{t('sales.subtitle')}</p>
      </div>

      {saleCompleted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <span className="text-green-700 font-medium">Sale completed successfully!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Medicine Selection */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('sales.search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b">
              <h3 className="font-semibold">{t('sales.available.title')}</h3>
            </div>
            <div className="divide-y max-h-[500px] overflow-y-auto">
              {filteredMedicines.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>{t('sales.no_medicines')}</p>
                </div>
              ) : (
                filteredMedicines.map((medicine) => (
                  <div
                    key={medicine.id}
                    className="p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{medicine.name}</p>
                        <p className="text-sm text-gray-600">{medicine.dosage}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm text-gray-500">
                            Available: {medicine.stock_quantity}
                          </span>
                          <span className="text-sm font-semibold text-green-600">
                            ${parseFloat(medicine.unit_price).toFixed(2)} / unit
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-gray-100 rounded-lg">
                        <button
                          onClick={() => updateMedicineQuantity(medicine.id, -1)}
                          className="p-2 hover:bg-gray-200 rounded-l-lg"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          min="1"
                          max={medicine.stock_quantity}
                          value={quantities[medicine.id] || 1}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 1;
                            if (val >= 1 && val <= medicine.stock_quantity) {
                              setQuantities({ ...quantities, [medicine.id]: val });
                            }
                          }}
                          className="w-16 text-center py-2 bg-transparent border-none focus:outline-none font-medium"
                        />
                        <button
                          onClick={() => updateMedicineQuantity(medicine.id, 1)}
                          className="p-2 hover:bg-gray-200 rounded-r-lg"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => addToCart(medicine)}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 font-medium"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {t('sales.add_to_cart')}
                      </button>
                    </div>

                    <p className="text-xs text-gray-600 mt-2">
                      {t('sales.subtotal')} ${((quantities[medicine.id] || 1) * parseFloat(medicine.unit_price)).toFixed(2)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Cart & Checkout */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold">Cart ({cart.length})</h3>
            </div>
            <div className="divide-y max-h-[300px] overflow-y-auto">
              {cart.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>{t('sales.cart.empty')}</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                        <p className="text-xs text-gray-600">{item.dosage}</p>
                        <p className="text-sm font-semibold text-green-600 mt-1">
                          ${item.subtotal.toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:bg-red-50 p-1 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateCartQuantity(item.id, -1)}
                        className="bg-gray-200 hover:bg-gray-300 p-1 rounded"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-3 py-1 bg-gray-100 rounded font-medium text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.id, 1)}
                        className="bg-gray-200 hover:bg-gray-300 p-1 rounded"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Customer Info & Total */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('sales.customer_name')} *
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder={t('sales.customer_name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('sales.customer_phone')}
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Enter phone number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-gray-900">{t('sales.total')}</span>
                <span className="text-2xl font-bold text-green-600">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
              <button
                onClick={handleCompleteSale}
                disabled={loading || cart.length === 0}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <LoaderIcon className="w-5 h-5 animate-spin" />
                    {t('sales.processing')}
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    {t('sales.complete')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}