import {
  Building2,
  BookOpen,
  ClipboardList,
  Layers,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useMemo } from "react";
import PageDashboardOverview from "@/components/shared/dashboard/page-dashboard-overview";
import { useAdminMyContentList } from "@/hooks/admin/content/useAdminContent";
import { useAdminContentTemplates } from "@/hooks/admin/content-templates/useAdminContentTemplates";
import { useAdminMedicalOrderCatalog } from "@/hooks/admin/medical-orders/useAdminMedicalOrderCatalog";
import { useI18n } from "@/i18n/provider";

export default function DataEntryDashboardPage() {
  const { locale, dir, t } = useI18n();
  const myContentQuery = useAdminMyContentList({ page: 1, limit: 100 });
  const templatesQuery = useAdminContentTemplates({ page: 1, limit: 1 });
  const labQuery = useAdminMedicalOrderCatalog("lab");
  const imagingQuery = useAdminMedicalOrderCatalog("imaging");
  const procedureQuery = useAdminMedicalOrderCatalog("procedure");
  const numberLocale = locale === "ar" ? "ar-SA" : "en-US";
  const capabilityCards = useMemo(
    () => [
      {
        title: t("dataEntry.dashboard.cards.medicalContent.title"),
        description: t("dataEntry.dashboard.cards.medicalContent.description"),
        icon: BookOpen,
        href: "/data-entry/medical-content",
      },
      {
        title: t("dataEntry.dashboard.cards.contentTemplates.title"),
        description: t("dataEntry.dashboard.cards.contentTemplates.description"),
        icon: Layers,
        href: "/data-entry/content-templates",
      },
      {
        title: t("dataEntry.dashboard.cards.medicalOrders.title"),
        description: t("dataEntry.dashboard.cards.medicalOrders.description"),
        icon: ClipboardList,
        href: "/data-entry/medical-orders",
      },
      {
        title: t("dataEntry.dashboard.cards.serviceProviders.title"),
        description: t("dataEntry.dashboard.cards.serviceProviders.description"),
        icon: Building2,
        href: "/data-entry/service-providers",
      },
    ],
    [t],
  );

  const contentItemsCount = useMemo(() => {
    if (!myContentQuery.data) return 0;
    const raw =
      myContentQuery.data.items ??
      myContentQuery.data.content ??
      myContentQuery.data.contentItems ??
      [];
    return raw.length;
  }, [myContentQuery.data]);

  const medicalOrdersCount = useMemo(() => {
    const lab = labQuery.data?.items?.length ?? 0;
    const imaging = imagingQuery.data?.items?.length ?? 0;
    const procedure = procedureQuery.data?.items?.length ?? 0;
    return lab + imaging + procedure;
  }, [imagingQuery.data?.items, labQuery.data?.items, procedureQuery.data?.items]);

  const isLoadingKpis =
    myContentQuery.isAwaitingData ||
    templatesQuery.isAwaitingData ||
    labQuery.isAwaitingData ||
    imagingQuery.isAwaitingData ||
    procedureQuery.isAwaitingData;

  return (
    <>
      <Helmet>
        <title>{t("dataEntry.page.dashboard.title")}</title>
      </Helmet>

      <div dir={dir} lang={locale} className="pb-8 sm:pb-10">
        <PageDashboardOverview
          variant="admin"
          surface="mint"
          title={t("dataEntry.dashboard.hero.title")}
          subtitle={t("dataEntry.dashboard.hero.subtitle")}
          headerIcon={<ClipboardList className="h-8 w-8 text-white" />}
          kpiColumns={3}
          kpis={[
            {
              key: "my-content",
              icon: <BookOpen className="h-5 w-5 shrink-0" />,
              value: isLoadingKpis ? "…" : contentItemsCount.toLocaleString(numberLocale),
              label: t("dataEntry.dashboard.kpi.myContent"),
            },
            {
              key: "templates",
              icon: <Layers className="h-5 w-5 shrink-0" />,
              value: isLoadingKpis
                ? "…"
                : (templatesQuery.total ?? 0).toLocaleString(numberLocale),
              label: t("dataEntry.dashboard.kpi.templates"),
            },
            {
              key: "orders",
              icon: <ClipboardList className="h-5 w-5 shrink-0" />,
              value: isLoadingKpis ? "…" : medicalOrdersCount.toLocaleString(numberLocale),
              label: t("dataEntry.dashboard.kpi.orders"),
            },
          ]}
        />

        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {capabilityCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                to={card.href}
                className="rounded-[18px] border border-[#E6EEF5] bg-white px-5 py-5 text-right shadow-[0_14px_30px_rgba(15,23,42,0.06)]"
              >
                <div className="flex items-center justify-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#ECFEFF] text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="font-cairo text-[15px] font-extrabold text-[#111827]">
                    {card.title}
                  </h2>
                </div>
                <p className="mt-4 font-cairo text-[13px] font-semibold leading-7 text-[#667085]">
                  {card.description}
                </p>
              </Link>
            );
          })}
        </section>

        <section className="mt-5 rounded-[18px] border border-dashed border-[#BFE3E1] bg-[#F7FFFE] px-6 py-6 text-right">
          <h2 className="font-cairo text-[15px] font-extrabold text-primary">
            {t("dataEntry.dashboard.notes.title")}
          </h2>
          <p className="mt-3 font-cairo text-[13px] font-semibold leading-7 text-[#4B5563]">
            {t("dataEntry.dashboard.notes.body")}
          </p>
        </section>
      </div>
    </>
  );
}
