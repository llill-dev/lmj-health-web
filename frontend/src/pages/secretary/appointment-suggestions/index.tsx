import { useState } from "react";
import { Calendar, Check, X } from "lucide-react";
import { useWaitlistSuggestions } from "@/hooks/doctor/waitlist/useDoctorWaitlist";
import { useSecretaryPermissions } from "@/hooks/secretary/useSecretaryPermissions";

export default function SecretaryAppointmentSuggestionsPage() {
  const { hasPermission } = useSecretaryPermissions();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const suggestionsQuery = useWaitlistSuggestions({ date }, Boolean(date));
  const suggestions = suggestionsQuery.data?.freeSlots ?? [];
  const canBookFromWaitlist = hasPermission("waitlist:book");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-cairo text-2xl font-bold text-[#0f172a]">
            اقتراحات المواعيد
          </h1>
          <p className="font-cairo text-sm font-medium text-[#64748b] mt-1">
            اقتراحات مواعيد للمرضى
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
        <div className="mb-4">
          <label className="mb-2 block font-cairo text-sm font-bold text-[#0f172a]">
            التاريخ
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
            اقتراحات متاحة
          </h3>
        </div>
        <div className="space-y-3">
          {suggestionsQuery.isLoading ? (
            <div className="rounded-lg bg-gray-50 p-4 text-center font-cairo text-sm font-semibold text-[#64748b]">
              جاري تحميل الاقتراحات...
            </div>
          ) : suggestions.length === 0 ? (
            <div className="rounded-lg bg-gray-50 p-4 text-center font-cairo text-sm font-semibold text-[#64748b]">
              لا توجد اقتراحات متاحة لهذا التاريخ.
            </div>
          ) : (
            suggestions.map((slot, index) => (
              <div key={`${slot.startTime}-${index}`} className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
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
                    <button className="rounded-lg bg-primary px-3 py-1.5 font-cairo text-xs font-bold text-white transition hover:bg-primary/90">
                      <Check className="h-4 w-4" />
                    </button>
                    <button className="rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 font-cairo text-xs font-bold text-[#0f172a] transition hover:bg-gray-50">
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
