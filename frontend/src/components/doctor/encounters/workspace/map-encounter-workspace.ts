import type { AppLocale } from '@/i18n/runtime';
import { getTranslationValue } from '@/i18n/translations';
import type { EncounterOrder, EncounterOrderItem } from '@/lib/doctor/encounters/encounterClinicalTypes';
import {
  filterEncounterOrdersByCategory,
  isFinalizedEncounterOrder,
  normalizeEncounterOrderCategory,
  type EncounterOrderCategoryKey,
  resolveEncounterOrderStatusLabel,
  resolveEncounterOrderTitle,
} from '@/lib/doctor/encounters/encounterOrderCategories';
import {
  formatRadiologyItemBrief,
  resolveImagingOrderItemFields,
} from '@/components/doctor/radiology/map-radiology-ui';
import type { EncounterPrescriptionRecord } from '@/lib/doctor/prescriptions/prescriptionTypes';
import type { DoctorEncounterSummary, DoctorPatientFullProfile } from '@/lib/doctor/types';
import type {
  EncounterWorkspaceLineItem,
  EncounterWorkspacePatientViewModel,
  EncounterWorkspaceSectionStatus,
  EncounterWorkspaceSectionViewModel,
} from './encounter-workspace-types';

function formatIsoDate(value?: string | null, locale: AppLocale = 'ar'): string {
  if (!value) return '—';
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  if (locale === 'en') {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatTime(value?: string | null, locale: AppLocale = 'ar'): string {
  if (!value) return '—';
  if (/^\d{1,2}:\d{2}/.test(value)) return value.slice(0, 5);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString(locale === 'ar' ? 'ar-SA' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function formatStartedLabel(
  encounter: DoctorEncounterSummary,
  locale: AppLocale = 'ar',
): string {
  const started = encounter.startedAt ?? encounter.createdAt;
  const date = formatIsoDate(started, locale);
  const time = formatTime(started, locale);
  if (date === '—' && time === '—') return '—';
  if (time === '—') return date;
  const shortDate = date.length >= 10 ? `${date.slice(8, 10)}-${date.slice(5, 7)}` : date;
  return `${shortDate} ${time}`;
}

function isFinalizedPrescription(rx: EncounterPrescriptionRecord) {
  const status = (rx.status ?? '').toLowerCase();
  return status.includes('final') || Boolean(rx.finalizedAt);
}

function resolvePrescriptionStatusLabel(
  rx: EncounterPrescriptionRecord,
  locale: AppLocale = 'ar',
): string {
  if (locale === 'en') {
    if (isFinalizedPrescription(rx)) return 'Finalized';
    const status = (rx.status ?? '').toUpperCase();
    const map: Record<string, string> = {
      DRAFT: 'Draft',
      PENDING: 'Pending',
      FINALIZED: 'Finalized',
    };
    return map[status] ?? rx.status ?? 'Draft';
  }
  if (isFinalizedPrescription(rx)) return 'معتمدة';
  const status = (rx.status ?? '').toUpperCase();
  const map: Record<string, string> = {
    DRAFT: 'مسودة',
    PENDING: 'قيد الانتظار',
    FINALIZED: 'معتمدة',
  };
  return map[status] ?? rx.status ?? 'مسودة';
}

function resolveSectionStatus(
  count: number,
  finalizedCount: number,
  locale: AppLocale = 'ar',
): { status: EncounterWorkspaceSectionStatus; label: string; hint: string } {
  if (locale === 'en') {
    if (count === 0) {
      return { status: 'empty', label: 'Empty', hint: 'Start by adding content to this section' };
    }
    if (finalizedCount === count) {
      return { status: 'approved', label: 'Finalized', hint: 'Finalized and complete' };
    }
    return { status: 'draft', label: 'Draft', hint: 'Needs approval' };
  }

  if (count === 0) {
    return {
      status: 'empty',
      label: 'فارغة',
      hint: 'ابدأ بإضافة محتوى من القسم',
    };
  }

  if (finalizedCount === count) {
    return {
      status: 'approved',
      label: 'معتمدة',
      hint: 'معتمدة ونهائية',
    };
  }

  return {
    status: 'draft',
    label: 'مسودة',
    hint: 'بحاجة للاعتماد',
  };
}

function mapPrescriptionItems(
  prescriptions: EncounterPrescriptionRecord[],
  locale: AppLocale = 'ar',
): EncounterWorkspaceLineItem[] {
  return prescriptions.flatMap((rx, rxIndex) => {
    const items = rx.items ?? [];
    if (items.length === 0) {
      return [
        {
          id: rx._id ?? `rx-${rxIndex}`,
          title: locale === 'en' ? 'Prescription' : 'وصفة طبية',
          subtitle: resolvePrescriptionStatusLabel(rx, locale),
          statusLabel: resolvePrescriptionStatusLabel(rx, locale),
        },
      ];
    }
    return items
      .filter((item) => item.name?.trim())
      .map((item, itemIndex) => ({
        id: item._id ?? `${rx._id}-item-${itemIndex}`,
        title: item.name!.trim(),
        subtitle: [item.dosage, item.frequency].filter(Boolean).join(' • ') || undefined,
        statusLabel: resolvePrescriptionStatusLabel(rx, locale),
      }));
  });
}

function resolveOrderItemCount(order: EncounterOrder): number {
  const items = order.items ?? [];
  if (items.length > 0) return items.length;
  const count = order.itemCount;
  if (typeof count === 'number' && count > 0) return count;
  return 1;
}

function sumOrderItemCounts(orders: EncounterOrder[]): number {
  if (orders.length === 0) return 0;
  return orders.reduce((sum, order) => sum + resolveOrderItemCount(order), 0);
}

function resolveOrderItemLine(
  order: EncounterOrder,
  item: EncounterOrderItem,
  category: EncounterOrderCategoryKey,
  locale: AppLocale = 'ar',
): { title: string; subtitle?: string } {
  if (category === 'radiology') {
    const t = (key: string, fallback?: string): string =>
      getTranslationValue(locale, key) ?? fallback ?? key;
    const fields = resolveImagingOrderItemFields(item, t);
    const brief = formatRadiologyItemBrief(fields);
    return {
      title: fields.name,
      subtitle: brief || undefined,
    };
  }

  const title =
    item.title?.trim() ??
    item.name?.trim() ??
    item.testName?.trim() ??
    item.procedureName?.trim() ??
    resolveEncounterOrderTitle(order, locale);

  const subtitle =
    category === 'lab'
      ? [item.testName, item.name].filter((v) => v?.trim() && v !== title).join(' • ') ||
        undefined
      : undefined;

  return { title, subtitle: subtitle?.trim() || undefined };
}

function mapOrderLineItems(
  orders: EncounterOrder[],
  locale: AppLocale = 'ar',
): EncounterWorkspaceLineItem[] {
  return orders.flatMap((order, orderIndex) => {
    const statusLabel = resolveEncounterOrderStatusLabel(order, locale);
    const orderItems = order.items ?? [];
    const category = normalizeEncounterOrderCategory(order);

    if (orderItems.length > 0) {
      return orderItems.map((item, itemIndex) => {
        const { title, subtitle } = category === 'other' 
          ? { title: resolveEncounterOrderTitle(order, locale), subtitle: undefined }
          : resolveOrderItemLine(order, item, category, locale);
        return {
          id: item._id ?? `${order._id}-item-${itemIndex}`,
          title,
          subtitle,
          statusLabel,
          urgency:
            `${order.urgency ?? ''} ${order.priority ?? ''}`.toLowerCase().includes('urgent')
              ? ('urgent' as const)
              : undefined,
        };
      });
    }

    return [
      {
        id: order._id ?? `order-${orderIndex}`,
        title: resolveEncounterOrderTitle(order, locale),
        subtitle: order.clinicalReason?.trim() ?? order.reason?.trim(),
        statusLabel,
        urgency:
          `${order.urgency ?? ''} ${order.priority ?? ''}`.toLowerCase().includes('urgent')
            ? ('urgent' as const)
            : undefined,
      },
    ];
  });
}

function mapPrescriptionSection(
  prescriptions: EncounterPrescriptionRecord[],
  locale: AppLocale = 'ar',
): EncounterWorkspaceSectionViewModel {
  const items = mapPrescriptionItems(prescriptions, locale);
  const finalizedCount = prescriptions.filter(isFinalizedPrescription).length;
  const { status, label, hint } = resolveSectionStatus(
    prescriptions.length,
    finalizedCount,
    locale,
  );

  return {
    key: 'prescription',
    count: items.length || prescriptions.length,
    status,
    statusLabel: label,
    footerHint: hint,
    defaultExpanded: prescriptions.length > 0,
    items,
  };
}

function mapOrdersSection(
  key: 'lab' | 'radiology' | 'procedure' | 'referral',
  orders: EncounterOrder[],
  locale: AppLocale = 'ar',
): EncounterWorkspaceSectionViewModel {
  const filtered = filterEncounterOrdersByCategory(orders, key);
  const items = mapOrderLineItems(filtered, locale);
  const finalizedCount = filtered.filter(isFinalizedEncounterOrder).length;
  const { status, label, hint } = resolveSectionStatus(
    filtered.length,
    finalizedCount,
    locale,
  );

  const referrals =
    key === 'referral'
      ? filtered.map((order, index) => ({
          id: order._id ?? `referral-${index}`,
          code: order._id?.slice(-6).toUpperCase() ?? `REF-${index + 1}`,
          doctorName:
            order.referredDoctorName?.trim() ||
            (locale === 'en' ? 'Specialist doctor' : 'طبيب مختص'),
          specialty:
            order.specialty?.trim() ||
            order.reason?.trim() ||
            (locale === 'en' ? 'Medical referral' : 'تحويل طبي'),
          urgency:
            `${order.urgency ?? ''} ${order.priority ?? ''}`.toLowerCase().includes('urgent')
              ? ('urgent' as const)
              : undefined,
          statusLabel: resolveEncounterOrderStatusLabel(order, locale),
        }))
      : undefined;

  const itemCount =
    key === 'referral' ? filtered.length : sumOrderItemCounts(filtered);

  return {
    key,
    count: itemCount,
    status,
    statusLabel: label,
    footerHint: hint,
    defaultExpanded: filtered.length > 0,
    items,
    referrals,
  };
}

export function mapEncounterWorkspacePatient(
  encounter: DoctorEncounterSummary,
  patient?: DoctorPatientFullProfile,
  publicId?: string,
  locale: AppLocale = 'ar',
): EncounterWorkspacePatientViewModel {
  const isActive = encounter.status !== 'closed';
  const apptDate = encounter.appointment?.date;
  const apptTime = encounter.appointment?.startTime;
  const embedded = encounter.patient;
  const resolvedPublicId =
    publicId?.trim() ||
    embedded?.publicId?.trim() ||
    patient?.patientId?.trim();
  const resolvedAge = patient?.age ?? embedded?.age;

  return {
    name:
      patient?.user?.fullName?.trim() ||
      embedded?.user?.fullName?.trim() ||
      (locale === 'en' ? 'Patient' : 'مريض'),
    ageLabel:
      resolvedAge != null
        ? locale === 'en'
          ? `${resolvedAge} yrs`
          : `${resolvedAge} سنة`
        : '—',
    fileNumber: resolvedPublicId
      ? `#${resolvedPublicId}`
      : patient?._id
        ? `#${patient._id.slice(-6)}`
        : embedded?._id
          ? `#${embedded._id.slice(-6)}`
          : '—',
    statusLabel: isActive
      ? locale === 'en'
        ? 'Active'
        : 'نشطة'
      : locale === 'en'
        ? 'Closed'
        : 'مغلقة',
    isActive,
    startedLabel: formatStartedLabel(encounter, locale),
    appointmentTimeLabel: formatTime(apptTime ?? encounter.startedAt, locale),
    linkedAppointmentDate: formatIsoDate(apptDate, locale),
    linkedAppointmentTime: formatTime(apptTime, locale),
  };
}

export function mapEncounterWorkspaceSections(
  input: {
    prescriptions: EncounterPrescriptionRecord[];
    orders: EncounterOrder[];
  },
  locale: AppLocale = 'ar',
): EncounterWorkspaceSectionViewModel[] {
  const encounterOrders = input.orders.filter(
    (order) => normalizeEncounterOrderCategory(order) !== 'other',
  );

  return [
    mapPrescriptionSection(input.prescriptions, locale),
    mapOrdersSection('lab', encounterOrders, locale),
    mapOrdersSection('radiology', encounterOrders, locale),
    mapOrdersSection('procedure', encounterOrders, locale),
    mapOrdersSection('referral', encounterOrders, locale),
  ];
}
