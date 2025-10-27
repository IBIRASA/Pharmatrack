import { useEffect, useState } from "react";
import { getOrders } from "../../utils/api";
import { DollarSign, TrendingUp, Calendar, Loader } from "lucide-react";

export default function SalesReport() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [totalSales, setTotalSales] = useState(0);
  const [completedOrders, setCompletedOrders] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getOrders({ limit: 500 });
      setOrders(data);

      const completed = data.filter((o: any) => o.status === "completed");
      setCompletedOrders(completed.length);

      const total = completed.reduce(
        (sum: number, o: any) => sum + parseFloat(o.total_amount || 0),
        0
      );
      setTotalSales(total);
    } catch (error) {
      console.error("Error loading sales data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  const groupByDate = () => {
    const grouped: { [key: string]: number } = {};
    orders
      .filter((o) => o.status === "completed")
      .forEach((order) => {
        const date = new Date(order.created_at).toLocaleDateString();
        grouped[date] = (grouped[date] || 0) + parseFloat(order.total_amount || 0);
      });
    return grouped;
  };

  const salesByDate = groupByDate();
  const dates = Object.keys(salesByDate).sort().slice(-7); // Last 7 days

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Sales Report</h2>
        <p className="text-gray-600 mt-1">View your sales analytics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-500 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-gray-600 text-sm">Total Sales</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            ${totalSales.toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-500 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-gray-600 text-sm">Completed Orders</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {completedOrders}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-500 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-gray-600 text-sm">Average Order</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            $
            {completedOrders > 0
              ? (totalSales / completedOrders).toFixed(2)
              : "0.00"}
          </p>
        </div>
      </div>

      {/* Sales by Date */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">
            Sales by Date (Last 7 Days)
          </h3>
        </div>
        <div className="p-6">
          {dates.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No sales data available
            </div>
          ) : (
            <div className="space-y-4">
              {dates.map((date) => (
                <div
                  key={date}
                  className="flex items-center justify-between border-b pb-3"
                >
                  <span className="text-gray-700 font-medium">{date}</span>
                  <span className="text-lg font-bold text-green-600">
                    ${salesByDate[date].toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.slice(0, 10).map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    ORD-{String(order.id).padStart(3, "0")}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {order.customer_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    ${parseFloat(order.total_amount).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        order.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : order.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
