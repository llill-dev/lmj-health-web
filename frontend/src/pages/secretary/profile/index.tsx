import { Mail, Calendar, Phone, MapPin, ShieldCheck } from "lucide-react";
import SecretaryInfoCard from "@/components/secretary/profile/SecretaryInfoCard";
import ContactInfoSection from "@/components/secretary/profile/ContactInfoSection";
import ResponsibleDoctorCard from "@/components/secretary/profile/ResponsibleDoctorCard";
import StatisticsCard from "@/components/secretary/profile/StatisticsCard";
import PermissionsCard from "@/components/secretary/profile/PermissionsCard";
import AccountStatusCard from "@/components/secretary/profile/AccountStatusCard";

export default function SecretaryProfilePage() {
  const contactInfo = [
    {
      icon: Phone,
      label: "رقم الهاتف",
      value: "+966506789012",
    },
    {
      icon: MapPin,
      label: "العنوان",
      value: "دمشق، سوريا",
    },
  ];

  const doctorStats = [
    { label: "معدل الحضور", value: 98 },
    { label: "قائمة الانتظار", value: 12 },
    { label: "عدد المرضى", value: 85 },
    { label: "مجموع المواعيد", value: 127 },
  ];

  const permissions = [
    "حجز المواعيد",
    "عرض المواعيد",
    "إلغاء المواعيد",
  ];

  return (
    <div className="space-y-6">
      <SecretaryInfoCard
        name="سارة محمد"
        role="سكرتير"
        initials="س"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <ContactInfoSection items={contactInfo} />
        <ResponsibleDoctorCard
          doctorName="د. خالد عبد الله"
          specialty="طب القلب"
          rating={4.8}
          ratingCount={1}
        />
      </div>

      <StatisticsCard
        title="إحصائيات الطبيب"
        stats={doctorStats}
      />

      <PermissionsCard permissions={permissions} />

      <AccountStatusCard
        status="نشط"
        statusColor="text-emerald-600"
        lastLogin="2024-01-15 09:30"
      />
    </div>
  );
}
