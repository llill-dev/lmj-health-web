import type { SecretarySidebarItemId } from "@/constant/sidebar-items";
import type { AssignableSecretaryPermission } from "@/lib/doctor/secretaries/permissionsUi";

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
  "appointment-suggestions": ["waitlist:book"],
  waitlist: ["waitlist:view"],
  profile: [],
  notifications: [],
};

export function hasSecretaryPermission(
  permissions: string[] | undefined,
  permission: SecretaryPermissionKey,
) {
  return Boolean(permissions?.includes(permission));
}

export function canAccessSecretaryItem(
  item: SecretarySidebarItemId,
  permissions: string[] | undefined,
) {
  const required = secretaryRoutePermissionMap[item];
  if (!required || required.length === 0) return true;
  return required.every((permission) => hasSecretaryPermission(permissions, permission));
}
