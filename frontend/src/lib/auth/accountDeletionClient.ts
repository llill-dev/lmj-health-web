import { get, post } from '@/lib/api';
import { ApiError } from '@/lib/api';
import { getCurrentLocale } from '@/i18n/runtime';
import { getTranslationValue } from '@/i18n/translations';
import { authApi } from '@/lib/auth/client';

function tr(key: string, fallback: string): string {
  return getTranslationValue(getCurrentLocale(), key) ?? fallback;
}
import { getAccountDeletionCapabilities } from '@/lib/auth/accountDeletionCapabilities';
import {
  isAccountDeletionOtpError,
  isAccountDeletionPasswordError,
  mapAccountDeletionGenericError,
  mapAccountDeletionOtpError,
  mapAccountDeletionPasswordError,
} from '@/lib/auth/accountDeletionErrors';
import {
  normalizeAccountDeletionStatus,
  normalizeRecoverUntil,
  peekPendingDoctorRecoveryLogin,
} from '@/lib/auth/accountDeletionSession';
import type {
  AccountDeletionCancelResponse,
  AccountDeletionConfirmBody,
  AccountDeletionConfirmResponse,
  AccountDeletionRequestBody,
  AccountDeletionRequestResponse,
  AccountDeletionScope,
  AccountDeletionSendOtpBody,
  AccountDeletionSendOtpResponse,
  AccountDeletionStatusResponse,
  AccountDeletionVerifyPasswordBody,
  AccountDeletionVerifyPasswordResponse,
  DoctorRecoveryChannel,
  DoctorRecoveryIdentity,
  DoctorRecoveryOtpStartResponse,
  DoctorRecoveryOtpVerifyResponse,
  DoctorRestoreRequestOtpVerifyBody,
} from '@/lib/auth/accountDeletionTypes';
import { readAuthUser } from '@/lib/cookies';
import { resolveLoginIdentifier } from '@/lib/phone/normalizeAuthPhone';

type AccountDeletionStatusPayload = Partial<AccountDeletionStatusResponse> & {
  [key: string]: unknown;
};
type AccountDeletionRequestPayload = Partial<AccountDeletionRequestResponse> & {
  [key: string]: unknown;
};
type AccountDeletionCancelPayload = Partial<AccountDeletionCancelResponse> & {
  [key: string]: unknown;
};
type DoctorRecoveryStartPayload = Partial<DoctorRecoveryOtpStartResponse> & {
  [key: string]: unknown;
};
type DoctorRecoveryVerifyPayload = Partial<DoctorRecoveryOtpVerifyResponse> & {
  [key: string]: unknown;
};

type AccountDeletionResponsePayload = {
  message?: unknown;
  messageKey?: unknown;
  status?: unknown;
  requestedAt?: unknown;
  deletedAt?: unknown;
  destination?: unknown;
  maskedDestination?: unknown;
  channel?: unknown;
  userId?: unknown;
  doctorId?: unknown;
  restoreStatus?: unknown;
  restoreRequestedAt?: unknown;
  approvalFallbackUsed?: unknown;
  recoverUntil?: unknown;
  recoveryExpiresAt?: unknown;
  recoveryUntil?: unknown;
  recover_until?: unknown;
  [key: string]: unknown;
};

const ACCOUNT_DELETION_REQUEST_STATUSES = ['requested', 'pending', 'deleted'] as const;
const ACCOUNT_DELETION_CANCEL_STATUSES = ['none', 'requested', 'pending'] as const;

function isOneOf<const T extends readonly string[]>(
  value: unknown,
  allowed: T,
): value is T[number] {
  return typeof value === 'string' && allowed.some((entry) => entry === value);
}

function asDeletionResponsePayload(
  value: unknown,
): AccountDeletionResponsePayload | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as AccountDeletionResponsePayload)
    : null;
}

function readDeletionString(
  payload: AccountDeletionResponsePayload,
  key: string,
): string | undefined {
  const value = payload[key];
  return typeof value === 'string' ? value : undefined;
}

function readDeletionBoolean(
  payload: AccountDeletionResponsePayload,
  key: string,
): boolean | undefined {
  const value = payload[key];
  return typeof value === 'boolean' ? value : undefined;
}

function resolveDeletionPayload(
  raw: AccountDeletionResponsePayload,
): AccountDeletionResponsePayload {
  const nested = asDeletionResponsePayload(raw.data);
  const item = asDeletionResponsePayload(raw.item);
  const result = asDeletionResponsePayload(raw.result);
  return nested ?? item ?? result ?? raw;
}

