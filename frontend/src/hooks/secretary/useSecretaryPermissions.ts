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
  const secretaryIdentifiers = useMemo(() => {
    const candidates = [
      authUser?.actorIds?.secretaryId?.trim() || "",
      authUser?.userId?.trim() || "",
    ].filter(Boolean);
    return [...new Set(candidates)];
  }, [authUser?.actorIds?.secretaryId, authUser?.userId]);
  const primarySecretaryIdentifier = secretaryIdentifiers[0] || "";

  const query = useQuery({
    queryKey: ["secretary", "permissions", ...secretaryIdentifiers],
    queryFn: async () => {
      let lastError: unknown = null;
      for (const identifier of secretaryIdentifiers) {
        try {
          const result = await doctorSecretariesApi.get(identifier);
          if (result) return result;
        } catch (error) {
          lastError = error;
        }
      }
      if (lastError) throw lastError;
      return null;
    },
    enabled: secretaryIdentifiers.length > 0,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const permissions = useMemo(
    () => query.data?.permissions ?? [],
    [query.data?.permissions],
  );

  return {
    ...query,
    secretaryId: query.data?._id ?? primarySecretaryIdentifier,
    permissions,
    hasPermission: (permission: SecretaryPermissionKey) =>
      hasSecretaryPermission(permissions, permission),
    canAccessItem: (item: SecretarySidebarItemId) =>
      canAccessSecretaryItem(item, permissions),
  };
}
