import React, { useState } from 'react';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { OnboardingShell } from '@/components/onboarding/onboarding-shell';
import { StepCv } from '@/components/onboarding/step-cv';
import { StepDomain } from '@/components/onboarding/step-domain';
import { StepIdentity } from '@/components/onboarding/step-identity';
import { StepPreferences } from '@/components/onboarding/step-preferences';
import { StepSummary } from '@/components/onboarding/step-summary';
import { useProfile } from '@/context/profile-context';
import { ApiValidationError } from '@/services/auth-service';

const TOTAL_STEPS = 5;

function digitsCount(value?: string): number {
  return (value ?? '').replace(/\D/g, '').length;
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { profile, updateProfile, completeOnboarding } = useProfile();
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const isStepInvalid = (() => {
    if (step === 1) {
      return (
        profile.fullName.trim().length < 2 ||
        profile.headline.trim().length < 2 ||
        digitsCount(profile.phone) < 8 ||
        profile.location.trim().length < 2 ||
        (profile.targetJobs?.length ?? 0) < 1 ||
        (profile.targetCities?.length ?? 0) < 1
      );
    }
    if (step === 2) {
      return profile.domains.length < 1 || profile.skills.length < 1;
    }
    if (step === 3) {
      return profile.workModes.length < 1 || profile.contractTypes.length < 1;
    }
    return false;
  })();

  const handleFinish = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setSubmitError(null);
    setFieldErrors({});
    try {
      await completeOnboarding();
      router.replace('/');
    } catch (err) {
      if (err instanceof ApiValidationError) {
        setSubmitError(err.message);
        setFieldErrors(err.fieldErrors);
        const identityFields = ['fullName', 'headline', 'phone', 'location', 'targetJobs', 'targetCities'];
        if (Object.keys(err.fieldErrors).some((k) => identityFields.includes(k))) {
          setStep(1);
        }
      } else {
        setSubmitError(
          err instanceof Error ? err.message : 'Impossible de sauvegarder votre profil.'
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = () => {
    setSubmitError(null);
    if (step < TOTAL_STEPS) {
      setStep((prev) => prev + 1);
    } else {
      void handleFinish();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  return (
    <OnboardingShell
      step={step}
      totalSteps={TOTAL_STEPS}
      nextLabel={
        step === TOTAL_STEPS
          ? isSaving
            ? 'Enregistrement...'
            : 'Accéder aux offres'
          : 'Continuer'
      }
      nextDisabled={isStepInvalid || isSaving}
      isFinalStep={step === TOTAL_STEPS}
      onBack={handleBack}
      onNext={handleNext}>
      {submitError && (
        <Box className="bg-destructive/10 border-destructive/30 mb-4 rounded-xl border px-3.5 py-2.5">
          <Text size="xs" className="text-destructive">
            {submitError}
          </Text>
        </Box>
      )}
      <Animated.View key={step} entering={FadeInRight.duration(260)}>
        {step === 1 && (
          <StepIdentity
            profile={profile}
            fieldErrors={fieldErrors}
            onChange={updateProfile}
          />
        )}
        {step === 2 && <StepDomain profile={profile} onChange={updateProfile} />}
        {step === 3 && <StepPreferences profile={profile} onChange={updateProfile} />}
        {step === 4 && <StepCv profile={profile} onChange={updateProfile} />}
        {step === 5 && <StepSummary profile={profile} />}
      </Animated.View>
    </OnboardingShell>
  );
}
