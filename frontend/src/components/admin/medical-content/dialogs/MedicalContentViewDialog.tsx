import * as Dialog from "@radix-ui/react-dialog";
import { ChevronDown, ChevronUp, Loader2, ShieldAlert, X } from "lucide-react";
import { useAdminContentById } from "@/hooks/admin/content/useAdminContent";
import MedicalContentGovernancePanel, {
  ReleaseAcceptanceSection,
} from "@/components/admin/medical-content/MedicalContentGovernancePanel";
import MedicalContentPatientPreview from "@/components/admin/medical-content/MedicalContentPatientPreview";
import {
  buildReleaseAcceptanceFromDetails,
  hasMeaningfulContentBlocks,
  type WorkflowActorRole,
} from "@/components/admin/medical-content/releaseAcceptanceMatrix";
import type {
  AdminContentStatus,
  AdminContentType,
} from "@/lib/admin/types";
import {
  extractMedicalContentDetails,
  formatDate,
  getReviewReadinessIssueCodes,
  getReviewReadinessIssueMessage,
  hasSeekHelpCallout,
  toDisplayText,
  toPrettyJson,
} from "./medicalContentDialogHelpers";
import { useI18n } from "@/i18n/provider";
import { useMemo, useState, type ReactNode } from "react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentId: string | null;
  /** OpenAPI workflow actor for acceptance next-actions. */
  workflowRole?: WorkflowActorRole;
};

type Translate = (key: string, fallback?: string) => string;

function typeLabel(type: AdminContentType, t: Translate) {
  if (type === "CONDITION") return t("viewContentDialog.type.condition");
  if (type === "SYMPTOM") return t("viewContentDialog.type.symptom");
  if (type === "GENERAL_ADVICE") return t("viewContentDialog.type.generalAdvice");
  if (type === "NEWS") return t("viewContentDialog.type.news");
  if (type === "MEDICATION") return t("viewContentDialog.type.medication");
  if (type === "SETTINGS_PAGE") return t("viewContentDialog.type.settingsPage");
  return t("viewContentDialog.type.general");
}

