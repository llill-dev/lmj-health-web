import type {
  WaitlistStatus,
  WaitlistUrgency,
} from "@/lib/doctor/waitlist/types";

type TrFn = (key: string) => string;
const defaultTr: TrFn = (key) => key;

export function waitlistStatusLabel(
  status?: string,
  tr: TrFn = defaultTr,
): string {
  switch (status) {
    case "active":
      return tr("waitlist.status.active");
    case "contacted":
      return tr("waitlist.status.contacted");
    case "booked":
      return tr("waitlist.status.booked");
    case "closed":
      return tr("waitlist.status.closed");
    case "cancelled":
      return tr("waitlist.status.cancelled");
    case "expired":
      return tr("waitlist.status.expired");
    default:
      return status?.trim() || "—";
  }
}

export function waitlistUrgencyLabel(
  urgency?: string,
  tr: TrFn = defaultTr,
): string {
  switch (urgency) {
    case "high":
      return tr("waitlist.urgency.high");
    case "medium":
      return tr("waitlist.urgency.medium");
    case "low":
      return tr("waitlist.urgency.low");
    default:
      return urgency?.trim() || "—";
  }
}

export function waitlistContactPreferenceLabel(
  preference?: string,
  tr: TrFn = defaultTr,
): string {
  switch (preference) {
    case "call":
      return tr("waitlist.contactPreference.call");
    case "sms":
      return tr("waitlist.contactPreference.sms");
    case "whatsapp":
      return tr("waitlist.contactPreference.whatsapp");
    case "email":
      return tr("waitlist.contactPreference.email");
    default:
      return preference?.trim() || "—";
  }
}

export const WAITLIST_CONTACT_PREFERENCES = [
  "call",
  "sms",
  "whatsapp",
  "email",
] as const;

export function isWaitlistActionable(status?: string): boolean {
  return status === "active" || status === "contacted";
}

export function buildWaitlistStatusTabs(
  tr: TrFn = defaultTr,
): Array<{ value: "all" | WaitlistStatus; label: string }> {
  return [
    { value: "all", label: tr("waitlist.all") },
    { value: "active", label: tr("waitlist.status.active") },
    { value: "contacted", label: tr("waitlist.status.contacted") },
    { value: "booked", label: tr("waitlist.status.booked") },
    { value: "closed", label: tr("waitlist.status.closed") },
  ];
}
