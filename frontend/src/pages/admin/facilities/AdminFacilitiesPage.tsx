import { Helmet } from "react-helmet-async";
import {
  Building2,
  Plus,
  Edit3,
  RefreshCw,
  Loader2,
  MapPin,
  Phone,
  Users,
  Search,
  Filter,
  Eye,
  UserCheck,
  Trash2,
} from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminDashboardOverview from "@/components/admin/dashboard/admin-dashboard-overview";
import CreateFacilityDialog from "@/components/admin/facilities/dialogs/CreateFacilityDialog";
import EditFacilityDialog from "@/components/admin/facilities/dialogs/EditFacilityDialog";
import FacilityDetailsDialog from "@/components/admin/facilities/dialogs/FacilityDetailsDialog";
import FacilityDoctorsDialog from "@/components/admin/facilities/dialogs/FacilityDoctorsDialog";
import ChangeFacilityStatusDialog from "@/components/admin/facilities/dialogs/ChangeFacilityStatusDialog";
import DeleteFacilityDialog from "@/components/admin/facilities/dialogs/DeleteFacilityDialog";
import StyledSelect from "@/components/ui/styled-select";
import { adminApi } from "@/lib/admin/client";
import type {
  FacilitySummary,
  FacilityStatus,
  FacilityType,
} from "@/lib/admin/types";

const FACILITY_TYPE_LABELS: Record<string, string> = {
  hospital: "مستشفى",
  clinic: "عيادة",
  polyclinic: "عيادات متعددة",
  medical_center: "مركز طبي",
  laboratory: "مختبر",
  imaging_center: "مركز أشعة",
  pharmacy: "صيدلية",
  rehabilitation_center: "مركز تأهيل",
  dialysis_center: "مركز غسيل كلوي",
  emergency_center: "طوارئ",
  other: "أخرى",
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "نشط",
  PENDING: "قيد المراجعة",
  INACTIVE: "معطّل",
  DELETED: "محذوف",
};

const DEFAULT_FILTERS = {
  q: "",
  status: "" as FacilityStatus | "",
  facilityType: "" as FacilityType | "",
  city: "",
  hasDoctors: "",
  ownerDoctorId: "",
};

const UNOWNED_OWNER_FILTER = "__unowned__";

function getFacilityOwnerLabel(facility: FacilitySummary): string {
  const ownerName = facility.owner?.user?.fullName || facility.owner?.fullName;
  if (ownerName) return `المالك: ${ownerName}`;
  if (facility.ownerDoctorId) return "المالك: طبيب محدد";
  return "المالك: غير محدد";
}

function getFacilityLocationLabel(facility: FacilitySummary): string {
  if (facility.city && facility.country) return `${facility.city}, ${facility.country}`;
  return facility.city || facility.country || "—";
}

function formatFacilityAttributeLabel(value: string): string {
  return value.replace(/_/g, " ");
}

