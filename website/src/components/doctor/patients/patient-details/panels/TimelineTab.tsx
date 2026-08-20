import { motion } from "framer-motion";
import {
  Activity,
  ClipboardList,
  Clock,
  FileText,
  Heart,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";

import { PatientTabEmptyIllustration } from "@/components/doctor/patients/patient-tab-empty-illustration";
import { cn } from "@/lib/utils/utils";

import { TAB_STAGGER_CONTAINER, TAB_STAGGER_ITEM } from "../constants";
import type { FullProfileData } from "../types";
import type { DoctorEncounterSummary } from "@/lib/doctor/types";

type TimelineFilter = "all" | "encounter" | "file" | "order" | "prescription" | "history";

interface TimelineTabProps {
  fullProfileData: FullProfileData;
  encounters: DoctorEncounterSummary[];
  medicalConditions: string[];
  timelineFilter: TimelineFilter;
  onTimelineFilterChange: (filter: TimelineFilter) => void;
  onCreateMedicalRecord: () => void;
  onOpenEncountersTab: () => void;
  onOpenPrescriptionsTab: () => void;
  onOpenOrdersTab: () => void;
}

export function TimelineTab({
  fullProfileData,
  encounters,
  medicalConditions,
  timelineFilter,
  onTimelineFilterChange,
  onCreateMedicalRecord,
  onOpenEncountersTab,
  onOpenPrescriptionsTab,
  onOpenOrdersTab,
}: TimelineTabProps) {
  const latestEncounter =
    encounters.find((encounter) => encounter.status === "open") ??
    encounters[0] ??
    null;
  const latestPrescription = fullProfileData.prescriptions[0] ?? null;
  const latestOrder = fullProfileData.orders[0] ?? null;

  const timelineItems: Array<{
    id: string;
    type: TimelineFilter;
    date: string;
    title: string;
    description: string;
    icon: LucideIcon;
    color: string;
  }> = [];

  encounters.forEach((encounter) => {
    timelineItems.push({
      id: encounter._id,
      type: "encounter",
      date: encounter.startedAt ?? encounter.createdAt ?? "",
      title: "زيارة طبية",
      description: encounter.notes || "زيارة سريرية",
      icon: Stethoscope,
      color: "bg-[#0EA5E9] text-white",
    });
  });

  fullProfileData.files.forEach((file) => {
    timelineItems.push({
      id: file.id,
      type: "file",
      date: file.createdAt,
      title: "ملف جديد",
      description: file.name,
      icon: FileText,
      color: "bg-primary text-white",
    });
  });

  fullProfileData.orders.forEach((order) => {
    timelineItems.push({
      id: order.id,
      type: "order",
      date: new Date().toISOString(),
      title: "طلب طبي",
      description: order.title,
      icon: Activity,
      color: "bg-[#EAB308] text-white",
    });
  });

  fullProfileData.prescriptions.forEach((prescription) => {
    timelineItems.push({
      id: prescription.id,
      type: "prescription",
      date: prescription.createdAt,
      title: "وصفة طبية",
      description: `${prescription.items.length} دواء`,
      icon: FileText,
      color: "bg-[#8B5CF6] text-white",
    });
  });

  fullProfileData.medicalHistory.forEach((record) => {
    timelineItems.push({
      id: record.id,
      type: "history",
      date: record.date,
      title: record.title,
      description: record.diagnosis,
      icon: ClipboardList,
      color: "bg-[#A855F7] text-white",
    });
  });

  timelineItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const items =
    timelineFilter === "all"
      ? timelineItems
      : timelineItems.filter((item) => item.type === timelineFilter);

  const filters: Array<{ id: TimelineFilter; label: string; icon: LucideIcon }> = [
    { id: "all", label: "الكل", icon: Clock },
    { id: "encounter", label: "الزيارات", icon: Stethoscope },
    { id: "history", label: "السجلات", icon: ClipboardList },
    { id: "prescription", label: "الوصفات", icon: FileText },
    { id: "order", label: "الطلبات", icon: Activity },
    { id: "file", label: "الملفات", icon: FileText },
  ];

  if (!timelineItems.length) {
    return (
      <motion.div variants={TAB_STAGGER_CONTAINER} initial="hidden" animate="show" className="w-full">
        <motion.div variants={TAB_STAGGER_ITEM} className="w-full">
          <PatientTabEmptyIllustration
            variant="teal"
            imageSrc="/images/photo-not-meduical-file.png"
            imageClassName="drop-shadow-[0_12px_32px_rgba(15,118,110,0.12)]"
            title="لا توجد نشاطات مسجّلة بعد"
            subtitle="سيظهر هنا التسلسل الزمني لجميع نشاطات المريض عند إضافتها"
            actionLabel="إضافة سجل طبي"
            onAction={onCreateMedicalRecord}
            actionIcon={<ClipboardList className="h-4 w-4" />}
          />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div variants={TAB_STAGGER_CONTAINER} initial="hidden" animate="show" className="space-y-4">
      {medicalConditions.length ? (
        <motion.section
          variants={TAB_STAGGER_ITEM}
          className="overflow-hidden rounded-[24px] border border-[#F3D7A8] bg-gradient-to-br from-[#FFFDF8] via-white to-[#FFF7ED] shadow-[0_18px_40px_-24px_rgba(234,88,12,0.2)]"
        >
          <div className="border-b border-[#FDE7C2] px-5 py-4 sm:px-6">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FFF1E8] text-[#C2410C] ring-1 ring-[#FED7AA]">
                <Heart className="h-5 w-5" />
              </div>
              <div className="text-right">
                <h3 className="font-cairo text-[15px] font-black text-[#9A3412]">
                  الحالات المرضية المرتبطة بالملف
                </h3>
                <p className="mt-1 font-cairo text-[13px] font-semibold leading-6 text-[#7C2D12]">
                  هذه الحالات تظهر ضمن الملف الطبي الحالي، ويمكنك متابعة نشاطها السريري عبر الزيارات والوصفات والطلبات.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 px-5 py-5 sm:px-6">
            {medicalConditions.map((condition, index) => (
              <div
                key={`${condition}-${index}`}
                className="rounded-2xl border border-[#FDE7C2] bg-white/90 px-4 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="text-right">
                      <div className="font-cairo text-[15px] font-black text-[#7C2D12]">
                        {condition}
                      </div>
                      <div className="mt-1 font-cairo text-[12px] font-semibold text-[#9A3412]/80">
                        حالة مرضية مزمنة ظاهرة في بيانات المريض الأساسية.
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-start gap-2">
                      <button
                        type="button"
                        onClick={onOpenEncountersTab}
                        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#EFF8FF] px-3.5 font-cairo text-[12px] font-extrabold text-[#175CD3] ring-1 ring-inset ring-[#B2DDFF]/70 transition-colors hover:bg-[#DFF1FF]"
                      >
                        <Stethoscope className="h-3.5 w-3.5" />
                        الزيارات {encounters.length}
                      </button>
                      <button
                        type="button"
                        onClick={onOpenPrescriptionsTab}
                        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#FAF5FF] px-3.5 font-cairo text-[12px] font-extrabold text-[#7C3AED] ring-1 ring-inset ring-[#DDD6FE] transition-colors hover:bg-[#F3E8FF]"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        الوصفات {fullProfileData.prescriptions.length}
                      </button>
                      <button
                        type="button"
                        onClick={onOpenOrdersTab}
                        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#FFFBEB] px-3.5 font-cairo text-[12px] font-extrabold text-[#B45309] ring-1 ring-inset ring-[#FCD34D]/70 transition-colors hover:bg-[#FEF3C7]"
                      >
                        <Activity className="h-3.5 w-3.5" />
                        الطلبات {fullProfileData.orders.length}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
                    <div className="rounded-2xl border border-[#D8EBFF] bg-gradient-to-br from-[#F8FBFF] to-white px-4 py-4">
                      <div className="flex items-center gap-2 text-[#175CD3]">
                        <Stethoscope className="h-4 w-4" />
                        <span className="font-cairo text-[12px] font-extrabold">
                          آخر زيارة مرتبطة بالملف
                        </span>
                      </div>
                      <div className="mt-3 text-right">
                        <div className="font-cairo text-[13px] font-black text-[#0F172A]">
                          {latestEncounter
                            ? latestEncounter.status === "open"
                              ? "زيارة مفتوحة حاليًا"
                              : "آخر زيارة سريرية"
                            : "لا توجد زيارات بعد"}
                        </div>
                        <div className="mt-1 font-cairo text-[12px] font-semibold text-[#475467]">
                          {latestEncounter
                            ? latestEncounter.startedAt ?? latestEncounter.createdAt ?? "—"
                            : "—"}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[#E9D5FF] bg-gradient-to-br from-[#FCFAFF] to-white px-4 py-4">
                      <div className="flex items-center gap-2 text-[#7C3AED]">
                        <FileText className="h-4 w-4" />
                        <span className="font-cairo text-[12px] font-extrabold">
                          آخر وصفة مرتبطة بالملف
                        </span>
                      </div>
                      <div className="mt-3 text-right">
                        <div className="font-cairo text-[13px] font-black text-[#0F172A]">
                          {latestPrescription
                            ? `${latestPrescription.items.length} دواء`
                            : "لا توجد وصفات بعد"}
                        </div>
                        <div className="mt-1 font-cairo text-[12px] font-semibold text-[#475467]">
                          {latestPrescription?.createdAt ?? "—"}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[#FDE68A] bg-gradient-to-br from-[#FFFDF5] to-white px-4 py-4">
                      <div className="flex items-center gap-2 text-[#B45309]">
                        <Activity className="h-4 w-4" />
                        <span className="font-cairo text-[12px] font-extrabold">
                          آخر طلب مرتبط بالملف
                        </span>
                      </div>
                      <div className="mt-3 text-right">
                        <div className="font-cairo text-[13px] font-black text-[#0F172A]">
                          {latestOrder?.title ?? "لا توجد طلبات بعد"}
                        </div>
                        <div className="mt-1 font-cairo text-[12px] font-semibold text-[#475467]">
                          {latestOrder?.status ?? "—"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-dashed border-[#FDE7C2] bg-[#FFF9F3] px-4 py-3 text-right">
                    <div className="font-cairo text-[15px] font-black text-[#7C2D12]">
                      الربط السريري السريع
                    </div>
                    <div className="mt-1 font-cairo text-[12px] font-semibold leading-6 text-[#9A3412]/80">
                      يتيح لك هذا القسم متابعة الحالة المرضية ضمن سياق الملف الحالي، ثم الانتقال مباشرة إلى الزيارات أو الوصفات أو الطلبات لمراجعة التفاصيل التشغيلية.
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      ) : null}

      <motion.div variants={TAB_STAGGER_ITEM} className="flex flex-wrap items-center gap-2">
        {filters.map((filter) => {
          const Icon = filter.icon;
          const isActive = timelineFilter === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => onTimelineFilterChange(filter.id)}
              className={cn(
                "inline-flex h-9 items-center justify-center gap-1.5 rounded-xl px-3.5 font-cairo text-[12px] font-extrabold transition-all duration-200",
                isActive
                  ? "bg-primary text-white shadow-[0_8px_20px_rgba(15,143,139,0.18)]"
                  : "bg-[#F8FAFC] text-[#475467] ring-1 ring-inset ring-[#E2E8F0] hover:bg-[#F1F5F9]",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {filter.label}
            </button>
          );
        })}
        <div className="mr-auto font-cairo text-[12px] font-semibold text-[#64748B]">
          {items.length} نشاط
        </div>
      </motion.div>

      {!items.length ? (
        <motion.div
          variants={TAB_STAGGER_ITEM}
          className="flex min-h-[200px] items-center justify-center rounded-2xl border-2 border-dashed border-[#E2E8F0] bg-[#F8FAFC]"
        >
          <div className="text-center">
            <Clock className="mx-auto h-12 w-12 text-[#94A3B8]" />
            <p className="mt-3 font-cairo text-[15px] font-bold text-[#64748B]">
              لا توجد نشاطات تطابق الفلتر المحدد
            </p>
          </div>
        </motion.div>
      ) : (
        items.map((item, index) => {
          const Icon = item.icon;
          const isLast = index === items.length - 1;
          return (
            <motion.div key={item.id} variants={TAB_STAGGER_ITEM} className="relative flex gap-4">
              {!isLast ? (
                <div className="absolute right-[19px] top-[48px] h-[calc(100%+16px)] w-[2px] bg-gradient-to-b from-[#E2E8F0] to-transparent" />
              ) : null}
              <div className="relative shrink-0">
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl shadow-lg", item.color)}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="flex-1 pb-8">
                <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="font-cairo text-[14px] font-bold text-[#0F172A]">{item.title}</h4>
                      <p className="mt-1 font-cairo text-[13px] font-medium text-[#64748B]">
                        {item.description}
                      </p>
                    </div>
                    <time className="shrink-0 font-cairo text-[11px] font-semibold text-[#94A3B8]">
                      {item.date}
                    </time>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })
      )}
    </motion.div>
  );
}
