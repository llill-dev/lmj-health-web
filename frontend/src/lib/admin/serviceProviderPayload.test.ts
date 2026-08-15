import { describe, expect, it, beforeEach } from 'vitest';
import { adminApi } from '@/lib/admin/client';
import {
  getLastCreateProviderPayload,
  getLastUpdateProviderPayload,
  getLastProviderListUrl,
  resetServiceProviderHandlers,
} from '@/test/handlers/serviceProviders';

// Regression coverage for the confirmed contract bug: the live backend expects
// `data` (service providers) / `fields` (service types) as real structured
// objects/arrays. An earlier fix mistakenly JSON.stringify'd them based on a
// misreading of the OpenAPI spec's declared type; the real backend rejects that
// (422: "fields.forEach is not a function"). This locks in sending them as-is.
describe('managed service provider payload encoding', () => {
  beforeEach(() => {
    resetServiceProviderHandlers();
  });

  it('sends `data` as a structured object on create', async () => {
    await adminApi.serviceProviders.create({
      serviceType: 'service-type-1',
      name: 'مختبر الشفاء',
      city: 'دمشق',
      country: 'سوريا',
      data: { scientificNumber: '12345', isCertified: true },
      aliases: ['شفاء'],
      status: 'draft',
    });

    const payload = getLastCreateProviderPayload();
    expect(payload?.data).toEqual({
      scientificNumber: '12345',
      isCertified: true,
    });
    // Non-`data` fields stay as their real types.
    expect(payload?.name).toBe('مختبر الشفاء');
    expect(payload?.status).toBe('draft');
  });

  it('sends `data` as a structured object on update', async () => {
    await adminApi.serviceProviders.update('provider-1', {
      name: 'اسم جديد',
      data: { scientificNumber: '99999' },
      status: 'active',
    });

    const payload = getLastUpdateProviderPayload();
    expect(payload?.data).toEqual({
      scientificNumber: '99999',
    });
  });

  it('omits `data` entirely when no dynamic data is provided', async () => {
    await adminApi.serviceProviders.create({
      serviceType: 'service-type-1',
      name: 'اسم',
      city: 'مدينة',
      country: 'بلد',
      status: 'draft',
    });

    const payload = getLastCreateProviderPayload();
    expect(payload?.data).toBeUndefined();
  });

  it('lists managed providers against GET /api/service-providers with the real query contract', async () => {
    await adminApi.serviceProviders.list({
      serviceType: 'service-type-1',
      status: 'draft',
      q: 'شفاء',
      page: 2,
      limit: 10,
    });

    const url = getLastProviderListUrl();
    expect(url?.pathname).toBe('/api/service-providers');
    expect(url?.searchParams.get('serviceType')).toBe('service-type-1');
    expect(url?.searchParams.get('status')).toBe('draft');
    expect(url?.searchParams.get('q')).toBe('شفاء');
    expect(url?.searchParams.get('page')).toBe('2');
    expect(url?.searchParams.get('limit')).toBe('10');
  });

  it('returns the managed list response shape (page/limit/total/results/providers)', async () => {
    const response = await adminApi.serviceProviders.list({});
    expect(response).toMatchObject({
      page: expect.any(Number),
      limit: expect.any(Number),
      total: expect.any(Number),
      results: expect.any(Number),
      providers: expect.any(Array),
    });
  });

  it('returns provider + serviceType from the detail endpoint', async () => {
    const response = await adminApi.serviceProviders.getById('provider-1');
    expect(response.provider).toBeDefined();
    expect(response.serviceType).toBeDefined();
    expect(response.provider.id).toBe('provider-1');
  });
});
