import type {
  AdminContentBlock,
  AdminContentDetailsItem,
  AdminContentStatus,
  AdminContentType,
} from "@/lib/admin/types";
import {
  normalizeStatus,
  normalizeType,
  toDisplayText,
  toReleaseAcceptanceFields,
} from "./dialogs/medicalContentDialogHelpers";

export type AcceptanceCheckStatus = "pass" | "fail" | "warn" | "na";

export type AcceptanceScenarioKey =
  | "draft_prep"
  | "in_review_gate"
  | "published_info"
  | "archived_info";

export type WorkflowActionKey =
  | "submit-review"
  | "approve"
  | "reject"
  | "publish"
  | "archive";

export type WorkflowActorRole = "admin" | "data_entry";

export type LocalizedCopy = { ar: string; en: string };

export type AcceptanceCheckItem = {
  key: string;
  status: AcceptanceCheckStatus;
  label: LocalizedCopy;
};

export type WorkflowActionCue = {
  action: WorkflowActionKey;
  roles: WorkflowActorRole[];
  label: LocalizedCopy;
};

export type TypeAcceptanceRules = {
  requiresSources: boolean;
  requiresDisclaimer: boolean;
  requiresSeekHelp: boolean;
  requiresNewsFields: boolean;
  requiresContentBlocks: boolean;
};

export type ReleaseAcceptanceInput = {
  type: AdminContentType;
  status: AdminContentStatus;
  sourceCount?: number;
  disclaimerVersion?: string;
  requiresSeekHelpBlock?: boolean;
  hasMeaningfulBlocks?: boolean;
  newsSourceUrl?: string;
  newsPublishedAt?: string;
  role?: WorkflowActorRole;
};

export type ReleaseAcceptanceSnapshot = {
  scenarioKey: AcceptanceScenarioKey;
  scenarioLabel: LocalizedCopy;
  overall: AcceptanceCheckStatus;
  checks: AcceptanceCheckItem[];
  nextActions: WorkflowActionCue[];
  browsingNote: LocalizedCopy;
  typeRules: TypeAcceptanceRules;
};

/** OpenAPI content types for admin content. */
export const RELEASE_CONTENT_TYPES: readonly AdminContentType[] = [
  "CONDITION",
  "SYMPTOM",
  "MEDICATION",
  "GENERAL_ADVICE",
  "NEWS",
  "SETTINGS_PAGE",
] as const;

/** OpenAPI content statuses for admin content. */
export const RELEASE_CONTENT_STATUSES: readonly AdminContentStatus[] = [
  "DRAFT",
  "IN_REVIEW",
  "PUBLISHED",
  "ARCHIVED",
] as const;

/** Mine list statuses (OpenAPI `/api/admin/content/mine` query enum). */
export const MINE_WORKFLOW_STATUSES: readonly AdminContentStatus[] = [
  "DRAFT",
  "IN_REVIEW",
] as const;

const SCENARIO_LABELS: Record<AcceptanceScenarioKey, LocalizedCopy> = {
  draft_prep: {
    ar: "تحضير المسودة قبل المراجعة",
    en: "Draft preparation before review",
  },
  in_review_gate: {
    ar: "بوابة الاعتماد قبل الموافقة/النشر",
    en: "Approval gate before approve/publish",
  },
  published_info: {
    ar: "محتوى منشور — معلومات فقط",
    en: "Published content — informational only",
  },
  archived_info: {
    ar: "محتوى مؤرشف — معلومات فقط",
    en: "Archived content — informational only",
  },
};

const BROWSING_NOTE: LocalizedCopy = {
  ar: "هذه إشارات جاهزية فقط ولا تمنع التصفح. الإيقاف يتم عند إرسال للمراجعة فقط.",
  en: "Informational readiness only — browsing stays open. Blocking applies on submit-review only.",
};

function pickLocale(copy: LocalizedCopy, language: "ar" | "en"): string {
  return language === "en" ? copy.en : copy.ar;
}

