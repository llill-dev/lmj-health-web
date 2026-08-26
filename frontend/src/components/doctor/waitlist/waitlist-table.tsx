import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Calendar, CalendarClock, Eye, Menu, Phone, XCircle } from "lucide-react";
import {
  DOCTOR_MINT_TABLE_TD,
  DoctorMintTableShell,
} from "@/components/doctor/shared/doctor-mint-table";
import {
  resolveWaitlistPatientName,
  resolveWaitlistPatientPublicId,
} from "@/hooks/doctor/waitlist/useDoctorWaitlist";
import { isWaitlistActionable } from "@/lib/doctor/waitlist/labels";
import type { WaitlistRequest } from "@/lib/doctor/waitlist/types";
import { cn } from "@/lib/utils/utils";
import {
  WaitlistStatusBadge,
  WaitlistUrgencyBadge,
} from "./waitlist-status-badge";
import { useI18n } from "@/i18n/provider";

function buildTableColumns(
  t: (key: string, fallback?: string) => string,
): string[] {
  return [
    t("doctor.waitlist.table.publicId"),
    t("doctor.waitlist.table.patientName"),
    t("doctor.waitlist.table.priority"),
    t("doctor.waitlist.table.preferredPeriod"),
    t("doctor.waitlist.table.status"),
    t("doctor.waitlist.table.actions"),
  ];
}

type ActionsMenuState = {
  requestId: string;
  top: number;
  left: number;
};

function formatPreferredRange(
  request: WaitlistRequest,
  locale: string,
): string {
  const localeTag = locale === "ar" ? "ar" : "en";
  const from = request.preferredDateFrom
    ? new Date(request.preferredDateFrom).toLocaleDateString(localeTag)
    : "—";
  const to = request.preferredDateTo
    ? new Date(request.preferredDateTo).toLocaleDateString(localeTag)
    : from;
  return from === to ? from : `${from} – ${to}`;
}

