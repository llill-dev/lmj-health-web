'use client';

import ConfirmActionDialog from '@/components/doctor/confirm-action-dialog';
import { useI18n } from '@/i18n/provider';

export type DoctorProfileConfirmKind =
  | 'navigate-personal-edit'
  | 'navigate-professional-edit'
  | 'save-personal'
  | 'cancel-personal'
  | 'save-professional'
  | 'cancel-professional'
  | 'change-photo';

type TFn = (key: string, fallback?: string) => string;

function buildConfirmCopy(
  t: TFn,
): Record<
  DoctorProfileConfirmKind,
  { title: string; description: string; confirmLabel: string }
> {
  return {
    'navigate-personal-edit': {
      title: t('doctor.personalProfileForm.title'),
      description: t('doctor.profileConfirmDialog.navigatePersonal.description'),
      confirmLabel: t('doctor.profileConfirmDialog.continue'),
    },
    'navigate-professional-edit': {
      title: t('doctor.professionalProfileForm.title'),
      description: t('doctor.profileConfirmDialog.navigateProfessional.description'),
      confirmLabel: t('doctor.profileConfirmDialog.continue'),
    },
    'save-personal': {
      title: t('doctor.profileConfirmDialog.savePersonal.title'),
      description: t('doctor.profileConfirmDialog.savePersonal.description'),
      confirmLabel: t('common.save'),
    },
    'cancel-personal': {
      title: t('doctor.profileConfirmDialog.cancelEdit.title'),
      description: t('doctor.profileConfirmDialog.cancelEdit.description'),
      confirmLabel: t('doctor.profileConfirmDialog.discardChanges'),
    },
    'save-professional': {
      title: t('doctor.profileConfirmDialog.saveProfessional.title'),
      description: t('doctor.profileConfirmDialog.saveProfessional.description'),
      confirmLabel: t('common.send'),
    },
    'cancel-professional': {
      title: t('doctor.profileConfirmDialog.cancelEdit.title'),
      description: t('doctor.profileConfirmDialog.cancelEdit.description'),
      confirmLabel: t('doctor.profileConfirmDialog.discardChanges'),
    },
    'change-photo': {
      title: t('doctor.profileConfirmDialog.changePhoto.title'),
      description: t('doctor.profileConfirmDialog.changePhoto.description'),
      confirmLabel: t('doctor.profileConfirmDialog.changePhoto.confirmLabel'),
    },
  };
}

export default function DoctorProfileConfirmDialog({
  kind,
  open,
  onOpenChange,
  onConfirm,
  confirmDisabled,
}: {
  kind: DoctorProfileConfirmKind | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  confirmDisabled?: boolean;
}) {
  const { t } = useI18n();
  if (!kind) return null;
  const copy = buildConfirmCopy(t)[kind];

  return (
    <ConfirmActionDialog
      open={open}
      onOpenChange={onOpenChange}
      title={copy.title}
      description={copy.description}
      confirmLabel={copy.confirmLabel}
      confirmDisabled={confirmDisabled}
      onConfirm={onConfirm}
    />
  );
}
