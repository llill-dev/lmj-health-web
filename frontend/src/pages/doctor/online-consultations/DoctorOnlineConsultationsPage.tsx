import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Filter,
  Loader2,
  MessageCircle,
  Search,
  Signal,
  ChevronUp,
  User,
  Ticket,
  Star,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import ConfirmActionDialog from '@/components/doctor/confirm-action-dialog';
import { useToast } from '@/components/ui/ToastProvider';
import {
  useConsultationsList,
  useConsultationDetails,
  useMarkConsultationRead,
  useSendConsultationMessage,
  useUpdateConsultationStatus,
} from '@/hooks';
import { getUserFacingRequestErrorMessage } from '@/lib/api';
import { readAuthUser } from '@/lib/cookies';
import ConsultationAttachmentList from '@/components/doctor/consultations/consultation-attachment-list';
import ConsultationReplyPanel from '@/components/doctor/consultations/consultation-reply-panel';
import ConsultationDismissDialog from '@/components/doctor/consultations/consultation-dismiss-dialog';
import type { ConsultationTicketStatus } from '@/lib/consultations/client';
import type {
  ConsultationAttachmentFile,
  PendingConsultationAttachment,
} from '@/lib/consultations/types';
import {
  mapConsultationTicketToUi,
  type UiConsultationListItem,
} from '@/lib/consultations/map-to-ui';

type ConsultationStatus = 'closed' | 'dismissed' | 'in_progress' | 'waiting';

type ConsultationMessage = {
  id: string;
  author: 'patient' | 'doctor';
  authorName: string;
  text: string;
  timeLabel: string;
  isNew?: boolean;
  attachmentFiles?: ConsultationAttachmentFile[];
};

type Consultation = UiConsultationListItem;

function tabToApiStatus(
  tab: 'all' | ConsultationStatus,
): ConsultationTicketStatus | undefined {
  if (tab === 'waiting') return 'pending';
  if (tab === 'in_progress') return 'active';
  if (tab === 'closed') return 'closed';
  return undefined;
}

function statusTabLabel(tab: 'all' | ConsultationStatus) {
  if (tab === 'all') return 'الكل';
  if (tab === 'closed') return 'مغلقة';
  if (tab === 'in_progress') return 'قيد المعالجة';
  return 'بالانتظار القبول';
}

function statusChipStyle(status: ConsultationStatus) {
  if (status === 'in_progress') {
    return 'bg-[#EFFFFE] text-primary';
  }
  if (status === 'waiting') {
    return 'bg-[#FFF7ED] text-[#F97316]';
  }
  if (status === 'dismissed') {
    return 'bg-[#FEE2E2] text-[#B42318]';
  }
  return 'bg-[#ECFDF3] text-[#16A34A]';
}

function isTerminalConsultationStatus(status: ConsultationStatus) {
  return status === 'closed' || status === 'dismissed';
}

