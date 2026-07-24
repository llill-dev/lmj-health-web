import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/ToastProvider";
import BookAppointmentDialog from "@/components/doctor/appointments/book-appointment-dialog";
import { useAvailableAppointmentTypes } from "@/hooks/doctor/appointments/useAppointmentTypes";
import { useBookDoctorAppointmentApi } from "@/hooks/doctor/appointments/useDoctorAppointmentsApi";
import { useDoctorPatients } from "@/hooks/doctor/patients/useDoctorPatients";
import { useSecretaryAssignedDoctor } from "@/hooks/secretary/useSecretaryAssignedDoctor";
import { useI18n } from "@/i18n/provider";

export default function SecretaryBookAppointmentPage() {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  const navigate = useNavigate();
  const { toast } = useToast();
  const assignedDoctorQuery = useSecretaryAssignedDoctor();
  const patientsQuery = useDoctorPatients({ page: 1, limit: 100 });
  const doctorId = assignedDoctorQuery.data?.doctor?._id ?? "";
  useAvailableAppointmentTypes(doctorId);
  const bookAppointment = useBookDoctorAppointmentApi();

  const patients = useMemo(
    () =>
      (patientsQuery.patients ?? []).map((patient) => ({
        id: patient._id,
        name: patient.user?.fullName || tr("مريض", "Patient"),
      })),
    [patientsQuery.patients, tr],
  );

  async function handleBook(values: {
    patientId: string;
    date: string;
    time: string;
    consultationType: "clinic" | "video";
    appointmentTypeId?: string;
    notes?: string;
  }) {
    if (!doctorId || !values.patientId || !values.date || !values.time) return;
    try {
      await bookAppointment.mutateAsync({
        doctorId,
        patientId: values.patientId,
        date: values.date,
        startTime: values.time,
        appointmentTypeId: values.appointmentTypeId || undefined,
        notes: values.notes?.trim() || undefined,
      });
      toast(tr("تم حجز الموعد بنجاح.", "Appointment booked successfully."), {
        title: tr("تم الحجز", "Booked"),
        variant: "success",
      });
      navigate("/secretary/appointments");
    } catch {
      toast(tr("تعذر حجز الموعد. تحقق من البيانات ثم أعد المحاولة.", "Could not book appointment. Please verify data and try again."), {
        title: tr("فشل الحجز", "Booking failed"),
        variant: "error",
      });
    }
  }

  return (
    <div dir={dir} lang={locale} className="pb-6 sm:pb-8">
      <BookAppointmentDialog
        open
        onOpenChange={(open) => {
          if (!open) navigate("/secretary/appointments");
        }}
        patients={patients}
        onSubmit={handleBook}
        doctorId={doctorId}
      />
    </div>
  );
}
