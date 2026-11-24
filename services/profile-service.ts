import {
  authenticatedFetch,
  parseApiError,
  resolveApiUrl,
} from '@/services/auth-service';
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
    avatarUrl?: string;
  };
  profile?: Partial<CandidateProfile>;
  settings?: Partial<AppSettings>;
  hasCompletedOnboarding?: boolean;
  isProfileComplete?: boolean;
  missingProfileFields?: string[];
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
  const data = (await res.json()) as ServerProfilePayload;
  if (data.user?.avatarUrl) {
    data.user.avatarUrl = resolveApiUrl(data.user.avatarUrl);
  }
  return data;
}

export async function patchServerProfile(
  payload: Partial<CandidateProfile> & {
    settings?: Partial<AppSettings>;
    hasCompletedOnboarding?: boolean;
  }
): Promise<ServerProfilePayload> {
  const res = await authenticatedFetch('/api/v1/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw await parseApiError(res);
  }
  const data = (await res.json()) as ServerProfilePayload;
  if (data.user?.avatarUrl) {
    data.user.avatarUrl = resolveApiUrl(data.user.avatarUrl);
  }
  return data;
}

export async function uploadProfileAvatar(file: {
  uri: string;
  name: string;
  mimeType?: string;
}): Promise<string> {
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.mimeType || 'image/jpeg',
  } as unknown as Blob);

  const res = await authenticatedFetch('/api/v1/profile/avatar', {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    throw await parseApiError(res);
  }
  const json = (await res.json()) as { avatarUrl?: string; data?: { avatarUrl?: string } };
  const rawUrl = json.avatarUrl ?? json.data?.avatarUrl;
  const resolved = resolveApiUrl(rawUrl);
  if (!resolved) throw new Error('Avatar URL manquante');
  return resolved;
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
    throw await parseApiError(res);
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

export async function fetchProfileCvs(): Promise<CvAttachment[]> {
  const res = await authenticatedFetch('/api/v1/profile/cvs');
  if (!res.ok) return [];
  const json = (await res.json()) as { data?: CvAttachment[] } | CvAttachment[];
  return Array.isArray(json) ? json : (json.data ?? []);
}

export async function setPrimaryProfileCv(cvId: string): Promise<void> {
  await authenticatedFetch(`/api/v1/profile/cvs/${encodeURIComponent(cvId)}/primary`, {
    method: 'PATCH',
  });
}

export async function deleteProfileCv(cvId?: string): Promise<void> {
  if (cvId) {
    const res = await authenticatedFetch(`/api/v1/profile/cvs/${encodeURIComponent(cvId)}`, {
      method: 'DELETE',
    });
    if (res.ok) return;
  }
  await authenticatedFetch('/api/v1/profile/cv', { method: 'DELETE' });
}

export async function downloadProfileCvBlob(cvId?: string): Promise<{ ok: boolean; status: number }> {
  const path = cvId
    ? `/api/v1/profile/cvs/${encodeURIComponent(cvId)}/download`
    : '/api/v1/profile/cv/download';
  let res = await authenticatedFetch(path);
  if (!res.ok && cvId) {
    res = await authenticatedFetch('/api/v1/profile/cv/download');
  }
  return { ok: res.ok, status: res.status };
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
