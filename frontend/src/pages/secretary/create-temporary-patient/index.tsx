import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/ToastProvider";
import CreateTemporaryPatientDialog from "@/components/doctor/patients/create-temporary-patient-dialog";
import { useCreateTemporaryDoctorPatient } from "@/hooks/doctor/patients/useDoctorPatients";

export default function SecretaryCreateTemporaryPatientPage() {
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
      toast("تم إنشاء المريض المؤقت بنجاح.", {
        title: "تم الحفظ",
        variant: "success",
      });
      navigate("/secretary/patients");
    } catch {
      toast("تعذر إنشاء المريض المؤقت. تحقق من البيانات وحاول مجدداً.", {
        title: "فشل الحفظ",
        variant: "error",
      });
    }
  }

  return (
    <div dir="rtl" lang="ar" className="pb-6 sm:pb-8">
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
