import * as Dialog from "@radix-ui/react-dialog";
import { Loader2, X } from "lucide-react";
import { useAdminContentById } from "@/hooks/admin/content/useAdminContent";
import MedicalContentGovernancePanel, {
  ReleaseAcceptanceSection,
} from "@/components/admin/medical-content/MedicalContentGovernancePanel";
import MedicalContentPatientPreview from "@/components/admin/medical-content/MedicalContentPatientPreview";
import {
  buildReleaseAcceptanceFromDetails,
} from "@/components/admin/medical-content/releaseAcceptanceMatrix";
import type {
  AdminContentStatus,
  AdminContentType,
} from "@/lib/admin/types";
import {
  extractMedicalContentDetails,
  formatDate,
  getReviewReadinessIssueCodes,
  toDisplayText,
  toPrettyJson,
} from "./medicalContentDialogHelpers";
import { useI18n } from "@/i18n/provider";
import { useMemo } from "react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentId: string | null;
};

function typeLabel(t: AdminContentType) {
  if (t === "CONDITION") return "الحالات الطبية";
  if (t === "SYMPTOM") return "الأعراض";
  if (t === "GENERAL_ADVICE") return "نصائح عامة";
  if (t === "NEWS") return "الأخبار";
  if (t === "MEDICATION") return "الأدوية";
  if (t === "SETTINGS_PAGE") return "صفحات الإعدادات";
  return "عام";
}

function statusLabel(s: AdminContentStatus) {
  if (s === "PUBLISHED") return "منشور";
  if (s === "IN_REVIEW") return "قيد المراجعة";
  if (s === "ARCHIVED") return "مؤرشف";
  return "مسودة";
}

function statusTone(s: AdminContentStatus) {
  if (s === "PUBLISHED") return "bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]";
  if (s === "IN_REVIEW") return "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]";
  if (s === "ARCHIVED") return "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]";
  return "bg-[#F3F4F6] text-[#344054] border-[#E5E7EB]";
}

function JsonPreview({
  value,
  emptyLabel = "—",
}: {
  value: unknown;
  emptyLabel?: string;
}) {
  const text = toPrettyJson(value);
  if (!text) {
    return (
      <div className="font-cairo text-[13px] text-[#667085]">{emptyLabel}</div>
    );
  }

  return (
    <pre className="overflow-x-auto rounded-[12px] bg-[#0F172A] p-4 text-left font-mono text-[12px] leading-6 text-[#E2E8F0]">
      {text}
    </pre>
  );
}

function MetaRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value?: string | number | null;
  mono?: boolean;
}) {
  if (value == null || value === "") return null;
  return (
    <div className="font-cairo font-bold text-[#667085]">
      {label}:{" "}
      <span className={mono ? "font-mono text-[#111827]" : "text-[#111827]"}>
        {value}
      </span>
    </div>
  );
}

