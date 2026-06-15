import { motion } from "framer-motion";
import {
  Activity,
  ArrowRightLeft,
  FlaskConical,
  ScanLine,
  Syringe,
  type LucideIcon,
} from "lucide-react";

import { PatientTabEmptyIllustration } from "@/components/doctor/patients/patient-tab-empty-illustration";
import { cn } from "@/lib/utils/utils";

import { MedicalOrderCard } from "../cards";
import { TAB_STAGGER_CONTAINER, TAB_STAGGER_ITEM } from "../constants";
import type { FullProfileData } from "../types";

const FILTER_OPTIONS: Array<{
  id: "all" | "lab" | "radiology" | "procedure" | "referral";
  label: string;
  icon: LucideIcon;
}> = [
  { id: "all", label: "الكل", icon: Activity },
  { id: "lab", label: "تحاليل", icon: FlaskConical },
  { id: "radiology", label: "أشعة", icon: ScanLine },
  { id: "procedure", label: "إجراءات", icon: Syringe },
  { id: "referral", label: "تحويلات", icon: ArrowRightLeft },
];

export function OrdersTab({
  fullProfileData,
  orderTypeFilter,
  onOrderTypeFilterChange,
}: {
  fullProfileData: FullProfileData;
  orderTypeFilter: "all" | "lab" | "radiology" | "procedure" | "referral";
  onOrderTypeFilterChange: (filter: "all" | "lab" | "radiology" | "procedure" | "referral") => void;
}) {
  if (!fullProfileData.orders.length) {
    return (
      <motion.div variants={TAB_STAGGER_CONTAINER} initial="hidden" animate="show" className="w-full">
        <motion.div variants={TAB_STAGGER_ITEM} className="w-full">
          <PatientTabEmptyIllustration
            variant="teal"
            imageSrc="/images/photo-not-meduical-file.png"
            imageClassName="drop-shadow-[0_12px_32px_rgba(202,138,4,0.1)]"
            title="لا توجد طلبات طبية مسجّلة"
            subtitle="ستظهر هنا طلبات التحاليل والأشعة والإجراءات عند إضافتها"
            actionLabel="الانتقال إلى السجل الطبي"
            onAction={() => onOrderTypeFilterChange("all")}
            actionIcon={<Activity className="h-4 w-4" />}
          />
        </motion.div>
      </motion.div>
    );
  }

  const filteredOrders =
    orderTypeFilter === "all"
      ? fullProfileData.orders
      : fullProfileData.orders.filter(
          (order) => order.category === orderTypeFilter,
        );

  const filters = FILTER_OPTIONS;

  return (
    <motion.div variants={TAB_STAGGER_CONTAINER} initial="hidden" animate="show" className="space-y-4">
      <motion.div
        variants={TAB_STAGGER_ITEM}
        className="flex flex-wrap items-center justify-between gap-3 rounded-[16px] border border-[#E2E8F0]/90 bg-[linear-gradient(145deg,#fffbeb_0%,#ffffff_60%,#f0fdf4_100%)] px-4 py-3"
      >
        <div className="text-right">
          <p className="font-cairo text-[13px] font-extrabold text-[#0F172A]">
            {fullProfileData.orders.length} طلب طبي
          </p>
          <p className="mt-0.5 font-cairo text-[12px] font-semibold text-[#64748B]">
            {filteredOrders.length === fullProfileData.orders.length
              ? "عرض جميع الطلبات"
              : `${filteredOrders.length} طلب يطابق الفلتر الحالي`}
          </p>
        </div>
      </motion.div>

      <motion.div variants={TAB_STAGGER_ITEM} className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const Icon = filter.icon;
          const isActive = orderTypeFilter === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => onOrderTypeFilterChange(filter.id)}
              className={cn(
                "inline-flex h-9 items-center justify-center gap-1.5 rounded-xl px-3.5 font-cairo text-[12px] font-extrabold transition-all duration-200",
                isActive
                  ? "bg-primary text-white shadow-[0_8px_20px_rgba(15,143,139,0.18)]"
                  : "bg-[#F8FAFC] text-[#475467] ring-1 ring-inset ring-[#E2E8F0] hover:bg-[#F1F5F9]",
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {filter.label}
            </button>
          );
        })}
      </motion.div>

      {filteredOrders.length ? (
        filteredOrders.map((order, index) => <MedicalOrderCard key={order.id} order={order} index={index + 1} />)
      ) : (
        <motion.div variants={TAB_STAGGER_ITEM}>
          <div className="rounded-2xl border-2 border-dashed border-[#E2E8F0] bg-[#F8FAFC] px-6 py-8 text-center">
            <Activity className="mx-auto h-10 w-10 text-[#CBD5E1]" />
            <p className="mt-3 font-cairo text-[14px] font-bold text-[#64748B]">
              لا توجد طلبات تطابق هذا الفلتر
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
