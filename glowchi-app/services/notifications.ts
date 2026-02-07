// Push Notifications Service
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class NotificationService {
  private expoPushToken?: string;

  async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      console.log('[Notifications] Must use physical device for Push Notifications');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[Notifications] Permission not granted');
      return false;
    }

    console.log('[Notifications] Permission granted');
    return true;
  }

  async registerForPushNotifications(): Promise<string | undefined> {
    if (!Device.isDevice) {
      return undefined;
    }

    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return undefined;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });

      this.expoPushToken = token.data;
      console.log('[Notifications] Expo push token:', this.expoPushToken);

      // Set notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF6FAE',
        });
      }

      return this.expoPushToken;
    } catch (error) {
      console.error('[Notifications] Failed to get push token:', error);
      return undefined;
    }
  }

  async scheduleDailyCheckInReminder() {
    try {
      // Cancel any existing check-in notifications
      await this.cancelScheduledNotifications();

      // Schedule notification for 9 PM every day
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Time to check in! 💖",
          body: "Your pet is waiting for you! Log your day and see how they're doing.",
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: { type: 'daily_checkin' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 21, // 9 PM
          minute: 0,
        },
      });

      console.log('[Notifications] Daily check-in reminder scheduled for 9 PM');
    } catch (error) {
      console.error('[Notifications] Failed to schedule daily reminder:', error);
    }
  }

  async scheduleStreakWarning() {
    try {
      // Notify at 11 PM if they haven't checked in
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Don't lose your streak! 🔥",
          body: "You haven't checked in today. Your pet misses you!",
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
          data: { type: 'streak_warning' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 23, // 11 PM
          minute: 0,
        },
      });

      console.log('[Notifications] Streak warning scheduled for 11 PM');
    } catch (error) {
      console.error('[Notifications] Failed to schedule streak warning:', error);
    }
  }

  async scheduleBreakoutWarning(riskLevel: number) {
    try {
      if (riskLevel < 60) {
        return; // Only notify if risk is high
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "⚠️ High Breakout Risk Detected",
          body: `Your pet senses trouble ahead (${riskLevel}% risk). Time to focus on skin care!`,
          sound: true,
          data: { type: 'breakout_warning', risk: riskLevel },
        },
        trigger: null, // Send immediately
      });

      console.log('[Notifications] Breakout warning sent');
    } catch (error) {
      console.error('[Notifications] Failed to send breakout warning:', error);
    }
  }

  async sendLevelUpNotification(newLevel: number) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `🎉 Level Up! You're now Level ${newLevel}!`,
          body: "Your pet evolved! Keep up the great work!",
          sound: true,
          data: { type: 'level_up', level: newLevel },
        },
        trigger: null,
      });

      console.log('[Notifications] Level up notification sent');
    } catch (error) {
      console.error('[Notifications] Failed to send level up notification:', error);
    }
  }

  async cancelScheduledNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('[Notifications] All scheduled notifications cancelled');
    } catch (error) {
      console.error('[Notifications] Failed to cancel notifications:', error);
    }
  }

  async getAllScheduledNotifications() {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      console.log('[Notifications] Scheduled notifications:', notifications.length);
      return notifications;
    } catch (error) {
      console.error('[Notifications] Failed to get scheduled notifications:', error);
      return [];
    }
  }

  // Subscribe to notification events
  addNotificationListener(callback: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(callback);
  }

  addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
  ) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }
}

export const notificationService = new NotificationService();
