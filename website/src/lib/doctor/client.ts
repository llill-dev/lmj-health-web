import {
  get,
  patch,
  post,
  put,
  del,
  apiRequestResult,
  apiMultipart,
} from "@/lib/api";
import type {
  EncounterDocumentLinkBody,
  EncounterDocumentLinkResponse,
  EncounterDocumentShareBody,
  EncounterDocumentShareResponse,
  EncounterDocumentsListResponse,
} from "@/lib/doctor/encounters/encounterDocumentsTypes";
import { doctorEndpoints } from "@/lib/doctor/endpoints";
import { toAppointmentTypeApiBody } from "@/lib/doctor/appointments/appointmentTypeApiBodies";
import type {
  InternalDirectoryListParams,
  InternalDirectoryListResponse,
} from "@/lib/doctor/directory/doctorDirectoryTypes";
import type {
  EncounterClinicalListParams,
  EncounterOrdersListResponse,
} from "@/lib/doctor/encounters/encounterClinicalTypes";
import type {
  CreateEncounterPrescriptionBody,
  EncounterPrescriptionFinalizeResponse,
  EncounterPrescriptionItemMutationResponse,
  EncounterPrescriptionPreviewResponse,
  EncounterPrescriptionResponse,
  EncounterPrescriptionsListResponse,
  PrescriptionItemBody,
  UpdateEncounterPrescriptionBody,
} from "@/lib/doctor/prescriptions/prescriptionTypes";
import type {
  AppendDoctorOrderResultsBody,
  AppendDoctorOrderResultsResponse,
  CancelDoctorOrderBody,
  DoctorOrderDetailsResponse,
  DoctorOrderMutationResponse,
  DoctorOrdersListParams,
  DoctorOrdersListResponse,
  UpdateDoctorOrderStatusBody,
} from "@/lib/doctor/orders/doctorOrderTypes";
import {
  normalizeDoctorOrderFromApi,
  normalizeDoctorOrdersListResponse,
} from "@/lib/doctor/orders/map-doctor-orders-api";
import type {
  CreateEncounterOrderBody,
  CreateImagingOrderBody,
  EncounterOrderFinalizeResponse,
  EncounterOrderItemMutationResponse,
  EncounterOrderPreviewResponse,
  EncounterOrderResponse,
  ImagingOrderItemBody,
  OrderCatalogItem,
  OrderCatalogListResponse,
  UpdateEncounterOrderBody,
  UpdateImagingOrderBody,
} from "@/lib/doctor/encounters/encounterOrderTypes";
import { readAuthUser } from "@/lib/cookies";
import type {
  CreateTemporaryPatientBody,
  CreateTemporaryPatientResponse,
  DoctorActionResponse,
  DoctorAppointmentDetailsResponse,
  DoctorAppointmentFile,
  DoctorAppointmentListParams,
  DoctorAppointmentMutationResponse,
  DoctorAppointmentStatus,
  DoctorAppointmentSummary,
  DoctorAppointmentsListResponse,
  DoctorBookAppointmentBody,
  DoctorCancelAppointmentBody,
  DoctorCompleteAppointmentBody,
  DoctorNoShowAppointmentBody,
  DoctorPatientAccessRequestBody,
  DoctorAccessRequestDetailsResponse,
  DoctorAccessRequestListParams,
  DoctorAccessRequestsListResponse,
  DoctorPatientAccessRequestResponse,
  DoctorPatientLinkResponse,
  DoctorCreateMedicalRecordBody,
  DoctorPatientFullProfileResponse,
  DoctorMedicalRecordDetailsResponse,
  DoctorMedicalRecordsListResponse,
  DoctorPatientPublicProfileResponse,
  DoctorPatientFilesListResponse,
  DoctorPatientFile,
  DoctorPatientFileDetailsResponse,
  DoctorFileDownloadUrlResponse,
  DoctorPatientFileDeleteResponse,
  DoctorCreateEncounterBody,
  DoctorUpdateEncounterBody,
  DoctorEncountersListParams,
  DoctorPatientEncountersListParams,
  DoctorPatientEncountersListResponse,
  DoctorEncounterDetailsResponse,
  DoctorCloseEncounterResponse,
  DoctorPatientsListParams,
  DoctorPatientsListResponse,
  DoctorUpdateMedicalRecordBody,
  DoctorRescheduleAppointmentBody,
  DoctorScheduleResponse,
  DoctorUpdateScheduleBody,
  DoctorUpdateScheduleSettingsBody,
  DoctorAddDayBody,
  DoctorUpdateDayBody,
  DoctorAddExceptionBody,
  DoctorUpdateExceptionsBody,
  ScheduleDayKey,
  ScheduleDayTemplate,
  ScheduleException,
  DoctorAppointmentTypesResponse,
  DoctorAppointmentFilesListResponse,
  DoctorAppointmentFileDetailsResponse,
  DoctorAppointmentFileUploadResponse,
  DoctorAppointmentFileDeleteResponse,
  CreateAppointmentTypeBody,
  UpdateAppointmentTypeBody,
  AppointmentTypeMutationResponse,
  DoctorSlotsQueryParams,
  DoctorAllSlotsResponse,
  DoctorFreeSlotsResponse,
  DoctorBookedSlotsResponse,
  AddDoctorPatientMedicationBody,
  AddDoctorPatientMedicationResponse,
} from "@/lib/doctor/types";
import type {
  CreateDoctorLibraryItemBody,
  DoctorLibraryItemDeleteResponse,
  DoctorLibraryItemFavoriteResponse,
  DoctorLibraryItemMutationResponse,
  DoctorLibraryListResponse,
  DoctorLibraryRecentResponse,
  UpdateDoctorLibraryItemBody,
} from "@/lib/doctor/library/libraryTypes";
import type {
  CreateDoctorTemplateBody,
  DoctorTemplateApplyResponse,
  DoctorTemplateDeleteResponse,
  DoctorTemplateMutationResponse,
  DoctorTemplatesListResponse,
  UpdateDoctorTemplateBody,
} from "@/lib/doctor/templates/templateTypes";
import type {
  CreateOrderFavoriteBody,
  OrderFavoriteMutationResponse,
  OrderFavoritesListResponse,
} from "@/lib/doctor/orders/orderFavoritesTypes";

type DoctorOrderEnvelope = {
  order?: unknown;
  item?: unknown;
  data?: unknown;
  result?: unknown;
};

type DoctorListEnvelope = {
  items?: unknown;
  labTests?: unknown;
  imaging?: unknown;
  procedures?: unknown;
  files?: unknown;
  templates?: unknown;
  patients?: unknown;
  doctors?: unknown;
  favorites?: unknown;
  encounters?: unknown;
  requests?: unknown;
  request?: unknown;
  data?: unknown;
  item?: unknown;
  result?: unknown;
  page?: unknown;
  limit?: unknown;
  total?: unknown;
  results?: unknown;
  pageInfo?: unknown;
  freeSlots?: unknown;
  appointments?: unknown;
  date?: unknown;
  doctorId?: unknown;
  duration?: unknown;
  gap?: unknown;
  totalFreeSlots?: unknown;
  totalBooked?: unknown;
};

function asDoctorOrderEnvelope(value: unknown): DoctorOrderEnvelope | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as DoctorOrderEnvelope)
    : null;
}

function asDoctorListEnvelope(value: unknown): DoctorListEnvelope | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as DoctorListEnvelope)
    : null;
}

function readDoctorNestedEnvelope(value: unknown): DoctorListEnvelope | null {
  const record = asDoctorListEnvelope(value);
  return (
    asDoctorListEnvelope(record?.data) ??
    asDoctorListEnvelope(record?.item) ??
    asDoctorListEnvelope(record?.result) ??
    null
  );
}

function isDoctorRecordArray(value: unknown): value is Record<string, unknown>[] {
  return (
    Array.isArray(value) &&
    value.every((item) => item && typeof item === "object" && !Array.isArray(item))
  );
}

function isDoctorRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function readDoctorNamedValue(
  value: unknown,
  key: string,
): unknown {
  return isDoctorRecord(value) ? value[key] : undefined;
}

function readDoctorNumber(value: unknown): number | undefined {
  return typeof value === "number" ? value : undefined;
}

function readDoctorScheduleSlotSettings(
  value: unknown,
): DoctorScheduleResponse["slotSettings"] | null {
  if (!isDoctorRecord(value)) return null;

  const duration = readDoctorNumber(value.duration);
  const gap = readDoctorNumber(value.gap);

  if (duration == null || gap == null) return null;

  return {
    ...value,
    duration,
    gap,
  };
}

function readDoctorPatientFilesArray(value: unknown): DoctorPatientFile[] | null {
  return isDoctorRecordArray(value) ? (value as DoctorPatientFile[]) : null;
}

function readDoctorLibraryItemsArray(
  value: unknown,
): NonNullable<DoctorLibraryListResponse["items"]> | null {
  return isDoctorRecordArray(value)
    ? (value as NonNullable<DoctorLibraryListResponse["items"]>)
    : null;
}

function readDoctorTemplatesArray(
  value: unknown,
): NonNullable<DoctorTemplatesListResponse["templates"]> | null {
  return isDoctorRecordArray(value)
    ? (value as NonNullable<DoctorTemplatesListResponse["templates"]>)
    : null;
}

function readDoctorListPageInfo(value: unknown) {
  return asDoctorListEnvelope(value);
}

function readDoctorPaging(
  response: DoctorListEnvelope,
  fallbackLength: number,
): Pick<
  DoctorPatientsListResponse,
  "page" | "limit" | "total" | "results"
> {
  const nested = readDoctorNestedEnvelope(response);
  const pageInfo = readDoctorListPageInfo(response.pageInfo);

  return {
    page:
      readDoctorNumber(response.page) ??
      readDoctorNumber(nested?.page) ??
      readDoctorNumber(pageInfo?.page) ??
      1,
    limit:
      readDoctorNumber(response.limit) ??
      readDoctorNumber(nested?.limit) ??
      readDoctorNumber(pageInfo?.limit) ??
      fallbackLength,
    total:
      readDoctorNumber(response.total) ??
      readDoctorNumber(nested?.total) ??
      readDoctorNumber(pageInfo?.total) ??
      fallbackLength,
    results:
      readDoctorNumber(response.results) ??
      readDoctorNumber(nested?.results) ??
      readDoctorNumber(pageInfo?.results) ??
      fallbackLength,
  };
}

function readDoctorCollectionValue<T>(
  value: unknown,
  fieldNames: string[],
  readArray: (value: unknown) => T[] | null,
): T[] | null {
  const record = asDoctorListEnvelope(value);
  if (!record) return null;

  for (const fieldName of fieldNames) {
    const items = readArray(readDoctorNamedValue(record, fieldName));
    if (items) return items;
  }

  return (
    readArray(record.items) ??
    readDoctorCollectionValue(record.data, fieldNames, readArray) ??
    readDoctorCollectionValue(record.result, fieldNames, readArray)
  );
}

function readDoctorDetailValue<T>(
  value: unknown,
  fieldNames: string[],
  readDirect: (value: unknown) => T | null,
): T | null {
  const record = asDoctorListEnvelope(value);
  if (!record) return null;

  for (const fieldName of fieldNames) {
    const direct = readDirect(readDoctorNamedValue(record, fieldName));
    if (direct) return direct;
  }

  return (
    readDirect(record.item) ??
    readDirect(record.data) ??
    readDoctorDetailValue(record.data, fieldNames, readDirect) ??
    readDirect(record.result) ??
    readDoctorDetailValue(record.result, fieldNames, readDirect)
  );
}

function withDoctorDetail<TResponse extends object, TValue>(
  response: TResponse,
  key: keyof TResponse,
  value: TValue | null | undefined,
): TResponse {
  return value ? { ...response, [key]: value } : response;
}

function withDoctorList<TResponse extends object, TKey extends keyof TResponse, TValue>(
  response: TResponse,
  key: TKey,
  value: TValue,
): TResponse {
  return { ...response, [key]: value };
}

function withDoctorDetails<TResponse extends object>(
  response: TResponse,
  patch: Partial<TResponse>,
): TResponse {
  return {
    ...response,
    ...patch,
  };
}

function withDoctorResolvedDetail<
  TResponse extends object,
  TKey extends keyof TResponse,
  TValue,
>(
  response: TResponse,
  key: TKey,
  value: TValue | null | undefined,
  fallback: TResponse[TKey],
): TResponse {
  return withDoctorDetails(response, {
    [key]: value ?? fallback,
  } as Partial<TResponse>);
}

function readDoctorString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function readDoctorArray<T>(value: unknown): T[] | null {
  return Array.isArray(value) ? (value as T[]) : null;
}

function readDoctorFreeSlotsArray(
  value: unknown,
): DoctorAllSlotsResponse["freeSlots"] | null {
  return readDoctorArray<DoctorAllSlotsResponse["freeSlots"][number]>(value);
}

function readDoctorBookedAppointmentsArray(
  value: unknown,
): DoctorAllSlotsResponse["appointments"] | null {
  return readDoctorArray<DoctorAllSlotsResponse["appointments"][number]>(value);
}

function readDoctorPreferredArray<T>(
  value: T[] | undefined,
  fallback: T[] | null,
): T[] | undefined {
  return Array.isArray(value) && value.length > 0 ? value : fallback ?? value;
}

function readDoctorListOrEmpty<T>(
  value: T[] | null | undefined,
): T[] {
  return value ?? [];
}

