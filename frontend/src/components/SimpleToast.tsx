

interface ToastProps {
  id?: string | number;
  message?: string;
  type?: 'success' | 'error' | 'info';
  onClose?: (id: string | number) => void;
}

export default function SimpleToast(_: ToastProps) {
  return null;
}
