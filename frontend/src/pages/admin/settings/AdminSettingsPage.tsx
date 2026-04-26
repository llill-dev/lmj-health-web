import type { ChangeEvent, ComponentType, ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { CloudUpload, Settings } from 'lucide-react';
import { get } from '@/lib/base';
import { adminApi } from '@/lib/admin/client';
import { notificationsApi } from '@/lib/notifications/client';
import { useAdminAppSettings } from '@/contexts/AdminAppSettingsContext';
import { ConfirmActionDialog } from '@/components/admin/dialogs';

type SectionState = 'idle' | 'saved';
type SaveStates = Record<'general' | 'logo', SectionState>;

type HealthResponse = {
  ok?: boolean;
  status?: string;
  storage?: string;
};

function SectionCard({
  title,
  icon: Icon,
  children,
  className = '',
}: {
  title: string;
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`overflow-hidden rounded-[14px] border border-[#EAECF0] bg-white shadow-[0_10px_24px_rgba(0,0,0,0.05)] ${className}`}
    >
      <div className='flex justify-between items-center px-6 py-4 md:px-7'>
        <div className='flex gap-2 items-center text-right'>
          <div className='flex h-7 w-7 items-center justify-center rounded-[8px] bg-primary/10'>
            <Icon className='w-4 h-4 text-primary' />
          </div>
          <div className='font-cairo text-[14px] font-black text-[#111827]'>
            {title}
          </div>
        </div>
      </div>
      <div className='border-t border-[#EAECF0] px-6 py-5 md:px-7'>
        {children}
      </div>
    </section>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className='space-y-2'>
      <div className='text-right font-cairo text-[12px] font-bold text-[#344054]'>
        {label}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className='h-[40px] w-full rounded-[8px] border border-[#EAECF0] bg-white px-4 font-cairo text-[12px] font-semibold text-[#111827] outline-none placeholder:font-cairo placeholder:font-medium placeholder:text-[#98A2B3] focus:border-[#BFEDEC] focus:ring-2 focus:ring-[#16C5C020]'
      />
    </div>
  );
}

