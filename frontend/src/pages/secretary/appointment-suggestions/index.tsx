import { useMemo, useState } from "react";
import { Calendar, Check, Clock, X } from "lucide-react";
import {
  useWaitlistSuggestions,
  useWaitlistMutations,
} from "@/hooks/doctor/waitlist/useDoctorWaitlist";
import { useSecretaryPermissions } from "@/hooks/secretary/useSecretaryPermissions";
import { useToast } from "@/components/ui/ToastProvider";
import { useI18n } from "@/i18n/provider";

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function SecretaryAppointmentSuggestionsPage() {
  const { locale, dir, t } = useI18n();
  const { toast } = useToast();
  const { hasPermission } = useSecretaryPermissions();
  const today = useMemo(() => formatLocalDate(new Date()), []);
  const [date, setDate] = useState(today);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  // Reading suggestions only requires waitlist:view — booking from a
  // suggestion additionally requires waitlist:book (checked per-action below).
  const canViewSuggestions = hasPermission("waitlist:view");
  const canBookFromWaitlist = hasPermission("waitlist:book");
  const { bookRequest, isBusy } = useWaitlistMutations();
  const suggestionsQuery = useWaitlistSuggestions(
    { date, type: "slotCandidates" },
    canViewSuggestions && Boolean(date),
  );
  const suggestionsBySlot = suggestionsQuery.data?.suggestionsBySlot ?? [];

  const handleAccept = async (
    candidateId: string,
    startTime: string | undefined,
  ) => {
    if (!startTime) return;
    try {
      await bookRequest({
        id: candidateId,
        body: { date, startTime },
      });
      toast(t("secretary.appointmentSuggestions.bookSuccess"), {
        title: t("secretary.appointmentSuggestions.booked"),
        variant: "success",
      });
    } catch {
      toast(t("secretary.appointmentSuggestions.bookError"), {
        title: t("secretary.appointmentSuggestions.error"),
        variant: "error",
      });
    }
  };

  const handleDismiss = (candidateId: string) => {
    // No backend "dismiss suggestion" endpoint exists — this only hides the
    // candidate locally for this session, it does not change waitlist state.
    setDismissedIds((prev) => new Set(prev).add(candidateId));
  };

  return (
    <div dir={dir} lang={locale} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-cairo text-2xl font-bold text-[#0f172a]">
            {t("secretary.appointmentSuggestions.title")}
          </h1>
          <p className="mt-1 font-cairo text-sm font-medium text-[#64748b]">
            {t("secretary.appointmentSuggestions.subtitle")}
            {suggestionsQuery.isRefetching
              ? t("secretary.appointmentSuggestions.refreshingData")
              : ""}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
        <div className="mb-4">
          <label className="mb-2 block font-cairo text-sm font-bold text-[#0f172a]">
            {t("secretary.appointmentSuggestions.date")}
          </label>
          <input
            type="date"
            value={date}
            min={today}
            onChange={(event) => {
              setDate(event.target.value);
              setDismissedIds(new Set());
            }}
            className="h-10 rounded-xl border border-[#e2e8f0] px-3 font-cairo text-sm text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div className="mb-4">
          <h3 className="font-cairo text-lg font-bold text-[#0f172a]">
            {t("secretary.appointmentSuggestions.availableSuggestions")}
          </h3>
          <p className="mt-1 font-cairo text-xs font-medium text-[#64748b]">
            {t("secretary.appointmentSuggestions.description")}
          </p>
        </div>
        <div className="space-y-4">
          {!canViewSuggestions ? (
            <div className="rounded-lg bg-gray-50 p-4 text-center font-cairo text-sm font-semibold text-[#64748b]">
              {t("secretary.appointmentSuggestions.noPermission")}
            </div>
          ) : suggestionsQuery.isLoading ? (
            <div className="rounded-lg bg-gray-50 p-4 text-center font-cairo text-sm font-semibold text-[#64748b]">
              {t("secretary.appointmentSuggestions.loading")}
            </div>
          ) : suggestionsQuery.isError ? (
            <div className="rounded-lg bg-gray-50 p-4 text-center font-cairo text-sm font-semibold text-[#64748b]">
              <p>{t("secretary.appointmentSuggestions.loadError")}</p>
              <button
                type="button"
                onClick={() => void suggestionsQuery.refetch()}
                disabled={suggestionsQuery.isRefetching}
                className="mt-3 rounded-lg border border-[#e2e8f0] bg-white px-4 py-2 font-cairo text-xs font-bold text-[#0f172a] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {suggestionsQuery.isRefetching
                  ? t("secretary.appointmentSuggestions.retrying")
                  : t("secretary.appointmentSuggestions.retry")}
              </button>
            </div>
          ) : suggestionsBySlot.every(
              (slot) =>
                !(slot.candidates ?? []).some(
                  (candidate) =>
                    candidate.id && !dismissedIds.has(candidate.id),
                ),
            ) ? (
            <div className="rounded-lg bg-gray-50 p-4 text-center font-cairo text-sm font-semibold text-[#64748b]">
              {t("secretary.appointmentSuggestions.noSuggestions")}
            </div>
          ) : (
            suggestionsBySlot.map((slot, slotIndex) => {
              const candidates = (slot.candidates ?? []).filter(
                (candidate) => candidate.id && !dismissedIds.has(candidate.id),
              );
              if (candidates.length === 0) return null;
              return (
                <div
                  key={`${slot.startTime}-${slotIndex}`}
                  className="rounded-lg border border-[#e2e8f0] p-4"
                >
                  <div className="mb-3 flex items-center gap-2 font-cairo text-sm font-bold text-[#0f172a]">
                    <Clock className="h-4 w-4 text-primary" />
                    {slot.startTime || "—"} - {slot.endTime || "—"}
                  </div>
                  <div className="space-y-2">
                    {candidates.map((candidate) => (
                      <div
                        key={candidate.id}
                        className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                            <Calendar className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-cairo text-sm font-bold text-[#0f172a]">
                              {candidate.patientName ||
                                t("secretary.appointmentSuggestions.patient")}
                            </p>
                            <p className="font-cairo text-xs font-medium text-[#64748b]">
                              {candidate.patientPublicId ||
                                candidate.patientId ||
                                "—"}
                              {candidate.urgencyLevel
                                ? ` • ${t("secretary.appointmentSuggestions.priority")}: ${candidate.urgencyLevel}`
                                : ""}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={!canBookFromWaitlist || isBusy}
                            onClick={() =>
                              void handleAccept(candidate.id!, slot.startTime)
                            }
                            className="rounded-lg bg-primary px-3 py-1.5 font-cairo text-xs font-bold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label={t(
                              "secretary.appointmentSuggestions.bookPatient",
                            )}
                            title={
                              !canBookFromWaitlist
                                ? t(
                                    "secretary.appointmentSuggestions.requiresPermission",
                                  )
                                : undefined
                            }
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDismiss(candidate.id!)}
                            className="rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 font-cairo text-xs font-bold text-[#0f172a] transition hover:bg-gray-50"
                            aria-label={t(
                              "secretary.appointmentSuggestions.dismiss",
                            )}
                            title={t(
                              "secretary.appointmentSuggestions.dismissHint",
                            )}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
