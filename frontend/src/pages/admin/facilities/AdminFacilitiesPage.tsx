import { Helmet } from 'react-helmet-async';
import { Building2, Plus, Edit3, RefreshCw, Loader2, MapPin, Phone } from 'lucide-react';
import { useState, useCallback } from 'react';
import AdminDashboardOverview from '@/components/admin/dashboard/admin-dashboard-overview';
import CreateFacilityDialog from '@/components/admin/facilities/dialogs/CreateFacilityDialog';
import EditFacilityDialog from '@/components/admin/facilities/dialogs/EditFacilityDialog';

interface Facility {
  _id: string;
  name?: string;
  city?: string;
  facilityType?: string;
  kind?: string;
  country?: string;
  address?: string;
  phone?: string;
  status?: string;
}

const FACILITY_TYPE_LABELS: Record<string, string> = {
  hospital: 'مستشفى',
  clinic: 'عيادة',
  laboratory: 'مختبر',
  radiology: 'أشعة',
  pharmacy: 'صيدلية',
  other: 'أخرى',
};

const KIND_LABELS: Record<string, string> = {
  public: 'حكومي',
  private: 'خاص',
  non_profit: 'غير ربحي',
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'نشط',
  INACTIVE: 'معطّل',
  PENDING: 'قيد المراجعة',
};

export default function AdminFacilitiesPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [facilities, setFacilities] = useState<Facility[]>([]);

  // Mock doctors for owner selection - in real app, fetch from API
  const mockDoctors = [
    { _id: '1', user: { fullName: 'د. أحمد محمد' } },
    { _id: '2', user: { fullName: 'د. سارة علي' } },
  ];

  const openEdit = useCallback((facility: Facility) => {
    setSelectedFacility(facility);
    setEditOpen(true);
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    // TODO: Replace with actual API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <>
      <Helmet>
        <title>المنشآت الطبية • LMJ Health</title>
      </Helmet>

      <div dir="rtl" lang="ar">
        <AdminDashboardOverview
          variant="admin"
          surface="mint"
          title="المنشآت الطبية"
          subtitle="إدارة المنشآت الطبية والمستشفيات"
          headerIcon={<Building2 className="h-8 w-8 text-white" />}
          actionLabel="إضافة منشأة"
          onActionClick={() => setCreateOpen(true)}
          kpis={[
            {
              key: 'total',
              icon: <Building2 className="h-5 w-5 shrink-0" />,
              value: facilities.length.toLocaleString('ar-EG'),
              label: 'إجمالي المنشآت',
            },
          ]}
        />

        <section className="mt-4 rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
          <div className="flex justify-between items-center">
            <div className="font-cairo text-[12px] font-extrabold text-[#667085]">
              قائمة المنشآت الطبية
            </div>
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
        </section>

        <section className="mt-4 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : facilities.length === 0 ? (
            <div className="rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-10 text-center font-cairo text-[13px] font-semibold text-[#667085]">
              لا توجد منشآت طبية حالياً.
            </div>
          ) : (
            facilities.map((facility) => (
              <div
                key={facility._id}
                className="rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-4 shadow-[0_12px_24px_rgba(0,0,0,0.05)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[8px] bg-gradient-to-br from-primary to-primary/70 text-white shadow-sm">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-cairo text-[16px] font-black leading-[22px] text-[#111827]">
                          {facility.name || '—'}
                        </div>
                        <div className="mt-0.5 font-cairo text-[11px] font-bold text-[#98A2B3]">
                          {FACILITY_TYPE_LABELS[facility.facilityType || ''] || facility.facilityType || '—'} ·{' '}
                          {KIND_LABELS[facility.kind || ''] || facility.kind || '—'}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 items-center mt-3">
                      {facility.city && (
                        <div className="flex items-center gap-2 font-cairo text-[12px] font-bold text-[#667085]">
                          <MapPin className="h-3.5 w-3.5" />
                          {facility.city}, {facility.country}
                        </div>
                      )}
                      {facility.phone && (
                        <div className="flex items-center gap-2 font-cairo text-[12px] font-bold text-[#667085]">
                          <Phone className="h-3.5 w-3.5" />
                          {facility.phone}
                        </div>
                      )}
                      <div className="inline-flex items-center rounded-[6px] border px-2 py-1 font-cairo text-[11px] font-bold">
                        {STATUS_LABELS[facility.status || ''] || facility.status || '—'}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(facility)}
                      title="تعديل البيانات"
                      className="inline-flex h-[34px] items-center gap-1.5 rounded-[8px] border border-[#BBF7D0] bg-white px-3 font-cairo text-[11px] font-extrabold text-[#16A34A] transition hover:bg-[#F0FDF4]"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      تعديل
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>

        {/* Create Facility Dialog */}
        <CreateFacilityDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          doctors={mockDoctors}
          onSuccess={() => {
            // TODO: Refetch facilities
          }}
        />

        {/* Edit Facility Dialog */}
        <EditFacilityDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          facility={selectedFacility}
          doctors={mockDoctors}
          onSuccess={() => {
            // TODO: Refetch facilities
          }}
        />
      </div>
    </>
  );
}
