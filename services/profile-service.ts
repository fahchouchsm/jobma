import { authenticatedFetch } from '@/services/auth-service';
import type {
  AppSettings,
  CandidateProfile,
  CvAttachment,
  JobAlert,
} from '@/context/profile-context';
import type { Offer } from '@/types/offer';

export interface ServerProfilePayload {
  user?: {
    id: string;
    email: string;
    fullName?: string;
  };
  profile?: Partial<CandidateProfile>;
  settings?: Partial<AppSettings>;
  hasCompletedOnboarding?: boolean;
  savedCount?: number;
  applicationsCount?: number;
}

export interface TargetOfferMatchItem {
  offer: Offer;
  matchScore: number;
  matchReasons: string[];
}

export interface TargetOffersResponse {
  data: Offer[];
  matches?: TargetOfferMatchItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    hasNextPage: boolean;
  };
}

export async function fetchServerProfile(): Promise<ServerProfilePayload | null> {
  const res = await authenticatedFetch('/api/v1/profile');
  if (!res.ok) return null;
  return (await res.json()) as ServerProfilePayload;
}

export async function patchServerProfile(
  payload: Partial<CandidateProfile> & {
    settings?: Partial<AppSettings>;
    hasCompletedOnboarding?: boolean;
  }
): Promise<ServerProfilePayload | null> {
  const res = await authenticatedFetch('/api/v1/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) return null;
  return (await res.json()) as ServerProfilePayload;
}

export async function uploadProfileCv(file: {
  uri: string;
  name: string;
  mimeType?: string;
}): Promise<CvAttachment> {
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.mimeType || 'application/pdf',
  } as unknown as Blob);

  const res = await authenticatedFetch('/api/v1/profile/cv', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`CV upload failed (${res.status})`);
  }

  const json = (await res.json()) as { data?: CvAttachment } & Partial<CvAttachment>;
  const uploaded = json.data ?? json;
  return {
    id: uploaded.id,
    name: uploaded.name ?? file.name,
    size: uploaded.size,
    uri: uploaded.uri ?? file.uri,
    mimeType: uploaded.mimeType ?? file.mimeType,
    uploadedAt: uploaded.uploadedAt,
    isPrimary: uploaded.isPrimary,
  };
}

export async function deleteProfileCv(): Promise<void> {
  await authenticatedFetch('/api/v1/profile/cv', { method: 'DELETE' });
}

export async function fetchTargetOffers({
  page = 1,
  limit = 20,
}: {
  page?: number;
  limit?: number;
} = {}): Promise<TargetOffersResponse> {
  const res = await authenticatedFetch(
    `/api/v1/profile/target-offers?page=${page}&limit=${limit}`
  );
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return (await res.json()) as TargetOffersResponse;
}

export async function fetchServerAlerts(): Promise<JobAlert[]> {
  const res = await authenticatedFetch('/api/v1/alerts');
  if (!res.ok) return [];
  const json = (await res.json()) as { data?: JobAlert[] } | JobAlert[];
  return Array.isArray(json) ? json : (json.data ?? []);
}

export async function createServerAlert(
  alert: Omit<JobAlert, 'id' | 'createdAt'>
): Promise<JobAlert | null> {
  const res = await authenticatedFetch('/api/v1/alerts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(alert),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { data?: JobAlert } & Partial<JobAlert>;
  return (json.data ?? json) as JobAlert;
}

export async function deleteServerAlert(id: string): Promise<void> {
  await authenticatedFetch(`/api/v1/alerts/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
