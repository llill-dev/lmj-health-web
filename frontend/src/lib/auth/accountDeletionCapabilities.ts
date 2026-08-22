import type { AccountDeletionScope } from '@/lib/auth/accountDeletionTypes';

export type AccountDeletionCapabilities = {
  verifyPassword: boolean;
  sendOtp: boolean;
  confirmOtp: boolean;
  deletionStatus: boolean;
  /** إلغاء الحذف عبر POST /me/delete-cancel (المريض). */
  cancel: boolean;
  /** استرجاع الحساب عبر OTP عام (الطبيب) خلال نافذة 7 أيام. */
  recoveryOtp: boolean;
  /** طلب استعادة بعد انتهاء النافذة (الطبيب — مراجعة إدارية). */
  restoreRequestOtp: boolean;
};

/**
 * قدرات الـ API حسب النطاق:
 * - patient: تدفق كامل (verify-password / send-otp / confirm / deletion-status / delete-cancel)
 * - doctor: delete-request + deletion-status؛ الاسترجاع عبر /account-deletion/recovery/* (OTP عام)
 */
export const ACCOUNT_DELETION_CAPABILITIES: Record<
  AccountDeletionScope,
  AccountDeletionCapabilities
> = {
  patient: {
    verifyPassword: true,
    sendOtp: true,
    confirmOtp: true,
    deletionStatus: true,
    cancel: true,
    recoveryOtp: false,
    restoreRequestOtp: false,
  },
  doctor: {
    verifyPassword: false,
    sendOtp: false,
    confirmOtp: false,
    deletionStatus: true,
    cancel: false,
    recoveryOtp: true,
    restoreRequestOtp: true,
  },
};

export function getAccountDeletionCapabilities(
  scope: AccountDeletionScope,
): AccountDeletionCapabilities {
  return ACCOUNT_DELETION_CAPABILITIES[scope];
}