function withDoctorPaging<TResponse extends DoctorListEnvelope>(
  response: TResponse,
  fallbackLength: number,
): TResponse &
  Pick<DoctorPatientsListResponse, "page" | "limit" | "total" | "results"> {
  return {
    ...response,
    ...readDoctorPaging(response, fallbackLength),
  };
}

function readDoctorFilesList(value: unknown) {
  return readDoctorCollectionValue(
    value,
    ["files"],
    readDoctorPatientFilesArray,
  );
}

function readDoctorLibraryItems(value: unknown) {
  return readDoctorCollectionValue(value, [], readDoctorLibraryItemsArray);
}

function readDoctorTemplates(value: unknown) {
  return readDoctorCollectionValue(
    value,
    ["templates"],
    readDoctorTemplatesArray,
  );
}

function readDoctorPatientsArray(
  value: unknown,
): NonNullable<DoctorPatientsListResponse["patients"]> | null {
  return isDoctorRecordArray(value)
    ? (value as NonNullable<DoctorPatientsListResponse["patients"]>)
    : null;
}

function readInternalDirectoryDoctorsArray(
  value: unknown,
): NonNullable<InternalDirectoryListResponse["doctors"]> | null {
  return isDoctorRecordArray(value)
    ? (value as NonNullable<InternalDirectoryListResponse["doctors"]>)
    : null;
}

function readOrderFavoritesArray(
  value: unknown,
): NonNullable<OrderFavoritesListResponse["favorites"]> | null {
  return isDoctorRecordArray(value)
    ? (value as NonNullable<OrderFavoritesListResponse["favorites"]>)
    : null;
}

function readDoctorPatients(value: unknown) {
  return readDoctorCollectionValue(value, ["patients"], readDoctorPatientsArray);
}

function readInternalDirectoryDoctors(value: unknown) {
  return readDoctorCollectionValue(
    value,
    ["doctors"],
    readInternalDirectoryDoctorsArray,
  );
}

function readOrderFavorites(value: unknown) {
  return readDoctorCollectionValue(
    value,
    ["favorites"],
    readOrderFavoritesArray,
  );
}

function readDoctorEncountersArray(
  value: unknown,
): NonNullable<DoctorPatientEncountersListResponse["encounters"]> | null {
  return isDoctorRecordArray(value)
    ? (value as NonNullable<DoctorPatientEncountersListResponse["encounters"]>)
    : null;
}

function readDoctorAccessRequestsArray(
  value: unknown,
): NonNullable<DoctorAccessRequestsListResponse["requests"]> | null {
  return isDoctorRecordArray(value)
    ? (value as NonNullable<DoctorAccessRequestsListResponse["requests"]>)
    : null;
}

function readDoctorAccessRequestRecord(
  value: unknown,
): DoctorAccessRequestDetailsResponse["request"] | null {
  return isDoctorRecord(value)
    ? (value as DoctorAccessRequestDetailsResponse["request"])
    : null;
}

function readDoctorEncounters(value: unknown) {
  return readDoctorCollectionValue(
    value,
    ["encounters"],
    readDoctorEncountersArray,
  );
}

function readDoctorAccessRequests(value: unknown) {
  return readDoctorCollectionValue(
    value,
    ["requests"],
    readDoctorAccessRequestsArray,
  );
}

function readDoctorAccessRequestDetails(value: unknown) {
  return readDoctorDetailValue(
    value,
    ["request"],
    readDoctorAccessRequestRecord,
  );
}

function readDoctorPatientProfileRecord(
  value: unknown,
): DoctorPatientFullProfileResponse["patient"] | null {
  if (!isDoctorRecord(value)) return null;
  return value as DoctorPatientFullProfileResponse["patient"];
}

function readDoctorMedicalRecordRecord(
  value: unknown,
): DoctorMedicalRecordDetailsResponse["record"] | null {
  if (!isDoctorRecord(value)) return null;
  return value as DoctorMedicalRecordDetailsResponse["record"];
}

function readDoctorEncounterRecord(
  value: unknown,
): DoctorEncounterDetailsResponse["encounter"] | null {
  if (!isDoctorRecord(value)) return null;
  return value as DoctorEncounterDetailsResponse["encounter"];
}

function readDoctorAppointmentRecord(
  value: unknown,
): DoctorAppointmentDetailsResponse["appointment"] | null {
  if (!isDoctorRecord(value)) return null;
  return value as DoctorAppointmentDetailsResponse["appointment"];
}

function readDoctorAppointmentFilesArray(
  value: unknown,
): NonNullable<DoctorAppointmentDetailsResponse["files"]> | null {
  return isDoctorRecordArray(value)
    ? (value as NonNullable<DoctorAppointmentDetailsResponse["files"]>)
    : null;
}

function readDoctorPatientFileRecord(
  value: unknown,
): DoctorPatientFileDetailsResponse["file"] | null {
  if (!isDoctorRecord(value)) return null;
  return value as DoctorPatientFileDetailsResponse["file"];
}

function readDoctorMedicalRecordsArray(
  value: unknown,
): DoctorMedicalRecordsListResponse["records"] | null {
  return isDoctorRecordArray(value)
    ? (value as DoctorMedicalRecordsListResponse["records"])
    : null;
}

function readDoctorPatientPublicProfile(value: unknown) {
  return readDoctorDetailValue(
    value,
    ["patient"],
    readDoctorPatientProfileRecord,
  );
}

function readDoctorMedicalRecords(value: unknown) {
  return readDoctorCollectionValue(
    value,
    ["records"],
    readDoctorMedicalRecordsArray,
  );
}

function readDoctorMedicalRecordDetails(value: unknown) {
  return readDoctorDetailValue(
    value,
    ["record"],
    readDoctorMedicalRecordRecord,
  );
}

function readDoctorEncounterDetails(value: unknown) {
  return readDoctorDetailValue(
    value,
    ["encounter"],
    readDoctorEncounterRecord,
  );
}

function readDoctorAppointmentDetails(value: unknown) {
  return readDoctorDetailValue(
    value,
    ["appointment"],
    readDoctorAppointmentRecord,
  );
}

function readDoctorAppointmentFiles(value: unknown) {
  return readDoctorCollectionValue(
    value,
    ["files"],
    readDoctorAppointmentFilesArray,
  );
}

function readDoctorPatientFileDetails(value: unknown) {
  return readDoctorDetailValue(
    value,
    ["file"],
    readDoctorPatientFileRecord,
  );
}

function readDoctorAppointmentsArray(
  value: unknown,
): DoctorAppointmentsListResponse["appointments"] | null {
  return isDoctorRecordArray(value)
    ? (value as DoctorAppointmentsListResponse["appointments"])
    : null;
}

function readDoctorAppointmentFilesListArray(
  value: unknown,
): DoctorAppointmentFilesListResponse["items"] | null {
  return isDoctorRecordArray(value)
    ? (value as DoctorAppointmentFilesListResponse["items"])
    : null;
}

function readDoctorAppointmentTypesArray(
  value: unknown,
): DoctorAppointmentTypesResponse["appointmentTypes"] | null {
  return isDoctorRecordArray(value)
    ? (value as DoctorAppointmentTypesResponse["appointmentTypes"])
    : null;
}

function readDoctorScheduleRecord(value: unknown): DoctorScheduleResponse | null {
  if (!isDoctorRecord(value)) return null;
  const availableTimes = readDoctorNamedValue(value, "availableTimes");
  const exceptions = readDoctorNamedValue(value, "exceptions");
  const slotSettings = readDoctorScheduleSlotSettings(
    readDoctorNamedValue(value, "slotSettings"),
  );

  if (!Array.isArray(availableTimes)) return null;
  if (!Array.isArray(exceptions)) return null;
  if (!slotSettings) return null;

  return {
    ...value,
    availableTimes: availableTimes as DoctorScheduleResponse["availableTimes"],
    exceptions: exceptions as DoctorScheduleResponse["exceptions"],
    slotSettings,
  };
}

function readDoctorAppointments(value: unknown) {
  return readDoctorCollectionValue(
    value,
    ["appointments"],
    readDoctorAppointmentsArray,
  );
}

function readDoctorAppointmentFilesList(value: unknown) {
  return readDoctorCollectionValue(
    value,
    [],
    readDoctorAppointmentFilesListArray,
  );
}

function readDoctorAppointmentTypes(value: unknown) {
  return readDoctorCollectionValue(
    value,
    ["appointmentTypes"],
    readDoctorAppointmentTypesArray,
  );
}

function readDoctorSchedule(value: unknown) {
  return readDoctorDetailValue(value, ["schedule"], readDoctorScheduleRecord);
}

function readEncounterPrescriptionArray(
  value: unknown,
): EncounterPrescriptionsListResponse["prescriptions"] | null {
  return isDoctorRecordArray(value)
    ? (value as EncounterPrescriptionsListResponse["prescriptions"])
    : null;
}

function readEncounterOrderArray(
  value: unknown,
): EncounterOrdersListResponse["orders"] | null {
  return isDoctorRecordArray(value)
    ? (value as EncounterOrdersListResponse["orders"])
    : null;
}

function readOrderCatalogItemArray(
  value: unknown,
): OrderCatalogItem[] | null {
  if (!isDoctorRecordArray(value)) return null;

  const items = value
    .map((record): OrderCatalogItem | null => {
      const itemId =
        readDoctorString(record._id) ?? readDoctorString(record.id);
      if (!itemId) return null;

      return {
        _id: itemId,
        title: readDoctorString(record.title),
        name: readDoctorString(record.name),
        label: readDoctorString(record.label),
        category: readDoctorString(record.category),
        section: readDoctorString(record.section),
        isFavorited:
          typeof record.isFavorited === "boolean"
            ? record.isFavorited
            : undefined,
      };
    })
    .filter((item): item is OrderCatalogItem => item != null);

  return items.length > 0 ? items : null;
}

function readEncounterDocumentArray(
  value: unknown,
): EncounterDocumentsListResponse["documents"] | null {
  return isDoctorRecordArray(value)
    ? (value as EncounterDocumentsListResponse["documents"])
    : null;
}

function readEncounterPrescriptionRecord(
  value: unknown,
): EncounterPrescriptionResponse["prescription"] | null {
  return isDoctorRecord(value)
    ? (value as EncounterPrescriptionResponse["prescription"])
    : null;
}

function readEncounterPrescriptionItemRecord(
  value: unknown,
): EncounterPrescriptionItemMutationResponse["item"] | null {
  return isDoctorRecord(value)
    ? (value as EncounterPrescriptionItemMutationResponse["item"])
    : null;
}

function readEncounterOrderRecord(
  value: unknown,
): EncounterOrderResponse["order"] | null {
  return isDoctorRecord(value) ? (value as EncounterOrderResponse["order"]) : null;
}

function readEncounterDocumentRecord(
  value: unknown,
): EncounterDocumentLinkResponse["document"] | null {
  return isDoctorRecord(value)
    ? (value as EncounterDocumentLinkResponse["document"])
    : null;
}

function readEncounterPreviewRecord(
  value: unknown,
): EncounterOrderPreviewResponse["preview"] | null {
  return isDoctorRecord(value)
    ? (value as EncounterOrderPreviewResponse["preview"])
    : null;
}

function readEncounterPrescriptions(value: unknown) {
  return readDoctorCollectionValue(
    value,
    ["prescriptions"],
    readEncounterPrescriptionArray,
  );
}

function readEncounterOrders(value: unknown) {
  return readDoctorCollectionValue(value, ["orders"], readEncounterOrderArray);
}

function readEncounterOrderCatalogItems(value: unknown) {
  const record = asDoctorListEnvelope(value);
  if (!record) return null;

  return (
    readOrderCatalogItemArray(record.items) ??
    readOrderCatalogItemArray(record.labTests) ??
    readOrderCatalogItemArray(record.imaging) ??
    readOrderCatalogItemArray(record.procedures) ??
    readEncounterOrderCatalogItems(record.data) ??
    readEncounterOrderCatalogItems(record.result)
  );
}

function readEncounterDocuments(value: unknown) {
  return readDoctorCollectionValue(
    value,
    ["documents"],
    readEncounterDocumentArray,
  );
}

function readEncounterPrescriptionDetails(value: unknown) {
  return readDoctorDetailValue(
    value,
    ["prescription"],
    readEncounterPrescriptionRecord,
  );
}

function readEncounterOrderDetails(value: unknown) {
  return readDoctorDetailValue(value, ["order"], readEncounterOrderRecord);
}

function readEncounterDocumentDetails(value: unknown) {
  return readDoctorDetailValue(value, ["document"], readEncounterDocumentRecord);
}

function readEncounterPreviewDetails(value: unknown) {
  return readDoctorDetailValue(value, ["preview"], readEncounterPreviewRecord);
}

function readDoctorLibraryItemRecord(
  value: unknown,
): DoctorLibraryItemMutationResponse["item"] | null {
  return isDoctorRecord(value)
    ? (value as DoctorLibraryItemMutationResponse["item"])
    : null;
}

function readDoctorTemplateRecord(
  value: unknown,
): DoctorTemplateMutationResponse["template"] | null {
  return isDoctorRecord(value)
    ? (value as DoctorTemplateMutationResponse["template"])
    : null;
}

function readDoctorTemplateApplyRecord(
  value: unknown,
): DoctorTemplateApplyResponse["template"] | null {
  return isDoctorRecord(value)
    ? (value as DoctorTemplateApplyResponse["template"])
    : null;
}

function readDoctorAppointmentTypeRecord(
  value: unknown,
): AppointmentTypeMutationResponse["appointmentType"] | null {
  return isDoctorRecord(value)
    ? (value as AppointmentTypeMutationResponse["appointmentType"])
    : null;
}

