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
import { userFacingErrorMessage } from "@/lib/admin/userFacingError";
import type {
  FacilitySummary,
  FacilityStatus,
  FacilityType,
} from "@/lib/admin/types";
import { useI18n } from "@/i18n/provider";

type FacilitySortBy =
  | "createdAt"
  | "updatedAt"
  | "name"
  | "city"
  | "status"
  | "facilityType"
  | "doctorCount";

const DEFAULT_FILTERS = {
  q: "",
  status: "" as FacilityStatus | "",
  facilityType: "" as FacilityType | "",
  city: "",
  hasDoctors: "",
  ownerDoctorId: "",
  attribute: "",
  sortBy: "" as FacilitySortBy | "",
  sortOrder: "desc" as "asc" | "desc",
};

const UNOWNED_OWNER_FILTER = "__unowned__";

function getFacilityOwnerLabel(
  facility: FacilitySummary,
  t: (key: string, fallback?: string) => string,
): string {
  const ownerName = facility.owner?.user?.fullName || facility.owner?.fullName;
  if (ownerName)
    return t("admin.facilities.ownerLabel.named").replace("{name}", ownerName);
  if (facility.ownerDoctorId) return t("admin.facilities.ownerLabel.assigned");
  return t("admin.facilities.ownerLabel.unassigned");
}

function getFacilityLocationLabel(facility: FacilitySummary): string {
  if (facility.city && facility.country) return `${facility.city}, ${facility.country}`;
  return facility.city || facility.country || "—";
}

function formatFacilityAttributeLabel(value: string): string {
  return value.replace(/_/g, " ");
}

