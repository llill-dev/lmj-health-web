'use client';

import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  ActivityLogBanner,
  ActivityLogFilters,
  ActivityLogInfoAlert,
  ActivityLogList,
} from '@/components/doctor/activity-log';
import { MOCK_DOCTOR_ACTIVITY_LOGS } from '@/lib/doctor/activityLog/mockData';
import type { ActivityLogPeriod } from '@/lib/doctor/activityLog/types';

function isWithinPeriod(timestamp: string, period: ActivityLogPeriod): boolean {
  if (period === 'all') return true;

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return true;

  const now = new Date();
  const start = new Date(now);

  if (period === 'today') {
    start.setHours(0, 0, 0, 0);
    return date >= start;
  }

  if (period === 'week') {
    start.setDate(now.getDate() - 7);
    return date >= start;
  }

  start.setMonth(now.getMonth() - 1);
  return date >= start;
}

export default function DoctorActivityLogPage() {
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState<ActivityLogPeriod>('all');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return MOCK_DOCTOR_ACTIVITY_LOGS.filter((item) => {
      const matchesPeriod = isWithinPeriod(item.timestamp, period);
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.operationTypeLabel.includes(search.trim()) ||
        (item.patientName?.includes(search.trim()) ?? false);
      return matchesPeriod && matchesSearch;
    });
  }, [period, search]);

  return (
    <>
      <Helmet>
        <title>سجل النشاطات • LMJ Health</title>
      </Helmet>

      <ActivityLogBanner />
      <ActivityLogInfoAlert />
      <ActivityLogFilters
        search={search}
        onSearchChange={setSearch}
        period={period}
        onPeriodChange={setPeriod}
      />
      <ActivityLogList items={filtered} />
    </>
  );
}