function readDoctorMedicationRecord(
  value: unknown,
): AddDoctorPatientMedicationResponse["medication"] | null {
  return isDoctorRecord(value)
    ? (value as AddDoctorPatientMedicationResponse["medication"])
    : null;
}

function readDoctorOrderFavoriteRecord(
  value: unknown,
): OrderFavoriteMutationResponse["favorite"] | null {
  return isDoctorRecord(value)
    ? (value as OrderFavoriteMutationResponse["favorite"])
    : null;
}

function normalizeDoctorPatientFilesListResponse(
  response: DoctorPatientFilesListResponse,
): DoctorPatientFilesListResponse {
  const files = readDoctorListOrEmpty(readDoctorFilesList(response));
  const paging = readDoctorPaging(response, files.length);

  return {
    ...response,
    items: files,
    files,
    ...paging,
  };
}

function normalizeDoctorLibraryRecentResponse(
  response: DoctorLibraryRecentResponse,
): DoctorLibraryRecentResponse {
  return withDoctorList(
    response,
    "items",
    readDoctorListOrEmpty(readDoctorLibraryItems(response)),
  );
}

function normalizeDoctorLibraryListResponse(
  response: DoctorLibraryListResponse,
): DoctorLibraryListResponse {
  const items = readDoctorListOrEmpty(readDoctorLibraryItems(response));
  return withDoctorList(withDoctorPaging(response, items.length), "items", items);
}

function normalizeDoctorTemplatesListResponse(
  response: DoctorTemplatesListResponse,
): DoctorTemplatesListResponse {
  const templates = readDoctorListOrEmpty(readDoctorTemplates(response));
  return withDoctorList(
    withDoctorPaging(response, templates.length),
    "templates",
    templates,
  );
}

function normalizeDoctorPatientsListResponse(
  response: DoctorPatientsListResponse,
): DoctorPatientsListResponse {
  const patients = readDoctorListOrEmpty(readDoctorPatients(response));
  return withDoctorList(
    withDoctorPaging(response, patients.length),
    "patients",
    patients,
  );
}

function normalizeInternalDirectoryListResponse(
  response: InternalDirectoryListResponse,
): InternalDirectoryListResponse {
  const doctors = readDoctorListOrEmpty(readInternalDirectoryDoctors(response));
  return withDoctorList(
    withDoctorPaging(response, doctors.length),
    "doctors",
    doctors,
  );
}

function normalizeOrderFavoritesListResponse(
  response: OrderFavoritesListResponse,
): OrderFavoritesListResponse {
  const favorites = readDoctorListOrEmpty(readOrderFavorites(response));
  return withDoctorList(
    withDoctorPaging(response, favorites.length),
    "favorites",
    favorites,
  );
}

function normalizeDoctorEncountersListResponse(
  response: DoctorPatientEncountersListResponse,
): DoctorPatientEncountersListResponse {
  const encounters = readDoctorListOrEmpty(readDoctorEncounters(response));
  return withDoctorList(
    withDoctorPaging(response, encounters.length),
    "encounters",
    encounters,
  );
}

function normalizeDoctorAccessRequestsListResponse(
  response: DoctorAccessRequestsListResponse,
): DoctorAccessRequestsListResponse {
  const requests = readDoctorListOrEmpty(readDoctorAccessRequests(response));
  return withDoctorList(
    withDoctorPaging(response, requests.length),
    "requests",
    requests,
  );
}

function normalizeDoctorAccessRequestDetailsResponse(
  response: DoctorAccessRequestDetailsResponse,
): DoctorAccessRequestDetailsResponse {
  const request = readDoctorAccessRequestDetails(response);
  return withDoctorDetail(response, "request", request);
}

function normalizeDoctorSlotsResponse(
  response: DoctorAllSlotsResponse,
): DoctorAllSlotsResponse {
  const nested = readDoctorNestedEnvelope(response);

  if (!nested) {
    return response;
  }

  const nestedFreeSlots = readDoctorFreeSlotsArray(nested.freeSlots);
  const nestedAppointments = readDoctorBookedAppointmentsArray(nested.appointments);

  return {
    ...response,
    date: readDoctorString(response.date) ?? String(nested.date ?? ""),
    doctorId:
      readDoctorString(response.doctorId) ?? String(nested.doctorId ?? ""),
    duration:
      readDoctorNumber(response.duration) ??
      readDoctorNumber(nested.duration) ??
      response.duration,
    gap:
      readDoctorNumber(response.gap) ??
      readDoctorNumber(nested.gap) ??
      response.gap,
    freeSlots: readDoctorPreferredArray(response.freeSlots, nestedFreeSlots),
    totalFreeSlots:
      readDoctorNumber(response.totalFreeSlots) ??
      readDoctorNumber(nested.totalFreeSlots) ??
      response.totalFreeSlots,
    appointments: readDoctorPreferredArray(
      response.appointments,
      nestedAppointments,
    ),
    totalBooked:
      readDoctorNumber(response.totalBooked) ??
      readDoctorNumber(nested.totalBooked) ??
      response.totalBooked,
  };
}

function normalizeDoctorPublicPatientProfileResponse(
  response: DoctorPatientPublicProfileResponse,
): DoctorPatientPublicProfileResponse {
  const patient = readDoctorPatientPublicProfile(response);
  return withDoctorDetail(response, "patient", patient);
}

function normalizeDoctorMedicalRecordsListResponse(
  response: DoctorMedicalRecordsListResponse,
): DoctorMedicalRecordsListResponse {
  const records = readDoctorListOrEmpty(readDoctorMedicalRecords(response));
  return withDoctorList(response, "records", records);
}

function normalizeDoctorMedicalRecordDetailsResponse(
  response: DoctorMedicalRecordDetailsResponse,
): DoctorMedicalRecordDetailsResponse {
  const record = readDoctorMedicalRecordDetails(response);
  return withDoctorDetail(response, "record", record);
}

function normalizeDoctorEncounterDetailsResponse(
  response: DoctorEncounterDetailsResponse,
): DoctorEncounterDetailsResponse {
  const encounter = readDoctorEncounterDetails(response);
  return withDoctorDetail(response, "encounter", encounter);
}

function normalizeDoctorAppointmentDetailsResponse(
  response: DoctorAppointmentDetailsResponse,
): DoctorAppointmentDetailsResponse {
  const appointment = readDoctorAppointmentDetails(response);
  const files = readDoctorAppointmentFiles(response);

  return withDoctorResolvedDetail(
    withDoctorResolvedDetail(
      response,
      "appointment",
      appointment,
      response.appointment,
    ),
    "files",
    files,
    response.files,
  );
}

function normalizeDoctorAppointmentsListResponse(
  response: DoctorAppointmentsListResponse,
): DoctorAppointmentsListResponse {
  const appointments = readDoctorListOrEmpty(readDoctorAppointments(response));
  return withDoctorList(
    withDoctorPaging(response, appointments.length),
    "appointments",
    appointments,
  );
}

function normalizeDoctorAppointmentFilesListResponse(
  response: DoctorAppointmentFilesListResponse,
): DoctorAppointmentFilesListResponse {
  return withDoctorList(
    response,
    "items",
    readDoctorListOrEmpty(readDoctorAppointmentFilesList(response)),
  );
}

function normalizeDoctorScheduleResponse(
  response: DoctorScheduleResponse,
): DoctorScheduleResponse {
  const schedule = readDoctorSchedule(response);
  if (!schedule) return response;

  return {
    ...response,
    availableTimes: schedule.availableTimes ?? response.availableTimes,
    exceptions: schedule.exceptions ?? response.exceptions,
    slotSettings: schedule.slotSettings ?? response.slotSettings,
  };
}

function normalizeDoctorAppointmentTypesResponse(
  response: DoctorAppointmentTypesResponse,
): DoctorAppointmentTypesResponse {
  return withDoctorList(
    response,
    "appointmentTypes",
    readDoctorListOrEmpty(readDoctorAppointmentTypes(response)),
  );
}

function normalizeDoctorPatientFileDetailsResponse(
  response: DoctorPatientFileDetailsResponse,
): DoctorPatientFileDetailsResponse {
  const file = readDoctorPatientFileDetails(response);
  return withDoctorDetail(response, "file", file);
}

function normalizeEncounterPrescriptionsListResponse(
  response: EncounterPrescriptionsListResponse,
): EncounterPrescriptionsListResponse {
  const prescriptions = readDoctorListOrEmpty(readEncounterPrescriptions(response));
  return withDoctorList(
    withDoctorPaging(response, prescriptions.length),
    "prescriptions",
    prescriptions,
  );
}

function normalizeEncounterOrdersListResponse(
  response: EncounterOrdersListResponse,
): EncounterOrdersListResponse {
  const orders = readDoctorListOrEmpty(readEncounterOrders(response));
  return withDoctorList(
    withDoctorPaging(response, orders.length),
    "orders",
    orders,
  );
}

function normalizeEncounterOrderResponse(
  response: EncounterOrderResponse,
): EncounterOrderResponse {
  return withDoctorDetail(response, "order", readEncounterOrderDetails(response));
}

function normalizeEncounterPrescriptionResponse(
  response: EncounterPrescriptionResponse,
): EncounterPrescriptionResponse {
  return withDoctorDetail(
    response,
    "prescription",
    readEncounterPrescriptionDetails(response),
  );
}

function normalizeEncounterPrescriptionItemMutationResponse(
  response: EncounterPrescriptionItemMutationResponse,
): EncounterPrescriptionItemMutationResponse {
  const record = asDoctorListEnvelope(response);
  const nested = readDoctorNestedEnvelope(response);
  const item =
    readEncounterPrescriptionItemRecord(record?.item) ??
    readEncounterPrescriptionItemRecord(nested?.item) ??
    readEncounterPrescriptionItemRecord(record?.data) ??
    readEncounterPrescriptionItemRecord(nested?.data) ??
    response.item;

  return withDoctorDetails(response, {
    prescriptionId:
      readDoctorString(readDoctorNamedValue(record, "prescriptionId")) ??
      readDoctorString(readDoctorNamedValue(nested, "prescriptionId")) ??
      response.prescriptionId,
    item,
    itemCount:
      readDoctorNumber(readDoctorNamedValue(record, "itemCount")) ??
      readDoctorNumber(readDoctorNamedValue(nested, "itemCount")) ??
      response.itemCount,
    updatedAt:
      readDoctorString(readDoctorNamedValue(record, "updatedAt")) ??
      readDoctorString(readDoctorNamedValue(nested, "updatedAt")) ??
      response.updatedAt,
  });
}

function normalizeEncounterPrescriptionFinalizeResponse(
  response: EncounterPrescriptionFinalizeResponse,
): EncounterPrescriptionFinalizeResponse {
  const record = asDoctorListEnvelope(response);
  const nested = readDoctorNestedEnvelope(response);

  return withDoctorDetails(response, {
    prescriptionId:
      readDoctorString(readDoctorNamedValue(record, "prescriptionId")) ??
      readDoctorString(readDoctorNamedValue(nested, "prescriptionId")) ??
      response.prescriptionId,
    status:
      readDoctorString(readDoctorNamedValue(record, "status")) ??
      readDoctorString(readDoctorNamedValue(nested, "status")) ??
      response.status,
    finalizedAt:
      readDoctorString(readDoctorNamedValue(record, "finalizedAt")) ??
      readDoctorString(readDoctorNamedValue(nested, "finalizedAt")) ??
      response.finalizedAt,
  });
}

function normalizeEncounterOrderPreviewResponse(
  response: EncounterOrderPreviewResponse,
): EncounterOrderPreviewResponse {
  return withDoctorDetails(response, {
    preview: readEncounterPreviewDetails(response) ?? response.preview,
    order: readEncounterOrderDetails(response) ?? response.order,
  });
}

function normalizeEncounterOrderItemMutationResponse(
  response: EncounterOrderItemMutationResponse,
): EncounterOrderItemMutationResponse {
  const record = asDoctorListEnvelope(response);
  const nested = readDoctorNestedEnvelope(response);
  const item =
    readDoctorDetailValue(
      response,
      ["item"],
      (value) =>
        isDoctorRecord(value)
          ? (value as EncounterOrderItemMutationResponse["item"])
          : null,
    ) ?? response.item;

  return withDoctorDetails(response, {
    orderId:
      readDoctorString(readDoctorNamedValue(record, "orderId")) ??
      readDoctorString(readDoctorNamedValue(nested, "orderId")) ??
      response.orderId,
    item,
    itemCount:
      readDoctorNumber(readDoctorNamedValue(record, "itemCount")) ??
      readDoctorNumber(readDoctorNamedValue(nested, "itemCount")) ??
      response.itemCount,
    updatedAt:
      readDoctorString(readDoctorNamedValue(record, "updatedAt")) ??
      readDoctorString(readDoctorNamedValue(nested, "updatedAt")) ??
      response.updatedAt,
  });
}

function normalizeEncounterPrescriptionPreviewResponse(
  response: EncounterPrescriptionPreviewResponse,
): EncounterPrescriptionPreviewResponse {
  return withDoctorDetail(
    response,
    "preview",
    readEncounterPreviewDetails(response),
  );
}

