export const servicesEndpoints = {
  facilities: {
    list: '/api/admin/facilities',
    create: '/api/admin/facilities',
    getById: (id: string) => `/api/admin/facilities/${id}`,
    update: (id: string) => `/api/admin/facilities/${id}`,
    updateStatus: (id: string) => `/api/admin/facilities/${id}/status`,
    delete: (id: string) => `/api/admin/facilities/${id}`,
    listDoctors: (id: string) => `/api/admin/facilities/${id}/doctors`,
  },
  serviceTypes: {
    list: '/api/service-types',
    listPublic: '/api/services/types',
    create: '/api/service-types',
    update: (id: string) => `/api/service-types/${id}`,
  },
  serviceProviders: {
    list: '/api/services',
    getById: (id: string) => `/api/services/${id}`,
    create: '/api/service-providers',
    update: (id: string) => `/api/service-providers/${id}`,
    updateStatus: (id: string) => `/api/service-providers/${id}/status`,
  },
} as const;
