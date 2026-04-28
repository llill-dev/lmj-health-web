import type { AdminSecretarySummary } from '@/lib/admin/types';

export function resolveUserId(s: AdminSecretarySummary): string | null {
  return s.userId ?? s.user?._id ?? null;
}

export function buildVisiblePageNumbers(
  current: number,
  total: number,
  max = 7,
): number[] {
  if (total <= 0) return [];
  if (total <= max) return Array.from({ length: total }, (_, i) => i + 1);
  const half = Math.floor(max / 2);
  let start = Math.max(1, current - half);
  const end = Math.min(total, start + max - 1);
  if (end - start < max - 1) start = Math.max(1, end - max + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}
