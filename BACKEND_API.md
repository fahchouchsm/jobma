# Jobma Backend API Documentation (Single Source of Truth)

> **Live Base URL (HTTPS — use for iOS, Android & Web):**
> `https://68.221.71.45.nip.io/offers-api`
>
> **Direct HTTP Port (requires Azure NSG TCP 3040 open):**
> `http://68.221.71.45:3040`
>
> **Tech Stack:** Spring Boot 3.4.5 (Java 21) + SQLite WAL + Jsoup Scraper (runs automatically every **30 minutes** across **ReKrute**, **Stagiaires.ma**, **Jobi.ma**, and **MarocAnnonces**, strictly filtered to **Morocco** with 3-layer cross-site deduplication).
>
> **CORS:** Enabled (`*`). All JSON responses are UTF-8, gzip-compressed, `null` optional fields omitted.

---

## 1. Environment Variables (`.env` in `jobma`)

Already configured in `.env` (gitignored):
```env
EXPO_PUBLIC_OFFERS_API_URL=https://68.221.71.45.nip.io/offers-api
EXPO_PUBLIC_GOOGLE_CLIENT_ID=608738611615-jal7d7da373pnnebcr42qpunkccnfeq5.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=608738611615-jal7d7da373pnnebcr42qpunkccnfeq5.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=608738611615-ancv8a4kh96uc7g2bnug17nc0t7kdhht.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=608738611615-slljajgtu5i9i165so6ok4j5q7h7inda.apps.googleusercontent.com
```
- **Bundle ID / Android Package:** `com.jobma.app`
- **URL Scheme:** `jobma`
- All 3 Google OAuth Client IDs are whitelisted in `GOOGLE_CLIENT_IDS` on the server.

---

## 2. Error Format

All `400` validation errors return structured field-level errors:
```json
{
  "error": "validation_error",
  "message": "Please complete all required profile fields",
  "fieldErrors": {
    "phone": "Required to complete onboarding",
    "headline": "Required to complete onboarding"
  }
}
```
Other standard statuses:
- `401 Unauthorized` — `{ "error": "unauthorized", "message": "Valid Bearer token required" }` (trigger token refresh via `POST /api/v1/auth/refresh`)
- `404 Not Found` — resource does not exist
- `409 Conflict` — `{ "error": "conflict", "message": "An account with this email already exists" }`
- `413 Payload Too Large` — CV > 10 MB or Avatar > 5 MB

---

## 3. Authentication & Account Gate (`/api/v1/auth`)

### `AuthResponse` Shape
Returned by `/register`, `/login`, `/google`, and `/refresh`:
```ts
interface AuthResponse {
  accessToken: string;           // JWT Bearer token (24h TTL)
  refreshToken: string;          // Opaque rotating refresh token (30d TTL)
  expiresIn: number;             // Seconds (86400)
  isNewUser: boolean;
  user: {
    id: string;
    email: string;
    authProvider: 'EMAIL' | 'GOOGLE' | 'BOTH';
    emailVerified: boolean;
    avatarUrl?: string;          // Relative path "/api/v1/avatars/..." or Google https URL
    createdAt: string;
    lastLoginAt?: string;
  };
  profile: CandidateProfileDto;
  settings: AppSettingsDto;
  hasCompletedOnboarding: boolean;
  isProfileComplete: boolean;
  missingProfileFields: string[];
}
```
> **Routing Gate Rule:** Route to `/(tabs)` only when `hasCompletedOnboarding && isProfileComplete`; otherwise route to `/onboarding`.

### Endpoints
| Method | Path | Auth | Request Body | Response |
| :--- | :--- | :---: | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Public | `{ email, password (≥8), fullName (≥2) }` | `201` `AuthResponse` |
| `POST` | `/api/v1/auth/login` | Public | `{ email, password }` | `200` `AuthResponse` |
| `POST` | `/api/v1/auth/google` | Public | `{ idToken }` (Google OAuth ID token) | `200` `AuthResponse` |
| `POST` | `/api/v1/auth/refresh` | Public | `{ refreshToken }` | `200` `AuthResponse` (rotates refresh token) |
| `POST` | `/api/v1/auth/logout` | Public | `{ refreshToken }` | `200` `{ ok: true }` |
| `POST` | `/api/v1/auth/forgot-password` | Public | `{ email }` | `200` `{ ok: true, message }` (15-min 6-digit code) |
| `POST` | `/api/v1/auth/reset-password` | Public | `{ token, newPassword (≥8) }` | `200` `{ ok: true, message }` |
| `GET` | `/api/v1/auth/me` | Bearer | — | `200` `ProfileResponse` |
| `DELETE` | `/api/v1/auth/account` | Bearer | — | `200` `{ ok: true }` (deletes user, profile, CVs, avatar, saved, apps, alerts) |

