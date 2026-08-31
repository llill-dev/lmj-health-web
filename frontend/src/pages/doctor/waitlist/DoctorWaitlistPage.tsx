"use client";

import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CalendarClock,
  CheckCircle,
  Hourglass,
  Phone,
  Sparkles,
} from "lucide-react";
import DoctorDashboardOverview from "@/components/doctor/dashboard/doctor-dashboard-overview";
import { MedicalRecordsPagination } from "@/components/doctor/medical-records/medical-records-pagination";
import { DoctorListEmptyIllustration } from "@/components/doctor/shared/doctor-list-empty-illustration";
import DoctorListErrorState from "@/components/doctor/shared/doctor-list-error-state";
import {
  DoctorTableSkeleton,
  DoctorToolbarSkeleton,
} from "@/components/doctor/shared/skeletons";
import { WaitlistBookDialog } from "@/components/doctor/waitlist/waitlist-book-dialog";
import { WaitlistTable } from "@/components/doctor/waitlist/waitlist-table";
import { WaitlistToolbar } from "@/components/doctor/waitlist/waitlist-toolbar";
import WaitlistSuggestionsDialog from "@/components/doctor/waitlist/waitlist-suggestions-dialog";
import { useToast } from "@/components/ui/ToastProvider";
import {
  useDoctorWaitlist,
  useWaitlistMutations,
} from "@/hooks/doctor/waitlist/useDoctorWaitlist";
import { useAvailableAppointmentTypes } from "@/hooks/doctor/appointments/useAppointmentTypes";
import { getUserFacingRequestErrorMessage } from "@/lib/api";
import { useRetryAction } from "@/lib/query/useRetryAction";
import {
  waitlistStatusLabel,
  waitlistUrgencyLabel,
} from "@/lib/doctor/waitlist/labels";
import type {
  WaitlistRequest,
  WaitlistStatus,
} from "@/lib/doctor/waitlist/types";
import { readAuthUser } from "@/lib/cookies";
import { useI18n } from "@/i18n/provider";

