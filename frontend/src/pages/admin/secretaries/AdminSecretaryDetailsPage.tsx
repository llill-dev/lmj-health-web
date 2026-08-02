import { Helmet } from 'react-helmet-async';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Eye,
  Lock,
  Mail,
  Phone,
  Settings,
  Stethoscope,
  UserMinus,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { useAdminSecretariesList } from '@/hooks/admin/secretaries/useAdminSecretaries';
import OffboardDialog from '@/components/admin/secretaries/dialogs/OffboardDialog';
import {
  PERM_GROUPS,
  PERM_LABEL,
} from '@/components/admin/secretaries/secretaryPermissions';
import type { AdminSecretarySummary } from '@/lib/admin/types';
import { useI18n } from '@/i18n/provider';

/* ─── page ──────────────────────────────────────────────────── */
export default function AdminSecretaryDetailsPage() {
  const { secretaryId } = useParams<{ secretaryId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === 'ar' ? ar : en);

  /* Try state first, then fallback to fetching list */
  const locationSecretary = (location.state as { secretary?: AdminSecretarySummary })?.secretary;
  const { data: listData, isAwaitingData } = useAdminSecretariesList({ limit: 100 });
  const secretary: AdminSecretarySummary | undefined =
    locationSecretary ??
    listData?.secretaries.find((s) => s._id === secretaryId);

  const [offboardOpen, setOffboardOpen] = useState(false);
  const userId = secretary?.userId ?? secretary?.user?._id ?? null;

  const perms = secretary?.permissions ?? [];

  return (
    <>
      <Helmet>
        <title>
          {secretary?.user?.fullName
            ? `${secretary.user.fullName} • LMJ Health`
            : `${tr('ملف السكرتير', 'Secretary profile')} • LMJ Health`}
        </title>
      </Helmet>

      <div dir={dir} lang={locale}>
        {/* breadcrumb */}
        <button
          type='button'
          onClick={() => navigate('/admin/secretaries')}
          className='mb-5 inline-flex items-center gap-2 font-cairo text-[12px] font-extrabold text-[#667085] transition hover:text-primary'
        >
          <ArrowRight className='h-4 w-4' />
          {tr('العودة إلى قائمة السكرتارية', 'Back to secretaries list')}
        </button>

        {/* header */}
        <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
          <div className='flex items-center gap-4'>
            <div className='flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-primary to-primary/70 text-white shadow-md'>
              <Users className='h-8 w-8' />
            </div>
            <div>
              {isAwaitingData && !secretary ? (
                <>
                  <div className='h-6 w-48 animate-pulse rounded bg-[#EEF2F6]' />
                  <div className='mt-2 h-4 w-32 animate-pulse rounded bg-[#EEF2F6]' />
                </>
              ) : (
                <>
                  <div className='font-cairo text-[24px] font-black leading-[30px] text-[#111827]'>
                    {secretary?.user?.fullName ?? '—'}
                  </div>
                  <div className='mt-1 font-cairo text-[12px] font-bold text-[#98A2B3]'>
                    {tr('حساب سكرتير • المعرّف:', 'Secretary account • ID:')}{' '}
                    {secretaryId}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className='flex flex-wrap gap-2'>
            <span className='inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 font-cairo text-[12px] font-extrabold text-[#667085]'>
              <Eye className='h-4 w-4' />
              {tr('عرض فقط', 'Read only')}
            </span>
            <button
              type='button'
              onClick={() =>
                navigate(`/admin/secretaries/${secretaryId}/appointments`, {
                  state: location.state,
                })
              }
              className='h-9 rounded-[10px] border border-primary bg-white px-4 font-cairo text-[12px] font-extrabold text-primary hover:bg-[#E7FBFA]'
            >
              <CalendarDays className='me-1.5 inline h-4 w-4' />
              {tr('المواعيد', 'Appointments')}
            </button>
            <button
              type='button'
              onClick={() =>
                navigate(
                  `/admin/secretaries/${secretaryId}/appointments/manage`,
                  { state: location.state },
                )
              }
              className='h-9 rounded-[10px] bg-primary px-4 font-cairo text-[12px] font-extrabold text-white hover:bg-primary/90'
            >
              {tr('إدارة المواعيد', 'Manage appointments')}
            </button>
            {userId && (
              <button
                type='button'
                onClick={() => setOffboardOpen(true)}
                className='flex h-9 items-center gap-1.5 rounded-[10px] border border-[#FECACA] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#DC2626] hover:bg-[#FEF2F2]'
              >
                <UserMinus className='h-4 w-4' />
                {tr('إيقاف الحساب', 'Offboard account')}
              </button>
            )}
          </div>
        </div>

        <div className='mt-4 rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-5 py-4'>
          <div className='flex items-start gap-3'>
            <Lock className='mt-0.5 h-4 w-4 shrink-0 text-[#B42318]' />
            <div>
              <div className='font-cairo text-[12px] font-extrabold text-[#991B1B]'>
                {tr('صلاحيات السكرتيرة معروضة للمراجعة فقط', 'Secretary permissions are shown for review only')}
              </div>
              <div className='mt-1 font-cairo text-[11px] font-bold leading-6 text-[#B42318]'>
                {tr(
                  'لا تسمح لوحة الإدارة حالياً بتعديل صلاحيات السكرتيرة أو بياناتها من هذه الواجهة، لذلك يتم عرض المعلومات هنا بشكل read-only لتفادي أي التباس.',
                  'The admin area does not currently support editing secretary permissions or profile data from this screen, so the information is presented as read-only to avoid misleading actions.',
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── content grid ── */}
        <div className='mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3'>

          {/* left: contact + doctor */}
          <div className='flex flex-col gap-5'>

            {/* contact info */}
            <div className='rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
              <h3 className='mb-4 font-cairo text-[13px] font-extrabold text-[#111827]'>
                {tr('معلومات التواصل', 'Contact information')}
              </h3>
              <div className='space-y-3'>
                {secretary?.user?.email && (
                  <div className='flex items-center justify-between rounded-[8px] bg-[#F9FAFB] px-4 py-3'>
                    <div className='flex items-center gap-2 text-[#667085]'>
                      <Mail className='h-4 w-4 text-primary' />
                      <span className='font-cairo text-[12px] font-bold'>
                        {tr('البريد الإلكتروني', 'Email')}
                      </span>
                    </div>
                    <span className='font-cairo text-[12px] font-extrabold text-[#111827]'>
                      {secretary.user.email}
                    </span>
                  </div>
                )}
                {secretary?.user?.phone && (
                  <div className='flex items-center justify-between rounded-[8px] bg-[#F9FAFB] px-4 py-3'>
                    <div className='flex items-center gap-2 text-[#667085]'>
                      <Phone className='h-4 w-4 text-primary' />
                      <span className='font-cairo text-[12px] font-bold'>
                        {tr('رقم الهاتف', 'Phone')}
                      </span>
                    </div>
                    <span className='font-cairo text-[12px] font-extrabold text-[#111827]'>
                      {secretary.user.phone}
                    </span>
                  </div>
                )}
                {secretary?.user?.gender && (
                  <div className='flex items-center justify-between rounded-[8px] bg-[#F9FAFB] px-4 py-3'>
                    <span className='font-cairo text-[12px] font-bold text-[#667085]'>
                      {tr('الجنس', 'Gender')}
                    </span>
                    <span className='font-cairo text-[12px] font-extrabold text-[#111827]'>
                      {secretary.user.gender === 'Female'
                        ? tr('أنثى', 'Female')
                        : tr('ذكر', 'Male')}
                    </span>
                  </div>
                )}
                {!secretary?.user?.email && !secretary?.user?.phone && !isAwaitingData && (
                  <div className='font-cairo text-[12px] text-[#98A2B3]'>
                    {tr('لا توجد بيانات تواصل', 'No contact details')}
                  </div>
                )}
              </div>
            </div>

            {/* assigned doctor */}
            <div className='rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
              <h3 className='mb-4 font-cairo text-[13px] font-extrabold text-[#111827]'>
                {tr('الطبيب المسؤول', 'Assigned doctor')}
              </h3>
              {secretary?.doctor ? (
                <div className='rounded-[10px] border border-[#BFEDEC] bg-[#E7FBFA] p-4'>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-[8px] bg-white shadow-sm'>
                      <Stethoscope className='h-5 w-5 text-primary' />
                    </div>
                    <div>
                      <div className='font-cairo text-[13px] font-extrabold text-[#111827]'>
                        {secretary.doctor.user?.fullName ?? '—'}
                      </div>
                      {secretary.doctor.specialization && (
                        <div className='mt-0.5 font-cairo text-[11px] font-bold text-[#667085]'>
                          {secretary.doctor.specialization}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className='mt-3 flex items-center gap-2'>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-cairo text-[10px] font-extrabold ${
                        secretary.doctor.approvalStatus === 'approved'
                          ? 'bg-[#DCFCE7] text-[#15803D]'
                          : 'bg-[#FEF3C7] text-[#D97706]'
                      }`}
                    >
                      <CheckCircle2 className='h-3 w-3' />
                      {secretary.doctor.approvalStatus === 'approved'
                        ? tr('معتمد', 'Approved')
                        : tr('غير معتمد', 'Not approved')}
                    </span>
                  </div>
                </div>
              ) : (
                <div className='rounded-[10px] border border-[#EEF2F6] bg-[#F9FAFB] px-4 py-5 text-center font-cairo text-[12px] text-[#98A2B3]'>
                  {tr('غير مرتبط بطبيب', 'Not linked to a doctor')}
                </div>
              )}
            </div>
          </div>

          {/* right: permissions (spans 2 cols) */}
          <div className='xl:col-span-2 rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
            <div className='mb-5 flex items-center justify-between'>
              <h3 className='font-cairo text-[13px] font-extrabold text-[#111827]'>
                {tr('الصلاحيات الممنوحة', 'Granted permissions')}
              </h3>
              <span className='rounded-full bg-[#E7FBFA] px-3 py-1 font-cairo text-[11px] font-extrabold text-primary'>
                {perms.length} {tr('صلاحية', 'permissions')}
              </span>
            </div>

            {perms.length === 0 ? (
              <div className='flex flex-col items-center gap-2 py-10 text-center'>
                <Settings className='h-8 w-8 text-[#D0D5DD]' />
                <span className='font-cairo text-[13px] font-bold text-[#98A2B3]'>
                  {tr('لا توجد صلاحيات مضافة', 'No permissions added')}
                </span>
              </div>
            ) : (
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                {PERM_GROUPS.map(({ label, icon: Icon, keys, color, bg, border }) => {
                  const granted = keys.filter((k) => perms.includes(k));
                  if (granted.length === 0) return null;
                  return (
                    <div
                      key={label}
                      className={`rounded-[12px] border ${border} ${bg} px-4 py-4`}
                    >
                      <div className={`mb-3 flex items-center gap-2 ${color}`}>
                        <Icon className='h-4 w-4' />
                        <span className='font-cairo text-[12px] font-extrabold'>{label}</span>
                        <span className='ms-auto font-cairo text-[11px] font-bold opacity-70'>
                          {granted.length}/{keys.length}
                        </span>
                      </div>
                      <div className='space-y-2'>
                        {keys.map((k) => {
                          const has = perms.includes(k);
                          return (
                            <div
                              key={k}
                              className={`flex items-center gap-2 font-cairo text-[11px] font-bold ${has ? 'text-[#111827]' : 'text-[#D0D5DD] line-through'}`}
                            >
                              <div
                                className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${has ? 'bg-current' : 'bg-[#D0D5DD]'}`}
                              />
                              {PERM_LABEL[k] ?? k}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <OffboardDialog
        open={offboardOpen}
        onOpenChange={setOffboardOpen}
        targetUserId={userId}
        targetLabel={
          secretary?.user?.fullName ?? tr('هذا الحساب', 'this account')
        }
        onSuccess={() => navigate('/admin/secretaries')}
      />
    </>
  );
}
