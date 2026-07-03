import { ApiError, del, get, patch, post } from "@/lib/api";
import { adminEndpoints } from "@/lib/admin/endpoints";
import type {
  AppointmentCancelResponse,
  AppointmentDetailsResponse,
  AdminAppointmentsListParams,
  AdminAppointmentsListResponse,
  AdminDoctorDetailsResponse,
  AdminDoctorsListParams,
  AdminDoctorsListResponse,
  AdminPatientAccountActionResponse,
  AdminPatientFilesListParams,
  AdminPatientFilesListResponse,
  AdminPatientFileDownloadUrlResponse,
  AdminPatientDetailsResponse,
  AdminPatientsListParams,
  AdminPatientsListResponse,
  AdminSecretariesListParams,
  AdminSecretariesListResponse,
  AdminUsersListResponse,
  CreateAdminUserBody,
  CreateAdminUserResponse,
  AdminUserOffboardResponse,
  AdminContentListParams,
  AdminContentListResponse,
  AdminContentDetailsResponse,
  CreateAdminContentBody,
  UpdateAdminContentBody,
  AdminContentMutationResponse,
  AdminContentTemplatesListResponse,
  AdminContentTemplatesListParams,
  CreateAdminContentTemplateBody,
  UpdateAdminContentTemplateBody,
  AdminContentTemplateMutationResponse,
  AdminNewsIngestBody,
  AdminNewsPendingListParams,
  AdminNewsPendingListResponse,
  AuditLogsListParams,
  AuditLogsListResponse,
  VerificationRequestReviewBody,
  VerificationRequestDetailsResponse,
  VerificationRequestSummary,
  VerificationRequestsListParams,
  VerificationRequestsListResponse,
  AdminComplaintsListParams,
  AdminComplaintsListResponse,
  AdminComplaintDetailsResponse,
  ComplaintStatusUpdateBody,
  ComplaintStatusUpdateResponse,
  ApiSuccessEnvelope,
  AdminMedicalOrderCatalogListParams,
  AdminMedicalOrderCatalogListResponse,
  AdminMedicalOrderCatalogDetailsResponse,
  AdminMedicalOrderCatalogMutationResponse,
  AdminMedicalOrderCatalogUpsertBody,
  MedicalOrderCatalogItem,
  MedicalOrderCatalogKind,
  AdminDoctorAnalyticsQuery,
  DoctorActivitySummaryResponse,
  DoctorDiagnosisAnalyticsResponse,
  AdminLookupsListParams,
  AdminLookupsListResponse,
  AdminLookupCreateBody,
  AdminLookupPatchBody,
  AdminLookupMutationResponse,
} from "@/lib/admin/types";

function normalizeMedicalOrderCatalogList(
  raw: AdminMedicalOrderCatalogListResponse | Record<string, unknown>,
): MedicalOrderCatalogItem[] {
  const body = raw as Record<string, unknown>;
  const candidates = body.items ?? body.catalog ?? body.results ?? body.data;
  if (!Array.isArray(candidates)) return [];
  return candidates
    .map((x) => {
      const r = x as Record<string, unknown>;
      const id = r._id ?? r.id;
      const label = r.label ?? r.name ?? r.title;
      if (id == null || label == null) return null;
      return { _id: String(id), label: String(label) };
    })
    .filter((x): x is MedicalOrderCatalogItem => x != null);
}

export function verificationRequestsFromListEnvelope(
  raw:
    | VerificationRequestsListResponse
    | Record<string, unknown>
    | null
    | undefined,
): VerificationRequestSummary[] {
  if (!raw || typeof raw !== "object") return [];
  const o = raw as Record<string, unknown>;
  for (const key of ["requests", "data", "items", "results"] as const) {
    const v = o[key];
    if (Array.isArray(v)) return v as VerificationRequestSummary[];
    if (v && typeof v === "object" && !Array.isArray(v)) {
      const inner = v as Record<string, unknown>;
      for (const k of ["requests", "items", "data", "results"] as const) {
        const a = inner[k];
        if (Array.isArray(a)) return a as VerificationRequestSummary[];
      }
    }
  }
  return [];
}

