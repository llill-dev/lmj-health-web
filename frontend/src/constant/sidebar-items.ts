import {
  Activity,
  BookMarked,
  BookOpen,
  Bell,
  CalendarDays,
  ClipboardList,
  FileText,
  LayoutGrid,
  MapPin,
  MessageCircle,
  ScrollText,
  UserCog,
  Settings,
  ShieldCheck,
  Stethoscope,
  Pill,
  ScanLine,
  Users,
  BarChart3,
  MessageSquareWarning,
  Tags,
  Wallet,
  Building2,
  LifeBuoy,
  Hourglass,
  Layers,
} from "lucide-react";
import type { ComponentType } from "react";

export type SidebarItemId =
  | "dashboard"
  | "medical-library"
  | "appointments"
  | "waitlist"
  | "patients"
  | "encounters"
  | "online-consultations"
  | "work-schedule"
  | "appointment-types"
  | "clinical-library"
  | "medical-records"
  | "prescription"
  | "radiology"
  | "medical-requests"
  | "access-requests"
  | "doctors-directory"
  | "medical-services-directory"
  | "clinic-location"
  | "accounts"
  | "facilities"
  | "activity-log"
  | "support"
  | "notification"
  | "profile-settings"
  | "secretaries";

export type AdminSidebarItemId =
  | "overview"
  | "notifications"
  | "doctors"
  | "doctor-specializations"
  | "doctor-profile-change-requests"
  | "doctor-restore-requests"
  | "users"
  | "patients"
  | "secretaries"
  | "medical-content"
  | "content-templates"
  | "services"
  | "service-types"
  | "service-providers"
  | "medical-file-options"
  | "medical-orders"
  | "appointments"
  | "access-requests"
  | "system-logs"
  | "analytics"
  | "settings"
  | "verification-requests"
  | "complaints"
  | "facilities";

export type SecretarySidebarItemId =
  | "dashboard"
  | "patients"
  | "create-temporary-patient"
  | "book-appointment"
  | "doctor-schedule"
  | "patient-files"
  | "doctors-directory"
  | "appointments"
  | "appointment-suggestions"
  | "waitlist"
  | "profile"
  | "notifications";

export type DataEntrySidebarItemId =
  | "dashboard"
  | "medical-content"
  | "content-templates"
  | "medical-orders";

export const sidebarItems: Array<{
  id: string;
  path: SidebarItemId;
  label: string;
  icon: ComponentType<{ className?: string }>;
  badge?: number;
  href?: string;
  activeMatchPrefixes?: string[];
}> = [
  {
    id: "dashboard",
    path: "dashboard",
    label: "لوحة التحكم",
    icon: LayoutGrid,
  },
  {
    id: "medical-library",
    path: "medical-library",
    label: "المكتبة الطبية",
    icon: BookOpen,
    href: "/medical-library",
    activeMatchPrefixes: ["/medical-library"],
  },
  {
    id: "appointments",
    path: "appointments",
    label: "المواعيد",
    icon: CalendarDays,
    badge: 3,
  },
  {
    id: "waitlist",
    path: "waitlist",
    label: "قائمة الانتظار",
    icon: Hourglass,
  },
  {
    id: "online-consultations",
    path: "online-consultations",
    label: "الاستشارات",
    icon: MessageCircle,
    badge: 5,
  },
  { id: "patients", path: "patients", label: "المرضى", icon: Users },
  {
    id: "encounters",
    path: "encounters",
    label: "الزيارات الطبية",
    icon: Stethoscope,
  },
  {
    id: "work-schedule",
    path: "work-schedule",
    label: "جدول العمل",
    icon: Activity,
  },
  {
    id: "appointment-types",
    path: "appointment-types",
    label: "أنواع المواعيد",
    icon: Tags,
  },
  {
    id: "clinical-library",
    path: "clinical-library",
    label: "المكتبة السريرية",
    icon: BookOpen,
  },
  {
    id: "medical-records",
    path: "medical-records",
    label: "السجلات الطبية",
    icon: FileText,
  },
  {
    id: "prescription",
    path: "prescription",
    label: "الوصفة الطبية",
    icon: Pill,
  },
  {
    id: "radiology",
    path: "radiology",
    label: "طلبات الأشعة",
    icon: ScanLine,
  },
  {
    id: "medical-requests",
    path: "medical-requests",
    label: "الطلبات الطبية",
    icon: ClipboardList,
  },
  {
    id: "access-requests",
    path: "access-requests",
    label: "طلبات الوصول",
    icon: ShieldCheck,
  },
  {
    id: "doctors-directory",
    path: "doctors-directory",
    label: "دليل الأطباء",
    icon: BookOpen,
  },
  {
    id: "medical-services-directory",
    path: "medical-services-directory",
    label: "دليل الخدمات الطبية",
    icon: BookMarked,
  },
  {
    id: "clinic-location",
    path: "clinic-location",
    label: "موقع العيادة",
    icon: MapPin,
  },
  {
    id: "accounts",
    path: "accounts",
    label: "الحسابات",
    icon: Wallet,
  },
  {
    id: "facilities",
    path: "facilities",
    label: "المنشآت",
    icon: Building2,
  },
  {
    id: "activity-log",
    path: "activity-log",
    label: "سجل النشاطات",
    icon: ScrollText,
  },
  {
    id: "support",
    path: "support",
    label: "الدعم والمساعدة",
    icon: LifeBuoy,
  },
  {
    id: "notification",
    path: "notification",
    label: "الإشعارات",
    icon: Bell,
  },
  {
    id: "profile-settings",
    path: "profile-settings",
    label: "الملف الشخصي",
    icon: Settings,
  },
  {
    id: "secretaries",
    path: "secretaries",
    label: "إدارة السكرتارية",
    icon: UserCog,
  },
];