export function WaitlistTable({
  requests,
  busy,
  urgencyLabel,
  statusLabel,
  highlightRequestId,
  onNavigateAppointments,
  onContacted,
  onBook,
  onClose,
  onViewDetails,
}: {
  requests: WaitlistRequest[];
  busy: boolean;
  urgencyLabel: (urgency?: string) => string;
  statusLabel: (status?: string) => string;
  highlightRequestId?: string;
  onNavigateAppointments: () => void;
  onContacted: (request: WaitlistRequest) => void;
  onBook: (request: WaitlistRequest) => void;
  onClose: (request: WaitlistRequest) => void;
  /** Optional — shows a "view details" action (contact preference, notes, history) in the row menu. */
  onViewDetails?: (request: WaitlistRequest) => void;
}) {
  const { locale, t } = useI18n();
  const [menu, setMenu] = useState<ActionsMenuState | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const highlightRef = useRef<HTMLTableRowElement | null>(null);

  useEffect(() => {
    if (!highlightRequestId) return;
    highlightRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [highlightRequestId, requests]);

  useEffect(() => {
    if (!menu) return;

    const close = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target)) return;
      setMenu(null);
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenu(null);
    };

    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  const activeRequest = menu
    ? requests.find((request) => request._id === menu.requestId)
    : null;

  const openActionsMenu = (
    request: WaitlistRequest,
    button: HTMLButtonElement,
  ) => {
    const rect = button.getBoundingClientRect();
    const menuWidth = 196;
    const left = Math.min(
      Math.max(12, rect.left + rect.width / 2 - menuWidth / 2),
      window.innerWidth - menuWidth - 12,
    );
    setMenu({
      requestId: request._id,
      top: rect.top - 8,
      left,
    });
  };

  return (
    <>
      <DoctorMintTableShell
        columns={buildTableColumns(t)}
        isEmpty={!requests.length}
      >
        {requests.map((request) => {
          const actionable = isWaitlistActionable(request.status);
          const appointmentId =
            typeof request.appointment === "string"
              ? request.appointment
              : request.appointment?._id;

          return (
            <tr
              key={request._id}
              ref={
                highlightRequestId === request._id ? highlightRef : undefined
              }
              className={cn(
                "border-b border-[#F2F4F7] last:border-b-0 hover:bg-[#F0FDFA]/60",
                highlightRequestId === request._id &&
                  "bg-[#F0FDFA] ring-2 ring-inset ring-primary/40",
              )}
            >
              <td
                className={`${DOCTOR_MINT_TABLE_TD} font-cairo text-[12px] font-extrabold text-primary`}
              >
                {resolveWaitlistPatientPublicId(request)}
              </td>
              <td className={DOCTOR_MINT_TABLE_TD}>
                <div className="flex flex-col items-center justify-center gap-0.5">
                  <div className="max-w-[180px] text-balance font-cairo text-[13px] font-extrabold text-[#101828] sm:max-w-none">
                    {resolveWaitlistPatientName(request)}
                  </div>
                </div>
              </td>
              <td className={DOCTOR_MINT_TABLE_TD}>
                <WaitlistUrgencyBadge
                  urgency={request.urgencyLevel}
                  label={urgencyLabel(request.urgencyLevel)}
                />
              </td>
              <td className={DOCTOR_MINT_TABLE_TD}>
                <div className="inline-flex max-w-[180px] items-center justify-center gap-1.5 font-cairo text-[12px] font-semibold text-[#475467] sm:max-w-none">
                  <Calendar
                    className="h-3.5 w-3.5 shrink-0 text-[#98A2B3]"
                    aria-hidden
                  />
                  <span className="break-words">
                    {formatPreferredRange(request, locale)}
                  </span>
                </div>
              </td>
              <td className={DOCTOR_MINT_TABLE_TD}>
                <WaitlistStatusBadge
                  status={request.status}
                  label={statusLabel(request.status)}
                />
              </td>
              <td className={DOCTOR_MINT_TABLE_TD}>
                {actionable || onViewDetails ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={(event) => {
                      const button = event.currentTarget;
                      if (menu?.requestId === request._id) {
                        setMenu(null);
                        return;
                      }
                      openActionsMenu(request, button);
                    }}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-[#E5E7EB] bg-white text-[#667085] transition hover:border-primary/30 hover:text-primary disabled:opacity-60"
                    aria-label={t("doctor.waitlist.actions.label")}
                    aria-expanded={menu?.requestId === request._id}
                  >
                    <Menu className="h-4 w-4" aria-hidden />
                  </button>
                ) : appointmentId ? (
                  <button
                    type="button"
                    onClick={onNavigateAppointments}
                    className="inline-flex items-center justify-center gap-1 font-cairo text-[12px] font-extrabold text-primary transition hover:text-primary/80"
                  >
                    <CalendarClock className="h-4 w-4 shrink-0" aria-hidden />
                    <span>{t("doctor.waitlist.actions.viewAppointment")}</span>
                  </button>
                ) : (
                  <span className="font-cairo text-[12px] font-semibold text-[#98A2B3]">
                    —
                  </span>
                )}
              </td>
            </tr>
          );
        })}
      </DoctorMintTableShell>

      {menu && activeRequest
        ? createPortal(
            <div
              ref={menuRef}
              className="fixed z-[250] min-w-[196px] max-w-[calc(100vw-24px)] -translate-y-full rounded-[10px] border border-[#E5E7EB] bg-white py-1 text-center shadow-[0_16px_40px_rgba(15,23,42,0.16)]"
              style={{ top: menu.top, left: menu.left }}
              role="menu"
            >
              {onViewDetails ? (
                <button
                  type="button"
                  role="menuitem"
                  className="block w-full px-4 py-2.5 font-cairo text-[12px] font-bold text-[#344054] hover:bg-[#F0FDFA]"
                  onClick={() => {
                    setMenu(null);
                    onViewDetails(activeRequest);
                  }}
                >
                  <span className="inline-flex items-center justify-center gap-1.5">
                    <Eye className="h-3.5 w-3.5" aria-hidden />
                    {t("doctor.waitlist.actions.viewDetails")}
                  </span>
                </button>
              ) : null}
              {isWaitlistActionable(activeRequest.status) ? (
                <>
                  <button
                    type="button"
                    role="menuitem"
                    disabled={busy}
                    className="block w-full px-4 py-2.5 font-cairo text-[12px] font-extrabold text-primary hover:bg-[#F0FDFA] disabled:opacity-60"
                    onClick={() => {
                      setMenu(null);
                      onBook(activeRequest);
                    }}
                  >
                    {t("doctor.waitlist.actions.bookAppointment")}
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    disabled={busy}
                    className="block w-full px-4 py-2.5 font-cairo text-[12px] font-bold text-[#344054] hover:bg-[#F0FDFA] disabled:opacity-60"
                    onClick={() => {
                      setMenu(null);
                      onContacted(activeRequest);
                    }}
                  >
                    <span className="inline-flex items-center justify-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" aria-hidden />
                      {t("doctor.waitlist.actions.contacted")}
                    </span>
                  </button>
                </>
              ) : null}
              {typeof activeRequest.appointment === "string" ||
              activeRequest.appointment?._id ? (
                <button
                  type="button"
                  role="menuitem"
                  className="block w-full px-4 py-2.5 font-cairo text-[12px] font-bold text-[#344054] hover:bg-[#F0FDFA]"
                  onClick={() => {
                    setMenu(null);
                    onNavigateAppointments();
                  }}
                >
                  {t("doctor.waitlist.actions.viewAppointment")}
                </button>
              ) : null}
              {isWaitlistActionable(activeRequest.status) ? (
                <button
                  type="button"
                  role="menuitem"
                  disabled={busy}
                  className="block w-full px-4 py-2.5 font-cairo text-[12px] font-bold text-[#B42318] hover:bg-[#FEF3F2] disabled:opacity-60"
                  onClick={() => {
                    setMenu(null);
                    onClose(activeRequest);
                  }}
                >
                  <span className="inline-flex items-center justify-center gap-1.5">
                    <XCircle className="h-3.5 w-3.5" aria-hidden />
                    {t("doctor.waitlist.actions.closeRequest")}
                  </span>
                </button>
              ) : null}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
