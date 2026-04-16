import type { ChangeEvent, ComponentType, ReactNode } from 'react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import {
  Bell,
  CloudUpload,
  Settings,
} from 'lucide-react';
import { get } from '@/lib/base';
import { adminApi } from '@/lib/admin/client';

type AdminLocalSettings = {
  general: {
    appName: string;
    appDescription: string;
  };
  logo: {
    initials: string;
    dataUrl: string | null;
  };
  notifications: {
    appointments: boolean;
    registrations: boolean;
    requests: boolean;
  };
};

type SectionState = 'idle' | 'saved';
type SaveStates = Record<'general' | 'logo', SectionState>;

type HealthResponse = {
  ok?: boolean;
  status?: string;
  storage?: string;
};

type NotificationsListResponse = {
  page?: number;
  limit?: number;
  total?: number;
  results?: number;
  notifications?: unknown[];
};

const SETTINGS_STORAGE_KEY = 'admin.settings.v1';

const DEFAULT_SETTINGS: AdminLocalSettings = {
  general: {
    appName: 'LMJ HEALTH',
    appDescription: 'منصة طبية متكاملة',
  },
  logo: {
    initials: 'LMJ',
    dataUrl: null,
  },
  notifications: {
    appointments: true,
    registrations: true,
    requests: true,
  },
};

