import { Helmet } from 'react-helmet-async';
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Search,
  Stethoscope,
  UserMinus,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCallback, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { useAdminSecretariesList } from '@/hooks/useAdminSecretaries';
import OffboardDialog from '@/components/admin/dialogs/OffboardDialog';
import type { AdminSecretarySummary } from '@/lib/admin/types';

/* ─── permission label map ──────────────────────────────────── */
const PERM_LABEL: Record<string, string> = {
  'appointments:book': 'حجز مواعيد',
  'appointments:view': 'عرض المواعيد',
  'appointments:edit': 'تعديل المواعيد',
  'appointments:cancel': 'إلغاء المواعيد',
  'waitlist:create': 'إنشاء قائمة الانتظار',
  'waitlist:view': 'عرض قائمة الانتظار',
  'waitlist:manage': 'إدارة قائمة الانتظار',
  'waitlist:book': 'حجز من قائمة الانتظار',
  'patients:view': 'عرض المرضى',
  'patients:edit': 'تعديل بيانات المرضى',
  'patients:temporary:create': 'إنشاء مريض مؤقت',
  'patients:files:view': 'عرض ملفات المرضى',
  'patients:files:upload': 'رفع ملفات المرضى',
  'schedule:view': 'عرض الجدول',
};

/* ─── helpers ──────────────────────────────────────────────── */
function resolveUserId(s: AdminSecretarySummary): string | null {
  return s.userId ?? s.user?._id ?? null;
}

function CardSkeleton() {
  return (
    <div className='animate-pulse rounded-[12px] border border-[#EEF2F6] bg-white p-6 shadow-[0_12px_24px_rgba(0,0,0,0.06)]'>
      <div className='flex items-start justify-between'>
        <div className='flex items-center gap-3'>
          <div className='h-11 w-11 rounded-[8px] bg-[#EEF2F6]' />
          <div>
            <div className='h-4 w-36 rounded bg-[#EEF2F6]' />
            <div className='mt-2 h-3 w-52 rounded bg-[#EEF2F6]' />
          </div>
        </div>
        <div className='h-8 w-24 rounded-[8px] bg-[#EEF2F6]' />
      </div>
      <div className='mt-4 flex gap-4'>
        <div className='h-3 w-32 rounded bg-[#EEF2F6]' />
        <div className='h-3 w-40 rounded bg-[#EEF2F6]' />
      </div>
      <div className='mt-4 h-16 rounded-[10px] bg-[#EEF2F6]' />
    </div>
  );
}

