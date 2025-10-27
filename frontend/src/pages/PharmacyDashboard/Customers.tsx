import { useEffect, useMemo, useState } from 'react';
import { getOrders } from '../../utils/api';

export default function Customers() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setOrders(await getOrders({ limit: 200 }));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const customers = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((o) => {
      const key = o.customer_name || 'Unknown';
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, orders: count }));
  }, [orders]);

  if (loading) return <div>Loading customers...</div>;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold">Customers</h2>
      </div>
      <div className="divide-y">
        {customers.map((c) => (
          <div key={c.name} className="px-6 py-4 flex items-center justify-between">
            <div className="font-medium text-gray-900">{c.name}</div>
            <div className="text-sm text-gray-600">{c.orders} orders</div>
          </div>
        ))}
        {customers.length === 0 && <div className="px-6 py-10 text-center text-gray-500">No customers yet.</div>}
      </div>
    </div>
  );
}