"use client";

import {
  BookMarked,
  BookOpen,
  Building2,
  CalendarPlus,
  MessageSquare,
  Search,
  UsersRound,
} from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/i18n/provider";

import DashboardSectionHeading from "@/components/doctor/dashboard/dashboard-section-heading";

export default function QuickActionsSection() {
  const { t } = useI18n();
  const quickActions = useMemo(
    () => [
      {
        id: "start-visit",
        title: t("doctor.dashboard.quickActions.startVisit"),
        description: t("doctor.dashboard.quickActions.startVisitDesc"),
        icon: CalendarPlus,
        href: "/doctor/encounters",
      },
      {
        id: "start-consultation",
        title: t("doctor.dashboard.quickActions.startConsultation"),
        description: t("doctor.dashboard.quickActions.startConsultationDesc"),
        icon: MessageSquare,
        href: "/doctor/online-consultations",
      },
      {
        id: "search-patient",
        title: t("doctor.dashboard.quickActions.searchPatient"),
        description: t("doctor.dashboard.quickActions.searchPatientDesc"),
        icon: Search,
        href: "/doctor/patients",
      },
      {
        id: "add-patient",
        title: t("doctor.dashboard.quickActions.addPatient"),
        description: t("doctor.dashboard.quickActions.addPatientDesc"),
        icon: UsersRound,
        href: "/doctor/patients",
      },
      {
        id: "medical-library",
        title: t("doctor.dashboard.quickActions.medicalLibrary"),
        description: t("doctor.dashboard.quickActions.medicalLibraryDesc"),
        icon: BookOpen,
        href: "/doctor/clinical-library",
      },
      {
        id: "medical-services-guide",
        title: t("doctor.dashboard.quickActions.medicalServicesGuide"),
        description: t(
          "doctor.dashboard.quickActions.medicalServicesGuideDesc",
        ),
        icon: BookMarked,
        href: "/doctor/medical-services-directory",
      },
      {
        id: "facilities",
        title: t("doctor.dashboard.quickActions.facilities"),
        description: t("doctor.dashboard.quickActions.facilitiesDesc"),
        icon: Building2,
        href: "/doctor/facilities",
      },
    ],
    [],
  );
  return (
    <section className="mt-6">
      <DashboardSectionHeading
        title={t("doctor.dashboard.quickActions.title")}
        className="mb-[22px]"
      />

      <div className="grid grid-cols-2 justify-items-center gap-5 sm:grid-cols-4 lg:grid-cols-7">
        {quickActions.map((action) => (
          <Link
            key={action.id}
            to={action.href}
            className="flex max-h-[160px] w-full flex-col items-center rounded-[10px] border-[0.5px] border-[#078F8D] bg-[#E6F6F6] px-4 py-4 text-center shadow-[0_8px_18px_rgba(15,23,42,0.04)] transition hover:border-primary hover:shadow-[0_12px_24px_rgba(15,143,139,0.12)]"
          >
            <div className="flex h-[40px] w-[43px] items-center justify-center rounded-[10px] bg-primary px-[8px] py-[5px] text-white shadow-[0_14px_28px_rgba(15,143,139,0.28)]">
              <action.icon className="h-full w-full" aria-hidden />
            </div>

            <h3 className="mt-3 font-cairo text-[16px] font-bold leading-[24px] text-primary">
              {action.title}
            </h3>

            <p className="mt-3 font-cairo text-[14px] font-medium leading-[16px] text-[#4A5565]">
              {action.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