---

## 4. Candidate Profile, Target Jobs, Avatar & CV (`/api/v1/profile`)

All `/api/v1/profile/**` endpoints require `Authorization: Bearer <accessToken>`.

### `ProfileResponse` Shape (`GET /api/v1/profile`, `PUT /api/v1/profile`, `PATCH /api/v1/profile`, `GET /api/v1/auth/me`)
```ts
interface ProfileResponse {
  user: UserDto;
  profile: {
    userId: string;
    fullName: string;
    headline: string;
    bio: string;
    phone: string;
    location: string;
    avatarUrl?: string;
    domains: string[];
    experienceLevel: string;
    skills: string[];
    targetJobs: string[];
    targetCities: string[];
    workModes: string[];
    contractTypes: string[];
    minSalaryK: number;          // k MAD / month
    availability: string;
    cvFile?: {
      id: string;
      name: string;
      size: number;
      uri: string;               // "/api/v1/profile/cvs/{id}/download"
      mimeType: string;
      uploadedAt: string;
      isPrimary: boolean;
    };
    portfolioUrl: string;
    linkedinUrl: string;
    githubUrl: string;
    oneClickApplyEnabled: boolean;
    updatedAt: string;
  };
  settings: {
    themePreference: 'light' | 'dark';
    jobAlertsEnabled: boolean;
    emailDigestEnabled: boolean;
    recruiterVisibility: boolean;
    salaryTransparencyOnly: boolean;
  };
  hasCompletedOnboarding: boolean;
  isProfileComplete: boolean;
  missingProfileFields: string[];
  savedCount: number;
  applicationsCount: number;
}
```

### Required Fields to Complete Onboarding (`hasCompletedOnboarding: true`)
When sending `{ hasCompletedOnboarding: true }` on `PUT` or `PATCH /api/v1/profile`, the server validates:
- **Required:** `domains` (≥1 item).
- **Optional during onboarding (never returns 400 when empty/omitted):** `phone`, `headline`, `location`, `targetJobs`, `targetCities` (supports `"Tout le Maroc"` to match offers across all Moroccan cities), `skills`, `workModes`, `contractTypes`, `availability`, `cvFile`, `minSalaryK`, `bio`, `portfolioUrl`, `linkedinUrl`, `githubUrl`, `avatarUrl`.
- `isProfileComplete` is `true` as soon as `domains.length >= 1`.