function normalizeEncounterOrderFinalizeResponse(
  response: EncounterOrderFinalizeResponse,
): EncounterOrderFinalizeResponse {
  const record = asDoctorListEnvelope(response);
  const nested = readDoctorNestedEnvelope(response);

  return withDoctorDetails(response, {
    orderId:
      readDoctorString(readDoctorNamedValue(record, "orderId")) ??
      readDoctorString(readDoctorNamedValue(nested, "orderId")) ??
      response.orderId,
    encounterId:
      readDoctorString(readDoctorNamedValue(record, "encounterId")) ??
      readDoctorString(readDoctorNamedValue(nested, "encounterId")) ??
      response.encounterId,
    statusCode:
      readDoctorString(readDoctorNamedValue(record, "statusCode")) ??
      readDoctorString(readDoctorNamedValue(nested, "statusCode")) ??
      response.statusCode,
    status:
      readDoctorString(readDoctorNamedValue(record, "status")) ??
      readDoctorString(readDoctorNamedValue(nested, "status")) ??
      response.status,
  });
}

function normalizeOrderCatalogListResponse(
  response: OrderCatalogListResponse,
): OrderCatalogListResponse {
  const items: OrderCatalogItem[] = readDoctorListOrEmpty(
    readEncounterOrderCatalogItems(response),
  );
  return {
    ...response,
    ...withDoctorPaging(response, items.length),
    items,
  };
}

function normalizeEncounterDocumentsListResponse(
  response: EncounterDocumentsListResponse,
): EncounterDocumentsListResponse {
  return withDoctorList(
    response,
    "documents",
    readDoctorListOrEmpty(readEncounterDocuments(response)),
  );
}

function normalizeEncounterDocumentLinkResponse(
  response: EncounterDocumentLinkResponse,
): EncounterDocumentLinkResponse {
  return withDoctorDetail(response, "document", readEncounterDocumentDetails(response));
}

function normalizeDoctorAppointmentMutationResponse(
  response: DoctorAppointmentMutationResponse,
): DoctorAppointmentMutationResponse {
  return withDoctorDetail(
    response,
    "appointment",
    readDoctorAppointmentDetails(response),
  );
}

function normalizeDoctorAppointmentFileUploadResponse(
  response: DoctorAppointmentFileUploadResponse,
): DoctorAppointmentFileUploadResponse {
  return withDoctorDetail(response, "file", readDoctorPatientFileDetails(response));
}

function normalizeDoctorAppointmentFileDeleteResponse(
  response: DoctorAppointmentFileDeleteResponse,
): DoctorAppointmentFileDeleteResponse {
  const record = asDoctorListEnvelope(response);
  const nested = readDoctorNestedEnvelope(response);
  const success =
    typeof readDoctorNamedValue(record, "success") === "boolean"
      ? (readDoctorNamedValue(record, "success") as boolean)
      : typeof readDoctorNamedValue(nested, "success") === "boolean"
        ? (readDoctorNamedValue(nested, "success") as boolean)
        : response.success;

  return { ...response, success };
}

function normalizeEncounterDocumentShareResponse(
  response: EncounterDocumentShareResponse,
): EncounterDocumentShareResponse {
  const document = readEncounterDocumentDetails(response);
  return document
    ? {
        ...response,
        documentId: document._id ?? document.id ?? response.documentId,
        title: document.title ?? response.title,
        sharedWithPatient:
          typeof document.sharedWithPatient === "boolean"
            ? document.sharedWithPatient
            : response.sharedWithPatient,
        sharedAt: document.sharedAt ?? response.sharedAt,
      }
    : response;
}

function normalizeDoctorOrderMutationResponse(
  response: DoctorOrderMutationResponse,
): DoctorOrderMutationResponse {
  const order = unwrapDoctorOrderPayload(response);
  return order ? { ...response, order } : response;
}

function normalizeAppendDoctorOrderResultsResponse(
  response: AppendDoctorOrderResultsResponse,
): AppendDoctorOrderResultsResponse {
  const order = unwrapDoctorOrderPayload(response);
  return order ? { ...response, order } : response;
}

function normalizeOrderFavoriteMutationResponse(
  response: OrderFavoriteMutationResponse,
): OrderFavoriteMutationResponse {
  return withDoctorDetail(
    response,
    "favorite",
    readDoctorOrderFavoriteRecord((response as Record<string, unknown>).favorite) ??
      readDoctorOrderFavoriteRecord((response as Record<string, unknown>).item) ??
      readDoctorOrderFavoriteRecord((response as Record<string, unknown>).data),
  );
}

function normalizeDoctorLibraryItemMutationResponse(
  response: DoctorLibraryItemMutationResponse,
): DoctorLibraryItemMutationResponse {
  return withDoctorDetail(
    response,
    "item",
    readDoctorLibraryItemRecord((response as Record<string, unknown>).item) ??
      readDoctorLibraryItemRecord((response as Record<string, unknown>).data),
  );
}

function normalizeDoctorLibraryItemDeleteResponse(
  response: DoctorLibraryItemDeleteResponse,
): DoctorLibraryItemDeleteResponse {
  const record = asDoctorListEnvelope(response);
  const nested = readDoctorNestedEnvelope(response);

  return withDoctorDetails(response, {
    itemId:
      readDoctorString(readDoctorNamedValue(record, "itemId")) ??
      readDoctorString(readDoctorNamedValue(nested, "itemId")) ??
      response.itemId,
  });
}

function normalizeDoctorLibraryItemFavoriteResponse(
  response: DoctorLibraryItemFavoriteResponse,
): DoctorLibraryItemFavoriteResponse {
  const record = asDoctorListEnvelope(response);
  const nested = readDoctorNestedEnvelope(response);
  const recordFavorite = readDoctorNamedValue(record, "isFavorite");
  const nestedFavorite = readDoctorNamedValue(nested, "isFavorite");

  return withDoctorDetails(response, {
    itemId:
      readDoctorString(readDoctorNamedValue(record, "itemId")) ??
      readDoctorString(readDoctorNamedValue(nested, "itemId")) ??
      response.itemId,
    isFavorite:
      typeof recordFavorite === "boolean"
        ? recordFavorite
        : typeof nestedFavorite === "boolean"
          ? nestedFavorite
          : response.isFavorite,
  });
}

function normalizeDoctorTemplateMutationResponse(
  response: DoctorTemplateMutationResponse,
): DoctorTemplateMutationResponse {
  return withDoctorDetail(
    response,
    "template",
    readDoctorTemplateRecord((response as Record<string, unknown>).template) ??
      readDoctorTemplateRecord((response as Record<string, unknown>).item) ??
      readDoctorTemplateRecord((response as Record<string, unknown>).data),
  );
}

function normalizeDoctorTemplateDeleteResponse(
  response: DoctorTemplateDeleteResponse,
): DoctorTemplateDeleteResponse {
  const record = asDoctorListEnvelope(response);
  const nested = readDoctorNestedEnvelope(response);

  return withDoctorDetails(response, {
    templateId:
      readDoctorString(readDoctorNamedValue(record, "templateId")) ??
      readDoctorString(readDoctorNamedValue(nested, "templateId")) ??
      response.templateId,
  });
}

function normalizeDoctorTemplateApplyResponse(
  response: DoctorTemplateApplyResponse,
): DoctorTemplateApplyResponse {
  const record = asDoctorListEnvelope(response);
  const nested = readDoctorNestedEnvelope(response);
  const template =
    readDoctorTemplateApplyRecord(readDoctorNamedValue(record, "template")) ??
    readDoctorTemplateApplyRecord(readDoctorNamedValue(nested, "template")) ??
    readDoctorTemplateApplyRecord(record?.item) ??
    readDoctorTemplateApplyRecord(nested?.item) ??
    readDoctorTemplateApplyRecord(record?.data) ??
    readDoctorTemplateApplyRecord(nested?.data) ??
    response.template;

  return withDoctorDetails(response, {
    template,
    templateId:
      readDoctorString(readDoctorNamedValue(record, "templateId")) ??
      readDoctorString(readDoctorNamedValue(nested, "templateId")) ??
      template?._id ??
      response.templateId,
    type:
      (readDoctorString(readDoctorNamedValue(record, "type")) as DoctorTemplateApplyResponse["type"]) ??
      (readDoctorString(readDoctorNamedValue(nested, "type")) as DoctorTemplateApplyResponse["type"]) ??
      template?.type ??
      response.type,
    name:
      readDoctorString(readDoctorNamedValue(record, "name")) ??
      readDoctorString(readDoctorNamedValue(nested, "name")) ??
      template?.name ??
      response.name,
    application:
      (readDoctorNamedValue(record, "application") as DoctorTemplateApplyResponse["application"]) ??
      (readDoctorNamedValue(nested, "application") as DoctorTemplateApplyResponse["application"]) ??
      template?.payload ??
      response.application,
  });
}

function normalizeDoctorPatientFileDeleteResponse(
  response: DoctorPatientFileDeleteResponse,
): DoctorPatientFileDeleteResponse {
  const record = asDoctorListEnvelope(response);
  const nested = readDoctorNestedEnvelope(response);
  const recordSuccess = readDoctorNamedValue(record, "success");
  const nestedSuccess = readDoctorNamedValue(nested, "success");
  const normalizedSuccess =
    typeof recordSuccess === "boolean"
      ? recordSuccess
      : typeof nestedSuccess === "boolean"
        ? nestedSuccess
        : undefined;

  return normalizedSuccess == null
    ? response
    : withDoctorDetails(response, { success: normalizedSuccess });
}

function normalizeDoctorAppointmentTypeMutationResponse(
  response: AppointmentTypeMutationResponse,
): AppointmentTypeMutationResponse {
  return withDoctorDetail(
    response,
    "appointmentType",
    readDoctorAppointmentTypeRecord(
      readDoctorNamedValue(response, "appointmentType"),
    ) ??
      readDoctorAppointmentTypeRecord(readDoctorNamedValue(response, "item")) ??
      readDoctorAppointmentTypeRecord(readDoctorNamedValue(response, "data")),
  );
}

function normalizeCreateTemporaryPatientResponse(
  response: CreateTemporaryPatientResponse,
): CreateTemporaryPatientResponse {
  const record = asDoctorListEnvelope(response);
  const nested = readDoctorNestedEnvelope(response);
  const accountStatus =
    readDoctorString(readDoctorNamedValue(record, "accountStatus")) ??
    readDoctorString(readDoctorNamedValue(nested, "accountStatus")) ??
    response.accountStatus;
  const nestedTemporary = readDoctorNamedValue(nested, "isTemporary");
  const recordTemporary = readDoctorNamedValue(record, "isTemporary");

  return {
    ...response,
    patientId:
      readDoctorString(readDoctorNamedValue(record, "patientId")) ??
      readDoctorString(readDoctorNamedValue(nested, "patientId")) ??
      response.patientId,
    userId:
      readDoctorString(readDoctorNamedValue(record, "userId")) ??
      readDoctorString(readDoctorNamedValue(nested, "userId")) ??
      response.userId,
    accountStatus: (accountStatus as CreateTemporaryPatientResponse["accountStatus"]) ?? response.accountStatus,
    isTemporary:
      typeof recordTemporary === "boolean"
        ? recordTemporary
        : typeof nestedTemporary === "boolean"
          ? nestedTemporary
          : response.isTemporary,
  };
}

function normalizeDoctorPatientAccessRequestResponse(
  response: DoctorPatientAccessRequestResponse,
): DoctorPatientAccessRequestResponse {
  const record = asDoctorListEnvelope(response);
  const nested = readDoctorNestedEnvelope(response);
  const accessAlreadyAllowed = readDoctorNamedValue(record, "accessAlreadyAllowed");
  const nestedAccessAlreadyAllowed = readDoctorNamedValue(nested, "accessAlreadyAllowed");

  return withDoctorDetails(response, {
    request: readDoctorAccessRequestDetails(response) ?? response.request,
    accessAlreadyAllowed:
      typeof accessAlreadyAllowed === "boolean"
        ? accessAlreadyAllowed
        : typeof nestedAccessAlreadyAllowed === "boolean"
          ? nestedAccessAlreadyAllowed
          : response.accessAlreadyAllowed,
    pendingRequestId:
      readDoctorString(readDoctorNamedValue(record, "pendingRequestId")) ??
      readDoctorString(readDoctorNamedValue(nested, "pendingRequestId")) ??
      response.pendingRequestId,
  });
}

function normalizeDoctorPatientLinkResponse(
  response: DoctorPatientLinkResponse,
): DoctorPatientLinkResponse {
  const record = asDoctorListEnvelope(response);
  const nested = readDoctorNestedEnvelope(response);

  return withDoctorDetails(response, {
    doctorId:
      readDoctorString(readDoctorNamedValue(record, "doctorId")) ??
      readDoctorString(readDoctorNamedValue(nested, "doctorId")) ??
      response.doctorId,
    patientId:
      readDoctorString(readDoctorNamedValue(record, "patientId")) ??
      readDoctorString(readDoctorNamedValue(nested, "patientId")) ??
      response.patientId,
  });
}

function normalizeAddDoctorPatientMedicationResponse(
  response: AddDoctorPatientMedicationResponse,
): AddDoctorPatientMedicationResponse {
  return withDoctorDetail(
    response,
    "medication",
    readDoctorMedicationRecord(readDoctorNamedValue(response, "medication")) ??
      readDoctorMedicationRecord(readDoctorNamedValue(response, "item")) ??
      readDoctorMedicationRecord(readDoctorNamedValue(response, "data")),
  );
}

function normalizeDoctorCloseEncounterResponse(
  response: DoctorCloseEncounterResponse,
): DoctorCloseEncounterResponse {
  const record = asDoctorListEnvelope(response);
  const nested = readDoctorNestedEnvelope(response);

  return withDoctorDetails(response, {
    encounterId:
      readDoctorString(readDoctorNamedValue(record, "encounterId")) ??
      readDoctorString(readDoctorNamedValue(nested, "encounterId")) ??
      response.encounterId,
    status:
      readDoctorString(readDoctorNamedValue(record, "status")) ??
      readDoctorString(readDoctorNamedValue(nested, "status")) ??
      response.status,
    closedAt:
      readDoctorString(readDoctorNamedValue(record, "closedAt")) ??
      readDoctorString(readDoctorNamedValue(nested, "closedAt")) ??
      response.closedAt,
  });
}

