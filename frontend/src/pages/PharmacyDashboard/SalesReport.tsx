import { useEffect, useState } from "react";
import { getSalesReports, getMockSalesHistory, getDashboardStats, mockAPI } from "../../utils/api";
import { DollarSign, TrendingUp, Calendar, Loader, BarChart3, Users, Package } from "lucide-react";
import { useTranslation } from '../../i18n';

interface SalesReport {
  date: string;
  revenue: number;
  sales_count: number;
  average_ticket: number;
}

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

export default function SalesReport() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<SalesReport[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [recentSales, setRecentSales] = useState<any[]>([]);

  // loadData moved above effects to avoid "used before defined" / hook lint errors
  const loadData = async (p: 'daily' | 'weekly' | 'monthly' = period): Promise<void> => {
    try {
      setLoading(true);
      const [reportData, statsData] = await Promise.all([
        getSalesReports(p),
        getDashboardStats(),
      ]);

      // Prefer backend recent sales (scoped to authenticated pharmacy); fall back to mock storage
      let recent: any[] = [];
      try {
        const resp = await (await import('../../utils/api')).getSalesData();
        recent = resp.results || resp || [];
      } catch (e) {
        if (typeof window !== 'undefined' && 'navigator' in window && !window.navigator.onLine) {
          try {
            const mock = await getMockSalesHistory(1, 10);
            recent = mock.results || [];
          } catch {
            recent = [];
          }
        } else {
          recent = [];
        }
      }

      setReports(reportData);
      setStats(statsData);
      setRecentSales(recent);
    } catch (error) {
      console.error("Error loading sales data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(period);
  }, [period]);

  useEffect(() => {
    // call loadData using current period when a sale is created
    const onSale = () => loadData(period);
    window.addEventListener('pharmatrack:sale:created', onSale);
    return () => window.removeEventListener('pharmatrack:sale:created', onSale);
  }, []);

  // If running in dev and there is no data, auto-generate sample sales to make charts visible
  useEffect(() => {
    (async () => {
      if (!(import.meta as any).env?.DEV) return;
      try {
        // load current mock sales quickly
        const cur = await getMockSalesHistory(1, 5);
        const hasSales = Array.isArray(cur.results) && cur.results.length > 0;
        if (!hasSales) {
          // generate a modest number so charts and recent transactions show
          mockAPI.generateSampleSales(20);
          // reload data
          await loadData();
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  // Dev helper: generate sample mock sales in localStorage to populate recent transactions
  const generateSampleSales = () => {
    try {
      const generated = mockAPI.generateSampleSales(20);
      console.log('Generated sample sales:', generated.length);
      // reload data from localStorage-backed mocks
      loadData();
    } catch (e) {
      console.error('Failed to generate sample sales', e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    if (period === 'monthly') {
      const [year, month] = dateString.split('-');
      return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      });
    }
    return dateString;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('sales.analytics.title')}</h2>
          <p className="text-gray-600 mt-1">{t('sales.analytics.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as 'daily' | 'weekly' | 'monthly')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="daily">{t('sales.period.daily')}</option>
            <option value="weekly">{t('sales.period.weekly')}</option>
            <option value="monthly">{t('sales.period.monthly')}</option>
          </select>
          { (import.meta as any).env?.DEV && (
            <button
              onClick={generateSampleSales}
              className="px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm"
            >
              Generate sample sales
            </button>
          ) }
        </div>
      </div>

      {/* Summary Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-500 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-gray-600 text-sm">{t('sales.summary.total_revenue')}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              ${stats.total_revenue}
            </p>
            <p className="text-xs text-gray-500 mt-1">{stats.total_sales} {t('sales.summary.total_customers') || 'total sales'}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-500 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-gray-600 text-sm">{t('sales.summary.monthly_revenue')}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              ${stats.monthly_revenue}
            </p>
            <p className="text-xs text-gray-500 mt-1">{stats.monthly_sales} {t('dashboard.card.this_month') || 'this month'}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-500 p-3 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-gray-600 text-sm">{t('sales.summary.total_customers')}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {stats.total_customers}
            </p>
            <p className="text-xs text-gray-500 mt-1">{t('sales.summary.total_customers') || 'Unique customers'}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-500 p-3 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-gray-600 text-sm">{t('sales.summary.avg_order')}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              ${stats.average_order_value}
            </p>
            <p className="text-xs text-gray-500 mt-1">{t('table.header.average_ticket') || 'Per transaction'}</p>
          </div>
        </div>
      )}

      {/* Sales Report Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {t('sales.analytics.title')} ({period.charAt(0).toUpperCase() + period.slice(1)})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('table.header.date')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('table.header.sales_count')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('table.header.revenue')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('table.header.average_ticket')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium">{t('sales.no_reports.title')}</p>
                    <p className="text-sm mt-1">{t('sales.no_reports.desc')}</p>
                  </td>
                </tr>
              ) : (
                reports.map((report, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {formatDate(report.date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-blue-600" />
                        {report.sales_count} sales
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600">
                      ${report.revenue.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      ${report.average_ticket.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Sales */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">{t('recent.transactions.title')}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Medicine
                </th> */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentSales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                    {t('recent.transactions.no_data')}
                  </td>
                </tr>
              ) : (
                recentSales.map((sale) => {
                  const txId = sale.transaction_id || sale.id || sale.tx_id || '—';
                  const custName =
                    sale.customer_name ||
                    sale.customer?.name ||
                    sale.client?.name ||
                    sale.buyer ||
                    sale.customer?.full_name ||
                    '—';
                  const custPhone =
                    sale.customer_phone ||
                    sale.customer?.phone ||
                    sale.client?.phone ||
                    sale.customer?.mobile ||
                    '';
                  const medName =
                    sale.medicine_name ||
                    sale.medicine?.name ||
                    sale.item?.name ||
                    sale.product ||
                    sale.med_name ||
                    '—';
                  const qty = sale.quantity ?? sale.qty ?? sale.amount ?? '—';
                  const total =
                    sale.total_price ?? sale.total ?? sale.amount_paid ?? sale.price_total ?? '—';
                  const dateVal = sale.sale_date || sale.created_at || sale.date || sale.timestamp;

                  return (
                    <tr key={txId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-mono text-gray-900">{txId}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{custName}</div>
                          <div className="text-gray-500 text-xs">{custPhone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{medName}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{qty}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-600">
                        ${typeof total === 'number' ? total.toFixed(2) : total}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {dateVal ? new Date(dateVal).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}