### Profile, Target Offers, Avatar & CV Endpoints
| Method | Path | Content-Type | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/profile` | JSON | Fetch full profile, settings, completeness flags, counts |
| `PUT` / `PATCH` | `/api/v1/profile` | JSON | Partial or full profile/settings update |
| `GET` | `/api/v1/profile/target-offers?page=1&limit=20` | JSON | Personalized Moroccan offers ranked by `targetJobs`, `skills`, `domains`, `targetCities`, `workModes`, `contractTypes`, `minSalaryK`. Returns `{ data: Offer[], matches: [{ offer, matchScore, matchReasons }], meta }`. |
| `POST` | `/api/v1/profile/avatar` | `multipart/form-data` (`file`) | Upload profile photo (JPG/PNG/WEBP, max 5 MB) → `201` `{ avatarUrl }`. If `avatarUrl` starts with `/`, prepend `API_BASE_URL` (served publicly at `GET /api/v1/avatars/{userId}/{file}`, no auth needed for `<Image />`). |
| `POST` | `/api/v1/profile/cv` | `multipart/form-data` (`file`) | Upload CV (PDF/DOC/DOCX, max 10 MB) and set as primary → `201` `{ data: CvAttachmentDto }` |
| `GET` | `/api/v1/profile/cv` | JSON | Primary CV metadata (`404` if none) |
| `GET` | `/api/v1/profile/cv/download` | Binary | Download primary CV file (requires Bearer token) |
| `DELETE` | `/api/v1/profile/cv` | JSON | Delete primary CV |
| `GET` | `/api/v1/profile/cvs` | JSON | List all uploaded CVs (`{ data: CvAttachmentDto[] }`) |
| `PATCH` | `/api/v1/profile/cvs/{cvId}/primary` | JSON | Set a specific CV as primary (`{ ok: true, data: CvAttachmentDto }`) |
| `GET` | `/api/v1/profile/cvs/{cvId}/download` | Binary | Download specific CV (requires Bearer token) |
| `DELETE` | `/api/v1/profile/cvs/{cvId}` | JSON | Delete specific CV |

---

## 5. Moroccan Offers & Domains (`/api/v1/offers`, `/api/v1/domains`)

Public endpoints (no Bearer token required).

### Real Moroccan Domains (15 Domains)
Every `Offer` includes both `category` (`'Design' | 'Engineering' | 'Product' | 'IA & Data'`) and `domain` (one of):
- `Engineering`
- `IA & Data`
- `Design`
- `Product`
- `Finance`
- `Marketing`
- `Commercial & Vente`
- `Ressources Humaines`
- `Logistique & Supply Chain`
- `Santé & Pharmacie`
- `Tourisme & Hôtellerie`
- `BTP & Immobilier`
- `Juridique & Droit`
- `Éducation & Formation`
- `Autres`

### Endpoints
| Method | Path | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/offers` | Paginated `OffersListResponse` (`{ data: Offer[], meta: { page, limit, total, hasNextPage } }`). Query params: `page` (1-indexed), `limit` (1..100, default 20), `domain` (single or comma-separated), `category`, `workMode`, `contractType`, `level`, `status` (default `active`, or `all`), `location`, `search` (multi-word AND search), `minSalary`, `sort` (`newest` \| `salary_desc` \| `updated`). |
| `GET` | `/api/v1/domains` | Live domains sorted by active offer count: `{ data: [{ domain: string, count: number }] }`. |
| `GET` | `/api/v1/offers/{id}` | Single offer: `OfferDetailResponse` (`{ data: Offer }`). |
| `GET` | `/api/v1/offers/{id}/source` | Original Moroccan listing link for external apply: `{ offerId, sourceSite, sourceUrl, mergedSources }`. |
| `GET` | `/api/v1/offers/{id}/similar?limit=6` | Similar Moroccan offers: `{ data: Offer[] }`. |
| `GET` | `/api/v1/offers/batch?ids=id1,id2,...` | Fetch up to 100 offers by ID in one call: `{ data: Offer[] }`. |
| `GET` | `/api/v1/stats` | Catalog stats: `{ activeOffers, totalActive, closedOffers, scraperRunning, byDomain, byCategory, byWorkMode, byContractType, byLocation, bySource, lastScrapeRun }`. |
| `GET` | `/health` | Health probe: `{ status: "UP", activeOffers, scraperRunning, lastScrapeRun }`. |

---

## 6. Cloud-Synced Saved Offers, Applications & Job Alerts (Bearer Required)

| Method | Path | Request Body | Response |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/saved` | — | `{ data: [{ offerId, savedAt, offer }] }` |
| `POST` | `/api/v1/saved/{offerId}` | — | `201` `{ data: { offerId, savedAt, offer } }` |
| `DELETE` | `/api/v1/saved/{offerId}` | — | `200` `{ ok: true }` |
| `GET` | `/api/v1/applications` | — | `{ data: [{ id, offerId, cvId, cvName, note, status, submittedAt, offer }] }` |
| `POST` | `/api/v1/applications` | `{ offerId, cvId?, note? }` | `201` `{ ok: true, submittedAt, data }` (auto-attaches primary CV if `cvId` omitted) |
| `PATCH` | `/api/v1/applications/{offerId}` | `{ status?, note? }` | `200` `{ ok: true, data }` (statuses: `submitted`, `viewed`, `interview`, `offer`, `rejected`, `accepted`, `withdrawn`) |
| `DELETE` | `/api/v1/applications/{offerId}` | — | `200` `{ ok: true }` |
| `GET` | `/api/v1/alerts` | — | `{ data: [{ id, query, workMode?, minSalaryK?, createdAt }] }` |
| `POST` | `/api/v1/alerts` | `{ query, workMode?, minSalaryK? }` | `201` `{ data: JobAlertDto }` |
| `DELETE` | `/api/v1/alerts/{alertId}` | — | `200` `{ ok: true }` |
| `POST` | `/api/v1/notifications/push-token` | `{ token, platform? }` | `201` `{ ok: true }` (registers Expo push token) |
| `DELETE` | `/api/v1/notifications/push-token` | `{ token? }` or `?token=...` | `200` `{ ok: true }` |
| `GET` | `/api/v1/offers/hidden` | — | `200` `{ data: string[] }` (hidden offer IDs) |
| `POST` | `/api/v1/offers/{id}/hide` | — | `201` `{ ok: true, offerId }` (excluded from `/profile/target-offers`) |
| `DELETE` | `/api/v1/offers/{id}/hide` | — | `200` `{ ok: true }` |
