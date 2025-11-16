import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { User, Lock, Save, Bell, Sun, Moon } from "lucide-react";
import { useTranslation } from "../../i18n";
import { useTheme } from "../../context/ThemeContext";
import { updateCurrentUser } from '../../utils/api';
import { showSuccess, showError, showInfo } from '../../utils/notifications';

export default function PharmacySettings() {
  const { user, setAuth } = useAuth();
  const { t } = useTranslation();
  const [profileData, setProfileData] = useState({
    username: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
  });

  // Keep local form state in sync when AuthContext's user updates (after save or login)
  useEffect(() => {
    setProfileData({
      username: user?.name || "",
      email: user?.email || "",
      phone: (user as any)?.phone || "",
      address: (user as any)?.address || "",
    });
  }, [user]);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    lowStockAlerts: true,
    orderNotifications: true,
  });
  const { theme, toggle } = useTheme();

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Persist profile changes to the backend and update local auth state
    (async () => {
      try {
        setSaving(true);
        // build a minimal payload containing only changed fields
        const payload: any = {};
        if ((user as any)?.name !== profileData.username) payload.name = profileData.username;
        if ((user as any)?.phone !== profileData.phone) payload.phone = profileData.phone;
        if ((user as any)?.address !== profileData.address) payload.address = profileData.address;
        if ((user as any)?.email !== profileData.email) payload.email = profileData.email;

        if (Object.keys(payload).length === 0) {
          try { showInfo('No changes to save'); } catch {}
          setSaving(false);
          return;
        }

        const updated = await updateCurrentUser(payload);
        // merge updated fields into existing user object while preserving token
        const token = localStorage.getItem('token');
        const mergedUser = { ...(user as any), ...updated };
        setAuth({ token: token, user: mergedUser as any });
  try { showSuccess('Profile updated'); } catch {}
      } catch (err: any) {
  console.error('Failed to update profile', err);
  try { showError(err?.detail || 'Failed to update profile'); } catch {}
      } finally {
        setSaving(false);
      }
    })();
  };

  const [saving, setSaving] = useState(false);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      try { showError(t('patient.settings.password_mismatch') || 'Passwords do not match!'); } catch {}
      return;
    }
    try { showSuccess('Password changed successfully!'); } catch {}
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotificationSettings({ ...notificationSettings, [key]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{t('nav.settings')}</h2>
        <p className="text-gray-600 mt-1">{t('patient.settings.subtitle')}</p>
      </div>

      {/* Profile Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b flex items-center gap-3">
          <User className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold">{t('patient.settings.profile_info')}</h3>
        </div>
        <form onSubmit={handleProfileSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                value={profileData.username}
                onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <input
                type="text"
                value={profileData.address}
                onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            type="submit"
            className={`flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={saving}
            aria-busy={saving}
          >
            <Save className="w-4 h-4" />
            {t('patient.settings.save_changes')}
          </button>
        </form>
      </div>

      {/* Password Change */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b flex items-center gap-3">
          <Lock className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold">{t('patient.settings.change_password')}</h3>
        </div>
        <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            type="submit"
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            <Save className="w-4 h-4" />
            {t('patient.settings.save_changes')}
          </button>
        </form>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b flex items-center gap-3">
          <Bell className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold">{t('settings.notifications.title') || 'Notification Preferences'}</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-600">Receive updates via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationSettings.emailNotifications}
                onChange={(e) => handleNotificationChange("emailNotifications", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Low Stock Alerts</p>
              <p className="text-sm text-gray-600">Get notified when inventory is low</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationSettings.lowStockAlerts}
                onChange={(e) => handleNotificationChange("lowStockAlerts", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Order Notifications</p>
              <p className="text-sm text-gray-600">Receive alerts for new orders</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationSettings.orderNotifications}
                onChange={(e) => handleNotificationChange("orderNotifications", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Appearance / Theme */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b flex items-center gap-3">
          <User className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold">{t('settings.appearance.title') || 'Appearance'}</h3>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{t('settings.appearance.label') || 'Theme'}</p>
              <p className="text-sm text-gray-600">{t('settings.appearance.description') || 'Switch between light and dark mode'}</p>
            </div>
            <div>
              <button
                onClick={toggle}
                className="inline-flex items-center gap-3 px-4 py-2 rounded-full border bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:border-gray-700"
                aria-pressed={theme === 'dark'}
                title={theme === 'dark' ? (t('settings.appearance.dark') || 'Dark') : (t('settings.appearance.light') || 'Light')}
              >
                {theme === 'dark' ? (
                  <>
                    <Moon className="w-5 h-5 text-yellow-300" />
                    <span className="text-sm">{t('settings.appearance.dark') || 'Dark'}</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm">{t('settings.appearance.light') || 'Light'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
