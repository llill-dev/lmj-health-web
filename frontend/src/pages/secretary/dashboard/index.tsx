import {
  Users,
  Clock,
  Calendar,
  CheckCircle,
  Search,
  Plus,
  UserPlus,
} from "lucide-react";
import AccountStatusCard from "@/components/secretary/dashboard/AccountStatusCard";
import StatCard from "@/components/secretary/dashboard/StatCard";
import QuickActions from "@/components/secretary/dashboard/QuickActions";
import TodayScheduleTable from "@/components/secretary/dashboard/TodayScheduleTable";

export default function SecretaryDashboardPage() {
  const quickActions = [
    {
      icon: Search,
      label: "بحث عن مريض",
      variant: "default" as const,
    },
    {
      icon: UserPlus,
      label: "إضافة مريض مؤقت",
      variant: "default" as const,
    },
    {
      icon: Plus,
      label: "حجز موعد جديد",
      variant: "primary" as const,
    },
  ];

  const todayAppointments = [
    { time: "09:00", patientName: "سارة علي", status: "scheduled" as const },
    { time: "10:30", patientName: "أحمد نور", status: "postponed" as const },
    { time: "11:00", patientName: "ليلى محمد", status: "scheduled" as const },
    { time: "14:00", patientName: "كريم حسن", status: "completed" as const },
  ];

  return (
    <div className="space-y-6">
      <AccountStatusCard
        doctorName="د. خالد عبد الله"
        specialty="طب القلب"
        rating={4.8}
        ratingCount={1}
        price={3}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          iconBgColor="bg-emerald-100"
          iconColor="text-emerald-600"
          badgeLabel="إجمالي"
          badgeBgColor="bg-emerald-100"
          badgeTextColor="text-emerald-700"
          value={2}
          label="عدد المرضى"
        />
        <StatCard
          icon={CheckCircle}
          iconBgColor="bg-emerald-100"
          iconColor="text-emerald-600"
          badgeLabel="مكتمل"
          badgeBgColor="bg-emerald-100"
          badgeTextColor="text-emerald-700"
          value={0}
          label="الأوقات المتاحة"
          subtitle="من أداء ممتاز"
          subtitleColor="text-emerald-600"
        />
        <StatCard
          icon={Clock}
          iconBgColor="bg-orange-100"
          iconColor="text-orange-600"
          badgeLabel="قادم"
          badgeBgColor="bg-orange-100"
          badgeTextColor="text-orange-700"
          value={2}
          label="مواعيد الانتظار"
        />
        <StatCard
          icon={Calendar}
          iconBgColor="bg-primary/10"
          iconColor="text-primary"
          badgeLabel="اليوم"
          badgeBgColor="bg-primary/10"
          badgeTextColor="text-primary"
          value={2}
          label="مواعيد اليوم"
          subtitle="2 معلق"
          subtitleColor="text-[#64748b]"
        />
      </div>

      <QuickActions actions={quickActions} />

      <TodayScheduleTable appointments={todayAppointments} />
    </div>
  );
}
