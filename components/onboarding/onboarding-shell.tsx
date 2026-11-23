import React from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { AnimatedProgressBar } from '@/components/animated/animated-progress';
import { triggerHaptic } from '@/lib/haptics';

interface OnboardingShellProps {
  step: number;
  totalSteps: number;
  nextLabel?: string;
  nextDisabled?: boolean;
  isFinalStep?: boolean;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
  children: React.ReactNode;
}

export function OnboardingShell({
  step,
  totalSteps,
  nextLabel = 'Continuer',
  nextDisabled = false,
  isFinalStep = false,
  onBack,
  onNext,
  onSkip,
  children,
}: OnboardingShellProps) {
  const insets = useSafeAreaInsets();
  const progressPct = Math.round((step / totalSteps) * 100);

  return (
    <Box className="bg-background flex-1">
      {/* Top Bar + Progress */}
      <Box
        className="bg-card border-border border-b px-4 pb-3"
        style={{ paddingTop: Platform.OS === 'web' ? 12 : insets.top + 8 }}>
        <VStack space="sm">
          <HStack className="items-center justify-between">
            <HStack className="items-center" space="xs">
              {step > 1 ? (
                <Pressable
                  accessibilityLabel="Étape précédente"
                  onPress={() => {
                    triggerHaptic('light');
                    onBack();
                  }}
                  className="bg-muted h-9 w-9 items-center justify-center rounded-full active:opacity-80">
                  <Icon as={ArrowLeft} size="md" className="text-foreground" />
                </Pressable>
              ) : (
                <Box className="bg-primary-fixed h-9 w-9 items-center justify-center rounded-full">
                  <Icon as={Sparkles} size="sm" className="text-primary" />
                </Box>
              )}
              <VStack>
                <Text size="sm" bold className="text-primary">
                  Jobma
                </Text>
                <Text size="2xs" className="text-muted-foreground">
                  Étape {step} sur {totalSteps}
                </Text>
              </VStack>
            </HStack>

            <Pressable
              onPress={() => {
                triggerHaptic('light');
                onSkip();
              }}
              className="bg-muted rounded-full px-3 py-1.5 active:opacity-80">
              <Text size="xs" bold className="text-muted-foreground">
                Passer
              </Text>
            </Pressable>
          </HStack>

          {/* Progress Bar */}
          <AnimatedProgressBar progress={progressPct} />
        </VStack>
      </Box>

      {/* Body */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 20,
            paddingBottom: 24,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>

        {/* Sticky Bottom CTA */}
        <Box
          className="bg-card border-border border-t px-4 pt-3"
          style={{
            paddingBottom: Platform.OS === 'web' ? 16 : Math.max(insets.bottom, 16),
          }}>
          <Button
            size="lg"
            variant={isFinalStep ? 'secondary' : 'default'}
            isDisabled={nextDisabled}
            onPress={() => {
              triggerHaptic(isFinalStep ? 'success' : 'light');
              onNext();
            }}
            className="h-12 w-full rounded-xl">
            <ButtonText className="font-bold">{nextLabel}</ButtonText>
            <ButtonIcon as={ArrowRight} />
          </Button>
        </Box>
      </KeyboardAvoidingView>
    </Box>
  );
}
