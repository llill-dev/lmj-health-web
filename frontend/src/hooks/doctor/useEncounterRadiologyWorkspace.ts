'use client';

import { useEncounterOrderWorkspace } from './useEncounterOrderWorkspace';

/** @deprecated Use useEncounterOrderWorkspace('radiology') — kept for existing imports */
export function useEncounterRadiologyWorkspace(
  doctorId: string,
  patientId: string,
  encounterId: string,
  enabled = true,
) {
  return useEncounterOrderWorkspace(
    'radiology',
    doctorId,
    patientId,
    encounterId,
    enabled,
  );
}
