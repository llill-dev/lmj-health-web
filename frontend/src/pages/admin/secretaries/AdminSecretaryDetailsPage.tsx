import { Helmet } from 'react-helmet-async';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Mail,
  Phone,
  Settings,
  Stethoscope,
  UserMinus,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { useAdminSecretariesList } from '@/hooks/useAdminSecretaries';
import OffboardDialog from '@/components/admin/dialogs/OffboardDialog';
import type { AdminSecretarySummary } from '@/lib/admin/types';

/* ─── permission groups ─────────────────────────────────────── */
const PERM_GROUPS: Array<{
  label: string;
  icon: React.ElementType;
  keys: string[];
  color: string;
  bg: string;
  border: string;
}> = [
  {
    label: 'المواعيد',
    icon: CalendarDays,
    keys: ['appointments:book', 'appointments:view', 'appointments:edit', 'appointments:cancel'],
    color: 'text-[#0369A1]',
    bg: 'bg-[#F0F9FF]',
    border: 'border-[#BAE6FD]',
  },
  {
    label: 'قائمة الانتظار',
    icon: Users,
    keys: ['waitlist:create', 'waitlist:view', 'waitlist:manage', 'waitlist:book'],
    color: 'text-[#7C3AED]',
    bg: 'bg-[#F5F3FF]',
    border: 'border-[#C4B5FD]',
  },
  {
    label: 'المرضى',
    icon: Users,
    keys: ['patients:view', 'patients:edit', 'patients:temporary:create', 'patients:files:view', 'patients:files:upload'],
    color: 'text-[#15803D]',
    bg: 'bg-[#F0FDF4]',
    border: 'border-[#86EFAC]',
  },
  {
    label: 'الجدول',
    icon: Settings,
    keys: ['schedule:view'],
    color: 'text-[#D97706]',
    bg: 'bg-[#FFFBEB]',
    border: 'border-[#FDE68A]',
  },
];

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

/* ─── page ──────────────────────────────────────────────────── */
export default function AdminSecretaryDetailsPage() {
  const { secretaryId } = useParams<{ secretaryId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  /* Try state first, then fallback to fetching list */
  const locationSecretary = (location.state as { secretary?: AdminSecretarySummary })?.secretary;
  const { data: listData, isLoading } = useAdminSecretariesList({ limit: 100 });
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
            : 'ملف السكرتير • LMJ Health'}
        </title>
      </Helmet>

      <div
        dir='rtl'
        lang='ar'
      >
        {/* breadcrumb */}
        <button
          type='button'
          onClick={() => navigate('/admin/secretaries')}
          className='mb-5 inline-flex items-center gap-2 font-cairo text-[12px] font-extrabold text-[#667085] transition hover:text-primary'
        >
          <ArrowRight className='h-4 w-4' />
          العودة إلى قائمة السكرتارية
        </button>

        {/* header */}
        <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
          <div className='flex items-center gap-4'>
            <div className='flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-primary to-primary/70 text-white shadow-md'>
              <Users className='h-8 w-8' />
            </div>
            <div>
              {isLoading && !secretary ? (
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
                    حساب سكرتير • المعرّف: {secretaryId}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className='flex gap-2'>
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
              المواعيد
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
              إدارة المواعيد
            </button>
            {userId && (
              <button
                type='button'
                onClick={() => setOffboardOpen(true)}
                className='flex h-9 items-center gap-1.5 rounded-[10px] border border-[#FECACA] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#DC2626] hover:bg-[#FEF2F2]'
              >
                <UserMinus className='h-4 w-4' />
                إيقاف الحساب
              </button>
            )}
          </div>
        </div>

        {/* ── content grid ── */}
        <div className='mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3'>

          {/* left: contact + doctor */}
          <div className='flex flex-col gap-5'>

            {/* contact info */}
            <div className='rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
              <h3 className='mb-4 font-cairo text-[13px] font-extrabold text-[#111827]'>
                معلومات التواصل
              </h3>
              <div className='space-y-3'>
                {secretary?.user?.email && (
                  <div className='flex items-center justify-between rounded-[8px] bg-[#F9FAFB] px-4 py-3'>
                    <div className='flex items-center gap-2 text-[#667085]'>
                      <Mail className='h-4 w-4 text-primary' />
                      <span className='font-cairo text-[12px] font-bold'>البريد الإلكتروني</span>
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
                      <span className='font-cairo text-[12px] font-bold'>رقم الهاتف</span>
                    </div>
                    <span className='font-cairo text-[12px] font-extrabold text-[#111827]'>
                      {secretary.user.phone}
                    </span>
                  </div>
                )}
                {secretary?.user?.gender && (
                  <div className='flex items-center justify-between rounded-[8px] bg-[#F9FAFB] px-4 py-3'>
                    <span className='font-cairo text-[12px] font-bold text-[#667085]'>الجنس</span>
                    <span className='font-cairo text-[12px] font-extrabold text-[#111827]'>
                      {secretary.user.gender === 'Female' ? 'أنثى' : 'ذكر'}
                    </span>
                  </div>
                )}
                {!secretary?.user?.email && !secretary?.user?.phone && !isLoading && (
                  <div className='font-cairo text-[12px] text-[#98A2B3]'>
                    لا توجد بيانات تواصل
                  </div>
                )}
              </div>
            </div>

            {/* assigned doctor */}
            <div className='rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
              <h3 className='mb-4 font-cairo text-[13px] font-extrabold text-[#111827]'>
                الطبيب المسؤول
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
                      {secretary.doctor.approvalStatus === 'approved' ? 'معتمد' : 'غير معتمد'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className='rounded-[10px] border border-[#EEF2F6] bg-[#F9FAFB] px-4 py-5 text-center font-cairo text-[12px] text-[#98A2B3]'>
                  غير مرتبط بطبيب
                </div>
              )}
            </div>
          </div>

          {/* right: permissions (spans 2 cols) */}
          <div className='xl:col-span-2 rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
            <div className='mb-5 flex items-center justify-between'>
              <h3 className='font-cairo text-[13px] font-extrabold text-[#111827]'>
                الصلاحيات الممنوحة
              </h3>
              <span className='rounded-full bg-[#E7FBFA] px-3 py-1 font-cairo text-[11px] font-extrabold text-primary'>
                {perms.length} صلاحية
              </span>
            </div>

            {perms.length === 0 ? (
              <div className='flex flex-col items-center gap-2 py-10 text-center'>
                <Settings className='h-8 w-8 text-[#D0D5DD]' />
                <span className='font-cairo text-[13px] font-bold text-[#98A2B3]'>
                  لا توجد صلاحيات مضافة
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
        targetLabel={secretary?.user?.fullName ?? 'هذا الحساب'}
        onSuccess={() => navigate('/admin/secretaries')}
      />
    </>
  );
}
