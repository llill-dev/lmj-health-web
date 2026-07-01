import { Helmet } from 'react-helmet-async';
import {
  UserCheck,
  Search,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminDashboardOverview from '@/components/admin/dashboard/admin-dashboard-overview';
import StyledSelect from '@/components/ui/styled-select';
import { useAdminAccessRequests } from '@/hooks/admin/access-requests/useAdminAccessRequests';
import { useAdminAccessRequestDetails } from '@/hooks/admin/access-requests/useAdminAccessRequests';
import AccessRequestDetailsDialog from '@/components/admin/access-requests/AccessRequestDetailsDialog';

type RequestStatus = 'pending' | 'approved' | 'rejected' | 'all';

const statusLabels: Record<RequestStatus, string> = {
  pending: 'معلّقة',
  approved: 'مقبولة',
  rejected: 'مرفوضة',
  all: 'كل الحالات',
};

const statusColors: Record<RequestStatus, string> = {
  pending: 'bg-[#FEF3C7] text-[#B45309]',
  approved: 'bg-[#ECFDF3] text-[#16A34A]',
  rejected: 'bg-[#FEF2F2] text-[#B42318]',
  all: 'bg-[#F3F4F6] text-[#374151]',
};

export default function AdminAccessRequestsPage() {
  const navigate = useNavigate();
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [filters, setFilters] = useState<{
    page: number;
    limit: number;
    status: RequestStatus;
    search: string;
  }>({
    page: 1,
    limit: 10,
    status: 'pending',
    search: '',
  });

  const { requests, total, isAwaitingData, error, refetch } = useAdminAccessRequests({
    page: filters.page,
    limit: filters.limit,
    status: filters.status === 'all' ? undefined : filters.status,
  });

  const { request: selectedRequest, isAwaitingData: detailsAwaiting } = useAdminAccessRequestDetails(selectedRequestId);

  const totalPages = useMemo(() => {
    const safeLimit = Math.max(1, filters.limit);
    const pages = Math.ceil((total || 0) / safeLimit);
    return pages || 1;
  }, [filters.limit, total]);

  const filteredRequests = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    if (!q) return requests;
    return requests.filter((r: any) => {
      const doctorName = r.doctor?.fullName || r.doctorName || '';
      const patientName = r.patient?.fullName || r.patientName || '';
      const patientId = r.patient?.publicId || r.patientId || '';
      return (
        doctorName.toLowerCase().includes(q) ||
        patientName.toLowerCase().includes(q) ||
        patientId.toLowerCase().includes(q)
      );
    });
  }, [requests, filters.search]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      pending: 0,
      approved: 0,
      rejected: 0,
    };
    requests.forEach((r: any) => {
      const status = r.status || 'pending';
      if (counts[status] !== undefined) {
        counts[status]++;
      }
    });
    return counts;
  }, [requests]);

  const stats = [
    {
      title: 'طلبات معلّقة',
      value: String(statusCounts.pending),
      icon: Clock,
      tone: {
        border: 'border-[#FDE68A]',
        bg: 'bg-[#FFFBEB]',
        iconBg: 'bg-[#F59E0B]',
        iconFg: 'text-white',
        valueFg: 'text-[#B45309]',
      },
    },
    {
      title: 'طلبات مقبولة',
      value: String(statusCounts.approved),
      icon: CheckCircle,
      tone: {
        border: 'border-[#BBF7D0]',
        bg: 'bg-[#F0FDF4]',
        iconBg: 'bg-[#16A34A]',
        iconFg: 'text-white',
        valueFg: 'text-[#16A34A]',
      },
    },
    {
      title: 'طلبات مرفوضة',
      value: String(statusCounts.rejected),
      icon: XCircle,
      tone: {
        border: 'border-[#FECACA]',
        bg: 'bg-[#FEF2F2]',
        iconBg: 'bg-[#EF4444]',
        iconFg: 'text-white',
        valueFg: 'text-[#B42318]',
      },
    },
    {
      title: 'إجمالي الطلبات',
      value: String(total),
      icon: UserCheck,
      tone: {
        border: 'border-[#CFFAFE]',
        bg: 'bg-[#ECFEFF]',
        iconBg: 'bg-[#0F8F8B]',
        iconFg: 'text-white',
        valueFg: 'text-[#0F8F8B]',
      },
    },
  ] as const;

  const handleViewDetails = (requestId: string) => {
    setSelectedRequestId(requestId);
    setDetailsOpen(true);
  };

  return (
    <>
      <Helmet>
        <title>إدارة طلبات الوصول • LMJ Health</title>
      </Helmet>

      <div dir='rtl' lang='ar' className='min-h-full text-[#111827]'>
        <AdminDashboardOverview
          variant='access-requests'
          surface='mint'
          title='إدارة طلبات الوصول'
          subtitle='مراجعة وإدارة طلبات الوصول إلى بيانات المرضى'
          headerIcon={<UserCheck className='h-8 w-8 text-white' />}
          kpiColumns={4}
          kpis={stats.map((s) => {
            const Icon = s.icon;
            return {
              key: s.title,
              icon: <Icon className='h-5 w-5 shrink-0' />,
              value: s.value,
              label: s.title,
            };
          })}
        />

        {/* Filters Section */}
        <section className='mt-5 rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
          <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
            <div className='flex flex-1 items-center gap-3'>
              <div className='relative flex-1'>
                <input
                  placeholder='بحث بالطبيب أو المريض...'
                  className='h-[42px] w-full rounded-[10px] border border-[#E5E7EB] bg-white pe-12 ps-4 text-right font-cairo text-[12px] font-bold text-[#111827] placeholder:text-[#98A2B3]'
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      search: e.target.value,
                      page: 1,
                    }))
                  }
                />
                <div className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]'>
                  <Search className='h-5 w-5' />
                </div>
              </div>

              <div className='w-[168px] shrink-0'>
                <StyledSelect
                  size='sm'
                  tone='muted'
                  value={filters.status}
                  onChange={(v) =>
                    setFilters((prev) => ({
                      ...prev,
                      status: v as RequestStatus,
                      page: 1,
                    }))
                  }
                  options={[
                    { value: 'pending', label: 'معلّقة' },
                    { value: 'approved', label: 'مقبولة' },
                    { value: 'rejected', label: 'مرفوضة' },
                    { value: 'all', label: 'كل الحالات' },
                  ]}
                  listboxAriaLabel='حالة الطلب'
                />
              </div>
            </div>

            <div className='flex items-center gap-3'>
              <button
                type='button'
                onClick={() => refetch()}
                className='inline-flex h-[34px] items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827] hover:bg-[#F9FAFB]'
              >
                <RefreshCw className='h-4 w-4' />
                تحديث
              </button>
              <div className='font-cairo text-[12px] font-bold text-[#667085]'>
                {total} نتيجة
              </div>
            </div>
          </div>
        </section>

        {/* Requests List */}
        <section className='mt-5 space-y-4'>
          {isAwaitingData ? (
            <div className='rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-5 font-cairo text-[12px] font-semibold text-[#667085] shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
              جارِ تحميل طلبات الوصول...
            </div>
          ) : error ? (
            <div className='rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-6 py-5 font-cairo text-[12px] font-semibold text-[#B42318] shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
              تعذّر تحميل طلبات الوصول.
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className='rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-5 font-cairo text-[12px] font-semibold text-[#667085] shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
              لا توجد طلبات وصول مطابقة.
            </div>
          ) : (
            filteredRequests.map((request: any) => (
              <div
                key={request._id || request.id}
                className='rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_32px_rgba(0,0,0,0.08)] transition-shadow'
              >
                <div className='flex gap-4'>
                  <div className='flex h-[44px] w-[44px] items-center justify-center rounded-[10px] bg-primary text-white shadow-[0_12px_24px_rgba(15,143,139,0.25)]'>
                    <UserCheck className='h-5 w-5' />
                  </div>
                  <div className='flex-1 space-y-4'>
                    <div className='flex items-start justify-between gap-4'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-3'>
                          <div className='font-cairo text-[14px] font-black text-[#111827]'>
                            {request.doctor?.fullName || request.doctorName || '—'}
                          </div>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-cairo text-[10px] font-extrabold ${statusColors[request.status || 'pending']}`}
                          >
                            {statusLabels[request.status || 'pending']}
                          </span>
                        </div>
                        <div className='mt-2 font-cairo text-[12px] font-bold text-[#98A2B3]'>
                          طلب الوصول: {request._id || request.id}
                        </div>
                      </div>
                      <button
                        type='button'
                        onClick={() => handleViewDetails(request._id || request.id)}
                        className='inline-flex h-[32px] items-center gap-2 rounded-[10px] bg-[#F2F4F7] px-4 font-cairo text-[12px] font-extrabold text-[#4B5563] hover:bg-[#E5E7EB]'
                      >
                        <Eye className='h-4 w-4' />
                        عرض التفاصيل
                      </button>
                    </div>

                    <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
                      <div className='flex items-center gap-2 rounded-[8px] border border-[#EEF2F6] bg-[#FAFAFA] px-3 py-2'>
                        <User className='h-4 w-4 text-primary' />
                        <div className='flex-1 min-w-0'>
                          <div className='font-cairo text-[10px] font-semibold text-[#98A2B3]'>
                            المريض
                          </div>
                          <div className='font-cairo text-[11px] font-bold text-[#111827] truncate'>
                            {request.patient?.fullName || request.patientName || '—'}
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center gap-2 rounded-[8px] border border-[#EEF2F6] bg-[#FAFAFA] px-3 py-2'>
                        <Calendar className='h-4 w-4 text-primary' />
                        <div className='flex-1 min-w-0'>
                          <div className='font-cairo text-[10px] font-semibold text-[#98A2B3]'>
                            تاريخ الطلب
                          </div>
                          <div className='font-cairo text-[11px] font-bold text-[#111827] truncate'>
                            {request.createdAt ? new Date(request.createdAt).toLocaleDateString('ar-SY') : '—'}
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center gap-2 rounded-[8px] border border-[#EEF2F6] bg-[#FAFAFA] px-3 py-2'>
                        <Mail className='h-4 w-4 text-primary' />
                        <div className='flex-1 min-w-0'>
                          <div className='font-cairo text-[10px] font-semibold text-[#98A2B3]'>
                            البريد الإلكتروني
                          </div>
                          <div className='font-cairo text-[11px] font-bold text-[#111827] truncate'>
                            {request.doctor?.email || request.doctorEmail || '—'}
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center gap-2 rounded-[8px] border border-[#EEF2F6] bg-[#FAFAFA] px-3 py-2'>
                        <Phone className='h-4 w-4 text-primary' />
                        <div className='flex-1 min-w-0'>
                          <div className='font-cairo text-[10px] font-semibold text-[#98A2B3]'>
                            الهاتف
                          </div>
                          <div className='font-cairo text-[11px] font-bold text-[#111827] truncate'>
                            {request.doctor?.phone || request.doctorPhone || '—'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>

        {/* Pagination */}
        <section className='mt-5 flex items-center justify-between rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
          <div className='font-cairo text-[12px] font-bold text-[#667085]'>
            الصفحة {filters.page} من {totalPages}
          </div>

          <div className='flex items-center gap-3'>
            <div className='w-[128px] shrink-0'>
              <StyledSelect
                size='xs'
                tone='emphasis'
                value={String(filters.limit)}
                onChange={(v) =>
                  setFilters((prev) => ({
                    ...prev,
                    limit: Number(v),
                    page: 1,
                  }))
                }
                options={[10, 20, 50, 100].map((v) => ({
                  value: String(v),
                  label: String(v),
                }))}
                listboxAriaLabel='عدد العناصر في الصفحة'
              />
            </div>

            <button
              type='button'
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  page: Math.max(1, prev.page - 1),
                }))
              }
              disabled={filters.page <= 1}
              className='inline-flex h-[36px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827] disabled:cursor-not-allowed disabled:opacity-60'
            >
              السابق
            </button>

            <button
              type='button'
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  page: Math.min(totalPages, prev.page + 1),
                }))
              }
              disabled={filters.page >= totalPages}
              className='inline-flex h-[36px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827] disabled:cursor-not-allowed disabled:opacity-60'
            >
              التالي
            </button>
          </div>
        </section>
      </div>

      <AccessRequestDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        requestId={selectedRequestId}
        request={selectedRequest}
        isAwaitingData={detailsAwaiting}
      />
    </>
  );
}
