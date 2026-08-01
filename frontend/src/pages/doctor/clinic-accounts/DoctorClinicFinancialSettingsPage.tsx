'use client';

import {
  BookOpen,
  CheckCircle2,
  CreditCard,
  DollarSign,
  Percent,
  RefreshCw,
  Save,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import StyledSelect from '@/components/ui/styled-select';
import { useToast } from '@/components/ui/ToastProvider';
import {
  ClinicAccountsBanner,
  ClinicAccountsSubNav,
} from '@/components/doctor/clinic-accounts';
import { BillingSettingsToggle } from '@/components/doctor/clinic-accounts/billing-settings-toggle';
import DoctorListErrorState from '@/components/doctor/shared/doctor-list-error-state';
import { DoctorInlineDetailsSkeleton } from '@/components/doctor/shared/skeletons';
import {
  useBillingSettings,
  useUpdateBillingSettings,
} from '@/hooks/doctor/billing';
import { getUserFacingRequestErrorMessage } from '@/lib/api';
import type { ApiBillingPaymentMethod } from '@/lib/doctor/billing/apiTypes';
import {
  BILLING_DISCOUNT_PRESET_OPTIONS,
  BILLING_PAYMENT_METHOD_OPTIONS,
  formatBillingCurrencyOptionLabel,
} from '@/lib/doctor/billing/settingsUi';
import { useRetryAction } from '@/lib/query/useRetryAction';
import { cn } from '@/lib/utils/utils';
import { useBillingAccess } from '@/hooks/billing/useBillingAccess';

function sectionCardClassName() {
  return 'rounded-[16px] border border-[#EEF2F6] bg-white p-6 shadow-sm';
}

export default function DoctorClinicFinancialSettingsPage() {
  const { toast } = useToast();
  const { canManageSettings } = useBillingAccess();
  const settingsQuery = useBillingSettings();
  const updateSettings = useUpdateBillingSettings();
  const { retry: retrySettings, retrying: retryingSettings } = useRetryAction(
    () => settingsQuery.refetch(),
  );

  const [currency, setCurrency] = useState('USD');
  const [taxEnabled, setTaxEnabled] = useState(false);
  const [taxPercent, setTaxPercent] = useState('0');
  const [discountPresets, setDiscountPresets] = useState<number[]>([0, 10, 20, 30]);
  const [paymentMethods, setPaymentMethods] = useState<ApiBillingPaymentMethod[]>(
    ['cash', 'card', 'bank_transfer', 'insurance'],
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!settingsQuery.settings || hydrated) return;
    const settings = settingsQuery.settings;
    setCurrency(settings.currency ?? settingsQuery.currency ?? 'USD');
    setTaxEnabled(Boolean(settings.taxEnabled));
    setTaxPercent(String(settings.defaultTaxPercent ?? 0));
    setDiscountPresets(
      settings.discountPresets?.length
        ? [...settings.discountPresets]
        : [...BILLING_DISCOUNT_PRESET_OPTIONS],
    );
    setPaymentMethods(
      settings.allowedPaymentMethods?.length
        ? [...settings.allowedPaymentMethods]
        : BILLING_PAYMENT_METHOD_OPTIONS.map((m) => m.id),
    );
    setHydrated(true);
  }, [hydrated, settingsQuery.currency, settingsQuery.settings]);

  const currencyOptions = useMemo(() => {
    const list = settingsQuery.supportedCurrencies?.length
      ? settingsQuery.supportedCurrencies
      : [{ code: settingsQuery.currency ?? 'USD' }];
    return list.map((item) => ({
      value: item.code,
      label: formatBillingCurrencyOptionLabel(item.code, item.name),
    }));
  }, [settingsQuery.currency, settingsQuery.supportedCurrencies]);

  const toggleDiscountPreset = (value: number) => {
    setDiscountPresets((prev) => {
      if (prev.includes(value)) {
        if (prev.length <= 1) return prev;
        return prev.filter((item) => item !== value);
      }
      return [...prev, value].sort((a, b) => a - b);
    });
  };

  const togglePaymentMethod = (method: ApiBillingPaymentMethod) => {
    setPaymentMethods((prev) => {
      if (prev.includes(method)) {
        if (prev.length <= 1) return prev;
        return prev.filter((item) => item !== method);
      }
      return [...prev, method];
    });
  };

  const handleSave = async () => {
    const parsedTax = Number(taxPercent);
    if (taxEnabled && (Number.isNaN(parsedTax) || parsedTax < 0 || parsedTax > 100)) {
      toast('أدخل نسبة ضريبة بين 0 و 100.', {
        title: 'نسبة غير صالحة',
        variant: 'error',
      });
      return;
    }

    try {
      await updateSettings.mutateAsync({
        currency,
        taxEnabled,
        defaultTaxPercent: taxEnabled ? parsedTax : 0,
        discountPresets,
        allowedPaymentMethods: paymentMethods,
      });
      toast('تم حفظ الإعدادات المالية بنجاح.', {
        title: 'تم الحفظ',
        variant: 'success',
      });
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), {
        title: 'تعذّر حفظ الإعدادات',
        variant: 'error',
      });
    }
  };

  const handleMyHealthSync = () => {
    toast(
      'تكامل My Health غير متوفر في واجهة الفوترة حالياً (لا يوجد endpoint في API-3).',
      {
        title: 'My Health',
        variant: 'info',
        durationMs: 5200,
      },
    );
  };

  return (
    <>
      <Helmet>
        <title>الإعدادات المالية • LMJ Health</title>
      </Helmet>

      <div dir="rtl" lang="ar">
        <ClinicAccountsBanner
          title="الإعدادات المالية"
          subtitle="إعدادات العملة والضريبة والخصومات وطرق الدفع"
          icon={<BookOpen className="h-7 w-7 text-white sm:h-8 sm:w-8" />}
        />

        <ClinicAccountsSubNav />

        {settingsQuery.isError ? (
          <DoctorListErrorState
            title="تعذّر تحميل الإعدادات"
            brief={getUserFacingRequestErrorMessage(settingsQuery.error)}
            retrying={retryingSettings}
            onRetry={() => void retrySettings()}
          />
        ) : settingsQuery.isAwaitingData || !hydrated ? (
          <DoctorInlineDetailsSkeleton rows={6} />
        ) : (
          <div className="space-y-5">
            {!canManageSettings ? (
              <div className="rounded-[16px] border border-[#D0D5DD] bg-[#F8FAFC] p-4 text-right">
                <p className="font-cairo text-[13px] font-semibold text-[#667085]">
                  يمكنك مراجعة الإعدادات المالية فقط. تعديلها يتطلب صلاحية إدارة الإعدادات.
                </p>
              </div>
            ) : null}
            <section className={sectionCardClassName()}>
              <div className="mb-4 flex items-center gap-2 text-start">
                <DollarSign className="h-5 w-5 text-primary" aria-hidden />
                <h2 className="font-cairo text-[15px] font-extrabold text-[#111827]">
                  العملة
                </h2>
              </div>
              <StyledSelect
                options={currencyOptions}
                value={currency}
                onChange={setCurrency}
                listboxAriaLabel="العملة"
              />
            </section>

            <section className={sectionCardClassName()}>
              <div className="mb-4 flex items-center gap-2 text-start">
                <Percent className="h-5 w-5 text-primary" aria-hidden />
                <h2 className="font-cairo text-[15px] font-extrabold text-[#111827]">
                  الضريبة
                </h2>
              </div>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <span className="font-cairo text-[13px] font-bold text-[#667085]">
                  تفعيل الضريبة
                </span>
                <BillingSettingsToggle
                  checked={taxEnabled}
                  onChange={setTaxEnabled}
                  label="تفعيل الضريبة"
                />
              </div>
              {taxEnabled ? (
                <div>
                  <label className="mb-2 block text-start font-cairo text-[12px] font-bold text-[#667085]">
                    نسبة الضريبة (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step="0.01"
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(e.target.value)}
                    className="h-[48px] w-full rounded-[12px] border border-[#E5E7EB] bg-[#FAFAFA] px-4 font-cairo text-[13px] font-semibold outline-none focus:border-primary"
                  />
                </div>
              ) : null}
            </section>

            <section className={sectionCardClassName()}>
              <h2 className="mb-1 text-start font-cairo text-[15px] font-extrabold text-[#111827]">
                الخصومات
              </h2>
              <p className="mb-4 text-start font-cairo text-[12px] font-semibold text-[#98A2B3]">
                اختر نسب الخصم المتاحة عند إنشاء الفواتير
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {BILLING_DISCOUNT_PRESET_OPTIONS.map((preset) => {
                  const active = discountPresets.includes(preset);
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => toggleDiscountPreset(preset)}
                      className={cn(
                        'h-[52px] rounded-[12px] border-2 font-cairo text-[15px] font-extrabold transition',
                        active
                          ? 'border-primary bg-[#F0FDFA] text-primary'
                          : 'border-[#E5E7EB] bg-white text-[#667085] hover:border-primary/40',
                      )}
                    >
                      {preset}%
                    </button>
                  );
                })}
              </div>
            </section>

            <section className={sectionCardClassName()}>
              <div className="mb-4 flex items-center gap-2 text-start">
                <CreditCard className="h-5 w-5 text-primary" aria-hidden />
                <h2 className="font-cairo text-[15px] font-extrabold text-[#111827]">
                  طرق الدفع
                </h2>
              </div>
              <div className="space-y-4">
                {BILLING_PAYMENT_METHOD_OPTIONS.map((method) => (
                  <div
                    key={method.id}
                    className="flex flex-col gap-3 rounded-[12px] border border-[#F2F4F7] bg-[#FAFAFA] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                  >
                    <span className="font-cairo text-[14px] font-extrabold text-[#111827]">
                      {method.label}
                    </span>
                    <BillingSettingsToggle
                      checked={paymentMethods.includes(method.id)}
                      onChange={() => togglePaymentMethod(method.id)}
                      label={method.label}
                    />
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[16px] border border-[#9EE8E0] bg-[#F0FDFA] p-6 shadow-sm">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div className="text-start">
                  <p className="font-cairo text-[16px] font-extrabold text-[#111827]">
                    My Health
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <CheckCircle2
                      className="h-5 w-5 text-[#22C55E]"
                      aria-hidden
                    />
                    <div>
                      <p className="font-cairo text-[13px] font-extrabold text-[#111827]">
                        متصل
                      </p>
                      <p className="font-cairo text-[11px] font-semibold text-[#667085]">
                        المزامنة نشطة
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {canManageSettings ? (
                <button
                  type="button"
                  onClick={handleMyHealthSync}
                  className="inline-flex h-[48px] w-full items-center justify-center gap-2 rounded-[12px] border-2 border-primary bg-white font-cairo text-[14px] font-extrabold text-primary transition hover:bg-[#F0FDFA]"
                >
                  <RefreshCw className="h-4 w-4" aria-hidden />
                  مزامنة الآن
                </button>
              ) : null}
            </section>

            {canManageSettings ? (
              <button
                type="button"
                disabled={updateSettings.isPending}
                onClick={() => void handleSave()}
                className="inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white shadow-[0_10px_24px_rgba(15,143,139,0.22)] disabled:opacity-60"
              >
                <Save className="h-4 w-4" aria-hidden />
                {updateSettings.isPending ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
              </button>
            ) : null}
          </div>
        )}
      </div>
    </>
  );
}
