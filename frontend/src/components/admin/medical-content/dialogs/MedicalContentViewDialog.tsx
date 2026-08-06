import * as Dialog from "@radix-ui/react-dialog";
import { ExternalLink, Loader2, X } from "lucide-react";
import { useAdminContentById } from "@/hooks/admin/content/useAdminContent";
import MedicalContentGovernancePanel from "@/components/admin/medical-content/MedicalContentGovernancePanel";
import MedicalContentPatientPreview from "@/components/admin/medical-content/MedicalContentPatientPreview";
import type {
  AdminContentBlock,
  AdminContentStatus,
  AdminContentType,
} from "@/lib/admin/types";
import {
  extractMedicalContentDetails,
  formatDate,
  toDisplayText,
  toPrettyJson,
} from "./medicalContentDialogHelpers";

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

function renderContentBlock(block: AdminContentBlock, index: number) {
  if (!block || typeof block !== "object") return null;
  const type = toDisplayText((block as Record<string, unknown>).type);

  if (type === "heading") {
    const levelRaw = Number((block as { level?: number }).level ?? 3);
    const level = Math.max(1, Math.min(6, Number.isNaN(levelRaw) ? 3 : levelRaw));
    const text = toDisplayText((block as { text?: unknown }).text);
    const cls =
      level <= 2
        ? "text-[20px] font-black"
        : level === 3
          ? "text-[18px] font-extrabold"
          : "text-[16px] font-bold";
    return (
      <h3
        key={`block-${index}`}
        className={`font-cairo text-[#111827] ${cls}`}
      >
        {text || "—"}
      </h3>
    );
  }

  if (type === "paragraph") {
    const text = toDisplayText((block as { text?: unknown }).text);
    return (
      <p
        key={`block-${index}`}
        className="font-cairo text-[14px] leading-7 text-[#344054]"
      >
        {text || "—"}
      </p>
    );
  }

  if (type === "list") {
    const ordered = Boolean((block as { ordered?: boolean }).ordered);
    const items = Array.isArray((block as { items?: unknown[] }).items)
      ? ((block as { items?: unknown[] }).items ?? [])
          .map((i) => toDisplayText(i))
          .filter(Boolean)
      : [];
    const ListTag = ordered ? "ol" : "ul";
    return (
      <ListTag
        key={`block-${index}`}
        className={`list-inside space-y-2 font-cairo text-[14px] text-[#344054] ${
          ordered ? "list-decimal" : "list-disc"
        }`}
      >
        {(items.length ? items : ["—"]).map((itemText, idx) => (
          <li key={`li-${index}-${idx}`}>{itemText}</li>
        ))}
      </ListTag>
    );
  }

  if (type === "callout") {
    const variant =
      toDisplayText((block as { variant?: unknown }).variant) || "info";
    const title = toDisplayText((block as { title?: unknown }).title);
    const text = toDisplayText((block as { text?: unknown }).text);
    const tone =
      variant === "danger"
        ? "border-[#FECACA] bg-[#FEF2F2] text-[#B42318]"
        : variant === "warn"
          ? "border-[#FEDF89] bg-[#FFFAEB] text-[#B54708]"
          : "border-[#B2DDFF] bg-[#EFF8FF] text-[#175CD3]";
    return (
      <div
        key={`block-${index}`}
        className={`rounded-[12px] border px-4 py-3 ${tone}`}
      >
        {title ? (
          <div className="font-cairo text-[13px] font-extrabold">{title}</div>
        ) : null}
        <div className="mt-1 font-cairo text-[13px] leading-6">{text || "—"}</div>
      </div>
    );
  }

  if (type === "linkCard") {
    const title = toDisplayText((block as { title?: unknown }).title);
    const url = toDisplayText((block as { url?: unknown }).url);
    const description = toDisplayText(
      (block as { description?: unknown }).description,
    );
    return (
      <div
        key={`block-${index}`}
        className="rounded-[12px] border border-[#D0D5DD] bg-white px-4 py-3"
      >
        <div className="font-cairo text-[13px] font-extrabold text-[#111827]">
          {title || "—"}
        </div>
        {description ? (
          <div className="mt-1 font-cairo text-[13px] leading-6 text-[#475467]">
            {description}
          </div>
        ) : null}
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1 font-cairo text-[12px] font-bold text-primary hover:underline"
          >
            {url}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : null}
      </div>
    );
  }

  if (type === "faq") {
    const items = Array.isArray((block as { items?: unknown[] }).items)
      ? ((block as { items?: unknown[] }).items ?? []).filter(
          (item) => item && typeof item === "object",
        )
      : [];
    return (
      <div key={`block-${index}`} className="space-y-3">
        {items.length ? (
          items.map((item, idx) => {
            const faq = item as Record<string, unknown>;
            return (
              <div
                key={`faq-${index}-${idx}`}
                className="rounded-[12px] border border-[#EAECF0] bg-[#F9FAFB] px-4 py-3"
              >
                <div className="font-cairo text-[13px] font-extrabold text-[#111827]">
                  {toDisplayText(faq.question) || "—"}
                </div>
                <div className="mt-1 font-cairo text-[13px] leading-6 text-[#475467]">
                  {toDisplayText(faq.answer) || "—"}
                </div>
              </div>
            );
          })
        ) : (
          <div className="font-cairo text-[13px] text-[#667085]">—</div>
        )}
      </div>
    );
  }

  if (type === "divider") {
    return <hr key={`block-${index}`} className="border-[#EAECF0]" />;
  }

  return (
    <div
      key={`block-${index}`}
      className="rounded-[10px] border border-dashed border-[#D0D5DD] bg-[#FCFCFD] px-3 py-2 font-cairo text-[12px] text-[#667085]"
    >
      كتلة غير مدعومة: {type || "unknown"}
    </div>
  );
}

