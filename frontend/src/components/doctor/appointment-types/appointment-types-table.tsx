import { ChevronLeft, Pencil, Trash2 } from 'lucide-react';
import {
  DOCTOR_MINT_TABLE_TD,
  DoctorMintTableShell,
} from '@/components/doctor/shared/doctor-mint-table';
import { formatBillingAmount } from '@/lib/doctor/billing/format';
import type { AppointmentType } from '@/lib/doctor/types';
import { cn } from '@/lib/utils/utils';

const TABLE_COLUMNS = [
  'اسم النوع',
  'السعر',
  'مرئي للمريض',
  'الحالة',
  'الإجراءات',
] as const;

export function AppointmentTypesTable({
  types,
  onEdit,
  onDelete,
}: {
  types: AppointmentType[];
  onEdit: (type: AppointmentType) => void;
  onDelete: (type: AppointmentType) => void;
}) {
  return (
    <DoctorMintTableShell columns={[...TABLE_COLUMNS]} isEmpty={!types.length}>
      {types.map((type) => {
        const isActive = type.isActive !== false;
        return (
          <tr
            key={type._id}
            className="border-b border-[#F2F4F7] last:border-b-0 hover:bg-[#F0FDFA]/60"
          >
            <td className={DOCTOR_MINT_TABLE_TD}>
              <div className="font-cairo text-[13px] font-extrabold text-[#101828]">
                {type.name}
              </div>
            </td>
            <td className={DOCTOR_MINT_TABLE_TD}>
              <div className="font-cairo text-[12px] font-bold text-[#344054]">
                {type.price != null
                  ? formatBillingAmount(type.price, 'USD')
                  : '—'}
              </div>
            </td>
            <td className={DOCTOR_MINT_TABLE_TD}>
              <span
                className={cn(
                  'inline-flex min-w-[56px] items-center justify-center rounded-[6px] px-3 py-1 font-cairo text-[11px] font-extrabold',
                  type.priceVisibleToPatient
                    ? 'bg-[#ECFDF3] text-[#027A48]'
                    : 'bg-[#F2F4F7] text-[#667085]',
                )}
              >
                {type.priceVisibleToPatient ? 'نعم' : 'لا'}
              </span>
            </td>
            <td className={DOCTOR_MINT_TABLE_TD}>
              <span
                className={cn(
                  'inline-flex min-w-[88px] items-center justify-center rounded-[6px] px-3 py-1 font-cairo text-[11px] font-extrabold',
                  isActive
                    ? 'border-2 border-primary bg-white text-primary'
                    : 'bg-[#475467] text-white shadow-[0_4px_10px_rgba(71,84,103,0.18)]',
                )}
              >
                {isActive ? 'نشط' : 'غير نشط'}
              </span>
            </td>
            <td className={DOCTOR_MINT_TABLE_TD}>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => onEdit(type)}
                  className="inline-flex items-center justify-center gap-1 font-cairo text-[12px] font-extrabold text-primary transition hover:text-primary/80"
                >
                  <Pencil className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span>تعديل</span>
                  <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(type)}
                  className="inline-flex items-center justify-center gap-1 font-cairo text-[12px] font-extrabold text-[#B42318] transition hover:text-[#912018]"
                >
                  <Trash2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span>حذف</span>
                </button>
              </div>
            </td>
          </tr>
        );
      })}
    </DoctorMintTableShell>
  );
}
