'use client';

import type { ReactNode } from 'react';
import ConfirmActionDialog from '@/components/doctor/confirm-action-dialog';

export function DeleteAccountConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'تأكيد المتابعة',
  busy,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: () => void | Promise<void>;
}) {
  return (
    <ConfirmActionDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      confirmLabel={busy ? 'جارٍ التنفيذ…' : confirmLabel}
      confirmDisabled={busy}
      onConfirm={onConfirm}
    />
  );
}
