"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Helmet } from "react-helmet-async";
import {
  ClinicAccountsSearchRow,
  ClinicAccountsSubNav,
  ClinicAccountsModalShell,
} from "@/components/doctor/clinic-accounts";
import { DoctorListEmptyIllustration } from "@/components/doctor/shared/doctor-list-empty-illustration";
import DoctorListErrorState from "@/components/doctor/shared/doctor-list-error-state";
import DoctorTablePagination from "@/components/doctor/shared/doctor-table-pagination";
import { DoctorTableSkeleton } from "@/components/doctor/shared/skeletons";
import { useToast } from "@/components/ui/ToastProvider";
import {
  useBillingServices,
  useBillingSettings,
  useCreateBillingService,
  useDeleteBillingService,
  useUpdateBillingService,
} from "@/hooks/doctor/billing";
import { getUserFacingRequestErrorMessage } from "@/lib/api";
import { formatBillingAmount } from "@/lib/doctor/billing/format";
import type { ApiBillingService } from "@/lib/doctor/billing/apiTypes";
import { useRetryAction } from "@/lib/query/useRetryAction";
import { useBillingAccess } from "@/hooks/billing/useBillingAccess";
import { useI18n } from "@/i18n/provider";

export default function DoctorClinicServicesPage() {
  const { t, locale, dir } = useI18n();
  const { toast } = useToast();
  const { canManageServices } = useBillingAccess();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ApiBillingService | null>(null);
  const [name, setName] = useState("");
  const [defaultPrice, setDefaultPrice] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [description, setDescription] = useState("");

  const settingsQuery = useBillingSettings();
  const list = useBillingServices({
    search,
    page,
    limit,
    includeInactive: true,
  });
  const createService = useCreateBillingService();
  const updateService = useUpdateBillingService();
  const deleteService = useDeleteBillingService();
  const { retry, retrying } = useRetryAction(() => list.refetch());

  useEffect(() => {
    if (!dialogOpen) return;
    setName(editTarget?.name ?? "");
    setDefaultPrice(
      editTarget?.defaultPrice != null ? String(editTarget.defaultPrice) : "",
    );
    setDurationMinutes(
      editTarget?.durationMinutes != null
        ? String(editTarget.durationMinutes)
        : "",
    );
    setDescription(editTarget?.description ?? "");
  }, [dialogOpen, editTarget]);

  const openCreate = () => {
    setEditTarget(null);
    setDialogOpen(true);
  };

  const openEdit = (service: ApiBillingService) => {
    setEditTarget(service);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    // Backend requires defaultPrice > 0 (exclusiveMinimum: 0) — reject 0/empty client-side.
    if (defaultPrice.trim() && Number(defaultPrice) <= 0) {
      toast(t("doctor.clinicAccounts.services.error.invalidPrice"), {
        variant: "error",
      });
      return;
    }
    const body = {
      name: name.trim(),
      defaultPrice: defaultPrice.trim() ? Number(defaultPrice) : undefined,
      durationMinutes: durationMinutes.trim()
        ? Number(durationMinutes)
        : undefined,
      description: description.trim() || undefined,
      // Only set on create — editing an existing (possibly deactivated) service must
      // not silently reactivate it as a side effect of an unrelated field edit.
      ...(editTarget ? {} : { isActive: true }),
    };
    try {
      if (editTarget?.id) {
        await updateService.mutateAsync({ serviceId: editTarget.id, body });
        toast(t("doctor.clinicAccounts.services.success.updated"), {
          variant: "success",
        });
      } else {
        await createService.mutateAsync(body);
        toast(t("doctor.clinicAccounts.services.success.created"), {
          variant: "success",
        });
      }
      setDialogOpen(false);
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), { variant: "error" });
    }
  };

  const handleDeactivate = async (service: ApiBillingService) => {
    if (
      !window.confirm(
        t("doctor.clinicAccounts.services.confirmDeactivate", {
          name: service.name ?? "",
        }),
      )
    )
      return;
    try {
      await deleteService.mutateAsync(service.id);
      toast(t("doctor.clinicAccounts.services.success.deactivated"), {
        variant: "success",
      });
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), { variant: "error" });
    }
  };

  const handleActivate = async (service: ApiBillingService) => {
    try {
      await updateService.mutateAsync({
        serviceId: service.id,
        body: { isActive: true },
      });
      toast(t("doctor.clinicAccounts.services.success.activated"), {
        variant: "success",
      });
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), { variant: "error" });
    }
  };

  return (
    <>
      <Helmet>
        <title>{t("doctor.clinicAccounts.services.page.title")}</title>
      </Helmet>

      <div dir={dir} lang={locale} className="w-full pb-8 sm:pb-10">
        <ClinicAccountsSubNav />

        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="text-start">
            <h1 className="font-cairo text-[28px] font-black text-[#111827]">
              {t("doctor.clinicAccounts.services.title")}
            </h1>
            <p className="mt-2 font-cairo text-[14px] font-semibold text-[#667085]">
              {t("doctor.clinicAccounts.services.subtitle")}
            </p>
          </div>
          {canManageServices ? (
            <button
              type="button"
              onClick={openCreate}
              className="h-11 rounded-[10px] bg-primary px-5 font-cairo text-[13px] font-extrabold text-white"
            >
              {t("doctor.clinicAccounts.services.newService")}
            </button>
          ) : null}
        </header>

        <ClinicAccountsSearchRow
          value={search}
          onChange={setSearch}
          onValueChangeExtra={() => setPage(1)}
          placeholder={t("doctor.clinicAccounts.services.searchPlaceholder")}
          onClear={() => setSearch("")}
        />
        {!canManageServices ? (
          <p className="mt-4 text-start font-cairo text-[12px] font-semibold text-[#667085]">
            {t("doctor.clinicAccounts.services.viewOnly")}
          </p>
        ) : null}

        <section className="mt-6 rounded-[12px] border border-[#EEF2F6] bg-white p-5">
          {list.isAwaitingData && !list.services.length ? (
            <DoctorTableSkeleton rows={5} columns={4} />
          ) : list.isError ? (
            <DoctorListErrorState
              title={t("doctor.clinicAccounts.services.loadFailed")}
              brief={getUserFacingRequestErrorMessage(list.error)}
              retrying={retrying}
              onRetry={() => void retry()}
            />
          ) : list.services.length === 0 ? (
            <DoctorListEmptyIllustration
              variant="teal"
              imageSrc="/images/photo-not-found_appotemint.png"
              imageClassName="drop-shadow-[0_12px_32px_rgba(15,118,110,0.1)]"
              title={
                search.trim()
                  ? t("doctor.clinicAccounts.services.empty.matching")
                  : t("doctor.clinicAccounts.services.empty.none")
              }
              subtitle={
                search.trim()
                  ? t("doctor.clinicAccounts.services.empty.matchingSubtitle")
                  : t("doctor.clinicAccounts.services.empty.noneSubtitle")
              }
              actionLabel={
                canManageServices
                  ? t("doctor.clinicAccounts.services.addService")
                  : undefined
              }
              onAction={canManageServices ? openCreate : undefined}
              actionIcon={
                canManageServices ? <Plus className="h-4 w-4" /> : undefined
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[720px] w-full text-start">
                <thead>
                  <tr className="border-b border-[#EEF2F6] font-cairo text-[12px] font-extrabold text-[#667085]">
                    <th className="px-3 py-3">
                      {t("doctor.clinicAccounts.services.table.service")}
                    </th>
                    <th className="px-3 py-3">
                      {t("doctor.clinicAccounts.services.table.price")}
                    </th>
                    <th className="px-3 py-3">
                      {t("doctor.clinicAccounts.services.table.duration")}
                    </th>
                    <th className="px-3 py-3">
                      {t("doctor.clinicAccounts.services.table.status")}
                    </th>
                    {canManageServices ? (
                      <th className="px-3 py-3">
                        {t("doctor.clinicAccounts.services.table.actions")}
                      </th>
                    ) : null}
                  </tr>
                </thead>
                <tbody>
                  {list.services.map((service) => (
                    <tr key={service.id} className="border-b border-[#F2F4F7]">
                      <td className="px-3 py-4 font-cairo text-[13px] font-extrabold text-[#111827]">
                        {service.name}
                      </td>
                      <td className="px-3 py-4 font-cairo text-[13px] font-semibold">
                        {service.defaultPrice != null
                          ? formatBillingAmount(
                              service.defaultPrice,
                              settingsQuery.currency,
                            )
                          : "—"}
                      </td>
                      <td className="px-3 py-4 font-cairo text-[13px] font-semibold">
                        {service.durationMinutes ?? "—"}{" "}
                        {t("doctor.clinicAccounts.services.table.min")}
                      </td>
                      <td className="px-3 py-4">
                        {service.isActive !== false
                          ? t("doctor.clinicAccounts.services.status.active")
                          : t("doctor.clinicAccounts.services.status.inactive")}
                      </td>
                      {canManageServices ? (
                        <td className="px-3 py-4">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => openEdit(service)}
                              className="rounded-[6px] border border-primary px-3 py-1 text-[11px] font-extrabold text-primary"
                            >
                              {t("doctor.clinicAccounts.services.edit")}
                            </button>
                            {service.isActive !== false ? (
                              <button
                                type="button"
                                onClick={() => void handleDeactivate(service)}
                                className="rounded-[6px] bg-[#FEF3F2] px-3 py-1 text-[11px] font-extrabold text-[#B42318]"
                              >
                                {t("doctor.clinicAccounts.services.deactivate")}
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => void handleActivate(service)}
                                className="rounded-[6px] bg-[#F0FDFA] px-3 py-1 text-[11px] font-extrabold text-primary"
                              >
                                {t("doctor.clinicAccounts.services.activate")}
                              </button>
                            )}
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {list.services.length > 0 ? (
          <DoctorTablePagination
            className="mt-6"
            page={page}
            totalPages={list.totalPages}
            pageSize={limit}
            pageSizeOptions={[10, 20, 50]}
            disabled={list.isAwaitingData}
            onPageChange={setPage}
            onPageSizeChange={(nextLimit) => {
              setLimit(nextLimit);
              setPage(1);
            }}
          />
        ) : null}
      </div>

      <ClinicAccountsModalShell
        open={dialogOpen && canManageServices}
        onClose={() => setDialogOpen(false)}
        title={
          editTarget
            ? t("doctor.clinicAccounts.services.editService")
            : t("doctor.clinicAccounts.services.newService")
        }
        maxWidthClass="max-w-[520px]"
      >
        <div dir={dir} className="space-y-4 text-start">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("doctor.clinicAccounts.services.modal.serviceName")}
            className="h-11 w-full rounded-[8px] border border-[#E5E7EB] px-3 font-cairo text-[13px]"
          />
          <input
            type="number"
            min={1}
            step="any"
            value={defaultPrice}
            onChange={(e) => setDefaultPrice(e.target.value)}
            placeholder={t("doctor.clinicAccounts.services.modal.defaultPrice")}
            className="h-11 w-full rounded-[8px] border border-[#E5E7EB] px-3 font-cairo text-[13px]"
          />
          <input
            type="number"
            min={1}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            placeholder={t("doctor.clinicAccounts.services.modal.duration")}
            className="h-11 w-full rounded-[8px] border border-[#E5E7EB] px-3 font-cairo text-[13px]"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("doctor.clinicAccounts.services.modal.description")}
            rows={3}
            className="w-full rounded-[8px] border border-[#E5E7EB] px-3 py-2 font-cairo text-[13px]"
          />
          <button
            type="button"
            disabled={
              createService.isPending || updateService.isPending || !name.trim()
            }
            onClick={() => void handleSave()}
            className="h-11 w-full rounded-[8px] bg-primary font-cairo text-[13px] font-extrabold text-white disabled:opacity-60"
          >
            {t("doctor.clinicAccounts.services.modal.save")}
          </button>
        </div>
      </ClinicAccountsModalShell>
    </>
  );
}
