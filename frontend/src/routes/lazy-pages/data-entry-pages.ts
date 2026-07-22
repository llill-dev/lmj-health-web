import { lazy } from "react";

export const DataEntryDashboardPage = lazy(
  () => import("@/pages/data-entry/dashboard/DataEntryDashboardPage"),
);

export const DataEntryMedicalContentPage = lazy(
  () => import("@/pages/data-entry/medical-content/DataEntryMedicalContentPage"),
);

export const DataEntryContentTemplatesPage = lazy(
  () =>
    import("@/pages/data-entry/content-templates/DataEntryContentTemplatesPage"),
);

export const DataEntryMedicalOrdersPage = lazy(
  () => import("@/pages/data-entry/medical-orders/DataEntryMedicalOrdersPage"),
);

export const DataEntryServiceProvidersPage = lazy(
  () =>
    import("@/pages/data-entry/service-providers/DataEntryServiceProvidersPage"),
);
