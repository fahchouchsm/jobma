import type { CandidateProfile } from '@/context/profile-context';
import type { JobListing } from '@/data/jobs';

export interface JobMatchResult {
  score: number;
  reasons: string[];
}

export function computeJobMatch(job: JobListing, profile: CandidateProfile): JobMatchResult {
  let score = 52;
  const reasons: string[] = [];

  if (profile.domains.includes(job.category)) {
    score += 22;
    reasons.push(`Domaine ${job.category}`);
  }

  if (profile.workModes.includes(job.workMode)) {
    score += 12;
    reasons.push(job.workMode);
  }

  if (job.minSalaryK >= profile.minSalaryK) {
    score += 10;
    reasons.push(`${job.minSalaryK}k+ €`);
  }

  const jobText =
    `${job.title} ${job.overview} ${job.qualifications.map((q) => q.title + ' ' + q.description).join(' ')}`.toLowerCase();
  const matchedSkills = profile.skills.filter((skill) => jobText.includes(skill.toLowerCase()));
  if (matchedSkills.length > 0) {
    score += Math.min(matchedSkills.length * 3, 9);
    reasons.push(matchedSkills[0]);
  }

  if (job.isActivelyHiring) {
    score += 2;
  }

  return {
    score: Math.min(score, 99),
    reasons,
  };
}
