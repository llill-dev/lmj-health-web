import { ApiError } from "@/lib/base";

/** تعارض بريد/هاتف مُعرَّف بوضوح من الاستجابة (يُعرَض تحت الحقلة لا في الشريط العام إن أمكن). */
export type SignupFieldConflictMessages = {
  email?: string;
  phone?: string;
};

/**
 * نصوص تدفق التسجيل والتحقق — محاذاة المصطلحات مع مرجع الـ API
 * (`POST /auth/signup`, `POST /auth/resend-signup-otp`, `POST /auth/verify-otp`).
 * للأخطاء: يُفضَّل عرض رسالة الخادم (وبعدها `Accept-Language` / `x-lang: ar`) قبل أي نص عربي ثابت.
 */

export const SIGNUP_SUBMIT_FALLBACK_AR =
  "تعذّر إكمال طلب إنشاء الحساب. تحقّق من الإنترنت والبيانات؛ إن ظهرت رسالة من الخادم فاتّبعها ثم أعد المحاولة.";

/** عند تعذّر التحقق من OTP دون رسالة خادم */
export const VERIFY_OTP_FALLBACK_AR =
  "الرمز غير صحيح أو منتهٍ. أعد المحاولة أو طلب إرسال رمز جديد.";

export const VERIFY_CODE_SCHEMA_HINT_AR = "يجب إدخال ٦ أرقام.";

type SignupValidationIssue = {
  key: string | null;
  messages: string[];
};

function normalizeIssueKey(key: string | null | undefined): string | null {
  if (!key) return null;
  const trimmed = key.trim();
  if (!trimmed) return null;
  return trimmed
    .replace(/^body[.[/]/i, '')
    .replace(/^\/+/, '')
    .replace(/\]$/g, '')
    .replace(/\[/g, '.')
    .replace(/^"+|"+$/g, '');
}

function validationFieldLabel(key: string): string {
  const normalized = normalizeIssueKey(key) ?? key;
  const leaf = normalized.split('.').filter(Boolean).at(-1) ?? normalized;
  const labels: Record<string, string> = {
    fullName: 'الاسم الكامل',
    email: 'البريد الإلكتروني',
    phone: 'رقم الهاتف',
    channel: 'قناة التحقق',
    password: 'كلمة المرور',
    role: 'نوع الحساب',
    gender: 'الجنس',
    dateOfBirth: 'تاريخ الميلاد',
    address: 'العنوان',
    specializationKey: 'التخصص',
    customSpecializationText: 'التخصص المخصص',
    specialization: 'التخصص',
    medicalLicenseNumber: 'رقم مزاولة المهنة',
    bio: 'النبذة التعريفية',
    education: 'المؤهل العلمي',
    clinicAddress: 'عنوان العيادة',
    locationCity: 'المدينة',
    locationCountry: 'الدولة',
    consultationTypes: 'أنماط الاستشارة',
    clinicLat: 'خط العرض',
    clinicLng: 'خط الطول',
    otp: 'رمز التحقق',
    clientType: 'نوع العميل',
  };
  return labels[leaf] ?? normalized;
}

function dedupeMessages(messages: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const msg of messages) {
    const trimmed = msg.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    out.push(trimmed);
  }
  return out;
}

function formatValidationDetails(body: Record<string, unknown>): string | null {
  const issues = collectValidationIssues(body);
  if (!issues.length) return null;

  return issues
    .map((issue) => {
      const messages = dedupeMessages(issue.messages);
      if (!messages.length) return null;
      if (!issue.key) return `• ${messages.join('، ')}`;
      return `• ${validationFieldLabel(issue.key)}: ${messages.join('، ')}`;
    })
    .filter((s): s is string => Boolean(s))
    .join('\n');
}

function collectMessagesFromIssueValue(val: unknown): string[] {
  if (val == null) return [];
  if (typeof val === "string") return val.trim() ? [val.trim()] : [];
  if (Array.isArray(val)) {
    const out = val.flatMap((item) => collectMessagesFromIssueValue(item));
    return out.filter(Boolean);
  }
  if (typeof val === "object") {
    const o = val as Record<string, unknown>;
    const m =
      (typeof o.message === "string" && o.message.trim()) ||
      (typeof o.msg === "string" && o.msg.trim()) ||
      (typeof o.error === "string" && o.error.trim());
    if (m) return [m];
  }
  return [];
}

