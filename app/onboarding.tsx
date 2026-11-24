import React, { useState } from 'react';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { OnboardingShell } from '@/components/onboarding/onboarding-shell';
import { StepCv } from '@/components/onboarding/step-cv';
import { StepDomain } from '@/components/onboarding/step-domain';
import { StepPreferences } from '@/components/onboarding/step-preferences';
import { StepSummary } from '@/components/onboarding/step-summary';
import { useProfile } from '@/context/profile-context';

const TOTAL_STEPS = 4;

export default function OnboardingScreen() {
  const router = useRouter();
  const { profile, updateProfile, completeOnboarding } = useProfile();
  const [step, setStep] = useState(1);

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
      isFinalStep={step === TOTAL_STEPS}
      onBack={handleBack}
      onNext={handleNext}
      onSkip={() => void handleFinish()}>
      <Animated.View key={step} entering={FadeInRight.duration(260)}>
        {step === 1 && <StepDomain profile={profile} onChange={updateProfile} />}
        {step === 2 && <StepPreferences profile={profile} onChange={updateProfile} />}
        {step === 3 && <StepCv profile={profile} onChange={updateProfile} />}
        {step === 4 && <StepSummary profile={profile} />}
      </Animated.View>
    </OnboardingShell>
  );
}