function unwrapDoctorOrderPayload(payload: unknown) {
  const record = asDoctorOrderEnvelope(payload);
  if (!record) return null;

  if (record.order) {
    return normalizeDoctorOrderFromApi(record.order);
  }
  if (record.item) {
    return normalizeDoctorOrderFromApi(record.item);
  }
  if (record.data) {
    const nested =
      unwrapDoctorOrderPayload(record.data) ??
      normalizeDoctorOrderFromApi(record.data);
    if (nested) return nested;
  }
  if (record.result) {
    const nested =
      unwrapDoctorOrderPayload(record.result) ??
      normalizeDoctorOrderFromApi(record.result);
    if (nested) return nested;
  }

  return normalizeDoctorOrderFromApi(record);
}

function buildPatientsListQuery(params: DoctorPatientsListParams): string {
  const qs = new URLSearchParams();
  if (params.name?.trim()) qs.set("name", params.name.trim());
  if (params.search?.trim()) qs.set("search", params.search.trim());
  if (params.diagnosis?.trim()) qs.set("diagnosis", params.diagnosis.trim());
  if (params.from) qs.set("from", params.from);
  if (params.to) qs.set("to", params.to);
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.account_status && params.account_status !== "all") {
    qs.set("account_status", params.account_status);
  }
  return qs.toString();
}

function buildAccessRequestsListQuery(
  params: DoctorAccessRequestListParams = {},
): string {
  const qs = new URLSearchParams();
  if (params.status) qs.set("status", params.status);
  if (params.patientId) qs.set("patientId", params.patientId);
  if (params.from) qs.set("from", params.from);
  if (params.to) qs.set("to", params.to);
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  return qs.toString();
}

function buildEncounterClinicalListQuery(
  params: EncounterClinicalListParams = {},
): string {
  const search = new URLSearchParams();
  if (params.page != null) search.set("page", String(params.page));
  if (params.limit != null) search.set("limit", String(params.limit));
  if (params.status?.trim()) search.set("status", params.status.trim());
  const query = search.toString();
  return query ? `?${query}` : "";
}

function buildPatientEncountersListQuery(
  params: DoctorPatientEncountersListParams = {},
): string {
  const qs = new URLSearchParams();
  if (params.status) qs.set("status", params.status);
  if (params.dateFrom) qs.set("dateFrom", params.dateFrom);
  if (params.dateTo) qs.set("dateTo", params.dateTo);
  if (params.sortBy) qs.set("sortBy", params.sortBy);
  if (params.sortOrder) qs.set("sortOrder", params.sortOrder);
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  return qs.toString();
}

function buildDoctorEncountersListQuery(
  params: DoctorEncountersListParams = {},
): string {
  const qs = new URLSearchParams();
  if (params.patientId) qs.set("patientId", params.patientId);
  if (params.status) qs.set("status", params.status);
  if (params.dateFrom) qs.set("dateFrom", params.dateFrom);
  if (params.dateTo) qs.set("dateTo", params.dateTo);
  if (params.sortBy) qs.set("sortBy", params.sortBy);
  if (params.sortOrder) qs.set("sortOrder", params.sortOrder);
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  return qs.toString();
}

export const doctorEncountersQueryKeys = {
  all: ["doctor", "encounters"] as const,
  lists: () => [...doctorEncountersQueryKeys.all, "list"] as const,
  list: (doctorId: string, params: DoctorEncountersListParams = {}) =>
    [...doctorEncountersQueryKeys.lists(), doctorId, params] as const,
};

export const doctorPatientsQueryKeys = {
  all: ["doctor", "patients"] as const,
  lists: () => [...doctorPatientsQueryKeys.all, "list"] as const,
  list: (params: DoctorPatientsListParams) =>
    [...doctorPatientsQueryKeys.lists(), params] as const,
  publicProfile: (patientId: string) =>
    [...doctorPatientsQueryKeys.all, "public", patientId] as const,
  fullProfile: (doctorId: string, patientId: string) =>
    [...doctorPatientsQueryKeys.all, "profile", doctorId, patientId] as const,
  medicalRecords: (doctorId: string, patientId: string) =>
    [
      ...doctorPatientsQueryKeys.all,
      "medical-records",
      doctorId,
      patientId,
    ] as const,
  medicalRecord: (doctorId: string, patientId: string, recordId: string) =>
    [
      ...doctorPatientsQueryKeys.medicalRecords(doctorId, patientId),
      recordId,
    ] as const,
  encounters: (
    doctorId: string,
    patientId: string,
    params: DoctorPatientEncountersListParams = {},
  ) =>
    [
      ...doctorPatientsQueryKeys.all,
      "encounters",
      doctorId,
      patientId,
      params,
    ] as const,
  encounterDetail: (doctorId: string, patientId: string, encounterId: string) =>
    [
      ...doctorPatientsQueryKeys.all,
      "encounter-detail",
      doctorId,
      patientId,
      encounterId,
    ] as const,
  encounterSummary: (
    doctorId: string,
    patientId: string,
    encounterId: string,
  ) =>
    [
      ...doctorPatientsQueryKeys.all,
      "encounter-summary",
      doctorId,
      patientId,
      encounterId,
    ] as const,
  encounterPrescription: (
    doctorId: string,
    patientId: string,
    encounterId: string,
  ) =>
    [
      ...doctorPatientsQueryKeys.all,
      "encounter-prescription",
      doctorId,
      patientId,
      encounterId,
    ] as const,
  encounterRadiologyOrder: (
    doctorId: string,
    patientId: string,
    encounterId: string,
  ) =>
    [
      ...doctorPatientsQueryKeys.all,
      "encounter-radiology-order",
      doctorId,
      patientId,
      encounterId,
    ] as const,
  encounterLabOrder: (
    doctorId: string,
    patientId: string,
    encounterId: string,
  ) =>
    [
      ...doctorPatientsQueryKeys.all,
      "encounter-lab-order",
      doctorId,
      patientId,
      encounterId,
    ] as const,
  encounterProcedureOrder: (
    doctorId: string,
    patientId: string,
    encounterId: string,
  ) =>
    [
      ...doctorPatientsQueryKeys.all,
      "encounter-procedure-order",
      doctorId,
      patientId,
      encounterId,
    ] as const,
  encounterReferralOrder: (
    doctorId: string,
    patientId: string,
    encounterId: string,
  ) =>
    [
      ...doctorPatientsQueryKeys.all,
      "encounter-referral-order",
      doctorId,
      patientId,
      encounterId,
    ] as const,
  encounterWorkspace: (
    doctorId: string,
    patientId: string,
    encounterId: string,
  ) =>
    [
      ...doctorPatientsQueryKeys.all,
      "encounter-workspace",
      doctorId,
      patientId,
      encounterId,
    ] as const,
  imagingCatalog: (search?: string) =>
    [...doctorPatientsQueryKeys.all, "imaging-catalog", search ?? ""] as const,
  labCatalog: (search?: string) =>
    [...doctorPatientsQueryKeys.all, "lab-catalog", search ?? ""] as const,
  procedureCatalog: (search?: string) =>
    [
      ...doctorPatientsQueryKeys.all,
      "procedure-catalog",
      search ?? "",
    ] as const,
  files: (patientId: string) =>
    [...doctorPatientsQueryKeys.all, "files", patientId] as const,
  file: (patientId: string, fileId: string) =>
    [...doctorPatientsQueryKeys.files(patientId), fileId] as const,
};

export const doctorClinicalQueryKeys = {
  all: ["doctor", "clinical"] as const,
  orderFavorites: (section?: string) =>
    [
      ...doctorClinicalQueryKeys.all,
      "order-favorites",
      section ?? "all",
    ] as const,
  libraryItems: (params: DoctorLibraryListParams = {}) =>
    [...doctorClinicalQueryKeys.all, "library-items", params] as const,
  libraryRecent: () =>
    [...doctorClinicalQueryKeys.all, "library-recent"] as const,
  templates: (params: DoctorTemplatesListParams = {}) =>
    [...doctorClinicalQueryKeys.all, "templates", params] as const,
};

export type DoctorLibraryListParams = {
  page?: number;
  limit?: number;
  type?: string;
  favorite?: boolean;
  includeArchived?: boolean;
  search?: string;
};

export type DoctorTemplatesListParams = {
  page?: number;
  limit?: number;
  type?: string;
  includeArchived?: boolean;
  search?: string;
};

export type CreateDoctorReferralOrderBody = {
  specialty?: string;
  reason?: string;
  referralType?: string;
  referredDoctorName?: string;
  institution?: string;
  clinicalSummary?: string;
  questionsToColleague?: string;
  notes?: string;
  urgency?: string;
  priority?: string;
};

export type DoctorCatalogSearchParams = {
  q?: string;
  page?: number;
  limit?: number;
};

export type DoctorOrderFavoritesListParams = {
  catalogSection?: string;
  page?: number;
  limit?: number;
};

function buildDoctorOrdersListQuery(params: DoctorOrdersListParams = {}) {
  const qs = new URLSearchParams();
  if (params.patientId) qs.set("patientId", params.patientId);
  if (params.orderType) qs.set("orderType", params.orderType);
  if (params.category) qs.set("category", params.category);
  if (params.type) qs.set("type", params.type);
  if (params.status) qs.set("status", params.status);
  if (params.statusCode) qs.set("statusCode", params.statusCode);
  if (params.q?.trim()) qs.set("q", params.q.trim());
  if (params.search?.trim()) qs.set("search", params.search.trim());
  if (params.from) qs.set("from", params.from);
  if (params.to) qs.set("to", params.to);
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.sort) qs.set("sort", params.sort);
  return qs.toString();
}

export const doctorOrdersQueryKeys = {
  all: ["doctor", "orders"] as const,
  list: (params: DoctorOrdersListParams = {}) =>
    [...doctorOrdersQueryKeys.all, "list", params] as const,
  detail: (orderId: string) =>
    [...doctorOrdersQueryKeys.all, "detail", orderId] as const,
};

export const doctorAccessRequestsQueryKeys = {
  all: ["doctor", "access-requests"] as const,
  list: (params: DoctorAccessRequestListParams = {}) =>
    [...doctorAccessRequestsQueryKeys.all, "list", params] as const,
  detail: (requestId: string) =>
    [...doctorAccessRequestsQueryKeys.all, "detail", requestId] as const,
  approvedPayload: (doctorId: string, patientId: string, requestId: string) =>
    [
      ...doctorAccessRequestsQueryKeys.all,
      "approved-payload",
      doctorId,
      patientId,
      requestId,
    ] as const,
};

// NOTE: Exported via doctorApi.patients below (admin-like shape)

// ─────────────────────────────────────────────────────────────────────────────
// Doctor — Appointments
// ─────────────────────────────────────────────────────────────────────────────

export const doctorAppointmentsQueryKeys = {
  all: ["doctor", "appointments"] as const,
  lists: () => [...doctorAppointmentsQueryKeys.all, "list"] as const,
  list: (params: DoctorAppointmentListParams) =>
    [...doctorAppointmentsQueryKeys.lists(), params] as const,
  details: () => [...doctorAppointmentsQueryKeys.all, "detail"] as const,
  detail: (appointmentId: string) =>
    [...doctorAppointmentsQueryKeys.details(), appointmentId] as const,
  files: (appointmentId: string) =>
    [...doctorAppointmentsQueryKeys.all, "files", appointmentId] as const,
  file: (appointmentId: string, fileId: string) =>
    [...doctorAppointmentsQueryKeys.files(appointmentId), fileId] as const,
};

function buildAppointmentsListQuery(
  params: DoctorAppointmentListParams,
): string {
  const qs = new URLSearchParams();

  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.status) qs.set("status", params.status);
  if (params.date) qs.set("date", params.date);
  if (params.dateFrom) qs.set("dateFrom", params.dateFrom);
  if (params.dateTo) qs.set("dateTo", params.dateTo);

  const query = qs.toString();
  return query
    ? `${doctorEndpoints.appointments.list}?${query}`
    : doctorEndpoints.appointments.list;
}

function pickPatientName(summary: DoctorAppointmentSummary): string {
  return summary.patient?.userId?.fullName ?? summary.patient?.publicId ?? "—";
}

function pickPatientInitial(summary: DoctorAppointmentSummary): string {
  const source = pickPatientName(summary).trim();
  return source ? source.charAt(0).toUpperCase() : "—";
}

function deriveDate(summary: DoctorAppointmentSummary): string {
  if (summary.date) return summary.date.slice(0, 10);
  if (summary.startDateTime) return summary.startDateTime.slice(0, 10);
  return "";
}

function deriveTime(summary: DoctorAppointmentSummary): string {
  if (summary.startTime) return summary.startTime;
  if (summary.startDateTime) return summary.startDateTime.slice(11, 16);
  return "";
}