export default function AdminFacilitiesPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [doctorsOpen, setDoctorsOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] =
    useState<FacilitySummary | null>(null);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const {
    data: facilitiesData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["admin", "facilities", filters],
    queryFn: () =>
      adminApi.facilities.list({
        page: 1,
        limit: 20,
        q: filters.q || undefined,
        status: filters.status || undefined,
        facilityType: filters.facilityType || undefined,
        city: filters.city || undefined,
        ownerDoctorId:
          filters.ownerDoctorId === UNOWNED_OWNER_FILTER
            ? ""
            : filters.ownerDoctorId || undefined,
        hasDoctors:
          filters.hasDoctors === "true"
            ? true
            : filters.hasDoctors === "false"
              ? false
              : undefined,
      }),
  });

  const { data: doctorsData, isLoading: isLoadingOwnerDoctors } = useQuery({
    queryKey: ["admin", "facility-owner-options"],
    queryFn: () =>
      adminApi.doctors.list({
        status: "approved",
        page: 1,
        limit: 100,
      }),
  });

  const facilities = facilitiesData?.facilities || [];
  const totalFacilities = facilitiesData?.total ?? facilities.length;
  const ownerDoctors =
    doctorsData?.doctors?.map((doctor) => ({
      _id: doctor._id,
      user: { fullName: doctor.user?.fullName || doctor._id },
    })) || [];
  const ownerFilterPlaceholder = isLoadingOwnerDoctors
    ? "جارٍ تحميل الأطباء..."
    : ownerDoctors.length === 0
      ? "تصفية حسب المالك"
      : "الطبيب المالك";

  const openEdit = useCallback((facility: FacilitySummary) => {
    setSelectedFacility(facility);
    setEditOpen(true);
  }, []);

  const openDetails = useCallback((facility: FacilitySummary) => {
    setSelectedFacility(facility);
    setDetailsOpen(true);
  }, []);

  const openDoctors = useCallback((facility: FacilitySummary) => {
    setSelectedFacility(facility);
    setDoctorsOpen(true);
  }, []);

  const openStatus = useCallback((facility: FacilitySummary) => {
    setSelectedFacility(facility);
    setStatusOpen(true);
  }, []);

  const openDelete = useCallback((facility: FacilitySummary) => {
    setSelectedFacility(facility);
    setDeleteOpen(true);
  }, []);

  const handleRefresh = () => {
    refetch();
  };

  const handleFacilityDialogOpenChange = (
    setOpen: (open: boolean) => void,
    open: boolean,
  ) => {
    setOpen(open);
    if (!open) {
      setSelectedFacility(null);
    }
  };

  const hasActiveFilters = Boolean(
    filters.q ||
      filters.status ||
      filters.facilityType ||
      filters.city ||
      filters.hasDoctors ||
      filters.ownerDoctorId,
  );

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
                key: "total",
                icon: <Building2 className="h-5 w-5 shrink-0" />,
                value: totalFacilities.toLocaleString("ar-EG"),
                label: "إجمالي المنشآت",
              },
            ]}
        />

        <section className="mt-4 rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="font-cairo text-[12px] font-extrabold text-[#667085]">
                قائمة المنشآت الطبية
              </div>
              <div className="mt-1 font-cairo text-[11px] font-bold text-[#98A2B3]">
                {hasActiveFilters
                  ? `عرض ${facilities.length} من أصل ${totalFacilities} منشأة`
                  : `إجمالي النتائج: ${totalFacilities}`}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFilters(DEFAULT_FILTERS)}
                disabled={!hasActiveFilters || isLoading}
                className="inline-flex h-[40px] items-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#344054] disabled:opacity-50"
              >
                <Filter className="h-4 w-4" />
                إعادة التصفية
              </button>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isLoading}
                className="inline-flex h-[40px] items-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#344054] disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
                تحديث
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 mt-4 md:grid-cols-6">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#98A2B3]" />
              <input
                type="text"
                value={filters.q}
                onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                placeholder="بحث بالاسم..."
                className="w-full rounded-[8px] border border-[#E5E7EB] bg-white pr-10 pl-3 py-2.5 font-cairo text-[12px] font-bold text-[#344054] placeholder:text-[#98A2B3] focus:border-primary focus:outline-none"
              />
            </div>

            <StyledSelect
              value={filters.status}
              onChange={(value) =>
                setFilters({ ...filters, status: value as FacilityStatus | "" })
              }
              options={[
                { value: "", label: "كل الحالات" },
                { value: "ACTIVE", label: "نشط" },
                { value: "PENDING", label: "قيد المراجعة" },
                { value: "INACTIVE", label: "معطّل" },
                { value: "DELETED", label: "محذوف" },
              ]}
              placeholder="الحالة"
            />

            <StyledSelect
              value={filters.facilityType}
              onChange={(value) =>
                setFilters({
                  ...filters,
                  facilityType: value as FacilityType | "",
                })
              }
              options={[
                { value: "", label: "كل الأنواع" },
                ...Object.entries(FACILITY_TYPE_LABELS).map(
                  ([value, label]) => ({
                    value,
                    label,
                  }),
                ),
              ]}
              placeholder="نوع المنشأة"
            />

            <input
              type="text"
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              placeholder="المدينة..."
              className="w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 py-2.5 font-cairo text-[12px] font-bold text-[#344054] placeholder:text-[#98A2B3] focus:border-primary focus:outline-none"
            />

            <StyledSelect
              value={filters.hasDoctors}
              onChange={(value) =>
                setFilters({ ...filters, hasDoctors: value })
              }
              options={[
                { value: "", label: "الكل" },
                { value: "true", label: "لديها أطباء" },
                { value: "false", label: "بدون أطباء" },
              ]}
              placeholder="الأطباء"
            />

            <StyledSelect
              value={filters.ownerDoctorId}
              onChange={(value) =>
                setFilters({ ...filters, ownerDoctorId: value })
              }
              options={[
                { value: "", label: "كل المالكين" },
                { value: UNOWNED_OWNER_FILTER, label: "بدون مالك" },
                ...ownerDoctors.map((doctor) => ({
                  value: doctor._id,
                  label: doctor.user.fullName,
                })),
              ]}
              placeholder={ownerFilterPlaceholder}
              disabled={isLoadingOwnerDoctors}
            />
          </div>
        </section>

        <section className="mt-4 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : facilities.length === 0 ? (
            <div className="rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-10 text-center font-cairo text-[13px] font-semibold text-[#667085]">
              {hasActiveFilters
                ? "لا توجد منشآت تطابق التصفية الحالية."
                : "لا توجد منشآت طبية حالياً."}
            </div>
          ) : (
            facilities.map((facility) => {
              const isDeleted = facility.status === "DELETED";

              return (
                <div
                  key={facility._id || facility.id}
                  className="rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-4 shadow-[0_12px_24px_rgba(0,0,0,0.05)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="mb-2 flex items-center gap-3">
                        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[8px] bg-gradient-to-br from-primary to-primary/70 text-white shadow-sm">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-cairo text-[16px] font-black leading-[22px] text-[#111827]">
                            {facility.name || "—"}
                          </div>
                          <div className="mt-0.5 font-cairo text-[11px] font-bold text-[#98A2B3]">
                            {FACILITY_TYPE_LABELS[facility.facilityType || ""] ||
                              facility.facilityType ||
                              "—"}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-4">
                        {(facility.city || facility.country) && (
                          <div className="flex items-center gap-2 font-cairo text-[12px] font-bold text-[#667085]">
                            <MapPin className="h-3.5 w-3.5" />
                            {getFacilityLocationLabel(facility)}
                          </div>
                        )}
                        {facility.phone && (
                          <div
                            dir="ltr"
                            className="flex items-center gap-2 font-cairo text-[12px] font-bold text-[#667085]"
                          >
                            <Phone className="h-3.5 w-3.5" />
                            {facility.phone}
                          </div>
                        )}
                        {facility.doctorCount !== undefined && (
                          <div className="flex items-center gap-2 font-cairo text-[12px] font-bold text-[#667085]">
                            <Users className="h-3.5 w-3.5" />
                            {facility.doctorCount === 0
                              ? "لا يوجد أطباء"
                              : `${facility.doctorCount} طبيب`}
                          </div>
                        )}
                        <div className="flex items-center gap-2 font-cairo text-[12px] font-bold text-[#667085]">
                          <UserCheck className="h-3.5 w-3.5" />
                          {getFacilityOwnerLabel(facility)}
                        </div>
                        <div className="inline-flex items-center rounded-[6px] border px-2 py-1 font-cairo text-[11px] font-bold">
                          {STATUS_LABELS[facility.status || ""] ||
                            facility.status ||
                            "—"}
                        </div>
                      </div>

                      {facility.description ? (
                        <p className="mt-3 max-w-[720px] font-cairo text-[12px] font-semibold leading-[20px] text-[#667085]">
                          {facility.description}
                        </p>
                      ) : null}
                      {facility.attributes?.length ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {facility.attributes.map((attribute) => (
                            <span
                              key={attribute}
                              className="inline-flex items-center rounded-[6px] bg-[#E7FBFA] px-2.5 py-1 font-cairo text-[11px] font-extrabold text-primary"
                            >
                              {formatFacilityAttributeLabel(attribute)}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      {isDeleted ? (
                        <p className="mt-3 font-cairo text-[11px] font-bold text-[#B42318]">
                          هذه المنشأة محذوفة حاليًا، لذلك تم تعطيل إجراءات التعديل والحالة والحذف.
                        </p>
                      ) : null}
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openDetails(facility)}
                        title="عرض التفاصيل"
                        className="inline-flex h-[34px] items-center gap-1.5 rounded-[8px] border border-[#E5E7EB] bg-white px-3 font-cairo text-[11px] font-extrabold text-[#344054] transition hover:bg-[#F3F4F6]"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        تفاصيل
                      </button>
                      <button
                        type="button"
                        onClick={() => openDoctors(facility)}
                        title="الأطباء"
                        className="inline-flex h-[34px] items-center gap-1.5 rounded-[8px] border border-[#E5E7EB] bg-white px-3 font-cairo text-[11px] font-extrabold text-[#344054] transition hover:bg-[#F3F4F6]"
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                        الأطباء
                      </button>
                      <button
                        type="button"
                        onClick={() => openStatus(facility)}
                        title="تغيير الحالة"
                        disabled={isDeleted}
                        className="inline-flex h-[34px] items-center gap-1.5 rounded-[8px] border border-[#E5E7EB] bg-white px-3 font-cairo text-[11px] font-extrabold text-[#344054] transition hover:bg-[#F3F4F6] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Filter className="h-3.5 w-3.5" />
                        الحالة
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(facility)}
                        title="تعديل البيانات"
                        disabled={isDeleted}
                        className="inline-flex h-[34px] items-center gap-1.5 rounded-[8px] border border-[#BBF7D0] bg-white px-3 font-cairo text-[11px] font-extrabold text-[#16A34A] transition hover:bg-[#F0FDF4] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        تعديل
                      </button>
                      <button
                        type="button"
                        onClick={() => openDelete(facility)}
                        title="حذف"
                        disabled={isDeleted}
                        className="inline-flex h-[34px] items-center gap-1.5 rounded-[8px] border border-[#FECACA] bg-white px-3 font-cairo text-[11px] font-extrabold text-[#DC2626] transition hover:bg-[#FEF2F2] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        حذف
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </section>

        {/* Create Facility Dialog */}
        <CreateFacilityDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          doctors={ownerDoctors}
          onSuccess={() => {
            refetch();
          }}
        />

        {/* Edit Facility Dialog */}
        <EditFacilityDialog
          open={editOpen}
          onOpenChange={(open) =>
            handleFacilityDialogOpenChange(setEditOpen, open)
          }
          facility={selectedFacility}
          doctors={ownerDoctors}
          onSuccess={() => {
            refetch();
          }}
        />

        {/* Facility Details Dialog */}
        <FacilityDetailsDialog
          open={detailsOpen}
          onOpenChange={(open) =>
            handleFacilityDialogOpenChange(setDetailsOpen, open)
          }
          facilityId={selectedFacility?.id || selectedFacility?._id || null}
        />

        {/* Facility Doctors Dialog */}
        <FacilityDoctorsDialog
          open={doctorsOpen}
          onOpenChange={(open) =>
            handleFacilityDialogOpenChange(setDoctorsOpen, open)
          }
          facilityId={selectedFacility?.id || selectedFacility?._id || null}
          facilityName={selectedFacility?.name || undefined}
        />

        {/* Change Facility Status Dialog */}
        <ChangeFacilityStatusDialog
          open={statusOpen}
          onOpenChange={(open) =>
            handleFacilityDialogOpenChange(setStatusOpen, open)
          }
          facilityId={selectedFacility?.id || selectedFacility?._id || null}
          facilityName={selectedFacility?.name || undefined}
          currentStatus={selectedFacility?.status || undefined}
        />

        {/* Delete Facility Dialog */}
        <DeleteFacilityDialog
          open={deleteOpen}
          onOpenChange={(open) =>
            handleFacilityDialogOpenChange(setDeleteOpen, open)
          }
          facilityId={selectedFacility?.id || selectedFacility?._id || null}
          facilityName={selectedFacility?.name || undefined}
        />
      </div>
    </>
  );
}