export default function MedicalContentViewDialog({
  open,
  onOpenChange,
  contentId,
}: Props) {
  const detailsQuery = useAdminContentById(open ? contentId : null);
  const details = extractMedicalContentDetails(detailsQuery.data);
  const news = details?.news ?? null;
  const template = details?.template ?? null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-[2px]" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-[9999] w-[1080px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 rounded-[18px] border border-[#EAECF0] bg-white shadow-[0_30px_80px_rgba(16,24,40,0.35)] outline-none"
          dir="rtl"
          lang="ar"
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
                          contentBlocks={details.contentBlocks}
                          disclaimerVersion={toDisplayText(details.disclaimerVersion)}
                          requiresSeekHelpBlock={details.requiresSeekHelpBlock}
                          riskFlags={details.riskFlags}
                          sources={details.sources}
                          newsSourceName={toDisplayText(
                            news?.sourceName ?? details.sourceName,
                          )}
                          newsPublishedAt={toDisplayText(news?.publishedAt)}
                        />
                      </div>
                    </div>

                    <div className="rounded-[14px] border border-[#E4E7EC] bg-white p-4">
                      <div className="font-cairo text-[15px] font-extrabold text-[#111827]">
                        محتوى المقال
                      </div>
                      <div className="mt-4 space-y-4">
                        {(details.contentBlocks?.length
                          ? details.contentBlocks
                          : [
                              {
                                type: "paragraph",
                                text: details.summary || "لا يوجد محتوى مفصل",
                              } as AdminContentBlock,
                            ]
                        ).map((block, idx) => renderContentBlock(block, idx))}
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
                          disclaimerVersion={toDisplayText(details.disclaimerVersion)}
                          requiresSeekHelpBlock={details.requiresSeekHelpBlock}
                          isFeatured={details.isFeatured}
                          riskFlags={details.riskFlags}
                          tags={details.tags}
                          categories={details.categories}
                          relatedContentIds={details.relatedContentIds}
                          sources={details.sources}
                          dynamicData={details.dataValue}
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
