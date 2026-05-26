'use client';

import ConfirmActionDialog from '@/components/doctor/confirm-action-dialog';

export type DoctorProfileConfirmKind =
  | 'navigate-personal-edit'
  | 'navigate-professional-edit'
  | 'save-personal'
  | 'cancel-personal'
  | 'save-professional'
  | 'cancel-professional'
  | 'change-photo';

const CONFIRM_COPY: Record<
  DoctorProfileConfirmKind,
  { title: string; description: string; confirmLabel: string }
> = {
  'navigate-personal-edit': {
    title: 'تعديل المعلومات الشخصية',
    description:
      'ستنتقل إلى صفحة تعديل بياناتك الشخصية. التعديلات تُطبَّق فوراً بعد الحفظ.',
    confirmLabel: 'متابعة',
  },
  'navigate-professional-edit': {
    title: 'تعديل المعلومات المهنية',
    description:
      'ستنتقل إلى صفحة تعديل بياناتك المهنية. التغييرات تُرسل للمراجعة قبل التطبيق.',
    confirmLabel: 'متابعة',
  },
  'save-personal': {
    title: 'حفظ التغييرات',
    description:
      'هل تريد حفظ التعديلات على معلوماتك الشخصية؟ سيتم تطبيقها فوراً.',
    confirmLabel: 'حفظ',
  },
  'cancel-personal': {
    title: 'إلغاء التعديل',
    description:
      'لديك تغييرات غير محفوظة. هل تريد المغادرة وتجاهل التعديلات؟',
    confirmLabel: 'تجاهل التغييرات',
  },
  'save-professional': {
    title: 'إرسال للمراجعة',
    description:
      'هل تريد إرسال التعديلات المهنية لفريق الإدارة؟ سيتم مراجعتها خلال 24–48 ساعة.',
    confirmLabel: 'إرسال',
  },
  'cancel-professional': {
    title: 'إلغاء التعديل',
    description:
      'لديك تغييرات غير محفوظة. هل تريد المغادرة وتجاهل التعديلات؟',
    confirmLabel: 'تجاهل التغييرات',
  },
  'change-photo': {
    title: 'تغيير الصورة الشخصية',
    description: 'هل تريد استبدال صورتك الشخصية بالصورة المختارة؟',
    confirmLabel: 'تغيير الصورة',
  },
};

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
  if (!kind) return null;
  const copy = CONFIRM_COPY[kind];

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
