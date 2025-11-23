

export type ToastType = 'success' | 'error' | 'info';

export interface ToastOptions {
  link?: string;
  linkText?: string; 
}

export function showToast(message: string, type: ToastType = 'info', opts?: ToastOptions) {

  if (opts && (opts as any).persist) {
    try {
      const key = 'pharmatrack_pending_toasts';
      const raw = sessionStorage.getItem(key);
      const arr = raw ? JSON.parse(raw) : [];
      arr.push({ message, type, ts: Date.now(), link: opts?.link, linkText: opts?.linkText });
      try { sessionStorage.setItem(key, JSON.stringify(arr)); } catch (e) {  }
    } catch (e) {
    
    }
  }

  try {
 
    const detail: any = { message, type };
    if (opts?.link) detail.link = opts.link;
    if (opts?.linkText) detail.linkText = opts.linkText;
  
    if (opts && (opts as any).persist) detail.persist = true;
    window.dispatchEvent(new CustomEvent('pharmatrack:toast', { detail }));
  } catch (e) {
    // fallback
    try {

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
