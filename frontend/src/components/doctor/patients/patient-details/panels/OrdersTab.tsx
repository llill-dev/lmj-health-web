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
import { useI18n } from "@/i18n/provider";

import { MedicalOrderCard } from "../cards";
import { TAB_STAGGER_CONTAINER, TAB_STAGGER_ITEM } from "../constants";
import type { FullProfileData } from "../types";

function getFilterOptions(t: (key: string) => string): Array<{
  id: "all" | "lab" | "radiology" | "procedure" | "referral";
  label: string;
  icon: LucideIcon;
}> {
  return [
    { id: "all", label: t("doctor.ordersTab.filter.all"), icon: Activity },
    { id: "lab", label: t("doctor.ordersTab.filter.lab"), icon: FlaskConical },
    { id: "radiology", label: t("doctor.ordersTab.filter.radiology"), icon: ScanLine },
    { id: "procedure", label: t("doctor.ordersTab.filter.procedure"), icon: Syringe },
    { id: "referral", label: t("doctor.ordersTab.filter.referral"), icon: ArrowRightLeft },
  ];
}

export function OrdersTab({
  fullProfileData,
  orderTypeFilter,
  onOrderTypeFilterChange,
}: {
  fullProfileData: FullProfileData;
  orderTypeFilter: "all" | "lab" | "radiology" | "procedure" | "referral";
  onOrderTypeFilterChange: (filter: "all" | "lab" | "radiology" | "procedure" | "referral") => void;
}) {
  const { t } = useI18n();

  if (!fullProfileData.orders.length) {
    return (
      <motion.div variants={TAB_STAGGER_CONTAINER} initial="hidden" animate="show" className="w-full">
        <motion.div variants={TAB_STAGGER_ITEM} className="w-full">
          <PatientTabEmptyIllustration
            variant="teal"
            imageSrc="/images/photo-not-meduical-file.png"
            imageClassName="drop-shadow-[0_12px_32px_rgba(202,138,4,0.1)]"
            title={t("doctor.ordersTab.emptyTitle")}
            subtitle={t("doctor.ordersTab.emptySubtitle")}
            actionLabel={t("doctor.ordersTab.goToMedicalRecord")}
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

  const filters = getFilterOptions(t);

  return (
    <motion.div variants={TAB_STAGGER_CONTAINER} initial="hidden" animate="show" className="space-y-4">
      <motion.div
        variants={TAB_STAGGER_ITEM}
        className="flex flex-wrap items-center justify-between gap-3 rounded-[16px] border border-[#E2E8F0]/90 bg-[linear-gradient(145deg,#fffbeb_0%,#ffffff_60%,#f0fdf4_100%)] px-4 py-3"
      >
        <div className="text-start">
          <p className="font-cairo text-[13px] font-extrabold text-[#0F172A]">
            {t("doctor.ordersTab.orderCount").replace(
              "{count}",
              String(fullProfileData.orders.length),
            )}
          </p>
          <p className="mt-0.5 font-cairo text-[12px] font-semibold text-[#64748B]">
            {filteredOrders.length === fullProfileData.orders.length
              ? t("doctor.ordersTab.showingAll")
              : t("doctor.ordersTab.filterMatchCount").replace(
                  "{count}",
                  String(filteredOrders.length),
                )}
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
              {t("doctor.ordersTab.noMatchFilter")}
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
