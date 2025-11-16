import React, { useEffect, useState } from 'react';
import { X, Loader2, ShoppingCart } from 'lucide-react';
import { createOrder } from '../../utils/api';
import { useTranslation } from '../../i18n';
import { useAuth } from '../../context/AuthContext';
import { showSuccess, showError, showInfo } from '../../utils/notifications';

interface MedicineLite {
  id: number;
  name: string;
  unit_price: string;
  stock_quantity: number;
  pharmacy_id: number;
}

interface CreateOrderModalProps {
  open: boolean;
  onClose: () => void;
  medicine: MedicineLite | null;

  onPlaced?: (result: { orderId: number; medicine_id: number; quantity: number }) => void;
}

const CreateOrderModal: React.FC<CreateOrderModalProps> = ({ open, onClose, medicine, onPlaced }) => {
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useTranslation();
  const { user } = useAuth();

  useEffect(() => {
    if (open && medicine) {
      setQuantity(1);
      setError('');
   
      if (user) {
        setCustomerName(user.name || '');
        setCustomerPhone(user.phone || '');
      } else {
        setCustomerName('');
        setCustomerPhone('');
      }
    }
  }, [open, medicine, user]);

  if (!open || !medicine) return null;

  const maxQuantity = medicine.stock_quantity || 1;
  const totalPrice = parseFloat(medicine.unit_price || '0') * quantity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!medicine) return;
    if (quantity < 1) {
      setError('Quantity must be at least 1');
      return;
    }
    if (quantity > maxQuantity) {
      setError('Requested quantity exceeds available stock');
      return;
    }

    if (!user || user.user_type !== 'patient') {
      const msg = 'You must be signed in as a patient to place orders';
      setError(msg);
      try { showInfo(msg); } catch {}
  
      window.location.href = '/login';
      return;
    }

    const payload = {
      pharmacy_id: medicine.pharmacy_id,
      items: [{ medicine_id: medicine.id, quantity }],
      customer_name: customerName || user.name || '',
      customer_phone: customerPhone || user.phone || '',
    };

 
    if (!payload.customer_phone || String(payload.customer_phone).trim() === '') {
      const msg = t('orders.phone_required') || 'Please provide your phone number to place an order';
      setError(msg);
      try { showError(msg); } catch {}
      return;
    }

    setLoading(true);
    try {
  const resp = await createOrder(payload);
  const orderId = (resp as any)?.order_id ?? (resp as any)?.id;
  if (onPlaced && orderId) onPlaced({ orderId, medicine_id: medicine.id, quantity });
     
      try { showSuccess(t('orders.placed_success')?.replace('{id}', String(orderId)) || `Order placed (#${orderId})`); } catch {}
      onClose();
    } catch (err: any) {
      console.error('Order placement failed', err);
      const msg = err?.detail || err?.message || JSON.stringify(err);
      setError(msg.toString());
      try { showError(msg.toString()); } catch {}
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b flex items-center justify-between sticky top-0 bg-white">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">{t('orders.place_title') || 'Place Order'}</h3>
          </div>
          <button onClick={onClose} disabled={loading} className="text-gray-600 hover:text-gray-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 border">
            <h4 className="font-semibold text-gray-900 text-lg">{medicine.name}</h4>
            <p className="text-sm text-gray-600 mt-2">{t('orders.price_per_unit') || 'Price per unit'}: ${parseFloat(medicine.unit_price || '0').toFixed(2)}</p>
            <p className="text-sm text-gray-600">{t('orders.available_stock') || 'Available'}: {medicine.stock_quantity}</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('orders.quantity') || 'Quantity'}</label>
            <input
              type="number"
              min={1}
              max={maxQuantity}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value || '1', 10))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('orders.customer_name') || 'Your name'}</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('orders.customer_phone') || 'Phone'}</label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              disabled={loading}
              required
            />
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">{t('orders.total') || 'Total'}</span>
              <span className="text-xl font-bold text-green-700">${totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} disabled={loading} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
              {t('actions.cancel') || 'Cancel'}
            </button>
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('orders.processing') || 'Placing...'}
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  {t('orders.place') || 'Place Order'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOrderModal;