/* ─── page ──────────────────────────────────────────────────── */
export default function AdminSecretariesPage() {
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch] = useDebounce(searchInput, 380);
  const [page, setPage] = useState(1);
  const LIMIT = 10;

  /* offboard dialog state */
  const [offboardOpen, setOffboardOpen] = useState(false);
  const [offboardTarget, setOffboardTarget] = useState<{
    userId: string;
    label: string;
  } | null>(null);

  const { data, isLoading, isError, refetch } = useAdminSecretariesList({
    search: debouncedSearch || undefined,
    page,
    limit: LIMIT,
  });

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1;

  const openOffboard = useCallback((s: AdminSecretarySummary) => {
    const userId = resolveUserId(s);
    if (!userId) return;
    setOffboardTarget({ userId, label: s.user?.fullName ?? 'هذا الحساب' });
    setOffboardOpen(true);
  }, []);

  /* reset page on search change */
  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    setPage(1);
  };

  return (
    <>
      <Helmet>
        <title>إدارة السكرتارية • LMJ Health</title>
      </Helmet>

      <div
        dir='rtl'
        lang='ar'
      >
        {/* ── header ── */}
        <div className='flex items-start justify-between'>
          <div>
            <div className='font-cairo text-[26px] font-black leading-[34px] text-[#111827]'>
              إدارة السكرتارية
            </div>
            <div className='mt-1 font-cairo text-[12px] font-semibold leading-[16px] text-[#98A2B3]'>
              مراقبة وإدارة حسابات السكرتيرين المرتبطين بالأطباء
            </div>
          </div>

          {data && (
            <div className='flex h-10 items-center rounded-[10px] border border-[#EEF2F6] bg-white px-4 shadow-sm'>
              <span className='font-cairo text-[12px] font-extrabold text-[#667085]'>
                الإجمالي:&nbsp;
              </span>
              <span className='font-cairo text-[14px] font-black text-primary'>
                {data.total.toLocaleString('ar-EG')}
              </span>
            </div>
          )}
        </div>

        {/* ── search bar ── */}
        <div className='mt-5 rounded-[12px] border border-[#EEF2F6] bg-white px-5 py-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
          <div className='relative'>
            <input
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder='البحث بالاسم أو البريد أو الهاتف...'
              className='h-[42px] w-full rounded-[10px] border border-[#E5E7EB] bg-white px-4 pe-10 text-right font-cairo text-[12px] font-bold text-[#111827] outline-none transition focus:border-primary placeholder:text-[#98A2B3]'
            />
            <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]' />
          </div>
        </div>

        {/* ── list ── */}
        <section className='mt-5 space-y-4'>
          {isLoading ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : isError ? (
            <div className='flex flex-col items-center gap-3 rounded-[12px] border border-[#FEE2E2] bg-[#FEF2F2] px-6 py-10 text-center'>
              <AlertCircle className='h-7 w-7 text-[#DC2626]' />
              <div className='font-cairo text-[14px] font-extrabold text-[#991B1B]'>
                تعذّر تحميل البيانات
              </div>
              <button
                onClick={() => refetch()}
                className='mt-1 rounded-[8px] border border-[#FECACA] bg-white px-5 py-2 font-cairo text-[12px] font-extrabold text-[#DC2626]'
              >
                إعادة المحاولة
              </button>
            </div>
          ) : data?.secretaries.length === 0 ? (
            <div className='flex flex-col items-center gap-3 rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-16 text-center'>
              <Users className='h-10 w-10 text-[#D0D5DD]' />
              <div className='font-cairo text-[14px] font-extrabold text-[#667085]'>
                {debouncedSearch ? 'لا توجد نتائج مطابقة للبحث' : 'لا يوجد سكرتيرون مسجلون'}
              </div>
            </div>
          ) : (
            data?.secretaries.map((s) => {
              const userId = resolveUserId(s);
              const perms = s.permissions ?? [];

              return (
                <div
                  key={s._id}
                  className='overflow-hidden rounded-[12px] border border-[#EEF2F6] bg-white shadow-[0_12px_24px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_14px_32px_rgba(0,0,0,0.09)]'
                >
                  <div className='px-6 py-5'>
                    {/* top row */}
                    <div className='flex items-start justify-between gap-3'>
                      <div className='flex items-center gap-3'>
                        <div className='flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[8px] bg-gradient-to-br from-primary to-primary/70 text-white shadow-sm'>
                          <Users className='h-5 w-5' />
                        </div>
                        <div className='text-right'>
                          <div className='font-cairo text-[16px] font-black leading-[22px] text-[#111827]'>
                            {s.user?.fullName ?? '—'}
                          </div>
                          <div className='mt-0.5 font-cairo text-[11px] font-bold text-[#98A2B3]'>
                            سكرتير
                            {s.doctor?.user?.fullName
                              ? ` • ${s.doctor.user.fullName}`
                              : ''}
                          </div>
                        </div>
                      </div>

                      <div className='flex items-center gap-2'>
                        {userId && (
                          <button
                            type='button'
                            onClick={() => openOffboard(s)}
                            title='إيقاف الحساب'
                            className='flex h-8 items-center gap-1.5 rounded-[8px] border border-[#FECACA] bg-white px-3 font-cairo text-[11px] font-extrabold text-[#DC2626] transition hover:bg-[#FEF2F2]'
                          >
                            <UserMinus className='h-3.5 w-3.5' />
                            إيقاف
                          </button>
                        )}
                        <button
                          type='button'
                          onClick={() =>
                            navigate(`/admin/secretaries/${s._id}`, {
                              state: { secretary: s },
                            })
                          }
                          title='ملف السكرتير'
                          className='flex h-8 w-8 items-center justify-center rounded-[8px] bg-primary text-white shadow-sm transition hover:bg-primary/90'
                        >
                          <ChevronLeft className='h-4 w-4' />
                        </button>
                      </div>
                    </div>

                    {/* contact */}
                    <div className='mt-4 flex flex-wrap items-center gap-5'>
                      {s.user?.phone && (
                        <div className='flex items-center gap-2 font-cairo text-[12px] font-bold text-[#667085]'>
                          <Phone className='h-4 w-4 text-primary' />
                          {s.user.phone}
                        </div>
                      )}
                      {s.user?.email && (
                        <div className='flex items-center gap-2 font-cairo text-[12px] font-bold text-[#667085]'>
                          <Mail className='h-4 w-4 text-primary' />
                          {s.user.email}
                        </div>
                      )}
                    </div>

                    {/* assigned doctor */}
                    {s.doctor && (
                      <div className='mt-4 flex items-center justify-between rounded-[10px] border border-[#BFEDEC] bg-[#E7FBFA] px-5 py-3'>
                        <div className='flex items-center gap-2 text-primary'>
                          <Stethoscope className='h-4 w-4' />
                          <span className='font-cairo text-[12px] font-extrabold'>الطبيب المسؤول</span>
                        </div>
                        <div className='text-right'>
                          <div className='font-cairo text-[12px] font-extrabold text-[#111827]'>
                            {s.doctor.user?.fullName ?? '—'}
                          </div>
                          {s.doctor.specialization && (
                            <div className='mt-0.5 font-cairo text-[11px] font-semibold text-[#667085]'>
                              {s.doctor.specialization}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* permissions */}
                    {perms.length > 0 && (
                      <div className='mt-4'>
                        <div className='mb-2 font-cairo text-[11px] font-extrabold text-[#98A2B3]'>
                          الصلاحيات ({perms.length})
                        </div>
                        <div className='flex flex-wrap gap-1.5'>
                          {perms.map((p) => (
                            <span
                              key={p}
                              className='rounded-full border border-[#E0F2FE] bg-[#F0F9FF] px-2.5 py-1 font-cairo text-[10px] font-extrabold text-[#0369A1]'
                            >
                              {PERM_LABEL[p] ?? p}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* action buttons */}
                    <div className='mt-4 flex items-center justify-between'>
                      <div className='flex gap-2'>
                        <button
                          type='button'
                          onClick={() =>
                            navigate(
                              `/admin/secretaries/${s._id}/appointments`,
                              { state: { secretary: s } },
                            )
                          }
                          className='h-[30px] rounded-[8px] border border-primary bg-white px-4 font-cairo text-[11px] font-extrabold text-primary transition hover:bg-[#E7FBFA]'
                        >
                          عرض المواعيد
                        </button>
                        <button
                          type='button'
                          onClick={() =>
                            navigate(
                              `/admin/secretaries/${s._id}/appointments/manage`,
                              { state: { secretary: s } },
                            )
                          }
                          className='h-[30px] rounded-[8px] border border-primary bg-white px-4 font-cairo text-[11px] font-extrabold text-primary transition hover:bg-[#E7FBFA]'
                        >
                          إدارة المواعيد
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </section>

        {/* ── pagination ── */}
        {totalPages > 1 && !isLoading && (
          <div className='mt-6 flex items-center justify-center gap-2'>
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className='flex h-9 w-9 items-center justify-center rounded-[8px] border border-[#E5E7EB] bg-white text-[#667085] disabled:opacity-40 hover:border-primary hover:text-primary'
            >
              <ChevronRight className='h-4 w-4' />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`flex h-9 min-w-[36px] items-center justify-center rounded-[8px] border font-cairo text-[12px] font-extrabold transition ${
                  p === page
                    ? 'border-primary bg-primary text-white'
                    : 'border-[#E5E7EB] bg-white text-[#667085] hover:border-primary hover:text-primary'
                }`}
              >
                {p.toLocaleString('ar-EG')}
              </button>
            ))}

            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className='flex h-9 w-9 items-center justify-center rounded-[8px] border border-[#E5E7EB] bg-white text-[#667085] disabled:opacity-40 hover:border-primary hover:text-primary'
            >
              <ChevronLeft className='h-4 w-4' />
            </button>
          </div>
        )}

        <div className='h-8' />
      </div>

      {/* offboard dialog */}
      <OffboardDialog
        open={offboardOpen}
        onOpenChange={setOffboardOpen}
        targetUserId={offboardTarget?.userId ?? null}
        targetLabel={offboardTarget?.label ?? ''}
        onSuccess={() => refetch()}
      />
    </>
  );
}
