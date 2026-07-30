import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/ToastProvider";
import BookAppointmentDialog from "@/components/doctor/appointments/book-appointment-dialog";
import { useAvailableAppointmentTypes } from "@/hooks/doctor/appointments/useAppointmentTypes";
import { useBookDoctorAppointmentApi } from "@/hooks/doctor/appointments/useDoctorAppointmentsApi";
import { useDoctorPatients } from "@/hooks/doctor/patients/useDoctorPatients";
import { getAppointmentBookingErrorMessage } from "@/lib/doctor/writeFlowErrors";
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
  const bookingBlockMessage = useMemo(() => {
    if (assignedDoctorQuery.isLoading || patientsQuery.isAwaitingData) {
      return tr(
        "جارٍ تجهيز بيانات الطبيب والمرضى قبل الحجز.",
        "Preparing doctor and patient data before booking.",
      );
    }
    if (assignedDoctorQuery.isError) {
      return tr(
        "تعذر تحميل الطبيب المسؤول. أعد المحاولة قبل متابعة الحجز.",
        "Could not load the assigned doctor. Try again before booking.",
      );
    }
    if (!doctorId) {
      return tr(
        "لا يمكن حجز موعد قبل ربط السكرتير بطبيب مسؤول.",
        "Booking is unavailable until the secretary is linked to an assigned doctor.",
      );
    }
    if (patientsQuery.isError) {
      return tr(
        "تعذر تحميل قائمة المرضى. أعد المحاولة قبل متابعة الحجز.",
        "Could not load the patient list. Try again before booking.",
      );
    }
    if ((patientsQuery.patients?.length ?? 0) === 0) {
      return tr(
        "لا يوجد مرضى متاحون للحجز حالياً.",
        "No patients are currently available for booking.",
      );
    }
    return null;
  }, [
    assignedDoctorQuery.isError,
    assignedDoctorQuery.isLoading,
    doctorId,
    patientsQuery.isAwaitingData,
    patientsQuery.isError,
    patientsQuery.patients,
    tr,
  ]);

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
    if (bookingBlockMessage) {
      toast(bookingBlockMessage, {
        title: tr("الحجز غير متاح", "Booking unavailable"),
        variant: "error",
      });
      return;
    }
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
    } catch (error) {
      toast(getAppointmentBookingErrorMessage(error, locale), {
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
        submitDisabledReason={bookingBlockMessage}
      />
    </div>
  );
}
