import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { computeJobMatch } from '../lib/job-match.ts';

function makeProfile(overrides = {}) {
  return {
    fullName: 'Test User',
    headline: 'Engineer',
    location: 'Paris',
    domains: ['Engineering'],
    experienceLevel: 'Senior',
    skills: ['React Native', 'TypeScript'],
    workModes: ['Télétravail'],
    contractTypes: ['CDI'],
    minSalaryK: 60,
    availability: 'Immédiate',
    cvFile: null,
    portfolioUrl: '',
    linkedinUrl: '',
    oneClickApplyEnabled: true,
    ...overrides,
  };
}

function makeJob(overrides = {}) {
  return {
    id: 'job-1',
    title: 'Senior React Native Developer',
    company: 'Acme',
    industry: 'Tech',
    brandTone: 'primary',
    isActivelyHiring: true,
    workMode: 'Télétravail',
    location: 'Paris',
    postedAgo: '2j',
    applicantsCount: '12',
    salaryRange: '70k - 85k €',
    minSalaryK: 70,
    contractType: 'CDI',
    level: 'Senior',
    metrics: [],
    overview: 'Build mobile apps with TypeScript and GraphQL.',
    highlightTitle: 'Mobile',
    highlightSubtitle: 'App',
    responsibilities: [],
    qualifications: [
      { id: 'q1', icon: 'award', title: 'React Native', description: '3+ years' },
    ],
    benefits: [],
    companyBio: 'Tech co',
    companyRating: '4.8',
    companyReviews: '20',
    companyStats: { size: '50', stage: 'Series A', hq: 'Paris' },
    category: 'Engineering',
    ...overrides,
  };
}

describe('computeJobMatch', () => {
  it('computes high score and reasons when domain, workMode, salary, and skills match', () => {
    const result = computeJobMatch(makeJob(), makeProfile());
    // 52 base + 22 domain + 12 workMode + 10 salary + 6 (2 skills) + 2 activelyHiring = 104 -> capped at 99
    assert.equal(result.score, 99);
    assert.deepEqual(result.reasons, [
      'Domaine Engineering',
      'Télétravail',
      '70k+ €',
      'React Native',
    ]);
  });

  it('returns base score when nothing matches and not actively hiring', () => {
    const result = computeJobMatch(
      makeJob({
        category: 'Design',
        workMode: 'Présentiel',
        minSalaryK: 40,
        title: 'Visual Designer',
        overview: 'Brand design',
        qualifications: [],
        isActivelyHiring: false,
      }),
      makeProfile()
    );
    assert.equal(result.score, 52);
    assert.deepEqual(result.reasons, []);
  });

  it('caps skill bonus at 9 points even with many matching skills', () => {
    const result = computeJobMatch(
      makeJob({
        category: 'Design',
        workMode: 'Présentiel',
        minSalaryK: 40,
        isActivelyHiring: false,
        overview: 'React Native TypeScript GraphQL Expo Tailwind',
      }),
      makeProfile({
        skills: ['React Native', 'TypeScript', 'GraphQL', 'Expo', 'Tailwind'],
      })
    );
    assert.equal(result.score, 52 + 9);
    assert.deepEqual(result.reasons, ['React Native']);
  });
});
