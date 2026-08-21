import { useLocation } from "react-router-dom";
import { readAuthUser } from "@/lib/cookies";
import { useSecretaryPermissions } from "@/hooks/secretary/useSecretaryPermissions";

type BillingPermission =
  | "billing:dashboard:view"
  | "billing:invoices:view"
  | "billing:invoices:manage"
  | "billing:payments:view"
  | "billing:payments:manage"
  | "billing:refunds:manage"
  | "billing:expenses:view"
  | "billing:expenses:manage"
  | "billing:reports:view"
  | "billing:reports:export"
  | "billing:settings:view"
  | "billing:settings:manage"
  | "billing:services:view"
  | "billing:services:manage";

const DOCTOR_BILLING_BASE = "/doctor/accounts";
const SECRETARY_BILLING_BASE = "/secretary/accounts";

export function resolveBillingBasePath(pathname: string, role?: string | null) {
  if (pathname.startsWith("/secretary/") || role === "secretary") {
    return SECRETARY_BILLING_BASE;
  }

  return DOCTOR_BILLING_BASE;
}

export function useBillingAccess() {
  const location = useLocation();
  const authUser = readAuthUser();
  const secretaryPermissions = useSecretaryPermissions();
  const isSecretary = authUser?.role === "secretary";
  const basePath = resolveBillingBasePath(location.pathname, authUser?.role);

  const hasPermission = (permission: BillingPermission) =>
    !isSecretary || secretaryPermissions.hasPermission(permission);

  return {
    isSecretary,
    basePath,
    canViewDashboard: hasPermission("billing:dashboard:view"),
    canViewInvoices: hasPermission("billing:invoices:view"),
    canManageInvoices: hasPermission("billing:invoices:manage"),
    canViewPayments: hasPermission("billing:payments:view"),
    canManagePayments: hasPermission("billing:payments:manage"),
    // Backend only recognizes billing:refunds:manage — there is no separate refunds:view key.
    canViewRefunds: hasPermission("billing:refunds:manage"),
    canManageRefunds: hasPermission("billing:refunds:manage"),
    canViewExpenses: hasPermission("billing:expenses:view"),
    canManageExpenses: hasPermission("billing:expenses:manage"),
    canViewReports: hasPermission("billing:reports:view"),
    canExportReports: hasPermission("billing:reports:export"),
    canViewSettings: hasPermission("billing:settings:view"),
    canManageSettings: hasPermission("billing:settings:manage"),
    canViewServices: hasPermission("billing:services:view"),
    canManageServices: hasPermission("billing:services:manage"),
  };
}
