import { OrderClinicalFields } from '@/components/doctor/encounters/orders/order-clinical-fields';
import type { RadiologyClinicalForm } from './radiology-types';

export function RadiologyClinicalFields({
  value,
  onChange,
  disabled,
}: {
  value: RadiologyClinicalForm;
  onChange: (value: RadiologyClinicalForm) => void;
  disabled?: boolean;
}) {
  return (
    <OrderClinicalFields
      value={value}
      onChange={onChange}
      disabled={disabled}
      variant="full"
    />
  );
}
