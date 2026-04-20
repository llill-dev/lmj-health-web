import { Helmet } from 'react-helmet-async';
import { useMemo, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { AdminAuditLogFilters } from '@/components/admin/system-logs/AdminAuditLogFilters';
import { AdminAuditLogPagination } from '@/components/admin/system-logs/AdminAuditLogPagination';
import { AdminAuditLogPrivacyNote } from '@/components/admin/system-logs/AdminAuditLogPrivacyNote';
import { AdminAuditLogStatsCards } from '@/components/admin/system-logs/AdminAuditLogStatsCards';
import { AdminAuditLogTable } from '@/components/admin/system-logs/AdminAuditLogTable';
import { AdminSystemLogsHeader } from '@/components/admin/system-logs/AdminSystemLogsHeader';
import { PAGE_SIZE } from '@/components/admin/system-logs/auditLogConstants';
import { useAdminAuditLogs } from '@/hooks/useAdminAuditLogs';
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

  const { data, isFetching, isLoading, isError, error } = useAdminAuditLogs(params);

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
        <AdminSystemLogsHeader />

        <AdminAuditLogStatsCards
          isLoading={isLoading}
          total={total}
          failCount={failCount}
          denyCount={denyCount}
          phiCount={phiCount}
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
          isLoading={isLoading}
          isFetching={isFetching}
          isError={isError}
          error={error}
          logs={logs}
        />

        {!isLoading && !isError && (
          <AdminAuditLogPagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={PAGE_SIZE}
            isFetching={isFetching}
            onPageChange={setPage}
          />
        )}

        <AdminAuditLogPrivacyNote />
      </div>
    </>
  );
}
