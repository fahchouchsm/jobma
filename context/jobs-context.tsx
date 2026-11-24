import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAuth } from '@/context/auth-context';
import { type JobListing } from '@/data/jobs';
import {
  DEFAULT_PAGE_SIZE,
  deleteServerApplication,
  fetchOfferById,
  fetchOffersBatch,
  fetchOffersPage,
  fetchOffersStats,
  fetchServerApplications,
  fetchServerSavedOfferIds,
  readCachedOffersFeed,
  saveOfferOnServer,
  type ServerApplicationStatus,
  unsaveOfferOnServer,
  updateServerApplication,
} from '@/services/jobs-service';
import { mapOfferToJobListing } from '@/services/offer-mapper';
import { fetchTargetOffers } from '@/services/profile-service';
import type { OffersQueryParams } from '@/types/offer';

export type ApplicationStatus = 'Envoyée' | 'En cours' | 'Entretien' | 'Offre';

const UI_STATUS_TO_SERVER: Record<ApplicationStatus, ServerApplicationStatus> = {
  Envoyée: 'submitted',
  'En cours': 'viewed',
  Entretien: 'interview',
  Offre: 'offer',
};

function mapServerStatusToUi(status?: string): ApplicationStatus {
  switch (status) {
    case 'viewed':
      return 'En cours';
    case 'interview':
      return 'Entretien';
    case 'offer':
    case 'accepted':
      return 'Offre';
    default:
      return 'Envoyée';
  }
}

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
  offers: JobListing[];
  totalOffers: number;
  targetMatches: Record<string, { score: number; reasons: string[] }>;
  lastScrapeAt: string | null;
  isLoadingOffers: boolean;
  isRefreshingOffers: boolean;
  isLoadingMoreOffers: boolean;
  hasMoreOffers: boolean;
  offersError: string | null;
  queryOffers: (params: OffersQueryParams) => Promise<void>;
  loadTargetOffers: () => Promise<void>;
  refreshOffers: () => Promise<void>;
  loadMoreOffers: () => Promise<void>;
  getOfferById: (id: string) => JobListing | undefined;
  ensureOfferLoaded: (id: string) => Promise<JobListing | null>;
  savedIds: string[];
  appliedIds: string[];
  applications: Record<string, JobApplication>;
  toggleSave: (id: string) => boolean;
  markApplied: (id: string, details?: { cvName?: string; note?: string }) => void;
  updateApplicationStatus: (id: string, status: ApplicationStatus) => void;
  updateApplicationNote: (id: string, note?: string) => void;
  withdrawApplication: (id: string) => JobApplication | null;
  restoreApplication: (application: JobApplication) => void;
  isSaved: (id: string) => boolean;
  isApplied: (id: string) => boolean;
}

const STORAGE_KEY = '@jobma/jobs-state-v1';

const JobsContext = createContext<JobsContextValue | null>(null);

function mergeUniqueOffers(existing: JobListing[], incoming: JobListing[]): JobListing[] {
  if (existing.length === 0) return incoming;
  const map = new Map<string, JobListing>();
  for (const item of existing) map.set(item.id, item);
  for (const item of incoming) map.set(item.id, item);
  return Array.from(map.values());
}

