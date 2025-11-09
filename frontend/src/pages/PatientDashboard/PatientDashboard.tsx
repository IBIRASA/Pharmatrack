import React, { useEffect, useState } from "react";
import PatientActionCards from "./PatientActionCards";
import PatientSettings from "./PatientSettings";
import { getCurrentUser } from "../../utils/auth";
import { LogOut, Search, MapPin, User, Home, Hospital } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MedicineSearch from "./MedicineSearch";
import NearbyPharmacies from "./NearbyPharmacies";
import logo from '../../assets/logo.png';

type ActiveView = "home" | "search" | "nearby" | "settings";

type AuthUser = {
  id?: string;
  username?: string;
  email?: string;
  user_type?: string;
  role?: string;
  access?: string;
};

const PatientDashboardApp: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>("home");
  const navigate = useNavigate();

  useEffect(() => {
    const user = getCurrentUser() as unknown as AuthUser | null;
    const isPatient = (u: AuthUser | null) =>
      (u?.user_type ?? u?.role) === "patient";

    if (!isPatient(user)) {
      navigate('/login', { replace: true });
    } else {
      setCurrentUser(user);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setCurrentUser(null);
    navigate('/login', { replace: true });
  };

  const renderContent = () => {
    switch (activeView) {
      case "search":
        return <MedicineSearch />;
      case "nearby":
        return <NearbyPharmacies />;
      case "settings":
        return <PatientSettings />;
      default:
        return (
          <div className="space-y-8">
            
            <div className="bg-linear-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white">
              <h1 className="text-4xl font-bold mb-2">Welcome!</h1>
              <p className="text-green-100 text-lg">
                Find medicines and locate nearby pharmacies with ease
              </p>
            </div>

            <PatientActionCards
              onSearchMedicine={() => setActiveView("search")}
              onFindNearby={() => setActiveView("nearby")}
            />
        <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Search Medicine</h3>
                  <p className="text-gray-600 text-sm">
                    Enter the name of the medicine you're looking for
                  </p>
                </div>

                <div className="text-center">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Hospital className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Find Pharmacies</h3>
                  <p className="text-gray-600 text-sm">
                    View all nearby pharmacies that have your medicine
                  </p>
                </div>

                <div className="text-center">
                  <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Get Directions</h3>
                  <p className="text-gray-600 text-sm">
                    Navigate to the pharmacy with one click
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="PharmaTrack logo"
                className="w-10 h-10 rounded-md object-contain shadow-md" 
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">PharmaTrack</h1>
                <p className="text-xs text-gray-600">Patient Portal</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold text-gray-900">{currentUser.username}</p>
                <p className="text-xs text-gray-600">{currentUser.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2 font-semibold shadow-md transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveView("home")}
              className={`py-4 px-6 border-b-2 font-semibold text-sm flex items-center gap-2 whitespace-nowrap transition-all ${
                activeView === "home"
                  ? "border-green-600 text-green-600 bg-green-50"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Home className="w-4 h-4" />
              Home
            </button>

            <button
              onClick={() => setActiveView("search")}
              className={`py-4 px-6 border-b-2 font-semibold text-sm flex items-center gap-2 whitespace-nowrap transition-all ${
                activeView === "search"
                  ? "border-green-600 text-green-600 bg-green-50"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Search className="w-4 h-4" />
              Search Medicines
            </button>

            <button
              onClick={() => setActiveView("nearby")}
              className={`py-4 px-6 border-b-2 font-semibold text-sm flex items-center gap-2 whitespace-nowrap transition-all ${
                activeView === "nearby"
                  ? "border-green-600 text-green-600 bg-green-50"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <MapPin className="w-4 h-4" />
              Nearby Pharmacies
            </button>

            <button
              onClick={() => setActiveView("settings")}
              className={`py-4 px-6 border-b-2 font-semibold text-sm flex items-center gap-2 whitespace-nowrap transition-all ${
                activeView === "settings"
                  ? "border-green-600 text-green-600 bg-green-50"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <User className="w-4 h-4" />
              Settings
            </button>
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default PatientDashboardApp;