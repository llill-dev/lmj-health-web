import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/ToastProvider";
import CreateTemporaryPatientDialog from "@/components/doctor/patients/create-temporary-patient-dialog";
import { useCreateTemporaryDoctorPatient } from "@/hooks/doctor/patients/useDoctorPatients";
import { useSecretaryPermissions } from "@/hooks/secretary/useSecretaryPermissions";
import { useI18n } from "@/i18n/provider";
import { getCreateTemporaryPatientErrorMessage } from "@/lib/doctor/writeFlowErrors";

export default function SecretaryCreateTemporaryPatientPage() {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
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
      toast(tr("تم إنشاء المريض المؤقت بنجاح.", "Temporary patient created successfully."), {
        title: tr("تم الحفظ", "Saved"),
        variant: "success",
      });
      navigate("/secretary/patients");
    } catch (error) {
      toast(getCreateTemporaryPatientErrorMessage(error, locale), {
        title: tr("فشل الحفظ", "Save failed"),
        variant: "error",
      });
    }
  }

  return (
    <div dir={dir} lang={locale} className="pb-6 sm:pb-8">
      {canCreateTemporaryPatient ? (
        <CreateTemporaryPatientDialog
          open
          onOpenChange={(open) => {
            if (!open) navigate("/secretary/patients");
          }}
          onSubmit={handleSubmit}
          busy={createTemporaryPatient.isPending}
        />
      ) : (
        <div className="rounded-2xl border border-dashed border-[#d0d5dd] bg-white px-6 py-10 text-center shadow-sm">
          <h1 className="font-cairo text-lg font-bold text-[#0f172a]">
            {tr("هذه الصفحة غير متاحة", "This page is unavailable")}
          </h1>
          <p className="mt-2 font-cairo text-sm font-semibold text-[#64748b]">
            {tr(
              "لا تملك صلاحية إنشاء مرضى مؤقتين من حساب السكرتيرة هذا.",
              "This secretary account cannot create temporary patients.",
            )}
          </p>
          <button
            type="button"
            onClick={() => navigate("/secretary/patients")}
            className="mt-5 rounded-xl border border-[#d0d5dd] bg-white px-4 py-2 font-cairo text-sm font-bold text-[#0f172a] transition hover:bg-[#f8fafc]"
          >
            {tr("العودة إلى المرضى", "Back to patients")}
          </button>
        </div>
      )}
    </div>
  );
}
