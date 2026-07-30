import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/ToastProvider";
import CreateTemporaryPatientDialog from "@/components/doctor/patients/create-temporary-patient-dialog";
import { useCreateTemporaryDoctorPatient } from "@/hooks/doctor/patients/useDoctorPatients";
import { useI18n } from "@/i18n/provider";
import { getCreateTemporaryPatientErrorMessage } from "@/lib/doctor/writeFlowErrors";

export default function SecretaryCreateTemporaryPatientPage() {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  const navigate = useNavigate();
  const { toast } = useToast();
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
      <CreateTemporaryPatientDialog
        open
        onOpenChange={(open) => {
          if (!open) navigate("/secretary/patients");
        }}
        onSubmit={handleSubmit}
        busy={createTemporaryPatient.isPending}
      />
    </div>
  );
}