function basePath(scope: AccountDeletionScope): string {
  return scope === 'patient' ? '/api/patient/me' : '/api/doctors/me';
}

function patientBasePath(): string {
  return '/api/patient/me';
}

export function resolveAccountDeletionScope(
  role?: string | null,
): AccountDeletionScope | null {
  if (role === 'patient') return 'patient';
  if (role === 'doctor') return 'doctor';
  return null;
}

function normalizeStatusResponse(
  raw: AccountDeletionResponsePayload,
): AccountDeletionStatusResponse {
  const payload = resolveDeletionPayload(raw);
  return {
    message: readDeletionString(payload, 'message') ?? readDeletionString(raw, 'message'),
    messageKey:
      readDeletionString(payload, 'messageKey') ??
      readDeletionString(raw, 'messageKey'),
    status: normalizeAccountDeletionStatus(
      readDeletionString(payload, 'status') ?? readDeletionString(raw, 'status'),
    ),
    requestedAt:
      readDeletionString(payload, 'requestedAt') ??
      readDeletionString(raw, 'requestedAt') ??
      null,
    recoverUntil: normalizeRecoverUntil(payload) ?? normalizeRecoverUntil(raw) ?? null,
    deletedAt:
      readDeletionString(payload, 'deletedAt') ??
      readDeletionString(raw, 'deletedAt') ??
      null,
  };
}

function normalizeRequestResponse(
  raw: AccountDeletionResponsePayload,
): AccountDeletionRequestResponse {
  const payload = resolveDeletionPayload(raw);
  const status =
    isOneOf(payload.status, ACCOUNT_DELETION_REQUEST_STATUSES)
      ? payload.status
      : isOneOf(raw.status, ACCOUNT_DELETION_REQUEST_STATUSES)
        ? raw.status
      : 'requested';

  return {
    message: readDeletionString(payload, 'message') ?? readDeletionString(raw, 'message'),
    messageKey:
      readDeletionString(payload, 'messageKey') ??
      readDeletionString(raw, 'messageKey'),
    status,
    requestedAt:
      readDeletionString(payload, 'requestedAt') ??
      readDeletionString(raw, 'requestedAt') ??
      null,
    recoverUntil: normalizeRecoverUntil(payload) ?? normalizeRecoverUntil(raw) ?? null,
  };
}

async function verifyPasswordViaLogin(currentPassword: string): Promise<void> {
  const authUser = readAuthUser();
  const identifier = authUser?.email?.trim() || authUser?.phone?.trim();
  if (!identifier) {
    throw new ApiError(
      400,
      'errors.validation.missingIdentity',
      {},
      tr(
        'accountDeletion.error.identityVerifyFailed',
        'تعذّر التحقق من الهوية. أعد تسجيل الدخول ثم حاول مرة أخرى.',
      ),
    );
  }

  const result = await authApi.login({
    ...resolveLoginIdentifier(identifier),
    password: currentPassword,
    clientType: 'web',
  });

  if ('error' in result) {
    throw new ApiError(
      401,
      'errors.auth.currentPasswordIncorrect',
      { message: result.error.message },
      mapAccountDeletionPasswordError(
        new ApiError(
          401,
          'errors.auth.currentPasswordIncorrect',
          {},
          result.error.message,
        ),
      ),
    );
  }
}

function readDeletionStatusFallback(): AccountDeletionStatusResponse | null {
  const authUser = readAuthUser();
  if (!authUser?.accountDeletionStatus) return null;
  if (authUser.accountDeletionStatus === 'none') return null;

  return normalizeStatusResponse({
    status: authUser.accountDeletionStatus,
    requestedAt: authUser.deletionRequestedAt ?? null,
    recoverUntil: authUser.deletionRecoverUntil ?? null,
  });
}

