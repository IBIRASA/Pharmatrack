import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Bell, Check } from 'lucide-react';
import * as notif from '../utils/notificationsApi';
import { confirmOrderDelivery } from '../utils/api';
import { useTranslation } from '../i18n';
import { showSuccess, showError } from '../utils/notifications';

export interface NotificationItem {
  id: number;
  verb: string;
  message: string;
  data?: any;
  read: boolean;
  created_at: string;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [showAll, setShowAll] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const { t } = useTranslation();

  // Hoisted function so it's safe to call from useEffect
  async function loadNotifications() {
    try {
      const res = await notif.getNotifications();
      setItems(res || []);
    } catch (e) {
      console.error('Failed to load notifications', e);
    }
  }

  useEffect(() => {
    let mounted = true;
    loadNotifications();

    // Poll for notifications every 10 seconds
    const iv = setInterval(() => {
      if (mounted) loadNotifications();
    }, 10000);

    const onDoc = (e: any) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') loadNotifications();
    };

    document.addEventListener('click', onDoc);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      mounted = false;
      clearInterval(iv);
      document.removeEventListener('click', onDoc);
      document.removeEventListener('visibilitychange', onVisibility);
    };

  }, []);

  const unread = items.filter((i) => !i.read).length;

  // Determine whether the current user is a patient so we only render patient-only actions
  const isPatient = (() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      const parsed = raw ? JSON.parse(raw) : null;
      const candidate = parsed?.user ?? parsed;
      if (!candidate) return false;
      return (candidate.user_type === 'patient' || candidate.userType === 'patient');
    } catch (e) {
      return false;
    }
  })();

  const markRead = async (id: number) => {
    try {
      await notif.markNotificationRead(id);
      setItems((prev) => prev.map((p) => (p.id === id ? { ...p, read: true } : p)));
    } catch (e) {
      console.error('Failed to mark read', e);
    }
  };

  const handleConfirmReceived = async (orderId: number, notifId?: number) => {
    try {
      // send confirm delivery for this order (patient confirms receipt)
      await confirmOrderDelivery(orderId, {});
      // mark notification read and refresh
      if (notifId) await notif.markNotificationRead(notifId);
      await loadNotifications();
      try { showSuccess('Delivery confirmed'); } catch {}
    } catch (e) {
      console.error('Failed to confirm delivery from notification', e);
      // Try to surface a helpful server message if available
  const serverMsg = (e && (((e as any).detail) || ((e as any).message) || ((e as any).error))) ? (((e as any).detail) || ((e as any).message) || ((e as any).error)) : null;
  try { showError(serverMsg || 'Failed to confirm delivery'); } catch {}
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button ref={btnRef} onClick={() => setOpen((s) => !s)} className="relative p-2 rounded-full hover:bg-gray-100 border border-gray-200 bg-white flex items-center gap-2">
        <Bell className="w-6 h-6 text-gray-800" />
        <span className="hidden sm:inline text-sm text-gray-700">Notifications</span>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{unread}</span>
        )}
      </button>
      {open && btnRef.current && typeof document !== 'undefined' && (() => {
        // compute fixed position anchored to button rect
        const rect = btnRef.current.getBoundingClientRect();
        const maxWidth = Math.min(320, Math.floor(window.innerWidth * 0.9));
        const width = maxWidth;
        const left = Math.min(Math.max(rect.right - width, 8), window.innerWidth - width - 8);
        const top = rect.bottom + 8;
        const style = { top, left, width };
        return createPortal(
          <div style={{ position: 'fixed', top: style.top, left: style.left, width: style.width, zIndex: 9999 }} className="bg-gray-100 border border-gray-200 rounded-lg shadow-lg origin-top-right text-white">
            <div className="p-3 border-b">
              <div className="flex items-center justify-between">
                {/* Use a literal, clear title so raw translation keys don't surface */}
                <div className="font-semibold text-gray-700">Notifications</div>
                <div className="text-sm text-gray-600">{items.length} total</div>
              </div>

              {/* Controls: toggle unread/all view */}
              <div className="mt-2 flex items-center gap-2">
                <button onClick={() => setShowAll((s) => !s)} className="text-sm text-gray-500 hover:underline">
                  {showAll ? 'Show unread' : `Show all (${items.length})`}
                </button>
              </div>

              {/* Quick action: open My Orders for patients */}
              <div className="mt-3">
                {(() => {
                  try {
                    const raw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
                    const parsed = raw ? JSON.parse(raw) : null;
                    const candidate = parsed?.user ?? parsed;
                    const isPatient = candidate && (candidate.user_type === 'patient' || candidate.userType === 'patient');
                    if (isPatient) {
                      return (
                        <button
                          onClick={() => {
                            // close dropdown and request orders modal open
                            setOpen(false);
                            window.dispatchEvent(new CustomEvent('pharmatrack:openOrders'));
                          }}
                          className="w-full text-left bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md font-semibold text-sm"
                        >
                          My Orders
                        </button>
                      );
                    }
                  } catch (e) {
                    // ignore parse errors
                  }
                  return null;
                })()}
              </div>
            </div>
              <div className="max-h-64 overflow-auto">
              {(!showAll && items.filter(n => !n.read).length === 0) && (
                <div className="p-4 text-sm text-white">{t('notifications.empty') || 'No notifications'}</div>
              )}
              {(showAll ? items : items.filter(n => !n.read)).map((n) => (
                <div key={n.id} className={`p-3 border-b border-gray-700 flex items-start gap-3 ${n.read ? 'bg-gray-200' : 'bg-gray-200'}`}>
                  <div className="flex-1">
                    <div className="text-sm text-gray-700 font-medium cursor-pointer" onClick={async () => {

                      try {
                        if (n.verb === 'order_rejected' || n.data?.contact_url) {
                          try { showError(n.message, { link: n.data?.contact_url || '/#contact', linkText: 'Contact' }); } catch (e) {}
                          // mark as read
                          try { await notif.markNotificationRead(n.id); setItems((prev) => prev.map((p) => (p.id === n.id ? { ...p, read: true } : p))); } catch (e) {}
                          setOpen(false);
                          return;
                        }
                       
                        const detail = n.data?.order_id ? { order_id: n.data.order_id } : {};
                        window.dispatchEvent(new CustomEvent('pharmatrack:openOrders', { detail }));
                        setOpen(false);
                      } catch (e) {
                       
                        window.dispatchEvent(new CustomEvent('pharmatrack:openOrders'));
                        setOpen(false);
                      }
                    }}>{n.message}</div>
                    <div className="text-xs text-gray-800 mt-1">{new Date(n.created_at).toLocaleString()}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {!n.read && (
                      <button onClick={() => markRead(n.id)} className="p-1 rounded-md text-white hover:bg-green-700">
                        <Check className="w-4 h-4 text-white" />
                      </button>
                    )}

                    {/* If this is an 'order_shipped' notification, allow the patient to confirm receipt directly */}
                    {isPatient && n.verb === 'order_shipped' && n.data?.order_id && (
                      <button onClick={() => handleConfirmReceived(n.data.order_id, n.id)} className="mt-2 bg-green-600 text-white px-2 py-1 rounded-md text-sm">
                        Confirm Received
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>,
          document.body
        );
      })()}
    </div>
  );
}