export default function AdminFacilitiesPage() {
  const { locale, dir, t } = useI18n();
  const numberLocale = locale === "ar" ? "ar-EG" : "en-US";

  const FACILITY_TYPE_LABELS: Record<string, string> = {
    hospital: t("admin.facilities.type.hospital"),
    clinic: t("admin.facilities.type.clinic"),
    polyclinic: t("admin.facilities.type.polyclinic"),
    medical_center: t("admin.facilities.type.medical_center"),
    laboratory: t("admin.facilities.type.laboratory"),
    imaging_center: t("admin.facilities.type.imaging_center"),
    pharmacy: t("admin.facilities.type.pharmacy"),
    rehabilitation_center: t("admin.facilities.type.rehabilitation_center"),
    dialysis_center: t("admin.facilities.type.dialysis_center"),
    emergency_center: t("admin.facilities.type.emergency_center"),
    other: t("admin.facilities.type.other"),
  };

  const STATUS_LABELS: Record<string, string> = {
    ACTIVE: t("admin.facilities.status.active"),
    PENDING: t("admin.facilities.status.pending"),
    INACTIVE: t("admin.facilities.status.inactive"),
    DELETED: t("admin.facilities.status.deleted"),
  };

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
    isFetching,
    isError,
    error,
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
        attribute: filters.attribute.trim() || undefined,
        sortBy: filters.sortBy || undefined,
        sortOrder: filters.sortBy ? filters.sortOrder : undefined,
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
    ? t("admin.facilities.ownerLoadingPlaceholder")
    : ownerDoctors.length === 0
      ? t("admin.facilities.ownerFilterPlaceholder")
      : t("admin.facilities.ownerDoctorPlaceholder");

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
      filters.ownerDoctorId ||
      filters.attribute ||
      filters.sortBy,
  );

  const SORT_BY_LABELS: Record<FacilitySortBy, string> = {
    updatedAt: t("admin.facilities.sortBy.updatedAt"),
    createdAt: t("admin.facilities.sortBy.createdAt"),
    name: t("admin.facilities.sortBy.name"),
    city: t("admin.facilities.sortBy.city"),
    status: t("admin.facilities.sortBy.status"),
    facilityType: t("admin.facilities.sortBy.facilityType"),
    doctorCount: t("admin.facilities.sortBy.doctorCount"),
  };

  return (
    <>
      <Helmet>
        <title>{t("admin.facilities.page.title")} • LMJ Health</title>
      </Helmet>

      <div dir={dir} lang={locale}>
        <AdminDashboardOverview
          variant="admin"
          surface="mint"
          title={t("admin.facilities.page.title")}
          subtitle={t("admin.facilities.page.subtitle")}
          headerIcon={<Building2 className="h-8 w-8 text-white" />}
          actionLabel={t("admin.facilities.actionLabel")}
          onActionClick={() => setCreateOpen(true)}
          kpis={[
              {
                key: "total",
                icon: <Building2 className="h-5 w-5 shrink-0" />,
                value: isLoading
                  ? "—"
                  : totalFacilities.toLocaleString(numberLocale),
                label: t("admin.facilities.kpi.total"),
              },
            ]}
        />

        <section className="mt-4 rounded-[12px] border border-[#D6EEEC] bg-[#F3FBFA] px-6 py-4 shadow-[0_10px_24px_rgba(20,130,131,0.08)]">
          <div className="font-cairo text-[13px] font-extrabold text-[#0F766E]">
            {t("admin.facilities.disclaimer")}
          </div>
        </section>

        <section className="mt-4 rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="font-cairo text-[12px] font-extrabold text-[#667085]">
                {t("admin.facilities.list.title")}
              </div>
              <div className="mt-1 font-cairo text-[11px] font-bold text-[#98A2B3]">
                {isLoading
                  ? t("admin.facilities.loadingResults")
                  : hasActiveFilters
                    ? t("admin.facilities.showingOfTotal")
                        .replace(
                          "{shown}",
                          facilities.length.toLocaleString(numberLocale),
                        )
                        .replace(
                          "{total}",
                          totalFacilities.toLocaleString(numberLocale),
                        )
                    : t("admin.facilities.totalResults").replace(
                        "{total}",
                        totalFacilities.toLocaleString(numberLocale),
                      )}
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
                {t("admin.facilities.resetFilters")}
              </button>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isLoading}
                className="inline-flex h-[40px] items-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#344054] disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
                />
                {isFetching
                  ? t("admin.facilities.refreshing")
                  : t("admin.facilities.refresh")}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 mt-4 md:grid-cols-6">
            <div className="relative text-center">
              <Search className="absolute start-3 top-1/3 pt-1 -translate-y-1/2 h-4 w-4 text-[#98A2B3]" />
              <input
                type="text"
                value={filters.q}
                onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                placeholder={t("admin.facilities.searchPlaceholder")}
                className="w-full rounded-[8px] border border-[#E5E7EB] bg-white pe-10 ps-3 py-2.5 font-cairo text-[12px] font-bold text-[#344054] placeholder:text-[#98A2B3] focus:border-primary focus:outline-none"
              />
            </div>

            <StyledSelect
              value={filters.status}
              onChange={(value) =>
                setFilters({ ...filters, status: value as FacilityStatus | "" })
              }
              options={[
                { value: "", label: t("admin.facilities.allStatuses") },
                { value: "ACTIVE", label: t("admin.facilities.status.active") },
                {
                  value: "PENDING",
                  label: t("admin.facilities.status.pending"),
                },
                {
                  value: "INACTIVE",
                  label: t("admin.facilities.status.inactive"),
                },
                {
                  value: "DELETED",
                  label: t("admin.facilities.status.deleted"),
                },
              ]}
              placeholder={t("admin.facilities.statusPlaceholder")}
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
                { value: "", label: t("admin.facilities.allTypes") },
                ...Object.entries(FACILITY_TYPE_LABELS).map(
                  ([value, label]) => ({
                    value,
                    label,
                  }),
                ),
              ]}
              placeholder={t("admin.facilities.typePlaceholder")}
            />

            <input
              type="text"
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              placeholder={t("admin.facilities.cityPlaceholder")}
              className="w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 py-2.5 font-cairo text-[12px] font-bold text-[#344054] placeholder:text-[#98A2B3] focus:border-primary focus:outline-none"
            />

            <StyledSelect
              value={filters.hasDoctors}
              onChange={(value) =>
                setFilters({ ...filters, hasDoctors: value })
              }
              options={[
                { value: "", label: t("admin.facilities.doctorsFilter.all") },
                {
                  value: "true",
                  label: t("admin.facilities.doctorsFilter.has"),
                },
                {
                  value: "false",
                  label: t("admin.facilities.doctorsFilter.none"),
                },
              ]}
              placeholder={t("admin.facilities.doctorsPlaceholder")}
            />

            <StyledSelect
              value={filters.ownerDoctorId}
              onChange={(value) =>
                setFilters({ ...filters, ownerDoctorId: value })
              }
              options={[
                { value: "", label: t("admin.facilities.ownerFilter.all") },
                {
                  value: UNOWNED_OWNER_FILTER,
                  label: t("admin.facilities.ownerFilter.none"),
                },
                ...ownerDoctors.map((doctor) => ({
                  value: doctor._id,
                  label: doctor.user.fullName,
                })),
              ]}
              placeholder={ownerFilterPlaceholder}
              disabled={isLoadingOwnerDoctors}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 mt-3 md:grid-cols-3">
            <input
              type="text"
              value={filters.attribute}
              onChange={(e) =>
                setFilters({ ...filters, attribute: e.target.value })
              }
              placeholder={t("admin.facilities.attributePlaceholder")}
              dir="ltr"
              className={`w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 py-2.5 ${locale === "ar" ? "text-start" : "text-end"} font-cairo text-[12px] font-bold text-[#344054] placeholder:text-[#98A2B3] focus:border-primary focus:outline-none`}
            />

            <StyledSelect
              value={filters.sortBy}
              onChange={(value) =>
                setFilters({ ...filters, sortBy: value as FacilitySortBy | "" })
              }
              options={[
                { value: "", label: t("admin.facilities.sortByNone") },
                ...(Object.entries(SORT_BY_LABELS) as [FacilitySortBy, string][]).map(
                  ([value, label]) => ({ value, label }),
                ),
              ]}
              placeholder={t("admin.facilities.sortByPlaceholder")}
            />

            <StyledSelect
              value={filters.sortOrder}
              onChange={(value) =>
                setFilters({ ...filters, sortOrder: value as "asc" | "desc" })
              }
              disabled={!filters.sortBy}
              options={[
                { value: "desc", label: t("admin.facilities.sortOrder.desc") },
                { value: "asc", label: t("admin.facilities.sortOrder.asc") },
              ]}
              placeholder={t("admin.facilities.sortDirectionPlaceholder")}
            />
          </div>
        </section>

        <section className="mt-4 space-y-3">
          {isFetching && !isLoading ? (
            <div className="rounded-[12px] border border-[#D1FAE5] bg-[#ECFDF5] px-4 py-3 font-cairo text-[12px] font-bold text-[#047857]">
              {t("admin.facilities.refreshingList")}
            </div>
          ) : null}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <div className="rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-6 py-10 text-center">
              <div className="font-cairo text-[13px] font-semibold text-[#B42318]">
                {userFacingErrorMessage(
                  error,
                  t("admin.facilities.loadError"),
                )}
              </div>
              <button
                type="button"
                onClick={() => void refetch()}
                className="mt-3 inline-flex h-[36px] items-center gap-2 rounded-[10px] border border-[#FCA5A5] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#B42318] hover:bg-[#FFF5F5]"
              >
                <RefreshCw className="h-4 w-4" />
                {t("admin.facilities.retry")}
              </button>
            </div>
          ) : facilities.length === 0 ? (
            <div className="rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-10 text-center font-cairo text-[13px] font-semibold text-[#667085]">
              {hasActiveFilters
                ? t("admin.facilities.emptyFiltered")
                : t("admin.facilities.emptyAll")}
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
                              ? t("admin.facilities.doctorCount.none")
                              : t("admin.facilities.doctorCount.some").replace(
                                  "{count}",
                                  String(facility.doctorCount),
                                )}
                          </div>
                        )}
                        <div className="flex items-center gap-2 font-cairo text-[12px] font-bold text-[#667085]">
                          <UserCheck className="h-3.5 w-3.5" />
                          {getFacilityOwnerLabel(facility, t)}
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
                          {t("admin.facilities.deletedNotice")}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openDetails(facility)}
                        title={t("admin.facilities.viewDetails")}
                        className="inline-flex h-[34px] items-center gap-1.5 rounded-[8px] border border-[#E5E7EB] bg-white px-3 font-cairo text-[11px] font-extrabold text-[#344054] transition hover:bg-[#F3F4F6]"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        {t("admin.facilities.details")}
                      </button>
                      <button
                        type="button"
                        onClick={() => openDoctors(facility)}
                        title={t("admin.facilities.doctors")}
                        className="inline-flex h-[34px] items-center gap-1.5 rounded-[8px] border border-[#E5E7EB] bg-white px-3 font-cairo text-[11px] font-extrabold text-[#344054] transition hover:bg-[#F3F4F6]"
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                        {t("admin.facilities.doctors")}
                      </button>
                      <button
                        type="button"
                        onClick={() => openStatus(facility)}
                        title={t("admin.facilities.changeStatus")}
                        disabled={isDeleted}
                        className="inline-flex h-[34px] items-center gap-1.5 rounded-[8px] border border-[#E5E7EB] bg-white px-3 font-cairo text-[11px] font-extrabold text-[#344054] transition hover:bg-[#F3F4F6] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Filter className="h-3.5 w-3.5" />
                        {t("admin.facilities.status")}
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(facility)}
                        title={t("admin.facilities.editDetails")}
                        disabled={isDeleted}
                        className="inline-flex h-[34px] items-center gap-1.5 rounded-[8px] border border-[#BBF7D0] bg-white px-3 font-cairo text-[11px] font-extrabold text-[#16A34A] transition hover:bg-[#F0FDF4] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        {t("admin.facilities.edit")}
                      </button>
                      <button
                        type="button"
                        onClick={() => openDelete(facility)}
                        title={t("admin.facilities.delete")}
                        disabled={isDeleted}
                        className="inline-flex h-[34px] items-center gap-1.5 rounded-[8px] border border-[#FECACA] bg-white px-3 font-cairo text-[11px] font-extrabold text-[#DC2626] transition hover:bg-[#FEF2F2] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {t("admin.facilities.delete")}
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
