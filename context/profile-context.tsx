import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Uniwind } from 'uniwind';
import { useAuth } from '@/context/auth-context';
import {
  createServerAlert,
  deleteProfileCv,
  deleteServerAlert,
  fetchProfileCvs,
  fetchServerAlerts,
  fetchServerProfile,
  patchServerProfile,
  setPrimaryProfileCv,
  uploadProfileAvatar,
  uploadProfileCv,
} from '@/services/profile-service';

export type JobDomain =
  | 'Design'
  | 'Engineering'
  | 'Product'
  | 'IA & Data'
  | 'Marketing'
  | 'Finance';

export type ExperienceLevel = 'Junior' | 'Confirmé' | 'Senior' | 'Lead / Staff';

export type WorkMode = 'Télétravail' | 'Hybride' | 'Présentiel';
export type ContractType = 'CDI' | 'Freelance' | 'Stage / Alternance';
export type Availability = 'Immédiate' | 'Sous 1 mois' | 'Sous 3 mois' | 'En veille';

export interface CvAttachment {
  id?: string;
  name: string;
  size?: number;
  uri: string;
  mimeType?: string;
  uploadedAt?: string;
  isPrimary?: boolean;
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
  targetJobs?: string[];
  targetCities?: string[];
  bio?: string;
  phone?: string;
  githubUrl?: string;
  avatarUrl?: string;
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
  fullName: '',
  headline: '',
  phone: '',
  location: 'Casablanca, Maroc',
  domains: ['Engineering'],
  experienceLevel: 'Confirmé',
  skills: [],
  targetJobs: [],
  targetCities: ['Casablanca'],
  workModes: ['Hybride'],
  contractTypes: ['CDI'],
  minSalaryK: 0,
  availability: 'Sous 1 mois',
  cvFile: null,
  portfolioUrl: '',
  linkedinUrl: '',
  oneClickApplyEnabled: true,
};

interface PersistedState {
  hasCompletedOnboarding: boolean;
  isProfileComplete: boolean;
  profile: CandidateProfile;
  settings: AppSettings;
  recentSearches: string[];
  savedAlerts: JobAlert[];
}

