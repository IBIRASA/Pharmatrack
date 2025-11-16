import { api } from './api';

export interface NotificationPayload {
  id: number;
  verb: string;
  message: string;
  data?: any;
  read: boolean;
  created_at: string;
}

export const getNotifications = async (): Promise<NotificationPayload[]> => {
  const resp = await api.get<NotificationPayload[]>('/inventory/notifications/');
  return resp.data;
};

export const markNotificationRead = async (id: number): Promise<{ detail?: string }> => {
  const resp = await api.post(`/inventory/notifications/${id}/mark-read/`);
  return resp.data;
};
