import React from "react";
import { Home, Search, Settings, LogOut } from "lucide-react";
import { getUserDisplayName, logout } from "../../utils/auth";
import { useNavigate } from "react-router-dom";

interface PatientHeaderProps {
  activeView: "home" | "search" | "settings";
  onNavigate: (view: "home" | "search" | "settings") => void;
}

const PatientHeader: React.FC<PatientHeaderProps> = ({ activeView, onNavigate }) => {
  const navigate = useNavigate();
  const displayName = getUserDisplayName();

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  const navItems = [
    { id: "home" as const, label: "Home", icon: Home },
    { id: "search" as const, label: "Search Medicine", icon: Search },
    { id: "settings" as const, label: "Settings", icon: Settings },
  ];

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate("home")}>
            <div className="bg-green-600 text-white w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xl">
              P
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">PharmaTrack</h1>
              <p className="text-xs text-gray-500">Patient Portal</p>
            </div>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeView === item.id ? "bg-green-600 text-white" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-gray-900">{displayName}</p>
              <p className="text-xs text-gray-500">Patient Account</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-2 pb-3 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  activeView === item.id ? "bg-green-600 text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

export default PatientHeader;
