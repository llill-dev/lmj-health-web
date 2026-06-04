import {
  loadEncounterOrderForPreview,
  loadEncounterOrderForWorkspace,
} from './encounterOrderLoad';

/** @deprecated استخدم loadEncounterOrderForWorkspace(..., 'radiology') */
export async function loadEncounterImagingOrderForWorkspace(
  doctorId: string,
  patientId: string,
  encounterId: string,
) {
  return loadEncounterOrderForWorkspace(
    doctorId,
    patientId,
    encounterId,
    'radiology',
  );
}

/** @deprecated استخدم loadEncounterOrderForPreview(..., 'radiology') */
export async function loadEncounterImagingOrderForPreview(
  doctorId: string,
  patientId: string,
  encounterId: string,
) {
  return loadEncounterOrderForPreview(
    doctorId,
    patientId,
    encounterId,
    'radiology',
  );
}
