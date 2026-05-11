import type { Appointment } from "@/lib/api_mock";
import { cn } from "@/lib/utils/utils";
import type { ComponentType } from "react";
import {
  AlertTriangle,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  Download,
  Eye,
  Hospital,
  MapPin,
  Pencil,
  Phone,
  Video,
  X,
} from "lucide-react";

function formatDashDate(iso: string) {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}-${m}-${y}`;
}

function statusLabelAr(status: Appointment["status"]): string {
  switch (status) {
    case "scheduled":
      return "مؤكد";
    case "completed":
      return "مكتمل";
    case "cancelled":
      return "ملغي";
    case "in-progress":
      return "قيد التنفيذ";
    default:
      return status;
  }
}

function visitKindLabel(type: Appointment["type"]): string {
  if (type === "video") return "استشارة";
  if (type === "home") return "زيارة منزلية";
  return "مراجعة";
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-[#F2F4F7] py-3 last:border-b-0">
      <Icon className="mt-0.5 h-[18px] w-[18px] shrink-0 text-primary" />
      <div className="flex min-w-0 flex-1 items-center gap-4 text-right">
        <div className="font-cairo text-[16px] font-bold text-primary">
          {label}
        </div>
        <div className="mt-0.5 font-cairo text-[16px] font-normal text-[#1F2937]">
          {value}
        </div>
      </div>
    </div>
  );
}

export type DoctorAppointmentExpandableCardProps = {
  appointment: Appointment & {
    appointmentTypeNameSnapshot?: string | null;
    priceSnapshot?: number | null;
    priceVisibleToPatientSnapshot?: boolean;
  };
  expanded: boolean;
  onToggle: () => void;
  cancelling: boolean;
  completing: boolean;
  rescheduling?: boolean;
  noShowing?: boolean;
  onCancel: () => void;
  onComplete: () => void;
  onEdit: () => void;
  onNoShow: () => void;
  detailsLoading?: boolean;
};

export default function DoctorAppointmentExpandableCard({
  appointment,
  expanded,
  onToggle,
  cancelling,
  completing,
  rescheduling,
  noShowing,
  onComplete,
  onCancel,
  onEdit,
  onNoShow,
  detailsLoading,
}: DoctorAppointmentExpandableCardProps) {
  const phone = appointment.patientPhone ?? "—";
  const modeLine = appointment.type === "video" ? "أونلاين" : "عيادة";
  const files = appointment.appointmentFiles ?? [];
  const detailDate = formatDashDate(appointment.date);
  const location =
    appointment.location ??
    (appointment.type === "video" ? "جلسة فيديو" : "غير محدد");
  const reason = appointment.notes?.trim() || "لم يذكر سبب الزيارة";
  const kindLabel = visitKindLabel(appointment.type);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[10px] border border-[#E5E7EB] bg-white transition-shadow",
        expanded && "shadow-[0_12px_24px_rgba(15,143,139,0.08)]",
        !expanded && "shadow-[0px_4px_12px_rgba(0,0,0,0.06)]",
      )}
    >
      <div className="px-4 py-4 sm:px-5 sm:py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-primary font-cairo text-[18px] font-extrabold text-white shadow-[0_8px_18px_rgba(15,143,139,0.22)]">
              {appointment.patientInitials}
            </div>

            <div className="min-w-0 flex-1 space-y-2">
              <div className="font-cairo text-[17px] font-extrabold leading-tight text-[#101828]">
                {appointment.patientName}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-cairo text-[13px] font-semibold text-[#667085]">
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-primary" />
                  {phone}
                </span>
                <span className="inline-flex items-center gap-1.5 text-primary">
                  {appointment.type === "video" ? (
                    <Video className="h-4 w-4" />
                  ) : (
                    <Hospital className="h-4 w-4" />
                  )}
                  {modeLine}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex h-9 items-center gap-1.5 rounded-[6px] border border-primary bg-white px-3 font-cairo text-[12px] font-extrabold text-primary">
                  <Clock className="h-3.5 w-3.5" />
                  {appointment.time}
                </span>
                <span className="inline-flex h-9 items-center gap-1.5 rounded-[6px] border border-primary bg-white px-3 font-cairo text-[12px] font-extrabold text-primary">
                  <Calendar className="h-3.5 w-3.5" />
                  {appointment.date}
                </span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-center gap-2 sm:flex-row sm:items-start">
            <span className="rounded-lg bg-primary px-2.5 py-1 font-cairo text-[11px] font-bold text-white">
              {kindLabel}
            </span>
            <button
              type="button"
              aria-expanded={expanded}
              aria-label={expanded ? "طي التفاصيل" : "عرض التفاصيل الكاملة"}
              onClick={onToggle}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#344054] transition-colors hover:border-primary hover:text-primary"
            >
              <ChevronDown
                className={cn(
                  "h-5 w-5 transition-transform duration-200",
                  expanded && "-rotate-180",
                )}
              />
            </button>
          </div>
        </div>

        <div
          className={cn(
            "grid transition-[grid-template-rows] duration-300 ease-out",
            expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="mt-4 border-t border-[#EEF2F6] pt-4">
              <div className="rounded-[10px] border border-[#EEF2F6] bg-[#FAFBFC] px-3">
                <DetailRow icon={Calendar} label="التاريخ" value={detailDate} />
                <DetailRow
                  icon={Clock}
                  label="الوقت"
                  value={appointment.time}
                />
                <DetailRow
                  icon={Check}
                  label="الحالة"
                  value={statusLabelAr(appointment.status)}
                />
                {appointment.appointmentTypeNameSnapshot && (
                  <DetailRow
                    icon={Hospital}
                    label="نوع الموعد"
                    value={appointment.appointmentTypeNameSnapshot}
                  />
                )}
                {appointment.priceSnapshot && appointment.priceVisibleToPatientSnapshot && (
                  <DetailRow
                    icon={AlertTriangle}
                    label="السعر"
                    value={`${appointment.priceSnapshot} ريال`}
                  />
                )}
                <DetailRow icon={MapPin} label="الموقع" value={location} />
                <DetailRow icon={Hospital} label="سبب الزيارة" value={reason} />
              </div>

              <div className="mt-4">
                <div className="mb-2 font-cairo text-[13px] font-extrabold text-[#101828]">
                  ملفات الموعد:
                </div>
                {detailsLoading ? (
                  <p className="rounded-lg border border-dashed border-[#E5E7EB] bg-[#F9FAFB] px-4 py-6 text-center font-cairo text-[13px] font-semibold text-[#667085]">
                    جارِ تحميل تفاصيل الموعد...
                  </p>
                ) : files.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-[#E5E7EB] bg-[#F9FAFB] px-4 py-6 text-center font-cairo text-[13px] font-semibold text-[#667085]">
                    لا توجد ملفات مرفقة لهذا الموعد
                  </p>
                ) : (
                  <div className="space-y-2">
                    {files.map((f, idx) => (
                      <div
                        key={`${f.name}-${idx}`}
                        className="flex flex-col gap-3 rounded-lg border border-[#D6F5F3] bg-[#F0FDFC] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0 text-right">
                          <div className="font-cairo text-[14px] font-bold text-[#101828]">
                            {f.name}
                          </div>
                          <div className="mt-0.5 font-cairo text-[12px] font-semibold text-[#667085]">
                            {formatDashDate(f.date)}
                          </div>
                        </div>
                        <div className="flex flex-wrap justify-end gap-2 shrink-0">
                          <button
                            type="button"
                            disabled
                            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-primary bg-white px-3 font-cairo text-[12px] font-bold text-primary opacity-60"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            عرض
                          </button>
                          <button
                            type="button"
                            disabled
                            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-primary bg-white px-3 font-cairo text-[12px] font-bold text-primary opacity-60"
                          >
                            <Download className="h-3.5 w-3.5" />
                            تحميل
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {appointment.status === "scheduled" ? (
                <div className="mt-5 flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    onClick={onCancel}
                    disabled={cancelling}
                    className="inline-flex h-11 min-w-[100px] flex-1 items-center justify-center gap-2 rounded-lg border-2 border-[#F04438] bg-white font-cairo text-[14px] font-extrabold text-[#D92D20] transition-colors hover:bg-[#FEF3F2] disabled:opacity-50 sm:flex-initial sm:px-6"
                  >
                    <X className="h-4 w-4" />
                    إلغاء
                  </button>
                  <button
                    type="button"
                    onClick={onNoShow}
                    disabled={noShowing}
                    className="inline-flex h-11 min-w-[120px] flex-1 items-center justify-center gap-2 rounded-lg border border-[#F59E0B] bg-[#FFF7ED] font-cairo text-[14px] font-extrabold text-[#B45309] transition-colors hover:bg-[#FFEDD5] disabled:opacity-50 sm:flex-initial sm:px-6"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    عدم حضور
                  </button>
                  <button
                    type="button"
                    onClick={onEdit}
                    disabled={rescheduling}
                    className="inline-flex h-11 min-w-[120px] flex-1 items-center justify-center gap-2 rounded-lg bg-primary font-cairo text-[14px] font-extrabold text-white shadow-[0_10px_24px_rgba(15,143,139,0.22)] transition-colors hover:bg-[#0d7a77] disabled:opacity-50 sm:flex-initial sm:px-6"
                  >
                    <Pencil className="h-4 w-4" />
                    إعادة جدولة
                  </button>
                  <button
                    type="button"
                    onClick={onComplete}
                    disabled={completing}
                    className="inline-flex h-11 min-w-[100px] flex-1 items-center justify-center gap-2 rounded-lg bg-primary font-cairo text-[14px] font-extrabold text-white shadow-[0_10px_24px_rgba(15,143,139,0.22)] transition-colors hover:bg-[#0d7a77] disabled:opacity-50 sm:flex-initial sm:px-6"
                  >
                    <Check className="h-4 w-4" />
                    إكمال
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
