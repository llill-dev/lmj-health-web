"use client";

import { ToggleSwitch } from "@/components/ui";

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
  return (
    <ToggleSwitch
      checked={isActive}
      disabled={disabled}
      onChange={() => onRequestToggle()}
      label={
        name
          ? `${isActive ? "تعطيل" : "تفعيل"} ${name}`
          : isActive
            ? "تعطيل العنصر"
            : "تفعيل العنصر"
      }
      size="md"
      className="focus-visible:ring-offset-white"
    />
  );
}
