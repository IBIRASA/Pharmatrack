import { useEffect, useState } from 'react';
import { getDashboardStats, getMockSalesHistory, getCustomers,getMedicines } from '../../utils/api';
import { 
  Package, 
  ShoppingCart, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign,
  Users,
  Loader,
  AlertCircle,

  BarChart3,
  Calendar
} from 'lucide-react';

interface DashboardStats {
  total_revenue: string;
  total_sales: number;
  today_sales: number;
  average_order_value: string;
  low_stock_items: number;
  total_customers: number;
  monthly_revenue: string;
  monthly_sales: number;
}

export default function Overview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [recentCustomers, setRecentCustomers] = useState<any[]>([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Loading dashboard data...');
      
      // Load all data in parallel
      const [statsData, salesData, customersData] = await Promise.all([
        getDashboardStats(),
        getMockSalesHistory(1, 5),
        getCustomers()
      ]);

      setStats(statsData);
      setRecentSales(salesData.results);
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
        <p className="text-gray-600 font-medium">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-red-900 mb-2">Error Loading Dashboard</h3>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={loadDashboard}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Data Available</h3>
        <p className="text-gray-600 mb-4">Start by making your first sale to see dashboard data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white shadow-lg">
        <h2 className="text-3xl font-bold mb-2">Dashboard Overview</h2>
        <p className="text-green-50">Welcome back! Here's your pharmacy performance at a glance.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Total</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">
            ${stats.total_revenue}
          </h3>
          <p className="text-sm text-gray-600">Total Revenue</p>
        </div>

        {/* Total Sales */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">All Time</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.total_sales}</h3>
          <p className="text-sm text-gray-600">Total Sales</p>
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
            <span className="text-sm font-medium text-gray-600">Unique</span>
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
            <span className="text-sm font-medium text-gray-600">This Month</span>
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
            <span className="text-sm font-medium text-gray-600">This Month</span>
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
            <span className="text-sm font-medium text-red-600">Attention</span>
          </div>
          <h3 className="text-3xl font-bold text-red-900 mb-1"> {loading ? '...' : lowStockCount}</h3>
          <p className="text-sm text-gray-600">Low Stock Items</p>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-green-600" />
            Recent Sales
          </h3>
          <div className="space-y-4">
            {recentSales.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No recent sales</p>
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
            Top Customers
          </h3>
          <div className="space-y-4">
            {recentCustomers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No customer data</p>
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
                    <div className="text-xs text-gray-500">{customer.purchase_count} purchases</div>
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
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/pharmacy-dashboard/inventory"
            className="bg-linear-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg hover:shadow-lg transition-all text-center font-semibold"
          >
            Manage Inventory
          </a>
          <a
            href="/pharmacy-dashboard/customers"
            className="bg-linear-to-r from-green-500 to-green-600 text-white p-4 rounded-lg hover:shadow-lg transition-all text-center font-semibold"
          >
            View Customers
          </a>
          <a
            href="/pharmacy-dashboard/reports"
            className="bg-linear-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg hover:shadow-lg transition-all text-center font-semibold"
          >
            Sales Reports
          </a>
        </div>
      </div>

      {/* Low Stock Alert */}
      {stats.low_stock_items > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h3 className="text-lg font-bold text-red-900">
              Low Stock Alert: {stats.low_stock_items} item(s) need attention
            </h3>
          </div>
          <a
            href="/pharmacy-dashboard/inventory"
            className="inline-block bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-semibold transition-colors"
          >
            View Low Stock Items
          </a>
        </div>
      )}
    </div>
  );
}