'use client';

import { motion } from 'framer-motion';
import type { ClinicInvoice } from '@/lib/doctor/clinicAccounts/types';
import { formatBillingAmount } from '@/lib/doctor/billing/format';
import { InvoiceStatusBadge } from '@/components/doctor/clinic-accounts/invoice-status-badge';

export function InvoiceListItem({
  invoice,
  index,
  onOpen,
}: {
  invoice: ClinicInvoice;
  index: number;
  onOpen: (invoice: ClinicInvoice) => void;
}) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.2 }}
      onClick={() => onOpen(invoice)}
      className="flex w-full items-center justify-between gap-4 rounded-[12px] border border-[#D1FAE5] bg-white px-5 py-4 text-right shadow-sm transition hover:border-primary/40 hover:shadow-md"
    >
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap gap-2 justify-start items-center mb-2">
          <span className="font-cairo text-[14px] font-extrabold text-[#111827]">
            {invoice.id}
          </span>
          <InvoiceStatusBadge status={invoice.status} />
        </div>
        <p className="font-cairo text-[13px] font-bold text-[#111827]">
          {invoice.patientName}
        </p>
        <p className="mt-1 font-cairo text-[12px] font-semibold text-[#98A2B3]">
          {invoice.issueDate}
        </p>
      </div>
      <span className="font-cairo text-[22px] font-black text-primary">
        {formatBillingAmount(invoice.total, invoice.currency ?? 'USD')}
      </span>
    </motion.button>
  );
}