export default function MedicalContentViewDialog({
  open,
  onOpenChange,
  contentId,
}: Props) {
  const { locale, dir } = useI18n();
  const detailsQuery = useAdminContentById(open ? contentId : null);
  const details = extractMedicalContentDetails(detailsQuery.data);
  const news = details?.news ?? null;
  const template = details?.template ?? null;
  const previewLanguage = details?.language === "en" ? "en" : "ar";
  const acceptanceSnapshot = useMemo(
    () => buildReleaseAcceptanceFromDetails(details, "admin"),
    [details],
  );
  const previewWarnings = details
    ? getReviewReadinessIssueCodes(details).map((code) => {
        if (previewLanguage === "en") {
          if (code === "sources_required") return "No source references are currently attached.";
          if (code === "disclaimer_required") return "Disclaimer version is missing.";
          return "Seek Help block requirement is not enabled.";
        }
        if (code === "sources_required") return "لا توجد مراجع مصادر مرفقة حاليًا.";
        if (code === "disclaimer_required") return "إصدار التنبيه الطبي غير مضاف.";
        return "متطلب Seek Help Block غير مفعّل.";
      })
    : [];

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-[2px]" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-[9999] w-[1080px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 rounded-[18px] border border-[#EAECF0] bg-white shadow-[0_30px_80px_rgba(16,24,40,0.35)] outline-none"
          dir={dir}
          lang={locale}
        >
          <div className="flex items-center justify-between border-b border-[#EEF2F6] px-6 py-4">
            <div>
              <Dialog.Title className="font-cairo text-[18px] font-black text-[#111827]">
                معاينة المحتوى الطبي
              </Dialog.Title>
              <Dialog.Description className="font-cairo text-[12px] font-semibold text-[#98A2B3]">
                عرض تفاصيل المحتوى قبل التعديل أو الاعتماد
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-[10px] text-[#667085] hover:bg-[#F2F4F7]"
                aria-label="إغلاق"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="max-h-[78vh] overflow-y-auto px-6 py-5">
            {detailsQuery.isAwaitingData ? (
              <div className="flex items-center justify-center gap-2 py-16 font-cairo text-[13px] font-bold text-[#667085]">
                <Loader2 className="h-4 w-4 animate-spin" />
                جارِ تحميل تفاصيل المحتوى...
              </div>
            ) : detailsQuery.isError ? (
              <div className="rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 font-cairo text-[13px] font-bold text-[#B42318]">
                تعذّر تحميل تفاصيل المحتوى.
              </div>
            ) : !details ? (
              <div className="rounded-[12px] border border-[#F2F4F7] bg-[#FCFCFD] px-4 py-3 font-cairo text-[13px] font-bold text-[#667085]">
                لا تتوفر تفاصيل لهذا المحتوى.
              </div>
            ) : (
              <div className="space-y-5">
                <div className="rounded-[14px] border border-[#E4E7EC] bg-[#F9FAFB] p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-cairo text-[20px] font-black text-[#111827]">
                      {details.title || "—"}
                    </span>
                    <span
                      className={`inline-flex h-[24px] items-center rounded-[8px] border px-3 font-cairo text-[11px] font-extrabold ${statusTone(details.status)}`}
                    >
                      {statusLabel(details.status)}
                    </span>
                    <span className="inline-flex h-[24px] items-center rounded-[8px] border border-[#E4E7EC] bg-white px-3 font-cairo text-[11px] font-extrabold text-[#475467]">
                      {typeLabel(details.type)}
                    </span>
                  </div>

                  {details.summary ? (
                    <div className="mt-3 font-cairo text-[14px] leading-7 text-[#344054]">
                      {details.summary}
                    </div>
                  ) : null}

                  <div className="mt-3 grid grid-cols-1 gap-2 text-[12px] sm:grid-cols-2">
                    <MetaRow label="اللغة" value={details.language || "—"} />
                    <MetaRow
                      label="المشاهدات"
                      value={Number(
                        details.viewCount ?? details.views ?? 0,
                      ).toLocaleString("ar-SA")}
                    />
                    <MetaRow label="Slug" value={details.slug} mono />
                    <MetaRow label="آخر تحديث" value={formatDate(details.updatedAt)} />
                    <MetaRow label="تاريخ النشر" value={formatDate(details.publishedAt)} />
                    <MetaRow label="إصدار الصفحة" value={details.pageVersion} />
                    <MetaRow
                      label="إصدار التنبيه"
                      value={
                        details.disclaimerVersion
                          ? String(details.disclaimerVersion)
                          : null
                      }
                    />
                    <MetaRow label="صورة الغلاف" value={details.coverImage} mono />
                    <MetaRow
                      label="معرّف القالب"
                      value={details.templateId}
                      mono
                    />
                  </div>

                  {details.rejectionReason ? (
                    <div className="mt-3 rounded-[10px] border border-[#FECACA] bg-[#FEF2F2] px-3 py-2">
                      <div className="font-cairo text-[12px] font-extrabold text-[#991B1B]">
                        سبب الرفض
                      </div>
                      <div className="mt-0.5 font-cairo text-[13px] leading-6 text-[#B42318]">
                        {details.rejectionReason}
                      </div>
                    </div>
                  ) : null}
                </div>

                {acceptanceSnapshot ? (
                  <ReleaseAcceptanceSection
                    snapshot={acceptanceSnapshot}
                    language={previewLanguage}
                    showNextActions
                  />
                ) : null}

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                  <div className="space-y-5">
                    <div className="rounded-[14px] border border-[#E4E7EC] bg-white p-4">
                      <div className="font-cairo text-[15px] font-extrabold text-[#111827]">
                        المعاينة كما ستظهر للمريض
                      </div>
                      <div className="mt-4">
                        <MedicalContentPatientPreview
                          title={details.title}
                          summary={details.summary}
                          coverImage={details.coverImage}
                          language={previewLanguage}
                          contentBlocks={details.contentBlocks}
                          disclaimerVersion={toDisplayText(details.disclaimerVersion)}
                          requiresSeekHelpBlock={details.requiresSeekHelpBlock}
                          riskFlags={details.riskFlags}
                          sources={details.sources}
                          newsSourceName={toDisplayText(
                            news?.sourceName ?? details.sourceName,
                          )}
                          newsSourceUrl={toDisplayText(news?.sourceUrl)}
                          newsPublishedAt={toDisplayText(news?.publishedAt)}
                          previewWarnings={previewWarnings}
                        />
                      </div>
                    </div>

                    <div className="rounded-[14px] border border-[#E4E7EC] bg-white p-4">
                      <div className="font-cairo text-[15px] font-extrabold text-[#111827]">
                        البيانات الديناميكية
                      </div>
                      <div className="mt-4">
                        <JsonPreview
                          value={details.dataValue}
                          emptyLabel="لا توجد بيانات ديناميكية."
                        />
                      </div>
                    </div>

                    <div className="rounded-[14px] border border-[#E4E7EC] bg-white p-4">
                      <div className="font-cairo text-[15px] font-extrabold text-[#111827]">
                        معلومات القالب
                      </div>
                      <div className="mt-3 grid grid-cols-1 gap-2 text-[12px] sm:grid-cols-2">
                        <MetaRow
                          label="اسم القالب"
                          value={toDisplayText(template?.name)}
                        />
                        <MetaRow
                          label="نوع القالب"
                          value={toDisplayText(template?.parentType)}
                        />
                        <MetaRow
                          label="الحالة"
                          value={toDisplayText(template?.status)}
                        />
                        <MetaRow
                          label="عدد الحقول"
                          value={
                            Array.isArray(template?.fields)
                              ? String(template?.fields.length)
                              : null
                          }
                        />
                      </div>
                      <div className="mt-4">
                        <JsonPreview
                          value={template}
                          emptyLabel="لا تتوفر بيانات قالب إضافية."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="rounded-[14px] border border-[#E4E7EC] bg-white p-4">
                      <div className="font-cairo text-[15px] font-extrabold text-[#111827]">
                        الحوكمة والسلامة
                      </div>
                      <div className="mt-4">
                        <MedicalContentGovernancePanel
                          contentType={details.type}
                          status={details.status}
                          disclaimerVersion={toDisplayText(details.disclaimerVersion)}
                          requiresSeekHelpBlock={details.requiresSeekHelpBlock}
                          isFeatured={details.isFeatured}
                          riskFlags={details.riskFlags ?? []}
                          tags={details.tags ?? []}
                          categories={details.categories ?? []}
                          relatedContentIds={details.relatedContentIds ?? []}
                          sources={details.sources ?? []}
                          dynamicData={details.dataValue}
                          hasMeaningfulBlocks={
                            details.type === "SETTINGS_PAGE" ||
                            (Array.isArray(details.contentBlocks) &&
                              details.contentBlocks.length > 0)
                          }
                          role="admin"
                          language={previewLanguage}
                          showAcceptanceMatrix={false}
                          news={{
                            sourceName: toDisplayText(
                              news?.sourceName ?? details.sourceName,
                            ),
                            sourceUrl: toDisplayText(news?.sourceUrl),
                            originalTitle: toDisplayText(
                              news?.originalTitle ?? details.originalTitle,
                            ),
                            publishedAt: toDisplayText(news?.publishedAt),
                            aiSummary: toDisplayText(
                              news?.aiSummary ?? details.aiSummary,
                            ),
                          }}
                        />
                      </div>
                    </div>

                    <div className="rounded-[14px] border border-[#E4E7EC] bg-white p-4">
                      <div className="font-cairo text-[15px] font-extrabold text-[#111827]">
                        السجل الخام
                      </div>
                      <div className="mt-4">
                        <JsonPreview value={details.rawItem} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
