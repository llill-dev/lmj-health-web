"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import {
  RELEASE_CONTENT_TYPES,
  acceptanceStatusLabel,
  listReleaseAcceptanceMatrixCatalog,
  localizeAcceptanceCopy,
  type ReleaseAcceptanceCatalogRow,
} from "./releaseAcceptanceMatrix";

type Props = {
  language?: "ar" | "en";
  className?: string;
  /** Catalog display role — admin signoff matrix. */
  role?: "admin";
  defaultOpen?: boolean;
};

function meaningToneClass(status: ReleaseAcceptanceCatalogRow["overallMeaning"]) {
  if (status === "pass") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (status === "fail") {
    return "border-[#FECACA] bg-[#FEF2F2] text-[#B42318]";
  }
  if (status === "warn") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  return "border-[#E4E7EC] bg-[#F9FAFB] text-[#667085]";
}

export default function ReleaseAcceptanceCatalogPanel({
  language = "ar",
  className,
  role = "admin",
  defaultOpen = false,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const catalog = useMemo(
    () => listReleaseAcceptanceMatrixCatalog(role),
    [role],
  );

  const byType = useMemo(() => {
    const map = new Map<
      ReleaseAcceptanceCatalogRow["type"],
      ReleaseAcceptanceCatalogRow[]
    >();
    for (const type of RELEASE_CONTENT_TYPES) {
      map.set(
        type,
        catalog.filter((row) => row.type === type),
      );
    }
    return map;
  }, [catalog]);

  const title =
    language === "en" ? "Release acceptance catalog" : "مصفوفة قبول الإطلاق";
  const subtitle =
    language === "en"
      ? "All 6 content types × 4 workflow statuses (admin signoff reference)."
      : "جميع أنواع المحتوى الستة × حالات دورة العمل الأربع (مرجع اعتماد للإدارة).";

  return (
    <section
      className={cn(
        "mt-4 rounded-[12px] border border-[#D1E9FF] bg-[#F5FAFF] shadow-[0_8px_18px_rgba(23,92,211,0.06)]",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-start"
        aria-expanded={open}
      >
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 font-cairo text-[13px] font-extrabold text-[#111827]">
            <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
            {title}
          </div>
          <div className="mt-1 font-cairo text-[11px] font-semibold text-[#475467]">
            {subtitle}
          </div>
        </div>
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border border-[#D1E9FF] bg-white text-[#175CD3]">
          {open ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </span>
      </button>

      {open ? (
        <div className="border-t border-[#D1E9FF] px-4 py-4">
          <div className="mb-3 rounded-[10px] border border-[#D1E9FF] bg-white/70 px-3 py-2 font-cairo text-[11px] font-semibold text-[#175CD3]">
            {language === "en"
              ? "Informational catalog only — does not block browsing. Blocking applies on submit-review for drafts."
              : "كتالوج إرشادي فقط — لا يمنع التصفح. الإيقاف عند إرسال المسودة للمراجعة."}
          </div>

          <div className="space-y-4">
            {RELEASE_CONTENT_TYPES.map((type) => {
              const rows = byType.get(type) ?? [];
              return (
                <div
                  key={type}
                  className="overflow-hidden rounded-[12px] border border-[#E4E7EC] bg-white"
                >
                  <div className="border-b border-[#EEF2F6] bg-[#FAFBFC] px-3 py-2 font-cairo text-[12px] font-extrabold text-[#344054]">
                    {type}
                    <span className="ms-2 font-cairo text-[11px] font-bold text-[#98A2B3]">
                      {rows.length}
                      {language === "en" ? " statuses" : " حالات"}
                    </span>
                  </div>
                  <div className="divide-y divide-[#F2F4F7]">
                    {rows.map((row) => (
                      <div
                        key={`${row.type}-${row.status}`}
                        className="grid gap-2 px-3 py-3 sm:grid-cols-[7.5rem_minmax(0,1fr)]"
                      >
                        <div className="font-cairo text-[12px] font-extrabold text-[#111827]">
                          {row.status}
                        </div>
                        <div className="min-w-0 space-y-2">
                          <div className="font-cairo text-[12px] font-bold text-[#475467]">
                            <span className="font-mono text-[11px] text-[#175CD3]">
                              {row.scenarioKey}
                            </span>
                            {" · "}
                            {localizeAcceptanceCopy(row.scenarioLabel, language)}
                          </div>
                          <div
                            className={cn(
                              "rounded-[10px] border px-3 py-2 font-cairo text-[11px] font-bold",
                              meaningToneClass(row.overallMeaning),
                            )}
                          >
                            {acceptanceStatusLabel(row.overallMeaning, language)}
                            {" · "}
                            {localizeAcceptanceCopy(
                              row.overallMeaningLabel,
                              language,
                            )}
                          </div>
                          <div className="rounded-[10px] border border-[#E4E7EC] bg-[#F9FAFB] px-3 py-2 font-cairo text-[11px] font-semibold text-[#475467]">
                            {localizeAcceptanceCopy(row.rulesSummary, language)}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {row.nextActions.length ? (
                              row.nextActions.map((action) => (
                                <span
                                  key={action.action}
                                  className="inline-flex items-center rounded-[999px] border border-[#D0D5DD] bg-white px-3 py-1 font-cairo text-[11px] font-bold text-[#475467]"
                                >
                                  {localizeAcceptanceCopy(action.label, language)}
                                </span>
                              ))
                            ) : (
                              <span className="font-cairo text-[11px] font-semibold text-[#98A2B3]">
                                {language === "en"
                                  ? "No active admin workflow actions"
                                  : "لا إجراءات workflow نشطة للإدارة"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}
