'use client';

import { useCallback, useState } from 'react';
import type { DoctorProfileConfirmKind } from '@/components/doctor/profile-settings/doctor-profile-confirm-dialog';

type PendingConfirm = {
  kind: DoctorProfileConfirmKind;
  onConfirm: () => void | Promise<void>;
};

export function useDoctorProfileConfirm() {
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const requestConfirm = useCallback(
    (kind: DoctorProfileConfirmKind, onConfirm: () => void | Promise<void>) => {
      setPending({ kind, onConfirm });
    },
    [],
  );

  const closeConfirm = useCallback((open: boolean) => {
    if (!open) setPending(null);
  }, []);

  return {
    confirmKind: pending?.kind ?? null,
    confirmOpen: pending != null,
    requestConfirm,
    closeConfirm,
    handleConfirm: pending?.onConfirm ?? (() => undefined),
  };
}
