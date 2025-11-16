import { useEffect, useState, useRef } from 'react';
import type { ReactNode } from 'react';
import { BANNER_TIMEOUT_MS } from '../utils/toastConfig';

export type BannerType = 'success' | 'error' | 'info';

interface Banner {
  id: string;
  message: string | ReactNode;
  type: BannerType;
  link?: string;
  linkText?: string;
}

export default function PageBanner() {
  const [banners, setBanners] = useState<Banner[]>([]);
 
  const timersRef = useRef<Record<string, number>>({});

  useEffect(() => {

    try {
      const key = 'pharmatrack_pending_toasts';
      const raw = sessionStorage.getItem(key);
      if (raw) {
        const arr = JSON.parse(raw) as Array<{ message: string; type?: string; link?: string; linkText?: string; ts?: number }>;
        if (Array.isArray(arr) && arr.length > 0) {
          const now = Date.now();
          const RECENT_MS = 15 * 1000; // 15 seconds
          const recent = arr.filter((t) => t?.ts && (now - t.ts) <= RECENT_MS);
     
          try { sessionStorage.removeItem(key); } catch (e) {}
         
          const MAX_PENDING = 3;
          const seen = new Set<string>();
          const uniqueRecent = recent.filter((t) => {
            const msg = String(t?.message || '');
            if (seen.has(msg)) return false;
            seen.add(msg);
            return true;
          }).slice(0, MAX_PENDING);
          if (recent.length > 0) {
            const newB = uniqueRecent.map((t, i) => ({ id: `pending-${now}-${i}`, message: t.message, type: (t.type as BannerType) || 'info', link: t.link, linkText: t.linkText }));
         
            setBanners((s) => {
              const combined = [...newB, ...s];
              return combined.slice(0, 3);
            });
            newB.forEach((b) => {
              const tid = window.setTimeout(() => {
                setBanners((s) => s.filter((x) => x.id !== b.id));
                try { delete timersRef.current[b.id]; } catch (e) {}
                console.debug('PageBanner: auto-removed pending banner', b.id);
              }, BANNER_TIMEOUT_MS);
              timersRef.current[b.id] = Number(tid);
              console.debug('PageBanner: scheduled pending auto-dismiss', b.id, timersRef.current[b.id]);
            });
          }
        }
      }
    } catch (e) {
      // ignore
    }
  
    const mountReadyRef = { current: false } as { current: boolean };

    const STABILIZE_MS = 500;
    const stabilizeTid = window.setTimeout(() => { mountReadyRef.current = true; }, STABILIZE_MS);

    const onToast = (e: any) => {
      try {
        const detail = e?.detail || {};

        if (!mountReadyRef.current && !detail?.persist) {
        
          console.debug('PageBanner: ignored toast during initial mount', detail?.message);
          return;
        }

        const msg = detail?.message || 'Notification';
        const type = (detail?.type as BannerType) || 'info';
        const link = detail?.link;
        const linkText = detail?.linkText;
        const id = `toast-${Date.now()}-${Math.random()}`;
        setBanners((s) => {
          const combined = [{ id, message: msg, type, link, linkText }, ...s];
          return combined.slice(0, 3);
        });
        // auto-dismiss after configured timeout
        const tid = window.setTimeout(() => {
          setBanners((s) => s.filter((b) => b.id !== id));
          try { delete timersRef.current[id]; } catch (e) {}
          console.debug('PageBanner: auto-removed toast', id);
        }, BANNER_TIMEOUT_MS);
        timersRef.current[id] = Number(tid);
        console.debug('PageBanner: scheduled toast auto-dismiss', id, timersRef.current[id]);
      } catch (err) {
        // ignore
      }
    };

    window.addEventListener('pharmatrack:toast', onToast as EventListener);
    return () => {
      try { clearTimeout(stabilizeTid); } catch (e) {}
      window.removeEventListener('pharmatrack:toast', onToast as EventListener);
    };
  }, []);

  const remove = (id: string) => {
    // clear any pending timeout
    try {
        const tid = timersRef.current[id];
        if (typeof tid !== 'undefined' && tid !== null) {
          clearTimeout(Number(tid));
          delete timersRef.current[id];
          console.debug('PageBanner: cleared timeout for', id);
        }
    } catch (e) {}
    setBanners((s) => s.filter((b) => b.id !== id));
  };

  // cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        Object.values(timersRef.current || {}).forEach((tid: any) => clearTimeout(tid));
      } catch (e) {}
    };
  }, []);


  useEffect(() => {
    try {
      banners.forEach((b) => {
     
        if (Object.prototype.hasOwnProperty.call(timersRef.current, b.id)) return;
        const tid = window.setTimeout(() => {
          setBanners((s) => s.filter((x) => x.id !== b.id));
          try { delete timersRef.current[b.id]; } catch (e) {}
          console.debug('PageBanner: safety auto-removed toast', b.id);
        }, BANNER_TIMEOUT_MS);
        timersRef.current[b.id] = Number(tid);
        console.debug('PageBanner: safety scheduled auto-dismiss for', b.id, timersRef.current[b.id]);
      });
    } catch (e) {
      // ignore
    }
  }, [banners]);

  if (banners.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-70 flex flex-col items-center gap-2 w-full max-w-3xl px-4">
      {banners.map((b) => {
        const bg = b.type === 'success' ? 'bg-green-600' : b.type === 'error' ? 'bg-red-600' : 'bg-blue-600';
        return (
          <div key={b.id} className={`${bg} text-white rounded-md shadow-md w-full flex items-center justify-between gap-4 p-3`} role="status" aria-live="polite">
            <div className="text-sm font-medium">
              {typeof b.message === 'string' ? <span>{b.message} {b.link && (<a href={b.link} className="underline ml-2 text-white font-semibold">{b.linkText || 'Contact'}</a>)}</span> : b.message}
            </div>
            <button onClick={() => remove(b.id)} className="text-white opacity-90 hover:opacity-100 ml-4 text-sm">Dismiss</button>
          </div>
        );
      })}
    </div>
  );
}
