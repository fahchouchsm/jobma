import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildOffersQueryString } from '../lib/offers-query.ts';
import { mapOfferToJobListing } from '../services/offer-mapper.ts';

describe('buildOffersQueryString', () => {
  it('encodes category IA & Data cleanly via URLSearchParams and omits empty params', () => {
    const qs = buildOffersQueryString({
      page: 2,
      limit: 20,
      category: 'IA & Data',
      workMode: 'remote',
      location: 'Casablanca',
    });
    assert.equal(
      qs,
      'page=2&limit=20&category=IA+%26+Data&workMode=remote&location=Casablanca'
    );
  });

  it('caps limit at 100 and skips non-positive minSalary', () => {
    const qs = buildOffersQueryString({ limit: 500, minSalary: 0 });
    assert.equal(qs, 'limit=100');
  });
});

describe('mapOfferToJobListing', () => {
  it('maps live API offer with MAD salary and omitted optional fields gracefully', () => {
    const listing = mapOfferToJobListing({
      id: 'offer-ma-1',
      title: 'Développeur Full Stack',
      category: 'Engineering',
      status: 'active',
      isActivelyHiring: true,
      workMode: 'hybrid',
      contractType: 'full_time',
      level: 'mid',
      location: 'Casablanca, Maroc',
      salary: { min: 13000, max: 20000, currency: 'MAD', period: 'month' },
      overview: 'Poste basé à Casablanca.',
      skills: ['React', 'Node.js'],
      responsibilities: [],
      qualifications: [],
      benefits: [],
      company: {
        id: 'comp-1',
        name: 'Tech Maroc',
        industry: 'IT',
        bio: 'Leader tech au Maroc',
        size: '50-200',
        stage: 'Scale-up',
        hq: 'Casablanca',
      },
      applicantsCount: 0,
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    assert.equal(listing.id, 'offer-ma-1');
    assert.equal(listing.workMode, 'Hybride');
    assert.equal(listing.contractType, 'Temps plein');
    assert.equal(listing.level, 'Niveau Confirmé');
    assert.equal(listing.companyRating, '');
    assert.equal(listing.companyReviews, '');
    assert.equal(listing.applicantsCount, '');
    assert.ok(listing.salaryRange.includes('MAD/mois'));
  });

  it('handles missing salary gracefully', () => {
    const listing = mapOfferToJobListing({
      id: 'offer-ma-2',
      title: 'Stage Design',
      category: 'Design',
      status: 'active',
      isActivelyHiring: false,
      workMode: 'onsite',
      contractType: 'internship',
      level: 'junior',
      location: 'Rabat',
      overview: 'Stage PFE',
      skills: [],
      responsibilities: [],
      qualifications: [],
      benefits: [],
      company: {
        id: 'comp-2',
        name: 'Studio Rabat',
        industry: 'Design',
        bio: '',
        size: '10',
        stage: 'Agence',
        hq: 'Rabat',
      },
      applicantsCount: 5,
      publishedAt: '2026-11-20T10:00:00Z',
      updatedAt: '2026-11-20T10:00:00Z',
    });

    assert.equal(listing.salaryRange, 'Salaire non précisé');
    assert.equal(listing.minSalaryK, 0);
    assert.equal(listing.contractType, 'Stage / Alternance');
  });
});
