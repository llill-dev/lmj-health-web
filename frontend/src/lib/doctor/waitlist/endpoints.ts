/** Doctor/staff waitlist routes — API-3 `/api/waitlist`. */
export const waitlistEndpoints = {
  list: '/api/waitlist',
  byId: (id: string) => `/api/waitlist/${encodeURIComponent(id)}`,
  mine: '/api/waitlist/me',
  cancel: (id: string) => `/api/waitlist/${encodeURIComponent(id)}/cancel`,
  contacted: (id: string) => `/api/waitlist/${encodeURIComponent(id)}/contacted`,
  close: (id: string) => `/api/waitlist/${encodeURIComponent(id)}/close`,
  book: (id: string) => `/api/waitlist/${encodeURIComponent(id)}/book`,
  suggestions: '/api/waitlist/suggestions',
} as const;
