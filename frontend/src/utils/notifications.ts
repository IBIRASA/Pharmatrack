// Simple notification helper that standardizes how we show success/error/info messages.
// It dispatches the existing global 'pharmatrack:toast' (used by top-level dashboards)
// and falls back to window.alert when events are not supported.

export type ToastType = 'success' | 'error' | 'info';

export interface ToastOptions {
  link?: string; // optional URL to include in banner
  linkText?: string; // optional anchor text
}

export function showToast(message: string, type: ToastType = 'info', opts?: ToastOptions) {
  // Persist only when caller explicitly passes { persist: true }.
  // This opt-in ensures we don't replay historical notifications on refresh,
  // while allowing useful cross-navigation toasts (login -> dashboard).
  if (opts && (opts as any).persist) {
    try {
      const key = 'pharmatrack_pending_toasts';
      const raw = sessionStorage.getItem(key);
      const arr = raw ? JSON.parse(raw) : [];
      arr.push({ message, type, ts: Date.now(), link: opts?.link, linkText: opts?.linkText });
      try { sessionStorage.setItem(key, JSON.stringify(arr)); } catch (e) { /* ignore storage errors */ }
    } catch (e) {
      // ignore storage errors
    }
  }

  try {
    // include type and optional link in detail for PageBanner to render clickable anchors
    const detail: any = { message, type };
    if (opts?.link) detail.link = opts.link;
    if (opts?.linkText) detail.linkText = opts.linkText;
    // Mark explicit toasts intended for persistent banners
    if (opts && (opts as any).persist) detail.persist = true;
    window.dispatchEvent(new CustomEvent('pharmatrack:toast', { detail }));
  } catch (e) {
    // fallback
    try {
      // Prefer a non-blocking UI, but alert is available as last resort
      const prefix = type === 'success' ? 'Success: ' : type === 'error' ? 'Error: ' : '';
      window.alert(prefix + message);
    } catch (ex) {
      // ignore
    }
  }
}

export function showSuccess(message: string, opts?: ToastOptions) {
  showToast(message, 'success', opts);
}

export function showError(message: string, opts?: ToastOptions) {
  showToast(message, 'error', opts);
}

export function showInfo(message: string, opts?: ToastOptions) {
  showToast(message, 'info', opts);
}
