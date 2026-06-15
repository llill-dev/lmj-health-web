"use client";

import { Building2, Loader2, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  ClinicAccountsBanner,
  ClinicAccountsSearchCount,
  ClinicAccountsSearchRow,
} from "@/components/doctor/clinic-accounts";
import DoctorTablePagination from "@/components/doctor/shared/doctor-table-pagination";
import DoctorListErrorState from "@/components/doctor/shared/doctor-list-error-state";
import {
  FacilitiesTable,
  FacilityEmptyState,
  FacilityFormDialog,
} from "@/components/doctor/facilities";
import { useToast } from "@/components/ui/ToastProvider";
import { useDoctorFacility, useDoctorFacilityTypes } from "@/hooks";
import { getUserFacingRequestErrorMessage } from "@/lib/api";
import { useRetryAction } from "@/lib/query/useRetryAction";
import { getDoctorFacilitySaveErrorToast } from "@/lib/doctor/facilities/errors";
import type { DoctorFacilityFormSchemaValues } from "@/lib/doctor/facilities/schema";
import type { DoctorFacility } from "@/lib/doctor/facilities/types";
import { DEFAULT_FACILITY_TYPE_OPTIONS } from "@/lib/doctor/facilities/types";

const PAGE_SIZE = 10;

export default function DoctorFacilitiesPage() {
  const { toast } = useToast();
  const { facility, facilityQuery, saveMutation, isAwaitingData } =
    useDoctorFacility();
  const typesQuery = useDoctorFacilityTypes();
  const { retry: retryFacility, retrying: retryingFacility } = useRetryAction(
    () => facilityQuery.refetch(),
  );
  const isAwaitingFacility = isAwaitingData;

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editTarget, setEditTarget] = useState<DoctorFacility | null>(null);

  const facilities = useMemo(() => (facility ? [facility] : []), [facility]);

  const typeOptions = useMemo(() => {
    const apiTypes = typesQuery.data?.types ?? [];
    if (!apiTypes.length) return DEFAULT_FACILITY_TYPE_OPTIONS;
    return apiTypes.map((type) => ({
      value: type.key as DoctorFacility["facilityType"],
      label: type.label,
    }));
  }, [typesQuery.data?.types]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return facilities;
    return facilities.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q) ||
        item.phone.toLowerCase().includes(q) ||
        item.address.toLowerCase().includes(q),
    );
  }, [facilities, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const rangeStart = filtered.length ? (safePage - 1) * PAGE_SIZE + 1 : 0;
  const rangeEnd = Math.min(safePage * PAGE_SIZE, filtered.length);

  const canCreate = !facility;

  const openCreate = () => {
    if (!canCreate) {
      toast(
        "يمكنك امتلاك منشأة واحدة فقط. عدّل المنشأة الحالية بدلاً من إنشاء أخرى.",
        {
          title: "منشأة موجودة",
          variant: "error",
        },
      );
      return;
    }
    setDialogMode("create");
    setEditTarget(null);
    setDialogOpen(true);
  };

  const openEdit = (target: DoctorFacility) => {
    setDialogMode("edit");
    setEditTarget(target);
    setDialogOpen(true);
  };

  const handleSubmit = async (values: DoctorFacilityFormSchemaValues) => {
    try {
      await saveMutation.mutateAsync({
        mode: dialogMode,
        values,
        existingAttributes: editTarget?.attributes,
      });

      toast(
        dialogMode === "edit"
          ? "تم حفظ تعديلات المنشأة."
          : "تمت إضافة المنشأة بنجاح.",
        {
          title: dialogMode === "edit" ? "تم التحديث" : "تمت الإضافة",
          variant: "success",
        },
      );
      setDialogOpen(false);
    } catch (error) {
      const { title, message } = getDoctorFacilitySaveErrorToast(
        error,
        dialogMode,
      );
      toast(message, {
        title,
        variant: "error",
      });
    }
  };

  if (isAwaitingFacility) {
    return (
      <>
        <Helmet>
          <title>المنشآت • LMJ Health</title>
        </Helmet>
        <div
          dir="rtl"
          lang="ar"
          className="flex min-h-[360px] items-center justify-center"
        >
          <div className="flex items-center gap-3 font-cairo text-[14px] font-semibold text-[#667085]">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            جارٍ تحميل المنشآت…
          </div>
        </div>
      </>
    );
  }

  if (facilityQuery.isError) {
    return (
      <>
        <Helmet>
          <title>المنشآت • LMJ Health</title>
        </Helmet>
        <DoctorListErrorState
          title="تعذّر تحميل المنشآت"
          brief={getUserFacingRequestErrorMessage(facilityQuery.error)}
          onRetry={() => void retryFacility()}
          retrying={retryingFacility}
        />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>المنشآت • LMJ Health</title>
      </Helmet>

      <div dir="rtl" lang="ar">
        <ClinicAccountsBanner
          title="المنشآت"
          icon={<Building2 className="h-7 w-7 text-white sm:h-8 sm:w-8" />}
          action={
            <button
              type="button"
              onClick={openCreate}
              disabled={!canCreate || saveMutation.isPending}
              className="inline-flex h-[44px] items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[13px] font-extrabold text-primary shadow-sm transition hover:border-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" aria-hidden />
              إضافة منشأة
            </button>
          }
        />

        <ClinicAccountsSearchRow
          value={search}
          onChange={setSearch}
          placeholder="ابحث عن منشأة..."
          onValueChangeExtra={() => setPage(1)}
          trailing={
            <ClinicAccountsSearchCount count={filtered.length} label="منشأة" />
          }
        />

        {!filtered.length ? (
          <FacilityEmptyState onAdd={openCreate} />
        ) : (
          <>
            <FacilitiesTable rows={pageRows} onEdit={openEdit} />

            {filtered.length > PAGE_SIZE ? (
              <DoctorTablePagination
                className="mt-4"
                controlsFirst
                page={safePage}
                totalPages={totalPages}
                pageSize={PAGE_SIZE}
                pageSizeOptions={[10, 20]}
                summaryLabel={`عرض ${rangeStart}-${rangeEnd} من أصل ${filtered.length} منشأة`}
                onPageChange={setPage}
                onPageSizeChange={() => setPage(1)}
              />
            ) : null}
          </>
        )}

        <FacilityFormDialog
          open={dialogOpen}
          mode={dialogMode}
          initialFacility={editTarget}
          typeOptions={typeOptions}
          submitting={saveMutation.isPending}
          onClose={() => {
            if (!saveMutation.isPending) setDialogOpen(false);
          }}
          onSubmit={handleSubmit}
        />
      </div>
    </>
  );
}
