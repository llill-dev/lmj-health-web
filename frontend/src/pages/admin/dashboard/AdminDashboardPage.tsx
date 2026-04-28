import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Users,
  Stethoscope,
  UserCheck,
  Bell,
  FileText,
  ClipboardList,
  ChevronLeft,
  Tag,
  User,
  Eye,
  CalendarClock,
  Pencil,
  Trash2,
  Archive,
} from 'lucide-react';
import { adminApi } from '@/lib/admin/client';
import { useAdminContentList, useArchiveContent } from '@/hooks/useAdminContent';
import { ConfirmActionDialog } from '@/components/admin/dialogs';
import type {
  AdminComplaintListItem,
  AdminContentItem,
} from '@/lib/admin/types';
import {
  activityDescription,
  activityHeadline,
  activityRowVisual,
  asPlainText,
  authorName,
  complaintStatusLabel,
  complaintTypeLabel,
  contentItemsFromList,
  contentStatusLabel,
  contentTypeCategoryLabel,
  formatRelativeTimeAr,
  formatShortDate,
  formatTimeTodayOrDate,
} from '@/components/admin/dashboard/dashboardUtils';

const TEAL = '#0F8F8B';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const archiveContent = useArchiveContent();
  const [archiveTarget, setArchiveTarget] = useState<AdminContentItem | null>(
    null,
  );

  const complaintsQuery = useQuery({
    queryKey: ['admin', 'dashboard', 'latest-complaints'],
    queryFn: () => adminApi.complaints.list({ page: 1, limit: 5 }),
    staleTime: 30_000,
  });

  /** GET /admin/content — أحدث العناصر (جميع الحالات؛ شارة الحالة في الواجهة). */
  const contentQuery = useAdminContentList({ page: 1, limit: 5 });
  const contentRows = contentItemsFromList(contentQuery.data);

  /** API-3.pdf: GET /admin/audit-logs — سجل النظام للمشرف (أقرب ما يكون لـ«آخر الأنشطة»). */
  const activityQuery = useQuery({
    queryKey: ['admin', 'dashboard', 'audit-activity'],
    queryFn: () => adminApi.auditLogs.list({ page: 1, limit: 8 }),
    staleTime: 45_000,
    retry: 1,
  });
  const activityLogs = activityQuery.data?.auditLogs ?? [];

  const complaints = complaintsQuery.data?.complaints ?? [];

  return (
    <>
      <Helmet>
        <title>Admin Dashboard • LMJ Health</title>
      </Helmet>

      <div
        dir='rtl'
        lang='ar'
        className='min-h-full text-[#111827]'
      >
        <div className='flex flex-col gap-4 justify-between sm:flex-row sm:items-start'>
          <div>
            <div className='font-cairo text-[20px] font-black leading-[26px] text-[#111827]'>
              لوحة التحكم الرئيسية
            </div>
            <div className='mt-1 font-cairo text-[12px] font-semibold leading-[14px] text-[#98A2B3]'>
              نظرة عامة شاملة على النظام وإدارة النشاط
            </div>
          </div>
        </div>

        <section className='grid grid-cols-1 gap-5 mt-6 sm:grid-cols-2 lg:grid-cols-4'>
          {[
            {
              title: 'طلبات الوصول المعلّقة',
              value: '1',
              icon: UserCheck,
              badge: 'معلّق',
            },
            {
              title: 'عدد المواعيد (الشهر)',
              value: '2',
              icon: CalendarDays,
              badge: '+18%',
            },
            {
              title: 'إجمالي عدد الأطباء',
              value: '5',
              icon: Stethoscope,
              badge: '+12%',
            },
            {
              title: 'إجمالي عدد المرضى',
              value: '2',
              icon: Users,
              badge: '+24%',
            },
          ].map((c, idx) => {
            const Icon = c.icon;
            return (
              <div
                key={idx}
                className='relative overflow-hidden rounded-[12px] bg-primary px-5 py-5 shadow-[0_18px_30px_rgba(0,0,0,0.10)]'
                style={{ backgroundColor: TEAL }}
              >
                <div className='flex justify-between items-start'>
                  <div className='flex h-[34px] w-[34px] items-center justify-center rounded-[6px] bg-[#FFFFFF33]'>
                    <Icon className='h-[18px] w-[18px] text-white' />
                  </div>
                  <div className='inline-flex h-[26px] items-center justify-center rounded-full bg-white/15 px-3 font-cairo text-[11px] font-extrabold text-white'>
                    {c.badge}
                  </div>
                </div>

                <div className='mt-6 font-cairo text-[34px] font-extrabold leading-[34px] text-white'>
                  {c.value}
                </div>
                <div className='mt-2 font-cairo text-[12px] font-semibold text-white/85'>
                  {c.title}
                </div>
              </div>
            );
          })}
        </section>

        <section className='grid grid-cols-1 gap-5 mt-5 md:grid-cols-3'>
          {[
            {
              title: 'إشعارات غير مقروءة',
              value: '2',
              icon: Bell,
              tone: 'border-[#FECACA] bg-[#FFF7F7] text-[#111827]',
              iconBg: 'bg-[#FEE2E2]',
              iconColor: 'text-[#EF4444]',
            },
            {
              title: 'الملفات المنشورة',
              value: '45',
              icon: FileText,
              tone: 'border-[#CFFAFE] bg-white text-[#111827]',
              iconBg: 'bg-[#ECFEFF]',
              iconColor: 'text-primary',
            },
            {
              title: 'الندوات المنشورة',
              value: '25',
              icon: ClipboardList,
              tone: 'border-[#CFFAFE] bg-white text-[#111827]',
              iconBg: 'bg-[#ECFEFF]',
              iconColor: 'text-primary',
            },
          ].map((c, idx) => {
            const Icon = c.icon;
            return (
              <div
                key={idx}
                className={`rounded-[12px] border px-5 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)] ${c.tone}`}
              >
                <div className='flex justify-between items-start'>
                  <div>
                    <div className='font-cairo text-[26px] font-extrabold leading-[26px]'>
                      {c.value}
                    </div>
                    <div className='mt-2 font-cairo text-[12px] font-semibold text-[#98A2B3]'>
                      {c.title}
                    </div>
                  </div>
                  <div
                    className={`flex h-[40px] w-[40px] items-center justify-center rounded-[12px] ${c.iconBg}`}
                  >
                    <Icon
                      className={`h-[18px] w-[18px] ${c.iconColor}`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <section className='mt-5 overflow-hidden rounded-[12px] border border-[#E8EDF2] bg-white shadow-[0_10px_24px_rgba(0,0,0,0.06)]'>
          <div className='flex flex-col gap-3 border-b border-[#EEF2F6] px-6 py-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='text-right'>
              <div className='font-cairo text-[16px] font-extrabold text-[#111827]'>
                آخر الأنشطة
              </div>
            </div>
            <Link
              to='/admin/system-logs'
              className='inline-flex h-[34px] shrink-0 items-center justify-center rounded-[8px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-primary transition hover:bg-[#F0FDFC]'
            >
              عرض سجل النظام
            </Link>
          </div>

          <div className='divide-y divide-[#EEF2F6]'>
            {activityQuery.isLoading ? (
              <div className='px-6 py-10 text-center font-cairo text-[13px] font-semibold text-[#667085]'>
                جارِ تحميل آخر الأنشطة...
              </div>
            ) : activityQuery.isError ? (
              <div className='px-6 py-10 text-center font-cairo text-[13px] font-semibold text-red-600'>
                تعذر تحميل سجل الأنشطة. تحقق من الصلاحيات أو الشبكة.
              </div>
            ) : activityLogs.length === 0 ? (
              <div className='px-6 py-10 text-center font-cairo text-[13px] font-semibold text-[#667085]'>
                لا توجد أحداث مسجّلة في الصفحة الحالية.
              </div>
            ) : (
              activityLogs.map((log) => {
                const { Icon, box, iconColor } = activityRowVisual(log);
                const title = activityHeadline(log);
                const desc = activityDescription(log);
                return (
                  <div
                    key={log._id}
                    className='flex gap-3 justify-between items-center px-6 py-4'
                  >
                    <div className='flex flex-1 gap-3 items-center min-w-0'>
                      <div
                        className={`flex justify-center items-center h-[36px] w-[36px] shrink-0 rounded-[10px] ${box}`}
                      >
                        <Icon className={`w-4 h-4 ${iconColor}`} />
                      </div>
                      <div className='flex-1 min-w-0 text-right'>
                        <div className='truncate font-cairo text-[13px] font-extrabold text-[#111827]'>
                          {title}
                        </div>
                        <div
                          className='mt-1 line-clamp-2 font-cairo text-[12px] font-semibold text-[#98A2B3]'
                          title={desc}
                        >
                          {desc}
                        </div>
                      </div>
                    </div>
                    <div className='shrink-0 font-cairo text-[12px] font-semibold text-[#98A2B3]'>
                      {formatRelativeTimeAr(log.createdAt)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* آخر الشكاوي — مطابق تخطيط المرجع: شريط فيزيائي، أيقونة، شارة، تفاصيل */}
        <section className='mt-5'>
          <h2 className='mb-3 text-right font-cairo text-[16px] font-extrabold text-[#111827]'>
            آخر الشكاوي
          </h2>
          <div className='overflow-hidden rounded-[12px] border border-[#E8EDF2] bg-white p-4 shadow-[0_10px_24px_rgba(0,0,0,0.06)] sm:p-5'>
            {complaintsQuery.isLoading ? (
              <div className='py-12 text-center font-cairo text-[13px] font-semibold text-[#667085]'>
                جارِ تحميل الشكاوى...
              </div>
            ) : complaintsQuery.isError ? (
              <div className='py-12 text-center font-cairo text-[13px] font-semibold text-red-600'>
                تعذر تحميل الشكاوى.
              </div>
            ) : complaints.length === 0 ? (
              <div className='py-12 text-center font-cairo text-[13px] font-semibold text-[#667085]'>
                لا توجد شكاوى لعرضها.
              </div>
            ) : (
              <ul className='flex flex-col gap-3'>
                {complaints.map((row: AdminComplaintListItem) => {
                  const st = complaintStatusLabel(row.status);
                  const patientName =
                    asPlainText(row.contactSnapshot?.fullName) || '—';
                  const subj = asPlainText(row.subject);
                  const msg = asPlainText(row.message);
                  const locationLine =
                    subj ||
                    (msg ? msg.replace(/\s+/g, ' ').slice(0, 80) : '—');
                  return (
                    <li key={row._id}>
                      <div className='flex items-stretch overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-[#FAFBFC]'>
                        <div className='flex flex-1 gap-3 p-4 min-w-0 sm:gap-4 sm:p-5'>
                          <div
                            className='flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] sm:h-14 sm:w-14'
                            style={{ backgroundColor: TEAL }}
                          >
                            <Stethoscope className='w-6 h-6 text-white sm:h-7 sm:w-7' />
                          </div>
                          <div className='flex-1 min-w-0 text-right'>
                            <div className='flex flex-wrap gap-2 justify-end items-center'>
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-cairo text-[10px] font-extrabold ${st.className}`}
                              >
                                {st.label}
                              </span>
                            </div>
                            <div className='mt-2 font-cairo text-[15px] font-extrabold text-[#111827] sm:text-[16px]'>
                              {patientName}
                            </div>
                            <div className='mt-1.5 font-cairo text-[13px] font-semibold text-[#374151]'>
                              <span className='text-[#98A2B3]'>
                                نوع الشكوى :{' '}
                              </span>
                              {complaintTypeLabel(row.type)}
                            </div>
                            <div className='mt-1 font-cairo text-[12px] font-medium leading-relaxed text-[#98A2B3]'>
                              {locationLine}
                            </div>
                            <div className='mt-3 font-cairo text-[11px] font-semibold text-[#9CA3AF]'>
                              {formatTimeTodayOrDate(row.createdAt)}
                            </div>
                          </div>
                        </div>
                        <Link
                          to={`/admin/complaints/${row._id}`}
                          className='flex w-[52px] shrink-0 items-center justify-center text-white transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                          style={{ backgroundColor: TEAL }}
                          aria-label='عرض تفاصيل الشكوى'
                        >
                          <ChevronLeft
                            className='w-6 h-6'
                            strokeWidth={2.5}
                          />
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        {/* آخر الأخبار / المحتوى — شارة حالة، صف بيانات، أيقونات إجراءات يسار الصف */}
        <section className='mt-5 mb-2'>
          <h2 className='mb-3 text-right font-cairo text-[16px] font-extrabold text-[#111827]'>
            آخر الأخبار
          </h2>
          <div className='overflow-hidden rounded-[12px] border border-[#E8EDF2] bg-white p-4 shadow-[0_10px_24px_rgba(0,0,0,0.06)] sm:p-5'>
            {contentQuery.isLoading ? (
              <div className='py-12 text-center font-cairo text-[13px] font-semibold text-[#667085]'>
                جارِ تحميل المحتوى...
              </div>
            ) : contentQuery.isError ? (
              <div className='py-12 text-center font-cairo text-[13px] font-semibold text-red-600'>
                تعذر تحميل الأخبار.
              </div>
            ) : contentRows.length === 0 ? (
              <div className='py-12 text-center font-cairo text-[13px] font-semibold text-[#667085]'>
                لا توجد عناصر لعرضها.
              </div>
            ) : (
              <ul className='flex flex-col gap-3'>
                {contentRows.map((item) => {
                  const st = contentStatusLabel(item.status);
                  const views = item.viewCount ?? item.views ?? 0;
                  const canArchive = item.status === 'PUBLISHED';
                  return (
                    <li key={item._id}>
                      <div className='rounded-[12px] border border-[#E5E7EB] bg-[#FAFBFC] px-4 py-4 sm:px-5 sm:py-5'>
                        <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
                          <div className='flex-1 min-w-0 text-right'>
                            <div className='flex flex-wrap gap-2 justify-start items-center'>
                              <h3 className='max-w-full font-cairo text-[15px] font-extrabold leading-snug text-[#111827] sm:text-[16px]'>
                                {asPlainText(item.title) || '—'}
                              </h3>
                              <span
                                className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 font-cairo text-[10px] font-extrabold ${st.className}`}
                              >
                                {st.label}
                              </span>
                            </div>
                            <div className='mt-3 flex flex-wrap gap-x-4 gap-y-2 justify-end font-cairo text-[11px] font-semibold text-[#98A2B3]'>
                              <span className='inline-flex gap-1.5 items-center'>
                                <Tag className='h-3.5 w-3.5 shrink-0 text-[#9CA3AF]' />
                                {contentTypeCategoryLabel(item.type)}
                              </span>
                              <span className='inline-flex gap-1.5 items-center'>
                                <User className='h-3.5 w-3.5 shrink-0 text-[#9CA3AF]' />
                                الكاتب: {authorName(item.createdBy)}
                              </span>
                              <span className='inline-flex gap-1.5 items-center'>
                                <Eye className='h-3.5 w-3.5 shrink-0 text-[#9CA3AF]' />
                                {views} مشاهدة
                              </span>
                              <span className='inline-flex gap-1.5 items-center'>
                                <CalendarClock className='h-3.5 w-3.5 shrink-0 text-[#9CA3AF]' />
                                آخر تحديث: {formatShortDate(item.updatedAt)}
                              </span>
                            </div>
                          </div>
                          <div className='flex gap-2 justify-end shrink-0 lg:pt-1'>
                            <button
                              type='button'
                              disabled={!canArchive || archiveContent.isPending}
                              title={
                                canArchive
                                  ? 'أرشفة (للمحتوى المنشور فقط)'
                                  : 'الأرشفة متاحة للعناصر ذات حالة «منشور» فقط'
                              }
                              onClick={() => {
                                if (canArchive) setArchiveTarget(item);
                              }}
                              className='flex h-10 w-10 items-center justify-center rounded-full border border-[#FECACA] bg-white text-[#EF4444] transition hover:bg-[#FEF2F2] disabled:opacity-50'
                              aria-label='أرشفة'
                            >
                              <Trash2 className='w-4 h-4' />
                            </button>
                            <button
                              type='button'
                              onClick={() =>
                                navigate('/admin/medical-content', {
                                  state: { focusContentId: item._id },
                                })
                              }
                              className='flex h-10 w-10 items-center justify-center rounded-full border border-[#A5E3E1] bg-white text-primary transition hover:bg-[#F0FDFC]'
                              style={{ color: TEAL, borderColor: '#A5E3E1' }}
                              aria-label='تعديل'
                            >
                              <Pencil className='w-4 h-4' />
                            </button>
                            <button
                              type='button'
                              onClick={() =>
                                navigate('/admin/medical-content', {
                                  state: { focusContentId: item._id },
                                })
                              }
                              className='flex h-10 w-10 items-center justify-center rounded-full border border-[#BFDBFE] bg-white text-[#2563EB] transition hover:bg-[#EFF6FF]'
                              aria-label='عرض'
                            >
                              <Eye className='w-4 h-4' />
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        <div className='h-6' />
      </div>

      <ConfirmActionDialog
        open={archiveTarget !== null}
        onOpenChange={(next) => {
          if (!next) setArchiveTarget(null);
        }}
        variant='destructive'
        title='تأكيد الأرشفة'
        icon={<Archive className='w-6 h-6' strokeWidth={2} />}
        description={
          <>
            هل تريد أرشفة العنصر «
            <span className='font-extrabold text-[#344054]'>
              {archiveTarget ? asPlainText(archiveTarget.title) || '—' : '—'}
            </span>
            »؟ سيتم إزالته من القوائم النشطة ويمكن متابعته لاحقاً من أرشيف المحتوى
            إن وُجد.
          </>
        }
        confirmLabel='أرشفة'
        confirmDisabled={archiveContent.isPending}
        onConfirm={async () => {
          if (!archiveTarget) return;
          await archiveContent.mutateAsync(archiveTarget._id);
        }}
        successToast={{
          title: 'تمت الأرشفة',
          message: 'أُرشف المحتوى ويُتاح من أرشيف المحتوى عند التوفّر.',
          variant: 'success',
        }}
      />
    </>
  );
}