export default function DoctorOnlineConsultationsPage() {
  const { toast } = useToast();
  const doctorId = readAuthUser()?.actorIds?.doctorId ?? '';
  const [tab, setTab] = useState<'all' | ConsultationStatus>('all');
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string>('');
  const [draft, setDraft] = useState('');
  const [closeOpen, setCloseOpen] = useState(false);
  const [dismissOpen, setDismissOpen] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<
    PendingConsultationAttachment[]
  >([]);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null,
  );

  const apiStatus = tabToApiStatus(tab);
  const listQuery = useConsultationsList(apiStatus);
  const updateStatus = useUpdateConsultationStatus();
  const markRead = useMarkConsultationRead();

  const consultations = useMemo(() => {
    return (listQuery.data?.tickets ?? [])
      .map(mapConsultationTicketToUi)
      .filter((c) => c.id);
  }, [listQuery.data?.tickets]);

  const unreadById = useMemo(() => {
    const map = new Map<string, number>();
    for (const ticket of listQuery.data?.tickets ?? []) {
      if (ticket._id) {
        map.set(ticket._id, ticket.unreadForDoctor ?? 0);
      }
    }
    return map;
  }, [listQuery.data?.tickets]);

  const detailsQuery = useConsultationDetails(expandedId || null);
  const sendMessage = useSendConsultationMessage(expandedId);

  const stats = useMemo(() => {
    const counts = listQuery.data?.counts;
    if (counts) {
      return {
        total: counts.total ?? consultations.length,
        waiting: counts.pending ?? 0,
        inProgress: counts.active ?? 0,
        closed: counts.closed ?? 0,
      };
    }
    const total = consultations.length;
    const waiting = consultations.filter((c) => c.status === 'waiting').length;
    const inProgress = consultations.filter(
      (c) => c.status === 'in_progress',
    ).length;
    const closed = consultations.filter((c) => c.status === 'closed').length;
    return { total, waiting, inProgress, closed };
  }, [consultations, listQuery.data?.counts]);

  const visibleConsultations = useMemo(() => {
    if (!query.trim()) return consultations;

    const q = query.trim();
    return consultations.filter(
      (c) =>
        c.title.includes(q) ||
        c.patientName.includes(q) ||
        c.patientEmail.includes(q) ||
        c.patientPhone.includes(q) ||
        c.id.includes(q),
    );
  }, [query, consultations]);

  const activeBase =
    visibleConsultations.find((c) => c.id === expandedId) ??
    visibleConsultations[0];

  const active = useMemo((): Consultation | null => {
    if (!activeBase) return null;
    const detailTicket = detailsQuery.data?.ticket;
    const detailDescription = detailTicket?.description?.trim();
    const detailStatus = detailTicket?.status;
    return {
      ...activeBase,
      description: detailDescription || activeBase.description,
      status:
        detailStatus === 'dismissed'
          ? 'dismissed'
          : detailStatus === 'pending'
            ? 'waiting'
            : detailStatus === 'active'
              ? 'in_progress'
              : activeBase.status,
      statusLabel:
        detailStatus === 'dismissed'
          ? 'مرفوضة'
          : activeBase.statusLabel,
    };
  }, [activeBase, detailsQuery.data?.ticket]);

  const activePatientId = useMemo(() => {
    const fromDetail = detailsQuery.data?.ticket?.patientSummary?._id;
    const fromList = listQuery.data?.tickets?.find((ticket) => ticket._id === expandedId)
      ?.patientSummary?._id;
    return fromDetail ?? fromList ?? '';
  }, [detailsQuery.data?.ticket?.patientSummary?._id, expandedId, listQuery.data?.tickets]);

  const ticketAttachmentFiles =
    detailsQuery.data?.ticket?.attachmentFiles ?? [];
  const ticketReview = detailsQuery.data?.ticket?.review ?? null;
  const closedReason =
    detailsQuery.data?.ticket?.cancellationReason?.trim() ||
    detailsQuery.data?.ticket?.closedReason?.trim() ||
    '';

  const activeMessages = useMemo((): ConsultationMessage[] => {
    const apiMessages = detailsQuery.data?.messages ?? [];
    if (!apiMessages.length) return active?.messages ?? [];
    return apiMessages.map((m, idx) => ({
      id: m._id ?? String(idx),
      author: (m.senderRole === 'doctor' ? 'doctor' : 'patient') as
        | 'doctor'
        | 'patient',
      authorName:
        m.senderRole === 'doctor'
          ? 'الطبيب'
          : active?.patientName ?? 'المريض',
      text: m.content ?? '',
      timeLabel: m.createdAt
        ? new Date(m.createdAt).toLocaleString('ar-SY')
        : '—',
      isNew: false,
      attachmentFiles: m.attachmentFiles ?? [],
    }));
  }, [active?.messages, active?.patientName, detailsQuery.data?.messages]);

  const canReply =
    Boolean(active) &&
    !isTerminalConsultationStatus(active.status) &&
    Boolean(expandedId) &&
    !sendMessage.isPending;

  useEffect(() => {
    if (!visibleConsultations.length) {
      if (expandedId) setExpandedId('');
      return;
    }
    if (!visibleConsultations.some((c) => c.id === expandedId)) {
      setExpandedId(visibleConsultations[0].id);
    }
  }, [expandedId, visibleConsultations]);

  useEffect(() => {
    if (!expandedId) return;
    markRead.mutate(expandedId);
    setPendingAttachments([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mark read once per ticket selection
  }, [expandedId]);

  const handleCloseConsultation = async () => {
    if (!expandedId) return;
    try {
      await updateStatus.mutateAsync({
        ticketId: expandedId,
        status: 'closed',
      });
      toast('تم إغلاق الاستشارة بنجاح.', {
        title: 'إنهاء الاستشارة',
        variant: 'success',
      });
      setCloseOpen(false);
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), {
        title: 'تعذّر إغلاق الاستشارة',
        variant: 'error',
      });
    }
  };

  const handleDismissConsultation = async (reason: string) => {
    if (!expandedId) return;
    try {
      await updateStatus.mutateAsync({
        ticketId: expandedId,
        status: 'dismissed',
        reason,
      });
      toast('تم رفض الاستشارة.', {
        title: 'رفض الاستشارة',
        variant: 'success',
      });
      setDismissOpen(false);
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), {
        title: 'تعذّر رفض الاستشارة',
        variant: 'error',
      });
    }
  };

  const handleSendReply = () => {
    const text = draft.trim();
    const attachments = pendingAttachments.map((item) => item.ref);
    if ((!text && attachments.length === 0) || !expandedId) return;

    sendMessage.mutate(
      {
        content: text || 'مرفق',
        attachments: attachments.length ? attachments : undefined,
      },
      {
        onSuccess: () => {
          setDraft('');
          setPendingAttachments([]);
        },
        onError: (error) => {
          toast(getUserFacingRequestErrorMessage(error), {
            title: 'تعذّر إرسال الرد',
            variant: 'error',
          });
        },
      },
    );
  };

  return (
    <>
      <Helmet>
        <title>Online Consultations • LMJ Health</title>
      </Helmet>

      <div dir="rtl" lang="ar">
        <section className="rounded-[16px] border border-[#E5E7EB] bg-white px-6 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
          <div className="flex justify-between items-start">
            <div className="text-right">
              <div className="font-cairo text-[20px] font-black leading-[26px] text-[#111827]">
                الاستشارات الأونلاين
              </div>
              <div className="mt-1 font-cairo text-[12px] font-semibold leading-[14px] text-[#98A2B3]">
                إدارة ومتابعة الاستشارات بشكل مباشر
              </div>
            </div>

          </div>
        </section>

        <section className="grid grid-cols-4 gap-4 mt-6">
          <div className="rounded-[6px] border-b-[3.98px] border-primary bg-white p-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
            <div className="flex justify-between items-start">
              <div className="text-right">
                <div className="font-cairo text-[13px] font-bold text-[#667085]">
                  إجمالي الاستشارات
                </div>
                <div className="mt-2 font-cairo text-[28px] font-extrabold leading-[28px] text-[#111827]">
                  {stats.total}
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-[#EFFFFE]">
                <MessageCircle className="h-[18px] w-[18px] text-primary" />
              </div>
            </div>
          </div>

          <div className="rounded-[6px] border-b-[3.98px] border-[#F97316] bg-white p-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
            <div className="flex justify-between items-start">
              <div className="text-right">
                <div className="font-cairo text-[13px] font-bold text-[#667085]">
                  بالانتظار القبول
                </div>
                <div className="mt-2 font-cairo text-[28px] font-extrabold leading-[28px] text-[#111827]">
                  {stats.waiting}
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-[#FFF7ED]">
                <Clock className="h-[18px] w-[18px] text-[#F97316]" />
              </div>
            </div>
          </div>

          <div className="rounded-[6px] border-b-[3.98px] border-[#06B6D4] bg-white p-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
            <div className="flex justify-between items-start">
              <div className="text-right">
                <div className="font-cairo text-[13px] font-bold text-[#667085]">
                  قيد المعالجة
                </div>
                <div className="mt-2 font-cairo text-[28px] font-extrabold leading-[28px] text-[#111827]">
                  {stats.inProgress}
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-[#ECFEFF]">
                <Signal className="h-[18px] w-[18px] text-[#06B6D4]" />
              </div>
            </div>
          </div>

          <div className="rounded-[6px] border-b-[3.98px] border-[#16A34A] bg-white p-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
            <div className="flex justify-between items-start">
              <div className="text-right">
                <div className="font-cairo text-[13px] font-bold text-[#667085]">
                  مغلقة
                </div>
                <div className="mt-2 font-cairo text-[28px] font-extrabold leading-[28px] text-[#111827]">
                  {stats.closed}
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-[#ECFDF3]">
                <CheckCircle2 className="h-[18px] w-[18px] text-[#16A34A]" />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-[12px] border border-[#E5E7EB] bg-white p-3 shadow-[0_10px_25px_rgba(0,0,0,0.06)]">
          <div className="grid grid-cols-4 gap-3">
            {(['all', 'waiting', 'in_progress', 'closed'] as const).map(
              (key) => {
                const isActive = tab === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTab(key)}
                    className={
                      isActive
                        ? 'h-[38px] rounded-[6px] bg-primary font-cairo text-[13px] font-extrabold text-white shadow-[0_14px_24px_rgba(15,143,139,0.25)]'
                        : 'h-[38px] rounded-[6px] bg-white font-cairo text-[13px] font-extrabold text-[#667085]'
                    }
                  >
                    {statusTabLabel(key)}
                  </button>
                );
              },
            )}
          </div>

          <div className="flex gap-3 items-center mt-3">
            <div className="relative flex-1">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث في الاستشارات بالرقم أو العنوان أو المريض..."
                className="h-[40px] w-full rounded-[6px] border border-[#E5E7EB] bg-white ps-11 pe-4 font-cairo text-[13px] font-semibold text-[#111827] outline-none placeholder:font-cairo placeholder:font-medium placeholder:text-[#98A2B3]"
              />
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#98A2B3]">
                <Search className="h-[18px] w-[18px]" />
              </div>
            </div>

            <button
              type="button"
              className="flex h-[40px] w-[44px] items-center justify-center rounded-[6px] border border-[#E5E7EB] bg-white text-[#667085] hover:bg-[#F9FAFB]"
              aria-label="فلتر"
            >
              <Filter className="h-[18px] w-[18px]" />
            </button>
          </div>
        </section>

        {listQuery.isLoading ? (
          <div className="mt-6 flex items-center justify-center gap-2 rounded-[14px] border border-[#E5E7EB] bg-white py-16 font-cairo text-[13px] font-semibold text-[#667085]">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            جاري تحميل الاستشارات…
          </div>
        ) : listQuery.isError ? (
          <div className="mt-6 rounded-[14px] border border-[#FEE2E2] bg-[#FFF1F2] px-6 py-10 text-center font-cairo text-[13px] font-semibold text-[#B42318]">
            تعذّر تحميل الاستشارات. حاول تحديث الصفحة.
          </div>
        ) : (
          <div className="flex gap-4 mt-5">
            <aside className="w-[300px] shrink-0 overflow-hidden rounded-[14px] border border-[#E5E7EB] bg-white shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
              <div className="border-b border-[#EEF2F6] px-4 py-3">
                <div className="font-cairo text-[13px] font-extrabold text-[#111827]">
                  قائمة الاستشارات ({visibleConsultations.length})
                </div>
              </div>
              <div className="max-h-[720px] overflow-y-auto">
                {visibleConsultations.length === 0 ? (
                  <div className="px-4 py-10 text-center font-cairo text-[12px] font-semibold text-[#98A2B3]">
                    لا توجد استشارات في هذا التصنيف
                  </div>
                ) : (
                  visibleConsultations.map((item) => {
                    const selected = item.id === expandedId;
                    const unread = unreadById.get(item.id) ?? 0;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setExpandedId(item.id)}
                        className={
                          selected
                            ? 'w-full border-b border-[#EEF2F6] bg-[#EFFFFE] px-4 py-3 text-right'
                            : 'w-full border-b border-[#EEF2F6] bg-white px-4 py-3 text-right hover:bg-[#F9FAFB]'
                        }
                      >
                        <div className="flex gap-2 justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <div className="truncate font-cairo text-[13px] font-extrabold text-[#111827]">
                              {item.title}
                            </div>
                            <div className="mt-1 truncate font-cairo text-[11px] font-semibold text-[#667085]">
                              {item.patientName}
                            </div>
                            <div className="flex gap-2 items-center mt-2">
                              <span
                                className={`inline-flex h-[20px] items-center rounded-[6px] px-2 font-cairo text-[10px] font-extrabold ${statusChipStyle(item.status)}`}
                              >
                                {item.statusLabel}
                              </span>
                              <span className="font-cairo text-[10px] font-semibold text-[#98A2B3]">
                                {item.lastUpdateLabel}
                              </span>
                            </div>
                          </div>
                          {unread > 0 ? (
                            <span className="inline-flex h-[20px] min-w-[20px] items-center justify-center rounded-full bg-[#F43F5E] px-1 font-cairo text-[10px] font-extrabold text-white">
                              {unread}
                            </span>
                          ) : null}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </aside>

            {active ? (
              <section className="min-w-0 flex-1 rounded-[14px] border border-[#E5E7EB] bg-white shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
                <div className="flex items-center justify-between border-b border-[#EEF2F6] px-5 py-4">
                  <div className="flex gap-3 items-center">
                    <div className="flex h-[44px] w-[44px] items-center justify-center rounded-[6px] bg-primary text-white shadow-[0_10px_18px_rgba(15,143,139,0.25)]">
                      <Ticket className="font-cairo text-[16px] font-extrabold" />
                    </div>
                    <div className="text-right">
                      <div className="flex gap-2 items-center">
                        <div className="font-cairo text-[15px] font-extrabold text-[#111827]">
                          {active.title}
                        </div>
                        {(unreadById.get(active.id) ?? 0) > 0 ? (
                          <span className="inline-flex h-[22px] items-center justify-center rounded-[6px] bg-primary px-2 font-cairo text-[11px] font-extrabold text-white">
                            جديد
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-1 flex items-center gap-2 font-cairo text-[12px] font-semibold text-[#98A2B3]">
                        <span>#{active.id.slice(-8)}</span>
                        <span className="h-1 w-1 rounded-full bg-[#D0D5DD]" />
                        <span>{active.createdAtLabel}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 items-center">
                    <span className="inline-flex h-[24px] items-center justify-center rounded-[6px] bg-[#FEF3C7] px-2 font-cairo text-[11px] font-extrabold text-[#B45309]">
                      {active.priorityLabel}
                    </span>
                    <span
                      className={`inline-flex h-[24px] items-center justify-center rounded-[6px] px-2 font-cairo text-[11px] font-extrabold ${statusChipStyle(active.status)}`}
                    >
                      {active.statusLabel}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedId((prev) => (prev ? '' : active.id))
                      }
                      className="h-[34px] w-[34px] font-bold text-[#667085]"
                      aria-label="طي"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="px-5 py-5">
                  <div className="grid grid-cols-4 gap-4 rounded-[12px] bg-[#F9FAFB] px-4 py-3">
                    <div className="text-right">
                      <div className="font-cairo text-[11px] font-bold text-[#98A2B3]">
                        تاريخ الإنشاء
                      </div>
                      <div className="mt-1 font-cairo text-[12px] font-extrabold text-[#111827]">
                        {active.createdAtLabel}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-cairo text-[11px] font-bold text-[#98A2B3]">
                        آخر تحديث
                      </div>
                      <div className="mt-1 font-cairo text-[12px] font-extrabold text-[#111827]">
                        {active.lastUpdateLabel}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-cairo text-[11px] font-bold text-[#98A2B3]">
                        حالة الاستشارة
                      </div>
                      <div className="mt-1 font-cairo text-[12px] font-extrabold text-[#111827]">
                        {active.statusLabel}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-cairo text-[11px] font-bold text-[#98A2B3]">
                        عدد الردود
                      </div>
                      <div className="mt-1 font-cairo text-[12px] font-extrabold text-[#111827]">
                        {active.repliesCount}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-[12px] border border-[#D1E9FF] bg-[#EFF8FF] px-4 py-4">
                    <div className="flex gap-3 justify-start items-center">
                      <div className="flex h-[44px] w-[44px] items-center justify-center rounded-[6px] bg-primary text-white shadow-[0_10px_18px_rgba(15,143,139,0.25)]">
                        <span className="font-cairo text-[16px] font-extrabold">
                          {active.patientInitial}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-cairo text-[12px] text-primary">
                          معلومات المريض
                        </div>
                        <div className="mt-2 font-cairo text-[14px] font-extrabold text-primary">
                          {active.patientName}
                        </div>
                        {active.patientEmail || active.patientPhone ? (
                          <div className="mt-1 font-cairo text-[12px] text-primary">
                            {[active.patientEmail, active.patientPhone]
                              .filter(Boolean)
                              .join(' • ')}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="rounded-[12px] border border-[#EEF2F6] bg-white px-4 py-4">
                      <div className="font-cairo text-[12px] font-extrabold text-[#111827]">
                        الوصف التفصيلي
                      </div>
                      <div className="mt-2 font-cairo text-[12px] font-semibold leading-[20px] text-[#667085]">
                        {active.description || '—'}
                      </div>
                      <ConsultationAttachmentList
                        attachments={ticketAttachmentFiles}
                        doctorId={doctorId}
                        patientId={activePatientId}
                        title="مرفقات الاستشارة"
                      />
                      {closedReason ? (
                        <div className="mt-3 rounded-[8px] bg-[#FFF7ED] px-3 py-2 font-cairo text-[12px] font-semibold text-[#B45309]">
                          سبب الإغلاق: {closedReason}
                        </div>
                      ) : null}
                      {ticketReview?.rating ? (
                        <div className="mt-3 rounded-[8px] border border-[#EEF2F6] bg-[#F9FAFB] px-3 py-3">
                          <div className="font-cairo text-[12px] font-extrabold text-[#111827]">
                            تقييم المريض
                          </div>
                          <div className="mt-2 flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, index) => (
                              <Star
                                key={index}
                                className={
                                  index < (ticketReview.rating ?? 0)
                                    ? 'h-4 w-4 fill-[#F59E0B] text-[#F59E0B]'
                                    : 'h-4 w-4 text-[#D0D5DD]'
                                }
                              />
                            ))}
                          </div>
                          {ticketReview.comment?.trim() ? (
                            <div className="mt-2 font-cairo text-[12px] font-semibold leading-[20px] text-[#667085]">
                              {ticketReview.comment}
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>

                    <div className="rounded-[12px] border border-[#EEF2F6] bg-white px-4 py-4">
                      <div className="font-cairo text-[12px] font-extrabold text-[#111827]">
                        الأعراض
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {active.symptoms.length ? (
                          active.symptoms.map((s) => (
                            <span
                              key={s}
                              className="inline-flex h-[24px] items-center justify-center rounded-[6px] bg-[#FEE2E2] px-3 font-cairo text-[11px] font-extrabold text-[#B42318]"
                            >
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="font-cairo text-[12px] font-semibold text-[#98A2B3]">
                            —
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <section className="px-4 mt-4">
                    <div className="flex justify-between items-center">
                      <h2 className="font-cairo text-[12px] font-extrabold text-[#111827]">
                        سجل المحادثة ({activeMessages.length} رد):
                      </h2>
                    </div>

                    <div className="mt-3 space-y-3">
                      {detailsQuery.isLoading && expandedId ? (
                        <div className="flex items-center justify-center gap-2 py-8 font-cairo text-[12px] font-semibold text-[#667085]">
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          جاري تحميل الرسائل…
                        </div>
                      ) : null}
                      {activeMessages.map((m) => {
                        const isSelected = selectedMessageId === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setSelectedMessageId(m.id)}
                            className={
                              isSelected
                                ? 'w-full rounded-[10px] border border-[#EEF2F6] bg-[#0F8F8B1A] px-4 py-3 text-right'
                                : 'w-full rounded-[10px] border border-[#EEF2F6] bg-white px-4 py-3 text-right'
                            }
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex gap-2 items-center">
                                <User className="h-4 w-4 text-[#98A2B3]" />
                                <div className="font-cairo text-[12px] font-extrabold text-[#111827]">
                                  {m.authorName}
                                </div>
                                {m.isNew ? (
                                  <span className="inline-flex h-[18px] items-center justify-center rounded-[6px] bg-[#F43F5E] px-2 font-cairo text-[10px] font-extrabold text-white">
                                    جديد
                                  </span>
                                ) : null}
                              </div>
                              <div className="font-cairo text-[11px] font-semibold text-[#98A2B3]">
                                {m.timeLabel}
                              </div>
                            </div>
                            <div className="mt-2 font-cairo text-[12px] font-semibold leading-[20px] text-[#667085]">
                              {m.text}
                            </div>
                            <ConsultationAttachmentList
                              attachments={m.attachmentFiles ?? []}
                              doctorId={doctorId}
                              patientId={activePatientId}
                              title="مرفقات الرسالة"
                            />
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  <ConsultationReplyPanel
                    patientId={activePatientId}
                    disabled={!canReply}
                    draft={draft}
                    onDraftChange={setDraft}
                    pendingAttachments={pendingAttachments}
                    onPendingChange={setPendingAttachments}
                    sending={sendMessage.isPending}
                    onSend={handleSendReply}
                    onClose={() => setCloseOpen(true)}
                    onDismiss={() => setDismissOpen(true)}
                    closing={updateStatus.isPending}
                  />
                </div>
              </section>
            ) : (
              <div className="flex min-h-[320px] flex-1 items-center justify-center rounded-[14px] border border-[#E5E7EB] bg-white p-6 text-center shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
                <div className="font-cairo text-[14px] font-extrabold text-[#111827]">
                  لا توجد استشارات
                </div>
              </div>
            )}
          </div>
        )}

        <ConsultationDismissDialog
          open={dismissOpen}
          onOpenChange={setDismissOpen}
          busy={updateStatus.isPending}
          onConfirm={handleDismissConsultation}
        />

        <ConfirmActionDialog
          open={closeOpen}
          onOpenChange={setCloseOpen}
          title="إنهاء الاستشارة"
          description="هل أنت متأكد من إغلاق هذه الاستشارة؟ لن يتمكن المريض من إرسال رسائل جديدة بعد الإغلاق."
          confirmLabel="إغلاق الاستشارة"
          confirmDisabled={updateStatus.isPending}
          onConfirm={handleCloseConsultation}
        />

        <div className="h-10" />
      </div>
    </>
  );
}
