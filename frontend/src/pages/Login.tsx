import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { Lock, AlertCircle, LogIn, Mail } from "lucide-react";
import logo from "../assets/logo.png"; 
import { useTranslation } from '../i18n';

export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    console.log('Attempting login with:', { email });
    
    try {
      const res = await loginUser({ email, password });
      console.log('Login response:', res); 
      
      // Update auth context
      setAuth({ token: res.token, user: res.user });
      
      // Determine destination
      const dest = res.user.user_type === "patient" ? "/patient-dashboard" : "/pharmacy-dashboard";
      console.log('Navigating to:', dest);
      
      // Navigate
      navigate(dest, { replace: true });
      
    } catch (err: any) {
  console.error('Login error:', err); // Debug log
  setError(err?.detail || t('auth.login.failed'));
    } finally {
      setLoading(false);
    }
  };

  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-white to-blue-50 flex items-center justify-center px-4 py-12" data-aos="zoom-out" >
      <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl p-8 border border-gray-100">
        {/* Logo */}
        <div className="text-center mb-4">
          <img
            src={logo}
            alt={t('alt.logo') || 'PharmaFinder logo'}
            className="w-20 h-20 mx-auto rounded-full object-contain shadow-md"  data-aos="zoom-out" 
          />
        </div>

        {/* Heading */}
        <div className="text-center">

          <h2 className="text-3xl font-bold text-gray-900">{t('auth.login.title')}</h2>
          <p className="mt-2 text-gray-600">
            {t('auth.login.subtitle').replace('{app}', 'PharmaFinder')}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 font-semibold">{t('error.title')}</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              {t('auth.login.email')}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="email"
                type="email"
                required
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 transition-all duration-300"
                placeholder={t('auth.login.placeholder.email')}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              {t('auth.login.password')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="password"
                type="password"
                required
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 transition-all duration-300"
                placeholder={t('auth.login.placeholder.password')}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-xl hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2 transition-colors duration-300 shadow-md hover:shadow-lg"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                {t('auth.login.signing')}
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                {t('auth.login.submit')}
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            {t('auth.no_account')}{" "}
            <Link
              to="/register"
              className="text-green-600 font-semibold hover:text-green-700 hover:underline transition-colors"
            >
              {t('auth.signup')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
