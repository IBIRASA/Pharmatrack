import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { useAuth } from './context/AuthContext';
import * as AOS from "aos";
import "aos/dist/aos.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PatientDashboard from "./pages/PatientDashboard/PatientDashboard";
import PharmacyDashboard from "./pages/PharmacyDashboard/PharmacyDashboard";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";
import PageBanner from './components/PageBanner';

function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);
  // PageBanner handles persistence and listening for toast events.
  return (
    <BrowserRouter>
      {/* Page-level persistent banners (dismissible) */}
      <PageBanner />
      {/* PageBanner displays messages (large banners). Small floating toasts removed per user preference. */}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/patient-dashboard"
          element={
            <ProtectedRoute>
              <PatientDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pharmacy-dashboard/*"
          element={
            <ProtectedRoute>
              <PharmacyDashboard />
            </ProtectedRoute>
          }
        />

        {/* single catch-all route for unmatched URLs */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
