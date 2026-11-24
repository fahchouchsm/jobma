import '@/global.css';

import React, { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as SystemUI from 'expo-system-ui';
import { Platform } from 'react-native';
import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from 'expo-router/react-navigation';
import { PortalHost } from '@rn-primitives/portal';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useUniwind } from 'uniwind';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { JobsProvider } from '@/context/jobs-context';
import { ProfileProvider, useProfile } from '@/context/profile-context';
import {
  registerForPushNotificationsAsync,
  unregisterPushToken,
} from '@/services/notifications-service';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

function AppAccessGate() {
  const { isAuthHydrated, isAuthenticated } = useAuth();
  const { isHydrated, hasCompletedOnboarding, isProfileComplete } = useProfile();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthHydrated || !isHydrated) return;

    const rootSegment = segments[0];
    const inAuth = rootSegment === 'auth';
    const inOnboarding = rootSegment === 'onboarding';

    if (!isAuthenticated) {
      if (!inAuth) {
        router.replace('/auth/login');
      }
      return;
    }

    const needsOnboarding = !hasCompletedOnboarding || !isProfileComplete;
    if (needsOnboarding) {
      if (!inOnboarding) {
        router.replace('/onboarding');
      }
      return;
    }

    if (inAuth || inOnboarding) {
      router.replace('/');
    }
  }, [
    isAuthHydrated,
    isHydrated,
    isAuthenticated,
    hasCompletedOnboarding,
    isProfileComplete,
    segments,
    router,
  ]);

  return null;
}

function PushNotificationsBridge() {
  const { isAuthenticated } = useAuth();
  const { settings } = useProfile();
  const router = useRouter();
  const tokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    if (isAuthenticated && settings.jobAlertsEnabled) {
      void registerForPushNotificationsAsync().then((token) => {
        if (token) tokenRef.current = token;
      });
    } else if (!isAuthenticated && tokenRef.current) {
      const prev = tokenRef.current;
      tokenRef.current = null;
      void unregisterPushToken(prev);
    }
  }, [isAuthenticated, settings.jobAlertsEnabled]);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as { offerId?: string } | undefined;
      if (data?.offerId) {
        router.push(`/job/${data.offerId}`);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [router]);

  return null;
}

export default function RootLayout() {
  const { theme } = useUniwind();
  const activeMode = theme === 'dark' ? 'dark' : 'light';
  const bgColor = NAV_THEME[activeMode].colors.background;

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(bgColor).catch(() => {});
  }, [bgColor]);

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: bgColor }}>
        <GluestackUIProvider mode={activeMode} style={{ backgroundColor: bgColor }}>
          <BottomSheetModalProvider>
            <AuthProvider>
              <ProfileProvider>
                <JobsProvider>
                  <ThemeProvider value={NAV_THEME[activeMode]}>
                    <StatusBar style={activeMode === 'dark' ? 'light' : 'dark'} />
                    <AppAccessGate />
                    <PushNotificationsBridge />
                    <Stack
                      screenOptions={{
                        headerShown: false,
                        contentStyle: { backgroundColor: bgColor },
                        gestureEnabled: true,
                        freezeOnBlur: false,
                      }}>
                      <Stack.Screen name="(tabs)" />
                      <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
                      <Stack.Screen name="auth/login" options={{ gestureEnabled: false }} />
                      <Stack.Screen name="auth/register" />
                      <Stack.Screen name="auth/forgot-password" />
                      <Stack.Screen name="job/[id]" />
                    </Stack>
                    <PortalHost />
                  </ThemeProvider>
                </JobsProvider>
              </ProfileProvider>
            </AuthProvider>
          </BottomSheetModalProvider>
        </GluestackUIProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
