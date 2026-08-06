"use client";

import { AlertTriangle, ExternalLink, FileText, Link2, ShieldCheck, Tag } from "lucide-react";
import {
  formatBoolean,
  formatDate,
  toDisplayText,
  toPrettyJson,
} from "./dialogs/medicalContentDialogHelpers";
import type { AdminContentStatus, AdminContentType } from "@/lib/admin/types";
import {
  acceptanceStatusLabel,
  buildReleaseAcceptanceSnapshot,
  localizeAcceptanceCopy,
  type ReleaseAcceptanceSnapshot,
  type WorkflowActorRole,
} from "./releaseAcceptanceMatrix";

type SourceItem = {
  title?: string;
  url?: string;
};

type NewsSummary = {
  sourceName?: string;
  sourceUrl?: string;
  originalTitle?: string;
  publishedAt?: string;
  aiSummary?: string;
};

type Props = {
  contentType?: AdminContentType;
  status?: AdminContentStatus;
  disclaimerVersion?: string;
  requiresSeekHelpBlock?: boolean;
  isFeatured?: boolean;
  riskFlags: string[];
  tags: string[];
  categories: string[];
  relatedContentIds: string[];
  sources: SourceItem[];
  news?: NewsSummary | null;
  dynamicData?: unknown;
  invalidDynamicData?: boolean;
  hasMeaningfulBlocks?: boolean;
  role?: WorkflowActorRole;
  language?: "ar" | "en";
  showAcceptanceMatrix?: boolean;
};

