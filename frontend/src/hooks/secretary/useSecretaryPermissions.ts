import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { readAuthUser } from "@/lib/cookies";
import { get } from "@/lib/api";
import {
  canAccessSecretaryItem,
  hasSecretaryPermission,
  type SecretaryPermissionKey,
} from "@/lib/secretary/permissions";
import type { SecretarySidebarItemId } from "@/constant/sidebar-items";

type SecretaryPermissionsPayload = {
  _id?: string;
  id?: string;
  permissions?: string[];
  secretary?: {
    _id?: string;
    id?: string;
    permissions?: string[];
  };
};

function normalizePermissionsPayload(raw: unknown): SecretaryPermissionsPayload | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const record = raw as Record<string, unknown>;
  const secretary =
    record.secretary && typeof record.secretary === "object" && !Array.isArray(record.secretary)
      ? (record.secretary as Record<string, unknown>)
      : undefined;

  const toStringArray = (value: unknown): string[] | undefined =>
    Array.isArray(value)
      ? value.filter((item): item is string => typeof item === "string")
      : undefined;

  return {
    _id: typeof record._id === "string" ? record._id : undefined,
    id: typeof record.id === "string" ? record.id : undefined,
    permissions: toStringArray(record.permissions),
    secretary: secretary
      ? {
          _id: typeof secretary._id === "string" ? secretary._id : undefined,
          id: typeof secretary.id === "string" ? secretary.id : undefined,
          permissions: toStringArray(secretary.permissions),
        }
      : undefined,
  };
}

export function useSecretaryPermissions() {
  const authUser = readAuthUser();
  const primarySecretaryIdentifier =
    authUser?.actorIds?.secretaryId?.trim() || authUser?.userId?.trim() || "";

  const query = useQuery({
    queryKey: ["secretary", "permissions", primarySecretaryIdentifier],
    queryFn: async () => {
      // Secretary role can access this endpoint; `/api/secretaries/me` returns 403.
      const response = await get<unknown>("/api/secretaries/me/doctor");
      return normalizePermissionsPayload(response);
    },
    enabled: Boolean(primarySecretaryIdentifier),
    staleTime: 60_000,
    retry: false,
    refetchOnWindowFocus: true,
  });

  const permissions = useMemo(() => {
    const direct = query.data?.permissions ?? [];
    const nested = query.data?.secretary?.permissions ?? [];
    const merged = [...direct, ...nested];
    return [...new Set(merged)];
  }, [query.data?.permissions, query.data?.secretary?.permissions]);

  return {
    ...query,
    secretaryId:
      query.data?.secretary?._id ??
      query.data?.secretary?.id ??
      query.data?._id ??
      query.data?.id ??
      primarySecretaryIdentifier,
    permissions,
    hasPermission: (permission: SecretaryPermissionKey) =>
      hasSecretaryPermission(permissions, permission),
    canAccessItem: (item: SecretarySidebarItemId) =>
      canAccessSecretaryItem(item, permissions),
  };
}
