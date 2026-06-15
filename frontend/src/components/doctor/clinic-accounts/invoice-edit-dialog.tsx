'use client';

import { Plus, Save, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ClinicAccountsModalShell } from '@/components/doctor/clinic-accounts/clinic-accounts-modal-shell';
import { useToast } from '@/components/ui/ToastProvider';
import {
  useBillingSettings,
  useUpdateBillingInvoice,
} from '@/hooks/doctor/billing';
import { billingDateInputToIso, isoToBillingDateInput } from '@/lib/doctor/billing/dateInput';
import { getBillingInvoiceUpdateErrorToast } from '@/lib/doctor/billing/errors';
import { formatBillingAmount } from '@/lib/doctor/billing/format';
import type { ClinicInvoice } from '@/lib/doctor/clinicAccounts/types';
import { cn } from '@/lib/utils/utils';

type LineItem = {
  id: string;
  service: string;
  quantity: number;
  price: number;
};

export function InvoiceEditDialog({
  open,
  invoice,
  onClose,
  onSuccess,
}: {
  open: boolean;
  invoice: ClinicInvoice | null;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const { toast } = useToast();
  const settingsQuery = useBillingSettings();
  const updateInvoice = useUpdateBillingInvoice();

  const discountPresets = settingsQuery.settings?.discountPresets?.length
    ? settingsQuery.settings.discountPresets
    : [0, 10, 20];

  const currency = invoice?.currency ?? settingsQuery.currency;
  const taxPercent = settingsQuery.settings?.defaultTaxPercent ?? 0;

  const [discountPercent, setDiscountPercent] = useState(0);
  const [customDiscount, setCustomDiscount] = useState('0');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<LineItem[]>([]);

  useEffect(() => {
    if (!open || !invoice) return;
    setDiscountPercent(invoice.discountPercent ?? 0);
    setCustomDiscount(String(invoice.discountPercent ?? 0));
    setDueDate(isoToBillingDateInput(invoice.dueAtIso));
    setNotes(invoice.notes?.trim() ?? '');
    setItems(
      invoice.items.map((item) => ({
        id: item.id,
        service: item.name,
        quantity: item.quantity,
        price: item.unitPrice,
      })),
    );
  }, [open, invoice]);

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
    return { subtotal, discount, tax, total: afterDiscount + tax };
  }, [discountPercent, items, settingsQuery.settings?.taxEnabled, taxPercent]);

  if (!invoice) return null;

  const isDraft = invoice.apiStatus === 'draft';

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { id: String(Date.now()), service: '', quantity: 1, price: 0 },
    ]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => (prev.length <= 1 ? prev : prev.filter((item) => item.id !== id)));
  };

  const updateItem = (id: string, patch: Partial<LineItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  };

  const handleSave = async () => {
    if (!invoice.rawId || !invoice.patientId) {
      toast('بيانات الفاتورة ناقصة — أعد تحميل التفاصيل.', {
        title: 'تعذّر الحفظ',
        variant: 'error',
      });
      return;
    }

    if (!isDraft) {
      toast('يمكن تعديل المسودات فقط.', {
        title: 'لا يمكن التعديل',
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
      await updateInvoice.mutateAsync({
        invoiceId: invoice.rawId,
        body: {
          patientId: invoice.patientId,
          sourceType: 'manual',
          status: 'draft',
          discountPercent,
          items: validItems.map((item) => ({
            serviceNameSnapshot: item.service.trim(),
            quantity: item.quantity,
            unitPrice: item.price,
          })),
          dueAt: dueDate.trim() ? billingDateInputToIso(dueDate) : undefined,
          notes: notes.trim() || undefined,
        },
      });

      toast('تم حفظ تعديلات المسودة.', {
        title: 'تم الحفظ',
        variant: 'success',
      });
      onSuccess?.();
      onClose();
    } catch (error) {
      const { title, message } = getBillingInvoiceUpdateErrorToast(error);
      toast(message, { title, variant: 'error' });
    }
  };

  return (
    <ClinicAccountsModalShell
      open={open}
      onClose={onClose}
      title="تعديل الفاتورة"
      headerPattern
      maxWidthClass="max-w-[820px]"
    >
      <div dir="rtl" lang="ar" className="space-y-5">
        <div className="rounded-[12px] border border-[#EEF2F6] bg-[#FAFAFA] px-4 py-3 text-start">
          <p className="font-cairo text-[13px] font-extrabold text-[#111827]">
            {invoice.id} • {invoice.patientName}
          </p>
          {!isDraft ? (
            <p className="mt-1 font-cairo text-[12px] font-semibold text-[#DC2626]">
              هذه الفاتورة ليست مسودة — التعديل غير متاح.
            </p>
          ) : (
            <p className="mt-1 font-cairo text-[12px] font-semibold text-[#667085]">
              يمكن تعديل المسودات فقط قبل الإصدار.
            </p>
          )}
        </div>

        <section className="rounded-[12px] border border-[#EEF2F6] p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <button
              type="button"
              disabled={!isDraft}
              onClick={addItem}
              className="inline-flex items-center gap-2 rounded-[10px] border border-primary px-3 py-2 font-cairo text-[12px] font-extrabold text-primary disabled:opacity-50"
            >
              <Plus className="h-4 w-4" aria-hidden />
              إضافة بند
            </button>
            <h3 className="font-cairo text-[14px] font-extrabold text-[#111827]">البنود</h3>
          </div>

          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-[10px] border border-[#EEF2F6] bg-white p-3"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    disabled={!isDraft || items.length <= 1}
                    onClick={() => removeItem(item.id)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-[#FEE2E2] text-[#DC2626] transition hover:bg-[#FEF2F2] disabled:opacity-40"
                    aria-label="حذف البند"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                  <span className="font-cairo text-[12px] font-bold text-[#98A2B3]">
                    {formatBillingAmount(item.quantity * item.price, currency)}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="md:col-span-3">
                    <label className="mb-1 block text-start font-cairo text-[11px] font-bold text-[#667085]">
                      الخدمة
                    </label>
                    <input
                      disabled={!isDraft}
                      value={item.service}
                      onChange={(e) => updateItem(item.id, { service: e.target.value })}
                      className="h-[42px] w-full rounded-[10px] border border-[#E5E7EB] px-3 font-cairo text-[13px] font-semibold outline-none focus:border-primary disabled:bg-[#F9FAFB]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-start font-cairo text-[11px] font-bold text-[#667085]">
                      الكمية
                    </label>
                    <input
                      type="number"
                      min={1}
                      disabled={!isDraft}
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(item.id, { quantity: Number(e.target.value) || 1 })
                      }
                      className="h-[42px] w-full rounded-[10px] border border-[#E5E7EB] px-3 font-cairo text-[13px] font-semibold outline-none focus:border-primary disabled:bg-[#F9FAFB]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-start font-cairo text-[11px] font-bold text-[#667085]">
                      السعر
                    </label>
                    <input
                      type="number"
                      min={0}
                      disabled={!isDraft}
                      value={item.price}
                      onChange={(e) =>
                        updateItem(item.id, { price: Number(e.target.value) || 0 })
                      }
                      className="h-[42px] w-full rounded-[10px] border border-[#E5E7EB] px-3 font-cairo text-[13px] font-semibold outline-none focus:border-primary disabled:bg-[#F9FAFB]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[12px] border border-[#EEF2F6] p-4">
          <h3 className="mb-3 text-start font-cairo text-[14px] font-extrabold text-[#111827]">
            الخصم والاستحقاق
          </h3>
          <div className="mb-3 flex flex-wrap justify-start gap-2">
            {discountPresets.map((preset) => (
              <button
                key={preset}
                type="button"
                disabled={!isDraft}
                onClick={() => {
                  setDiscountPercent(preset);
                  setCustomDiscount(String(preset));
                }}
                className={cn(
                  'rounded-[10px] px-3 py-2 font-cairo text-[12px] font-extrabold disabled:opacity-50',
                  discountPercent === preset
                    ? 'bg-primary text-white'
                    : 'border border-[#EEF2F6] bg-white text-[#667085]',
                )}
              >
                {preset}%
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <input
              disabled={!isDraft}
              value={customDiscount}
              onChange={(e) => {
                setCustomDiscount(e.target.value);
                setDiscountPercent(Number(e.target.value) || 0);
              }}
              placeholder="خصم مخصص (%)"
              className="h-[44px] rounded-[10px] border border-[#E5E7EB] px-3 font-cairo text-[13px] font-semibold outline-none focus:border-primary disabled:bg-[#F9FAFB]"
            />
            <input
              type="date"
              disabled={!isDraft}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="h-[44px] rounded-[10px] border border-[#E5E7EB] px-3 font-cairo text-[13px] font-semibold outline-none focus:border-primary disabled:bg-[#F9FAFB]"
            />
          </div>
          <textarea
            disabled={!isDraft}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="ملاحظات الفاتورة..."
            className="mt-3 w-full rounded-[10px] border border-[#E5E7EB] px-3 py-2 font-cairo text-[13px] font-semibold outline-none focus:border-primary disabled:bg-[#F9FAFB]"
          />
        </section>

        <div className="rounded-[12px] bg-[#F0FDFA] p-4 text-start">
          <p className="font-cairo text-[12px] font-semibold text-[#667085]">
            المجموع الفرعي: {formatBillingAmount(totals.subtotal, currency)}
          </p>
          {settingsQuery.settings?.taxEnabled ? (
            <p className="font-cairo text-[12px] font-semibold text-[#667085]">
              الضريبة ({taxPercent}%): {formatBillingAmount(totals.tax, currency)}
            </p>
          ) : null}
          <p className="mt-1 font-cairo text-[18px] font-black text-primary">
            الإجمالي: {formatBillingAmount(totals.total, currency)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-[48px] items-center justify-center rounded-[10px] border border-[#E5E7EB] font-cairo text-[14px] font-extrabold text-[#667085]"
          >
            إلغاء
          </button>
          <button
            type="button"
            disabled={!isDraft || updateInvoice.isPending}
            onClick={() => void handleSave()}
            className="inline-flex h-[48px] items-center justify-center gap-2 rounded-[10px] bg-primary font-cairo text-[14px] font-extrabold text-white disabled:opacity-60"
          >
            <Save className="h-4 w-4" aria-hidden />
            {updateInvoice.isPending ? 'جاري الحفظ...' : 'حفظ التعديلات'}
          </button>
        </div>
      </div>
    </ClinicAccountsModalShell>
  );
}
