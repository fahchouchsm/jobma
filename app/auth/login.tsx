import React, { useCallback, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { GoogleLogo } from '@/components/ui/google-logo';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/context/auth-context';
import { useGoogleAuth } from '@/hooks/use-google-auth';
import { triggerHaptic } from '@/lib/haptics';
import type { AuthResponse } from '@/services/auth-service';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login, isAuthLoading, authError, clearAuthError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const passwordRef = useRef<{ focus: () => void } | null>(null);

  const handleAuthSuccess = useCallback(
    (res: AuthResponse) => {
      router.replace(res.hasCompletedOnboarding ? '/' : '/onboarding');
    },
    [router]
  );

  const { isGoogleReady, googleError, clearGoogleError, promptGoogleSignIn } =
    useGoogleAuth(handleAuthSuccess);

  const errorMessage = localError || googleError || authError;

  const handleLogin = async () => {
    setLocalError(null);
    clearGoogleError();
    clearAuthError();
    if (!email.trim() || !password) {
      setLocalError('Veuillez renseigner votre email et votre mot de passe.');
      return;
    }
    try {
      triggerHaptic('light');
      const res = await login(email, password);
      triggerHaptic('success');
      handleAuthSuccess(res);
    } catch {
      // authError set by AuthContext
    }
  };

  const handleGooglePress = () => {
    setLocalError(null);
    clearAuthError();
    void promptGoogleSignIn();
  };

  return (
    <Box className="bg-background flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={{
            paddingTop: Platform.OS === 'web' ? 24 : Math.max(insets.top + 12, 24),
            paddingBottom: Math.max(insets.bottom + 24, 32),
            paddingHorizontal: 20,
            flexGrow: 1,
          }}>
          <VStack space="lg" className="flex-1">
            <VStack space="xs" className="pt-6">
              <Text size="2xl" bold className="text-foreground tracking-tight">
                jobma
                <Text size="2xl" bold className="text-primary">
                  .
                </Text>
              </Text>
              <Heading size="xl" bold className="text-foreground mt-2">
                Bon retour parmi nous
              </Heading>
              <Text size="sm" className="text-muted-foreground">
                Synchronisez votre profil, votre CV et vos candidatures au Maroc.
              </Text>
            </VStack>

            {errorMessage && (
              <Box className="bg-destructive/10 border-destructive/30 rounded-xl border px-3.5 py-2.5">
                <Text size="xs" className="text-destructive">
                  {errorMessage}
                </Text>
              </Box>
            )}

            <VStack space="md">
              <VStack space="xs">
                <Text size="xs" bold className="text-foreground">
                  Adresse email
                </Text>
                <Input className="bg-card border-border h-12 rounded-xl px-3">
                  <InputSlot className="pr-2">
                    <InputIcon as={Mail} className="text-muted-foreground" />
                  </InputSlot>
                  <InputField
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    autoCorrect={false}
                    spellCheck={false}
                    keyboardType="email-address"
                    inputMode="email"
                    autoComplete="email"
                    textContentType="emailAddress"
                    importantForAutofill="yes"
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => passwordRef.current?.focus()}
                    placeholder="vous@exemple.com"
                    className="text-foreground text-sm"
                  />
                </Input>
              </VStack>

              <VStack space="xs">
                <HStack className="items-center justify-between">
                  <Text size="xs" bold className="text-foreground">
                    Mot de passe
                  </Text>
                  <Pressable onPress={() => router.push('/auth/forgot-password')}>
                    <Text size="xs" bold className="text-primary">
                      Mot de passe oublié ?
                    </Text>
                  </Pressable>
                </HStack>
                <Input className="bg-card border-border h-12 rounded-xl px-3">
                  <InputSlot className="pr-2">
                    <InputIcon as={Lock} className="text-muted-foreground" />
                  </InputSlot>
                  <InputField
                    ref={passwordRef as never}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="current-password"
                    textContentType="password"
                    importantForAutofill="yes"
                    returnKeyType="done"
                    placeholder="••••••••"
                    onSubmitEditing={() => void handleLogin()}
                    className="text-foreground text-sm"
                  />
                  <InputSlot onPress={() => setShowPassword((prev) => !prev)} className="pl-2">
                    <InputIcon
                      as={showPassword ? EyeOff : Eye}
                      className="text-muted-foreground"
                    />
                  </InputSlot>
                </Input>
              </VStack>

              <Button
                size="lg"
                isDisabled={isAuthLoading}
                onPress={() => void handleLogin()}
                className="mt-1 h-12 rounded-xl">
                {isAuthLoading ? (
                  <>
                    <ButtonSpinner className="text-primary-foreground" />
                    <ButtonText className="font-bold">Connexion...</ButtonText>
                  </>
                ) : (
                  <ButtonText className="font-bold">Se connecter</ButtonText>
                )}
              </Button>
            </VStack>

            <HStack className="items-center" space="sm">
              <Divider className="flex-1" />
              <Text size="xs" className="text-muted-foreground">
                ou
              </Text>
              <Divider className="flex-1" />
            </HStack>

            <Button
              variant="outline"
              size="lg"
              isDisabled={isAuthLoading || !isGoogleReady}
              onPress={handleGooglePress}
              className="bg-card border-border h-12 gap-3 rounded-xl">
              <GoogleLogo size={20} />
              <ButtonText className="text-foreground font-semibold">
                Continuer avec Google
              </ButtonText>
            </Button>

            <HStack className="mt-auto items-center justify-center pt-6" space="xs">
              <Text size="sm" className="text-muted-foreground">
                Nouveau sur Jobma ?
              </Text>
              <Pressable onPress={() => router.replace('/auth/register')}>
                <Text size="sm" bold className="text-primary">
                  Créer un compte
                </Text>
              </Pressable>
            </HStack>
          </VStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </Box>
  );
}
