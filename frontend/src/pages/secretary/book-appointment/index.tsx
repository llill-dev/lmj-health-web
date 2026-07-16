import { useState } from "react";
import { Calendar, Clock, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/ToastProvider";
import { useAvailableAppointmentTypes } from "@/hooks/doctor/appointments/useAppointmentTypes";
import { useBookDoctorAppointmentApi } from "@/hooks/doctor/appointments/useDoctorAppointmentsApi";
import { useDoctorPatients } from "@/hooks/doctor/patients/useDoctorPatients";
import { useSecretaryAssignedDoctor } from "@/hooks/secretary/useSecretaryAssignedDoctor";

function SurfaceSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[20px] border border-[#E8EEF6] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
      <header className="border-b border-[#EDF2F7] px-4 py-6 sm:px-6 sm:py-7 lg:px-8 lg:py-9">
        <h2 className="text-right font-cairo text-[23px] font-black leading-none text-[#243044]">
          {title}
        </h2>
      </header>
      {children}
    </section>
  );
}

function FormField({
  label,
  children,
  required = false,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="block font-cairo text-[14px] font-bold text-[#243044]">
        {label}
        {required && <span className="text-red-500 mr-1">*</span>}
      </label>
      {children}
    </div>
  );
}

export default function SecretaryBookAppointmentPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const assignedDoctorQuery = useSecretaryAssignedDoctor();
  const patientsQuery = useDoctorPatients({ page: 1, limit: 100 });
  const doctorId = assignedDoctorQuery.data?.doctor?._id ?? "";
  const appointmentTypesQuery = useAvailableAppointmentTypes(doctorId);
  const bookAppointment = useBookDoctorAppointmentApi();

  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [appointmentType, setAppointmentType] = useState("");
  const [notes, setNotes] = useState("");
  const isSubmitting = bookAppointment.isPending;

  async function handleBook() {
    if (!doctorId || !selectedPatient || !selectedDate || !selectedTime) return;
    try {
      await bookAppointment.mutateAsync({
        doctorId,
        patientId: selectedPatient,
        date: selectedDate,
        startTime: selectedTime,
        appointmentTypeId: appointmentType || undefined,
        notes: notes.trim() || undefined,
      });
      toast("تم حجز الموعد بنجاح.", {
        title: "تم الحجز",
        variant: "success",
      });
      navigate("/secretary/appointments");
    } catch {
      toast("تعذر حجز الموعد. تحقق من البيانات ثم أعد المحاولة.", {
        title: "فشل الحجز",
        variant: "error",
      });
    }
  }

  return (
    <div dir="rtl" lang="ar" className="space-y-6 pb-6 sm:space-y-7 sm:pb-8">
      <SurfaceSection title="حجز موعد جديد">
        <div className="px-4 py-5 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
          <div className="space-y-6">
            <FormField label="المريض" required>
              <div className="relative">
                <select
                  value={selectedPatient}
                  onChange={(event) => setSelectedPatient(event.target.value)}
                  className="h-[40px] w-full rounded-[12px] border border-[#DCE3EC] bg-white px-4 font-cairo text-[14px] font-bold text-[#111827] shadow-[0_3px_8px_rgba(15,23,42,0.03)] outline-none focus:border-primary"
                >
                  <option value="">اختر مريضاً</option>
                  {(patientsQuery.patients ?? []).map((patient) => (
                    <option key={patient._id} value={patient._id}>
                      {patient.userId?.fullName || "مريض"} -{" "}
                      {patient.publicId || patient.userId?.phone || patient._id}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 items-center gap-1 text-[#98A2B3]">
                  <User className="h-5 w-5" />
                </div>
              </div>
            </FormField>

            <div className="grid gap-6 sm:grid-cols-2">
              <FormField label="التاريخ" required>
                <div className="relative">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="h-[40px] w-full rounded-[12px] border border-[#DCE3EC] bg-white px-4 font-cairo text-[14px] font-bold text-[#111827] shadow-[0_3px_8px_rgba(15,23,42,0.03)] outline-none focus:border-primary"
                  />
                  <div className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 text-[#98A2B3]">
                    <Calendar className="h-5 w-5" />
                  </div>
                </div>
              </FormField>

              <FormField label="الوقت" required>
                <div className="relative">
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="h-[40px] w-full rounded-[12px] border border-[#DCE3EC] bg-white px-4 font-cairo text-[14px] font-bold text-[#111827] shadow-[0_3px_8px_rgba(15,23,42,0.03)] outline-none focus:border-primary"
                  />
                  <div className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 text-[#98A2B3]">
                    <Clock className="h-5 w-5" />
                  </div>
                </div>
              </FormField>
            </div>

            <FormField label="نوع الموعد" required>
              <select
                value={appointmentType}
                onChange={(e) => setAppointmentType(e.target.value)}
                className="h-[40px] w-full rounded-[12px] border border-[#DCE3EC] bg-white px-4 font-cairo text-[14px] font-bold text-[#111827] shadow-[0_3px_8px_rgba(15,23,42,0.03)] outline-none focus:border-primary"
              >
                <option value="">اختر نوع الموعد</option>
                {(appointmentTypesQuery.appointmentTypes ?? []).map((type) => (
                  <option key={type._id} value={type._id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="ملاحظات">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أضف ملاحظات (اختياري)…"
                rows={4}
                className="w-full rounded-[12px] border border-[#DCE3EC] bg-white px-4 py-3 font-cairo text-[14px] font-bold text-[#111827] shadow-[0_3px_8px_rgba(15,23,42,0.03)] outline-none placeholder:font-cairo placeholder:text-[14px] placeholder:font-semibold placeholder:text-[#98A2B3] focus:border-primary resize-none"
              />
            </FormField>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleBook}
                disabled={
                  isSubmitting ||
                  !doctorId ||
                  !selectedPatient ||
                  !selectedDate ||
                  !selectedTime
                }
                className="flex h-[48px] w-full items-center justify-center rounded-[8px] bg-primary font-cairo text-[14px] font-extrabold text-white shadow-[0_18px_30px_rgba(15,143,139,0.25)] transition hover:bg-[#0A7A77]"
              >
                {isSubmitting ? "جاري الحجز..." : "حجز الموعد"}
              </button>
              <Link
                to="/secretary/appointments"
                className="flex h-[48px] w-full items-center justify-center rounded-[8px] border-[1.5px] border-primary bg-white font-cairo text-[14px] font-extrabold text-primary shadow-[0px_6px_16px_-4px_rgba(15,143,139,0.2)] transition hover:bg-[#F0FAFA]"
              >
                إلغاء
              </Link>
            </div>
          </div>
        </div>
      </SurfaceSection>
    </div>
  );
}
