import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, Lock, Mail } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { triggerHaptic } from '@/lib/haptics';
import { confirmPasswordReset, requestPasswordReset } from '@/services/auth-service';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<'email' | 'code' | 'done'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const newPasswordRef = useRef<{ focus: () => void } | null>(null);

  const handleRequestCode = async () => {
    setError(null);
    if (!email.trim().includes('@')) {
      setError('Veuillez saisir une adresse email valide.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await requestPasswordReset(email);
      triggerHaptic('success');
      setInfo(res.message || 'Un code de réinitialisation à 6 chiffres a été envoyé.');
      setStep('code');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible d’envoyer le code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmReset = async () => {
    setError(null);
    if (code.trim().length < 4) {
      setError('Veuillez saisir le code reçu par email.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Le nouveau mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    setIsLoading(true);
    try {
      await confirmPasswordReset(code, newPassword);
      triggerHaptic('success');
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Code invalide ou expiré.');
    } finally {
      setIsLoading(false);
    }
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
            <HStack className="items-center">
              <Pressable
                accessibilityLabel="Retour"
                onPress={() => (router.canGoBack() ? router.back() : router.replace('/auth/login'))}
                className="bg-muted h-10 w-10 items-center justify-center rounded-full">
                <Icon as={ArrowLeft} size="md" className="text-foreground" />
              </Pressable>
            </HStack>

            <VStack space="xs" className="pt-2">
              <Heading size="xl" bold className="text-foreground">
                Mot de passe oublié
              </Heading>
              <Text size="sm" className="text-muted-foreground">
                {step === 'email'
                  ? 'Entrez votre email pour recevoir un code à 6 chiffres valable 15 minutes.'
                  : step === 'code'
                    ? 'Saisissez le code reçu et choisissez un nouveau mot de passe.'
                    : 'Votre mot de passe a été mis à jour avec succès.'}
              </Text>
            </VStack>

            {error && (
              <Box className="bg-destructive/10 border-destructive/30 rounded-xl border px-3.5 py-2.5">
                <Text size="xs" className="text-destructive">
                  {error}
                </Text>
              </Box>
            )}

            {info && step === 'code' && (
              <Box className="bg-secondary-container rounded-xl px-3.5 py-2.5">
                <Text size="xs" className="text-on-secondary-container">
                  {info}
                </Text>
              </Box>
            )}

            {step === 'email' && (
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
                      returnKeyType="send"
                      placeholder="vous@exemple.com"
                      onSubmitEditing={() => void handleRequestCode()}
                      className="text-foreground text-sm"
                    />
                  </Input>
                </VStack>

                <Button
                  size="lg"
                  isDisabled={isLoading}
                  onPress={() => void handleRequestCode()}
                  className="h-12 rounded-xl">
                  {isLoading ? (
                    <>
                      <ButtonSpinner className="text-primary-foreground" />
                      <ButtonText className="font-bold">Envoi...</ButtonText>
                    </>
                  ) : (
                    <ButtonText className="font-bold">Envoyer le code</ButtonText>
                  )}
                </Button>
              </VStack>
            )}

            {step === 'code' && (
              <VStack space="md">
                <VStack space="xs">
                  <Text size="xs" bold className="text-foreground">
                    Code de réinitialisation (6 chiffres)
                  </Text>
                  <Input className="bg-card border-border h-12 rounded-xl px-3">
                    <InputSlot className="pr-2">
                      <InputIcon as={KeyRound} className="text-muted-foreground" />
                    </InputSlot>
                    <InputField
                      value={code}
                      onChangeText={setCode}
                      keyboardType="number-pad"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      textContentType="oneTimeCode"
                      importantForAutofill="yes"
                      returnKeyType="next"
                      blurOnSubmit={false}
                      onSubmitEditing={() => newPasswordRef.current?.focus()}
                      maxLength={8}
                      placeholder="123456"
                      className="text-foreground text-sm"
                    />
                  </Input>
                </VStack>

                <VStack space="xs">
                  <Text size="xs" bold className="text-foreground">
                    Nouveau mot de passe
                  </Text>
                  <Input className="bg-card border-border h-12 rounded-xl px-3">
                    <InputSlot className="pr-2">
                      <InputIcon as={Lock} className="text-muted-foreground" />
                    </InputSlot>
                    <InputField
                      ref={newPasswordRef as never}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="new-password"
                      textContentType="newPassword"
                      importantForAutofill="yes"
                      returnKeyType="done"
                      placeholder="Minimum 6 caractères"
                      onSubmitEditing={() => void handleConfirmReset()}
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
                  isDisabled={isLoading}
                  onPress={() => void handleConfirmReset()}
                  className="h-12 rounded-xl">
                  {isLoading ? (
                    <>
                      <ButtonSpinner className="text-primary-foreground" />
                      <ButtonText className="font-bold">Validation...</ButtonText>
                    </>
                  ) : (
                    <ButtonText className="font-bold">Réinitialiser le mot de passe</ButtonText>
                  )}
                </Button>
              </VStack>
            )}

            {step === 'done' && (
              <VStack space="md" className="items-center pt-4">
                <Box className="bg-secondary-container h-14 w-14 items-center justify-center rounded-full">
                  <Icon as={CheckCircle2} size="xl" className="text-secondary" />
                </Box>
                <Button
                  size="lg"
                  onPress={() => router.replace('/auth/login')}
                  className="h-12 w-full rounded-xl">
                  <ButtonText className="font-bold">Retour à la connexion</ButtonText>
                </Button>
              </VStack>
            )}
          </VStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </Box>
  );
}
