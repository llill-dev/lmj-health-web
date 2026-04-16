import { Helmet } from 'react-helmet-async';
import {
  Activity,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { useAdminAuditLogs } from '@/hooks/useAdminAuditLogs';
import type { AuditLogCategory, AuditLogItem, AuditLogOutcome } from '@/lib/admin/types';

// ─── helpers ──────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<AuditLogCategory, string> = {
  AUTH: 'مصادقة',
  AUTHZ: 'صلاحيات',
  PHI: 'بيانات طبية',
  DATA: 'بيانات',
  ADMIN: 'إدارة',
  SYSTEM: 'نظام',
};

const CATEGORY_STYLES: Record<AuditLogCategory, { bg: string; text: string; dot: string }> = {
  AUTH:   { bg: 'bg-[#EFF6FF]',  text: 'text-[#1D4ED8]', dot: 'bg-[#3B82F6]' },
  AUTHZ:  { bg: 'bg-[#FEF3C7]',  text: 'text-[#92400E]', dot: 'bg-[#F59E0B]' },
  PHI:    { bg: 'bg-[#FDF2F8]',  text: 'text-[#9D174D]', dot: 'bg-[#EC4899]' },
  DATA:   { bg: 'bg-[#ECFDF5]',  text: 'text-[#065F46]', dot: 'bg-[#10B981]' },
  ADMIN:  { bg: 'bg-[#F5F3FF]',  text: 'text-[#5B21B6]', dot: 'bg-[#8B5CF6]' },
  SYSTEM: { bg: 'bg-[#F0F9FF]',  text: 'text-[#0369A1]', dot: 'bg-[#0EA5E9]' },
};

const OUTCOME_STYLES: Record<AuditLogOutcome, { bg: string; text: string; icon: React.ReactNode }> = {
  SUCCESS: {
    bg:   'bg-[#ECFDF5] border border-[#A7F3D0]',
    text: 'text-[#065F46]',
    icon: <ShieldCheck className='h-3.5 w-3.5' />,
  },
  FAIL: {
    bg:   'bg-[#FEF2F2] border border-[#FECACA]',
    text: 'text-[#991B1B]',
    icon: <ShieldAlert className='h-3.5 w-3.5' />,
  },
  DENY: {
    bg:   'bg-[#FFF7ED] border border-[#FED7AA]',
    text: 'text-[#92400E]',
    icon: <Shield className='h-3.5 w-3.5' />,
  },
};

const OUTCOME_LABELS: Record<AuditLogOutcome, string> = {
  SUCCESS: 'ناجح',
  FAIL: 'فشل',
  DENY: 'مرفوض',
};

const ROLE_LABELS: Record<string, string> = {
  admin:      'مدير',
  doctor:     'طبيب',
  patient:    'مريض',
  secretary:  'سكرتير',
  data_entry: 'إدخال بيانات',
};

function formatDateTime(iso: string): { date: string; time: string } {
  try {
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString('ar-SY', { year: 'numeric', month: 'short', day: 'numeric' }),
      time: d.toLocaleTimeString('ar-SY', { hour: '2-digit', minute: '2-digit' }),
    };
  } catch {
    return { date: iso, time: '' };
  }
}

// ─── skeleton row ────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className='grid grid-cols-12 gap-2 px-6 py-4 animate-pulse'>
      <div className='col-span-3 flex flex-col gap-1.5'>
        <div className='h-3 w-3/4 rounded-full bg-[#EEF2F6]' />
        <div className='h-5 w-1/2 rounded-full bg-[#EEF2F6]' />
      </div>
      <div className='col-span-2'>
        <div className='h-3 w-2/3 rounded-full bg-[#EEF2F6]' />
      </div>
      <div className='col-span-2'>
        <div className='h-5 w-16 rounded-full bg-[#EEF2F6]' />
      </div>
      <div className='col-span-2'>
        <div className='h-3 w-full rounded-full bg-[#EEF2F6]' />
      </div>
      <div className='col-span-3 flex flex-col gap-1'>
        <div className='h-3 w-5/6 rounded-full bg-[#EEF2F6]' />
        <div className='h-3 w-1/2 rounded-full bg-[#EEF2F6]' />
      </div>
    </div>
  );
}

