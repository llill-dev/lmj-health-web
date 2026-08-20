import { lazyWithRetry } from "@/lib/routing/lazyWithRetry";

export const DataEntryDashboardPage = lazyWithRetry(
  () => import("@/pages/data-entry/dashboard/DataEntryDashboardPage"),
);

export const DataEntryMedicalContentPage = lazyWithRetry(
  () => import("@/pages/data-entry/medical-content/DataEntryMedicalContentPage"),
);

export const DataEntryContentTemplatesPage = lazyWithRetry(
  () =>
    import("@/pages/data-entry/content-templates/DataEntryContentTemplatesPage"),
);

export const DataEntryMedicalOrdersPage = lazyWithRetry(
  () => import("@/pages/data-entry/medical-orders/DataEntryMedicalOrdersPage"),
);

export const DataEntryServiceProvidersPage = lazyWithRetry(
  () =>
    import("@/pages/data-entry/service-providers/DataEntryServiceProvidersPage"),
);
