import { useEffect, useState } from 'react';
import { getCustomers } from '../../utils/api';
import { Users, Phone, Calendar, DollarSign, ShoppingCart, Loader } from 'lucide-react';
import { useTranslation } from '../../i18n';

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
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-green-600" />
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
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
          </div>
        ) : (
          filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
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