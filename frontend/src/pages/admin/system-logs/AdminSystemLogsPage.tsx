import { Helmet } from 'react-helmet-async';
import { useMemo, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { AdminAuditLogFilters } from '@/components/admin/system-logs/AdminAuditLogFilters';
import { AdminAuditLogPagination } from '@/components/admin/system-logs/AdminAuditLogPagination';
import { AdminAuditLogPrivacyNote } from '@/components/admin/system-logs/AdminAuditLogPrivacyNote';
import { AdminAuditLogTable } from '@/components/admin/system-logs/AdminAuditLogTable';
import AdminDashboardOverview from '@/components/admin/dashboard/admin-dashboard-overview';
import { Activity, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { PAGE_SIZE } from '@/components/admin/system-logs/auditLogConstants';
import { useAdminAuditLogs } from '@/hooks/admin/useAdminAuditLogs';
import type { AuditLogCategory, AuditLogOutcome } from '@/lib/admin/types';

export default function AdminSystemLogsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<AuditLogCategory | ''>('');
  const [outcome, setOutcome] = useState<AuditLogOutcome | ''>('');
  const [actorRole, setActorRole] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);

  const [debouncedSearch] = useDebounce(search, 350);

  const params = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      ...(category ? { category } : {}),
      ...(outcome ? { outcome } : {}),
      ...(actorRole ? { actorRole } : {}),
      ...(from ? { from: new Date(from).toISOString() } : {}),
      ...(to ? { to: new Date(to).toISOString() } : {}),
    }),
    [page, debouncedSearch, category, outcome, actorRole, from, to],
  );

  const { data, isAwaitingData, isError, error } = useAdminAuditLogs(params);

  const logs = data?.auditLogs ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const failCount = useMemo(() => logs.filter((l) => l.outcome === 'FAIL').length, [logs]);
  const denyCount = useMemo(() => logs.filter((l) => l.outcome === 'DENY').length, [logs]);
  const phiCount = useMemo(() => logs.filter((l) => l.category === 'PHI').length, [logs]);

  function resetFilters() {
    setSearch('');
    setCategory('');
    setOutcome('');
    setActorRole('');
    setFrom('');
    setTo('');
    setPage(1);
  }

  const hasActiveFilters = !!(debouncedSearch || category || outcome || actorRole || from || to);

  const bumpPage = () => setPage(1);

  return (
    <>
      <Helmet>
        <title>سجلات النظام • LMJ Health</title>
      </Helmet>

      <div dir='rtl' lang='ar'>
        <AdminDashboardOverview
          variant='admin'
          surface='mint'
          title='سجلات النظام'
          subtitle='مراجعة جميع الأنشطة والحركات في النظام بالوقت الفعلي'
          headerIcon={<Activity className='h-8 w-8 text-white' />}
          kpiColumns={4}
          kpis={[
            {
              key: 'total',
              icon: <Activity className='h-5 w-5 shrink-0' />,
              value: isAwaitingData ? '—' : total.toLocaleString('ar-SA'),
              label: 'إجمالي السجلات',
            },
            {
              key: 'fail',
              icon: <ShieldAlert className='h-5 w-5 shrink-0' />,
              value: isAwaitingData ? '—' : failCount,
              label: 'إجراءات فاشلة',
            },
            {
              key: 'deny',
              icon: <Shield className='h-5 w-5 shrink-0' />,
              value: isAwaitingData ? '—' : denyCount,
              label: 'محاولات مرفوضة',
            },
            {
              key: 'phi',
              icon: <ShieldCheck className='h-5 w-5 shrink-0' />,
              value: isAwaitingData ? '—' : phiCount,
              label: 'وصول للبيانات الطبية',
            },
          ]}
        />

        <AdminAuditLogFilters
          search={search}
          category={category}
          outcome={outcome}
          actorRole={actorRole}
          from={from}
          to={to}
          hasActiveFilters={hasActiveFilters}
          onSearchChange={(v) => {
            setSearch(v);
            bumpPage();
          }}
          onCategoryChange={(v) => {
            setCategory(v);
            bumpPage();
          }}
          onOutcomeChange={(v) => {
            setOutcome(v);
            bumpPage();
          }}
          onActorRoleChange={(v) => {
            setActorRole(v);
            bumpPage();
          }}
          onFromChange={(v) => {
            setFrom(v);
            bumpPage();
          }}
          onToChange={(v) => {
            setTo(v);
            bumpPage();
          }}
          onReset={resetFilters}
        />

        <AdminAuditLogTable
          isAwaitingData={isAwaitingData}
          isError={isError}
          error={error}
          logs={logs}
        />

        {!isAwaitingData && !isError && (
          <AdminAuditLogPagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        )}

        <AdminAuditLogPrivacyNote />
      </div>
    </>
  );
}
