import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type JobDomain =
  'Design' | 'Engineering' | 'Product' | 'IA & Data' | 'Marketing' | 'Finance';

export type ExperienceLevel = 'Junior' | 'Confirmé' | 'Senior' | 'Lead / Staff';

export type WorkMode = 'Télétravail' | 'Hybride' | 'Présentiel';
export type ContractType = 'CDI' | 'Freelance' | 'Stage / Alternance';
export type Availability = 'Immédiate' | 'Sous 1 mois' | 'Sous 3 mois' | 'En veille';

export interface CvAttachment {
  name: string;
  size?: number;
  uri: string;
  mimeType?: string;
}

export interface CandidateProfile {
  fullName: string;
  headline: string;
  location: string;
  domains: JobDomain[];
  experienceLevel: ExperienceLevel;
  skills: string[];
  workModes: WorkMode[];
  contractTypes: ContractType[];
  minSalaryK: number;
  availability: Availability;
  cvFile: CvAttachment | null;
  portfolioUrl: string;
  linkedinUrl: string;
  oneClickApplyEnabled: boolean;
}

const STORAGE_KEY = '@jobma/candidate-profile-v1';

export const DEFAULT_PROFILE: CandidateProfile = {
  fullName: 'Sarah Martin',
  headline: 'Senior Product Designer',
  location: 'Paris, France',
  domains: ['Design'],
  experienceLevel: 'Senior',
  skills: ['Product Design', 'Design Systems', 'Figma', 'Prototypage'],
  workModes: ['Télétravail', 'Hybride'],
  contractTypes: ['CDI'],
  minSalaryK: 90,
  availability: 'Sous 1 mois',
  cvFile: null,
  portfolioUrl: '',
  linkedinUrl: '',
  oneClickApplyEnabled: true,
};

interface PersistedState {
  hasCompletedOnboarding: boolean;
  profile: CandidateProfile;
}

interface ProfileContextValue {
  profile: CandidateProfile;
  hasCompletedOnboarding: boolean;
  isHydrated: boolean;
  updateProfile: (partial: Partial<CandidateProfile>) => void;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<CandidateProfile>(DEFAULT_PROFILE);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!mounted || !raw) return;
        const parsed = JSON.parse(raw) as Partial<PersistedState>;
        if (parsed.profile) {
          setProfile({ ...DEFAULT_PROFILE, ...parsed.profile });
        }
        if (typeof parsed.hasCompletedOnboarding === 'boolean') {
          setHasCompletedOnboarding(parsed.hasCompletedOnboarding);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setIsHydrated(true);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const persist = useCallback(async (nextProfile: CandidateProfile, nextCompleted: boolean) => {
    try {
      const payload: PersistedState = {
        hasCompletedOnboarding: nextCompleted,
        profile: nextProfile,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage write errors in restricted environments
    }
  }, []);

  const updateProfile = useCallback(
    (partial: Partial<CandidateProfile>) => {
      setProfile((prev) => {
        const next = { ...prev, ...partial };
        void persist(next, hasCompletedOnboarding);
        return next;
      });
    },
    [hasCompletedOnboarding, persist]
  );

  const completeOnboarding = useCallback(async () => {
    setHasCompletedOnboarding(true);
    await persist(profile, true);
  }, [persist, profile]);

  const resetOnboarding = useCallback(async () => {
    setHasCompletedOnboarding(false);
    await persist(profile, false);
  }, [persist, profile]);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        hasCompletedOnboarding,
        isHydrated,
        updateProfile,
        completeOnboarding,
        resetOnboarding,
      }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return ctx;
}
