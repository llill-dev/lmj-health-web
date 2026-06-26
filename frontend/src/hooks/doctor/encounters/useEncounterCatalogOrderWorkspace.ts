'use client';

import type { CatalogOrderCategory } from '@/components/doctor/encounters/orders/encounter-order-config';
import { useEncounterOrderWorkspace } from '@/hooks/doctor/encounters/useEncounterOrderWorkspace';

/** @deprecated Use useEncounterOrderWorkspace(category) */
export function useEncounterCatalogOrderWorkspace(
  category: Exclude<CatalogOrderCategory, 'radiology'>,
  doctorId: string,
  patientId: string,
  encounterId: string,
  enabled = true,
) {
  return useEncounterOrderWorkspace(
    category,
    doctorId,
    patientId,
    encounterId,
    enabled,
  );
}