interface ProfileContextValue {
  profile: CandidateProfile;
  cvFiles: CvAttachment[];
  settings: AppSettings;
  recentSearches: string[];
  savedAlerts: JobAlert[];
  hasCompletedOnboarding: boolean;
  isProfileComplete: boolean;
  missingProfileFields: string[];
  isHydrated: boolean;
  isUploadingCv: boolean;
  isUploadingAvatar: boolean;
  updateProfile: (partial: Partial<CandidateProfile>) => void;
  saveProfile: (partial: Partial<CandidateProfile>) => Promise<void>;
  updateSettings: (partial: Partial<AppSettings>) => void;
  uploadCv: (file: {
    uri: string;
    name: string;
    size?: number;
    mimeType?: string;
  }) => Promise<CvAttachment>;
  removeCv: (cvId?: string) => Promise<void>;
  selectPrimaryCv: (cvId: string) => Promise<void>;
  uploadAvatar: (file: { uri: string; name: string; mimeType?: string }) => Promise<string>;
  addRecentSearch: (term: string) => void;
  clearRecentSearches: () => void;
  addJobAlert: (alert: Omit<JobAlert, 'id' | 'createdAt'>) => void;
  removeJobAlert: (id: string) => void;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, lastAuthResponse, meMeta, setUserAvatar } = useAuth();
  const [profile, setProfile] = useState<CandidateProfile>(DEFAULT_PROFILE);
  const [cvFiles, setCvFiles] = useState<CvAttachment[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Développeur',
    'Télétravail',
    'Casablanca',
  ]);
  const [savedAlerts, setSavedAlerts] = useState<JobAlert[]>([]);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [missingProfileFields, setMissingProfileFields] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isUploadingCv, setIsUploadingCv] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const wasAuthenticatedRef = useRef(false);

  const stateRef = useRef<PersistedState>({
    hasCompletedOnboarding: false,
    isProfileComplete: false,
    profile: DEFAULT_PROFILE,
    settings: DEFAULT_SETTINGS,
    recentSearches: ['Développeur', 'Télétravail', 'Casablanca'],
    savedAlerts: [],
  });

  const persistState = useCallback(async (next: PersistedState) => {
    stateRef.current = next;
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage write errors
    }
  }, []);

  // Hydrate from local AsyncStorage
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
        const nextComplete = Boolean(parsed.isProfileComplete);
        const nextSearches = Array.isArray(parsed.recentSearches)
          ? parsed.recentSearches
          : stateRef.current.recentSearches;
        const nextAlerts = Array.isArray(parsed.savedAlerts) ? parsed.savedAlerts : [];

        stateRef.current = {
          hasCompletedOnboarding: nextCompleted,
          isProfileComplete: nextComplete,
          profile: nextProfile,
          settings: nextSettings,
          recentSearches: nextSearches,
          savedAlerts: nextAlerts,
        };

        setProfile(nextProfile);
        setSettings(nextSettings);
        setHasCompletedOnboarding(nextCompleted);
        setIsProfileComplete(nextComplete);
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

  // Apply completeness flags from /auth/me
  useEffect(() => {
    if (!meMeta) return;
    if (typeof meMeta.hasCompletedOnboarding === 'boolean') {
      setHasCompletedOnboarding(meMeta.hasCompletedOnboarding);
    }
    if (typeof meMeta.isProfileComplete === 'boolean') {
      setIsProfileComplete(meMeta.isProfileComplete);
    }
    if (Array.isArray(meMeta.missingProfileFields)) {
      setMissingProfileFields(meMeta.missingProfileFields);
    }
  }, [meMeta]);

  // Clear local cached profile on logout / account deletion
  useEffect(() => {
    if (wasAuthenticatedRef.current && !isAuthenticated) {
      setProfile(DEFAULT_PROFILE);
      setCvFiles([]);
      setHasCompletedOnboarding(false);
      setIsProfileComplete(false);
      setMissingProfileFields([]);
      setSavedAlerts([]);
      void persistState({
        hasCompletedOnboarding: false,
        isProfileComplete: false,
        profile: DEFAULT_PROFILE,
        settings: stateRef.current.settings,
        recentSearches: [],
        savedAlerts: [],
      });
    }
    wasAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated, persistState]);

  // Hydrate immediately from fresh login/register AuthResponse
  useEffect(() => {
    if (!lastAuthResponse) return;
    const nextProfile: CandidateProfile = {
      ...DEFAULT_PROFILE,
      ...(lastAuthResponse.profile ?? {}),
      fullName: lastAuthResponse.profile?.fullName || lastAuthResponse.user?.fullName || '',
      avatarUrl: lastAuthResponse.user?.avatarUrl ?? lastAuthResponse.profile?.avatarUrl,
    };
    const nextSettings: AppSettings = {
      ...stateRef.current.settings,
      ...(lastAuthResponse.settings ?? {}),
    };
    const nextCompleted = Boolean(lastAuthResponse.hasCompletedOnboarding);
    const nextComplete = Boolean(lastAuthResponse.isProfileComplete ?? nextCompleted);

    setProfile(nextProfile);
    setSettings(nextSettings);
    setHasCompletedOnboarding(nextCompleted);
    setIsProfileComplete(nextComplete);
    setMissingProfileFields(lastAuthResponse.missingProfileFields ?? []);
    Uniwind.setTheme(nextSettings.themePreference);

    void persistState({
      ...stateRef.current,
      profile: nextProfile,
      settings: nextSettings,
      hasCompletedOnboarding: nextCompleted,
      isProfileComplete: nextComplete,
    });
  }, [lastAuthResponse, persistState]);

  // Cloud sync profile, CVs & alerts when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    let mounted = true;

    Promise.all([fetchServerProfile(), fetchServerAlerts(), fetchProfileCvs()])
      .then(([serverData, serverAlerts, serverCvs]) => {
        if (!mounted) return;
        let nextProfile = stateRef.current.profile;
        let nextSettings = stateRef.current.settings;
        let nextCompleted = stateRef.current.hasCompletedOnboarding;
        let nextComplete = stateRef.current.isProfileComplete;

        if (serverData) {
          nextProfile = {
            ...DEFAULT_PROFILE,
            ...nextProfile,
            ...(serverData.profile ?? {}),
            fullName:
              serverData.profile?.fullName || serverData.user?.fullName || nextProfile.fullName,
            avatarUrl: serverData.user?.avatarUrl ?? nextProfile.avatarUrl,
          };
          nextSettings = { ...nextSettings, ...(serverData.settings ?? {}) };
          if (typeof serverData.hasCompletedOnboarding === 'boolean') {
            nextCompleted = serverData.hasCompletedOnboarding;
          }
          if (typeof serverData.isProfileComplete === 'boolean') {
            nextComplete = serverData.isProfileComplete;
          }
          if (Array.isArray(serverData.missingProfileFields)) {
            setMissingProfileFields(serverData.missingProfileFields);
          }
        }

        if (serverCvs.length > 0) {
          setCvFiles(serverCvs);
          const primary = serverCvs.find((c) => c.isPrimary) ?? serverCvs[0];
          nextProfile = { ...nextProfile, cvFile: primary };
        } else if (nextProfile.cvFile) {
          setCvFiles([nextProfile.cvFile]);
        }

        const nextAlerts = serverAlerts.length > 0 ? serverAlerts : stateRef.current.savedAlerts;

        setProfile(nextProfile);
        setSettings(nextSettings);
        setHasCompletedOnboarding(nextCompleted);
        setIsProfileComplete(nextComplete);
        setSavedAlerts(nextAlerts);
        Uniwind.setTheme(nextSettings.themePreference);

        void persistState({
          ...stateRef.current,
          profile: nextProfile,
          settings: nextSettings,
          hasCompletedOnboarding: nextCompleted,
          isProfileComplete: nextComplete,
          savedAlerts: nextAlerts,
        });
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, persistState]);

  const saveProfile = useCallback(
    async (partial: Partial<CandidateProfile>) => {
      const merged = { ...stateRef.current.profile, ...partial };
      if (isAuthenticated) {
        const res = await patchServerProfile(partial);
        if (typeof res.isProfileComplete === 'boolean') {
          setIsProfileComplete(res.isProfileComplete);
        }
        if (Array.isArray(res.missingProfileFields)) {
          setMissingProfileFields(res.missingProfileFields);
        }
      }
      setProfile(merged);
      await persistState({ ...stateRef.current, profile: merged });
    },
    [isAuthenticated, persistState]
  );

  const updateProfile = useCallback(
    (partial: Partial<CandidateProfile>) => {
      setProfile((prev) => {
        const nextProfile = { ...prev, ...partial };
        void persistState({ ...stateRef.current, profile: nextProfile });
        if (isAuthenticated && stateRef.current.hasCompletedOnboarding) {
          void patchServerProfile(partial)
            .then((res) => {
              if (typeof res.isProfileComplete === 'boolean') {
                setIsProfileComplete(res.isProfileComplete);
              }
              if (Array.isArray(res.missingProfileFields)) {
                setMissingProfileFields(res.missingProfileFields);
              }
            })
            .catch(() => {});
        }
        return nextProfile;
      });
    },
    [persistState, isAuthenticated]
  );

  const updateSettings = useCallback(
    (partial: Partial<AppSettings>) => {
      setSettings((prev) => {
        const nextSettings = { ...prev, ...partial };
        if (partial.themePreference) {
          Uniwind.setTheme(partial.themePreference);
        }
        void persistState({ ...stateRef.current, settings: nextSettings });
        if (isAuthenticated) {
          void patchServerProfile({ settings: nextSettings }).catch(() => {});
        }
        return nextSettings;
      });
    },
    [persistState, isAuthenticated]
  );

  const uploadCv = useCallback(
    async (file: {
      uri: string;
      name: string;
      size?: number;
      mimeType?: string;
    }): Promise<CvAttachment> => {
      setIsUploadingCv(true);
      try {
        let attachment: CvAttachment = {
          name: file.name,
          size: file.size,
          uri: file.uri,
          mimeType: file.mimeType,
        };

        if (isAuthenticated) {
          attachment = await uploadProfileCv(file);
        }

        setCvFiles((prev) => {
          const withoutDup = prev.filter(
            (c) => (attachment.id ? c.id !== attachment.id : c.name !== attachment.name)
          );
          return [{ ...attachment, isPrimary: true }, ...withoutDup.map((c) => ({ ...c, isPrimary: false }))];
        });

        setProfile((prev) => {
          const nextProfile = { ...prev, cvFile: attachment };
          void persistState({ ...stateRef.current, profile: nextProfile });
          return nextProfile;
        });

        return attachment;
      } finally {
        setIsUploadingCv(false);
      }
    },
    [isAuthenticated, persistState]
  );

  const removeCv = useCallback(
    async (cvId?: string) => {
      let nextPrimary: CvAttachment | null = null;
      setCvFiles((prev) => {
        const remaining = cvId ? prev.filter((c) => c.id !== cvId) : [];
        nextPrimary = remaining[0] ?? null;
        return remaining;
      });
      setProfile((prev) => {
        const nextProfile = { ...prev, cvFile: nextPrimary };
        void persistState({ ...stateRef.current, profile: nextProfile });
        return nextProfile;
      });
      if (isAuthenticated) {
        await deleteProfileCv(cvId).catch(() => {});
      }
    },
    [isAuthenticated, persistState]
  );

  const selectPrimaryCv = useCallback(
    async (cvId: string) => {
      let chosen: CvAttachment | null = null;
      setCvFiles((prev) =>
        prev.map((c) => {
          const isPrimary = c.id === cvId;
          if (isPrimary) chosen = { ...c, isPrimary: true };
          return { ...c, isPrimary };
        })
      );
      if (chosen) {
        setProfile((prev) => {
          const nextProfile = { ...prev, cvFile: chosen };
          void persistState({ ...stateRef.current, profile: nextProfile });
          return nextProfile;
        });
      }
      if (isAuthenticated) {
        await setPrimaryProfileCv(cvId).catch(() => {});
      }
    },
    [isAuthenticated, persistState]
  );

  const uploadAvatar = useCallback(
    async (file: { uri: string; name: string; mimeType?: string }): Promise<string> => {
      setIsUploadingAvatar(true);
      try {
        const avatarUrl = await uploadProfileAvatar(file);
        setUserAvatar(avatarUrl);
        setProfile((prev) => {
          const nextProfile = { ...prev, avatarUrl };
          void persistState({ ...stateRef.current, profile: nextProfile });
          return nextProfile;
        });
        return avatarUrl;
      } finally {
        setIsUploadingAvatar(false);
      }
    },
    [setUserAvatar, persistState]
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
      const tempId = `alert-${Date.now()}`;
      const newAlert: JobAlert = {
        ...alert,
        id: tempId,
        createdAt: new Date().toISOString(),
      };
      setSavedAlerts((prev) => {
        const next = [newAlert, ...prev];
        void persistState({ ...stateRef.current, savedAlerts: next });
        return next;
      });

      if (isAuthenticated) {
        createServerAlert(alert)
          .then((created) => {
            if (!created?.id) return;
            setSavedAlerts((prev) => {
              const next = prev.map((a) => (a.id === tempId ? created : a));
              void persistState({ ...stateRef.current, savedAlerts: next });
              return next;
            });
          })
          .catch(() => {});
      }
    },
    [persistState, isAuthenticated]
  );

  const removeJobAlert = useCallback(
    (id: string) => {
      setSavedAlerts((prev) => {
        const next = prev.filter((a) => a.id !== id);
        void persistState({ ...stateRef.current, savedAlerts: next });
        return next;
      });
      if (isAuthenticated) {
        void deleteServerAlert(id).catch(() => {});
      }
    },
    [persistState, isAuthenticated]
  );

  const completeOnboarding = useCallback(async () => {
    if (isAuthenticated) {
      const res = await patchServerProfile({
        ...stateRef.current.profile,
        settings: stateRef.current.settings,
        hasCompletedOnboarding: true,
      });
      const completed = Boolean(res.hasCompletedOnboarding ?? true);
      const complete = Boolean(res.isProfileComplete ?? true);
      setHasCompletedOnboarding(completed);
      setIsProfileComplete(complete);
      setMissingProfileFields(res.missingProfileFields ?? []);
      await persistState({
        ...stateRef.current,
        hasCompletedOnboarding: completed,
        isProfileComplete: complete,
      });
      return;
    }

    setHasCompletedOnboarding(true);
    setIsProfileComplete(true);
    await persistState({
      ...stateRef.current,
      hasCompletedOnboarding: true,
      isProfileComplete: true,
    });
  }, [persistState, isAuthenticated]);

  const resetOnboarding = useCallback(async () => {
    setHasCompletedOnboarding(false);
    await persistState({ ...stateRef.current, hasCompletedOnboarding: false });
  }, [persistState]);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        cvFiles,
        settings,
        recentSearches,
        savedAlerts,
        hasCompletedOnboarding,
        isProfileComplete,
        missingProfileFields,
        isHydrated,
        isUploadingCv,
        isUploadingAvatar,
        updateProfile,
        saveProfile,
        updateSettings,
        uploadCv,
        removeCv,
        selectPrimaryCv,
        uploadAvatar,
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
