import type { ReactNode } from 'react';
import { useI18n } from '@/i18n/provider';

export const DOCTOR_MINT_TABLE_TH =
  'px-3 py-3 text-center align-middle font-cairo text-[11px] font-extrabold text-[#0F766E] sm:px-4 sm:text-[12px]';
export const DOCTOR_MINT_TABLE_TD =
  'px-3 py-3 text-center align-middle sm:px-4 sm:py-4';

export function DoctorMintTableShell({
  columns,
  children,
  emptyMessage,
  isEmpty = false,
}: {
  columns: string[];
  children: ReactNode;
  emptyMessage?: string;
  isEmpty?: boolean;
}) {
  const { t } = useI18n();

  if (isEmpty) {
    return (
      <div className="rounded-[12px] border border-dashed border-[#E2E8F0] bg-white px-6 py-14 text-center font-cairo text-[14px] font-semibold text-[#667085]">
        {emptyMessage ?? t('doctor.mintTable.emptyMessage')}
      </div>
    );
  }

  return (
    <div className="rounded-[12px] border border-[#D4EFED] bg-white shadow-[0_8px_24px_-12px_rgba(15,23,42,0.08)]">
      <div className="overflow-x-auto overflow-y-visible">
        <table className="min-w-[720px] w-full border-collapse text-center">
          <thead>
            <tr className="border-b border-[#B9E6E1] bg-[#D4EFED]">
              {columns.map((head) => (
                <th key={head} className={DOCTOR_MINT_TABLE_TH}>
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}