export function getTypeAcceptanceRules(
  type: AdminContentType,
): TypeAcceptanceRules {
  const normalized = normalizeType(type);
  const isSettings = normalized === "SETTINGS_PAGE";
  return {
    requiresSources: !isSettings,
    requiresDisclaimer: !isSettings,
    requiresSeekHelp:
      normalized === "CONDITION" || normalized === "SYMPTOM",
    requiresNewsFields: normalized === "NEWS",
    requiresContentBlocks: !isSettings,
  };
}

export function getAcceptanceScenarioKey(
  status: AdminContentStatus,
): AcceptanceScenarioKey {
  if (status === "IN_REVIEW") return "in_review_gate";
  if (status === "PUBLISHED") return "published_info";
  if (status === "ARCHIVED") return "archived_info";
  return "draft_prep";
}

export function getNextWorkflowActions(
  status: AdminContentStatus,
  role: WorkflowActorRole = "admin",
): WorkflowActionCue[] {
  if (status === "DRAFT") {
    return [
      {
        action: "submit-review" as const,
        roles: ["admin", "data_entry"] as WorkflowActorRole[],
        label: {
          ar: "إرسال للمراجعة (admin / data_entry)",
          en: "Submit for review (admin / data_entry)",
        },
      },
    ].filter((cue) => cue.roles.includes(role));
  }

  if (status === "IN_REVIEW") {
    // OpenAPI: approve / reject / publish are admin-only.
    if (role === "data_entry") return [];
    return [
      {
        action: "approve",
        roles: ["admin"],
        label: { ar: "موافقة (admin)", en: "Approve (admin)" },
      },
      {
        action: "reject",
        roles: ["admin"],
        label: { ar: "رفض (admin)", en: "Reject (admin)" },
      },
      {
        action: "publish",
        roles: ["admin"],
        label: { ar: "نشر (admin)", en: "Publish (admin)" },
      },
    ];
  }

  if (status === "PUBLISHED") {
    if (role !== "admin") return [];
    return [
      {
        action: "archive",
        roles: ["admin"],
        label: { ar: "أرشفة (admin)", en: "Archive (admin)" },
      },
    ];
  }

  // ARCHIVED: informational only — no active workflow actions.
  return [];
}

function checkStatus(
  applicable: boolean,
  done: boolean,
  draftMode: boolean,
): AcceptanceCheckStatus {
  if (!applicable) return "na";
  if (done) return "pass";
  return draftMode ? "warn" : "fail";
}

function buildTypeChecks(
  input: ReleaseAcceptanceInput,
  draftMode: boolean,
): AcceptanceCheckItem[] {
  const rules = getTypeAcceptanceRules(input.type);
  const sourceCount = input.sourceCount ?? 0;
  const disclaimer = toDisplayText(input.disclaimerVersion).trim();
  const newsUrl = toDisplayText(input.newsSourceUrl).trim();
  const newsPublishedAt = toDisplayText(input.newsPublishedAt).trim();
  const hasBlocks = input.hasMeaningfulBlocks === true;

  const checks: AcceptanceCheckItem[] = [
    {
      key: "content_blocks",
      status: checkStatus(rules.requiresContentBlocks, hasBlocks, draftMode),
      label: {
        ar: "وجود بلوك محتوى فعلي واحد على الأقل",
        en: "At least one meaningful content block",
      },
    },
    {
      key: "sources",
      status: checkStatus(rules.requiresSources, sourceCount > 0, draftMode),
      label: {
        ar: "إرفاق مصدر موثوق واحد على الأقل",
        en: "Attach at least one trusted source",
      },
    },
    {
      key: "disclaimer",
      status: checkStatus(
        rules.requiresDisclaimer,
        Boolean(disclaimer),
        draftMode,
      ),
      label: {
        ar: "تحديد إصدار التنبيه الطبي",
        en: "Set disclaimer version",
      },
    },
    {
      key: "seek_help",
      status: checkStatus(
        rules.requiresSeekHelp,
        input.requiresSeekHelpBlock === true,
        draftMode,
      ),
      label: {
        ar: "تفعيل Seek Help للحالات/الأعراض",
        en: "Enable Seek Help for CONDITION/SYMPTOM",
      },
    },
    {
      key: "news_source_url",
      status: checkStatus(
        rules.requiresNewsFields,
        Boolean(newsUrl),
        draftMode,
      ),
      label: {
        ar: "رابط مصدر الخبر (news.sourceUrl)",
        en: "News source URL (news.sourceUrl)",
      },
    },
    {
      key: "news_published_at",
      status: checkStatus(
        rules.requiresNewsFields,
        Boolean(newsPublishedAt),
        draftMode,
      ),
      label: {
        ar: "تاريخ نشر الخبر (news.publishedAt)",
        en: "News publishedAt (news.publishedAt)",
      },
    },
  ];

  if (!rules.requiresSources && !rules.requiresDisclaimer) {
    checks.push({
      key: "settings_exempt",
      status: "pass",
      label: {
        ar: "SETTINGS_PAGE: مصادر/تنبيه غير مطلوبة للمراجعة",
        en: "SETTINGS_PAGE: sources/disclaimer not required for review",
      },
    });
  }

  return checks;
}