// ─── log row ─────────────────────────────────────────────────────────────────

function LogRow({ log }: { log: AuditLogItem }) {
  const catStyle    = CATEGORY_STYLES[log.category] ?? CATEGORY_STYLES.SYSTEM;
  const outStyle    = OUTCOME_STYLES[log.outcome]   ?? OUTCOME_STYLES.FAIL;
  const { date, time } = formatDateTime(log.createdAt);
  const actorLabel  = log.actorRole ? (ROLE_LABELS[log.actorRole] ?? log.actorRole) : '—';

  return (
    <div className='grid grid-cols-12 gap-2 px-6 py-4 transition-colors hover:bg-[#FAFBFC]'>
      {/* Action + Category */}
      <div className='col-span-3 text-right'>
        <div className='font-cairo text-[13px] font-black text-[#111827] leading-snug break-all'>
          {log.action}
        </div>
        <span
          className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-cairo text-[11px] font-bold ${catStyle.bg} ${catStyle.text}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${catStyle.dot}`} />
          {CATEGORY_LABELS[log.category]}
        </span>
      </div>

      {/* Actor */}
      <div className='col-span-2 text-right'>
        <div className='font-cairo text-[13px] font-bold text-[#344054] leading-snug'>
          {log.actorUserName || '—'}
        </div>
        <div className='mt-0.5 font-cairo text-[11px] font-semibold text-[#98A2B3]'>
          {actorLabel}
        </div>
      </div>

      {/* Outcome */}
      <div className='col-span-2 flex items-start justify-end pt-0.5'>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-cairo text-[11px] font-bold ${outStyle.bg} ${outStyle.text}`}
        >
          {outStyle.icon}
          {OUTCOME_LABELS[log.outcome]}
        </span>
      </div>

      {/* IP */}
      <div className='col-span-2 text-right'>
        <div className='font-cairo text-[12px] font-semibold text-[#667085] leading-snug'>
          {log.ip || '—'}
        </div>
        {log.method && log.route ? (
          <div className='mt-0.5 font-cairo text-[10px] font-semibold text-[#98A2B3] break-all'>
            {log.method} {log.route}
          </div>
        ) : null}
      </div>

      {/* Time */}
      <div className='col-span-3 text-right'>
        <div className='font-cairo text-[12px] font-bold text-[#344054]'>{date}</div>
        <div className='mt-0.5 font-cairo text-[11px] font-semibold text-[#98A2B3]'>{time}</div>
      </div>
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

const CATEGORIES: Array<{ value: AuditLogCategory | ''; label: string }> = [
  { value: '', label: 'جميع الفئات' },
  { value: 'AUTH',   label: 'مصادقة (AUTH)' },
  { value: 'AUTHZ',  label: 'صلاحيات (AUTHZ)' },
  { value: 'PHI',    label: 'بيانات طبية (PHI)' },
  { value: 'DATA',   label: 'بيانات (DATA)' },
  { value: 'ADMIN',  label: 'إدارة (ADMIN)' },
  { value: 'SYSTEM', label: 'نظام (SYSTEM)' },
];

const OUTCOMES: Array<{ value: AuditLogOutcome | ''; label: string }> = [
  { value: '',        label: 'جميع النتائج' },
  { value: 'SUCCESS', label: 'ناجح' },
  { value: 'FAIL',    label: 'فشل' },
  { value: 'DENY',    label: 'مرفوض' },
];

const ROLES: Array<{ value: string; label: string }> = [
  { value: '',           label: 'جميع الأدوار' },
  { value: 'admin',      label: 'مدير' },
  { value: 'doctor',     label: 'طبيب' },
  { value: 'patient',    label: 'مريض' },
  { value: 'secretary',  label: 'سكرتير' },
  { value: 'data_entry', label: 'إدخال بيانات' },
];

const PAGE_SIZE = 20;

export default function AdminSystemLogsPage() {
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState<AuditLogCategory | ''>('');
  const [outcome, setOutcome]   = useState<AuditLogOutcome | ''>('');
  const [actorRole, setActorRole] = useState('');
  const [from, setFrom]         = useState('');
  const [to, setTo]             = useState('');
  const [page, setPage]         = useState(1);

  const [debouncedSearch] = useDebounce(search, 350);

  const params = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      ...(category   ? { category }   : {}),
      ...(outcome    ? { outcome }    : {}),
      ...(actorRole  ? { actorRole }  : {}),
      ...(from       ? { from: new Date(from).toISOString() } : {}),
      ...(to         ? { to: new Date(to).toISOString() }   : {}),
    }),
    [page, debouncedSearch, category, outcome, actorRole, from, to],
  );

  const { data, isFetching, isLoading, isError, error } = useAdminAuditLogs(params);

  const logs       = data?.auditLogs ?? [];
  const total      = data?.total     ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // count badges derived from current result set (fast approximation)
  const failCount = useMemo(() => logs.filter((l) => l.outcome === 'FAIL').length, [logs]);
  const denyCount = useMemo(() => logs.filter((l) => l.outcome === 'DENY').length, [logs]);
  const phiCount  = useMemo(() => logs.filter((l) => l.category === 'PHI').length,  [logs]);

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

  const selectClass =
    'h-[40px] rounded-[10px] border border-[#EEF2F6] bg-white px-3 font-cairo text-[13px] font-bold text-[#344054] focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer';

  return (
    <>
      <Helmet>
        <title>سجلات النظام • LMJ Health</title>
      </Helmet>

      <div dir='rtl' lang='ar'>
        {/* ── Header ──────────────────────────────────────────────── */}
        <div className='text-right'>
          <div className='font-cairo text-[26px] font-black leading-[34px] text-[#111827]'>
            سجلات النظام
          </div>
          <div className='mt-1 font-cairo text-[12px] font-semibold leading-[16px] text-[#98A2B3]'>
            مراجعة جميع الأنشطة والحركات في النظام بالوقت الفعلي
          </div>
        </div>

        {/* ── Stats ───────────────────────────────────────────────── */}
        <section className='mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4'>
          {/* total */}
          <div className='flex h-[120px] flex-col justify-between rounded-[14px] border border-[#E0F2FE] bg-gradient-to-br from-[#F0F9FF] to-white px-5 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.05)]'>
            <div className='flex items-center justify-between'>
              <div className='flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-white shadow-sm'>
                <Activity className='h-5 w-5 text-primary' />
              </div>
              <div className='font-cairo text-[11px] font-bold text-[#667085]'>
                {isLoading ? '—' : total.toLocaleString('ar-SA')}
              </div>
            </div>
            <div className='font-cairo text-[12px] font-extrabold text-[#344054]'>
              إجمالي السجلات
            </div>
          </div>

          {/* failures */}
          <div className='flex h-[120px] flex-col justify-between rounded-[14px] border border-[#FECACA] bg-gradient-to-br from-[#FEF2F2] to-white px-5 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.05)]'>
            <div className='flex items-center justify-between'>
              <div className='flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-white shadow-sm'>
                <ShieldAlert className='h-5 w-5 text-[#DC2626]' />
              </div>
              <div className='font-cairo text-[11px] font-bold text-[#667085]'>
                {isLoading ? '—' : failCount}
              </div>
            </div>
            <div className='font-cairo text-[12px] font-extrabold text-[#344054]'>
              إجراءات فاشلة
            </div>
          </div>

          {/* denials */}
          <div className='flex h-[120px] flex-col justify-between rounded-[14px] border border-[#FED7AA] bg-gradient-to-br from-[#FFF7ED] to-white px-5 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.05)]'>
            <div className='flex items-center justify-between'>
              <div className='flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-white shadow-sm'>
                <Shield className='h-5 w-5 text-[#D97706]' />
              </div>
              <div className='font-cairo text-[11px] font-bold text-[#667085]'>
                {isLoading ? '—' : denyCount}
              </div>
            </div>
            <div className='font-cairo text-[12px] font-extrabold text-[#344054]'>
              محاولات مرفوضة
            </div>
          </div>

          {/* PHI access */}
          <div className='flex h-[120px] flex-col justify-between rounded-[14px] border border-[#FBCFE8] bg-gradient-to-br from-[#FDF2F8] to-white px-5 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.05)]'>
            <div className='flex items-center justify-between'>
              <div className='flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-white shadow-sm'>
                <ShieldCheck className='h-5 w-5 text-[#DB2777]' />
              </div>
              <div className='font-cairo text-[11px] font-bold text-[#667085]'>
                {isLoading ? '—' : phiCount}
              </div>
            </div>
            <div className='font-cairo text-[12px] font-extrabold text-[#344054]'>
              وصول للبيانات الطبية
            </div>
          </div>
        </section>

        {/* ── Filters ─────────────────────────────────────────────── */}
        <section className='mt-5 rounded-[14px] border border-[#EEF2F6] bg-white px-6 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.05)]'>
          <div className='mb-3 flex items-center justify-between'>
            <div className='flex items-center gap-2 text-[#344054]'>
              <Filter className='h-4 w-4' />
              <span className='font-cairo text-[13px] font-extrabold'>تصفية السجلات</span>
            </div>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className='font-cairo text-[12px] font-bold text-primary underline-offset-2 hover:underline'
              >
                إعادة تعيين
              </button>
            )}
          </div>

          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8'>
            {/* Search */}
            <div className='relative sm:col-span-2 lg:col-span-2 xl:col-span-2'>
              <input
                placeholder='بحث في السجلات...'
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className='h-[40px] w-full rounded-[10px] border border-[#EEF2F6] bg-white pe-10 ps-4 text-right font-cairo text-[13px] font-bold text-[#111827] placeholder:text-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-primary/20'
              />
              <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]' />
            </div>

            {/* Category */}
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value as AuditLogCategory | ''); setPage(1); }}
              className={selectClass}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>

            {/* Outcome */}
            <select
              value={outcome}
              onChange={(e) => { setOutcome(e.target.value as AuditLogOutcome | ''); setPage(1); }}
              className={selectClass}
            >
              {OUTCOMES.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            {/* Actor Role */}
            <select
              value={actorRole}
              onChange={(e) => { setActorRole(e.target.value); setPage(1); }}
              className={selectClass}
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>

            {/* Date Range */}
            <div className='flex min-w-0 items-center gap-2 sm:col-span-2 lg:col-span-4 xl:col-span-3'>
              <input
                type='date'
                value={from}
                onChange={(e) => { setFrom(e.target.value); setPage(1); }}
                className={`${selectClass} min-w-0 flex-1 px-2`}
                title='من تاريخ'
              />
              <span className='font-cairo text-[11px] text-[#98A2B3]'>إلى</span>
              <input
                type='date'
                value={to}
                onChange={(e) => { setTo(e.target.value); setPage(1); }}
                className={`${selectClass} min-w-0 flex-1 px-2`}
                title='إلى تاريخ'
              />
            </div>
          </div>
        </section>

        {/* ── Table ───────────────────────────────────────────────── */}
        <section className='mt-4 overflow-hidden rounded-[14px] border border-[#EEF2F6] bg-white shadow-[0_18px_30px_rgba(0,0,0,0.07)]'>
          {/* Table header */}
          <div className='grid grid-cols-12 gap-2 border-b border-[#EEF2F6] px-6 py-3'>
            <div className='col-span-3 text-right font-cairo text-[12px] font-extrabold text-[#667085]'>الإجراء / الفئة</div>
            <div className='col-span-2 text-right font-cairo text-[12px] font-extrabold text-[#667085]'>المستخدم</div>
            <div className='col-span-2 text-right font-cairo text-[12px] font-extrabold text-[#667085]'>النتيجة</div>
            <div className='col-span-2 text-right font-cairo text-[12px] font-extrabold text-[#667085]'>IP / المسار</div>
            <div className='col-span-3 text-right font-cairo text-[12px] font-extrabold text-[#667085]'>التاريخ والوقت</div>
          </div>

          {/* Loading */}
          {(isLoading || (isFetching && logs.length === 0)) && (
            <div className='divide-y divide-[#EEF2F6]'>
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </div>
          )}

          {/* Error */}
          {isError && !isLoading && (
            <div className='px-6 py-16 text-center'>
              <ShieldAlert className='mx-auto mb-3 h-10 w-10 text-[#FCA5A5]' />
              <div className='font-cairo text-[14px] font-black text-[#991B1B]'>
                تعذّر تحميل السجلات
              </div>
              <div className='mt-1 font-cairo text-[12px] font-semibold text-[#98A2B3]'>
                {(error as Error)?.message ?? 'خطأ في الاتصال بالخادم'}
              </div>
            </div>
          )}

          {/* Empty */}
          {!isLoading && !isError && logs.length === 0 && (
            <div className='px-6 py-16 text-center'>
              <Activity className='mx-auto mb-3 h-10 w-10 text-[#E5E7EB]' />
              <div className='font-cairo text-[14px] font-black text-[#667085]'>
                لا توجد سجلات مطابقة
              </div>
              <div className='mt-1 font-cairo text-[12px] font-semibold text-[#98A2B3]'>
                جرّب تغيير معايير البحث أو التصفية
              </div>
            </div>
          )}

          {/* Rows */}
          {!isLoading && !isError && logs.length > 0 && (
            <div className={`divide-y divide-[#EEF2F6] ${isFetching ? 'opacity-60 transition-opacity' : ''}`}>
              {logs.map((log) => (
                <LogRow key={log._id} log={log} />
              ))}
            </div>
          )}
        </section>

        {/* ── Pagination ──────────────────────────────────────────── */}
        {!isLoading && !isError && total > PAGE_SIZE && (
          <section className='mt-4 flex items-center justify-between px-1'>
            <div className='font-cairo text-[12px] font-semibold text-[#98A2B3]'>
              عرض {Math.min((page - 1) * PAGE_SIZE + 1, total)}–{Math.min(page * PAGE_SIZE, total)} من {total.toLocaleString('ar-SA')} سجل
            </div>
            <div className='flex items-center gap-2'>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isFetching}
                className='flex h-[36px] w-[36px] items-center justify-center rounded-[8px] border border-[#EEF2F6] bg-white text-[#344054] transition-colors hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-40'
              >
                <ChevronRight className='h-4 w-4' />
              </button>

              <div className='flex items-center gap-1'>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let p = i + 1;
                  if (totalPages > 5 && page > 3) p = page - 2 + i;
                  if (p > totalPages) return null;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`flex h-[36px] w-[36px] items-center justify-center rounded-[8px] font-cairo text-[13px] font-extrabold transition-colors ${
                        p === page
                          ? 'bg-primary text-white shadow-sm'
                          : 'border border-[#EEF2F6] bg-white text-[#344054] hover:bg-[#F9FAFB]'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || isFetching}
                className='flex h-[36px] w-[36px] items-center justify-center rounded-[8px] border border-[#EEF2F6] bg-white text-[#344054] transition-colors hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-40'
              >
                <ChevronLeft className='h-4 w-4' />
              </button>
            </div>
          </section>
        )}

        {/* ── Privacy note ────────────────────────────────────────── */}
        <section className='mt-6 rounded-[12px] border border-[#FDE68A] bg-[#FFFBEB] px-6 py-4'>
          <div className='flex items-start justify-between gap-4'>
            <div className='text-right'>
              <div className='font-cairo text-[14px] font-black text-[#92400E]'>
                ملاحظة الخصوصية والامتثال
              </div>
              <div className='mt-1 font-cairo text-[12px] font-semibold leading-[20px] text-[#B45309]'>
                لا تتضمن سجلات التدقيق أي محتوى حساس للمرضى (لا مرفقات، لا رسائل استشارة، لا نصوص تشخيص أو وصفات). يتم تتبع الأنشطة فقط للأغراض الأمنية والإدارية والامتثال القانوني.
                <br />
                مدد الاحتفاظ: AUTH / AUTHZ / DATA / ADMIN — 3 سنوات | PHI — 7 سنوات | SYSTEM — سنة واحدة.
              </div>
            </div>
            <div className='flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[10px] bg-[#FDE68A]'>
              <AlertTriangle className='h-5 w-5 text-[#B45309]' />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
