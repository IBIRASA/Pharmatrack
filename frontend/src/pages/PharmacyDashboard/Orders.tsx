import { useEffect, useState } from 'react';
import { getOrders, updateOrder, deleteOrder } from '../../utils/api';
import { Package, Loader, AlertCircle, CheckCircle, Clock, XCircle, Trash2} from 'lucide-react';
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadOrders();
  }, []);

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

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await updateOrder(orderId, { status: newStatus });
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (err) {
      console.error('Error updating order:', err);
      alert(t('orders.error.update'));
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    if (!confirm(t('orders.delete.confirm'))) return;
    
    try {
      await deleteOrder(orderId);
      setOrders(orders.filter(order => order.id !== orderId));
    } catch (err) {
      console.error('Error deleting order:', err);
      alert(t('orders.error.delete'));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
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
    switch (status.toLowerCase()) {
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
    : orders.filter(order => order.status.toLowerCase() === filter);

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
                        {getStatusIcon(order.status)}
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                          {t(`orders.status.${order.status.toLowerCase()}`) || order.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                          <option value="pending">{t('orders.status.pending')}</option>
                          <option value="completed">{t('orders.status.completed')}</option>
                          <option value="cancelled">{t('orders.status.cancelled')}</option>
                        </select>
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
              {orders.filter(o => o.status.toLowerCase() === 'pending').length}
            </p>
          </div>
          <div className="bg-green-50 rounded-xl shadow-sm border border-green-200 p-6">
            <p className="text-sm text-green-700 mb-1">Completed</p>
            <p className="text-2xl font-bold text-green-800">
              {orders.filter(o => o.status.toLowerCase() === 'completed').length}
            </p>
          </div>
          <div className="bg-red-50 rounded-xl shadow-sm border border-red-200 p-6">
            <p className="text-sm text-red-700 mb-1">Cancelled</p>
            <p className="text-2xl font-bold text-red-800">
              {orders.filter(o => o.status.toLowerCase() === 'cancelled').length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}