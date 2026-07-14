"use client";

import { Building2, Link2, Loader2, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  ClinicAccountsBanner,
  ClinicAccountsSearchCount,
  ClinicAccountsSearchRow,
} from "@/components/doctor/clinic-accounts";
import {
  FacilitiesTable,
  FacilityEmptyState,
  FacilityFormDialog,
  LinkFacilityDialog,
  SuggestFacilityDialog,
} from "@/components/doctor/facilities";
import DoctorTablePagination from "@/components/doctor/shared/doctor-table-pagination";
import DoctorListErrorState from "@/components/doctor/shared/doctor-list-error-state";
import { useToast } from "@/components/ui/ToastProvider";
import {
  useDoctorFacility,
  useDoctorFacilityTypes,
  useLinkFacility,
  useSuggestFacilityRequest,
} from "@/hooks";
import { ApiError, getUserFacingRequestErrorMessage } from "@/lib/api";
import {
  getDoctorFacilityLinkErrorToast,
  getDoctorFacilitySaveErrorToast,
  getDoctorFacilitySuggestErrorToast,
} from "@/lib/doctor/facilities/errors";
import type { SuggestFacilityPayload } from "@/components/doctor/facilities/suggest-facility-dialog";
import type { DoctorFacilityFormSchemaValues } from "@/lib/doctor/facilities/schema";
import type { SuggestFacilityRecord } from "@/lib/doctor/medical-services-directory/api-types";
import type { DoctorFacility } from "@/lib/doctor/facilities/types";
import { DEFAULT_FACILITY_TYPE_OPTIONS } from "@/lib/doctor/facilities/types";
import { useRetryAction } from "@/lib/query/useRetryAction";

const PAGE_SIZE = 10;

export default function DoctorFacilitiesPage() {
  const { toast } = useToast();
  const { facility, facilityQuery, saveMutation, isAwaitingData } =
    useDoctorFacility();
  const { linkMutation } = useLinkFacility();
  const { suggestMutation } = useSuggestFacilityRequest();
  const typesQuery = useDoctorFacilityTypes();
  const { retry: retryFacility, retrying: retryingFacility } = useRetryAction(
    () => facilityQuery.refetch(),
  );

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [suggestDialogOpen, setSuggestDialogOpen] = useState(false);
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
        "يمكنك امتلاك منشأة واحدة فقط. عدّل المنشأة الحالية بدلًا من إنشاء أخرى.",
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
    if (target.isOwned === false) {
      toast(
        "هذه منشأة مرتبطة بحسابك ولا تملكها. لا يمكن تعديل بياناتها من هنا.",
        {
          title: "تعديل غير متاح",
          variant: "error",
        },
      );
      return;
    }

    setDialogMode("edit");
    setEditTarget(target);
    setDialogOpen(true);
  };

  const handleSubmit = async (values: DoctorFacilityFormSchemaValues) => {
    try {
      await saveMutation.mutateAsync({
        mode: dialogMode,
        values,
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

      // API guide: 409 ownerFacilityExists ⇒ doctor already owns one; load it (edit flow).
      if (
        error instanceof ApiError &&
        error.messageKey === "errors.facilities.ownerFacilityExists"
      ) {
        setDialogOpen(false);
        void facilityQuery.refetch();
      }
    }
  };

  const handleLinkSubmit = async (payload: {
    facilityId: string;
    facilityProviderId?: string | null;
    suggestSnapshot: SuggestFacilityRecord;
  }) => {
    try {
      await linkMutation.mutateAsync(payload);
      toast("تم ربط حسابك بالمنشأة بنجاح.", {
        title: "تم الربط",
        variant: "success",
      });
      setLinkDialogOpen(false);
    } catch (error) {
      const { title, message } = getDoctorFacilityLinkErrorToast(error);
      toast(message, {
        title,
        variant: "error",
      });
    }
  };

  const handleSuggestSubmit = async (payload: SuggestFacilityPayload) => {
    try {
      await suggestMutation.mutateAsync(payload);
      toast("تم إرسال اقتراح المنشأة وسيتم مراجعته من الإدارة.", {
        title: "تم إرسال الاقتراح",
        variant: "success",
      });
      setSuggestDialogOpen(false);
      setLinkDialogOpen(false);
    } catch (error) {
      const { title, message } = getDoctorFacilitySuggestErrorToast(error);
      toast(message, {
        title,
        variant: "error",
      });
    }
  };

  if (isAwaitingData) {
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
            جاري تحميل المنشآت...
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
            <div className="flex flex-col items-stretch justify-end gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              {canCreate ? (
                <button
                  type="button"
                  onClick={() => setLinkDialogOpen(true)}
                  disabled={linkMutation.isPending}
                  className="inline-flex h-[44px] items-center gap-2 rounded-[10px] border border-primary/30 bg-[#E6F4F3] px-4 font-cairo text-[13px] font-extrabold text-primary shadow-sm transition hover:border-primary/50 hover:bg-[#DDF0EF] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Link2 className="h-4 w-4" aria-hidden />
                  ربط منشأة موجودة
                </button>
              ) : null}
              <button
                type="button"
                onClick={openCreate}
                disabled={!canCreate || saveMutation.isPending}
                className="inline-flex h-[44px] items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[13px] font-extrabold text-primary shadow-sm transition hover:border-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-4 w-4" aria-hidden />
                إضافة منشأة
              </button>
            </div>
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
          <FacilityEmptyState
            onAdd={openCreate}
            onLink={
              canCreate
                ? () => {
                    if (suggestMutation.isPending) return;
                    setLinkDialogOpen(true);
                  }
                : undefined
            }
            onSuggest={
              canCreate
                ? () => {
                    if (linkMutation.isPending) return;
                    setSuggestDialogOpen(true);
                  }
                : undefined
            }
          />
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

        <LinkFacilityDialog
          open={linkDialogOpen}
          submitting={linkMutation.isPending}
          onClose={() => {
            if (!linkMutation.isPending) setLinkDialogOpen(false);
          }}
          onSuggestFacility={() => {
            if (linkMutation.isPending || suggestMutation.isPending) return;
            setLinkDialogOpen(false);
            setSuggestDialogOpen(true);
          }}
          onLink={handleLinkSubmit}
        />

        <SuggestFacilityDialog
          open={suggestDialogOpen}
          submitting={suggestMutation.isPending}
          typeOptions={typeOptions}
          onClose={() => {
            if (!suggestMutation.isPending) setSuggestDialogOpen(false);
          }}
          onSubmit={handleSuggestSubmit}
        />
      </div>
    </>
  );
}
