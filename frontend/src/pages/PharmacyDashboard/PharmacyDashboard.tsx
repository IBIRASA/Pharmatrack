import { Routes, Route } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LogOut, Menu } from "lucide-react";
import PharmacySidebar from "../../components/PharmacySidebar";
import Overview from "./Overview";
import InventoryManager from "./InventoryManager";
import Orders from "./Orders";
import Customers from "./Customers";
import SalesReport from "./SalesReport";
import PharmacySettings from "./PharmacySettings";

export default function PharmacyDashboard() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const handleSidebarToggle = () => {
    window.dispatchEvent(new CustomEvent("toggleSidebar"));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo + Hamburger */}
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              <button
                onClick={handleSidebarToggle}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                aria-label="Open sidebar"
              >
                <Menu className="w-6 h-6 text-gray-700" />
              </button>

              <div className="bg-green-600 text-white w-10 h-10 rounded-lg flex items-center justify-center font-bold shadow-md">
                P
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">PharmaTrack</h1>
                <p className="text-xs text-gray-600">Pharmacy Dashboard</p>
              </div>
            </div>

            {/* Right: User info + Logout */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name || user?.email}
                </p>
                <p className="text-xs text-gray-600 capitalize">
                  {user?.user_type}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2 text-sm sm:text-base font-medium transition-colors shadow-md hover:shadow-lg"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <PharmacySidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-4 sm:p-6 lg:p-8">
            <Routes>
              <Route index element={<Overview />} />
              <Route path="inventory" element={<InventoryManager />} />
              <Route path="orders" element={<Orders />} />
              <Route path="customers" element={<Customers />} />
              <Route path="reports" element={<SalesReport />} />
              <Route path="settings" element={<PharmacySettings />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}
