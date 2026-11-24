import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type ApplicationStatus = 'Envoyée' | 'En cours' | 'Entretien' | 'Offre';

export interface JobApplication {
  jobId: string;
  appliedAt: string;
  status: ApplicationStatus;
  cvName?: string;
  note?: string;
}

interface PersistedJobsState {
  savedIds: string[];
  applications: Record<string, JobApplication>;
}

interface JobsContextValue {
  savedIds: string[];
  appliedIds: string[];
  applications: Record<string, JobApplication>;
  toggleSave: (id: string) => boolean;
  markApplied: (id: string, details?: { cvName?: string; note?: string }) => void;
  updateApplicationStatus: (id: string, status: ApplicationStatus) => void;
  updateApplicationNote: (id: string, note?: string) => void;
  withdrawApplication: (id: string) => void;
  isSaved: (id: string) => boolean;
  isApplied: (id: string) => boolean;
}

const STORAGE_KEY = '@jobma/jobs-state-v1';

const JobsContext = createContext<JobsContextValue | null>(null);

export function JobsProvider({ children }: { children: React.ReactNode }) {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [applications, setApplications] = useState<Record<string, JobApplication>>({});

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!mounted || !raw) return;
        const parsed = JSON.parse(raw) as Partial<PersistedJobsState>;
        if (Array.isArray(parsed.savedIds)) setSavedIds(parsed.savedIds);
        if (parsed.applications && typeof parsed.applications === 'object') {
          setApplications(parsed.applications);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const persist = useCallback((nextSaved: string[], nextApps: Record<string, JobApplication>) => {
    const payload: PersistedJobsState = {
      savedIds: nextSaved,
      applications: nextApps,
    };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload)).catch(() => {});
  }, []);

  const toggleSave = useCallback(
    (id: string): boolean => {
      const nextSaved = !savedIds.includes(id);
      const updated = nextSaved ? [...savedIds, id] : savedIds.filter((item) => item !== id);
      setSavedIds(updated);
      persist(updated, applications);
      return nextSaved;
    },
    [savedIds, applications, persist]
  );

  const markApplied = useCallback(
    (id: string, details?: { cvName?: string; note?: string }) => {
      setApplications((prev) => {
        if (prev[id]) return prev;
        const next: Record<string, JobApplication> = {
          ...prev,
          [id]: {
            jobId: id,
            appliedAt: new Date().toISOString(),
            status: 'Envoyée',
            cvName: details?.cvName,
            note: details?.note,
          },
        };
        persist(savedIds, next);
        return next;
      });
    },
    [savedIds, persist]
  );

  const updateApplicationStatus = useCallback(
    (id: string, status: ApplicationStatus) => {
      setApplications((prev) => {
        const existing = prev[id];
        if (!existing) return prev;
        const next: Record<string, JobApplication> = {
          ...prev,
          [id]: { ...existing, status },
        };
        persist(savedIds, next);
        return next;
      });
    },
    [savedIds, persist]
  );

  const updateApplicationNote = useCallback(
    (id: string, note?: string) => {
      setApplications((prev) => {
        const existing = prev[id];
        if (!existing) return prev;
        const next: Record<string, JobApplication> = {
          ...prev,
          [id]: { ...existing, note },
        };
        persist(savedIds, next);
        return next;
      });
    },
    [savedIds, persist]
  );

  const withdrawApplication = useCallback(
    (id: string) => {
      setApplications((prev) => {
        const next = { ...prev };
        delete next[id];
        persist(savedIds, next);
        return next;
      });
    },
    [savedIds, persist]
  );

  const isSaved = useCallback((id: string) => savedIds.includes(id), [savedIds]);

  const isApplied = useCallback((id: string) => Boolean(applications[id]), [applications]);

  const appliedIds = Object.keys(applications);

  return (
    <JobsContext.Provider
      value={{
        savedIds,
        appliedIds,
        applications,
        toggleSave,
        markApplied,
        updateApplicationStatus,
        updateApplicationNote,
        withdrawApplication,
        isSaved,
        isApplied,
      }}>
      {children}
    </JobsContext.Provider>
  );
}

export function useJobs() {
  const ctx = useContext(JobsContext);
  if (!ctx) {
    throw new Error('useJobs must be used within a JobsProvider');
  }
  return ctx;
}
