"use client";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useEffect } from "react";

interface AccessRequestDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestId: string | null;
  request: any;
  isAwaitingData: boolean;
}

export default function AccessRequestDetailsDialog({
  open,
  onOpenChange,
  requestId,
  request,
  isAwaitingData,
}: AccessRequestDetailsDialogProps) {
  const statusLabels: Record<string, string> = {
    pending: "معلّقة",
    approved: "مقبولة",
    rejected: "مرفوضة",
  };

  const statusColors: Record<string, string> = {
    pending: "bg-[#FEF3C7] text-[#B45309]",
    approved: "bg-[#ECFDF3] text-[#16A34A]",
    rejected: "bg-[#FEF2F2] text-[#B42318]",
  };

  const statusIcons: Record<string, any> = {
    pending: Clock,
    approved: CheckCircle,
    rejected: XCircle,
  };

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 px-4 py-8"
          role="dialog"
          aria-modal="true"
          aria-label="تفاصيل طلب الوصول"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onOpenChange(false);
          }}
        >
          <motion.div
            className="relative max-h-[min(92vh,860px)] w-full max-w-2xl overflow-hidden rounded-[16px] border border-[#EEF2F6] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.22)]"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="relative overflow-hidden border-b border-[#EEF2F6] px-8 pb-5 pt-8">
              <div
                className="pointer-events-none absolute inset-0 bg-[#E6F4F3]"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute inset-0 bg-[url('/images/bg-status-from-appotiment.png')] bg-cover bg-center opacity-80"
                aria-hidden
              />
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="absolute left-6 top-6 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full text-[#98A2B3] transition hover:bg-[#F3F4F6] hover:text-[#111827]"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" aria-hidden />
              </button>
              <div className="relative text-right">
                <h2 className="font-cairo text-[22px] font-extrabold text-primary">
                  تفاصيل طلب الوصول
                </h2>
                <p className="mt-1 font-cairo text-[13px] font-semibold text-[#5B7B79]">
                  {requestId || "—"}
                </p>
              </div>
            </div>

            <div className="max-h-[calc(92vh-200px)] overflow-y-auto px-8 py-6">
              {isAwaitingData ? (
                <div className="py-12 text-center font-cairo text-[13px] font-semibold text-[#667085]">
                  جارِ تحميل التفاصيل...
                </div>
              ) : !request ? (
                <div className="py-12 text-center font-cairo text-[13px] font-semibold text-[#B42318]">
                  تعذّر تحميل تفاصيل الطلب.
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Status Badge */}
                  <div className="flex items-center justify-between">
                    <div className="font-cairo text-[12px] font-semibold text-[#98A2B3]">
                      حالة الطلب
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-cairo text-[11px] font-extrabold ${statusColors[request.status || "pending"]}`}
                    >
                      {(() => {
                        const StatusIcon =
                          statusIcons[request.status || "pending"];
                        return <StatusIcon className="h-3.5 w-3.5" />;
                      })()}
                      {statusLabels[request.status || "pending"]}
                    </span>
                  </div>

                  {/* Doctor Info */}
                  <div className="rounded-[12px] border border-[#EEF2F6] bg-[#FAFAFA] p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      <div className="font-cairo text-[12px] font-bold text-[#111827]">
                        معلومات الطبيب
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <div className="font-cairo text-[10px] font-semibold text-[#98A2B3]">
                          الاسم الكامل
                        </div>
                        <div className="font-cairo text-[12px] font-bold text-[#111827]">
                          {request.doctor?.fullName ||
                            request.doctorName ||
                            "—"}
                        </div>
                      </div>
                      <div>
                        <div className="font-cairo text-[10px] font-semibold text-[#98A2B3]">
                          البريد الإلكتروني
                        </div>
                        <div className="font-cairo text-[12px] font-bold text-[#111827]">
                          {request.doctor?.email || request.doctorEmail || "—"}
                        </div>
                      </div>
                      <div>
                        <div className="font-cairo text-[10px] font-semibold text-[#98A2B3]">
                          الهاتف
                        </div>
                        <div className="font-cairo text-[12px] font-bold text-[#111827]">
                          {request.doctor?.phone || request.doctorPhone || "—"}
                        </div>
                      </div>
                      <div>
                        <div className="font-cairo text-[10px] font-semibold text-[#98A2B3]">
                          التخصص
                        </div>
                        <div className="font-cairo text-[12px] font-bold text-[#111827]">
                          {request.doctor?.specialization || "—"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Patient Info */}
                  <div className="rounded-[12px] border border-[#EEF2F6] bg-[#FAFAFA] p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <div className="font-cairo text-[12px] font-bold text-[#111827]">
                        معلومات المريض
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <div className="font-cairo text-[10px] font-semibold text-[#98A2B3]">
                          الاسم الكامل
                        </div>
                        <div className="font-cairo text-[12px] font-bold text-[#111827]">
                          {request.patient?.fullName ||
                            request.patientName ||
                            "—"}
                        </div>
                      </div>
                      <div>
                        <div className="font-cairo text-[10px] font-semibold text-[#98A2B3]">
                          الرقم المرجعي
                        </div>
                        <div className="font-cairo text-[12px] font-bold text-[#111827]">
                          {request.patient?.publicId ||
                            request.patientId ||
                            "—"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Request Details */}
                  <div className="rounded-[12px] border border-[#EEF2F6] bg-[#FAFAFA] p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <div className="font-cairo text-[12px] font-bold text-[#111827]">
                        تفاصيل الطلب
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <div className="font-cairo text-[10px] font-semibold text-[#98A2B3]">
                          تاريخ الطلب
                        </div>
                        <div className="font-cairo text-[12px] font-bold text-[#111827]">
                          {request.createdAt
                            ? new Date(request.createdAt).toLocaleDateString(
                                "ar-SY",
                              )
                            : "—"}
                        </div>
                      </div>
                      <div>
                        <div className="font-cairo text-[10px] font-semibold text-[#98A2B3]">
                          وقت الطلب
                        </div>
                        <div className="font-cairo text-[12px] font-bold text-[#111827]">
                          {request.createdAt
                            ? new Date(request.createdAt).toLocaleTimeString(
                                "ar-SY",
                              )
                            : "—"}
                        </div>
                      </div>
                    </div>
                    {request.reason && (
                      <div className="mt-3">
                        <div className="font-cairo text-[10px] font-semibold text-[#98A2B3]">
                          سبب الطلب
                        </div>
                        <div className="font-cairo text-[12px] font-bold text-[#111827]">
                          {request.reason}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {request.notes && (
                    <div className="rounded-[12px] border border-[#E5E7EB] bg-[#FFFBEB] p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-[#D97706]" />
                        <div className="font-cairo text-[12px] font-bold text-[#92400E]">
                          ملاحظات
                        </div>
                      </div>
                      <div className="font-cairo text-[11px] font-semibold text-[#B45309]">
                        {request.notes}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 border-t border-[#EEF2F6] px-8 py-5">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="inline-flex h-[48px] items-center justify-center rounded-[12px] border border-primary bg-white font-cairo text-[14px] font-extrabold text-primary"
              >
                إغلاق
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
