import { Calendar, Clock, Check, X } from "lucide-react";

export default function SecretaryAppointmentSuggestionsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Suggestions Card */}
      <div className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="font-cairo text-lg font-bold text-[#0f172a]">
            اقتراحات متاحة
          </h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-cairo text-sm font-bold text-[#0f172a]">
                  2024-01-20
                </p>
                <p className="font-cairo text-xs font-medium text-[#64748b]">
                  09:00 - 10:00
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-lg bg-primary px-3 py-1.5 font-cairo text-xs font-bold text-white transition hover:bg-primary/90">
                <Check className="h-4 w-4" />
              </button>
              <button className="rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 font-cairo text-xs font-bold text-[#0f172a] transition hover:bg-gray-50">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-cairo text-sm font-bold text-[#0f172a]">
                  2024-01-20
                </p>
                <p className="font-cairo text-xs font-medium text-[#64748b]">
                  10:30 - 11:30
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-lg bg-primary px-3 py-1.5 font-cairo text-xs font-bold text-white transition hover:bg-primary/90">
                <Check className="h-4 w-4" />
              </button>
              <button className="rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 font-cairo text-xs font-bold text-[#0f172a] transition hover:bg-gray-50">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-cairo text-sm font-bold text-[#0f172a]">
                  2024-01-21
                </p>
                <p className="font-cairo text-xs font-medium text-[#64748b]">
                  14:00 - 15:00
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-lg bg-primary px-3 py-1.5 font-cairo text-xs font-bold text-white transition hover:bg-primary/90">
                <Check className="h-4 w-4" />
              </button>
              <button className="rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 font-cairo text-xs font-bold text-[#0f172a] transition hover:bg-gray-50">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
