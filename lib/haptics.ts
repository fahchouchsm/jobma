import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

type HapticKind = 'light' | 'medium' | 'success';

export function triggerHaptic(kind: HapticKind = 'light') {
  if (Platform.OS === 'web') return;

  if (kind === 'success') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    return;
  }

  const style =
    kind === 'medium' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light;

  Haptics.impactAsync(style).catch(() => {});
}
