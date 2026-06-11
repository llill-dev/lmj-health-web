'use client';

import { BookOpen, Plus, Save, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/ToastProvider';
import {
  ClinicAccountsBanner,
  ClinicAccountsSubNav,
} from '@/components/doctor/clinic-accounts';
import {
  useBillingSettings,
  useCreateBillingInvoice,
} from '@/hooks/doctor/billing';
import { useDoctorPatients } from '@/hooks/doctor';
import { getUserFacingRequestErrorMessage } from '@/lib/api';
import { formatBillingAmount } from '@/lib/doctor/billing/format';

type LineItem = {
  id: string;
  service: string;
  quantity: number;
  price: number;
};

export default function DoctorClinicCreateInvoicePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const settingsQuery = useBillingSettings();
  const createInvoice = useCreateBillingInvoice();
  const patientsQuery = useDoctorPatients({ page: 1, limit: 100 });

  const discountPresets = settingsQuery.settings?.discountPresets?.length
    ? settingsQuery.settings.discountPresets
    : [0, 10, 20];

  const [patientSearch, setPatientSearch] = useState('');
  const [patientId, setPatientId] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [customDiscount, setCustomDiscount] = useState('0');
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState<LineItem[]>([
    { id: '1', service: '', quantity: 1, price: 0 },
  ]);

  const currency = settingsQuery.currency;
  const taxPercent = settingsQuery.settings?.defaultTaxPercent ?? 0;

  const patients = useMemo(() => {
    const q = patientSearch.trim().toLowerCase();
    return (patientsQuery.patients ?? []).filter((patient) => {
      const name = patient.user?.fullName ?? '';
      if (!q) return true;
      return name.toLowerCase().includes(q);
    });
  }, [patientSearch, patientsQuery.patients]);

  const selectedPatient = patients.find((p) => p._id === patientId);

  const totals = useMemo(() => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0,
    );
    const discount = subtotal * (discountPercent / 100);
    const afterDiscount = subtotal - discount;
    const tax = settingsQuery.settings?.taxEnabled
      ? afterDiscount * (taxPercent / 100)
      : 0;
    const total = afterDiscount + tax;
    return { subtotal, discount, tax, total };
  }, [discountPercent, items, settingsQuery.settings?.taxEnabled, taxPercent]);

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
      toast('يرجى اختيار مريض مرتبط بالعيادة.', {
        title: 'مريض مطلوب',
        variant: 'error',
      });
      return;
    }

    const validItems = items.filter(
      (item) => item.service.trim() && item.quantity > 0 && item.price >= 0,
    );
    if (!validItems.length) {
      toast('أضف بنداً واحداً على الأقل مع اسم الخدمة والسعر.', {
        title: 'بنود ناقصة',
        variant: 'error',
      });
      return;
    }

    try {
      await createInvoice.mutateAsync({
        patientId,
        sourceType: 'manual',
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
        status === 'issued' ? 'تم إصدار الفاتورة بنجاح.' : 'تم حفظ المسودة.',
        {
          title: status === 'issued' ? 'تم الإصدار' : 'مسودة',
          variant: 'success',
        },
      );
      navigate('/doctor/accounts/invoices');
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), {
        title: 'تعذّر إنشاء الفاتورة',
        variant: 'error',
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>إنشاء فاتورة • LMJ Health</title>
      </Helmet>

      <div dir="rtl" lang="ar">
        <ClinicAccountsBanner
          title="إنشاء فاتورة"
          subtitle="إصدار فاتورة جديدة للمريض"
          icon={<BookOpen className="h-7 w-7 text-white sm:h-8 sm:w-8" />}
        />

        <ClinicAccountsSubNav />

        <div className="space-y-5">
          <section className="rounded-[16px] border border-[#EEF2F6] bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-right font-cairo text-[15px] font-extrabold text-[#111827]">
              المريض
            </h2>
            <div className="relative mb-3">
              <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]" />
              <input
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                placeholder="بحث باسم المريض"
                className="h-[48px] w-full rounded-[12px] border border-[#E5E7EB] bg-white pr-11 pl-4 font-cairo text-[13px] font-semibold outline-none transition focus:border-primary"
              />
            </div>
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="h-[48px] w-full rounded-[12px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[13px] font-semibold outline-none focus:border-primary"
            >
              <option value="">اختر المريض</option>
              {patients.map((patient) => (
                <option key={patient._id} value={patient._id}>
                  {patient.user?.fullName ?? patient._id}
                </option>
              ))}
            </select>
            {selectedPatient ? (
              <p className="mt-2 text-right font-cairo text-[12px] font-semibold text-[#667085]">
                المريض المختار: {selectedPatient.user?.fullName}
              </p>
            ) : null}
          </section>

          <section className="rounded-[16px] border border-[#EEF2F6] bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-2 rounded-[10px] border border-primary px-4 py-2 font-cairo text-[12px] font-extrabold text-primary"
              >
                <Plus className="h-4 w-4" aria-hidden />
                إضافة بند
              </button>
              <h2 className="font-cairo text-[15px] font-extrabold text-[#111827]">
                البنود
              </h2>
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
                      <label className="mb-2 block text-right font-cairo text-[12px] font-bold text-[#667085]">
                        الخدمة
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
                      <label className="mb-2 block text-right font-cairo text-[12px] font-bold text-[#667085]">
                        الكمية
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
                      <label className="mb-2 block text-right font-cairo text-[12px] font-bold text-[#667085]">
                        السعر
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={item.price}
                        onChange={(e) =>
                          updateItem(item.id, {
                            price: Number(e.target.value) || 0,
                          })
                        }
                        className="h-[44px] w-full rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[13px] font-semibold outline-none focus:border-primary"
                      />
                    </div>
                    <div className="flex items-end justify-end">
                      <p className="font-cairo text-[13px] font-extrabold text-primary">
                        الإجمالي:{' '}
                        {formatBillingAmount(item.quantity * item.price, currency)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="rounded-[16px] border border-[#EEF2F6] bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-right font-cairo text-[15px] font-extrabold text-[#111827]">
              الخصم وتاريخ الاستحقاق
            </h2>
            <div className="mb-4 flex flex-wrap justify-end gap-2">
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
                      ? 'rounded-[10px] bg-primary px-4 py-2 font-cairo text-[12px] font-extrabold text-white'
                      : 'rounded-[10px] border border-[#EEF2F6] bg-white px-4 py-2 font-cairo text-[12px] font-extrabold text-[#667085]'
                  }
                >
                  {preset}%
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <input
                value={customDiscount}
                onChange={(e) => {
                  setCustomDiscount(e.target.value);
                  setDiscountPercent(Number(e.target.value) || 0);
                }}
                placeholder="خصم مخصص (%)"
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

          <section className="rounded-[16px] bg-[#F0FDFA] p-6">
            <h2 className="mb-4 text-right font-cairo text-[15px] font-extrabold text-[#111827]">
              الملخص
            </h2>
            <div className="space-y-2 text-left font-cairo text-[13px] font-semibold text-[#667085]">
              <p>المجموع الفرعي: {formatBillingAmount(totals.subtotal, currency)}</p>
              {settingsQuery.settings?.taxEnabled ? (
                <p>
                  الضريبة ({taxPercent}%): {formatBillingAmount(totals.tax, currency)}
                </p>
              ) : null}
              <p className="text-[20px] font-black text-primary">
                الإجمالي: {formatBillingAmount(totals.total, currency)}
              </p>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              disabled={createInvoice.isPending}
              onClick={() => void submitInvoice('issued')}
              className="inline-flex h-[52px] items-center justify-center gap-2 rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white disabled:opacity-60"
            >
              <BookOpen className="h-4 w-4" aria-hidden />
              إصدار الفاتورة
            </button>
            <button
              type="button"
              disabled={createInvoice.isPending}
              onClick={() => void submitInvoice('draft')}
              className="inline-flex h-[52px] items-center justify-center gap-2 rounded-[12px] border border-primary bg-white font-cairo text-[14px] font-extrabold text-primary disabled:opacity-60"
            >
              <Save className="h-4 w-4" aria-hidden />
              حفظ كمسودة
            </button>
          </div>

          <Link
            to="/doctor/accounts/invoices"
            className="inline-block font-cairo text-[13px] font-extrabold text-[#667085]"
          >
            الرجوع إلى الفواتير ←
          </Link>
        </div>
      </div>
    </>
  );
}
