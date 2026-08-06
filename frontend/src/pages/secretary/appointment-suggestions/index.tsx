import { useState } from "react";
import { Calendar, Check, X } from "lucide-react";
import { useWaitlistSuggestions } from "@/hooks/doctor/waitlist/useDoctorWaitlist";
import { useSecretaryPermissions } from "@/hooks/secretary/useSecretaryPermissions";
import { useI18n } from "@/i18n/provider";

export default function SecretaryAppointmentSuggestionsPage() {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  const { hasPermission } = useSecretaryPermissions();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const canBookFromWaitlist = hasPermission("waitlist:book");
  const suggestionsQuery = useWaitlistSuggestions(
    { date },
    canBookFromWaitlist && Boolean(date),
  );
  const suggestions = suggestionsQuery.data?.freeSlots ?? [];

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
            onChange={(event) => setDate(event.target.value)}
            className="h-10 rounded-xl border border-[#e2e8f0] px-3 font-cairo text-sm text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div className="mb-4">
          <h3 className="font-cairo text-lg font-bold text-[#0f172a]">
            {tr("اقتراحات متاحة", "Available suggestions")}
          </h3>
        </div>
        <div className="space-y-3">
          {!canBookFromWaitlist ? (
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
          ) : suggestions.length === 0 ? (
            <div className="rounded-lg bg-gray-50 p-4 text-center font-cairo text-sm font-semibold text-[#64748b]">
              {tr(
                "لا توجد اقتراحات متاحة لهذا التاريخ.",
                "No suggestions available for this date.",
              )}
            </div>
          ) : (
            suggestions.map((slot, index) => (
              <div
                key={`${slot.startTime}-${index}`}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-cairo text-sm font-bold text-[#0f172a]">
                      {date}
                    </p>
                    <p className="font-cairo text-xs font-medium text-[#64748b]">
                      {slot.startTime || "—"} - {slot.endTime || "—"}
                    </p>
                  </div>
                </div>
                {canBookFromWaitlist ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="rounded-lg bg-primary px-3 py-1.5 font-cairo text-xs font-bold text-white transition hover:bg-primary/90"
                      aria-label={tr("قبول الاقتراح", "Accept suggestion")}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 font-cairo text-xs font-bold text-[#0f172a] transition hover:bg-gray-50"
                      aria-label={tr("رفض الاقتراح", "Reject suggestion")}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
