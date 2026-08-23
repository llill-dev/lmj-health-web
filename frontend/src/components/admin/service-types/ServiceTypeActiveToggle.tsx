"use client";

import { ToggleSwitch } from "@/components/ui";
import { useI18n } from "@/i18n/provider";

type Props = {
  isActive: boolean;
  disabled?: boolean;
  onRequestToggle: () => void;
  name?: string;
};

export default function ServiceTypeActiveToggle({
  isActive,
  disabled,
  onRequestToggle,
  name,
}: Props) {
  const { t } = useI18n();
  const action = isActive
    ? t('adminServiceTypeDialog.statusDialog.deactivateAction')
    : t('adminServiceTypeDialog.statusDialog.activateAction');
  return (
    <ToggleSwitch
      checked={isActive}
      disabled={disabled}
      onChange={() => onRequestToggle()}
      label={
        name
          ? `${action} ${name}`
          : isActive
            ? t('adminServiceTypeDialog.toggle.deactivateItem')
            : t('adminServiceTypeDialog.toggle.activateItem')
      }
      size="md"
      className="focus-visible:ring-offset-white"
    />
  );
}
