'use client';

import { BookOpen, Plus, Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/ToastProvider';
import StyledSelect from '@/components/ui/styled-select';
import {
  ClinicAccountsBanner,
  ClinicAccountsSubNav,
  InvoiceSummaryCard,
} from '@/components/doctor/clinic-accounts';
import {
  useBillingSettings,
  useBillingInvoicePrefill,
  useCreateBillingInvoice,
} from '@/hooks/doctor/billing';
import { useDoctorPatients } from '@/hooks/doctor';
import { getUserFacingRequestErrorMessage } from '@/lib/api';
import { formatBillingAmount } from '@/lib/doctor/billing/format';
import { BILLING_DISCOUNT_PRESET_OPTIONS } from '@/lib/doctor/billing/settingsUi';
import { useBillingAccess } from '@/hooks/billing/useBillingAccess';
import { useSecretaryPermissions } from '@/hooks/secretary/useSecretaryPermissions';
import { useI18n } from '@/i18n/provider';

type LineItem = {
  id: string;
  service: string;
  quantity: number;
  price: number;
};

export default function DoctorClinicCreateInvoicePage() {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === 'ar' ? ar : en);
  const navigate = useNavigate();
  const { basePath, canViewSettings, isSecretary } = useBillingAccess();
  const { hasPermission: hasSecretaryPermission } = useSecretaryPermissions();
  const canViewPatients = !isSecretary || hasSecretaryPermission('patients:view');
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('appointmentId');
  const { toast } = useToast();
  const settingsQuery = useBillingSettings(!isSecretary || canViewSettings);
  const prefillQuery = useBillingInvoicePrefill(appointmentId);
  const createInvoice = useCreateBillingInvoice();
  const patientsQuery = useDoctorPatients({ page: 1, limit: 100 }, canViewPatients);

  const [patientId, setPatientId] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [customDiscount, setCustomDiscount] = useState('0');
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState<LineItem[]>([
    { id: '1', service: '', quantity: 1, price: 0 },
  ]);
  const [prefillApplied, setPrefillApplied] = useState(false);

  useEffect(() => {
    const prefill = prefillQuery.prefill;
    if (!prefill || prefillApplied) return;

    if (prefill.patient?.id) {
      setPatientId(prefill.patient.id);
    }
    if (prefill.suggestedDueAt) {
      setDueDate(prefill.suggestedDueAt.slice(0, 10));
    }
    if (prefill.items?.length) {
      setItems(
        prefill.items.map((item, index) => ({
          id: String(index + 1),
          service: item.serviceNameSnapshot?.trim() || item.description?.trim() || '',
          quantity: item.quantity ?? 1,
          price: item.unitPrice ?? 0,
        })),
      );
    }
    setPrefillApplied(true);
  }, [prefillApplied, prefillQuery.prefill]);

  const currency = settingsQuery.currency;
  const taxPercent = settingsQuery.settings?.defaultTaxPercent ?? 0;
  const taxEnabled = Boolean(settingsQuery.settings?.taxEnabled);
  const discountPresets = useMemo(
    () =>
      settingsQuery.settings?.discountPresets?.length
        ? settingsQuery.settings.discountPresets
        : [...BILLING_DISCOUNT_PRESET_OPTIONS],
    [settingsQuery.settings?.discountPresets],
  );

  const patientOptions = useMemo(
    () =>
      (patientsQuery.patients ?? []).map((patient) => ({
        value: patient._id,
        label: patient.user?.fullName?.trim() || patient._id,
      })),
    [patientsQuery.patients],
  );

  const selectedPatient = patientsQuery.patients.find(
    (patient) => patient._id === patientId,
  );

  const totals = useMemo(() => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0,
    );
    const discount = subtotal * (discountPercent / 100);
    const afterDiscount = subtotal - discount;
    const tax = taxEnabled ? afterDiscount * (taxPercent / 100) : 0;
    const total = afterDiscount + tax;
    return { subtotal, discount, tax, total };
  }, [discountPercent, items, taxEnabled, taxPercent]);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { id: String(Date.now()), service: '', quantity: 1, price: 0 },
    ]);
  };

  const updateItem = (id: string, patch: Partial<LineItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  };

  const submitInvoice = async (status: 'draft' | 'issued') => {
    if (!patientId) {
      toast(tr('يرجى اختيار مريض من قائمة مرضاك.', 'Please select a patient from your patient list.'), {
        title: tr('مريض مطلوب', 'Patient required'),
        variant: 'error',
      });
      return;
    }

    const validItems = items.filter(
      (item) => item.service.trim() && item.quantity > 0 && item.price > 0,
    );
    if (!validItems.length) {
      toast(tr('أضف بنداً واحداً على الأقل مع اسم الخدمة والسعر.', 'Add at least one item with a service name and price.'), {
        title: tr('بنود ناقصة', 'Missing items'),
        variant: 'error',
      });
      return;
    }

    try {
      await createInvoice.mutateAsync({
        patientId,
        sourceType: appointmentId ? 'visit' : 'manual',
        appointmentId: appointmentId ?? undefined,
        status,
        discountPercent,
        items: validItems.map((item) => ({
          serviceNameSnapshot: item.service.trim(),
          quantity: item.quantity,
          unitPrice: item.price,
        })),
        dueAt: dueDate ? new Date(dueDate).toISOString() : undefined,
      });

      toast(
        status === 'issued'
          ? tr('تم إصدار الفاتورة بنجاح.', 'The invoice was issued successfully.')
          : tr('تم حفظ المسودة.', 'The draft was saved.'),
        {
          title: status === 'issued' ? tr('تم الإصدار', 'Issued') : tr('مسودة', 'Draft'),
          variant: 'success',
        },
      );
      navigate(`${basePath}/invoices`);
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), {
        title: tr('تعذّر إنشاء الفاتورة', 'Could not create the invoice'),
        variant: 'error',
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>
          {tr('إنشاء فاتورة • LMJ Health', 'Create Invoice • LMJ Health')}
        </title>
      </Helmet>

      <div dir={dir} lang={locale}>
        <ClinicAccountsBanner
          title={tr('إنشاء فاتورة', 'Create invoice')}
          subtitle={tr(
            'إصدار فاتورة جديدة للمريض',
            'Issue a new invoice for the patient',
          )}
          icon={<BookOpen className="w-7 h-7 text-white sm:h-8 sm:w-8" />}
        />

        <ClinicAccountsSubNav />

        <div className="space-y-5">
          <section className="rounded-[16px] border border-[#EEF2F6] bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-start font-cairo text-[15px] font-extrabold text-[#111827]">
              {tr('المريض', 'Patient')}
            </h2>
            {!canViewPatients ? (
              <p className="rounded-[10px] border border-dashed border-[#FDA29B] bg-[#FEF3F2] px-4 py-3 text-start font-cairo text-[12px] font-semibold text-[#B42318]">
                {tr(
                  'يتطلب اختيار مريض صلاحية عرض المرضى (patients:view)، وهي غير مفعّلة على حسابك حالياً.',
                  'Selecting a patient requires the view-patients permission (patients:view), which is not enabled on your account currently.',
                )}
              </p>
            ) : (
              <>
                <StyledSelect
                  options={patientOptions}
                  value={patientId}
                  onChange={setPatientId}
                  placeholder={tr('اختر المريض', 'Choose the patient')}
                  emptyTriggerLabel={tr('لا يوجد مرضى في القائمة', 'No patients in the list')}
                  emptyState={tr(
                    'لا يوجد مرضى مرتبطون بحسابك. أضف مريضاً من صفحة المرضى أولاً.',
                    'No patients are linked to your account. Add a patient from the patients page first.',
                  )}
                  disabled={patientsQuery.isAwaitingData}
                />
                {selectedPatient ? (
                  <p className="mt-2 text-start font-cairo text-[12px] font-semibold text-[#667085]">
                    {tr('المريض المختار:', 'Selected patient:')} {selectedPatient.user?.fullName}
                  </p>
                ) : null}
              </>
            )}
          </section>

          <section className="rounded-[16px] border border-[#EEF2F6] bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-start font-cairo text-[15px] font-extrabold text-[#111827]">
              {tr('الخصم وتاريخ الاستحقاق', 'Discount and due date')}
            </h2>
            {settingsQuery.isError || (isSecretary && !canViewSettings) ? (
              <p className="mb-4 rounded-[10px] border border-dashed border-[#FDA29B] bg-[#FEF3F2] px-4 py-3 text-start font-cairo text-[12px] font-semibold text-[#B42318]">
                {tr(
                  'تعذّر تحميل إعدادات الفوترة الفعلية (العملة، الضريبة، الخصومات) — القيم أدناه افتراضية ولا تعكس بالضرورة إعدادات الطبيب.',
                  "Could not load the actual billing settings (currency, tax, discounts) — the values below are defaults and may not reflect the doctor's actual settings.",
                )}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2 justify-start mb-4">
              {discountPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setDiscountPercent(preset);
                    setCustomDiscount(String(preset));
                  }}
                  className={
                    discountPercent === preset
                      ? "rounded-[10px] bg-primary px-4 py-2 font-cairo text-[12px] font-extrabold text-white"
                      : "rounded-[10px] border border-[#EEF2F6] bg-white px-4 py-2 font-cairo text-[12px] font-extrabold text-[#667085]"
                  }
                >
                  {preset}%
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <input
                type="number"
                min={0}
                max={100}
                value={customDiscount}
                onChange={(e) => {
                  setCustomDiscount(e.target.value);
                  const clamped = Math.min(100, Math.max(0, Number(e.target.value) || 0));
                  setDiscountPercent(clamped);
                }}
                placeholder={tr('خصم مخصص (%)', 'Custom discount (%)')}
                className="h-[44px] w-full rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[13px] font-semibold outline-none focus:border-primary"
              />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-[44px] w-full rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[13px] font-semibold outline-none focus:border-primary"
              />
            </div>
          </section>

          <section className="rounded-[16px] border border-[#EEF2F6] bg-white p-6 shadow-sm">
            <div className='flex justify-between items-center mb-4'>
              <h2 className="mb-4 text-start font-cairo text-[15px] font-extrabold text-[#111827]">
                {tr('البنود', 'Items')}
              </h2>
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={addItem}
                  className="inline-flex items-center gap-2 rounded-[10px] border border-primary px-4 py-2 font-cairo text-[12px] font-extrabold text-primary"
                >
                  <Plus className="w-4 h-4" aria-hidden />
                  {tr('إضافة بند', 'Add item')}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-[12px] border border-[#EEF2F6] bg-[#FAFAFA] p-4"
                >
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="md:col-span-3">
                      <label className="mb-2 block text-start font-cairo text-[12px] font-bold text-[#667085]">
                        {tr('الخدمة', 'Service')}
                      </label>
                      <input
                        value={item.service}
                        onChange={(e) =>
                          updateItem(item.id, { service: e.target.value })
                        }
                        className="h-[44px] w-full rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[13px] font-semibold outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-start font-cairo text-[12px] font-bold text-[#667085]">
                        {tr('الكمية', 'Quantity')}
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(item.id, {
                            quantity: Number(e.target.value) || 1,
                          })
                        }
                        className="h-[44px] w-full rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[13px] font-semibold outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-start font-cairo text-[12px] font-bold text-[#667085]">
                        {tr('السعر', 'Price')}
                      </label>
                      <input
                        type="number"
                        min={1}
                        step="any"
                        value={item.price}
                        onChange={(e) =>
                          updateItem(item.id, {
                            price: Number(e.target.value) || 0,
                          })
                        }
                        className="h-[44px] w-full rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[13px] font-semibold outline-none focus:border-primary"
                      />
                    </div>
                    <div className="flex justify-end items-end">
                      <p className="font-cairo text-[13px] font-extrabold text-primary">
                        {tr('الإجمالي:', 'Total:')}{" "}
                        {formatBillingAmount(
                          item.quantity * item.price,
                          currency,
                        )}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          <InvoiceSummaryCard
            subtotal={totals.subtotal}
            tax={totals.tax}
            total={totals.total}
            taxPercent={taxPercent}
            currency={currency}
            showTax={taxEnabled}
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              disabled={createInvoice.isPending}
              onClick={() => void submitInvoice("issued")}
              className="inline-flex h-[52px] items-center justify-center gap-2 rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white disabled:opacity-60"
            >
              <BookOpen className="w-4 h-4" aria-hidden />
              {tr('إصدار الفاتورة', 'Issue invoice')}
            </button>
            <button
              type="button"
              disabled={createInvoice.isPending}
              onClick={() => void submitInvoice("draft")}
              className="inline-flex h-[52px] items-center justify-center gap-2 rounded-[12px] border border-primary bg-white font-cairo text-[14px] font-extrabold text-primary disabled:opacity-60"
            >
              <Save className="w-4 h-4" aria-hidden />
              {tr('حفظ كمسودة', 'Save as draft')}
            </button>
          </div>

          <Link
            to={`${basePath}/invoices`}
            className="inline-block font-cairo text-[13px] font-extrabold text-[#667085]"
          >
            {tr('الرجوع إلى الفواتير ←', 'Back to invoices ←')}
          </Link>
        </div>
      </div>
    </>
  );
}
