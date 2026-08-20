import type { InvoiceStatus } from '@/lib/doctor/clinicAccounts/types';
import { INVOICE_STATUS_LABELS } from '@/lib/doctor/clinicAccounts/labels';
import { cn } from '@/lib/utils/utils';

const STYLES: Record<InvoiceStatus, string> = {
  paid: 'bg-primary text-white',
  unpaid: 'bg-[#F3F4F6] text-[#667085]',
  partial: 'bg-[#CCFBF1] text-primary',
  overdue: 'bg-[#FEE2E2] text-[#DC2626]',
  cancelled: 'bg-[#F3F4F6] text-[#98A2B3]',
};

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-3 py-1 font-cairo text-[11px] font-extrabold',
        STYLES[status],
      )}
    >
      {INVOICE_STATUS_LABELS[status]}
    </span>
  );
}
