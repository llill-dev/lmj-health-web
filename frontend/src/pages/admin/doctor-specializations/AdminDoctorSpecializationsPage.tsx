import { Helmet } from 'react-helmet-async';
import {
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Info,
  Loader2,
  Plus,
  Pencil,
  RefreshCw,
  Search,
  Stethoscope,
  Tags,
  Trash2,
} from 'lucide-react';
import ConfirmActionDialog from '@/components/admin/dialogs/ConfirmActionDialog';
import UpsertDoctorLookupDialog from '@/components/admin/doctor-specializations/UpsertDoctorLookupDialog';
import { useAdminLookups } from '@/hooks/useAdminLookups';
import { useRemoveLookup } from '@/hooks/useAdminLookupMutations';
import {
  resolveLookupSecondaryText,
  resolveLookupText,
} from '@/lib/admin/lookupUtils';
import { resolveDoctorSpecialtyLookupCategory } from '@/lib/admin/doctorSpecialtyLookupCategory';
import type { AdminLookupRecord } from '@/lib/admin/types';
import { userFacingErrorMessage } from '@/lib/admin/userFacingError';
import { staggerContainer, staggerItem } from '@/motion';
import { ApiError } from '@/lib/base';

const TEAL = '#108B8B';
const PAGE_SIZE = 9;

