export const doctorSecretaryEndpoints = {
  list: '/api/secretaries',
  byId: (secretaryId: string) => `/api/secretaries/${secretaryId}`,
  unassign: (secretaryId: string) => `/api/secretaries/${secretaryId}`,
} as const;
