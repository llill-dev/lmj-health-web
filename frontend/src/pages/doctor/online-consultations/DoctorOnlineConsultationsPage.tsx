import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  CheckCircle2,
  Clock,
  Loader2,
  Search,
  Shield,
  User,
  Star,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import ConfirmActionDialog from '@/components/doctor/confirm-action-dialog';
import {
  DoctorExpandableCardSkeleton,
  DoctorInlineDetailsSkeleton,
} from '@/components/doctor/shared/skeletons';
import DoctorDashboardOverview from '@/components/doctor/dashboard/doctor-dashboard-overview';
import { useToast } from '@/components/ui/ToastProvider';
import {
  useConsultationClinicalNavigation,
  useConsultationsList,
  useConsultationDetails,
  useMarkConsultationRead,
  useSendConsultationMessage,
  useUpdateConsultationStatus,
} from '@/hooks';
import { getUserFacingRequestErrorMessage } from '@/lib/api';
import { isAwaitingInitialQueryData } from '@/lib/query/queryUi';
import { readAuthUser } from '@/lib/cookies';
import ConsultationAttachmentList, {
  type ConsultationAttachmentItem,
} from '@/components/doctor/consultations/consultation-attachment-list';
import DoctorConsultationExpandableCard, {
  CONSULTATIONS_EXPAND_CONTENT_ITEM,
} from '@/components/doctor/consultations/doctor-consultation-expandable-card';
import {
  CONSULTATIONS_LIST_ITEM,
  CONSULTATIONS_LIST_STAGGER,
} from '@/components/doctor/consultations/consultations-motion';
import ConsultationReplyPanel from '@/components/doctor/consultations/consultation-reply-panel';
import ConsultationDismissDialog from '@/components/doctor/consultations/consultation-dismiss-dialog';
import { ConsultationsListPanel } from '@/components/doctor/consultations/consultations-list-panel';
import {
  ConsultationsStatusTabs,
  type ConsultationStatusTab,
} from '@/components/doctor/consultations/consultations-status-tabs';
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

function tabToApiStatus(tab: ConsultationStatusTab): ConsultationTicketStatus {
  if (tab === 'waiting') return 'pending';
  if (tab === 'in_progress') return 'active';
  return 'closed';
}

function isTerminalConsultationStatus(status: ConsultationStatus) {
  return status === 'closed' || status === 'dismissed';
}

