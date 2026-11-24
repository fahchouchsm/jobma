import type { JobBenefit, JobListing, JobQualification } from '@/data/jobs';
import type {
  Offer,
  OfferContractType,
  OfferLevel,
  OfferWorkMode,
} from '@/types/offer';

const WORK_MODE_TO_UI: Record<OfferWorkMode, JobListing['workMode']> = {
  remote: 'Télétravail',
  hybrid: 'Hybride',
  onsite: 'Présentiel',
};

const UI_TO_WORK_MODE: Record<JobListing['workMode'], OfferWorkMode> = {
  Télétravail: 'remote',
  Hybride: 'hybrid',
  Présentiel: 'onsite',
};

const CONTRACT_TO_UI: Record<OfferContractType, string> = {
  full_time: 'Temps plein',
  part_time: 'Temps partiel',
  freelance: 'Freelance',
  internship: 'Stage / Alternance',
};

const LEVEL_TO_UI: Record<OfferLevel, string> = {
  junior: 'Niveau Junior',
  mid: 'Niveau Confirmé',
  senior: 'Niveau Senior',
  lead: 'Niveau Lead',
  staff: 'Niveau Staff',
};

const BRAND_TONE_BY_CATEGORY: Record<Offer['category'], JobListing['brandTone']> = {
  Design: 'primary',
  Engineering: 'secondary',
  Product: 'tertiary',
  'IA & Data': 'primary',
};

function formatCurrencySymbol(currency?: string): string {
  if (currency === 'USD') return '$';
  if (currency === 'MAD') return 'MAD';
  return '€';
}

function formatSalaryRange(offer: Offer): string {
  if (!offer.salary) return 'Salaire non précisé';
  const symbol = formatCurrencySymbol(offer.salary.currency);
  const suffix =
    offer.salary.period === 'year'
      ? '/an'
      : offer.salary.period === 'month'
        ? '/mois'
        : '/jour';
  return `${offer.salary.min.toLocaleString('fr-FR')} ${symbol} - ${offer.salary.max.toLocaleString('fr-FR')} ${symbol}${suffix}`;
}

function formatPublishedAgo(publishedAt?: string): string {
  if (!publishedAt) return 'Récent';
  const parsed = Date.parse(publishedAt);
  if (Number.isNaN(parsed)) return publishedAt;

  const diffDays = Math.floor((Date.now() - parsed) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "Aujourd'hui";
  if (diffDays === 1) return 'Hier';
  if (diffDays < 30) return `Il y a ${diffDays} jours`;
  return new Date(parsed).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  });
}

export function mapOfferToJobListing(offer: Offer): JobListing {
  const salaryRange = formatSalaryRange(offer);
  const workMode = WORK_MODE_TO_UI[offer.workMode] ?? 'Présentiel';
  const contractType = CONTRACT_TO_UI[offer.contractType] ?? 'Temps plein';
  const level = LEVEL_TO_UI[offer.level] ?? 'Niveau Confirmé';
  const minSalaryK = offer.salary
    ? offer.salary.min >= 1000
      ? Math.round(offer.salary.min / 1000)
      : offer.salary.min
    : 0;

  const qualifications: JobQualification[] = (offer.qualifications ?? []).map((q, idx) => ({
    id: q.id,
    icon: idx === 0 ? 'award' : idx === 1 ? 'pen' : 'network',
    title: q.title,
    description: q.description,
  }));

  const benefits: JobBenefit[] = (offer.benefits ?? []).map((b, idx) => ({
    id: b.id,
    icon: b.category === 'other' ? 'health' : b.category,
    title: b.title,
    description: b.description,
    accent: idx % 3 === 0 ? 'secondary' : idx % 3 === 1 ? 'primary' : 'tertiary',
  }));

  const applicantsCount =
    typeof offer.applicantsCount === 'number' && offer.applicantsCount > 0
      ? `${offer.applicantsCount} candidats`
      : '';

  return {
    id: offer.id,
    title: offer.title,
    company: offer.company?.name ?? 'Entreprise',
    industry: offer.company?.industry ?? offer.category,
    logoUrl: offer.company?.logoUrl,
    brandTone: BRAND_TONE_BY_CATEGORY[offer.category] ?? 'primary',
    isActivelyHiring: Boolean(offer.isActivelyHiring),
    workMode,
    location: offer.location,
    postedAgo: formatPublishedAgo(offer.publishedAt),
    applicantsCount,
    salaryRange,
    minSalaryK,
    contractType,
    level,
    category: offer.category,
    metrics: [
      { id: 'salary', label: salaryRange, icon: 'payments', tone: 'emerald' },
      { id: 'contract', label: contractType, icon: 'schedule', tone: 'neutral' },
      { id: 'level', label: level, icon: 'level', tone: 'indigo' },
    ],
    overview: offer.overview,
    skills: offer.skills ?? [],
    highlightTitle: `${offer.company?.name ?? 'Entreprise'} • ${workMode}`,
    highlightSubtitle: (offer.skills ?? []).slice(0, 3).join(' • ') || offer.category,
    responsibilities: offer.responsibilities ?? [],
    qualifications,
    benefits,
    companyBio: offer.company?.bio ?? '',
    companyRating: offer.company?.rating != null ? String(offer.company.rating) : '',
    companyReviews:
      offer.company?.reviewsCount != null ? `${offer.company.reviewsCount} avis` : '',
    companyStats: {
      size: offer.company?.size ?? 'N/A',
      stage: offer.company?.stage ?? 'Entreprise',
      hq: offer.company?.hq ?? offer.location,
    },
    officePhotoUrl: offer.officePhotoUrl,
    officePhotoCaption: offer.officePhotoCaption,
  };
}

export function mapJobListingToOffer(job: JobListing): Offer {
  return {
    id: job.id,
    title: job.title,
    category: job.category,
    status: 'active',
    isActivelyHiring: job.isActivelyHiring,
    workMode: UI_TO_WORK_MODE[job.workMode],
    contractType: job.contractType.toLowerCase().includes('freelance')
      ? 'freelance'
      : job.contractType.toLowerCase().includes('stage')
        ? 'internship'
        : 'full_time',
    level: job.level.toLowerCase().includes('staff')
      ? 'staff'
      : job.level.toLowerCase().includes('lead')
        ? 'lead'
        : job.level.toLowerCase().includes('junior')
          ? 'junior'
          : 'senior',
    location: job.location,
    salary: {
      min: job.minSalaryK * 1000,
      max: (job.minSalaryK + 30) * 1000,
      currency: 'EUR',
      period: 'year',
    },
    overview: job.overview,
    skills: [],
    responsibilities: job.responsibilities,
    qualifications: job.qualifications.map((q) => ({
      id: q.id,
      title: q.title,
      description: q.description,
      required: true,
    })),
    benefits: job.benefits.map((b) => ({
      id: b.id,
      category: b.icon,
      title: b.title,
      description: b.description,
    })),
    company: {
      id: job.company.toLowerCase().replace(/\s+/g, '-'),
      name: job.company,
      industry: job.industry,
      logoUrl: job.logoUrl,
      bio: job.companyBio,
      rating: Number.parseFloat(job.companyRating) || undefined,
      size: job.companyStats.size,
      stage: job.companyStats.stage,
      hq: job.companyStats.hq,
    },
    applicantsCount: Number.parseInt(job.applicantsCount.replace(/\D/g, ''), 10) || 0,
    officePhotoUrl: job.officePhotoUrl,
    officePhotoCaption: job.officePhotoCaption,
    publishedAt: job.postedAgo,
    updatedAt: new Date().toISOString(),
  };
}
