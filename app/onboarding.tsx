import React, { useState } from 'react';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { OnboardingShell } from '@/components/onboarding/onboarding-shell';
import { StepCv } from '@/components/onboarding/step-cv';
import { StepDomain } from '@/components/onboarding/step-domain';
import { StepPreferences } from '@/components/onboarding/step-preferences';
import { StepSummary } from '@/components/onboarding/step-summary';
import { StepWelcome } from '@/components/onboarding/step-welcome';
import { useProfile } from '@/context/profile-context';

const TOTAL_STEPS = 5;

export default function OnboardingScreen() {
  const router = useRouter();
  const { profile, updateProfile, completeOnboarding } = useProfile();
  const [step, setStep] = useState(1);

  const isNextDisabled =
    step === 1 && (profile.fullName.trim().length < 2 || profile.headline.trim().length < 2);

  const handleFinish = async () => {
    await completeOnboarding();
    router.replace('/');
  };

  const handleNext = () => {
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
      nextLabel={step === TOTAL_STEPS ? 'Découvrir mes offres' : 'Continuer'}
      nextDisabled={isNextDisabled}
      isFinalStep={step === TOTAL_STEPS}
      onBack={handleBack}
      onNext={handleNext}
      onSkip={() => void handleFinish()}>
      <Animated.View key={step} entering={FadeInRight.duration(260)}>
        {step === 1 && <StepWelcome profile={profile} onChange={updateProfile} />}
        {step === 2 && <StepDomain profile={profile} onChange={updateProfile} />}
        {step === 3 && <StepPreferences profile={profile} onChange={updateProfile} />}
        {step === 4 && <StepCv profile={profile} onChange={updateProfile} />}
        {step === 5 && <StepSummary profile={profile} />}
      </Animated.View>
    </OnboardingShell>
  );
}
