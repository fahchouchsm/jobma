import React, { createContext, useCallback, useContext, useState } from 'react';

interface JobsContextValue {
  savedIds: string[];
  appliedIds: string[];
  toggleSave: (id: string) => boolean;
  markApplied: (id: string) => void;
  isSaved: (id: string) => boolean;
  isApplied: (id: string) => boolean;
}

const JobsContext = createContext<JobsContextValue | null>(null);

export function JobsProvider({ children }: { children: React.ReactNode }) {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [appliedIds, setAppliedIds] = useState<string[]>([]);

  const toggleSave = useCallback((id: string): boolean => {
    let nextSaved = false;
    setSavedIds((prev) => {
      if (prev.includes(id)) {
        nextSaved = false;
        return prev.filter((item) => item !== id);
      }
      nextSaved = true;
      return [...prev, id];
    });
    return nextSaved;
  }, []);

  const markApplied = useCallback((id: string) => {
    setAppliedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const isSaved = useCallback((id: string) => savedIds.includes(id), [savedIds]);

  const isApplied = useCallback((id: string) => appliedIds.includes(id), [appliedIds]);

  return (
    <JobsContext.Provider
      value={{
        savedIds,
        appliedIds,
        toggleSave,
        markApplied,
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