function issueKeyFromObject(o: Record<string, unknown>): string | null {
  for (const key of ['path', 'param', 'field', 'key', 'property', 'name']) {
    const val = o[key];
    if (typeof val === 'string' && val.trim()) {
      return normalizeIssueKey(val);
    }
  }
  return null;
}

function collectValidationIssues(
  body: Record<string, unknown>,
): SignupValidationIssue[] {
  const errs = body.errors;
  if (errs == null) return [];

  const grouped = new Map<string, SignupValidationIssue>();

  function add(key: string | null, messages: string[]) {
    const cleanMessages = dedupeMessages(messages);
    if (!cleanMessages.length) return;
    const cleanKey = normalizeIssueKey(key);
    const mapKey = cleanKey ?? `__general_${grouped.size}`;
    const existing = grouped.get(mapKey);
    if (existing) {
      existing.messages = dedupeMessages([
        ...existing.messages,
        ...cleanMessages,
      ]);
      return;
    }
    grouped.set(mapKey, { key: cleanKey, messages: cleanMessages });
  }

  if (typeof errs === 'string') {
    add(null, [errs]);
    return [...grouped.values()];
  }

  if (Array.isArray(errs)) {
    for (const item of errs) {
      if (typeof item === 'string') {
        add(null, [item]);
        continue;
      }
      if (item && typeof item === 'object') {
        const obj = item as Record<string, unknown>;
        add(issueKeyFromObject(obj), collectMessagesFromIssueValue(obj));
        continue;
      }
      add(null, collectMessagesFromIssueValue(item));
    }
    return [...grouped.values()];
  }

  if (typeof errs === 'object') {
    for (const [rawKey, rawVal] of Object.entries(
      errs as Record<string, unknown>,
    )) {
      add(rawKey, collectMessagesFromIssueValue(rawVal));
    }
  }

  return [...grouped.values()];
}

