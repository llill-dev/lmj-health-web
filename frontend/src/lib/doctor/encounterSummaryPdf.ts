import type { EncounterOrder } from '@/lib/doctor/encounterClinicalTypes';
import {
  isFinalizedEncounterOrder,
  normalizeEncounterOrderCategory,
  sortEncounterOrdersByRecent,
} from '@/lib/doctor/encounterOrderCategories';
import type { GenerateDoctorDocumentBody } from '@/lib/doctor/doctorOrderDocuments';
import type { EncounterPrescriptionRecord } from '@/lib/doctor/prescriptionTypes';

function isFinalizedPrescription(rx: EncounterPrescriptionRecord) {
  return (rx.status ?? '').toLowerCase().includes('final');
}

/**
 * يحدد مصدر PDF لتصدير ملخص الزيارة عبر POST /api/documents/generate.
 * المعاينة (preview) JSON فقط ولا تُرجع رابط PDF.
 */
export function resolveEncounterSummaryPdfSource(input: {
  prescriptions: EncounterPrescriptionRecord[];
  orders: EncounterOrder[];
}): GenerateDoctorDocumentBody | null {
  const { prescriptions, orders } = input;

  const prescription =
    prescriptions.find(isFinalizedPrescription) ?? prescriptions[0];
  if (prescription?._id) {
    return { sourceType: 'prescription', sourceId: prescription._id };
  }

  const finalized = sortEncounterOrdersByRecent(
    orders.filter(isFinalizedEncounterOrder),
  );

  const imaging = finalized.find(
    (order) => normalizeEncounterOrderCategory(order) === 'radiology',
  );
  if (imaging?._id) {
    return { sourceType: 'imaging_order', sourceId: imaging._id };
  }

  const labOrProcedure = finalized.find((order) => {
    const category = normalizeEncounterOrderCategory(order);
    return category === 'lab' || category === 'procedure';
  });
  if (labOrProcedure?._id) {
    return { sourceType: 'order', sourceId: labOrProcedure._id };
  }

  return null;
}
