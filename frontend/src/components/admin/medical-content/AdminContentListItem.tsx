import {
  Archive,
  Check,
  ClipboardCheck,
  Clock,
  Eye,
  LayoutGrid,
  Link as LinkIcon,
  AlertTriangle,
  Pencil,
  ShieldCheck,
  X,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { useI18n } from "@/i18n/provider";
import type { AdminContentItem } from "@/lib/admin/types";
import {
  contentStatusLabel,
  contentTypeLabel,
  formatContentDate,
  getListReadinessSignal,
  languageKindLabel,
  resolveContentActorName,
  toDisplayText,
} from "@/components/admin/medical-content/contentListUtils";
import {
  getListAcceptanceScenarioChip,
  getNextWorkflowActions,
  localizeAcceptanceCopy,
} from "@/components/admin/medical-content/releaseAcceptanceMatrix";

function readSourceText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function quickSourceCount(item: AdminContentItem): number | null {
  const record = item as AdminContentItem & {
    sources?: unknown[];
    contentBlocks?: unknown[];
  };

  if (Array.isArray(record.sources)) {
    return record.sources.filter((source) => {
      const sourceRecord = source as Record<string, unknown>;
      return Boolean(
        readSourceText(sourceRecord.url) ||
        readSourceText(sourceRecord.href) ||
        readSourceText(sourceRecord.sourceUrl) ||
        readSourceText(sourceRecord.link),
      );
    }).length;
  }

  if (Array.isArray(record.contentBlocks)) {
    return record.contentBlocks.filter((block) => {
      const blockRecord = block as Record<string, unknown>;
      return Boolean(
        readSourceText(blockRecord.url) ||
        readSourceText(blockRecord.href) ||
        readSourceText(blockRecord.sourceUrl) ||
        readSourceText(blockRecord.sourceLink) ||
        readSourceText(blockRecord.link),
      );
    }).length;
  }

  return null;
}

const statusBadgeClass = (s: AdminContentItem["status"]) => {
  if (s === "PUBLISHED") return "bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]";
  if (s === "IN_REVIEW") return "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]";
  if (s === "ARCHIVED") return "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]";
  return "bg-[#F3F4F6] text-[#344054] border-[#E5E7EB]";
};

/**
 * One content list row — action buttons are branched directly on
 * `item.status` (DRAFT → submit for review, IN_REVIEW → approve/reject/
 * publish, PUBLISHED → archive, ARCHIVED → reference-only), which is the
 * actual "split by lifecycle state" the admin workflow is built around.
 */
export function AdminContentListItem({
  item,
  showMineOnly,
  actionBusy,
  numberLocale,
  onSubmitReview,
  onApprove,
  onReject,
  onPublish,
  onArchive,
  onEdit,
  onView,
}: {
  item: AdminContentItem;
  showMineOnly: boolean;
  actionBusy: boolean;
  numberLocale: string;
  onSubmitReview: (item: AdminContentItem) => void;
  onApprove: (item: AdminContentItem) => void;
  onReject: (item: AdminContentItem) => void;
  onPublish: (item: AdminContentItem) => void;
  onArchive: (item: AdminContentItem) => void;
  onEdit: (item: AdminContentItem) => void;
  onView: (item: AdminContentItem) => void;
}) {
  const { t, locale } = useI18n();
  const sourceCount = quickSourceCount(item);
  const readinessSignal = getListReadinessSignal(item, sourceCount);
  const acceptanceChip = getListAcceptanceScenarioChip(
    item.status,
    locale === "en" ? "en" : "ar",
  );
  const nextActionCues = getNextWorkflowActions(
    item.status,
    showMineOnly ? "data_entry" : "admin",
  );
  const readinessClass =
    readinessSignal.tone === "warning"
      ? "border-[#FECACA] bg-[#FEF2F2] text-[#B42318]"
      : readinessSignal.tone === "success"
        ? "border-[#BBF7D0] bg-[#ECFDF3] text-[#027A48]"
        : "border-[#D1E9FF] bg-[#F5FAFF] text-[#175CD3]";
  const creatorName = resolveContentActorName(item.createdBy);

  return (
    <div className="rounded-[14px] border border-[#EAECF0] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition hover:border-[#D0D5DD] hover:shadow-[0_6px_16px_rgba(16,24,40,0.08)] sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 text-start">
          {/* Title row */}
          <div className="flex flex-wrap items-center justify-start gap-2 sm:gap-2.5">
            <div className="min-w-0 truncate font-cairo text-[15px] font-black text-[#101828]">
              {toDisplayText(item.title) || "—"}
            </div>
            {(() => {
              const lk = languageKindLabel(
                item.language,
                locale as "ar" | "en",
              );
              return (
                <span
                  className={cn(
                    "inline-flex h-[22px] min-w-[1.6rem] shrink-0 items-center justify-center rounded-[8px] border px-2 font-cairo text-[10px] font-extrabold",
                    lk.code === "ar" &&
                      "border-primary/30 bg-[#E7FBFA] text-primary",
                    lk.code === "en" &&
                      "border-blue-200 bg-[#EFF6FF] text-[#1D4ED8]",
                    lk.code === "other" &&
                      "border-[#E5E7EB] bg-[#F3F4F6] text-[#667085]",
                  )}
                  title={lk.label}
                >
                  {lk.code === "ar"
                    ? t("admin.medicalContent.listItem.ar")
                    : lk.code === "en"
                      ? "EN"
                      : t("admin.medicalContent.listItem.unknown")}
                </span>
              );
            })()}
            <div
              className={`inline-flex h-[22px] shrink-0 items-center justify-center rounded-[8px] border px-3 font-cairo text-[11px] font-extrabold ${statusBadgeClass(item.status)}`}
            >
              {contentStatusLabel(item.status, locale as "ar" | "en")}
            </div>
            <div className="inline-flex h-[22px] shrink-0 items-center gap-1.5 rounded-[8px] bg-[#F3F4F6] px-2.5 font-cairo text-[11px] font-bold text-[#475467]">
              <LayoutGrid className="h-3.5 w-3.5" />
              {contentTypeLabel(item.type, locale as "ar" | "en")}
            </div>
          </div>

          {/* Facts row: views / last update / creator */}
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 font-cairo text-[12px] font-semibold text-[#667085]">
            <span className="inline-flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5 shrink-0 text-[#98A2B3]" />
              {Number(item.viewCount ?? item.views ?? 0).toLocaleString(
                numberLocale,
              )}{" "}
              {t("admin.medicalContent.listItem.views")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 shrink-0 text-[#98A2B3]" />
              {t("admin.medicalContent.listItem.lastUpdate")}{" "}
              {formatContentDate(item.updatedAt, locale as "ar" | "en")}
            </span>
            {creatorName ? (
              <span className="inline-flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 shrink-0 text-[#98A2B3]" />
                {t("admin.medicalContent.listItem.by")} {creatorName}
              </span>
            ) : null}
          </div>

          {/* Status signals row */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-dashed border-[#EEF2F6] pt-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#F8FAFC] px-2.5 py-1 font-cairo text-[10.5px] font-bold text-[#667085]">
              {item.status === "DRAFT"
                ? t("admin.medicalContent.listItem.nextSubmitReview")
                : item.status === "IN_REVIEW"
                  ? t("admin.medicalContent.listItem.nextApproveReject")
                  : item.status === "PUBLISHED"
                    ? t("admin.medicalContent.listItem.nextArchive")
                    : t("admin.medicalContent.listItem.archived")}
            </div>
            <div
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-cairo text-[10.5px] font-bold",
                sourceCount === 0
                  ? "bg-[#FFF7ED] text-[#C2410C]"
                  : "bg-[#F8FAFC] text-[#667085]",
              )}
            >
              <LinkIcon className="h-3.5 w-3.5" />
              {sourceCount === null
                ? t("admin.medicalContent.listItem.checkSources")
                : sourceCount === 0
                  ? t("admin.medicalContent.listItem.noSources")
                  : t("admin.medicalContent.listItem.sources").replace(
                      "{count}",
                      String(sourceCount),
                    )}
            </div>
            <div
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-cairo text-[10.5px] font-bold",
                readinessClass,
              )}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              {locale === "ar" ? readinessSignal.ar : readinessSignal.en}
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#E4E7EC] bg-white px-2.5 py-1 font-cairo text-[10.5px] font-bold text-[#475467]">
              {acceptanceChip}
            </div>
            {nextActionCues.map((cue) => (
              <div
                key={`${item._id}-${cue.action}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#D0D5DD] bg-[#F9FAFB] px-2.5 py-1 font-cairo text-[10.5px] font-bold text-[#667085]"
              >
                {localizeAcceptanceCopy(
                  cue.label,
                  locale === "en" ? "en" : "ar",
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-[#EEF2F6] pt-3 lg:border-t-0 lg:border-s lg:ps-4 lg:pt-0">
          {item.status === "DRAFT" ? (
            <button
              type="button"
              disabled={actionBusy}
              onClick={() => onSubmitReview(item)}
              className="flex h-[32px] items-center justify-center gap-1 rounded-[10px] border border-[#E5E7EB] px-3 text-[#475467] transition hover:bg-[#F9FAFB] disabled:opacity-50"
              aria-label={t("admin.medicalContent.listItem.sendForReview")}
            >
              <ClipboardCheck className="w-4 h-4" />
              <span className="font-cairo text-[11px] font-extrabold">
                {t("admin.medicalContent.listItem.sendForReview")}
              </span>
            </button>
          ) : null}

          {item.status === "IN_REVIEW" ? (
            <>
              <button
                type="button"
                disabled={actionBusy}
                onClick={() => onApprove(item)}
                className="flex h-[32px] items-center justify-center gap-1 rounded-[10px] border border-[#BBF7D0] bg-[#F6FEF9] px-3 text-[#16A34A] transition hover:bg-[#ECFDF3] disabled:opacity-50"
                aria-label={t("admin.medicalContent.listItem.approve")}
              >
                <Check className="w-4 h-4" />
                <span className="font-cairo text-[11px] font-extrabold">
                  {t("admin.medicalContent.listItem.approve")}
                </span>
              </button>
              <button
                type="button"
                disabled={actionBusy}
                onClick={() => onReject(item)}
                className="flex h-[32px] items-center justify-center gap-1 rounded-[10px] border border-[#FECACA] bg-[#FFFBFA] px-3 text-[#EF4444] transition hover:bg-[#FEF2F2] disabled:opacity-50"
                aria-label={t("admin.medicalContent.listItem.reject")}
              >
                <X className="w-4 h-4" />
                <span className="font-cairo text-[11px] font-extrabold">
                  {t("admin.medicalContent.listItem.reject")}
                </span>
              </button>
            </>
          ) : null}

          {item.status === "PUBLISHED" ? (
            <button
              type="button"
              disabled={actionBusy}
              onClick={() => onArchive(item)}
              className="flex h-[32px] items-center justify-center gap-1 rounded-[10px] border border-[#BFDBFE] bg-[#F5FAFF] px-3 text-[#1D4ED8] transition hover:bg-[#EFF6FF] disabled:opacity-50"
              aria-label={t("admin.medicalContent.listItem.archive")}
            >
              <Archive className="w-4 h-4" />
              <span className="font-cairo text-[11px] font-extrabold">
                {t("admin.medicalContent.listItem.archive")}
              </span>
            </button>
          ) : null}

          {item.status === "IN_REVIEW" ? (
            <button
              type="button"
              disabled={actionBusy}
              onClick={() => onPublish(item)}
              className="flex h-[32px] items-center justify-center gap-1 rounded-[10px] border border-[#67E8F9] bg-[#F0FDFF] px-3 text-[#0891B2] transition hover:bg-[#ECFEFF] disabled:opacity-50"
              aria-label={t("admin.medicalContent.listItem.publish")}
            >
              <ShieldCheck className="w-4 h-4" />
              <span className="font-cairo text-[11px] font-extrabold">
                {t("admin.medicalContent.listItem.publish")}
              </span>
            </button>
          ) : null}

          <div className="mx-1 h-[24px] w-px shrink-0 bg-[#EAECF0]" />

          <button
            type="button"
            onClick={() => onEdit(item)}
            className="flex h-[32px] w-[32px] items-center justify-center rounded-[10px] text-[#0F8F8B] transition hover:bg-[#E7FBFA]"
            aria-label={t("admin.medicalContent.listItem.edit")}
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onView(item)}
            className="flex h-[32px] w-[32px] items-center justify-center rounded-[10px] text-[#2563EB] transition hover:bg-[#EFF6FF]"
            aria-label={t("admin.medicalContent.listItem.view")}
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
