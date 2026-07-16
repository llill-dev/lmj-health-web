import { memo } from "react";
import {
  Mail,
  Calendar,
  Phone,
  MapPin,
  ShieldCheck,
  UserRound,
  Briefcase,
} from "lucide-react";
import { readAuthUser } from "@/lib/cookies";
import { useDoctorAppointmentsApi } from "@/hooks/doctor/appointments/useDoctorAppointmentsApi";
import { useDoctorPatients } from "@/hooks/doctor/patients/useDoctorPatients";
import { useSecretaryAssignedDoctor } from "@/hooks/secretary/useSecretaryAssignedDoctor";

function SurfaceSection({
  title,
  children,
  icon: Icon,
}: {
  title: string;
  children: React.ReactNode;
  icon?: typeof UserRound;
}) {
  return (
    <section className="overflow-hidden rounded-[20px] border border-[#E8EEF6] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
      <header className="border-b border-[#EDF2F7] px-4 py-6 sm:px-6 sm:py-7 lg:px-8 lg:py-9">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#E9F7F6] text-primary">
              <Icon className="h-5 w-5" />
            </div>
          )}
          <h2 className="text-right font-cairo text-[23px] font-black leading-none text-[#243044]">
            {title}
          </h2>
        </div>
      </header>
      {children}
    </section>
  );
}

function InfoRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: typeof Phone;
}) {
  return (
    <div className="flex items-start gap-4 border-b border-[#EEF2F6] px-4 py-4 last:border-b-0 sm:px-6 lg:px-8 lg:py-5">
      {Icon && (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#E9F7F6] text-primary">
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div className="flex-1">
        <div className="font-cairo text-[13px] font-semibold text-[#98A2B3]">
          {label}
        </div>
        <div className="mt-1 font-cairo text-[16px] font-bold text-[#243044]">
          {value}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: typeof Calendar;
}) {
  return (
    <div className="rounded-[10px] bg-[#FFFFFF] px-4 py-5 shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.10),0px_1px_3px_0px_rgba(0,0,0,0.10)] sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="flex items-center justify-between">
        <div className="text-right">
          <div className="font-cairo text-[22px] font-black text-[#243044]">
            {value}
          </div>
          <div className="mt-2 font-cairo text-[18px] font-semibold text-[#98A2B3]">
            {label}
          </div>
        </div>
        <div className="flex h-16 w-16 items-center justify-center rounded-[16px] bg-[#E9F7F6] text-primary">
          <Icon className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}

function PermissionBadge({ permission }: { permission: string }) {
  return (
    <span className="inline-flex items-center rounded-[8px] bg-[#E9F7F6] px-3 py-1.5 font-cairo text-[13px] font-black text-primary">
      {permission}
    </span>
  );
}

export default function SecretaryProfilePage() {
  const authUser = readAuthUser();
  const assignedDoctorQuery = useSecretaryAssignedDoctor();
  const appointmentsQuery = useDoctorAppointmentsApi({ page: 1, limit: 1 });
  const patientsQuery = useDoctorPatients({ page: 1, limit: 1 });
  const secretaryName = authUser?.fullName?.trim() || "السكرتير";
  const secretaryEmail = authUser?.email?.trim() || "—";
  const secretaryPhone = authUser?.phone?.trim() || "—";
  const assignedDoctor = assignedDoctorQuery.data?.doctor;

  const contactInfo = [
    { label: "البريد الإلكتروني", value: secretaryEmail, icon: Mail },
    { label: "رقم الهاتف", value: secretaryPhone, icon: Phone },
    { label: "العنوان", value: "—", icon: MapPin },
  ];

  const doctorInfo = [
    { label: "الاسم", value: assignedDoctor?.userId?.fullName || "—" },
    { label: "التخصص", value: assignedDoctor?.specialization || "—" },
    { label: "التقييم", value: `${assignedDoctor?.averageRating ?? "—"}` },
  ];

  const stats = [
    { label: "معدل الحضور", value: "98%", icon: Calendar },
    { label: "المواعيد", value: appointmentsQuery.total ?? 0, icon: Briefcase },
    { label: "المرضى", value: patientsQuery.total ?? 0, icon: UserRound },
  ];

  const permissions = [
    "حجز المواعيد",
    "عرض المواعيد",
    "إلغاء المواعيد",
    "إدارة الملفات",
  ];

  return (
    <div dir="rtl" lang="ar" className="space-y-5 pb-8 sm:pb-10">
      <SurfaceSection title="المعلومات الشخصية" icon={UserRound}>
        <div className="px-4 py-5 sm:px-5 sm:py-6">
          <div className="flex items-center gap-4 rounded-[18px] bg-[#F8FAFC] p-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-[16px] bg-gradient-to-br from-[#0f766e] via-[#0f8f8b] to-[#14b8a6] font-cairo text-[24px] font-black text-white shadow-[0_12px_28px_rgba(15,143,139,0.32)]">
              س
            </div>
            <div className="flex-1">
              <div className="font-cairo text-[24px] font-black text-[#243044]">
                {secretaryName}
              </div>
              <div className="mt-1 font-cairo text-[16px] font-semibold text-[#98A2B3]">
                سكرتير
              </div>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center rounded-[8px] bg-[#ECFDF3] px-3 py-1.5 font-cairo text-[13px] font-black text-[#16A34A]">
                <ShieldCheck className="ml-2 h-4 w-4" />
                نشط
              </div>
            </div>
          </div>
        </div>

        {contactInfo.map((info, index) => (
          <InfoRow
            key={index}
            label={info.label}
            value={info.value}
            icon={info.icon}
          />
        ))}
      </SurfaceSection>

      <SurfaceSection title="الطبيب المسؤول" icon={Briefcase}>
        {doctorInfo.map((info, index) => (
          <InfoRow key={index} label={info.label} value={info.value} />
        ))}
      </SurfaceSection>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
          />
        ))}
      </div>

      <SurfaceSection title="الصلاحيات" icon={ShieldCheck}>
        <div className="flex flex-wrap gap-3 px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
          {permissions.map((permission) => (
            <PermissionBadge key={permission} permission={permission} />
          ))}
        </div>
      </SurfaceSection>

      <SurfaceSection title="معلومات الحساب">
        <div className="px-4 py-5 sm:px-5 sm:py-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoRow label="آخر تسجيل دخول" value="2024-01-15 09:30" />
            <InfoRow label="تاريخ التسجيل" value="2023-06-01" />
          </div>
        </div>
      </SurfaceSection>
    </div>
  );
}
