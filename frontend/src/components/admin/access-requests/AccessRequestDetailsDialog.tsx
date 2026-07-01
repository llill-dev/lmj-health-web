import { X, User, Mail, Phone, Calendar, FileText, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

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
    pending: 'معلّقة',
    approved: 'مقبولة',
    rejected: 'مرفوضة',
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-[#FEF3C7] text-[#B45309]',
    approved: 'bg-[#ECFDF3] text-[#16A34A]',
    rejected: 'bg-[#FEF2F2] text-[#B42318]',
  };

  const statusIcons: Record<string, any> = {
    pending: Clock,
    approved: CheckCircle,
    rejected: XCircle,
  };

  if (!open) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
      <div className='relative w-full max-w-2xl rounded-[16px] bg-white shadow-[0_24px_48px_rgba(0,0,0,0.12)]'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-[#EEF2F6] px-6 py-4'>
          <div className='flex items-center gap-3'>
            <div className='flex h-[40px] w-[40px] items-center justify-center rounded-[10px] bg-primary text-white'>
              <User className='h-5 w-5' />
            </div>
            <div>
              <h3 className='font-cairo text-[16px] font-black text-[#111827]'>
                تفاصيل طلب الوصول
              </h3>
              <p className='font-cairo text-[11px] font-semibold text-[#98A2B3]'>
                {requestId || '—'}
              </p>
            </div>
          </div>
          <button
            type='button'
            onClick={() => onOpenChange(false)}
            className='flex h-[32px] w-[32px] items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#667085] hover:bg-[#F9FAFB]'
          >
            <X className='h-4 w-4' />
          </button>
        </div>

        {/* Content */}
        <div className='px-6 py-5'>
          {isAwaitingData ? (
            <div className='py-12 text-center font-cairo text-[13px] font-semibold text-[#667085]'>
              جارِ تحميل التفاصيل...
            </div>
          ) : !request ? (
            <div className='py-12 text-center font-cairo text-[13px] font-semibold text-[#B42318]'>
              تعذّر تحميل تفاصيل الطلب.
            </div>
          ) : (
            <div className='space-y-5'>
              {/* Status Badge */}
              <div className='flex items-center justify-between'>
                <div className='font-cairo text-[12px] font-semibold text-[#98A2B3]'>
                  حالة الطلب
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-cairo text-[11px] font-extrabold ${statusColors[request.status || 'pending']}`}
                >
                  {(() => {
                    const StatusIcon = statusIcons[request.status || 'pending'];
                    return <StatusIcon className='h-3.5 w-3.5' />;
                  })()}
                  {statusLabels[request.status || 'pending']}
                </span>
              </div>

              {/* Doctor Info */}
              <div className='rounded-[12px] border border-[#EEF2F6] bg-[#FAFAFA] p-4'>
                <div className='mb-3 flex items-center gap-2'>
                  <User className='h-4 w-4 text-primary' />
                  <div className='font-cairo text-[12px] font-bold text-[#111827]'>
                    معلومات الطبيب
                  </div>
                </div>
                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                  <div>
                    <div className='font-cairo text-[10px] font-semibold text-[#98A2B3]'>
                      الاسم الكامل
                    </div>
                    <div className='font-cairo text-[12px] font-bold text-[#111827]'>
                      {request.doctor?.fullName || request.doctorName || '—'}
                    </div>
                  </div>
                  <div>
                    <div className='font-cairo text-[10px] font-semibold text-[#98A2B3]'>
                      البريد الإلكتروني
                    </div>
                    <div className='font-cairo text-[12px] font-bold text-[#111827]'>
                      {request.doctor?.email || request.doctorEmail || '—'}
                    </div>
                  </div>
                  <div>
                    <div className='font-cairo text-[10px] font-semibold text-[#98A2B3]'>
                      الهاتف
                    </div>
                    <div className='font-cairo text-[12px] font-bold text-[#111827]'>
                      {request.doctor?.phone || request.doctorPhone || '—'}
                    </div>
                  </div>
                  <div>
                    <div className='font-cairo text-[10px] font-semibold text-[#98A2B3]'>
                      التخصص
                    </div>
                    <div className='font-cairo text-[12px] font-bold text-[#111827]'>
                      {request.doctor?.specialization || '—'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Patient Info */}
              <div className='rounded-[12px] border border-[#EEF2F6] bg-[#FAFAFA] p-4'>
                <div className='mb-3 flex items-center gap-2'>
                  <FileText className='h-4 w-4 text-primary' />
                  <div className='font-cairo text-[12px] font-bold text-[#111827]'>
                    معلومات المريض
                  </div>
                </div>
                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                  <div>
                    <div className='font-cairo text-[10px] font-semibold text-[#98A2B3]'>
                      الاسم الكامل
                    </div>
                    <div className='font-cairo text-[12px] font-bold text-[#111827]'>
                      {request.patient?.fullName || request.patientName || '—'}
                    </div>
                  </div>
                  <div>
                    <div className='font-cairo text-[10px] font-semibold text-[#98A2B3]'>
                      الرقم المرجعي
                    </div>
                    <div className='font-cairo text-[12px] font-bold text-[#111827]'>
                      {request.patient?.publicId || request.patientId || '—'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Request Details */}
              <div className='rounded-[12px] border border-[#EEF2F6] bg-[#FAFAFA] p-4'>
                <div className='mb-3 flex items-center gap-2'>
                  <Calendar className='h-4 w-4 text-primary' />
                  <div className='font-cairo text-[12px] font-bold text-[#111827]'>
                    تفاصيل الطلب
                  </div>
                </div>
                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                  <div>
                    <div className='font-cairo text-[10px] font-semibold text-[#98A2B3]'>
                      تاريخ الطلب
                    </div>
                    <div className='font-cairo text-[12px] font-bold text-[#111827]'>
                      {request.createdAt ? new Date(request.createdAt).toLocaleDateString('ar-SY') : '—'}
                    </div>
                  </div>
                  <div>
                    <div className='font-cairo text-[10px] font-semibold text-[#98A2B3]'>
                      وقت الطلب
                    </div>
                    <div className='font-cairo text-[12px] font-bold text-[#111827]'>
                      {request.createdAt ? new Date(request.createdAt).toLocaleTimeString('ar-SY') : '—'}
                    </div>
                  </div>
                </div>
                {request.reason && (
                  <div className='mt-3'>
                    <div className='font-cairo text-[10px] font-semibold text-[#98A2B3]'>
                      سبب الطلب
                    </div>
                    <div className='font-cairo text-[12px] font-bold text-[#111827]'>
                      {request.reason}
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              {request.notes && (
                <div className='rounded-[12px] border border-[#E5E7EB] bg-[#FFFBEB] p-4'>
                  <div className='mb-2 flex items-center gap-2'>
                    <AlertCircle className='h-4 w-4 text-[#D97706]' />
                    <div className='font-cairo text-[12px] font-bold text-[#92400E]'>
                      ملاحظات
                    </div>
                  </div>
                  <div className='font-cairo text-[11px] font-semibold text-[#B45309]'>
                    {request.notes}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='flex justify-end gap-3 border-t border-[#EEF2F6] px-6 py-4'>
          <button
            type='button'
            onClick={() => onOpenChange(false)}
            className='inline-flex h-[36px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white px-6 font-cairo text-[12px] font-extrabold text-[#111827] hover:bg-[#F9FAFB]'
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