export default function AdminDoctorSpecializationsPage() {
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search.trim());
  const [page, setPage] = useState(1);
  const [includeInactive, setIncludeInactive] = useState(false);

  const [upsertOpen, setUpsertOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminLookupRecord | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<AdminLookupRecord | null>(
    null,
  );

  const lookupCategory = resolveDoctorSpecialtyLookupCategory();

  const listParams = useMemo(
    () => ({
      category: lookupCategory,
      includeInactive,
    }),
    [lookupCategory, includeInactive],
  );

  const { data, isLoading, error, refetch, isFetching } =
    useAdminLookups(listParams);
  const removeMut = useRemoveLookup();

  const lookups = data?.lookups ?? [];

  const filtered = useMemo(() => {
    const q = deferredSearch.toLowerCase();
    const rows = [...lookups];
    rows.sort(
      (a, b) =>
        (a.order ?? 0) - (b.order ?? 0) || a.key.localeCompare(b.key, 'en'),
    );
    if (!q) return rows;
    return rows.filter((row) => {
      const ar = resolveLookupText(row.text, 'ar');
      const en = resolveLookupText(row.text, 'en');
      const alt = resolveLookupSecondaryText(row.text, 'ar');
      const hay = `${row.key} ${ar} ${en} ${alt}`.toLowerCase();
      return hay.includes(q);
    });
  }, [lookups, deferredSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);

  useEffect(() => {
    setPage(1);
  }, [deferredSearch, includeInactive]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const activeCount = lookups.filter((x) => x.isActive).length;
  const inactiveCount = lookups.filter((x) => !x.isActive).length;

  const busy = isLoading || isFetching;

  function openCreate() {
    setEditTarget(null);
    setUpsertOpen(true);
  }

  function openEdit(row: AdminLookupRecord) {
    setEditTarget(row);
    setUpsertOpen(true);
  }

  const apiErrMsg =
    error != null
      ? error instanceof ApiError
        ? userFacingErrorMessage(error)
        : 'تعذّر تحميل الكتالوج.'
      : null;

  return (
    <>
      <Helmet>
        <title>تخصصات الأطباء • LMJ Health</title>
      </Helmet>

      <div
        dir='rtl'
        lang='ar'
        className='mx-auto w-full max-w-[1600px] px-3 pb-10 sm:px-4 md:px-6'
      >
        <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
          <div className='min-w-0 text-right'>
            <div className='inline-flex items-center gap-3'>
              <div className='flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#ECFEFF] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]'>
                <Tags
                  className='h-5 w-5 text-primary'
                  aria-hidden
                />
              </div>
              <div>
                <h1 className='font-cairo text-[20px] font-black leading-tight text-[#111827] sm:text-[22px]'>
                  تخصصات الأطباء
                </h1>
                <p className='mt-1 max-w-[560px] font-cairo text-[12px] font-semibold leading-relaxed text-[#667085]'>
                  إدارة كتالوج عبر{' '}
                  <span className='font-mono text-[11px] font-bold text-[#475467]'>
                    GET /api/admin/lookups?category=
                    {lookupCategory}
                  </span>
                  . الفئة الحالية من المتغير{' '}
                  <span className='font-mono text-[10px]'>
                    VITE_ADMIN_DOCTOR_LOOKUP_CATEGORY
                  </span>{' '}
                  (الافتراضي المعقول للتوافق مع API-3: MEDICAL_CONDITION).
                </p>
              </div>
            </div>
          </div>

          <div className='flex flex-wrap items-center gap-2 lg:justify-end'>
            <button
              type='button'
              onClick={() => refetch()}
              disabled={busy}
              className='inline-flex h-[40px] items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-bold text-[#344054] shadow-[0_10px_22px_rgba(0,0,0,0.05)] transition hover:border-primary/40 disabled:opacity-50'
            >
              <RefreshCw
                className={`h-4 w-4 ${busy ? 'animate-spin' : ''}`}
                aria-hidden
              />
              تحديث
            </button>
            <button
              type='button'
              onClick={openCreate}
              className='inline-flex h-[40px] items-center gap-2 rounded-[10px] bg-primary px-4 font-cairo text-[12px] font-extrabold text-white shadow-[0_16px_34px_rgba(15,143,139,0.28)] transition hover:brightness-105'
            >
              <Plus
                className='h-4 w-4'
                aria-hidden
              />
              إضافة تخصص
            </button>
            <Link
              to='/admin/doctors'
              className='inline-flex h-[40px] items-center gap-1 rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-bold text-[#111827] shadow-[0_10px_22px_rgba(0,0,0,0.05)] transition hover:border-primary/40 hover:text-primary'
            >
              قائمة الأطباء
              <ChevronLeft
                className='h-4 w-4'
                aria-hidden
              />
            </Link>
          </div>
        </div>

        <div
          role='note'
          className='mt-5 flex gap-3 rounded-[12px] border border-[#CFFAFE] bg-gradient-to-l from-[#F0FDFF] to-white px-4 py-3 text-right shadow-[0_10px_26px_rgba(15,143,139,0.08)]'
        >
          <Info
            className='mt-0.5 h-5 w-5 shrink-0 text-primary'
            aria-hidden
          />
          <div className='font-cairo text-[12px] font-semibold leading-relaxed text-[#0F172A]'>
            سبب شائع لخطأ <span className='font-mono'>422</span>: إرسال{' '}
            <span className='font-mono'>category=SPECIALIZATION</span> بينما API-3
            يصرّح فقط بـ{' '}
            <span className='font-mono'>BLOOD_TYPE</span> |{' '}
            <span className='font-mono'>ALLERGY</span> |{' '}
            <span className='font-mono'>MEDICAL_CONDITION</span>. تم ضبط الطلب على
            الفئة <span className='font-mono'>{lookupCategory}</span> عبر المتغير أعلاه؛
            لتخصصات أطباء مستقلة على الخادم أضف الفئة هناك ثم عيّن{' '}
            <span className='font-mono'>SPECIALIZATION</span> في الإعدادات.
          </div>
        </div>

        <section className='mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3'>
          <div className='rounded-[14px] border border-[#E8ECEF] bg-white px-4 py-4 shadow-[0_18px_34px_rgba(15,23,42,0.06)]'>
            <div className='flex items-center justify-between gap-2'>
              <span className='font-cairo text-[11px] font-bold text-[#667085]'>
                عناصر الكتالوج
              </span>
              <Tags
                className='h-4 w-4 text-primary'
                aria-hidden
              />
            </div>
            <div
              className='mt-2 font-cairo text-[28px] font-black tabular-nums leading-none'
              style={{ color: TEAL }}
            >
              {busy ? '…' : lookups.length}
            </div>
          </div>
          <div className='rounded-[14px] border border-[#E8ECEF] bg-white px-4 py-4 shadow-[0_18px_34px_rgba(15,23,42,0.06)]'>
            <div className='flex items-center justify-between gap-2'>
              <span className='font-cairo text-[11px] font-bold text-[#667085]'>
                نشطة
              </span>
              <Stethoscope
                className='h-4 w-4 text-[#16A34A]'
                aria-hidden
              />
            </div>
            <div className='mt-2 font-cairo text-[28px] font-black tabular-nums leading-none text-[#16A34A]'>
              {busy ? '…' : activeCount}
            </div>
          </div>
          <div className='rounded-[14px] border border-[#E8ECEF] bg-white px-4 py-4 shadow-[0_18px_34px_rgba(15,23,42,0.06)]'>
            <div className='flex items-center justify-between gap-2'>
              <span className='font-cairo text-[11px] font-bold text-[#667085]'>
                غير نشطة
              </span>
              <Tags
                className='h-4 w-4 text-[#98A2B3]'
                aria-hidden
              />
            </div>
            <div className='mt-2 font-cairo text-[28px] font-black tabular-nums leading-none text-[#64748B]'>
              {busy ? '…' : inactiveCount}
            </div>
          </div>
        </section>

        <div className='mt-6 flex flex-col gap-3 rounded-[14px] border border-[#E8ECEF] bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.06)] sm:flex-row sm:flex-wrap sm:items-center sm:justify-between'>
          <label className='relative flex min-w-[200px] flex-1 items-center'>
            <Search
              className='pointer-events-none absolute right-3 h-4 w-4 text-[#98A2B3]'
              aria-hidden
            />
            <input
              type='search'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='ابحث بالمفتاح أو الاسم العربي أو الإنجليزي…'
              className='h-[44px] w-full rounded-[12px] border border-[#E5E7EB] bg-[#F9FAFB] py-2 pe-10 ps-4 text-right font-cairo text-[13px] font-semibold text-[#111827] outline-none ring-primary/0 transition placeholder:text-[#98A2B3] focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/12'
            />
          </label>

          <label className='flex cursor-pointer select-none items-center gap-2 rounded-[12px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2.5 font-cairo text-[12px] font-bold text-[#344054]'>
            <input
              type='checkbox'
              className='h-4 w-4 rounded border-[#D0D5DD] text-primary focus:ring-primary/40'
              checked={includeInactive}
              onChange={(e) => setIncludeInactive(e.target.checked)}
            />
            عرض العناصر المعطّلة
          </label>
        </div>

        {isLoading ? (
          <div className='mt-8 flex flex-col items-center justify-center gap-3 rounded-[14px] border border-[#EEF2F6] bg-white py-20'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' />
            <p className='font-cairo text-[13px] font-semibold text-[#667085]'>
              جاري تحميل كتالوج التخصصات…
            </p>
          </div>
        ) : apiErrMsg ? (
          <div className='mt-8 rounded-[14px] border border-[#FECACA] bg-[#FEF2F2] px-5 py-12 text-center'>
            <p className='font-cairo text-[13px] font-bold text-[#B42318]'>
              {apiErrMsg}
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className='mt-8 rounded-[14px] border border-dashed border-[#E5E7EB] bg-[#FAFBFC] px-6 py-16 text-center'>
            <p className='font-cairo text-[14px] font-bold text-[#475467]'>
              لا توجد عناصر مطابقة للبحث أو الكتالوج فارغ.
            </p>
            <button
              type='button'
              onClick={openCreate}
              className='mt-4 inline-flex h-[40px] items-center gap-2 rounded-[10px] bg-primary px-5 font-cairo text-[12px] font-extrabold text-white'
            >
              <Plus className='h-4 w-4' />
              إضافة أول تخصص
            </button>
          </div>
        ) : (
          <>
            <AnimatePresence mode='wait'>
              <motion.ul
                key={safePage}
                role='list'
                className='mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'
                variants={staggerContainer(0.055, 0.03)}
                initial='hidden'
                animate='show'
                exit={{ opacity: 0.65 }}
              >
                {pageRows.map((row) => {
                  const titleAr = resolveLookupText(row.text, 'ar');
                  const titleEn = resolveLookupText(row.text, 'en');
                  const filterLink = `/admin/doctors?specialization=${encodeURIComponent(titleAr || titleEn || row.key)}`;
                  return (
                    <motion.li
                      key={row._id}
                      variants={staggerItem}
                      layout
                      className='group h-full'
                    >
                      <div className='relative flex h-full min-h-[168px] flex-col overflow-hidden rounded-[14px] border border-[#E8ECEF] bg-white shadow-[0_18px_38px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_26px_52px_rgba(15,143,139,0.14)]'>
                        <div className='pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-l from-primary/90 via-[#2DD4BF]/90 to-transparent opacity-90' />

                        <div className='flex flex-1 flex-col gap-3 p-4'>
                          <div className='flex flex-wrap items-start justify-between gap-2'>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-cairo text-[10px] font-extrabold ${
                                row.isActive
                                  ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
                                  : 'bg-[#F3F4F6] text-[#64748B] ring-1 ring-[#E5E7EB]'
                              }`}
                            >
                              {row.isActive ? 'نشط' : 'غير نشط'}
                            </span>
                            <span className='rounded-full bg-[#F0FDFA] px-2.5 py-0.5 font-mono text-[10px] font-bold text-primary ring-1 ring-[#CCFBF1]'>
                              #{row.order ?? 0}
                            </span>
                          </div>

                          <div className='min-w-0 text-right'>
                            <h2 className='font-cairo text-[15px] font-extrabold leading-snug text-[#111827]'>
                              {titleAr || titleEn || row.key}
                            </h2>
                            <p
                              dir='ltr'
                              className='mt-1 font-cairo text-[12px] font-semibold leading-snug text-[#64748B]'
                            >
                              {titleEn || '—'}
                            </p>
                            <p
                              dir='ltr'
                              className='mt-2 truncate font-mono text-[11px] font-semibold text-[#98A2B3] text-left'
                            >
                              key: {row.key}
                            </p>
                          </div>

                          <div className='mt-auto flex flex-wrap items-center gap-2 border-t border-[#F2F4F7] pt-3'>
                            <Link
                              to={filterLink}
                              className='inline-flex flex-1 min-w-[120px] items-center justify-center gap-1 rounded-[10px] bg-[#ECFEFF] px-3 py-2 font-cairo text-[11px] font-extrabold text-primary ring-1 ring-[#CFFAFE] transition hover:bg-[#DCFDFD]'
                            >
                              أطباء مطابقون
                              <ChevronLeft className='h-3.5 w-3.5' />
                            </Link>
                            <button
                              type='button'
                              onClick={() => openEdit(row)}
                              className='inline-flex h-[36px] w-[36px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white text-[#475467] shadow-sm transition hover:border-primary/35 hover:text-primary'
                              aria-label='تعديل'
                            >
                              <Pencil className='h-4 w-4' />
                            </button>
                            <button
                              type='button'
                              onClick={() => setDeleteTarget(row)}
                              className='inline-flex h-[36px] w-[36px] items-center justify-center rounded-[10px] border border-[#FEE2E2] bg-[#FFF7F7] text-[#DC2626] transition hover:bg-[#FEF2F2]'
                              aria-label='تعطيل'
                            >
                              <Trash2 className='h-4 w-4' />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.li>
                  );
                })}
              </motion.ul>
            </AnimatePresence>

            <div className='mt-8 flex flex-col items-center justify-between gap-4 border-t border-[#F2F4F7] pt-6 sm:flex-row'>
              <p className='font-cairo text-[12px] font-semibold text-[#667085]'>
                عرض{' '}
                <span className='tabular-nums font-bold text-[#111827]'>
                  {filtered.length === 0
                    ? 0
                    : (safePage - 1) * PAGE_SIZE + 1}
                  –
                  {(safePage - 1) * PAGE_SIZE + pageRows.length}
                </span>{' '}
                من{' '}
                <span className='font-bold text-[#111827]'>{filtered.length}</span>{' '}
                عنصراً مطابقاً
              </p>

              <div className='flex flex-wrap items-center justify-center gap-2'>
                <button
                  type='button'
                  disabled={safePage <= 1 || busy}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className='h-[38px] min-w-[96px] rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-bold text-[#111827] shadow-sm disabled:opacity-40'
                >
                  السابق
                </button>
                <span className='font-cairo text-[12px] font-bold text-[#475467]'>
                  صفحة {safePage} / {totalPages}
                </span>
                <button
                  type='button'
                  disabled={safePage >= totalPages || busy}
                  onClick={() =>
                    setPage((p) => Math.min(totalPages, p + 1))
                  }
                  className='h-[38px] min-w-[96px] rounded-[10px] bg-primary px-4 font-cairo text-[12px] font-bold text-white shadow-[0_12px_26px_rgba(15,143,139,0.28)] disabled:opacity-40'
                >
                  التالي
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <UpsertDoctorLookupDialog
        open={upsertOpen}
        onOpenChange={setUpsertOpen}
        category={lookupCategory}
        editTarget={editTarget}
      />

      <ConfirmActionDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        variant='destructive'
        title='تعطيل عنصر التخصص'
        icon={<Trash2 className='h-6 w-6' strokeWidth={2} aria-hidden />}
        description={
          deleteTarget ? (
            <>
              سيتم استدعاء{' '}
              <span className='font-mono text-[11px]'>DELETE /api/admin/lookups/:id</span>{' '}
              (تعطيل ناعم). العنصر:{' '}
              <strong>{resolveLookupText(deleteTarget.text, 'ar')}</strong>
            </>
          ) : null
        }
        cancelLabel='إلغاء'
        confirmLabel={removeMut.isPending ? 'جاري التعطيل…' : 'تأكيد التعطيل'}
        confirmDisabled={removeMut.isPending}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await removeMut.mutateAsync(deleteTarget._id);
          setDeleteTarget(null);
        }}
        successToast={{
          title: 'تم',
          message: 'عُطّل عنصر الكتالوج.',
          variant: 'success',
        }}
      />
    </>
  );
}