function summarizeOverall(
  checks: AcceptanceCheckItem[],
  scenarioKey: AcceptanceScenarioKey,
): AcceptanceCheckStatus {
  if (scenarioKey === "published_info" || scenarioKey === "archived_info") {
    return "pass";
  }
  const actionable = checks.filter((c) => c.status !== "na");
  if (actionable.some((c) => c.status === "fail")) return "fail";
  if (actionable.some((c) => c.status === "warn")) return "warn";
  return "pass";
}

export function buildReleaseAcceptanceSnapshot(
  input: ReleaseAcceptanceInput,
): ReleaseAcceptanceSnapshot {
  const status = normalizeStatus(input.status);
  const type = normalizeType(input.type);
  const scenarioKey = getAcceptanceScenarioKey(status);
  const draftMode = scenarioKey === "draft_prep";
  const role = input.role ?? "admin";
  const typeRules = getTypeAcceptanceRules(type);

  let checks: AcceptanceCheckItem[];
  if (scenarioKey === "published_info" || scenarioKey === "archived_info") {
    checks = [
      {
        key: "lifecycle_info",
        status: "pass",
        label:
          scenarioKey === "published_info"
            ? {
                ar: "المنشور جاهز للعرض؛ الأرشفة اختيارية للإدارة",
                en: "Published item is live; archive is optional for admin",
              }
            : {
                ar: "المؤرشف للرجوع فقط دون إجراءات workflow نشطة",
                en: "Archived for reference with no active workflow actions",
              },
      },
    ];
  } else {
    checks = buildTypeChecks({ ...input, type, status }, draftMode);
  }

  return {
    scenarioKey,
    scenarioLabel: SCENARIO_LABELS[scenarioKey],
    overall: summarizeOverall(checks, scenarioKey),
    checks,
    nextActions: getNextWorkflowActions(status, role),
    browsingNote: BROWSING_NOTE,
    typeRules,
  };
}

export function hasMeaningfulContentBlocks(
  blocks: AdminContentBlock[] | null | undefined,
): boolean {
  if (!Array.isArray(blocks) || blocks.length === 0) return false;
  return blocks.some((block) => {
    if (!block || typeof block !== "object") return false;
    const type = toDisplayText((block as { type?: unknown }).type).trim();
    if (type === "divider") return true;
    if (type === "heading" || type === "paragraph") {
      return Boolean(toDisplayText((block as { text?: unknown }).text).trim());
    }
    if (type === "list") {
      const items = (block as { items?: unknown }).items;
      return (
        Array.isArray(items) &&
        items.some((entry) => toDisplayText(entry).trim())
      );
    }
    if (type === "callout") {
      return Boolean(
        toDisplayText((block as { text?: unknown }).text).trim() ||
          toDisplayText((block as { title?: unknown }).title).trim(),
      );
    }
    if (type === "linkCard") {
      return Boolean(
        toDisplayText((block as { url?: unknown }).url).trim() ||
          toDisplayText((block as { title?: unknown }).title).trim(),
      );
    }
    if (type === "faq") {
      const items = (block as { items?: unknown }).items;
      return (
        Array.isArray(items) &&
        items.some((entry) => {
          if (!entry || typeof entry !== "object") return false;
          const row = entry as { question?: unknown; answer?: unknown };
          return (
            Boolean(toDisplayText(row.question).trim()) ||
            Boolean(toDisplayText(row.answer).trim())
          );
        })
      );
    }
    return Object.keys(block).length > 1;
  });
}