export function JobsProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [applications, setApplications] = useState<Record<string, JobApplication>>({});

  const [offers, setOffers] = useState<JobListing[]>([]);
  const [totalOffers, setTotalOffers] = useState(0);
  const [targetMatches, setTargetMatches] = useState<
    Record<string, { score: number; reasons: string[] }>
  >({});
  const [lastScrapeAt, setLastScrapeAt] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreOffers, setHasMoreOffers] = useState(false);
  const [isLoadingOffers, setIsLoadingOffers] = useState(true);
  const [isRefreshingOffers, setIsRefreshingOffers] = useState(false);
  const [isLoadingMoreOffers, setIsLoadingMoreOffers] = useState(false);
  const [offersError, setOffersError] = useState<string | null>(null);

  const activeQueryRef = useRef<OffersQueryParams>({});
  const isTargetModeRef = useRef(false);
  const requestSeqRef = useRef(0);

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

  const refreshStats = useCallback(() => {
    fetchOffersStats()
      .then((stats) => {
        const ts = stats.lastScrapeRun?.finishedAt ?? stats.lastScrapeRun?.startedAt ?? null;
        if (ts) setLastScrapeAt(ts);
      })
      .catch(() => {});
  }, []);

  // SWR boot: hydrate from bounded disk cache immediately, then revalidate in background if stale
  useEffect(() => {
    let mounted = true;

    async function bootstrapOffers() {
      let hasCached = false;
      try {
        const cached = await readCachedOffersFeed();
        if (mounted && cached && cached.items.length > 0) {
          hasCached = true;
          setOffers(cached.items);
          setTotalOffers(cached.total || cached.items.length);
          setHasMoreOffers((cached.total || cached.items.length) > cached.items.length);
          setIsLoadingOffers(false);
          if (!cached.isStale) {
            refreshStats();
            return;
          }
        }
      } catch {
        // Proceed to network fetch
      }

      try {
        const page1 = await fetchOffersPage({
          page: 1,
          limit: DEFAULT_PAGE_SIZE,
          forceRefresh: hasCached,
        });
        if (!mounted) return;
        setOffers(page1.items);
        setTotalOffers(page1.total);
        setCurrentPage(1);
        setHasMoreOffers(page1.hasNextPage);
        setOffersError(null);
        refreshStats();
      } catch {
        if (!mounted) return;
        if (!hasCached) {
          setOffersError('Impossible de charger les offres. Vérifiez votre connexion.');
        }
      } finally {
        if (mounted) {
          setIsLoadingOffers(false);
        }
      }
    }

    void bootstrapOffers();
    return () => {
      mounted = false;
    };
  }, [refreshStats]);

  const queryOffers = useCallback(async (params: OffersQueryParams) => {
    const seq = ++requestSeqRef.current;
    isTargetModeRef.current = false;
    activeQueryRef.current = params;
    setIsLoadingOffers(true);
    try {
      const page1 = await fetchOffersPage({
        ...params,
        page: 1,
        limit: DEFAULT_PAGE_SIZE,
        forceRefresh: false,
      });
      if (seq !== requestSeqRef.current) return;
      setOffers(page1.items);
      setTotalOffers(page1.total);
      setCurrentPage(1);
      setHasMoreOffers(page1.hasNextPage);
      setOffersError(null);
    } catch {
      if (seq !== requestSeqRef.current) return;
      setOffersError('Recherche serveur indisponible. Vérifiez votre connexion.');
    } finally {
      if (seq === requestSeqRef.current) {
        setIsLoadingOffers(false);
      }
    }
  }, []);

  const loadTargetOffers = useCallback(async () => {
    if (!isAuthenticated) {
      await queryOffers({});
      return;
    }
    const seq = ++requestSeqRef.current;
    isTargetModeRef.current = true;
    activeQueryRef.current = {};
    setIsLoadingOffers(true);
    try {
      const res = await fetchTargetOffers({ page: 1, limit: DEFAULT_PAGE_SIZE });
      if (seq !== requestSeqRef.current) return;
      const mapped = (res.data ?? []).map(mapOfferToJobListing);
      const matchMap: Record<string, { score: number; reasons: string[] }> = {};
      for (const m of res.matches ?? []) {
        if (m.offer?.id) {
          matchMap[m.offer.id] = {
            score: m.matchScore,
            reasons: m.matchReasons ?? [],
          };
        }
      }
      setTargetMatches(matchMap);
      setOffers(mapped);
      setTotalOffers(res.meta?.total ?? mapped.length);
      setCurrentPage(res.meta?.page ?? 1);
      setHasMoreOffers(Boolean(res.meta?.hasNextPage));
      setOffersError(null);
    } catch {
      if (seq !== requestSeqRef.current) return;
      await queryOffers({});
    } finally {
      if (seq === requestSeqRef.current) {
        setIsLoadingOffers(false);
      }
    }
  }, [isAuthenticated, queryOffers]);

  // Cloud sync saved offers & applications when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    let mounted = true;

    Promise.all([fetchServerSavedOfferIds(), fetchServerApplications()])
      .then(async ([serverSavedIds, serverApps]) => {
        if (!mounted) return;
        if (serverSavedIds.length > 0) {
          setSavedIds((prev) => Array.from(new Set([...prev, ...serverSavedIds])));
        }
        if (serverApps.length > 0) {
          setApplications((prev) => {
            const next = { ...prev };
            for (const item of serverApps) {
              if (!item.offerId) continue;
              next[item.offerId] = {
                jobId: item.offerId,
                appliedAt: item.appliedAt ?? item.createdAt ?? new Date().toISOString(),
                status: mapServerStatusToUi(item.status),
                cvName: item.cvName,
                note: item.note,
              };
            }
            return next;
          });
        }

        // Hydrate any saved/applied offer details not in memory via batch endpoint
        const neededIds = Array.from(
          new Set([...serverSavedIds, ...serverApps.map((a) => a.offerId).filter(Boolean)])
        );
        if (neededIds.length > 0) {
          const batched = await fetchOffersBatch(neededIds.slice(0, 50));
          if (mounted && batched.length > 0) {
            setOffers((prev) => mergeUniqueOffers(prev, batched));
          }
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  const refreshOffers = useCallback(async () => {
    const seq = ++requestSeqRef.current;
    setIsRefreshingOffers(true);
    try {
      const page1 = await fetchOffersPage({
        ...activeQueryRef.current,
        page: 1,
        limit: DEFAULT_PAGE_SIZE,
        forceRefresh: true,
      });
      if (seq !== requestSeqRef.current) return;
      setOffers(page1.items);
      setTotalOffers(page1.total);
      setCurrentPage(1);
      setHasMoreOffers(page1.hasNextPage);
      setOffersError(null);
      refreshStats();
    } catch {
      if (seq !== requestSeqRef.current) return;
      setOffersError('Actualisation impossible. Données en cache affichées.');
    } finally {
      if (seq === requestSeqRef.current) {
        setIsRefreshingOffers(false);
      }
    }
  }, [refreshStats]);

  const loadMoreOffers = useCallback(async () => {
    if (isLoadingMoreOffers || !hasMoreOffers) return;
    setIsLoadingMoreOffers(true);
    const nextPage = currentPage + 1;
    try {
      const result = await fetchOffersPage({
        ...activeQueryRef.current,
        page: nextPage,
        limit: DEFAULT_PAGE_SIZE,
        forceRefresh: true,
      });
      setOffers((prev) => mergeUniqueOffers(prev, result.items));
      setTotalOffers(result.total);
      setCurrentPage(result.page);
      setHasMoreOffers(result.hasNextPage);
      setOffersError(null);
    } catch {
      // Keep current list intact on pagination error
    } finally {
      setIsLoadingMoreOffers(false);
    }
  }, [currentPage, hasMoreOffers, isLoadingMoreOffers]);

  const offersById = useMemo(() => {
    const map: Record<string, JobListing> = {};
    for (const item of offers) {
      map[item.id] = item;
    }
    return map;
  }, [offers]);

  const getOfferById = useCallback((id: string) => offersById[id], [offersById]);

  const ensureOfferLoaded = useCallback(
    async (id: string): Promise<JobListing | null> => {
      if (offersById[id]) return offersById[id];
      const fetched = await fetchOfferById(id);
      if (fetched) {
        setOffers((prev) => mergeUniqueOffers(prev, [fetched]));
      }
      return fetched;
    },
    [offersById]
  );

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
      if (isAuthenticated) {
        void (nextSaved ? saveOfferOnServer(id) : unsaveOfferOnServer(id)).catch(() => {});
      }
      return nextSaved;
    },
    [savedIds, applications, persist, isAuthenticated]
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
      if (isAuthenticated) {
        void updateServerApplication(id, { status: UI_STATUS_TO_SERVER[status] }).catch(() => {});
      }
    },
    [savedIds, persist, isAuthenticated]
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
      if (isAuthenticated) {
        void updateServerApplication(id, { note: note ?? '' }).catch(() => {});
      }
    },
    [savedIds, persist, isAuthenticated]
  );

  const withdrawApplication = useCallback(
    (id: string): JobApplication | null => {
      const removed = applications[id] ?? null;
      if (!removed) return null;
      const next = { ...applications };
      delete next[id];
      setApplications(next);
      persist(savedIds, next);
      if (isAuthenticated) {
        void deleteServerApplication(id).catch(() => {});
      }
      return removed;
    },
    [applications, savedIds, persist, isAuthenticated]
  );

  const restoreApplication = useCallback(
    (application: JobApplication) => {
      setApplications((prev) => {
        const next = { ...prev, [application.jobId]: application };
        persist(savedIds, next);
        return next;
      });
    },
    [savedIds, persist]
  );

  const isSaved = useCallback((id: string) => savedIds.includes(id), [savedIds]);

  const isApplied = useCallback((id: string) => Boolean(applications[id]), [applications]);

  const appliedIds = useMemo(() => Object.keys(applications), [applications]);

  return (
    <JobsContext.Provider
      value={{
        offers,
        totalOffers,
        targetMatches,
        lastScrapeAt,
        isLoadingOffers,
        isRefreshingOffers,
        isLoadingMoreOffers,
        hasMoreOffers,
        offersError,
        queryOffers,
        loadTargetOffers,
        refreshOffers,
        loadMoreOffers,
        getOfferById,
        ensureOfferLoaded,
        savedIds,
        appliedIds,
        applications,
        toggleSave,
        markApplied,
        updateApplicationStatus,
        updateApplicationNote,
        withdrawApplication,
        restoreApplication,
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
