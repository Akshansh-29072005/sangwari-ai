import { apiFetch } from '../api';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'alert' | 'error';
  is_read: boolean;
  created_at: string;
}

/**
 * Fetch all notifications for the current user
 */
export async function getNotifications() {
  const response = await apiFetch<any>('/notifications');
  // The backend might wrap the list in a "data" property if using the standard response helper
  return {
    notifications: (response.data?.data || []) as Notification[],
    error: response.error,
  };
}

/**
 * Mark a specific notification as read
 */
export async function markNotificationAsRead(id: string) {
  const response = await apiFetch(`/notifications/${id}/read`, {
    method: 'PUT',
  });
  return {
    success: !response.error,
    error: response.error,
  };
}
