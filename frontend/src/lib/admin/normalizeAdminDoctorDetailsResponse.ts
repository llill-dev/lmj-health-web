import type {
  AdminDoctorDetailsDoctor,
  AdminDoctorDetailsResponse,
  VerificationRequestSummary,
} from '@/lib/admin/types';

/**
 * يوحّد شكل رد GET /api/admin/doctors/:id إن وُضع الحمولة داخل `data` أو كانت الحقول في الجذر.
 */
export function normalizeAdminDoctorDetailsResponse(
  res: AdminDoctorDetailsResponse,
): {
  doctor?: AdminDoctorDetailsDoctor;
  verificationRequest?: VerificationRequestSummary | null;
  pendingVerificationRequestId?: string;
} {
  const root = res as unknown as Record<string, unknown>;
  const payload =
    root.data && typeof root.data === 'object' && root.data !== null
      ? (root.data as Record<string, unknown>)
      : root;

  const doctor = (payload.doctor ?? root.doctor) as
    | AdminDoctorDetailsDoctor
    | undefined;

  const verificationRequest = (payload.verificationRequest ??
    root.verificationRequest ??
    null) as VerificationRequestSummary | null;

  const pendingVerificationRequestId = [
    payload.pendingVerificationRequestId,
    root.pendingVerificationRequestId,
    doctor?.pendingVerificationRequestId,
  ].find((x): x is string => typeof x === 'string');

  return { doctor, verificationRequest, pendingVerificationRequestId };
}
