import {
  Activity,
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
} from "lucide-react";
import type { ComponentType } from "react";

export type SidebarItemId =
  | "dashboard"
  | "appointments"
  | "patients"
  | "encounters"
  | "online-consultations"
  | "work-schedule"
  | "medical-records"
  | "prescription"
  | "radiology"
  | "medical-requests"
  | "access-requests"
  | "doctors-directory"
  | "clinic-location"
  | "accounts"
  | "facilities"
  | "activity-log"
  | "support"
  | "notification"
  | "profile-settings";

export type AdminSidebarItemId =
  | "overview"
  | "notifications"
  | "doctors"
  | "doctor-specializations"
  | "patients"
  | "secretaries"
  | "medical-content"
  | "services"
  | "service-types"
  | "medical-file-options"
  | "medical-orders"
  | "appointments"
  | "system-logs"
  | "analytics"
  | "settings"
  | "verification-requests"
  | "complaints";

export const sidebarItems: Array<{
  id: string;
  path: SidebarItemId;
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
    id: "appointments",
    path: "appointments",
    label: "المواعيد",
    icon: CalendarDays,
    badge: 3,
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
    id: "settings",
    path: "settings",
    label: "الإعدادات",
    icon: Settings,
  },
];
