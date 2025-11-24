import { useEffect, useState } from 'react';
import { Users, Phone, Calendar, DollarSign, ShoppingCart, Loader } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { getCustomers, getOrders, getSalesData } from '../../utils/api';

interface Customer {
  id: string;
  name: string;
  phone: string;
  total_purchases: number;
  total_spent: number;
  purchase_count: number;
  last_purchase: string;
}

export default function Customers() {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    const onSale = () => loadCustomers();
    window.addEventListener('pharmatrack:sale:created', onSale);
    return () => window.removeEventListener('pharmatrack:sale:created', onSale);
  }, []);

  const dedupeCustomers = (arr: any[]) => {
    const map = new Map<string, any>();

    const normalizePhone = (p: any) => {
      if (!p) return '';
      try {
        return String(p).replace(/[^0-9+]/g, '').replace(/^\+?0+/, '');
      } catch {
        return String(p);
      }
    };

    const normalizeEmail = (e: any) => (e ? String(e).trim().toLowerCase() : '');
    const normalizeName = (n: any) => (n ? String(n).trim().toLowerCase() : '');

    for (const c of arr) {
      const idKey = c?.id != null ? `id:${String(c.id)}` : null;
      const emailKey = c?.email ? `email:${normalizeEmail(c.email)}` : null;
      const phoneKey = c?.phone ? `phone:${normalizePhone(c.phone)}` : null;
      const nameKey = c?.name ? `name:${normalizeName(c.name)}` : null;

      const key = idKey ?? emailKey ?? phoneKey ?? nameKey ?? `raw:${JSON.stringify(c)}`;

      if (!map.has(key)) {
        // clone to avoid mutating source
        map.set(key, { ...c });
      } else {
        // merge numeric aggregates if present to avoid duplicates showing as separate rows
        const existing = map.get(key);
        if (typeof existing.total_purchases === 'number' && typeof c.total_purchases === 'number') {
          existing.total_purchases = existing.total_purchases + c.total_purchases;
        }
        if (typeof existing.total_spent === 'number' && typeof c.total_spent === 'number') {
          existing.total_spent = existing.total_spent + c.total_spent;
        }
        if (typeof existing.purchase_count === 'number' && typeof c.purchase_count === 'number') {
          existing.purchase_count = Math.max(existing.purchase_count, c.purchase_count);
        }
        // prefer most recent last_purchase
        try {
          const exDate = existing.last_purchase ? new Date(existing.last_purchase) : null;
          const cDate = c.last_purchase ? new Date(c.last_purchase) : null;
          if (!exDate || (cDate && cDate > exDate)) existing.last_purchase = c.last_purchase;
        } catch (e) {
          // ignore
        }
        map.set(key, existing);
      }
    }

    return Array.from(map.values());
  };

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await getCustomers(); // existing call
      setCustomers(dedupeCustomers(data));
    } catch (err) {
      console.error('Failed to load customers', err);
    } finally {
      setLoading(false);
    }
  };

  // If you add/refresh customers after an order, use this to update state safely:
  const upsertCustomer = (customer: any) => {
    setCustomers(prev => {
      const list = prev.filter(c => !(c.id && customer.id && c.id === customer.id));
      return [customer, ...list];
    });
  };

  const filteredCustomers = customers.filter((customer) => {
    const name = customer.name ? customer.name.toLowerCase() : '';
    const phone = customer.phone ? String(customer.phone) : '';
    return name.includes(searchTerm.toLowerCase()) || phone.includes(searchTerm);
  });

  // Diagnostic data when customers list is empty
  const [rawOrders, setRawOrders] = useState<any[] | null>(null);
  const [rawSales, setRawSales] = useState<any[] | null>(null);
  const [diagLoading, setDiagLoading] = useState(false);

  const loadDiagnostics = async () => {
    try {
      setDiagLoading(true);
      const [orders, sales] = await Promise.all([
        getOrders({ limit: 50 }),
        getSalesData({ limit: 50 })
      ]);
      setRawOrders(Array.isArray(orders) ? orders : []);
      // getSalesData may return an object with results or an array
      if (Array.isArray(sales)) setRawSales(sales);
      else if (sales && Array.isArray((sales as any).results)) setRawSales((sales as any).results);
      else setRawSales([]);
    } catch (e) {
      console.error('Diagnostics fetch failed', e);
      setRawOrders([]);
      setRawSales([]);
    } finally {
      setDiagLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[300px] bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-sm text-yellow-900">
        <h3 className="font-semibold mb-2">Unable to load customers</h3>
        <pre className="whitespace-pre-wrap text-xs">{error}</pre>
        <div className="mt-4">
          <button onClick={loadCustomers} className="bg-green-600 text-white px-4 py-2 rounded">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('customers.title')}</h2>
          <p className="text-gray-600 mt-1">{t('customers.subtitle')}</p>
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-semibold">{customers.length}</span> {t('customers.total_label')}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg  border border-gray-200 p-4">
        <div className="relative max-w-md">
          <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={t('customers.search.placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('customers.no_found.title')}</h3>
            <p className="text-gray-600">
              {searchTerm ? t('customers.no_found.try') : t('customers.no_data')}
            </p>

            {/* Diagnostics for developers: show raw orders/sales when customers list is empty */}
            <div className="mt-6">
              <p className="text-sm text-gray-500 mb-2">Diagnostics</p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={loadDiagnostics}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm"
                >
                  {diagLoading ? 'Loading...' : 'Load raw orders & sales'}
                </button>
              </div>

              {rawOrders && (
                <div className="mt-4 text-left max-w-2xl mx-auto">
                  <div className="text-sm text-gray-700 font-semibold">Orders ({rawOrders.length})</div>
                  <pre className="text-xs text-gray-600 max-h-40 overflow-auto bg-gray-50 p-2 rounded mt-2">{JSON.stringify(rawOrders.slice(0,5), null, 2)}</pre>
                </div>
              )}

              {rawSales && (
                <div className="mt-4 text-left max-w-2xl mx-auto">
                  <div className="text-sm text-gray-700 font-semibold">Sales ({rawSales.length})</div>
                  <pre className="text-xs text-gray-600 max-h-40 overflow-auto bg-gray-50 p-2 rounded mt-2">{JSON.stringify(rawSales.slice(0,5), null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        ) : (
          filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className="bg-white rounded-lg  border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{customer.name}</h3>
                  <div className="flex items-center gap-1 mt-1 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{customer.phone}</span>
                  </div>
                </div>
                  <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                  {customer.purchase_count} {customer.purchase_count === 1 ? t('customers.sales_singular') : t('customers.sales_plural')}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ShoppingCart className="w-4 h-4" />
                    <span>{t('customers.total_purchases')}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{customer.total_purchases} {t('customers.purchases_label') || 'items'}</span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    <span>{t('customers.total_spent')}</span>
                  </div>
                  <span className="font-semibold text-green-600">
                    ${customer.total_spent.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{t('customers.last_purchase')}</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {new Date(customer.last_purchase).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  {t('customers.customer_since')} {new Date(customer.last_purchase).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Customer Stats Summary */}
      {customers.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Insights</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{customers.length}</div>
              <div className="text-sm text-gray-600">Total Customers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                ${customers.reduce((sum, c) => sum + c.total_spent, 0).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Total Revenue</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {customers.reduce((sum, c) => sum + c.total_purchases, 0)}
              </div>
              <div className="text-sm text-gray-600">Items Sold</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {(customers.reduce((sum, c) => sum + c.total_spent, 0) / customers.length).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Avg. Customer Value</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}