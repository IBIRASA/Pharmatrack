import { useEffect, useState } from 'react';
import { getDashboardStats, getSalesData, getCustomers, getMedicines, getOrders } from '../../utils/api';
import { 
  Package, 
  ShoppingCart, 
  AlertTriangle, 
  TrendingUp, 
  Users,
  Loader,
  AlertCircle,

  BarChart3,
  Calendar
} from 'lucide-react';
import { useTranslation } from '../../i18n';

interface DashboardStats {
  total_revenue: string;
  total_sales: number;
  total_orders?: number;
  today_sales: number;
  average_order_value: string;
  low_stock_items: number;
  total_customers: number;
  monthly_revenue: string;
  monthly_sales: number;
}

export default function Overview() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [recentCustomers, setRecentCustomers] = useState<any[]>([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [openOrdersCount, setOpenOrdersCount] = useState<number>(0);
  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Loading dashboard data...');
    
      const [
        statsData,
        salesData,
        customersData,
        ordersData,
        ordersAll
      ] = await Promise.all([
        getDashboardStats(),
        getSalesData({ limit: 5 }),
        getCustomers(),
        getOrders({ limit: 10 }),
        getOrders({ limit: 1000 })
      ]);

      // Map sales and recent shipped/completed orders into a unified recent activity list
      const mappedSales = (Array.isArray(salesData) ? salesData : (salesData.results || [])).map((s: any) => ({
        id: s.id,
        customer_name: s.customer?.name || s.customer_name || 'Customer',
        medicine_name: s.medicine_name || s.medicine || (s.items && s.items.length ? s.items[0].medicine_name || s.items[0].medicine : ''),
        total_price: s.total_price || s.total_amount || 0,
        sale_date: s.sale_date || s.created_at || s.createdAt
      }));

      const shippedOrders = (ordersData || [])
        .filter((o: any) => ['shipped', 'completed'].includes(o.status))
        .map((o: any) => ({
          id: `order_${o.id}`,
          customer_name: o.customer_name || (o.patient && (o.patient.name || o.patient.username)) || 'Customer',
          medicine_name: o.items && o.items.length ? (o.items[0].medicine_name || o.items[0].medicine) : 'Order',
          total_price: o.total_amount,
          sale_date: o.created_at
        }));

      const combined = [...mappedSales, ...shippedOrders].slice(0, 5);

  // Count open orders (statuses that require action)
  const openStatuses = ['pending', 'approved', 'reserved'];
  const allOrders = Array.isArray(ordersAll) ? ordersAll : (((ordersAll as any)?.results) || []);
  const openCount = allOrders.filter((o: any) => openStatuses.includes((o.status || '').toLowerCase())).length;
      setStats(statsData);
      setRecentSales(combined);
  setOpenOrdersCount(openCount);
      setRecentCustomers(customersData.slice(0, 5));
      
      console.log('Dashboard data loaded successfully');

    } catch (err: any) {
      console.error('Error loading dashboard:', err);
      setError(err?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };
 useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const meds = await getMedicines();
        if (!mounted) return;
        const count = meds.filter(m => Number(m.stock_quantity) <= Number(m.minimum_stock)).length;
        setLowStockCount(count);
      } catch (err) {
        console.error('Failed to load medicines for overview', err);
        if (mounted) setLowStockCount(0);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader className="w-12 h-12 animate-spin text-green-600 mb-4" />
        <p className="text-gray-600 font-medium">{t('dashboard.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
  <h3 className="text-xl font-bold text-red-900 mb-2">{t('dashboard.error.title')}</h3>
  <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={loadDashboard}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-medium"
        >
          {t('actions.try_again')}
        </button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">{t('dashboard.no_data.title')}</h3>
        <p className="text-gray-600 mb-4">{t('dashboard.no_data.desc')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white shadow-lg">
        <h2 className="text-3xl font-bold mb-2">{t('dashboard.overview.title')}</h2>
        <p className="text-green-50">{t('dashboard.overview.subtitle')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Orders (moved to first for visibility) */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-teal-100 p-3 rounded-lg">
              <Package className="w-6 h-6 text-teal-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">{t('dashboard.card.orders')}</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.total_orders ?? stats.total_sales}</h3>
          <p className="text-sm text-gray-600">Total Orders</p>
        </div>

        {/* Total Sales */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">All time</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.total_sales}</h3>
          <p className="text-sm text-gray-600">Total Sales</p>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-teal-100 p-3 rounded-lg">
              <Package className="w-6 h-6 text-teal-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">{t('dashboard.card.orders')}</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.total_orders ?? stats.total_sales}</h3>
          <p className="text-sm text-gray-600">Total Orders</p>
        </div>

          {/* Open Orders */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">Open Orders</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{openOrdersCount}</h3>
            <p className="text-sm text-gray-600">Orders requiring attention</p>
          </div>

        {/* Today's Sales */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Today</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.today_sales}</h3>
          <p className="text-sm text-gray-600">Today's Sales</p>
        </div>

        {/* Total Customers */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-indigo-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Customers</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.total_customers}</h3>
          <p className="text-sm text-gray-600">Total Customers</p>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">This month</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">
            ${stats.monthly_revenue}
          </h3>
          <p className="text-sm text-gray-600">Monthly Revenue</p>
        </div>

        {/* Average Order Value */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-cyan-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-cyan-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Average</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">
            ${stats.average_order_value}
          </h3>
          <p className="text-sm text-gray-600">Avg. Order Value</p>
        </div>

        {/* Monthly Sales */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-pink-100 p-3 rounded-lg">
              <Package className="w-6 h-6 text-pink-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">This month</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.monthly_sales}</h3>
          <p className="text-sm text-gray-600">Monthly Sales</p>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-xl shadow-md border border-red-200 p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-sm font-medium text-red-600">Low Stock</span>
          </div>
          <h3 className="text-3xl font-bold text-red-900 mb-1"> {loading ? '...' : lowStockCount}</h3>
          <p className="text-sm text-gray-600">Low stock items</p>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-green-600" />
            {t('recent.sales.title')}
          </h3>
          <div className="space-y-4">
            {recentSales.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>{t('recent.sales.empty')}</p>
              </div>
            ) : (
              recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{sale.customer_name}</div>
                    <div className="text-sm text-gray-600">{sale.medicine_name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">${sale.total_price}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(sale.sale_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            {t('recent.customers.title')}
          </h3>
          <div className="space-y-4">
            {recentCustomers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>{t('recent.customers.empty')}</p>
              </div>
            ) : (
              recentCustomers.map((customer) => (
                <div key={customer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{customer.name}</div>
                    <div className="text-sm text-gray-600">{customer.phone}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">${customer.total_spent.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">{customer.purchase_count} {t('customers.purchases_label')}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-green-600" />
          {t('quick_actions.title')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/pharmacy-dashboard/inventory"
            className="bg-linear-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg hover:shadow-lg transition-all text-center font-semibold"
          >
            {t('quick_actions.manage_inventory')}
          </a>
          <a
            href="/pharmacy-dashboard/customers"
            className="bg-linear-to-r from-green-500 to-green-600 text-white p-4 rounded-lg hover:shadow-lg transition-all text-center font-semibold"
          >
            {t('quick_actions.view_customers')}
          </a>
          <a
            href="/pharmacy-dashboard/reports"
            className="bg-linear-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg hover:shadow-lg transition-all text-center font-semibold"
          >
            {t('quick_actions.sales_reports')}
          </a>
        </div>
      </div>

      {/* Low Stock Alert */}
      {stats.low_stock_items > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h3 className="text-lg font-bold text-red-900">
              {t('low_stock.alert_title').replace('{count}', String(stats.low_stock_items))}
            </h3>
          </div>
            <a
            href="/pharmacy-dashboard/inventory"
            className="inline-block bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-semibold transition-colors"
          >
            {t('low_stock.view_button')}
          </a>
        </div>
      )}
    </div>
  );
}