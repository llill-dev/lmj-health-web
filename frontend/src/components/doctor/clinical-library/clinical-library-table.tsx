import { Star, Trash2 } from 'lucide-react';
import {
  DOCTOR_MINT_TABLE_TD,
  DoctorMintTableShell,
} from '@/components/doctor/shared/doctor-mint-table';
import type { DoctorLibraryItem } from '@/lib/doctor/libraryTypes';
import { cn } from '@/lib/utils/utils';

const TABLE_COLUMNS = [
  'العنوان',
  'النوع',
  'مفضّل',
  'الإجراءات',
] as const;

export function ClinicalLibraryItemsTable({
  items,
  typeLabels,
  onArchive,
}: {
  items: DoctorLibraryItem[];
  typeLabels: Record<string, string>;
  onArchive: (itemId: string) => void;
}) {
  return (
    <DoctorMintTableShell columns={[...TABLE_COLUMNS]} isEmpty={!items.length}>
      {items.map((item) => (
        <tr
          key={item._id}
          className="border-b border-[#F2F4F7] last:border-b-0 hover:bg-[#F0FDFA]/60"
        >
          <td className={DOCTOR_MINT_TABLE_TD}>
            <div className="font-cairo text-[13px] font-extrabold text-[#101828]">
              {item.label ?? '—'}
            </div>
          </td>
          <td className={DOCTOR_MINT_TABLE_TD}>
            <div className="inline-flex items-center justify-center gap-1.5 font-cairo text-[12px] font-bold text-[#344054]">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
              <span>{item.type ? typeLabels[item.type] ?? item.type : '—'}</span>
            </div>
          </td>
          <td className={DOCTOR_MINT_TABLE_TD}>
            {item.isFavorite ? (
              <span className="inline-flex items-center justify-center gap-1 font-cairo text-[12px] font-extrabold text-[#D97706]">
                <Star className="h-4 w-4 fill-[#D97706]" aria-hidden />
                نعم
              </span>
            ) : (
              <span className="font-cairo text-[12px] font-semibold text-[#98A2B3]">
                —
              </span>
            )}
          </td>
          <td className={DOCTOR_MINT_TABLE_TD}>
            <button
              type="button"
              onClick={() => onArchive(item._id)}
              className="inline-flex items-center justify-center gap-1 font-cairo text-[12px] font-extrabold text-[#B42318] transition hover:text-[#912018]"
            >
              <Trash2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span>أرشفة</span>
            </button>
          </td>
        </tr>
      ))}
    </DoctorMintTableShell>
  );
}

const TEMPLATE_TABLE_COLUMNS = [
  'اسم القالب',
  'النوع',
  'الوصف',
  'الإجراءات',
] as const;

export function ClinicalLibraryTemplatesTable({
  templates,
  typeLabels,
  onDelete,
}: {
  templates: Array<{
    _id: string;
    name?: string | null;
    type?: string | null;
    description?: string | null;
  }>;
  typeLabels: Record<string, string>;
  onDelete: (templateId: string) => void;
}) {
  return (
    <DoctorMintTableShell
      columns={[...TEMPLATE_TABLE_COLUMNS]}
      isEmpty={!templates.length}
    >
      {templates.map((template) => (
        <tr
          key={template._id}
          className="border-b border-[#F2F4F7] last:border-b-0 hover:bg-[#F0FDFA]/60"
        >
          <td className={DOCTOR_MINT_TABLE_TD}>
            <div className="font-cairo text-[13px] font-extrabold text-[#101828]">
              {template.name ?? '—'}
            </div>
          </td>
          <td className={DOCTOR_MINT_TABLE_TD}>
            <span
              className={cn(
                'inline-flex min-w-[88px] items-center justify-center rounded-[6px] px-3 py-1 font-cairo text-[11px] font-extrabold',
                'border-2 border-primary bg-white text-primary',
              )}
            >
              {template.type ? typeLabels[template.type] ?? template.type : '—'}
            </span>
          </td>
          <td className={DOCTOR_MINT_TABLE_TD}>
            <div className="mx-auto max-w-[240px] font-cairo text-[12px] font-semibold leading-relaxed text-[#667085]">
              {template.description?.trim() || '—'}
            </div>
          </td>
          <td className={DOCTOR_MINT_TABLE_TD}>
            <button
              type="button"
              onClick={() => onDelete(template._id)}
              className="inline-flex items-center justify-center gap-1 font-cairo text-[12px] font-extrabold text-[#B42318] transition hover:text-[#912018]"
            >
              <Trash2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span>حذف</span>
            </button>
          </td>
        </tr>
      ))}
    </DoctorMintTableShell>
  );
}
