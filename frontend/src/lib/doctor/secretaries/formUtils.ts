import { ASSIGNABLE_SECRETARY_PERMISSIONS } from "@/lib/doctor/secretaries/permissionsUi";
import type {
  DoctorSecretary,
  DoctorSecretaryUser,
} from "@/lib/doctor/secretaries/types";
import { PHONE_DIAL_CODES } from "@/lib/phone/dialCodes";

export type SecretaryGender = "Male" | "Female";
type DoctorSecretaryApiRecord = {
  user?: unknown;
  userId?: unknown;
  _id?: unknown;
  id?: unknown;
  fullName?: unknown;
  email?: unknown;
  phone?: unknown;
  gender?: unknown;
  accountStatus?: unknown;
  photoUrl?: unknown;
  permissions?: unknown;
  assignedDoctor?: unknown;
  [key: string]: unknown;
};

function asDoctorSecretaryApiRecord(
  value: unknown,
): DoctorSecretaryApiRecord | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : null;
}

export function normalizeSecretaryGender(value?: string): SecretaryGender {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "male" || normalized === "m") return "Male";
  return "Female";
}

export function filterAssignablePermissions(permissions: string[] = []) {
  const allowed = new Set<string>(ASSIGNABLE_SECRETARY_PERMISSIONS);
  return permissions.filter((permission) => allowed.has(permission));
}

function parsePhoneNumber(phone: string): {
  countryCode: string;
  localNumber: string;
} {
  const trimmed = phone.trim();
  if (!trimmed) {
    return { countryCode: "+963", localNumber: "" };
  }

  // Try to find matching country code
  const sortedCodes = [...PHONE_DIAL_CODES].sort((a, b) => b.length - a.length);
  for (const code of sortedCodes) {
    if (trimmed.startsWith(code) && trimmed.length > code.length) {
      return {
        countryCode: code,
        localNumber: trimmed.slice(code.length),
      };
    }
  }

  // Default to Syria if no match
  if (/^\d+$/.test(trimmed)) {
    return { countryCode: "+963", localNumber: trimmed };
  }

  return { countryCode: "+963", localNumber: "" };
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function resolveSecretaryUser(
  raw: DoctorSecretaryApiRecord,
): DoctorSecretaryUser | undefined {
  const nestedUser = asDoctorSecretaryApiRecord(raw.user);
  if (nestedUser) {
    const userRecord = nestedUser;
    const fullName = readString(userRecord.fullName);
    if (fullName) {
      return {
        _id: readString(userRecord._id),
        fullName,
        email: readString(userRecord.email),
        phone: readString(userRecord.phone),
        gender: readString(userRecord.gender),
        accountStatus: readString(userRecord.accountStatus),
        photoUrl: readString(userRecord.photoUrl),
      };
    }
  }

  const populatedUserId = asDoctorSecretaryApiRecord(raw.userId);
  if (populatedUserId) {
    const userRecord = populatedUserId;
    const fullName = readString(userRecord.fullName);
    if (fullName) {
      return {
        _id: readString(userRecord._id),
        fullName,
        email: readString(userRecord.email),
        phone: readString(userRecord.phone),
        gender: readString(userRecord.gender),
        accountStatus: readString(userRecord.accountStatus),
        photoUrl: readString(userRecord.photoUrl),
      };
    }
  }

  const fullName = readString(raw.fullName);
  if (!fullName) return undefined;

  return {
    fullName,
    email: readString(raw.email),
    phone: readString(raw.phone),
    gender: readString(raw.gender),
    accountStatus: readString(raw.accountStatus),
    photoUrl: readString(raw.photoUrl),
  };
}

/** Normalizes list/detail/create API shapes into one secretary model. */
export function normalizeDoctorSecretary(raw: unknown): DoctorSecretary | null {
  const record = asDoctorSecretaryApiRecord(raw);
  if (!record) return null;
  const id = readString(record._id) ?? readString(record.id);
  if (!id) return null;

  const user = resolveSecretaryUser(record);
  const userId =
    typeof record.userId === "string"
      ? record.userId
      : (user?._id ?? readString(asDoctorSecretaryApiRecord(record.userId)?._id));

  return {
    _id: id,
    id,
    userId,
    permissions: Array.isArray(record.permissions)
      ? record.permissions.filter(
          (item): item is string => typeof item === "string",
        )
      : undefined,
    assignedDoctor:
      typeof record.assignedDoctor === "string"
        ? record.assignedDoctor
        : undefined,
    user,
    fullName: user?.fullName ?? readString(record.fullName),
    email: user?.email ?? readString(record.email),
    phone: user?.phone ?? readString(record.phone),
    gender: user?.gender ?? readString(record.gender),
  };
}

export function getSecretaryId(
  secretary?: DoctorSecretary | null,
): string | null {
  if (!secretary) return null;
  return secretary._id ?? secretary.id ?? null;
}

export function resolveSecretaryFormValues(secretary: DoctorSecretary) {
  const fullName =
    secretary.user?.fullName?.trim() ?? secretary.fullName?.trim() ?? "";
  const email = secretary.user?.email?.trim() ?? secretary.email?.trim() ?? "";
  const phoneString =
    secretary.user?.phone?.trim() ?? secretary.phone?.trim() ?? "";
  const phone = parsePhoneNumber(phoneString);
  const gender = normalizeSecretaryGender(
    secretary.user?.gender ?? secretary.gender,
  );

  return {
    fullName,
    email,
    phone,
    gender,
    permissions: filterAssignablePermissions(secretary.permissions ?? []),
  };
}
