import type { OffersQueryParams } from '@/types/offer';

export function buildOffersQueryString(params: OffersQueryParams = {}): string {
  const searchParams = new URLSearchParams();
  if (params.page !== undefined) searchParams.set('page', String(params.page));
  if (params.limit !== undefined) searchParams.set('limit', String(Math.min(params.limit, 100)));
  if (params.category) searchParams.set('category', params.category);
  if (params.workMode) searchParams.set('workMode', params.workMode);
  if (params.contractType) searchParams.set('contractType', params.contractType);
  if (params.level) searchParams.set('level', params.level);
  if (params.status) searchParams.set('status', params.status);
  if (params.location) searchParams.set('location', params.location);
  if (params.search) searchParams.set('search', params.search);
  if (params.minSalary !== undefined && params.minSalary > 0) {
    searchParams.set('minSalary', String(params.minSalary));
  }
  if (params.sort) searchParams.set('sort', params.sort);
  return searchParams.toString();
}
