import type { Appointment } from '@/lib/api/api';
import { cn } from '@/lib/utils';
import type { ComponentType } from 'react';
import {
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
} from 'lucide-react';

function formatDashDate(iso: string) {
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}-${m}-${y}`;
}

function statusLabelAr(status: Appointment['status']): string {
  switch (status) {
    case 'scheduled':
      return 'مؤكد';
    case 'completed':
      return 'مكتمل';
    case 'cancelled':
      return 'ملغى';
    case 'in-progress':
      return 'قيد التنفيذ';
    default:
      return status;
  }
}

/** شارة نوع الزيارة في التصميم المرجعي (عيادة ≈ مراجعة، فيديو ≈ استشارة). */
function visitKindLabel(type: Appointment['type']): string {
  if (type === 'video') return 'استشارة';
  if (type === 'home') return 'زيارة منزلية';
  return 'مراجعة';
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
      <div className="flex flex-1 gap-4 items-center min-w-0 text-right">
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
  appointment: Appointment;
  expanded: boolean;
  onToggle: () => void;
  cancelling: boolean;
  completing: boolean;
  onCancel: () => void;
  onComplete: () => void;
  onEdit: () => void;
};

export default function DoctorAppointmentExpandableCard({
  appointment,
  expanded,
  onToggle,
  cancelling,
  completing,
  onComplete,
  onCancel,
  onEdit,
}: DoctorAppointmentExpandableCardProps) {
  const phone = appointment.patientPhone ?? '—';
  const modeLine =
    appointment.type === 'video' ? 'أونلاين' : 'عيادة';
  const files = appointment.appointmentFiles ?? [];
  const detailDate = formatDashDate(appointment.date);
  const location =
    appointment.location ??
    (appointment.type === 'video' ? 'جلسة فيديو' : 'غير محدد');
  const reason = appointment.notes?.trim() || 'لم يُذكر سبب الزيارة';
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
        <div className="flex gap-3 justify-between items-start">
          <div className="flex flex-1 gap-3 items-start min-w-0">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-primary font-cairo text-[18px] font-extrabold text-white shadow-[0_8px_18px_rgba(15,143,139,0.22)]">
              {appointment.patientInitials}
            </div>

            <div className="flex-1 space-y-2 min-w-0">
              <div className="font-cairo text-[17px] font-extrabold leading-tight text-[#101828]">
                {appointment.patientName}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-cairo text-[13px] font-semibold text-[#667085]">
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-primary" />
                  {phone}
                </span>
                <span className="inline-flex items-center gap-1.5 text-primary">
                  {appointment.type === "video" ? (
                    <Video className="w-4 h-4" />
                  ) : (
                    <Hospital className="w-4 h-4" />
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

          <div className="flex flex-col gap-2 items-center shrink-0 sm:flex-row sm:items-start">
            <span className="rounded-lg bg-primary px-2.5 py-1 font-cairo text-[11px] font-bold text-white">
              {kindLabel}
            </span>
            <button
              type="button"
              aria-expanded={expanded}
              aria-label={expanded ? "طي التفاصيل" : "عرض التفاصيل الكاملة"}
              onClick={onToggle}
              className="flex w-9 h-9 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#344054] transition-colors hover:border-primary hover:text-primary"
            >
              <ChevronDown
                className={cn(
                  "w-5 h-5 transition-transform duration-200",
                  expanded && "-rotate-180",
                )}
              />
            </button>
          </div>
        </div>

        {/* منطقة قابلة للطي: التفاصيل + الملفات + أزرار الإجراءات */}
        <div
          className={cn(
            "grid duration-300 ease-out transition-[grid-template-rows]",
            expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="overflow-hidden min-h-0">
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
                <DetailRow icon={MapPin} label="الموقع" value={location} />
                <DetailRow icon={Hospital} label="سبب الزيارة" value={reason} />
              </div>

              <div className="mt-4">
                <div className="mb-2 font-cairo text-[13px] font-extrabold text-[#101828]">
                  الملفات الموعد :
                </div>
                {files.length === 0 ? (
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
                        <div className="flex flex-wrap gap-2 justify-end shrink-0">
                          <button
                            type="button"
                            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-primary bg-white px-3 font-cairo text-[12px] font-bold text-primary transition-colors hover:bg-[#EFFFFE]"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            عرض
                          </button>
                          <button
                            type="button"
                            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-primary bg-white px-3 font-cairo text-[12px] font-bold text-primary transition-colors hover:bg-[#EFFFFE]"
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

              {appointment.status === "scheduled" && (
                <>
                  {/* ترتيب DOM: إكمال → تعديل → إلغاء يطابق قراءة RTL من يمين الكارد */}
                  <div className="flex flex-wrap gap-3 justify-end mt-5">
                    <button
                      type="button"
                      onClick={onCancel}
                      disabled={cancelling}
                      className="inline-flex h-11 min-w-[100px] flex-1 items-center justify-center gap-2 rounded-lg border-2 border-[#F04438] bg-white font-cairo text-[14px] font-extrabold text-[#D92D20] transition-colors hover:bg-[#FEF3F2] disabled:opacity-50 sm:flex-initial sm:px-6"
                    >
                      <X className="w-4 h-4" />
                      إلغاء
                    </button>
                    <button
                      type="button"
                      onClick={onEdit}
                      className="inline-flex h-11 min-w-[100px] flex-1 items-center justify-center gap-2 rounded-lg bg-primary font-cairo text-[14px] font-extrabold text-white shadow-[0_10px_24px_rgba(15,143,139,0.22)] transition-colors hover:bg-[#0d7a77] sm:flex-initial sm:px-6"
                    >
                      <Pencil className="w-4 h-4" />
                      تعديل
                    </button>
                    <button
                      type="button"
                      onClick={onComplete}
                      disabled={completing}
                      className="inline-flex h-11 min-w-[100px] flex-1 items-center justify-center gap-2 rounded-lg bg-primary font-cairo text-[14px] font-extrabold text-white shadow-[0_10px_24px_rgba(15,143,139,0.22)] transition-colors hover:bg-[#0d7a77] disabled:opacity-50 sm:flex-initial sm:px-6"
                    >
                      <Check className="w-4 h-4" />
                      إكمال
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
