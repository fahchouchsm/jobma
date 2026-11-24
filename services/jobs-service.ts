import type { JobListing } from '@/data/jobs';
import { LruDiskCache, readTimedCache, writeTimedCache } from '@/lib/cache';
import { buildOffersQueryString } from '@/lib/offers-query';
import { authenticatedFetch } from '@/services/auth-service';
import { mapOfferToJobListing } from '@/services/offer-mapper';
import type {
  HealthResponse,
  Offer,
  OfferDetailResponse,
  OfferSourceResponse,
  OffersListResponse,
  OffersQueryParams,
  OffersStatsResponse,
} from '@/types/offer';

export const DEFAULT_API_BASE_URL = 'https://68.221.71.45.nip.io/offers-api';
export const API_BASE_URL =
  (process.env.EXPO_PUBLIC_OFFERS_API_URL || process.env.EXPO_PUBLIC_API_URL)?.replace(/\/$/, '') ||
  DEFAULT_API_BASE_URL;

export const FEED_CACHE_KEY = '@jobma/offers-feed-v2';
export const FEED_TTL_MS = 10 * 60 * 1000; // 10 minutes
export const DETAIL_TTL_MS = 30 * 60 * 1000; // 30 minutes (matches scraper refresh interval)
export const MAX_FEED_CACHE_ITEMS = 100;
export const MAX_DETAIL_CACHE_ITEMS = 100;
export const DEFAULT_PAGE_SIZE = 20;

const offerDetailCache = new LruDiskCache<Offer>({
  prefix: '@jobma/offer-detail-v2',
  ttlMs: DETAIL_TTL_MS,
  maxEntries: MAX_DETAIL_CACHE_ITEMS,
});

export interface FetchOffersPageResult {
  items: JobListing[];
  page: number;
  total: number;
  hasNextPage: boolean;
  fromCache: boolean;
  isStale: boolean;
}

export interface SubmitApplicationPayload {
  jobId: string;
  cvId?: string;
  cvName?: string;
  note?: string;
}

export interface SubmitApplicationResult {
  ok: true;
  submittedAt: string;
  syncedToServer: boolean;
}

export interface ServerApplicationRecord {
  id?: string;
  offerId: string;
  appliedAt?: string;
  createdAt?: string;
  status?: string;
  cvName?: string;
  note?: string;
}

export { buildOffersQueryString };

async function fetchOffersFromServer(params: OffersQueryParams): Promise<OffersListResponse> {
  const qs = buildOffersQueryString(params);
  const url = `${API_BASE_URL}/api/v1/offers${qs ? `?${qs}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return (await res.json()) as OffersListResponse;
}

