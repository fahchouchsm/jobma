import '@/global.css';

import React, { useEffect } from 'react';
import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from 'expo-router/react-navigation';
import { PortalHost } from '@rn-primitives/portal';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Uniwind, useUniwind } from 'uniwind';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { SafeAreaListener } from 'react-native-safe-area-context';
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

  return (
    <SafeAreaListener
      onChange={({ insets }) => {
        Uniwind.updateInsets(insets);
      }}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <GluestackUIProvider mode={activeMode}>
          <ProfileProvider>
            <JobsProvider>
              <ThemeProvider value={NAV_THEME[activeMode]}>
                <StatusBar style={activeMode === 'dark' ? 'light' : 'dark'} />
                <OnboardingGate />
                <Stack screenOptions={{ headerShown: false }}>
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
    </SafeAreaListener>
  );
}
