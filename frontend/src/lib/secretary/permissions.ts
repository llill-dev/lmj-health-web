import type { SecretarySidebarItemId } from "@/constant/sidebar-items";
import {
  ASSIGNABLE_SECRETARY_PERMISSIONS,
  type AssignableSecretaryPermission,
} from "@/lib/doctor/secretaries/permissionsUi";

export type SecretaryPermissionKey = AssignableSecretaryPermission;

export const secretaryRoutePermissionMap: Partial<
  Record<SecretarySidebarItemId, SecretaryPermissionKey[]>
> = {
  dashboard: [],
  patients: ["patients:view"],
  "create-temporary-patient": ["patients:temporary:create"],
  "book-appointment": ["appointments:book"],
  "doctor-schedule": ["schedule:view"],
  "patient-files": ["patients:files:view"],
  "doctors-directory": ["appointments:book"],
  appointments: ["appointments:view"],
  accounts: ["billing:dashboard:view"],
  "appointment-suggestions": ["waitlist:book"],
  waitlist: ["waitlist:view"],
  profile: [],
  notifications: [],
};

const SECRETARY_BILLING_FALLBACKS: Array<{
  path: string;
  required: SecretaryPermissionKey[];
}> = [
  { path: "/secretary/accounts", required: ["billing:dashboard:view"] },
  { path: "/secretary/accounts/invoices", required: ["billing:invoices:view"] },
  {
    path: "/secretary/accounts/invoices/new",
    required: ["billing:invoices:manage"],
  },
  { path: "/secretary/accounts/services", required: ["billing:services:view"] },
  { path: "/secretary/accounts/expenses", required: ["billing:expenses:view"] },
  {
    path: "/secretary/accounts/payments/new",
    required: ["billing:payments:manage"],
  },
  { path: "/secretary/accounts/reports", required: ["billing:reports:view"] },
  { path: "/secretary/accounts/settings", required: ["billing:settings:view"] },
];

export function hasSecretaryPermission(
  permissions: string[] | undefined,
  permission: SecretaryPermissionKey,
) {
  return Boolean(permissions?.includes(permission));
}

export function isSecretaryPermissionKey(
  permission: string,
): permission is SecretaryPermissionKey {
  return (
    ASSIGNABLE_SECRETARY_PERMISSIONS as readonly string[]
  ).includes(permission);
}

export function canAccessSecretaryItem(
  item: SecretarySidebarItemId,
  permissions: string[] | undefined,
) {
  if (item === "accounts") {
    return Boolean(
      permissions?.some((permission) => permission.startsWith("billing:")),
    );
  }

  const required = secretaryRoutePermissionMap[item];
  if (!required || required.length === 0) return true;
  return required.every((permission) => hasSecretaryPermission(permissions, permission));
}

export function getSecretaryBillingEntryPath(
  permissions: string[] | undefined,
): string {
  return (
    SECRETARY_BILLING_FALLBACKS.find((entry) =>
      entry.required.every((permission) =>
        hasSecretaryPermission(permissions, permission),
      ),
    )?.path ?? "/secretary/dashboard"
  );
}
