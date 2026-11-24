export interface JobBenefit {
  id: string;
  icon: 'health' | 'learning' | 'retirement' | 'vacation';
  title: string;
  description: string;
  accent: 'secondary' | 'primary' | 'tertiary';
}

export interface JobQualification {
  id: string;
  icon: 'award' | 'pen' | 'network';
  title: string;
  description: string;
}

export interface JobResponsibility {
  id: string;
  title: string;
  description: string;
}

export interface JobMetric {
  id: string;
  label: string;
  icon: 'payments' | 'schedule' | 'level' | 'equity';
  tone: 'emerald' | 'neutral' | 'indigo';
}

export interface JobListing {
  id: string;
  title: string;
  company: string;
  industry: string;
  logoUrl?: string;
  brandTone: 'primary' | 'secondary' | 'tertiary';
  isActivelyHiring: boolean;
  workMode: 'Télétravail' | 'Hybride' | 'Présentiel';
  location: string;
  postedAgo: string;
  applicantsCount: string;
  salaryRange: string;
  minSalaryK: number;
  contractType: string;
  level: string;
  metrics: JobMetric[];
  overview: string;
  skills?: string[];
  highlightTitle: string;
  highlightSubtitle: string;
  responsibilities: JobResponsibility[];
  qualifications: JobQualification[];
  benefits: JobBenefit[];
  companyBio: string;
  companyRating: string;
  companyReviews: string;
  companyStats: {
    size: string;
    stage: string;
    hq: string;
  };
  officePhotoUrl?: string;
  officePhotoCaption?: string;
  category: 'Design' | 'Engineering' | 'Product' | 'IA & Data';
}
