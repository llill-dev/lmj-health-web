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
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
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
      toast(tr("تم حجز الموعد من قائمة الانتظار بنجاح.", "The appointment was booked from the waitlist successfully."), {
        title: tr("تم الحجز", "Booked"),
        variant: "success",
      });
    } catch {
      toast(tr("تعذر حجز الموعد. حاول مرة أخرى.", "Could not book the appointment. Please try again."), {
        title: tr("خطأ", "Error"),
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
            {tr("اقتراحات المواعيد", "Appointment suggestions")}
          </h1>
          <p className="mt-1 font-cairo text-sm font-medium text-[#64748b]">
            {tr("اقتراحات مواعيد للمرضى", "Appointment suggestions for patients")}
            {suggestionsQuery.isRefetching
              ? tr(" • جاري تحديث البيانات", " • Refreshing data")
              : ""}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
        <div className="mb-4">
          <label className="mb-2 block font-cairo text-sm font-bold text-[#0f172a]">
            {tr("التاريخ", "Date")}
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
            {tr("اقتراحات متاحة", "Available suggestions")}
          </h3>
          <p className="mt-1 font-cairo text-xs font-medium text-[#64748b]">
            {tr(
              "مرضى من قائمة الانتظار يناسبهم أحد الأوقات المتاحة أدناه.",
              "Waitlisted patients whose preferences match one of the free slots below.",
            )}
          </p>
        </div>
        <div className="space-y-4">
          {!canViewSuggestions ? (
            <div className="rounded-lg bg-gray-50 p-4 text-center font-cairo text-sm font-semibold text-[#64748b]">
              {tr(
                "ليست لديك صلاحية عرض اقتراحات المواعيد.",
                "You do not have permission to view appointment suggestions.",
              )}
            </div>
          ) : suggestionsQuery.isLoading ? (
            <div className="rounded-lg bg-gray-50 p-4 text-center font-cairo text-sm font-semibold text-[#64748b]">
              {tr("جاري تحميل الاقتراحات...", "Loading suggestions...")}
            </div>
          ) : suggestionsQuery.isError ? (
            <div className="rounded-lg bg-gray-50 p-4 text-center font-cairo text-sm font-semibold text-[#64748b]">
              <p>
                {tr(
                  "تعذر تحميل اقتراحات المواعيد حالياً.",
                  "Could not load appointment suggestions right now.",
                )}
              </p>
              <button
                type="button"
                onClick={() => void suggestionsQuery.refetch()}
                disabled={suggestionsQuery.isRefetching}
                className="mt-3 rounded-lg border border-[#e2e8f0] bg-white px-4 py-2 font-cairo text-xs font-bold text-[#0f172a] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {suggestionsQuery.isRefetching
                  ? tr("جاري إعادة المحاولة...", "Retrying...")
                  : tr("إعادة المحاولة", "Retry")}
              </button>
            </div>
          ) : suggestionsBySlot.every(
              (slot) =>
                !(slot.candidates ?? []).some(
                  (candidate) => candidate.id && !dismissedIds.has(candidate.id),
                ),
            ) ? (
            <div className="rounded-lg bg-gray-50 p-4 text-center font-cairo text-sm font-semibold text-[#64748b]">
              {tr(
                "لا توجد اقتراحات متاحة لهذا التاريخ.",
                "No suggestions available for this date.",
              )}
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
                              {candidate.patientName || tr("مريض", "Patient")}
                            </p>
                            <p className="font-cairo text-xs font-medium text-[#64748b]">
                              {candidate.patientPublicId || candidate.patientId || "—"}
                              {candidate.urgencyLevel
                                ? ` • ${tr("الأولوية", "Priority")}: ${candidate.urgencyLevel}`
                                : ""}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={!canBookFromWaitlist || isBusy}
                            onClick={() => void handleAccept(candidate.id!, slot.startTime)}
                            className="rounded-lg bg-primary px-3 py-1.5 font-cairo text-xs font-bold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label={tr("حجز الموعد لهذا المريض", "Book this patient into the slot")}
                            title={
                              !canBookFromWaitlist
                                ? tr("يتطلب صلاحية الحجز من قائمة الانتظار", "Requires waitlist booking permission")
                                : undefined
                            }
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDismiss(candidate.id!)}
                            className="rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 font-cairo text-xs font-bold text-[#0f172a] transition hover:bg-gray-50"
                            aria-label={tr("تجاهل الاقتراح", "Dismiss suggestion")}
                            title={tr("إخفاء هذا الاقتراح فقط — لا يغيّر حالة قائمة الانتظار", "Only hides this suggestion — does not change waitlist state")}
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
