import type {
  ManagedServiceProvider,
  ManagedServiceProviderDetailResponse,
  ManagedServiceProviderListResponse,
} from '@/lib/admin/types';
import { serviceTypeFactory } from '@/test/factories/serviceTypes';

export function managedServiceProviderFactory(
  overrides: Partial<ManagedServiceProvider> = {},
): ManagedServiceProvider {
  return {
    id: 'provider-1',
    serviceType: {
      id: 'service-type-1',
      name: { en: 'Laboratory', ar: 'مختبرات' },
      slug: 'laboratory',
      schemaVersion: 1,
      isActive: true,
    },
    name: 'مختبر الشفاء',
    city: 'دمشق',
    country: 'سوريا',
    aliases: [],
    data: {},
    status: 'draft',
    schemaVersionAtWrite: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export function managedServiceProviderListResponseFactory(
  overrides: Partial<ManagedServiceProviderListResponse> = {},
): ManagedServiceProviderListResponse {
  const providers = overrides.providers ?? [managedServiceProviderFactory()];
  return {
    status: 200,
    messageKey: 'success.ok',
    message: 'Request completed successfully.',
    page: 1,
    limit: 20,
    total: providers.length,
    results: providers.length,
    providers,
    ...overrides,
  } as ManagedServiceProviderListResponse;
}

export function managedServiceProviderDetailResponseFactory(
  overrides: Partial<ManagedServiceProviderDetailResponse> = {},
): ManagedServiceProviderDetailResponse {
  return {
    status: 200,
    messageKey: 'success.ok',
    message: 'Request completed successfully.',
    provider: managedServiceProviderFactory(),
    serviceType: serviceTypeFactory(),
    ...overrides,
  } as ManagedServiceProviderDetailResponse;
}