export const accountDeletionApi = {
  getStatus: async (scope: AccountDeletionScope) => {
    try {
      const response = await get<AccountDeletionStatusPayload>(
        `${basePath(scope)}/deletion-status`,
        { locale: getCurrentLocale() },
      );
      return normalizeStatusResponse(response);
    } catch (error) {
      const fallback = readDeletionStatusFallback();
      if (fallback) return fallback;
      throw error;
    }
  },

  cancel: async (scope: AccountDeletionScope) => {
    const caps = getAccountDeletionCapabilities(scope);
    if (!caps.cancel) {
      throw new ApiError(
        404,
        'errors.routeNotFound',
        {},
        tr(
          'accountDeletion.error.cancelNotSupported',
          'استخدم مسار استرجاع الحساب عبر رمز التحقق للطبيب.',
        ),
      );
    }

    const response = await post<AccountDeletionCancelPayload>(
      `${basePath(scope)}/delete-cancel`,
      {},
      { locale: getCurrentLocale() },
    );
    return {
      message: readDeletionString(response, 'message'),
      messageKey: readDeletionString(response, 'messageKey'),
      status: isOneOf(response.status, ACCOUNT_DELETION_CANCEL_STATUSES)
        ? response.status
        : 'none',
    } satisfies AccountDeletionCancelResponse;
  },

  verifyPassword: (
    _scope: Extract<AccountDeletionScope, 'patient'>,
    body: AccountDeletionVerifyPasswordBody,
  ) =>
    post<AccountDeletionVerifyPasswordResponse>(
      `${patientBasePath()}/delete-request/verify-password`,
      body,
      { locale: getCurrentLocale() },
    ),

  sendOtp: (
    _scope: Extract<AccountDeletionScope, 'patient'>,
    body: AccountDeletionSendOtpBody = {},
  ) =>
    post<AccountDeletionSendOtpResponse>(
      `${patientBasePath()}/delete-request/send-otp`,
      body,
      { locale: getCurrentLocale() },
    ),

  confirmOtp: (
    _scope: Extract<AccountDeletionScope, 'patient'>,
    body: AccountDeletionConfirmBody,
  ) =>
    post<AccountDeletionConfirmResponse>(
      `${patientBasePath()}/delete-request/confirm`,
      body,
      { locale: getCurrentLocale() },
    ),

  requestDeletion: async (
    scope: AccountDeletionScope,
    body: AccountDeletionRequestBody,
  ) => {
    const response = await post<AccountDeletionRequestPayload>(
      `${basePath(scope)}/delete-request`,
      body,
      { locale: getCurrentLocale() },
    );
    return normalizeRequestResponse(response);
  },
};

/** الخطوة 2 — التحقق من كلمة المرور (مسار مخصص أو إعادة تسجيل دخول للطبيب). */
export async function verifyDeletionPassword(
  scope: AccountDeletionScope,
  currentPassword: string,
): Promise<AccountDeletionVerifyPasswordResponse | void> {
  const caps = getAccountDeletionCapabilities(scope);

  if (scope === 'patient' && caps.verifyPassword) {
    try {
      return await accountDeletionApi.verifyPassword(scope, { currentPassword });
    } catch (error) {
      if (isAccountDeletionPasswordError(error)) {
        throw new ApiError(
          error instanceof ApiError ? error.status : 401,
          error instanceof ApiError ? error.messageKey : 'errors.auth.currentPasswordIncorrect',
          error instanceof ApiError ? error.body : {},
          mapAccountDeletionPasswordError(error),
        );
      }
      throw error;
    }
  }

  await verifyPasswordViaLogin(currentPassword);
}

/** الخطوة 4 — إرسال OTP بعد جمع السبب. */
export async function sendDeletionOtp(
  scope: AccountDeletionScope,
  input: AccountDeletionSendOtpBody,
): Promise<AccountDeletionSendOtpResponse> {
  const caps = getAccountDeletionCapabilities(scope);
  if (scope !== 'patient' || !caps.sendOtp) {
    return {
      message: 'OTP not required for this account scope.',
      otpSent: false,
    };
  }

  try {
    return await accountDeletionApi.sendOtp(scope, input);
  } catch (error) {
    throw new ApiError(
      error instanceof ApiError ? error.status : 500,
      error instanceof ApiError ? error.messageKey : null,
      error instanceof ApiError ? error.body : {},
      mapAccountDeletionGenericError(
        error,
        tr('accountDeletion.error.otpSendFailed', 'تعذّر إرسال رمز التحقق.'),
      ),
    );
  }
}

