import type {
  CreateServiceTypeBody,
  ServiceType,
  ServiceTypeResponse,
} from '@/lib/admin/types';

export function serviceTypeFactory(
  overrides: Partial<ServiceType> = {},
): ServiceType {
  return {
    _id: 'service-type-1',
    name: { en: 'Laboratory', ar: 'مختبرات' },
    slug: 'laboratory',
    description: { en: 'Laboratory services', ar: 'خدمات المختبرات' },
    schemaVersion: 1,
    isActive: true,
    fields: [
      {
        key: 'name',
        label: { en: 'Name', ar: 'الاسم' },
        type: 'string',
        required: true,
        isPublic: true,
      },
    ],
    ...overrides,
  };
}

export function serviceTypeCreateBodyFactory(
  overrides: Partial<CreateServiceTypeBody> = {},
): CreateServiceTypeBody {
  return {
    name: { en: 'Laboratory', ar: 'مختبرات' },
    slug: 'laboratory',
    description: { en: 'Laboratory services', ar: 'خدمات المختبرات' },
    fields: [
      {
        key: 'name',
        label: { en: 'Name', ar: 'الاسم' },
        type: 'string',
        required: true,
        isPublic: true,
      },
    ],
    ...overrides,
  };
}

export function serviceTypeResponseFactory(
  overrides: Partial<ServiceTypeResponse> = {},
): ServiceTypeResponse {
  return {
    serviceType: serviceTypeFactory(),
    ...overrides,
  };
}
