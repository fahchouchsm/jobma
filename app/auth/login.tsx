import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Globe, Lock, Mail } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/context/auth-context';
import { triggerHaptic } from '@/lib/haptics';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login, isAuthLoading, authError, clearAuthError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const errorMessage = localError || authError;

  const handleLogin = async () => {
    setLocalError(null);
    clearAuthError();
    if (!email.trim() || !password) {
      setLocalError('Veuillez renseigner votre email et votre mot de passe.');
      return;
    }
    try {
      triggerHaptic('light');
      const res = await login(email, password);
      triggerHaptic('success');
      router.replace(res.hasCompletedOnboarding ? '/' : '/onboarding');
    } catch {
      // authError set by AuthContext
    }
  };

  const handleGooglePress = () => {
    setLocalError(
      'Configurez EXPO_PUBLIC_GOOGLE_CLIENT_ID avec expo-auth-session pour activer Google Sign-In.'
    );
  };

  return (
    <Box className="bg-background flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingTop: Platform.OS === 'web' ? 24 : Math.max(insets.top + 12, 24),
            paddingBottom: Math.max(insets.bottom + 24, 32),
            paddingHorizontal: 20,
            flexGrow: 1,
          }}>
          <VStack space="lg" className="flex-1">
            <HStack className="items-center justify-between">
              <Pressable
                accessibilityLabel="Retour"
                onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
                className="bg-muted h-10 w-10 items-center justify-center rounded-full">
                <Icon as={ArrowLeft} size="md" className="text-foreground" />
              </Pressable>

              <Pressable onPress={() => router.replace('/')}>
                <Text size="xs" bold className="text-muted-foreground">
                  Continuer sans compte
                </Text>
              </Pressable>
            </HStack>

            <VStack space="xs" className="pt-2">
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
                    keyboardType="email-address"
                    textContentType="emailAddress"
                    placeholder="vous@exemple.com"
                    className="text-foreground text-sm"
                  />
                </Input>
              </VStack>

              <VStack space="xs">
                <Text size="xs" bold className="text-foreground">
                  Mot de passe
                </Text>
                <Input className="bg-card border-border h-12 rounded-xl px-3">
                  <InputSlot className="pr-2">
                    <InputIcon as={Lock} className="text-muted-foreground" />
                  </InputSlot>
                  <InputField
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    textContentType="password"
                    placeholder="••••••••"
                    onSubmitEditing={() => void handleLogin()}
                    className="text-foreground text-sm"
                  />
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
              isDisabled={isAuthLoading}
              onPress={handleGooglePress}
              className="h-12 rounded-xl">
              <ButtonIcon as={Globe} />
              <ButtonText className="font-semibold">Continuer avec Google</ButtonText>
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
