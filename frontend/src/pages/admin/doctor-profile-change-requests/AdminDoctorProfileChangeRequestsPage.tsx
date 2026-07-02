import { Helmet } from 'react-helmet-async';
import { FileText, Check, XCircle, RefreshCw, Loader2, Filter, User } from 'lucide-react';
import { useState, useCallback } from 'react';
import AdminDashboardOverview from '@/components/admin/dashboard/admin-dashboard-overview';
import ReviewProfileChangeDialog from '@/components/admin/doctor-profile-change-requests/dialogs/ReviewProfileChangeDialog';
import StyledSelect from '@/components/ui/styled-select';

interface ProfileChangeRequest {
  _id: string;
  status?: string;
  items?: Array<{
    field: string;
    oldValue?: any;
    newValue?: any;
  }>;
  doctor?: {
    _id: string;
    specialization?: string;
    medicalLicenseNumber?: string;
    userId?: {
      fullName?: string;
    };
  };
  requestedBy?: {
    _id: string;
    fullName?: string;
    email?: string;
  };
  createdAt?: string;
}

const STATUS_OPTIONS = [
  { value: '', label: 'الكل' },
  { value: 'pending', label: 'قيد الانتظار' },
  { value: 'approved', label: 'موافق عليه' },
  { value: 'denied', label: 'مرفوض' },
];

const STATUS_LABELS: Record<string, string> = {
  pending: 'قيد الانتظار',
  approved: 'موافق عليه',
  denied: 'مرفوض',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]',
  approved: 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]',
  denied: 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]',
};

export default function AdminDoctorProfileChangeRequestsPage() {
  const [reviewOpen, setReviewOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ProfileChangeRequest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [requests, setRequests] = useState<ProfileChangeRequest[]>([]);

  const openReview = useCallback((request: ProfileChangeRequest) => {
    setSelectedRequest(request);
    setReviewOpen(true);
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    // TODO: Replace with actual API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  return (
    <>
      <Helmet>
        <title>طلبات تغيير بيانات الأطباء • LMJ Health</title>
      </Helmet>

      <div dir="rtl" lang="ar">
        <AdminDashboardOverview
          variant="admin"
          surface="mint"
          title="طلبات تغيير بيانات الأطباء"
          subtitle="مراجعة طلبات تغيير البيانات الشخصية للأطباء"
          headerIcon={<FileText className="h-8 w-8 text-white" />}
          kpis={[
            {
              key: 'pending',
              icon: <FileText className="h-5 w-5 shrink-0" />,
              value: pendingCount.toLocaleString('ar-EG'),
              label: 'طلبات قيد الانتظار',
            },
            {
              key: 'total',
              icon: <User className="h-5 w-5 shrink-0" />,
              value: requests.length.toLocaleString('ar-EG'),
              label: 'إجمالي الطلبات',
            },
          ]}
        />

        <section className="mt-4 rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-4">
              <div className="mb-2 font-cairo text-[12px] font-extrabold text-[#667085]">
                تصفية حسب الحالة
              </div>
              <StyledSelect
                value={statusFilter}
                onChange={setStatusFilter}
                options={STATUS_OPTIONS}
                placeholder="اختر الحالة"
                size="sm"
                tone="muted"
              />
            </div>
            <div className="lg:col-span-8 flex justify-end">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isLoading}
                className="inline-flex h-[40px] items-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#344054] disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                تحديث
              </button>
            </div>
          </div>
        </section>

        <section className="mt-4 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : requests.length === 0 ? (
            <div className="rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-10 text-center font-cairo text-[13px] font-semibold text-[#667085]">
              لا توجد طلبات تغيير بيانات حالياً.
            </div>
          ) : (
            requests
              .filter((r) => !statusFilter || r.status === statusFilter)
              .map((request) => (
                <div
                  key={request._id}
                  className="rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-4 shadow-[0_12px_24px_rgba(0,0,0,0.05)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[8px] bg-gradient-to-br from-primary to-primary/70 text-white shadow-sm">
                          <User className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-cairo text-[16px] font-black leading-[22px] text-[#111827]">
                            {request.doctor?.userId?.fullName || request.doctor?._id}
                          </div>
                          <div className="mt-0.5 font-cairo text-[11px] font-bold text-[#98A2B3]">
                            {request.doctor?.specialization || '—'} ·{' '}
                            {request.doctor?.medicalLicenseNumber || '—'}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 items-center mt-3">
                        <div className="font-cairo text-[12px] font-bold text-[#667085]">
                          طلب بواسطة: {request.requestedBy?.fullName || '—'}
                        </div>
                        <div className="font-cairo text-[12px] font-bold text-[#667085]">
                          عدد التغييرات: {request.items?.length || 0}
                        </div>
                        <div className="inline-flex items-center rounded-[6px] border px-2 py-1 font-cairo text-[11px] font-bold">
                          {STATUS_LABELS[request.status || ''] || request.status || '—'}
                        </div>
                      </div>
                    </div>
                    {request.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => openReview(request)}
                        title="مراجعة الطلب"
                        className="inline-flex h-[34px] items-center gap-1.5 rounded-[8px] border border-primary bg-primary px-3 font-cairo text-[11px] font-extrabold text-white transition hover:bg-primary/90"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        مراجعة
                      </button>
                    )}
                  </div>
                </div>
              ))
          )}
        </section>

        {/* Review Dialog */}
        <ReviewProfileChangeDialog
          open={reviewOpen}
          onOpenChange={setReviewOpen}
          request={selectedRequest}
          onSuccess={() => {
            // TODO: Refetch requests
          }}
        />
      </div>
    </>
  );
}
