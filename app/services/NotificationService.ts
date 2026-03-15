import { Platform, Alert } from 'react-native';
import Constants from 'expo-constants';
import { getNotifications, Notification } from '../api/routes/notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationToastRef } from '../components/ui/NotificationToast';

// Native notifications removed in favor of premium in-app custom HUD
// This prevents crashes in Expo Go SDK 53+

export class NotificationService {
  private static pollInterval: any = null;
  private static lastNotifId: string | null = null;
  private static isSupported: boolean = false;
  private static toastRef: NotificationToastRef | null = null;

  static setToastRef(ref: NotificationToastRef | null) {
    this.toastRef = ref;
  }

  /**
   * Initialize permissions and basic settings
   */
  static async init() {
    if (Platform.OS === 'web') return;

    this.isSupported = false;

    // Native notification configuration removed


    // Load last seen notification ID to avoid double-alerting on start
    const saved = await AsyncStorage.getItem('last_notif_id');
    this.lastNotifId = saved;
  }

  /**
   * Start polling the backend for new notifications
   */
  static startPolling(intervalMs: number = 30000) {
    if (this.pollInterval) clearInterval(this.pollInterval);

    this.pollInterval = setInterval(() => this.checkNewNotifications(), intervalMs);
    // Also check once immediately
    this.checkNewNotifications();
  }

  static stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  private static async checkNewNotifications() {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) return; // Not logged in

      const { notifications, error } = await getNotifications();
      if (error || !notifications || notifications.length === 0) return;

      const latest = notifications[0]; 

      // CRITICAL FIX: Ensure ID is never undefined before storing in AsyncStorage
      const notifId = String(latest.id || '');
      if (!notifId) return;

      // If we have a new unread notification that we haven't alerted for yet
      if (!latest.is_read && notifId !== this.lastNotifId) {
        await this.show(latest);
        this.lastNotifId = notifId;
        await AsyncStorage.setItem('last_notif_id', notifId);
      }
    } catch (err) {
      console.error('Notification poll error:', err);
    }
  }

  public static async show(notif: { title: string; message: string; type?: string }) {
    if (this.toastRef) {
      this.toastRef.show({
        title: notif.title,
        message: notif.message,
        type: (notif.type as any) || 'info',
      });
    } else {
      // Fallback: Standard Alert if no toast ref
      Alert.alert(notif.title, notif.message);
    }
  }
}


