// import { useEffect, useState } from "react";
// import { getOrders } from "../../utils/api";
// import { DollarSign, TrendingUp, Calendar, Loader } from "lucide-react";

// export default function SalesReport() {
//   const [loading, setLoading] = useState(true);
//   const [orders, setOrders] = useState<any[]>([]);
//   const [totalSales, setTotalSales] = useState(0);
//   const [completedOrders, setCompletedOrders] = useState(0);

//   useEffect(() => {
//     loadData();
//   }, []);

//   const loadData = async () => {
//     try {
//       setLoading(true);
//       const data = await getOrders({ limit: 500 });
//       setOrders(data);

//       const completed = data.filter((o: any) => o.status === "completed");
//       setCompletedOrders(completed.length);

//       const total = completed.reduce(
//         (sum: number, o: any) => sum + parseFloat(o.total_amount || 0),
//         0
//       );
//       setTotalSales(total);
//     } catch (error) {
//       console.error("Error loading sales data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-[300px] flex items-center justify-center">
//         <Loader className="w-8 h-8 animate-spin text-green-600" />
//       </div>
//     );
//   }

//   const groupByDate = () => {
//     const grouped: { [key: string]: number } = {};
//     orders
//       .filter((o) => o.status === "completed")
//       .forEach((order) => {
//         const date = new Date(order.created_at).toLocaleDateString();
//         grouped[date] = (grouped[date] || 0) + parseFloat(order.total_amount || 0);
//       });
//     return grouped;
//   };

//   const salesByDate = groupByDate();
//   const dates = Object.keys(salesByDate).sort().slice(-7); // Last 7 days

//   return (
//     <div className="space-y-6">
//       <div>
//         <h2 className="text-2xl font-bold text-gray-900">Sales Report</h2>
//         <p className="text-gray-600 mt-1">View your sales analytics</p>
//       </div>

//       {/* Summary Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
//           <div className="flex items-center justify-between mb-4">
//             <div className="bg-green-500 p-3 rounded-lg">
//               <DollarSign className="w-6 h-6 text-white" />
//             </div>
//           </div>
//           <p className="text-gray-600 text-sm">Total Sales</p>
//           <p className="text-2xl font-bold text-gray-900 mt-1">
//             ${totalSales.toFixed(2)}
//           </p>
//         </div>

//         <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
//           <div className="flex items-center justify-between mb-4">
//             <div className="bg-blue-500 p-3 rounded-lg">
//               <TrendingUp className="w-6 h-6 text-white" />
//             </div>
//           </div>
//           <p className="text-gray-600 text-sm">Completed Orders</p>
//           <p className="text-2xl font-bold text-gray-900 mt-1">
//             {completedOrders}
//           </p>
//         </div>

//         <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
//           <div className="flex items-center justify-between mb-4">
//             <div className="bg-purple-500 p-3 rounded-lg">
//               <Calendar className="w-6 h-6 text-white" />
//             </div>
//           </div>
//           <p className="text-gray-600 text-sm">Average Order</p>
//           <p className="text-2xl font-bold text-gray-900 mt-1">
//             $
//             {completedOrders > 0
//               ? (totalSales / completedOrders).toFixed(2)
//               : "0.00"}
//           </p>
//         </div>
//       </div>

//       {/* Sales by Date */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200">
//         <div className="p-6 border-b">
//           <h3 className="text-lg font-semibold">
//             Sales by Date (Last 7 Days)
//           </h3>
//         </div>
//         <div className="p-6">
//           {dates.length === 0 ? (
//             <div className="text-center py-10 text-gray-500">
//               No sales data available
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {dates.map((date) => (
//                 <div
//                   key={date}
//                   className="flex items-center justify-between border-b pb-3"
//                 >
//                   <span className="text-gray-700 font-medium">{date}</span>
//                   <span className="text-lg font-bold text-green-600">
//                     ${salesByDate[date].toFixed(2)}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Recent Orders Table */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200">
//         <div className="p-6 border-b">
//           <h3 className="text-lg font-semibold">Recent Orders</h3>
//         </div>
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                   Order ID
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                   Customer
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                   Date
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                   Amount
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                   Status
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="divide-y">
//               {orders.slice(0, 10).map((order) => (
//                 <tr key={order.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 text-sm font-medium text-gray-900">
//                     ORD-{String(order.id).padStart(3, "0")}
//                   </td>
//                   <td className="px-6 py-4 text-sm text-gray-700">
//                     {order.customer_name}
//                   </td>
//                   <td className="px-6 py-4 text-sm text-gray-700">
//                     {new Date(order.created_at).toLocaleDateString()}
//                   </td>
//                   <td className="px-6 py-4 text-sm font-semibold text-gray-900">
//                     ${parseFloat(order.total_amount).toFixed(2)}
//                   </td>
//                   <td className="px-6 py-4">
//                     <span
//                       className={`px-3 py-1 text-xs font-semibold rounded-full ${
//                         order.status === "completed"
//                           ? "bg-green-100 text-green-700"
//                           : order.status === "pending"
//                           ? "bg-yellow-100 text-yellow-700"
//                           : "bg-gray-100 text-gray-700"
//                       }`}
//                     >
//                       {order.status}
//                     </span>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { getSalesReports, getMockSalesHistory, getDashboardStats } from "../../utils/api";
import { DollarSign, TrendingUp, Calendar, Loader, BarChart3, Users, Package } from "lucide-react";

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
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<SalesReport[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [recentSales, setRecentSales] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load all data in parallel
      const [reportData, statsData, salesData] = await Promise.all([
        getSalesReports(period),
        getDashboardStats(),
        getMockSalesHistory(1, 10)
      ]);

      setReports(reportData);
      setStats(statsData);
      setRecentSales(salesData.results);
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
          <h2 className="text-2xl font-bold text-gray-900">Sales Analytics</h2>
          <p className="text-gray-600 mt-1">Comprehensive sales reports and insights</p>
        </div>
        <div className="flex gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as 'daily' | 'weekly' | 'monthly')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
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
            <p className="text-gray-600 text-sm">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              ${stats.total_revenue}
            </p>
            <p className="text-xs text-gray-500 mt-1">{stats.total_sales} total sales</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-500 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-gray-600 text-sm">Monthly Revenue</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              ${stats.monthly_revenue}
            </p>
            <p className="text-xs text-gray-500 mt-1">{stats.monthly_sales} this month</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-500 p-3 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-gray-600 text-sm">Total Customers</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {stats.total_customers}
            </p>
            <p className="text-xs text-gray-500 mt-1">Unique customers</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-500 p-3 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-gray-600 text-sm">Average Order</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              ${stats.average_order_value}
            </p>
            <p className="text-xs text-gray-500 mt-1">Per transaction</p>
          </div>
        </div>
      )}

      {/* Sales Report Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Sales Report ({period.charAt(0).toUpperCase() + period.slice(1)})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sales Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Average Ticket
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium">No sales data available</p>
                    <p className="text-sm mt-1">Sales will appear here after transactions</p>
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
          <h3 className="text-lg font-semibold">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Medicine
                </th>
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
                    No recent transactions
                  </td>
                </tr>
              ) : (
                recentSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono text-gray-900">
                      {sale.transaction_id || sale.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{sale.customer_name}</div>
                        <div className="text-gray-500 text-xs">{sale.customer_phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {sale.medicine_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {sale.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600">
                      ${sale.total_price}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {new Date(sale.sale_date).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}