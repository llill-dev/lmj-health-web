'use client';

import { createPortal } from 'react-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import type { DoctorFacility } from '@/lib/doctor/facilities/types';
import { FacilityStatusBadge } from '@/components/doctor/facilities/facility-status-badge';

const TABLE_COLUMNS = [
  'الإجراءات',
  'الحالة',
  'الهاتف',
  'العنوان',
  'اسم منشأة',
] as const;

const thClass =
  'px-3 py-3 text-center align-middle font-cairo text-[11px] font-extrabold text-[#0F766E] sm:px-4 sm:text-[12px]';
const tdClass = 'px-3 py-3 text-center align-middle sm:px-4 sm:py-4';

type ActionsMenuState = {
  rowId: string;
  top: number;
  left: number;
};

export function FacilitiesTable({
  rows,
  onEdit,
}: {
  rows: DoctorFacility[];
  onEdit: (facility: DoctorFacility) => void;
}) {
  const [menu, setMenu] = useState<ActionsMenuState | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const activeRow = useMemo(
    () => rows.find((row) => row.id === menu?.rowId) ?? null,
    [menu?.rowId, rows],
  );

  useEffect(() => {
    if (!menu) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target)) return;
      setMenu(null);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenu(null);
    };

    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [menu]);

  const openActionsMenu = (
    row: DoctorFacility,
    button: HTMLButtonElement,
  ) => {
    const rect = button.getBoundingClientRect();
    setMenu({
      rowId: row.id,
      top: rect.top - 8,
      left: rect.left + rect.width / 2,
    });
  };

  return (
    <>
      <div className="rounded-[12px] border border-[#D4EFED] bg-white shadow-[0_8px_24px_-12px_rgba(15,23,42,0.08)]">
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full border-collapse text-center">
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
              {rows.map((row, index) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04, duration: 0.18 }}
                  className="border-b border-[#F2F4F7] last:border-b-0 hover:bg-[#F0FDFA]/60"
                >
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
                      className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-[#E5E7EB] bg-white text-primary transition hover:border-primary/30"
                      aria-label="إجراءات المنشأة"
                      aria-expanded={menu?.rowId === row.id}
                    >
                      <Menu className="h-4 w-4" aria-hidden />
                    </button>
                  </td>
                  <td className={tdClass}>
                    <FacilityStatusBadge status={row.status} />
                  </td>
                  <td
                    className={`${tdClass} font-cairo text-[12px] font-semibold text-[#475467]`}
                    dir="ltr"
                  >
                    {row.phone}
                  </td>
                  <td className={`${tdClass} font-cairo text-[12px] font-semibold text-[#475467]`}>
                    {row.city}
                  </td>
                  <td
                    className={`${tdClass} font-cairo text-[13px] font-extrabold text-[#101828]`}
                  >
                    {row.name}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {menu && activeRow
        ? createPortal(
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, scale: 0.96, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 4 }}
              className="fixed z-[250] min-w-[176px] max-w-[calc(100vw-24px)] -translate-x-1/2 -translate-y-full rounded-[10px] border border-[#E5E7EB] bg-white py-1 text-center shadow-[0_16px_40px_rgba(15,23,42,0.16)]"
              style={{ top: menu.top, left: menu.left }}
              role="menu"
            >
              <button
                type="button"
                role="menuitem"
                className="block w-full px-4 py-2.5 font-cairo text-[12px] font-bold text-[#344054] hover:bg-[#F0FDFA] disabled:cursor-not-allowed disabled:text-[#98A2B3]"
                disabled={activeRow.isOwned === false}
                onClick={() => {
                  if (activeRow.isOwned === false) return;
                  setMenu(null);
                  onEdit(activeRow);
                }}
              >
                تعديل المنشأة
              </button>
            </motion.div>,
            document.body,
          )
        : null}
    </>
  );
}
