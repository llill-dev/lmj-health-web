import type { EncounterOrder } from './encounterClinicalTypes';
import { resolveOrderStatusLabelAr } from './orderStatusLabels';

export type EncounterOrderCategoryKey =
  | 'lab'
  | 'radiology'
  | 'procedure'
  | 'referral';

export function normalizeEncounterOrderCategory(
  order: EncounterOrder,
): EncounterOrderCategoryKey | 'other' {
  const orderType = (order.orderType ?? '').trim().toUpperCase();
  if (orderType === 'REFERRAL_ORDER' || orderType === 'REFERRAL') {
    return 'referral';
  }
  if (orderType === 'LAB_ORDER' || orderType === 'LAB') return 'lab';
  if (
    orderType === 'IMAGING_ORDER' ||
    orderType === 'IMAGING' ||
    orderType === 'RADIOLOGY_ORDER'
  ) {
    return 'radiology';
  }
  if (orderType === 'PROCEDURE_ORDER' || orderType === 'PROCEDURE') {
    return 'procedure';
  }

  const raw = `${order.orderType ?? ''} ${order.type ?? ''} ${order.category ?? ''} ${order.orderTitle ?? ''} ${order.orderName ?? ''}`.toLowerCase();
  if (raw.includes('refer')) return 'referral';
  if (raw.includes('lab_order') || raw.includes('lab') || raw.includes('تحل')) {
    return 'lab';
  }
  if (
    raw.includes('imaging_order') ||
    raw.includes('radio') ||
    raw.includes('image') ||
    raw.includes('scan') ||
    raw.includes('أشعة') ||
    raw.includes('imaging')
  ) {
    return 'radiology';
  }
  if (
    raw.includes('procedure_order') ||
    raw.includes('procedure') ||
    raw.includes('إجر')
  ) {
    return 'procedure';
  }
  return 'other';
}

/** يصنّف طلباً من ملف المريض الكامل (orders[]) حسب orderType أو الحقول المرآتية. */
export function resolvePatientOrderCategory(order: {
  orderType?: string | null;
  type?: string | null;
  category?: string | null;
  orderTitle?: string | null;
  title?: string | null;
  orderName?: string | null;
}): EncounterOrderCategoryKey | 'other' {
  return normalizeEncounterOrderCategory({
    orderType: order.orderType ?? undefined,
    type: order.type ?? undefined,
    category: order.category ?? undefined,
    orderTitle: order.orderTitle ?? order.title ?? order.orderName ?? undefined,
    orderName: order.orderName ?? undefined,
  });
}

export function isDraftEncounterOrder(order: EncounterOrder) {
  const status = `${order.status ?? ''} ${order.statusCode ?? ''}`.toLowerCase();
  return (
    !status.includes('final') &&
    !status.includes('complete') &&
    !status.includes('cancel')
  );
}

export function isFinalizedEncounterOrder(order: EncounterOrder) {
  const status = `${order.status ?? ''} ${order.statusCode ?? ''}`.toLowerCase();
  return status.includes('final') || status.includes('complete');
}

export function sortEncounterOrdersByRecent(orders: EncounterOrder[]) {
  return [...orders].sort((a, b) => {
    const aTime = new Date(
      (a as { updatedAt?: string }).updatedAt ?? a.createdAt ?? 0,
    ).getTime();
    const bTime = new Date(
      (b as { updatedAt?: string }).updatedAt ?? b.createdAt ?? 0,
    ).getTime();
    return bTime - aTime;
  });
}

export function filterEncounterOrdersByCategory(
  orders: EncounterOrder[],
  category: EncounterOrderCategoryKey,
) {
  return orders.filter(
    (order) => normalizeEncounterOrderCategory(order) === category,
  );
}

export function resolveEncounterOrderStatusLabel(order: EncounterOrder): string {
  return resolveOrderStatusLabelAr(order.statusCode, order.status);
}

export function resolveEncounterOrderTitle(order: EncounterOrder): string {
  const itemTitle =
    order.items?.[0]?.title ??
    order.items?.[0]?.name ??
    order.items?.[0]?.testName ??
    order.items?.[0]?.procedureName;
  if (itemTitle?.trim()) return itemTitle.trim();
  return (
    order.orderTitle?.trim() ??
    order.orderName?.trim() ??
    order.clinicalReason?.trim() ??
    order.reason?.trim() ??
    order.specialty?.trim() ??
    'طلب طبي'
  );
}
