import { useI18n } from "@/i18n/provider";

interface Appointment {
  time: string;
  patientName: string;
  status: "scheduled" | "postponed" | "completed";
}

interface TodayScheduleTableProps {
  appointments: Appointment[];
  onViewAppointment?: (appointment: Appointment) => void;
}

export default function TodayScheduleTable({
  appointments,
  onViewAppointment,
}: TodayScheduleTableProps) {
  const { t } = useI18n();

  const getStatusBadge = (status: Appointment["status"]) => {
    switch (status) {
      case "scheduled":
        return (
          <span className="rounded-full bg-emerald-100 px-3 py-1 font-cairo text-xs font-bold text-emerald-700">
            {t("secretary.dashboard.statusScheduled")}
          </span>
        );
      case "postponed":
        return (
          <span className="rounded-full bg-orange-100 px-3 py-1 font-cairo text-xs font-bold text-orange-700">
            {t("secretary.dashboard.statusPostponed")}
          </span>
        );
      case "completed":
        return (
          <span className="rounded-full bg-blue-100 px-3 py-1 font-cairo text-xs font-bold text-blue-700">
            {t("secretary.dashboard.statusCompleted")}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="rounded-xl border border-[#e2e8f0] bg-white shadow-sm">
      <div className="border-b border-[#e2e8f0] px-6 py-4">
        <h3 className="font-cairo text-lg font-bold text-[#0f172a]">
          {t("secretary.dashboard.todaySchedule")}
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#e2e8f0] bg-gray-50">
              <th className="px-6 py-3 text-start font-cairo text-xs font-bold text-[#64748b]">
                {t("secretary.dashboard.time")}
              </th>
              <th className="px-6 py-3 text-start font-cairo text-xs font-bold text-[#64748b]">
                {t("secretary.dashboard.patientName")}
              </th>
              <th className="px-6 py-3 text-start font-cairo text-xs font-bold text-[#64748b]">
                {t("secretary.dashboard.status")}
              </th>
              <th className="px-6 py-3 text-start font-cairo text-xs font-bold text-[#64748b]">
                {t("secretary.dashboard.actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment, index) => (
              <tr
                key={index}
                className={
                  index !== appointments.length - 1
                    ? "border-b border-[#e2e8f0]"
                    : ""
                }
              >
                <td className="px-6 py-4 font-cairo text-sm font-medium text-[#0f172a]">
                  {appointment.time}
                </td>
                <td className="px-6 py-4 font-cairo text-sm font-medium text-[#0f172a]">
                  {appointment.patientName}
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(appointment.status)}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => onViewAppointment?.(appointment)}
                    className="rounded-lg bg-primary px-3 py-1.5 font-cairo text-xs font-bold text-white transition hover:bg-primary/90"
                  >
                    {t("secretary.dashboard.view")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