function loadSettingsFromStorage(): AdminLocalSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;

  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AdminLocalSettings>;
    return {
      general: {
        ...DEFAULT_SETTINGS.general,
        ...(parsed.general ?? {}),
      },
      logo: {
        ...DEFAULT_SETTINGS.logo,
        ...(parsed.logo ?? {}),
      },
      notifications: {
        ...DEFAULT_SETTINGS.notifications,
        ...(parsed.notifications ?? {}),
      },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  const id = useId();

  return (
    <input
      id={id}
      type='checkbox'
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      disabled={disabled}
      className={
        disabled
          ? "relative h-[18px] w-[34px] cursor-not-allowed appearance-none rounded-full bg-[#E5E7EB] opacity-70 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:h-[14px] after:w-[14px] after:rounded-full after:bg-white after:shadow-[0_4px_10px_rgba(0,0,0,0.12)]"
          : "relative h-[18px] w-[34px] cursor-pointer appearance-none rounded-full bg-[#E5E7EB] transition-[background-color,box-shadow] duration-300 ease-smooth after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:h-[14px] after:w-[14px] after:rounded-full after:bg-white after:shadow-[0_4px_10px_rgba(0,0,0,0.14)] after:transition-[left,background-color,box-shadow] after:duration-300 after:ease-smooth checked:bg-primary checked:shadow-[0_10px_20px_rgba(15,143,139,0.25)] checked:after:left-[18px] checked:after:bg-[#F2FFFE]"
      }
      aria-checked={checked}
    />
  );
}

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
    <section className={`overflow-hidden rounded-[14px] border border-[#EAECF0] bg-white shadow-[0_10px_24px_rgba(0,0,0,0.05)] ${className}`}>
      <div className='flex items-center justify-between px-6 py-4 md:px-7'>
        <div className='flex items-center gap-2 text-right'>
          <div className='flex h-7 w-7 items-center justify-center rounded-[8px] bg-primary/10'>
            <Icon className='h-4 w-4 text-primary' />
          </div>
          <div className='font-cairo text-[14px] font-black text-[#111827]'>
            {title}
          </div>
        </div>
      </div>
      <div className='border-t border-[#EAECF0] px-6 py-5 md:px-7'>{children}</div>
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
  const [settings, setSettings] = useState<AdminLocalSettings>(loadSettingsFromStorage);
  const [saveStates, setSaveStates] = useState<SaveStates>({
    general: 'idle',
    logo: 'idle',
  });
  const logoInputRef = useRef<HTMLInputElement | null>(null);

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
      get<NotificationsListResponse>('/api/notifications?unread_only=true&page=1&limit=1', {
        locale: 'ar',
      }),
    staleTime: 20_000,
    retry: 1,
  });

  const auditSummaryQuery = useQuery({
    queryKey: ['admin', 'settings', 'audit-summary', weekRange.from, weekRange.to],
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

  useEffect(() => {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const unreadCount =
    unreadNotificationsQuery.data?.total ??
    unreadNotificationsQuery.data?.results ??
    unreadNotificationsQuery.data?.notifications?.length ??
    0;
  const weeklyAuditCount = auditSummaryQuery.data?.total ?? 0;

  function markSaved(section: keyof SaveStates) {
    setSaveStates((prev) => ({ ...prev, [section]: 'saved' }));
    window.setTimeout(() => {
      setSaveStates((prev) => ({ ...prev, [section]: 'idle' }));
    }, 2200);
  }

  function handleGeneralSave() {
    const initials = settings.general.appName.trim().slice(0, 3).toUpperCase() || 'LMJ';
    setSettings((prev) => ({
      ...prev,
      logo: prev.logo.dataUrl ? prev.logo : { ...prev.logo, initials },
    }));
    markSaved('general');
  }

  function handleLogoPick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'image/png') {
      return;
    }

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
    };
    reader.readAsDataURL(file);
  }

  function triggerLogoUpload() {
    logoInputRef.current?.click();
  }

  return (
    <>
      <Helmet>
        <title>الإعدادات • LMJ Health</title>
      </Helmet>

      <div
        dir='rtl'
        lang='ar'
        className='min-h-[520px] bg-[#FCFDFE]'
      >
        <div className='mx-auto w-full max-w-[1320px] px-4 pb-10 pt-2 sm:px-6 lg:px-10'>
          <section className='mb-6 grid grid-cols-1 gap-3 md:grid-cols-3'>
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
                إشعارات غير مقروءة (من API)
              </div>
              <div className='mt-2 font-cairo text-[14px] font-black text-[#111827]'>
                {unreadNotificationsQuery.isLoading ? 'جارِ التحميل...' : unreadCount}
              </div>
            </div>

            <div className='rounded-[12px] border border-[#E8EDF2] bg-white px-5 py-4 text-right shadow-[0_8px_20px_rgba(0,0,0,0.04)]'>
              <div className='font-cairo text-[11px] font-semibold text-[#98A2B3]'>
                سجلات التدقيق (آخر 7 أيام)
              </div>
              <div className='mt-2 font-cairo text-[14px] font-black text-[#111827]'>
                {auditSummaryQuery.isLoading ? 'جارِ التحميل...' : weeklyAuditCount}
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
                  value={settings.general.appName}
                  onChange={(v) =>
                    setSettings((prev) => ({
                      ...prev,
                      general: { ...prev.general, appName: v },
                    }))
                  }
                />
                <Field
                  label='وصف التطبيق'
                  value={settings.general.appDescription}
                  onChange={(v) =>
                    setSettings((prev) => ({
                      ...prev,
                      general: { ...prev.general, appDescription: v },
                    }))
                  }
                />
                <div className='flex justify-start pt-1'>
                  <button
                    type='button'
                    onClick={handleGeneralSave}
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
              <div className='flex flex-col items-start gap-5 sm:flex-row sm:items-center'>
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

            <SectionCard
              title='إعدادات الإشعارات'
              icon={Bell}
              className='xl:col-span-12'
            >
              <div className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                  <div className='flex items-center justify-between rounded-[10px] border border-[#EEF2F6] bg-[#F8FAFC] px-4 py-4'>
                    <div className='text-right'>
                      <div className='font-cairo text-[12px] font-extrabold text-[#111827]'>
                        إشعارات المواعيد
                      </div>
                      <div className='mt-1 font-cairo text-[11px] font-medium text-[#98A2B3]'>
                        إرسال تذكير للمواعيد
                      </div>
                    </div>
                    <Toggle
                      checked={settings.notifications.appointments}
                      onChange={(v) =>
                        setSettings((prev) => ({
                          ...prev,
                          notifications: { ...prev.notifications, appointments: v },
                        }))
                      }
                    />
                  </div>

                  <div className='flex items-center justify-between rounded-[10px] border border-[#EEF2F6] bg-[#F8FAFC] px-4 py-4'>
                    <div className='text-right'>
                      <div className='font-cairo text-[12px] font-extrabold text-[#111827]'>
                        إشعارات التسجيل
                      </div>
                      <div className='mt-1 font-cairo text-[11px] font-medium text-[#98A2B3]'>
                        إشعار عند تسجيل مستخدم جديد
                      </div>
                    </div>
                    <Toggle
                      checked={settings.notifications.registrations}
                      onChange={(v) =>
                        setSettings((prev) => ({
                          ...prev,
                          notifications: { ...prev.notifications, registrations: v },
                        }))
                      }
                    />
                  </div>

                  <div className='flex items-center justify-between rounded-[10px] border border-[#EEF2F6] bg-[#F8FAFC] px-4 py-4'>
                    <div className='text-right'>
                      <div className='font-cairo text-[12px] font-extrabold text-[#111827]'>
                        إشعارات الطلبات
                      </div>
                      <div className='mt-1 font-cairo text-[11px] font-medium text-[#98A2B3]'>
                        إشعار عند طلب جديد أو قبول جديد
                      </div>
                    </div>
                    <Toggle
                      checked={settings.notifications.requests}
                      onChange={(v) =>
                        setSettings((prev) => ({
                          ...prev,
                          notifications: { ...prev.notifications, requests: v },
                        }))
                      }
                    />
                  </div>
                </div>

                <div className='rounded-[10px] border border-[#E8EDF2] bg-[#FCFDFE] px-4 py-3 text-right font-cairo text-[11px] font-semibold text-[#98A2B3]'>
                  هذه التبديلات محفوظة محلياً حالياً، بينما عداد الإشعارات أعلى الصفحة مرتبط مباشرةً مع API.
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </>
  );
}
