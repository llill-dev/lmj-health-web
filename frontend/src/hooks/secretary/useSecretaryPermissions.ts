import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { readAuthUser } from "@/lib/cookies";
import { doctorSecretariesApi } from "@/lib/doctor/secretaries/client";
import {
  canAccessSecretaryItem,
  hasSecretaryPermission,
  type SecretaryPermissionKey,
} from "@/lib/secretary/permissions";
import type { SecretarySidebarItemId } from "@/constant/sidebar-items";

export function useSecretaryPermissions() {
  const authUser = readAuthUser();
  const secretaryId = authUser?.actorIds?.secretaryId?.trim() || "";

  const query = useQuery({
    queryKey: ["secretary", "permissions", secretaryId],
    queryFn: () => doctorSecretariesApi.get(secretaryId),
    enabled: Boolean(secretaryId),
    staleTime: 60_000,
  });

  const permissions = useMemo(
    () => query.data?.permissions ?? [],
    [query.data?.permissions],
  );

  return {
    ...query,
    secretaryId,
    permissions,
    hasPermission: (permission: SecretaryPermissionKey) =>
      hasSecretaryPermission(permissions, permission),
    canAccessItem: (item: SecretarySidebarItemId) =>
      canAccessSecretaryItem(item, permissions),
  };
}
