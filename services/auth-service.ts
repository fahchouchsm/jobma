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

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { message?: string; error?: string };
    return body.message || body.error || `Erreur HTTP ${res.status}`;
  } catch {
    return `Erreur HTTP ${res.status}`;
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
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  const data = (await res.json()) as AuthResponse;
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
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  const data = (await res.json()) as AuthResponse;
  await saveStoredTokens(data.accessToken, data.refreshToken);
  return data;
}

export async function loginWithGoogle(idToken: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  const data = (await res.json()) as AuthResponse;
  await saveStoredTokens(data.accessToken, data.refreshToken);
  return data;
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
      const data = (await res.json()) as AuthResponse;
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

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  const { accessToken } = await getStoredTokens();
  if (!accessToken) return null;

  const res = await authenticatedFetch('/api/v1/auth/me');
  if (!res.ok) return null;
  const body = (await res.json()) as { user?: AuthUser } & Partial<AuthUser>;
  if (body.user) return body.user;
  if (body.id && body.email) return body as AuthUser;
  return null;
}
