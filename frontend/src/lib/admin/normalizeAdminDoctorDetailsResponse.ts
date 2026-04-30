import type {
  AdminDoctorDetailsDoctor,
  AdminDoctorDetailsResponse,
  VerificationRequestSummary,
} from '@/lib/admin/types';

function pickTrimmedString(v: unknown): string | undefined {
  if (v == null || v === '') return undefined;
  const s = String(v).trim();
  return s || undefined;
}

function asRecord(v: unknown): Record<string, unknown> | undefined {
  if (v === null || v === undefined) return undefined;
  if (typeof v === 'object' && !Array.isArray(v))
    return v as Record<string, unknown>;
  return undefined;
}

/**
 * يجمع حقول المستخدم من `user`، أو `userId` المعبّأ، أو الحقول بالجذر (كما تفعل بعض نسخ الباكند).
 */
function mergeDoctorPersonalIntoUser(
  doctor: AdminDoctorDetailsDoctor,
): AdminDoctorDetailsDoctor {
  const d = doctor as unknown as Record<string, unknown>;
  const fromUser = asRecord(doctor.user);
  const uid = doctor.userId;
  const uidRec =
    uid !== null && uid !== undefined && typeof uid === 'object'
      ? asRecord(uid)
      : undefined;
  const doctorRoot = d;

  /** ترتيب الأولوية: user → userId المعبأ → جذر الطبيب */
  const pick = (...keyGroups: string[][]): string | undefined => {
    const sources = [fromUser, uidRec, doctorRoot].filter(Boolean) as Record<
      string,
      unknown
    >[];
    for (const keys of keyGroups) {
      for (const src of sources) {
        for (const k of keys) {
          const t = pickTrimmedString(src[k]);
          if (t) return t;
        }
      }
    }
    return undefined;
  };

  const fullName = (
    pick(['fullName'], ['name']) ??
    pickTrimmedString(fromUser?.fullName) ??
    ''
  ).trim();

  const email = pick(['email'], ['e_mail', 'emailAddress']);
  const phone = pick(['phone'], ['mobile', 'phoneNumber', 'nationalPhone']);
  const gender = pick(['gender'], ['sex']);
  const dateOfBirth = pick(
    ['dateOfBirth'],
    ['birthDate', 'birthdate', 'date_of_birth', 'dob'],
  );
  const photoUrl = pick(['photoUrl'], ['avatar', 'avatarUrl', 'image']);

  const nextUser = {
    ...(fromUser ?? {}),
    fullName: fullName || pickTrimmedString(fromUser?.fullName) || '',
    ...(email ? { email } : {}),
    ...(phone ? { phone } : {}),
    ...(gender ? { gender } : {}),
    ...(dateOfBirth ? { dateOfBirth } : {}),
    ...(photoUrl ? { photoUrl } : {}),
  } as NonNullable<AdminDoctorDetailsDoctor['user']>;

  return { ...doctor, user: nextUser };
}

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

  const doctorNormalized = doctor ? mergeDoctorPersonalIntoUser(doctor) : undefined;

  return {
    doctor: doctorNormalized,
    verificationRequest,
    pendingVerificationRequestId,
  };
}
