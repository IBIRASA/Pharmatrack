import { useEffect, useState } from 'react';
import { getOrders, deleteOrder, approveOrder, rejectOrder, markOrderShipped, getCurrentUser } from '../../utils/api';
import { Package, Loader, AlertCircle, CheckCircle, Clock, XCircle, Trash2} from 'lucide-react';
import { showSuccess, showError } from '../../utils/notifications';
import { useTranslation } from '../../i18n';

interface Order {
  id: number;
  customer_name: string;
  customer_phone?: string;
  total_amount: number;
  status: string;
  created_at: string;
}

export default function Orders() {
  const { t } = useTranslation();
  const [localUser, setLocalUser] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadOrders();
    try {
      const raw = localStorage.getItem('user');
      const parsed = raw ? JSON.parse(raw) : null;
      // Normalize the stored user shape. Some code stores { user: {...} } while others store the user object directly.
      const candidate = parsed?.user ?? parsed;
      if (candidate) {
        // Normalize casing between user_type and userType
        if (!candidate.user_type && candidate.userType) candidate.user_type = candidate.userType;
      }
      setLocalUser(candidate);
      
      if (!candidate) {
        const token = localStorage.getItem('token');
        if (token) {
          getCurrentUser().then((u) => {
            try {
              // normalize returned user
              if (!u.user_type && (u as any).userType) (u as any).user_type = (u as any).userType;
              setLocalUser(u as any);
            } catch (e) {
              setLocalUser(u as any);
            }
          }).catch((e) => {
            console.debug('getCurrentUser failed', e);
          });
        }
      }
    } catch (e) {
      setLocalUser(null);
    }
  }, []);

  // Debug: log localUser + order statuses so we can see why buttons might be disabled
  useEffect(() => {
    try {
      console.debug('Orders debug => localUser:', localUser);
      console.debug('Orders debug => statuses:', orders.map(o => ({ id: o.id, status: canonicalStatus(o.status) })));
    } catch (e) {}
  }, [localUser, orders]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await getOrders();
      setOrders(data);
    } catch (err: any) {
      console.error('Error loading orders:', err);
      setError(t('orders.error.load'));
    } finally {
      setLoading(false);
    }
  };

  

  const handleDeleteOrder = async (orderId: number) => {
    if (!confirm(t('orders.delete.confirm'))) return;
    
    try {
      await deleteOrder(orderId);
      setOrders(orders.filter(order => order.id !== orderId));
      try { showSuccess(t('orders.delete.success') || 'Order deleted'); } catch {}
    } catch (err) {
      console.error('Error deleting order:', err);
      try { showError(t('orders.error.delete') || 'Failed to delete order'); } catch {}
    }
  };

  // Normalize a variety of incoming status strings to canonical statuses
  const canonicalStatus = (raw?: string) => {
    const s = (raw || '').toString().toLowerCase().trim();
    if (!s) return '';
    if (s.includes('pend')) return 'pending';
    if (s.includes('approv') || s.includes('reserv') || s.includes('reserve')) return 'approved';
    if (s.includes('accept')) return 'accepted';
    if (s.includes('ship')) return 'shipped';
    if (s.includes('deliver') || s.includes('deliv')) return 'completed';
    if (s.includes('complete')) return 'completed';
    if (s.includes('cancel')) return 'cancelled';
    return s;
  };

  const getStatusIcon = (status: string) => {
    const s = canonicalStatus(status);
    switch (s) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    const s = canonicalStatus(status);
    switch (s) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(order => (canonicalStatus(order.status) === filter));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader className="w-12 h-12 animate-spin text-green-600 mb-4" />
        <p className="text-gray-600 font-medium">{t('orders.loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white shadow-lg">
        <h2 className="text-3xl font-bold mb-2">{t('orders.title')}</h2>
        <p className="text-green-50">{t('orders.subtitle')}</p>
        <div className="mt-4 flex items-center gap-3">
          <div className="text-sm text-white/90">Logged as: <strong>{localUser?.user_type || localUser?.userType || 'unknown'}</strong></div>
          <div className="ml-auto" />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-gray-700">{t('orders.filter.label')}</span>
          <div className="flex gap-2">
                {['all', 'pending', 'completed', 'cancelled'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
                ))}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800 font-medium">{error}</span>
        </div>
      )}

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">{t('orders.empty.title')}</h3>
          <p className="text-gray-600">
            {filter === 'all' ? t('orders.empty.all') : t('orders.empty.filtered').replace('{status}', t(`orders.status.${filter}`))}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {t('orders.table.order_id')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {t('orders.table.customer')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {t('orders.table.phone')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {t('orders.table.total')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {t('orders.table.status')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {t('orders.table.date')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {t('orders.table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-900">#{order.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{order.customer_name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{order.customer_phone || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-green-600">
                        ${parseFloat(order.total_amount.toString()).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status || '')}
                        {
                          (() => {
                            const statusNorm = canonicalStatus(order.status);
                            return (
                              <span title={`raw: ${order.status || ''}`} className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(statusNorm)}`}>
                                {t(`orders.status.${statusNorm}`) || (statusNorm || order.status || 'Unknown')}
                              </span>
                            );
                          })()
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {/* Approve */}
                        <button
                          onClick={async () => {
                            if (!confirm(t('orders.approve.confirm') || 'Approve this order?')) return;
                            try {
                              await approveOrder(order.id);
                              await loadOrders();
                              try { showSuccess(t('orders.approve.success') || 'Order approved'); } catch {}
                            } catch (err: any) {
                              console.error('Approve error', err);
                              try { showError(t('orders.approve.error') || 'Failed to approve order'); } catch {}
                            }
                          }}
                          disabled={!(canonicalStatus(order.status) === 'pending') || !(localUser?.user_type === 'pharmacy' || localUser?.userType === 'pharmacy')}
                          className={`px-3 py-1 rounded-lg text-sm font-medium ${canonicalStatus(order.status) === 'pending' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500'} ${(!(canonicalStatus(order.status) === 'pending') || !(localUser?.user_type === 'pharmacy' || localUser?.userType === 'pharmacy')) ? 'opacity-60' : ''}`}
                          title={t('orders.approve')}
                        >
                          {t('orders.approve') || 'Approve'}
                        </button>

                        {/* Mark shipped */}
                        <button
                          onClick={async () => {
                            if (!confirm(t('orders.ship.confirm') || 'Mark this order as shipped?')) return;
                            try {
                              await markOrderShipped(order.id);
                              await loadOrders();
                              try { showSuccess(t('orders.ship.success') || 'Order marked shipped'); } catch {}
                            } catch (err: any) {
                              console.error('Ship error', err);
                              try { showError(t('orders.ship.error') || 'Failed to mark shipped'); } catch {}
                            }
                          }}
                          disabled={!(['approved','accepted'].includes(canonicalStatus(order.status))) || !(localUser?.user_type === 'pharmacy' || localUser?.userType === 'pharmacy')}
                          className={`px-3 py-1 rounded-lg text-sm font-medium ${['approved','accepted'].includes(canonicalStatus(order.status)) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'} ${(!(['approved','accepted'].includes(canonicalStatus(order.status))) || !(localUser?.user_type === 'pharmacy' || localUser?.userType === 'pharmacy')) ? 'opacity-60' : ''}`}
                          title={t('orders.ship')}
                        >
                          {t('orders.ship') || 'Ship'}
                        </button>

                        {/* Complete */}
                        <button
                          onClick={async () => {
                            if (!confirm(t('orders.complete.confirm') || 'Mark this order as completed?')) return;
                            try {
                              await (await import('../../utils/api')).completeOrder(order.id);
                              await loadOrders();
              try { showSuccess(t('orders.complete.success') || 'Order marked completed'); } catch {}
                            } catch (err: any) {
              console.error('Complete error', err);
              // Prefer server-provided messages when available
              const serverMsg = err && ((err.detail) || (err.error) || (err.current_status)) ? (err.detail || err.error || `Current status: ${err.current_status}`) : null;
              try { showError(serverMsg || t('orders.complete.error') || 'Failed to mark completed'); } catch {}
                            }
                          }}
                          disabled={!(['shipped','approved'].includes(canonicalStatus(order.status))) || !(localUser?.user_type === 'pharmacy' || localUser?.userType === 'pharmacy')}
                          className={`px-3 py-1 rounded-lg text-sm font-medium ${['shipped','approved'].includes(canonicalStatus(order.status)) ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'} ${(!(['shipped','approved'].includes(canonicalStatus(order.status))) || !(localUser?.user_type === 'pharmacy' || localUser?.userType === 'pharmacy')) ? 'opacity-60' : ''}`}
                          title={t('orders.complete')}
                        >
                          {t('orders.complete') || 'Complete'}
                        </button>

                        {/* Reject */}
                        <button
                          onClick={async () => {
                            if (!confirm(t('orders.reject.confirm') || 'Reject this order?')) return;
                            try {
                              await rejectOrder(order.id);
                              await loadOrders();
                              try { showSuccess(t('orders.reject.success') || 'Order rejected'); } catch {}
                            } catch (err: any) {
                              console.error('Reject error', err);
                              try { showError(t('orders.reject.error') || 'Failed to reject order'); } catch {}
                            }
                          }}
                          disabled={!( ['pending','approved'].includes(canonicalStatus(order.status))) || !(localUser?.user_type === 'pharmacy' || localUser?.userType === 'pharmacy')}
                          className={`px-3 py-1 rounded-lg text-sm font-medium ${['pending','approved'].includes(canonicalStatus(order.status)) ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-500'} ${(!( ['pending','approved'].includes(canonicalStatus(order.status))) || !(localUser?.user_type === 'pharmacy' || localUser?.userType === 'pharmacy')) ? 'opacity-60' : ''}`}
                          title={t('orders.reject')}
                        >
                          {t('orders.reject') || 'Reject'}
                        </button>

                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title={t('orders.delete.confirm')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {orders.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
          </div>
          <div className="bg-yellow-50 rounded-xl shadow-sm border border-yellow-200 p-6">
            <p className="text-sm text-yellow-700 mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-800">
              {orders.filter(o => (canonicalStatus(o.status) === 'pending')).length}
            </p>
          </div>
          <div className="bg-green-50 rounded-xl shadow-sm border border-green-200 p-6">
            <p className="text-sm text-green-700 mb-1">Completed</p>
            <p className="text-2xl font-bold text-green-800">
              {orders.filter(o => (canonicalStatus(o.status) === 'completed')).length}
            </p>
          </div>
          <div className="bg-red-50 rounded-xl shadow-sm border border-red-200 p-6">
            <p className="text-sm text-red-700 mb-1">Cancelled</p>
            <p className="text-2xl font-bold text-red-800">
              {orders.filter(o => (canonicalStatus(o.status) === 'cancelled')).length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Debug logs removed: showing user/token in console was noisy in production/dev