export default function DoctorOnlineConsultationsPage() {
  const { toast } = useToast();
  const doctorId = readAuthUser()?.actorIds?.doctorId ?? '';
  const [tab, setTab] = useState<ConsultationStatusTab>('waiting');
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
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
  const overviewQuery = useConsultationsList();
  const updateStatus = useUpdateConsultationStatus();
  const markRead = useMarkConsultationRead();

  const consultations = useMemo(() => {
    return (listQuery.data?.tickets ?? [])
      .map(mapConsultationTicketToUi)
      .filter((c) => c.id);
  }, [listQuery.data?.tickets]);

  const listAwaitingData = isAwaitingInitialQueryData(
    listQuery.data,
    listQuery.isError,
  );
  const overviewAwaitingData = isAwaitingInitialQueryData(
    overviewQuery.data,
    overviewQuery.isError,
  );

  const unreadById = useMemo(() => {
    const map = new Map<string, number>();
    for (const ticket of listQuery.data?.tickets ?? []) {
      if (ticket._id) {
        map.set(ticket._id, ticket.unreadForDoctor ?? 0);
      }
    }
    return map;
  }, [listQuery.data?.tickets]);

  const detailsQuery = useConsultationDetails(expandedId);
  const detailsAwaitingData =
    Boolean(expandedId) &&
    isAwaitingInitialQueryData(detailsQuery.data, detailsQuery.isError);
  const sendMessage = useSendConsultationMessage(expandedId ?? '');

  const overviewStats = useMemo(() => {
    const counts = overviewQuery.data?.counts;
    const tickets = overviewQuery.data?.tickets ?? [];
    if (counts) {
      return {
        new: counts.pending ?? 0,
        active: counts.active ?? 0,
        closed: counts.closed ?? 0,
        loading: overviewAwaitingData,
      };
    }
    return {
      new: tickets.filter((t) => t.status === 'pending').length,
      active: tickets.filter((t) => t.status === 'active').length,
      closed: tickets.filter((t) => t.status === 'closed').length,
      loading: overviewAwaitingData,
    };
  }, [overviewQuery.data?.counts, overviewQuery.data?.tickets, overviewAwaitingData]);

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
    visibleConsultations.find((c) => c.id === expandedId) ?? null;

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

  const consultationAttachments = useMemo((): ConsultationAttachmentItem[] => {
    const items: ConsultationAttachmentItem[] = ticketAttachmentFiles.map(
      (file) => ({
        ...file,
        senderLabel: 'المريض',
      }),
    );

    for (const message of activeMessages) {
      for (const file of message.attachmentFiles ?? []) {
        items.push({
          ...file,
          senderLabel: message.author === 'doctor' ? 'أنت' : 'المريض',
        });
      }
    }

    return items;
  }, [activeMessages, ticketAttachmentFiles]);

  const tabCounts = useMemo(
    () => ({
      waiting: overviewStats.new,
      in_progress: overviewStats.active,
      closed: overviewStats.closed,
    }),
    [overviewStats.active, overviewStats.closed, overviewStats.new],
  );

  const canReply =
    Boolean(active) &&
    !isTerminalConsultationStatus(active.status) &&
    Boolean(expandedId) &&
    !sendMessage.isPending;

  const clinicalNavigation = useConsultationClinicalNavigation({
    doctorId,
    patientId: activePatientId,
    consultationId: expandedId ?? '',
    consultationSubject: active?.title ?? detailsQuery.data?.ticket?.subject,
    returnTo: '/doctor/online-consultations',
    onError: (message) => {
      toast(message, {
        title: 'تعذّر فتح الأداة السريرية',
        variant: 'error',
      });
    },
  });

  useEffect(() => {
    if (!expandedId) return;
    if (!visibleConsultations.some((c) => c.id === expandedId)) {
      setExpandedId(null);
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

  const handleTabChange = (next: ConsultationStatusTab) => {
    setTab(next);
    setExpandedId(null);
    setDraft('');
    setPendingAttachments([]);
    setSelectedMessageId(null);
  };

  return (
    <>
      <Helmet>
        <title>Online Consultations • LMJ Health</title>
      </Helmet>

      <div dir="rtl" lang="ar">
        <DoctorDashboardOverview
          variant="consultations"
          surface="mint"
          title="الاستشارات"
          subtitle="الاستشارات المرسلة إليك من المرضى"
          headerIcon={<Shield className="h-8 w-8 text-white" aria-hidden />}
          kpis={[
            {
              key: 'active',
              icon: <Activity className="h-5 w-5 shrink-0" aria-hidden />,
              value: overviewStats.loading ? '—' : overviewStats.active,
              label: 'نشط',
            },
            {
              key: 'closed',
              icon: <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden />,
              value: overviewStats.loading ? '—' : overviewStats.closed,
              label: 'مغلق',
            },
            {
              key: 'new',
              icon: <Clock className="h-5 w-5 shrink-0" aria-hidden />,
              value: overviewStats.loading ? '—' : overviewStats.new,
              label: 'جديد',
            },
          ]}
        />

        <section className="mt-4 rounded-[12px] border border-[#E5E7EB] bg-white p-3 shadow-[0_10px_25px_rgba(0,0,0,0.06)]">
          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث في الطلبات..."
              className="h-[40px] w-full rounded-[6px] border border-[#E5E7EB] bg-white ps-11 pe-4 font-cairo text-[13px] font-semibold text-[#111827] outline-none placeholder:font-cairo placeholder:font-medium placeholder:text-[#98A2B3]"
            />
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#98A2B3]">
              <Search className="h-[18px] w-[18px]" />
            </div>
          </div>

          <div className="mt-3">
            <ConsultationsStatusTabs
              value={tab}
              onChange={handleTabChange}
              counts={tabCounts}
              disabled={listAwaitingData}
            />
          </div>
        </section>

        {listAwaitingData ? (
          <div className="mt-6">
            <DoctorExpandableCardSkeleton count={4} expanded />
          </div>
        ) : listQuery.isError ? (
          <div className="mt-6 rounded-[14px] border border-[#FEE2E2] bg-[#FFF1F2] px-6 py-10 text-center font-cairo text-[13px] font-semibold text-[#B42318]">
            تعذّر تحميل الاستشارات. حاول تحديث الصفحة.
          </div>
        ) : (
          <ConsultationsListPanel
            panelKey={tab}
            isRefreshing={false}
          >
            <div className="mt-5 space-y-4">
              {visibleConsultations.length === 0 ? (
                <div className="rounded-[14px] border border-[#E5E7EB] bg-white px-6 py-16 text-center shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
                  <div className="font-cairo text-[14px] font-extrabold text-[#111827]">
                    لا توجد استشارات في هذا التصنيف
                  </div>
                </div>
              ) : (
                <motion.div
                  key={`${tab}-list`}
                  variants={CONSULTATIONS_LIST_STAGGER}
                  initial="hidden"
                  animate="show"
                  className="space-y-4"
                >
                <AnimatePresence mode="popLayout">
                  {visibleConsultations.map((item) => {
                    const isExpanded = expandedId === item.id;
                    const showActiveDetails = isExpanded && active?.id === item.id;

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        variants={CONSULTATIONS_LIST_ITEM}
                        initial="hidden"
                        animate="show"
                        exit="exit"
                      >
                        <DoctorConsultationExpandableCard
                          consultation={item}
                          unreadCount={unreadById.get(item.id) ?? 0}
                          expanded={isExpanded}
                          onToggle={() =>
                            setExpandedId((current) =>
                              current === item.id ? null : item.id,
                            )
                          }
                        >
                          {showActiveDetails && active ? (
                            <>
                              <motion.div variants={CONSULTATIONS_EXPAND_CONTENT_ITEM}>
                                <div className="font-cairo text-[12px] font-extrabold text-[#111827]">
                                  عنوان المشكلة
                                </div>
                                <div className="mt-2 font-cairo text-[13px] font-semibold leading-[22px] text-[#667085]">
                                  {active.title || '—'}
                                </div>
                              </motion.div>

                              <motion.div variants={CONSULTATIONS_EXPAND_CONTENT_ITEM}>
                                <div className="font-cairo text-[12px] font-extrabold text-[#111827]">
                                  وصف المشكلة
                                </div>
                                <div className="mt-2 font-cairo text-[13px] font-semibold leading-[22px] text-[#667085]">
                                  {active.description || '—'}
                                </div>
                              </motion.div>

                              {consultationAttachments.length > 0 ? (
                                <motion.div variants={CONSULTATIONS_EXPAND_CONTENT_ITEM}>
                                  <ConsultationAttachmentList
                                    attachments={consultationAttachments}
                                    doctorId={doctorId}
                                    patientId={activePatientId}
                                    title="الملفات المرفقة"
                                    variant="cards"
                                  />
                                </motion.div>
                              ) : null}

                              {active.symptoms.length > 0 ? (
                                <motion.div variants={CONSULTATIONS_EXPAND_CONTENT_ITEM}>
                                  <div className="font-cairo text-[12px] font-extrabold text-[#111827]">
                                    الأعراض
                                  </div>
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {active.symptoms.map((s) => (
                                      <span
                                        key={s}
                                        className="inline-flex h-[24px] items-center justify-center rounded-[6px] bg-[#FEE2E2] px-3 font-cairo text-[11px] font-extrabold text-[#B42318]"
                                      >
                                        {s}
                                      </span>
                                    ))}
                                  </div>
                                </motion.div>
                              ) : null}

                              {closedReason ? (
                                <motion.div
                                  variants={CONSULTATIONS_EXPAND_CONTENT_ITEM}
                                  className="rounded-[8px] bg-[#FFF7ED] px-3 py-2 font-cairo text-[12px] font-semibold text-[#B45309]"
                                >
                                  سبب الإغلاق: {closedReason}
                                </motion.div>
                              ) : null}

                              {ticketReview?.rating ? (
                                <motion.div
                                  variants={CONSULTATIONS_EXPAND_CONTENT_ITEM}
                                  className="rounded-[8px] border border-[#EEF2F6] bg-[#F9FAFB] px-3 py-3"
                                >
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
                                </motion.div>
                              ) : null}

                              <motion.section
                                variants={CONSULTATIONS_EXPAND_CONTENT_ITEM}
                              >
                                <h2 className="font-cairo text-[12px] font-extrabold text-[#111827]">
                                  سجل المحادثة ({activeMessages.length} رد)
                                </h2>

                                <div className="mt-3 space-y-3">
                                  {detailsAwaitingData ? (
                                    <DoctorInlineDetailsSkeleton rows={5} />
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
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
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
                                          attachments={(m.attachmentFiles ?? []).map(
                                            (file) => ({
                                              ...file,
                                              senderLabel:
                                                m.author === 'doctor'
                                                  ? 'أنت'
                                                  : 'المريض',
                                            }),
                                          )}
                                          doctorId={doctorId}
                                          patientId={activePatientId}
                                          title="مرفقات الرسالة"
                                        />
                                      </button>
                                    );
                                  })}
                                </div>
                              </motion.section>

                              <motion.div variants={CONSULTATIONS_EXPAND_CONTENT_ITEM}>
                                <ConsultationReplyPanel
                                  patientId={activePatientId}
                                  clinicalActionsEnabled={
                                    canReply &&
                                    Boolean(doctorId) &&
                                    Boolean(activePatientId) &&
                                    Boolean(expandedId)
                                  }
                                  busyClinicalAction={clinicalNavigation.busyAction}
                                  onClinicalAction={clinicalNavigation.openClinicalAction}
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
                              </motion.div>
                            </>
                          ) : null}
                        </DoctorConsultationExpandableCard>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            )}
            </div>
          </ConsultationsListPanel>
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