export const doctorAppointmentsApi = {
  list: async (params: DoctorAppointmentListParams = {}) => {
    return get<DoctorAppointmentsListResponse>(
      buildAppointmentsListQuery(params),
      {
        locale: "ar",
      },
    ).then(normalizeDoctorAppointmentsListResponse);
  },
  getById: async (appointmentId: string) => {
    return get<DoctorAppointmentDetailsResponse>(
      doctorEndpoints.appointments.details(appointmentId),
      { locale: "ar" },
    ).then(normalizeDoctorAppointmentDetailsResponse);
  },
  book: async (body: DoctorBookAppointmentBody) => {
    return post<DoctorAppointmentMutationResponse>(
      doctorEndpoints.appointments.book,
      body,
      {
        locale: "ar",
      },
    ).then(normalizeDoctorAppointmentMutationResponse);
  },
  cancel: async (appointmentId: string, body: DoctorCancelAppointmentBody) => {
    return patch<DoctorAppointmentMutationResponse>(
      doctorEndpoints.appointments.cancel(appointmentId),
      body,
      { locale: "ar" },
    ).then(normalizeDoctorAppointmentMutationResponse);
  },
  reschedule: (appointmentId: string, body: DoctorRescheduleAppointmentBody) =>
    patch<DoctorAppointmentMutationResponse>(
      doctorEndpoints.appointments.reschedule(appointmentId),
      body,
      { locale: "ar" },
    ).then(normalizeDoctorAppointmentMutationResponse),
  complete: async (
    appointmentId: string,
    body: DoctorCompleteAppointmentBody,
  ) => {
    return patch<DoctorAppointmentMutationResponse>(
      doctorEndpoints.appointments.complete(appointmentId),
      body,
      { locale: "ar" },
    ).then(normalizeDoctorAppointmentMutationResponse);
  },
  markNoShow: (appointmentId: string, body: DoctorNoShowAppointmentBody) =>
    patch<DoctorAppointmentMutationResponse>(
      doctorEndpoints.appointments.noShow(appointmentId),
      body,
      { locale: "ar" },
    ).then(normalizeDoctorAppointmentMutationResponse),
  listFiles: (appointmentId: string) =>
    get<DoctorAppointmentFilesListResponse>(
      doctorEndpoints.appointments.files.list(appointmentId),
      { locale: "ar" },
    ).then(normalizeDoctorAppointmentFilesListResponse),
  getFile: (appointmentId: string, fileId: string) =>
    get<DoctorAppointmentFileDetailsResponse>(
      doctorEndpoints.appointments.files.detail(appointmentId, fileId),
      { locale: "ar" },
    ),
  getFileDownloadUrl: (appointmentId: string, fileId: string) =>
    get<DoctorFileDownloadUrlResponse>(
      `${doctorEndpoints.appointments.files.download(appointmentId, fileId)}?mode=url`,
      { locale: "ar" },
    ),
  uploadFile: (
    appointmentId: string,
    file: File,
    note?: string,
    tags?: string[],
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    if (note?.trim()) formData.append("note", note.trim());
    if (tags && tags.length > 0) formData.append("tags", JSON.stringify(tags));
    return apiMultipart<DoctorAppointmentFileUploadResponse>(
      doctorEndpoints.appointments.files.upload(appointmentId),
      formData,
      { locale: "ar" },
    ).then(normalizeDoctorAppointmentFileUploadResponse);
  },
  unlinkFile: (appointmentId: string, fileId: string) =>
    del<DoctorAppointmentFileDeleteResponse>(
      doctorEndpoints.appointments.files.unlink(appointmentId, fileId),
      { locale: "ar" },
    ).then(normalizeDoctorAppointmentFileDeleteResponse),
};

// ─────────────────────────────────────────────────────────────────────────────
// Doctor — Schedule API (real backend endpoints)
// ─────────────────────────────────────────────────────────────────────────────

export const doctorScheduleQueryKeys = {
  all: ["doctor", "schedule"] as const,
  detail: (doctorId: string) =>
    [...doctorScheduleQueryKeys.all, doctorId] as const,
  slots: (doctorId: string, date: string) =>
    [...doctorScheduleQueryKeys.all, "slots", doctorId, date] as const,
};

// Helper to get doctorId from auth
function getDoctorIdFromAuth(): string {
  const authUser = readAuthUser();
  const doctorId = authUser?.actorIds?.doctorId;

  if (!doctorId) {
    throw new Error("Doctor ID not found in auth. Please login as a doctor.");
  }

  return doctorId;
}

