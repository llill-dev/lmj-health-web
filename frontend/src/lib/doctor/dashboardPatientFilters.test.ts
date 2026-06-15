import { describe, expect, it } from 'vitest';

import { buildDashboardPatientsListParams } from './dashboardPatientFilters';

describe('buildDashboardPatientsListParams', () => {
  it('maps active filter to account_status', () => {
    expect(buildDashboardPatientsListParams('active', '  sara ')).toEqual({
      page: 1,
      limit: 8,
      search: 'sara',
      account_status: 'active',
    });
  });

  it('maps today filter to appointment date range', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(buildDashboardPatientsListParams('today', '')).toEqual({
      page: 1,
      limit: 8,
      from: today,
      to: today,
    });
  });
});
