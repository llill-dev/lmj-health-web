'use client';

import { useMemo, useState } from 'react';
import { useDebounce } from 'use-debounce';

import {
  buildDashboardPatientsListParams,
  type DashboardPatientFilter,
} from '@/lib/doctor/dashboardPatientFilters';
import { useDoctorPatients } from '@/hooks/doctor/useDoctorPatients';

export function useDashboardPatientsSearch() {
  const [searchInput, setSearchInput] = useState('');
  const [filter, setFilter] = useState<DashboardPatientFilter>('all');
  const [debouncedSearch] = useDebounce(searchInput, 380);

  const listParams = useMemo(
    () => buildDashboardPatientsListParams(filter, debouncedSearch),
    [filter, debouncedSearch],
  );

  const patientsQuery = useDoctorPatients(listParams);

  return {
    searchInput,
    setSearchInput,
    debouncedSearch,
    filter,
    setFilter,
    patientsQuery,
    listParams,
  };
}
