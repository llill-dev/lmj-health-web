import { ApiError, getUserFacingRequestErrorMessage } from "@/lib/api";

export type TemporaryPatientFormField =
  | "fullName"
  | "email"
  | "phoneLocal"
  | "phoneDialCode";

/** أخطاء تُطبَّق عبر react-hook-form `setError` بعد فشل POST /doctors/patients/temp */
export type TemporaryPatientServerFieldMessages = Partial<
  Record<TemporaryPatientFormField, string>
>;

type TemporaryPatientValidationErrorRecord = {
  errors?: unknown;
  path?: unknown;
  param?: unknown;
  field?: unknown;
  property?: unknown;
  message?: unknown;
  msg?: unknown;
  details?: unknown;
  [key: string]: unknown;
};

function asTemporaryPatientValidationErrorRecord(
  value: unknown,
): TemporaryPatientValidationErrorRecord | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as TemporaryPatientValidationErrorRecord)
    : null;
}

function normalizeForMatch(raw: string): string {
  return raw.replace(/\s+/g, " ").trim().toLowerCase();
}

/** يستنتج حقولًا من مخطط أخطاء شائعة (مصفوفة errors أو كائن) */
function collectStructuredFieldTexts(
  body: TemporaryPatientValidationErrorRecord,
): Map<string, string> {
  const out = new Map<string, string>();
  const errs = body.errors;

  function push(leaf: string, msg: string) {
    const t = msg.trim();
    if (!t) return;
    const cur = out.get(leaf);
    if (!cur) out.set(leaf, t);
    else if (!cur.includes(t)) out.set(leaf, `${cur} ${t}`.trim());
  }

  if (errs == null) return out;

  if (typeof errs === "string") {
    push("_root", errs);
    return out;
  }

  if (Array.isArray(errs)) {
    for (const item of errs) {
      if (typeof item === "string") {
        push("_root", item);
        continue;
      }
      const o = asTemporaryPatientValidationErrorRecord(item);
      if (o) {
        let pathLeaf = "";
        const pathVal =
          o.path ??
          o.param ??
          o.field ??
          o.property;
        if (Array.isArray(pathVal))
          pathLeaf = pathVal[pathVal.length - 1]!.toString();
        else if (typeof pathVal === "string")
          pathLeaf = pathVal.split(/[.[\/]/).filter(Boolean).at(-1) ?? pathVal;

        const msg =
          (typeof o.message === "string" && o.message.trim()) ||
          (typeof o.msg === "string" && o.msg.trim()) ||
          "";
        const detail = typeof o.details === "string" ? o.details.trim() : "";
        const combined = [msg, detail].filter(Boolean).join(". ");
        push(pathLeaf ? pathLeaf.trim() : "_root", combined || msg);
      }
    }
    return out;
  }

  if (typeof errs === "object") {
    for (const [k, v] of Object.entries(errs)) {
      if (typeof v === "string") push(k, v);
      else if (Array.isArray(v)) push(k, v.filter((x) => typeof x === "string").join("، "));
    }
  }

  return out;
}

function mapStructuredLeafToField(
  leaf: string,
): TemporaryPatientFormField | null {
  const n = leaf.toLowerCase();

  const emailLike =
    n === "email" || n.endsWith(".email") || n.includes("emailaddress");
  const phoneLike =
    n.includes("phone") ||
    n === "phonenumber" ||
    n === "phonenumb" ||
    n === "msisdn" ||
    n === "mobile";

  const nameLike =
    n === "fullname" ||
    (n.includes("full") && n.includes("name")) ||
    n === "username" ||
    n === "name";

  const dialLike =
    n.includes("dial") || n === "countrycode" || n === "phonedialcode";

  if (emailLike) return "email";
  if (phoneLike) return "phoneLocal";
  if (dialLike) return "phoneDialCode";
  if (nameLike) return "fullName";
  return null;
}

/** هل تدل رسالة الخادم على تعارض بين بريد وهاتف لحسابين مختلفين؟ */
export function isEmailPhoneDifferentUsersMessage(text: string): boolean {
  if (
    /مستخدمين\s+مختلفين/.test(text) ||
    /مستخدمين\s+مختلف\b/.test(text) ||
    /خصان\s+مستخدم/.test(text) ||
    /\bdifferent\b.*\b(user|users|account)s?\b/i.test(text) ||
    /belongs?\s+to\s+different/i.test(text)
  ) {
    return true;
  }
  /** بريد + هاتف (أو مرادفات) وبينهما دلالة تعارض */
  const hasEmail = /البريد|بريد|إيميل|ايميل|e-mail|\bmail\b/i.test(text);
  const hasPhone =
    /الهاتف|هاتف|جوال|رقم الهاتف|رقم الواتس|phone|mobile|msisdn/i.test(text);

  const hasMismatchCue =
    /مختلف|مختلفين|لا\s*يتطابق|لا\s+يتمركز|ليست\s+لنفس|not\s+(the\s+)?same|do\s+not\s+(match|belong)|conflict|mismatch/i.test(
      text,
    );

  return hasEmail && hasPhone && hasMismatchCue;
}

/**
 * يفسِّر خطأ الخادم إلى رسالة للتوست + تعيينات للحقول (واجهة شبيهة بازدواجية الـ schema).
 */
export function resolveCreateTemporaryPatientServerFeedback(
  error: unknown,
): {
  toastMessage: string;
  fields: TemporaryPatientServerFieldMessages;
  /** رسالة عامة تحت عنوان النموذج إذا لم يُوزَّع أي خطأ على حقل */
  rootBanner: string | null;
} {
  const toastMessage = getUserFacingRequestErrorMessage(error);
  const fields: TemporaryPatientServerFieldMessages = {};

  const mk =
    error instanceof ApiError ? (error.messageKey ?? "").toLowerCase() : "";
  const mkAndMsg = normalizeForMatch(`${mk} ${toastMessage}`);

  if (error instanceof ApiError) {
    const structured = collectStructuredFieldTexts(error.body);
    for (const [leaf, msg] of structured) {
      if (leaf === "_root") continue;
      const target = mapStructuredLeafToField(leaf);
      if (target && !fields[target]) {
        fields[target] = msg;
      }
    }
  }

  const mismatch =
    isEmailPhoneDifferentUsersMessage(toastMessage) ||
    isEmailPhoneDifferentUsersMessage(
      error instanceof ApiError ? error.messageKey ?? "" : "",
    ) ||
    /\b(email|mail)\b.*\b(phone|mobile)\b.*(different|distinct|mismatch)|\bphone\b.*\bemail\b.*(different|mismatch)/i.test(
      mkAndMsg,
    );

  if (mismatch) {
    fields.email = toastMessage;
    fields.phoneLocal = toastMessage;
  }

  const assigned =
    Boolean(fields.fullName) ||
    Boolean(fields.email) ||
    Boolean(fields.phoneLocal) ||
    Boolean(fields.phoneDialCode);

  const rootBanner =
    assigned || !toastMessage.trim() ? null : toastMessage.trim();

  return { toastMessage, fields, rootBanner };
}
