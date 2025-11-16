
import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  TrendingUp as TrendingUpIcon,
  Package as PackageIcon,
  ShoppingCart as ShoppingCartIcon,
  Users as UsersIcon,
  Calendar as CalendarIcon,
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import NotificationBell from './NotificationBell';
import { useTranslation } from '../i18n';

type IconType = React.ComponentType<{ className?: string }>;


export default function PharmacySidebar() {
  const { t } = useTranslation();
  const items: Array<{ to: string; label: string; icon: IconType; end?: boolean }> = [
    { to: '/pharmacy-dashboard', label: t('pharmacy.side.overview'), icon: TrendingUpIcon, end: true },
    { to: '/pharmacy-dashboard/inventory', label: t('pharmacy.side.inventory'), icon: PackageIcon },
    { to: '/pharmacy-dashboard/orders', label: t('pharmacy.side.orders'), icon: ShoppingCartIcon },
    { to: '/pharmacy-dashboard/customers', label: t('pharmacy.side.customers'), icon: UsersIcon },
    { to: '/pharmacy-dashboard/reports', label: t('pharmacy.side.reports'), icon: CalendarIcon },
    { to: '/pharmacy-dashboard/settings', label: t('pharmacy.side.settings'), icon: SettingsIcon },
  ];
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setMobileOpen((prev) => !prev);
    window.addEventListener('toggleSidebar', handleToggle);
    return () => window.removeEventListener('toggleSidebar', handleToggle);
  }, []);

  return (
    <>
      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0  bg-black/30 bg-opacity-40 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-screen bg-white border-r border-gray-200 z-50 transform transition-all duration-300
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 
        ${collapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Collapse / Expand Button (desktop only) */}
          <div className="hidden md:flex items-center justify-end p-3 border-b">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
            aria-label={t('aria.toggle_sidebar') || 'Toggle sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            )}
          </button>
          <div className="mr-3">
            <NotificationBell />
          </div>
        </div>

        {/* Sidebar Menu */}
        <nav className="p-4 space-y-1 h-full overflow-y-hidden">
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md font-semibold'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-green-600'
                }`
              }
              onClick={() => setMobileOpen(false)}
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                  {!collapsed && <span className="whitespace-nowrap">{label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
