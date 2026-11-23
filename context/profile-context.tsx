import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Uniwind } from 'uniwind';

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

export interface JobAlert {
  id: string;
  query: string;
  workMode?: WorkMode | 'Tous';
  minSalaryK?: number;
  createdAt: string;
}

export interface AppSettings {
  themePreference: 'light' | 'dark';
  jobAlertsEnabled: boolean;
  emailDigestEnabled: boolean;
  recruiterVisibility: boolean;
  salaryTransparencyOnly: boolean;
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

const STORAGE_KEY = '@jobma/candidate-profile-v2';

export const DEFAULT_SETTINGS: AppSettings = {
  themePreference: 'light',
  jobAlertsEnabled: true,
  emailDigestEnabled: true,
  recruiterVisibility: true,
  salaryTransparencyOnly: true,
};

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
  settings: AppSettings;
  recentSearches: string[];
  savedAlerts: JobAlert[];
}

interface ProfileContextValue {
  profile: CandidateProfile;
  settings: AppSettings;
  recentSearches: string[];
  savedAlerts: JobAlert[];
  hasCompletedOnboarding: boolean;
  isHydrated: boolean;
  updateProfile: (partial: Partial<CandidateProfile>) => void;
  updateSettings: (partial: Partial<AppSettings>) => void;
  addRecentSearch: (term: string) => void;
  clearRecentSearches: () => void;
  addJobAlert: (alert: Omit<JobAlert, 'id' | 'createdAt'>) => void;
  removeJobAlert: (id: string) => void;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<CandidateProfile>(DEFAULT_PROFILE);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Product Designer',
    'Télétravail',
    'React Native',
  ]);
  const [savedAlerts, setSavedAlerts] = useState<JobAlert[]>([]);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const stateRef = useRef<PersistedState>({
    hasCompletedOnboarding: false,
    profile: DEFAULT_PROFILE,
    settings: DEFAULT_SETTINGS,
    recentSearches: ['Product Designer', 'Télétravail', 'React Native'],
    savedAlerts: [],
  });

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!mounted || !raw) return;
        const parsed = JSON.parse(raw) as Partial<PersistedState>;
        const nextProfile = parsed.profile
          ? { ...DEFAULT_PROFILE, ...parsed.profile }
          : DEFAULT_PROFILE;
        const nextSettings = parsed.settings
          ? { ...DEFAULT_SETTINGS, ...parsed.settings }
          : DEFAULT_SETTINGS;
        const nextCompleted = Boolean(parsed.hasCompletedOnboarding);
        const nextSearches = Array.isArray(parsed.recentSearches)
          ? parsed.recentSearches
          : stateRef.current.recentSearches;
        const nextAlerts = Array.isArray(parsed.savedAlerts) ? parsed.savedAlerts : [];

        stateRef.current = {
          hasCompletedOnboarding: nextCompleted,
          profile: nextProfile,
          settings: nextSettings,
          recentSearches: nextSearches,
          savedAlerts: nextAlerts,
        };

        setProfile(nextProfile);
        setSettings(nextSettings);
        setHasCompletedOnboarding(nextCompleted);
        setRecentSearches(nextSearches);
        setSavedAlerts(nextAlerts);
        Uniwind.setTheme(nextSettings.themePreference);
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setIsHydrated(true);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const persistState = useCallback(async (next: PersistedState) => {
    stateRef.current = next;
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage write errors
    }
  }, []);

  const updateProfile = useCallback(
    (partial: Partial<CandidateProfile>) => {
      setProfile((prev) => {
        const nextProfile = { ...prev, ...partial };
        void persistState({ ...stateRef.current, profile: nextProfile });
        return nextProfile;
      });
    },
    [persistState]
  );

  const updateSettings = useCallback(
    (partial: Partial<AppSettings>) => {
      setSettings((prev) => {
        const nextSettings = { ...prev, ...partial };
        if (partial.themePreference) {
          Uniwind.setTheme(partial.themePreference);
        }
        void persistState({ ...stateRef.current, settings: nextSettings });
        return nextSettings;
      });
    },
    [persistState]
  );

  const addRecentSearch = useCallback(
    (term: string) => {
      const clean = term.trim();
      if (!clean) return;
      setRecentSearches((prev) => {
        const next = [clean, ...prev.filter((t) => t !== clean)].slice(0, 6);
        void persistState({ ...stateRef.current, recentSearches: next });
        return next;
      });
    },
    [persistState]
  );

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    void persistState({ ...stateRef.current, recentSearches: [] });
  }, [persistState]);

  const addJobAlert = useCallback(
    (alert: Omit<JobAlert, 'id' | 'createdAt'>) => {
      const newAlert: JobAlert = {
        ...alert,
        id: `alert-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setSavedAlerts((prev) => {
        const next = [newAlert, ...prev];
        void persistState({ ...stateRef.current, savedAlerts: next });
        return next;
      });
    },
    [persistState]
  );

  const removeJobAlert = useCallback(
    (id: string) => {
      setSavedAlerts((prev) => {
        const next = prev.filter((a) => a.id !== id);
        void persistState({ ...stateRef.current, savedAlerts: next });
        return next;
      });
    },
    [persistState]
  );

  const completeOnboarding = useCallback(async () => {
    setHasCompletedOnboarding(true);
    await persistState({ ...stateRef.current, hasCompletedOnboarding: true });
  }, [persistState]);

  const resetOnboarding = useCallback(async () => {
    setHasCompletedOnboarding(false);
    await persistState({ ...stateRef.current, hasCompletedOnboarding: false });
  }, [persistState]);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        settings,
        recentSearches,
        savedAlerts,
        hasCompletedOnboarding,
        isHydrated,
        updateProfile,
        updateSettings,
        addRecentSearch,
        clearRecentSearches,
        addJobAlert,
        removeJobAlert,
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
