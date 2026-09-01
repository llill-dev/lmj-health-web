import { useState } from "react";
import {
  OrderManualFormSubmitError,
  assertOrderManualFormValid,
} from "@/lib/doctor/orders/orderManualFormSchema";
import type { OrderManualFieldMessages } from "@/lib/doctor/orders/orderManualFormSchema";
import { resolveOrderManualServerFeedback } from "@/lib/doctor/orders/orderFormErrors";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import {
  getEncounterOrderConfig,
  type CatalogOrderCategory,
} from "@/components/doctor/encounters/orders/encounter-order-config";
import {
  RadiologyManualForm,
  RadiologyPageHeader,
} from "@/components/doctor/radiology";
import { resolveRadiologyStatusLabel } from "@/components/doctor/radiology/map-radiology-ui";
import type { RadiologyManualForm as ManualValues } from "@/components/doctor/radiology/radiology-types";
import DoctorListErrorState from "@/components/doctor/shared/doctor-list-error-state";
import { useToast } from "@/components/ui/ToastProvider";
import { useEncounterOrderWorkspace } from "@/hooks/doctor/encounters/useEncounterOrderWorkspace";
import { readAuthUser } from "@/lib/cookies";
import { useI18n } from "@/i18n/provider";

const EMPTY: ManualValues = {
  name: "",
  type: "",
  bodyArea: "",
  side: "",
  position: "",
  notes: "",
};

export default function DoctorEncounterOrderManualPage({
  category,
}: {
  category: CatalogOrderCategory;
}) {
  const { t, locale, dir } = useI18n();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { patientId = "", encounterId = "" } = useParams();
  const doctorId = readAuthUser()?.actorIds?.doctorId ?? "";
  const config = getEncounterOrderConfig(t)[category];

  const workspace = useEncounterOrderWorkspace(
    category,
    doctorId,
    patientId,
    encounterId,
  );

  const [form, setForm] = useState<ManualValues>(EMPTY);
  const [fieldErrors, setFieldErrors] = useState<OrderManualFieldMessages>({});
  const workspacePath = config.workspacePath(patientId, encounterId);
  const patientName =
    workspace.encounter?.patient?.user?.fullName?.trim() ?? "";

  if (!patientId || !encounterId) {
    return (
      <DoctorListErrorState
        title={t("doctor.encounter.orderManual.invalidLink")}
        brief={t("doctor.encounter.orderManual.missingId")}
        onRetry={() => navigate(config.hubPath(patientId, encounterId))}
      />
    );
  }

  return (
    <>
      <Helmet>
        <title>
          {t("doctor.encounter.orderManual.manualEntry")} • {config.title} • LMJ
          Health
        </title>
      </Helmet>

      <div dir={dir} lang={locale} className="w-full pb-8 sm:pb-10">
        <RadiologyPageHeader
          patientName={patientName}
          statusLabel={resolveRadiologyStatusLabel(workspace.order, locale)}
          backTo={workspacePath}
          title={config.title}
          subtitle={config.patientSubtitle(patientName)}
        />

        <RadiologyManualForm
          value={form}
          onChange={(next) => {
            setForm(next);
            setFieldErrors({});
          }}
          title={config.manualFormTitle}
          nameLabel={
            category === "lab"
              ? t("doctor.encounter.orderManual.testName")
              : t("doctor.encounter.orderManual.name")
          }
          fieldErrors={fieldErrors}
          saving={workspace.isBusy}
          onSave={async () => {
            try {
              const valid = assertOrderManualFormValid(form);
              await workspace.addManualItem(valid);
              toast(config.catalogAddToast, { variant: "success" });
              setForm(EMPTY);
              setFieldErrors({});
              navigate(workspacePath);
            } catch (error) {
              if (error instanceof OrderManualFormSubmitError) {
                setFieldErrors(error.fields);
                toast(error.message, { variant: "error" });
                return;
              }
              const { toastMessage, fields } =
                resolveOrderManualServerFeedback(error);
              if (Object.keys(fields).length) setFieldErrors(fields);
              toast(toastMessage, { variant: "error" });
            }
          }}
          onCancel={() => navigate(workspacePath)}
        />
      </div>
    </>
  );
}
