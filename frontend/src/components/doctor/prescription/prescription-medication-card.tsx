import { useState } from "react";
import { ChevronDown, Copy, Pencil, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils/utils";
import { ENCOUNTERS_EXPAND_TRANSITION } from "@/components/doctor/encounters/encounters-motion";
import type { PrescriptionMedicationItem } from "./prescription-types";
import { useI18n } from "@/i18n/provider";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="font-cairo text-[13px] leading-[22px] text-[#344054]">
      <span className="font-bold text-[#667085]">{label}: </span>
      <span className="font-extrabold text-[#101828]">{value}</span>
    </p>
  );
}

export function PrescriptionMedicationCard({
  item,
  onEdit,
  onDelete,
  onDuplicate,
  collapsible = false,
  defaultExpanded = false,
  readOnly = false,
}: {
  item: PrescriptionMedicationItem;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  readOnly?: boolean;
}) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const showDetails = !collapsible || expanded;

  return (
    <article className="rounded-[12px] border-[0.5px] border-[#0F8F8B] bg-[#E6F4F3] px-4 py-4 shadow-[0_4px_14px_rgba(15,143,139,0.06)]">
      <div className="flex gap-3 justify-between items-start">
        <div className="flex-1 min-w-0 text-start">
          <h3 className="font-cairo text-[15px] font-extrabold text-[#101828]">
            {item.name}
          </h3>
          {collapsible && !expanded ? (
            <p className="mt-1 font-cairo text-[12px] font-semibold text-[#667085]">
              {item.dosage} • {item.frequency} • {item.duration}
            </p>
          ) : null}
        </div>

        <div className="flex gap-2 items-center shrink-0">
          {!readOnly && onEdit && onDelete ? (
            <>
              {onDuplicate ? (
                <button
                  type="button"
                  onClick={onDuplicate}
                  className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-[#BFEDEC] text-primary transition hover:bg-[#F0FAF9]"
                  aria-label={t("doctor.medicationCard.copyAria")}
                >
                  <Copy className="w-4 h-4" aria-hidden />
                </button>
              ) : null}
              <button
                type="button"
                onClick={onEdit}
                className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-[#BFEDEC] text-primary transition hover:bg-[#F0FAF9]"
                aria-label={t("doctor.medicationCard.editAria")}
              >
                <Pencil className="w-4 h-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="me-4 inline-flex items-center gap-1 font-cairo text-[12px] font-extrabold text-[#E11D48] transition hover:text-[#BE123C]"
              >
                <Trash2 className="w-4 h-4" aria-hidden />
                <span>{t("doctor.medicationCard.delete")}</span>
              </button>
            </>
          ) : null}
          {collapsible ? (
            <button
              type="button"
              onClick={() => setExpanded((current) => !current)}
              aria-expanded={expanded}
              aria-label={
                expanded
                  ? t("doctor.medicationCard.hideDetailsAria")
                  : t("doctor.medicationCard.showDetailsAria")
              }
              className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-[#BFEDEC]  text-primary transition hover:bg-[#F0FAF9]"
            >
              <motion.span
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={ENCOUNTERS_EXPAND_TRANSITION}
                className="inline-flex"
              >
                <ChevronDown className="w-4 h-4" aria-hidden />
              </motion.span>
            </button>
          ) : null}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {showDetails ? (
          <motion.div
            key="medication-details"
            initial={collapsible ? { height: 0, opacity: 0 } : false}
            animate={{ height: "auto", opacity: 1 }}
            exit={collapsible ? { height: 0, opacity: 0 } : undefined}
            transition={ENCOUNTERS_EXPAND_TRANSITION}
            className={cn("overflow-hidden", collapsible && "mt-2")}
          >
            <div className="space-y-0.5 pt-1">
              <DetailRow label={t("doctor.medicationCard.dosageLabel")} value={item.dosage} />
              <DetailRow label={t("doctor.medicationCard.frequencyLabel")} value={item.frequency} />
              <DetailRow label={t("doctor.medicationCard.durationLabel")} value={item.duration} />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </article>
  );
}
