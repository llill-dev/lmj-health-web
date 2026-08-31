import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/ToastProvider";
import BookAppointmentPanel from "@/components/secretary/appointments/book-appointment-panel";
import { useAvailableAppointmentTypes } from "@/hooks/doctor/appointments/useAppointmentTypes";
import { useBookDoctorAppointmentApi } from "@/hooks/doctor/appointments/useDoctorAppointmentsApi";
import { useDoctorPatients } from "@/hooks/doctor/patients/useDoctorPatients";
import { getAppointmentBookingErrorMessage } from "@/lib/doctor/writeFlowErrors";
import { useSecretaryAssignedDoctor } from "@/hooks/secretary/useSecretaryAssignedDoctor";
import { useI18n } from "@/i18n/provider";

export default function SecretaryBookAppointmentPage() {
  const { t, locale, dir } = useI18n();
  const navigate = useNavigate();
  const { toast } = useToast();
  const assignedDoctorQuery = useSecretaryAssignedDoctor();
  const doctorId = assignedDoctorQuery.assignedDoctor?._id ?? "";
  const canLoadBookingPatients =
    !assignedDoctorQuery.isLoading &&
    !assignedDoctorQuery.isError &&
    Boolean(doctorId);
  const patientsQuery = useDoctorPatients(
    { page: 1, limit: 100 },
    canLoadBookingPatients,
  );
  useAvailableAppointmentTypes(doctorId);
  const bookAppointment = useBookDoctorAppointmentApi();
  const bookingBlockMessage = useMemo(() => {
    if (assignedDoctorQuery.isLoading || patientsQuery.isAwaitingData) {
      return t("secretary.bookAppointment.preparingData");
    }
    if (assignedDoctorQuery.isForbidden) {
      return t("secretary.bookAppointment.forbiddenAccess");
    }
    if (assignedDoctorQuery.isUnassigned) {
      return t("secretary.bookAppointment.unassigned");
    }
    if (assignedDoctorQuery.isError) {
      return t("secretary.bookAppointment.loadDoctorError");
    }
    if (!doctorId) {
      return t("secretary.bookAppointment.noDoctorLinked");
    }
    if (patientsQuery.isError) {
      return t("secretary.bookAppointment.loadPatientsError");
    }
    if ((patientsQuery.patients?.length ?? 0) === 0) {
      return t("secretary.bookAppointment.noPatients");
    }
    return null;
  }, [
    assignedDoctorQuery.isError,
    assignedDoctorQuery.isForbidden,
    assignedDoctorQuery.isLoading,
    assignedDoctorQuery.isUnassigned,
    doctorId,
    patientsQuery.isAwaitingData,
    patientsQuery.isError,
    patientsQuery.patients,
    t,
  ]);

  const patients = useMemo(
    () =>
      (patientsQuery.patients ?? []).map((patient) => ({
        id: patient._id,
        name: patient.user?.fullName || t("secretary.bookAppointment.patient"),
      })),
    [patientsQuery.patients, t],
  );

  async function handleBook(values: {
    patientId: string;
    date: string;
    time: string;
    appointmentTypeId?: string;
    notes?: string;
  }) {
    if (bookingBlockMessage) {
      toast(bookingBlockMessage, {
        title: t("secretary.bookAppointment.bookingUnavailable"),
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
      toast(t("secretary.bookAppointment.bookSuccess"), {
        title: t("secretary.bookAppointment.booked"),
        variant: "success",
      });
      navigate("/secretary/appointments");
    } catch (error) {
      toast(getAppointmentBookingErrorMessage(error, locale), {
        title: t("secretary.bookAppointment.bookingFailed"),
        variant: "error",
      });
    }
  }

  return (
    <div
      dir={dir}
      lang={locale}
      className="mx-auto w-full max-w-5xl pb-6 sm:pb-8"
    >
      <BookAppointmentPanel
        patients={patients}
        onSubmit={handleBook}
        onCancel={() => navigate("/secretary/appointments")}
        doctorId={doctorId}
        submitDisabledReason={bookingBlockMessage}
      />
    </div>
  );
}
