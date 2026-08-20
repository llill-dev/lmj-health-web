import { ToggleSwitch } from "@/components/ui";

export function BillingSettingsToggle({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <ToggleSwitch
      checked={checked}
      disabled={disabled}
      onChange={onChange}
      label={label}
      size="md"
    />
  );
}
