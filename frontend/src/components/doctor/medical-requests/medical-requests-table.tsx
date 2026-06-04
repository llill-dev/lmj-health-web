import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, Menu } from 'lucide-react';
import type { MedicalRequestRowVm } from './map-doctor-medical-requests';
import { MedicalRequestsStatusBadge } from './medical-requests-status-badge';

const TABLE_COLUMNS = [
  'System ID',
  'اسم المريض',
  'النوع',
  'التاريخ',
  'الحالة',
  'الإجراءات',
] as const;

const thClass =
  'px-4 py-3 text-center align-middle font-cairo text-[12px] font-extrabold text-[#0F766E]';
const tdClass = 'px-4 py-4 text-center align-middle';

type ActionsMenuState = {
  rowId: string;
  top: number;
  left: number;
};

export function MedicalRequestsTable({
  rows,
  onOpenDetails,
  onOpenLabResult,
  onOpenRadiologyViewer,
}: {
  rows: MedicalRequestRowVm[];
  onOpenDetails: (row: MedicalRequestRowVm) => void;
  onOpenLabResult: (row: MedicalRequestRowVm) => void;
  onOpenRadiologyViewer: (row: MedicalRequestRowVm) => void;
}) {
  const [menu, setMenu] = useState<ActionsMenuState | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menu) return;

    const close = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target)) return;
      setMenu(null);
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenu(null);
    };

    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', onKey);
    };
  }, [menu]);

  const activeRow = menu ? rows.find((row) => row.id === menu.rowId) : null;

  if (!rows.length) {
    return (
      <div className="rounded-[12px] border border-dashed border-[#E2E8F0] bg-white px-6 py-14 text-center font-cairo text-[14px] font-semibold text-[#667085]">
        لا توجد طلبات تطابق البحث أو الفلتر الحالي
      </div>
    );
  }

  const openActionsMenu = (
    row: MedicalRequestRowVm,
    button: HTMLButtonElement,
  ) => {
    const rect = button.getBoundingClientRect();
    const menuWidth = 176;
    const left = Math.min(
      Math.max(12, rect.left + rect.width / 2 - menuWidth / 2),
      window.innerWidth - menuWidth - 12,
    );
    setMenu({
      rowId: row.id,
      top: rect.top - 8,
      left,
    });
  };

  return (
    <>
      <div className="rounded-[12px] border border-[#D4EFED] bg-white shadow-[0_8px_24px_-12px_rgba(15,23,42,0.08)]">
        <div className="overflow-x-auto overflow-y-visible">
          <table className="min-w-full border-collapse text-center">
            <thead>
              <tr className="border-b border-[#B9E6E1] bg-[#D4EFED]">
                {TABLE_COLUMNS.map((head) => (
                  <th key={head} className={thClass}>
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-[#F2F4F7] last:border-b-0 hover:bg-[#F0FDFA]/60"
                >
                  <td className={`${tdClass} font-cairo text-[12px] font-extrabold text-primary`}>
                    {row.systemId}
                  </td>
                  <td className={tdClass}>
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      <div className="font-cairo text-[13px] font-extrabold text-[#101828]">
                        {row.patientName}
                      </div>
                      <div className="font-cairo text-[11px] font-semibold text-[#98A2B3]">
                        {row.patientPhone}
                      </div>
                    </div>
                  </td>
                  <td className={tdClass}>
                    <div className="inline-flex items-center justify-center gap-1.5 font-cairo text-[12px] font-bold text-[#344054]">
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${row.typeDotClass}`}
                        aria-hidden
                      />
                      <span>{row.typeLabel}</span>
                    </div>
                  </td>
                  <td className={tdClass}>
                    <div className="inline-flex items-center justify-center gap-1.5 font-cairo text-[12px] font-semibold text-[#475467]">
                      <Calendar
                        className="h-3.5 w-3.5 shrink-0 text-[#98A2B3]"
                        aria-hidden
                      />
                      <span>{row.dateLabel}</span>
                    </div>
                  </td>
                  <td className={tdClass}>
                    <MedicalRequestsStatusBadge
                      statusKey={row.statusKey}
                      label={row.statusLabel}
                    />
                  </td>
                  <td className={tdClass}>
                    <button
                      type="button"
                      onClick={(event) => {
                        const button = event.currentTarget;
                        if (menu?.rowId === row.id) {
                          setMenu(null);
                          return;
                        }
                        openActionsMenu(row, button);
                      }}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-[#E5E7EB] bg-white text-[#667085] transition hover:border-primary/30 hover:text-primary"
                      aria-label="إجراءات الطلب"
                      aria-expanded={menu?.rowId === row.id}
                    >
                      <Menu className="h-4 w-4" aria-hidden />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {menu && activeRow
        ? createPortal(
            <div
              ref={menuRef}
              className="fixed z-[250] min-w-[176px] -translate-y-full rounded-[10px] border border-[#E5E7EB] bg-white py-1 text-center shadow-[0_16px_40px_rgba(15,23,42,0.16)]"
              style={{ top: menu.top, left: menu.left }}
              role="menu"
            >
              <button
                type="button"
                role="menuitem"
                className="block w-full px-4 py-2.5 font-cairo text-[12px] font-bold text-[#344054] hover:bg-[#F0FDFA]"
                onClick={() => {
                  setMenu(null);
                  onOpenDetails(activeRow);
                }}
              >
                تفاصيل الطلب
              </button>
              {activeRow.category === 'lab' ? (
                <button
                  type="button"
                  role="menuitem"
                  className="block w-full px-4 py-2.5 font-cairo text-[12px] font-bold text-[#344054] hover:bg-[#F0FDFA]"
                  onClick={() => {
                    setMenu(null);
                    onOpenLabResult(activeRow);
                  }}
                >
                  نتيجة تحاليل
                </button>
              ) : null}
              {activeRow.category === 'radiology' ? (
                <button
                  type="button"
                  role="menuitem"
                  className="block w-full px-4 py-2.5 font-cairo text-[12px] font-bold text-[#344054] hover:bg-[#F0FDFA]"
                  onClick={() => {
                    setMenu(null);
                    onOpenRadiologyViewer(activeRow);
                  }}
                >
                  عارض الأشعة
                </button>
              ) : null}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
