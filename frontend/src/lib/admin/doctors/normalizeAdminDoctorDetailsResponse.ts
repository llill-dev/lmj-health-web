import type {
  AdminDoctorDetailsDoctor,
  AdminDoctorDetailsResponse,
  VerificationRequestSummary,
} from '@/lib/admin/types';

type AdminDoctorDetailsApiRecord = {
  [key: string]: unknown;
};

type AdminDoctorDetailsUser = NonNullable<AdminDoctorDetailsDoctor['user']>;

function asVerificationRequestSummary(
  value: unknown,
): VerificationRequestSummary | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const record = asRecord(value);
  if (!record) return null;
  return (
    typeof (record._id ?? record.id) === 'string' ||
    typeof record.status === 'string' ||
    typeof record.doctorId === 'string'
  )
    ? (record as VerificationRequestSummary)
    : null;
}

function asAdminDoctorDetailsDoctor(
  value: unknown,
): AdminDoctorDetailsDoctor | undefined {
  const record = asRecord(value);
  if (!record) return undefined;
  return (
    typeof (record._id ?? record.id) === 'string' ||
    typeof record.status === 'string' ||
    typeof record.specialization === 'string' ||
    typeof record.email === 'string' ||
    typeof record.phone === 'string' ||
    typeof record.user === 'object'
  )
    ? (record as AdminDoctorDetailsDoctor)
    : undefined;
}

function pickTrimmedString(v: unknown): string | undefined {
  if (v == null || v === '') return undefined;
  const s = String(v).trim();
  return s || undefined;
}

function asRecord(v: unknown): AdminDoctorDetailsApiRecord | undefined {
  if (v === null || v === undefined) return undefined;
  if (typeof v === 'object' && !Array.isArray(v))
    return v as AdminDoctorDetailsApiRecord;
  return undefined;
}

/**
 * يجمع حقول المستخدم من `user`، أو `userId` المعبّأ، أو الحقول بالجذر (كما تفعل بعض نسخ الباكند).
 */
function mergeDoctorPersonalIntoUser(
  doctor: AdminDoctorDetailsDoctor,
): AdminDoctorDetailsDoctor {
  const d = asRecord(doctor) ?? {};
  const fromUser = asRecord(doctor.user);
  const uid = doctor.userId;
  const uidRec =
    uid !== null && uid !== undefined && typeof uid === 'object'
      ? asRecord(uid)
      : undefined;
  const doctorRoot = d;

  /** ترتيب الأولوية: user → userId المعبأ → جذر الطبيب */
  const pick = (...keyGroups: string[][]): string | undefined => {
    const sources = [fromUser, uidRec, doctorRoot].filter(
      (value): value is AdminDoctorDetailsApiRecord => Boolean(value),
    );
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

  const nextUser: AdminDoctorDetailsUser = {
    ...(fromUser ?? {}),
    fullName: fullName || pickTrimmedString(fromUser?.fullName) || '',
    ...(email ? { email } : {}),
    ...(phone ? { phone } : {}),
    ...(gender ? { gender } : {}),
    ...(dateOfBirth ? { dateOfBirth } : {}),
    ...(photoUrl ? { photoUrl } : {}),
  };

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
  const root = asRecord(res) ?? {};
  const payload =
    asRecord(root.data) ??
    asRecord(root.item) ??
    asRecord(root.result) ??
    root;

  const doctorCandidate =
    payload.doctor ??
    payload.data ??
    payload.item ??
    root.doctor;
  const doctor = asAdminDoctorDetailsDoctor(doctorCandidate);

  const verificationRequest = asVerificationRequestSummary(
    payload.verificationRequest ??
      payload.request ??
      payload.verification ??
      root.verificationRequest,
  );

  const pendingVerificationRequestId = [
    payload.pendingVerificationRequestId,
    payload.pendingRequestId,
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
