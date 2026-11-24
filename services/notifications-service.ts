import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { authenticatedFetch } from '@/services/auth-service';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (Platform.OS === 'web' || !Device.isDevice) {
    return null;
  }

  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('job-alerts', {
        name: 'Alertes emploi Jobma',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 200, 150, 200],
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return null;
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    if (!projectId) {
      return null;
    }

    const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = tokenResponse.data;

    await authenticatedFetch('/api/v1/profile/push-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        platform: Platform.OS,
      }),
    }).catch(() => {});

    return token;
  } catch {
    return null;
  }
}

export async function scheduleInterviewReminder(payload: {
  offerId: string;
  jobTitle: string;
  company: string;
  triggerDate: Date;
}): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('job-alerts', {
        name: 'Alertes emploi Jobma',
        importance: Notifications.AndroidImportance.HIGH,
      });
    }

    const seconds = Math.max(
      10,
      Math.floor((payload.triggerDate.getTime() - Date.now()) / 1000)
    );

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Entretien chez ${payload.company}`,
        body: `Préparez votre entretien pour « ${payload.jobTitle} ».`,
        data: { offerId: payload.offerId },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
      },
    });
    return id;
  } catch {
    return null;
  }
}

export async function unregisterPushToken(token: string): Promise<void> {
  try {
    await authenticatedFetch('/api/v1/profile/push-token', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
  } catch {
    // Best-effort cleanup
  }
}