async function fetchOfferDetailFromServer(id: string): Promise<Offer | null> {
  const res = await fetch(`${API_BASE_URL}/api/v1/offers/${encodeURIComponent(id)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as OfferDetailResponse;
  return json.data;
}

/**
 * Reads cached page-1 offers immediately (SWR) so the UI renders without waiting for the network.
 */
export async function readCachedOffersFeed(): Promise<{
  items: JobListing[];
  total: number;
  isStale: boolean;
} | null> {
  const cached = await readTimedCache<{ items: Offer[]; total: number }>(
    FEED_CACHE_KEY,
    FEED_TTL_MS
  );
  if (!cached || !Array.isArray(cached.data.items)) return null;
  return {
    items: cached.data.items.map(mapOfferToJobListing),
    total: cached.data.total,
    isStale: cached.isStale,
  };
}

/**
 * Fetches a page of offers from the Morocco Opportunities REST API and updates bounded SWR + LRU caches.
 */
export async function fetchOffersPage({
  page = 1,
  limit = DEFAULT_PAGE_SIZE,
  forceRefresh = false,
  ...filters
}: OffersQueryParams & { forceRefresh?: boolean } = {}): Promise<FetchOffersPageResult> {
  const hasServerFilters = Boolean(
    filters.category ||
      filters.workMode ||
      filters.contractType ||
      filters.level ||
      filters.status ||
      filters.location ||
      filters.search ||
      filters.minSalary ||
      filters.sort
  );

  if (page === 1 && !forceRefresh && !hasServerFilters) {
    const cached = await readTimedCache<{ items: Offer[]; total: number }>(
      FEED_CACHE_KEY,
      FEED_TTL_MS
    );
    if (cached && !cached.isStale && cached.data.items.length > 0) {
      return {
        items: cached.data.items.map(mapOfferToJobListing),
        page: 1,
        total: cached.data.total,
        hasNextPage: cached.data.total > cached.data.items.length,
        fromCache: true,
        isStale: false,
      };
    }
  }

  const response = await fetchOffersFromServer({ page, limit, ...filters });

  // Warm bounded per-item LRU cache for instant detail views
  await offerDetailCache.setMany(
    response.data.map((offer) => ({ id: offer.id, data: offer }))
  );

  // Persist bounded page-1 unfiltered feed cache
  if (page === 1 && !hasServerFilters) {
    await writeTimedCache(FEED_CACHE_KEY, {
      items: response.data.slice(0, MAX_FEED_CACHE_ITEMS),
      total: response.meta.total,
    });
  }

  return {
    items: response.data.map(mapOfferToJobListing),
    page: response.meta.page,
    total: response.meta.total,
    hasNextPage: response.meta.hasNextPage,
    fromCache: false,
    isStale: false,
  };
}

/**
 * Fetches a single offer by ID using the bounded LRU detail cache with server fallback.
 */
export async function fetchOfferById(
  id: string,
  { forceRefresh = false }: { forceRefresh?: boolean } = {}
): Promise<JobListing | null> {
  if (!forceRefresh) {
    const cached = await offerDetailCache.get(id);
    if (cached && !cached.isStale) {
      return mapOfferToJobListing(cached.data);
    }
  }

  const offer = await fetchOfferDetailFromServer(id);
  if (!offer) return null;

  await offerDetailCache.set(offer.id, offer);
  return mapOfferToJobListing(offer);
}

/**
 * Fetches the original Moroccan job posting source URL & merged sources for an offer.
 */
export async function fetchOfferSource(id: string): Promise<OfferSourceResponse | null> {
  const res = await fetch(`${API_BASE_URL}/api/v1/offers/${encodeURIComponent(id)}/source`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as OfferSourceResponse;
}

export async function fetchOffersStats(): Promise<OffersStatsResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/stats`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as OffersStatsResponse;
}

export async function fetchApiHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE_URL}/health`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as HealthResponse;
}

export async function fetchOffersBatch(ids: string[]): Promise<JobListing[]> {
  if (ids.length === 0) return [];
  const res = await fetch(
    `${API_BASE_URL}/api/v1/offers/batch?ids=${encodeURIComponent(ids.join(','))}`
  );
  if (!res.ok) return [];
  const json = (await res.json()) as { data?: Offer[] } | Offer[];
  const list = Array.isArray(json) ? json : (json.data ?? []);
  return list.map(mapOfferToJobListing);
}

export async function fetchSimilarOffers(id: string, limit = 6): Promise<JobListing[]> {
  const res = await fetch(
    `${API_BASE_URL}/api/v1/offers/${encodeURIComponent(id)}/similar?limit=${limit}`
  );
  if (!res.ok) return [];
  const json = (await res.json()) as { data?: Offer[] } | Offer[];
  const list = Array.isArray(json) ? json : (json.data ?? []);
  return list.map(mapOfferToJobListing);
}

export async function fetchServerSavedOfferIds(): Promise<string[]> {
  const res = await authenticatedFetch('/api/v1/saved');
  if (!res.ok) return [];
  const json = (await res.json()) as
    | { data?: (string | { offerId?: string; id?: string })[] }
    | (string | { offerId?: string; id?: string })[];
  const list = Array.isArray(json) ? json : (json.data ?? []);
  return list
    .map((item) => (typeof item === 'string' ? item : (item.offerId ?? item.id ?? '')))
    .filter(Boolean);
}

export async function saveOfferOnServer(offerId: string): Promise<void> {
  await authenticatedFetch(`/api/v1/saved/${encodeURIComponent(offerId)}`, {
    method: 'POST',
  });
}

export async function unsaveOfferOnServer(offerId: string): Promise<void> {
  await authenticatedFetch(`/api/v1/saved/${encodeURIComponent(offerId)}`, {
    method: 'DELETE',
  });
}

export async function fetchServerApplications(): Promise<ServerApplicationRecord[]> {
  const res = await authenticatedFetch('/api/v1/applications');
  if (!res.ok) return [];
  const json = (await res.json()) as
    | { data?: ServerApplicationRecord[] }
    | ServerApplicationRecord[];
  return Array.isArray(json) ? json : (json.data ?? []);
}

/**
 * Submits a job application to POST /api/v1/applications when authenticated,
 * with graceful local fallback in guest mode.
 */
export async function submitApplication(
  payload: SubmitApplicationPayload,
  isAuthenticated = false
): Promise<SubmitApplicationResult> {
  if (isAuthenticated) {
    const res = await authenticatedFetch('/api/v1/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        offerId: payload.jobId,
        cvId: payload.cvId,
        note: payload.note,
      }),
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return {
      ok: true,
      submittedAt: new Date().toISOString(),
      syncedToServer: true,
    };
  }

  return {
    ok: true,
    submittedAt: new Date().toISOString(),
    syncedToServer: false,
  };
}