function statusLabel(status: AdminContentStatus, t: Translate) {
  if (status === "PUBLISHED") return t("viewContentDialog.status.published");
  if (status === "IN_REVIEW") return t("viewContentDialog.status.inReview");
  if (status === "ARCHIVED") return t("viewContentDialog.status.archived");
  return t("viewContentDialog.status.draft");
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

/**
 * Collapsed-by-default wrapper for developer/diagnostic data (raw records,
 * Mongo IDs, unstructured JSON) that shouldn't be part of the normal
 * editorial view. Addresses the medical-content audit's P1 finding that
 * these views exposed raw database internals to every admin/data_entry
 * viewer by default — this keeps the data reachable for support/debugging
 * without it being the first thing an editor sees.
 */
function AdvancedDiagnosticsSection({
  title,
  badge,
  children,
}: {
  title: string;
  badge: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-[14px] border border-[#E4E7EC] bg-white p-4">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 text-start"
        aria-expanded={open}
      >
        <div className="inline-flex items-center gap-2 font-cairo text-[13px] font-extrabold text-[#98A2B3]">
          <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden />
          {title}
          <span className="rounded-full bg-[#F2F4F7] px-2 py-0.5 font-cairo text-[10px] font-bold text-[#667085]">
            {badge}
          </span>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-[#98A2B3]" />
        ) : (
          <ChevronDown className="h-4 w-4 text-[#98A2B3]" />
        )}
      </button>
      {open ? <div className="mt-4">{children}</div> : null}
    </div>
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
  workflowRole = "admin",
}: Props) {
  const { locale, dir, t } = useI18n();
  const detailsQuery = useAdminContentById(open ? contentId : null);
  const details = extractMedicalContentDetails(detailsQuery.data);
  const news = details?.news ?? null;
  const template = details?.template ?? null;
  const previewLanguage = details?.language === "en" ? "en" : "ar";
  const acceptanceSnapshot = useMemo(
    () => buildReleaseAcceptanceFromDetails(details, workflowRole),
    [details, workflowRole],
  );
  const previewWarnings = details
    ? getReviewReadinessIssueCodes(details).map((code) =>
        getReviewReadinessIssueMessage(code, previewLanguage),
      )
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
                {t("viewContentDialog.title")}
              </Dialog.Title>
              <Dialog.Description className="font-cairo text-[12px] font-semibold text-[#98A2B3]">
                {t("viewContentDialog.description")}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-[10px] text-[#667085] hover:bg-[#F2F4F7]"
                aria-label={t("viewContentDialog.close")}
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="max-h-[78vh] overflow-y-auto px-6 py-5">
            {detailsQuery.isAwaitingData ? (
              <div className="flex items-center justify-center gap-2 py-16 font-cairo text-[13px] font-bold text-[#667085]">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("viewContentDialog.loading")}
              </div>
            ) : detailsQuery.isError ? (
              <div className="rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 font-cairo text-[13px] font-bold text-[#B42318]">
                {t("viewContentDialog.loadError")}
              </div>
            ) : !details ? (
              <div className="rounded-[12px] border border-[#F2F4F7] bg-[#FCFCFD] px-4 py-3 font-cairo text-[13px] font-bold text-[#667085]">
                {t("viewContentDialog.noDetails")}
              </div>
            ) : (
              <div className="space-y-5">
                <div className="rounded-[14px] border border-[#E4E7EC] bg-[#F9FAFB] p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-cairo text-[20px] font-black text-[#111827]">
                      {toDisplayText(details.title) || t("viewContentDialog.emptyValue")}
                    </span>
                    <span
                      className={`inline-flex h-[24px] items-center rounded-[8px] border px-3 font-cairo text-[11px] font-extrabold ${statusTone(details.status)}`}
                    >
                      {statusLabel(details.status, t)}
                    </span>
                    <span className="inline-flex h-[24px] items-center rounded-[8px] border border-[#E4E7EC] bg-white px-3 font-cairo text-[11px] font-extrabold text-[#475467]">
                      {typeLabel(details.type, t)}
                    </span>
                  </div>

                  {details.summary ? (
                    <div className="mt-3 font-cairo text-[14px] leading-7 text-[#344054]">
                      {details.summary}
                    </div>
                  ) : null}

                  <div className="mt-3 grid grid-cols-1 gap-2 text-[12px] sm:grid-cols-2">
                    <MetaRow
                      label={t("viewContentDialog.field.language")}
                      value={details.language || t("viewContentDialog.emptyValue")}
                    />
                    <MetaRow
                      label={t("viewContentDialog.field.views")}
                      value={Number(
                        details.viewCount ?? details.views ?? 0,
                      ).toLocaleString(locale === "en" ? "en-US" : "ar-SA")}
                    />
                    <MetaRow label={t("viewContentDialog.field.slug")} value={details.slug} mono />
                    <MetaRow
                      label={t("viewContentDialog.field.updatedAt")}
                      value={formatDate(details.updatedAt)}
                    />
                    <MetaRow
                      label={t("viewContentDialog.field.publishedAt")}
                      value={formatDate(details.publishedAt)}
                    />
                    <MetaRow
                      label={t("viewContentDialog.field.pageVersion")}
                      value={details.pageVersion}
                    />
                    <MetaRow
                      label={t("viewContentDialog.field.disclaimerVersion")}
                      value={
                        details.disclaimerVersion
                          ? String(details.disclaimerVersion)
                          : null
                      }
                    />
                    <MetaRow
                      label={t("viewContentDialog.field.coverImage")}
                      value={details.coverImage}
                      mono
                    />
                  </div>

                  {details.rejectionReason ? (
                    <div className="mt-3 rounded-[10px] border border-[#FECACA] bg-[#FEF2F2] px-3 py-2">
                      <div className="font-cairo text-[12px] font-extrabold text-[#991B1B]">
                        {t("viewContentDialog.rejectionReason")}
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
                        {t("viewContentDialog.section.patientPreview")}
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

                    {Array.isArray(template?.fields) && template.fields.length ? (
                      <div className="rounded-[14px] border border-[#E4E7EC] bg-white p-4">
                        <div className="font-cairo text-[15px] font-extrabold text-[#111827]">
                          {t("viewContentDialog.section.templateInfo")}
                        </div>
                        <div className="mt-3 grid grid-cols-1 gap-2 text-[12px] sm:grid-cols-2">
                          <MetaRow
                            label={t("viewContentDialog.field.templateName")}
                            value={toDisplayText(template?.name)}
                          />
                          <MetaRow
                            label={t("viewContentDialog.field.templateType")}
                            value={toDisplayText(template?.parentType)}
                          />
                          <MetaRow
                            label={t("viewContentDialog.field.templateStatus")}
                            value={toDisplayText(template?.status)}
                          />
                          <MetaRow
                            label={t("viewContentDialog.field.templateFieldCount")}
                            value={String(template.fields.length)}
                          />
                        </div>
                      </div>
                    ) : null}

                    <AdvancedDiagnosticsSection
                      title={t("viewContentDialog.section.dynamicDataJson")}
                      badge={t("viewContentDialog.diagnosticBadge")}
                    >
                      <JsonPreview
                        value={details.dataValue}
                        emptyLabel={t("viewContentDialog.dynamicData.empty")}
                      />
                    </AdvancedDiagnosticsSection>

                    <AdvancedDiagnosticsSection
                      title={t("viewContentDialog.section.rawTemplateJson")}
                      badge={t("viewContentDialog.diagnosticBadge")}
                    >
                      <MetaRow
                        label={t("viewContentDialog.field.templateId")}
                        value={details.templateId}
                        mono
                      />
                      <div className="mt-3">
                        <JsonPreview
                          value={template}
                          emptyLabel={t("viewContentDialog.rawTemplate.empty")}
                        />
                      </div>
                    </AdvancedDiagnosticsSection>
                  </div>

                  <div className="space-y-5">
                    <div className="rounded-[14px] border border-[#E4E7EC] bg-white p-4">
                      <div className="font-cairo text-[15px] font-extrabold text-[#111827]">
                        {t("viewContentDialog.section.governanceSafety")}
                      </div>
                      <div className="mt-4">
                        <MedicalContentGovernancePanel
                          contentType={details.type}
                          status={details.status}
                          disclaimerVersion={toDisplayText(details.disclaimerVersion)}
                          requiresSeekHelpBlock={hasSeekHelpCallout(details.contentBlocks)}
                          isFeatured={details.isFeatured}
                          riskFlags={details.riskFlags ?? []}
                          tags={details.tags ?? []}
                          categories={details.categories ?? []}
                          relatedContentIds={details.relatedContentIds ?? []}
                          sources={details.sources ?? []}
                          dynamicData={details.dataValue}
                          hasMeaningfulBlocks={
                            details.type === "SETTINGS_PAGE" ||
                            hasMeaningfulContentBlocks(details.contentBlocks)
                          }
                          role={workflowRole}
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

                    <AdvancedDiagnosticsSection
                      title={t("viewContentDialog.section.rawRecord")}
                      badge={t("viewContentDialog.diagnosticBadge")}
                    >
                      <JsonPreview value={details.rawItem} />
                    </AdvancedDiagnosticsSection>
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