export default function DoctorWaitlistPage() {
  const { t, locale, dir } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const focusRequestId = searchParams.get("request")?.trim() ?? "";
  const { toast } = useToast();
  const doctorId = readAuthUser()?.actorIds?.doctorId ?? "";

  const [statusTab, setStatusTab] = useState<"all" | WaitlistStatus>("active");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const listParams = useMemo(
    () => ({
      status: statusTab === "all" ? undefined : statusTab,
      q: search.trim() || undefined,
      page,
      limit: pageSize,
    }),
    [page, pageSize, search, statusTab],
  );

  const list = useDoctorWaitlist(listParams);
  const totalAllQuery = useDoctorWaitlist({ page: 1, limit: 1 });
  const activeTotalQuery = useDoctorWaitlist({
    status: "active",
    page: 1,
    limit: 1,
  });
  const contactedTotalQuery = useDoctorWaitlist({
    status: "contacted",
    page: 1,
    limit: 1,
  });
  const bookedTotalQuery = useDoctorWaitlist({
    status: "booked",
    page: 1,
    limit: 1,
  });
  const mutations = useWaitlistMutations();
  const { appointmentTypes } = useAvailableAppointmentTypes(doctorId);
  const { retry: retryList, retrying: retryingList } = useRetryAction(() =>
    list.refetch(),
  );

  const [bookTarget, setBookTarget] = useState<WaitlistRequest | null>(null);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [search, statusTab, pageSize]);

  useEffect(() => {
    if (!focusRequestId) return;
    setStatusTab("active");
  }, [focusRequestId]);

  useEffect(() => {
    if (page > list.totalPages) setPage(list.totalPages);
  }, [list.totalPages, page]);

  const isFilteredEmpty =
    list.requests.length === 0 &&
    !list.isAwaitingData &&
    !list.isError &&
    (search.trim().length > 0 || statusTab !== "all");

  const isTrulyEmpty =
    list.requests.length === 0 &&
    !list.isAwaitingData &&
    !list.isError &&
    !isFilteredEmpty;

  const showingFrom = list.total === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingTo = Math.min(page * pageSize, list.total);

  const handleContacted = async (request: WaitlistRequest) => {
    try {
      await mutations.markContacted({ id: request._id });
      toast(t("doctor.waitlist.contactedSuccess"), {
        variant: "success",
      });
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), { variant: "error" });
    }
  };

  const handleClose = async (request: WaitlistRequest) => {
    const reason =
      window.prompt(t("doctor.waitlist.closeReasonPrompt")) ?? undefined;
    try {
      await mutations.closeRequest({
        id: request._id,
        closedReason: reason?.trim() || undefined,
      });
      toast(t("doctor.waitlist.closed"), {
        variant: "success",
      });
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), { variant: "error" });
    }
  };

  return (
    <>
      <Helmet>
        <title>{t("doctor.waitlist.pageTitle")}</title>
      </Helmet>

      <div dir={dir} lang={locale} className="w-full pb-8 sm:pb-10">
        <DoctorDashboardOverview
          variant="appointments"
          surface="mint"
          kpiColumns={4}
          title={t("doctor.waitlist.title")}
          headerIcon={<Hourglass className="h-8 w-8 text-white" />}
          subtitle={
            <span>
              <span className="font-extrabold text-primary">
                {totalAllQuery.isAwaitingData ? "—" : totalAllQuery.total}
              </span>
              <span className="text-primary/90">
                {" "}
                {t("doctor.waitlist.subtitle")}
              </span>
            </span>
          }
          headerActions={
            <div className="flex flex-col items-stretch justify-end gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <motion.button
                type="button"
                onClick={() => setSuggestionsOpen(true)}
                className="flex h-[48px] items-center gap-2 rounded-[6px] border-[1.5px] border-primary bg-[#E6F4F3] px-4 font-cairo text-[14px] font-bold text-primary shadow-[0px_6px_16px_-4px_rgba(15,143,139,0.15)] transition hover:bg-[#DDF0EF]"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.12, ease: "easeOut" }}
              >
                <Sparkles className="h-4 w-4" aria-hidden />
                <span>{t("doctor.waitlist.appointmentSuggestions")}</span>
              </motion.button>
              <motion.button
                type="button"
                onClick={() => navigate("/doctor/appointments")}
                className="flex h-[48px] items-center gap-2 rounded-[6px] border-[1.5px] border-primary bg-white px-4 font-cairo text-[14px] font-bold text-primary shadow-[0px_6px_16px_-4px_rgba(15,143,139,0.2)] transition hover:bg-[#F0FDFA]"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.12, ease: "easeOut" }}
              >
                <CalendarClock className="h-4 w-4" aria-hidden />
                <span>{t("doctor.waitlist.viewAppointments")}</span>
              </motion.button>
            </div>
          }
          kpis={[
            {
              key: "active",
              icon: <Hourglass className="h-5 w-5 shrink-0" />,
              value: activeTotalQuery.isAwaitingData
                ? "—"
                : activeTotalQuery.total,
              label: t("doctor.waitlist.activeRequests"),
            },
            {
              key: "contacted",
              icon: <Phone className="h-5 w-5 shrink-0" />,
              value: contactedTotalQuery.isAwaitingData
                ? "—"
                : contactedTotalQuery.total,
              label: t("doctor.waitlist.contacted"),
            },
            {
              key: "booked",
              icon: <CalendarClock className="h-5 w-5 shrink-0" />,
              value: bookedTotalQuery.isAwaitingData
                ? "—"
                : bookedTotalQuery.total,
              label: t("doctor.waitlist.booked"),
            },
            {
              key: "total",
              icon: <CheckCircle className="h-5 w-5 shrink-0" />,
              value: totalAllQuery.isAwaitingData ? "—" : totalAllQuery.total,
              label: t("doctor.waitlist.totalRequests"),
            },
          ]}
        />

        <section className="rounded-[12px] border border-[#EEF2F6] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.08)] sm:p-6">
          <div className="mb-4" dir={dir}>
            <WaitlistToolbar
              search={search}
              onSearchChange={setSearch}
              onClear={() => {
                setSearch("");
                setStatusTab("active");
              }}
              statusTab={statusTab}
              onStatusTabChange={setStatusTab}
            />
          </div>

          <div className="mt-5 sm:mt-6">
            {list.isAwaitingData && !list.requests.length ? (
              <div className="space-y-4">
                <DoctorToolbarSkeleton tabs={5} />
                <DoctorTableSkeleton rows={8} columns={6} />
              </div>
            ) : list.isError ? (
              <DoctorListErrorState
                title={t("doctor.waitlist.loadFailed")}
                brief={t("doctor.waitlist.loadFailedBrief")}
                retrying={retryingList}
                onRetry={() => void retryList()}
              />
            ) : isTrulyEmpty || isFilteredEmpty ? (
              <DoctorListEmptyIllustration
                variant="teal"
                imageSrc="/images/photo-not-found_appotemint.png"
                imageClassName="drop-shadow-[0_12px_32px_rgba(15,118,110,0.1)]"
                title={
                  isFilteredEmpty
                    ? t("doctor.waitlist.noResultsFilter")
                    : t("doctor.waitlist.noResultsEmpty")
                }
                subtitle={
                  isFilteredEmpty
                    ? t("doctor.waitlist.noResultsFilterSubtitle")
                    : t("doctor.waitlist.noResultsEmptySubtitle")
                }
                actionLabel={t("doctor.waitlist.viewAppointments")}
                onAction={() => navigate("/doctor/appointments")}
                actionIcon={<CalendarClock className="h-4 w-4" />}
              />
            ) : (
              <WaitlistTable
                requests={list.requests}
                busy={mutations.isBusy}
                urgencyLabel={(urgency) => waitlistUrgencyLabel(urgency, t)}
                statusLabel={(status) => waitlistStatusLabel(status, t)}
                highlightRequestId={focusRequestId || undefined}
                onNavigateAppointments={() => navigate("/doctor/appointments")}
                onContacted={(request) => void handleContacted(request)}
                onBook={setBookTarget}
                onClose={(request) => void handleClose(request)}
              />
            )}
          </div>
        </section>

        {!list.isAwaitingData && !list.isError && list.requests.length > 0 ? (
          <div className="mt-5">
            <MedicalRecordsPagination
              page={page}
              totalPages={list.totalPages}
              showingFrom={showingFrom}
              showingTo={showingTo}
              total={list.total}
              pageSize={pageSize}
              itemLabel={t("doctor.waitlist.itemLabel")}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          </div>
        ) : null}
      </div>

      <WaitlistSuggestionsDialog
        open={suggestionsOpen}
        onClose={() => setSuggestionsOpen(false)}
      />

      <WaitlistBookDialog
        open={Boolean(bookTarget)}
        request={bookTarget}
        doctorId={doctorId}
        appointmentTypes={appointmentTypes}
        busy={mutations.isBusy}
        onClose={() => setBookTarget(null)}
        onBook={async (body) => {
          if (!bookTarget) return;
          const response = await mutations.bookRequest({
            id: bookTarget._id,
            body,
          });
          toast(t("doctor.waitlist.bookedSuccess"), { variant: "success" });
          setBookTarget(null);
          if (response.appointment?._id) {
            navigate("/doctor/appointments");
          }
        }}
      />
    </>
  );
}
