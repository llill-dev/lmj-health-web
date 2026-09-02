import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/ToastProvider";
import CreateTemporaryPatientPanel from "@/components/secretary/patients/create-temporary-patient-panel";
import { useCreateTemporaryDoctorPatient } from "@/hooks/doctor/patients/useDoctorPatients";
import { useSecretaryPermissions } from "@/hooks/secretary/useSecretaryPermissions";
import { useI18n } from "@/i18n/provider";
import { getCreateTemporaryPatientErrorMessage } from "@/lib/doctor/writeFlowErrors";

export default function SecretaryCreateTemporaryPatientPage() {
  const { t, locale, dir } = useI18n();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { hasPermission } = useSecretaryPermissions();
  const canCreateTemporaryPatient = hasPermission("patients:temporary:create");
  const createTemporaryPatient = useCreateTemporaryDoctorPatient();
  async function handleSubmit(values: {
    fullName: string;
    email: string;
    phone: string;
  }) {
    try {
      await createTemporaryPatient.mutateAsync({
        fullName: values.fullName.trim(),
        phone: values.phone.trim(),
        email: values.email.trim(),
      });
      toast(t("secretary.temporaryPatient.createSuccess"), {
        title: t("secretary.temporaryPatient.saved"),
        variant: "success",
      });
      navigate("/secretary/patients");
    } catch (error) {
      toast(getCreateTemporaryPatientErrorMessage(error, locale), {
        title: t("secretary.temporaryPatient.saveFailed"),
        variant: "error",
      });
    }
  }

  return (
    <div dir={dir} lang={locale} className="mx-auto w-full max-w-5xl pb-6 sm:pb-8">
      {canCreateTemporaryPatient ? (
        <CreateTemporaryPatientPanel
          onSubmit={handleSubmit}
          onCancel={() => navigate("/secretary/patients")}
          busy={createTemporaryPatient.isPending}
        />
      ) : (
        <div className="rounded-2xl border border-dashed border-[#d0d5dd] bg-white px-6 py-10 text-center shadow-sm">
          <h1 className="font-cairo text-lg font-bold text-[#0f172a]">
            {t("secretary.temporaryPatient.pageUnavailable")}
          </h1>
          <p className="mt-2 font-cairo text-sm font-semibold text-[#64748b]">
            {t("secretary.temporaryPatient.noPermission")}
          </p>
          <button
            type="button"
            onClick={() => navigate("/secretary/patients")}
            className="mt-5 rounded-xl border border-[#d0d5dd] bg-white px-4 py-2 font-cairo text-sm font-bold text-[#0f172a] transition hover:bg-[#f8fafc]"
          >
            {t("doctor.patientDetails.backToPatients")}
          </button>
        </div>
      )}
    </div>
  );
}
