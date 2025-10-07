import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { FaPills, FaShoppingCart, FaExclamationTriangle, FaCalendarAlt, FaSignOutAlt, FaCog, FaChartLine, FaFileAlt } from "react-icons/fa";

const Dashboard: React.FC = () => {
  const data = [
    { name: "January", Highest: 80, Lowest: 30 },
    { name: "February", Highest: 50, Lowest: 25 },
    { name: "March", Highest: 70, Lowest: 30 },
    { name: "April", Highest: 85, Lowest: 25 },
    { name: "May", Highest: 0, Lowest: 0 },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-green-900 text-white flex flex-col justify-between">
        <div>
          <div className="text-2xl font-bold text-center py-4">PharmaDash</div>
          <nav className="mt-4 space-y-2">
            <SidebarItem icon={<FaChartLine />} label="Dashboard" />
            <SidebarItem icon={<FaPills />} label="Medicines" active />
            <SidebarItem icon={<FaShoppingCart />} label="Sales" />
            <SidebarItem icon={<FaFileAlt />} label="Report" />
            <SidebarItem icon={<FaCog />} label="Settings" />
          </nav>
        </div>
        <button className="m-4 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 py-2 rounded-lg">
          <FaSignOutAlt /> Log Out
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* Search bar */}
        <div className="flex justify-between items-center mb-6">
          <input
            type="text"
            placeholder="Search Medicine"
            className="w-full max-w-xl rounded-full px-4 py-2 bg-gray-200 focus:outline-none"
          />
          <div className="ml-4 w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-600 font-bold">👤</span>
          </div>
        </div>

        {/* Dashboard Cards */}
        <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
        <div className="grid grid-cols-4 gap-4 mb-6">
          <DashboardCard color="bg-green-600" title="Medicines" value="2000" />
          <DashboardCard color="bg-blue-900" title="Today's Sales" value="1000" />
          <DashboardCard color="bg-red-700" title="Low Stock Alert" value="20" />
          <DashboardCard color="bg-orange-600" title="Expired Items" value="2" />
        </div>

        {/* Chart */}
        <h3 className="text-lg font-semibold mb-2">Sales Distribution by Item (%)</h3>
        <div className="bg-white p-4 rounded-2xl shadow-md">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Highest" fill="#a855f7" />
              <Bar dataKey="Lowest" fill="#fca5a5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </main>
    </div>
  );
};

// Sidebar Item Component
interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active }) => (
  <div
    className={`flex items-center gap-3 px-6 py-2 cursor-pointer rounded-md transition-all ${
      active ? "bg-purple-600" : "hover:bg-green-800"
    }`}
  >
    {icon}
    <span>{label}</span>
  </div>
);

// Dashboard Card Component
interface DashboardCardProps {
  color: string;
  title: string;
  value: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ color, title, value }) => (
  <div className={`${color} text-white rounded-xl p-4`}>
    <div className="flex flex-col justify-between h-full">
      <div>
        <p className="text-sm">Report</p>
        <h4 className="text-lg font-bold">{title}</h4>
      </div>
      <p className="text-right text-2xl font-semibold">{value}</p>
    </div>
  </div>
);

export default Dashboard;
