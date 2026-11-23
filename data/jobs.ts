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
  contractType: string;
  level: string;
  metrics: JobMetric[];
  overview: string;
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

export const USER_PROFILE_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC_uf9nQlhRGeU6QNaew2Ul9Dvxt4p6WiGLSVXGOgfU34h5r8LTXx2AilZlBiu8-u9Biq6R6a2fzP554hag_OTVh7Ui3fI9KybZMWZaO_DX_ObLWFK5rGEe2kF8kkh8rA1KSBsSgn0Gr_Gw9CWTYbRuLqSBNhKFGiJprCpzEJK3f6w5HRnad_EDwEZQB4Oqszo6IVMCf7QXlxIgguUEGAxOP6kwhKOMItruFUJcQsU';

export const JOBS: JobListing[] = [
  {
    id: 'stripe-senior-product-designer',
    title: 'Senior Product Designer',
    company: 'Stripe',
    industry: 'FinTech & Paiements',
    brandTone: 'primary',
    logoUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCSvxizsZc2Y4fkZOCSM-D8f6_t06dwTYF8dsgXeXmQChuE1JGPlYy5-I_TbHdr_ADVpn-IqPQaQjHVA0Hu6YRrkgMDguHHDtZ5qK-RdiINKlXD2EueCz6O16BtR3Ys98ve05m2QYtaQgRSKLppIDOV6B1u76YUYwy08lqougqFeVht3hOGuswibLF2G_5NVmdU4V1paR_dKueUaWVdRBtoREe4YZmUdTqSMNX1M14',
    isActivelyHiring: true,
    workMode: 'Télétravail',
    location: 'Paris / Remote EU',
    postedAgo: 'Publié il y a 2 jours',
    applicantsCount: 'Plus de 40 candidats',
    salaryRange: '150 000 € - 190 000 €/an',
    contractType: 'Temps plein',
    level: 'Niveau Senior',
    category: 'Design',
    metrics: [
      {
        id: 'salary',
        label: '150 000 € - 190 000 €/an',
        icon: 'payments',
        tone: 'emerald',
      },
      {
        id: 'type',
        label: 'Temps plein',
        icon: 'schedule',
        tone: 'neutral',
      },
      {
        id: 'level',
        label: 'Niveau Senior',
        icon: 'level',
        tone: 'neutral',
      },
      {
        id: 'equity',
        label: 'Actions offertes',
        icon: 'equity',
        tone: 'indigo',
      },
    ],
    overview:
      "Chez Stripe, le design logiciel est au cœur du développement de l'infrastructure économique mondiale. En tant que Senior Product Designer, vous concevrez les outils de facturation automatisée, les moteurs de paiement en temps réel et les intégrations transparentes utilisés par des millions d'entreprises à forte croissance dans plus de 140 pays.",
    highlightTitle: 'Poste à haute autonomie',
    highlightSubtitle: 'Rattaché directement au VP Merchant Design.',
    responsibilities: [
      {
        id: 'r1',
        title: 'Expérience paiement mobile/web :',
        description:
          "Concevoir des parcours d'achat sans friction sur web et mobile, traitant des milliards de transactions chaque année.",
      },
      {
        id: 'r2',
        title: 'Synergie transversale :',
        description:
          "Collaborer étroitement avec les équipes d'ingénierie distribuées, les data scientists et les chefs de produit pour lancer des API performantes.",
      },
      {
        id: 'r3',
        title: 'Tests utilisateurs mondiaux :',
        description:
          'Mener des études qualitatives sur le terrain et des prototypages rapides auprès de marchands en Europe, Asie et Amérique latine.',
      },
      {
        id: 'r4',
        title: 'Évolution du Design System :',
        description:
          'Enrichir la bibliothèque fondamentale de Stripe avec des composants modernes, des micro-animations et des tokens précis.',
      },
    ],
    qualifications: [
      {
        id: 'q1',
        icon: 'award',
        title: "5+ ans d'expérience en Product Design",
        description:
          "Expérience confirmée dans la conception d'applications SaaS web et mobiles complexes, de la phase d'idéation jusqu'à l'adoption à grande échelle.",
      },
      {
        id: 'q2',
        icon: 'pen',
        title: 'Prototypage haute-fidélité',
        description:
          'Maîtrise approfondie des outils de conception modernes (Figma, ProtoPie, Framer) et sens aigu des micro-interactions renforçant la confiance utilisateur.',
      },
      {
        id: 'q3',
        icon: 'network',
        title: 'Architecture de systèmes complexes',
        description:
          'Capacité à structurer des flux transactionnels complexes, les spécificités de paiement internationales, la localisation et les contraintes réglementaires.',
      },
    ],
    benefits: [
      {
        id: 'b1',
        icon: 'health',
        title: 'Santé intégrale',
        description: 'Mutuelle santé prise en charge à 100%',
        accent: 'secondary',
      },
      {
        id: 'b2',
        icon: 'learning',
        title: '5 000 € de formation',
        description: 'Budget annuel pour livres, cours et mentors',
        accent: 'primary',
      },
      {
        id: 'b3',
        icon: 'retirement',
        title: 'Épargne retraite',
        description: "Plan d'épargne abondé à hauteur de 5%",
        accent: 'tertiary',
      },
      {
        id: 'b4',
        icon: 'vacation',
        title: 'Congés payés flexibles',
        description: "RTT illimités + semaines de repos d'entreprise",
        accent: 'secondary',
      },
    ],
    companyBio:
      "Stripe bâtit l'infrastructure financière d'Internet. Des millions d'entreprises — des start-ups prometteuses aux multinationales cotées — utilisent Stripe pour accepter des paiements, accroître leurs revenus et créer de nouvelles opportunités commerciales.",
    companyRating: '4.8',
    companyReviews: '(2 400 avis)',
    companyStats: {
      size: '7 000+',
      stage: 'Série avancée',
      hq: 'Paris / SF / Dublin',
    },
    officePhotoUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBtLorA4KAmwVPhdVV13tg9Xem0edghSPyGQP5GjLzrg61ltelSE1NkyKS3e6s3rMdVdspjPayTHohSzLXXjddVJiq_lwMfOlsaWC0XilTBdpjSJuO0otvqbhLUmHppu8ezlR2oEulbMVfNDV-8bWVsz6J4jFBc715GGjzjw5JU4ai6RZQbllbFgruJ6m3M0iNTsBX6vrdJO8jpjd4Q3UEkt7-X8_3be5RW9XUgLrs',
    officePhotoCaption: 'La vie chez Stripe Design',
  },
  {
    id: 'alan-staff-frontend-engineer',
    title: 'Staff Frontend Engineer',
    company: 'Alan',
    industry: 'InsurTech & Santé',
    brandTone: 'primary',
    isActivelyHiring: true,
    workMode: 'Télétravail',
    location: 'Paris / Full Remote',
    postedAgo: 'Publié il y a 1 jour',
    applicantsCount: '28 candidats',
    salaryRange: '115 000 € - 140 000 €/an',
    contractType: 'Temps plein',
    level: 'Niveau Staff',
    category: 'Engineering',
    metrics: [
      {
        id: 'salary',
        label: '115 000 € - 140 000 €/an',
        icon: 'payments',
        tone: 'emerald',
      },
      { id: 'type', label: 'Temps plein', icon: 'schedule', tone: 'neutral' },
      { id: 'level', label: 'Niveau Staff', icon: 'level', tone: 'neutral' },
      { id: 'equity', label: 'BSPCE inclus', icon: 'equity', tone: 'indigo' },
    ],
    overview:
      "Rejoignez l'équipe Frontend Platform d'Alan pour façonner la prochaine génération d'outils de santé numérique utilisés par plus de 600 000 membres en Europe.",
    highlightTitle: 'Culture full-remote écrite',
    highlightSubtitle: 'Autonomie totale, zéro réunion inutile.',
    responsibilities: [
      {
        id: 'r1',
        title: 'Architecture Design System :',
        description:
          'Piloter les fondations React, TypeScript et accessibilité à travers toutes les applications membres et RH.',
      },
      {
        id: 'r2',
        title: 'Performance & Qualité :',
        description:
          'Réduire les temps de chargement et instaurer des standards de test end-to-end exigeants.',
      },
    ],
    qualifications: [
      {
        id: 'q1',
        icon: 'award',
        title: "7+ ans d'expérience TypeScript & React",
        description:
          'Expérience démontrée sur des architectures frontend à fort trafic et des équipes multi-squads.',
      },
      {
        id: 'q2',
        icon: 'network',
        title: 'Leadership technique transverse',
        description:
          "Capacité à fédérer les équipes autour de RFC claires et d'outils développeur pragmatiques.",
      },
    ],
    benefits: [
      {
        id: 'b1',
        icon: 'health',
        title: 'Couverture Alan',
        description: 'Santé & prévoyance premium à 100%',
        accent: 'secondary',
      },
      {
        id: 'b2',
        icon: 'learning',
        title: 'Budget équipement',
        description: '2 500 € pour votre bureau à domicile',
        accent: 'primary',
      },
    ],
    companyBio:
      "Alan rend la santé simple, transparente et proactive pour les entreprises et leurs collaborateurs à travers l'Europe.",
    companyRating: '4.9',
    companyReviews: '(820 avis)',
    companyStats: {
      size: '650+',
      stage: 'Série E',
      hq: 'Paris',
    },
    officePhotoUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBtLorA4KAmwVPhdVV13tg9Xem0edghSPyGQP5GjLzrg61ltelSE1NkyKS3e6s3rMdVdspjPayTHohSzLXXjddVJiq_lwMfOlsaWC0XilTBdpjSJuO0otvqbhLUmHppu8ezlR2oEulbMVfNDV-8bWVsz6J4jFBc715GGjzjw5JU4ai6RZQbllbFgruJ6m3M0iNTsBX6vrdJO8jpjd4Q3UEkt7-X8_3be5RW9XUgLrs',
    officePhotoCaption: "L'espace de travail Alan à Paris",
  },
  {
    id: 'qonto-lead-mobile-developer',
    title: 'Lead Mobile Engineer (React Native)',
    company: 'Qonto',
    industry: 'FinTech & Pro Banking',
    brandTone: 'tertiary',
    isActivelyHiring: true,
    workMode: 'Hybride',
    location: 'Paris (2j remote)',
    postedAgo: 'Publié il y a 3 jours',
    applicantsCount: '35 candidats',
    salaryRange: '95 000 € - 120 000 €/an',
    contractType: 'Temps plein',
    level: 'Niveau Lead',
    category: 'Engineering',
    metrics: [
      {
        id: 'salary',
        label: '95 000 € - 120 000 €/an',
        icon: 'payments',
        tone: 'emerald',
      },
      { id: 'type', label: 'Temps plein', icon: 'schedule', tone: 'neutral' },
      { id: 'level', label: 'Niveau Lead', icon: 'level', tone: 'neutral' },
      { id: 'equity', label: 'BSPCE attractifs', icon: 'equity', tone: 'indigo' },
    ],
    overview:
      "Dirigez l'expérience mobile de Qonto sur iOS et Android pour accompagner plus de 500 000 PME et indépendants dans leur gestion financière quotidienne.",
    highlightTitle: 'Impact direct sur 500k+ entreprises',
    highlightSubtitle: 'Note App Store 4.8★ — équipe mobile de 30 personnes.',
    responsibilities: [
      {
        id: 'r1',
        title: 'Fluidité & Sécurité mobile :',
        description:
          'Garantir des animations à 60/120 fps, la biométrie et la fiabilité hors-ligne des flux bancaires.',
      },
      {
        id: 'r2',
        title: 'Mentorat & Architecture :',
        description:
          'Accompagner 6 ingénieurs seniors et faire évoluer le monorepo Expo / React Native.',
      },
    ],
    qualifications: [
      {
        id: 'q1',
        icon: 'award',
        title: '5+ ans en React Native & natif',
        description:
          'Maîtrise de TypeScript, Reanimated et des problématiques iOS/Android en production.',
      },
    ],
    benefits: [
      {
        id: 'b1',
        icon: 'vacation',
        title: 'Travail hybride flexible',
        description: 'Jusqu’à 4 semaines de remote par an à l’étranger',
        accent: 'secondary',
      },
      {
        id: 'b2',
        icon: 'learning',
        title: 'Qonto Academy',
        description: 'Formations continues et conférences financées',
        accent: 'primary',
      },
    ],
    companyBio:
      'Qonto est le leader européen de la gestion financière des entreprises, simplifiant banque, comptabilité et facturation.',
    companyRating: '4.6',
    companyReviews: '(1 150 avis)',
    companyStats: {
      size: '1 600+',
      stage: 'Licorne',
      hq: 'Paris',
    },
    officePhotoUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBtLorA4KAmwVPhdVV13tg9Xem0edghSPyGQP5GjLzrg61ltelSE1NkyKS3e6s3rMdVdspjPayTHohSzLXXjddVJiq_lwMfOlsaWC0XilTBdpjSJuO0otvqbhLUmHppu8ezlR2oEulbMVfNDV-8bWVsz6J4jFBc715GGjzjw5JU4ai6RZQbllbFgruJ6m3M0iNTsBX6vrdJO8jpjd4Q3UEkt7-X8_3be5RW9XUgLrs',
    officePhotoCaption: 'Campus Qonto Paris',
  },
  {
    id: 'mistral-product-manager-ia',
    title: 'Product Manager — Plateforme IA',
    company: 'Mistral AI',
    industry: 'Intelligence Artificielle',
    brandTone: 'secondary',
    isActivelyHiring: false,
    workMode: 'Présentiel',
    location: 'Paris 1er',
    postedAgo: 'Publié il y a 5 jours',
    applicantsCount: '60+ candidats',
    salaryRange: '130 000 € - 165 000 €/an',
    contractType: 'Temps plein',
    level: 'Niveau Senior',
    category: 'Product',
    metrics: [
      {
        id: 'salary',
        label: '130 000 € - 165 000 €/an',
        icon: 'payments',
        tone: 'emerald',
      },
      { id: 'type', label: 'Temps plein', icon: 'schedule', tone: 'neutral' },
      { id: 'level', label: 'Niveau Senior', icon: 'level', tone: 'neutral' },
      { id: 'equity', label: 'Equity majeure', icon: 'equity', tone: 'indigo' },
    ],
    overview:
      "Définissez la feuille de route de la plateforme API et des outils d'agents pour les développeurs et grands comptes utilisant les modèles Mistral.",
    highlightTitle: 'Au cœur de la recherche appliquée',
    highlightSubtitle: 'Collaboration directe avec les équipes recherche et infra.',
    responsibilities: [
      {
        id: 'r1',
        title: 'Stratégie API & SDK :',
        description:
          "Concevoir les interfaces développeur les plus rapides et intuitives du marché de l'IA générative.",
      },
    ],
    qualifications: [
      {
        id: 'q1',
        icon: 'network',
        title: 'Expérience Produit Developer-First',
        description: 'Solide compréhension technique des API cloud, LLM, latence et observabilité.',
      },
    ],
    benefits: [
      {
        id: 'b1',
        icon: 'health',
        title: 'Mutuelle & Repas',
        description: 'Prise en charge complète et déjeuners sur place',
        accent: 'secondary',
      },
    ],
    companyBio:
      'Mistral AI développe des modèles de langage ouverts et commerciaux de pointe depuis Paris.',
    companyRating: '4.9',
    companyReviews: '(190 avis)',
    companyStats: {
      size: '250+',
      stage: 'Série B',
      hq: 'Paris',
    },
    officePhotoUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBtLorA4KAmwVPhdVV13tg9Xem0edghSPyGQP5GjLzrg61ltelSE1NkyKS3e6s3rMdVdspjPayTHohSzLXXjddVJiq_lwMfOlsaWC0XilTBdpjSJuO0otvqbhLUmHppu8ezlR2oEulbMVfNDV-8bWVsz6J4jFBc715GGjzjw5JU4ai6RZQbllbFgruJ6m3M0iNTsBX6vrdJO8jpjd4Q3UEkt7-X8_3be5RW9XUgLrs',
    officePhotoCaption: 'Studio Mistral AI Paris',
  },
];
