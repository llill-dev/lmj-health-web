import { ClipboardList, LayoutGrid, ShieldCheck } from "lucide-react";
import { Helmet } from "react-helmet-async";
import PageDashboardOverview from "@/components/shared/dashboard/page-dashboard-overview";

const capabilityCards = [
  {
    title: "وصول آمن وموجّه",
    description:
      "تم تفعيل مسار مستقل لدور مدخل البيانات مع حماية مخصصة تمنع الوصول إلى مسارات الأطباء أو الإدارة.",
    icon: ShieldCheck,
  },
  {
    title: "واجهة جاهزة للتوسعة",
    description:
      "هذه اللوحة هي نقطة الانطلاق الرسمية لإضافة الشاشات التشغيلية المعتمدة من الـ API بدون مسارات ميتة.",
    icon: LayoutGrid,
  },
  {
    title: "سير عمل واضح",
    description:
      "تم تثبيت تسجيل الدخول، إعادة التوجيه، والتنقل الأساسي حتى تصبح إضافة صفحات الإدخال الفعلية آمنة وسهلة.",
    icon: ClipboardList,
  },
];

export default function DataEntryDashboardPage() {
  return (
    <>
      <Helmet>
        <title>Data Entry Dashboard • LMJ Health</title>
      </Helmet>

      <div dir="rtl" lang="ar" className="pb-8 sm:pb-10">
        <PageDashboardOverview
          variant="admin"
          surface="mint"
          title="لوحة مدخل البيانات"
          subtitle="منطقة عمل مهيأة للمهام التشغيلية الأساسية مع مسار دخول آمن وواضح."
          headerIcon={<ClipboardList className="h-8 w-8 text-white" />}
          kpiColumns={3}
          kpis={[
            {
              key: "auth",
              icon: <ShieldCheck className="h-5 w-5 shrink-0" />,
              value: "جاهز",
              label: "المصادقة والحماية",
            },
            {
              key: "routing",
              icon: <LayoutGrid className="h-5 w-5 shrink-0" />,
              value: "نشط",
              label: "المسار الرئيسي",
            },
            {
              key: "foundation",
              icon: <ClipboardList className="h-5 w-5 shrink-0" />,
              value: "مهيأ",
              label: "أساس التوسعة القادمة",
            },
          ]}
        />

        <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {capabilityCards.map((card) => {
            const Icon = card.icon;
            return (
              <article
                key={card.title}
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
              </article>
            );
          })}
        </section>

        <section className="mt-5 rounded-[18px] border border-dashed border-[#BFE3E1] bg-[#F7FFFE] px-6 py-6 text-right">
          <h2 className="font-cairo text-[15px] font-extrabold text-primary">
            ملاحظات هذه النسخة
          </h2>
          <p className="mt-3 font-cairo text-[13px] font-semibold leading-7 text-[#4B5563]">
            تم إطلاق لوحة تشغيلية أولى لدور مدخل البيانات بدون اختراع تدفقات غير
            موثقة. أي شاشة إدخال إضافية يجب أن تُربط فقط بعد التحقق من endpoints
            المعتمدة لهذا الدور في الـ API.
          </p>
        </section>
      </div>
    </>
  );
}
