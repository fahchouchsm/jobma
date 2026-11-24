import { useEffect, useState } from 'react';
import { NativeModules, Platform, TurboModuleRegistry } from 'react-native';
import { useAuth } from '@/context/auth-context';
import { triggerHaptic } from '@/lib/haptics';
import type { AuthResponse } from '@/services/auth-service';

type NativeGoogleSignInModule = typeof import('@react-native-google-signin/google-signin');

function getNativeGoogleSignIn(): NativeGoogleSignInModule | null {
  if (Platform.OS === 'web') return null;
  const hasNativeBridge = Boolean(
    NativeModules?.RNGoogleSignin || TurboModuleRegistry.get?.('RNGoogleSignin')
  );
  if (!hasNativeBridge) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('@react-native-google-signin/google-signin') as NativeGoogleSignInModule;
  } catch {
    return null;
  }
}

let nativeConfigured = false;

export function useGoogleAuth(onSuccess: (res: AuthResponse) => void) {
  const { loginWithGoogleToken } = useAuth();
  const [googleError, setGoogleError] = useState<string | null>(null);

  const webClientId =
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
  const iosClientId =
    process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;

  const nativeModule = getNativeGoogleSignIn();

  useEffect(() => {
    if (nativeModule && !nativeConfigured) {
      nativeModule.GoogleSignin.configure({
        webClientId,
        iosClientId,
      });
      nativeConfigured = true;
    }
  }, [nativeModule, webClientId, iosClientId]);

  const promptGoogleSignIn = async () => {
    setGoogleError(null);
    triggerHaptic('light');

    if (!nativeModule) {
      setGoogleError(
        'Connexion Google native indisponible dans Expo Go. Lancez le build de développement Jobma (expo run:android / eas build).'
      );
      return;
    }

    try {
      if (Platform.OS === 'android') {
        await nativeModule.GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      }
      const signInResult = await nativeModule.GoogleSignin.signIn();
      if (signInResult.type !== 'success') {
        return;
      }
      const idToken = signInResult.data.idToken;
      if (!idToken) {
        setGoogleError('Jeton Google (idToken) introuvable.');
        return;
      }
      const authRes = await loginWithGoogleToken(idToken);
      triggerHaptic('success');
      onSuccess(authRes);
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === nativeModule.statusCodes.SIGN_IN_CANCELLED) {
        return;
      }
      setGoogleError(err instanceof Error ? err.message : 'Connexion Google impossible.');
    }
  };

  return {
    isGoogleReady: true,
    isNativeGoogleSignIn: Boolean(nativeModule),
    googleError,
    clearGoogleError: () => setGoogleError(null),
    promptGoogleSignIn,
  };
}