export default function AdminSettingsPage() {
  const { settings, setSettings, applyGeneral } = useAdminAppSettings();
  const [draftGeneral, setDraftGeneral] = useState(() => settings.general);
  const [confirmGeneralOpen, setConfirmGeneralOpen] = useState(false);
  const [logoConfirmOpen, setLogoConfirmOpen] = useState(false);
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);
  const [saveStates, setSaveStates] = useState<SaveStates>({
    general: 'idle',
    logo: 'idle',
  });
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setDraftGeneral(settings.general);
  }, [settings.general.appName, settings.general.appDescription]);

  const weekRange = useMemo(() => {
    const to = new Date();
    const from = new Date(to);
    from.setDate(to.getDate() - 7);
    return { from: from.toISOString(), to: to.toISOString() };
  }, []);

  const healthQuery = useQuery({
    queryKey: ['admin', 'settings', 'health'],
    queryFn: () => get<HealthResponse>('/api/health', { locale: 'ar' }),
    staleTime: 60_000,
    retry: 1,
  });

  const unreadNotificationsQuery = useQuery({
    queryKey: ['admin', 'settings', 'notifications-unread'],
    queryFn: () =>
      notificationsApi.list({
        unread_only: true,
        page: 1,
        limit: 1,
      }),
    staleTime: 20_000,
    retry: 1,
  });

  const auditSummaryQuery = useQuery({
    queryKey: [
      'admin',
      'settings',
      'audit-summary',
      weekRange.from,
      weekRange.to,
    ],
    queryFn: () =>
      adminApi.auditLogs.list({
        page: 1,
        limit: 1,
        from: weekRange.from,
        to: weekRange.to,
      }),
    staleTime: 60_000,
    retry: 1,
  });

  /** شكل الرد الموثَّق في API-3.pdf: total + notifications[] */
  const unreadCount =
    unreadNotificationsQuery.data?.total ??
    unreadNotificationsQuery.data?.notifications?.filter((n) => !n.isRead)
      .length ??
    0;
  const weeklyAuditCount = auditSummaryQuery.data?.total ?? 0;

  function markSaved(section: keyof SaveStates) {
    setSaveStates((prev) => ({ ...prev, [section]: 'saved' }));
    window.setTimeout(() => {
      setSaveStates((prev) => ({ ...prev, [section]: 'idle' }));
    }, 2200);
  }

  function commitGeneralFromDraft() {
    applyGeneral({
      appName: draftGeneral.appName,
      appDescription: draftGeneral.appDescription,
    });
    markSaved('general');
  }

  function handleLogoPick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (file.type !== 'image/png') {
      return;
    }

    setPendingLogoFile(file);
    setLogoConfirmOpen(true);
  }

  function applyPendingLogo(): Promise<void> {
    const file = pendingLogoFile;
    if (!file) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === 'string') {
          setSettings((prev) => ({
            ...prev,
            logo: { ...prev.logo, dataUrl: result },
          }));
          markSaved('logo');
        }
        setPendingLogoFile(null);
        resolve();
      };
      reader.onerror = () => reject(new Error('فشل قراءة الملف'));
      reader.readAsDataURL(file);
    });
  }

  function triggerLogoUpload() {
    logoInputRef.current?.click();
  }

  return (
    <>
      <Helmet>
        <title>الإعدادات • {settings.general.appName}</title>
      </Helmet>

      <div
        dir='rtl'
        lang='ar'
        className='min-h-[520px] bg-[#FCFDFE]'
      >
        <div className='mx-auto w-full max-w-[1320px] px-4 pb-10 pt-2 sm:px-6 lg:px-10'>
          <section className='grid grid-cols-1 gap-3 mb-6 md:grid-cols-3'>
            <div className='rounded-[12px] border border-[#E8EDF2] bg-white px-5 py-4 text-right shadow-[0_8px_20px_rgba(0,0,0,0.04)]'>
              <div className='font-cairo text-[11px] font-semibold text-[#98A2B3]'>
                حالة النظام (API/Storage)
              </div>
              <div className='mt-2 font-cairo text-[14px] font-black text-[#111827]'>
                {healthQuery.isLoading
                  ? 'جارِ الفحص...'
                  : healthQuery.isError
                    ? 'غير متاح'
                    : `${healthQuery.data?.status ?? '—'} / ${healthQuery.data?.storage ?? '—'}`}
              </div>
            </div>

            <div className='rounded-[12px] border border-[#E8EDF2] bg-white px-5 py-4 text-right shadow-[0_8px_20px_rgba(0,0,0,0.04)]'>
              <div className='font-cairo text-[11px] font-semibold text-[#98A2B3]'>
                إشعارات غير مقروءة (GET /notifications)
              </div>
              <div className='mt-2 font-cairo text-[14px] font-black text-[#111827]'>
                {unreadNotificationsQuery.isLoading
                  ? 'جارِ التحميل...'
                  : unreadCount}
              </div>
            </div>

            <div className='rounded-[12px] border border-[#E8EDF2] bg-white px-5 py-4 text-right shadow-[0_8px_20px_rgba(0,0,0,0.04)]'>
              <div className='font-cairo text-[11px] font-semibold text-[#98A2B3]'>
                سجلات التدقيق (آخر 7 أيام)
              </div>
              <div className='mt-2 font-cairo text-[14px] font-black text-[#111827]'>
                {auditSummaryQuery.isLoading
                  ? 'جارِ التحميل...'
                  : weeklyAuditCount}
              </div>
            </div>
          </section>

          <div className='grid grid-cols-1 gap-6 xl:grid-cols-12'>
            <SectionCard
              title='الإعدادات العامة'
              icon={Settings}
              className='xl:col-span-7'
            >
              <div className='space-y-4'>
                <Field
                  label='اسم التطبيق'
                  value={draftGeneral.appName}
                  onChange={(v) =>
                    setDraftGeneral((d) => ({ ...d, appName: v }))
                  }
                />
                <Field
                  label='وصف التطبيق'
                  value={draftGeneral.appDescription}
                  onChange={(v) =>
                    setDraftGeneral((d) => ({ ...d, appDescription: v }))
                  }
                />
                <div className='flex justify-start pt-1'>
                  <button
                    type='button'
                    onClick={() => setConfirmGeneralOpen(true)}
                    className='inline-flex h-[34px] items-center gap-2 rounded-[8px] bg-primary px-5 font-cairo text-[12px] font-extrabold text-white shadow-[0_12px_24px_rgba(15,143,139,0.20)]'
                  >
                    حفظ التغييرات
                  </button>
                </div>
                {saveStates.general === 'saved' ? (
                  <div className='text-right font-cairo text-[11px] font-semibold text-[#16A34A]'>
                    تم الحفظ محلياً في المتصفح
                  </div>
                ) : null}
              </div>
            </SectionCard>

            <SectionCard
              title='شعار التطبيق'
              icon={CloudUpload}
              className='xl:col-span-5'
            >
              <div className='flex flex-col gap-5 items-start sm:flex-row sm:items-center'>
                <div className='flex min-h-[96px] min-w-[96px] shrink-0 items-center justify-center rounded-[10px] bg-primary text-white shadow-[0_14px_30px_rgba(15,143,139,0.25)]'>
                  {settings.logo.dataUrl ? (
                    <img
                      src={settings.logo.dataUrl}
                      alt='App Logo'
                      className='h-[96px] w-[96px] rounded-[6px] object-cover'
                    />
                  ) : (
                    <div className='px-8 font-cairo text-[25px] font-black leading-[36px]'>
                      {settings.logo.initials}
                    </div>
                  )}
                </div>
                <div className='w-full sm:w-auto'>
                  <button
                    type='button'
                    onClick={triggerLogoUpload}
                    className='inline-flex h-[36px] items-center gap-2 rounded-[8px] border border-primary bg-white px-2 font-cairo text-[12px] font-extrabold text-primary'
                  >
                    تحميل شعار جديد
                  </button>
                  <input
                    ref={logoInputRef}
                    type='file'
                    accept='image/png'
                    onChange={handleLogoPick}
                    className='hidden'
                  />
                  <div className='mt-2 text-right font-cairo text-[11px] font-medium text-[#98A2B3]'>
                    الحجم المفضل 512×512 • صيغة (PNG)
                  </div>
                  {saveStates.logo === 'saved' ? (
                    <div className='mt-1 text-right font-cairo text-[11px] font-semibold text-[#16A34A]'>
                      تم حفظ الشعار محلياً
                    </div>
                  ) : null}
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>

      <ConfirmActionDialog
        open={confirmGeneralOpen}
        onOpenChange={setConfirmGeneralOpen}
        variant='primary'
        title='تأكيد حفظ الإعدادات العامة'
        icon={<Settings className='h-6 w-6' strokeWidth={2} aria-hidden />}
        description={
          <>
            سيتُحدَّث الشريط الجانبي مباشرة بقيم:{' '}
            <span className='font-extrabold text-[#344054]'>اسم التطبيق</span> و
            <span className='font-extrabold text-[#344054]'>الوصف</span>، وتُحفظان محلياً
            عبر
            {` `}
            <span className='font-extrabold'>localStorage</span> ليبقيا بعد إعادة تحميل
            الصفحة.
          </>
        }
        cancelLabel='ليس الآن'
        confirmLabel='نعم، احفظ'
        onConfirm={async () => {
          commitGeneralFromDraft();
        }}
        successToast={{
          title: 'تم حفظ الإعدادات',
          message: 'تم تطبيق اسم التطبيق والوصف في الشريط الجانبي.',
          variant: 'success',
        }}
      />

      <ConfirmActionDialog
        open={logoConfirmOpen}
        onOpenChange={(o) => {
          setLogoConfirmOpen(o);
          if (!o) setPendingLogoFile(null);
        }}
        variant='primary'
        title='تأكيد تغيير شعار التطبيق؟'
        icon={<CloudUpload className='h-6 w-6' strokeWidth={2} aria-hidden />}
        description='سيُستبدل الشعار الحالي بالصورة التي اخترتها (PNG) ويُحفظ محلياً ليظهر في الشريط والهوية داخل اللوحة.'
        cancelLabel='إلغاء'
        confirmLabel='نعم، استخدم هذا الشعار'
        onConfirm={() => applyPendingLogo()}
        successToast={{
          title: 'تم تحديث الشعار',
          message:
            'يظهر شعارك الجديد فوراً في واجهة الإعدادات. احفظ نسخة احتياطية من الملف عند الحاجة.',
          variant: 'success',
        }}
      />
    </>
  );
}
