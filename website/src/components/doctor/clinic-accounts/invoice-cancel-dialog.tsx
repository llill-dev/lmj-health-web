'use client';

import { XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ClinicAccountsModalShell } from '@/components/doctor/clinic-accounts/clinic-accounts-modal-shell';
import { useToast } from '@/components/ui/ToastProvider';
import { useCancelBillingInvoice } from '@/hooks/doctor/billing';
import { getUserFacingRequestErrorMessage } from '@/lib/api';
import type { ClinicInvoice } from '@/lib/doctor/clinicAccounts/types';
import { useI18n } from '@/i18n/provider';

export function InvoiceCancelDialog({
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
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === 'ar' ? ar : en);
  const { toast } = useToast();
  const cancelInvoice = useCancelBillingInvoice();
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) setReason('');
  }, [open]);

  if (!invoice) return null;

  const handleConfirm = async () => {
    if (!invoice.rawId) return;
    try {
      await cancelInvoice.mutateAsync({
        invoiceId: invoice.rawId,
        reason: reason.trim() || undefined,
      });
      toast(tr('تم إلغاء الفاتورة.', 'Invoice cancelled.'), { variant: 'success' });
      onSuccess?.();
      onClose();
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), {
        title: tr('تعذّر إلغاء الفاتورة', 'Could not cancel invoice'),
        variant: 'error',
      });
    }
  };

  return (
    <ClinicAccountsModalShell
      open={open}
      onClose={onClose}
      title={tr('إلغاء الفاتورة', 'Cancel invoice')}
      headerPattern
      maxWidthClass="max-w-[520px]"
    >
      <div dir={dir} lang={locale} className="space-y-5">
        <div className="rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-start">
          <p className="font-cairo text-[13px] font-extrabold text-[#B42318]">
            {invoice.id} • {invoice.patientName}
          </p>
          <p className="mt-1 font-cairo text-[12px] font-semibold text-[#991B1B]">
            {tr(
              'هذا الإجراء يُلغي الفاتورة نهائيًا. تأكد من صحة القرار قبل المتابعة.',
              'This permanently cancels the invoice. Make sure before continuing.',
            )}
          </p>
        </div>

        <div>
          <label className="mb-2 block text-start font-cairo text-[13px] font-extrabold text-[#111827]">
            {tr('سبب الإلغاء (اختياري)', 'Cancellation reason (optional)')}
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder={tr('اكتب سبب إلغاء الفاتورة...', 'Describe why this invoice is being cancelled...')}
            className="w-full rounded-[12px] border border-[#E5E7EB] px-4 py-3 font-cairo text-[13px] font-semibold outline-none focus:border-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={cancelInvoice.isPending}
            className="inline-flex h-[48px] items-center justify-center rounded-[10px] border border-[#E5E7EB] font-cairo text-[14px] font-extrabold text-[#667085] disabled:opacity-60"
          >
            {tr('تراجع', 'Back')}
          </button>
          <button
            type="button"
            disabled={cancelInvoice.isPending}
            onClick={() => void handleConfirm()}
            className="inline-flex h-[48px] items-center justify-center gap-2 rounded-[10px] border border-[#FECACA] bg-[#FEF2F2] font-cairo text-[14px] font-extrabold text-[#B42318] transition hover:bg-[#FEE4E2] disabled:opacity-60"
          >
            <XCircle className="h-4 w-4" aria-hidden />
            {cancelInvoice.isPending
              ? tr('جارٍ الإلغاء...', 'Cancelling...')
              : tr('تأكيد الإلغاء', 'Confirm cancellation')}
          </button>
        </div>
      </div>
    </ClinicAccountsModalShell>
  );
}
