import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../utils/api";
import { UserPlus, Mail, Lock, User, Phone, MapPin, AlertCircle,Hospital } from "lucide-react";
import logo from "../assets/logo.png";
import { useTranslation } from '../i18n';
export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    password_confirm: "",
    user_type: "patient" as "patient" | "pharmacy",
    name: "",
    phone: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.password_confirm) {
      setError(t('auth.register.password_mismatch'));
      return;
    }

    setLoading(true);
    try {
      await registerUser(formData);
      navigate("/login", { replace: true });
    } catch (err: any) {
      setError(err?.detail || t('auth.register.failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-white to-blue-50 flex items-center justify-center px-4 py-12" data-aos="zoom-out">
      <div className="max-w-lg w-full bg-white/80 backdrop-blur-lg border border-gray-100 rounded-3xl shadow-2xl p-8 space-y-8">
        {/* Logo */}
        <div className="text-center">
          <img
            src={logo}
            alt={t('alt.logo') || 'PharmaFinder logo'}
            className="w-20 h-20 mx-auto rounded-full object-contain shadow-md mb-4"
          />
          
          <h2 className="text-3xl font-bold text-gray-900">{t('auth.register.title')}</h2>
          <p className="mt-2 text-gray-600">
            {t('auth.register.subtitle').replace('{app}', 'PharmaFinder')}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 font-semibold">{t('error.title')}</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* User Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              {t('auth.register.user_type')}
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, user_type: "patient" })
                }
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.user_type === "patient"
                    ? "border-green-600 bg-green-50 text-green-700 shadow-md"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <User className="w-6 h-6 mx-auto mb-2" />
                <span className="font-semibold">{t('auth.register.patient')}</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, user_type: "pharmacy" })
                }
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.user_type === "pharmacy"
                    ? "border-green-600 bg-green-50 text-green-700 shadow-md"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Hospital className="w-6 h-6 mx-auto mb-2" />
                <span className="font-semibold">{t('auth.register.pharmacy')}</span>
              </button>
            </div>
          </div>

          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              {formData.user_type === "pharmacy"
                ? t('auth.register.name.pharmacy')
                : t('auth.register.name.person')}
            </label>
            <input
              id="name"
              type="text"
              required
              disabled={loading}
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 transition-all"
              placeholder={
                formData.user_type === "pharmacy"
                  ? t('auth.register.placeholder.address')
                  : t('auth.register.placeholder.name')
              }
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              {t('auth.register.email')}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="email"
                type="email"
                required
                disabled={loading}
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 transition-all"
                placeholder={t('auth.register.placeholder.email')}
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              {t('auth.register.phone')}
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="phone"
                type="tel"
                required
                disabled={loading}
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 transition-all"
                placeholder={t('auth.register.placeholder.phone')}
              />
            </div>
          </div>

          {/* Address (Only for Pharmacy) */}
          {formData.user_type === "pharmacy" && (
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                {t('auth.register.address')}
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="address"
                  type="text"
                  required
                  disabled={loading}
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 transition-all"
                  placeholder={t('auth.register.placeholder.address')}
                />
              </div>
            </div>
          )}

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              {t('auth.register.password')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="password"
                type="password"
                required
                disabled={loading}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 transition-all"
                placeholder={t('auth.register.placeholder.password') ?? 'Create a strong password'}
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="password_confirm"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              {t('auth.register.confirm_password')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="password_confirm"
                type="password"
                required
                disabled={loading}
                value={formData.password_confirm}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    password_confirm: e.target.value,
                  })
                }
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 transition-all"
                placeholder={t('auth.register.placeholder.confirm') ?? 'Confirm your password'}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-xl hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                {t('auth.register.creating')}
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                {t('auth.register.create')}
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            {t('auth.register.already')} {" "}
            <Link
              to="/login"
              className="text-green-600 font-semibold hover:text-green-700 hover:underline transition-colors"
            >
              {t('auth.register.signin')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
