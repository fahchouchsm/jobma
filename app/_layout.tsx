import '@/global.css';

import React, { useEffect } from 'react';
import * as SystemUI from 'expo-system-ui';
import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from 'expo-router/react-navigation';
import { PortalHost } from '@rn-primitives/portal';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useUniwind } from 'uniwind';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { JobsProvider } from '@/context/jobs-context';
import { ProfileProvider, useProfile } from '@/context/profile-context';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

function OnboardingGate() {
  const { isHydrated, hasCompletedOnboarding } = useProfile();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isHydrated) return;
    const inOnboarding = segments[0] === 'onboarding';
    if (!hasCompletedOnboarding && !inOnboarding) {
      router.replace('/onboarding');
    }
  }, [isHydrated, hasCompletedOnboarding, segments, router]);

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
          <ProfileProvider>
            <JobsProvider>
              <ThemeProvider value={NAV_THEME[activeMode]}>
                <StatusBar style={activeMode === 'dark' ? 'light' : 'dark'} />
                <OnboardingGate />
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: bgColor },
                    gestureEnabled: true,
                    freezeOnBlur: false,
                  }}>
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
                  <Stack.Screen name="job/[id]" />
                </Stack>
                <PortalHost />
              </ThemeProvider>
            </JobsProvider>
          </ProfileProvider>
        </GluestackUIProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
