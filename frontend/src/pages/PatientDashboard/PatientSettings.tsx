import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { User, Mail, Lock, Save } from "lucide-react";
import { useTranslation } from '../../i18n';
import { updateCurrentUser } from '../../utils/api';
import { showSuccess, showError } from '../../utils/notifications';

const PatientSettings: React.FC = () => {
  const { user, setAuth } = useAuth();
  const [formData, setFormData] = useState({
    username: user?.name || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  // Sync local form with latest user data (so saving multiple times works)
  useEffect(() => {
    setFormData((f) => ({
      ...f,
      username: user?.name || "",
      email: user?.email || "",
    }));
  }, [user]);
  const [, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const { t } = useTranslation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    (async () => {
      setSaving(true);
      try {
        const payload: any = {};
        if ((user as any)?.name !== formData.username) payload.name = formData.username;
        if ((user as any)?.email !== formData.email) payload.email = formData.email;

        if (Object.keys(payload).length === 0) {
          setAlert({ type: 'success', message: t('patient.settings.profile_updated') });
          setTimeout(() => setAlert(null), 1500);
          setSaving(false);
          return;
        }

        const updated = await updateCurrentUser(payload);
        const token = localStorage.getItem('token');
        const mergedUser = { ...(user as any), ...updated };
        setAuth({ token: token, user: mergedUser as any });
  setAlert({ type: "success", message: t('patient.settings.profile_updated') });
  try { showSuccess(t('patient.settings.profile_updated')); } catch {}
        setTimeout(() => setAlert(null), 2500);
      } catch (err: any) {
  console.error('Failed to save profile', err);
  try { showError(err?.detail || 'Failed to save profile'); } catch {}
  setAlert({ type: 'error', message: err?.detail || 'Failed to save profile' });
        setTimeout(() => setAlert(null), 2500);
      } finally {
        setSaving(false);
      }
    })();
  };

  const [saving, setSaving] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-linear-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white shadow-lg">
        <h2 className="text-3xl font-bold mb-2">{t('patient.settings.title')}</h2>
        <p className="text-purple-50">{t('patient.settings.subtitle')}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Profile Info */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">{t('patient.settings.profile_info')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  {t('patient.settings.username')}
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  {t('patient.settings.email')}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{t('patient.settings.change_password')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="w-4 h-4 inline mr-2" />
                  {t('patient.settings.current_password')}
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('patient.settings.new_password')}</label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('patient.settings.confirm_password')}</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
              <button
              type="submit"
              disabled={saving}
              aria-busy={saving}
              className={`bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 font-semibold flex items-center gap-2 shadow-md transition-all ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <Save className="w-5 h-5" />
              {t('patient.settings.save_changes')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientSettings;
