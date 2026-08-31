"use client";

import { Plus, UserCog, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import DoctorDashboardOverview from "@/components/doctor/dashboard/doctor-dashboard-overview";
import {
  ClinicAccountsSearchRow,
  ClinicAccountsSearchCount,
} from "@/components/doctor/clinic-accounts";
import { DoctorListEmptyIllustration } from "@/components/doctor/shared/doctor-list-empty-illustration";
import DoctorListErrorState from "@/components/doctor/shared/doctor-list-error-state";
import { DoctorExpandableCardSkeleton } from "@/components/doctor/shared/skeletons";
import {
  DoctorSecretaryCard,
  DoctorSecretaryCreateDialog,
  DoctorSecretaryEditDialog,
} from "@/components/doctor/secretaries";
import ConfirmActionDialog from "@/components/doctor/confirm-action-dialog";
import { useToast } from "@/components/ui/ToastProvider";
import {
  useCreateDoctorSecretary,
  useDoctorSecretaries,
  useUnassignDoctorSecretary,
  useUpdateDoctorSecretary,
} from "@/hooks/doctor/secretaries/useDoctorSecretaries";
import { getUserFacingRequestErrorMessage } from "@/lib/api";
import { getSecretaryId } from "@/lib/doctor/secretaries/formUtils";
import { isSecretaryActive } from "@/lib/doctor/secretaries/permissionsUi";
import { getDoctorSecretaryMutationErrorMessage } from "@/lib/doctor/writeFlowErrors";
import type {
  DoctorSecretaryCreateFormValues,
  DoctorSecretaryEditFormValues,
} from "@/lib/doctor/secretaries/schema";
import { MAX_DOCTOR_SECRETARIES } from "@/lib/doctor/secretaries/schema";
import type {
  DoctorSecretary,
  SecretaryStatusFilter,
} from "@/lib/doctor/secretaries/types";
import { useRetryAction } from "@/lib/query/useRetryAction";
import { cn } from "@/lib/utils/utils";
import { useI18n } from "@/i18n/provider";

function buildStatusTabs(
  t: (key: string) => string,
): Array<{ id: SecretaryStatusFilter; label: string }> {
  return [
    { id: "all", label: t("doctor.secretaries.statusAll") },
    { id: "active", label: t("doctor.secretaries.statusActive") },
    { id: "disabled", label: t("doctor.secretaries.statusDisabled") },
  ];
}

const MAX_SECRETARIES = MAX_DOCTOR_SECRETARIES;

export default function DoctorSecretariesPage() {
  const { t, locale, dir } = useI18n();
  const statusTabs = buildStatusTabs(t);
  const { toast } = useToast();
  const listQuery = useDoctorSecretaries();
  const createSecretary = useCreateDoctorSecretary();
  const updateSecretary = useUpdateDoctorSecretary();
  const unassignSecretary = useUnassignDoctorSecretary();
  const { retry: retryList, retrying: retryingList } = useRetryAction(() =>
    listQuery.refetch(),
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<SecretaryStatusFilter>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<DoctorSecretary | null>(null);
  const [unassignTarget, setUnassignTarget] = useState<DoctorSecretary | null>(
    null,
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return listQuery.secretaries.filter((secretary) => {
      const active = isSecretaryActive(secretary.user);
      if (statusFilter === "active" && !active) return false;
      if (statusFilter === "disabled" && active) return false;
      if (!q) return true;
      const haystacks = [
        secretary.user?.fullName,
        secretary.user?.email,
        secretary.user?.phone,
      ]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase());
      return haystacks.some((value) => value.includes(q));
    });
  }, [listQuery.secretaries, search, statusFilter]);

  const activeCount = useMemo(
    () =>
      listQuery.secretaries.filter((secretary) =>
        isSecretaryActive(secretary.user),
      ).length,
    [listQuery.secretaries],
  );

  const isTrulyEmpty =
    listQuery.secretaries.length === 0 &&
    !search.trim() &&
    statusFilter === "all";

  const isFilteredEmpty =
    filtered.length === 0 &&
    listQuery.secretaries.length > 0 &&
    (search.trim() !== "" || statusFilter !== "all");

  const handleCreate = async (input: DoctorSecretaryCreateFormValues) => {
    if (listQuery.secretaries.length >= MAX_SECRETARIES) {
      toast(
        locale === "ar"
          ? `الحد الأقصى ${MAX_SECRETARIES} سكرتيرين لكل طبيب.`
          : `The maximum is ${MAX_SECRETARIES} secretaries per doctor.`,
        {
          title: t("doctor.secretaries.cannotAdd"),
          variant: "error",
        },
      );
      return;
    }

    const phone = input.phone
      ? `${input.phone.countryCode}${input.phone.localNumber}`
      : undefined;

    try {
      await createSecretary.mutateAsync({
        fullName: input.fullName.trim(),
        email: input.email.trim(),
        password: input.password,
        phone,
        gender: input.gender,
        permissions: input.permissions,
      });
      toast(t("doctor.secretaries.created"), {
        title: t("doctor.secretaries.added"),
        variant: "success",
      });
      setCreateOpen(false);
    } catch (error) {
      const errorMessage = getDoctorSecretaryMutationErrorMessage(
        error,
        "create",
      );
      toast(errorMessage, {
        title: t("doctor.secretaries.createFailed"),
        variant: "error",
      });
    }
  };

  const handleEditSave = async (input: DoctorSecretaryEditFormValues) => {
    const secretaryId = getSecretaryId(editTarget);
    if (!secretaryId) return;

    const phone = input.phone
      ? `${input.phone.countryCode}${input.phone.localNumber}`
      : undefined;

    try {
      await updateSecretary.mutateAsync({
        secretaryId,
        body: {
          fullName: input.fullName.trim(),
          phone,
          gender: input.gender,
          permissions: input.permissions,
        },
      });
      toast(t("doctor.secretaries.updated"), {
        title: t("doctor.secretaries.saved"),
        variant: "success",
      });
      setEditTarget(null);
    } catch (error) {
      toast(getDoctorSecretaryMutationErrorMessage(error, "update"), {
        title: t("doctor.secretaries.saveFailed"),
        variant: "error",
      });
    }
  };

  const handleUnassign = async () => {
    const secretaryId = getSecretaryId(unassignTarget);
    if (!secretaryId) return;
    try {
      await unassignSecretary.mutateAsync(secretaryId);
      toast(t("doctor.secretaries.unlinked"), {
        title: t("doctor.secretaries.unlinkedTitle"),
        variant: "success",
      });
      setUnassignTarget(null);
    } catch (error) {
      toast(getDoctorSecretaryMutationErrorMessage(error, "unassign"), {
        title: t("doctor.secretaries.unlinkFailed"),
        variant: "error",
      });
      throw error;
    }
  };

  return (
    <>
      <Helmet>
        <title>{t("doctor.secretaries.pageTitle")}</title>
      </Helmet>

      <div dir={dir} lang={locale} className="pb-8 sm:pb-10">
        <DoctorDashboardOverview
          variant="patients"
          surface="mint"
          headerIcon={<UserCog className="h-8 w-8 text-white" />}
          title={t("doctor.secretaries.title")}
          subtitle={t("doctor.secretaries.subtitle")}
          actionLabel={t("doctor.secretaries.addSecretary")}
          actionIcon={<Plus className="h-4 w-4" />}
          onActionClick={() => setCreateOpen(true)}
          actionDisabled={listQuery.secretaries.length >= MAX_SECRETARIES}
          kpis={[
            {
              key: "total",
              icon: <Users className="h-5 w-5 shrink-0" />,
              value: listQuery.isAwaitingData ? "—" : listQuery.total,
              label: t("doctor.secretaries.totalSecretaries"),
            },
            {
              key: "active",
              icon: <UserCog className="h-5 w-5 shrink-0" />,
              value: listQuery.isAwaitingData ? "—" : activeCount,
              label: t("doctor.secretaries.active"),
            },
            {
              key: "limit",
              icon: <Users className="h-5 w-5 shrink-0" />,
              value: MAX_SECRETARIES,
              label: t("doctor.secretaries.maximum"),
            },
          ]}
        />

        <section className="mb-5 rounded-[16px] border border-[#EEF2F6] bg-white p-4 shadow-sm sm:p-5">
          <ClinicAccountsSearchRow
            value={search}
            onChange={setSearch}
            placeholder={t("doctor.secretaries.searchPlaceholder")}
            onClear={() => {
              setSearch("");
              setStatusFilter("all");
            }}
            trailing={
              <ClinicAccountsSearchCount
                count={filtered.length}
                label={t("doctor.secretaries.secretary")}
              />
            }
          />

          <div className="mt-4 flex flex-wrap justify-start gap-2">
            {statusTabs.map((tab) => {
              const active = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={cn(
                    "rounded-[10px] px-4 py-2 font-cairo text-[12px] font-extrabold transition",
                    active
                      ? "bg-primary text-white shadow-[0_8px_20px_rgba(15,143,139,0.25)]"
                      : "border border-[#EEF2F6] bg-[#F9FAFB] text-[#667085] hover:bg-[#F0FDFA] hover:text-primary",
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </section>

        {listQuery.isError ? (
          <DoctorListErrorState
            title={t("doctor.secretaries.loadFailed")}
            brief={getUserFacingRequestErrorMessage(listQuery.error)}
            retrying={retryingList}
            onRetry={() => void retryList()}
          />
        ) : listQuery.isAwaitingData ? (
          <div className="space-y-4">
            <DoctorExpandableCardSkeleton />
            <DoctorExpandableCardSkeleton />
          </div>
        ) : isTrulyEmpty || isFilteredEmpty ? (
          <DoctorListEmptyIllustration
            variant="teal"
            imageSrc="/images/photo-not-found_appotemint.png"
            imageClassName="drop-shadow-[0_12px_32px_rgba(15,118,110,0.1)]"
            title={
              isFilteredEmpty
                ? t("doctor.secretaries.noResultsFilter")
                : t("doctor.secretaries.noResultsEmpty")
            }
            subtitle={
              isFilteredEmpty
                ? t("doctor.secretaries.noResultsFilterSubtitle")
                : t("doctor.secretaries.noResultsEmptySubtitle")
            }
            actionLabel={t("doctor.secretaries.addSecretary")}
            onAction={() => setCreateOpen(true)}
            actionIcon={<Plus className="h-4 w-4" />}
          />
        ) : (
          <div className="space-y-4">
            {filtered.map((secretary) => (
              <DoctorSecretaryCard
                key={getSecretaryId(secretary) ?? secretary._id}
                secretary={secretary}
                onEdit={setEditTarget}
                onUnassign={setUnassignTarget}
              />
            ))}
          </div>
        )}

        <DoctorSecretaryCreateDialog
          open={createOpen}
          saving={createSecretary.isPending}
          secretaryCount={listQuery.secretaries.length}
          onClose={() => setCreateOpen(false)}
          onSave={handleCreate}
        />

        <DoctorSecretaryEditDialog
          open={Boolean(editTarget)}
          secretary={editTarget}
          saving={updateSecretary.isPending}
          onClose={() => setEditTarget(null)}
          onSave={handleEditSave}
        />

        <ConfirmActionDialog
          open={Boolean(unassignTarget)}
          onOpenChange={(open) => {
            if (!open) setUnassignTarget(null);
          }}
          title={t("doctor.secretaries.unlinkTitle")}
          confirmLabel={t("doctor.secretaries.unlinkConfirm")}
          confirmDisabled={unassignSecretary.isPending}
          description={
            <span className="block font-cairo text-[13px] font-semibold leading-[1.65]">
              {t("doctor.secretaries.unlinkQuestion")}{" "}
              <span className="font-black text-[#101828]">
                {unassignTarget?.user?.fullName ??
                  t("doctor.secretaries.thisSecretary")}
              </span>{" "}
              {t("doctor.secretaries.unlinkDescription")}
            </span>
          }
          onConfirm={handleUnassign}
        />
      </div>
    </>
  );
}