/** الخطوة 4 — تأكيد OTP ثم تقديم طلب الحذف. */
export async function confirmDeletionAndRequest(
  scope: AccountDeletionScope,
  input: AccountDeletionRequestBody & {
    otp?: string;
    currentPassword?: string;
  },
): Promise<AccountDeletionRequestResponse> {
  const caps = getAccountDeletionCapabilities(scope);
  const { otp, currentPassword, ...payload } = input;
  const trimmedOtp = otp?.trim();

  if (scope === 'patient' && caps.confirmOtp && trimmedOtp) {
    try {
      const confirmed = await accountDeletionApi.confirmOtp(scope, {
        otp: trimmedOtp,
        currentPassword,
      });
      return accountDeletionApi.requestDeletion(scope, {
        ...payload,
        otp: trimmedOtp,
        currentPassword,
        deletionToken: confirmed.deletionToken,
      });
    } catch (error) {
      if (isAccountDeletionOtpError(error)) {
        throw new ApiError(
          error instanceof ApiError ? error.status : 400,
          error instanceof ApiError ? error.messageKey : 'errors.auth.invalidOtp',
          error instanceof ApiError ? error.body : {},
          mapAccountDeletionOtpError(error),
        );
      }
      throw error;
    }
  }

  try {
    return await accountDeletionApi.requestDeletion(scope, {
      ...payload,
      otp: trimmedOtp || undefined,
      currentPassword,
    });
  } catch (error) {
    if (isAccountDeletionPasswordError(error)) {
      throw new ApiError(
        error instanceof ApiError ? error.status : 401,
        error instanceof ApiError ? error.messageKey : 'errors.auth.currentPasswordIncorrect',
        error instanceof ApiError ? error.body : {},
        mapAccountDeletionPasswordError(error),
      );
    }
    if (trimmedOtp && isAccountDeletionOtpError(error)) {
      throw new ApiError(
        error instanceof ApiError ? error.status : 400,
        error instanceof ApiError ? error.messageKey : 'errors.auth.invalidOtp',
        error instanceof ApiError ? error.body : {},
        mapAccountDeletionOtpError(error),
      );
    }
    throw error;
  }
}

const DOCTOR_RECOVERY_BASE = '/api/doctors/account-deletion/recovery';
const DOCTOR_RESTORE_REQUEST_BASE =
  '/api/doctors/account-deletion/restore-request';

function normalizeDoctorRecoveryStartResponse(
  raw: AccountDeletionResponsePayload,
): DoctorRecoveryOtpStartResponse {
  const payload = resolveDeletionPayload(raw);
  return {
    message: readDeletionString(payload, 'message') ?? readDeletionString(raw, 'message'),
    messageKey:
      readDeletionString(payload, 'messageKey') ??
      readDeletionString(raw, 'messageKey'),
    destination:
      readDeletionString(payload, 'destination') ??
      readDeletionString(payload, 'maskedDestination') ??
      readDeletionString(raw, 'destination') ??
      readDeletionString(raw, 'maskedDestination'),
    channel:
      payload.channel === 'email' || payload.channel === 'whatsapp'
        ? payload.channel
        : raw.channel === 'email' || raw.channel === 'whatsapp'
          ? raw.channel
        : undefined,
  };
}

function normalizeDoctorRecoveryVerifyResponse(
  raw: AccountDeletionResponsePayload,
): DoctorRecoveryOtpVerifyResponse {
  const payload = resolveDeletionPayload(raw);
  const restoreStatus =
    payload.restoreStatus === 'pending' ||
    payload.restoreStatus === 'approved' ||
    payload.restoreStatus === 'rejected'
      ? payload.restoreStatus
      : raw.restoreStatus === 'pending' ||
          raw.restoreStatus === 'approved' ||
          raw.restoreStatus === 'rejected'
        ? raw.restoreStatus
      : undefined;

  return {
    message: readDeletionString(payload, 'message') ?? readDeletionString(raw, 'message'),
    messageKey:
      readDeletionString(payload, 'messageKey') ??
      readDeletionString(raw, 'messageKey'),
    status:
      payload.status === 'none' ||
      payload.status === 'requested' ||
      payload.status === 'pending' ||
      payload.status === 'deleted'
        ? payload.status
        : raw.status === 'none' ||
            raw.status === 'requested' ||
            raw.status === 'pending' ||
            raw.status === 'deleted'
          ? raw.status
        : undefined,
    userId:
      readDeletionString(payload, 'userId') ?? readDeletionString(raw, 'userId'),
    doctorId:
      readDeletionString(payload, 'doctorId') ?? readDeletionString(raw, 'doctorId'),
    restoreStatus,
    restoreRequestedAt:
      readDeletionString(payload, 'restoreRequestedAt') ??
      readDeletionString(raw, 'restoreRequestedAt') ??
      null,
    approvalFallbackUsed:
      readDeletionBoolean(payload, 'approvalFallbackUsed') ??
      readDeletionBoolean(raw, 'approvalFallbackUsed'),
  };
}

