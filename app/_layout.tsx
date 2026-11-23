import '@/global.css';

import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from 'expo-router/react-navigation';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Uniwind, useUniwind } from 'uniwind';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { SafeAreaListener } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { JobsProvider } from '@/context/jobs-context';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

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
          <JobsProvider>
            <ThemeProvider value={NAV_THEME[activeMode]}>
              <StatusBar style={activeMode === 'dark' ? 'light' : 'dark'} />
              <Stack screenOptions={{ headerShown: false }} />
              <PortalHost />
            </ThemeProvider>
          </JobsProvider>
        </GluestackUIProvider>
      </GestureHandlerRootView>
    </SafeAreaListener>
  );
}