function mapIssueKeyToConflictField(
  key: string,
): keyof SignupFieldConflictMessages | null {
  const normalizedLeaf =
    normalizeIssueKey(key)?.split(/[.[/]/).filter(Boolean).at(-1) ?? key;

  /** ترخيص المزاولة — لا يُسقَط خطأ الهاتف/البريد له */
  const licenseLike = /medicallicense|license|licensenumber|مزاولة|ترخيص/i.test(
    normalizedLeaf,
  );
  if (licenseLike) return null;

  const k = normalizedLeaf
    .toLowerCase()
    .replace(/[\s._[\]'"]/g, '')
    .replace(/^\/+/, '');

  /** قناة إرسال رمز OTP (واتساب/بريد) — ليست حقلاً لمقارنة «رقم الجوال مسجَّل». */
  if (
    k === 'channel' ||
    k === 'whatsapp' ||
    k === 'verificationchannel' ||
    k.includes('verificationchannel') ||
    k.includes('otpchannel') ||
    k.includes('signchannel')
  ) {
    return null;
  }

  if (k.includes('email') || k === 'mail') return 'email';

  /** لا نعتبر كلمة whatsapp وحده مؤشراً على حقول الهاتف (كثيرة الخوادم تُستخدمها لحقل القناة). */
  if (
    k.includes('phone') ||
    k.includes('mobile') ||
    k.includes('phonenumber') ||
    k.includes('msisdn') ||
    k === 'tel'
  ) {
    return 'phone';
  }

  return null;
}

/** حقول خطأ خطوة الترخيص (مزاولة المهنة وما إليها من JSON من الخادم). */
export function issueKeyIndicatesMedicalLicense(
  key: string | null | undefined,
): boolean {
  if (!key) return false;
  const leaf =
    normalizeIssueKey(key)?.split(/[.[/]/).filter(Boolean).at(-1) ??
    normalizeIssueKey(key) ??
    key;
  const k = leaf
    .toLowerCase()
    .replace(/[\s._[\]'"]/g, '')
    .replace(/^\/+/, '');
  return (
    k.includes('medicallicensenumber') ||
    k.includes('medicallicense') ||
    k.includes('licensenumber') ||
    k === 'license' ||
    /^license.+number/.test(k) ||
    /^medical.+license/.test(k)
  );
}

/**
 * رسالة لتُعرَض تحت «رقم مزاولة المهنة» عند تعارض/رفض الخادم.
 */
export function extractSignupMedicalLicenseConflictMessage(
  error: unknown,
): string | undefined {
  if (!(error instanceof ApiError)) return undefined;

  const issues = collectValidationIssues(error.body);
  const msgs: string[] = [];

  for (const issue of issues) {
    if (issue.key && issueKeyIndicatesMedicalLicense(issue.key)) {
      msgs.push(...issue.messages);
      continue;
    }
    /** أحياناً الخادم يرسل key خاطئ (مثل قناة) لكن الرسالة تصف الترخيص */
    for (const m of issue.messages) {
      if (/مزاولة|ترخيص|رقم.{0,6}مزاولة|medical\s*license|license\s*number/i.test(m))
        msgs.push(m);
    }
  }

  const primary = error.message.trim();
  if (
    primary &&
    /مزاولة|ترخيص|وزارة.{0,8}صحة|طبيب.*مسجل|\bmedical\s+license\b|\blicense\s+number\b/i.test(
      primary,
    )
  ) {
    msgs.push(primary);
  }

  const unified = dedupeMessages(msgs);
  if (!unified.length) return undefined;
  return unified.join(' — ');
}

function mergeFieldConflict(
  out: SignupFieldConflictMessages,
  field: keyof SignupFieldConflictMessages,
  msg: string,
) {
  const t = msg.trim();
  if (!t) return;
  const prev = out[field];
  if (!prev) {
    out[field] = t;
    return;
  }
  if (prev.includes(t)) return;
  out[field] = `${prev} — ${t}`;
}

/**
 * استخراج تعارض البريد/الهاتف من جسم الخطأ قبل الاستدلال من النص العام؛
 * يقلّل عرض رسالة «البريد مسجّل» تحت خانة الإيميل عندما يبيّن `errors` أن المشكلة بالهاتف أو حقل آخر فقط.
 */
export function extractSignupConflictFields(
  error: unknown,
): SignupFieldConflictMessages {
  const out: SignupFieldConflictMessages = {};
  if (!(error instanceof ApiError)) return out;

  let unrelatedFieldErrorsPresent = false;
  const issues = collectValidationIssues(error.body);
  if (issues.length) {
    for (const issue of issues) {
      const field = issue.key ? mapIssueKeyToConflictField(issue.key) : null;
      if (!field) {
        unrelatedFieldErrorsPresent = true;
        continue;
      }
      for (const m of issue.messages) {
        mergeFieldConflict(out, field, m);
      }
    }
  }

  const primary = error.message.trim();
  const mkRaw = error.messageKey ?? '';
  const mk = mkRaw.toLowerCase();

  /** لا نربط رسالة عامة بالبريد/الهاتف إن أوضح الخادم أنها عن الترخيص */
  const messageKeyIndicatesLicense =
    /\blicense\b|\bmedical\b|medicallicens|مزاولة|ترخيص|r-license/i.test(mkRaw);

  if (
    !out.email &&
    !out.phone &&
    mk.length &&
    !unrelatedFieldErrorsPresent &&
    !messageKeyIndicatesLicense
  ) {
    if (
      mk.includes("email") &&
      (mk.includes("taken") ||
        mk.includes("exist") ||
        mk.includes("duplicate") ||
        mk.includes("registered") ||
        mk.includes("already"))
    )
      mergeFieldConflict(out, "email", primary);
    if (
      mk.includes("phone") &&
      (mk.includes("taken") ||
        mk.includes("exist") ||
        mk.includes("duplicate") ||
        mk.includes("registered") ||
        mk.includes("already"))
    )
      mergeFieldConflict(out, "phone", primary);
  }

  const pl = primary.toLowerCase();

  /** إذا عيّنت `errors` حقلاً واحداً لا نطبّق الاستنتاج العربيّ على النص الكامل لتفادي رسالة عامة عن البريد تُخطَأ لمشكلة في الهاتف. */
  // Only structured `errors` or explicit messageKey values may assign the error
  // to email/phone. A plain 400 message can be misleading business-rule text.
  const shouldInferPlainTextContactConflict = false;

  const emailCue =
    /\b(mail|e-?mail|correo)\b/.test(pl) ||
    /بريد/.test(primary) ||
    /إيميل/.test(primary) ||
    /ايميل/.test(primary);
  const phoneCue =
    /\b(phone|mobile|whatsapp|msisdn|cell)\b/.test(pl) ||
    /هاتف/.test(primary) ||
    /جوال/.test(primary) ||
    /واتساب/.test(primary) ||
    (/رقم/.test(primary) && !/رخصة/.test(primary));
  const takenCue =
    /مسجل|مستخدم|موجود مسبقا|موجود مسبقاً|مزدوج|مأخوذ|already|taken|duplicate|exists|registered/.test(
      pl,
    );

  if (
    shouldInferPlainTextContactConflict &&
    takenCue &&
    !unrelatedFieldErrorsPresent
  ) {
    if (emailCue && !phoneCue) mergeFieldConflict(out, "email", primary);
    else if (phoneCue && !emailCue) mergeFieldConflict(out, "phone", primary);
  }

  return out;
}

export function signupErrorHasOnlyContactFieldIssues(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;

  const issues = collectValidationIssues(error.body);
  if (issues.length) {
    return issues.every(
      (issue) => issue.key && mapIssueKeyToConflictField(issue.key) != null,
    );
  }

  const conflicts = extractSignupConflictFields(error);
  return Boolean(conflicts.email || conflicts.phone);
}

/**
 * رسالة للشريط العام: تُستبعَد التفاصيل المكرّرة تحت البريد/الهاتف عند عرضها في الخطوة 1.
 */
export function formatSignupGeneralBannerError(
  error: unknown,
  fieldConflicts: SignupFieldConflictMessages,
): string | null {
  const full = formatSignupApiError(error).trim();
  if (!full) return null;

  let rest = full;
  if (fieldConflicts.email) {
    const e = fieldConflicts.email;
    rest = rest
      .split(e)
      .join(" ")
      .replace(/\s*—\s*—/g, " —")
      .replace(/[\s():]+$/g, "")
      .replace(/^[\s(:—-]+/, "")
      .trim();
  }
  if (fieldConflicts.phone) {
    const p = fieldConflicts.phone;
    rest = rest
      .split(p)
      .join(" ")
      .replace(/\s*—\s*—/g, " —")
      .replace(/[\s():]+$/g, "")
      .replace(/^[\s(:—-]+/, "")
      .trim();
  }

  const collapsed = rest.replace(/\s+/g, " ").trim();
  if (collapsed.length < 4) return null;
  return collapsed;
}

/**
 * رسالة خطأ موحَّدة لتسجيل الطبيب: تفضّل `ApiError.message` (محلية من الخادم عادةً)
 * وتُكمّل بتفاصيل `errors` عند 422 وما شابه.
 */
export function formatSignupApiError(error: unknown): string {
  if (error instanceof ApiError) {
    const primary = error.message.trim();
    const details = formatValidationDetails(error.body);
    if (details) {
      if (!primary) return details;
      if (primary.includes(details)) return primary;
      return `${primary}\n${details}`;
    }
    if (primary) return primary;
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }
  return SIGNUP_SUBMIT_FALLBACK_AR;
}

export function formatVerifyFlowError(error: unknown): string {
  const truncate = (s: string, max = 160): string => {
    const t = s.trim();
    if (!t) return t;
    return t.length > max ? `${t.slice(0, max - 1)}…` : t;
  };

  const firstSnippet = (raw: string): string => {
    const t = raw.trim().replace(/\s+/g, " ");
    const beforeBreak = t.split(/\r?\n/)[0]?.split("—")[0]?.trim() ?? t;
    return beforeBreak;
  };

  if (error instanceof ApiError) {
    const b = error.body;
    const explicit =
      (typeof b.message === "string" && b.message.trim()) ||
      (typeof b.detail === "string" && b.detail.trim()) ||
      "";
    if (explicit) return truncate(firstSnippet(explicit));

    const fallback = error.message.trim();
    if (fallback) return truncate(firstSnippet(fallback));
  }

  if (error instanceof Error && error.message.trim()) {
    return truncate(firstSnippet(error.message));
  }

  return VERIFY_OTP_FALLBACK_AR;
}