export function buildReleaseAcceptanceFromDetails(
  item: AdminContentDetailsItem | null,
  role: WorkflowActorRole = "admin",
): ReleaseAcceptanceSnapshot | null {
  const fields = toReleaseAcceptanceFields(item);
  if (!fields || !item) return null;

  return buildReleaseAcceptanceSnapshot({
    type: fields.type,
    status: fields.status,
    sourceCount: fields.sourceCount,
    disclaimerVersion: fields.disclaimerVersion,
    requiresSeekHelpBlock: fields.requiresSeekHelpBlock,
    hasMeaningfulBlocks:
      fields.type === "SETTINGS_PAGE" ||
      hasMeaningfulContentBlocks(item.contentBlocks),
    newsSourceUrl: fields.newsSourceUrl,
    newsPublishedAt: fields.newsPublishedAt,
    role,
  });
}

/**
 * Full type × status catalog for release signoff / UI matrices.
 * Does not invent APIs — encodes OpenAPI types/statuses + local acceptance rules.
 */
export function listReleaseAcceptanceMatrixCatalog(
  role: WorkflowActorRole = "admin",
): Array<{
  type: AdminContentType;
  status: AdminContentStatus;
  scenarioKey: AcceptanceScenarioKey;
  rules: TypeAcceptanceRules;
  nextActions: WorkflowActionCue[];
}> {
  const rows: Array<{
    type: AdminContentType;
    status: AdminContentStatus;
    scenarioKey: AcceptanceScenarioKey;
    rules: TypeAcceptanceRules;
    nextActions: WorkflowActionCue[];
  }> = [];

  for (const type of RELEASE_CONTENT_TYPES) {
    for (const status of RELEASE_CONTENT_STATUSES) {
      rows.push({
        type,
        status,
        scenarioKey: getAcceptanceScenarioKey(status),
        rules: getTypeAcceptanceRules(type),
        nextActions: getNextWorkflowActions(status, role),
      });
    }
  }
  return rows;
}

export function isApprovePublishPathReady(
  snapshot: ReleaseAcceptanceSnapshot,
): boolean {
  return (
    snapshot.scenarioKey === "in_review_gate" && snapshot.overall === "pass"
  );
}

export function getIncompleteAcceptanceChecks(
  snapshot: ReleaseAcceptanceSnapshot,
): AcceptanceCheckItem[] {
  return snapshot.checks.filter(
    (check) => check.status === "fail" || check.status === "warn",
  );
}

export function localizeAcceptanceCopy(
  copy: LocalizedCopy,
  language: "ar" | "en" = "ar",
): string {
  return pickLocale(copy, language);
}

export function acceptanceStatusLabel(
  status: AcceptanceCheckStatus,
  language: "ar" | "en" = "ar",
): string {
  if (language === "en") {
    if (status === "pass") return "Pass";
    if (status === "fail") return "Fail";
    if (status === "warn") return "Warn";
    return "N/A";
  }
  if (status === "pass") return "مكتمل";
  if (status === "fail") return "غير مكتمل";
  if (status === "warn") return "تنبيه";
  return "غير منطبق";
}

export function getListAcceptanceScenarioChip(
  status: AdminContentStatus,
  language: "ar" | "en" = "ar",
): string {
  const key = getAcceptanceScenarioKey(normalizeStatus(status));
  const label = localizeAcceptanceCopy(SCENARIO_LABELS[key], language);
  return language === "en" ? `${key}: ${label}` : `${key} · ${label}`;
}
