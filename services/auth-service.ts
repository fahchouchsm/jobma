import {
  clearStoredTokens,
  getStoredTokens,
  saveStoredTokens,
} from '@/lib/secure-storage';
import type { AppSettings, CandidateProfile } from '@/context/profile-context';

export const DEFAULT_API_BASE_URL = 'https://68.221.71.45.nip.io/offers-api';
export const API_BASE_URL =
  (process.env.EXPO_PUBLIC_OFFERS_API_URL || process.env.EXPO_PUBLIC_API_URL)?.replace(/\/$/, '') ||
  DEFAULT_API_BASE_URL;

export function resolveApiUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/')) return `${API_BASE_URL}${path}`;
  return `${API_BASE_URL}/${path}`;
}

export class ApiValidationError extends Error {
  fieldErrors: Record<string, string>;

  constructor(message: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = 'ApiValidationError';
    this.fieldErrors = fieldErrors;
  }
}

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  provider?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
  isNewUser?: boolean;
  user: AuthUser;
  profile?: Partial<CandidateProfile>;
  settings?: Partial<AppSettings>;
  hasCompletedOnboarding?: boolean;
  isProfileComplete?: boolean;
  missingProfileFields?: string[];
}

export interface MeResponse {
  user: AuthUser;
  hasCompletedOnboarding?: boolean;
  isProfileComplete?: boolean;
  missingProfileFields?: string[];
}

function normalizeUser(user: AuthUser): AuthUser {
  return {
    ...user,
    avatarUrl: resolveApiUrl(user.avatarUrl),
  };
}

function normalizeAuthResponse(data: AuthResponse): AuthResponse {
  return {
    ...data,
    user: normalizeUser(data.user),
  };
}

type UnauthorizedListener = () => void;
const unauthorizedListeners = new Set<UnauthorizedListener>();

export function onUnauthorized(listener: UnauthorizedListener): () => void {
  unauthorizedListeners.add(listener);
  return () => {
    unauthorizedListeners.delete(listener);
  };
}

function emitUnauthorized() {
  for (const listener of unauthorizedListeners) {
    listener();
  }
}

export async function parseApiError(res: Response): Promise<Error> {
  try {
    const body = (await res.json()) as {
      message?: string;
      error?: string;
      fieldErrors?: Record<string, string>;
    };
    const msg = body.message || body.error || `Erreur HTTP ${res.status}`;
    if (res.status === 400 && body.fieldErrors && typeof body.fieldErrors === 'object') {
      return new ApiValidationError(msg, body.fieldErrors);
    }
    return new Error(msg);
  } catch {
    return new Error(`Erreur HTTP ${res.status}`);
  }
}

export async function registerWithEmail(payload: {
  email: string;
  password: string;
  fullName: string;
}): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw await parseApiError(res);
  const data = normalizeAuthResponse((await res.json()) as AuthResponse);
  await saveStoredTokens(data.accessToken, data.refreshToken);
  return data;
}

export async function loginWithEmail(payload: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw await parseApiError(res);
  const data = normalizeAuthResponse((await res.json()) as AuthResponse);
  await saveStoredTokens(data.accessToken, data.refreshToken);
  return data;
}

export async function loginWithGoogle(idToken: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) throw await parseApiError(res);
  const data = normalizeAuthResponse((await res.json()) as AuthResponse);
  await saveStoredTokens(data.accessToken, data.refreshToken);
  return data;
}

export async function requestPasswordReset(email: string): Promise<{ ok: boolean; message: string }> {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim() }),
  });
  if (!res.ok) throw await parseApiError(res);
  return (await res.json()) as { ok: boolean; message: string };
}

export async function confirmPasswordReset(
  token: string,
  newPassword: string
): Promise<{ ok: boolean; message: string }> {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: token.trim(), newPassword }),
  });
  if (!res.ok) throw await parseApiError(res);
  return (await res.json()) as { ok: boolean; message: string };
}

let inFlightRefresh: Promise<AuthResponse | null> | null = null;

export async function refreshAuthSession(): Promise<AuthResponse | null> {
  if (inFlightRefresh) return inFlightRefresh;

  inFlightRefresh = (async () => {
    const { refreshToken } = await getStoredTokens();
    if (!refreshToken) return null;

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) {
        await clearStoredTokens();
        emitUnauthorized();
        return null;
      }
      const data = normalizeAuthResponse((await res.json()) as AuthResponse);
      await saveStoredTokens(data.accessToken, data.refreshToken);
      return data;
    } catch {
      return null;
    } finally {
      inFlightRefresh = null;
    }
  })();

  return inFlightRefresh;
}

export async function logoutFromServer(): Promise<void> {
  const { refreshToken } = await getStoredTokens();
  await clearStoredTokens();
  if (!refreshToken) return;
  try {
    await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    // Best-effort server logout
  }
}

export async function deleteAccountOnServer(): Promise<void> {
  const res = await authenticatedFetch('/api/v1/auth/account', {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw await parseApiError(res);
  }
  await clearStoredTokens();
}

export async function authenticatedFetch(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const { accessToken } = await getStoredTokens();
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;

  const headers = new Headers(init.headers);
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  let res = await fetch(url, { ...init, headers });

  if (res.status === 401) {
    const refreshed = await refreshAuthSession();
    if (refreshed?.accessToken) {
      headers.set('Authorization', `Bearer ${refreshed.accessToken}`);
      res = await fetch(url, { ...init, headers });
    }
  }

  return res;
}

export async function fetchCurrentUser(): Promise<MeResponse | null> {
  const { accessToken } = await getStoredTokens();
  if (!accessToken) return null;

  const res = await authenticatedFetch('/api/v1/auth/me');
  if (!res.ok) return null;
  const body = (await res.json()) as {
    user?: AuthUser;
    hasCompletedOnboarding?: boolean;
    isProfileComplete?: boolean;
    missingProfileFields?: string[];
  } & Partial<AuthUser>;

  const rawUser = body.user ?? (body.id && body.email ? (body as AuthUser) : null);
  if (!rawUser) return null;

  return {
    user: normalizeUser(rawUser),
    hasCompletedOnboarding: body.hasCompletedOnboarding,
    isProfileComplete: body.isProfileComplete,
    missingProfileFields: body.missingProfileFields,
  };
}
