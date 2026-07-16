import type { DoctorOrderRecord, DoctorOrderResultAttachment } from '@/lib/doctor/orders/doctorOrderTypes';
import { extractOrderStatusFieldsFromApi } from '@/lib/doctor/orders/orderStatusLabels';

type DoctorOrderApiRecord = {
  [key: string]: unknown;
};

function asRecord(value: unknown): DoctorOrderApiRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
}

function pickString(...values: ReadonlyArray<unknown>): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return undefined;
}

function normalizePatient(raw: unknown, patientId?: string) {
  const patient = asRecord(raw);
  if (!patient) {
    return patientId ? { _id: patientId } : undefined;
  }

  const userRaw = patient.user ?? patient.userId;
  const user = asRecord(userRaw);

  return {
    _id: pickString(patient._id, patient.id) ?? patientId,
    publicId: pickString(patient.publicId, patient.patientId),
    patientId: pickString(patient.patientId, patient.publicId),
    user: user
      ? {
          fullName: pickString(user.fullName, user.name),
          phone: pickString(user.phone, user.mobile),
          email: pickString(user.email),
        }
      : {
          fullName: pickString(patient.fullName, patient.patientName),
          phone: pickString(patient.phone),
        },
  };
}

function normalizeResult(entry: unknown): DoctorOrderResultAttachment | null {
  const row = asRecord(entry);
  if (!row) return null;

  const files = Array.isArray(row.attachmentFiles)
    ? row.attachmentFiles
    : Array.isArray(row.files)
      ? row.files
      : [];

  const firstFile = asRecord(files[0]);
  const downloadUrl = pickString(
    row.downloadUrl,
    row.url,
    row.fileUrl,
    row.signedUrl,
    firstFile?.downloadUrl,
    firstFile?.url,
    firstFile?.fileUrl,
    firstFile?.signedUrl,
  );

  return {
    _id: pickString(row._id, row.id),
    title: pickString(row.title, row.name, row.label),
    name: pickString(row.name, row.title),
    fileName: pickString(row.fileName, row.originalName, firstFile?.fileName, firstFile?.originalName),
    url: pickString(row.url, row.downloadUrl),
    downloadUrl,
    mimeType: pickString(row.mimeType, firstFile?.mimeType),
    reportText: pickString(row.reportText, row.summary, row.text, row.report),
    summary: pickString(row.summary, row.reportText),
  };
}

/** يطبّع استجابة القائمة/التفاصيل إلى شكل موحّد حسب API-3. */
export function normalizeDoctorOrderFromApi(raw: unknown): DoctorOrderRecord | null {
  const row = asRecord(raw);
  if (!row) return null;

  const id = pickString(row._id, row.id, row.orderId);
  if (!id) return null;

  const patientId = pickString(row.patientId, asRecord(row.patient)?._id);
  const statusFields = extractOrderStatusFieldsFromApi(row);
  const resultsRaw = Array.isArray(row.results) ? row.results : [];
  const attachmentsRaw = Array.isArray(row.attachments) ? row.attachments : [];
  const mergedResults = [
    ...resultsRaw,
    ...attachmentsRaw,
    ...(asRecord(row.resultDocument) ? [row.resultDocument] : []),
    ...(asRecord(row.latestResult) ? [row.latestResult] : []),
  ];
  const itemsRaw = Array.isArray(row.items) ? row.items : [];

  return {
    _id: id,
    orderType: pickString(row.orderType),
    type: pickString(row.type, row.category),
    category: pickString(row.category, row.type),
    orderTitle: pickString(row.orderTitle, row.orderName, row.title),
    orderName: pickString(row.orderName, row.orderTitle),
    status: statusFields.status,
    statusCode: statusFields.statusCode ?? statusFields.status,
    priority: pickString(row.priority, row.urgency),
    urgency: pickString(row.urgency, row.priority),
    createdAt: pickString(row.createdAt),
    updatedAt: pickString(row.updatedAt),
    patientId,
    encounterId: pickString(row.encounterId),
    patient: normalizePatient(row.patient, patientId),
    notes: pickString(row.notes),
    clinicalSummary: pickString(row.clinicalSummary),
    clinicalReason: pickString(row.clinicalReason, row.reason),
    instructionsToPatient: pickString(
      row.instructionsToPatient,
      row.instructions,
    ),
    labInstructions: pickString(row.labInstructions),
    imagingCenterInstructions: pickString(
      row.imagingCenterInstructions,
      row.imagingCenterInstruction,
    ),
    results: mergedResults
      .map(normalizeResult)
      .filter((item): item is DoctorOrderResultAttachment => Boolean(item)),
    items: itemsRaw.map((item) => {
      const mapped = asRecord(item);
      if (!mapped) return {};
      return {
        _id: pickString(mapped._id, mapped.id),
        title: pickString(mapped.title, mapped.name, mapped.testName),
        name: pickString(mapped.name, mapped.title),
        testName: pickString(mapped.testName, mapped.procedureName),
        procedureName: pickString(mapped.procedureName),
      };
    }),
  };
}

export function normalizeDoctorOrdersListResponse(raw: {
  orders?: DoctorOrderApiRecord[];
} | null | undefined): DoctorOrderRecord[] {
  const orders = raw?.orders ?? [];
  if (!Array.isArray(orders)) return [];
  return orders
    .map(normalizeDoctorOrderFromApi)
    .filter((order): order is DoctorOrderRecord => Boolean(order));
}