const doctorScheduleApi = {
  // GET /doctors/:doctorId/schedule
  get: async (): Promise<DoctorScheduleResponse> => {
    const doctorId = getDoctorIdFromAuth();
    return get<DoctorScheduleResponse>(doctorEndpoints.schedule.get(doctorId), {
      locale: "ar",
    }).then(normalizeDoctorScheduleResponse);
  },

  // PUT /doctors/:doctorId/schedule (full replacement)
  update: async (
    body: DoctorUpdateScheduleBody,
  ): Promise<DoctorScheduleResponse> => {
    const doctorId = getDoctorIdFromAuth();
    return put<DoctorScheduleResponse>(
      doctorEndpoints.schedule.update(doctorId),
      body,
      { locale: "ar" },
    ).then(normalizeDoctorScheduleResponse);
  },

  // PATCH /doctors/:doctorId/schedule/settings
  updateSettings: async (
    body: DoctorUpdateScheduleSettingsBody,
  ): Promise<DoctorActionResponse> => {
    const doctorId = getDoctorIdFromAuth();
    return patch<DoctorActionResponse>(
      doctorEndpoints.schedule.updateSettings(doctorId),
      body,
      { locale: "ar" },
    );
  },

  // POST /doctors/:doctorId/schedule/day
  addDay: async (body: DoctorAddDayBody): Promise<DoctorActionResponse> => {
    const doctorId = getDoctorIdFromAuth();
    return post<DoctorActionResponse>(
      doctorEndpoints.schedule.addDay(doctorId),
      body,
      { locale: "ar" },
    );
  },

  // PATCH /doctors/:doctorId/schedule/day/:day
  updateDay: async (
    day: ScheduleDayKey,
    body: DoctorUpdateDayBody,
  ): Promise<DoctorActionResponse> => {
    const doctorId = getDoctorIdFromAuth();
    return patch<DoctorActionResponse>(
      doctorEndpoints.schedule.updateDay(doctorId, day),
      body,
      { locale: "ar" },
    );
  },

  // DELETE /doctors/:doctorId/schedule/day/:day
  deleteDay: async (day: ScheduleDayKey): Promise<DoctorActionResponse> => {
    const doctorId = getDoctorIdFromAuth();
    return del<DoctorActionResponse>(
      doctorEndpoints.schedule.deleteDay(doctorId, day),
      { locale: "ar" },
    );
  },

  // POST /doctors/:doctorId/schedule/exception
  addException: async (
    body: DoctorAddExceptionBody,
  ): Promise<DoctorActionResponse> => {
    const doctorId = getDoctorIdFromAuth();
    return post<DoctorActionResponse>(
      doctorEndpoints.schedule.addException(doctorId),
      body,
      { locale: "ar" },
    );
  },

  // PATCH /doctors/:doctorId/schedule/exceptions
  updateExceptions: async (
    body: DoctorUpdateExceptionsBody,
  ): Promise<DoctorActionResponse> => {
    const doctorId = getDoctorIdFromAuth();
    return patch<DoctorActionResponse>(
      doctorEndpoints.schedule.updateExceptions(doctorId),
      body,
      { locale: "ar" },
    );
  },

  // DELETE /doctors/:doctorId/schedule/exception/:exceptionId
  deleteException: async (
    exceptionId: string,
  ): Promise<DoctorActionResponse> => {
    const doctorId = getDoctorIdFromAuth();
    return del<DoctorActionResponse>(
      doctorEndpoints.schedule.deleteException(doctorId, exceptionId),
      { locale: "ar" },
    );
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Doctor — Appointment Types
// ─────────────────────────────────────────────────────────────────────────────

export const doctorAppointmentTypesQueryKeys = {
  all: ["doctor", "appointmentTypes"] as const,
  available: (doctorId: string) =>
    [...doctorAppointmentTypesQueryKeys.all, "available", doctorId] as const,
  list: (doctorId: string) =>
    [...doctorAppointmentTypesQueryKeys.all, "list", doctorId] as const,
};

const doctorAppointmentTypesApi = {
  // GET /doctors/:doctorId/appointment-types/available
  getAvailableTypes: async (
    doctorId?: string,
  ): Promise<DoctorAppointmentTypesResponse> => {
    const actualDoctorId = doctorId || getDoctorIdFromAuth();
    return get<DoctorAppointmentTypesResponse>(
      doctorEndpoints.appointmentTypes.available(actualDoctorId),
      { locale: "ar" },
    ).then(normalizeDoctorAppointmentTypesResponse);
  },

  // GET /doctors/:doctorId/appointment-types
  listTypes: async (
    doctorId?: string,
  ): Promise<DoctorAppointmentTypesResponse> => {
    const actualDoctorId = doctorId || getDoctorIdFromAuth();
    return get<DoctorAppointmentTypesResponse>(
      doctorEndpoints.appointmentTypes.list(actualDoctorId),
      { locale: "ar" },
    ).then(normalizeDoctorAppointmentTypesResponse);
  },

  // POST /doctors/:doctorId/appointment-types
  createType: async (
    body: CreateAppointmentTypeBody,
  ): Promise<AppointmentTypeMutationResponse> => {
    const doctorId = getDoctorIdFromAuth();
    return post<AppointmentTypeMutationResponse>(
      doctorEndpoints.appointmentTypes.create(doctorId),
      toAppointmentTypeApiBody(body),
      { locale: "ar" },
    ).then(normalizeDoctorAppointmentTypeMutationResponse);
  },

  // PUT /doctors/:doctorId/appointment-types/:typeId
  updateType: async (
    typeId: string,
    body: UpdateAppointmentTypeBody,
  ): Promise<AppointmentTypeMutationResponse> => {
    const doctorId = getDoctorIdFromAuth();
    return put<AppointmentTypeMutationResponse>(
      doctorEndpoints.appointmentTypes.update(doctorId, typeId),
      toAppointmentTypeApiBody(body),
      { locale: "ar" },
    ).then(normalizeDoctorAppointmentTypeMutationResponse);
  },

  // DELETE /doctors/:doctorId/appointment-types/:typeId
  deleteType: async (typeId: string): Promise<DoctorActionResponse> => {
    const doctorId = getDoctorIdFromAuth();
    return del<DoctorActionResponse>(
      doctorEndpoints.appointmentTypes.delete(doctorId, typeId),
      { locale: "ar" },
    );
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Doctor — Slots (Preview)
// ─────────────────────────────────────────────────────────────────────────────

export const doctorSlotsQueryKeys = {
  all: ["doctor", "slots"] as const,
  byDate: (doctorId: string, date: string, type?: "free" | "booked" | "all") =>
    [...doctorSlotsQueryKeys.all, doctorId, date, type || "free"] as const,
};

const doctorSlotsApi = {
  // GET /doctors/:doctorId/slots?date=...&type=free|booked|all
  // Returns different response shapes based on type parameter
  getSlots: async (
    params: DoctorSlotsQueryParams & { doctorId?: string },
  ): Promise<
    DoctorFreeSlotsResponse | DoctorBookedSlotsResponse | DoctorAllSlotsResponse
  > => {
    const actualDoctorId = params.doctorId || getDoctorIdFromAuth();
    const qs = new URLSearchParams();
    qs.set("date", params.date);
    if (params.type) qs.set("type", params.type);
    if (params.page) qs.set("page", String(params.page));
    if (params.limit) qs.set("limit", String(params.limit));

    const endpoint = `${doctorEndpoints.schedule.slots(actualDoctorId)}?${qs.toString()}`;

    return get<DoctorAllSlotsResponse>(endpoint, { locale: "ar" }).then(
      normalizeDoctorSlotsResponse,
    );
  },
};

export const doctorApi = {
  patients: {
    list: (params: DoctorPatientsListParams = {}) => {
      const query = buildPatientsListQuery(params);
      const base = doctorEndpoints.patients.list;
      const endpoint = query ? `${base}?${query}` : base;
      return get<DoctorPatientsListResponse>(endpoint, { locale: "ar" }).then(
        normalizeDoctorPatientsListResponse,
      );
    },
    createTemporary: (body: CreateTemporaryPatientBody) =>
      post<CreateTemporaryPatientResponse>(
        doctorEndpoints.patients.temp,
        body,
        {
          locale: "ar",
        },
      ).then(normalizeCreateTemporaryPatientResponse),
    getPublicProfile: (patientId: string) =>
      get<DoctorPatientPublicProfileResponse>(
        doctorEndpoints.patients.publicProfile(patientId),
        { locale: "ar" },
      ).then(normalizeDoctorPublicPatientProfileResponse),
    getFullProfileResult: (doctorId: string, patientId: string) =>
      apiRequestResult<DoctorPatientFullProfileResponse>(
        doctorEndpoints.patients.fullProfile(doctorId, patientId),
        {
          method: "GET",
          locale: "ar",
          expectedStatuses: [403, 404],
        },
      ),
    requestAccess: (
      doctorId: string,
      patientId: string,
      body: DoctorPatientAccessRequestBody,
    ) =>
      post<DoctorPatientAccessRequestResponse>(
        doctorEndpoints.patients.accessRequests(doctorId, patientId),
        body,
        { locale: "ar" },
      ).then(normalizeDoctorPatientAccessRequestResponse),
    linkPatient: (doctorId: string, patientId: string) =>
      post<DoctorPatientLinkResponse>(
        doctorEndpoints.patients.link(doctorId, patientId),
        {},
        { locale: "ar" },
      ).then(normalizeDoctorPatientLinkResponse),
    listMedicalRecords: (doctorId: string, patientId: string) =>
      get<DoctorMedicalRecordsListResponse>(
        doctorEndpoints.patients.medicalRecords(doctorId, patientId),
        { locale: "ar" },
      ).then(normalizeDoctorMedicalRecordsListResponse),
    getMedicalRecord: (doctorId: string, patientId: string, recordId: string) =>
      get<DoctorMedicalRecordDetailsResponse>(
        doctorEndpoints.patients.medicalRecordById(
          doctorId,
          patientId,
          recordId,
        ),
        { locale: "ar" },
      ).then(normalizeDoctorMedicalRecordDetailsResponse),
    createMedicalRecord: (
      doctorId: string,
      patientId: string,
      body: DoctorCreateMedicalRecordBody,
    ) =>
      post<DoctorMedicalRecordDetailsResponse>(
        doctorEndpoints.patients.medicalRecords(doctorId, patientId),
        body,
        { locale: "ar" },
      ).then(normalizeDoctorMedicalRecordDetailsResponse),
    updateMedicalRecord: (
      doctorId: string,
      patientId: string,
      recordId: string,
      body: DoctorUpdateMedicalRecordBody,
    ) =>
      patch<DoctorMedicalRecordDetailsResponse>(
        doctorEndpoints.patients.medicalRecordById(
          doctorId,
          patientId,
          recordId,
        ),
        body,
        { locale: "ar" },
      ).then(normalizeDoctorMedicalRecordDetailsResponse),
    addPatientMedication: (
      doctorId: string,
      patientId: string,
      body: AddDoctorPatientMedicationBody,
    ) =>
      post<AddDoctorPatientMedicationResponse>(
        doctorEndpoints.patients.medications(doctorId, patientId),
        body,
        { locale: "ar" },
      ).then(normalizeAddDoctorPatientMedicationResponse),
    listEncounters: (
      doctorId: string,
      patientId: string,
      params: DoctorPatientEncountersListParams = {},
    ) => {
      const query = buildPatientEncountersListQuery(params);
      const base = doctorEndpoints.patients.encounters(doctorId, patientId);
      const endpoint = query ? `${base}?${query}` : base;
      return get<DoctorPatientEncountersListResponse>(endpoint, {
        locale: "ar",
      }).then(normalizeDoctorEncountersListResponse);
    },
    createEncounter: (
      doctorId: string,
      patientId: string,
      body: DoctorCreateEncounterBody,
    ) =>
      post<DoctorEncounterDetailsResponse>(
        doctorEndpoints.patients.encounters(doctorId, patientId),
        body,
        { locale: "ar" },
      ).then(normalizeDoctorEncounterDetailsResponse),
    getEncounter: (doctorId: string, patientId: string, encounterId: string) =>
      get<DoctorEncounterDetailsResponse>(
        doctorEndpoints.patients.encounterById(
          doctorId,
          patientId,
          encounterId,
        ),
        { locale: "ar" },
      ).then(normalizeDoctorEncounterDetailsResponse),
    updateEncounter: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      body: DoctorUpdateEncounterBody,
    ) =>
      patch<DoctorEncounterDetailsResponse>(
        doctorEndpoints.patients.encounterById(
          doctorId,
          patientId,
          encounterId,
        ),
        body,
        { locale: "ar" },
      ).then(normalizeDoctorEncounterDetailsResponse),
    closeEncounter: (
      doctorId: string,
      patientId: string,
      encounterId: string,
    ) =>
      post<DoctorCloseEncounterResponse>(
        doctorEndpoints.patients.closeEncounter(
          doctorId,
          patientId,
          encounterId,
        ),
        {},
        { locale: "ar" },
      ).then(normalizeDoctorCloseEncounterResponse),
    listEncounterPrescriptions: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      params: EncounterClinicalListParams = {},
    ) => {
      const query = buildEncounterClinicalListQuery(params);
      const base = doctorEndpoints.patients.encounterPrescriptions(
        doctorId,
        patientId,
        encounterId,
      );
      return get<EncounterPrescriptionsListResponse>(`${base}${query}`, {
        locale: "ar",
      }).then(normalizeEncounterPrescriptionsListResponse);
    },
    listEncounterOrders: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      params: EncounterClinicalListParams = {},
    ) => {
      const query = buildEncounterClinicalListQuery(params);
      const base = doctorEndpoints.patients.encounterOrders(
        doctorId,
        patientId,
        encounterId,
      );
      return get<EncounterOrdersListResponse>(`${base}${query}`, {
        locale: "ar",
      }).then(normalizeEncounterOrdersListResponse);
    },
    createEncounterImagingOrder: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      body: CreateEncounterOrderBody = {},
    ) =>
      post<EncounterOrderResponse>(
        doctorEndpoints.patients.encounterOrdersImaging(
          doctorId,
          patientId,
          encounterId,
        ),
        body,
        { locale: "ar" },
      ).then(normalizeEncounterOrderResponse),
    createEncounterLabOrder: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      body: CreateEncounterOrderBody = {},
    ) =>
      post<EncounterOrderResponse>(
        doctorEndpoints.patients.encounterOrdersLab(
          doctorId,
          patientId,
          encounterId,
        ),
        body,
        { locale: "ar" },
      ).then(normalizeEncounterOrderResponse),
    createEncounterProcedureOrder: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      body: CreateEncounterOrderBody = {},
    ) =>
      post<EncounterOrderResponse>(
        doctorEndpoints.patients.encounterOrdersProcedures(
          doctorId,
          patientId,
          encounterId,
        ),
        body,
        { locale: "ar" },
      ).then(normalizeEncounterOrderResponse),
    createEncounterReferralOrder: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      body: CreateDoctorReferralOrderBody,
    ) =>
      post<EncounterOrderResponse>(
        doctorEndpoints.patients.encounterOrdersReferrals(
          doctorId,
          patientId,
          encounterId,
        ),
        body,
        { locale: "ar" },
      ).then(normalizeEncounterOrderResponse),
    getEncounterOrder: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      orderId: string,
    ) =>
      get<EncounterOrderResponse>(
        doctorEndpoints.patients.encounterOrderById(
          doctorId,
          patientId,
          encounterId,
          orderId,
        ),
        { locale: "ar" },
      ).then(normalizeEncounterOrderResponse),
    updateEncounterOrder: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      orderId: string,
      body: UpdateEncounterOrderBody,
    ) =>
      patch<EncounterOrderResponse>(
        doctorEndpoints.patients.encounterOrderById(
          doctorId,
          patientId,
          encounterId,
          orderId,
        ),
        body,
        { locale: "ar" },
      ).then(normalizeEncounterOrderResponse),
    addEncounterOrderItem: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      orderId: string,
      body: ImagingOrderItemBody,
    ) =>
      post<EncounterOrderItemMutationResponse>(
        doctorEndpoints.patients.encounterOrderItems(
          doctorId,
          patientId,
          encounterId,
          orderId,
        ),
        body,
        { locale: "ar" },
      ).then(normalizeEncounterOrderItemMutationResponse),
    updateEncounterOrderItem: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      orderId: string,
      itemId: string,
      body: ImagingOrderItemBody,
    ) =>
      patch<EncounterOrderItemMutationResponse>(
        doctorEndpoints.patients.encounterOrderItemById(
          doctorId,
          patientId,
          encounterId,
          orderId,
          itemId,
        ),
        body,
        { locale: "ar" },
      ).then(normalizeEncounterOrderItemMutationResponse),
    deleteEncounterOrderItem: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      orderId: string,
      itemId: string,
    ) =>
      del<EncounterOrderItemMutationResponse>(
        doctorEndpoints.patients.encounterOrderItemById(
          doctorId,
          patientId,
          encounterId,
          orderId,
          itemId,
        ),
        { locale: "ar" },
      ).then(normalizeEncounterOrderItemMutationResponse),
    finalizeEncounterOrder: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      orderId: string,
      body: { note?: string } = {},
    ) =>
      post<EncounterOrderFinalizeResponse>(
        doctorEndpoints.patients.encounterOrderFinalize(
          doctorId,
          patientId,
          encounterId,
          orderId,
        ),
        body,
        { locale: "ar" },
      ).then(normalizeEncounterOrderFinalizeResponse),
    getEncounterOrderPreview: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      orderId: string,
    ) =>
      get<EncounterOrderPreviewResponse>(
        doctorEndpoints.patients.encounterOrderPreview(
          doctorId,
          patientId,
          encounterId,
          orderId,
        ),
        { locale: "ar" },
      ).then(normalizeEncounterOrderPreviewResponse),
    listImagingCatalog: (
      params: DoctorCatalogSearchParams = {},
    ) => {
      const search = new URLSearchParams();
      if (params.q?.trim()) search.set("q", params.q.trim());
      if (params.page) search.set("page", String(params.page));
      if (params.limit) search.set("limit", String(params.limit));
      const query = search.toString();
      const base = doctorEndpoints.orderCatalogImaging;
      return get<OrderCatalogListResponse>(query ? `${base}?${query}` : base, {
        locale: "ar",
      }).then(normalizeOrderCatalogListResponse);
    },
    listLabCatalog: (
      params: DoctorCatalogSearchParams = {},
    ) => {
      const search = new URLSearchParams();
      if (params.q?.trim()) search.set("q", params.q.trim());
      if (params.page) search.set("page", String(params.page));
      if (params.limit) search.set("limit", String(params.limit));
      const query = search.toString();
      const base = doctorEndpoints.patients.orderCatalogLab;
      return get<OrderCatalogListResponse>(query ? `${base}?${query}` : base, {
        locale: "ar",
      }).then(normalizeOrderCatalogListResponse);
    },
    listProcedureCatalog: (
      params: DoctorCatalogSearchParams = {},
    ) => {
      const search = new URLSearchParams();
      if (params.q?.trim()) search.set("q", params.q.trim());
      if (params.page) search.set("page", String(params.page));
      if (params.limit) search.set("limit", String(params.limit));
      const query = search.toString();
      const base = doctorEndpoints.patients.orderCatalogProcedures;
      return get<OrderCatalogListResponse>(query ? `${base}?${query}` : base, {
        locale: "ar",
      }).then(normalizeOrderCatalogListResponse);
    },
    createEncounterPrescription: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      body: CreateEncounterPrescriptionBody = {},
    ) =>
      post<EncounterPrescriptionResponse>(
        doctorEndpoints.patients.encounterPrescriptions(
          doctorId,
          patientId,
          encounterId,
        ),
        body,
        { locale: "ar" },
      ).then(normalizeEncounterPrescriptionResponse),
    getEncounterPrescription: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      prescriptionId: string,
    ) =>
      get<EncounterPrescriptionResponse>(
        doctorEndpoints.patients.encounterPrescriptionById(
          doctorId,
          patientId,
          encounterId,
          prescriptionId,
        ),
        { locale: "ar" },
      ).then(normalizeEncounterPrescriptionResponse),
    updateEncounterPrescription: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      prescriptionId: string,
      body: UpdateEncounterPrescriptionBody,
    ) =>
      patch<EncounterPrescriptionResponse>(
        doctorEndpoints.patients.encounterPrescriptionById(
          doctorId,
          patientId,
          encounterId,
          prescriptionId,
        ),
        body,
        { locale: "ar" },
      ).then(normalizeEncounterPrescriptionResponse),
    addEncounterPrescriptionItem: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      prescriptionId: string,
      body: PrescriptionItemBody,
    ) =>
      post<EncounterPrescriptionItemMutationResponse>(
        doctorEndpoints.patients.encounterPrescriptionItems(
          doctorId,
          patientId,
          encounterId,
          prescriptionId,
        ),
        body,
        { locale: "ar" },
      ).then(normalizeEncounterPrescriptionItemMutationResponse),
    updateEncounterPrescriptionItem: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      prescriptionId: string,
      itemId: string,
      body: PrescriptionItemBody,
    ) =>
      patch<EncounterPrescriptionItemMutationResponse>(
        doctorEndpoints.patients.encounterPrescriptionItemById(
          doctorId,
          patientId,
          encounterId,
          prescriptionId,
          itemId,
        ),
        body,
        { locale: "ar" },
      ).then(normalizeEncounterPrescriptionItemMutationResponse),
    deleteEncounterPrescriptionItem: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      prescriptionId: string,
      itemId: string,
    ) =>
      del<EncounterPrescriptionItemMutationResponse>(
        doctorEndpoints.patients.encounterPrescriptionItemById(
          doctorId,
          patientId,
          encounterId,
          prescriptionId,
          itemId,
        ),
        { locale: "ar" },
      ).then(normalizeEncounterPrescriptionItemMutationResponse),
    duplicateEncounterPrescriptionItem: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      prescriptionId: string,
      itemId: string,
    ) =>
      post<EncounterPrescriptionItemMutationResponse>(
        doctorEndpoints.patients.encounterPrescriptionItemDuplicate(
          doctorId,
          patientId,
          encounterId,
          prescriptionId,
          itemId,
        ),
        {},
        { locale: "ar" },
      ).then(normalizeEncounterPrescriptionItemMutationResponse),
    finalizeEncounterPrescription: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      prescriptionId: string,
    ) =>
      post<EncounterPrescriptionFinalizeResponse>(
        doctorEndpoints.patients.encounterPrescriptionFinalize(
          doctorId,
          patientId,
          encounterId,
          prescriptionId,
        ),
        {},
        { locale: "ar" },
      ).then(normalizeEncounterPrescriptionFinalizeResponse),
    getEncounterPrescriptionPreview: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      prescriptionId: string,
    ) =>
      get<EncounterPrescriptionPreviewResponse>(
        doctorEndpoints.patients.encounterPrescriptionPreview(
          doctorId,
          patientId,
          encounterId,
          prescriptionId,
        ),
        { locale: "ar" },
      ).then(normalizeEncounterPrescriptionPreviewResponse),
    listEncounterDocuments: (
      doctorId: string,
      patientId: string,
      encounterId: string,
    ) =>
      get<EncounterDocumentsListResponse>(
        doctorEndpoints.patients.encounterDocuments(
          doctorId,
          patientId,
          encounterId,
        ),
        { locale: "ar" },
      ).then(normalizeEncounterDocumentsListResponse),
    linkEncounterDocument: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      body: EncounterDocumentLinkBody,
    ) =>
      post<EncounterDocumentLinkResponse>(
        doctorEndpoints.patients.encounterDocumentLink(
          doctorId,
          patientId,
          encounterId,
        ),
        body,
        { locale: "ar" },
      ).then(normalizeEncounterDocumentLinkResponse),
    shareEncounterDocument: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      documentId: string,
      body: EncounterDocumentShareBody = {},
    ) =>
      post<EncounterDocumentShareResponse>(
        doctorEndpoints.patients.encounterDocumentShare(
          doctorId,
          patientId,
          encounterId,
          documentId,
        ),
        body,
        { locale: "ar" },
      ).then(normalizeEncounterDocumentShareResponse),
    listFiles: (patientId: string) =>
      get<DoctorPatientFilesListResponse>(
        doctorEndpoints.patients.files.list(patientId),
        { locale: "ar" },
      ).then(normalizeDoctorPatientFilesListResponse),
    getFile: (patientId: string, fileId: string) =>
      get<DoctorPatientFileDetailsResponse>(
        doctorEndpoints.patients.files.detail(patientId, fileId),
        { locale: "ar" },
      ).then(normalizeDoctorPatientFileDetailsResponse),
    getFileDownloadUrl: (doctorId: string, patientId: string, fileId: string) =>
      get<DoctorFileDownloadUrlResponse>(
        doctorEndpoints.patients.files.doctorDownloadUrl(
          doctorId,
          patientId,
          fileId,
        ),
        { locale: "ar" },
      ),
    uploadFile: (
      patientId: string,
      file: File,
      note?: string,
      tags?: string[],
    ) => {
      const formData = new FormData();
      formData.append("file", file);
      if (note?.trim()) formData.append("note", note.trim());
      if (tags && tags.length > 0)
        formData.append("tags", JSON.stringify(tags));
      return apiMultipart<DoctorPatientFileDetailsResponse>(
        doctorEndpoints.patients.files.upload(patientId),
        formData,
        { locale: "ar" },
      ).then(normalizeDoctorPatientFileDetailsResponse);
    },
    deleteFile: (patientId: string, fileId: string) =>
      del<DoctorPatientFileDeleteResponse>(
        doctorEndpoints.patients.files.remove(patientId, fileId),
        { locale: "ar" },
      ).then(normalizeDoctorPatientFileDeleteResponse),
    getAccessRequestApprovedPayload: (
      doctorId: string,
      patientId: string,
      requestId: string,
    ) =>
      apiRequestResult<DoctorPatientFullProfileResponse>(
        doctorEndpoints.patients.accessRequestDetails(
          doctorId,
          patientId,
          requestId,
        ),
        {
          method: "GET",
          locale: "ar",
          expectedStatuses: [403, 404],
        },
      ),
  },
  encounters: {
    list: (doctorId: string, params: DoctorEncountersListParams = {}) => {
      const query = buildDoctorEncountersListQuery(params);
      const base = doctorEndpoints.encounters.list(doctorId);
      const endpoint = query ? `${base}?${query}` : base;
      return get<DoctorPatientEncountersListResponse>(endpoint, {
        locale: "ar",
      }).then(normalizeDoctorEncountersListResponse);
    },
  },
  accessRequests: {
    list: (params: DoctorAccessRequestListParams = {}) => {
      const query = buildAccessRequestsListQuery(params);
      const base = doctorEndpoints.accessRequests.list;
      const endpoint = query ? `${base}?${query}` : base;
      return get<DoctorAccessRequestsListResponse>(endpoint, {
        locale: "ar",
      }).then(normalizeDoctorAccessRequestsListResponse);
    },
    getById: (requestId: string) =>
      get<DoctorAccessRequestDetailsResponse>(
        doctorEndpoints.accessRequests.details(requestId),
        { locale: "ar" },
      ).then(normalizeDoctorAccessRequestDetailsResponse),
  },
  appointments: doctorAppointmentsApi,
  schedule: doctorScheduleApi,
  slots: doctorSlotsApi,
  appointmentTypes: doctorAppointmentTypesApi,
  orders: {
    list: async (params: DoctorOrdersListParams = {}) => {
      const query = buildDoctorOrdersListQuery(params);
      const base = doctorEndpoints.orders.list;
      const endpoint = query ? `${base}?${query}` : base;
      const response = await get<DoctorOrdersListResponse>(endpoint, {
        locale: "ar",
      });
      const normalizedOrders = normalizeDoctorOrdersListResponse(response);
      const results = readDoctorNumber(response.results) ?? normalizedOrders.length;
      return {
        ...response,
        results,
        orders: normalizedOrders,
      };
    },
    getById: async (orderId: string) => {
      const response = await get<DoctorOrderDetailsResponse>(
        doctorEndpoints.orders.byId(orderId),
        { locale: "ar" },
      );
      const order = unwrapDoctorOrderPayload(response);
      if (!order) {
        throw new Error("errors.orders.notFound");
      }
      return { ...response, order };
    },
    updateStatus: (orderId: string, body: UpdateDoctorOrderStatusBody) =>
      patch<DoctorOrderMutationResponse>(
        doctorEndpoints.orders.status(orderId),
        body,
        { locale: "ar" },
      ).then(normalizeDoctorOrderMutationResponse),
    cancel: (orderId: string, body: CancelDoctorOrderBody = {}) =>
      patch<DoctorOrderMutationResponse>(
        doctorEndpoints.orders.cancel(orderId),
        body,
        { locale: "ar" },
      ).then(normalizeDoctorOrderMutationResponse),
    createLab: (body: CreateEncounterOrderBody) =>
      post<EncounterOrderResponse>(doctorEndpoints.orders.createLab, body, {
        locale: "ar",
      }).then(normalizeEncounterOrderResponse),
    createImaging: (body: CreateEncounterOrderBody) =>
      post<EncounterOrderResponse>(doctorEndpoints.orders.createImaging, body, {
        locale: "ar",
      }).then(normalizeEncounterOrderResponse),
    createProcedure: (body: CreateEncounterOrderBody) =>
      post<EncounterOrderResponse>(
        doctorEndpoints.orders.createProcedures,
        body,
        { locale: "ar" },
      ).then(normalizeEncounterOrderResponse),
    createCompat: (body: CreateEncounterOrderBody) =>
      post<EncounterOrderResponse>(doctorEndpoints.orders.create, body, {
        locale: "ar",
      }).then(normalizeEncounterOrderResponse),
    appendResults: (orderId: string, body: AppendDoctorOrderResultsBody) =>
      post<AppendDoctorOrderResultsResponse>(
        doctorEndpoints.orders.results(orderId),
        body,
        { locale: "ar" },
      ).then(normalizeAppendDoctorOrderResultsResponse),
    createReferral: (body: CreateDoctorReferralOrderBody) =>
      post<EncounterOrderResponse>(
        doctorEndpoints.orders.createReferrals,
        body,
        {
          locale: "ar",
        },
      ).then(normalizeEncounterOrderResponse),
  },
  orderFavorites: {
    list: (params: DoctorOrderFavoritesListParams = {}) => {
      const qs = new URLSearchParams();
      if (params.catalogSection)
        qs.set("catalogSection", params.catalogSection);
      if (params.page != null) qs.set("page", String(params.page));
      if (params.limit != null) qs.set("limit", String(params.limit));
      const query = qs.toString();
      const path = query
        ? `${doctorEndpoints.orderFavorites.list}?${query}`
        : doctorEndpoints.orderFavorites.list;
      return get<OrderFavoritesListResponse>(path, { locale: "ar" }).then(
        normalizeOrderFavoritesListResponse,
      );
    },
    create: (body: CreateOrderFavoriteBody) =>
      post<OrderFavoriteMutationResponse>(
        doctorEndpoints.orderFavorites.create,
        body,
        { locale: "ar" },
      ).then(normalizeOrderFavoriteMutationResponse),
    remove: (favoriteId: string) =>
      del<DoctorActionResponse>(
        doctorEndpoints.orderFavorites.delete(favoriteId),
        {
          locale: "ar",
        },
      ),
  },
  library: {
    recent: (limit = 10) =>
      get<DoctorLibraryRecentResponse>(
        `${doctorEndpoints.library.recent}?limit=${limit}`,
        { locale: "ar" },
      ).then(normalizeDoctorLibraryRecentResponse),
    list: (
      params: DoctorLibraryListParams = {},
    ) => {
      const qs = new URLSearchParams();
      if (params.page != null) qs.set("page", String(params.page));
      if (params.limit != null) qs.set("limit", String(params.limit));
      if (params.type) qs.set("type", params.type);
      if (params.favorite) qs.set("favorite", "true");
      if (params.includeArchived) qs.set("includeArchived", "true");
      if (params.search?.trim()) qs.set("search", params.search.trim());
      const query = qs.toString();
      const path = query
        ? `${doctorEndpoints.library.items}?${query}`
        : doctorEndpoints.library.items;
      return get<DoctorLibraryListResponse>(path, { locale: "ar" }).then(
        normalizeDoctorLibraryListResponse,
      );
    },
    create: (body: CreateDoctorLibraryItemBody) =>
      post<DoctorLibraryItemMutationResponse>(
        doctorEndpoints.library.items,
        body,
        { locale: "ar" },
      ).then(normalizeDoctorLibraryItemMutationResponse),
    update: (itemId: string, body: UpdateDoctorLibraryItemBody) =>
      patch<DoctorLibraryItemMutationResponse>(
        doctorEndpoints.library.itemById(itemId),
        body,
        { locale: "ar" },
      ).then(normalizeDoctorLibraryItemMutationResponse),
    delete: (itemId: string) =>
      del<DoctorLibraryItemDeleteResponse>(
        doctorEndpoints.library.itemById(itemId),
        { locale: "ar" },
      ).then(normalizeDoctorLibraryItemDeleteResponse),
    setFavorite: (itemId: string, isFavorite: boolean) =>
      patch<DoctorLibraryItemFavoriteResponse>(
        doctorEndpoints.library.itemFavorite(itemId),
        { isFavorite },
        { locale: "ar" },
      ).then(normalizeDoctorLibraryItemFavoriteResponse),
  },
  templates: {
    list: (
      params: DoctorTemplatesListParams = {},
    ) => {
      const qs = new URLSearchParams();
      if (params.page != null) qs.set("page", String(params.page));
      if (params.limit != null) qs.set("limit", String(params.limit));
      if (params.type) qs.set("type", params.type);
      if (params.includeArchived) qs.set("includeArchived", "true");
      if (params.search?.trim()) qs.set("search", params.search.trim());
      const query = qs.toString();
      const path = query
        ? `${doctorEndpoints.templates.list}?${query}`
        : doctorEndpoints.templates.list;
      return get<DoctorTemplatesListResponse>(path, { locale: "ar" }).then(
        normalizeDoctorTemplatesListResponse,
      );
    },
    create: (body: CreateDoctorTemplateBody) =>
      post<DoctorTemplateMutationResponse>(
        doctorEndpoints.templates.list,
        body,
        { locale: "ar" },
      ).then(normalizeDoctorTemplateMutationResponse),
    update: (templateId: string, body: UpdateDoctorTemplateBody) =>
      patch<DoctorTemplateMutationResponse>(
        doctorEndpoints.templates.byId(templateId),
        body,
        { locale: "ar" },
      ).then(normalizeDoctorTemplateMutationResponse),
    delete: (templateId: string) =>
      del<DoctorTemplateDeleteResponse>(
        doctorEndpoints.templates.byId(templateId),
        { locale: "ar" },
      ).then(normalizeDoctorTemplateDeleteResponse),
    apply: (templateId: string) =>
      post<DoctorTemplateApplyResponse>(
        doctorEndpoints.templates.apply(templateId),
        {},
        { locale: "ar" },
      ).then(normalizeDoctorTemplateApplyResponse),
  },
  internalDirectory: {
    list: (params: InternalDirectoryListParams = {}) => {
      const qs = new URLSearchParams();
      if (params.search?.trim()) qs.set("search", params.search.trim());
      if (params.specialization?.trim()) {
        qs.set("specialization", params.specialization.trim());
      }
      if (params.city?.trim()) qs.set("city", params.city.trim());
      if (params.country?.trim()) qs.set("country", params.country.trim());
      if (params.consultationType) {
        qs.set("consultationType", params.consultationType);
      }
      if (params.minRating != null) {
        qs.set("minRating", String(params.minRating));
      }
      if (params.page != null) qs.set("page", String(params.page));
      if (params.limit != null) qs.set("limit", String(params.limit));
      if (params.lat != null) qs.set("lat", String(params.lat));
      if (params.lng != null) qs.set("lng", String(params.lng));
      if (params.radiusKm != null) qs.set("radiusKm", String(params.radiusKm));

      const query = qs.toString();
      const path = query
        ? `${doctorEndpoints.internalDirectory}?${query}`
        : doctorEndpoints.internalDirectory;

      return get<InternalDirectoryListResponse>(path, { locale: "ar" }).then(
        normalizeInternalDirectoryListResponse,
      );
    },
  },
} as const;
