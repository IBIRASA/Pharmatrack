import React, { useEffect, useState } from 'react';
import { X, Check } from 'lucide-react';
import { getMyOrders, confirmOrderDelivery, acceptOrderApproval, type Order } from '../../utils/api';
import { useTranslation } from '../../i18n';
import { showSuccess, showError } from '../../utils/notifications';

interface PatientOrdersModalProps {
  open: boolean;
  onClose: () => void;
  highlightOrderId?: number | null;
}

const PatientOrdersModal: React.FC<PatientOrdersModalProps> = ({ open, onClose, highlightOrderId }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const orderRefs = React.useRef<Record<number, HTMLDivElement | null>>({});
  const [highlightedOrder, setHighlightedOrder] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    if (!open) return;
    setLoading(true);
      getMyOrders()
        .then((data) => {
          console.debug('PatientOrdersModal fetched orders:', data);
          setOrders(data);
        })
      .catch((err) => setError(err?.detail || String(err)))
      .finally(() => setLoading(false));
  }, [open]);

  // When orders change and a highlightOrderId prop is present, scroll to it
  useEffect(() => {
    if (!open) return;
    if (!highlightOrderId) return;
    // wait a tick to ensure refs populated
    setTimeout(() => {
      const el = orderRefs.current[highlightOrderId];
      if (el) {
        try {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } catch (e) {
          // ignore
        }
        setHighlightedOrder(highlightOrderId);
        setTimeout(() => setHighlightedOrder(null), 3000);
      }
    }, 250);
  }, [orders, open, highlightOrderId]);

  if (!open) return null;

  const handleConfirm = async (orderId: number) => {
    try {
      // send customer_name to backend when available so pharmacy notification includes it
      const order = orders.find((o) => o.id === orderId);
      const customerName = order?.customer_name || '';
      await confirmOrderDelivery(orderId, { customer_name: customerName });
      // refresh UI: backend sets status to 'completed' when delivery is confirmed
      setOrders((prev) => prev.map(o => o.id === orderId ? { ...o, status: 'completed' } : o));
      // dispatch toast event so the top-level dashboard can show a non-blocking toast
      try { showSuccess(t('orders.delivery_confirmed') || 'Delivery confirmed'); } catch {}
      // close modal after confirming
      onClose();
    } catch (err: any) {
      const msg = err?.detail || err?.message || 'Failed to confirm delivery';
      try { showError(msg); } catch {}
      try { setError(msg); } catch {}
    }
  };

  const handleAccept = async (orderId: number) => {
    try {
      await acceptOrderApproval(orderId);
      setOrders((prev) => prev.map(o => o.id === orderId ? { ...o, status: 'accepted' } : o));
      try { showSuccess(t('orders.approval_accepted') || 'Approval accepted'); } catch {}
    } catch (err: any) {
      const msg = err?.detail || err?.message || 'Failed to accept approval';
      try { showError(msg); } catch {}
      try { setError(msg); } catch {}
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b flex items-center justify-between sticky top-0 bg-white">
          <h3 className="text-lg font-semibold">{t('orders.my_orders') || 'My Orders'}</h3>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-4">
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : orders.length === 0 ? (
            <div className="text-gray-600">{t('orders.no_orders') || 'You have not placed any orders yet.'}</div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                ref={(el) => { orderRefs.current[order.id] = el; }}
                className={`p-4 border rounded-lg ${highlightedOrder === order.id ? 'ring-2 ring-yellow-300' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Order #{order.id}</div>
                    <div className="font-semibold">{order.customer_name}</div>
                    <div className="text-sm text-gray-500">{order.customer_phone}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${order.total_amount?.toString() || '0.00'}</div>
                    <div className="text-sm text-gray-500">{order.status}</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-end gap-2">
                    {(order.status || '').toLowerCase().trim() === 'approved' && (
                      <button onClick={() => handleAccept(order.id)} className="bg-blue-600 text-white px-3 py-1 rounded-lg flex items-center gap-2">
                        Accept Approval
                      </button>
                    )}

                    { ((order.status || '').toLowerCase().trim() === 'shipped' || (order.status || '').toLowerCase().trim() === 'completed' || (order.status || '').toLowerCase().trim() === 'delivered') && (
                      <button onClick={() => handleConfirm(order.id)} className="bg-green-600 text-white px-3 py-1 rounded-lg flex items-center gap-2">
                        <Check className="w-4 h-4" /> {t('orders.confirm_received') || 'Confirm Received'}
                      </button>
                    )}
                  {(order.status || '').toLowerCase().trim() === 'pending' && (
                    <div className="text-sm text-gray-500">{t('orders.pending') || 'Pending'}</div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientOrdersModal;
