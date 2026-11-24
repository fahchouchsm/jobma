export type OfferWorkMode = 'remote' | 'hybrid' | 'onsite';

export type OfferContractType = 'full_time' | 'part_time' | 'freelance' | 'internship';

export type OfferLevel = 'junior' | 'mid' | 'senior' | 'lead' | 'staff';

export type OfferCategory = 'Design' | 'Engineering' | 'Product' | 'IA & Data';

export type OfferStatus = 'active' | 'paused' | 'closed';

export interface OfferSalary {
  min: number;
  max: number;
  currency?: 'EUR' | 'USD' | 'MAD' | string;
  period: 'year' | 'month' | 'day';
}

export interface OfferCompany {
  id: string;
  name: string;
  industry: string;
  logoUrl?: string;
  bio: string;
  rating?: number;
  reviewsCount?: number;
  size: string;
  stage: string;
  hq: string;
}

export interface OfferResponsibility {
  id: string;
  title: string;
  description: string;
}

export interface OfferQualification {
  id: string;
  title: string;
  description: string;
  required: boolean;
}

export interface OfferBenefit {
  id: string;
  category: 'health' | 'learning' | 'retirement' | 'vacation' | 'other';
  title: string;
  description: string;
}

export interface Offer {
  id: string;
  title: string;
  category: OfferCategory;
  status: OfferStatus;
  isActivelyHiring: boolean;
  workMode: OfferWorkMode;
  contractType: OfferContractType;
  level: OfferLevel;
  location: string;
  salary?: OfferSalary;
  overview: string;
  skills: string[];
  responsibilities: OfferResponsibility[];
  qualifications: OfferQualification[];
  benefits: OfferBenefit[];
  company: OfferCompany;
  applicantsCount: number;
  officePhotoUrl?: string;
  officePhotoCaption?: string;
  publishedAt: string; // ISO 8601
  expiresAt?: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface OffersListResponse {
  data: Offer[];
  meta: {
    page: number;
    limit: number;
    total: number;
    hasNextPage: boolean;
  };
}

export interface OfferDetailResponse {
  data: Offer;
}

export interface OfferSourceResponse {
  offerId: string;
  sourceSite: string;
  sourceUrl: string;
  mergedSources?: string[];
}

export interface OffersStatsResponse {
  totalActive?: number;
  byCategory?: Record<string, number>;
  byWorkMode?: Record<string, number>;
  byContractType?: Record<string, number>;
  byLocation?: Record<string, number>;
  bySource?: Record<string, number>;
  lastScrapeRun?: {
    startedAt: string;
    finishedAt?: string;
    status: string;
    totalFetched?: number;
    inserted?: number;
    updated?: number;
    duplicatesSkipped?: number;
  };
}

export interface HealthResponse {
  status: string;
  activeOffers: number;
  scraperRunning: boolean;
  lastScrapeRun?: OffersStatsResponse['lastScrapeRun'];
}

export interface OffersQueryParams {
  page?: number;
  limit?: number;
  category?: OfferCategory;
  workMode?: OfferWorkMode;
  contractType?: OfferContractType;
  level?: OfferLevel;
  status?: OfferStatus | 'all';
  location?: string;
  search?: string;
  minSalary?: number;
  sort?: 'newest' | 'salary_desc' | 'updated';
}
