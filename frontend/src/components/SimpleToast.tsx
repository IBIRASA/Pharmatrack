// SimpleToast replaced by PageBanner (large, persistent banners).
// Keep a lightweight no-op component to avoid build-time import errors if any stale imports remain.

interface ToastProps {
  id?: string | number;
  message?: string;
  type?: 'success' | 'error' | 'info';
  onClose?: (id: string | number) => void;
}

export default function SimpleToast(_: ToastProps) {
  return null;
}