function checkToneClass(status: ReleaseAcceptanceSnapshot["checks"][number]["status"]) {
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

export function ReleaseAcceptanceSection({
  snapshot,
  language = "ar",
  compact = false,
  showNextActions = true,
}: {
  snapshot: ReleaseAcceptanceSnapshot;
  language?: "ar" | "en";
  compact?: boolean;
  showNextActions?: boolean;
}) {
  const title =
    language === "en" ? "Release acceptance" : "جاهزية الإطلاق";
  const scenario = localizeAcceptanceCopy(snapshot.scenarioLabel, language);
  const browsingNote = localizeAcceptanceCopy(snapshot.browsingNote, language);
  const visibleChecks = compact
    ? snapshot.checks.filter((item) => item.status !== "na").slice(0, 4)
    : snapshot.checks;

  return (
    <div
      className={
        compact
          ? "rounded-[12px] border border-[#D1E9FF] bg-[#F5FAFF] p-3"
          : "rounded-[14px] border border-[#E4E7EC] bg-white p-4"
      }
    >
      <div className="inline-flex items-center gap-2 font-cairo text-[13px] font-extrabold text-[#111827]">
        <ShieldCheck className="h-4 w-4 text-primary" />
        {title}
      </div>
      <div className="mt-2 font-cairo text-[12px] font-bold text-[#475467]">
        <span className="font-mono text-[11px] text-[#175CD3]">{snapshot.scenarioKey}</span>
        {" · "}
        {scenario}
      </div>
      <div
        className={`mt-2 rounded-[10px] border px-3 py-2 font-cairo text-[12px] font-bold ${checkToneClass(snapshot.overall)}`}
      >
        {acceptanceStatusLabel(snapshot.overall, language)}
        {language === "en" ? " · overall" : " · الإجمالي"}
      </div>
      <div className="mt-2 rounded-[10px] border border-[#D1E9FF] bg-white/70 px-3 py-2 font-cairo text-[11px] font-semibold text-[#175CD3]">
        {browsingNote}
      </div>
      <div className={compact ? "mt-3 space-y-1.5" : "mt-4 space-y-2"}>
        {visibleChecks.map((item) => (
          <div
            key={item.key}
            className={`rounded-[10px] border px-3 py-2 font-cairo text-[12px] font-bold ${checkToneClass(item.status)}`}
          >
            {acceptanceStatusLabel(item.status, language)}:{" "}
            {localizeAcceptanceCopy(item.label, language)}
          </div>
        ))}
      </div>
      {showNextActions ? (
        <div className="mt-3 space-y-1.5">
          <div className="font-cairo text-[11px] font-extrabold text-[#667085]">
            {language === "en" ? "Next allowed actions" : "الإجراءات التالية المسموحة"}
          </div>
          {snapshot.nextActions.length ? (
            <div className="flex flex-wrap gap-2">
              {snapshot.nextActions.map((action) => (
                <span
                  key={action.action}
                  className="inline-flex items-center rounded-[999px] border border-[#D0D5DD] bg-[#F9FAFB] px-3 py-1 font-cairo text-[11px] font-bold text-[#475467]"
                >
                  {localizeAcceptanceCopy(action.label, language)}
                </span>
              ))}
            </div>
          ) : (
            <div className="rounded-[10px] border border-[#E4E7EC] bg-[#F9FAFB] px-3 py-2 font-cairo text-[11px] font-semibold text-[#667085]">
              {language === "en"
                ? "No workflow actions available for this role at the current status (e.g. data entry waits while content is in review)."
                : "لا إجراءات متاحة لهذا الدور في الحالة الحالية (مثل انتظار data entry أثناء المراجعة)."}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function BadgeList({
  items,
  emptyLabel,
  tone = "neutral",
}: {
  items: string[];
  emptyLabel: string;
  tone?: "neutral" | "danger";
}) {
  if (!items.length) {
    return (
      <div className="rounded-[12px] border border-dashed border-[#D0D5DD] bg-[#FCFCFD] px-3 py-2 font-cairo text-[12px] text-[#667085]">
        {emptyLabel}
      </div>
    );
  }

  const cls =
    tone === "danger"
      ? "border-[#FECACA] bg-[#FEF2F2] text-[#B42318]"
      : "border-[#D0D5DD] bg-[#F9FAFB] text-[#475467]";

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className={`inline-flex items-center rounded-[999px] border px-3 py-1 font-cairo text-[12px] font-bold ${cls}`}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function summarizeValue(value: unknown): string {
  if (value == null) return "—";
  if (typeof value === "string") return value || "—";
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  if (Array.isArray(value)) return `${value.length} عنصر`;
  if (typeof value === "object") {
    return `${Object.keys(value as Record<string, unknown>).length} حقول`;
  }
  return "—";
}

function DynamicDataSummary({
  dynamicData,
  invalidDynamicData,
}: Pick<Props, "dynamicData" | "invalidDynamicData">) {
  if (invalidDynamicData) {
    return (
      <div className="rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 font-cairo text-[12px] font-bold text-[#B42318]">
        تعذّر قراءة JSON الخاص بالبيانات الديناميكية، لذلك تظهر هذه المنطقة كمرجع فقط.
      </div>
    );
  }

  if (!dynamicData) {
    return (
      <div className="rounded-[12px] border border-dashed border-[#D0D5DD] bg-[#FCFCFD] px-3 py-2 font-cairo text-[12px] text-[#667085]">
        لا توجد بيانات ديناميكية مرتبطة بهذا المحتوى.
      </div>
    );
  }

  if (
    typeof dynamicData === "object" &&
    !Array.isArray(dynamicData) &&
    Object.keys(dynamicData as Record<string, unknown>).length
  ) {
    const entries = Object.entries(dynamicData as Record<string, unknown>).slice(0, 8);
    return (
      <div className="space-y-2">
        {entries.map(([key, value]) => (
          <div
            key={key}
            className="flex items-start justify-between gap-3 rounded-[12px] border border-[#EAECF0] bg-white px-3 py-2"
          >
            <div className="font-mono text-[11px] text-[#667085]">{key}</div>
            <div className="max-w-[70%] text-left font-cairo text-[12px] font-bold text-[#111827]">
              {summarizeValue(value)}
            </div>
          </div>
        ))}
        {Object.keys(dynamicData as Record<string, unknown>).length > entries.length ? (
          <div className="font-cairo text-[11px] font-semibold text-[#667085]">
            + عناصر إضافية في السجل الخام.
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <pre className="overflow-x-auto rounded-[12px] bg-[#0F172A] p-3 text-left font-mono text-[11px] leading-6 text-[#E2E8F0]">
      {toPrettyJson(dynamicData)}
    </pre>
  );
}

export default function MedicalContentGovernancePanel({
  contentType,
  status = "DRAFT",
  disclaimerVersion,
  requiresSeekHelpBlock,
  isFeatured,
  riskFlags,
  tags,
  categories,
  relatedContentIds,
  sources,
  news,
  dynamicData,
  invalidDynamicData,
  hasMeaningfulBlocks,
  role = "admin",
  language = "ar",
  showAcceptanceMatrix = true,
}: Props) {
  const sourceCount = sources.filter((source) => source.title || source.url).length;
  const requiresSeekHelpByType =
    contentType === "CONDITION" || contentType === "SYMPTOM";
  const hasDisclaimerVersion = Boolean(toDisplayText(disclaimerVersion).trim());
  const governanceChecklist = [
    {
      key: "sources",
      label: "إضافة مصدر واحد موثوق على الأقل",
      done: contentType === "SETTINGS_PAGE" || sourceCount > 0,
    },
    {
      key: "disclaimerVersion",
      label: "تحديد إصدار التنبيه الطبي (Disclaimer Version)",
      done: contentType === "SETTINGS_PAGE" || hasDisclaimerVersion,
    },
    {
      key: "seekHelp",
      label: "تفعيل Seek Help Block لأن النوع حالة/عرض",
      done: !requiresSeekHelpByType || requiresSeekHelpBlock === true,
    },
  ];
  const hasNews = Boolean(
    news &&
      [
        news.sourceName,
        news.sourceUrl,
        news.originalTitle,
        news.publishedAt,
        news.aiSummary,
      ].some((value) => Boolean(toDisplayText(value).trim())),
  );
  const newsSourceUrl = toDisplayText(news?.sourceUrl).trim();
  const newsPublishedAt = toDisplayText(news?.publishedAt).trim();
  const newsChecklist =
    contentType === "NEWS"
      ? [
          {
            key: "newsSourceUrl",
            label: "وجود رابط المصدر للخبر (news.sourceUrl)",
            done: newsSourceUrl.length > 0,
          },
          {
            key: "newsPublishedAt",
            label: "تحديد تاريخ نشر الخبر الأصلي (news.publishedAt)",
            done: newsPublishedAt.length > 0,
          },
        ]
      : [];
  const readinessChecklist = [...governanceChecklist, ...newsChecklist];
  const missingChecklistItems = readinessChecklist.filter((item) => !item.done);
  const acceptanceSnapshot =
    showAcceptanceMatrix && contentType
      ? buildReleaseAcceptanceSnapshot({
          type: contentType,
          status,
          sourceCount,
          disclaimerVersion,
          requiresSeekHelpBlock,
          hasMeaningfulBlocks:
            hasMeaningfulBlocks ??
            (contentType === "SETTINGS_PAGE" ? true : undefined),
          newsSourceUrl,
          newsPublishedAt,
          role,
        })
      : null;

  return (
    <div className="space-y-5">
      {acceptanceSnapshot ? (
        <ReleaseAcceptanceSection
          snapshot={acceptanceSnapshot}
          language={language}
          showNextActions={role === "admin" || status === "DRAFT" || status === "IN_REVIEW"}
        />
      ) : null}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-[14px] border border-[#D0D5DD] bg-[#F8FAFC] p-4">
          <div className="inline-flex items-center gap-2 font-cairo text-[13px] font-extrabold text-[#111827]">
            <ShieldCheck className="h-4 w-4 text-primary" />
            حالة السلامة
          </div>
          <div className="mt-3 space-y-2 font-cairo text-[12px] text-[#475467]">
            <div>إصدار التنبيه: <span className="font-bold text-[#111827]">{disclaimerVersion || "غير محدد"}</span></div>
            <div>يتطلب Seek Help Block: <span className="font-bold text-[#111827]">{formatBoolean(requiresSeekHelpBlock)}</span></div>
            <div>محتوى مميز: <span className="font-bold text-[#111827]">{formatBoolean(isFeatured)}</span></div>
          </div>
        </div>

        <div className="rounded-[14px] border border-[#D0D5DD] bg-[#FFF7ED] p-4">
          <div className="inline-flex items-center gap-2 font-cairo text-[13px] font-extrabold text-[#111827]">
            <AlertTriangle className="h-4 w-4 text-[#EA580C]" />
            إشارات المخاطر
          </div>
          <div className="mt-3 font-cairo text-[12px] text-[#475467]">
            {riskFlags.length ? `${riskFlags.length} علامة خطر` : "لا توجد علامات خطر مسجلة"}
          </div>
          <div className="mt-3">
            <BadgeList items={riskFlags} emptyLabel="لا توجد علامات خطر." tone="danger" />
          </div>
        </div>
      </div>

      <div className="rounded-[14px] border border-[#E4E7EC] bg-white p-4">
        <div className="inline-flex items-center gap-2 font-cairo text-[14px] font-extrabold text-[#111827]">
          <Tag className="h-4 w-4 text-primary" />
          التصنيف والربط
        </div>
        <div className="mt-4 space-y-4">
          <div>
            <div className="mb-2 font-cairo text-[12px] font-extrabold text-[#111827]">الوسوم</div>
            <BadgeList items={tags} emptyLabel="لا توجد وسوم." />
          </div>
          <div>
            <div className="mb-2 font-cairo text-[12px] font-extrabold text-[#111827]">الفئات</div>
            <BadgeList items={categories} emptyLabel="لا توجد فئات." />
          </div>
          <div>
            <div className="mb-2 inline-flex items-center gap-2 font-cairo text-[12px] font-extrabold text-[#111827]">
              <Link2 className="h-3.5 w-3.5 text-[#667085]" />
              المحتوى المرتبط
            </div>
            <BadgeList items={relatedContentIds} emptyLabel="لا توجد معرفات محتوى مرتبطة." />
          </div>
        </div>
      </div>

      <div className="rounded-[14px] border border-[#E4E7EC] bg-white p-4">
        <div className="inline-flex items-center gap-2 font-cairo text-[14px] font-extrabold text-[#111827]">
          <ShieldCheck className="h-4 w-4 text-primary" />
          قائمة جاهزية الحوكمة قبل المراجعة
        </div>
        <div
          className={
            missingChecklistItems.length
              ? "mt-3 rounded-[10px] border border-amber-200 bg-amber-50 px-3 py-2 font-cairo text-[12px] font-bold text-amber-700"
              : "mt-3 rounded-[10px] border border-emerald-200 bg-emerald-50 px-3 py-2 font-cairo text-[12px] font-bold text-emerald-700"
          }
        >
          {missingChecklistItems.length
            ? `تحذير جاهزية: ${missingChecklistItems.length} متطلبات غير مكتملة قبل إرسال المراجعة.`
            : "جاهز للمراجعة: تم استكمال مؤشرات الحوكمة الأساسية."}
        </div>
        <div className="mt-2 rounded-[10px] border border-[#D1E9FF] bg-[#F5FAFF] px-3 py-2 font-cairo text-[12px] font-bold text-[#175CD3]">
          هذه إشارات تنبيهية فقط ولا تمنع عرض أو تصفح السجل. الإيقاف يتم عند محاولة
          "إرسال للمراجعة" فقط.
        </div>
        <div className="mt-4 space-y-2">
          {readinessChecklist.map((item) => (
            <div
              key={item.key}
              className={
                item.done
                  ? "rounded-[10px] border border-emerald-200 bg-emerald-50 px-3 py-2 font-cairo text-[12px] font-bold text-emerald-700"
                  : "rounded-[10px] border border-amber-200 bg-amber-50 px-3 py-2 font-cairo text-[12px] font-bold text-amber-700"
              }
            >
              {item.done ? "مكتمل" : "بحاجة لاستكمال"}: {item.label}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[14px] border border-[#E4E7EC] bg-white p-4">
        <div className="inline-flex items-center gap-2 font-cairo text-[14px] font-extrabold text-[#111827]">
          <FileText className="h-4 w-4 text-primary" />
          المصادر والمرجعيات
        </div>
        <div className="mt-2 font-cairo text-[12px] text-[#667085]">
          {sourceCount ? `${sourceCount} مصدر ظاهر للمراجعة` : "لا توجد مصادر مضافة بعد."}
        </div>
        <div className="mt-4 space-y-3">
          {sourceCount ? (
            sources.map((source, index) => (
              <div
                key={`${source.title || source.url || "source"}-${index}`}
                className="rounded-[12px] border border-[#EAECF0] bg-[#F9FAFB] px-3 py-3"
              >
                <div className="font-cairo text-[12px] font-extrabold text-[#111827]">
                  {source.title || "مصدر بدون عنوان"}
                </div>
                {source.url ? (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-1 font-cairo text-[12px] font-bold text-primary hover:underline"
                  >
                    {source.url}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <div className="mt-1 font-cairo text-[12px] text-[#667085]">لا يوجد رابط مباشر.</div>
                )}
              </div>
            ))
          ) : (
            <div className="rounded-[12px] border border-dashed border-[#D0D5DD] bg-[#FCFCFD] px-3 py-2 font-cairo text-[12px] text-[#667085]">
              أضف مصادر موثوقة قبل الاعتماد أو النشر.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-[14px] border border-[#E4E7EC] bg-white p-4">
        <div className="font-cairo text-[14px] font-extrabold text-[#111827]">البيانات الديناميكية</div>
        <div className="mt-4">
          <DynamicDataSummary dynamicData={dynamicData} invalidDynamicData={invalidDynamicData} />
        </div>
      </div>

      <div className="rounded-[14px] border border-[#E4E7EC] bg-white p-4">
        <div className="font-cairo text-[14px] font-extrabold text-[#111827]">ملخص الخبر</div>
        {hasNews ? (
          <div className="mt-4 space-y-2 font-cairo text-[12px] text-[#475467]">
            <div>اسم المصدر: <span className="font-bold text-[#111827]">{toDisplayText(news?.sourceName) || "—"}</span></div>
            <div>العنوان الأصلي: <span className="font-bold text-[#111827]">{toDisplayText(news?.originalTitle) || "—"}</span></div>
            <div>تاريخ النشر الأصلي: <span className="font-bold text-[#111827]">{formatDate(toDisplayText(news?.publishedAt))}</span></div>
            {toDisplayText(news?.sourceUrl) ? (
              <a
                href={toDisplayText(news?.sourceUrl)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-cairo text-[12px] font-bold text-primary hover:underline"
              >
                {toDisplayText(news?.sourceUrl)}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : null}
            {toDisplayText(news?.aiSummary) ? (
              <div className="rounded-[12px] bg-[#F9FAFB] px-3 py-2 text-[12px] leading-6 text-[#344054]">
                {toDisplayText(news?.aiSummary)}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="mt-3 rounded-[12px] border border-dashed border-[#D0D5DD] bg-[#FCFCFD] px-3 py-2 font-cairo text-[12px] text-[#667085]">
            لا توجد بيانات خبر إضافية لهذا السجل.
          </div>
        )}
      </div>
    </div>
  );
}
