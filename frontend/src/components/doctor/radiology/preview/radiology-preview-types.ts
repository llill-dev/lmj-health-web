import type { EncounterOrder } from '@/lib/doctor/encounterClinicalTypes';
import type { RadiologyClinicalForm, RadiologyOrderItemUi } from '../radiology-types';

export type RadiologyPreviewVm = {
  orderId: string;
  orderCode: string;
  patientName: string;
  patientMeta: string;
  statusLabel: string;
  clinical: RadiologyClinicalForm;
  items: RadiologyOrderItemUi[];
  canFinalize: boolean;
  raw: EncounterOrder;
};
