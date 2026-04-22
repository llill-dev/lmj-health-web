import type { ChangeEvent, ComponentType, ReactNode } from 'react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  CloudUpload,
  Loader2,
  Settings,
} from 'lucide-react';
import { get } from '@/lib/base';
import { adminApi } from '@/lib/admin/client';
import {
  notificationsApi,
  notificationItemId,
} from '@/lib/notifications/client';

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

const SETTINGS_STORAGE_KEY = 'admin.settings.v1';
const NOTIFICATIONS_PAGE_SIZE = 20;

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
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<AdminLocalSettings>(
    loadSettingsFromStorage,
  );
  const [saveStates, setSaveStates] = useState<SaveStates>({
    general: 'idle',
    logo: 'idle',
  });
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const [notificationsPage, setNotificationsPage] = useState(1);
  const [notificationsUnreadOnly, setNotificationsUnreadOnly] = useState(false);
  const [selectedNotificationIds, setSelectedNotificationIds] = useState<
    Set<string>
  >(() => new Set());

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

  const notificationsListQuery = useQuery({
    queryKey: [
      'admin',
      'settings',
      'notifications-list',
      notificationsPage,
      NOTIFICATIONS_PAGE_SIZE,
      notificationsUnreadOnly,
    ],
    queryFn: () =>
      notificationsApi.list({
        page: notificationsPage,
        limit: NOTIFICATIONS_PAGE_SIZE,
        unread_only: notificationsUnreadOnly ? true : undefined,
      }),
    staleTime: 15_000,
    retry: 1,
  });

  const invalidateNotificationQueries = () =>
    Promise.all([
      queryClient.invalidateQueries({
        queryKey: ['admin', 'settings', 'notifications-unread'],
      }),
      queryClient.invalidateQueries({
        queryKey: ['admin', 'settings', 'notifications-list'],
      }),
    ]);

  const markAllNotificationsReadMutation = useMutation({
    mutationFn: () => notificationsApi.readAll(),
    onSuccess: invalidateNotificationQueries,
  });

  const markOneNotificationReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.readOne(id),
    onSuccess: invalidateNotificationQueries,
  });

  const markBatchNotificationsReadMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const settled = await Promise.allSettled(
        ids.map((id) => notificationsApi.readOne(id)),
      );
      const failed = settled.filter((r) => r.status === 'rejected').length;
      if (failed === ids.length) {
        throw new Error('batch_all_failed');
      }
      return { updated: ids.length - failed, failed };
    },
    onSuccess: async () => {
      setSelectedNotificationIds(new Set());
      await invalidateNotificationQueries();
    },
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

  useEffect(() => {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    setNotificationsPage(1);
  }, [notificationsUnreadOnly]);

  useEffect(() => {
    setSelectedNotificationIds(new Set());
  }, [notificationsPage, notificationsUnreadOnly]);

  const notificationRows = notificationsListQuery.data?.notifications ?? [];
  const notificationsTotal = notificationsListQuery.data?.total ?? 0;
  const notificationsTotalPages = Math.max(
    1,
    Math.ceil(notificationsTotal / NOTIFICATIONS_PAGE_SIZE) || 1,
  );

  const unreadIdsOnPage = useMemo(() => {
    const ids: string[] = [];
    for (const n of notificationRows) {
      if (n.isRead) continue;
      const id = notificationItemId(n);
      if (id) ids.push(id);
    }
    return ids;
  }, [notificationRows]);

  function toggleNotificationSelected(id: string) {
    setSelectedNotificationIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllUnreadOnPage() {
    setSelectedNotificationIds(new Set(unreadIdsOnPage));
  }

  function clearNotificationSelection() {
    setSelectedNotificationIds(new Set());
  }

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

  function handleGeneralSave() {
    const initials =
      settings.general.appName.trim().slice(0, 3).toUpperCase() || 'LMJ';
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

            <SectionCard
              title='الإشعارات'
              icon={Bell}
              className='xl:col-span-12'
            >
              <div className='space-y-5'>
                <div className='flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between'>
                  <div className='flex flex-wrap gap-2'>
                    <button
                      type='button'
                      onClick={() => setNotificationsUnreadOnly(false)}
                      className={`inline-flex h-[36px] items-center rounded-[8px] px-4 font-cairo text-[12px] font-extrabold transition ${
                        !notificationsUnreadOnly
                          ? 'bg-primary text-white shadow-[0_8px_20px_rgba(15,143,139,0.22)]'
                          : 'border border-[#EAECF0] bg-white text-[#344054]'
                      }`}
                    >
                      الكل
                    </button>
                    <button
                      type='button'
                      onClick={() => setNotificationsUnreadOnly(true)}
                      className={`inline-flex h-[36px] items-center rounded-[8px] px-4 font-cairo text-[12px] font-extrabold transition ${
                        notificationsUnreadOnly
                          ? 'bg-primary text-white shadow-[0_8px_20px_rgba(15,143,139,0.22)]'
                          : 'border border-[#EAECF0] bg-white text-[#344054]'
                      }`}
                    >
                      غير المقروء فقط
                    </button>
                  </div>
                  <div className='flex flex-wrap gap-2'>
                    <button
                      type='button'
                      disabled={selectedNotificationIds.size === 0}
                      onClick={clearNotificationSelection}
                      className='inline-flex h-[36px] items-center justify-center rounded-[8px] border border-[#D0D5DD] bg-white px-3 font-cairo text-[12px] font-bold text-[#344054] disabled:cursor-not-allowed disabled:opacity-50'
                    >
                      إلغاء التحديد
                    </button>

                    <button
                      type='button'
                      disabled={markAllNotificationsReadMutation.isPending}
                      onClick={() => markAllNotificationsReadMutation.mutate()}
                      className='inline-flex h-[36px] shrink-0 items-center justify-center rounded-[8px] border border-primary bg-white px-4 font-cairo text-[12px] font-extrabold text-primary disabled:cursor-not-allowed disabled:opacity-60'
                    >
                      {markAllNotificationsReadMutation.isPending ? (
                        <Loader2
                          className='w-4 h-4 animate-spin'
                          aria-hidden
                        />
                      ) : null}
                      تعليم الكل كمقروء
                    </button>
                  </div>
                </div>

                {markBatchNotificationsReadMutation.isError ? (
                  <p className='text-right font-cairo text-[11px] font-semibold text-red-600'>
                    تعذر تعليم المجموعة المحددة بالكامل. تحقق من الشبكة أو حاول
                    مجدداً.
                  </p>
                ) : null}
                {markBatchNotificationsReadMutation.isSuccess ? (
                  <p className='text-right font-cairo text-[11px] font-semibold text-[#16A34A]'>
                    تم تحديث{' '}
                    {markBatchNotificationsReadMutation.data?.updated ?? '—'}{' '}
                    إشعاراً
                    {(markBatchNotificationsReadMutation.data?.failed ?? 0) > 0
                      ? ` (تعذر تحديث ${markBatchNotificationsReadMutation.data?.failed})`
                      : ''}
                    .
                  </p>
                ) : null}
                {markAllNotificationsReadMutation.isError ? (
                  <p className='text-right font-cairo text-[11px] font-semibold text-red-600'>
                    تعذر تعليم الكل. تحقق من الجلسة أو حاول لاحقاً.
                  </p>
                ) : null}

                <div className='rounded-[12px] border border-[#EEF2F6] bg-[#F9FAFB]'>
                  {notificationsListQuery.isLoading ? (
                    <div className='flex items-center justify-center gap-2 px-4 py-16 font-cairo text-[13px] font-semibold text-[#667085]'>
                      <Loader2
                        className='w-5 h-5 animate-spin text-primary'
                        aria-hidden
                      />
                      جارِ تحميل الإشعارات...
                    </div>
                  ) : notificationsListQuery.isError ? (
                    <div className='px-4 py-12 text-center font-cairo text-[13px] font-semibold text-red-700'>
                      تعذر تحميل القائمة.
                    </div>
                  ) : notificationRows.length === 0 ? (
                    <div className='px-4 py-12 text-center font-cairo text-[13px] font-semibold text-[#667085]'>
                      لا توجد إشعارات في هذا العرض.
                    </div>
                  ) : (
                    <ul className='divide-y divide-[#EEF2F6]'>
                      {notificationRows.map((item, index) => {
                        const nid = notificationItemId(item);
                        const unread = !item.isRead;
                        const selected =
                          nid != null && selectedNotificationIds.has(nid);
                        const rowPending =
                          markOneNotificationReadMutation.isPending &&
                          markOneNotificationReadMutation.variables === nid;
                        return (
                          <li
                            key={
                              nid ??
                              `notification-${notificationsPage}-${index}`
                            }
                            className={`flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4 ${
                              unread ? 'bg-white' : 'bg-[#FAFAFA]'
                            }`}
                          >
                            <div className='flex flex-1 gap-3 min-w-0'>
                              {unread && nid ? (
                                <input
                                  type='checkbox'
                                  className='mt-1 h-4 w-4 shrink-0 rounded border-[#D0D5DD] text-primary focus:ring-primary'
                                  checked={selected}
                                  onChange={() =>
                                    toggleNotificationSelected(nid)
                                  }
                                  aria-label='تحديد الإشعار'
                                />
                              ) : (
                                <span className='mt-1 w-4 shrink-0' />
                              )}
                              <div className='flex-1 min-w-0 text-right'>
                                <div className='flex flex-wrap gap-2 justify-end items-center'>
                                  <span
                                    className={`inline-flex rounded-full px-2.5 py-0.5 font-cairo text-[10px] font-extrabold ${
                                      unread
                                        ? 'bg-[#E6F4F3] text-primary'
                                        : 'bg-[#E5E7EB] text-[#4B5563]'
                                    }`}
                                  >
                                    {unread ? 'غير مقروء' : 'مقروء'}
                                  </span>
                                </div>
                                <div className='mt-1 font-cairo text-[13px] font-extrabold text-[#111827]'>
                                  {item.title?.trim() || '—'}
                                </div>
                                {item.body ? (
                                  <p className='mt-1 line-clamp-3 font-cairo text-[12px] font-medium leading-relaxed text-[#667085]'>
                                    {item.body}
                                  </p>
                                ) : null}
                                {nid ? (
                                  <p
                                    className='mt-2 font-mono text-[10px] text-[#98A2B3]'
                                    dir='ltr'
                                  >
                                    {nid}
                                  </p>
                                ) : null}
                              </div>
                            </div>
                            <div className='flex justify-end shrink-0 sm:pt-0'>
                              {unread && nid ? (
                                <button
                                  type='button'
                                  disabled={rowPending}
                                  onClick={() =>
                                    markOneNotificationReadMutation.mutate(nid)
                                  }
                                  className='inline-flex h-[34px] items-center justify-center gap-1.5 rounded-[8px] border border-[#0F8F8B] bg-white px-3 font-cairo text-[11px] font-extrabold text-[#0F8F8B] transition hover:bg-[#E6F4F3] disabled:cursor-not-allowed disabled:opacity-60'
                                >
                                  {rowPending ? (
                                    <Loader2
                                      className='h-3.5 w-3.5 animate-spin'
                                      aria-hidden
                                    />
                                  ) : null}
                                  تعليم كمقروء
                                </button>
                              ) : null}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                {notificationRows.length > 0 ? (
                  <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                    <p className='text-right font-cairo text-[12px] font-semibold text-[#667085]'>
                      الصفحة {notificationsPage} من {notificationsTotalPages} —
                      إجمالي{' '}
                      <span
                        dir='ltr'
                        className='inline font-mono'
                      >
                        {notificationsTotal}
                      </span>
                    </p>
                    <div className='flex gap-2 justify-end'>
                      <button
                        type='button'
                        disabled={
                          notificationsPage <= 1 ||
                          notificationsListQuery.isFetching
                        }
                        onClick={() =>
                          setNotificationsPage((p) => Math.max(1, p - 1))
                        }
                        className='inline-flex h-[36px] items-center gap-1 rounded-[8px] border border-[#D0D5DD] bg-white px-3 font-cairo text-[12px] font-bold text-[#344054] disabled:cursor-not-allowed disabled:opacity-50'
                      >
                        <ChevronRight
                          className='w-4 h-4'
                          aria-hidden
                        />
                        السابق
                      </button>
                      <button
                        type='button'
                        disabled={
                          notificationsPage >= notificationsTotalPages ||
                          notificationsListQuery.isFetching
                        }
                        onClick={() =>
                          setNotificationsPage((p) =>
                            Math.min(notificationsTotalPages, p + 1),
                          )
                        }
                        className='inline-flex h-[36px] items-center gap-1 rounded-[8px] border border-[#D0D5DD] bg-white px-3 font-cairo text-[12px] font-bold text-[#344054] disabled:cursor-not-allowed disabled:opacity-50'
                      >
                        التالي
                        <ChevronLeft
                          className='w-4 h-4'
                          aria-hidden
                        />
                      </button>
                    </div>
                  </div>
                ) : null}

                <div className='rounded-[10px] border border-[#E8EDF2] bg-[#FCFDFE] px-4 py-3 text-right font-cairo text-[11px] font-semibold leading-relaxed text-[#98A2B3]'>
                  لم يُعرّف مسار خادم واحد لتعليم عدة معرّفات دفعة واحدة؛ زر
                  «تعليم المحدد» ينفّذ عدة طلبات{' '}
                  <span
                    className='font-mono'
                    dir='ltr'
                  >
                    PATCH …/read
                  </span>{' '}
                  بشكل متوازٍ للمعرّفات التي تختارها.
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </>
  );
}
