import { get, post } from '@/lib/api';
import { ApiError } from '@/lib/api';
import { authApi } from '@/lib/auth/client';
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

function basePath(scope: AccountDeletionScope): string {
  return scope === 'patient' ? '/api/patient/me' : '/api/doctors/me';
}

export function resolveAccountDeletionScope(
  role?: string | null,
): AccountDeletionScope | null {
  if (role === 'patient') return 'patient';
  if (role === 'doctor') return 'doctor';
  return null;
}

function normalizeStatusResponse(
  raw: Record<string, unknown>,
): AccountDeletionStatusResponse {
  return {
    message: typeof raw.message === 'string' ? raw.message : undefined,
    messageKey: typeof raw.messageKey === 'string' ? raw.messageKey : undefined,
    status: normalizeAccountDeletionStatus(
      typeof raw.status === 'string' ? raw.status : undefined,
    ),
    requestedAt:
      typeof raw.requestedAt === 'string' ? raw.requestedAt : null,
    recoverUntil: normalizeRecoverUntil(raw) ?? null,
    deletedAt: typeof raw.deletedAt === 'string' ? raw.deletedAt : null,
  };
}

function normalizeRequestResponse(
  raw: Record<string, unknown>,
): AccountDeletionRequestResponse {
  return {
    message: typeof raw.message === 'string' ? raw.message : undefined,
    messageKey: typeof raw.messageKey === 'string' ? raw.messageKey : undefined,
    status: (raw.status as AccountDeletionRequestResponse['status']) ?? 'requested',
    requestedAt:
      typeof raw.requestedAt === 'string' ? raw.requestedAt : null,
    recoverUntil: normalizeRecoverUntil(raw) ?? null,
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
      'تعذّر التحقق من الهوية. أعد تسجيل الدخول ثم حاول مرة أخرى.',
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
      const response = await get<Record<string, unknown>>(
        `${basePath(scope)}/deletion-status`,
        { locale: 'ar' },
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
        'استخدم مسار استرجاع الحساب عبر رمز التحقق للطبيب.',
      );
    }

    const response = await post<Record<string, unknown>>(
      `${basePath(scope)}/delete-cancel`,
      {},
      { locale: 'ar' },
    );
    return {
      message: typeof response.message === 'string' ? response.message : undefined,
      messageKey:
        typeof response.messageKey === 'string' ? response.messageKey : undefined,
      status: (response.status as AccountDeletionCancelResponse['status']) ?? 'none',
    } satisfies AccountDeletionCancelResponse;
  },

  verifyPassword: (
    scope: AccountDeletionScope,
    body: AccountDeletionVerifyPasswordBody,
  ) =>
    post<AccountDeletionVerifyPasswordResponse>(
      `${basePath(scope)}/delete-request/verify-password`,
      body,
      { locale: 'ar' },
    ),

  sendOtp: (scope: AccountDeletionScope, body: AccountDeletionSendOtpBody = {}) =>
    post<AccountDeletionSendOtpResponse>(
      `${basePath(scope)}/delete-request/send-otp`,
      body,
      { locale: 'ar' },
    ),

  confirmOtp: (scope: AccountDeletionScope, body: AccountDeletionConfirmBody) =>
    post<AccountDeletionConfirmResponse>(
      `${basePath(scope)}/delete-request/confirm`,
      body,
      { locale: 'ar' },
    ),

  requestDeletion: async (
    scope: AccountDeletionScope,
    body: AccountDeletionRequestBody,
  ) => {
    const response = await post<Record<string, unknown>>(
      `${basePath(scope)}/delete-request`,
      body,
      { locale: 'ar' },
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

  if (caps.verifyPassword) {
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
  if (!caps.sendOtp) {
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
      mapAccountDeletionGenericError(error, 'تعذّر إرسال رمز التحقق.'),
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

  if (caps.confirmOtp && trimmedOtp) {
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
  raw: Record<string, unknown>,
): DoctorRecoveryOtpStartResponse {
  return {
    message: typeof raw.message === 'string' ? raw.message : undefined,
    messageKey:
      typeof raw.messageKey === 'string' ? raw.messageKey : undefined,
    destination:
      typeof raw.destination === 'string'
        ? raw.destination
        : typeof raw.maskedDestination === 'string'
          ? raw.maskedDestination
          : undefined,
    channel:
      raw.channel === 'email' || raw.channel === 'whatsapp'
        ? raw.channel
        : undefined,
  };
}

function normalizeDoctorRecoveryVerifyResponse(
  raw: Record<string, unknown>,
): DoctorRecoveryOtpVerifyResponse {
  return {
    message: typeof raw.message === 'string' ? raw.message : undefined,
    messageKey:
      typeof raw.messageKey === 'string' ? raw.messageKey : undefined,
    status:
      raw.status === 'none' ||
      raw.status === 'requested' ||
      raw.status === 'pending' ||
      raw.status === 'deleted'
        ? raw.status
        : undefined,
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
    (email ? 'email' : phone ? 'whatsapp' : ('email' as DoctorRecoveryChannel));

  return { channel, email, phone };
}

export function resolveDoctorRecoveryDestination(
  identity: DoctorRecoveryIdentity,
  response?: DoctorRecoveryOtpStartResponse,
): string {
  if (response?.destination?.trim()) return response.destination.trim();
  return identity.channel === 'whatsapp'
    ? identity.phone || 'هاتفك'
    : identity.email || 'بريدك الإلكتروني';
}

export const doctorAccountRecoveryApi = {
  startOtp: async (body: DoctorRecoveryIdentity) => {
    try {
      const response = await post<Record<string, unknown>>(
        `${DOCTOR_RECOVERY_BASE}/start`,
        body,
        { locale: 'ar', omitAuth: true },
      );
      return normalizeDoctorRecoveryStartResponse(response);
    } catch (error) {
      throw new ApiError(
        error instanceof ApiError ? error.status : 500,
        error instanceof ApiError ? error.messageKey : null,
        error instanceof ApiError ? error.body : {},
        mapAccountDeletionGenericError(error, 'تعذّر إرسال رمز استرجاع الحساب.'),
      );
    }
  },

  verifyOtp: async (body: DoctorRecoveryIdentity & { otp: string }) => {
    try {
      const response = await post<Record<string, unknown>>(
        `${DOCTOR_RECOVERY_BASE}/verify`,
        body,
        { locale: 'ar', omitAuth: true },
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
        mapAccountDeletionGenericError(error, 'تعذّر التحقق من رمز الاسترجاع.'),
      );
    }
  },
};

export const doctorRestoreRequestApi = {
  startOtp: async (body: DoctorRecoveryIdentity) => {
    try {
      const response = await post<Record<string, unknown>>(
        `${DOCTOR_RESTORE_REQUEST_BASE}/start`,
        body,
        { locale: 'ar', omitAuth: true },
      );
      return normalizeDoctorRecoveryStartResponse(response);
    } catch (error) {
      throw new ApiError(
        error instanceof ApiError ? error.status : 500,
        error instanceof ApiError ? error.messageKey : null,
        error instanceof ApiError ? error.body : {},
        mapAccountDeletionGenericError(
          error,
          'تعذّر إرسال رمز طلب الاستعادة.',
        ),
      );
    }
  },

  verifyOtp: async (body: DoctorRestoreRequestOtpVerifyBody) => {
    try {
      const response = await post<Record<string, unknown>>(
        `${DOCTOR_RESTORE_REQUEST_BASE}/verify`,
        body,
        { locale: 'ar', omitAuth: true },
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
        mapAccountDeletionGenericError(error, 'تعذّر إرسال طلب الاستعادة.'),
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
      'البريد الإلكتروني مطلوب لإرسال رمز الاسترجاع.',
    );
  }
  if (identity.channel === 'whatsapp' && !identity.phone) {
    throw new ApiError(
      422,
      'errors.validation.missingPhone',
      {},
      'رقم الهاتف مطلوب لإرسال رمز الاسترجاع.',
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
      'البريد الإلكتروني مطلوب لإرسال رمز طلب الاستعادة.',
    );
  }
  if (identity.channel === 'whatsapp' && !identity.phone) {
    throw new ApiError(
      422,
      'errors.validation.missingPhone',
      {},
      'رقم الهاتف مطلوب لإرسال رمز طلب الاستعادة.',
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
