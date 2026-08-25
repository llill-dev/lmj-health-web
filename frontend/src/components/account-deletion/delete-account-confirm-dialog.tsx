"use client";

import type { ReactNode } from "react";
import ConfirmActionDialog from "@/components/doctor/confirm-action-dialog";
import { useI18n } from "@/i18n/provider";

export function DeleteAccountConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
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
  const { t } = useI18n();
  const resolvedConfirmLabel =
    confirmLabel ?? t("accountDeletion.confirmLabel");

  return (
    <ConfirmActionDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      confirmLabel={
        busy ? t("accountDeletion.executing") : resolvedConfirmLabel
      }
      confirmDisabled={busy}
      onConfirm={onConfirm}
    />
  );
}
