import type { ReactNode } from 'react';
import {
  PatientTabEmptyIllustration,
  type PatientTabEmptyIllustrationVariant,
} from '@/components/doctor/patients/patient-tab-empty-illustration';

type DoctorListEmptyIllustrationProps = {
  variant?: PatientTabEmptyIllustrationVariant;
  imageSrc: string;
  imageClassName?: string;
  title: string;
  subtitle: string;
  actionLabel: string;
  onAction: () => void;
  actionIcon: ReactNode;
};

export function DoctorListEmptyIllustration({
  variant = 'teal',
  imageSrc,
  imageClassName,
  title,
  subtitle,
  actionLabel,
  onAction,
  actionIcon,
}: DoctorListEmptyIllustrationProps) {
  return (
    <PatientTabEmptyIllustration
      variant={variant}
      imageSrc={imageSrc}
      imageClassName={imageClassName}
      title={title}
      subtitle={subtitle}
      actionLabel={actionLabel}
      onAction={onAction}
      actionIcon={actionIcon}
    />
  );
}