const DEV_MEDICAL_ORDER_PLACEHOLDERS: Record<
  MedicalOrderCatalogKind,
  MedicalOrderCatalogItem[]
> = {
  lab: [{ _id: "__dev_lab__", label: "complete blood count (CBC)" }],
  imaging: [],
  procedure: [],
  referral: [],
};

export const adminApi = {
  doctors: {
    list: (params: AdminDoctorsListParams = {}) => {
      const qs = new URLSearchParams();

      if (params.status) qs.set("status", params.status);
      if (params.search) qs.set("search", params.search);
      if (params.specialization)
        qs.set("specialization", params.specialization);
      if (params.city) qs.set("city", params.city);
      if (params.country) qs.set("country", params.country);
      if (params.from) qs.set("from", params.from);
      if (params.to) qs.set("to", params.to);
      if (params.page) qs.set("page", String(params.page));
      if (params.limit) qs.set("limit", String(params.limit));

      const endpoint = qs.toString()
        ? `${adminEndpoints.doctors.list}?${qs.toString()}`
        : adminEndpoints.doctors.list;

      return get<AdminDoctorsListResponse>(endpoint, { locale: "ar" });
    },
    getById: (doctorId: string) =>
      get<AdminDoctorDetailsResponse>(
        adminEndpoints.doctors.details(doctorId),
        {
          locale: "ar",
        },
      ),
    analyticsDiagnosis: (
      doctorId: string,
      params: AdminDoctorAnalyticsQuery = {},
    ) => {
      const qs = new URLSearchParams();
      if (params.range) qs.set("range", params.range);
      if (params.from) qs.set("from", params.from);
      if (params.to) qs.set("to", params.to);
      const base = adminEndpoints.doctors.analyticsDiagnosis(doctorId);
      const url = qs.toString() ? `${base}?${qs.toString()}` : base;
      return get<DoctorDiagnosisAnalyticsResponse>(url, { locale: "ar" });
    },
    analyticsSummary: (
      doctorId: string,
      params: AdminDoctorAnalyticsQuery = {},
    ) => {
      const qs = new URLSearchParams();
      if (params.range) qs.set("range", params.range);
      if (params.from) qs.set("from", params.from);
      if (params.to) qs.set("to", params.to);
      const base = adminEndpoints.doctors.analyticsSummary(doctorId);
      const url = qs.toString() ? `${base}?${qs.toString()}` : base;
      return get<DoctorActivitySummaryResponse>(url, { locale: "ar" });
    },
  },
  patients: {
    list: (params: AdminPatientsListParams = {}) => {
      const qs = new URLSearchParams();

      if (params.account_status)
        qs.set("account_status", params.account_status);
      if (params.search) qs.set("search", params.search);
      if (typeof params.includeDeleted === "boolean")
        qs.set("includeDeleted", String(params.includeDeleted));
      if (params.page) qs.set("page", String(params.page));
      if (params.limit) qs.set("limit", String(params.limit));

      const endpoint = qs.toString()
        ? `${adminEndpoints.patients.list}?${qs.toString()}`
        : adminEndpoints.patients.list;

      return get<AdminPatientsListResponse>(endpoint, { locale: "ar" });
    },
    getById: (patientId: string) =>
      get<AdminPatientDetailsResponse>(
        adminEndpoints.patients.details(patientId),
        {
          locale: "ar",
        },
      ),
    activate: (patientId: string) =>
      patch<AdminPatientAccountActionResponse>(
        adminEndpoints.patients.activate(patientId),
        undefined,
        { locale: "ar" },
      ),
    suspend: (patientId: string, reason?: string) =>
      patch<AdminPatientAccountActionResponse>(
        adminEndpoints.patients.suspend(patientId),
        reason ? { reason } : undefined,
        { locale: "ar" },
      ),
    unsuspend: (patientId: string) =>
      patch<AdminPatientAccountActionResponse>(
        adminEndpoints.patients.unsuspend(patientId),
        undefined,
        { locale: "ar" },
      ),
    files: {
      list: (patientId: string, params: AdminPatientFilesListParams = {}) => {
        const qs = new URLSearchParams();
        if (params.page) qs.set("page", String(params.page));
        if (params.limit) qs.set("limit", String(params.limit));
        if (typeof params.archived === "boolean")
          qs.set("archived", String(params.archived));
        if (params.search) qs.set("search", params.search);

        const base = adminEndpoints.patients.files.list(patientId);
        const endpoint = qs.toString() ? `${base}?${qs.toString()}` : base;

        return get<AdminPatientFilesListResponse>(endpoint, { locale: "ar" });
      },
      getDownloadUrl: (patientId: string, fileId: string) =>
        get<AdminPatientFileDownloadUrlResponse>(
          `${adminEndpoints.patients.files.download(patientId, fileId)}?mode=url`,
          { locale: "ar" },
        ),
    },
  },
  appointments: {
    list: (params: AdminAppointmentsListParams = {}) => {
      const qs = new URLSearchParams();

      if (params.page) qs.set("page", String(params.page));
      if (params.limit) qs.set("limit", String(params.limit));
      if (params.status) qs.set("status", params.status);
      if (params.date) qs.set("date", params.date);

      const endpoint = qs.toString()
        ? `${adminEndpoints.appointments.list}?${qs.toString()}`
        : adminEndpoints.appointments.list;

      return get<AdminAppointmentsListResponse>(endpoint, { locale: "ar" });
    },
    getDetails: (appointmentId: string) =>
      get<AppointmentDetailsResponse>(
        adminEndpoints.appointments.details(appointmentId),
        {
          locale: "ar",
        },
      ),
    cancel: (appointmentId: string, reason: string) =>
      patch<AppointmentCancelResponse>(
        adminEndpoints.appointments.cancel(appointmentId),
        { reason },
        { locale: "ar" },
      ),
  },
  accessRequests: {
    list: (params: { page?: number; limit?: number; status?: string } = {}) => {
      const qs = new URLSearchParams();
      if (params.page) qs.set("page", String(params.page));
      if (params.limit) qs.set("limit", String(params.limit));
      if (params.status) qs.set("status", params.status);
      const endpoint = qs.toString()
        ? `${adminEndpoints.accessRequests.list}?${qs.toString()}`
        : adminEndpoints.accessRequests.list;
      return get<any>(endpoint, { locale: "ar" });
    },
    getById: (requestId: string) =>
      get<any>(adminEndpoints.accessRequests.details(requestId), {
        locale: "ar",
      }),
  },
  complaints: {
    list: (params: AdminComplaintsListParams = {}) => {
      const qs = new URLSearchParams();
      if (params.page) qs.set("page", String(params.page));
      if (params.limit) qs.set("limit", String(params.limit));
      if (params.status) qs.set("status", params.status);
      if (params.type) qs.set("type", params.type);
      if (params.patientId) qs.set("patientId", params.patientId);
      if (params.from) qs.set("from", params.from);
      if (params.to) qs.set("to", params.to);
      if (params.search) qs.set("search", params.search.trim());
      const endpoint = qs.toString()
        ? `${adminEndpoints.complaints.list}?${qs.toString()}`
        : adminEndpoints.complaints.list;
      return get<AdminComplaintsListResponse>(endpoint, { locale: "ar" });
    },
    getById: (complaintId: string) =>
      get<AdminComplaintDetailsResponse>(
        adminEndpoints.complaints.details(complaintId),
        { locale: "ar" },
      ),
    updateStatus: (complaintId: string, body: ComplaintStatusUpdateBody) =>
      patch<ComplaintStatusUpdateResponse>(
        adminEndpoints.complaints.updateStatus(complaintId),
        body,
        { locale: "ar" },
      ),
  },
  verificationRequests: {
    list: (params: VerificationRequestsListParams = {}) => {
      const qs = new URLSearchParams();
      if (params.status) qs.set("status", params.status);
      if (params.doctorId) qs.set("doctorId", params.doctorId);
      if (params.page) qs.set("page", String(params.page));
      if (params.limit) qs.set("limit", String(params.limit));
      const endpoint = qs.toString()
        ? `${adminEndpoints.verificationRequests.list}?${qs.toString()}`
        : adminEndpoints.verificationRequests.list;
      return get<VerificationRequestsListResponse>(endpoint, { locale: "ar" });
    },
    review: (requestId: string, body: VerificationRequestReviewBody) =>
      patch<any>(adminEndpoints.verificationRequests.review(requestId), body, {
        locale: "ar",
      }),
    getById: (requestId: string) =>
      get<VerificationRequestDetailsResponse>(
        adminEndpoints.verificationRequests.details(requestId),
        { locale: "ar" },
      ),
  },
  users: {
    list: () =>
      get<AdminUsersListResponse>(adminEndpoints.users.list, { locale: "ar" }),
    create: (body: CreateAdminUserBody) =>
      post<CreateAdminUserResponse>(adminEndpoints.users.create, body, {
        locale: "ar",
      }),
    offboard: (userId: string, reason?: string) =>
      post<AdminUserOffboardResponse>(
        adminEndpoints.users.offboard(userId),
        reason ? { reason } : undefined,
        { locale: "ar" },
      ),
    reboard: (userId: string) =>
      post<ApiSuccessEnvelope>(
        adminEndpoints.users.reboard(userId),
        undefined,
        {
          locale: "ar",
        },
      ),
    doctorRestoreRequests: (params: {
      status?: string;
      search?: string;
      from?: string;
      to?: string;
      page?: number;
      limit?: number;
    }) => {
      const qs = new URLSearchParams();
      if (params.status) qs.set("status", params.status);
      if (params.search) qs.set("search", params.search);
      if (params.from) qs.set("from", params.from);
      if (params.to) qs.set("to", params.to);
      if (params.page) qs.set("page", params.page.toString());
      if (params.limit) qs.set("limit", params.limit.toString());
      const endpoint = qs.toString()
        ? `${adminEndpoints.users.doctorRestoreRequests}?${qs.toString()}`
        : adminEndpoints.users.doctorRestoreRequests;
      return get<ApiSuccessEnvelope & { results?: unknown[] }>(endpoint, {
        locale: "ar",
      });
    },
    reviewRestoreRequest: (
      userId: string,
      body: {
        decision: "approved" | "denied";
        reviewNote?: string;
      },
    ) =>
      post<ApiSuccessEnvelope>(
        adminEndpoints.users.reviewRestoreRequest(userId),
        body,
        { locale: "ar" },
      ),
  },
  secretaries: {
    list: (params: AdminSecretariesListParams = {}) => {
      const qs = new URLSearchParams();
      if (params.search) qs.set("search", params.search);
      if (params.doctorId) qs.set("doctorId", params.doctorId);
      if (params.page) qs.set("page", String(params.page));
      if (params.limit) qs.set("limit", String(params.limit));
      const endpoint = qs.toString()
        ? `${adminEndpoints.secretaries.list}?${qs.toString()}`
        : adminEndpoints.secretaries.list;
      return get<AdminSecretariesListResponse>(endpoint, { locale: "ar" });
    },
  },
  auditLogs: {
    list: (params: AuditLogsListParams = {}) => {
      const qs = new URLSearchParams();
      if (params.page) qs.set("page", String(params.page));
      if (params.limit) qs.set("limit", String(params.limit));
      if (params.search) qs.set("search", params.search);
      if (params.category) qs.set("category", params.category);
      if (params.outcome) qs.set("outcome", params.outcome);
      if (params.actorRole) qs.set("actorRole", params.actorRole);
      if (params.actorUserId) qs.set("actorUserId", params.actorUserId);
      if (params.action) qs.set("action", params.action);
      if (params.entityType) qs.set("entityType", params.entityType);
      if (params.entityId) qs.set("entityId", params.entityId);
      if (params.patientId) qs.set("patientId", params.patientId);
      if (params.targetUserId) qs.set("targetUserId", params.targetUserId);
      if (params.requestId) qs.set("requestId", params.requestId);
      if (params.ip) qs.set("ip", params.ip);
      if (params.from) qs.set("from", params.from);
      if (params.to) qs.set("to", params.to);
      const endpoint = qs.toString()
        ? `${adminEndpoints.auditLogs.list}?${qs.toString()}`
        : adminEndpoints.auditLogs.list;
      return get<AuditLogsListResponse>(endpoint, { locale: "ar" });
    },
  },
  content: {
    list: (params: AdminContentListParams = {}) => {
      const qs = new URLSearchParams();
      if (params.type) qs.set("type", params.type);
      if (params.status) qs.set("status", params.status);
      if (params.language) qs.set("language", params.language);
      if (params.page) qs.set("page", String(params.page));
      if (params.limit) qs.set("limit", String(params.limit));
      const endpoint = qs.toString()
        ? `${adminEndpoints.content.list}?${qs.toString()}`
        : adminEndpoints.content.list;
      return get<AdminContentListResponse>(endpoint, { locale: "ar" });
    },
    listMine: (params: AdminContentListParams = {}) => {
      const qs = new URLSearchParams();
      if (params.type) qs.set("type", params.type);
      if (params.status) qs.set("status", params.status);
      if (params.language) qs.set("language", params.language);
      if (params.page) qs.set("page", String(params.page));
      if (params.limit) qs.set("limit", String(params.limit));
      const endpoint = qs.toString()
        ? `${adminEndpoints.content.mine}?${qs.toString()}`
        : adminEndpoints.content.mine;
      return get<AdminContentListResponse>(endpoint, { locale: "ar" });
    },
    getById: (id: string) =>
      get<AdminContentDetailsResponse>(adminEndpoints.content.details(id), {
        locale: "ar",
      }),
    create: (body: CreateAdminContentBody) =>
      post<AdminContentMutationResponse>(adminEndpoints.content.create, body, {
        locale: "ar",
      }),
    update: (id: string, body: UpdateAdminContentBody) =>
      patch<AdminContentMutationResponse>(
        adminEndpoints.content.update(id),
        body,
        { locale: "ar" },
      ),
    submitReview: (id: string) =>
      post<any>(adminEndpoints.content.submitReview(id), undefined, {
        locale: "ar",
      }),
    approve: (id: string) =>
      post<any>(adminEndpoints.content.approve(id), undefined, {
        locale: "ar",
      }),
    reject: (id: string, rejectionReason: string) =>
      post<any>(
        adminEndpoints.content.reject(id),
        rejectionReason ? { rejectionReason } : undefined,
        { locale: "ar" },
      ),
    publish: (id: string) =>
      post<any>(adminEndpoints.content.publish(id), undefined, {
        locale: "ar",
      }),
    archive: (id: string) =>
      post<any>(adminEndpoints.content.archive(id), undefined, {
        locale: "ar",
      }),
  },
  contentTemplates: {
    list: (params: AdminContentTemplatesListParams = {}) => {
      const qs = new URLSearchParams();
      if (params.parentType) qs.set("parentType", params.parentType);
      if (typeof params.active === "boolean")
        qs.set("active", String(params.active));
      if (params.page) qs.set("page", String(params.page));
      if (params.limit) qs.set("limit", String(params.limit));
      const endpoint = qs.toString()
        ? `${adminEndpoints.contentTemplates.list}?${qs.toString()}`
        : adminEndpoints.contentTemplates.list;
      return get<AdminContentTemplatesListResponse>(endpoint, {
        locale: "ar",
      });
    },
    create: (body: CreateAdminContentTemplateBody) =>
      post<AdminContentTemplateMutationResponse>(
        adminEndpoints.contentTemplates.create,
        body,
        { locale: "ar" },
      ),
    update: (id: string, body: UpdateAdminContentTemplateBody) =>
      patch<AdminContentTemplateMutationResponse>(
        adminEndpoints.contentTemplates.update(id),
        body,
        { locale: "ar" },
      ),
    disable: (id: string, force = false) => {
      const endpoint = force
        ? `${adminEndpoints.contentTemplates.disable(id)}?force=true`
        : adminEndpoints.contentTemplates.disable(id);
      return post<ApiSuccessEnvelope>(endpoint, undefined, { locale: "ar" });
    },
  },
  news: {
    ingest: (body: AdminNewsIngestBody) =>
      post<ApiSuccessEnvelope>(adminEndpoints.news.ingest, body, {
        locale: "ar",
      }),
    pending: (params: AdminNewsPendingListParams = {}) => {
      const qs = new URLSearchParams();
      if (params.page) qs.set("page", String(params.page));
      if (params.limit) qs.set("limit", String(params.limit));
      if (params.sourceUrl) qs.set("sourceUrl", params.sourceUrl);
      if (params.language) qs.set("language", params.language);
      if (params.dateFrom) qs.set("dateFrom", params.dateFrom);
      if (params.dateTo) qs.set("dateTo", params.dateTo);
      const endpoint = qs.toString()
        ? `${adminEndpoints.news.pending}?${qs.toString()}`
        : adminEndpoints.news.pending;
      return get<AdminNewsPendingListResponse>(endpoint, { locale: "ar" });
    },
  },
  medicalOrderCatalog: {
    list: async (params: AdminMedicalOrderCatalogListParams) => {
      const qs = new URLSearchParams();
      if (params.search?.trim()) qs.set("search", params.search.trim());
      const base = adminEndpoints.orderCatalog.collection(params.type);
      const endpoint = qs.toString() ? `${base}?${qs.toString()}` : base;
      try {
        const raw = await get<
          AdminMedicalOrderCatalogListResponse | Record<string, unknown>
        >(endpoint, { locale: "ar" });
        return { items: normalizeMedicalOrderCatalogList(raw) };
      } catch (e) {
        if (
          import.meta.env.DEV &&
          e instanceof ApiError &&
          (e.status === 404 || e.status === 501)
        ) {
          return { items: DEV_MEDICAL_ORDER_PLACEHOLDERS[params.type] };
        }
        throw e;
      }
    },
    create: (body: AdminMedicalOrderCatalogUpsertBody) =>
      post<AdminMedicalOrderCatalogMutationResponse>(
        adminEndpoints.orderCatalog.collection(body.kind),
        {
          label: body.label,
          ...(typeof body.isActive === "boolean"
            ? { isActive: body.isActive }
            : {}),
          ...(typeof body.isVisible === "boolean"
            ? { isVisible: body.isVisible }
            : {}),
        },
        { locale: "ar" },
      ),
    getById: (kind: MedicalOrderCatalogKind, id: string) =>
      get<AdminMedicalOrderCatalogDetailsResponse>(
        adminEndpoints.orderCatalog.item(kind, id),
        { locale: "ar" },
      ),
    update: (
      kind: MedicalOrderCatalogKind,
      id: string,
      body: Partial<
        Pick<
          AdminMedicalOrderCatalogUpsertBody,
          "label" | "isActive" | "isVisible"
        >
      >,
    ) =>
      patch<AdminMedicalOrderCatalogMutationResponse>(
        adminEndpoints.orderCatalog.item(kind, id),
        body,
        { locale: "ar" },
      ),
    remove: (kind: MedicalOrderCatalogKind, id: string) =>
      del<ApiSuccessEnvelope>(adminEndpoints.orderCatalog.item(kind, id), {
        locale: "ar",
      }),
  },
  lookups: {
    list: (params: AdminLookupsListParams) => {
      const qs = new URLSearchParams();
      qs.set("category", params.category);
      if (params.includeInactive === true) qs.set("includeInactive", "true");
      if (params.langOnly === true) qs.set("langOnly", "true");
      const endpoint = `${adminEndpoints.lookups.list}?${qs.toString()}`;
      return get<AdminLookupsListResponse>(endpoint, { locale: "ar" });
    },
    create: (body: AdminLookupCreateBody) =>
      post<AdminLookupMutationResponse>(adminEndpoints.lookups.list, body, {
        locale: "ar",
      }),
    patch: (id: string, body: AdminLookupPatchBody) =>
      patch<AdminLookupMutationResponse>(
        adminEndpoints.lookups.detail(id),
        body,
        { locale: "ar" },
      ),
    remove: (id: string) =>
      del<ApiSuccessEnvelope>(adminEndpoints.lookups.detail(id), {
        locale: "ar",
      }),
  },
  serviceProviders: {
    create: (body: {
      serviceType: string;
      name: string;
      city?: string;
      country?: string;
      data?: Record<string, unknown>;
      aliases?: string[];
      status?: string;
    }) =>
      post<ApiSuccessEnvelope & { data?: { id: string } }>(
        adminEndpoints.serviceProviders.create,
        body,
        { locale: "ar" },
      ),
    update: (
      id: string,
      body: {
        name?: string;
        city?: string;
        country?: string;
        data?: Record<string, unknown>;
        aliases?: string[];
        status?: string;
      },
    ) =>
      patch<ApiSuccessEnvelope>(
        adminEndpoints.serviceProviders.update(id),
        body,
        { locale: "ar" },
      ),
    updateStatus: (
      id: string,
      body: {
        status: string;
      },
    ) =>
      patch<ApiSuccessEnvelope>(
        adminEndpoints.serviceProviders.updateStatus(id),
        body,
        { locale: "ar" },
      ),
  },
  facilities: {
    getById: (id: string) =>
      get<ApiSuccessEnvelope & { facility?: Record<string, unknown> }>(
        adminEndpoints.facilities.getById(id),
        { locale: "ar" },
      ),
    updateStatus: (id: string, status: string) =>
      patch<ApiSuccessEnvelope & { facility?: Record<string, unknown> }>(
        adminEndpoints.facilities.updateStatus(id),
        { status },
        { locale: "ar" },
      ),
    create: (body: {
      name: string;
      city: string;
      facilityType: string;
      kind: string;
      country: string;
      address: string;
      phone: string;
      description?: string;
      ownerDoctorId?: string;
      status?: string;
      attributes?: string[];
    }) =>
      post<ApiSuccessEnvelope & { data?: { id: string } }>(
        adminEndpoints.facilities.create,
        body,
        { locale: "ar" },
      ),
    update: (
      id: string,
      body: {
        name?: string;
        city?: string;
        facilityType?: string;
        kind?: string;
        country?: string;
        address?: string;
        phone?: string;
        description?: string;
        ownerDoctorId?: string;
        attributes?: string[];
      },
    ) =>
      patch<ApiSuccessEnvelope>(adminEndpoints.facilities.update(id), body, {
        locale: "ar",
      }),
  },
  doctorProfileChangeRequests: {
    review: (
      requestId: string,
      body: {
        decision: "approved" | "denied";
        adminNote?: string;
      },
    ) =>
      patch<
        ApiSuccessEnvelope & {
          request?: { status: string };
          doctor?: Record<string, unknown>;
        }
      >(`/api/doctors/profile-change-requests/${requestId}`, body, {
        locale: "ar",
      }),
  },
};