export const adminSidebarItems: Array<{
  id: string;
  path: AdminSidebarItemId;
  label: string;
  icon: ComponentType<{ className?: string }>;
  badge?: number;
}> = [
  { id: "overview", path: "overview", label: "نظرة عامة", icon: LayoutGrid },
  { id: "doctors", path: "doctors", label: "الأطباء", icon: Stethoscope },
  {
    id: "doctor-specializations",
    path: "doctor-specializations",
    label: "تخصصات الأطباء",
    icon: Tags,
  },
  {
    id: "doctor-profile-change-requests",
    path: "doctor-profile-change-requests",
    label: "طلبات تغيير البيانات",
    icon: FileText,
  },
  {
    id: "doctor-restore-requests",
    path: "doctor-restore-requests",
    label: "طلبات استعادة الحساب",
    icon: LifeBuoy,
  },
  { id: "users", path: "users", label: "مستخدمو الإدارة", icon: UserCog },
  { id: "patients", path: "patients", label: "المرضى", icon: Users },
  {
    id: "secretaries",
    path: "secretaries",
    label: "السكرتارية",
    icon: UserCog,
  },
  {
    id: "medical-content",
    path: "medical-content",
    label: "المحتوى الطبي",
    icon: BookOpen,
  },
  {
    id: "content-templates",
    path: "content-templates",
    label: "قوالب البيانات",
    icon: Layers,
  },
  {
    id: "services",
    path: "services",
    label: "دليل الخدمات",
    icon: LayoutGrid,
  },
  {
    id: "service-types",
    path: "service-types",
    label: "أنواع الخدمات",
    icon: Settings,
  },
  {
    id: "service-providers",
    path: "service-providers",
    label: "مزودو الخدمة",
    icon: Tags,
  },
  {
    id: "medical-file-options",
    path: "medical-file-options",
    label: "خيارات الملف الطبي",
    icon: ScrollText,
  },
  {
    id: "medical-orders",
    path: "medical-orders",
    label: "كتالوج الطلبات الطبية",
    icon: ClipboardList,
  },
  {
    id: "appointments",
    path: "appointments",
    label: "جميع المواعيد",
    icon: CalendarDays,
  },
  {
    id: "access-requests",
    path: "access-requests",
    label: "طلبات الوصول",
    icon: ShieldCheck,
  },
  {
    id: "system-logs",
    path: "system-logs",
    label: "سجلات النظام",
    icon: ScrollText,
  },
  {
    id: "analytics",
    path: "analytics",
    label: "التحليلات",
    icon: BarChart3,
  },
  {
    id: "verification-requests",
    path: "verification-requests",
    label: "طلبات التحقق",
    icon: ShieldCheck,
    badge: 2,
  },
  {
    id: "notifications",
    path: "notifications",
    label: "الإشعارات",
    icon: Bell,
  },
  {
    id: "complaints",
    path: "complaints",
    label: "الشكاوي",
    icon: MessageSquareWarning,
    badge: 1,
  },
  {
    id: "facilities",
    path: "facilities",
    label: "المنشآت الطبية",
    icon: Building2,
  },
  {
    id: "settings",
    path: "settings",
    label: "الإعدادات",
    icon: Settings,
  },
];

export const secretarySidebarItems: Array<{
  id: string;
  path: SecretarySidebarItemId;
  label: string;
  icon: ComponentType<{ className?: string }>;
  badge?: number;
}> = [
  {
    id: "dashboard",
    path: "dashboard",
    label: "لوحة التحكم",
    icon: LayoutGrid,
  },
  {
    id: "patients",
    path: "patients",
    label: "المرضى",
    icon: Users,
  },
  {
    id: "create-temporary-patient",
    path: "create-temporary-patient",
    label: "إنشاء مريض مؤقت",
    icon: UserCog,
  },
  {
    id: "book-appointment",
    path: "book-appointment",
    label: "حجز موعد",
    icon: CalendarDays,
  },
  {
    id: "doctor-schedule",
    path: "doctor-schedule",
    label: "جدول عمل الطبيب",
    icon: Activity,
  },
  {
    id: "patient-files",
    path: "patient-files",
    label: "ملفات المرضى",
    icon: FileText,
  },
  {
    id: "doctors-directory",
    path: "doctors-directory",
    label: "دليل الأطباء",
    icon: Stethoscope,
  },
  {
    id: "appointments",
    path: "appointments",
    label: "المواعيد",
    icon: CalendarDays,
  },
  {
    id: "appointment-suggestions",
    path: "appointment-suggestions",
    label: "اقتراحات المواعيد",
    icon: Bell,
  },
  {
    id: "waitlist",
    path: "waitlist",
    label: "قائمة الانتظار",
    icon: Hourglass,
  },
  {
    id: "profile",
    path: "profile",
    label: "الملف الشخصي",
    icon: Settings,
  },
  {
    id: "notifications",
    path: "notifications",
    label: "الإشعارات",
    icon: Bell,
  },
];

export const dataEntrySidebarItems: Array<{
  id: string;
  path: DataEntrySidebarItemId;
  label: string;
  icon: ComponentType<{ className?: string }>;
  badge?: number;
}> = [
  {
    id: "dashboard",
    path: "dashboard",
    label: "لوحة مدخل البيانات",
    icon: LayoutGrid,
  },
  {
    id: "medical-content",
    path: "medical-content",
    label: "المحتوى الطبي",
    icon: BookOpen,
  },
  {
    id: "content-templates",
    path: "content-templates",
    label: "قوالب المحتوى",
    icon: Layers,
  },
  {
    id: "medical-orders",
    path: "medical-orders",
    label: "الطلبات الطبية",
    icon: ClipboardList,
  },
];