/** يجمع بيانات التواصل للطبيب من الجلسة أو من تسجيل الدخول المؤقت. */
export function resolveDoctorRecoveryIdentity(input?: {
  email?: string | null;
  phone?: string | null;
  channel?: DoctorRecoveryChannel;
}): DoctorRecoveryIdentity {
  const authUser = readAuthUser();
  const pending = peekPendingDoctorRecoveryLogin();

  const email = (input?.email ?? authUser?.email ?? pending?.email ?? '').trim();
  const phone = (input?.phone ?? authUser?.phone ?? pending?.phone ?? '').trim();
  const channel =
    input?.channel ??
    (email ? 'email' : phone ? 'whatsapp' : 'email');

  return { channel, email, phone };
}

export function resolveDoctorRecoveryDestination(
  identity: DoctorRecoveryIdentity,
  response?: DoctorRecoveryOtpStartResponse,
): string {
  if (response?.destination?.trim()) return response.destination.trim();
  return identity.channel === 'whatsapp'
    ? identity.phone || tr('accountDeletion.recovery.yourPhone', 'هاتفك')
    : identity.email || tr('accountDeletion.recovery.yourEmail', 'بريدك الإلكتروني');
}

export const doctorAccountRecoveryApi = {
  startOtp: async (body: DoctorRecoveryIdentity) => {
    try {
      const response = await post<DoctorRecoveryStartPayload>(
        `${DOCTOR_RECOVERY_BASE}/start`,
        body,
        { locale: getCurrentLocale(), omitAuth: true },
      );
      return normalizeDoctorRecoveryStartResponse(response);
    } catch (error) {
      throw new ApiError(
        error instanceof ApiError ? error.status : 500,
        error instanceof ApiError ? error.messageKey : null,
        error instanceof ApiError ? error.body : {},
        mapAccountDeletionGenericError(
          error,
          tr(
            'accountDeletion.error.restoreOtpFailed',
            'تعذّر إرسال رمز استرجاع الحساب.',
          ),
        ),
      );
    }
  },

  verifyOtp: async (body: DoctorRecoveryIdentity & { otp: string }) => {
    try {
      const response = await post<DoctorRecoveryVerifyPayload>(
        `${DOCTOR_RECOVERY_BASE}/verify`,
        body,
        { locale: getCurrentLocale(), omitAuth: true },
      );
      return normalizeDoctorRecoveryVerifyResponse(response);
    } catch (error) {
      if (isAccountDeletionOtpError(error)) {
        throw new ApiError(
          error instanceof ApiError ? error.status : 400,
          error instanceof ApiError ? error.messageKey : 'errors.auth.invalidOtp',
          error instanceof ApiError ? error.body : {},
          mapAccountDeletionOtpError(error),
        );
      }
      throw new ApiError(
        error instanceof ApiError ? error.status : 500,
        error instanceof ApiError ? error.messageKey : null,
        error instanceof ApiError ? error.body : {},
        mapAccountDeletionGenericError(
          error,
          tr(
            'accountDeletion.error.restoreOtpVerifyFailed',
            'تعذّر التحقق من رمز الاسترجاع.',
          ),
        ),
      );
    }
  },
};

export const doctorRestoreRequestApi = {
  startOtp: async (body: DoctorRecoveryIdentity) => {
    try {
      const response = await post<DoctorRecoveryStartPayload>(
        `${DOCTOR_RESTORE_REQUEST_BASE}/start`,
        body,
        { locale: getCurrentLocale(), omitAuth: true },
      );
      return normalizeDoctorRecoveryStartResponse(response);
    } catch (error) {
      throw new ApiError(
        error instanceof ApiError ? error.status : 500,
        error instanceof ApiError ? error.messageKey : null,
        error instanceof ApiError ? error.body : {},
        mapAccountDeletionGenericError(
          error,
          tr(
            'accountDeletion.error.restoreRequestOtpFailed',
            'تعذّر إرسال رمز طلب الاستعادة.',
          ),
        ),
      );
    }
  },

  verifyOtp: async (body: DoctorRestoreRequestOtpVerifyBody) => {
    try {
      const response = await post<DoctorRecoveryVerifyPayload>(
        `${DOCTOR_RESTORE_REQUEST_BASE}/verify`,
        body,
        { locale: getCurrentLocale(), omitAuth: true },
      );
      return normalizeDoctorRecoveryVerifyResponse(response);
    } catch (error) {
      if (isAccountDeletionOtpError(error)) {
        throw new ApiError(
          error instanceof ApiError ? error.status : 400,
          error instanceof ApiError ? error.messageKey : 'errors.auth.invalidOtp',
          error instanceof ApiError ? error.body : {},
          mapAccountDeletionOtpError(error),
        );
      }
      throw new ApiError(
        error instanceof ApiError ? error.status : 500,
        error instanceof ApiError ? error.messageKey : null,
        error instanceof ApiError ? error.body : {},
        mapAccountDeletionGenericError(
        error,
        tr('accountDeletion.error.restoreRequestFailed', 'تعذّر إرسال طلب الاستعادة.'),
      ),
      );
    }
  },
};

