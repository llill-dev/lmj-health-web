import { motion } from "framer-motion";
import { Activity } from "lucide-react";

import { PatientTabEmptyIllustration } from "@/components/doctor/patients/patient-tab-empty-illustration";
import { cn } from "@/lib/utils/utils";

import { MedicalOrderCard } from "../cards";
import { TAB_STAGGER_CONTAINER, TAB_STAGGER_ITEM } from "../constants";
import type { FullProfileData } from "../types";

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
      : fullProfileData.orders.filter((order) => {
          const title = order.title.toLowerCase();
          if (orderTypeFilter === "lab") return title.includes("lab") || title.includes("تحليل") || title.includes("فحص");
          if (orderTypeFilter === "radiology") return title.includes("radiology") || title.includes("أشعة") || title.includes("تصوير");
          if (orderTypeFilter === "procedure") return title.includes("procedure") || title.includes("إجراء") || title.includes("عملية");
          return title.includes("referral") || title.includes("تحويل") || title.includes("إحالة");
        });

  const filters = [
    { id: "all", label: "الكل" },
    { id: "lab", label: "تحاليل" },
    { id: "radiology", label: "أشعة" },
    { id: "procedure", label: "إجراءات" },
    { id: "referral", label: "تحويلات" },
  ] as const;

  return (
    <motion.div variants={TAB_STAGGER_CONTAINER} initial="hidden" animate="show" className="space-y-4">
      <motion.div variants={TAB_STAGGER_ITEM} className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => onOrderTypeFilterChange(filter.id)}
            className={cn(
              "inline-flex h-9 items-center justify-center rounded-xl px-3.5 font-cairo text-[12px] font-extrabold transition-all",
              orderTypeFilter === filter.id
                ? "bg-primary text-white"
                : "bg-[#F8FAFC] text-[#475467] ring-1 ring-inset ring-[#E2E8F0]",
            )}
          >
            {filter.label}
          </button>
        ))}
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
