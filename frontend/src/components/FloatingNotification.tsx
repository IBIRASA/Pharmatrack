import NotificationBell from './NotificationBell';

export default function FloatingNotification() {
  return (
    <div className="fixed bottom-4 right-4 z-50 md:hidden">
      <div className="bg-transparent p-2 rounded-lg shadow-lg">
        <NotificationBell />
      </div>
    </div>
  );
}