/** إرسال OTP لاسترجاع حساب الطبيب (إلغاء طلب الحذف). */
export async function startDoctorAccountRecoveryOtp(
  channel?: DoctorRecoveryChannel,
): Promise<{
  identity: DoctorRecoveryIdentity;
  destination: string;
  response: DoctorRecoveryOtpStartResponse;
}> {
  const identity = resolveDoctorRecoveryIdentity({ channel });
  if (identity.channel === 'email' && !identity.email) {
    throw new ApiError(
      422,
      'errors.validation.missingEmail',
      {},
      tr(
        'accountDeletion.recovery.emailRequired',
        'البريد الإلكتروني مطلوب لإرسال رمز الاسترجاع.',
      ),
    );
  }
  if (identity.channel === 'whatsapp' && !identity.phone) {
    throw new ApiError(
      422,
      'errors.validation.missingPhone',
      {},
      tr(
        'accountDeletion.recovery.phoneRequired',
        'رقم الهاتف مطلوب لإرسال رمز الاسترجاع.',
      ),
    );
  }

  const response = await doctorAccountRecoveryApi.startOtp(identity);
  return {
    identity,
    destination: resolveDoctorRecoveryDestination(identity, response),
    response,
  };
}

/** التحقق من OTP وإتمام استرجاع حساب الطبيب. */
export async function verifyDoctorAccountRecoveryOtp(input: {
  identity: DoctorRecoveryIdentity;
  otp: string;
}): Promise<DoctorRecoveryOtpVerifyResponse> {
  return doctorAccountRecoveryApi.verifyOtp({
    ...input.identity,
    otp: input.otp.trim(),
  });
}

/** إرسال OTP لطلب استعادة حساب الطبيب بعد انتهاء نافذة الـ 7 أيام. */
export async function startDoctorAccountRestoreRequestOtp(
  channel?: DoctorRecoveryChannel,
): Promise<{
  identity: DoctorRecoveryIdentity;
  destination: string;
  response: DoctorRecoveryOtpStartResponse;
}> {
  const identity = resolveDoctorRecoveryIdentity({ channel });
  if (identity.channel === 'email' && !identity.email) {
    throw new ApiError(
      422,
      'errors.validation.missingEmail',
      {},
      tr(
        'accountDeletion.restoreRequest.emailRequired',
        'البريد الإلكتروني مطلوب لإرسال رمز طلب الاستعادة.',
      ),
    );
  }
  if (identity.channel === 'whatsapp' && !identity.phone) {
    throw new ApiError(
      422,
      'errors.validation.missingPhone',
      {},
      tr(
        'accountDeletion.restoreRequest.phoneRequired',
        'رقم الهاتف مطلوب لإرسال رمز طلب الاستعادة.',
      ),
    );
  }

  const response = await doctorRestoreRequestApi.startOtp(identity);
  return {
    identity,
    destination: resolveDoctorRecoveryDestination(identity, response),
    response,
  };
}

/** التحقق من OTP وإرسال طلب الاستعادة للمراجعة الإدارية. */
export async function verifyDoctorAccountRestoreRequestOtp(input: {
  identity: DoctorRecoveryIdentity;
  otp: string;
  reason?: string;
}): Promise<DoctorRecoveryOtpVerifyResponse> {
  return doctorRestoreRequestApi.verifyOtp({
    ...input.identity,
    otp: input.otp.trim(),
    reason:
      input.reason?.trim() ||
      'طلب استعادة حساب بعد انتهاء فترة الاسترجاع التلقائي.',
  });
}
