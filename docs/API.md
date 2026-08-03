# LMJ Health Backend API Reference

Version: `2026.05.10`
Last Updated: `2026-05-10`

Comprehensive documentation for LMJ Health backend endpoints. The sections refreshed in this update were verified against the live route definitions, validators, controllers, services, and locale files in the codebase.

## Changelog

- Added doctor account lifecycle endpoints for self-deletion, OTP self-recovery,
  post-window OTP restore requests, and admin reboarding/review. Doctor
  offboarding now preserves secretary assignments while hiding offboarded or
  self-deleted doctors from discovery and availability surfaces.
- Added doctor home snapshot endpoint for the mobile doctor dashboard.
- Added Swagger/OpenAPI 3.1 documentation with full and role-filtered docs views, plus generated route coverage validation for all mounted operations.
- Added doctor-owned appointment types with soft delete, internal CRUD endpoints, and a patient-safe available-types endpoint under `/api/doctors/:doctorId/appointment-types`.
- Added optional appointment-type price snapshots to appointment booking, reschedule, and waitlist booking flows.
- Documented appointment snapshot source-of-truth rules so historical appointment type/name/price always come from the stored `Appointment` snapshot fields, not live `DoctorAppointmentType` records.
- Documented appointment booking side effects: successful bookings atomically link doctor/patient references and surface the appointment in doctor appointment and patient dashboard views.
- Refreshed the canonical appointment and waitlist docs plus the generated Postman collection for the appointment-type rollout.
- Added a standalone Facilities module (dedicated `Facility` model + service/controller/routes/validators).
- Added admin full CRUD endpoints for facilities and doctor-owned facility endpoints.
- Canonicalized doctor-facility relation to `doctor.facilityId` with transitional compatibility for `facilityProviderId`.
- Added facility attributes design as normalized `[String]` keys (lowercase snake_case, unique).
- Added startup migration support from legacy provider-based facilities into the new Facility collection.
- Canonicalized facility type values to stable lowercase keys with bilingual labels via `facilities.types.<key>`.
- Added public `GET /api/facilities/types` for frontend-safe localized facility type listing.
- Added typed doctor order tools (`LAB_ORDER`, `IMAGING_ORDER`, `PROCEDURE_ORDER`, `REFERRAL_ORDER`) with compatibility for legacy create/read flows.
- Added admin order catalog CRUD endpoints and separate doctor catalog browse endpoints.
- Added doctor order favorites endpoints and documented catalog/favorites behaviors.
- Revalidated patient privacy, access-request, patient-file, medical-record, and order routes directly from `src/routes/*.js`.
- Added doctor-scoped billing endpoints under `/api/billing` for invoices, payments, refunds, expenses, dashboard, reports, settings, and billing services.
- Added billing report PDF export documentation for `GET /api/billing/reports/export.pdf`.
- Added verified API documentation for synchronous PDF document generation (`POST /api/documents/generate`) including source-id mapping, binary download behavior, frontend handling, and error responses.
- Patched complaints from lightweight read-only intake into a small lifecycle module with status tracking, admin status updates, persisted one-way admin responses, and patient notifications.
- Rewrote the endpoint docs for Patient Settings, Access Requests, Doctor Patient Profile, Patient Files, Medical Records, and Orders.
- Corrected success and error envelope documentation to match `src/app.js`.
- Added explicit legacy compatibility notes for still-supported routes and request body aliases.
- Added a verified endpoint index for the routes covered by this refactor.
- Added app-aware auth `clientType` handling for token-issuing auth flows so mobile apps reject wrong-role sign-ins while web remains multi-role.
- Added encounter-centered clinical workflow endpoints for encounters, grouped prescriptions, encounter-bound order authoring, doctor library, doctor templates, and encounter documents.
- Added grouped prescription PDF support through the real `Prescription` model while keeping legacy medication-subdocument compatibility.
- Revalidated the new doctor-visit route surface directly from `src/routes/encounter.js`, `src/routes/prescription.js`, `src/routes/encounterOrder.js`, `src/routes/doctorLibrary.js`, `src/routes/doctorTemplate.js`, and `src/routes/encounterDocument.js`.
- Added appointment-linked patient files backed by a dedicated `AppointmentFileLink` collection and appointment-scoped upload/list/get/download/unlink endpoints.
- Expanded canonical `PatientFile` metadata into a richer medical-document model with classification, preview metadata, filtering/sorting support, and a documented backfill utility.
- Added medication reminder support with per-medication `remindersEnabled`, timezone-aware reminder evaluation, and reminder notifications driven by Agenda.
- Refreshed the dedicated file handoff docs and Postman assets for mobile/frontend integration:
  - `docs/mobile-file-api-guide.md`
  - `docs/file-api-reference.md`
  - `docs/postman-file-api-testing-guide.md`

## Current File API Note

The canonical file subsystem now has dedicated verified documentation that is more current than the older inline file sections in this large API reference:

- [docs/mobile-file-api-guide.md](./mobile-file-api-guide.md)
- [docs/file-api-reference.md](./file-api-reference.md)
- [docs/postman-file-api-testing-guide.md](./postman-file-api-testing-guide.md)

Those dedicated docs cover the current classification fields, filter/sort query params, image/PDF metadata, download behavior, legacy caveats, and Postman flows for the file/document subsystem.

## Swagger / OpenAPI Docs

The backend also serves machine-readable OpenAPI 3.1 documentation and Swagger UI from the API process. These docs are generated from the mounted Express route tree and express-validator metadata, then validated for route coverage.

Docs are enabled by default when `NODE_ENV` is not `production`. In production, set this environment variable to expose them:

```env
ENABLE_API_DOCS=true
SWAGGER_DOCS_PASSWORD=<strong-random-docs-password>
SWAGGER_DOCS_SESSION_SECRET=<strong-random-docs-session-secret>
SWAGGER_DOCS_SESSION_TTL_MINUTES=60
```

The Swagger UI HTML shell is browser-friendly: open `/api/docs`, enter the
documentation password, then click "Open Docs". The docs password is used only
to create an HttpOnly, HMAC-signed docs session cookie scoped to `/api/docs`.
It is not stored in `sessionStorage` or `localStorage`, not placed in the URL,
not rendered into the Swagger HTML, and not used as an API bearer token.

Access to OpenAPI JSON documents requires the docs session cookie. The JSON
document is not public, but it no longer requires an admin API bearer token.
If the docs session is missing, invalid, or expired, the protected JSON route
returns `401` and the Swagger page reloads to the docs password screen.

For Swagger "Try it out" API calls, click Swagger's built-in **Authorize**
button and paste the user API token you want to test with. Use a patient token
for patient endpoints, a doctor token for doctor endpoints, and an admin token
for admin endpoints. If you do not authorize Swagger, normal API requests are
sent without an `Authorization` header. Normal endpoint `401`/`403` responses
are displayed in Swagger and do not clear the docs session.

Use "Sign out of docs" to clear the docs session cookie.

Swagger UI routes:

| Route                  | Scope                                     | Operations |
| ---------------------- | ----------------------------------------- | ---------: |
| `/api/docs`            | Full internal API docs                    |        340 |
| `/api/docs/public`     | Public endpoints only                     |         28 |
| `/api/docs/patient`    | Public plus patient-relevant endpoints    |        148 |
| `/api/docs/doctor`     | Public plus doctor-relevant endpoints     |        226 |
| `/api/docs/secretary`  | Public plus secretary-relevant endpoints  |         98 |
| `/api/docs/admin`      | Public plus admin-relevant endpoints      |        152 |
| `/api/docs/data-entry` | Public plus data-entry-relevant endpoints |         80 |

Each Swagger UI route has a matching JSON document at `/api/docs/{scope}/openapi.json`. The full document is available at `/api/docs/openapi.json`.

Role-filtered docs are documentation filters only. They do not change runtime authorization, account-state checks, secretary assignment checks, ownership checks, or audit behavior. The API still enforces access through the mounted middleware chain.

Useful maintenance commands:

```bash
npm run openapi:generate
npm run openapi:validate
npm run openapi:bundle
```

## Response Conventions

Successful JSON responses are localized by the API response layer and include `messageKey` plus a localized `message`, unless a route already returns a compatible manual message shape.

Profile photos are stored internally as private object-storage keys. In successful JSON responses, any storage-key shaped `photoUrl` is returned as a short-lived signed download URL. The original key is returned as `photoKey`, and the TTL is returned as `photoUrlExpiresIn`.

Example user summary:

```json
{
  "_id": "64f...user",
  "fullName": "Dr Mona",
  "photoUrl": "https://files.example/profile-photos/doctor-profile/64f.../photo.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256...",
  "photoKey": "profile-photos/doctor-profile/64f.../photo.jpg",
  "photoUrlExpiresIn": 300
}
```

Existing external HTTP(S) `photoUrl` values are returned unchanged. Missing photos return `photoUrl: null` where the local response shape includes the field.

The source OpenAPI files live under `docs/openapi`. The generated route operations are in `docs/openapi/paths/generated.yaml`.

## Verification Report

- Routes scanned:
  - `src/routes/index.js`
  - `src/routes/appointment.js`
  - `src/routes/appointmentType.js`
  - `src/routes/waitlist.js`
  - `src/routes/patient.js`
  - `src/routes/doctor.js`
  - `src/routes/encounter.js`
  - `src/routes/prescription.js`
  - `src/routes/encounterOrder.js`
  - `src/routes/doctorLibrary.js`
  - `src/routes/doctorTemplate.js`
  - `src/routes/encounterDocument.js`
  - `src/routes/complaint.js`
  - `src/routes/facility.js`
  - `src/routes/accessRequest.js`
  - `src/routes/medicalRecord.js`
  - `src/routes/patientFiles.js`
  - `src/routes/billing.js`
  - `src/routes/documents.js`
- Endpoints documented: expanded to include doctor appointment types, appointment snapshot fields, waitlist booking additions, billing endpoints, complaints, standalone Facilities module endpoints, and PDF document generation.
- Endpoints found but not documented: `None` in the refactored sections below. Other scanned-file routes remain documented elsewhere in this file.
- Documented endpoints not found in code: `Empty`

## Table of Contents

- [Changelog](#changelog)
- [Current File API Note](#current-file-api-note)
- [Swagger / OpenAPI Docs](#swagger--openapi-docs)
- [Verification Report](#verification-report)
- [Frontend Integration Guide](#frontend-integration-guide)
- [Common Frontend Recipes](#common-frontend-recipes)
- [Global Conventions](#global-conventions)
- [Audit Logging](#audit-logging-securitycompliance)
- [Health](#1-health)
- [Auth](#2-auth-service)
- [Patient Resources](#3-patient-resources)
- [Patient Profile](#patient-profile)
- [Patient Settings](#patient-settings)
- [Patient Settings (Security)](#patient-settings-security)
- [Patient Files](#patient-files)
- [Appointments](#4-appointment-service)
- [Consultation](#5-consultation-service)
- [Complaints](#complaints)
- [Waitlist](#waitlist-service-phase-1)
- [Doctor Availability & Scheduling](#5-doctor-availability--scheduling)
- [Encounter-Centered Clinical Workflow](#encounter-centered-clinical-workflow)
- [Doctor Profile / Verification / Patient Tools](#doctor-profile-self-service--admin-review)
- [Access Requests](#access-requests)
- [Medical Records](#medical-records)
- [Orders](#orders)
- [Billing](#billing-service)
- [Documents / PDF generation](#pdf-documents)
- [Doctor Search](#doctor-search)
- [Internal Doctor Directory](#internal-doctor-directory-staff)
- [Reviews](#reviews)
- [Notifications](#notifications)
- [Admin routes](#admin-users-data-entry)
- [Admin lookups / service catalogs](#health-profile-lookup-options)
- [Facilities](#facilities-module-standalone)
- [Patient/Public Services](#patientpublic-services)
- [Content / Medical Library](#content-library--news)
- [Legacy Compatibility Notes](#legacy-compatibility-notes)
- [Endpoint Index](#endpoint-index)

## Frontend Integration Guide

- **Frontend note:** Most successful JSON responses look like `{ "messageKey", "message", ...endpointFields }`. Do not assume a universal `data` wrapper or a single top-level business key name.
- **Frontend note:** Standard errors look like `{ "status", "messageKey", "message", "errors" }`. Some routes add documented fields such as `accessRequired`, `pendingRequestId`, or lifecycle hints. Handle `messageKey` as the stable branch key.
- **Frontend note:** Validation failures are route-specific. Many return `400`; validator-heavy routes may return `422` with `errors[]` entries. Treat both as user-fixable input errors rather than assuming one global validation status.
- **Authenticated request basics:** send `Authorization: Bearer <accessToken>` and usually `x-lang: en|ar`. Access tokens are short-lived JWTs. Add `Content-Type: application/json` only for JSON routes. Keep multipart uploads and binary downloads in the mode documented by each endpoint.
- **Role-sensitive payloads:** some routes intentionally return different row/detail shapes by role. Common examples are auth, appointments, complaints, access requests, billing scope, and admin detail endpoints.
- **`x-lang` usage:** localized `message` text changes with `x-lang`; use `messageKey` for stable client-side branching, analytics, and QA assertions.
- **Pagination:** most list endpoints use top-level `page`, `limit`, `total`, `results`; patient-file lists use `pageInfo`.
- **Binary response note:** JSON envelopes do not apply to streamed files or generated PDFs that document a binary response. URL-based PDF exports, such as billing reports, return JSON with `downloadUrl`.
- **URL-mode vs stream-mode:** `mode=url` returns JSON with a presigned URL plus expiry metadata; `mode=stream` returns raw bytes with download headers. Prefer URL mode when the client can open a signed URL directly, and stream mode when the app must proxy or save bytes from the API response itself.
- **`clientType` rules:** token-issuing auth flows accept `patient_mobile`, `doctor_mobile`, or `web`. Wrong role/app combinations are rejected with `403`. Web is intentionally multi-role; mobile shells should always send the role-specific value.
- **Auth token contract:** token-issuing auth flows return `accessToken`, `refreshToken`, and `refreshExpiresAt`. The old top-level `token` field is removed. Use `accessToken` only as the bearer token. Use `refreshToken` only with `POST /auth/refresh`, then replace both stored tokens with the rotated pair.
- **`actorIds` meaning:** auth responses expose canonical role-profile ids (`patientId`, `doctorId`, `secretaryId`, `assignedDoctorId`) for follow-up route construction. Cache them after token-issuing auth success (`verify-otp`, `login`, `claim-account/verify`), not from signup-only or reset-only responses.
- **Legacy route warning:** when a section labels an older route as compatibility-only, new clients should prefer the modern route family documented alongside it.

## Common Frontend Recipes

- **Patient signup and verification:** call `POST /auth/signup`, keep the entered channel/identity, use `POST /auth/resend-signup-otp` only when delivery is pending or expired, then call `POST /auth/verify-otp` and store `accessToken`, `refreshToken`, `refreshExpiresAt`, `role`, and `actorIds` only if the response actually includes a token pair.
- **Doctor signup with pending approval handling:** call `POST /auth/signup` then `POST /auth/verify-otp`; if the response is `status: "pending_admin_approval"` without a token, show a pending screen and do not create an authenticated session.
- **Doctor self-deletion and recovery:** an approved active doctor can call `POST /api/doctors/me/delete-request`. This immediately locks the account, removes devices, revokes sessions, invalidates old tokens, cancels future appointments, closes active consultations, and preserves assigned secretaries. Within 7 days, use the public OTP flow `POST /api/doctors/account-deletion/recovery/start` then `/verify`; after the 7-day window, use `POST /api/doctors/account-deletion/restore-request/start` then `/verify` to submit an admin-reviewed restore request. The restore-request OTP flow accepts eligible `source=self_delete` accounts whether the lifecycle status is still `requested` or has already moved to `deleted`; admin-offboarded doctors cannot use it. These OTPs are purpose-scoped to the doctor lifecycle flow and cannot be reused for password reset. OTP start responses are intentionally non-enumerating.
- **Doctor lifecycle login guidance:** when a self-deleted doctor enters the correct login credentials, the login response is blocked with a lifecycle-specific error. During the 7-day window it returns `errors.accountDeletion.doctorSelfRecoveryAvailable`, `lifecycleAction=self_recovery`, and `recoveryExpiresAt`; after the window it returns `errors.accountDeletion.doctorRestoreRequestAvailable` and `lifecycleAction=restore_request`. Invalid credentials and non-self-deleted locked accounts keep the normal generic auth errors.
- **Login by app type:** mobile patient apps should send `clientType: "patient_mobile"`, doctor apps should send `clientType: "doctor_mobile"`, and web can use `clientType: "web"` for multi-role sign-in. Treat wrong-app `403` responses as shell/routing errors, not credential errors.
- **Temporary patient account claim:** use `POST /auth/claim-account/request`, then `POST /auth/claim-account/verify` with the OTP, password, and `clientType`, then store the returned token pair and `actorIds`. Do not route temporary patients through signup or password-reset flows.
- **Password reset:** use `POST /auth/reset-password` or `POST /auth/resend-reset-otp`, verify with `POST /auth/verify-reset-otp`, then finish with `POST /auth/new-password`. Treat all old access and refresh tokens as invalid after success and return the user to normal login.
- **Modern patient file upload/list/download:** for new integrations, use `POST /api/patients/:patientId/files/upload`, `GET /api/patients/:patientId/files`, and `GET /api/patients/:patientId/files/:fileId/download?mode=url|stream`. Use the dedicated file docs linked above for the most current file-specific behavior and classification/filter details.
- **Patient-safe appointment type discovery + booking:** load selectable types from `GET /doctors/:doctorId/appointment-types/available`, then book with `POST /appointments/book` using `appointmentTypeId` only when the patient selected one. Re-fetch `GET /api/appointments/:appointmentId` if the next screen needs appointment-linked files or the richer detail payload.
- **Waitlist create -> suggestions -> book:** create with `POST /waitlist`, use `GET /waitlist/suggestions` as advisory UI data for staff booking assistance, then convert with `POST /waitlist/:id/book`. After booking, hydrate the appointment screen with `GET /api/appointments/:appointmentId`.
- **Complaint create -> list -> detail:** create via `POST /complaints`, list with `GET /complaints/me`, and load the lifecycle timeline with `GET /complaints/:id`. Render `statusHistory` as the lifecycle timeline and `adminResponse` as the latest official reply, not a threaded conversation.
- **Billing dashboard + reports + export:** load summary cards/charts from `GET /billing/dashboard`, table/detail data from `GET /billing/reports` and list/detail endpoints, then request `GET /billing/reports/export.pdf` and open the returned `downloadUrl`.
- **Document generation:** call `POST /api/documents/generate` and handle the response as a binary PDF download in the same request. Persistence/share flows live elsewhere when the document section says so; this route is synchronous and request-bound.
- **Settings/legal pages:** load CMS-driven settings content from the documented content route family such as `GET /api/content/:slug?language=...`, then pair it with `GET/PATCH/POST /api/patient/settings/privacy*` so the UI shows both published policy content and the patient’s stored consent/settings state.

## Missing i18n keys

- None

## Global Conventions

| Item                | Value                                 |
| :------------------ | :------------------------------------ | --- |
| Base URL            | `http://api.local.test/api`           |
| Authentication      | `Authorization: Bearer <accessToken>` |
| Language header     | `x-lang: en                           | ar` |
| Default language    | `en`                                  |
| IDs                 | MongoDB ObjectIds                     |
| Timestamps          | ISO-8601 strings                      |
| Common content type | `application/json`                    |

### Roles

- `patient`
- `doctor`
- `admin`
- `secretary`

### Doctor Route Parameter Policy

For doctor-scoped routes under `/api/doctors/:doctorId/...`, the server authorizes using the authenticated doctor profile loaded from the token, not the raw path parameter alone. `:doctorId` must match either:

- the authenticated doctor profile `_id`, or
- the authenticated doctor's `userId`

If it does not match, the request fails with `403` and `messageKey: "errors.doctorPatient.onlyOwnPatients"`.

### Pagination Conventions

- Most list endpoints in these modules use:

  ```json
  {
    "messageKey": "success.ok",
    "message": "Request completed successfully.",
    "page": 1,
    "limit": 20,
    "total": 12,
    "results": 12,
    "<collection>": []
  }
  ```

- `GET /api/patients/:patientId/files` uses `pageInfo` instead of top-level `page/limit/total`:

  ```json
  {
    "messageKey": "success.ok",
    "message": "Request completed successfully.",
    "items": [],
    "pageInfo": {
      "page": 1,
      "limit": 20,
      "total": 0
    }
  }
  ```

### Standard Success Envelope

For successful JSON object responses, `src/app.js` injects `messageKey` and localized `message` if the controller/service did not already set them. There is not one single payload schema for success responses; each endpoint returns its own payload fields plus:

```json
{
  "messageKey": "success.ok",
  "message": "Request completed successfully.",
  "...endpointSpecificFields": "..."
}
```

Notes:

- If a controller/service sets `messageKey`, that key is preserved.
- If a controller/service sets `message` as a string, the middleware replaces it with the localized text for `messageKey`.
- Binary responses such as file streaming do not use the JSON success envelope.

### Standard Error Envelope

All documented error responses below follow the global error handler in `src/app.js`:

```json
{
  "status": 400,
  "messageKey": "errors.validation.invalid",
  "message": "Readable localized error message",
  "errors": null
}
```

Additional whitelisted fields may be merged into the error body when the backend sets them. In the routes covered by this refactor, the relevant additive fields are:

- `accessRequired`
- `pendingRequestId`

Example:

```json
{
  "status": 403,
  "messageKey": "errors.accessRequest.approvalRequired",
  "message": "Patient approval required.",
  "errors": null,
  "accessRequired": true,
  "pendingRequestId": "65f0c4f6e6a0d0d0d0d0d0d0"
}
```

- **Frontend note:** Many routes still return `errors: null` for handled validation failures, while validator-driven routes may return an `errors[]` array. Client code should branch on HTTP status plus `messageKey`, not on one fixed `errors` shape.

### Localization Conventions

- Set `x-lang: en` or `x-lang: ar` on requests.
- Success responses include both `messageKey` and localized `message`.
- Error responses include both `messageKey` and localized `message`.
- Message keys referenced in this document were verified in both `src/i18n/locales/en.json` and `src/i18n/locales/ar.json`.

### Example Authenticated Request

```bash
curl -X GET "http://localhost:5000/api/patient/profile" \
  -H "Authorization: Bearer <jwt-from-login>" \
  -H "x-lang: en"
```

---

## Audit Logging (Security/Compliance)

**Audit note:** Audit logging is best-effort and non-blocking. Audit write failures never fail API requests.

- **Visibility:** System-wide audit logs are admin-only via `GET /admin/audit-logs`. Doctors have a dedicated self-history route via `GET /doctors/me/activity-log`. Patients have dedicated self-history routes via `GET /patient/me/activity-log` and `GET /patient/me/access-log`. `GET /patient/audit-logs` remains available as a backward-compatible mixed self-audit feed.
- **Taxonomy:**
  - `category`: `AUTH | AUTHZ | PHI | DATA | ADMIN | SYSTEM`
  - `outcome`: `SUCCESS | FAIL | DENY`
  - `action`: uppercase, category-prefixed (for example `AUTH_LOGIN_FAILED`, `PHI_OPEN_MEDICAL_RECORD`, `ADMIN_SERVICE_TYPE_UPDATED`).
- **Request metadata:** `requestId`, `ip`, `userAgent`, `route`, `method`.
- **Delegation metadata:** For on-behalf flows (appointment mutations and patient-file access), metadata includes `performedByRole`, `onBehalfOfDoctorId` (when actor is secretary), and `patientId`.
- **Data minimization:** No raw PHI content in audit logs (no attachments payloads, no consultation message content, no diagnosis text/prescription text, no raw request payloads). Only whitelisted snapshots and safe metadata (counts/lengths/ids).
- **No-noise policy:**
  - Patient self-reads are not logged.
  - List endpoints are not logged.
  - Staff PHI reads are logged only for high-signal endpoints (doctor medical record open, staff file download, doctor consultation ticket open with messages).
  - Bulk lifecycle cleanups emit aggregate mutation audits (for example offboarding/deletion-triggered appointment cancellations or consultation closures) with safe counts/metadata rather than raw payloads.
- **Event naming (examples in use):**
  - `AUTH`: `AUTH_LOGIN_SUCCESS`, `AUTH_LOGIN_FAILED`, `AUTH_LOGOUT`, `AUTH_PASSWORD_CHANGED`, `AUTH_EMAIL_CHANGED`, `AUTH_PASSWORD_RESET_REQUESTED`, `AUTH_PASSWORD_RESET_COMPLETED`, `AUTH_ACCOUNT_DELETION_REQUESTED`, `AUTH_ACCOUNT_DELETION_CANCELLED`, `AUTH_ACCOUNT_DELETION_COMPLETED`, `AUTH_TOKEN_INVALIDATED`, `AUTH_ACCOUNT_LOCKED`, `AUTH_ACCOUNT_UNLOCKED`.
  - `AUTHZ`: `AUTHZ_PERMISSION_DENIED`, `AUTHZ_ACCESS_DENIED`, `AUTHZ_ACCOUNT_BLOCKED`.
  - `PHI`: `PHI_OPEN_MEDICAL_RECORD`, `PHI_OPEN_CONSULTATION_TICKET`, `PHI_DOWNLOAD_PATIENT_FILE`.
  - `DATA`: `DATA_APPOINTMENT_BOOKED`, `DATA_APPOINTMENT_RESCHEDULED`, `DATA_APPOINTMENT_CANCELLED`, `DATA_WAITLIST_CREATED`, `DATA_WAITLIST_UPDATED`, `DATA_WAITLIST_BOOKED`, `DATA_WAITLIST_CLOSED`, `DATA_WAITLIST_CANCELLED`, `DATA_CONSULTATION_TICKET_CREATED`, `DATA_CONSULTATION_MESSAGE_SENT`, `DATA_CONSULTATION_STATUS_UPDATED`, `DATA_COMPLAINT_CREATED`, `DATA_MEDICAL_RECORD_CREATED`, `DATA_MEDICAL_RECORD_UPDATED`, `DATA_MEDICATION_ADDED`, `DATA_PATIENT_FILE_UPLOADED`, `DATA_PATIENT_FILE_DELETED`, `DATA_ACCESS_REQUEST_APPROVED`, `DATA_ACCESS_REQUEST_DENIED`, `DATA_DOCTOR_SCHEDULE_CREATED`, `DATA_DOCTOR_SCHEDULE_UPDATED`, `DATA_DOCTOR_SCHEDULE_DELETED`.
  - `ADMIN`: `ADMIN_USER_ROLE_CHANGED`, `ADMIN_USER_ACTIVATED`, `ADMIN_USER_DEACTIVATED`, `ADMIN_COMPLAINT_STATUS_UPDATED`, `ADMIN_SERVICE_TYPE_CREATED`, `ADMIN_SERVICE_TYPE_UPDATED`, `ADMIN_SERVICE_TYPE_STATUS_CHANGED`, `ADMIN_SERVICE_PROVIDER_CREATED`, `ADMIN_SERVICE_PROVIDER_UPDATED`, `ADMIN_SERVICE_PROVIDER_STATUS_CHANGED`, `ADMIN_CONTENT_TEMPLATE_CREATED`, `ADMIN_CONTENT_TEMPLATE_UPDATED`, `ADMIN_CONTENT_TEMPLATE_STATUS_CHANGED`, `ADMIN_CONTENT_ITEM_CREATED`, `ADMIN_CONTENT_ITEM_UPDATED`, `ADMIN_CONTENT_ITEM_PUBLISHED`, `ADMIN_CONTENT_ITEM_UNPUBLISHED`, `ADMIN_LOOKUP_OPTION_CREATED`, `ADMIN_LOOKUP_OPTION_UPDATED`, `ADMIN_LOOKUP_OPTION_STATUS_CHANGED`, `ADMIN_SECRETARY_CREATED`, `ADMIN_SECRETARY_UPDATED`, `ADMIN_SECRETARY_DELETED`, `ADMIN_DOCTOR_SECRETARY_LINKED`, `ADMIN_DOCTOR_SECRETARY_UNLINKED`.
- **Retention (TTL by `expiresAt`):**
  - `AUTH`: 2 years
  - `AUTHZ`: 3 years
  - `DATA`: 3 years
  - `ADMIN`: 3 years
  - `PHI`: 7 years
  - `SYSTEM`: 1 year

---

## 1. Health

### `GET /health`

- **Auth:** None
- **Path note:** Also available at `GET /api/health`.
- **Response:**

  ```json
  {
    "ok": true,
    "status": "OK",
    "storage": "OK"
  }
  ```

- **Notes:** This endpoint checks both API liveness and MinIO connectivity.

### `GET /new-test`

- **Auth:** None
- **Path note:** Also available at `GET /api/new-test`.
- **Description:** Minimal public test endpoint for temporary deployment verification.
- **Response:**

  ```json
  {
    "ok": true,
    "test": "new test",
    "messageKey": "success.ok",
    "message": "Request completed successfully."
  }
  ```

---

## Patient Files

This module has two active API styles:

- Modern patient-file routes under `/api/patients/:patientId/files...`
- Legacy patient self-file routes under `/api/patient/files...` (still supported)
- Modern direct upload creates the canonical `PatientFile` in one request.
- Legacy initiate/complete routes keep the older presigned-upload handshake for compatibility clients.

Access behavior is not identical across file endpoints:

- Admins have no patient-file access. They cannot upload, list, inspect, download, or delete patient files.
- `upload` and `delete` use file `manage` access.
- `list`, `get`, and `download` use file `view` access.
- For doctor and secretary viewers, `view` access requires both a valid doctor-patient link and full-profile access (`allowDoctorsViewProfile=true` or an approved profile access request).
- For doctor and secretary upload/delete flows, the doctor-patient link is required, but full-profile approval is not.

- **Frontend note:** New integrations should prefer the modern `/api/patients/:patientId/files/...` route family and treat the older `/api/patient/files...` routes as compatibility-only.
- **Compatibility note:** The dedicated file docs linked near the top of this file are more current for classification/filter/download details. Keep this section for route coverage, but use those docs as the canonical implementation handoff for new file work.
- **Binary response note:** File downloads are split between JSON URL mode and raw stream mode. Do not assume every "download" route returns bytes directly.

### `POST /api/patients/:patientId/files/upload`

- **Role (auth):** `patient | doctor | secretary`
- **Description:** Upload and immediately attach one file record to the target patient.

**Params**

| Name        | In   | Type     | Required | Notes                                                    |
| :---------- | :--- | :------- | :------- | :------------------------------------------------------- |
| `patientId` | path | ObjectId | Yes      | Patient scope is enforced by role-specific access rules. |

**Request body schema**

`multipart/form-data`

| Field  | Type                        | Required | Notes                                        |
| :----- | :-------------------------- | :------- | :------------------------------------------- |
| `file` | binary                      | Yes      | Single uploaded file.                        |
| `note` | string                      | No       | Trimmed string.                              |
| `tags` | string or JSON array string | No       | Comma-separated string or JSON array string. |

Allowed MIME types in code: `image/png`, `image/jpeg`, `image/webp`, `application/pdf`, `text/plain`

**Response example**

```json
{
  "messageKey": "success.ok",
  "message": "Request completed successfully.",
  "file": {
    "_id": "65f0c4f6e6a0d0d0d0d0d0a1",
    "id": "65f0c4f6e6a0d0d0d0d0d0a1",
    "patientId": "65f0c4f6e6a0d0d0d0d0d0b1",
    "objectName": "1739643441123-report.pdf",
    "bucket": "uploads",
    "originalName": "report.pdf",
    "mimeType": "application/pdf",
    "sizeBytes": 12345,
    "tags": ["lab"],
    "note": "post-op",
    "isArchived": false
  }
}
```

**Errors**

- `400` `errors.validation.required`
- `400` `errors.validation.invalid`
- `400` `errors.validation.invalidFileType`
- `400` `errors.validation.range`
- `403` `errors.auth.insufficientPermissions`
- `403` `errors.doctor.notApproved`
- `404` `errors.patient.notFound`
- `500` `errors.unknown`
- `502` `errors.unknown`

Example:

```json
{
  "status": 400,
  "messageKey": "errors.validation.invalidFileType",
  "message": "Invalid file type.",
  "errors": null
}
```

**Notes**

- Doctors may upload for linked patients without profile-view approval.
- Secretaries need `patients:files:upload` and an assigned approved doctor linked to the patient.
- **Frontend note:** This is the preferred upload path for new web/mobile clients when the goal is to create a canonical patient file immediately in one request.

### `GET /api/patients/:patientId/files`

- **Role (auth):** `patient | doctor | secretary`
- **Description:** List patient file metadata.

**Params**

| Name        | In    | Type           | Required | Notes                                     |
| :---------- | :---- | :------------- | :------- | :---------------------------------------- |
| `patientId` | path  | ObjectId       | Yes      |                                           |
| `page`      | query | integer        | No       | Min `1`, default `1`.                     |
| `limit`     | query | integer        | No       | Min `1`, max `100`, default `20`.         |
| `archived`  | query | boolean string | No       | `true` or `false`, default `false`.       |
| `search`    | query | string         | No       | Case-insensitive match on `originalName`. |

**Request body schema**

`None`

**Query params**

- `medicationSource` (optional): `manual|doctor|prescription`

**Response example**

```json
{
  "messageKey": "success.ok",
  "message": "Request completed successfully.",
  "items": [
    {
      "_id": "65f0c4f6e6a0d0d0d0d0d0a1",
      "id": "65f0c4f6e6a0d0d0d0d0d0a1",
      "patientId": "65f0c4f6e6a0d0d0d0d0d0b1",
      "originalName": "report.pdf",
      "mimeType": "application/pdf",
      "sizeBytes": 12345,
      "isArchived": false,
      "createdAt": "2026-03-04T10:00:00.000Z"
    }
  ],
  "pageInfo": {
    "page": 1,
    "limit": 20,
    "total": 1
  }
}
```

**Errors**

- `400` `errors.validation.invalidId`
- `400` `errors.validation.invalidBoolean`
- `400` `errors.validation.invalidNumber`
- `403` `errors.auth.insufficientPermissions`
- `403` `errors.accessRequest.approvalRequired`
- `403` `errors.doctor.notApproved`
- `404` `errors.patient.notFound`

Example:

```json
{
  "status": 403,
  "messageKey": "errors.accessRequest.approvalRequired",
  "message": "Patient approval required.",
  "errors": null,
  "accessRequired": true,
  "pendingRequestId": "65f0c4f6e6a0d0d0d0d0d0c1"
}
```

**Notes**

- For doctor/secretary viewers, this is profile-view access, not just link access.
- **Frontend note:** Use this list endpoint for library/grid/table screens and treat `archived`, `search`, `page`, and `limit` as query controls. For the broader file contract, especially classification and filter behavior, defer to the dedicated file docs linked near the top of this file.

### `GET /api/patients/:patientId/files/:fileId`

- **Role (auth):** `patient | doctor | secretary`
- **Description:** Return one patient-file metadata record.

**Params**

| Name        | In   | Type     | Required | Notes |
| :---------- | :--- | :------- | :------- | :---- |
| `patientId` | path | ObjectId | Yes      |       |
| `fileId`    | path | ObjectId | Yes      |       |

**Request body schema**

`None`

**Response example**

```json
{
  "messageKey": "success.ok",
  "message": "Request completed successfully.",
  "file": {
    "_id": "65f0c4f6e6a0d0d0d0d0d0a1",
    "id": "65f0c4f6e6a0d0d0d0d0d0a1",
    "patientId": "65f0c4f6e6a0d0d0d0d0d0b1",
    "originalName": "report.pdf",
    "mimeType": "application/pdf",
    "sizeBytes": 12345,
    "isArchived": false
  }
}
```

**Errors**

- `400` `errors.validation.invalidId`
- `403` `errors.auth.insufficientPermissions`
- `403` `errors.accessRequest.approvalRequired`
- `404` `errors.patient.notFound`
- `404` `errors.files.notFound`

Example:

```json
{
  "status": 404,
  "messageKey": "errors.files.notFound",
  "message": "File not found.",
  "errors": null
}
```

**Notes**

- Viewer access rules match the list endpoint.

### `GET /api/patients/:patientId/files/:fileId/download`

- **Role (auth):** `patient | doctor | secretary`
- **Description:** Download a patient file either as a signed URL or as a streamed binary response.

**Params**

| Name        | In    | Type     | Required | Notes                                                                                                                                                                                                                                                                 |
| :---------- | :---- | :------- | :------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `patientId` | path  | ObjectId | Yes      |                                                                                                                                                                                                                                                                       |
| `fileId`    | path  | string   | Yes      | `PatientFile._id`, `PatientFile.objectName`, legacy `patient.files._id`, or legacy `patient.files.fileUrl`. Raw storage refs containing `/` must be URL-encoded in the path. If an intermediary decodes slashes before Express routing, use the query fallback below. |
| `mode`      | query | string   | No       | `url` or `stream`. Defaults to `url`.                                                                                                                                                                                                                                 |

**Request body schema**

`None`

**Response example (`mode=url`)**

```json
{
  "messageKey": "success.ok",
  "message": "Request completed successfully.",
  "fileId": "65f0c4f6e6a0d0d0d0d0d0a1",
  "fileName": "modern-labs.pdf",
  "fileType": null,
  "mimeType": "application/pdf",
  "extension": "pdf",
  "url": "https://storage.example/presigned-download",
  "downloadUrl": "https://storage.example/presigned-download",
  "expiresIn": 300
}
```

**Response example (`mode=stream`)**

Binary stream. Response headers include:

- `Content-Type`
- `Content-Length` when available
- `Content-Disposition: attachment; filename="<originalName>"`
- `X-File-Id: 65f0c4f6e6a0d0d0d0d0d0a1`
- `X-File-Name: modern-labs.pdf`
- `X-File-Type` when a categorical legacy file type exists, for example `xray`
- `X-File-Mime-Type: application/pdf`

**Errors**

- `400` `errors.validation.invalidEnum`
- `400` `errors.validation.invalidId`
- `403` `errors.auth.insufficientPermissions`
- `403` `errors.accessRequest.approvalRequired`
- `404` `errors.files.notFound`
- `500` `errors.unknown`

Example:

```json
{
  "status": 404,
  "messageKey": "errors.files.notFound",
  "message": "File not found.",
  "errors": null
}
```

**Notes**

- Viewer access rules match the list/get endpoints.
- Consultation attachments can use this same route when the client has the owning `patientId`. Pass the raw consultation attachment ref as `:fileId` when it is already a `PatientFile._id`; URL-encode it when it is a storage key such as `patient-files/patient/.../labs.pdf`.
- Safer slash-containing ref fallback: `GET /api/patients/:patientId/files/download?ref=<encodedRef>&mode=url|stream`. This uses the same authorization and response contract as the `:fileId/download` route.
- URL-mode clients should read `fileId`, `fileName`, `fileType`, `mimeType`, and `extension` from the JSON body.
- Stream-mode clients should read the file id/name/type from `X-File-Id`, `X-File-Name`, `X-File-Type`, and `X-File-Mime-Type`; use `Content-Disposition` for the download filename and `Content-Type` for the binary MIME type.
- Browser clients can read the stream metadata headers because CORS exposes `Content-Disposition`, `Content-Type`, `X-File-Id`, `X-File-Name`, `X-File-Type`, and `X-File-Mime-Type`.
- `mode=stream` is the only documented binary response in this section; it does not use the JSON envelope.
- **Binary response note:** `mode=url` is best when the client can open or hand off a short-lived presigned URL. `mode=stream` is best when the client must download bytes directly through the API response.
- **Frontend note:** Browser clients should use `mode=url` for simple open/download flows or request `blob`/`arraybuffer` for `mode=stream`. Mobile clients should use the presigned URL directly when supported, otherwise save the streamed bytes with the filename from `Content-Disposition`.

### `DELETE /api/patients/:patientId/files/:fileId`

- **Role (auth):** `patient | doctor | secretary`
- **Description:** Soft-delete the file record by setting `isArchived=true` and deleting the backing S3 object when present.

**Params**

| Name        | In   | Type     | Required | Notes |
| :---------- | :--- | :------- | :------- | :---- |
| `patientId` | path | ObjectId | Yes      |       |
| `fileId`    | path | ObjectId | Yes      |       |

**Request body schema**

`None`

**Response example**

```json
{
  "messageKey": "success.ok",
  "message": "Request completed successfully.",
  "success": true
}
```

**Errors**

- `400` `errors.validation.invalidId`
- `403` `errors.auth.insufficientPermissions`
- `403` `errors.doctor.notApproved`
- `409` `errors.files.linkedToAppointment`
- `409` `errors.files.linkedToComplaint`
- `409` `errors.files.linkedToOrder`
- `404` `errors.patient.notFound`
- `404` `errors.files.notFound`
- `500` `errors.unknown`

Example:

```json
{
  "status": 403,
  "messageKey": "errors.auth.insufficientPermissions",
  "message": "Insufficient permissions.",
  "errors": null
}
```

**Notes**

- Doctors may delete for linked patients without profile-view approval.
- Secretaries need `patients:files:upload` and an assigned approved doctor linked to the patient.

### `GET /api/doctors/:doctorId/patients/:patientId/files/:fileId/download-url`

- **Role (auth):** `doctor`
- **Description:** Doctor-scoped alias that always returns URL-mode download data for a patient file.

**Params**

| Name        | In   | Type     | Required | Notes                                                                                                                   |
| :---------- | :--- | :------- | :------- | :---------------------------------------------------------------------------------------------------------------------- |
| `doctorId`  | path | ObjectId | Yes      | Must match the authenticated doctor profile `_id` or `userId`.                                                          |
| `patientId` | path | ObjectId | Yes      |                                                                                                                         |
| `fileId`    | path | string   | Yes      | Same accepted values as the canonical patient-file download route. Raw storage refs containing `/` must be URL-encoded. |

**Request body schema**

`None`

**Response example**

```json
{
  "messageKey": "success.files.downloadUrlGenerated",
  "message": "Download URL generated.",
  "fileId": "65f0c4f6e6a0d0d0d0d0d0a1",
  "fileName": "modern-labs.pdf",
  "fileType": null,
  "mimeType": "application/pdf",
  "extension": "pdf",
  "url": "https://storage.example/presigned-download",
  "downloadUrl": "https://storage.example/presigned-download",
  "expiresIn": 300
}
```

**Errors**

- `400` `errors.validation.invalidId`
- `403` `errors.doctorPatient.onlyOwnPatients`
- `403` `errors.doctorPatient.notLinked`
- `403` `errors.accessRequest.approvalRequired`
- `403` `errors.doctor.notApproved`
- `404` `errors.patient.profileNotFound`
- `404` `errors.files.notFound`

Example:

```json
{
  "status": 403,
  "messageKey": "errors.doctorPatient.onlyOwnPatients",
  "message": "You can only manage your own patients.",
  "errors": null
}
```

**Notes**

- This route is a compatibility alias for doctor clients. Authorization still uses the authenticated doctor context.
- **Compatibility note:** New integrations should generally prefer `GET /api/patients/:patientId/files/:fileId/download?mode=url` unless a doctor-specific legacy client contract already depends on this alias.

### `POST /api/patient/files/initiate`

- **Role (auth):** `patient`
- **Description:** Legacy (still supported). Create a pending patient-owned file record and return a signed upload target.

**Params**

| Name | In  | Type | Required | Notes |
| :--- | :-- | :--- | :------- | :---- |
| None | -   | -    | -        |       |

**Request body schema**

```json
{
  "fileType": "xray",
  "originalName": "report.pdf",
  "contentType": "application/pdf",
  "description": "optional"
}
```

**Response example**

```json
{
  "messageKey": "success.ok",
  "message": "Request completed successfully.",
  "file": {
    "_id": "65f0c4f6e6a0d0d0d0d0d0f1",
    "fileType": "xray",
    "fileName": "report.pdf",
    "fileUrl": "patient-files/patient/65f0c4f6e6a0d0d0d0d0d011/uuid.pdf",
    "status": "PENDING",
    "contentType": "application/pdf"
  },
  "upload": {
    "key": "patient-files/patient/65f0c4f6e6a0d0d0d0d0d011/uuid.pdf",
    "uploadUrl": "https://storage.example/presigned-upload",
    "expiresIn": 300
  }
}
```

**Errors**

- `400` `errors.validation.required`
- `400` `errors.validation.invalidEnum`
- `400` `errors.validation.invalidFileType`
- `404` `errors.patient.profileNotFoundCreate`

Example:

```json
{
  "status": 400,
  "messageKey": "errors.validation.invalidFileType",
  "message": "Invalid file type.",
  "errors": null
}
```

**Notes**

- Use this only if the client still depends on the two-step legacy upload flow.
- **Compatibility note:** This route remains supported for older clients that upload directly to storage first. New clients should prefer `POST /api/patients/:patientId/files/upload`.
- **Frontend note:** Use this only when the client must upload directly to storage with a presigned URL. New web/mobile implementations should usually skip this route and use the one-step modern upload endpoint instead.

### `POST /api/patient/files/complete`

- **Role (auth):** `patient`
- **Description:** Legacy (still supported). Mark a pending file from `/patient/files/initiate` as active after the object exists in storage.

**Params**

| Name | In  | Type | Required | Notes |
| :--- | :-- | :--- | :------- | :---- |
| None | -   | -    | -        |       |

**Request body schema**

```json
{
  "fileId": "65f0c4f6e6a0d0d0d0d0d0f1"
}
```

**Response example**

```json
{
  "messageKey": "success.ok",
  "message": "Request completed successfully.",
  "file": {
    "_id": "65f0c4f6e6a0d0d0d0d0d0f1",
    "fileType": "xray",
    "fileName": "report.pdf",
    "fileUrl": "patient-files/patient/65f0c4f6e6a0d0d0d0d0d011/uuid.pdf",
    "status": "ACTIVE",
    "contentType": "application/pdf",
    "sizeBytes": 12345
  }
}
```

**Errors**

- `400` `errors.validation.required`
- `400` `errors.validation.invalidId`
- `400` `errors.validation.invalid`
- `400` `errors.files.uploadNotFound`
- `404` `errors.files.notFound`

Example:

```json
{
  "status": 400,
  "messageKey": "errors.files.uploadNotFound",
  "message": "Uploaded file not found.",
  "errors": null
}
```

**Notes**

- If the file is already `ACTIVE`, the endpoint returns `200` with the current file record.
- **Compatibility note:** This is the second half of the legacy presigned-upload flow and should not be used by new clients unless they intentionally implement the older two-step contract.
- **Frontend note:** Only call this after the client has successfully uploaded the object to the returned presigned storage target from `POST /api/patient/files/initiate`.

### `POST /api/patient/files`

- **Role (auth):** `patient`
- **Description:** Legacy (still supported). Save a patient file using one of three legacy inputs: `fileId`, `fileUrl` / `fileKey`, or direct multipart upload.

**Params**

| Name | In  | Type | Required | Notes |
| :--- | :-- | :--- | :------- | :---- |
| None | -   | -    | -        |       |

**Request body schema**

Supported compatibility forms:

```json
{
  "fileId": "65f0c4f6e6a0d0d0d0d0d0f1"
}
```

```json
{
  "fileType": "lab_report",
  "fileUrl": "patient-files/patient/65f0c4f6e6a0d0d0d0d0d011/uuid.pdf",
  "fileName": "cbc.pdf",
  "description": "optional"
}
```

`multipart/form-data`

| Field         | Type   | Required                                          | Notes                                                        |
| :------------ | :----- | :------------------------------------------------ | :----------------------------------------------------------- |
| `file`        | binary | Yes when uploading directly                       |                                                              |
| `fileType`    | string | Yes for direct upload or `fileUrl`/`fileKey` path | Enum: `xray`, `lab_report`, `scan`, `prescription`, `other`. |
| `description` | string | No                                                |                                                              |

**Response example**

```json
{
  "messageKey": "success.patient.fileSaved",
  "message": "Patient file saved.",
  "file": {
    "_id": "65f0c4f6e6a0d0d0d0d0d0f1",
    "fileType": "lab_report",
    "fileName": "cbc.pdf",
    "fileUrl": "patient-files/patient/65f0c4f6e6a0d0d0d0d0d011/uuid.pdf",
    "status": "ACTIVE"
  }
}
```

**Errors**

- `400` `errors.patient.fileMissing`
- `400` `errors.validation.required`
- `400` `errors.validation.invalidId`
- `400` `errors.validation.invalidEnum`
- `400` `errors.validation.invalidFileType`
- `400` `errors.files.uploadNotFound`
- `404` `errors.patient.profileNotFoundCreate`

Example:

```json
{
  "status": 400,
  "messageKey": "errors.patient.fileMissing",
  "message": "File is required.",
  "errors": null
}
```

**Notes**

- This endpoint remains supported for older clients.
- For new integrations, prefer the modern `/api/patients/:patientId/files/...` routes.
- **Compatibility note:** The backend still accepts the documented compatibility body aliases here, but new clients should avoid building against this multi-shape endpoint.
- **Frontend note:** This legacy route is the highest-friction file API because it accepts multiple body styles. New clients should avoid it unless they are matching an older shipped contract exactly.

### Patient Files Execution Flows (Detailed)

#### Flow: `POST /api/patients/:patientId/files/upload`

1. `isAuth`, `roleCheck`, and `enforcePatientActiveStatus` run first.
2. `patientFileUploadValidator` validates path/body metadata, then `validate` enforces the schema.
3. Controller calls `canAccessPatientFiles(..., action='manage')` to enforce role-scoped access:
   - patient can only manage own files,
   - doctor/secretary must have canonical doctor-patient link,
   - secretary must also have `patients:files:upload`.
4. Controller requires `multipart/form-data` and parses stream with `Busboy` (single `file`, MIME whitelist, size limit).
5. Raw bytes are streamed to object storage (`uploadStream`) and tracked for size.
6. Service `attachFileToPatient` verifies S3 object exists, dedupes by `bucket+objectName`, and creates `PatientFile`.
7. Audit event `DATA_PATIENT_FILE_UPLOADED` is recorded.
8. Response returns `201` with `messageKey: success.ok` and `file`.

#### Flow: `GET /api/patients/:patientId/files` and `GET /api/patients/:patientId/files/:fileId`

1. Auth/role/status middleware runs.
2. Validators enforce path/query (`page`, `limit`, `search`, `archived`).
3. Service access-guards with `canAccessPatientFiles(..., action='view')`.
4. List route applies filters + pagination and sorts by newest first.
5. Details route loads by `fileId` and patient scope.
6. Response returns `200` with `messageKey: success.ok` and either paginated `items` or one `file`.

#### Flow: `GET /api/patients/:patientId/files/:fileId/download`

1. Standard auth + validator flow runs.
2. Query `mode` is resolved (`url` default, `stream` optional).
3. Service validates `view` access and loads scoped file metadata.
4. For `mode=url`, backend returns a presigned URL (`downloadUrl`, `expiresIn`).
5. For `mode=stream`, backend proxies file stream and sets `Content-Type`, `Content-Length`, and attachment filename.
6. Non-patient access is audited (`PHI_DOWNLOAD_PATIENT_FILE` and URL-issue audit metadata).
7. Frontend handling splits by mode:
   - `url` -> consume JSON and navigate/open `downloadUrl`,
   - `stream` -> treat response as binary and skip JSON parsing.

#### Flow: `DELETE /api/patients/:patientId/files/:fileId`

1. Auth + validator + `manage` access check run.
2. Service loads patient-scoped file; if not already archived, storage delete is attempted.
3. File is soft-deleted by setting `isArchived=true` in DB.
4. Audit event `DATA_PATIENT_FILE_DELETED` is recorded.
5. Response returns `200` with `messageKey: success.ok` and `{ "success": true }`.

#### Flow: `GET /api/doctors/:doctorId/patients/:patientId/files/:fileId/download-url`

1. Doctor auth and `doctorPatientGuard` enforce doctor scope and route param match.
2. Service reuses patient file download logic in `mode=url`.
3. Response returns `200` with `messageKey: success.files.downloadUrlGenerated` and signed URL payload.

#### Flow: `POST /api/patient/files/initiate`

1. Patient auth middleware stack (`isAuth`, `roleCheck('patient')`, `loadUserModelsGuard`, `enforcePatientActiveStatus`) runs.
2. Validator enforces `fileType`, `originalName`, and `contentType`.
3. Service generates presigned upload target (`presignUpload`) under patient-scoped key prefix.
4. A pending file entry is created in `patient.files` with `status=PENDING`.
5. Audit event `DATA_PATIENT_FILE_UPLOAD_INITIATED` is recorded.
6. Response returns `200` with `messageKey: success.ok`, `file`, and `upload`.

#### Flow: `POST /api/patient/files/complete`

1. Patient auth + validator ensure `fileId` is provided.
2. Service finds the patient file entry and enforces state (`PENDING -> ACTIVE`).
3. Storage `headObject` confirms upload exists and validates content type.
4. File metadata is finalized (`status`, `sizeBytes`, `etag`, timestamps).
5. Audit event `DATA_PATIENT_FILE_UPLOAD_COMPLETED` is recorded.
6. Response returns `200` with `messageKey: success.ok` and finalized `file`.

#### Flow: `POST /api/patient/files` (Legacy)

1. Controller sets `Deprecation: true` response header.
2. Service executes one of three compatibility branches:
   - `fileId` path: complete an initiated upload,
   - `fileUrl/fileKey` path: attach existing object after key ownership checks,
   - multipart file path: upload directly then attach.
3. Each successful branch writes file audit records and returns `messageKey: success.patient.fileSaved`.
4. This route remains supported for older clients; new clients should use the modern `patients/:patientId/files/...` set.

## 2. Auth Service

All auth responses include profile fields: `fullName`, `email`, `phone`, and `patientPublicId` (patients only; `null` for other roles).

### Frontend auth flow map

- **Frontend note:** Standard patient signup flow is `signup -> resend OTP if needed -> verify OTP -> store accessToken + refreshToken + refreshExpiresAt + actorIds`.
- **Frontend note:** Standard doctor signup flow is `signup -> resend OTP if needed -> verify OTP -> if token is absent and status is pending approval, keep the user in a pending state instead of treating the account as fully signed in`.
- **Frontend note:** Standard password reset flow is `reset-password -> resend-reset-otp if needed -> verify-reset-otp -> new-password`.
- **Frontend note:** Temporary patient accounts must use `claim-account/request -> claim-account/verify` instead of signup or password-reset flows.
- **Frontend note:** Token-issuing responses from `verify-otp`, `login`, and `claim-account/verify` are the best time to cache `actorIds` because they are already role-normalized for follow-up route construction.

### `POST /auth/signup`

- **Description:** Create a patient or doctor account and attempt to send a 6-digit OTP via email or WhatsApp (channel required).
- **Auth:** None
- **Headers:** `Content-Type: application/json`, `x-lang: en|ar`
- **Body fields:**

| Field                      | Type              | Required    | Notes                                                                                              |
| -------------------------- | ----------------- | ----------- | -------------------------------------------------------------------------------------------------- |
| `fullName`                 | string            | ✔           |                                                                                                    |
| `email`                    | string            | ✔           | Unique per role, validated                                                                         |
| `password`                 | string (min 6)    | ✔           | Stored hashed                                                                                      |
| `phone`                    | string            | ✔           |                                                                                                    |
| `gender`                   | string            | conditional | required when `role === "doctor"`; patients can set via `/patient/profile/personal`                |
| `dateOfBirth`              | string (ISO date) | conditional | required when `role === "doctor"`; patients can set via `/patient/profile/personal`                |
| `address`                  | string            | conditional | required when `role === "doctor"`; patients set address via `/patient/profile/personal`            |
| `role`                     | string            | ✔           | `patient` or `doctor`                                                                              |
| `channel`                  | string            | ✔           | `email` or `whatsapp`                                                                              |
| `specializationKey`        | string            | conditional | doctor signup: choose one admin-managed specialization key from `GET /meta/doctor-specializations` |
| `customSpecializationText` | string            | conditional | doctor signup: use only when the desired specialization is not in the catalog                      |
| `specialization`           | string            | conditional | legacy fallback for doctor signup; treated as a custom specialization request                      |
| `medicalLicenseNumber`     | string            | conditional | doctors only                                                                                       |
| `bio`                      | string            | conditional | doctors only                                                                                       |
| `education`                | string            | conditional | doctors only                                                                                       |
| `clinicAddress`            | string            | conditional | doctors only                                                                                       |
| `locationCity`             | string            | optional    | doctors only                                                                                       |
| `locationCountry`          | string            | optional    | doctors only                                                                                       |
| `clinicLat`                | number            | optional    | doctors only; requires `clinicLng`                                                                 |
| `clinicLng`                | number            | optional    | doctors only; requires `clinicLat`                                                                 |
| `consultationTypes`        | array\<string\>   | optional    | doctors only (`online`, `offline`)                                                                 |

- **Specialization notes (doctors):** Provide exactly one of `specializationKey`, `customSpecializationText`, or legacy `specialization`. Catalog selections are stored on the doctor profile and keep the legacy `specialization` string in sync. Custom values remain pending until an admin maps them to an approved specialization during verification.
- **Geo notes (doctors):** If `clinicLat` + `clinicLng` are provided, the coordinates are stored as a pending pin until an admin verifies or adjusts them during approval. If coordinates are omitted, `clinicLocation` is not set and the doctor remains `geoStatus=missing`.

- **Success (new user)** `201 Created`

  ```json
  {
    "message": "Patient registered successfully. Please verify your email using the code we sent you.",
    "userId": "6770d7ef624f79fef8cbecc3",
    "role": "patient",
    "fullName": "Sara Patient",
    "email": "sara@example.com",
    "phone": "+201234567890",
    "patientPublicId": "P-00AB12CD"
  }
  ```

- **Success (new user, OTP delivery pending)** `201 Created`

  ```json
  {
    "message": "Patient registered successfully. Verification code delivery is pending; use resend to request a new code.",
    "userId": "6770d7ef624f79fef8cbecc3",
    "role": "patient",
    "fullName": "Sara Patient",
    "email": "sara@example.com",
    "phone": "+201234567890",
    "patientPublicId": "P-00AB12CD"
  }
  ```

- **Notes:** For new patient and doctor signups, local account creation can still succeed when the first OTP delivery fails. If the response message indicates delivery is pending, call `POST /auth/resend-signup-otp`.
- **Frontend note:** A successful signup response does not mean the user is authenticated yet. Move the UI to OTP verification, preserve the entered `channel`, and keep the submitted email/phone for resend and verify calls.

- **Success (existing unverified user)** `200 OK`

  ```json
  {
    "message": "Account already exists but is not verified. Verification code resent.",
    "userId": "6770d7ef624f79fef8cbecc3",
    "role": "patient",
    "status": "verification_pending",
    "fullName": "Sara Patient",
    "email": "sara@example.com",
    "phone": "+201234567890",
    "patientPublicId": "P-00AB12CD"
  }
  ```

- **Error (verified email)** `400 Bad Request`

  ```json
  { "message": "Email already registered. Please log in instead." }
  ```

- **Error (missing required doctor field)** `400 Bad Request`

  ```json
  { "message": "Medical license number is required" }
  ```

- **Example (patient signup)**

  ```bash
  curl -X POST "http://localhost:5000/api/auth/signup" \
    -H "x-lang: en" \
    -H "Content-Type: application/json" \
    -d '{
      "fullName": "Sara Patient",
      "email": "sara@example.com",
      "password": "Secret123",
      "phone": "+201234567890",
      "role": "patient",
      "channel": "email"
    }'
  ```

- **Example (doctor signup)**

  ```bash
  curl -X POST "http://localhost:5000/api/auth/signup" \
    -H "x-lang: en" \
    -H "Content-Type: application/json" \
    -d '{
      "fullName": "Dr Mona",
      "email": "dr.mona@example.com",
      "password": "Secret123",
      "phone": "+201234567891",
      "gender": "Female",
      "dateOfBirth": "1985-05-02",
      "address": "Clinic St",
      "role": "doctor",
      "channel": "email",
      "specializationKey": "cardiology",
      "medicalLicenseNumber": "LIC-1234",
      "bio": "15 years of experience",
      "education": "Cairo University",
      "clinicAddress": "123 Clinic St",
      "locationCity": "Cairo",
      "locationCountry": "EG",
      "consultationTypes": ["online", "offline"],
      "clinicLat": 30.0444,
      "clinicLng": 31.2357
    }'
  ```

- **Example (doctor signup with custom specialization request)**

  ```bash
  curl -X POST "http://localhost:5000/api/auth/signup" \
    -H "x-lang: en" \
    -H "Content-Type: application/json" \
    -d '{
      "fullName": "Dr Mona",
      "email": "dr.mona@example.com",
      "password": "Secret123",
      "phone": "+201234567891",
      "gender": "Female",
      "dateOfBirth": "1985-05-02",
      "address": "Clinic St",
      "role": "doctor",
      "channel": "email",
      "customSpecializationText": "Interventional Cardiology",
      "medicalLicenseNumber": "LIC-1234",
      "bio": "15 years of experience",
      "education": "Cairo University",
      "clinicAddress": "123 Clinic St"
    }'
  ```

### `POST /auth/resend-signup-otp`

- **Description:** Resend the signup OTP for an unverified account. Supports switching the delivery channel.
- **Auth:** None
- **Headers:** `Content-Type: application/json`, `x-lang: en|ar`
- **Body:** `{ "channel": "email" | "whatsapp", "email": "user@example.com", "phone": "+20123..." }` (email required for `email`, phone required for `whatsapp`)
- **Notes:** Rate-limited (1 request/minute, max 3/hour per user). Temporary patient accounts must use the claim flow instead. Legacy alias: `POST /auth/resend-otp`.
- **Frontend note:** Reuse the same identity and channel the user chose on signup. If the account is temporary, redirect to the claim-account flow instead of retrying signup OTP forever.
- **Response:**

  ```json
  {
    "message": "Account already exists but is not verified. Verification code resent.",
    "userId": "6770d7ef624f79fef8cbecc3",
    "role": "patient",
    "status": "verification_pending",
    "fullName": "Sara Patient",
    "email": "sara@example.com",
    "phone": "+201234567890",
    "patientPublicId": "P-00AB12CD"
  }
  ```

**Example**

```bash
curl -X POST "http://localhost:5000/api/auth/resend-signup-otp" \
  -H "x-lang: en" \
  -H "Content-Type: application/json" \
  -d '{ "channel": "whatsapp", "phone": "+201234567890" }'
```

### `POST /auth/verify-otp`

- **Description:** Confirms the signup OTP and unlocks the account (doctors still require admin approval).
- **Auth:** None
- **Headers:** `Content-Type: application/json`, `x-lang: en|ar`
- **Body:** `{ "channel": "email" | "whatsapp", "email": "user@example.com", "phone": "+20123...", "otp": "123456", "clientType": "patient_mobile" | "doctor_mobile" | "web" }` (`email` required for `channel=email`, `phone` required for `channel=whatsapp`, `clientType` optional and defaults to `web`)
- **Client rules:** `patient_mobile` is allowed only for `patient`; `doctor_mobile` is allowed only for `doctor`; `web` is allowed for `patient`, `doctor`, `secretary`, `admin`, and `data_entry`.
- **Actor IDs:** Token-pair and pending-approval responses include `actorIds` so clients can cache the canonical role profile IDs. Shape: `{ "patientId": null, "doctorId": null, "secretaryId": null, "assignedDoctorId": null }`.
- **Permission note:** Wrong app-role combinations are blocked here before token issuance. A doctor account verified through `patient_mobile` or a patient account verified through `doctor_mobile` returns `403`.
- **Responses:**
  - Patient or approved doctor:

    ```json
    {
      "message": "Account verified successfully",
      "accessToken": "access-jwt",
      "refreshToken": "refresh-jwt",
      "refreshExpiresAt": "2026-06-17T10:00:00.000Z",
      "userId": "6770d7ef624f79fef8cbecc3",
      "role": "patient",
      "fullName": "Sara Patient",
      "email": "sara@example.com",
      "phone": "+201234567890",
      "patientPublicId": "P-00AB12CD",
      "actorIds": {
        "patientId": "6770d7ef624f79fef8cbecc3",
        "doctorId": null,
        "secretaryId": null,
        "assignedDoctorId": null
      }
    }
    ```

  - Doctor pending approval:

    ```json
    {
      "message": "Email verified successfully. Your account is pending admin approval.",
      "userId": "6770d7ef624f79fef8cbecc4",
      "role": "doctor",
      "status": "pending_admin_approval",
      "fullName": "Dr Mona",
      "email": "dr.mona@example.com",
      "phone": "+201234567891",
      "patientPublicId": null,
      "actorIds": {
        "patientId": null,
        "doctorId": "6770d7ef624f79fef8cbecc4",
        "secretaryId": null,
        "assignedDoctorId": null
      }
    }
    ```

- **Error (wrong/expired code)** `400 Bad Request`

  ```json
  { "message": "Invalid verification code" }
  ```

- **Error (wrong app for role)** `403 Forbidden`

  ```json
  { "message": "This account is not allowed for this app." }
  ```

- **Examples**

  ```bash
  curl -X POST "http://localhost:5000/api/auth/verify-otp" \
    -H "x-lang: en" \
    -H "Content-Type: application/json" \
    -d '{ "channel": "email", "email": "sara@example.com", "otp": "123456", "clientType": "patient_mobile" }'
  ```

  ```bash
  curl -X POST "http://localhost:5000/api/auth/verify-otp" \
    -H "x-lang: en" \
    -H "Content-Type: application/json" \
    -d '{ "channel": "whatsapp", "phone": "+201234567890", "otp": "123456", "clientType": "doctor_mobile" }'
  ```

- **Frontend note:** If the response includes `accessToken` and `refreshToken`, treat the user as authenticated and store `actorIds` immediately. If the response returns `status: "pending_admin_approval"` without a token pair, show a pending-approval screen and do not create an authenticated session.

### `POST /auth/login`

- **Description:** Authenticate user credentials (email or phone), ensuring email verification and doctor approval; temporary accounts are blocked, and data-entry users must be active. Suspended patients can still log in in read-only mode. Patients with a pending deletion request can still log in but are restricted to deletion endpoints.
- **Auth:** None
- **Headers:** `Content-Type: application/json`, `x-lang: en|ar`
- **Body:** `{ "email": "user@example.com", "phone": "+20123...", "password": "Secret123", "clientType": "patient_mobile" | "doctor_mobile" | "web" }` (email or phone required; `password` min 6; `clientType` optional and defaults to `web`)
- **Client rules:** `patient_mobile` is allowed only for `patient`; `doctor_mobile` is allowed only for `doctor`; `web` is allowed for `patient`, `doctor`, `secretary`, `admin`, and `data_entry`.
- **Token note:** Successful token responses include the selected `clientType` in the access token payload. Access tokens are short-lived and must be used as bearer tokens; refresh tokens are only accepted by `POST /auth/refresh`.
- **Actor IDs:** Successful responses include `actorIds` with the canonical actor profile IDs for the authenticated role.
- **Frontend note:** Always send the correct `clientType` for the current app shell. A `403` wrong-app response is a routing/app-choice problem, not a bad-password problem.
- **Success response:**

  ```json
  {
    "message": "Login successful",
    "accessToken": "access-jwt",
    "refreshToken": "refresh-jwt",
    "refreshExpiresAt": "2026-06-17T10:00:00.000Z",
    "userId": "6770d7ef624f79fef8cbecc3",
    "role": "patient",
    "accountStatus": "active",
    "fullName": "Sara Patient",
    "email": "sara@example.com",
    "phone": "+201234567890",
    "patientPublicId": "P-00AB12CD",
    "actorIds": {
      "patientId": "6770d7ef624f79fef8cbecc3",
      "doctorId": null,
      "secretaryId": null,
      "assignedDoctorId": null
    },
    "accountDeletionStatus": "none",
    "requestedAt": null,
    "recoverUntil": null
  }
  ```

- **Common errors:** `401 Invalid email/phone or password` (also returned for anonymized/deleted accounts when the original email/phone no longer matches), `403 Account not verified`, `403 Account is inactive (data_entry only)`, `403 Doctor account pending admin approval`, `403 This account is not allowed for this app`, `403 Please activate your account before logging in` (temporary), `403 Account is locked` (except patients with deletion requested), `410 Account has been deleted` (only when the deleted user can be resolved by the provided email/phone)
- **Frontend note:** Cache `actorIds` from login and use them instead of guessing whether later routes want `userId` or role-profile `_id`.
- **Example**

  ```bash
  curl -X POST "http://localhost:5000/api/auth/login" \
    -H "x-lang: en" \
    -H "Content-Type: application/json" \
    -d '{ "email": "sara12@example.com", "password": "Secret123", "clientType": "patient_mobile" }'
  ```

### `POST /auth/refresh`

- **Description:** Rotate a valid refresh token and issue a fresh session-backed token pair.
- **Auth:** None. Send the refresh token in the JSON body, never as a bearer token.
- **Headers:** `Content-Type: application/json`, `x-lang: en|ar`
- **Body:** `{ "refreshToken": "refresh-jwt" }`
- **Response:**

  ```json
  {
    "messageKey": "success.auth.refreshed",
    "message": "Session refreshed",
    "accessToken": "access-jwt",
    "refreshToken": "refresh-jwt",
    "refreshExpiresAt": "2026-06-17T10:00:00.000Z"
  }
  ```

- **Notes:** Refresh-token rotation is one-time use. After success, discard the old refresh token and store the returned `refreshToken`. Reusing an old refresh token revokes the session.
- **Frontend note:** Retry a failed API request only after a successful refresh. If refresh fails with `401`, clear auth state and send the user to login.

### `POST /auth/logout`

- **Description:** Revoke the current auth session so the current access token and refresh token stop working.
- **Auth:** Any authenticated user
- **Headers:** `Authorization: Bearer <accessToken>`, `x-lang: en|ar`
- **Body:** – (empty)
- **Response:**

  ```json
  {
    "messageKey": "success.auth.loggedOut",
    "message": "Logged out successfully"
  }
  ```

- **Frontend note:** Clear the local `accessToken`, `refreshToken`, and `refreshExpiresAt` for the current device after success.

### `POST /auth/logout-all`

- **Description:** Revoke all auth sessions for the authenticated user and remove registered devices.
- **Auth:** Any authenticated user
- **Headers:** `Authorization: Bearer <accessToken>`, `x-lang: en|ar`
- **Body:** – (empty)
- **Response:**

  ```json
  {
    "message": "Logged out from all devices",
    "fullName": "Sara Patient",
    "email": "sara@example.com",
    "phone": "+201234567890",
    "patientPublicId": "P-00AB12CD"
  }
  ```

- **Notes:** All tokens issued before this call are rejected; the current device is logged out too.
- **Frontend note:** On success, clear all locally stored auth state immediately. Any parallel tabs, background refreshes, or mobile sessions using older access or refresh tokens should be treated as invalid and forced through login.

### `POST /auth/reset-password`

- **Description:** Sends or reissues a password reset OTP to email or via WhatsApp to the user's phone (channel required).
- **Notes:** Temporary patient accounts (`accountStatus=temporary`) cannot use password reset until activated; use `/auth/claim-account/request` + `/auth/claim-account/verify`.
- **Body:** `{ "email": "user@example.com", "phone": "+20123...", "channel": "email" | "whatsapp" }` (email required for email channel; phone required for WhatsApp)
- **Response:**

  ```json
  {
    "message": "Password reset code sent to your email",
    "fullName": "Sara Patient",
    "email": "sara@example.com",
    "phone": "+201234567890",
    "patientPublicId": "P-00AB12CD"
  }
  ```

- **Note:** The `message` text switches to the WhatsApp variant when `channel=whatsapp`; profile fields are always included.
- **Frontend note:** This starts a recovery flow only. Do not replace the user session until `POST /auth/new-password` succeeds; after success, force re-auth because old access and refresh tokens are invalidated.

- **Example**

  ```bash
  curl -X POST "http://localhost:5000/api/auth/reset-password" \
    -H "x-lang: en" \
    -H "Content-Type: application/json" \
    -d '{ "email": "sara@example.com", "channel": "whatsapp", "phone": "+201234567890" }'
  ```

### `POST /auth/resend-reset-otp`

- **Description:** Explicit resend endpoint for the password reset flow. This issues a fresh reset OTP and uses the same validation and rate limits as `/auth/reset-password`.
- **Notes:** Temporary patient accounts (`accountStatus=temporary`) cannot use password reset until activated; use `/auth/claim-account/request` + `/auth/claim-account/verify`.
- **Body:** `{ "email": "user@example.com", "phone": "+20123...", "channel": "email" | "whatsapp" }`
- **Response:** Same as `/auth/reset-password`

- **Example**

  ```bash
  curl -X POST "http://localhost:5000/api/auth/resend-reset-otp" \
    -H "x-lang: en" \
    -H "Content-Type: application/json" \
    -d '{ "email": "sara@example.com", "channel": "email" }'
  ```

### `POST /auth/verify-reset-otp`

- **Notes:** Temporary patient accounts (`accountStatus=temporary`) cannot use password reset until activated; use `/auth/claim-account/request` + `/auth/claim-account/verify`.
- **Body:** `{ "email": "user@example.com", "phone": "+20123...", "otp": "987654" }` (email or phone)
- **Response:**

  ```json
  {
    "message": "Password reset code verified",
    "resetToken": "session-token",
    "expiresInMinutes": 15,
    "fullName": "Sara Patient",
    "email": "sara@example.com",
    "phone": "+201234567890",
    "patientPublicId": "P-00AB12CD"
  }
  ```

- **Example**

  ```bash
  curl -X POST "http://localhost:5000/api/auth/verify-reset-otp" \
    -H "x-lang: en" \
    -H "Content-Type: application/json" \
    -d '{ "phone": "+201234567890", "otp": "987654" }'
  ```

### `POST /auth/claim-account/request`

- **Description:** For temporary patient accounts, attempt to send a claim OTP via email or WhatsApp.
- **Auth:** None
- **Body:** `{ "channel": "email" | "whatsapp", "email": "user@example.com", "phone": "+20123..." }` (email required for email channel; phone required for WhatsApp)
- **Response:**

  ```json
  {
    "message": "Claim code sent to your email",
    "fullName": "Sara Patient",
    "email": "sara@example.com",
    "phone": "+201234567890",
    "patientPublicId": "P-00AB12CD"
  }
  ```

- **Success (OTP delivery pending)** `200 OK`

  ```json
  {
    "message": "Claim request created. Use resend to get a new claim code.",
    "fullName": "Sara Patient",
    "email": "sara@example.com",
    "phone": "+201234567890",
    "patientPublicId": "P-00AB12CD"
  }
  ```

- **Note:** The `message` text switches to the WhatsApp variant when `channel=whatsapp`; profile fields are always included. If the response message indicates delivery is pending, call `POST /auth/resend-signup-otp` with the temporary patient's channel/identity to request a new code.

### `POST /auth/claim-account/verify`

- **Description:** Verify claim OTP, set password, and activate the temporary patient account.
- **Auth:** None
- **Body:** `{ "channel": "email" | "whatsapp", "email": "user@example.com", "phone": "+20123...", "otp": "123456", "password": "NewSecret123", "clientType": "patient_mobile" | "doctor_mobile" | "web" }`
- **Client rules:** `patient_mobile` and `web` are valid for this flow because the endpoint only activates patient accounts; `doctor_mobile` returns `403`.
- **Response:** Includes `actorIds` with the activated patient profile `_id`.

  ```json
  {
    "message": "Account activated successfully",
    "accessToken": "access-jwt",
    "refreshToken": "refresh-jwt",
    "refreshExpiresAt": "2026-06-17T10:00:00.000Z",
    "userId": "6770d7ef624f79fef8cbecc3",
    "role": "patient",
    "fullName": "Sara Patient",
    "email": "sara@example.com",
    "phone": "+201234567890",
    "patientPublicId": "P-00AB12CD",
    "actorIds": {
      "patientId": "6770d7ef624f79fef8cbecc3",
      "doctorId": null,
      "secretaryId": null,
      "assignedDoctorId": null
    }
  }
  ```

- **Frontend note:** Treat this as the end of the temporary-account claim flow. After success, the returned token pair is the active session and the cached `actorIds.patientId` should replace any temporary route assumptions.

### `POST /auth/new-password`

- **Notes:** Requires `resetToken` from `/auth/verify-reset-otp`. Temporary patient accounts (`accountStatus=temporary`) cannot use password reset until activated; use claim endpoints. Resetting a password revokes all existing auth sessions.
- **Frontend note:** After a successful password reset, clear any cached access and refresh tokens and return the user to the normal login state even if the app still holds an older token in memory.
- **Body:** `{ "token": "session-token", "password": "NewSecret123" }`
- **Response:**

  ```json
  {
    "message": "Password reset successfully",
    "fullName": "Sara Patient",
    "email": "sara@example.com",
    "phone": "+201234567890",
    "patientPublicId": "P-00AB12CD"
  }
  ```

- **Example**

  ```bash
  curl -X POST "http://localhost:5000/api/auth/new-password" \
    -H "x-lang: en" \
    -H "Content-Type: application/json" \
    -d '{ "token": "session-token", "password": "NewSecret123" }'
  ```

---

## 3. Patient Resources

All routes below require the user to be logged in as a `patient`. The patient profile must already exist; otherwise the API returns `404 Patient profile not found. Please create your patient profile first.`

### Patient account deletion

State machine: `none -> requested -> deleted`. A requested deletion can be cancelled within **7 days**. After 7 days the system finalizes deletion and anonymizes PII.

Effects of deletion request/finalization:

- Account is locked immediately.
- OTP/reset/pending email/phone fields are cleared.
- All push devices are removed (notifications stop).
- All **future** scheduled appointments are cancelled (`cancelReason=patient_account_deletion`).
  - Deletion request flow marks `cancelledBy=patient`.
  - Scheduled finalization typically marks `cancelledBy=system`.
- All **active** consultation tickets (`pending`/`active`) are closed (`closedReason=patient_account_deletion`).
  - Deletion request flow marks `closedBy=patient`.
  - Scheduled finalization typically marks `closedBy=system`.
- Medical records, appointments, tickets, reviews remain (patient identity is anonymized on finalize).

#### `POST /patient/me/delete-request`

- **Description:** Request account deletion (7-day recovery window).
- **Auth:** Patient
- **Body:** `{ "reason": "optional text" }`
- **Notes:** If deletion is already requested, the endpoint is idempotent and returns the existing `requested` status.
- **Response:**

  ```json
  {
    "message": "Account deletion requested",
    "status": "requested",
    "recoverUntil": "2026-02-05T10:00:00.000Z"
  }
  ```

#### `POST /patient/me/delete-cancel`

- **Description:** Cancel a pending deletion request **within** 7 days.
- **Auth:** Patient
- **Response:** `{ "message": "Account deletion cancelled", "status": "none" }`
- **Errors:** `403` if recovery window expired; `400` if no pending request.

#### `GET /patient/me/deletion-status`

- **Description:** Fetch deletion state for the logged-in patient.
- **Auth:** Patient
- **Response:**

  ```json
  {
    "status": "requested",
    "requestedAt": "2026-01-29T10:00:00.000Z",
    "recoverUntil": "2026-02-05T10:00:00.000Z",
    "deletedAt": null
  }
  ```

### `POST /patient/medications`

- **Headers:** `Content-Type: application/json`, `x-lang: en|ar`
- **Body example:**

  ```json
  {
    "name": "Ibuprofen",
    "dosage": "400mg",
    "frequency": "Twice daily",
    "startDate": "2025-11-01",
    "endDate": "2025-11-15",
    "times": ["08:00", "20:00"],
    "remindersEnabled": true,
    "notes": "Take with food"
  }
  ```

- **Response:** `{ "message": "Medication added", "medication": { ..., "sourceType": "manual" } }`
- **Reminder behavior:** reminders are sent only when `remindersEnabled=true` and `times[]` contains valid `HH:mm` entries. If `remindersEnabled` is omitted, the backend enables reminders automatically when `times[]` is provided.
- **Timezone behavior:** reminder times are evaluated in the patient's stored profile timezone (`profile.user.timezone`). If no timezone is set, the backend falls back to `UTC`.
- **Error (no profile)** `404 Not Found` — `{ "message": "Patient profile not found. Please create your patient profile first." }`
- **Error (missing required)** `400 Bad Request` — `{ "message": "name and startDate are required." }`
- **Notes:** patient-created medications are always stored as `sourceType: "manual"` and the backend ignores any caller-supplied `prescribedBy`.
- **Example**

  ```bash
  curl -X POST "http://localhost:5000/api/patient/medications" \
    -H "x-lang: en" \
    -H "Authorization: Bearer <token>" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Ibuprofen",
      "dosage": "400mg",
      "frequency": "Twice daily",
      "startDate": "2025-11-01",
      "endDate": "2025-11-15",
      "times": ["08:00", "20:00"],
      "remindersEnabled": true,
      "notes": "Take with food"
    }'
  ```

### `PATCH /patient/medications/:medicationId`

- **Description:** Update one patient-managed manual medication.
- **Auth:** Patient
- **Body:** any subset of `name`, `dosage`, `frequency`, `startDate`, `endDate`, `times`, `remindersEnabled`, `notes`, `instructions`, `route`.
- **Response:** `{ "messageKey": "success.patient.medicationUpdated", "medication": { ... } }`
- **Errors:** `400 errors.validation.required`, `400 errors.validation.invalidDate`, `400 errors.validation.array`, `400 errors.validation.invalidBoolean`, `403 errors.medication.manualOnlyManage`, `404 errors.medication.notFound`

### `DELETE /patient/medications/:medicationId`

- **Description:** Hard-delete one patient-managed manual medication.
- **Auth:** Patient
- **Response:** `{ "messageKey": "success.patient.medicationDeleted", "medicationId": "..." }`
- **Errors:** `403 errors.medication.manualOnlyManage`, `404 errors.medication.notFound`

### `POST /patient/medical-history`

- **Body example:**

  ```json
  {
    "doctor": "doctorUserId",
    "diagnosis": "Vitamin D deficiency",
    "prescriptions": ["Vitamin D3"],
    "attachments": ["patient-files/patient/<userId>/labs.pdf"],
    "followUpRequired": true
  }
  ```

- **Response:** `{ "message": "Medical history entry added", "record": { ... } }`
- **Errors:**
  - `400 Bad Request` — `{ "message": "doctor is required." }`
  - `403 Forbidden` — `{ "message": "Doctor is not approved." }`
  - `404 Not Found` — `{ "message": "Doctor not found." }`
  - `404 Not Found` — `{ "message": "Patient profile not found. Please create your patient profile first." }`
- **Example**

  ```bash
  curl -X POST "http://localhost:5000/api/patient/medical-history" \
    -H "x-lang: en" \
    -H "Authorization: Bearer <token>" \
    -H "Content-Type: application/json" \
    -d '{
      "doctor": "64f...doctorUser",
      "diagnosis": "Vitamin D deficiency",
      "prescriptions": ["Vitamin D3 5000IU"],
      "attachments": ["patient-files/patient/<userId>/labs.pdf"],
      "followUpRequired": true
    }'
  ```

---

## 4. Appointment Service

All routes require bearer access-token auth. Additional role checks are noted.

### Appointment type source of truth

- Appointment types belong to one doctor.
- The patient-safe available-types endpoint under `/doctors/:doctorId/appointment-types/available` is the booking source of truth for selectable types and patient-visible pricing.
- Historical appointments always render appointment type name/price from the snapshot fields stored on `Appointment`.
- Live `DoctorAppointmentType` data is never used to render historical appointment type name or price.
- `Doctor.consultationFee` remains legacy/backward-compatible data and is not used to populate appointment snapshots.

### Appointment type payloads and snapshot fields

- **Internal appointment type payload** (`GET/POST/PUT /doctors/:doctorId/appointment-types...`):
  - `_id`
  - `doctor`
  - `name`
  - `price` (`number | null`)
  - `isPriceVisibleToPatient` (`boolean`)
  - `isActive` (`boolean`)
  - `deletedAt` (`ISO-8601 | null`)
  - `createdAt`
  - `updatedAt`
- **Available appointment type payload** (`GET /doctors/:doctorId/appointment-types/available`):
  - `_id`
  - `name`
  - `price` only when a price exists and `isPriceVisibleToPatient === true`
- **Appointment snapshot fields** returned on booking/mutation/read responses:
  - `appointmentType` (`ObjectId | null`)
  - `appointmentTypeNameSnapshot` (`string | null`)
  - `priceSnapshot` (`number`, omitted from patient-facing payloads when hidden or null)
  - `priceVisibleToPatientSnapshot` (internal viewers only: `doctor`, `secretary`, `admin`)
- If no `appointmentTypeId` is provided at booking time, snapshot fields remain `null` and legacy clients remain compatible.
- If an appointment type is later edited, deactivated, or soft-deleted, existing appointments keep their original snapshot values.

### Frontend booking guidance

- **Frontend note:** Use `GET /doctors/:doctorId/appointment-types/available` as the booking selector source for patient-facing UI. Do not build patient selectors from the internal appointment-type CRUD endpoints.
- **Backend behavior note:** Historical appointment cards and details must render `appointmentTypeNameSnapshot` and `priceSnapshot` from the appointment payload itself, not from a later fetch of the live appointment type.
- **Frontend note:** `POST /appointments/book` and `POST /waitlist/:id/book` both return compact appointment payloads. If the UI needs linked files or a fuller detail view, follow with `GET /api/appointments/:appointmentId`.
- **Frontend note:** Re-fetch appointment detail after `book`, `reschedule`, `cancel`, `complete`, `no-show`, or any appointment-file link/unlink/upload mutation if the current screen shows appointment status, files, or patient/doctor summary fields.

### `GET /doctors/:doctorId/appointment-types/available`

- **Roles:** `patient`, `doctor`, `secretary`, `admin`
- **Auth/scope:** patient-safe output for every caller. Secretaries must be assigned to the doctor through the existing doctor-scoped guard. The endpoint requires a valid approved doctor.
- **Purpose:** Return active, non-deleted appointment types that can currently be selected in booking flows.
- **Path params:**
  - `doctorId` — Mongo ObjectId of the doctor profile.
- **Validation:**
  - `doctorId` must be a valid Mongo ObjectId.
- **Rules:**
  - returns only types with `isActive=true` and `deletedAt=null`
  - hidden or null prices are omitted from the response entirely
  - response never includes internal-only fields such as `isPriceVisibleToPatient`, `isActive`, or `deletedAt`
- **Response:** `200 OK`

  ```json
  {
    "messageKey": "success.ok",
    "message": "Request completed successfully.",
    "appointmentTypes": [
      {
        "_id": "65f0c4f6e6a0d0d0d0d0d201",
        "name": "Initial Consultation",
        "price": 500
      },
      {
        "_id": "65f0c4f6e6a0d0d0d0d0d202",
        "name": "Follow-up"
      }
    ]
  }
  ```

- **Errors:**
  - `400 Bad Request` — `errors.validation.invalidId`
  - `403 Forbidden` — doctor/secretary scope denied by existing auth guards
  - `403 Forbidden` — `errors.doctor.notApproved`
  - `404 Not Found` — `errors.doctorProfile.notFound`

### `GET /doctors/:doctorId/appointment-types`

- **Roles:** `doctor`, `secretary`, `admin`
- **Auth/scope:** doctor owner, admin, or secretary assigned to that doctor with `appointments:view`.
- **Purpose:** Internal management/read endpoint for doctor appointment types.
- **Path params:**
  - `doctorId` — Mongo ObjectId of the doctor profile.
- **Validation:**
  - `doctorId` must be a valid Mongo ObjectId.
- **Behavior:**
  - returns non-deleted appointment types for the doctor
  - active types are sorted first, then newest first
  - soft-deleted types are excluded
- **Response:** `200 OK`

  ```json
  {
    "messageKey": "success.ok",
    "message": "Request completed successfully.",
    "appointmentTypes": [
      {
        "_id": "65f0c4f6e6a0d0d0d0d0d201",
        "doctor": "65f0c4f6e6a0d0d0d0d0d101",
        "name": "Initial Consultation",
        "price": 500,
        "isPriceVisibleToPatient": true,
        "isActive": true,
        "deletedAt": null,
        "createdAt": "2026-04-08T09:00:00.000Z",
        "updatedAt": "2026-04-08T09:00:00.000Z"
      }
    ]
  }
  ```

- **Errors:**
  - `400 Bad Request` — `errors.validation.invalidId`
  - `403 Forbidden` — `errors.auth.insufficientPermissions`
  - `403 Forbidden` — `errors.secretary.notAssignedToDoctor`
  - `404 Not Found` — `errors.doctorProfile.notFound`

### `POST /doctors/:doctorId/appointment-types`

- **Role:** `doctor`
- **Auth/scope:** doctor owner only. The service re-validates ownership; it does not trust `doctorId` from params alone.
- **Path params:**
  - `doctorId` — Mongo ObjectId of the doctor profile.
- **Body:**

  ```json
  {
    "name": "Initial Consultation",
    "price": 500,
    "isPriceVisibleToPatient": true,
    "isActive": true
  }
  ```

- **Validation:**
  - `doctorId` must be a valid Mongo ObjectId
  - `name` is required, trimmed, non-empty, max `120`
  - `price` is optional, nullable, and must be `>= 0` when provided
  - `isPriceVisibleToPatient` is optional boolean
  - `isActive` is optional boolean
- **Rules:**
  - `name` is normalized to lowercase `normalizedName` for uniqueness
  - duplicate active/non-deleted names for the same doctor are rejected
  - `null` / omitted `price` means “no price”
- **Response:** `201 Created`

  ```json
  {
    "messageKey": "success.appointmentType.created",
    "message": "Appointment type created successfully.",
    "appointmentType": {
      "_id": "65f0c4f6e6a0d0d0d0d0d201",
      "doctor": "65f0c4f6e6a0d0d0d0d0d101",
      "name": "Initial Consultation",
      "price": 500,
      "isPriceVisibleToPatient": true,
      "isActive": true,
      "deletedAt": null,
      "createdAt": "2026-04-08T09:00:00.000Z",
      "updatedAt": "2026-04-08T09:00:00.000Z"
    }
  }
  ```

- **Errors:**
  - `400 Bad Request` — `errors.validation.required`
  - `400 Bad Request` — `errors.validation.invalidId`
  - `400 Bad Request` — `errors.validation.lengthRange`
  - `400 Bad Request` — `errors.validation.minValue`
  - `403 Forbidden` — `errors.auth.insufficientPermissions`
  - `403 Forbidden` — `errors.doctor.notApproved`
  - `404 Not Found` — `errors.doctorProfile.notFound`
  - `409 Conflict` — `errors.appointmentType.nameExists`

### `GET /doctors/:doctorId/appointment-types/:appointmentTypeId`

- **Roles:** `doctor`, `secretary`, `admin`
- **Auth/scope:** doctor owner, admin, or assigned secretary with `appointments:view`.
- **Path params:**
  - `doctorId`
  - `appointmentTypeId`
- **Validation:**
  - both params must be valid Mongo ObjectIds
- **Response:** `200 OK`

  ```json
  {
    "messageKey": "success.ok",
    "message": "Request completed successfully.",
    "appointmentType": {
      "_id": "65f0c4f6e6a0d0d0d0d0d201",
      "doctor": "65f0c4f6e6a0d0d0d0d0d101",
      "name": "Initial Consultation",
      "price": 500,
      "isPriceVisibleToPatient": true,
      "isActive": true,
      "deletedAt": null,
      "createdAt": "2026-04-08T09:00:00.000Z",
      "updatedAt": "2026-04-08T09:00:00.000Z"
    }
  }
  ```

- **Errors:**
  - `400 Bad Request` — `errors.validation.invalidId`
  - `400 Bad Request` — `errors.appointmentType.doctorMismatch`
  - `403 Forbidden` — `errors.auth.insufficientPermissions`
  - `403 Forbidden` — `errors.secretary.notAssignedToDoctor`
  - `404 Not Found` — `errors.appointmentType.notFound`

### `PUT /doctors/:doctorId/appointment-types/:appointmentTypeId`

- **Role:** `doctor`
- **Auth/scope:** doctor owner only.
- **Path params:**
  - `doctorId`
  - `appointmentTypeId`
- **Body:** partial update; any subset of the create body fields may be sent.

  ```json
  {
    "name": "Initial Consultation (Extended)",
    "price": 650,
    "isPriceVisibleToPatient": false,
    "isActive": true
  }
  ```

- **Validation:**
  - params must be valid Mongo ObjectIds
  - if `name` is provided, it must be trimmed, non-empty, max `120`
  - if `price` is provided, it must be nullable or `>= 0`
  - booleans must be valid booleans
- **Response:** `200 OK`

  ```json
  {
    "messageKey": "success.appointmentType.updated",
    "message": "Appointment type updated successfully.",
    "appointmentType": {
      "_id": "65f0c4f6e6a0d0d0d0d0d201",
      "doctor": "65f0c4f6e6a0d0d0d0d0d101",
      "name": "Initial Consultation (Extended)",
      "price": 650,
      "isPriceVisibleToPatient": false,
      "isActive": true,
      "deletedAt": null,
      "createdAt": "2026-04-08T09:00:00.000Z",
      "updatedAt": "2026-04-08T09:05:00.000Z"
    }
  }
  ```

- **Errors:**
  - `400 Bad Request` — validation errors for ids/length/booleans/min value
  - `400 Bad Request` — `errors.appointmentType.doctorMismatch`
  - `403 Forbidden` — `errors.auth.insufficientPermissions`
  - `404 Not Found` — `errors.appointmentType.notFound`
  - `409 Conflict` — `errors.appointmentType.nameExists`

### `DELETE /doctors/:doctorId/appointment-types/:appointmentTypeId`

- **Role:** `doctor`
- **Auth/scope:** doctor owner only.
- **Behavior:** soft delete only. The record is not hard-deleted; `deletedAt` is set and `isActive` becomes `false`.
- **Path params:**
  - `doctorId`
  - `appointmentTypeId`
- **Response:** `200 OK`

  ```json
  {
    "messageKey": "success.appointmentType.deleted",
    "message": "Appointment type deleted successfully.",
    "appointmentTypeId": "65f0c4f6e6a0d0d0d0d0d201"
  }
  ```

- **Errors:**
  - `400 Bad Request` — `errors.validation.invalidId`
  - `400 Bad Request` — `errors.appointmentType.doctorMismatch`
  - `403 Forbidden` — `errors.auth.insufficientPermissions`
  - `404 Not Found` — `errors.appointmentType.notFound`

### `PATCH /doctors/:doctorId/appointment-types/:appointmentTypeId/toggle-status`

- **Role:** `doctor`
- **Auth/scope:** doctor owner only.
- **Path params:**
  - `doctorId`
  - `appointmentTypeId`
- **Body:**

  ```json
  {
    "isActive": false
  }
  ```

- **Validation:**
  - params must be valid Mongo ObjectIds
  - `isActive` is required and must be a boolean
- **Response:** `200 OK`

  ```json
  {
    "messageKey": "success.appointmentType.statusUpdated",
    "message": "Appointment type status updated successfully.",
    "appointmentTypeId": "65f0c4f6e6a0d0d0d0d0d201",
    "isActive": false
  }
  ```

- **Errors:**
  - `400 Bad Request` — `errors.validation.invalidId`
  - `400 Bad Request` — `errors.validation.required`
  - `400 Bad Request` — `errors.validation.invalidBoolean`
  - `400 Bad Request` — `errors.appointmentType.doctorMismatch`
  - `403 Forbidden` — `errors.auth.insufficientPermissions`
  - `404 Not Found` — `errors.appointmentType.notFound`

### `POST /appointments/book`

- **Roles:** `patient`, `secretary`, `doctor`
- **Required fields:** `doctorId`, `date` (`YYYY-MM-DD`), `startTime` (`HH:MM`). `patientId` is required when booking as a doctor or secretary and ignored for patients (derived from the logged-in patient profile).
- **Optional fields:** `appointmentTypeId`, `notes`
- **Rules:** Requested slot must exist in doctor schedule and must be in the future (past same-day times are rejected).
- **Appointment type rules:**
  - `appointmentTypeId` is optional for backward compatibility
  - when provided, it must belong to the same doctor, be active, and not be soft-deleted
  - booking stores immutable snapshot fields on the appointment (`appointmentType`, `appointmentTypeNameSnapshot`, `priceSnapshot`, `priceVisibleToPatientSnapshot`)
  - if omitted, the appointment is still created and all appointment-type snapshot fields remain `null`
- **Body (secretary/doctor booking on behalf of a patient):**

  ```json
  {
    "doctorId": "64f...doctor",
    "patientId": "64f...patientProfile",
    "date": "2025-11-25",
    "startTime": "10:00",
    "appointmentTypeId": "65f0c4f6e6a0d0d0d0d0d201",
    "notes": "Follow up consultation"
  }
  ```

- **Body (patient self-booking — patientId omitted):**

  ```json
  {
    "doctorId": "64f...doctor",
    "date": "2025-11-25",
    "startTime": "10:00",
    "appointmentTypeId": "65f0c4f6e6a0d0d0d0d0d201",
    "notes": "Follow up consultation"
  }
  ```

- **Response:**

  ```json
  {
    "message": "Appointment booked successfully.",
    "appointment": {
      "_id": "64f...",
      "doctor": {
        "_id": "64f...doctor",
        "userId": {
          "_id": "64f...doctorUser",
          "fullName": "Dr. Mona"
        }
      },
      "patient": {
        "_id": "64f...patientProfile",
        "userId": {
          "_id": "64f...patientUser",
          "fullName": "Sara Patient"
        }
      },
      "date": "2025-11-25T00:00:00.000Z",
      "startTime": "10:00",
      "endTime": "10:30",
      "status": "scheduled",
      "notes": "",
      "appointmentType": "65f0c4f6e6a0d0d0d0d0d201",
      "appointmentTypeNameSnapshot": "Initial Consultation",
      "priceSnapshot": 500,
      "createdBy": "userId",
      "createdByRole": "patient"
    }
  }
  ```

- **Payload note:** booking returns a compact appointment payload. `doctor` and `patient` are summary objects (for display names/public id), not full profile documents.
- **Snapshot note:** Appointment history uses the stored snapshot fields shown above. The response never rehydrates historical name/price from the live appointment type record.
- **Price visibility note:** patient-facing responses omit `priceSnapshot` when the selected type has no price or its price is hidden. Internal viewers may also receive `priceVisibleToPatientSnapshot`.
- **Linking side effect:** after the appointment is created, booking idempotently links the doctor and patient with atomic `$addToSet` updates. The doctor receives the patient in `patients` and appointment in `appointments`; the patient receives the doctor in `visitedDoctors` and appointment in `appointments`.
- **Frontend note:** `appointmentTypeId` is optional for backward compatibility. New booking UIs can omit it when the doctor has no selectable types or when the flow is intentionally free-form.

- **Error (slot taken)** `409 Conflict``{ "message": "This slot is already booked." }`
- **Error (past slot)** `400 Bad Request``{ "message": "Cannot book an appointment in the past." }`
- **Error (missing/invalid patientId when required)** `400 Bad Request``{ "message": "Invalid patientId: must be Patient._id" }`
- **Error (invalid time format)** `400 Bad Request``{ "message": "Invalid startTime: 10-00. Expected HH:MM" }`
- **Error (invalid appointment type id)** `400 Bad Request``{ "messageKey": "errors.appointmentType.invalid" }`
- **Error (appointment type belongs to another doctor)** `400 Bad Request``{ "messageKey": "errors.appointmentType.doctorMismatch" }`
- **Error (appointment type inactive)** `400 Bad Request``{ "messageKey": "errors.appointmentType.inactive" }`
- **Error (appointment type not found/deleted)** `404 Not Found``{ "messageKey": "errors.appointmentType.notFound" }`
- **Example (patient self-booking)**

  ```bash
  curl -X POST "http://localhost:5000/api/appointments/book" \
    -H "x-lang: en" \
    -H "Authorization: Bearer <token>" \
    -H "Content-Type: application/json" \
    -d '{
      "doctorId": "64f...doctor",
      "date": "2025-11-25",
      "startTime": "10:00",
      "appointmentTypeId": "65f0c4f6e6a0d0d0d0d0d201",
      "notes": "Follow up consultation"
    }'
  ```

### `GET /appointments`

- **Roles:** `admin`, `doctor`, `secretary`, `patient`
- **Query parameters:**

| Name       | Type                         | Notes                                                           |
| ---------- | ---------------------------- | --------------------------------------------------------------- |
| `page`     | number (default 1)           | 1-indexed                                                       |
| `limit`    | number (default 10, max 100) |                                                                 |
| `status`   | enum                         | `scheduled`, `rescheduled`, `completed`, `cancelled`, `no-show` |
| `date`     | string (`YYYY-MM-DD`)        | Filters appointments within the day                             |
| `dateFrom` | string (`YYYY-MM-DD`)        | Inclusive local-day range start; cannot be combined with `date` |
| `dateTo`   | string (`YYYY-MM-DD`)        | Inclusive local-day range end; cannot be combined with `date`   |

- **Role behavior:** `admin` sees all; `doctor` sees only their own (must be approved); `patient` sees only their own; `secretary` needs `appointments:view` permission and is limited to their assigned doctor.
- **Date filtering:** use `date` for a single local day or `dateFrom`/`dateTo` for a range. `dateTo` includes the whole local day. If both range bounds are sent, `dateFrom` must be on or before `dateTo`.
- **Doctor booking visibility:** appointments booked by patients are visible to the assigned doctor because doctor appointment lists are scoped from `Appointment.doctor`, independent of the legacy doctor appointment array.
- **Response:**

  ```json
  {
    "page": 1,
    "limit": 10,
    "total": 3,
    "results": 3,
    "appointments": [
      {
        "_id": "64f...",
        "doctor": {
          "_id": "...",
          "specialization": "Cardiology",
          "userId": { "_id": "...", "fullName": "Dr. Mona" }
        },
        "patient": {
          "_id": "...",
          "publicId": "PAT-000123",
          "userId": { "_id": "...", "fullName": "Sara Patient" }
        },
        "status": "scheduled",
        "startTime": "10:00",
        "startDateTime": "2025-11-25T08:00:00.000Z",
        "appointmentType": "65f0c4f6e6a0d0d0d0d0d201",
        "appointmentTypeNameSnapshot": "Initial Consultation",
        "priceSnapshot": 500,
        "encounter": {
          "_id": "65f0c4f6e6a0d0d0d0d0d301",
          "status": "open",
          "origin": "appointment",
          "startedAt": "2025-11-25T08:05:00.000Z",
          "closedAt": null
        }
      }
    ]
  }
  ```

- **Doctor fields:** response returns a minimized doctor summary (`_id`, `specialization`, `userId.fullName`).
- **Patient fields (admin/doctor/secretary roles):** includes patient `publicId` and populated `patient.userId.fullName`.
- **Patient fields (patient role):** patient name is not nested-populated by default.
- **Appointment type fields:** appointment objects may include `appointmentType`, `appointmentTypeNameSnapshot`, and patient-safe `priceSnapshot`. Internal viewers may also receive `priceVisibleToPatientSnapshot`.
- **Encounter field:** every appointment includes `encounter`. It is `null` when no encounter is linked, otherwise it contains only `_id`, `status`, `origin`, `startedAt`, and `closedAt`. Encounter clinical `notes` are not returned by appointment list responses.
- **Snapshot rule:** list responses show the stored appointment snapshot values, not the live appointment type record.
- **Frontend note:** This list endpoint is best for tables and card feeds. Use `GET /api/appointments/:appointmentId` when the screen needs the richer `files` array or a detail refresh after mutation.
- **Error (no permission/ownership)** `403 Forbidden`

### `GET /appointments/me/overview`

- **Role:** `patient`
- **Description:** Returns appointment counters for the authenticated patient.
- **Response:**

  ```json
  {
    "counts": {
      "upcoming": 2,
      "completed": 5,
      "cancelled": 1,
      "noShow": 0
    },
    "closestUpcoming": {
      "_id": "64f...",
      "status": "scheduled",
      "date": "2025-11-25T00:00:00.000Z",
      "startTime": "10:00",
      "appointmentType": "65f0c4f6e6a0d0d0d0d0d201",
      "appointmentTypeNameSnapshot": "Initial Consultation",
      "priceSnapshot": 500,
      "doctor": {
        "_id": "64f...doctor",
        "specialization": "Cardiology",
        "userId": {
          "_id": "64f...doctorUser",
          "fullName": "Dr. Mona"
        }
      }
    },
    "lastCompleted": {
      "_id": "64f...",
      "status": "completed",
      "completedAt": "2025-11-20T09:00:00.000Z",
      "doctor": {
        "_id": "64f...doctor",
        "specialization": "Cardiology",
        "userId": {
          "_id": "64f...doctorUser",
          "fullName": "Dr. Mona"
        }
      }
    },
    "lastCancelled": {
      "_id": "64f...",
      "status": "cancelled",
      "cancelledAt": "2025-11-19T11:00:00.000Z",
      "doctor": {
        "_id": "64f...doctor",
        "specialization": "Cardiology",
        "userId": {
          "_id": "64f...doctorUser",
          "fullName": "Dr. Mona"
        }
      }
    },
    "lastNoShow": {
      "_id": "64f...",
      "status": "no-show",
      "noShowAt": "2025-11-18T13:00:00.000Z",
      "doctor": {
        "_id": "64f...doctor",
        "specialization": "Cardiology",
        "userId": {
          "_id": "64f...doctorUser",
          "fullName": "Dr. Mona"
        }
      }
    }
  }
  ```

- **Counting rules:**
  - `upcoming`: appointments in status `scheduled` or `rescheduled` that are upcoming by date/time.
  - `completed`: all appointments in status `completed`.
  - `cancelled`: all appointments in status `cancelled`.
  - `noShow`: all appointments in status `no-show`.
- **Latest appointment fields:**
  - `closestUpcoming`: nearest upcoming appointment in status `scheduled` or `rescheduled`.
  - `lastCompleted`: most recently completed appointment.
  - `lastCancelled`: most recently cancelled appointment.
  - `lastNoShow`: most recent no-show appointment.
  - Returned appointments include populated `doctor.specialization` and `doctor.userId.fullName`.
  - Appointment objects follow the same snapshot rules as `POST /appointments/book`: `appointmentType` and `appointmentTypeNameSnapshot` come from the stored appointment snapshot, and `priceSnapshot` is omitted from patient-facing payloads when hidden or null.
  - If no appointment exists for a field, value is `null`.

### `GET /api/appointments/:appointmentId`

- **Roles:** `admin`, `doctor`, `secretary`, `patient` (subject to ownership checks)
- **Role behavior:** patients may view only their own appointments; doctors must be approved and can only view their appointments; secretaries need `appointments:view` and must be assigned to the appointment’s doctor; admins have full access.
- **Response:**

  ```json
  {
    "messageKey": "success.ok",
    "message": "Request completed successfully.",
    "appointment": {
      "_id": "64f...",
      "doctor": {
        "_id": "...",
        "specialization": "Cardiology",
        "userId": { "_id": "...", "fullName": "Dr. Mona" }
      },
      "patient": {
        "_id": "...",
        "publicId": "PAT-000123",
        "userId": { "_id": "...", "fullName": "Sara Patient" }
      },
      "status": "scheduled",
      "notes": "Bring lab results",
      "appointmentType": "65f0c4f6e6a0d0d0d0d0d201",
      "appointmentTypeNameSnapshot": "Initial Consultation",
      "priceSnapshot": 500,
      "encounter": {
        "_id": "65f0c4f6e6a0d0d0d0d0d301",
        "status": "closed",
        "origin": "appointment",
        "startedAt": "2025-11-25T08:05:00.000Z",
        "closedAt": "2025-11-25T08:25:00.000Z"
      }
    },
    "files": [
      {
        "_id": "65f0c4f6e6a0d0d0d0d0d0a1",
        "id": "65f0c4f6e6a0d0d0d0d0d0a1",
        "appointmentLinkId": "65f0c5a8e6a0d0d0d0d0d0a9",
        "appointmentId": "64f...",
        "patientId": "...",
        "originalName": "report.pdf",
        "mimeType": "application/pdf",
        "sizeBytes": 12345,
        "linkedAt": "2026-04-01T10:00:00.000Z",
        "linkedByRole": "patient",
        "linkedByUserId": "65f0c4f6e6a0d0d0d0d0d0c1",
        "isArchived": false
      }
    ]
  }
  ```

- **Doctor fields:** response returns a minimized doctor summary (`_id`, `specialization`, `userId.fullName`).
- **Patient fields (doctor/secretary roles):** includes patient `publicId` and populated `patient.userId.fullName`.
- **Patient fields (patient/admin roles):** patient name is not nested-populated by default.
- **Appointment type fields:** `appointmentType` and `appointmentTypeNameSnapshot` come from the stored appointment snapshot. `priceSnapshot` is only returned to patient-facing viewers when visible and non-null; internal viewers may also receive `priceVisibleToPatientSnapshot`.
- **Encounter field:** `appointment.encounter` is `null` when no encounter is linked. When present, it is a compact navigation summary with `_id`, `status`, `origin`, `startedAt`, and `closedAt` only; encounter `notes` are intentionally omitted.
- **Files field:** `files` contains active `PatientFile` records linked to the appointment through the dedicated appointment-file link collection.
- **Error (not found)** `404 Not Found`
  `{ "message": "Appointment not found." }`

### `POST /api/appointments/:appointmentId/files`

- **Roles:** `admin`, `doctor`, `secretary`, `patient`
- **Auth behavior:** appointment-scoped authorization is used. Patients may upload only to their own appointments. Doctors must be approved and assigned to the appointment. Secretaries must be assigned to the appointment’s doctor and have `appointments:edit`.
- **Body:** `multipart/form-data`
  - `file` (required, single file)
  - `note` (optional string)
  - `tags` (optional comma-separated string or JSON array string)
- **Description:** Upload a new file to storage, create a canonical `PatientFile`, and link it to the appointment.
- **Response:** `201 Created`

  ```json
  {
    "messageKey": "success.ok",
    "message": "Request completed successfully.",
    "file": {
      "_id": "65f0c4f6e6a0d0d0d0d0d0a1",
      "id": "65f0c4f6e6a0d0d0d0d0d0a1",
      "appointmentLinkId": "65f0c5a8e6a0d0d0d0d0d0a9",
      "appointmentId": "64f...",
      "patientId": "...",
      "originalName": "report.pdf",
      "mimeType": "application/pdf",
      "sizeBytes": 12345,
      "linkedAt": "2026-04-01T10:00:00.000Z",
      "linkedByRole": "patient",
      "linkedByUserId": "65f0c4f6e6a0d0d0d0d0d0c1",
      "isArchived": false
    }
  }
  ```

- **Frontend note:** Use this route when an attachment is specific to an appointment timeline. After success, re-fetch either `GET /api/appointments/:appointmentId` or `GET /api/appointments/:appointmentId/files` so the UI reflects the new linked file ids and metadata.

### `GET /api/appointments/:appointmentId/files`

- **Roles:** `admin`, `doctor`, `secretary`, `patient`
- **Auth behavior:** appointment detail authorization rules are used. Secretaries need `appointments:view`.
- **Description:** List active `PatientFile` records linked to the appointment.
- **Response:** `200 OK`

  ```json
  {
    "messageKey": "success.ok",
    "message": "Request completed successfully.",
    "items": [
      {
        "_id": "65f0c4f6e6a0d0d0d0d0d0a1",
        "id": "65f0c4f6e6a0d0d0d0d0d0a1",
        "appointmentLinkId": "65f0c5a8e6a0d0d0d0d0d0a9",
        "appointmentId": "64f...",
        "patientId": "...",
        "originalName": "report.pdf",
        "mimeType": "application/pdf",
        "sizeBytes": 12345,
        "linkedAt": "2026-04-01T10:00:00.000Z",
        "linkedByRole": "patient",
        "linkedByUserId": "65f0c4f6e6a0d0d0d0d0d0c1",
        "isArchived": false
      }
    ]
  }
  ```

- **Frontend note:** This is the lightweight attachment list for appointment detail screens. The parent appointment detail route also surfaces linked files, but this endpoint is cheaper when only the file drawer/table needs refreshing.

### `GET /api/appointments/:appointmentId/files/:fileId`

- **Roles:** `admin`, `doctor`, `secretary`, `patient`
- **Auth behavior:** appointment detail authorization rules are used. Secretaries need `appointments:view`.
- **Description:** Return one active appointment-linked file metadata record.
- **Response:** `200 OK`

  ```json
  {
    "messageKey": "success.ok",
    "message": "Request completed successfully.",
    "file": {
      "_id": "65f0c4f6e6a0d0d0d0d0d0a1",
      "id": "65f0c4f6e6a0d0d0d0d0d0a1",
      "appointmentLinkId": "65f0c5a8e6a0d0d0d0d0d0a9",
      "appointmentId": "64f...",
      "patientId": "...",
      "originalName": "report.pdf",
      "mimeType": "application/pdf",
      "sizeBytes": 12345,
      "linkedAt": "2026-04-01T10:00:00.000Z",
      "linkedByRole": "patient",
      "linkedByUserId": "65f0c4f6e6a0d0d0d0d0d0c1",
      "isArchived": false
    }
  }
  ```

- **Errors:** `404` if the file is not linked to the appointment or is archived.
- **Frontend note:** A `404` here can mean either the file id is wrong or the file was unlinked/archived after the list was loaded. Refresh the file list before showing a destructive error state.

### `GET /api/appointments/:appointmentId/files/:fileId/download`

- **Roles:** `admin`, `doctor`, `secretary`, `patient`
- **Auth behavior:** appointment detail authorization rules are used. Secretaries need `appointments:view`.
- **Query:** `mode=url|stream` (optional, defaults to `url`)
- **Description:** Return a presigned download URL or stream the file in appointment context.
- **Response (`mode=url`):**

  ```json
  {
    "messageKey": "success.files.downloadUrlGenerated",
    "message": "Download URL generated.",
    "fileId": "65f0c4f6e6a0d0d0d0d0d0a1",
    "fileName": "report.pdf",
    "fileType": null,
    "mimeType": "application/pdf",
    "extension": "pdf",
    "url": "https://signed.local/report",
    "downloadUrl": "https://signed.local/report",
    "expiresIn": 300
  }
  ```

- **Binary response note:** `mode=url` returns JSON and keeps the normal envelope. `mode=stream` returns raw file bytes and skips JSON parsing, just like patient-file downloads.
- **Stream headers:** binary responses include `Content-Disposition`, `Content-Type` when available, `X-File-Id`, `X-File-Name`, optional `X-File-Type`, and `X-File-Mime-Type`.
- **Frontend note:** Prefer `mode=url` for simple open/download flows. Use `mode=stream` only when the client must proxy the bytes through the API response.

### `DELETE /api/appointments/:appointmentId/files/:fileId`

- **Roles:** `admin`, `doctor`, `secretary`, `patient`
- **Auth behavior:** appointment-scoped authorization is used. Secretaries must have `appointments:edit`.
- **Description:** Unlink a file from the appointment only. This does not delete the physical storage object and does not delete the canonical `PatientFile`.
- **Response:** `200 OK`

  ```json
  {
    "messageKey": "success.ok",
    "message": "Request completed successfully.",
    "success": true
  }
  ```

- **Frontend note:** This only removes the appointment link. If the UI also has a patient-file library view, do not remove the canonical patient file from that broader list unless a separate patient-file delete call succeeds.

### `PATCH /appointments/:appointmentId/cancel`

- **Roles:** `patient` (own appointments), `doctor`, `secretary` (with permission)
- **Body:** `{ "reason": "Patient not feeling well" }`
- **Rules:** Only `scheduled` or `rescheduled` appointments can be cancelled; completed or no-show appointments return `400`; cannot cancel within 1 hour of the start time; doctors must be approved; patients/doctors can cancel only their own appointments; secretaries need `appointments:cancel` and must be assigned to the appointment’s doctor.
- **Response:**

  ```json
  {
    "message": "Appointment cancelled successfully.",
    "appointment": {
      "_id": "64f...",
      "status": "cancelled",
      "cancelledBy": "patient",
      "cancelReason": "Patient not feeling well",
      "cancelledAt": "2025-11-20T09:00:00.000Z"
    }
  }
  ```

- **Error (within 1 hour)** `400 Bad Request``{ "message": "Cannot cancel appointment within 1 hour of start time." }`
- **Error (completed or no-show)** `400 Bad Request``{ "message": "Completed appointments cannot be cancelled." }`
- **Error (not assigned/permission)** `403 Forbidden`
  `{ "message": "You are not assigned to this doctor and cannot cancel this appointment." }`

### `PATCH /appointments/:appointmentId/reschedule`

- **Roles:** `patient` (own appointments), `doctor`, `secretary` (with `appointments:edit`)
- **Body:** `{ "date": "2025-11-26", "startTime": "11:00", "appointmentTypeId": "65f0c4f6e6a0d0d0d0d0d202", "reason": "Conflict with prior slot" }`
- **Rules:** Only `scheduled` or `rescheduled` appointments can be moved; completed/cancelled/no-show appointments cannot be rescheduled. New slot must be valid in doctor schedule, in the future, and conflict-free. Rescheduling is blocked within 1 hour of the current appointment start. Secretaries must be assigned to the appointment doctor and hold `appointments:edit`.
- **Appointment type rules:**
  - `appointmentTypeId` is optional
  - if omitted, the current appointment type snapshot is preserved unchanged
  - if provided, it must belong to the same doctor, be active, and not be soft-deleted
  - when provided, the appointment snapshot fields are replaced with the current values from the selected type
  - explicit clearing of an existing appointment type is not supported in this iteration
- **Behavior:** Existing appointment is updated in place (`date`, `startTime`, `endTime`) and `status` becomes `rescheduled`.
- **Response:** `{"message":"Appointment rescheduled.","appointment":{...}}`
- **Snapshot note:** historical appointment rendering after reschedule still uses the stored snapshot fields on the appointment, not live appointment-type data.
- **Error (slot taken)** `409 Conflict``{ "message": "Appointment slot is already booked." }`
- **Error (too late)** `403 Forbidden``{ "message": "Appointment is too close to reschedule." }`
- **Error (permission)** `403 Forbidden``{ "message": "You do not have permission to reschedule appointments." }`
- **Error (invalid appointment type id)** `400 Bad Request``{ "messageKey": "errors.appointmentType.invalid" }`
- **Error (appointment type belongs to another doctor)** `400 Bad Request``{ "messageKey": "errors.appointmentType.doctorMismatch" }`
- **Error (appointment type inactive)** `400 Bad Request``{ "messageKey": "errors.appointmentType.inactive" }`
- **Error (appointment type not found/deleted)** `404 Not Found``{ "messageKey": "errors.appointmentType.notFound" }`

### `PATCH /appointments/:appointmentId/complete`

- **Role:** `doctor`
- **Body:** `{ "notes": "Consultation completed, prescribe vitamin D" }`
- **Rules:** Only the assigned, approved doctor can mark an appointment as completed. Appointment must be in status `scheduled` or `rescheduled` and already started (not cancelled, no-show, or in the future). A `403` is returned only when the appointment belongs to a different doctor; if the same doctor tries before start time, the response is `400`.
- **Response:** `{"message":"Appointment marked as completed.","appointment":{...}}`
- **Error (not active)** `400 Bad Request``{ "message": "Only scheduled or rescheduled appointments can be completed. Current status: cancelled." }`
- **Error (future appointment)** `400 Bad Request``{ "message": "Future appointments cannot be completed." }`
- **Error (different doctor)** `403 Forbidden``{ "message": "You cannot complete appointments for other doctors." }`
- **Example**

  ```bash
  curl -X PATCH "http://localhost:5000/api/appointments/64f.../complete" \
    -H "x-lang: en" \
    -H "Authorization: Bearer <token>" \
    -H "Content-Type: application/json" \
    -d '{ "notes": "Consultation completed, prescribe vitamin D" }'
  ```

### `PATCH /appointments/:appointmentId/no-show`

- **Role:** `doctor`
- **Body:** `{ "reason": "Patient did not attend" }`
- **Rules:** Only the assigned, approved doctor can mark an appointment as no-show. Appointment must be `scheduled` or `rescheduled`, must have started, and cannot already be cancelled/completed/no-show. A `403` is returned only when the appointment belongs to a different doctor; if the same doctor tries before start time, the response is `400`.
- **Response:** `{"message":"Appointment marked as no-show.","appointment":{...}}`
- **Error (not active)** `400 Bad Request``{ "message": "Only scheduled or rescheduled appointments can be marked as no-show. Current status: completed." }`
- **Error (already completed)** `400 Bad Request``{ "message": "Completed appointments cannot be marked as no-show." }`
- **Error (future appointment)** `400 Bad Request``{ "message": "Future appointments cannot be marked no-show." }`
- **Error (different doctor)** `403 Forbidden``{ "message": "You cannot modify appointments for other doctors." }`
- **Mutation payload note:** `appointment` in `book`, `cancel`, `reschedule`, `complete`, and `no-show` responses uses the same compact shape (summary `doctor`/`patient`) and includes status-specific metadata when relevant (`cancelledAt`, `cancelledBy`, `cancelReason`, `rescheduledAt`, `rescheduledBy`, `rescheduleReason`, `completedAt`, `noShowAt`) plus appointment-type snapshot fields when present (`appointmentType`, `appointmentTypeNameSnapshot`, patient-safe `priceSnapshot`, and internal-only `priceVisibleToPatientSnapshot`).
- **Example**

  ```bash
  curl -X PATCH "http://localhost:5000/api/appointments/64f.../no-show" \
    -H "x-lang: en" \
    -H "Authorization: Bearer <token>" \
    -H "Content-Type: application/json" \
    -d '{ "reason": "Patient did not attend" }'
  ```

### Appointment notifications

- **Delivery:** best-effort; notification failures do not affect API responses.
- **Scheduled/cancelled:** notify all parties except the actor.
  - Patient action → doctor + assigned secretaries.
  - Doctor action → patient + assigned secretaries.
  - Secretary action → doctor + patient.
- **Rescheduled:** notify all parties except the actor (same fanout rules as above).
- **Completed (doctor only):** patient + assigned secretaries.
- **No-show (doctor only):** patient + assigned secretaries.
- **No-show (auto job):** doctor + patient + assigned secretaries.
- **Reminders:** patient only (start of day + about 1 hour before appointment start; job runs every 15 minutes) for `scheduled` and `rescheduled` appointments.

---

## 5. Consultation Service

Base path: `/api/consultations`

### Consultation lifecycle

- Status values: `pending`, `active`, `closed`, `dismissed`.
- New tickets start as `pending`.
- When a doctor sends the first message on a `pending` ticket, status becomes `active`.
- `closed` and `dismissed` are terminal for API actions:
  - cannot send more messages,
  - cannot mark-read,
  - cannot change status again.
- `dismissed` is doctor-only and requires a reason.
- There is currently no reopen endpoint/flow.

### `POST /consultations`

- **Role:** `patient`
- **Guards:** authenticated patient + active patient account + patient profile loaded.
- **Body:**

  ```json
  {
    "doctorId": "64f...doctor",
    "subject": "Need follow-up",
    "description": "Persistent symptoms for 3 days",
    "attachments": ["patient-files/patient/<userId>/labs.pdf"]
  }
  ```

- **Body rules:**
  - `doctorId` required and must be a valid ObjectId.
  - `subject` required.
  - `description` required.
  - `attachments[]` optional; each value must be a string.
- **Business rules:**
  - Doctor must exist and be approved.
  - Doctor user account must not be in deletion states (`requested` or `deleted`).
  - Ticket is created with status `pending`.
  - Doctor activity metric `consultations` is incremented.
  - A notification is sent to the doctor (`type=consultation_created`).
  - Audit event written: `DATA_CONSULTATION_TICKET_CREATED`.
- **Response:** `201 Created` with `{ "ticket": { ... } }` (+ standard `messageKey`/`message`).
  Ticket-level `attachments` remains the legacy raw ref array. The response also includes `attachmentFiles` with best-effort display metadata resolved from modern `PatientFile` records or legacy `patient.files`.
  To download a consultation attachment, use `GET /api/patients/:patientId/files/:fileId/download?mode=url|stream` with the corresponding `attachmentFiles[].fileId` when present. If only a raw storage ref is available, URL-encode the raw `attachments[]` value as `:fileId`, or use `GET /api/patients/:patientId/files/download?ref=<encodedRef>&mode=url|stream` for slash-containing refs; the download response exposes file id/name metadata when the ref resolves.

  ```json
  {
    "ticket": {
      "...": "full ticket object",
      "attachments": ["patient-files/patient/<userId>/labs.pdf"],
      "attachmentFiles": [
        {
          "ref": "patient-files/patient/<userId>/labs.pdf",
          "fileId": "65f0c4f6e6a0d0d0d0d0d701",
          "fileName": "labs.pdf",
          "fileType": null,
          "mimeType": "application/pdf",
          "extension": "pdf"
        }
      ]
    }
  }
  ```

- **Common errors:**
  - `422` validation failed.
  - `403` patient profile missing or patient account blocked.
  - `404` doctor not found or not approved.

### `GET /consultations`

- **Roles:** `patient`, `doctor`
- **Guards:** authenticated user; doctor/patient model loaded; patient account guard applies to patients.
- **Query:** optional `status` (`pending|active|closed|dismissed`).
- **Business rules:**
  - Patient sees only own tickets.
  - Doctor sees only own tickets (doctor must be approved).
  - Ordered by `updatedAt` descending.
- **Response:** `{ "tickets": [...], "counts": { ... } }`, where each ticket item includes:
  - `_id`, `doctor`, `patient`, `subject`, `status`
  - `closedReason`, `cancellationReason`
  - `doctorSummary`:
    - `_id`
    - `fullName`
    - `specialization`
  - `patientSummary`:
    - `_id`
    - `publicId`
    - `userId._id`
    - `userId.fullName`
  - `lastMessageAt`, `lastMessageBy`, `messageCount`
  - `unreadForDoctor`, `unreadForPatient`
  - `createdAt`, `updatedAt`
- **Count fields:**
  - `total`: all accessible tickets for the caller.
  - `open`: `pending + active`.
  - `pending`, `active`, `closed`, `dismissed`: exact lifecycle status counts.
  - Counts are computed on the caller-scoped ticket set and are **not** narrowed by the optional `status` query, so clients can keep tab/badge totals while fetching a filtered list.
- **Data minimization:** `description`, ticket-level `attachments`, and `attachmentFiles` are intentionally excluded from list responses.
- **Common errors:**
  - `422` invalid `status`.
  - `403` doctor not approved.

### `GET /consultations/:ticketId`

- **Roles:** `patient`, `doctor` (owner only)
- **Guards:** ownership guard loads ticket and enforces patient/doctor ownership.
- **Params:** `ticketId` must be a valid ObjectId.
- **Business rules:**
  - Returns full ticket + its messages sorted ascending by `createdAt`.
  - Ticket includes:
    - `doctorSummary` (`_id`, `fullName`, `specialization`)
    - `patientSummary` (`_id`, `publicId`, `userId._id`, `userId.fullName`)
    - `closedReason` + `cancellationReason`
    - `review` when present (`rating`, `comment`, `createdAt`, `updatedAt`)
    - `attachments` as the legacy raw ref array
    - `attachmentFiles` as enriched metadata for those refs
  - Each message also keeps `attachments` as raw refs and includes parallel `attachmentFiles` metadata.
  - To download an attachment, use the canonical patient-file download route with `attachmentFiles[].fileId` or a URL-encoded raw `attachments[]` ref.
  - For non-patient viewers (doctor), PHI access audit is written: `PHI_OPEN_CONSULTATION_TICKET`.
- **Response:** `200 OK`

  ```json
  {
    "ticket": {
      "...": "full ticket object",
      "attachments": ["patient-files/patient/<userId>/labs.pdf"],
      "attachmentFiles": [
        {
          "ref": "patient-files/patient/<userId>/labs.pdf",
          "fileId": "65f0c4f6e6a0d0d0d0d0d701",
          "fileName": "labs.pdf",
          "fileType": null,
          "mimeType": "application/pdf",
          "extension": "pdf"
        }
      ]
    },
    "messages": [
      {
        "...": "message object",
        "attachments": ["patient-files/patient/<userId>/new-result.pdf"],
        "attachmentFiles": [
          {
            "ref": "patient-files/patient/<userId>/new-result.pdf",
            "fileId": "65f0c4f6e6a0d0d0d0d0d702",
            "fileName": "new-result.pdf",
            "fileType": null,
            "mimeType": "application/pdf",
            "extension": "pdf"
          }
        ]
      }
    ]
  }
  ```

- **Common errors:**
  - `422` invalid `ticketId`.
  - `404` ticket not found.
  - `403` ownership denied / doctor not approved / profile missing.

### `POST /consultations/:ticketId/messages`

- **Roles:** `patient`, `doctor` (owner only)
- **Params:** `ticketId` must be a valid ObjectId.
- **Body:**

  ```json
  {
    "content": "Please review these results",
    "attachments": ["patient-files/patient/<userId>/new-result.pdf"]
  }
  ```

- **Body rules:**
  - `content` required.
  - `attachments[]` optional strings.
- **Business rules:**
  - Not allowed on `closed` or `dismissed` tickets.
  - Creates a message with `sender` inferred from role.
  - Updates ticket:
    - `lastMessageAt`, `lastMessageBy`, `messageCount`.
    - doctor sender: `unreadForPatient += 1`, `unreadForDoctor = 0`; `pending -> active`.
    - patient sender: `unreadForDoctor += 1`, `unreadForPatient = 0`.
  - Sends notification to the opposite side (`type=consultation_message`) with optional preview.
  - Audit event written: `DATA_CONSULTATION_MESSAGE_SENT`.
- **Response:** `201 Created` with `{ "message": { ... }, "ticket": { ... } }`.
  The new message keeps `attachments` as raw refs and includes `attachmentFiles` with resolved metadata. The returned ticket also includes `attachmentFiles` for ticket-level attachments.
  Use the canonical patient-file download route with `attachmentFiles[].fileId` or a URL-encoded raw `attachments[]` ref to get the actual file bytes or signed URL plus download metadata.

  ```json
  {
    "message": {
      "...": "message object",
      "attachments": ["patient-files/patient/<userId>/new-result.pdf"],
      "attachmentFiles": [
        {
          "ref": "patient-files/patient/<userId>/new-result.pdf",
          "fileId": "65f0c4f6e6a0d0d0d0d0d702",
          "fileName": "new-result.pdf",
          "fileType": null,
          "mimeType": "application/pdf",
          "extension": "pdf"
        }
      ]
    },
    "ticket": { "...": "full ticket object" }
  }
  ```

- **Common errors:**
  - `400` ticket is closed/dismissed.
  - `422` validation errors.
  - `403` ownership/approval/account guard errors.

### `PATCH /consultations/:ticketId/status`

- **Roles:** `patient`, `doctor` (owner only)
- **Params:** `ticketId` must be a valid ObjectId.
- **Body:**

  ```json
  { "status": "closed" }
  ```

  ```json
  { "status": "dismissed", "reason": "Not suitable for online consultation" }
  ```

- **Body rules:**
  - `status` required and must be `closed` or `dismissed`.
  - `reason` required when `status=dismissed`.
- **Business rules:**
  - `dismissed` is doctor-only.
  - Status update blocked if ticket already `closed` or `dismissed`.
  - Sets `closedBy` to actor role and sets `closedReason` if provided.
  - Closed/dismissed ticket responses also expose `cancellationReason` as a clear alias for `closedReason`.
  - Resets both unread counters to `0`.
  - Sends status notification to opposite side (`type=consultation_status`).
  - Audit event written: `DATA_CONSULTATION_STATUS_UPDATED`.
- **Response:** `200 OK` with `{ "ticket": { ... } }`.
- **Common errors:**
  - `400` already closed/dismissed.
  - `400` dismissal reason missing.
  - `403` non-doctor attempting dismiss.
  - `422` validation errors.

### `POST /consultations/:ticketId/mark-read`

- **Roles:** `patient`, `doctor` (owner only)
- **Params:** `ticketId` must be a valid ObjectId.
- **Business rules:**
  - Not allowed for `closed` or `dismissed` tickets.
  - Doctor call sets `unreadForDoctor = 0`.
  - Patient call sets `unreadForPatient = 0`.
- **Response:** `200 OK` with `{ "ticket": { ... } }`.
- **Common errors:**
  - `400` ticket closed/dismissed.
  - `422` invalid `ticketId`.
  - `403` ownership/approval/account guard errors.

### `POST /consultations/:ticketId/review`

- **Roles:** ticket owner; only the patient owner can successfully submit.
- **Params:** `ticketId` must be a valid ObjectId.
- **Body:**

  ```json
  { "rating": 5, "comment": "Clear advice and fast response" }
  ```

- **Body rules:**
  - `rating` required, numeric, range `1..5`.
  - `comment` optional string, max length `1000`.
- **Business rules:**
  - Ownership guard applies before submission.
  - Only patient-owned tickets can be reviewed.
  - Review is allowed only when ticket status is exactly `closed`.
  - `dismissed` tickets cannot be reviewed.
  - One review per consultation ticket; duplicate submissions are rejected.
  - Review is stored on the ticket and returned in the updated ticket payload.
  - Audit event written: `DATA_CONSULTATION_REVIEW_CREATED`.
- **Response:** `201 Created`

  ```json
  {
    "messageKey": "success.consultation.reviewSubmitted",
    "review": {
      "rating": 5,
      "comment": "Clear advice and fast response",
      "createdAt": "2026-04-05T12:00:00.000Z",
      "updatedAt": "2026-04-05T12:00:00.000Z"
    },
    "ticket": {
      "_id": "64f...",
      "status": "closed",
      "closedReason": "follow_up_completed",
      "cancellationReason": "follow_up_completed",
      "doctorSummary": {
        "_id": "64f...doctor",
        "fullName": "Dr. Mona",
        "specialization": "Cardiology"
      },
      "review": {
        "rating": 5,
        "comment": "Clear advice and fast response",
        "createdAt": "2026-04-05T12:00:00.000Z",
        "updatedAt": "2026-04-05T12:00:00.000Z"
      }
    }
  }
  ```

- **Common errors:**
  - `400` consultation is not closed.
  - `403` only patients can review / ownership denied.
  - `409` review already submitted for this consultation.
  - `422` validation errors.

### Consultation notifications

- Delivery is best-effort (notification failures do not fail the consultation API call).
- Trigger points:
  - Ticket created -> doctor receives `consultation_created`.
  - New message -> opposite side receives `consultation_message`.
  - Status updated (`closed`/`dismissed`) -> opposite side receives `consultation_status`.

### Consultation audit logging

- Ticket create: `DATA_CONSULTATION_TICKET_CREATED`.
- Message send: `DATA_CONSULTATION_MESSAGE_SENT`.
- Status update: `DATA_CONSULTATION_STATUS_UPDATED`.
- Doctor opening ticket details/messages: `PHI_OPEN_CONSULTATION_TICKET`.
- Ownership/permission denials are audited as `AUTHZ_ACCESS_DENIED`.

### Consultation cleanup side-effects

- **Patient deletion request/finalization:** active consultation tickets (`pending`/`active`) are closed with reason `patient_account_deletion`.
- **Admin doctor offboarding:** active consultation tickets (`pending`/`active`) are closed with reason `doctor_account_offboarded` (or provided custom reason).

---

## Complaints

Base path: `/api/complaints`

This module is intentionally smaller than consultations or tickets. A complaint is still a single patient-submitted record, but it now has a minimal lifecycle that admins can update. There is still no threaded chat, no patient reply capability, no assignee, no SLA, and no separate reply collection.

### Complaint model behavior

- Fixed `type` enum:
  - `appointment`
  - `consultation`
  - `access_request`
  - `technical`
  - `other`
- Fixed `status` enum:
  - `submitted`
  - `under_review`
  - `in_progress`
  - `resolved`
  - `closed`
- Create default:
  - `status = submitted`
  - `statusUpdatedAt = createdAt`
  - initial `statusHistory[]` event is appended automatically
- `contactSnapshot` is derived from the authenticated patient user (`fullName`, `email`, `phone`).
- Optional `attachments` reuse the existing patient-file architecture as references to `PatientFile` ids; this route does not upload files directly.
- `adminResponse` is a single persisted latest admin response text, not a chat history.
- `statusHistory[]` is append-only and stores:

  ```json
  {
    "status": "under_review",
    "changedAt": "2030-01-02T09:00:00.000Z",
    "changedBy": "65f0c4f6e6a0d0d0d0d0d201",
    "actorRole": "admin"
  }
  ```

- **Frontend note:** Render complaints as a lifecycle record, not a threaded conversation. `statusHistory` is the timeline, and `adminResponse` is the latest one-way admin reply text.

### Status transition policy

- `submitted -> under_review | in_progress | resolved | closed`
- `under_review -> in_progress | resolved | closed`
- `in_progress -> resolved | closed`
- `resolved -> closed`
- `closed -> no further status transitions`

### Complaint notifications

- Admin status updates send a best-effort patient notification through the existing notifications/FCM infrastructure.
- Notification failures do not fail the complaint status update request.
- If `adminResponse` is provided, it is used as the notification body.
- Otherwise the backend uses a default localized body derived from the new complaint status.
- **Notification note:** A patient client can use push/in-app notifications as a prompt to refresh `GET /complaints/me` or `GET /complaints/:id`, but the complaint detail endpoint remains the source of truth.

### `POST /complaints`

- **Role:** `patient`
- **Guards:** authenticated patient + patient profile loaded + active patient account required.
- **Body:**

  ```json
  {
    "type": "technical",
    "subject": "Mobile issue",
    "message": "The mobile app crashes after login.",
    "attachments": [
      {
        "fileId": "65f0c4f6e6a0d0d0d0d0d701",
        "label": "Screenshot"
      }
    ]
  }
  ```

- **Body rules:**
  - `type` required and must be one of: `appointment`, `consultation`, `access_request`, `technical`, `other`.
  - `subject` optional string, trimmed, length `1..160` when provided.
  - `message` required string, trimmed, max length `5000`.
  - `attachments` optional array.
  - `attachments[].fileId` required ObjectId and must belong to the authenticated patient in `PatientFile`.
  - `attachments[].label` optional trimmed string, length `1..120`.
- **Behavior:**
  - The backend derives and stores `contactSnapshot` from the authenticated user (`fullName`, `email`, `phone`).
  - `email` and `phone` are not accepted as complaint input fields; admin follow-up uses the stored snapshot instead.
  - The complaint is created with `status=submitted`.
  - The backend appends the first `statusHistory` event with `actorRole=patient`.
  - Complaint audit event written: `DATA_COMPLAINT_CREATED`.
  - Suspended patients are blocked by `enforcePatientActiveStatus`.
- **Response:** `201 Created`

  ```json
  {
    "messageKey": "success.complaint.created",
    "message": "Complaint submitted.",
    "complaint": {
      "_id": "65f0c4f6e6a0d0d0d0d0d901",
      "type": "technical",
      "subject": "Mobile issue",
      "message": "The mobile app crashes after login.",
      "status": "submitted",
      "attachmentCount": 1,
      "statusUpdatedAt": "2030-01-01T10:00:00.000Z",
      "attachments": [
        {
          "fileId": "65f0c4f6e6a0d0d0d0d0d701",
          "label": "Screenshot"
        }
      ],
      "statusHistory": [
        {
          "status": "submitted",
          "changedAt": "2030-01-01T10:00:00.000Z",
          "changedBy": "65f0c4f6e6a0d0d0d0d0d201",
          "actorRole": "patient"
        }
      ],
      "adminResponse": null,
      "adminRespondedAt": null,
      "resolvedAt": null,
      "closedAt": null,
      "createdAt": "2030-01-01T10:00:00.000Z",
      "updatedAt": "2030-01-01T10:00:00.000Z"
    }
  }
  ```

- **Common errors:**
  - `403` `errors.auth.accountSuspended`
  - `403` `errors.patient.profileNotFound`
  - `400` `errors.complaint.invalidAttachmentReference`
  - `422` validation errors
- **Frontend note:** This endpoint only references already-uploaded patient files by id. Upload the attachment through the patient-file flow first, then submit the complaint with `attachments[].fileId`.

### `GET /complaints/me`

- **Role:** `patient`
- **Guards:** authenticated patient + patient profile loaded + readable patient account state.
- **Query params:**
  - `page`, `limit` (max `100`)
  - `status`
  - `type`
  - `from`, `to` (ISO-8601)
  - `search`
- **Behavior:**
  - Returns only complaints owned by the authenticated patient.
  - Ordered by `createdAt` descending, then `_id` descending.
  - `search` applies a safe partial match over `subject`, `message`, `type`, and `status`.
  - Suspended patients may still use this route.
- **Response:**

  ```json
  {
    "messageKey": "success.complaint.listed",
    "message": "Complaints loaded.",
    "page": 1,
    "limit": 20,
    "total": 1,
    "results": 1,
    "complaints": [
      {
        "_id": "65f0c4f6e6a0d0d0d0d0d901",
        "type": "technical",
        "subject": "Mobile issue",
        "message": "The mobile app crashes after login.",
        "status": "under_review",
        "attachmentCount": 1,
        "statusUpdatedAt": "2030-01-02T09:00:00.000Z",
        "createdAt": "2030-01-01T10:00:00.000Z",
        "updatedAt": "2030-01-02T09:00:00.000Z"
      }
    ]
  }
  ```

- **Common errors:**
  - `403` `errors.patient.profileNotFound`
  - `422` invalid query params
- **Frontend note:** This list endpoint is optimized for patient complaint history screens. Use complaint detail for `statusHistory`, `adminResponse`, and attachment metadata.

### `GET /complaints/:id`

- **Roles:** `patient`, `admin`
- **Params:** `id` must be a valid ObjectId.
- **Behavior:**
  - `patient` may read only their own complaint.
  - `admin` may read any complaint.
  - Suspended patients may still read their own complaint details.
  - For patient callers, a complaint that does not belong to them returns `404` to avoid cross-patient disclosure.
  - Response shape differs by role:
    - patient: complaint detail + lifecycle timeline fields
    - admin: includes patient/admin-only identifiers and `contactSnapshot`
- **Patient response example:**

  ```json
  {
    "messageKey": "success.complaint.details",
    "message": "Complaint details loaded.",
    "complaint": {
      "_id": "65f0c4f6e6a0d0d0d0d0d901",
      "type": "technical",
      "subject": "Mobile issue",
      "message": "The mobile app crashes after login.",
      "status": "resolved",
      "attachmentCount": 1,
      "statusUpdatedAt": "2030-01-02T09:00:00.000Z",
      "attachments": [
        {
          "fileId": "65f0c4f6e6a0d0d0d0d0d701",
          "label": "Screenshot"
        }
      ],
      "statusHistory": [
        {
          "status": "submitted",
          "changedAt": "2030-01-01T10:00:00.000Z",
          "changedBy": "65f0c4f6e6a0d0d0d0d0d201",
          "actorRole": "patient"
        },
        {
          "status": "resolved",
          "changedAt": "2030-01-02T09:00:00.000Z",
          "changedBy": "65f0c4f6e6a0d0d0d0d0d301",
          "actorRole": "admin"
        }
      ],
      "adminResponse": "Issue resolved. Please try again now.",
      "adminRespondedAt": "2030-01-02T09:00:00.000Z",
      "resolvedAt": "2030-01-02T09:00:00.000Z",
      "closedAt": null,
      "createdAt": "2030-01-01T10:00:00.000Z",
      "updatedAt": "2030-01-02T09:00:00.000Z"
    }
  }
  ```

- **Admin response example:**

  ```json
  {
    "messageKey": "success.complaint.details",
    "message": "Complaint details loaded.",
    "complaint": {
      "_id": "65f0c4f6e6a0d0d0d0d0d901",
      "patientId": "65f0c4f6e6a0d0d0d0d0d101",
      "userId": "65f0c4f6e6a0d0d0d0d0d201",
      "type": "technical",
      "subject": "Mobile issue",
      "message": "The mobile app crashes after login.",
      "status": "resolved",
      "attachmentCount": 1,
      "statusUpdatedAt": "2030-01-02T09:00:00.000Z",
      "contactSnapshot": {
        "fullName": "Sara Ali",
        "email": "sara@example.com",
        "phone": "+15550001111"
      },
      "attachments": [
        {
          "fileId": "65f0c4f6e6a0d0d0d0d0d701",
          "label": "Screenshot"
        }
      ],
      "statusHistory": [
        {
          "status": "submitted",
          "changedAt": "2030-01-01T10:00:00.000Z",
          "changedBy": "65f0c4f6e6a0d0d0d0d0d201",
          "actorRole": "patient"
        },
        {
          "status": "resolved",
          "changedAt": "2030-01-02T09:00:00.000Z",
          "changedBy": "65f0c4f6e6a0d0d0d0d0d301",
          "actorRole": "admin"
        }
      ],
      "adminResponse": "Issue resolved. Please try again now.",
      "adminRespondedAt": "2030-01-02T09:00:00.000Z",
      "adminRespondedBy": "65f0c4f6e6a0d0d0d0d0d301",
      "resolvedAt": "2030-01-02T09:00:00.000Z",
      "closedAt": null,
      "createdAt": "2030-01-01T10:00:00.000Z",
      "updatedAt": "2030-01-02T09:00:00.000Z"
    }
  }
  ```

- **Common errors:**
  - `404` `errors.complaint.notFound`
  - `422` invalid `id`
- **Frontend note:** Patient and admin detail payloads intentionally differ. Build separate patient/admin view models instead of assuming one shared detail schema.

### `GET /complaints`

- **Role:** `admin`
- **Query params:**
  - `page`, `limit` (max `100`)
  - `status`
  - `type`
  - `patientId`
  - `from`, `to` (ISO-8601)
  - `search`
- **Behavior:**
  - Ordered by `createdAt` descending, then `_id` descending.
  - `search` applies a safe partial match over `subject`, `message`, `type`, `status`, `contactSnapshot.fullName`, and `contactSnapshot.email`.
  - Admin response includes `contactSnapshot` so follow-up can happen externally.
- **Response:**

  ```json
  {
    "messageKey": "success.complaint.listed",
    "message": "Complaints loaded.",
    "page": 1,
    "limit": 20,
    "total": 1,
    "results": 1,
    "complaints": [
      {
        "_id": "65f0c4f6e6a0d0d0d0d0d901",
        "patientId": "65f0c4f6e6a0d0d0d0d0d101",
        "userId": "65f0c4f6e6a0d0d0d0d0d201",
        "type": "technical",
        "subject": "Mobile issue",
        "message": "The mobile app crashes after login.",
        "status": "in_progress",
        "attachmentCount": 1,
        "contactSnapshot": {
          "fullName": "Sara Ali",
          "email": "sara@example.com",
          "phone": "+15550001111"
        },
        "adminRespondedAt": null,
        "statusUpdatedAt": "2030-01-02T09:00:00.000Z",
        "createdAt": "2030-01-01T10:00:00.000Z",
        "updatedAt": "2030-01-02T09:00:00.000Z"
      }
    ]
  }
  ```

- **Common errors:**
  - `403` `errors.auth.insufficientPermissions`
  - `422` invalid query params
- **Frontend note:** This admin list is suitable for dashboards and triage tables. Use `search` plus `status`/`type`/`patientId` filters to drive queue views, then fetch detail rows on demand.

### `PATCH /complaints/:id/status`

- **Role:** `admin`
- **Params:** `id` must be a valid ObjectId.
- **Body:**

  ```json
  {
    "status": "resolved",
    "adminResponse": "تم حل المشكلة، يرجى المحاولة الآن"
  }
  ```

- **Body rules:**
  - `status` required and must be one of: `submitted`, `under_review`, `in_progress`, `resolved`, `closed`.
  - `adminResponse` optional trimmed string, length `1..2000`.
- **Behavior:**
  1. Loads the complaint and validates status transition rules.
  2. Updates `status`, `statusUpdatedAt`, and appends a `statusHistory` event when the status changes.
  3. Stores `adminResponse`, `adminRespondedAt`, and `adminRespondedBy` when `adminResponse` is provided.
  4. Sets `resolvedAt` when moving to `resolved`.
  5. Sets `closedAt` when moving to `closed`.
  6. Writes audit event `ADMIN_COMPLAINT_STATUS_UPDATED`.
  7. Sends a best-effort patient notification:
     - notification type: `complaint_status_updated`
     - notification body = `adminResponse` when present
     - otherwise = localized default body for the new complaint status
  8. If the request is a true no-op (`status` unchanged and no `adminResponse`), the API returns the unchanged complaint and skips save/audit/notification side effects.
  9. The response payload is action-specific and returns complaint lifecycle fields only, not the full admin complaint detail payload.
- **Response:** `200 OK`

  ```json
  {
    "messageKey": "success.complaint.statusUpdated",
    "message": "Complaint status updated.",
    "complaint": {
      "_id": "65f0c4f6e6a0d0d0d0d0d901",
      "status": "resolved",
      "statusUpdatedAt": "2030-01-02T09:00:00.000Z",
      "statusHistory": [
        {
          "status": "submitted",
          "changedAt": "2030-01-01T10:00:00.000Z",
          "changedBy": "65f0c4f6e6a0d0d0d0d0d201",
          "actorRole": "patient"
        },
        {
          "status": "resolved",
          "changedAt": "2030-01-02T09:00:00.000Z",
          "changedBy": "65f0c4f6e6a0d0d0d0d0d301",
          "actorRole": "admin"
        }
      ],
      "adminResponse": "تم حل المشكلة، يرجى المحاولة الآن",
      "adminRespondedAt": "2030-01-02T09:00:00.000Z",
      "adminRespondedBy": "65f0c4f6e6a0d0d0d0d0d301",
      "resolvedAt": "2030-01-02T09:00:00.000Z",
      "closedAt": null,
      "updatedAt": "2030-01-02T09:00:00.000Z"
    }
  }
  ```

- **Common errors:**
  - `400` `errors.complaint.invalidStatusTransition`
  - `404` `errors.complaint.notFound`
  - `422` validation errors
- **Frontend note:** After a successful status update, refresh both the complaint detail view and any complaint list counts/badges because `status`, `statusHistory`, `adminResponse`, and notification state may all have changed.

---

## Waitlist Service (Phase 1)

Base path: `/api/waitlist`

### Secretary permissions

- `waitlist:create` -> create waitlist requests on behalf of patients in assigned doctor scope.
- `waitlist:view` -> list waitlist + advisory suggestions.
- `waitlist:manage` -> mark contacted + close requests.
- `waitlist:book` -> convert waitlist request to appointment.

Secretaries must be assigned to the doctor scope. Doctor and secretary scope denials are audited as `AUTHZ_ACCESS_DENIED`.

### Waitlist status lifecycle

- `active` -> newly created and available for matching.
- `contacted` -> staff contacted patient.
- `booked` -> converted to appointment (stores `appointment` reference).
- `closed` -> manually closed by staff.
- `cancelled` -> cancelled by patient.
- `expired` -> reserved for future lifecycle automation (not auto-applied in Phase 1).

### Frontend waitlist guidance

- **Frontend note:** Patient-created requests derive `patientId` from auth; secretary-created requests must explicitly send the target `patientId`.
- **Frontend note:** Treat `GET /waitlist/suggestions` as advisory scheduling help for staff UI, not as a reservation. A suggested slot is still bookable by someone else until `POST /waitlist/:id/book` succeeds.
- **Frontend note:** The status lifecycle maps cleanly to UI tabs/badges: `active`, `contacted`, `booked`, `closed`, `cancelled`, and reserved `expired`. Disable patient cancel or staff contact/close/book actions once the request leaves the allowed source statuses.
- **Frontend note:** When a waitlist row becomes `booked`, the payload contains the appointment id only. Hydrate the actual appointment screen with `GET /api/appointments/:appointmentId`.

### Invalid transition response

When an operation requires `active|contacted` but the request is in another status, the API returns:

```json
{
  "status": 400,
  "messageKey": "errors.waitlist.invalidStatus",
  "message": "Waitlist status closed does not allow this action. Allowed statuses: active, contacted.",
  "errors": {
    "status": "closed",
    "allowedStatuses": ["active", "contacted"]
  }
}
```

### `POST /waitlist`

- **Roles:** `patient`, `secretary`
- **Guards:**
  - `enforcePatientActiveStatus` applies to patient only.
  - Secretary must be assigned to the same `doctorId` and have `waitlist:create`.
- **Body:**

  ```json
  {
    "doctorId": "64f...doctor",
    "patientId": "64f...patient",
    "preferredDateFrom": "2026-03-10",
    "preferredDateTo": "2026-03-20",
    "preferredTimeWindows": [{ "startTime": "09:00", "endTime": "12:00" }],
    "urgencyLevel": "high",
    "reason": "Need an earlier follow-up",
    "contactPreference": "whatsapp"
  }
  ```

- **Body rules:**
  - Patient flow: `patientId` is derived from auth profile (not required in body).
  - Secretary flow: `patientId` is required and must reference an existing patient.

- **Response:** `201 Created`

  ```json
  {
    "messageKey": "success.waitlist.created",
    "waitlistRequest": {
      "_id": "65a...",
      "doctor": "64f...doctor",
      "patient": "64f...patient",
      "status": "active"
    }
  }
  ```

- **Conflict protection:** if an `active` or `contacted` waitlist already exists for the same `doctorId + patientId`, the API returns `409` with `messageKey: errors.waitlist.alreadyActive`.
- **Frontend note:** Patient self-service screens should omit `patientId` from the request body. Secretary screens should require patient selection before submission.

### `GET /waitlist/me`

- **Role:** `patient`
- **Guard:** `enforcePatientActiveStatus`
- **Query:** `page`, `limit`, optional `status` (`active|contacted|booked|closed|cancelled|expired`)
- **Response:** paginated patient-owned waitlist requests.

  ```json
  {
    "messageKey": "success.waitlist.listed",
    "waitlistRequests": [
      {
        "_id": "65a...",
        "doctor": {
          "_id": "64f...doctor",
          "userId": {
            "fullName": "Dr. Mona"
          }
        },
        "status": "contacted",
        "urgencyLevel": "high",
        "preferredDateFrom": "2026-03-10T00:00:00.000Z",
        "preferredDateTo": "2026-03-20T00:00:00.000Z",
        "contactAttempts": 1,
        "lastContactedAt": "2026-03-11T09:00:00.000Z",
        "appointment": null,
        "createdAt": "2026-03-09T10:00:00.000Z"
      }
    ],
    "page": 1,
    "limit": 20,
    "total": 1,
    "results": 1
  }
  ```

- **Frontend note:** This is the patient-facing source for waitlist cards and badges. Use `status` to segment "waiting", "contacted", and "history" tabs.

### `GET /waitlist/:id`

- **Roles:** `patient`, `doctor`, `secretary`
- **Patient behavior:** may load only own waitlist request.
- **Doctor behavior:** may load only waitlist requests in own doctor scope.
- **Secretary behavior:** requires `waitlist:view` and assigned doctor scope match.
- **Response:** `200`

  ```json
  {
    "messageKey": "success.waitlist.details",
    "waitlistRequest": {
      "_id": "65a...",
      "status": "booked",
      "appointment": "65b..."
    }
  }
  ```

- **Appointment note:** when status is `booked`, the waitlist details payload returns the stored `appointment` id only. Clients should call `GET /appointments/:appointmentId` for appointment details.
- **Frontend note:** Use the detail endpoint for a timeline or action panel, then branch to the appointment detail route when `appointment` becomes non-null.

### `PATCH /waitlist/:id/cancel`

- **Role:** `patient`
- **Guard:** `enforcePatientActiveStatus`
- **Rules:** request must belong to authenticated patient and status must be `active` or `contacted`.
- **Response:** `200` with `messageKey: success.waitlist.cancelled`.

### `GET /waitlist`

- **Roles:** `doctor`, `secretary`
- **Secretary permission:** `waitlist:view`
- **Doctor scope:** doctor uses own profile; secretary uses assigned doctor.
- **Optional query filters:** `status`, `urgencyLevel`, `date`, `dateFrom`, `dateTo`, `q`, `page`, `limit`.
- **`q` search behavior:** partial match on patient `fullName`/`email`/`phone` and exact match on patient `publicId` (uppercased).
- **Response:** paginated waitlist requests in doctor scope.

  ```json
  {
    "messageKey": "success.waitlist.listed",
    "waitlistRequests": [
      {
        "_id": "65a...",
        "patient": {
          "_id": "64f...patient",
          "publicId": "PAT-1001",
          "userId": {
            "fullName": "Sara Patient"
          }
        },
        "status": "active",
        "urgencyLevel": "high",
        "preferredDateFrom": "2026-03-10T00:00:00.000Z",
        "preferredDateTo": "2026-03-20T00:00:00.000Z",
        "preferredTimeWindows": [{ "startTime": "09:00", "endTime": "12:00" }],
        "contactPreference": "whatsapp",
        "appointment": null,
        "createdAt": "2026-03-09T10:00:00.000Z"
      }
    ],
    "page": 1,
    "limit": 20,
    "total": 1,
    "results": 1
  }
  ```

- **Frontend note:** This route is suited to staff tables/queues. Treat `status`, `urgencyLevel`, `date/dateFrom/dateTo`, and `q` as filters; `page/limit` remain pagination controls.

### `PATCH /waitlist/:id/contacted`

- **Roles:** `doctor`, `secretary`
- **Secretary permission:** `waitlist:manage`
- **Body (optional):** `{ "note": "Called patient, waiting response" }`
- **Rules:** status must be `active` or `contacted`; increments `contactAttempts`, updates `lastContactedAt`, sets status to `contacted`.
- **Response:** `200` with `messageKey: success.waitlist.contacted`.

### `PATCH /waitlist/:id/close`

- **Roles:** `doctor`, `secretary`
- **Secretary permission:** `waitlist:manage`
- **Body (optional):** `{ "closedReason": "Patient unavailable this week" }`
- **Rules:** status must be `active` or `contacted`.
- **Response:** `200` with `messageKey: success.waitlist.closed`.

### `POST /waitlist/:id/book`

- **Roles:** `doctor`, `secretary`
- **Secretary permission:** `waitlist:book`
- **Body:**

  ```json
  {
    "date": "2026-03-12",
    "startTime": "10:00",
    "appointmentTypeId": "65f0c4f6e6a0d0d0d0d0d201",
    "notes": "Booked from waitlist"
  }
  ```

- **Validation:**
  - `startTime` must be a valid 24-hour clock value (`HH:MM`).
  - `appointmentTypeId`, when provided, must be a valid Mongo ObjectId.
  - invalid time returns `400` with `messageKey: errors.validation.invalidTime`.

- **Rules:**
  - waitlist status must be `active` or `contacted`.
  - doctor scope must match waitlist doctor.
  - conversion reuses appointment booking service (`appointmentService.bookAppointment`).
  - `appointmentTypeId` is optional and follows the same rules as direct appointment booking.
  - if `appointmentTypeId` is omitted, waitlist-created appointments remain backward compatible and keep null appointment-type snapshot fields.
  - if `appointmentTypeId` is provided, the booked appointment stores immutable snapshot fields from the selected type.
  - on success, waitlist transitions to `booked` and stores `appointment`.
- **Response:** `200`

  ```json
  {
    "messageKey": "success.waitlist.booked",
    "appointment": {
      "_id": "65b...",
      "appointmentType": "65f0c4f6e6a0d0d0d0d0d201",
      "appointmentTypeNameSnapshot": "Initial Consultation",
      "priceSnapshot": 500
    },
    "waitlistRequest": {
      "_id": "65a...",
      "status": "booked",
      "appointment": "65b..."
    }
  }
  ```

- **Appointment payload note:** `appointment` follows the same compact shape returned by `POST /appointments/book` (summary doctor/patient fields, not full profile docs) and the same snapshot/privacy rules for appointment-type fields.
- **Frontend note:** After a successful book action, update the row badge to `booked`, disable further lifecycle actions, and re-fetch the created appointment detail if the UI needs files, full snapshots, or downstream billing flows.
- **Errors:** in addition to waitlist scope/status errors, invalid appointment-type inputs bubble up from appointment booking:
  - `400 Bad Request` — `errors.appointmentType.invalid`
  - `400 Bad Request` — `errors.appointmentType.doctorMismatch`
  - `400 Bad Request` — `errors.appointmentType.inactive`
  - `404 Not Found` — `errors.appointmentType.notFound`

### `GET /waitlist/suggestions`

- **Roles:** `doctor`, `secretary`
- **Secretary permission:** `waitlist:view`
- **Query:** `date` (required), optional `startTime`, optional `type=freeSlots|slotCandidates`.
- **Validation:**
  - if `startTime` is provided, it must be a valid 24-hour clock value (`HH:MM`).
  - invalid time returns `400` with `messageKey: errors.validation.invalidTime`.
- **Behavior (advisory only):**
  - pulls doctor free slots using existing slot availability logic.
  - response includes `type` to indicate the resolved mode.
  - `type=freeSlots` returns availability only (`suggestionsBySlot` is empty).
  - `type=slotCandidates` returns availability + candidate matches per slot.
  - matches candidates where:
    - same doctor scope,
    - status in `active|contacted`,
    - requested date is within preferred date range,
    - if preferred time windows exist, slot `startTime` falls within at least one window.
  - candidates are sorted by urgency (`high` > `medium` > `low`) then `createdAt` ascending.
- **Response shape:**

  ```json
  {
    "type": "slotCandidates",
    "date": "2026-03-12",
    "doctorId": "64f...doctor",
    "freeSlots": [{ "startTime": "10:00", "endTime": "10:30" }],
    "suggestionsBySlot": [
      {
        "startTime": "10:00",
        "endTime": "10:30",
        "candidates": [{ "id": "65a...", "urgencyLevel": "high" }]
      }
    ]
  }
  ```

- **Frontend note:** `freeSlots` powers the slot picker. `suggestionsBySlot[].candidates` powers recommended patient chips or quick-book CTAs in staff booking UI.

### Verification (manual)

Commands used in local verification:

```bash
# 1) patient create waitlist
curl -X POST "http://localhost:5000/api/waitlist" \
  -H "Authorization: Bearer <patientToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "doctorId":"<doctorId>",
    "preferredDateFrom":"2026-03-10",
    "preferredDateTo":"2026-03-20",
    "preferredTimeWindows":[{"startTime":"09:00","endTime":"12:00"}],
    "urgencyLevel":"high",
    "contactPreference":"whatsapp"
  }'

# 2) secretary create waitlist (with waitlist:create permission)
curl -X POST "http://localhost:5000/api/waitlist" \
  -H "Authorization: Bearer <secretaryTokenWithCreatePermission>" \
  -H "Content-Type: application/json" \
  -d '{
    "doctorId":"<assignedDoctorId>",
    "patientId":"<patientId>",
    "preferredDateFrom":"2026-03-10",
    "preferredDateTo":"2026-03-20",
    "urgencyLevel":"medium",
    "contactPreference":"call"
  }'

# 3) secretary create waitlist (without waitlist:create permission -> 403)
curl -X POST "http://localhost:5000/api/waitlist" \
  -H "Authorization: Bearer <secretaryTokenWithoutCreatePermission>" \
  -H "Content-Type: application/json" \
  -d '{
    "doctorId":"<assignedDoctorId>",
    "patientId":"<patientId>",
    "preferredDateFrom":"2026-03-10",
    "preferredDateTo":"2026-03-20",
    "urgencyLevel":"medium",
    "contactPreference":"call"
  }'

# 4) patient list own waitlist
curl -X GET "http://localhost:5000/api/waitlist/me?page=1&limit=10" \
  -H "Authorization: Bearer <patientToken>"

# 5) secretary list waitlist (with/without permission)
curl -X GET "http://localhost:5000/api/waitlist" \
  -H "Authorization: Bearer <secretaryToken>"

# 6) advisory suggestions for doctor scope
curl -G "http://localhost:5000/api/waitlist/suggestions" \
  -H "Authorization: Bearer <secretaryOrDoctorToken>" \
  --data-urlencode "date=2026-03-12"

# 7) convert waitlist -> appointment
curl -X POST "http://localhost:5000/api/waitlist/<waitlistId>/book" \
  -H "Authorization: Bearer <secretaryOrDoctorToken>" \
  -H "Content-Type: application/json" \
  -d '{ "date":"2026-03-12", "startTime":"10:00", "appointmentTypeId":"<appointmentTypeId>", "notes":"Booked from waitlist" }'

# 8) list patient-safe available appointment types for booking
curl -X GET "http://localhost:5000/api/doctors/<doctorId>/appointment-types/available" \
  -H "Authorization: Bearer <patientOrStaffToken>"

# 9) normal appointment booking with optional appointment type
curl -X POST "http://localhost:5000/api/appointments/book" \
  -H "Authorization: Bearer <patientToken>" \
  -H "Content-Type: application/json" \
  -d '{ "doctorId":"<doctorId>", "date":"2026-03-18", "startTime":"11:00", "appointmentTypeId":"<appointmentTypeId>" }'
```

Expected outcomes:

- patient create/list endpoints return patient-owned waitlist data and `success.waitlist.created`.
- secretary with `waitlist:create` can create waitlist for patients in assigned doctor scope.
- secretary without `waitlist:create` receives `403 errors.waitlist.createPermissionRequired`.
- secretary without required waitlist permission receives `403 errors.waitlist.permissionRequired`.
- suggestions endpoint returns free slots + advisory candidates only (no booking lock/hold).
- booking endpoint returns appointment payload, appointment-type snapshot fields when selected, and waitlist status `booked`.
- patient-safe available endpoint returns only active/non-deleted types and omits hidden/null prices.
- regular `/appointments/book` remains backward compatible when `appointmentTypeId` is omitted.

---

## 5. Doctor Availability & Scheduling

### `GET /doctors/:doctorId/slots`

- **Roles:** `patient`, `doctor`, `secretary` (secretary is restricted to their assigned doctor and requires `schedule:view`)
- **Query parameters:**

| Name    | Type                | Required                  | Notes                      |
| ------- | ------------------- | ------------------------- | -------------------------- |
| `date`  | string (YYYY-MM-DD) | yes                       |                            |
| `type`  | enum                | optional (default `free`) | `free`, `booked`, or `all` |
| `page`  | number              | optional                  | used with `type=booked`    |
| `limit` | number              | optional                  | used with `type=booked`    |

- **Responses:**
  - `type=free`

    ```json
    {
      "date": "2025-11-25",
      "doctorId": "64f...",
      "duration": 30,
      "gap": 5,
      "freeSlots": [
        { "startTime": "09:00", "endTime": "09:30" },
        { "startTime": "09:35", "endTime": "10:05" }
      ],
      "totalFreeSlots": 8
    }
    ```

    - For the current day, `freeSlots` excludes already-started/past slots.

  - `type=booked`

    ```json
    {
      "date": "2025-11-25",
      "doctorId": "64f...",
      "totalBooked": 2,
      "appointments": [
        {
          "_id": "...",
          "patient": "...",
          "startTime": "10:00",
          "endTime": "10:30"
        }
      ]
    }
    ```

  - `type=all` returns merged timeline (doctors and secretaries only).

- **Examples**
  - Free slots (patient)

    ```bash
    curl -G "http://localhost:5000/api/doctors/64f.../slots" \
      -H "Authorization: Bearer <token>" \
      --data-urlencode "date=2025-11-25" \
      --data-urlencode "type=free"
    ```

  - Booked slots (doctor/secretary)

    ```bash
    curl -G "http://localhost:5000/api/doctors/64f.../slots" \
      -H "Authorization: Bearer <token>" \
      --data-urlencode "date=2025-11-25" \
      --data-urlencode "type=booked" \
      --data-urlencode "page=1" \
      --data-urlencode "limit=10"
    ```

### Weekly schedule endpoints (doctor-only unless noted)

| Method & Route                                              | Body                                                                                                      | Description                                                                       |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `GET /doctors/:doctorId/schedule`                           | –                                                                                                         | Returns `{ "availableTimes": [...], "exceptions": [...], "slotSettings": {...} }` |
| `POST /doctors/:doctorId/schedule/day`                      | `{ "day": "Monday", "slots": [{ "startTime": "09:00", "endTime": "12:00" }] }`                            | Adds a weekday template                                                           |
| `PATCH /doctors/:doctorId/schedule/day/:day`                | `{ "slots": [{ "startTime": "10:00", "endTime": "13:00" }] }`                                             | Updates one weekday template only                                                 |
| `DELETE /doctors/:doctorId/schedule/day/:day`               | –                                                                                                         | Removes a weekday (blocked if it would invalidate future scheduled appointments)  |
| `PUT /doctors/:doctorId/schedule`                           | `{ "availableTimes": [...], "exceptions": [...] }`                                                        | Strict full weekly replacement                                                    |
| `PATCH /doctors/:doctorId/schedule/settings`                | `{ "duration": 20, "gap": 5 }`                                                                            | Updates slot settings (doctor-level, used for all days)                           |
| `PATCH /doctors/:doctorId/schedule/exceptions`              | `{ "exceptions": [{ "date": "2025-11-30", "slots": [...], "note": "..." }] }`                             | Replaces the whole exceptions list only                                           |
| `PATCH /doctors/:doctorId/schedule`                         | same as `/schedule/exceptions`                                                                            | Deprecated alias for backward compatibility                                       |
| `POST /doctors/:doctorId/schedule/exception`                | `{ "date": "2025-11-30", "slots": [{ "startTime": "09:00", "endTime": "12:00" }], "note": "Conference" }` | Adds single-day override                                                          |
| `DELETE /doctors/:doctorId/schedule/exception/:exceptionId` | –                                                                                                         | Removes specific exception                                                        |

All schedule routes rely on `doctorScheduleGuard` to validate `doctorId`, ensure the doctor profile exists and is approved, and enforce role rules: secretaries must be assigned to that doctor and hold `schedule:view` (view-only), and doctors can only manage their own schedules.

Schedule update safety rules:

- Existing appointment records are never edited by schedule endpoints.
- Any schedule/settings change that would invalidate currently valid future scheduled appointments is rejected with `409 Conflict`.
- `duration`/`gap` are doctor-level settings (same for all days), not per-day settings.
- Exception dates must map to a weekday that already exists in weekly schedule (`availableTimes`), otherwise request is rejected.

Difference between exceptions endpoints:

- `POST /schedule/exception` adds one exception date.
- `PATCH /schedule/exceptions` replaces the full exceptions array.

**Validation error (`400`) for exception without weekly template**

```json
{
  "status": 400,
  "messageKey": "errors.schedule.exceptionRequiresWeeklyDay",
  "message": "Cannot add exception on 2025-11-30 (Sunday) without a weekly schedule for that day."
}
```

**Conflict response (`409`) for schedule updates**

```json
{
  "status": 409,
  "messageKey": "errors.schedule.patientsBookedForbidden",
  "message": "Cannot update schedule when patients are booked.",
  "errors": {
    "code": "SCHEDULE_CONFLICT",
    "operation": "replace_weekly_schedule",
    "reason": "future_appointments_would_be_invalid",
    "totalConflicts": 2,
    "returnedConflicts": 2,
    "conflicts": [
      {
        "appointmentId": "65a...1",
        "date": "2026-02-21T00:00:00.000Z",
        "startTime": "10:00",
        "endTime": "10:30"
      },
      {
        "appointmentId": "65a...2",
        "date": "2026-02-22T00:00:00.000Z",
        "startTime": "09:00",
        "endTime": "09:30"
      }
    ],
    "nextAction": "Reschedule or cancel conflicting appointments, then retry."
  }
}
```

**Examples**

- Add weekday

  ```bash
  curl -X POST "http://localhost:5000/api/doctors/64f.../schedule/day" \
    -H "x-lang: en" \
    -H "Authorization: Bearer <token>" \
    -H "Content-Type: application/json" \
    -d '{ "day": "Monday", "slots": [{ "startTime": "09:00", "endTime": "12:00" }] }'
  ```

- Add exception

  ```bash
  curl -X POST "http://localhost:5000/api/doctors/64f.../schedule/exception" \
    -H "x-lang: en" \
    -H "Authorization: Bearer <token>" \
    -H "Content-Type: application/json" \
    -d '{ "date": "2025-11-30", "slots": [{ "startTime": "09:00", "endTime": "12:00" }], "note": "Conference" }'
  ```

- Update slot settings

  ```bash
  curl -X PATCH "http://localhost:5000/api/doctors/64f.../schedule/settings" \
    -H "x-lang: en" \
    -H "Authorization: Bearer <token>" \
    -H "Content-Type: application/json" \
    -d '{ "duration": 20, "gap": 5 }'
  ```

### Doctor profile (self-service + admin review)

Base path: `/api/doctors`. Doctor-facing routes require the authenticated doctor to be approved; otherwise `403 Doctor is not approved.` is returned.

#### `GET /doctors/home/snapshot`

- **Description:** Returns one lightweight snapshot for the doctor app home screen.
- **Role:** `doctor` only.
- **Auth:** `Authorization: Bearer <doctor-jwt>`.
- **Counting rules:** `appointments` counts today’s upcoming `scheduled`/`rescheduled` appointments. `consultations` counts pending/active tickets with `unreadForDoctor > 0`, meaning tickets that need doctor attention. `waitlist` counts active waitlist requests.
- **Preview rules:** `nextAppointment` is the nearest upcoming appointment today. `activeConsultation` is the most relevant pending/active ticket and omits message preview text. `nearestWaitlistRequest` is the nearest active waitlist request. `pendingAccessRequestAlert.latestRequest` is the latest pending profile access request created by this doctor.
- **Appointment snapshot rule:** `appointmentTypeName` comes from the stored `Appointment.appointmentTypeNameSnapshot`; it is not rehydrated from live appointment-type records.
- **Response:**

  ```json
  {
    "messageKey": "success.doctorHomeSnapshot.loaded",
    "snapshot": {
      "counts": {
        "appointments": 3,
        "consultations": 2,
        "waitlist": 5
      },
      "pendingAccessRequestAlert": {
        "count": 1,
        "latestRequest": {
          "_id": "682a1001aa11bb22cc33dd44",
          "patientId": "682a2001aa11bb22cc33dd55",
          "patientPublicId": "PAT-000321",
          "patientName": "Ahmed Mohammad Al Ali",
          "patientPhotoUrl": null,
          "status": "pending",
          "reason": "Need full medical file access before consultation",
          "createdAt": "2026-05-09T08:20:00.000Z"
        }
      },
      "nextAppointment": {
        "_id": "682b0001aa11bb22cc33dd66",
        "patientId": "682a2001aa11bb22cc33dd55",
        "patientPublicId": "PAT-000321",
        "patientName": "Khaled Osama",
        "patientPhotoUrl": null,
        "status": "scheduled",
        "appointmentTypeId": "682b9001aa11bb22cc33dd77",
        "appointmentTypeName": "Consultation",
        "date": "2026-05-09",
        "startTime": "11:00",
        "endTime": "11:30",
        "startDateTime": "2026-05-09T11:00:00.000Z",
        "actions": {
          "canComplete": true,
          "canCancel": true,
          "canReschedule": true
        }
      },
      "activeConsultation": {
        "_id": "682c0001aa11bb22cc33dd88",
        "patientId": "682a2001aa11bb22cc33dd99",
        "patientPublicId": "PAT-000654",
        "patientName": "Ahmed Mohammad Al Salam",
        "patientPhotoUrl": null,
        "subject": "Chest pain",
        "status": "active",
        "unreadCount": 2,
        "lastMessageAt": "2026-05-09T09:05:00.000Z"
      },
      "nearestWaitlistRequest": {
        "_id": "682d0001aa11bb22cc33dd10",
        "patientId": "682a2001aa11bb22cc33dd11",
        "patientPublicId": "PAT-000777",
        "patientName": "Ahmad Mohammad Al Salam",
        "patientPhotoUrl": null,
        "status": "active",
        "preferredDateFrom": "2026-05-15T00:00:00.000Z",
        "preferredDateTo": "2026-05-25T00:00:00.000Z",
        "preferredTimeWindows": [
          {
            "startTime": "10:00",
            "endTime": "13:00"
          }
        ],
        "contactPreference": "whatsapp",
        "urgencyLevel": "high",
        "createdAt": "2026-05-09T07:10:00.000Z"
      }
    }
  }
  ```

- **Empty state:**

  ```json
  {
    "messageKey": "success.doctorHomeSnapshot.loaded",
    "snapshot": {
      "counts": {
        "appointments": 0,
        "consultations": 0,
        "waitlist": 0
      },
      "pendingAccessRequestAlert": {
        "count": 0,
        "latestRequest": null
      },
      "nextAppointment": null,
      "activeConsultation": null,
      "nearestWaitlistRequest": null
    }
  }
  ```

- **Errors:** `401 errors.auth.notAuthenticated`, `403 errors.auth.insufficientPermissions`, `403 errors.doctor.notApproved`, `403 errors.doctorProfile.notFound`.

#### `GET /doctors/me/profile`

- **Description:** Returns the doctor’s profile merged with user fields (email, name, phone, gender, DOB, address, photo).
- **Role:** `doctor` (approved)
- **Response note:** Includes `actorIds` with the authenticated doctor profile `_id`.
- **Response:**

  ```json
  {
    "actorIds": {
      "patientId": null,
      "doctorId": "64f...doc",
      "secretaryId": null,
      "assignedDoctorId": null
    },
    "doctor": {
      "_id": "64f...doc",
      "specialization": "Cardiology",
      "medicalLicenseNumber": "LIC-1234",
      "education": "Cairo University",
      "clinicAddress": "Clinic St",
      "bio": "15 years of experience",
      "consultationFee": 300,
      "isApproved": true,
      "user": {
        "_id": "64f...user",
        "fullName": "Dr Mona",
        "email": "dr.mona@example.com",
        "phone": "+20123...",
        "gender": "Female",
        "dateOfBirth": "1985-05-02T00:00:00.000Z",
        "address": "Clinic St",
        "photoUrl": "https://files.example/profile-photos/doctor-profile/64f.../photo.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256...",
        "photoKey": "profile-photos/doctor-profile/64f.../photo.jpg",
        "photoUrlExpiresIn": 300
      }
    }
  }
  ```

- **Errors:** `404 Doctor profile not found.`, `403 Doctor is not approved.`

#### Doctor account deletion and recovery

Doctor account deletion uses two recovery paths:

- During the 7-day recovery window, the doctor can recover the account directly with OTP.
- After the recovery window expires, the doctor can submit a restore request with OTP and an admin must review it.

##### `POST /doctors/me/delete-request`

- **Description:** Doctor requests deletion of their own approved active account. The account is locked immediately, devices are removed, auth sessions are revoked, future appointments are cancelled, active consultations are closed, and secretary assignments are preserved.
- **Auth:** Doctor
- **Body:** `{ "reason": "optional text, max 500 chars" }`
- **Notes:** Idempotent while the same self-delete request is already pending.
- **Response:**

  ```json
  {
    "messageKey": "success.accountDeletion.doctorRequested",
    "status": "requested",
    "recoveryExpiresAt": "2026-02-05T10:00:00.000Z"
  }
  ```

##### `POST /doctors/account-deletion/recovery/start`

- **Description:** Start OTP delivery for direct self-recovery during the 7-day recovery window.
- **Auth:** Public
- **Body:** `{ "channel": "email", "email": "doctor@example.com" }` or `{ "channel": "whatsapp", "phone": "+963944000000" }`
- **Notes:** Response is non-enumerating; missing or ineligible accounts still receive the generic success shape.
- **Response:** `{ "messageKey": "success.accountDeletion.recoveryOtpSent" }`

##### `POST /doctors/account-deletion/recovery/verify`

- **Description:** Verify the recovery OTP and restore the self-deleted doctor account before the recovery window expires.
- **Auth:** Public
- **Body:** `{ "channel": "email", "email": "doctor@example.com", "otp": "123456" }`
- **Response:**

  ```json
  {
    "messageKey": "success.accountDeletion.doctorRecovered",
    "status": "none",
    "userId": "64f...user",
    "doctorId": "64f...doc",
    "approvalFallbackUsed": false
  }
  ```

##### `POST /doctors/account-deletion/restore-request/start`

- **Description:** Start OTP delivery for a post-window restore request. This is only for self-deleted doctor accounts after direct self-recovery is no longer available.
- **Auth:** Public
- **Body:** `{ "channel": "email", "email": "doctor@example.com" }` or `{ "channel": "whatsapp", "phone": "+963944000000" }`
- **Notes:** Admin-offboarded doctors cannot use this flow. Response is non-enumerating.
- **Response:** `{ "messageKey": "success.accountDeletion.restoreOtpSent" }`

##### `POST /doctors/account-deletion/restore-request/verify`

- **Description:** Verify the restore-request OTP and submit the account for admin review.
- **Auth:** Public
- **Body:** `{ "channel": "email", "email": "doctor@example.com", "otp": "123456", "reason": "Please restore my account" }`
- **Response:**

  ```json
  {
    "messageKey": "success.accountDeletion.restoreRequested",
    "status": "requested",
    "restoreStatus": "pending",
    "restoreRequestedAt": "2026-02-06T10:00:00.000Z"
  }
  ```

#### `PATCH /doctors/me/profile`

- **Description:** Update non-critical fields and/or replace the profile photo. Critical fields (license, specialization, education) and location data require a change request.
- **Role:** `doctor` (approved)
- **Headers:** `Content-Type: multipart/form-data`, `x-lang: en|ar`
- **Fields:** any of `fullName`, `phone`, `address`, `dateOfBirth`, `bio`, `consultationFee`, `consultationTypes`; optional file `photo`.
- **Response:** `{ "message": "Profile updated", "actorIds": { "patientId": null, "doctorId": "64f...doc", "secretaryId": null, "assignedDoctorId": null }, "doctor": { ...same shape as GET... } }`
- **Notes:** The previous photo (if any) is deleted after a successful upload. Location updates (`clinicAddress`, `locationCity`, `locationCountry`, `clinicLat`, `clinicLng`) must be submitted via a change request.

#### Doctor security settings (self-service)

Strict model for doctor security settings:

- The authenticated doctor must still pass the normal doctor self-service eligibility checks. Pending / rejected / unapproved doctor accounts are blocked.
- Password change requires the current password and revokes all existing auth sessions.
- Email and phone changes use the same strict 2-step model as patient settings:
  1. authenticated doctor requests the change with `currentPassword`
  2. backend sends an OTP to the new destination
  3. doctor confirms with the OTP
  4. backend applies the change and revokes all existing auth sessions
- Email/phone request + confirm writes auth audit coverage for request, OTP verification, contact update, and token invalidation.

#### `PUT /doctors/me/settings/password`

- **Description:** Change the authenticated doctor's password.
- **Role:** `doctor` (approved)
- **Body:** `{ "currentPassword": "Old123", "newPassword": "New123456" }`
- **Response:** `{ "messageKey": "success.auth.passwordUpdated" }`
- **Behavior:** successful completion revokes all existing auth sessions, including the current one.

#### `POST /doctors/me/settings/email/request`

- **Description:** Start a strict doctor email-change flow.
- **Role:** `doctor` (approved)
- **Body:** `{ "currentPassword": "Old123", "newEmail": "new@example.com" }`
- **Response:** `{ "messageKey": "success.auth.emailChangeOtpSent" }`
- **Behavior:** rejects same-as-current email, duplicate target email, wrong current password, and OTP request cooldown / hourly limit violations.
- **Audit:** `AUTH_EMAIL_CHANGE_REQUESTED`

#### `POST /doctors/me/settings/email/confirm`

- **Description:** Confirm the pending doctor email change with the OTP sent to the new email address.
- **Role:** `doctor` (approved)
- **Body:** `{ "otp": "123456" }`
- **Response:** `{ "messageKey": "success.auth.emailUpdated" }`
- **Behavior:** verifies the OTP, applies the email change, then revokes all existing auth sessions.
- **Audit:** `AUTH_EMAIL_CHANGE_VERIFIED`, `AUTH_EMAIL_CHANGED`, `AUTH_TOKEN_INVALIDATED`

#### `POST /doctors/me/settings/phone/request`

- **Description:** Start a strict doctor phone-change flow using the existing WhatsApp OTP channel.
- **Role:** `doctor` (approved)
- **Body:** `{ "currentPassword": "Old123", "newPhone": "+201234567890" }`
- **Response:** `{ "messageKey": "success.auth.phoneChangeOtpSent" }`
- **Behavior:** rejects same-as-current phone, duplicate target phone, wrong current password, and OTP request cooldown / hourly limit violations.
- **Audit:** `AUTH_PHONE_CHANGE_REQUESTED`

#### `POST /doctors/me/settings/phone/confirm`

- **Description:** Confirm the pending doctor phone change with the OTP sent to the new phone number.
- **Role:** `doctor` (approved)
- **Body:** `{ "otp": "123456" }`
- **Response:** `{ "messageKey": "success.auth.phoneUpdated" }`
- **Behavior:** verifies the OTP, applies the phone change, then revokes all existing auth sessions.
- **Audit:** `AUTH_PHONE_CHANGE_VERIFIED`, `AUTH_PHONE_CHANGED`, `AUTH_TOKEN_INVALIDATED`

#### `POST /doctors/me/profile-change-requests`

- **Description:** Submit admin-reviewed changes for critical fields.
- **Role:** `doctor` (approved)
- **Body:**

  ```json
  {
    "items": [
      { "field": "medicalLicenseNumber", "newValue": "LIC-9999" },
      { "field": "education", "newValue": "Harvard Medical School" }
    ],
    "reason": "Updated license and degree"
  }
  ```

- **Rules:** `items` must be non-empty; `field` must be one of `medicalLicenseNumber`, `specialization`, `education`, `clinicAddress`, `locationCity`, `locationCountry`, `clinicLat`, `clinicLng`; duplicate fields are rejected; `clinicLat` + `clinicLng` must be provided together; if a pending request exists for the same doctor, items are merged/updated rather than creating a new document.
- **Response:** `201 Created` — `{ "message": "Change request submitted", "request": { "_id": "...", "status": "pending", "items": [...], "doctor": "...", "requestedBy": "..." } }`

#### `GET /doctors/me/profile-change-requests`

- **Description:** List the authenticated doctor's own profile change requests. Use this in doctor settings to show request history and current status without exposing admin review screens.
- **Role:** `doctor` (approved)
- **Query params:** `status` (`pending`/`approved`/`denied`, optional), `page` (>=1, default 1), `limit` (1-100, default 20)
- **Response:** `{ "messageKey": "success.doctorProfile.changeRequestsLoaded", "page": 1, "limit": 20, "total": 2, "results": 2, "requests": [ { "_id": "...", "doctor": "...", "items": [ { "field": "education", "newValue": "Harvard Medical School" } ], "reason": "Updated degree", "status": "pending", "reviewedAt": null, "adminNote": null, "createdAt": "...", "updatedAt": "..." } ] }`
- **Notes:** Sorted newest first. Only the authenticated doctor's own requests are returned.

#### `GET /doctors/me/profile-change-requests/:requestId`

- **Description:** Fetch one authenticated doctor's own profile change request. Use this for a doctor-side request details screen.
- **Role:** `doctor` (approved)
- **Response:** `{ "messageKey": "success.doctorProfile.changeRequestLoaded", "request": { "_id": "...", "doctor": "...", "requestedBy": "...", "items": [ { "field": "medicalLicenseNumber", "newValue": "LIC-9999" } ], "reason": "License renewed", "status": "approved", "adminNote": "Looks good", "reviewedAt": "2026-04-07T10:00:00.000Z", "createdAt": "2026-04-05T10:00:00.000Z", "updatedAt": "2026-04-07T10:00:00.000Z" } }`
- **Errors:** `404 Change request not found.` when the request does not exist or belongs to another doctor.

### Admin review of doctor profile changes

#### `GET /doctors/profile-change-requests`

- **Role:** `admin`
- **Query params:** `status` (`pending`/`approved`/`denied`, optional), `page` (>=1, default 1), `limit` (1-100, default 20)
- **Response:** `{ "page": 1, "limit": 20, "total": 3, "results": 3, "requests": [ { "_id": "...", "status": "pending", "items": [...], "doctor": { "_id": "...", "specialization": "...", "medicalLicenseNumber": "...", "education": "...", "clinicAddress": "...", "bio": "...", "consultationFee": 300, "userId": "..." }, "requestedBy": { "_id": "...", "fullName": "...", "email": "..." }, "createdAt": "..." } ] }` (sorted newest first).

#### `PATCH /doctors/profile-change-requests/:requestId`

- **Role:** `admin`
- **Body:** `{ "decision": "approved", "adminNote": "Looks good" }` or `{ "decision": "denied", "adminNote": "License invalid" }`
- **Behavior:** Only pending requests can be reviewed; approval updates the doctor record (with a license-number uniqueness guard) and returns the sanitized doctor. If `clinicLat` + `clinicLng` are approved, the clinic pin is updated and marked `geoStatus=verified` (source `admin`). Denial leaves the doctor unchanged.
- **Notifications:** doctor is notified when the request is approved or denied.
- **Response (approved):** `{ "message": "Request approved", "request": { ...status: "approved"... }, "doctor": { "_id": "...", "medicalLicenseNumber": "...", "specialization": "...", "education": "...", "clinicAddress": "...", "bio": "...", "consultationFee": 300, "isApproved": true } }`
- **Response (denied):** `{ "message": "Request denied", "request": { ...status: "denied", "adminNote": "..." } }`
- **Errors:** `400 Request already reviewed.`, `400 Medical license number already in use.`, `404 Change request not found.`

### Admin doctor verification (admin-only)

Base path: `/api/admin`. All routes require an authenticated `admin`.

#### `GET /admin/doctors`

- **Description:** List doctors with rich filters (approval status, search, location, specialization) and pagination.
- **Filters supported:** `status` (`pending`/`approved`/`rejected`), `search` (matches full name/email/phone), `specialization`, `city`, `country`, `from`, `to` (ISO dates on doctor creation).
- **Filter vs pagination note:** `status`, `search`, `specialization`, `city`, `country`, `from`, and `to` are filters. `page` and `limit` are pagination controls.
- **Pagination:** `page` (>=1, default 1), `limit` (1-100, default 20)
- **Response:**

  ```json
  {
    "page": 1,
    "limit": 20,
    "total": 2,
    "results": 2,
    "doctors": [
      {
        "_id": "64f...doc",
        "specialization": "Cardiology",
        "medicalLicenseNumber": "LIC-1234",
        "education": "Cairo University",
        "clinicAddress": "Clinic St",
        "bio": "15 years of experience",
        "consultationFee": 300,
        "consultationTypes": ["online", "offline"],
        "locationCity": "Cairo",
        "locationCountry": "EG",
        "isApproved": true,
        "approvalStatus": "approved",
        "approvalNote": "Verified by admin",
        "createdAt": "2025-12-06T10:00:00.000Z",
        "user": {
          "fullName": "Dr Mona",
          "email": "dr.mona@example.com",
          "phone": "+20123...",
          "gender": "Female",
          "photoUrl": "uploads/2025-12-06/photo.jpg"
        }
      }
    ]
  }
  ```

- **Example**

  ```bash
  curl -G "http://localhost:5000/api/admin/doctors" \
    -H "Authorization: Bearer <admin-token>" \
    --data-urlencode "status=approved" \
    --data-urlencode "search=mona" \
    --data-urlencode "specialization=cardio" \
    --data-urlencode "city=Cairo" \
    --data-urlencode "page=1" \
    --data-urlencode "limit=20"
  ```

- **Frontend note:** This endpoint is suitable for admin doctor tables and overview dashboards. Use the list payload for rows/cards, then call `GET /admin/doctors/:doctorId` when the UI opens a dedicated detail page or review drawer.

#### `GET /admin/doctors/:doctorId`

- **Description:** Fetch a single doctor profile (includes approval fields and the populated user record).
- **Response:** `{ "doctor": { "_id": "...", "specialization": "...", "medicalLicenseNumber": "...", "isApproved": false, "approvalStatus": "pending", "approvalNote": null, "approvedBy": null, "approvedAt": null, "userId": { "fullName": "...", "email": "..." } } }`
- **Errors:** `404 Doctor not found`
- **Frontend note:** Prefer this detail route for admin profile/review pages instead of overloading the list row payload.

#### `GET /admin/doctors/:doctorId/analytics/diagnosis`

- **Description:** Admin view of a doctor's diagnosis analytics (counts of diagnosis events per period).
- **Auth:** Admin
- **Diagnosis definition:** A diagnosis is recorded when a doctor creates a medical record for a patient (medical record creation is the canonical event).
- **Query params:** `range` (`day`/`week`/`month`/`year`, default `day`), `from`, `to` (YYYY-MM-DD, optional).
- **Response:** Same shape as `GET /doctors/analytics/diagnosis`.

#### `GET /admin/doctors/:doctorId/analytics/summary`

- **Description:** Admin view of a doctor's activity analytics (consultations, orders, access requests, medical records, completed/no-show appointments, new linked patients).
- **Auth:** Admin
- **Query params:** `range` (`day`/`week`/`month`/`year`, default `day`), `from`, `to` (YYYY-MM-DD, optional).
- **Response:** Same shape as `GET /doctors/analytics/summary`.

#### `GET /admin/doctor-verification-requests`

- **Description:** List doctor verification requests (seeded on doctor signup). Sorted newest first.
- **Query params:** `status` (`pending`/`approved`/`rejected`, optional), `page` (>=1, default 1), `limit` (1-100, default 20)
- **Geo note:** `clinicLocation.coordinates` is `[lng, lat]`.
- **Filter vs pagination note:** `status` is a filter. `page` and `limit` are pagination controls.
- **Response (shape):**

  ```json
  {
    "page": 1,
    "limit": 20,
    "total": 1,
    "results": 1,
    "requests": [
      {
        "_id": "65a...req",
        "doctor": {
          "_id": "...",
          "specialization": "Cardiology",
          "medicalLicenseNumber": "LIC-1234",
          "education": "Cairo University",
          "clinicAddress": "Clinic St",
          "bio": "15 years of experience",
          "consultationFee": 300,
          "consultationTypes": ["online", "offline"],
          "locationCity": "Cairo",
          "locationCountry": "EG",
          "averageRating": 4.8,
          "totalReviews": 10,
          "isApproved": false,
          "approvalStatus": "pending",
          "approvalNote": null,
          "geoStatus": "pending",
          "geoSource": "doctor_pin",
          "geoUpdatedAt": "2025-12-06T08:55:00.000Z",
          "clinicLocation": {
            "type": "Point",
            "coordinates": [31.2357, 30.0444]
          },
          "userId": {
            "_id": "...",
            "fullName": "Dr Mona",
            "email": "dr.mona@example.com",
            "phone": "+20123...",
            "gender": "Female",
            "dateOfBirth": "1985-05-02T00:00:00.000Z",
            "address": "Clinic St",
            "photoUrl": "uploads/2025-12-06/photo.jpg"
          }
        },
        "requestedBy": {
          "_id": "...",
          "fullName": "Dr Mona",
          "email": "dr.mona@example.com"
        },
        "status": "pending",
        "adminNote": null,
        "reviewedBy": null,
        "reviewedAt": null,
        "createdAt": "2025-12-06T09:00:00.000Z"
      }
    ]
  }
  ```

- **Frontend note:** This list works well for admin approval queues. Use `status` for queue tabs and fetch `GET /admin/doctor-verification-requests/:requestId` when the reviewer opens one request in detail.

#### `GET /admin/doctor-verification-requests/:requestId`

- **Description:** Fetch a single verification request with the associated doctor and requester.
- **Response (shape):**

  ```json
  {
    "request": {
      "_id": "...",
      "doctor": {
        "_id": "...",
        "specialization": "Cardiology",
        "medicalLicenseNumber": "LIC-1234",
        "education": "Cairo University",
        "clinicAddress": "Clinic St",
        "bio": "15 years of experience",
        "consultationFee": 300,
        "consultationTypes": ["online", "offline"],
        "locationCity": "Cairo",
        "locationCountry": "EG",
        "averageRating": 4.8,
        "totalReviews": 10,
        "isApproved": false,
        "approvalStatus": "pending",
        "approvalNote": null,
        "geoStatus": "pending",
        "geoSource": "doctor_pin",
        "geoUpdatedAt": "2025-12-06T08:55:00.000Z",
        "clinicLocation": {
          "type": "Point",
          "coordinates": [31.2357, 30.0444]
        },
        "userId": {
          "_id": "...",
          "fullName": "Dr Mona",
          "email": "dr.mona@example.com",
          "phone": "+20123...",
          "gender": "Female",
          "dateOfBirth": "1985-05-02T00:00:00.000Z",
          "address": "Clinic St",
          "photoUrl": "uploads/2025-12-06/photo.jpg"
        }
      },
      "requestedBy": {
        "_id": "...",
        "fullName": "Dr Mona",
        "email": "dr.mona@example.com"
      },
      "status": "pending",
      "adminNote": null,
      "reviewedBy": null,
      "reviewedAt": null,
      "createdAt": "2025-12-06T09:00:00.000Z"
    }
  }
  ```

- **Errors:** `404 Verification request not found`
- **Frontend note:** This is the preferred detail fetch for an approval screen because it combines request metadata, doctor profile data, requester identity, and geo-review context in one response.

#### `PATCH /admin/doctor-verification-requests/:requestId`

- **Body:** `{ "decision": "approved", "adminNote": "Welcome aboard", "clinicLat": 30.0444, "clinicLng": 31.2357, "verifyLocation": true, "specializationLookupId": "64f...lookup" }`
- **Alternative approval body for creating a missing specialization:** `{ "decision": "approved", "newSpecialization": { "key": "interventional_cardiology", "text": { "en": "Interventional Cardiology", "ar": "قثطرة القلب التداخلية" } } }`
- **Rejection body:** `{ "decision": "rejected", "adminNote": "Invalid license" }`
- **Behavior:** Pending requests can be approved or rejected. Rejected requests can be approved later, but approved requests cannot be rejected through this endpoint. Approval sets `doctor.isApproved=true`, `approvalStatus=approved`, `approvalNote=adminNote`, `approvedBy/approvedAt` and marks the request `approved` with reviewer metadata. If `clinicLat` + `clinicLng` are provided, they overwrite the clinic pin and set `geoStatus=verified` (`geoSource=admin`). If `verifyLocation=true` and a pending pin exists, it is marked verified. If the doctor signed up with a custom specialization request, admin must resolve it before approval by either passing `specializationLookupId` for an existing admin-managed specialization or `newSpecialization` to create one and immediately attach it. Rejection sets `doctor.isApproved=false`, `approvalStatus=rejected`, `approvalNote=adminNote` and marks the request `rejected`.
- **Notifications:** doctor is notified when the request is approved or rejected.
- **Response (approved):** `{ "message": "Doctor approved", "request": { "_id": "...", "status": "approved", "adminNote": "Welcome aboard", "reviewedBy": "64f...admin", "reviewedAt": "2025-12-06T10:05:00.000Z" }, "doctor": { "_id": "...", "isApproved": true, "approvalStatus": "approved", "approvalNote": "Welcome aboard", "approvedBy": "64f...admin", "approvedAt": "2025-12-06T10:05:00.000Z" } }`
- **Response (rejected):** `{ "message": "Doctor rejected", "request": { "_id": "...", "status": "rejected", "adminNote": "Invalid license" } , "doctor": { "_id": "...", "isApproved": false, "approvalStatus": "rejected", "approvalNote": "Invalid license" } }`
- **Errors:** `400 Verification request status cannot be changed with this decision`, `400 Custom doctor specializations must be resolved to an admin-managed specialization before approval`, `404 Verification request not found`, `404 Doctor profile not found`

### Doctor patient management (doctor-only unless noted)

Base path for these routes: `/api/doctors` (patient-management). Scheduling routes stay under the same base via the slots router; patient-management routes are defined in `src/routes/doctor.js`.

#### `GET /doctors/patients`

- **Description:** List patients linked to the authenticated (approved) doctor with filters and pagination.
- **Auth:** Doctor, Secretary (secretary is scoped to their assigned doctor and requires `patients:view`)
- **Query params:** `name` (partial match on patient full name), `search` (matches patient name/email/phone/publicId), `diagnosis` (search diagnosis/title), `from`, `to` (ISO dates to filter by appointments in range), `page`, `limit`, `account_status` (`active` | `temporary` | `suspended` | `all`, default `all`).
- **Response:** `{ "page": 1, "limit": 20, "total": 2, "results": 2, "patients": [ { "_id": "...", "publicId": "P-7F3K9D2Q", "user": { "_id": "...", "fullName": "Sara Patient", "email": "sara@example.com", "phone": "+20123..." }, "allergies": [], "medicalConditions": [], "bloodType": null, "lastVisitAt": "2025-12-07T12:00:00.000Z" } ] }`
- **Notes:** Each patient includes `user.accountStatus` and `isTemporary` for UI filtering.
- **Appointment-linked patients:** patients can appear here either from the explicit `Doctor.patients` link or from appointment history for the doctor. A successful `POST /appointments/book` updates both link arrays, and this endpoint still uses appointment history as a fallback so booked patients remain discoverable.

#### `POST /doctors/patients/temp`

- **Description:** Create a temporary patient (or link an existing patient if email/phone matches). Uses a random password, marks account as temporary, links the doctor↔patient, and can send the patient a claim OTP.
- **Auth:** Doctor, Secretary (secretary is scoped to their assigned doctor and requires `patients:temporary:create`)
- **Body:** `{ "fullName": "Walk-in Patient", "email": "walkin@example.com", "phone": "+20123...", "channel": "email" }` (`fullName`, `email`, and `phone` required; `channel` optional: `email` | `whatsapp` | `none`, default `email` for the API)
- **Response:** `{ "message": "Temporary patient created and linked", "patientId": "...", "userId": "...", "accountStatus": "temporary", "isTemporary": true, "claimNotification": { "attempted": true, "delivered": true, "channel": "email", "messageKey": "success.auth.claimOtpSentEmail" } }` or `{ "message": "Existing patient linked to doctor", ... }`
- **Notes:** New temporary patients are created with `accountStatus=temporary` and `isVerified=false` until claimed via `/auth/claim-account/*` (or activated by admin). If the resulting account is temporary, `channel=email` or `channel=whatsapp` sends a claim OTP with instructions to open the claim-account flow, set a password, and request a new claim code if the OTP expires. Existing active patients are linked without a claim notification. Notification delivery failures do not roll back the create/link operation; check `claimNotification.delivered`.

#### `GET /doctors/patients/:patientId/public`

- **Description:** Return non-confidential patient data (basic demographics, allergies/conditions, vitals) for a linked patient.
- **Auth:** Doctor (patient must already be linked)
- **Response:** `{ "patient": { "_id": "...", "user": { "_id": "...", "fullName": "Sara Patient", "email": "sara@example.com", "phone": "+20123..." }, "allergies": [], "medicalConditions": [], "bloodType": "O+", "heightCm": 170, "weightKg": 70, "measurementUnit": "metric" } }`

#### Encounter-Centered Clinical Workflow

The backend now supports a doctor-owned encounter workflow on top of the existing appointment, order, medication, and document infrastructure.

- `Encounter` is the clinical-session anchor.
- `appointmentId` is optional on encounter creation.
- Existing `/api/doctors/orders*` flows remain supported.
- Existing direct medication flows remain supported.
- Draft encounter work does not notify the patient until an official finalize/share path is reached.

#### `GET /patient/encounters`

#### `GET /patient/encounters/:encounterId`

- **Role (auth):** `patient`
- **Description:** List or fetch the authenticated patient's own encounters.
- **Query params (`GET /patient/encounters`):** `status` (`open | closed`), `dateFrom` (`YYYY-MM-DD`), `dateTo` (`YYYY-MM-DD`), `sortBy` (`startedAt | createdAt`), `sortOrder` (`asc | desc`), `page`, `limit`
- **Response keys:** list returns `{ "page", "limit", "total", "results", "encounters": [...] }`; detail returns `{ "encounter": { ... } }`
- **Errors:** `400 errors.validation.invalidEnum`, `400 errors.validation.invalidId`, `404 errors.encounter.notFound`
- **Notes:** Access is strictly patient-owned. Encounter payloads include minimized `doctor`, `patient`, and optional `appointment` summaries.

#### `GET /doctors/:doctorId/encounters`

- **Role (auth):** `doctor`
- **Description:** List encounters owned by the authenticated doctor across patients.
- **Query params:** `patientId`, `status` (`open | closed`), `dateFrom` (`YYYY-MM-DD`), `dateTo` (`YYYY-MM-DD`), `sortBy` (`startedAt | createdAt`), `sortOrder` (`asc | desc`), `page`, `limit`
- **Response keys:** `{ "page", "limit", "total", "results", "encounters": [...] }`, matching the patient and per-patient doctor encounter list envelope.
- **Errors:** `400 errors.validation.invalidId`, `400 errors.validation.invalidEnum`, `403 errors.doctorPatient.onlyOwnPatients`
- **Notes:** `:doctorId` is checked against the authenticated doctor profile. Secretary delegated access is not enabled for this encounter flow.

#### `GET /doctors/:doctorId/patients/:patientId/encounters`

#### `POST /doctors/:doctorId/patients/:patientId/encounters`

#### `GET /doctors/:doctorId/patients/:patientId/encounters/:encounterId`

#### `PATCH /doctors/:doctorId/patients/:patientId/encounters/:encounterId`

#### `POST /doctors/:doctorId/patients/:patientId/encounters/:encounterId/close`

- **Role (auth):** `doctor`
- **Description:** Doctor-owned encounter CRUD plus close action for a linked patient.
- **Query params (`GET .../encounters`):** `status` (`open | closed`), `dateFrom` (`YYYY-MM-DD`), `dateTo` (`YYYY-MM-DD`), `sortBy` (`startedAt | createdAt`), `sortOrder` (`asc | desc`), `page`, `limit`
- **Body (`POST .../encounters`):** `appointmentId?`, `origin?` (`appointment | walk_in | manual | follow_up`), `notes?`
- **Body (`PATCH .../encounters/:encounterId`):** any subset of `origin`, `notes`
- **Response keys:** list returns `{ "page", "limit", "total", "results", "encounters": [...] }`; create/detail/update return `{ "encounter": { ... } }`; close returns `{ "encounterId", "status", "closedAt" }`
- **Errors:** `400 errors.validation.invalidId`, `400 errors.validation.invalidEnum`, `400 errors.validation.required`, `403 errors.doctorPatient.onlyOwnPatients`, `404 errors.encounter.notFound`, `409 errors.encounter.appointmentAlreadyLinked`, `409 errors.encounter.closedImmutable`, `409 errors.encounter.alreadyClosed`, `409 errors.encounter.hasDraftPrescriptions`, `409 errors.encounter.hasDraftOrders`
- **Notes:**
  - `close` is blocked while draft prescriptions or draft encounter-orders still exist.
  - encounter close is distinct from order or prescription finalize.
  - create/update/close mutations are audit-logged.
  - create/detail/update/list payloads include minimized `doctor`, `patient`, and optional `appointment` summaries.

#### `GET /patient/prescriptions`

#### `GET /patient/prescriptions/:prescriptionId`

- **Role (auth):** `patient`
- **Description:** List or fetch finalized prescriptions visible to the authenticated patient.
- **Query params (`GET /patient/prescriptions`):** `page`, `limit`
- **Response keys:** list returns `{ "page", "limit", "total", "results", "prescriptions": [...] }`; detail returns `{ "prescription": { ... } }`
- **Errors:** `400 errors.validation.invalidId`, `404 errors.prescription.notFound`
- **Notes:** Non-finalized prescriptions are hidden from patient reads. Serialized prescriptions include a minimized `doctor` summary and encounter status metadata.

#### `GET /patient/encounters/:encounterId/prescriptions`

- **Role (auth):** `patient`
- **Description:** List finalized prescriptions for one patient-owned encounter.
- **Query params:** `page`, `limit`
- **Response keys:** `{ "page", "limit", "total", "results", "prescriptions": [...] }`
- **Errors:** `400 errors.validation.invalidId`, `404 errors.encounter.notFound`
- **Notes:** Access is strictly patient-owned and only finalized prescriptions are returned. This is an encounter-scoped filter over the same serialized prescription payload used by the patient self list.

#### `GET /doctors/:doctorId/patients/:patientId/encounters/:encounterId/prescriptions`

#### `POST /doctors/:doctorId/patients/:patientId/encounters/:encounterId/prescriptions`

#### `GET /doctors/:doctorId/patients/:patientId/encounters/:encounterId/prescriptions/:prescriptionId`

#### `PATCH /doctors/:doctorId/patients/:patientId/encounters/:encounterId/prescriptions/:prescriptionId`

#### `POST /doctors/:doctorId/patients/:patientId/encounters/:encounterId/prescriptions/:prescriptionId/items`

#### `PATCH /doctors/:doctorId/patients/:patientId/encounters/:encounterId/prescriptions/:prescriptionId/items/:itemId`

#### `DELETE /doctors/:doctorId/patients/:patientId/encounters/:encounterId/prescriptions/:prescriptionId/items/:itemId`

#### `POST /doctors/:doctorId/patients/:patientId/encounters/:encounterId/prescriptions/:prescriptionId/items/:itemId/duplicate`

#### `POST /doctors/:doctorId/patients/:patientId/encounters/:encounterId/prescriptions/:prescriptionId/finalize`

#### `GET /doctors/:doctorId/patients/:patientId/encounters/:encounterId/prescriptions/:prescriptionId/preview`

- **Role (auth):** `doctor`
- **Description:** Grouped prescription draft authoring inside an encounter.
- **Query params (`GET .../prescriptions`):** `status` (`draft | finalized`), `page`, `limit`
- **Body (`POST .../prescriptions`):** `generalInstructions?`, `notes?`, optional `items[]`
- **Item body fields (`POST/PATCH .../items`):** `name`, `dosage`, `frequency`, `duration`, `quantity`, `route`, `startDate`, `endDate`, `times[]`, `remindersEnabled`, `instructions`, `notes`, `sortOrder`, `source`
- **Response keys:**
  - list: `{ "page", "limit", "total", "results", "prescriptions": [...] }`
  - create/detail/update: `{ "prescription": { ... } }`
  - item add/update/duplicate: `{ "prescriptionId", "item": { ... }, "itemCount", "updatedAt" }`
  - item delete: `{ "prescriptionId", "itemId" }`
  - finalize: `{ "prescriptionId", "status", "finalizedAt" }`
  - preview: `{ "preview": { ...serializedPrescription, "itemCount", "canFinalize", "doctor", "patient", "encounter" } }`
- **Errors:** `400 errors.validation.invalidId`, `400 errors.validation.invalid`, `400 errors.validation.invalidDate`, `400 errors.validation.array`, `400 errors.validation.required`, `403 errors.doctorPatient.onlyOwnPatients`, `404 errors.encounter.notFound`, `404 errors.prescription.notFound`, `404 errors.prescription.itemNotFound`, `409 errors.prescription.encounterClosed`, `409 errors.prescription.notEditable`, `409 errors.prescription.alreadyFinalized`, `409 errors.prescription.finalizeRequiresItems`
- **Notes:**
  - grouped prescription state lives in the `Prescription` model, not directly in `patient.medications`
  - finalize syncs medication items into `patient.medications` with source metadata, `times[]`, and `remindersEnabled`
  - draft and preview actions do not notify the patient
  - mutations are audit-logged
  - create/detail/update/list payloads include minimized doctor/patient summaries rather than only raw ids

#### `GET /doctors/:doctorId/patients/:patientId/encounters/:encounterId/orders`

#### `POST /doctors/:doctorId/patients/:patientId/encounters/:encounterId/orders/lab`

#### `POST /doctors/:doctorId/patients/:patientId/encounters/:encounterId/orders/imaging`

#### `POST /doctors/:doctorId/patients/:patientId/encounters/:encounterId/orders/procedures`

#### `POST /doctors/:doctorId/patients/:patientId/encounters/:encounterId/orders/referrals`

#### `GET /doctors/:doctorId/patients/:patientId/encounters/:encounterId/orders/:orderId`

#### `PATCH /doctors/:doctorId/patients/:patientId/encounters/:encounterId/orders/:orderId`

#### `POST /doctors/:doctorId/patients/:patientId/encounters/:encounterId/orders/:orderId/items`

#### `PATCH /doctors/:doctorId/patients/:patientId/encounters/:encounterId/orders/:orderId/items/:itemId`

#### `DELETE /doctors/:doctorId/patients/:patientId/encounters/:encounterId/orders/:orderId/items/:itemId`

#### `POST /doctors/:doctorId/patients/:patientId/encounters/:encounterId/orders/:orderId/finalize`

#### `GET /doctors/:doctorId/patients/:patientId/encounters/:encounterId/orders/:orderId/preview`

- **Role (auth):** `doctor`
- **Description:** Encounter-bound draft-first lab, imaging, procedure, and referral authoring built on the existing `Order` domain.
- **Query params (`GET .../orders`):** `status` (uses the existing order status normalization), `page`, `limit`
- **Create body (`POST .../orders/lab|imaging|procedures|referrals`):** same typed order body family already used by the canonical order routes, plus encounter scope from the path
- **Update body (`PATCH .../orders/:orderId`):** same editable draft fields allowed by the canonical order update flow
- **Item body (`POST/PATCH .../orders/:orderId/items`):** one order item object validated by category/type-specific item rules. Referral drafts are structured letter-style orders and normally do not use item CRUD.
- **Finalize body:** optional `note`
- **Referral body (`POST .../orders/referrals`):**
  - required: `specialty`, `reason`
  - optional: `referralType`, `referredDoctorName`, `institution`, `clinicalSummary`, `questionsToColleague`, `notes`, `urgency`, `priority`, `attachments`
- **Response keys:**
  - list: `{ "page", "limit", "total", "results", "orders": [...] }`
  - create/detail/update: `{ "order": { ... } }`
  - item add/update: `{ "orderId", "item": { ... }, "itemCount", "updatedAt" }`
  - item delete: `{ "orderId", "itemId" }`
  - finalize: `{ "orderId", "encounterId", "statusCode", "status" }`
  - preview: `{ "order": { ... }, "encounter": { ... }, "doctor": { ... }, "patient": { ... }, "canFinalize": true|false }`
- **Errors:** `400 errors.validation.invalidId`, `400 errors.validation.invalid`, `400 errors.validation.required`, `403 errors.doctorPatient.onlyOwnPatients`, `404 errors.encounter.notFound`, `404 errors.orders.notFound`, `404 errors.orders.itemNotFound`, `409 errors.orders.encounterClosed`, `409 errors.orders.finalizeRequiresItems`, `409 errors.orders.finalizeRequiresReferralDetails`, `400 errors.orders.notEditable`
- **Notes:**
  - existing generic order routes remain supported
  - encounter orders reuse the existing order model with optional `encounterId`
  - draft creation and update suppress patient notifications until finalize
  - referral encounter drafts are created through `/orders/referrals` and then reuse the same detail, update, preview, finalize, and encounter-document flows
  - referral finalize is detail-driven rather than item-driven
  - item delete is for draft editing, not retrospective deletion of official orders

#### `GET /doctors/library/recent`

#### `GET /doctors/library/items`

#### `POST /doctors/library/items`

#### `GET /doctors/library/items/:itemId`

#### `PATCH /doctors/library/items/:itemId`

#### `DELETE /doctors/library/items/:itemId`

#### `PATCH /doctors/library/items/:itemId/favorite`

- **Role (auth):** `doctor`
- **Description:** Doctor-owned personal clinical shortcuts for medication, lab, imaging, and procedure items.
- **Query params (`GET /doctors/library/items`):** `page`, `limit`, `type`, `favorite`, `includeArchived`, `search`, `q`
- **Query params (`GET /doctors/library/recent`):** `limit` (`1..50`)
- **Body (`POST/PATCH /doctors/library/items`):** `type`, `label`, `source`, `catalogSection`, `catalogItemId`, `data`, `isFavorite`
- **Body (`PATCH /doctors/library/items/:itemId/favorite`):** `{ "isFavorite": true|false }`
- **Response keys:**
  - list: `{ "page", "limit", "total", "results", "items": [...] }`
  - recent: `{ "items": [...] }`
  - create/details/update: `{ "item": { ... } }`
  - favorite: `{ "itemId", "label", "isFavorite" }`
  - delete: `{ "itemId": "..." }`
- **Errors:** `400 errors.validation.invalidId`, `400 errors.validation.invalid`, `400 errors.validation.invalidEnum`, `400 errors.validation.invalidBoolean`, `400 errors.validation.required`, `409 errors.doctorLibrary.duplicateCatalogItem`
- **Notes:**
  - `DELETE /doctors/library/items/:itemId` is soft-archive behavior, not hard delete
  - medication items are doctor-owned shortcuts rather than a global medication catalog dependency
  - `recent` is usage-based. Creating a library item alone does not mark it as recently used.
  - `data` is normalized by `type`; unknown keys are not returned.
  - `MEDICATION.data`: `name`, `dosage`, `frequency`, `duration`, `quantity`, `route`, `startDate`, `endDate`, `times`, `remindersEnabled`, `instructions`, `notes`. `name` is required, with label/display-name fallback.
  - `LAB.data`: `source`, `catalogItemId`, `displayName`, `displayNameAr`, `displayNameEn`, `code`, `category`, `note`, `sortOrder`, `testName`, `testCode`, `specimenType`, `fastingRequired`, `collectionInstructions`, `notes`. `displayName` or `testName` is required.
  - `IMAGING.data`: `source`, `catalogItemId`, `displayName`, `displayNameAr`, `displayNameEn`, `code`, `category`, `note`, `sortOrder`, `side`, `withContrast`, `modality`, `bodyPart`, `clinicalHistory`, `notes`. `displayName`, `bodyPart`, or `modality` is required.
  - `PROCEDURE.data`: `source`, `catalogItemId`, `displayName`, `displayNameAr`, `displayNameEn`, `code`, `category`, `note`, `sortOrder`, `procedureName`, `procedureCode`, `indication`, `notes`. `displayName` or `procedureName` is required.

#### `GET /doctors/templates`

#### `POST /doctors/templates`

#### `GET /doctors/templates/:templateId`

#### `PATCH /doctors/templates/:templateId`

#### `DELETE /doctors/templates/:templateId`

#### `POST /doctors/templates/:templateId/apply`

- **Role (auth):** `doctor`
- **Description:** Doctor-owned reusable templates for prescription and encounter-order authoring, including referral drafts.
- **Query params (`GET /doctors/templates`):** `page`, `limit`, `type`, `includeArchived`, `search`, `q`
- **Body (`POST/PATCH /doctors/templates`):** `type`, `name`, `description`, `payload`
- **Allowed `type` values:** `PRESCRIPTION`, `LAB_ORDER`, `IMAGING_ORDER`, `PROCEDURE_ORDER`, `REFERRAL_ORDER`
- **Response keys:**
  - list: `{ "page", "limit", "total", "results", "templates": [...] }`
  - create/details/update: `{ "template": { ... } }`
  - delete: `{ "templateId": "..." }`
  - apply: `{ "templateId", "type", "name", "application": { ... } }`
- **Errors:** `400 errors.validation.invalidId`, `400 errors.validation.invalid`, `400 errors.validation.invalidEnum`, `400 errors.validation.required`, `404 errors.doctorTemplate.notFound`, `400 errors.doctorTemplate.invalidType`, `400 errors.doctorTemplate.invalidPayload`, `400 errors.doctorTemplate.nameRequired`
- **Notes:** template apply returns hydrated draft payload data; it does not silently mutate encounter records.

#### `GET /patient/encounters/:encounterId/documents`

#### `GET /patient/documents/:documentId`

- **Role (auth):** `patient`
- **Description:** Patient read access to encounter documents that have been explicitly shared.
- **Response keys:** list returns `{ "documents": [...] }`; detail returns `{ "document": { ... } }`
- **Errors:** `400 errors.validation.invalidId`, `404 errors.encounter.notFound`, `404 errors.encounterDocument.notFound`
- **Notes:** Unshared encounter documents are hidden from patient reads.

#### `GET /doctors/:doctorId/patients/:patientId/encounters/:encounterId/documents`

#### `POST /doctors/:doctorId/patients/:patientId/encounters/:encounterId/documents/link`

#### `POST /doctors/:doctorId/patients/:patientId/encounters/:encounterId/documents/:documentId/share`

- **Role (auth):** `doctor`
- **Description:** List, link, generate-and-link, and share encounter documents.
- **Body (`POST .../documents/link`):**
  - either `patientFileId`
  - or `sourceType` + `sourceId`
  - optional `title`, `note`, `tags[]`
- **Allowed `sourceType` values:** `patient_file`, `order`, `imaging_order`, `prescription`
- **Body (`POST .../documents/:documentId/share`):** optional `shareNote`
- **Response keys:** list returns `{ "documents": [...] }`; link returns `{ "document": { ... } }`; share returns `{ "documentId", "title", "sharedWithPatient", "sharedAt" }`
- **Errors:** `400 errors.validation.invalidId`, `400 errors.validation.invalid`, `400 errors.validation.invalidEnum`, `400 errors.validation.required`, `400 errors.encounterDocument.invalidSourceType`, `403 errors.doctorPatient.onlyOwnPatients`, `404 errors.encounter.notFound`, `404 errors.encounterDocument.notFound`, `404 errors.prescription.notFound`, `409 errors.encounterDocument.sourceMismatch`, `409 errors.encounterDocument.alreadyLinked`
- **Notes:**
  - encounter documents reuse the patient-file pipeline
  - share is the patient-visible notification point
  - first share sends the patient notification
  - generate-and-link is the persistence path for supported PDFs

#### `POST /doctors/orders`

- **Role (auth):** `doctor`
- **Description:** Backward-compatible create endpoint. Accepts legacy shape (`type`, `orderName`, `instructions`) and canonical typed shape (`orderType` and typed fields).
- **Compatibility behavior:**
  - Legacy `type` values map to typed order kinds:
    - `lab -> LAB_ORDER`
    - `imaging -> IMAGING_ORDER`
    - `other|procedure|medication -> PROCEDURE_ORDER`
    - `referral -> REFERRAL_ORDER`
  - Legacy mirrored fields are still returned in responses: `type`, `orderName`, `instructions`, `status`.
- **Create guardrails:**
  - `results` is rejected on create (use `POST /doctors/orders/:orderId/results` after order creation).
  - If `details` is provided, only order-type-allowed detail keys are persisted; unrelated keys are ignored.

#### `POST /doctors/orders/lab`

- **Role (auth):** `doctor`
- **Description:** Create `LAB_ORDER`.
- **Body (summary):** `patientId`, catalog/manual `items` (or `catalogItems` / `manualItems`), optional `labInstructions`, `clinicalReason`, `urgency`, `instructionsToPatient`, `attachments`.

#### `POST /doctors/orders/imaging`

- **Role (auth):** `doctor`
- **Description:** Create `IMAGING_ORDER`.
- **Body (summary):** `patientId`, catalog/manual items, optional `imagingCenterInstructions`, `clinicalQuestion`, `clinicalReason`, `urgency`, `instructionsToPatient`, `attachments`.

#### `POST /doctors/orders/procedures`

- **Role (auth):** `doctor`
- **Description:** Create `PROCEDURE_ORDER`.
- **Body (summary):** `patientId`, catalog/manual items, optional `place`, `preparation`, `aftercareInstructions`, `clinicalReason`, `notes`, `urgency`, `attachments`.

#### `POST /doctors/orders/referrals`

- **Role (auth):** `doctor`
- **Description:** Create `REFERRAL_ORDER` (structured; no catalog dependency).
- **Body (required):** `patientId`, `specialty`, `reason`.
- **Body (optional):** `referralType`, `referredDoctorName`, `institution`, `clinicalSummary`, `questionsToColleague`, `notes`, `urgency`.

#### `GET /doctors/orders`

- **Role (auth):** `doctor`
- **Description:** List orders owned by the authenticated doctor.
- **Query filters:** `patientId`, `orderType`, `category|type` (legacy), `statusCode|status`, `priority`, `q|search`, `from`, `to`, `page`, `limit`, `sort`.
- **Date filter semantics:** date-only values (`YYYY-MM-DD`) are interpreted as local calendar-day boundaries on the server (`from` at `00:00:00.000`, `to` at `23:59:59.999`). Full datetime values remain exact timestamps.
- **Response:** paginated list with canonical and legacy fields (including `orderType`, `category`, `type`, `orderTitle`, `orderName`, `statusCode`, `status`).

#### `GET /doctors/orders/:orderId`

- **Role (auth):** `doctor`
- **Description:** Full doctor-owned order details.

#### `PATCH /doctors/orders/:orderId`

- **Role (auth):** `doctor`
- **Description:** Update editable fields for non-terminal orders.
- **Notes:** Type/status mutation via this endpoint is rejected by validation/service rules.

#### `PATCH /doctors/orders/:orderId/cancel`

- **Role (auth):** `doctor`
- **Description:** Cancel a doctor-owned order with transition checks.
- **Body:** optional `note`.

#### `PATCH /doctors/orders/:orderId/status`

- **Role (auth):** `doctor`
- **Description:** Update order status with transition validation.

#### `POST /doctors/orders/:orderId/results`

- **Role (auth):** `doctor`
- **Description:** Append structured results to an order.
- **Lifecycle rules:**
  - Results can be appended only while status is `ACCEPTED` or `IN_PROGRESS`.
  - Results cannot be appended to terminal orders (`COMPLETED`, `CANCELLED`, `REJECTED`, `EXPIRED`).
  - `isFinal=true` can complete the order only when the same transition policy is valid (for example `IN_PROGRESS -> COMPLETED`).

#### `GET /doctors/order-catalog/lab-tests`

#### `GET /doctors/order-catalog/lab-tests/:id`

#### `GET /doctors/order-catalog/imaging`

#### `GET /doctors/order-catalog/imaging/:id`

#### `GET /doctors/order-catalog/procedures`

#### `GET /doctors/order-catalog/procedures/:id`

- **Role (auth):** `doctor`
- **Description:** Doctor-facing read-only catalog browsing.
- **Behavior:** Returns only `isActive=true` and `isVisible=true` items; supports `search|q`, `category`, `priorityLevel`, pagination, and allow-listed sort.
- **Response includes:** `isFavorited` marker for the current doctor.

#### `POST /doctors/order-favorites`

#### `GET /doctors/order-favorites`

#### `DELETE /doctors/order-favorites/:favoriteId`

- **Role (auth):** `doctor`
- **Description:** Doctor-specific favorites for catalog sections `LAB`, `IMAGING`, `PROCEDURE`.
- **Rules:** No referral favorites. Duplicate favorites return `409`.
- **List query:** `catalogSection|section`, `page`, `limit`.
- **List defaults:** sorted newest-first by `createdAt desc`, then `_id desc`.
- **List response:** `{ "page": 1, "limit": 20, "total": 3, "results": 3, "favorites": [...] }`.

#### `GET /admin/order-catalog/lab-tests`

#### `GET /admin/order-catalog/lab-tests/:id`

#### `POST /admin/order-catalog/lab-tests`

#### `PATCH /admin/order-catalog/lab-tests/:id`

#### `GET /admin/order-catalog/imaging`

#### `GET /admin/order-catalog/imaging/:id`

#### `POST /admin/order-catalog/imaging`

#### `PATCH /admin/order-catalog/imaging/:id`

#### `GET /admin/order-catalog/procedures`

#### `GET /admin/order-catalog/procedures/:id`

#### `POST /admin/order-catalog/procedures`

#### `PATCH /admin/order-catalog/procedures/:id`

- **Role (auth):** `admin`, `data_entry`
- **Description:** Admin/data-entry CRUD for order master catalogs.
- **Behavior:** Supports search/filter/pagination/sort. Operational visibility is managed with `isActive` and `isVisible` via `PATCH`.
- **Audit:** create/update catalog mutations are audited with admin action names; list endpoints are not audited.

#### `GET /doctors/analytics/diagnosis`

- **Description:** Doctor diagnosis analytics (counts of diagnosis events per period).
- **Auth:** Doctor
- **Diagnosis definition:** A diagnosis is recorded when a doctor creates a medical record for a patient (medical record creation is the canonical event).
- **Query params:** `range` (`day`/`week`/`month`/`year`, default `day`), `from`, `to` (YYYY-MM-DD, optional).
- **Defaults:** `day` -> last 7 days, `week` -> last 8 weeks, `month` -> last 12 months, `year` -> last 5 years.
- **Sample request:**

  ```bash
  curl -G "http://localhost:5000/api/doctors/analytics/diagnosis" \
    -H "Authorization: Bearer <doctor-token>" \
    --data-urlencode "range=week" \
    --data-urlencode "from=2026-01-01" \
    --data-urlencode "to=2026-02-01"
  ```

- **Response:**

  ```json
  {
    "range": "week",
    "from": "2026-01-05T00:00:00.000Z",
    "to": "2026-02-02T00:00:00.000Z",
    "series": [{ "periodStart": "2026-01-05T00:00:00.000Z", "count": 12 }],
    "total": 123
  }
  ```

- **Notes:** `series` is sorted ascending by `periodStart`.

#### `GET /doctors/analytics/summary`

- **Description:** Doctor activity analytics (consultations, orders, access requests, medical records, completed/no-show appointments, new linked patients).
- **Auth:** Doctor
- **Activity definitions:**
  - `consultations`: online consultation tickets created for the doctor.
  - `ordersCreated`: lab/imaging/other orders created by the doctor.
  - `accessRequests`: access requests created by the doctor.
  - `medicalRecords`: medical records created by the doctor.
  - `appointmentsCompleted`: appointments marked completed by the doctor.
  - `appointmentsNoShow`: appointments marked no-show by the doctor.
  - `newLinkedPatients`: new patient links added to the doctor.
- **Query params:** `range` (`day`/`week`/`month`/`year`, default `day`), `from`, `to` (YYYY-MM-DD, optional).
- **Defaults:** `day` -> last 7 days, `week` -> last 8 weeks, `month` -> last 12 months, `year` -> last 5 years.
- **Response:**

  ```json
  {
    "range": "month",
    "from": "2026-01-01T00:00:00.000Z",
    "to": "2026-03-01T00:00:00.000Z",
    "series": [
      {
        "periodStart": "2026-01-01T00:00:00.000Z",
        "consultations": 3,
        "ordersCreated": 5,
        "accessRequests": 2,
        "medicalRecords": 4,
        "appointmentsCompleted": 6,
        "appointmentsNoShow": 1,
        "newLinkedPatients": 2
      }
    ],
    "totals": {
      "consultations": 3,
      "ordersCreated": 5,
      "accessRequests": 2,
      "medicalRecords": 4,
      "appointmentsCompleted": 6,
      "appointmentsNoShow": 1,
      "newLinkedPatients": 2
    }
  }
  ```

#### `POST /doctors/:doctorId/patients/:patientId/link`

- **Description:** Adds an existing patient profile to the doctor’s list and mirrors the link on the patient record (`visitedDoctors`). Doctor must be approved and the path `doctorId` must match the authenticated doctor.
- **Role:** `doctor`
- **Response:**

  ```json
  {
    "message": "Patient added to doctor list.",
    "doctorId": "64f...doctor",
    "patientId": "64f...patient"
  }
  ```

- **Already linked:** returns `200` with `{ "message": "Patient already linked to doctor." }`

#### `GET /doctors/:doctorId/patients/:patientId`

- **Role (auth):** `doctor`
- **Description:** Return the full linked-patient profile for the authenticated doctor. Authorization uses the authenticated doctor profile, and `:doctorId` must match that doctor profile `_id` or `userId`.

**Params**

| Name        | In   | Type     | Required | Notes                                         |
| :---------- | :--- | :------- | :------- | :-------------------------------------------- |
| `doctorId`  | path | ObjectId | Yes      | Must match the authenticated doctor identity. |
| `patientId` | path | ObjectId | Yes      |                                               |

**Request body schema**

`None`

**Response example**

```json
{
  "messageKey": "success.ok",
  "message": "Request completed successfully.",
  "patient": {
    "_id": "65f0c4f6e6a0d0d0d0d0d111",
    "patientId": "65f0c4f6e6a0d0d0d0d0d111",
    "allowDoctorsViewProfile": false,
    "heightCm": 170,
    "weightKg": 70,
    "measurementUnit": "metric",
    "bloodType": "O+",
    "dateOfBirth": "1990-01-01T00:00:00.000Z",
    "age": 36,
    "bmi": 24.2,
    "allergies": ["penicillin"],
    "medicalConditions": ["asthma"],
    "user": {
      "_id": "65f0c4f6e6a0d0d0d0d0d131",
      "fullName": "Jane Patient",
      "email": "jane@example.com",
      "phone": "+201234567890",
      "photoUrl": "/uploads/users/jane.jpg"
    },
    "medicalHistory": [],
    "files": [],
    "medications": [],
    "orders": []
  }
}
```

**Errors**

- `400` `errors.validation.invalidId`
- `403` `errors.doctorPatient.onlyOwnPatients`
- `403` `errors.doctorPatient.notLinked`
- `403` `errors.accessRequest.approvalRequired`
- `403` `errors.doctor.notApproved`
- `404` `errors.patient.profileNotFound`
- `404` `errors.doctorProfile.notFound`

Example:

```json
{
  "status": 403,
  "messageKey": "errors.accessRequest.approvalRequired",
  "message": "Patient approval required.",
  "errors": null,
  "accessRequired": true,
  "pendingRequestId": "65f0c4f6e6a0d0d0d0d0d311"
}
```

**Notes**

- Access is allowed when either the patient toggle `allowDoctorsViewProfile` is `true` or the doctor has a non-expired approved profile access request.
- The `403` approval-required error includes additive hints only because the backend explicitly whitelists `accessRequired` and `pendingRequestId`.
- When `medicationSource` is provided, only the matching medication subset is returned inside the patient profile payload.

#### `POST /doctors/:doctorId/patients/:patientId/medical-history`

- **Role (auth):** `doctor`
- **Description:** Legacy (still supported). Create a doctor-authored medical record entry for a linked patient.

**Params**

| Name        | In   | Type     | Required | Notes                                         |
| :---------- | :--- | :------- | :------- | :-------------------------------------------- |
| `doctorId`  | path | ObjectId | Yes      | Must match the authenticated doctor identity. |
| `patientId` | path | ObjectId | Yes      |                                               |

**Request body schema**

```json
{
  "title": "Hypertension follow-up",
  "diagnosis": "Type 2 diabetes",
  "prescriptions": ["Metformin 500mg"],
  "attachments": ["patient-files/patient/65f0c4f6e6a0d0d0d0d0d011/a1c.pdf"],
  "followUpRequired": true
}
```

**Response example**

```json
{
  "messageKey": "success.doctorPatient.medicalHistoryAdded",
  "message": "Medical history added.",
  "record": {
    "_id": "65f0c4f6e6a0d0d0d0d0d411",
    "patient": "65f0c4f6e6a0d0d0d0d0d111",
    "doctor": "65f0c4f6e6a0d0d0d0d0d121",
    "title": "Hypertension follow-up",
    "diagnosis": "Type 2 diabetes",
    "prescriptions": ["Metformin 500mg"],
    "attachments": ["patient-files/patient/65f0c4f6e6a0d0d0d0d0d011/a1c.pdf"],
    "followUpRequired": true
  }
}
```

**Errors**

- `400` `errors.validation.invalid`
- `400` `errors.validation.array`
- `400` `errors.validation.invalidBoolean`
- `403` `errors.doctorPatient.onlyOwnPatients`
- `403` `errors.doctorPatient.notLinked`
- `403` `errors.doctor.notApproved`
- `404` `errors.patient.profileNotFound`

Example:

```json
{
  "status": 403,
  "messageKey": "errors.doctorPatient.notLinked",
  "message": "Doctor and patient are not linked.",
  "errors": null
}
```

**Notes**

- This route and the newer `/medical-records` create route both create `MedicalRecord` documents.

#### `GET /doctors/:doctorId/patients/:patientId/medical-records`

- **Role (auth):** `doctor`
- **Description:** List all medical records for a linked patient.

**Params**

| Name        | In   | Type     | Required | Notes                                         |
| :---------- | :--- | :------- | :------- | :-------------------------------------------- |
| `doctorId`  | path | ObjectId | Yes      | Must match the authenticated doctor identity. |
| `patientId` | path | ObjectId | Yes      |                                               |

**Request body schema**

`None`

**Response example**

```json
{
  "messageKey": "success.ok",
  "message": "Request completed successfully.",
  "records": [
    {
      "_id": "65f0c4f6e6a0d0d0d0d0d411",
      "patient": "65f0c4f6e6a0d0d0d0d0d111",
      "doctor": "65f0c4f6e6a0d0d0d0d0d121",
      "doctorSummary": {
        "_id": "65f0c4f6e6a0d0d0d0d0d121",
        "fullName": "Dr. Mona",
        "specialization": "Cardiology"
      },
      "title": "Hypertension follow-up",
      "diagnosis": "Type 2 diabetes",
      "prescriptions": ["Metformin 500mg"],
      "attachments": [
        {
          "_id": "65f0c4f6e6a0d0d0d0d0d711",
          "name": "a1c.pdf"
        }
      ],
      "followUpRequired": true,
      "date": "2026-03-04T10:00:00.000Z",
      "createdAt": "2026-03-04T10:00:00.000Z",
      "updatedAt": "2026-03-04T10:00:00.000Z"
    }
  ]
}
```

**Errors**

- `400` `errors.validation.invalidId`
- `403` `errors.doctorPatient.onlyOwnPatients`
- `403` `errors.doctorPatient.notLinked`
- `403` `errors.doctor.notApproved`
- `404` `errors.patient.profileNotFound`

Example:

```json
{
  "status": 403,
  "messageKey": "errors.doctorPatient.onlyOwnPatients",
  "message": "You can only manage your own patients.",
  "errors": null
}
```

**Notes**

- This route is link-scoped. The route-level guard does not itself add `accessRequired` hints here.
- Returned records preserve the `doctor` id and include `doctorSummary` with `_id`, `fullName`, and `specialization`.
- Returned `attachments` are objects with `_id` and `name`.

#### `POST /doctors/:doctorId/patients/:patientId/medical-records`

- **Role (auth):** `doctor`
- **Description:** Create a medical record for a linked patient. The doctor is taken from the authenticated context, not from the request body.

**Params**

| Name        | In   | Type     | Required | Notes                                         |
| :---------- | :--- | :------- | :------- | :-------------------------------------------- |
| `doctorId`  | path | ObjectId | Yes      | Must match the authenticated doctor identity. |
| `patientId` | path | ObjectId | Yes      |                                               |

**Request body schema**

```json
{
  "title": "Hypertension follow-up",
  "diagnosis": "Type 2 diabetes",
  "prescriptions": ["Metformin 500mg"],
  "attachments": ["patient-files/patient/65f0c4f6e6a0d0d0d0d0d011/a1c.pdf"],
  "followUpRequired": true
}
```

**Response example**

```json
{
  "messageKey": "success.ok",
  "message": "Request completed successfully.",
  "record": {
    "_id": "65f0c4f6e6a0d0d0d0d0d412",
    "patient": "65f0c4f6e6a0d0d0d0d0d111",
    "doctor": "65f0c4f6e6a0d0d0d0d0d121",
    "title": "Hypertension follow-up",
    "diagnosis": "Type 2 diabetes",
    "prescriptions": ["Metformin 500mg"],
    "attachments": ["patient-files/patient/65f0c4f6e6a0d0d0d0d0d011/a1c.pdf"],
    "followUpRequired": true
  }
}
```

**Errors**

- `400` `errors.validation.invalid`
- `400` `errors.validation.array`
- `400` `errors.validation.invalidBoolean`
- `400` `errors.validation.invalidId`
- `403` `errors.doctorPatient.onlyOwnPatients`
- `403` `errors.doctorPatient.notLinked`
- `403` `errors.doctor.notApproved`
- `404` `errors.patient.profileNotFound`

Example:

```json
{
  "status": 400,
  "messageKey": "errors.validation.invalidBoolean",
  "message": "Invalid boolean value.",
  "errors": null
}
```

**Notes**

- This route returns the raw record document payload, wrapped by the global success envelope.

#### `GET /doctors/:doctorId/patients/:patientId/medical-records/:recordId`

- **Role (auth):** `doctor`
- **Description:** Return one medical record for the linked patient.

**Params**

| Name        | In   | Type     | Required | Notes                                         |
| :---------- | :--- | :------- | :------- | :-------------------------------------------- |
| `doctorId`  | path | ObjectId | Yes      | Must match the authenticated doctor identity. |
| `patientId` | path | ObjectId | Yes      |                                               |
| `recordId`  | path | ObjectId | Yes      |                                               |

**Request body schema**

`None`

**Response example**

```json
{
  "messageKey": "success.ok",
  "message": "Request completed successfully.",
  "record": {
    "_id": "65f0c4f6e6a0d0d0d0d0d412",
    "patient": "65f0c4f6e6a0d0d0d0d0d111",
    "doctor": "65f0c4f6e6a0d0d0d0d0d121",
    "doctorSummary": {
      "_id": "65f0c4f6e6a0d0d0d0d0d121",
      "fullName": "Dr. Mona",
      "specialization": "Cardiology"
    },
    "title": "Hypertension follow-up",
    "diagnosis": "Type 2 diabetes",
    "prescriptions": ["Metformin 500mg"],
    "attachments": [
      {
        "_id": "65f0c4f6e6a0d0d0d0d0d711",
        "name": "a1c.pdf"
      }
    ],
    "followUpRequired": true
  }
}
```

**Errors**

- `400` `errors.validation.invalidId`
- `403` `errors.doctorPatient.onlyOwnPatients`
- `403` `errors.doctorPatient.notLinked`
- `404` `errors.patient.profileNotFound`
- `404` `errors.medicalRecord.notFoundForPatient`

Example:

```json
{
  "status": 404,
  "messageKey": "errors.medicalRecord.notFoundForPatient",
  "message": "Medical record not found for patient.",
  "errors": null
}
```

#### `PATCH /doctors/:doctorId/patients/:patientId/medical-records/:recordId`

- **Role (auth):** `doctor`
- **Description:** Update a doctor-authored medical record. At least one supported field must be present.

**Params**

| Name        | In   | Type     | Required | Notes                                         |
| :---------- | :--- | :------- | :------- | :-------------------------------------------- |
| `doctorId`  | path | ObjectId | Yes      | Must match the authenticated doctor identity. |
| `patientId` | path | ObjectId | Yes      |                                               |
| `recordId`  | path | ObjectId | Yes      |                                               |

**Request body schema**

```json
{
  "title": "Updated title",
  "diagnosis": "Updated diagnosis",
  "prescriptions": ["Updated prescription"],
  "attachments": ["patient-files/patient/65f0c4f6e6a0d0d0d0d0d011/new.pdf"],
  "followUpRequired": false
}
```

**Response example**

```json
{
  "messageKey": "success.ok",
  "message": "Request completed successfully.",
  "record": {
    "_id": "65f0c4f6e6a0d0d0d0d0d412",
    "title": "Updated title",
    "diagnosis": "Updated diagnosis",
    "prescriptions": ["Updated prescription"],
    "attachments": ["patient-files/patient/65f0c4f6e6a0d0d0d0d0d011/new.pdf"],
    "followUpRequired": false
  }
}
```

**Errors**

- `400` `errors.validation.required`
- `400` `errors.validation.invalid`
- `400` `errors.validation.array`
- `400` `errors.validation.invalidBoolean`
- `400` `errors.validation.invalidId`
- `403` `errors.medicalRecord.updateForbidden`
- `403` `errors.doctorPatient.onlyOwnPatients`
- `403` `errors.doctor.notApproved`
- `404` `errors.medicalRecord.notFound`

Example:

```json
{
  "status": 403,
  "messageKey": "errors.medicalRecord.updateForbidden",
  "message": "Not allowed to update this medical record.",
  "errors": null
}
```

**Notes**

- The backend allows updates only by the doctor who originally authored the record.

#### `POST /doctors/:doctorId/patients/:patientId/medications`

- **Description:** Add a medication entry for a linked patient (records `prescribedBy` as the doctor’s user and stores `sourceType: "doctor"`).
- **Role:** `doctor`
- **Body example:**

  ```json
  {
    "name": "Ibuprofen",
    "dosage": "400mg",
    "frequency": "Twice daily",
    "startDate": "2025-11-01",
    "endDate": "2025-11-15",
    "times": ["08:00", "20:00"],
    "remindersEnabled": true,
    "notes": "Take with food"
  }
  ```

- **Response:** `{ "message": "Medication added", "medication": { "_id": "64f...med", "name": "Ibuprofen" } }`
- **Notifications:** patient is notified when a medication is added.
- **Reminder behavior:** when `remindersEnabled=true` and `times[]` is valid, recurring reminder notifications are evaluated in the patient's timezone.
- **Error (not linked):** `403 Forbidden` — `{ "message": "Patient is not in your list. Add them first." }`

#### `POST /doctors/:doctorId/patients/:patientId/access-requests`

- **Role (auth):** `doctor`
- **Description:** Create, reuse, or short-circuit a patient profile access request for a linked patient.

**Params**

| Name        | In   | Type     | Required | Notes                                         |
| :---------- | :--- | :------- | :------- | :-------------------------------------------- |
| `doctorId`  | path | ObjectId | Yes      | Must match the authenticated doctor identity. |
| `patientId` | path | ObjectId | Yes      |                                               |

**Request body schema**

```json
{
  "reason": "Need to review your profile before follow-up",
  "items": [
    {
      "type": "medicalRecord",
      "refId": "65f0c4f6e6a0d0d0d0d0d412",
      "description": "legacy payload still accepted"
    }
  ],
  "expiresAt": "2026-04-01T00:00:00.000Z"
}
```

**Response example (`201`, new pending request)**

```json
{
  "messageKey": "success.accessRequest.created",
  "message": "Access request created.",
  "request": {
    "_id": "65f0c4f6e6a0d0d0d0d0d311",
    "status": "pending",
    "scope": "PROFILE",
    "reason": "Need to review your profile before follow-up",
    "createdAt": "2026-03-04T10:00:00.000Z",
    "updatedAt": "2026-03-04T10:00:00.000Z",
    "decidedAt": null,
    "expiresAt": "2026-04-01T00:00:00.000Z",
    "requestedItems": [
      {
        "type": "medicalRecord",
        "refId": "65f0c4f6e6a0d0d0d0d0d412",
        "description": "legacy payload still accepted"
      }
    ]
  }
}
```

**Alternative success responses**

- Patient toggle already on:

  ```json
  {
    "messageKey": "success.accessRequest.alreadyAllowed",
    "message": "Access is already allowed for this patient.",
    "accessAlreadyAllowed": true,
    "request": null
  }
  ```

- Pending request already exists:

  ```json
  {
    "messageKey": "success.accessRequest.pendingExists",
    "message": "An access request is already pending for this patient.",
    "pendingRequestId": "65f0c4f6e6a0d0d0d0d0d311",
    "request": {
      "_id": "65f0c4f6e6a0d0d0d0d0d311",
      "status": "pending",
      "scope": "PROFILE"
    }
  }
  ```

**Errors**

- `400` `errors.validation.array`
- `400` `errors.validation.invalidEnum`
- `400` `errors.validation.invalidId`
- `400` `errors.validation.invalidDate`
- `403` `errors.doctorPatient.onlyOwnPatients`
- `403` `errors.doctorPatient.notLinked`
- `403` `errors.doctor.notApproved`
- `404` `errors.patient.notFound`

Example:

```json
{
  "status": 400,
  "messageKey": "errors.validation.invalidDate",
  "message": "Invalid date.",
  "errors": null
}
```

**Notes**

- Access requests are profile-level. Legacy `items[]` is stored as `requestedItems` but does not gate permission decisions.
- `expiresAt` is accepted and stored, but profile access is still evaluated at the request scope, not per item.

#### `GET /doctors/:doctorId/patients/:patientId/access-requests/:requestId/details`

- **Role (auth):** `doctor`
- **Description:** Compatibility route that returns full-profile-compatible data after access is available.

**Params**

| Name        | In   | Type     | Required | Notes                                         |
| :---------- | :--- | :------- | :------- | :-------------------------------------------- |
| `doctorId`  | path | ObjectId | Yes      | Must match the authenticated doctor identity. |
| `patientId` | path | ObjectId | Yes      |                                               |
| `requestId` | path | ObjectId | Yes      |                                               |

**Request body schema**

`None`

**Response example**

```json
{
  "messageKey": "success.ok",
  "message": "Request completed successfully.",
  "requestId": "65f0c4f6e6a0d0d0d0d0d311",
  "patient": {
    "_id": "65f0c4f6e6a0d0d0d0d0d111",
    "user": {
      "_id": "65f0c4f6e6a0d0d0d0d0d131",
      "fullName": "Jane Patient"
    }
  },
  "medicalRecords": [],
  "files": [],
  "medications": [],
  "orders": []
}
```

**Errors**

- `400` `errors.validation.invalidId`
- `403` `errors.doctorPatient.onlyOwnPatients`
- `403` `errors.doctorPatient.notLinked`
- `403` `errors.accessRequest.approvalRequired`
- `403` `errors.accessRequest.notApproved`
- `404` `errors.accessRequest.notFound`
- `404` `errors.patient.profileNotFound`

Example:

```json
{
  "status": 403,
  "messageKey": "errors.accessRequest.notApproved",
  "message": "Access request is not approved.",
  "errors": null
}
```

**Notes**

- If the patient toggle is on, this route may still succeed even if the referenced request is not the active approval source.

### Patient access requests (patient-only)

#### `GET /patient/access-requests`

- **Role (auth):** `patient`
- **Description:** List incoming profile access requests for the authenticated patient.

**Params**

| Name       | In    | Type     | Required | Notes                                       |
| :--------- | :---- | :------- | :------- | :------------------------------------------ |
| `status`   | query | string   | No       | `pending`, `approved`, `denied`, `expired`. |
| `doctorId` | query | ObjectId | No       | Allowed for patients on this route.         |
| `from`     | query | ISO date | No       | Created-at lower bound.                     |
| `to`       | query | ISO date | No       | Created-at upper bound.                     |
| `page`     | query | integer  | No       | Default `1`.                                |
| `limit`    | query | integer  | No       | Default `20`, max `100`.                    |

**Request body schema**

`None`

**Response example**

```json
{
  "messageKey": "success.ok",
  "message": "Request completed successfully.",
  "page": 1,
  "limit": 20,
  "total": 1,
  "results": 1,
  "requests": [
    {
      "_id": "65f0c4f6e6a0d0d0d0d0d311",
      "status": "pending",
      "scope": "PROFILE",
      "reason": "Need to review your profile before follow-up",
      "requester": {
        "_id": "65f0c4f6e6a0d0d0d0d0d121",
        "specialization": "Cardiology",
        "userId": {
          "_id": "65f0c4f6e6a0d0d0d0d0d141",
          "fullName": "Dr John Doe",
          "photoUrl": "/uploads/users/john.jpg"
        }
      }
    }
  ]
}
```

**Errors**

- `400` `errors.validation.invalidEnum`
- `400` `errors.validation.invalidId`
- `400` `errors.validation.invalidDate`
- `400` `errors.validation.invalidNumber`
- `404` `errors.patient.profileNotFound`

Example:

```json
{
  "status": 400,
  "messageKey": "errors.validation.invalidNumber",
  "message": "Invalid number.",
  "errors": null
}
```

#### `PATCH /patient/access-requests/:requestId`

- **Role (auth):** `patient`
- **Description:** Approve or deny a profile access request owned by the authenticated patient.

**Params**

| Name        | In   | Type     | Required | Notes |
| :---------- | :--- | :------- | :------- | :---- |
| `requestId` | path | ObjectId | Yes      |       |

**Request body schema**

```json
{
  "decision": "approved"
}
```

Supported values: `approved`, `denied`

**Response example**

```json
{
  "messageKey": "success.accessRequest.updated",
  "message": "Access request updated.",
  "status": "approved"
}
```

**Already reviewed response (`200`)**

```json
{
  "messageKey": "success.accessRequest.alreadyReviewed",
  "message": "Access request already reviewed.",
  "alreadyReviewed": true,
  "status": "approved"
}
```

**Errors**

- `400` `errors.validation.invalidId`
- `400` `errors.validation.invalidEnum`
- `404` `errors.accessRequest.notFound`
- `404` `errors.patient.profileNotFound`

Example:

```json
{
  "status": 404,
  "messageKey": "errors.accessRequest.notFound",
  "message": "Access request not found.",
  "errors": null
}
```

**Notes**

- The idempotent `alreadyReviewed` response exists in code and is documented intentionally.

#### `GET /doctors/:doctorId/patients/:patientId/medical-history/:recordId`

- **Role (auth):** `doctor`
- **Description:** Legacy (still supported). Return a single medical record when the doctor authored it, or when the doctor otherwise has full-profile access.

**Params**

| Name        | In   | Type     | Required | Notes                                         |
| :---------- | :--- | :------- | :------- | :-------------------------------------------- |
| `doctorId`  | path | ObjectId | Yes      | Must match the authenticated doctor identity. |
| `patientId` | path | ObjectId | Yes      |                                               |
| `recordId`  | path | ObjectId | Yes      |                                               |

**Request body schema**

`None`

**Response example**

```json
{
  "messageKey": "success.ok",
  "message": "Request completed successfully.",
  "record": {
    "_id": "65f0c4f6e6a0d0d0d0d0d412",
    "title": "Hypertension follow-up",
    "diagnosis": "Type 2 diabetes",
    "attachments": [],
    "followUpRequired": true
  }
}
```

**Errors**

- `400` `errors.validation.invalidId`
- `403` `errors.doctorPatient.onlyOwnPatients`
- `403` `errors.doctorPatient.notLinked`
- `403` `errors.accessRequest.approvalRequired`
- `403` `errors.doctor.notApproved`
- `404` `errors.patient.profileNotFound`
- `404` `errors.medicalRecord.notFoundForPatient`

Example:

```json
{
  "status": 403,
  "messageKey": "errors.accessRequest.approvalRequired",
  "message": "Patient approval required.",
  "errors": null,
  "accessRequired": true,
  "pendingRequestId": null
}
```

**Notes**

- This direct-read route exists specifically to preserve authored-by-doctor access behavior for older clients.

### Access-request lifecycle (summary)

- Patient privacy toggle defaults to `false`.
- Doctors must already be linked to the patient before request creation succeeds.
- Approval is profile-level, not item-level.
- If the privacy toggle is enabled, profile access is immediate for linked approved doctors.
- If the privacy toggle is disabled, the doctor creates or reuses a `PROFILE` request.
- Patient review is performed through `/api/patient/access-requests/:requestId` or the legacy `/api/access-requests/:id/approve|reject` routes.
- Expired approved requests are ignored for future permission checks; they are not auto-mutated to a new status.

### Access & Profile Execution Flows (Detailed)

#### Flow: `PATCH /api/patient/settings/privacy`

1. Patient auth middleware stack loads `req.patient`.
2. `updatePatientPrivacyValidator` + `validate` enforce either the legacy flat toggle or the nested `privacySettings` object.
3. Service loads patient profile by authenticated `userId`.
4. Nested input wins if both flat and nested toggle values are sent.
5. Backend persists both the top-level `allowDoctorsViewProfile` and the nested `privacySettings.allowDoctorsViewProfile` in sync.
6. Audit event `ACCESS_TOGGLE_UPDATED` is written with before/after values so patient activity logs continue to surface the change.
7. Response returns `200` with normalized privacy summary data.

#### Flow: `GET /api/patient/settings/privacy`

1. Patient auth middleware stack loads the authenticated patient context.
2. Service loads the patient profile by authenticated `userId`.
3. Backend normalizes legacy records:
   - nested `privacySettings.allowDoctorsViewProfile` falls back to the flat toggle,
   - `shareMedicalData` defaults to `false`,
   - consent defaults to `status=unknown`, `contentSlug=data-sharing-consent`, `version=null`.
4. Response returns `200` with `messageKey: success.patientSettings.privacyLoaded`, the flat toggle, nested privacy settings, and the consent snapshot.

#### Flow: `POST /api/patient/settings/privacy/consent`

1. Patient auth middleware stack loads the authenticated patient context.
2. Validator accepts only `status=accepted|declined`.
3. Service loads the published `SETTINGS_PAGE` content item with slug `data-sharing-consent`.
4. Backend requires a non-empty `pageVersion`; otherwise it fails with `errors.patientSettings.consentContentNotConfigured`.
5. Consent state is persisted on the patient:
   - `status`
   - `contentSlug`
   - `version`
   - `acceptedAt` only when status is `accepted`
   - `updatedAt` on every write
6. Audit event `DATA_SHARING_CONSENT_UPDATED` is written.
7. Response returns `200` with the same normalized privacy summary shape used by the read route.

#### Flow: `GET /api/doctors/:doctorId/patients/:patientId`

1. `doctorPatientGuard` enforces:
   - doctor role and approved status,
   - `:doctorId` must match authenticated doctor profile `_id` or `userId`,
   - target patient exists.
2. Service calls `canDoctorViewPatientProfile`:
   - if toggle is enabled, access is granted immediately,
   - otherwise an approved, non-expired profile request is required.
3. If denied, backend throws `errors.accessRequest.approvalRequired` with additive fields (`accessRequired`, `pendingRequestId`).
4. If allowed, full profile payload is assembled via `buildFullPatientProfile`.
5. Response returns `200` with `messageKey: success.ok` and `patient`.

#### Flow: `POST /api/doctors/:doctorId/patients/:patientId/access-requests`

1. Doctor auth + route guards validate doctor scope and canonical doctor-patient link.
2. Validator accepts profile-level payload (`reason`, legacy `items[]`, legacy `expiresAt`).
3. Service `createAccessRequest` enforces patient account availability.
4. If patient toggle is already enabled, request is short-circuited with `success.accessRequest.alreadyAllowed`.
5. If an existing pending profile request exists, response is `success.accessRequest.pendingExists`.
6. Otherwise a new `AccessRequest` is created (`scope=PROFILE`, legacy items stored as `requestedItems`).
7. Notifications and audit (`ACCESS_REQUEST_CREATED`) are written.
8. Endpoint returns `201` with one of the success `messageKey` variants above.

#### Flow: `POST /api/access-requests/:doctorId/patients/:patientId` (Legacy)

1. Middleware chain: doctor auth, `loadUserModelsGuard`, validators, `doctorPatientGuard`.
2. Legacy controller delegates to the same `createAccessRequest` service used by doctor-scoped route.
3. Behavior and response message keys are intentionally aligned with the modern doctor route.

#### Flow: `GET /api/access-requests`

1. Auth allows `patient | doctor | admin`.
2. `accessRequestsListQueryValidator` enforces role-safe filters and pagination.
3. Controller dispatches by role:
   - patient -> `listAccessRequestsForPatient`,
   - doctor -> `listAccessRequestsForDoctor`,
   - admin -> `listAccessRequestsForAdmin`.
4. Service builds Mongo query (`status`, actor filters, date range), runs paginated fetch + count.
5. Response returns `200` with `messageKey: success.ok`, pagination fields, and `requests`.

#### Flow: `GET /api/access-requests/:id`

1. Auth allows `patient | doctor | admin`.
2. Route validates the request id and loads actor context from the standard auth/guard stack.
3. Service loads the target `AccessRequest` with lightweight requester and patient summaries.
4. Ownership rules are enforced:
   - patient must own `request.patient`
   - doctor must own `request.requester`
   - admin has unrestricted access
5. Backend returns safe metadata only. It does not expose full profile data, files, orders, medical records, or other PHI payloads from this route.
6. Response returns `200` with `messageKey: success.accessRequest.details` and the summary payload.

#### Flow: `PATCH /api/patient/access-requests/:requestId`

1. Patient auth + decision validator (`approved|denied`).
2. Service loads request scoped to authenticated patient only.
3. If request is not pending, idempotent response is returned (`success.accessRequest.alreadyReviewed`, `alreadyReviewed=true`).
4. Pending request is updated (`status`, `decidedAt`, `reviewedAt`), doctor is notified, audit `ACCESS_REQUEST_DECIDED` is written.
5. Response returns `200` with `messageKey: success.accessRequest.updated`.

#### Flow: `PATCH /api/access-requests/:id/approve` and `PATCH /api/access-requests/:id/reject` (Legacy)

1. Patient auth middleware runs.
2. Legacy controller calls `reviewAccessRequestByPatient` with fixed decision (`approved` or `denied`).
3. Idempotent and audit behavior is identical to `/api/patient/access-requests/:requestId`.

#### Flow: `GET /api/doctors/:doctorId/patients/:patientId/access-requests/:requestId/details`

1. Doctor auth + `doctorPatientGuard` validate scope and linking.
2. Service loads referenced request and verifies it belongs to the same doctor+patient.
3. Access decision:
   - allowed if referenced request is still approved and valid, or
   - allowed if current profile access passes by toggle/another active approval source.
4. On failure, backend returns `errors.accessRequest.notApproved`.
5. On success, full profile details are returned (`patient`, `medicalRecords`, `files`, `medications`, `orders`).

#### Flow: `GET /api/access-requests/:id/details` (Legacy)

1. Doctor auth + `accessRequestDetailsQueryValidator` requires `patientId` query context.
2. Controller resolves target patient and delegates to `getApprovedAccessDetailsForDoctor`.
3. Authorization and response behavior match doctor-scoped details route above.

#### Flow: `GET /api/doctors/me/profile-change-requests`

1. Doctor auth + approval checks load `req.doctor`.
2. Query validator accepts optional `status`, `page`, and `limit`.
3. Service scopes the query to the authenticated doctor only and sorts newest first.
4. Response returns paginated request history with `messageKey: success.doctorProfile.changeRequestsLoaded`.

#### Flow: `GET /api/doctors/me/profile-change-requests/:requestId`

1. Doctor auth + approval checks load `req.doctor`.
2. Param validator ensures `requestId` is a valid object id.
3. Service loads the request by id and verifies ownership against the authenticated doctor.
4. If the request is missing or belongs to another doctor, backend returns `errors.doctorProfile.changeRequestNotFound`.
5. Response returns `200` with `messageKey: success.doctorProfile.changeRequestLoaded`.

#### Flow: `GET /api/content/:slug?language=...` for settings pages

1. Auth + role guard allow the same public content audience as other published content routes.
2. Public content service looks up a published item by `slug` and optional `language`.
3. `SETTINGS_PAGE` items go through the same publish/read path as other content types, but without medical-library-only requirements such as seek-help blocks, sources, disclaimer, or news payloads.
4. Response includes `pageVersion` so clients can display or persist a stable legal/settings document version.

### Admin patient management

#### `GET /admin/patients`

- **Description:** List patients with account status filter and search.
- **Auth:** Admin
- **Query params:** `account_status` (`active` | `temporary` | `suspended` | `locked` | `all`, default `all`), `search` (matches name/email/phone/publicId), `includeDeleted` (`true|false`, default `false`), `page` (default 1), `limit` (default 20, max 100)
- **Response:** `{ "page": 1, "limit": 20, "total": 2, "results": 2, "patients": [ { "_id": "...", "publicId": "P-7F3K9D2Q", "user": { "fullName": "...", "email": "...", "phone": "...", "accountStatus": "temporary", "mustChangePassword": true }, "isClaimed": false, "claimedAt": null } ] }`
- **Example**

  ```bash
  curl -G "http://localhost:5000/api/admin/patients" \
    -H "Authorization: Bearer <admin-token>" \
    --data-urlencode "account_status=temporary" \
    --data-urlencode "search=ahmed" \
    --data-urlencode "page=1" \
    --data-urlencode "limit=20"
  ```

#### `PATCH /admin/patients/:patientId/activate`

- **Description:** Activate a patient account (sets accountStatus to `active`, sets mustChangePassword to `true`, marks claimed) and notifies the patient.
- **Auth:** Admin
- **Response:** `{ "message": "Patient account activated", "patientId": "...", "userId": "...", "accountStatus": "active" }`

#### `PATCH /admin/patients/:patientId/suspend`

- **Description:** Suspend an active patient account without deleting it. Suspension is non-destructive: linked appointments, consultations, files, orders, and medical history remain intact.
- **Auth:** Admin
- **Body:** `{ "reason": "optional text" }`
- **Response:** `{ "message": "Patient account suspended", "patientId": "...", "userId": "...", "accountStatus": "suspended" }`
- **Behavior:**
  - Suspended patients can still sign in and read their own existing records, prescriptions, PDFs, files, appointments, consultations, complaints, and notifications.
  - Suspended patients cannot start or modify patient-owned actions such as booking/cancelling/rescheduling appointments, creating consultations, creating complaints, uploading files, changing profile/contact settings, creating waitlist requests, or reviewing access requests.
  - Delegated patient-owned flows are also blocked for suspended targets. For example, doctors and secretaries cannot create new appointments or waitlist requests on behalf of a suspended patient, and doctors cannot create new access requests targeting a suspended patient.
  - Suspension writes admin audit history and patient notification records, but it does not reuse the account deletion/offboarding cleanup flow.

#### `PATCH /admin/patients/:patientId/unsuspend`

- **Description:** Restore a suspended patient account back to `active`.
- **Auth:** Admin
- **Response:** `{ "message": "Patient account unsuspended", "patientId": "...", "userId": "...", "accountStatus": "active" }`

### Admin staff offboarding

#### `POST /admin/users/:userId/offboard`

- **Description:** Offboard staff accounts (doctor/secretary/data_entry/admin). Locks account, sets `accountDeletion.status=deleted`, removes devices, and performs role-specific cleanup.
- **Auth:** Admin
- **Body:** `{ "reason": "optional text" }`
- **Response:** `{ "message": "User offboarded", "userId": "...", "role": "doctor" }`
- **Notes:**
  - Patients must use `/patient/me/delete-request` instead.
  - Offboarded doctors are removed from search (`isApproved=false`).
  - Offboarded doctors have future active appointments cancelled (`cancelledBy=admin`, reason defaults to `doctor_account_offboarded` if no custom reason is provided).
  - Offboarded doctors have active consultation tickets (`pending`/`active`) closed (`closedBy=admin`, reason defaults to `doctor_account_offboarded` if no custom reason is provided).
  - Offboarded doctors have assigned secretaries unlinked.
  - Offboarded secretaries are unassigned from their doctor.
  - Offboarding writes aggregate cleanup audit events for affected appointments/consultations (and secretary unlink counts when applicable).

#### `GET /admin/users/doctor-restore-requests`

- **Description:** List doctor restore requests submitted after the self-recovery window expired.
- **Auth:** Admin
- **Query params:** `status` (`pending` | `approved` | `rejected`, default `pending`), `search` (doctor name/email/phone), `from` and `to` (ISO date-time filters on `restoreRequestedAt`), `page` (default 1), `limit` (default 20, max 100)
- **Response:**

  ```json
  {
    "page": 1,
    "limit": 20,
    "total": 1,
    "results": 1,
    "restoreRequests": [
      {
        "userId": "64f...user",
        "doctorId": "64f...doc",
        "fullName": "Dr Mona",
        "email": "dr.mona@example.com",
        "phone": "+963944000000",
        "accountStatus": "locked",
        "accountDeletion": {
          "status": "deleted",
          "source": "self_delete",
          "recoveryExpiresAt": "2026-02-05T10:00:00.000Z",
          "restoreStatus": "pending",
          "restoreRequestedAt": "2026-02-06T10:00:00.000Z",
          "restoreRequestedBy": "64f...user",
          "restoreReason": "Please restore my account",
          "restoreReviewedAt": null,
          "restoreReviewedBy": null,
          "restoreReviewNote": null
        },
        "doctor": {
          "approvalStatus": "approved",
          "isApproved": true,
          "specialization": "Cardiology"
        }
      }
    ]
  }
  ```

#### `POST /admin/users/:userId/restore-request/review`

- **Description:** Approve or reject a pending doctor restore request. Approval reboards the doctor account and restores the saved approval/account snapshot when available. Rejection keeps the account deleted and marks the restore request rejected.
- **Auth:** Admin
- **Body:** `{ "decision": "approved", "reviewNote": "optional text, max 500 chars" }`
- **Approve response:**

  ```json
  {
    "messageKey": "success.adminUser.restoreApproved",
    "userId": "64f...user",
    "role": "doctor",
    "doctorId": "64f...doc",
    "approvalFallbackUsed": false
  }
  ```

- **Reject response:**

  ```json
  {
    "messageKey": "success.adminUser.restoreRejected",
    "userId": "64f...user",
    "role": "doctor"
  }
  ```

#### `POST /admin/users/:userId/reboard`

- **Description:** Directly reboard an offboarded doctor account. This is also the internal action used when an admin approves a doctor restore request.
- **Auth:** Admin
- **Response:** `{ "messageKey": "success.adminUser.reboarded", "userId": "64f...user", "role": "doctor", "doctorId": "64f...doc", "approvalFallbackUsed": false }`

---

## 6. Secretary Management

Only approved doctors may call these routes. Permissions for secretaries are limited to those defined in `SECRETARY_PERMISSIONS`.

Current `SECRETARY_PERMISSIONS`:

- `appointments:book`, `appointments:view`, `appointments:edit`, `appointments:cancel`
- `waitlist:create`, `waitlist:view`, `waitlist:manage`, `waitlist:book`
- `patients:view`, `patients:edit`, `patients:temporary:create`, `patients:files:view`, `patients:files:upload`
- `schedule:view`

Secretaries can also access some doctor routes (scoped to their assigned doctor, and gated by the permissions above), like `GET /doctors/patients`, `POST /doctors/patients/temp`, and `GET /doctors/:doctorId/slots`.

- **Limit:** Each doctor can have up to 3 secretaries.

### Admin secretary listing

#### `GET /admin/secretaries`

- **Description:** Admin lists secretaries with search and doctor filters.
- **Auth:** Admin
- **Query params:** `search` (matches secretary full name/email/phone), `doctorId` (filters by assigned doctor), `page` (default 1), `limit` (default 20, max 100)
- **Response:** `{ "page": 1, "limit": 20, "total": 1, "results": 1, "secretaries": [ { "_id": "...", "permissions": ["appointments:view"], "assignedDoctor": "64f...doc", "user": { "fullName": "Maha Secretary", "email": "maha@example.com", "phone": "+20123..." }, "doctor": { "_id": "64f...doc", "isApproved": true, "approvalStatus": "approved", "user": { "fullName": "Dr Mona", "email": "dr.mona@example.com", "phone": "+20123..." } } } ] }`
- **Example**

  ```bash
  curl -G "http://localhost:5000/api/admin/secretaries" \
    -H "Authorization: Bearer <admin-token>" \
    --data-urlencode "search=maha" \
    --data-urlencode "page=1" \
    --data-urlencode "limit=20"
  ```

### Secretary self doctor view

#### `GET /secretaries/me/doctor`

- **Description:** Secretary fetches their own profile, exact delegated permissions, and assigned doctor with limited fields (approved doctors only).
- **Auth:** Secretary
- **Permission behavior:** `secretary.permissions` is the authoritative permission set for the authenticated secretary. An empty array means no delegated permissions; clients must not substitute a default or full permission list.
- **Response:** `{ "secretary": { "_id": "64f...secretary", "permissions": ["appointments:view", "patients:view"], "assignedDoctor": "64f...doctor" }, "doctor": { "_id": "64f...doctor", "specialization": "...", "consultationFee": 300, "averageRating": 4.8, "totalReviews": 12, "approvalStatus": "approved", "isApproved": true, "user": { "_id": "64f...user", "fullName": "Dr Mona", "email": "dr.mona@example.com", "phone": "+20123...", "photoUrl": "..." } } }`
- **Errors:** `403` when the secretary has no doctor assignment or the assigned doctor is not approved; `404` when the assigned doctor profile no longer exists.

### `POST /secretaries`

- **Headers:** `Content-Type: application/json`, `x-lang: en|ar`
- **Body:**

  ```json
  {
    "fullName": "Maha Secretary",
    "email": "maha@example.com",
    "password": "Secret123",
    "phone": "+20111111111",
    "gender": "Female",
    "permissions": ["appointments:view", "appointments:book"]
  }
  ```

- **Response:**

  ```json
  {
    "message": "Secretary created successfully",
    "secretary": {
      "id": "64f...",
      "userId": "64f...user",
      "fullName": "Maha Secretary",
      "email": "maha@example.com",
      "phone": "+20111111111",
      "permissions": ["appointments:view", "appointments:book"],
      "assignedDoctor": "64f...doctor"
    }
  }
  ```

- **Error (email exists)** `400 Bad Request``{ "message": "Email already in use" }`
- **Example**

  ```bash
  curl -X POST "http://localhost:5000/api/secretaries" \
    -H "x-lang: en" \
    -H "Authorization: Bearer <doctor-token>" \
    -H "Content-Type: application/json" \
    -d '{
      "fullName": "Maha Secretary",
      "email": "maha@example.com",
      "password": "Secret123",
      "phone": "+20111111111",
      "gender": "Female",
      "permissions": ["appointments:view", "appointments:book"]
    }'
  ```

### `GET /secretaries`

- **Response:** `{ "total": 2, "secretaries": [ ... ] }`

### `GET /secretaries/:secretaryId`

- Returns the secretary detail with populated user fields.

### `PUT /secretaries/:secretaryId`

- **Body:**

  ```json
  {
    "fullName": "Maha S.",
    "phone": "+20122222222",
    "gender": "Female",
    "permissions": ["appointments:view", "appointments:cancel"]
  }
  ```

- **Response:** same shape as creation, containing updated values.
- **Error (invalid permission)** `400 Bad Request`
  `{ "message": "Invalid permission(s): foo. Allowed: appointments:book, ..." }`

### `DELETE /secretaries/:secretaryId`

- **Description:** Doctor unassigns a secretary (relationship only). No user deletion occurs.
- **Response:** `{ "message": "Secretary unassigned successfully" }`

### `DELETE /doctors/secretaries/:secretaryId`

- **Description:** Same as `/secretaries/:secretaryId` but under the doctor namespace.
- **Auth:** Doctor
- **Response:** `{ "message": "Secretary unassigned successfully" }`

---

## Access Requests

Base path: `/api/access-requests`

This section documents the legacy compatibility routes. They use the same profile-level approval logic as the doctor-scoped and patient-scoped routes already documented above.

### `POST /api/access-requests/:doctorId/patients/:patientId`

- **Role (auth):** `doctor`
- **Description:** Compatibility create route for doctor-to-patient profile access requests.

**Params**

| Name        | In   | Type     | Required | Notes                                         |
| :---------- | :--- | :------- | :------- | :-------------------------------------------- |
| `doctorId`  | path | ObjectId | Yes      | Must match the authenticated doctor identity. |
| `patientId` | path | ObjectId | Yes      |                                               |

**Request body schema**

```json
{
  "reason": "Follow-up care",
  "items": [
    {
      "type": "medicalRecord",
      "refId": "65f0c4f6e6a0d0d0d0d0d412",
      "description": "legacy payload still accepted"
    }
  ],
  "expiresAt": "2026-04-01T00:00:00.000Z"
}
```

**Response example**

```json
{
  "messageKey": "success.accessRequest.created",
  "message": "Access request created.",
  "request": {
    "_id": "65f0c4f6e6a0d0d0d0d0d311",
    "status": "pending",
    "scope": "PROFILE",
    "reason": "Follow-up care",
    "requestedItems": [
      {
        "type": "medicalRecord",
        "refId": "65f0c4f6e6a0d0d0d0d0d412",
        "description": "legacy payload still accepted"
      }
    ]
  }
}
```

**Errors**

- `400` `errors.validation.array`
- `400` `errors.validation.invalidEnum`
- `400` `errors.validation.invalidId`
- `400` `errors.validation.invalidDate`
- `403` `errors.doctorPatient.onlyOwnPatients`
- `403` `errors.doctorPatient.notLinked`
- `403` `errors.doctor.notApproved`
- `404` `errors.patient.notFound`

Example:

```json
{
  "status": 403,
  "messageKey": "errors.doctorPatient.onlyOwnPatients",
  "message": "You can only manage your own patients.",
  "errors": null
}
```

**Notes**

- `items[]` and `expiresAt` are accepted for compatibility, but access is still profile-level.
- The controller returns `201` even when the result is `success.accessRequest.alreadyAllowed` or `success.accessRequest.pendingExists`.

### `GET /api/access-requests`

- **Role (auth):** `patient | doctor | admin`
- **Description:** List access requests scoped by the authenticated role.

**Params**

| Name        | In    | Type     | Required | Notes                                                    |
| :---------- | :---- | :------- | :------- | :------------------------------------------------------- |
| `status`    | query | string   | No       | `pending`, `approved`, `denied`, `expired`.              |
| `doctorId`  | query | ObjectId | No       | Allowed for `patient` and `admin`; blocked for `doctor`. |
| `patientId` | query | ObjectId | No       | Allowed for `doctor` and `admin`; blocked for `patient`. |
| `from`      | query | ISO date | No       | Created-at lower bound.                                  |
| `to`        | query | ISO date | No       | Created-at upper bound.                                  |
| `page`      | query | integer  | No       | Default `1`.                                             |
| `limit`     | query | integer  | No       | Default `20`, max `100`.                                 |

**Request body schema**

`None`

**Admin response example**

```json
{
  "messageKey": "success.ok",
  "message": "Request completed successfully.",
  "page": 1,
  "limit": 20,
  "total": 1,
  "results": 1,
  "requests": [
    {
      "_id": "65f0c4f6e6a0d0d0d0d0d311",
      "status": "pending",
      "scope": "PROFILE",
      "doctor": {
        "_id": "65f0c4f6e6a0d0d0d0d0d121",
        "specialization": "Cardiology",
        "userId": "65f0c4f6e6a0d0d0d0d0d141",
        "fullName": "Dr John Doe",
        "email": "doctor@example.com",
        "phone": "+963900000001",
        "photoUrl": "/uploads/users/john.jpg"
      },
      "patient": {
        "_id": "65f0c4f6e6a0d0d0d0d0d111",
        "publicId": "PAT-100001",
        "userId": "65f0c4f6e6a0d0d0d0d0d131",
        "fullName": "Jane Patient",
        "email": "patient@example.com",
        "phone": "+963900000002",
        "photoUrl": "/uploads/users/jane.jpg"
      }
    }
  ]
}
```

**Errors**

- `400` `errors.validation.invalidEnum`
- `400` `errors.validation.invalidId`
- `400` `errors.validation.invalidDate`
- `400` `errors.validation.invalidNumber`
- `400` `errors.validation.doctorFilterForbidden`
- `400` `errors.validation.patientFilterForbidden`
- `403` `errors.accessRequest.listUnauthorized`

Example:

```json
{
  "status": 400,
  "messageKey": "errors.validation.patientFilterForbidden",
  "message": "Patient filter is not allowed.",
  "errors": null
}
```

**Notes**

- Patients see incoming requests.
- Doctors see their own outgoing requests.
- Admins see the global list. Their response uses flattened `doctor` and `patient` summaries and includes each party's contact details for administrative follow-up. Patient and doctor list responses keep their narrower populated shapes and do not receive those contact details.

### `GET /api/access-requests/:id`

- **Role (auth):** `patient | doctor | admin`
- **Description:** Return safe metadata for one access request. Use this to render a request summary/details screen without exposing approved PHI payloads.

**Params**

| Name | In   | Type     | Required | Notes      |
| :--- | :--- | :------- | :------- | :--------- |
| `id` | path | ObjectId | Yes      | Request id |

**Request body schema**

`None`

**Admin response example**

```json
{
  "messageKey": "success.accessRequest.details",
  "message": "Access request details loaded.",
  "request": {
    "_id": "65f0c4f6e6a0d0d0d0d0d311",
    "scope": "PROFILE",
    "status": "pending",
    "reason": "Follow-up care",
    "createdAt": "2026-04-05T10:00:00.000Z",
    "updatedAt": "2026-04-05T10:00:00.000Z",
    "reviewedAt": null,
    "decidedAt": null,
    "expiresAt": null,
    "requestedItems": [],
    "doctor": {
      "_id": "65f0c4f6e6a0d0d0d0d0d121",
      "specialization": "Cardiology",
      "userId": "65f0c4f6e6a0d0d0d0d0d141",
      "fullName": "Dr John Doe",
      "email": "doctor@example.com",
      "phone": "+963900000001",
      "photoUrl": "/uploads/users/john.jpg"
    },
    "patient": {
      "_id": "65f0c4f6e6a0d0d0d0d0d111",
      "publicId": "PAT-100001",
      "userId": "65f0c4f6e6a0d0d0d0d0d131",
      "fullName": "Jane Patient",
      "email": "patient@example.com",
      "phone": "+963900000002",
      "photoUrl": "/uploads/users/jane.jpg"
    }
  }
}
```

**Errors**

- `403` `errors.accessRequest.forbidden`
- `403` `errors.accessRequest.listUnauthorized`
- `404` `errors.accessRequest.notFound`

**Notes**

- This route is intentionally metadata-only.
- When the authenticated actor is an admin, the response uses the same flattened contact-aware `doctor` and `patient` summaries as the admin list. Patient and doctor callers receive only the existing safe metadata shape.
- Use `GET /api/doctors/:doctorId/patients/:patientId/access-requests/:requestId/details` or the legacy `GET /api/access-requests/:id/details` route only when the client needs approved profile payloads.

### `PATCH /api/access-requests/:id/approve`

- **Role (auth):** `patient`
- **Description:** Approve a pending access request through the legacy route.

**Params**

| Name | In   | Type     | Required | Notes |
| :--- | :--- | :------- | :------- | :---- |
| `id` | path | ObjectId | Yes      |       |

**Request body schema**

`None`

**Response example**

```json
{
  "messageKey": "success.accessRequest.updated",
  "message": "Access request updated.",
  "status": "approved"
}
```

**Already reviewed response (`200`)**

```json
{
  "messageKey": "success.accessRequest.alreadyReviewed",
  "message": "Access request already reviewed.",
  "alreadyReviewed": true,
  "status": "approved"
}
```

**Errors**

- `404` `errors.accessRequest.notFound`
- `404` `errors.patient.profileNotFound`

Example:

```json
{
  "status": 404,
  "messageKey": "errors.accessRequest.notFound",
  "message": "Access request not found.",
  "errors": null
}
```

### `PATCH /api/access-requests/:id/reject`

- **Role (auth):** `patient`
- **Description:** Reject a pending access request through the legacy route.

**Params**

| Name | In   | Type     | Required | Notes |
| :--- | :--- | :------- | :------- | :---- |
| `id` | path | ObjectId | Yes      |       |

**Request body schema**

`None`

**Response example**

```json
{
  "messageKey": "success.accessRequest.updated",
  "message": "Access request updated.",
  "status": "denied"
}
```

**Already reviewed response (`200`)**

```json
{
  "messageKey": "success.accessRequest.alreadyReviewed",
  "message": "Access request already reviewed.",
  "alreadyReviewed": true,
  "status": "denied"
}
```

**Errors**

- `404` `errors.accessRequest.notFound`
- `404` `errors.patient.profileNotFound`

Example:

```json
{
  "status": 404,
  "messageKey": "errors.accessRequest.notFound",
  "message": "Access request not found.",
  "errors": null
}
```

### `GET /api/access-requests/:id/details`

- **Role (auth):** `doctor`
- **Description:** Compatibility details route. Returns the same profile-compatible data shape as the doctor-scoped details route and requires `patientId` query context.

**Params**

| Name        | In    | Type     | Required | Notes                            |
| :---------- | :---- | :------- | :------- | :------------------------------- |
| `id`        | path  | ObjectId | Yes      | Request id.                      |
| `patientId` | query | ObjectId | Yes      | Required by the route validator. |

**Request body schema**

`None`

**Response example**

```json
{
  "messageKey": "success.ok",
  "message": "Request completed successfully.",
  "requestId": "65f0c4f6e6a0d0d0d0d0d311",
  "patient": {
    "_id": "65f0c4f6e6a0d0d0d0d0d111",
    "user": {
      "_id": "65f0c4f6e6a0d0d0d0d0d131",
      "fullName": "Jane Patient"
    }
  },
  "medicalRecords": [],
  "files": [],
  "medications": [],
  "orders": []
}
```

**Errors**

- `400` `errors.validation.required`
- `400` `errors.validation.invalidId`
- `403` `errors.accessRequest.approvalRequired`
- `403` `errors.accessRequest.notApproved`
- `403` `errors.accessRequest.forbidden`
- `403` `errors.accessRequest.patientMismatch`
- `404` `errors.accessRequest.notFound`
- `404` `errors.patient.profileNotFound`

Example:

```json
{
  "status": 400,
  "messageKey": "errors.validation.required",
  "message": "This field is required.",
  "errors": null
}
```

**Notes**

- This route exists for backward compatibility. New doctor clients can also use `/api/doctors/:doctorId/patients/:patientId/access-requests/:requestId/details`.

---

## Patient Profile

### `GET /patient/profile`

- **Description:** Fetch the authenticated patient's profile with BMI/age computed.
- **Auth:** Patient
- **Response:** `{ "actorIds": { "patientId": "64f...pat", "doctorId": null, "secretaryId": null, "assignedDoctorId": null }, "profile": { "heightCm": 170, "weightKg": 70, "bmi": 24.2, "allergies": [], "medicalConditions": [], "allowDoctorsViewProfile": false, "user": { "timezone": "Asia/Damascus", ... }, ... } }`
- **Timezone note:** `profile.user.timezone` is the IANA timezone used to evaluate medication reminder times for the patient.

### `PUT /patient/profile`

- **Description:** Update patient health profile fields (height, weight, allergies, medical conditions, blood type, measurement unit).
- **Auth:** Patient
- **Headers:** `Content-Type: application/json`, `x-lang: en|ar`
- **Body (example):**

  ```json
  {
    "heightCm": 172,
    "weightKg": 68,
    "allergies": ["penicillin"],
    "medicalConditions": ["asthma"],
    "measurementUnit": "metric",
    "bloodType": "O+"
  }
  ```

- **Response:** `{ "message": "Profile updated", "actorIds": { "patientId": "64f...pat", "doctorId": null, "secretaryId": null, "assignedDoctorId": null }, "profile": { ... } }`

## Patient Settings

### `GET /api/patient/settings/privacy`

- **Role (auth):** `patient`
- **Description:** Read the normalized patient privacy and data-sharing consent summary used by the settings screen.

**Params**

| Name | In  | Type | Required | Notes |
| :--- | :-- | :--- | :------- | :---- |
| None | -   | -    | -        |       |

**Request body schema**

`None`

**Response example**

```json
{
  "messageKey": "success.patientSettings.privacyLoaded",
  "message": "Privacy settings loaded.",
  "allowDoctorsViewProfile": false,
  "privacySettings": {
    "allowDoctorsViewProfile": false,
    "shareMedicalData": false
  },
  "dataSharingConsent": {
    "status": "unknown",
    "contentSlug": "data-sharing-consent",
    "version": null,
    "acceptedAt": null,
    "updatedAt": null
  }
}
```

**Notes**

- Legacy patients without `privacySettings` still return the nested shape.
- The flat `allowDoctorsViewProfile` field remains in the response for compatibility.
- **Frontend note:** Use this endpoint to hydrate privacy toggles and consent badges on the settings screen. Treat `dataSharingConsent.version` as the published content version the patient most recently responded to.

### `PATCH /api/patient/settings/privacy`

- **Role (auth):** `patient`
- **Description:** Update patient privacy settings. This keeps the legacy flat toggle and the new nested settings object in sync.

**Params**

| Name | In  | Type | Required | Notes |
| :--- | :-- | :--- | :------- | :---- |
| None | -   | -    | -        |       |

**Request body schema**

Legacy body:

```json
{
  "allowDoctorsViewProfile": true
}
```

Nested body:

```json
{
  "privacySettings": {
    "allowDoctorsViewProfile": true,
    "shareMedicalData": true
  }
}
```

If both are sent, `privacySettings.allowDoctorsViewProfile` wins.

**Response example**

```json
{
  "messageKey": "success.patientSettings.privacyUpdated",
  "message": "Privacy settings updated.",
  "allowDoctorsViewProfile": true,
  "privacySettings": {
    "allowDoctorsViewProfile": true,
    "shareMedicalData": true
  },
  "dataSharingConsent": {
    "status": "unknown",
    "contentSlug": "data-sharing-consent",
    "version": null,
    "acceptedAt": null,
    "updatedAt": null
  }
}
```

**Errors**

- `400` `errors.validation.required`
- `400` `errors.validation.invalidBoolean`

Example:

```json
{
  "status": 400,
  "messageKey": "errors.validation.invalidBoolean",
  "message": "Invalid boolean value.",
  "errors": null
}
```

**Notes**

- This route updates the patient record field `allowDoctorsViewProfile`.
- It also persists `privacySettings.shareMedicalData`.
- Privacy audit entries continue to flow through the patient activity-log mapping.
- **Frontend note:** After a successful write, use the response payload as the new source of truth for toggle state instead of assuming local optimistic values still match server normalization.

### `POST /api/patient/settings/privacy/consent`

- **Role (auth):** `patient`
- **Description:** Save the patient's response to the data-sharing consent page and capture the published consent document version.

**Params**

| Name | In  | Type | Required | Notes |
| :--- | :-- | :--- | :------- | :---- |
| None | -   | -    | -        |       |

**Request body schema**

```json
{
  "status": "accepted"
}
```

Allowed values: `accepted`, `declined`

**Response example**

```json
{
  "messageKey": "success.patientSettings.consentUpdated",
  "message": "Data-sharing consent updated.",
  "allowDoctorsViewProfile": true,
  "privacySettings": {
    "allowDoctorsViewProfile": true,
    "shareMedicalData": true
  },
  "dataSharingConsent": {
    "status": "accepted",
    "contentSlug": "data-sharing-consent",
    "version": "2026-04",
    "acceptedAt": "2026-04-07T10:00:00.000Z",
    "updatedAt": "2026-04-07T10:00:00.000Z"
  }
}
```

**Errors**

- `400` `errors.validation.invalidEnum`
- `500` `errors.patientSettings.consentContentNotConfigured`

**Notes**

- The backend always reads the published `SETTINGS_PAGE` with slug `data-sharing-consent`.
- `acceptedAt` is set only when the submitted status is `accepted`.
- `updatedAt` changes on every consent write.
- When set to `true`, linked approved doctors can pass profile access checks without creating a new access request.
- **Frontend note:** When the published consent page version changes, expect the settings screen to show a newer `version` than the one cached on-device. Re-fetch this route after submit and use the returned `version`, `status`, and timestamps for the UI.

## Patient Profile (continued)

### `PATCH /patient/profile/personal`

- **Description:** Update personal data and optionally upload/replace profile picture.
- **Auth:** Patient
- **Content-Type:** `multipart/form-data`
- **Form fields (optional):** `fullName`, `gender`, `dateOfBirth`, `address`, `timezone`, `photo`
- **Notes:**
  - Use `photo` as the file field name.
  - `timezone` must be a valid IANA timezone string such as `Asia/Damascus`, `Asia/Riyadh`, or `Europe/Berlin`.
  - Photo file is streamed directly to MinIO object storage (not local disk or memory buffer storage).
  - Updated profile picture signed download URL is returned in `profile.user.photoUrl`; the stored object key is returned in `profile.user.photoKey`.
  - Updated timezone is returned in `profile.user.timezone`.
- **Response:** Includes `actorIds` with the authenticated patient profile `_id`.
- **Example:**

  ```bash
  curl -X PATCH "http://localhost:5000/api/patient/profile/personal" \
    -H "Authorization: Bearer <patientToken>" \
    -H "x-lang: en" \
    -F "photo=@/path/to/profile.jpg;type=image/jpeg" \
    -F "fullName=Amr Barakat" \
    -F "timezone=Asia/Damascus"
  ```

### `GET /patient/profile/photo/download`

- **Description:** Get a short-lived signed URL for the current patient's profile photo (MinIO private object).
- **Auth:** Patient
- **Response (`200`):**

  ```json
  {
    "messageKey": "success.ok",
    "key": "profile-photos/patient/65f.../1739811111111-uuid.jpg",
    "downloadUrl": "http://s3.local.test/uploads/...",
    "expiresIn": 300
  }
  ```

- **Use in mobile app:** set image source to `downloadUrl` directly.

---

## Medical Records

### `GET /api/patient/medical-records`

- **Role (auth):** `patient`
- **Description:** List medical records that belong to the authenticated patient.

**Params**

| Name | In  | Type | Required | Notes |
| :--- | :-- | :--- | :------- | :---- |
| None | -   | -    | -        |       |

**Request body schema**

`None`

**Response example**

```json
{
  "messageKey": "success.ok",
  "message": "Request completed successfully.",
  "records": [
    {
      "_id": "65f0c4f6e6a0d0d0d0d0d412",
      "patient": "65f0c4f6e6a0d0d0d0d0d111",
      "doctor": "65f0c4f6e6a0d0d0d0d0d121",
      "title": "Hypertension follow-up",
      "diagnosis": "Type 2 diabetes",
      "prescriptions": ["Metformin 500mg"],
      "attachments": [],
      "followUpRequired": true,
      "date": "2026-03-04T10:00:00.000Z",
      "createdAt": "2026-03-04T10:00:00.000Z",
      "updatedAt": "2026-03-04T10:00:00.000Z"
    }
  ]
}
```

**Errors**

- `404` `errors.patient.notFound`

Example:

```json
{
  "status": 404,
  "messageKey": "errors.patient.notFound",
  "message": "Patient not found.",
  "errors": null
}
```

### `GET /api/patient/medical-records/:recordId`

- **Role (auth):** `patient`
- **Description:** Return one medical record owned by the authenticated patient.

**Params**

| Name       | In   | Type     | Required | Notes |
| :--------- | :--- | :------- | :------- | :---- |
| `recordId` | path | ObjectId | Yes      |       |

**Request body schema**

`None`

**Response example**

```json
{
  "messageKey": "success.ok",
  "message": "Request completed successfully.",
  "record": {
    "_id": "65f0c4f6e6a0d0d0d0d0d412",
    "patient": "65f0c4f6e6a0d0d0d0d0d111",
    "doctor": "65f0c4f6e6a0d0d0d0d0d121",
    "title": "Hypertension follow-up",
    "diagnosis": "Type 2 diabetes",
    "prescriptions": ["Metformin 500mg"],
    "attachments": [],
    "followUpRequired": true,
    "date": "2026-03-04T10:00:00.000Z",
    "createdAt": "2026-03-04T10:00:00.000Z",
    "updatedAt": "2026-03-04T10:00:00.000Z"
  }
}
```

**Errors**

- `400` `errors.validation.invalidId`
- `404` `errors.medicalRecord.notFoundForPatient`

Example:

```json
{
  "status": 404,
  "messageKey": "errors.medicalRecord.notFoundForPatient",
  "message": "Medical record not found for patient.",
  "errors": null
}
```

## Patient Diagnoses & Medications

### `GET /patient/diagnoses`

- **Description:** List the authenticated patient's diagnoses/medical records with doctor info and linked file metadata.
- **Auth:** Patient
- **Query params:** `doctorId` (optional), `from`, `to` (ISO dates), `search` (title/diagnosis).
- **Response:** `{ "diagnoses": [ { "_id": "...", "title": "Flu", "diagnosis": "Influenza", "doctor": { ... }, "attachments": [ { "fileName": "...", "fileUrl": "..." } ] } ] }`

### `GET /patient/medications`

- **Description:** List patient's medications with dosage, frequency, route, instructions, prescriber doctor info.
- **Auth:** Patient
- **Query params:** `active` (bool), `from`, `to` (ISO startDate filter), `medicationSource` (`manual|doctor|prescription`).
- **Response:** `{ "medications": [ { "name": "Amoxicillin", "dosage": "500mg", "frequency": "2x/day", "route": "oral", "times": ["08:00"], "remindersEnabled": true, "instructions": "...", "sourceType": "prescription", "isActive": true, "doctor": { ... } } ] }`

## Orders

### `GET /api/patient/orders`

- **Role (auth):** `patient`
- **Description:** Unified patient order list across all order kinds.
- **Query filters:**
  - `orderType` (`LAB_ORDER`, `IMAGING_ORDER`, `PROCEDURE_ORDER`, `REFERRAL_ORDER`)
  - `category|type` (legacy aliases)
  - `statusCode|status`
  - `doctorId`
  - `from`, `to`
  - `q|search`, `page`, `limit`, `sort`
- **Date filter semantics:** date-only values (`YYYY-MM-DD`) are interpreted as local calendar-day boundaries on the server (`from` at `00:00:00.000`, `to` at `23:59:59.999`). Full datetime values remain exact timestamps.
- **Response:** paginated order summaries including both canonical fields (`orderType`, `orderTitle`, `statusCode`) and legacy mirrors (`type`, `orderName`, `status`).

### `GET /api/patient/orders/:orderId`

- **Role (auth):** `patient`
- **Description:** Return one patient-owned order with full details.
- **Errors:** `400 errors.validation.invalidId`, `403 errors.orders.forbidden`, `404 errors.orders.notFound`.

### Orders & Medical Records Execution Flows (Detailed)

#### Flow: `GET /api/patient/medical-records` and `GET /api/patient/medical-records/:recordId`

1. Patient auth stack loads `req.patient`.
2. `patientRecordIdParamValidator` (for `:recordId`) enforces ObjectId shape.
3. Service restricts lookup to authenticated patient ownership only.
4. List route returns all own records; details route throws not-found when record is outside ownership.
5. Response returns `200` with `messageKey: success.ok` and `records` or `record`.

#### Flow: `POST /api/doctors/:doctorId/patients/:patientId/medical-records`

1. Doctor auth + validators + `doctorPatientGuard` enforce approved doctor, scope match, and link context.
2. Service creates a `MedicalRecord` tied to `(doctorId, patientId)` from server context.
3. Request body doctor identifiers are ignored; doctor identity is taken only from authenticated context.
4. Audit event `DATA_MEDICAL_RECORD_CREATED` is emitted.
5. Response returns `201` with `messageKey: success.ok` and `record`.

#### Flow: `PATCH /api/doctors/:doctorId/patients/:patientId/medical-records/:recordId`

1. Doctor auth/validator/guard run.
2. Service loads target record scoped to patient and checks author-doctor update permission.
3. Mutable fields are patched; unauthorized authorship returns `errors.medicalRecord.updateForbidden`.
4. Updated record is returned with success envelope.

#### Flow: `POST /api/doctors/orders` and typed create routes

1. Doctor auth + `loadUserModelsGuard` + create validator run.
2. Service normalizes legacy and canonical payload shapes into canonical order model.
3. Guardrails:
   - doctor must be approved,
   - patient must exist and be linked,
   - `results` on create is rejected,
   - type-specific payload and item constraints are enforced.
4. New `Order` is persisted with canonical fields and legacy mirrors.
5. Side effects: doctor activity stats increment, patient linkage backfill, patient notification, audit create event.
6. Response returns `201` with `messageKey: success.doctorPatient.orderCreated`.

#### Flow: `GET /api/doctors/orders` and `GET /api/doctors/orders/:orderId`

1. Doctor auth + list/detail validators run.
2. List applies filters (`orderType/type/category`, status aliases, date range, search, pagination, sort) on doctor-owned orders.
3. Detail enforces doctor ownership on requested order id.
4. Responses return `messageKey: success.orders.listed` or `success.orders.details`.

#### Flow: `PATCH /api/doctors/orders/:orderId`

1. Doctor auth + update validator run.
2. Service enforces ownership and blocks edits for terminal statuses.
3. Mutable fields are applied, details are type-sanitized, mirrors refreshed.
4. Audit `DATA_ORDER_UPDATED` is written; patient notification is sent when update is materially notifiable.
5. Response returns `200` with `messageKey: success.orders.updated`.

#### Flow: `PATCH /api/doctors/orders/:orderId/cancel` and `PATCH /api/doctors/orders/:orderId/status`

1. Doctor auth + validator run.
2. Service validates ownership and transition policy.
3. Cancel route:
   - returns idempotent `success.orders.alreadyCancelled` when already cancelled,
   - otherwise transitions to `CANCELLED` and records `cancelledAt`.
4. Status route:
   - normalizes target status,
   - returns `success.orders.statusUnchanged` when no-op,
   - applies allowed transitions only.
5. Audit and patient notifications are emitted based on resulting status.
6. Responses return `success.orders.cancelled` or `success.orders.statusUpdated`.

#### Flow: `POST /api/doctors/orders/:orderId/results`

1. Doctor auth + results validator run.
2. Service enforces ownership and allows append only in `ACCEPTED` or `IN_PROGRESS`.
3. Result payload is sanitized/validated by category.
4. If `isFinal=true`, service validates `-> COMPLETED` transition and completes order.
5. Audit `DATA_ORDER_UPDATED` and patient results notification are emitted.
6. Response returns `201` with `messageKey: success.orders.resultsAdded`.

#### Flow: `GET /api/patient/orders` and `GET /api/patient/orders/:orderId`

1. Patient auth stack loads `req.patient`; list/detail validators run.
2. List service applies patient-scoped filters and pagination only.
3. Detail service enforces patient ownership; cross-patient access yields forbidden/not-found.
4. Response returns `200` with `messageKey: success.orders.listed` or `success.orders.details`.

## Billing Service

Base path: `/api/billing`

All billing routes require bearer access-token auth.

- **Roles:** `doctor`, `secretary`
- **Doctor scope:** authenticated approved doctor only.
- **Secretary scope:** secretary must be assigned to the doctor and hold the exact billing permission required by the endpoint.
- **Doctor-only ownership model:** billing records are doctor-owned. Secretaries operate inside assigned doctor scope.
- **Billing statuses:**
  - invoice: `draft`, `issued`, `partial`, `paid`, `overdue`, `cancelled`
  - refund status: `not_refunded`, `partially_refunded`, `refunded`
  - source type: `manual`, `visit`
  - payment method: `cash`, `card`, `bank_transfer`, `insurance`
- **Billing numbering:** invoices use `INV-*`, payments `PAY-*`, refunds `REF-*`, expenses `EXP-*`.
  - format: `PREFIX-YYYYMMDD-####`
  - sequence scope: per doctor, per document type, per UTC date bucket
  - numbering is generated with atomic counters, not collection counts
- **Finance rule:** invoice totals are finalized on the invoice. Payments and refunds only change `grossPaid`, `totalRefunded`, `netPaid`, and `remaining`.
- **Authoritative finance source:** `Payment` and `Refund` rows are the source of truth. Invoice financial fields are cached/denormalized and are recomputed from rows after billing writes.
- **Reminder precedence:** if an invoice is already overdue, the overdue reminder wins over the unpaid-hours reminder.

### Billing permissions

- `billing:dashboard:view`
- `billing:invoices:view`
- `billing:invoices:manage`
- `billing:payments:view`
- `billing:payments:manage`
- `billing:refunds:manage`
- `billing:expenses:view`
- `billing:expenses:manage`
- `billing:reports:view`
- `billing:reports:export`
- `billing:settings:view`
- `billing:settings:manage`
- `billing:services:view`
- `billing:services:manage`

### Frontend billing usage map

- **Frontend note:** `GET /billing/dashboard` is the fastest source for cards and lightweight charts.
- **Frontend note:** `GET /billing/reports` is the source for exportable table rows, richer breakdowns, and filter-driven reporting views.
- **Frontend note:** `GET /billing/settings` and `PUT /billing/settings` back the billing configuration form; load settings before invoice-create screens that depend on currency, tax defaults, payment methods, or expense categories.
- **Frontend note:** `GET /billing/services` powers service selectors/autocomplete for invoicing and pricing administration.
- **Backend behavior note:** Financial truth comes from `Payment` and `Refund` rows. After payment/refund/invoice mutations, expect dashboard and report totals to change even when the invoice payload itself looks denormalized.

### `GET /billing/dashboard`

- **Roles:** `doctor`, `secretary`
- **Secretary permission:** `billing:dashboard:view`
- **Query params:** optional `dateFrom`, `dateTo`, `period`, `periodAnchor`, `groupBy`, `currency`, `status`, `method`, `category`
- **Purpose:** return summary cards and chart-ready aggregates derived from billing report formulas.
- **Currency behavior:** dashboard totals are derived from report data. No exchange-rate conversion is performed. When filtered data spans multiple currencies, `currency` is `null`, `mixedCurrencies` is `true`, and `summaryByCurrency` carries the financially meaningful grouped totals. Optional `currency=<code>` filters dashboard cards, charts, and trends to one supported currency.
- **Trend behavior:** dashboard returns `dashboard.trends` when grouping is active. Use `period=year&groupBy=month` for yearly charts, `period=quarter&groupBy=month` for quarterly charts, `period=month&groupBy=day` for monthly charts, and `period=week&groupBy=day` for weekly charts.
- **Example:** `GET /billing/dashboard?period=month&periodAnchor=2026-05-07&currency=GBP`
- **Response:** `200 OK`

  ```json
  {
    "messageKey": "success.billing.dashboardLoaded",
    "message": "Billing dashboard loaded.",
    "dashboard": {
      "currency": "USD",
      "currencies": ["USD"],
      "mixedCurrencies": false,
      "summaryCurrencyScope": "single",
      "exchangeRateApplied": false,
      "summary": {
        "income": 1250,
        "expenses": 180,
        "refunds": 50,
        "profit": 1020
      },
      "summaryByCurrency": [
        {
          "currency": "USD",
          "income": 1250,
          "expenses": 180,
          "refunds": 50,
          "profit": 1020
        }
      ],
      "trends": {
        "period": "year",
        "periodAnchor": "2026-05-07",
        "groupBy": "month",
        "dateFrom": "2026-01-01T00:00:00.000Z",
        "dateTo": "2026-12-31T23:59:59.999Z",
        "buckets": [
          {
            "key": "2026-01",
            "label": "Jan 2026",
            "dateFrom": "2026-01-01T00:00:00.000Z",
            "dateTo": "2026-01-31T23:59:59.999Z",
            "currency": "USD",
            "currencies": ["USD"],
            "mixedCurrencies": false,
            "summaryByCurrency": [
              {
                "currency": "USD",
                "income": 100,
                "expenses": 20,
                "refunds": 0,
                "profit": 80
              }
            ],
            "counts": {
              "invoices": 2,
              "payments": 1,
              "refunds": 0,
              "expenses": 1
            }
          }
        ]
      },
      "overdueSummary": {
        "count": 2,
        "amount": 300
      },
      "outstandingSummary": {
        "count": 3,
        "amount": 420
      },
      "charts": {
        "paymentsByMethod": [
          { "label": "cash", "currency": "USD", "count": 4, "amount": 800 }
        ],
        "invoiceTotalsByStatus": [
          { "label": "paid", "currency": "USD", "count": 5, "amount": 1250 }
        ],
        "billedAmountByService": [
          {
            "label": "Consultation",
            "currency": "USD",
            "count": 5,
            "amount": 1250
          }
        ],
        "revenueByBillingService": [
          {
            "label": "Consultation",
            "currency": "USD",
            "count": 5,
            "amount": 1250
          }
        ],
        "expensesByCategory": [
          { "label": "Supplies", "currency": "USD", "count": 2, "amount": 180 }
        ]
      }
    }
  }
  ```

- **Frontend note:** Use `dashboard.summaryByCurrency` for KPI cards whenever `mixedCurrencies` is `true`. Use `dashboard.trends.buckets` for charts. To simplify charting, first load without `currency` to inspect `currencies`; if multiple currencies are present, show a selector and reload with `currency=<code>` for one-currency cards and charts. For unfiltered mixed-currency buckets, render separate series/charts per currency or a currency selector; do not combine currencies into one visual amount.

### `GET /billing/invoices`

- **Roles:** `doctor`, `secretary`
- **Secretary permission:** `billing:invoices:view`
- **Query params:** optional `status`, `sourceType`, `patientId`, `search`, `dateFrom`, `dateTo`, `page`, `limit`
- **Search behavior:** matches invoice number, patient full name, patient public id, and invoice item service names.
- **Response:** `200 OK`

  ```json
  {
    "messageKey": "success.ok",
    "message": "Request completed successfully.",
    "total": 1,
    "page": 1,
    "limit": 20,
    "invoices": [
      {
        "id": "661d1d1d1d1d1d1d1d1d1101",
        "number": "INV-20260416-0001",
        "sourceType": "manual",
        "status": "draft",
        "refundStatus": "not_refunded",
        "patient": {
          "id": "661d1d1d1d1d1d1d1d1d2201",
          "publicId": "PAT-1001",
          "fullName": "Sara Patient"
        },
        "appointmentId": null,
        "currency": "USD",
        "discountPercent": 10,
        "subtotal": 200,
        "discountAmount": 20,
        "taxAmount": 0,
        "total": 180,
        "grossPaid": 0,
        "totalRefunded": 0,
        "netPaid": 0,
        "remaining": 180,
        "items": [
          {
            "id": "661d1d1d1d1d1d1d1d1d3301",
            "billingServiceId": null,
            "appointmentTypeId": null,
            "serviceNameSnapshot": "Manual Service",
            "description": null,
            "quantity": 2,
            "unitPrice": 100,
            "lineTotal": 200
          }
        ],
        "payments": [],
        "refunds": []
      }
    ]
  }
  ```

- **Frontend note:** Use this for invoice tables and search-driven picker screens. `status`, `sourceType`, `patientId`, `dateFrom`, and `dateTo` are filters; `search` is free text; `page` and `limit` are pagination controls.

### `GET /billing/invoices/prefill/visit/:appointmentId`

- **Roles:** `doctor`, `secretary`
- **Secretary permission:** `billing:invoices:view`
- **Purpose:** return invoice creation defaults for a visit-based invoice without creating the invoice.
- **Rules:**
  - appointment must belong to the scoped billing doctor
  - active linked billing service is preferred over appointment snapshot pricing
  - returned price is still editable at invoice-creation time
- **Response:** `200 OK`

  ```json
  {
    "messageKey": "success.billing.invoicePrefillLoaded",
    "message": "Invoice prefill loaded.",
    "prefill": {
      "sourceType": "visit",
      "appointmentId": "661d1d1d1d1d1d1d1d1d4401",
      "patient": {
        "id": "661d1d1d1d1d1d1d1d1d2201",
        "publicId": "PAT-1001",
        "fullName": "Sara Patient"
      },
      "currency": "USD",
      "suggestedDueAt": "2026-04-17T10:00:00.000Z",
      "items": [
        {
          "billingServiceId": "661d1d1d1d1d1d1d1d1d5501",
          "appointmentTypeId": "661d1d1d1d1d1d1d1d1d6601",
          "serviceNameSnapshot": "Consultation",
          "quantity": 1,
          "unitPrice": 50,
          "description": "Follow-up consultation"
        }
      ]
    }
  }
  ```

- **Frontend note:** This endpoint is ideal for a "Create invoice from visit" screen because it returns editable defaults without persisting an invoice yet.

### `POST /billing/invoices`

- **Roles:** `doctor`, `secretary`
- **Secretary permission:** `billing:invoices:manage`
- **Body example:**

  ```json
  {
    "patientId": "661d1d1d1d1d1d1d1d1d2201",
    "sourceType": "manual",
    "status": "issued",
    "discountPercent": 10,
    "items": [
      {
        "serviceNameSnapshot": "Manual Service",
        "quantity": 2,
        "unitPrice": 100
      }
    ],
    "dueAt": "2026-04-17T12:00:00.000Z",
    "notes": "Collect at reception"
  }
  ```

- **Rules:**
  - `status` may be only `draft` or `issued` at creation time
  - manual invoice creation requires the patient to already belong to the scoped doctor relationship
  - for `visit` invoices, appointment ownership and patient matching are enforced
  - billing settings snapshot (`currency`, tax flags, default tax percent) is copied onto the invoice at creation time
- **Currency behavior:** changing billing settings later does not rewrite existing invoice `currency` snapshots. Payment and refund reporting derives currency from the parent invoice.
- **Response:** `201 Created`

  ```json
  {
    "messageKey": "success.billing.invoiceCreated",
    "message": "Invoice created.",
    "invoice": {
      "id": "661d1d1d1d1d1d1d1d1d1101",
      "number": "INV-20260416-0001",
      "sourceType": "manual",
      "status": "issued",
      "total": 180,
      "remaining": 180
    }
  }
  ```

- **Frontend note:** After create, refresh the invoice list plus dashboard/report summaries if the screen shows financial aggregates.

### `GET /billing/invoices/:invoiceId`

- **Roles:** `doctor`, `secretary`
- **Secretary permission:** `billing:invoices:view`
- **Purpose:** load one invoice with item snapshots, payments, and refunds.
- **Response:** `200 OK`

  ```json
  {
    "messageKey": "success.ok",
    "message": "Request completed successfully.",
    "invoice": {
      "id": "661d1d1d1d1d1d1d1d1d1101",
      "number": "INV-20260416-0001",
      "status": "partial",
      "grossPaid": 100,
      "refundStatus": "partially_refunded",
      "totalRefunded": 20,
      "netPaid": 80,
      "remaining": 100,
      "payments": [
        {
          "id": "661d1d1d1d1d1d1d1d1d7701",
          "number": "PAY-20260416-0001",
          "amount": 100,
          "refundedAmount": 20,
          "refundableAmount": 80,
          "refundStatus": "partially_refunded",
          "method": "cash",
          "paidAt": "2026-04-16T10:00:00.000Z"
        }
      ],
      "refunds": [
        {
          "id": "661d1d1d1d1d1d1d1d1d8801",
          "number": "REF-20260416-0001",
          "paymentId": "661d1d1d1d1d1d1d1d1d7701",
          "amount": 20,
          "reason": "Overpayment correction",
          "refundedAt": "2026-04-16T11:00:00.000Z"
        }
      ]
    }
  }
  ```

- **Frontend note:** Use invoice detail as the source of truth for payment and refund drawers because it includes recomputed `grossPaid`, `totalRefunded`, `netPaid`, `remaining`, invoice-level `refundStatus`, and each payment's `refundedAmount`, `refundableAmount`, and `refundStatus`.

### `PUT /billing/invoices/:invoiceId`

- **Roles:** `doctor`, `secretary`
- **Secretary permission:** `billing:invoices:manage`
- **Rule:** only `draft` invoices are editable.
- **Body:** same shape as `POST /billing/invoices`
- **Response:** `200 OK` with `messageKey: success.billing.invoiceUpdated`
- **Frontend note:** After update, refresh invoice detail and any open invoice list row because totals, line items, and allowed actions can change.

### `POST /billing/invoices/:invoiceId/issue`

- **Roles:** `doctor`, `secretary`
- **Secretary permission:** `billing:invoices:manage`
- **Body example:**

  ```json
  {
    "dueAt": "2026-04-17T12:00:00.000Z"
  }
  ```

- **Rule:** only `draft` invoices can be issued.
- **Response:** `200 OK` with `messageKey: success.billing.invoiceIssued`
- **Frontend note:** After issuing, refresh invoice detail, invoice list filters, and dashboard/report views that surface issued/outstanding counts.

### `POST /billing/invoices/:invoiceId/cancel`

- **Roles:** `doctor`, `secretary`
- **Secretary permission:** `billing:invoices:manage`
- **Body example:**

  ```json
  {
    "reason": "Created by mistake"
  }
  ```

- **Rules:**
  - already-cancelled invoices are rejected
  - invoices with collected money must be refunded before cancellation
- **Response:** `200 OK` with `messageKey: success.billing.invoiceCancelled`
- **Frontend note:** After cancellation, refresh invoice detail, invoice lists, and any dashboard/report cards that depend on outstanding or overdue counts.

### `GET /billing/payments`

- **Roles:** `doctor`, `secretary`
- **Secretary permission:** `billing:payments:view`
- **Query params:** optional `invoiceId`, `method`, `dateFrom`, `dateTo`, `page`, `limit`
- **Response:** `200 OK`

  ```json
  {
    "messageKey": "success.ok",
    "message": "Request completed successfully.",
    "total": 1,
    "page": 1,
    "limit": 20,
    "payments": [
      {
        "id": "661d1d1d1d1d1d1d1d1d7701",
        "number": "PAY-20260416-0001",
        "invoiceId": "661d1d1d1d1d1d1d1d1d1101",
        "invoiceNumber": "INV-20260416-0001",
        "patient": {
          "id": "661d1d1d1d1d1d1d1d1d2201",
          "publicId": "PAT-1001",
          "fullName": "Sara Patient"
        },
        "amount": 100,
        "refundedAmount": 20,
        "refundableAmount": 80,
        "refundStatus": "partially_refunded",
        "method": "cash",
        "paidAt": "2026-04-16T10:00:00.000Z"
      }
    ]
  }
  ```

- **Frontend note:** Payment rows expose their refund state directly through `refundedAmount`, `refundableAmount`, and `refundStatus`.

### `POST /billing/payments`

- **Roles:** `doctor`, `secretary`
- **Secretary permission:** `billing:payments:manage`
- **Body example:**

  ```json
  {
    "invoiceId": "661d1d1d1d1d1d1d1d1d1101",
    "amount": 100,
    "method": "cash",
    "paidAt": "2026-04-16T10:00:00.000Z",
    "note": "Reception desk payment"
  }
  ```

- **Rules:**
  - payments are allowed only for `issued`, `partial`, or `overdue` invoices
  - payment amount must not exceed invoice `remaining`
  - payment method must be allowed by billing settings
  - payment acceptance is guarded by an atomic remaining-balance check on the invoice
  - after a payment row is written, invoice financial fields are recomputed from `Payment` and `Refund` rows
- **Response:** `201 Created` with `messageKey: success.billing.paymentCreated`; the payment includes `refundedAmount`, `refundableAmount`, and `refundStatus`, and the compact invoice payload includes invoice-level `refundStatus`.
- **Frontend note:** After creating a payment, re-fetch the invoice detail and any dashboard/report screens because both invoice balances and aggregate income totals change.

### `POST /billing/refunds`

- **Roles:** `doctor`, `secretary`
- **Secretary permission:** `billing:refunds:manage`
- **Body example:**

  ```json
  {
    "paymentId": "661d1d1d1d1d1d1d1d1d7701",
    "amount": 20,
    "reason": "Overpayment correction",
    "refundedAt": "2026-04-16T11:00:00.000Z"
  }
  ```

- **Rules:**
  - refunds are created from a payment, not directly from an invoice
  - refund amount must not exceed the payment’s refundable balance
  - refund date cannot be before the original payment date
  - refund acceptance is guarded by an atomic refundable-balance check on the parent payment
  - after a refund row is written, invoice financial fields are recomputed from `Payment` and `Refund` rows
- **Response:** `201 Created` with `messageKey: success.billing.refundCreated`; the compact invoice payload includes invoice-level `refundStatus`.
- **Frontend note:** After creating a refund, re-fetch invoice detail plus dashboard/report views because `refunds`, `netPaid`, `remaining`, and profit metrics may change.

### `GET /billing/expenses`

- **Roles:** `doctor`, `secretary`
- **Secretary permission:** `billing:expenses:view`
- **Query params:** optional `category`, `search`, `dateFrom`, `dateTo`, `page`, `limit`
- **Response:** `200 OK`

  ```json
  {
    "messageKey": "success.ok",
    "message": "Request completed successfully.",
    "total": 1,
    "page": 1,
    "limit": 20,
    "expenses": [
      {
        "id": "661d1d1d1d1d1d1d1d1d8801",
        "number": "EXP-20260416-0001",
        "category": "Supplies",
        "amount": 45,
        "currency": "USD",
        "expenseDate": "2026-04-16T09:00:00.000Z",
        "description": "Gloves and masks"
      }
    ]
  }
  ```

- **Frontend note:** This list is intended for expense tables and category-filtered ledgers. Treat `category`, `search`, `dateFrom`, and `dateTo` as filters. `currency` is the expense snapshot used by reports.

### `POST /billing/expenses`

- **Roles:** `doctor`, `secretary`
- **Secretary permission:** `billing:expenses:manage`
- **Body example:**

  ```json
  {
    "category": "Supplies",
    "amount": 45,
    "expenseDate": "2026-04-16T09:00:00.000Z",
    "description": "Gloves and masks"
  }
  ```

- **Response:** `201 Created` with `messageKey: success.billing.expenseCreated`
- **Currency behavior:** expense creation snapshots the current billing settings currency into the expense. Later billing currency changes do not rewrite historical expenses.
- **Frontend note:** After creating an expense, refresh expense lists plus dashboard/report views because `expenses` and `profit` aggregates change.

### `GET /billing/reports`

- **Roles:** `doctor`, `secretary`
- **Secretary permission:** `billing:reports:view`
- **Query params:** optional `dateFrom`, `dateTo`, `period`, `periodAnchor`, `groupBy`, `currency`, `status`, `method`, `category`
- **Period params:**
  - `period`: `week|month|quarter|year|custom`
  - `periodAnchor`: ISO date used to pick the week/month/quarter/year; defaults to the server date when `period` is provided
  - `groupBy`: `day|week|month|quarter|year`
  - `period=custom` uses `dateFrom` and `dateTo`
  - `dateFrom`/`dateTo` are rejected when `period` is `week`, `month`, `quarter`, or `year`
  - UTC boundaries are used; weeks start on Monday
- **Default grouping:** `week -> day`, `month -> day`, `quarter -> month`, `year -> month`; custom ranges group only when `groupBy` is provided.
- **Report formulas:**
  - `income = sum(payments)`
  - `expenses = sum(expenses)`
  - `refunds = sum(refunds)`
  - `profit = income - expenses - refunds`
- **Breakdown semantics:**
  - `billedAmountByService` is invoice-line billed amount by service, not cash income
  - `revenueByBillingService` is kept as a backward-compatible alias of the same billed-amount dataset
- **Currency behavior:** reports do not perform FX conversion. Single-currency reports return that code in `currency`; empty reports use `defaultCurrency`; mixed-currency reports return `currency: null`, `mixedCurrencies: true`, `currencies`, and `summaryByCurrency`. Optional `currency=<code>` filters invoices, payments, refunds, expenses, summaries, breakdowns, tables, and trends to one supported currency; filtered empty reports still return the selected currency with zero totals. Legacy `summary` remains present for compatibility and is marked by `summaryCurrencyScope`.
- **Example:** `GET /billing/reports?period=year&periodAnchor=2026-05-07&groupBy=month&currency=USD`
- **Response:** `200 OK`

  ```json
  {
    "messageKey": "success.billing.reportLoaded",
    "message": "Billing report loaded.",
    "report": {
      "currency": "USD",
      "currencies": ["USD"],
      "mixedCurrencies": false,
      "summaryCurrencyScope": "single",
      "exchangeRateApplied": false,
      "summary": {
        "income": 1250,
        "expenses": 180,
        "refunds": 50,
        "profit": 1020
      },
      "summaryByCurrency": [
        {
          "currency": "USD",
          "income": 1250,
          "expenses": 180,
          "refunds": 50,
          "profit": 1020
        }
      ],
      "trends": {
        "period": "year",
        "periodAnchor": "2026-05-07",
        "groupBy": "month",
        "dateFrom": "2026-01-01T00:00:00.000Z",
        "dateTo": "2026-12-31T23:59:59.999Z",
        "buckets": [
          {
            "key": "2026-01",
            "label": "Jan 2026",
            "dateFrom": "2026-01-01T00:00:00.000Z",
            "dateTo": "2026-01-31T23:59:59.999Z",
            "currency": "USD",
            "currencies": ["USD"],
            "mixedCurrencies": false,
            "summary": {
              "income": 100,
              "expenses": 20,
              "refunds": 0,
              "profit": 80
            },
            "summaryByCurrency": [
              {
                "currency": "USD",
                "income": 100,
                "expenses": 20,
                "refunds": 0,
                "profit": 80
              }
            ],
            "counts": {
              "invoices": 2,
              "payments": 1,
              "refunds": 0,
              "expenses": 1
            }
          }
        ]
      },
      "breakdowns": {
        "paymentsByMethod": [
          { "label": "cash", "currency": "USD", "count": 4, "amount": 800 }
        ],
        "invoiceTotalsByStatus": [
          { "label": "paid", "currency": "USD", "count": 5, "amount": 1250 }
        ],
        "billedAmountByService": [
          {
            "label": "Consultation",
            "currency": "USD",
            "count": 5,
            "amount": 1250
          }
        ],
        "revenueByBillingService": [
          {
            "label": "Consultation",
            "currency": "USD",
            "count": 5,
            "amount": 1250
          }
        ],
        "expensesByCategory": [
          { "label": "Supplies", "currency": "USD", "count": 2, "amount": 180 }
        ],
        "overdueSummary": {
          "count": 2,
          "amount": 300
        },
        "outstandingSummary": {
          "count": 3,
          "amount": 420
        }
      },
      "tables": {
        "invoices": [],
        "payments": [],
        "refunds": [],
        "expenses": []
      }
    }
  }
  ```

- **Frontend note:** Prefer `summaryByCurrency` for financial cards and use row-level `currency` on breakdowns/tables. If `mixedCurrencies` is `true`, do not present `summary` as a converted total. Use `trends.buckets` for charts: yearly view should use `period=year&groupBy=month`, quarterly view `period=quarter&groupBy=month`, monthly view `period=month&groupBy=day`, weekly view `period=week&groupBy=day`, and custom view `period=custom&dateFrom=...&dateTo=...&groupBy=...`. To simplify charting, load once without `currency` to inspect `currencies`, then reload with `currency=<code>` for one-currency charts. `GET /billing/settings` exposes `supportedCurrencies` for selector options. Invoice and expense records snapshot currency, so changing billing settings affects future records only.

### `GET /billing/reports/export.pdf`

- **Roles:** `doctor`, `secretary`
- **Secretary permission:** `billing:reports:export`
- **Query params:** same as `GET /billing/reports`, including `period`, `periodAnchor`, `groupBy`, and `currency`
- **Behavior:** generates a PDF using the same filters and all matching rows from the report export dataset, stores it in file storage, and returns a short-lived signed download URL.
- **Currency behavior:** PDF export uses the same no-FX report data. Mixed-currency PDFs label the report as multiple currencies and include row-level currency columns. When `currency=<code>` is provided, the PDF includes only that currency's rows, summaries, breakdowns, and trends.
- **Trend behavior:** PDF export includes grouped trend rows when grouping is active.
- **Response:** `200 OK`
  ```json
  {
    "messageKey": "success.files.downloadUrlGenerated",
    "message": "Download URL generated",
    "key": "billing-reports/doctor/65f0c4f6e6a0d0d0d0d0d021/uuid.pdf",
    "url": "https://storage.example/presigned-download",
    "downloadUrl": "https://storage.example/presigned-download",
    "expiresIn": 300,
    "fileName": "billing-report-2026-05-07.pdf",
    "contentType": "application/pdf"
  }
  ```
- **Frontend note:** Use `downloadUrl` directly for open/download/share flows. `url` is returned as a compatibility alias.

- **Example**

  ```bash
  curl -X GET "http://localhost:5000/api/billing/reports/export.pdf?dateFrom=2026-04-01&dateTo=2026-04-30" \
    -H "x-lang: en" \
    -H "Authorization: Bearer <token>"
  ```

### `GET /billing/settings`

- **Roles:** `doctor`, `secretary`
- **Secretary permission:** `billing:settings:view`
- **Behavior:** race-safe lazy creation via atomic upsert when no doctor billing settings exist yet.
- **Currency contract:** `settings.currency` is the selected currency code. `supportedCurrencies` lists the selectable options and `defaultCurrency` is the code used by lazy defaults.
- **Currency change behavior:** changing this setting affects future invoice and expense snapshots only; historical invoice/expense rows keep their existing currency snapshots.
- **Response:** `200 OK`

  ```json
  {
    "messageKey": "success.billing.settingsLoaded",
    "message": "Billing settings loaded.",
    "settings": {
      "currency": "USD",
      "taxEnabled": false,
      "defaultTaxPercent": 0,
      "discountPresets": [0, 10, 20, 30],
      "allowedPaymentMethods": ["cash", "card", "bank_transfer", "insurance"],
      "defaultInvoiceDueHours": 24,
      "unpaidAlertAfterHours": 24,
      "expenseCategories": [],
      "updatedAt": "2026-04-16T10:00:00.000Z"
    },
    "supportedCurrencies": [
      {
        "code": "USD",
        "name": "US Dollar",
        "symbol": "$",
        "isDefault": true
      },
      {
        "code": "EUR",
        "name": "Euro",
        "symbol": "EUR",
        "isDefault": false
      },
      {
        "code": "GBP",
        "name": "British Pound",
        "symbol": "GBP",
        "isDefault": false
      },
      {
        "code": "CAD",
        "name": "Canadian Dollar",
        "symbol": "CAD",
        "isDefault": false
      },
      {
        "code": "AUD",
        "name": "Australian Dollar",
        "symbol": "AUD",
        "isDefault": false
      },
      {
        "code": "CHF",
        "name": "Swiss Franc",
        "symbol": "CHF",
        "isDefault": false
      },
      {
        "code": "JPY",
        "name": "Japanese Yen",
        "symbol": "JPY",
        "isDefault": false
      },
      {
        "code": "CNY",
        "name": "Chinese Yuan",
        "symbol": "CNY",
        "isDefault": false
      },
      {
        "code": "INR",
        "name": "Indian Rupee",
        "symbol": "INR",
        "isDefault": false
      },
      {
        "code": "SYP",
        "name": "Syrian Pound",
        "symbol": "SYP",
        "isDefault": false
      },
      {
        "code": "AED",
        "name": "UAE Dirham",
        "symbol": "AED",
        "isDefault": false
      },
      {
        "code": "SAR",
        "name": "Saudi Riyal",
        "symbol": "SAR",
        "isDefault": false
      },
      {
        "code": "QAR",
        "name": "Qatari Riyal",
        "symbol": "QAR",
        "isDefault": false
      },
      {
        "code": "KWD",
        "name": "Kuwaiti Dinar",
        "symbol": "KWD",
        "isDefault": false
      },
      {
        "code": "JOD",
        "name": "Jordanian Dinar",
        "symbol": "JOD",
        "isDefault": false
      },
      {
        "code": "EGP",
        "name": "Egyptian Pound",
        "symbol": "EGP",
        "isDefault": false
      },
      {
        "code": "TRY",
        "name": "Turkish Lira",
        "symbol": "TRY",
        "isDefault": false
      }
    ],
    "defaultCurrency": "USD"
  }
  ```

- **Frontend note:** Load this before rendering settings forms, payment-method selectors, tax controls, or expense-category pickers. Render currency selector options from `supportedCurrencies`, persist the selected `code` to `settings.currency`, and treat `defaultCurrency` as the initial fallback only. The lazy-create behavior means the first read may also initialize defaults server-side.

### `PUT /billing/settings`

- **Roles:** `doctor`, `secretary`
- **Secretary permission:** `billing:settings:manage`
- **Currency validation:** optional `currency` is normalized to uppercase and must be one of the supported currency codes returned by `GET /billing/settings` (`USD`, `EUR`, `GBP`, `CAD`, `AUD`, `CHF`, `JPY`, `CNY`, `INR`, `SYP`, `AED`, `SAR`, `QAR`, `KWD`, `JOD`, `EGP`, `TRY`).
- **Body example:**

  ```json
  {
    "currency": "EUR",
    "taxEnabled": true,
    "defaultTaxPercent": 5,
    "discountPresets": [0, 5, 10, 20],
    "allowedPaymentMethods": ["cash", "card"],
    "defaultInvoiceDueHours": 48,
    "unpaidAlertAfterHours": 24,
    "expenseCategories": ["Supplies", "Rent"]
  }
  ```

- **Response:** `200 OK` with `messageKey: success.billing.settingsUpdated`; response body matches `GET /billing/settings`, including `settings`, `supportedCurrencies`, and `defaultCurrency`.
- **Frontend note:** After update, refresh the settings view and any open invoice-create form that depends on allowed methods, tax defaults, or expense categories.

### `GET /billing/services`

- **Roles:** `doctor`, `secretary`
- **Secretary permission:** `billing:services:view`
- **Query params:** optional `includeInactive`, `search`, `page`, `limit`
- **Response:** `200 OK`

  ```json
  {
    "messageKey": "success.ok",
    "message": "Request completed successfully.",
    "total": 1,
    "page": 1,
    "limit": 20,
    "services": [
      {
        "id": "661d1d1d1d1d1d1d1d1d5501",
        "name": "Consultation",
        "defaultPrice": 50,
        "durationMinutes": 30,
        "description": "Follow-up consultation",
        "isActive": true,
        "appointmentType": {
          "id": "661d1d1d1d1d1d1d1d1d6601",
          "name": "Consultation",
          "price": 50
        },
        "deletedAt": null
      }
    ]
  }
  ```

- **Frontend note:** Use this for billing-service admin tables and invoice service selectors. `includeInactive=true` includes inactive and archived soft-deleted services so admin UI can still display historical rows; hide them in patient/staff selection flows unless explicitly managing inactive records.

### `GET /billing/services/:serviceId`

- **Roles:** `doctor`, `secretary`
- **Secretary permission:** `billing:services:view`
- **Response:** `200 OK` with `messageKey: success.billing.serviceLoaded`
- **Frontend note:** Prefer detail fetches for edit forms when the list view does not already hold all fields the form needs.

### `POST /billing/services`

- **Roles:** `doctor`, `secretary`
- **Secretary permission:** `billing:services:manage`
- **Body example:**

  ```json
  {
    "name": "Consultation",
    "defaultPrice": 50,
    "durationMinutes": 30,
    "description": "Follow-up consultation",
    "appointmentTypeId": "661d1d1d1d1d1d1d1d1d6601",
    "isActive": true
  }
  ```

- **Rules:**
  - name must be unique per doctor across non-deleted billing services
  - linked appointment type must belong to the same doctor
- **Response:** `201 Created` with `messageKey: success.billing.serviceCreated`
- **Frontend note:** After create, refresh service lists and any invoice/service picker currently mounted for the same doctor scope.

### `PUT /billing/services/:serviceId`

- **Roles:** `doctor`, `secretary`
- **Secretary permission:** `billing:services:manage`
- **Body:** same shape as `POST /billing/services`
- **Response:** `200 OK` with `messageKey: success.billing.serviceUpdated`
- **Frontend note:** After update, refresh both the detail/edit view and any list/selectors that show service name, default price, duration, or linked appointment type.

### `DELETE /billing/services/:serviceId`

- **Roles:** `doctor`, `secretary`
- **Secretary permission:** `billing:services:manage`
- **Behavior:** soft delete; the service is marked inactive and `deletedAt` is set.
- **Response:** `200 OK` with `messageKey: success.billing.serviceDeleted`
- **Deleted service payload:** `service` contains only `id`, `name`, `isActive`, and `deletedAt`
- **Frontend note:** Treat delete as a soft-delete/archive from the UI perspective. Refresh service lists and clear any selector state that still points to the deleted service.

### Billing examples

```bash
# 1) create a draft invoice
curl -X POST "http://localhost:5000/api/billing/invoices" \
  -H "x-lang: en" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "661d1d1d1d1d1d1d1d1d2201",
    "sourceType": "manual",
    "status": "draft",
    "items": [
      {
        "serviceNameSnapshot": "Manual Service",
        "quantity": 1,
        "unitPrice": 50
      }
    ]
  }'

# 2) create a payment
curl -X POST "http://localhost:5000/api/billing/payments" \
  -H "x-lang: en" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "invoiceId": "661d1d1d1d1d1d1d1d1d1101",
    "amount": 50,
    "method": "cash"
  }'

# 3) load report JSON
curl -G "http://localhost:5000/api/billing/reports" \
  -H "x-lang: en" \
  -H "Authorization: Bearer <token>" \
  --data-urlencode "dateFrom=2026-04-01" \
  --data-urlencode "dateTo=2026-04-30"
```

## PDF Documents

### `POST /api/documents/generate`

- **Role (auth):** `patient | doctor | secretary`
- **Description:** Generate a PDF for a supported medical source and return it immediately as a downloadable binary HTTP response.
- **Auth requirements:**
  - `Authorization: Bearer <jwt>` is required.
  - Allowed authenticated roles are `patient`, `doctor`, and `secretary`.
  - The route loads caller profile context before generation.
  - For patient callers, the standard active-account guard still applies.
  - Access control is enforced before any PDF is rendered.
- **Language:** `x-lang: en | ar` is supported. The template resolves `lang` and `dir` before PDF rendering.

**Request body schema**

```json
{
  "sourceType": "prescription",
  "sourceId": "65f0c4f6e6a0d0d0d0d0d711"
}
```

**Allowed `sourceType` values**

| `sourceType`    | `sourceId` meaning                                                                |
| :-------------- | :-------------------------------------------------------------------------------- |
| `order`         | Order `_id`                                                                       |
| `imaging_order` | Imaging order `Order._id` where `orderType = IMAGING_ORDER`                       |
| `diagnosis`     | Medical record `_id`                                                              |
| `prescription`  | Standalone `Prescription._id` first; legacy medication subdocument `_id` fallback |

**Validation**

- `sourceType` is required and must be one of: `order`, `imaging_order`, `prescription`, `diagnosis`.
- `sourceId` is required and must be a valid MongoDB ObjectId.
- At the HTTP API boundary, unsupported `sourceType` values are rejected as `422` validation failures.

**Access behavior**

- `patient`: may generate PDFs only for the patient's own data.
- `doctor`: may generate PDFs only for data the doctor is allowed to access under the existing order, medical-record, and patient-profile access rules.
- `secretary`: may generate PDFs only within assigned-doctor scope using the existing delegated access rules.
- `imaging_order` is doctor-side only:
  - `doctor`: must own the imaging order and remain canonically linked to the patient.
  - `secretary`: may generate only through the existing assigned-doctor delegated scope for that owning doctor.
  - `patient`: is not allowed to generate `imaging_order` PDFs.
- Permission checks happen before data shaping, HTML rendering, and PDF generation.

**Response behavior**

- Success returns a binary response, not a JSON body.
- Success response:
  - `200 OK`
  - `Content-Type: application/pdf`
  - `Content-Disposition: attachment; filename="..."`
  - `Cache-Control: no-store`
- The response body is the raw PDF binary payload.
- Frontend code must treat the response as binary data (`blob`, `arraybuffer`, or raw bytes depending on client platform).
- This endpoint still generates the PDF synchronously and returns it directly in the same request.
- Persistence is now available through the encounter-document link flow rather than this endpoint itself.
- `POST /api/doctors/:doctorId/patients/:patientId/encounters/:encounterId/documents/link` can generate, persist, and link supported PDFs to patient files and encounter documents.
- There is currently no `GET /api/documents/:id/download` endpoint.
- **Binary response note:** The standard JSON success envelope does not apply on success. Only error responses from this endpoint are JSON.
- **Frontend note:** Keep the user on the current screen with a loading state until the binary response completes or fails; this route is synchronous and request-bound.

**Frontend integration notes**

- Web clients should request the response as `blob` or `arraybuffer`.
- Mobile clients should use byte-stream or file-download handling, not JSON parsing.
- When `Content-Disposition` is present, use it as the preferred filename.
- Do not call `response.json()` on a successful PDF generation response.
- **Frontend note:** If the product also supports later sharing or retrieval, treat this endpoint as "generate now" only and use the encounter-document flows for persistence/linking.

**Errors**

- `422` invalid request body (`sourceType` or `sourceId` invalid or missing)
- `403` access denied
- `404` source entity not found
- `500` render or generation failure

Example `422` validation error:

```json
{
  "status": 422,
  "messageKey": "errors.validationFailed",
  "message": "Validation failed.",
  "errors": [
    {
      "type": "field",
      "value": "visit_summary",
      "msg": "errors.validation.invalidEnum",
      "path": "sourceType",
      "location": "body"
    }
  ]
}
```

Example `404` source-not-found error:

```json
{
  "status": 404,
  "messageKey": "errors.documents.medicationNotFound",
  "message": "Medication not found.",
  "errors": null
}
```

**Request examples**

Order:

```json
{
  "sourceType": "order",
  "sourceId": "65f0c4f6e6a0d0d0d0d0d511"
}
```

Official imaging order:

```json
{
  "sourceType": "imaging_order",
  "sourceId": "65f0c4f6e6a0d0d0d0d0d512"
}
```

Prescription:

```json
{
  "sourceType": "prescription",
  "sourceId": "65f0c4f6e6a0d0d0d0d0d711"
}
```

Diagnosis:

```json
{
  "sourceType": "diagnosis",
  "sourceId": "65f0c4f6e6a0d0d0d0d0d611"
}
```

**Success response example**

The success response is binary. A typical HTTP response looks like:

```http
HTTP/1.1 200 OK
Content-Type: application/pdf
Content-Disposition: attachment; filename="prescription-paracetamol-65f0c4f6e6a0d0d0d0d0d711.pdf"
Cache-Control: no-store

%PDF-1.4
...raw binary bytes...
```

**Generation flow**

1. The authenticated request reaches `POST /api/documents/generate`.
2. The backend validates `sourceType` and `sourceId`.
3. The document service routes the request to the matching builder for `order`, `imaging_order`, `prescription`, or `diagnosis`.
4. The builder resolves the source entity:
   - `order` -> `Order` by `_id`
   - `imaging_order` -> `Order` by `_id` where `orderType = IMAGING_ORDER`
   - `diagnosis` -> `MedicalRecord` by `_id`
   - `prescription` -> `Prescription` by `_id` first, with legacy `patient.medications._id` fallback for older records
5. The builder enforces role-based access rules and shapes a document view model.
6. The matching HTML template renders escaped content for English or Arabic output.
7. The PDF renderer calls `wkhtmltopdf` and returns generated PDF bytes.
8. The controller sets download headers and returns the PDF in the HTTP response.

**Notes**

- `prescription` now supports the real grouped `Prescription` model and still keeps the medication-subdocument fallback for compatibility.
- The PDF module is intentionally synchronous and request-bound in this version.
- Direct generation remains request-bound here, while persistence and share flows now live under the encounter-document endpoints.
- **Compatibility note:** The medication-subdocument fallback remains documented because older records may still resolve through it, but new grouped-prescription flows should rely on the canonical `Prescription` model behavior described above.

## Patient Settings (Security)

Strict model for patient security settings:

- Password change requires the current password and revokes all existing auth sessions.
- Email and phone changes use a 2-step flow:
  1. authenticated patient requests the change with `currentPassword`
  2. backend sends an OTP to the new destination
  3. patient confirms with the OTP
  4. backend applies the change and revokes all existing auth sessions
- Email/phone request + confirm writes auth audit coverage for request, OTP verification, contact update, and token invalidation.
- Email/phone request endpoints require the normal patient active-state guard.
- **Frontend note:** After a successful password change, email confirm, or phone confirm, treat every existing access and refresh token as invalid and force the user through a fresh login. The token used to make the request is no longer valid after the mutation completes.

### `PUT /patient/settings/password`

- **Description:** Change password using current password.
- **Auth:** Patient
- **Notes:** Use this when you are logged in; if you forgot your password use `/auth/reset-password`. A successful password change revokes all existing auth sessions, including the one used for the current request.
- **Body:** `{ "currentPassword": "Old123", "newPassword": "New123456" }`
- **Response:** `{ "messageKey": "success.auth.passwordUpdated" }`
- **Common errors:** `errors.auth.currentPasswordIncorrect`, `errors.auth.passwordSameAsOld`
- **Frontend note:** A settings screen should show a success confirmation and then immediately sign the user out because the current auth session is revoked.

### `POST /patient/settings/email/request`

- **Description:** Start a strict email-change flow. The patient must prove knowledge of the current password before an OTP is sent to the new email.
- **Auth:** Patient
- **Body:** `{ "currentPassword": "Old123", "newEmail": "new@example.com" }`
- **Response:** `{ "messageKey": "success.auth.emailChangeOtpSent" }`
- **Behavior:** rejects same-as-current email, duplicate target email, wrong current password, and OTP request cooldown / hourly limit violations.
- **Audit:** `AUTH_EMAIL_CHANGE_REQUESTED`
- **Frontend note:** Keep the user in an authenticated "confirm new email" step until `POST /patient/settings/email/confirm` succeeds. Do not swap the visible primary email in app state yet.

### `POST /patient/settings/email/confirm`

- **Description:** Confirm the pending email change with the OTP that was sent to the new email address. The email is changed only after OTP verification succeeds.
- **Auth:** Patient
- **Body:** `{ "otp": "123456" }`
- **Response:** `{ "messageKey": "success.auth.emailUpdated" }`
- **Behavior:** verifies the OTP, applies the email change, then revokes all existing auth sessions. Reused / missing / expired / invalid codes are rejected.
- **Audit:** `AUTH_EMAIL_CHANGE_VERIFIED`, `AUTH_EMAIL_CHANGED`, `AUTH_TOKEN_INVALIDATED`
- **Frontend note:** After success, clear auth state and send the user back through login using the new email address.

### `POST /patient/settings/phone/request`

- **Description:** Start a strict phone-change flow. The patient must prove knowledge of the current password before an OTP is sent to the new phone number over the existing WhatsApp channel.
- **Auth:** Patient
- **Body:** `{ "currentPassword": "Old123", "newPhone": "+96331745823" }`
- **Response:** `{ "messageKey": "success.auth.phoneChangeOtpSent" }`
- **Behavior:** rejects same-as-current phone, duplicate target phone, wrong current password, and OTP request cooldown / hourly limit violations.
- **Audit:** `AUTH_PHONE_CHANGE_REQUESTED`
- **Frontend note:** Keep the pending new phone only in transient form state until `POST /patient/settings/phone/confirm` succeeds.

### `POST /patient/settings/phone/confirm`

- **Description:** Confirm the pending phone change with the OTP that was sent or queued for the new phone number. The phone is changed only after OTP verification succeeds.
- **Auth:** Patient
- **Body:** `{ "otp": "123456" }`
- **Response:** `{ "messageKey": "success.auth.phoneUpdated" }`
- **Behavior:** verifies the OTP, applies the phone change, then revokes all existing auth sessions. Reused / missing / expired / invalid codes are rejected.
- **Audit:** `AUTH_PHONE_CHANGE_VERIFIED`, `AUTH_PHONE_CHANGED`, `AUTH_TOKEN_INVALIDATED`
- **Frontend note:** After success, clear auth state and send the user back through login using the updated phone value if the app supports phone-based sign-in.

---

## Doctor Search

### `GET /doctors/search`

- **Description:** Patient searches approved doctors with filters. Optional GPS coordinates enable nearby-first sorting.
- **Auth:** Patient
- **Query params:** `search` (matches name/email/phone/specialization/clinicAddress), `q`/`doctorName` (legacy aliases), `specialty`, `locationCity`, `locationCountry`, `consultationType` (`online`/`offline`), `minRating`, `availableOn` (ISO date), `page`, `limit`, `lat`, `lng`, `radiusKm` (default 25, max 200).
- **Behavior:**
  - If `lat` + `lng` are **absent**, results are sorted by `averageRating`, `totalReviews`, `createdAt` (existing behavior).
  - If `lat` + `lng` are **present**, results are returned as:
    1. geo-verified doctors (approved + `geoStatus=verified` + pin) sorted by distance (ASC) then rating/reviews,
    2. remaining approved doctors appended after, sorted by the default rating/reviews/createdAt order.
  - `distanceMeters` is included for the geo subset only.
- **Response:** `{ "page": 1, "limit": 20, "total": 2, "doctors": [ { "_id": "...", "specialization": "...", "consultationTypes": ["online"], "averageRating": 4.8, "totalReviews": 10, "user": { "fullName": "Dr..." }, "distanceMeters": 1240 } ] }`

---

## Internal Doctor Directory (staff)

### `GET /doctors/internal/directory`

- **Description:** Internal listing of approved doctors for doctors/secretaries (limited fields). Optional GPS coordinates enable nearby-first sorting.
- **Auth:** Doctor, Secretary
- **Query params:** `search` (matches name/email/phone/specialization/clinicAddress/city/country), `specialization`, `city`, `country`, `consultationType` (`online`/`offline`), `minRating`, `page`, `limit`, `lat`, `lng`, `radiusKm` (default 25, max 200).
- **Behavior:** Same geo ordering as `/doctors/search` when `lat` + `lng` are provided; otherwise keeps the default rating/reviews/createdAt sort. `distanceMeters` is included for the geo subset only.
- **Response:** `{ "page": 1, "limit": 20, "total": 2, "doctors": [ { "_id": "...", "specialization": "...", "consultationTypes": ["online"], "consultationFee": 300, "averageRating": 4.8, "totalReviews": 10, "approvalStatus": "approved", "user": { "fullName": "Dr...", "email": "...", "phone": "...", "photoUrl": "..." }, "distanceMeters": 1240 } ] }`

## Reviews

### `POST /patient/doctors/:doctorId/reviews`

- **Description:** Patient creates or updates a review for a linked doctor.
- **Policy:** One review per patient per doctor. Re-submitting updates/replaces the previous review.
- **Rate limit:** `10` requests per `15` minutes per patient-doctor pair (configurable via `REVIEW_SUBMIT_RATE_LIMIT_MAX`, `REVIEW_SUBMIT_RATE_LIMIT_WINDOW_MS`).
- **Auth:** Patient
- **Body:** `{ "rating": 5, "comment": "Great experience" }`
- **Response:** `201` when first created, `200` when updated. Body: `{ "message": "Review saved", "review": { ... } }`
- **Error:** `429 Too Many Requests` when rate limit is exceeded.

### `GET /doctors/:doctorId/reviews`

- **Description:** List reviews for a doctor (public).
- **Auth:** None
- **Query params:** `page`, `limit`
- **Response:** `{ "page": 1, "limit": 20, "total": 3, "reviews": [ { "rating": 5, "comment": "...", "patient": { "userId": { "fullName": "Sara" } } } ] }`

---

## Notifications

- **Delivery:** best-effort; notification failures are logged and do not affect API responses.

### Notification triggers (selected)

- Appointments: see "Appointment notifications" in Appointment Service.
- Consultations: create -> notify doctor; message -> notify the other party; close/update -> notify the other party.
- Access requests: doctor request -> patient; patient decision -> doctor.
- Orders: doctor creates -> patient.
- Medications: doctor adds -> patient.
- Admin patient activation -> patient (reset password required).
- Admin doctor verification/profile change review -> doctor.

### `GET /notifications`

- **Description:** List notifications for the authenticated user (patients see their own).
- **Auth:** Any authenticated user
- **Query params:** `page`, `limit`, `unread_only` (bool)
- **Response:** `{ "page": 1, "limit": 20, "total": 5, "notifications": [ { "title": "...", "body": "...", "isRead": false } ] }`

### `PATCH /notifications/read-all`

- **Description:** Mark all notifications as read for the authenticated user.
- **Auth:** Any authenticated user
- **Response:** `{ "message": "All notifications marked as read", "updated": 3 }`

### `PATCH /notifications/:id/read`

- **Description:** Mark a specific notification as read (must belong to caller).
- **Auth:** Any authenticated user
- **Response:** `{ "message": "Notification marked as read", "notification": { ... } }`

---

## Admin Users (Data Entry)

### `POST /admin/users`

- **Description:** Admin creates a data-entry user.
- **Auth:** Admin
- **Body:** `{ "fullName": "Lab Operator", "email": "op@example.com", "password": "StrongPass!1", "role": "data_entry", "phoneNumber": "+15550001111" }`
- **Response:** `{ "message": "User created successfully", "user": { "id": "...", "role": "data_entry", "isActive": true } }`

### `GET /admin/users`

- **Description:** List data-entry users.
- **Auth:** Admin
- **Response:** `{ "users": [ { "id": "...", "fullName": "...", "email": "...", "phone": "...", "isActive": true, "createdAt": "2025-12-28T12:00:00.000Z" } ] }`

---

## Admin Audit Logs

### `GET /admin/audit-logs`

- **Description:** List audit logs across the system.
- **Auth:** Admin
- **Query params:**
  - `page`, `limit` (max `100`)
  - `actorUserId`, `actorRole`
  - `category`, `action`, `outcome`
  - `entityType`, `entityId`
  - `patientId`, `targetUserId`
  - `requestId`, `ip`
  - `from`, `to` (ISO-8601)
  - `search` (safe partial match across `action`, `entityType`, `requestId`, `route`, `ip`, `reason`, `actorRole`)
- **Response:**
  `{ "page": 1, "limit": 20, "total": 25, "results": 20, "auditLogs": [ { "category": "AUTH", "action": "AUTH_LOGIN_FAILED", "outcome": "FAIL", "actorUserId": "...", "actorUserName": "Dr Mona", "actorRole": "doctor", "entityType": "User", "entityId": "...", "patientId": null, "patientName": null, "patientPublicId": null, "targetUserId": "...", "targetUserName": "Dr Mona", "requestId": "req-123", "ip": "203.0.113.10", "route": "/api/auth/login", "method": "POST", "createdAt": "..." } ] }`
  - IDs remain canonical (`actorUserId`, `patientId`, `targetUserId`); `actorUserName`, `patientName`, `patientPublicId`, and `targetUserName` are display enrichments.

### `GET /doctors/me/activity-log`

- **Description:** List the authenticated doctor's curated activity timeline.
- **Auth:** Doctor
- **Query params:**
  - `page`, `limit` (max `100`)
  - `actorRole`
  - `type` (single value or comma-separated list)
  - `from`, `to` (ISO-8601)
- **Behavior:**
  - backed by the shared `AuditLog` collection but mapped into stable doctor-facing activity types
  - includes doctor self account/security history plus doctor-scoped workflow events such as appointments, consultations, access-request lifecycle, medical-record and order actions, schedule updates, and doctor-owned template/library mutations
  - because there is no separate doctor access-log route, the activity feed also includes high-signal audited PHI access events already captured by policy, such as medical-record open, consultation open, prescription open, and patient-file download
  - includes delegated secretary actions when they were performed on behalf of the authenticated doctor and patient-originated workflow events tied to the doctor scope
  - ordered newest first
  - omits internal request routing fields and raw audit taxonomy from the public payload
- **Response:**
  `{ "messageKey": "success.ok", "page": 1, "limit": 20, "total": 2, "results": 2, "activityLogs": [ { "_id": "...", "type": "login_success", "actorRole": "doctor", "actorDisplayName": "Dr Mona", "entityType": "User", "entityId": "...", "occurredAt": "...", "details": { "credential": "email", "clientType": "doctor_mobile" } }, { "_id": "...", "type": "appointment_booked", "actorRole": "patient", "actorDisplayName": "Sara Ali", "entityType": "Appointment", "entityId": "...", "occurredAt": "...", "details": { "patientId": "...", "patientName": "Sara Ali", "patientPublicId": "P-00AB12CD", "status": "scheduled", "startDateTime": "...", "endDateTime": "..." } } ] }`

### `GET /patient/me/activity-log`

- **Description:** List the authenticated patient's activity timeline, including patient actions and patient-facing account/security history.
- **Auth:** Patient
- **Query params:**
  - `page`, `limit` (max `100`)
  - `actorRole`
  - `type` (single value or comma-separated list)
  - `from`, `to` (ISO-8601)
- **Behavior:**
  - backed by the shared `AuditLog` collection but mapped into stable patient-facing activity types
  - includes patient actions such as appointments, consultations, profile updates, complaints, uploads, access-request decisions, and patient account/security events such as login failures, password changes, session revocation, and contact changes
  - ordered newest first
  - omits internal request routing fields and raw audit taxonomy from the public payload
- **Response:**
  `{ "messageKey": "success.ok", "page": 1, "limit": 20, "total": 2, "results": 2, "activityLogs": [ { "_id": "...", "type": "login_failed", "actorRole": "patient", "actorDisplayName": "Sara Ali", "entityType": "User", "entityId": "...", "occurredAt": "...", "details": { "credential": "email", "reason": "errors.auth.invalidEmailOrPhone" } }, { "_id": "...", "type": "appointment_booked", "actorRole": "patient", "actorDisplayName": "Sara Ali", "entityType": "Appointment", "entityId": "...", "occurredAt": "...", "details": { "status": "scheduled", "startDateTime": "...", "endDateTime": "..." } } ] }`

### `GET /patient/me/access-log`

- **Description:** List the authenticated patient's curated PHI access history.
- **Auth:** Patient
- **Query params:**
  - `page`, `limit` (max `100`)
  - `actorRole`
  - `accessType` (single value or comma-separated list)
  - `from`, `to` (ISO-8601)
- **Behavior:**
  - backed by the shared `AuditLog` collection but restricted to high-signal audited access events
  - includes patient-data access signals such as medical-record open, staff patient-file download, consultation open, and blocked high-signal access attempts already captured by policy
  - does not attempt to represent every low-signal read or list operation
  - shows actor role for every event and actor identity only when the patient-facing policy allows it
  - ordered newest first
- **Response:**
  `{ "messageKey": "success.ok", "page": 1, "limit": 20, "total": 1, "results": 1, "accessLogs": [ { "_id": "...", "accessType": "medical_record_opened", "actorRole": "doctor", "actorDisplayName": "Dr Mona", "actorIdentityVisible": true, "entityType": "MedicalRecord", "entityId": "...", "occurredAt": "...", "details": { "doctorId": "..." } } ] }`

### `GET /patient/audit-logs`

- **Description:** Backward-compatible mixed self-audit feed for the authenticated patient.
- **Auth:** Patient
- **Query params:**
  - `page`, `limit` (max `100`)
  - `actorRole`
  - `category`, `action`, `outcome`
  - `entityType`
  - `from`, `to` (ISO-8601)
  - `search` (safe partial match across stored audit fields)
- **Behavior:**
  - combines patient-scoped audit rows (`patientId = current patient`) with self account/security rows tied to the authenticated user
  - includes patient-relevant `SYSTEM_*` compatibility events such as access-request decisions and privacy-toggle changes
  - omits internal request routing fields such as `requestId`, `route`, and `method`
  - only exposes `ip` and `userAgent` for the patient's own account/security events
- **Response:**
  `{ "messageKey": "success.ok", "page": 1, "limit": 20, "total": 2, "results": 2, "auditLogs": [ { "_id": "...", "category": "AUTH", "action": "AUTH_LOGIN_SUCCESS", "outcome": "SUCCESS", "actorUserId": "...", "actorUserName": "Sara Ali", "actorRole": "patient", "entityType": "User", "entityId": "...", "patientId": null, "targetUserId": "...", "targetUserName": "Sara Ali", "before": null, "after": null, "metadata": null, "ip": "203.0.113.10", "userAgent": "LMJ Mobile/1.0", "createdAt": "..." }, { "_id": "...", "category": "PHI", "action": "PHI_OPEN_MEDICAL_RECORD", "outcome": "SUCCESS", "actorUserId": "...", "actorUserName": "Dr Mona", "actorRole": "doctor", "entityType": "MedicalRecord", "entityId": "...", "patientId": "...", "targetUserId": null, "targetUserName": null, "before": null, "after": null, "metadata": { "doctorId": "..." }, "ip": null, "userAgent": null, "createdAt": "..." } ] }`

---

## Health Profile Lookup Options

### `GET /meta/health-profile-options`

- **Description:** List health-profile options (fixed blood types, active allergies, active medical conditions).
- **Auth:** `admin | doctor | patient | secretary | data_entry`
- **Behavior:** Blood Type is a fixed, read-only clinical enum: `A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`. Allergies and medical conditions include only `isActive=true` lookup options and are sorted by `order` then `text.en`.
- **Notes:** Localized by `x-lang` (default string). Use `?includeAllLangs=true` to return `{ en, ar }` objects.
- **Response (default):**

```json
{
  "bloodTypes": [
    { "id": "A+", "key": "A+", "text": "A+", "order": 1 }
  ],
  "allergies": [
    { "id": "64f...", "key": "peanut", "text": "Peanut", "order": 10 }
  ],
  "medicalConditions": [
    { "id": "64f...", "key": "diabetes", "text": "Diabetes", "order": 1 }
  ]
}
```

- **Response (includeAllLangs=true):**

```json
{
  "bloodTypes": [
    {
      "id": "A+",
      "key": "A+",
      "text": { "ar": "A+", "en": "A+" },
      "order": 1
    }
  ],
  "allergies": [
    {
      "id": "64f...",
      "key": "peanut",
      "text": { "ar": "الفول السوداني", "en": "Peanut" },
      "order": 10
    }
  ],
  "medicalConditions": [
    {
      "id": "64f...",
      "key": "diabetes",
      "text": { "ar": "السكري", "en": "Diabetes" },
      "order": 1
    }
  ]
}
```

### `GET /meta/doctor-specializations`

- **Description:** Public specialization catalog for doctor signup and admin-managed doctor-specialization dropdowns.
- **Auth:** None
- **Behavior:** Only active `DOCTOR_SPECIALIZATION` lookup options are returned, sorted by `order` then `text.en`.
- **Notes:** Localized by `x-lang` (default string). Use `?includeAllLangs=true` to return `{ en, ar }` objects.
- **Response (default):**

```json
{
  "doctorSpecializations": [
    { "id": "64f...", "key": "cardiology", "text": "Cardiology", "order": 10 }
  ]
}
```

### `GET /admin/lookups`

- **Description:** List lookup options (admin).
- **Auth:** Admin
- **Query:** `category` (`ALLERGY`, `MEDICAL_CONDITION`, `DOCTOR_SPECIALIZATION`), `includeInactive` (`true|false`), `langOnly` (`true|false`)
- **Response:** `{ "results": 3, "lookups": [ { "_id": "...", "category": "ALLERGY", "key": "peanut", "text": { "ar": "...", "en": "..." }, "order": 10, "isActive": true } ] }`
- **Blood Type:** not listed or managed here. Use `GET /api/meta/health-profile-options` for the fixed read-only list.

### `POST /admin/lookups`

- **Description:** Create a lookup option (admin).
- **Auth:** Admin
- **Notes:** `text` accepts a string or `{ "en": "...", "ar": "..." }`.
- **Blood Type:** `category=BLOOD_TYPE` is rejected; Blood Type has no admin CRUD.
- **Body example:**

```json
{
  "category": "DOCTOR_SPECIALIZATION",
  "key": "cardiology",
  "text": { "ar": "أمراض القلب", "en": "Cardiology" },
  "order": 10
}
```

### `PATCH /admin/lookups/:id`

- **Description:** Update key, text, order, or isActive for mutable lookup categories.
- **Auth:** Admin
- **Notes:** Partial language updates merge and preserve existing translations.
- **Body example:** `{ "text": { "ar": "الغبار" }, "order": 2, "isActive": true }`

### `DELETE /admin/lookups/:id`

- **Description:** Soft-delete a mutable lookup option (sets `isActive=false`). Blood Type records, including legacy records, are read-only and cannot be changed through this API.

### Blood Type migration note

Existing patient `bloodType` values outside the fixed enum must be reviewed and migrated before enforcing the new validation on production data. Normalize only known safe variants to the canonical values above; set every other historical value to `null` and retain an operational report of affected patient IDs. Legacy `BLOOD_TYPE` lookup records are ignored by the application and must not be used as selectable values.
- **Auth:** Admin

---

## Service Types (Admin)

### `POST /service-types`

- **Description:** Create a service type with dynamic fields.
- **Auth:** Admin
- **Notes:** `name`, `description`, and every nested `fields[].label` / `itemFields[].label` accept a string or `{ "en": "...", "ar": "..." }`.
- **Schema shape:** Field definitions now support optional recursive metadata:
  - `format`: `text|image_url|url|phone|email|date|time|datetime|currency|rating|address`
  - `uiHint`: `text|image|gallery|link|phone|email|map|badge|chips|rating|price|schedule`
  - `fields`: nested fields for `type=object`
  - `itemType`: item type for `type=array`
  - `itemFields`: nested item fields for `type=array` with `itemType=object`
- **Body example:**

```json
{
  "name": { "en": "Laboratory", "ar": "مختبر" },
  "slug": "lab",
  "description": { "en": "Lab services", "ar": "خدمات مختبر" },
  "fields": [
    {
      "key": "name",
      "label": { "en": "Name", "ar": "الاسم" },
      "type": "string",
      "required": true
    },
    {
      "key": "licenseNumber",
      "label": { "en": "License", "ar": "الرخصة" },
      "type": "string",
      "required": true,
      "isPublic": false
    },
    {
      "key": "homeCollection",
      "label": { "en": "Home collection", "ar": "سحب منزلي" },
      "type": "boolean"
    },
    {
      "key": "contact",
      "label": { "en": "Contact", "ar": "التواصل" },
      "type": "object",
      "fields": [
        {
          "key": "phone",
          "label": { "en": "Phone", "ar": "الهاتف" },
          "type": "string",
          "format": "phone",
          "uiHint": "phone",
          "required": true
        }
      ]
    }
  ]
}
```

- **Response (default, bilingual):** `{ "serviceType": { "_id": "...", "name": { "en": "Laboratory", "ar": "مختبر" }, "schemaVersion": 1, "fields": [ ... ] } }`
- **Response (langOnly=true):** `name`, `description`, `label` become strings based on `x-lang`.

### `PUT /service-types/:id`

- **Description:** Update name/description/slug/isActive/fields for a service type. If `fields` changes (key-based comparison), `schemaVersion` is incremented automatically.
- **Auth:** Admin
- **Notes:** Partial language updates merge and preserve existing translations.
- **Body example:**

```json
{
  "name": { "en": "Laboratory v2" },
  "description": { "en": "Updated description" },
  "fields": [
    {
      "key": "name",
      "label": { "en": "Name", "ar": "الاسم" },
      "type": "string",
      "required": true
    },
    {
      "key": "licenseNumber",
      "label": { "en": "License", "ar": "الرخصة" },
      "type": "string",
      "required": true,
      "isPublic": false
    },
    {
      "key": "homeCollection",
      "label": { "en": "Home collection", "ar": "سحب منزلي" },
      "type": "boolean"
    },
    {
      "key": "tests",
      "label": { "en": "Available Tests", "ar": "الفحوصات المتاحة" },
      "type": "array",
      "required": true
    }
  ]
}
```

- **Response:** `{ "serviceType": { "_id": "...", "name": "Laboratory v2", "schemaVersion": 2, "fields": [ ... ] } }`

### `GET /service-types`

- **Description:** List service types; optional `active=true|false`.
- **Auth:** Admin
- **Query:** `active=true|false`, `langOnly=true|false`
- **Response:** `{ "serviceTypes": [ { "_id": "...", "name": "...", "slug": "...", "schemaVersion": 1, "isActive": true, "fields": [ ... ] } ] }`

---

## Service Providers (Admin + Data Entry)

**Route map**

- `GET    /service-providers` (admin, data_entry)
- `GET    /service-providers/:id` (admin, data_entry)
- `POST   /service-providers` (admin, data_entry)
- `PUT    /service-providers/:id` (admin, data_entry)
- `PATCH  /service-providers/:id/status` (admin)
- `POST   /service-types` (admin)
- `PUT    /service-types/:id` (admin)
- `GET    /service-types` (admin)
- `GET    /services/types` (public)
- `GET    /services` (public/patient)
- `GET    /services/:id` (public/patient)
- `PATCH  /services/:id/favorite` (patient)
- `GET    /patient/saved-services` (patient)
- `POST   /admin/users` (admin)
- `GET    /admin/users` (admin)

**Key behaviors**

- Schema versioning: `ServiceType.schemaVersion` starts at 1 and auto-increments when `fields` change. Providers store `schemaVersionAtWrite` from the service type at write/activation time.
- Status transitions: Data-entry users can only save `draft`. Admin-only transitions: `draft->active|inactive`, `active->inactive`, `inactive->active`. Activating validates against the current schema and refreshes `schemaVersionAtWrite`.
- Dynamic validation: Unknown fields rejected; type/enum/min/max/regex enforced; forbids keys starting with `$` or `__proto__`/`constructor`/`prototype` at any depth.
- Dynamic field capabilities: service-type fields can declare `isFilterable`, `isSearchable`, `isSortable`, and `filterKind` (`term | multi_term | range | boolean`) for public browsing.
- Geo-enabled service types can define one `geo_point` field. Geo-point fields are public data fields only; they cannot be filterable, searchable, or sortable.
- Public browsing: Only `status=active` providers are returned and only fields with `isPublic=true`.
- Administrative browsing: `GET /service-providers` is separate from the public catalog. It returns complete `data` and includes draft/inactive providers and providers whose service type is inactive. Admins can see all non-facility providers; data-entry users can see and update only records they created.
- Inactive service types: no new provider can be created for an inactive type, and a provider cannot be activated while its type is inactive. Admins can still inspect, correct, or deactivate existing providers under that type.
- Service-type field keys are technical identifiers: they must start with a Latin letter and then contain only Latin letters, numbers, or `_` (for example, `scientificNumber`). Labels remain localized and may be Arabic or mixed-language.
- Provider schema validation failures return `errors.serviceProvider.validationFailed` with a field-level `errors` array; clients should render those errors next to the relevant dynamic field.
- Provider-level discovery fields: `name`, `city`, `country`, `aliases`, derived `searchText`, and optional indexed `geoLocation` are stored top-level on providers for global search/filter UX.
- Localization: String fields can be `{ en, ar }` objects; admin responses return bilingual fields unless `?langOnly=true`.
- Cursor pagination (preferred): `GET /services?type=<slug>&limit=<n>&cursor=<base64>` → `{ "items": [...], "limit": n, "nextCursor": "<base64|null>" }`. Cursor pagination only supports the default `createdAt desc` sort. Legacy page/limit remains for compatibility.
- Geo search: `GET /services?lat=<lat>&lng=<lng>&radiusKm=<km>` uses provider geo points, filters to the radius (default `25`, max `200`), sorts nearest-first, and includes `distanceMeters` in results. Cursor pagination is not supported for geo-based search.
- Saved services: favorites are user-specific relations, not provider fields. Patients manage them through `PATCH /services/:id/favorite` and browse them through `GET /patient/saved-services`.

### `POST /admin/users`

- **Description:** Create a data-entry user.
- **Auth:** Admin
- **Body example:**

```json
{
  "fullName": "Lab Operator",
  "email": "lab-operator@example.com",
  "password": "StrongPass!1",
  "role": "data_entry",
  "phoneNumber": "+15551234567"
}
```

- **Response:** `{ "message": "User created successfully", "user": { "id": "...", "role": "data_entry", "isActive": true } }`

### `POST /service-types`

- **Description:** Create a service type with dynamic fields (schema-as-data).
- **Auth:** Admin
- **Notes:** `name`, `description`, and `fields[].label` accept a string or `{ "en": "...", "ar": "..." }`.
- **Body example:**

```json
{
  "name": { "en": "Laboratory", "ar": "مختبر" },
  "slug": "lab",
  "description": { "en": "Lab services", "ar": "خدمات مختبر" },
  "fields": [
    {
      "key": "name",
      "label": { "en": "Name", "ar": "الاسم" },
      "type": "string",
      "required": true
    },
    {
      "key": "licenseNumber",
      "label": { "en": "License #", "ar": "رقم الرخصة" },
      "type": "string",
      "required": true,
      "isPublic": false
    },
    {
      "key": "homeCollection",
      "label": { "en": "Home collection", "ar": "سحب منزلي" },
      "type": "boolean"
    },
    {
      "key": "tests",
      "label": { "en": "Available Tests", "ar": "الفحوصات المتاحة" },
      "type": "array",
      "required": true
    }
  ]
}
```

- **Response:** `{ "serviceType": { "_id": "...", "schemaVersion": 1, "fields": [ ... ] } }`

### `PUT /service-types/:id`

- **Description:** Update name/description/slug/isActive/fields; if `fields` changes, `schemaVersion` auto-increments.
- **Auth:** Admin
- **Notes:** Partial language updates merge and preserve existing translations.
- **Body example:** (adding a new public field)

```json
{
  "fields": [
    {
      "key": "name",
      "label": { "en": "Name", "ar": "الاسم" },
      "type": "string",
      "required": true
    },
    {
      "key": "licenseNumber",
      "label": { "en": "License #", "ar": "رقم الرخصة" },
      "type": "string",
      "required": true,
      "isPublic": false
    },
    {
      "key": "homeCollection",
      "label": { "en": "Home collection", "ar": "سحب منزلي" },
      "type": "boolean"
    },
    {
      "key": "tests",
      "label": { "en": "Available Tests", "ar": "الفحوصات المتاحة" },
      "type": "array",
      "required": true
    },
    {
      "key": "city",
      "label": { "en": "City", "ar": "المدينة" },
      "type": "string",
      "required": false
    }
  ]
}
```

- **Response:** `{ "serviceType": { "_id": "...", "schemaVersion": 2, "fields": [ ... ] } }`

### `POST /service-providers`

- **Description:** Create a provider instance against a service type. Data-entry users are forced to `draft` status.
- **Auth:** Admin or Data Entry
- **Notes:** For string fields, `data` accepts a string or `{ "en": "...", "ar": "..." }`.
- **Body example:**

```json
{
  "serviceType": "<SERVICE_TYPE_ID>",
  "name": "City Labs",
  "city": "Cairo",
  "country": "Egypt",
  "aliases": ["CL", "CityLab"],
  "status": "draft",
  "data": {
    "name": { "en": "City Labs", "ar": "مختبر المدينة" },
    "licenseNumber": "LIC-12345",
    "homeCollection": true,
    "tests": ["CBC", "Lipid Panel"],
    "city": { "en": "Cairo", "ar": "القاهرة" }
  }
}
```

- **Response:** `{ "provider": { "_id": "...", "status": "draft", "schemaVersionAtWrite": 2, "data": { ... } } }`

### `GET /service-providers`

- **Description:** Administrative provider list for the management interface. This endpoint is intentionally distinct from the public `/services` catalog and returns all schema-driven data, including fields where `isPublic=false`.
- **Auth:** Admin or Data Entry
- **Scope:** Admin sees all non-facility providers. Data-entry users see only providers where `createdBy` is their own user ID.
- **Query:** `serviceType=<SERVICE_TYPE_ID>`, `status=draft|active|inactive`, `q=<search text>`, `page` (default `1`), `limit` (default `20`, maximum `100`), and the normal language options.
- **Response:** `{ "page": 1, "limit": 20, "total": 1, "results": 1, "providers": [{ "id": "...", "serviceType": { "id": "...", "name": "Laboratory", "slug": "lab", "schemaVersion": 2, "isActive": false }, "status": "draft", "data": { "licenseNumber": "LIC-12345" } }] }`

### `GET /service-providers/:id`

- **Description:** Administrative provider detail, including the complete provider data and full localized service-type definition needed to render the dynamic edit form.
- **Auth:** Admin or Data Entry
- **Scope:** Admin can read any non-facility provider; data-entry users can read only their own provider records.
- **Response:** `{ "provider": { "id": "...", "data": { ... }, "status": "inactive" }, "serviceType": { "_id": "...", "fields": [ ... ] } }`

### `PUT /service-providers/:id`

- **Description:** Update provider data/status. Admins may set `active|inactive|draft`; data-entry remains `draft` and may update only records they created. Existing providers under inactive service types remain editable, but cannot be activated until the type is active.
- **Auth:** Admin or Data Entry
- **Body example:** `{ "name": "City Labs", "city": "Cairo", "data": { "name": { "en": "City Labs" }, "tests": ["CBC"] }, "status": "inactive" }`
- **Response:** `{ "provider": { "_id": "...", "status": "inactive", "schemaVersionAtWrite": 2, "data": { ... } } }`

### `PATCH /service-providers/:id/status`

- **Description:** Admin-only status transition. Allowed: `draft->active|inactive`, `active->inactive`, `inactive->active`. Activations re-validate against current schema and refresh `schemaVersionAtWrite`.
- **Auth:** Admin
- **Body example:** `{ "status": "active" }`
- **Response:** `{ "provider": { "_id": "...", "status": "active", "schemaVersionAtWrite": 2 } }`

### `GET /services/types` (public)

- **Description:** List active service types for discovery.
- **Auth:** None
- **Notes:** `name`/`description`/field `label` are localized strings based on `x-lang`. Use `?includeAllLangs=true` to return `{ en, ar }`.
- **Field metadata:** Public clients can use each field’s `isFilterable`, `isSearchable`, `isSortable`, `filterKind`, `format`, and `uiHint` metadata to build dynamic filter/sort/rendering UI. `object` fields can define nested `fields`; `array` fields can define `itemType` and `itemFields`. `geo_point` fields expose stored coordinates in `data` and enable geo search through `/services?lat=&lng=&radiusKm=`.
- **Response example:** `{ "serviceTypes": [ { "_id": "...", "name": "Laboratory", "slug": "lab", "schemaVersion": 2 } ] }`

### `GET /services`

- **Description:** List active providers (public fields only). Supports top-level search/filter/sort, optional dynamic type-driven filters, and optional geo search using provider geo points. Supports cursor pagination on the default sort when geo search is not used.
- **Auth:** None
- **Notes:** Public string fields are localized based on `x-lang`. Use `?includeAllLangs=true` to return `{ en, ar }` objects. Use `?includeSchema=true` to embed the matching service-type schema for the current response.
- **Query examples:**
  - First page: `/services?type=lab&limit=20`
  - Next page: `/services?type=lab&limit=20&cursor=<nextCursorFromPrevResponse>`
  - Nearby hospitals: `/services?type=hospital-directory&lat=33.5138&lng=36.2765&radiusKm=25`
- **Query params:**
  - Top-level: `type`, `search`, `name`, `city`, `country`, `page`, `limit`, `cursor`, `includeSchema`
  - Geo search: `lat`, `lng`, `radiusKm`
  - Sorting: `sortBy`, `sortOrder=asc|desc`
  - Dynamic filters: `filters=<json-object>` where keys must be public service-type fields with `isFilterable=true`
- **Dynamic filter example:** `/services?type=lab&filters={"homeVisit":true,"price":{"min":10,"max":50}}`
- **Geo search notes:** When `lat` and `lng` are provided, only providers with stored geo points inside the requested radius are returned. Results are sorted nearest-first and include `distanceMeters`. Cursor pagination is not supported in this mode.
- **Cursor response example:**

```json
{
  "limit": 20,
  "items": [
    {
      "id": "657...",
      "serviceType": { "id": "abc...", "slug": "lab", "name": "Laboratory" },
      "name": "City Labs",
      "city": "Cairo",
      "country": "Egypt",
      "aliases": ["CL"],
      "data": { "name": "City Labs", "homeCollection": true, "city": "Cairo" },
      "status": "active",
      "createdAt": "2024-02-01T10:00:00.000Z"
    }
  ],
  "nextCursor": "eyJjcmVhdGVkQXQiOiIyMDI0LTAyLTAxVDEwOjAwOjAwLjAwMFoiLCJfaWQiOiI2NTd..."
}
```

**Schema response behavior**

- `GET /services?type=<slug>&includeSchema=true` adds top-level `serviceType`.
- `GET /services?includeSchema=true` adds top-level `serviceTypes` keyed by `provider.serviceType.slug`.
- Cursor-mode responses keep `items`/`nextCursor` and may still include `serviceType` or `serviceTypes` at the top level.

### `GET /services/:id`

- **Description:** Fetch one active provider by id (public fields only).
- **Auth:** None
- **Notes:** Public string fields are localized based on `x-lang`. Use `?includeSchema=true` to add top-level `serviceType`.
- **Response example:** `{ "serviceType": { "slug": "lab", "schemaVersion": 2, "fields": [ ... ] }, "provider": { "id": "...", "serviceType": { "slug": "lab" }, "name": "City Labs", "city": "Cairo", "country": "Egypt", "aliases": ["CL"], "data": { "name": "City Labs", "homeCollection": true } } }`

### `PATCH /services/:id/favorite`

- **Description:** Toggle saved-service state for the authenticated patient.
- **Auth:** Patient
- **Body:** `{ "isFavorite": true|false }`
- **Response:** `{ "messageKey": "success.serviceFavorites.updated", "providerId": "...", "isFavorite": true }`

### `GET /patient/saved-services`

- **Description:** List the authenticated patient’s saved services with the same top-level filters and dynamic `filters=<json>` support as `/services`.
- **Auth:** Patient
- **Query params:** `type`, `search`, `name`, `city`, `country`, `filters`, `sortBy`, `sortOrder`, `page`, `limit`, `includeSchema`
- **Notes:** Default ordering is most recently favorited first when no explicit sort is provided.
- **Response example:** `{ "messageKey": "success.serviceFavorites.listed", "page": 1, "limit": 20, "total": 1, "results": 1, "favorites": [ { "id": "...", "createdAt": "...", "provider": { "id": "...", "isFavorited": true, "isAvailable": true } } ] }`

### `POST /service-providers`

- **Description:** Create a service provider instance using a service type’s dynamic schema.
- **Auth:** Admin or Data Entry (data-entry users are forced to `draft` status)
- **Notes:** For string fields, `data` accepts a string or `{ "en": "...", "ar": "..." }`.
- **Body:**

```json
{
  "serviceType": "<SERVICE_TYPE_ID>",
  "status": "draft",
  "data": {
    "name": { "en": "City Labs", "ar": "مختبر المدينة" },
    "licenseNumber": "LIC-12345",
    "homeCollection": true
  }
}
```

- **Response:** `{ "provider": { "_id": "...", "status": "draft", "data": { ... } } }`

### `PUT /service-providers/:id`

- **Description:** Update provider data/status (admin can set `active|inactive|draft`; data-entry saves as `draft`).
- **Auth:** Admin or Data Entry
- **Body:** `{ "data": { "name": { "en": "City Labs" } }, "status": "active" }`
- **Response:** `{ "provider": { "_id": "...", "status": "active", "schemaVersionAtWrite": 2, "data": { ... } } }`

### `PATCH /service-providers/:id/status`

- **Description:** Admin-only status transition. Allowed: `draft->active|inactive`, `active->inactive`, `inactive->active`. Activations re-validate against the current schema and refresh `schemaVersionAtWrite`.
- **Auth:** Admin
- **Body:** `{ "status": "active" }`
- **Response:** `{ "provider": { "_id": "...", "status": "active" } }`

Validation rules:

- Unknown fields rejected; types enforced (`string|number|boolean|array|object|geo_point`)
- Required, enum, min/max, regex honored per service type field definition
- `object` fields can validate nested `fields`; `array` fields can validate `itemType` and nested `itemFields`
- Old flat schemas remain valid: if `fields`/`itemType`/`itemFields` are omitted, objects and arrays remain generic containers
- `format` and `uiHint` are response metadata only; they do not change persistence shape
- `geo_point` values must be objects shaped like `{ "lat": 33.5, "lng": 36.3 }`
- Only one `geo_point` field is allowed per service type, and it cannot be filterable/searchable/sortable
- Data-entry users cannot set `active`; they are restricted to `draft`.

---

## Facilities Module (Standalone)

Facilities are now managed by a dedicated module and stored in the `Facility` collection (not as generic service providers).

### Canonical Data Model

- `doctor.facilityId` is the canonical doctor relation.
- `doctor.facilityProviderId` is transitional compatibility only.
- Facility core fields:
  - `name`
  - `normalizedName`
  - `facilityType`
  - `city`
  - `country`
  - `address`
  - `phone`
  - `description`
  - `status` (`ACTIVE | PENDING | INACTIVE | DELETED`)
  - `attributes: [String]`
  - `ownerDoctorId`
  - `createdBy`, `updatedBy`, `approvedBy`, `approvedAt`
- `facilityType` is stored as a canonical machine key (not localized text). Supported keys:
  - `hospital`
  - `clinic`
  - `polyclinic`
  - `medical_center`
  - `laboratory`
  - `imaging_center`
  - `pharmacy`
  - `rehabilitation_center`
  - `dialysis_center`
  - `emergency_center`
  - `other`
- Display localization should use i18n keys: `facilities.types.<facilityTypeKey>` (available in English and Arabic).

### Public Helper Endpoint

#### `GET /facilities/types`

- **Description:** List supported canonical facility type keys with frontend-ready i18n metadata.
- **Auth:** None
- **Localization:** `label` is localized based on `x-lang`; `translationKey` stays stable.
- **Response:** `200` with:

```json
{
  "messageKey": "success.ok",
  "types": [
    {
      "key": "hospital",
      "translationKey": "facilities.types.hospital",
      "label": "Hospital"
    },
    {
      "key": "clinic",
      "translationKey": "facilities.types.clinic",
      "label": "Clinic"
    }
  ]
}
```

### Attributes Rules

- Stored as array of string keys only.
- Keys are normalized to lowercase snake_case.
- Keys are trimmed, deduplicated, and invalid keys are rejected.
- Examples:
  - `"Night Shift"` -> `"night_shift"`
  - `"Echo Available"` -> `"echo_available"`

### Ownership Rules

- `ownerDoctorId` defines the doctor owner of a facility.
- Doctor can only update/manage their own facility.
- Admin can manage all facilities.
- Doctor create flow currently enforces one owned facility per doctor.

### Admin Endpoints

#### `POST /admin/facilities`

- **Description:** Create facility (admin full create).
- **Auth:** Admin
- **Request body example:**

```json
{
  "name": "City Clinic",
  "facilityType": "clinic",
  "city": "Damascus",
  "country": "SY",
  "address": "Main street",
  "phone": "+963900000000",
  "description": "General clinic",
  "status": "ACTIVE",
  "attributes": ["Night Shift", "Echo Available"],
  "ownerDoctorId": "507f1f77bcf86cd799439011"
}
```

- **Response:** `201` with `messageKey: "facilities.admin.created"` and `facility`.

#### `GET /admin/facilities`

- **Description:** List facilities with pagination/filtering.
- **Auth:** Admin
- **Query:** `page`, `limit`, `q`, `name`, `city`, `facilityType|kind`, `status`, `ownerDoctorId`, `attribute`, `hasDoctors`, `sortBy`, `sortOrder`
- **Sort fields:** `createdAt`, `updatedAt`, `name`, `city`, `status`, `facilityType`, `doctorCount`
- **Sort order:** `asc | desc`
- **Response:** `200` with `messageKey: "facilities.admin.listed"` and:

```json
{
  "page": 1,
  "limit": 20,
  "total": 1,
  "results": 1,
  "facilities": [
    {
      "id": "65f0c4f6e6a0d0d0d0d0d901",
      "name": "City Clinic",
      "facilityType": "clinic",
      "city": "Damascus",
      "status": "ACTIVE",
      "attributes": ["night_shift", "echo_available"],
      "ownerDoctorId": "65f0c4f6e6a0d0d0d0d0d121",
      "doctorCount": 7
    }
  ]
}
```

- **Notes:** List response includes `doctorCount` only. It does not embed full doctor arrays per facility.

#### `GET /admin/facilities/:id`

- **Description:** Get facility by id with helpful metadata.
- **Auth:** Admin
- **Response:** `200` with `messageKey: "facilities.admin.details"` and `facility` including:
  - `doctorCount`
  - `owner` (owner doctor summary when available)

#### `GET /admin/facilities/:id/doctors`

- **Description:** List doctors assigned to a facility (`doctor.facilityId == :id`) with pagination/filtering.
- **Auth:** Admin
- **Query:** `q`, `name`, `specialty`, `status`, `page`, `limit`, `sortBy`, `sortOrder`
- **Doctor status filter:** `pending | approved | rejected` (maps to doctor approval status)
- **Sort fields:** `createdAt`, `updatedAt`, `name`, `specialty`, `status`
- **Response:** `200` with:

```json
{
  "messageKey": "success.ok",
  "facility": {
    "id": "65f0c4f6e6a0d0d0d0d0d901",
    "name": "City Clinic",
    "facilityType": "clinic",
    "city": "Damascus",
    "status": "ACTIVE",
    "doctorCount": 7
  },
  "page": 1,
  "limit": 20,
  "total": 2,
  "results": 2,
  "doctors": [
    {
      "id": "65f0c4f6e6a0d0d0d0d0d121",
      "specialization": "Cardiology",
      "approvalStatus": "approved",
      "isApproved": true,
      "facilityId": "65f0c4f6e6a0d0d0d0d0d901",
      "user": {
        "id": "65f0c4f6e6a0d0d0d0d0d141",
        "fullName": "Dr John Doe",
        "email": "john@example.com",
        "phone": "+201234567890",
        "photoUrl": "/uploads/users/john.jpg"
      }
    }
  ]
}
```

#### `PUT /admin/facilities/:id`

- **Description:** Update facility details (including attributes/owner).
- **Auth:** Admin
- **Response:** `200` with `messageKey: "facilities.admin.updated"` and `facility`.

#### `PATCH /admin/facilities/:id/status`

- **Description:** Change facility status.
- **Auth:** Admin
- **Body:** `{ "status": "ACTIVE|PENDING|INACTIVE|DELETED" }`
- **Response:** `200` with `messageKey: "facilities.admin.status_updated"` and `facility`.

#### `DELETE /admin/facilities/:id`

- **Description:** Soft-delete facility (`status=DELETED`) and clear doctor assignments pointing to it.
- **Auth:** Admin
- **Response:** `200` with `messageKey: "facilities.admin.deleted"` and `facility`.

### Doctor Endpoints

#### `POST /doctors/me/facility`

- **Description:** Doctor creates own facility; new facility is assigned to doctor by default.
- **Auth:** Doctor
- **Response:** `201` with `messageKey: "facilities.doctor.created"` and `facility`.

#### `GET /doctors/me/facility`

- **Description:** Get doctor-owned facility.
- **Auth:** Doctor
- **Response:** `200` with `messageKey: "facilities.doctor.loaded"` and `facility`.

#### `PUT /doctors/me/facility`

- **Description:** Update doctor-owned facility.
- **Auth:** Doctor
- **Response:** `200` with `messageKey: "facilities.doctor.updated"` and `facility`.

#### `PATCH /doctors/me/facility/attributes`

- **Description:** Replace attributes array for doctor-owned facility.
- **Auth:** Doctor
- **Body example:**

```json
{
  "attributes": ["night_shift", "echo_available"]
}
```

- **Response:** `200` with `messageKey: "facilities.doctor.attributes_updated"` and `facility`.

#### `PATCH /doctors/me/facility`

- **Description:** Assign/change/clear doctor facility relation.
- **Auth:** Doctor
- **Canonical body:** `{ "facilityId": "<FacilityObjectId|null>" }`
- **Transitional compatibility body:** `{ "facilityProviderId": "<LegacyProviderObjectId|null>" }`
- **Response:** `200` with `messageKey: "doctor.facility.updated"`, plus `doctor` and `facility`.

### Legacy Compatibility Endpoints (Still Supported)

#### `GET /facilities/suggest`

- **Auth:** Doctor
- **Description:** Suggest facilities for selection.
- **Response:** `200` with `messageKey: "facilities.suggest.ok"` and `facilities`.

#### `POST /facilities/requests`

- **Auth:** Doctor
- **Description:** Legacy request-style create flow (currently creates doctor-owned facility with pending status).
- **Response:** `201` with `messageKey: "facilities.request.created"`.
- **Duplicate handling:** `409` with `messageKey: "facilities.request.duplicate_found"` and additive `matches`.

#### `PATCH /admin/facilities/:id`

- **Auth:** Admin
- **Description:** Legacy action endpoint using body `{ "action": "approve|merge", "mergeToId": "..." }`.
- **Responses:**
  - `facilities.admin.approved`
  - `facilities.admin.merged`

### Facilities Error Keys (Common)

- `errors.facilities.notFound`
- `errors.facilities.invalidSelection`
- `errors.facilities.invalidAttributeKey`
- `errors.facilities.ownerOnly`
- `errors.facilities.ownerFacilityExists`
- `errors.facilities.mergeTargetInvalid`
- `errors.facilities.actionNotAllowed`

### Endpoint Execution Flows (Detailed)

#### Flow: `GET /facilities/types`

1. Request reaches public facility route (no auth required).
2. Controller calls `listFacilityTypes` service.
3. Service returns canonical keys from `FACILITY_TYPES` with `translationKey` values (`facilities.types.<key>`).
4. Controller resolves `label` per item using request language (`x-lang`).
5. Response: `200`, `messageKey=success.ok`, `types[]` (`key`, `translationKey`, `label`).

#### Flow: `GET /facilities/suggest`

1. `isAuth` verifies token, `roleCheck('doctor')` enforces doctor role.
2. `loadUserModelsGuard` loads `req.doctor` from authenticated `userId`.
3. `suggestFacilitiesValidator` validates query shape (`q`, `city`, `kind|facilityType`, `limit`).
4. Controller (`suggestFacilityOptions`) forwards query args to service.
5. Service (`suggestFacilities`) normalizes text, type, and limit.
6. Service queries `Facility` collection only (`isDeleted != true`, `status in ACTIVE|PENDING`) using regex + text search.
7. Candidates are ranked (`exact > startsWith > contains > textScore`, with city/active boosts).
8. Response: `200`, `messageKey=facilities.suggest.ok`, `results`, `facilities`.

#### Flow: `POST /facilities/requests`

1. Doctor auth + doctor profile load.
2. Validator requires `name` and `city`; optional `kind|facilityType`.
3. Controller (`createFacilityRequestForDoctor`) calls service (`createFacilityRequest`).
4. Service resolves doctor from `actorUserId`.
5. Business rule check: one owned facility per doctor (`errors.facilities.ownerFacilityExists` on conflict).
6. Duplicate detection runs on normalized name/city similarity.
7. If duplicates are strong: throw `409 facilities.request.duplicate_found` with additive `matches`.
8. If accepted: create `Facility` with `status=PENDING`, `ownerDoctorId=doctor._id`, normalized fields/attributes.
9. Doctor is assigned by default: `doctor.facilityId = newFacility._id`.
10. Audit log event is written (`FACILITY_REQUEST_CREATED`); admin notification is attempted.
11. Response: `201`, `messageKey=facilities.request.created`, `facility`, `doctor`.

#### Flow: `POST /admin/facilities`

1. Admin auth + validation for fixed fields, owner id, status enum, attributes.
2. Controller calls `adminCreateFacility`.
3. Service normalizes payload (`name`, `facilityType`, `attributes`, etc.) and validates optional `ownerDoctorId`.
4. Duplicate detection runs before create.
5. Facility document is inserted into `Facility` collection.
6. If owner doctor provided, doctor assignment is updated to this facility.
7. Audit event `FACILITY_ADMIN_CREATED`.
8. Response: `201`, `messageKey=facilities.admin.created`, `facility`.

#### Flow: `GET /admin/facilities`

1. Admin auth + query validation (`q`, `name`, `city`, `facilityType|kind`, `status`, `ownerDoctorId`, `attribute`, `hasDoctors`, pagination, sorting).
2. Controller calls `adminListFacilities`.
3. Service builds facility query and normalizes sort/pagination.
4. Service computes `doctorCount` per facility:
   - optimized page-path uses grouped doctor count only for returned page,
   - aggregate path is used when filtering by `hasDoctors` or sorting by `doctorCount`.
5. Response: `200`, `messageKey=facilities.admin.listed`, pagination fields + `facilities` (with `doctorCount` only, no embedded doctor arrays).

#### Flow: `GET /admin/facilities/:id`

1. Admin auth + MongoId param validation.
2. Service loads by id with `includeDeleted=true`.
3. Service enriches facility with `doctorCount` and owner doctor summary when available.
4. Response: `200`, `messageKey=facilities.admin.details`, `facility`.

#### Flow: `GET /admin/facilities/:id/doctors`

1. Admin auth + id/query validation (`q`, `name`, `specialty`, `status`, pagination, sorting).
2. Service loads the facility and builds a doctor query scoped to `doctor.facilityId`.
3. Service joins doctor user profile for name/email/phone filtering and sortable name output.
4. Filtered doctor list is paginated and returned with `facility` metadata.
5. Response: `200`, `messageKey=success.ok`, `facility`, `doctors`, `page`, `limit`, `total`, `results`.

#### Flow: `PUT /admin/facilities/:id`

1. Admin auth + update payload validation.
2. Service loads target facility (`includeDeleted=true`) and keeps `before` snapshot for audit.
3. Only provided fields are updated; `facilityType` and attributes are normalized.
4. Optional owner doctor reassignment updates doctor `facilityId`.
5. `updatedBy` is set, document saved.
6. Audit event `FACILITY_ADMIN_UPDATED`.
7. Response: `200`, `messageKey=facilities.admin.updated`, `facility`.

#### Flow: `PATCH /admin/facilities/:id/status`

1. Admin auth + `status` enum validation.
2. Service loads facility (`includeDeleted=true`).
3. Service updates status and soft-delete flags.
4. If status is `ACTIVE`, approval metadata (`approvedBy`, `approvedAt`) is set.
5. If status is `DELETED`, all doctors assigned to this facility are unassigned.
6. Audit event `FACILITY_ADMIN_STATUS_CHANGED`.
7. Response: `200`, `messageKey=facilities.admin.status_updated`, `facility`.

#### Flow: `DELETE /admin/facilities/:id`

1. Admin auth + id validation.
2. Service soft-deletes facility (`status=DELETED`, `isDeleted=true`, `deletedAt=now`).
3. Assigned doctors are unassigned (`facilityId -> null`).
4. Audit event `FACILITY_ADMIN_DELETED`.
5. Response: `200`, `messageKey=facilities.admin.deleted`, `facility`.

#### Flow: `POST /doctors/me/facility`

1. Doctor auth + doctor profile load.
2. Validator checks create payload.
3. Service (`createDoctorOwnedFacility`) enforces one-owned-facility rule.
4. Duplicate detection runs.
5. Facility created with `ownerDoctorId=doctor._id`, `status=ACTIVE`, normalized attributes.
6. Doctor is assigned by default (`facilityId` set).
7. Audit event `DOCTOR_FACILITY_CREATED`.
8. Response: `201`, `messageKey=facilities.doctor.created`, `facility`, `doctor`.

#### Flow: `GET /doctors/me/facility`

1. Doctor auth + doctor profile load.
2. Service fetches facility by `ownerDoctorId` (not by assignment).
3. If no owned facility: `404 errors.facilities.notFound`.
4. Response: `200`, `messageKey=facilities.doctor.loaded`, `facility`.

#### Flow: `PUT /doctors/me/facility`

1. Doctor auth + payload validation.
2. Service fetches only owned facility (`ownerDoctorId=req.doctor._id`).
3. Service updates allowed fields and normalizes attributes/type.
4. If doctor has no `facilityId`, service backfills assignment to this owned facility.
5. Audit event `DOCTOR_FACILITY_UPDATED`.
6. Response: `200`, `messageKey=facilities.doctor.updated`, `facility`.

#### Flow: `PATCH /doctors/me/facility/attributes`

1. Doctor auth + required `attributes` array validation.
2. Service fetches owned facility only.
3. Attributes are replaced after normalization/dedup.
4. Audit event `DOCTOR_FACILITY_ATTRIBUTES_UPDATED`.
5. Response: `200`, `messageKey=facilities.doctor.attributes_updated`, `facility`.

#### Flow: `PATCH /doctors/me/facility` (assign/change/clear)

1. Doctor auth + validator requires at least one key among `facilityId` or legacy `facilityProviderId`.
2. Service resolves target facility:
   - prefer canonical `facilityId`,
   - fallback by `legacyProviderId` mapping for `facilityProviderId`.
3. Assignability check:
   - `ACTIVE` facilities are assignable,
   - non-active facilities are assignable only for their owner doctor,
   - deleted facilities are rejected.
4. If assigning: set `doctor.facilityId` canonical field.
5. If clearing (null payload): unset both `facilityId` and legacy `facilityProviderId`.
6. Audit event `DOCTOR_FACILITY_ASSIGNED`.
7. Response: `200`, `messageKey=doctor.facility.updated`, `doctor`, `facility|null`.

#### Flow: `PATCH /admin/facilities/:id` (legacy action endpoint)

1. Admin auth + `action=approve|merge` validation.
2. If `approve`:
   - sets status `ACTIVE` + approval metadata,
   - writes audit event `FACILITY_APPROVED`,
   - responds with `facilities.admin.approved`.
3. If `merge`:
   - validates target facility id and prevents self-merge,
   - transactionally reassigns doctors from source to target,
   - marks source as `INACTIVE`,
   - writes audit event `FACILITY_MERGED`,
   - responds with `facilities.admin.merged` + `updatedDoctors`.

### Startup Migration Flow (Compatibility)

1. On server start, `ensureFacilityServiceType()` runs.
2. Current implementation maps legacy provider-based facilities into `Facility` records via `legacyProviderId`.
3. Doctors with legacy `facilityProviderId` and missing canonical `facilityId` are backfilled.
4. This keeps old data operational while `facilityId` remains canonical going forward.

---

## Patient/Public Services

### `GET /services/types` (public)

- **Description:** List active service types (no auth).
- **Notes:** `name`/`description`/nested field labels are localized strings based on `x-lang`. Use `?includeAllLangs=true` to return `{ en, ar }`.
- **Response:** `{ "serviceTypes": [ { "_id": "...", "name": "Laboratory", "slug": "lab", "fields": [ ... ] } ] }`

### `GET /services`

- **Description:** List active service providers; returns only fields marked `isPublic=true`.
- **Auth:** None
- **Query params:** `type=<service-type-slug>` (optional), `search`, `name`, `city`, `country`, `filters=<json-object>`, `sortBy`, `sortOrder`, `lat`, `lng`, `radiusKm`, `includeSchema`, `limit`, `page` (legacy), `cursor` (preferred; base64 of `{createdAt,_id}` on the default sort only when geo search is not used)
- **Cursor response:** `{ "limit": 20, "items": [ ... ], "nextCursor": "<base64 or null>" }`
- **Page response (legacy):** `{ "page": 1, "limit": 20, "total": 3, "services": [ { "id": "...", "serviceType": { "slug": "lab" }, "name": "City Labs", "city": "Cairo", "country": "Egypt", "aliases": ["CL"], "data": { "name": "City Labs", "homeCollection": true } } ] }`
- **Notes:** Public string fields are localized based on `x-lang`. Use `?includeAllLangs=true` to return `{ en, ar }`. Use `?includeSchema=true` to add either `serviceType` or `serviceTypes` schema metadata. When `lat` and `lng` are supplied, geo-enabled providers inside the radius are returned nearest-first with `distanceMeters`.

### `GET /services/:id`

- **Description:** Fetch one active provider by id with public fields only.
- **Auth:** None
- **Notes:** Public string fields are localized based on `x-lang`. Use `?includeSchema=true` to include the full service-type schema.
- **Response:** `{ "serviceType": { "slug": "lab", "fields": [ ... ] }, "provider": { "id": "...", "serviceType": { "slug": "lab" }, "name": "City Labs", "city": "Cairo", "country": "Egypt", "aliases": ["CL"], "data": { ...public fields... } } }`

### `PATCH /services/:id/favorite`

- **Description:** Toggle saved-service state for the authenticated patient.
- **Auth:** Patient
- **Body:** `{ "isFavorite": true|false }`
- **Response:** `{ "messageKey": "success.serviceFavorites.updated", "providerId": "...", "isFavorite": true }`

### `GET /patient/saved-services`

- **Description:** List the authenticated patient’s saved services.
- **Auth:** Patient
- **Query params:** `type`, `search`, `name`, `city`, `country`, `filters`, `sortBy`, `sortOrder`, `page`, `limit`, `includeSchema`
- **Response:** `{ "messageKey": "success.serviceFavorites.listed", "page": 1, "limit": 20, "total": 1, "results": 1, "favorites": [ ... ] }`

---

## Content Library & News

### Overview

- Types: `CONDITION`, `SYMPTOM`, `MEDICATION`, `GENERAL_ADVICE`, `NEWS`, `SETTINGS_PAGE`.
- Workflow: `DRAFT` -> `IN_REVIEW` -> `PUBLISHED` -> `ARCHIVED`.
- Seek-help enforcement: `CONDITION` and `SYMPTOM` must include a `callout` block with `variant="danger"` or `"warn"` and a title containing "seek help" (or "متى تراجع الطبيب").
- Templates: optional via `templateId` + `data` (supported for `CONDITION`, `SYMPTOM`, `MEDICATION`, and `GENERAL_ADVICE`).
- App reads return only `PUBLISHED` items.
- Editors (admin, data_entry) create/update drafts and submit for review; admin approves/publishes.
- Admin-only revisions: editing published content keeps it `PUBLISHED` and stores the prior version in `revisions`.
- `CONDITION`, `SYMPTOM`, `MEDICATION`, and `GENERAL_ADVICE` must include `sources` and `disclaimerVersion` before review/publish.
- `SETTINGS_PAGE` is for legal/help/settings content and does not require seek-help blocks, sources, disclaimers, or news payloads; it should carry a stable `pageVersion` before review/publish.
- Data-entry users must be active to log in (enforced in auth).
- Data-entry can create/update their own drafts, submit for review, and view their own `DRAFT`/`IN_REVIEW` items via `/admin/content/mine`. They cannot approve, publish, archive, or edit templates.

### Content blocks (`contentBlocks`)

Each block requires a `type` plus fields:

- `heading`: `{ "type": "heading", "level": 1-6, "text": "..." }`
- `paragraph`: `{ "type": "paragraph", "text": "..." }`
- `list`: `{ "type": "list", "items": ["..."], "ordered": false }`
- `callout`: `{ "type": "callout", "variant": "info|warn|danger", "title": "...", "text": "..." }`
- `linkCard`: `{ "type": "linkCard", "title": "...", "url": "...", "description": "..." }`
- `faq`: `{ "type": "faq", "items": [{ "question": "...", "answer": "..." }] }`
- `divider`: `{ "type": "divider" }`

### App content (authenticated)

These endpoints require auth and allow roles: `admin`, `doctor`, `patient`, `secretary`. These are app-only endpoints (not anonymous public access).
Search uses a text index on `title` + `summary` when the query length is 3+ characters and falls back to partial regex matches for shorter terms (or when text search returns no hits).

#### `GET /content`

List published items.

- Query: `type`, `language`, `az` or `startsWith`, `tags`, `search`, `page`, `limit`, `cursor` (cursor disabled when `az`/`startsWith` is used; tags can be a comma-separated string)
- Cursor response: `{ "items": [...], "limit": 20, "nextCursor": "..." }`
- `MEDICATION` is now a first-class medical-library content type for patient-facing medication guides/articles.
- `az` / `startsWith` are especially relevant for `CONDITION`, `SYMPTOM`, and `MEDICATION` because those types store an indexed `aZKey`.
- `type` now also accepts `SETTINGS_PAGE`.
- `SETTINGS_PAGE` is intended for settings/legal/help content such as `terms`, `privacy-policy`, `medical-policy`, `data-sharing-consent`, `faq`, `about-app`, and `contact-us`.
- This app-facing route only returns `PUBLISHED` content items. Draft, in-review, archived, or otherwise unpublished entries are not exposed here.
- Public list items now include `pageVersion` when the published item has one.
- Every `SETTINGS_PAGE` list item includes the navigation fields the frontend needs:
  - `title`
  - `slug`

Example response item for a settings page:

```json
{
  "id": "65f0c4f6e6a0d0d0d0d0d701",
  "type": "SETTINGS_PAGE",
  "title": "Privacy Policy",
  "slug": "privacy-policy",
  "language": "en",
  "summary": "How LMJ Health handles personal data.",
  "coverImage": null,
  "tags": ["legal"],
  "categories": ["settings"],
  "aZKey": null,
  "pageVersion": "2026-04",
  "publishedAt": "2026-04-07T10:00:00.000Z"
}
```

Example:

```bash
curl -X GET "http://localhost:5000/api/content?type=CONDITION&language=en&az=A&page=1&limit=20" \
  -H "x-lang: en" \
  -H "Authorization: Bearer <token>"
```

Frontend discovery for CMS-managed settings/help/legal pages should use this same list route with `type=SETTINGS_PAGE`.
It returns only published items, and the frontend should use each returned `slug` to open the page through `GET /api/content/:slug`.

Recommended frontend flow:

1. Request `GET /api/content?type=SETTINGS_PAGE&language=en&page=1&limit=20`
2. Read `title` and `slug` from each returned list item
3. Open the selected page with `GET /api/content/:slug?language=en`

Pagination notes:

- `GET /api/content` is paginated. The response includes `page`, `limit`, `total`, and `results`.
- The API does not guarantee that all settings pages always arrive in a single response.
- For the current small legal/settings/help set, the client can request a limit large enough for its navigation UI, such as `limit=20`, but pagination still remains part of the contract.

Validation notes:

- `language` follows the same enum used by the other app-facing content routes.
- Invalid `language` values return the route family's normal handled validation response with HTTP `422`.

Example discovery request:

```bash
curl -X GET "http://localhost:5000/api/content?type=SETTINGS_PAGE&language=en&page=1&limit=20" \
  -H "x-lang: en" \
  -H "Authorization: Bearer <token>"
```

Example paginated response excerpt for frontend navigation:

```json
{
  "messageKey": "success.ok",
  "page": 1,
  "limit": 20,
  "total": 2,
  "results": 2,
  "items": [
    {
      "title": "Terms of Use",
      "slug": "terms"
    },
    {
      "title": "Privacy Policy",
      "slug": "privacy-policy"
    }
  ]
}
```

#### `GET /content/search`

Search published items (text index on `title` + `summary`, regex fallback for partials).

- Query: `q` (required), `type`, `language`, `page`, `limit`
- `type` also accepts `MEDICATION`.
- `type` also accepts `SETTINGS_PAGE`.
- Search results use the same public list-item shape as `GET /content`, including `pageVersion` for settings pages.

Example:

```bash
curl -X GET "http://localhost:5000/api/content/search?q=asthma&type=CONDITION&language=en" \
  -H "x-lang: en" \
  -H "Authorization: Bearer <token>"
```

#### `GET /content/:slug`

Fetch one published item by slug.

- Published `SETTINGS_PAGE` items are returned through this same route.
- Public content responses now include `pageVersion` when present, which is the stable version captured by consent flows.
- Frontend usage: take a `slug` returned by `GET /api/content?type=SETTINGS_PAGE&language=en` and pass it into this route, for example `GET /api/content/data-sharing-consent?language=en`.

Example settings-page response:

```json
{
  "contentItem": {
    "id": "65f0c4f6e6a0d0d0d0d0d701",
    "type": "SETTINGS_PAGE",
    "title": "Data Sharing Consent",
    "slug": "data-sharing-consent",
    "language": "en",
    "summary": "Consent terms for sharing medical data.",
    "coverImage": null,
    "contentBlocks": [
      { "type": "heading", "level": 2, "text": "Consent" },
      { "type": "paragraph", "text": "By accepting, you agree to..." }
    ],
    "tags": ["legal"],
    "categories": ["settings"],
    "sources": [],
    "disclaimerVersion": null,
    "pageVersion": "2026-04",
    "riskFlags": [],
    "requiresSeekHelpBlock": false,
    "lastReviewedAt": "2026-04-07T09:30:00.000Z",
    "nextReviewDueAt": null,
    "publishedAt": "2026-04-07T10:00:00.000Z",
    "template": null
  }
}
```

Example:

```bash
curl -X GET "http://localhost:5000/api/content/asthma?language=en" \
  -H "x-lang: en" \
  -H "Authorization: Bearer <token>"
```

#### `GET /medical-library/tests`

List published/visible medical-library lab tests from the admin-managed lab catalog without duplicating data into `content`.

- Roles: `admin`, `doctor`, `patient`, `secretary`
- Query: `search|q`, `category`, `priorityLevel`, `az|startsWith`, `page`, `limit`, `sort`
- Returns only `isActive=true` and `isVisible=true` lab catalog items.
- This is the recommended source for the frontend "Tests" section instead of creating duplicate `content` rows.

Example:

```bash
curl -X GET "http://localhost:5000/api/medical-library/tests?category=HEMATOLOGY&startsWith=C&page=1&limit=20&sort=nameEn" \
  -H "x-lang: en" \
  -H "Authorization: Bearer <token>"
```

#### `GET /medical-library/tests/:id`

Fetch one published/visible medical-library lab test by id.

- Roles: `admin`, `doctor`, `patient`, `secretary`
- Returns `404` when the item is inactive, hidden, or missing.

### Admin/editor content

#### `POST /admin/content`

Create a draft content item.

- Roles: `admin`, `data_entry`
- `type` now supports `MEDICATION`.
- `type` now supports `SETTINGS_PAGE`.
- For `SETTINGS_PAGE`, the backend does not require seek-help blocks, sources, disclaimers, or news payloads, but it does require `pageVersion` before review/publish.
- Request body now accepts optional `pageVersion: string`.
- Success response remains `{ "contentItem": { ... } }`, and admin/data-entry reads now surface `pageVersion` on the returned document.

Example (condition with seek-help callout):

```bash
curl -X POST "http://localhost:5000/api/admin/content" \
  -H "x-lang: en" \
  -H "Authorization: Bearer <adminToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "CONDITION",
    "title": "Asthma",
    "language": "en",
    "summary": "Chronic inflammation of the airways.",
    "contentBlocks": [
      { "type": "heading", "level": 2, "text": "Overview" },
      { "type": "paragraph", "text": "Asthma affects the airways..." },
      {
        "type": "callout",
        "variant": "danger",
        "title": "Seek help",
        "text": "If you have severe shortness of breath, seek care immediately."
      }
    ],
    "sources": [
      { "title": "WHO Asthma", "url": "https://www.who.int" }
    ]
  }'
```

Example (`SETTINGS_PAGE` draft):

```bash
curl -X POST "http://localhost:5000/api/admin/content" \
  -H "x-lang: en" \
  -H "Authorization: Bearer <adminToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "SETTINGS_PAGE",
    "title": { "en": "Privacy Policy", "ar": "سياسة الخصوصية" },
    "language": "en",
    "slug": "privacy-policy",
    "summary": { "en": "How LMJ Health handles personal data." },
    "pageVersion": "2026-04",
    "contentBlocks": [
      { "type": "heading", "level": 2, "text": "Overview" },
      { "type": "paragraph", "text": "We collect and process..." }
    ],
    "tags": ["legal"],
    "categories": ["settings"]
  }'
```

#### `PATCH /admin/content/:id`

Update a draft item.

- Roles: `admin`, `data_entry`
- Notes: Data-entry can edit only their own drafts. Admin edits to `PUBLISHED` items keep status `PUBLISHED` and append a snapshot to `revisions`; edits to `IN_REVIEW` clear approval fields; archived items cannot be edited.
- Request body accepts optional `pageVersion`.
- `type=MEDICATION` remains valid on update.
- `type=SETTINGS_PAGE` remains valid on update.
- Returned `contentItem` includes `pageVersion` and the localized content fields.

#### `POST /admin/content/:id/submit-review`

Submit a draft for review.

- Roles: `admin`, `data_entry` (data-entry can submit only their own drafts)
- For `SETTINGS_PAGE`, `pageVersion` must be present and non-empty before submission succeeds.
- `SETTINGS_PAGE` submission does not require seek-help blocks, sources, disclaimers, or news payloads.
- Missing version at this stage returns `400` with `errors.content.pageVersionRequired`.

#### `POST /admin/content/:id/approve`

Approve content in review.

- Roles: `admin`
- Approval re-runs readiness validation.
- For `SETTINGS_PAGE`, `pageVersion` must still be present; otherwise approval fails with `errors.content.pageVersionRequired`.

#### `POST /admin/content/:id/reject`

Reject content and move back to draft.

- Roles: `admin`
- Body: `{ "rejectionReason": "..." }`

#### `POST /admin/content/:id/publish`

Publish approved content.

- Roles: `admin`
- Requires approval (`reviewedBy` must exist)
- Optional body: `publishedAt`, `lastReviewedAt`, `nextReviewDueAt`
- Publish re-runs readiness validation.
- For `SETTINGS_PAGE`, `pageVersion` is required before publish succeeds.

#### `POST /admin/content/:id/archive`

Archive published content.

- Roles: `admin`

#### `GET /admin/content/mine`

List the authenticated data-entry user's own content items.

- Roles: `data_entry`
- Query: `status` (`DRAFT` default, `IN_REVIEW` optional), `page`, `limit`
- Returned `items[]` include `pageVersion`.
- Draft and in-review `SETTINGS_PAGE` items are included when they belong to the authenticated data-entry user.

#### `GET /admin/content/:id`

Fetch a content item by id.

- Roles: `admin`, `data_entry`
- Data-entry can access only their own `DRAFT` or `IN_REVIEW` items.
- Returned `contentItem` includes `pageVersion`.
- This route can be used to inspect draft or reviewed `SETTINGS_PAGE` items in the same admin/editor module.

#### `GET /admin/content`

List content items (drafts, in-review, published).

- Roles: `admin`
- Query: `type`, `status`, `language`, `page`, `limit`
- Query `type` also accepts `MEDICATION`.
- Query `type` now also accepts `SETTINGS_PAGE`.
- Response returns localized content documents in `items[]`, including `pageVersion`.

### Templates (admin)

#### `POST /admin/content-templates`

Create a template for metadata fields.

- Body: `{ "name", "slug?", "parentType", "fields": [...] }`
- `parentType` now supports `MEDICATION` in addition to `CONDITION`, `SYMPTOM`, and `GENERAL_ADVICE`.
- Each `fields[].key` is required, unique within its template, and must match `^[A-Za-z][A-Za-z0-9_]*$`. It is a stable technical JSON key, so use a semantic Latin identifier such as `scientificNumber`; place Arabic or English display text in `fields[].label`.
- `fields[].label` is required and accepts either a non-empty string or a localized object with a non-empty `en` and/or `ar` value. Allowed field `type` values are `string`, `number`, `boolean`, `array`, and `object`.

#### `PATCH /admin/content-templates/:id`

Update a template (bumps schemaVersion when fields change).

- When `fields` are supplied, the same required, unique ASCII technical-key rule applies to every `fields[].key`.

#### `GET /admin/content-templates`

List templates (read-only for data entry).

- Query `parentType` accepts `MEDICATION`.

- Roles: `admin`, `data_entry`
- Query: `parentType`, `active`, `page`, `limit`
- Response: `{ page, limit, total, results, contentTemplates }`

#### `POST /admin/content-templates/:id/disable`

Disable a template.

- Query: `force=true` to override draft/in-review references
- Returns `409 Conflict` with `{ "referencedCount": <number> }` when referenced by `DRAFT` or `IN_REVIEW` items

### News ingestion (admin)

#### `POST /admin/news/ingest`

Ingest one or more news items (max 100 per request).

Example:

```bash
curl -X POST "http://localhost:5000/api/admin/news/ingest" \
  -H "x-lang: en" \
  -H "Authorization: Bearer <adminToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "sourceUrl": "https://news.example.com/article/123",
        "publishedAt": "2025-12-30T10:00:00.000Z",
        "title": "New clinical trial results",
        "summary": "Key outcomes from the trial...",
        "language": "en",
        "sourceName": "Example News",
        "originalTitle": "Trial results released",
        "aiSummary": "Summary placeholder",
        "coverImage": "https://news.example.com/img/123.jpg"
      }
    ]
  }'
```

#### `GET /admin/news/pending`

List news items in `DRAFT` or `IN_REVIEW`.

- Query: `page`, `limit`, `sourceUrl`, `language`, `dateFrom`, `dateTo`
- Sort: `news.publishedAt` desc, `_id` desc

---

## Legacy Compatibility Notes

- Access requests:
  - `items[]` is still accepted on create routes (`/api/doctors/:doctorId/patients/:patientId/access-requests` and `/api/access-requests/:doctorId/patients/:patientId`).
  - The backend sanitizes and stores those legacy entries as `requestedItems`, but permission decisions remain profile-level.
  - `expiresAt` is still accepted and stored on create routes.
- Orders:
  - `POST /api/doctors/orders` is kept as a compatibility route.
  - Preferred create endpoints are typed:
    - `/api/doctors/orders/lab`
    - `/api/doctors/orders/imaging`
    - `/api/doctors/orders/procedures`
    - `/api/doctors/orders/referrals`
  - Legacy create aliases are still accepted:
    - `type|category -> orderType`
    - `orderName -> orderTitle`
    - `instructions -> instructionsToPatient`
  - Legacy type mapping:
    - `lab -> LAB_ORDER`
    - `imaging -> IMAGING_ORDER`
    - `other|procedure|medication -> PROCEDURE_ORDER`
    - `referral -> REFERRAL_ORDER`
  - `results` is no longer accepted on create payloads (compatibility and typed create routes). Use `POST /api/doctors/orders/:orderId/results`.
  - `POST /api/doctors/orders/:orderId/results` accepts result appends only in non-terminal working states (`ACCEPTED`, `IN_PROGRESS`), and `isFinal=true` still follows status-transition validation.
  - `details` on typed order create/update only persists keys allow-listed for that order type.
  - List routes accept both canonical and legacy query aliases:
    - `orderType` and `category|type`
    - `statusCode` or `status`
  - Patient list also supports `doctorId` filtering.
  - Returned order payloads continue to include both canonical and mirrored legacy fields.
- Patient files:
  - `/api/patient/files/initiate`
  - `/api/patient/files/complete`
  - `/api/patient/files`
  - These legacy patient self-file routes are still supported. New integrations should prefer `/api/patients/:patientId/files/...`.
- Medical records:
  - `/api/doctors/:doctorId/patients/:patientId/medical-history`
  - `/api/doctors/:doctorId/patients/:patientId/medical-history/:recordId`
  - These doctor-scoped legacy routes are still supported alongside `/medical-records`.

## Endpoint Index

| Method   | Path                                                                                                                       | Role                                      | Summary                                                                                                 |
| :------- | :------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------- | :------------------------------------------------------------------------------------------------------ |
| `PUT`    | `/api/patient/settings/password`                                                                                           | `patient`                                 | Change the authenticated patient's password and revoke existing auth sessions.                          |
| `POST`   | `/api/patient/settings/email/request`                                                                                      | `patient`                                 | Start a strict patient email-change flow with current-password verification plus OTP to the new email.  |
| `POST`   | `/api/patient/settings/email/confirm`                                                                                      | `patient`                                 | Confirm the pending patient email change, apply it, and revoke existing auth sessions.                  |
| `POST`   | `/api/patient/settings/phone/request`                                                                                      | `patient`                                 | Start a strict patient phone-change flow with current-password verification plus WhatsApp OTP.          |
| `POST`   | `/api/patient/settings/phone/confirm`                                                                                      | `patient`                                 | Confirm the pending patient phone change, apply it, and revoke existing auth sessions.                  |
| `GET`    | `/api/patient/settings/privacy`                                                                                            | `patient`                                 | Read the normalized patient privacy and data-sharing consent summary.                                   |
| `PATCH`  | `/api/patient/settings/privacy`                                                                                            | `patient`                                 | Update patient privacy settings while keeping the flat and nested toggles in sync.                      |
| `POST`   | `/api/patient/settings/privacy/consent`                                                                                    | `patient`                                 | Save the patient's data-sharing consent choice and capture the consent page version.                    |
| `PUT`    | `/api/doctors/me/settings/password`                                                                                        | `doctor`                                  | Change the authenticated doctor's password and revoke existing auth sessions.                           |
| `POST`   | `/api/doctors/me/settings/email/request`                                                                                   | `doctor`                                  | Start a strict doctor email-change flow with current-password verification plus OTP to the new email.   |
| `POST`   | `/api/doctors/me/settings/email/confirm`                                                                                   | `doctor`                                  | Confirm the pending doctor email change, apply it, and revoke existing auth sessions.                   |
| `POST`   | `/api/doctors/me/settings/phone/request`                                                                                   | `doctor`                                  | Start a strict doctor phone-change flow with current-password verification plus WhatsApp OTP.           |
| `POST`   | `/api/doctors/me/settings/phone/confirm`                                                                                   | `doctor`                                  | Confirm the pending doctor phone change, apply it, and revoke existing auth sessions.                   |
| `GET`    | `/api/doctors/me/activity-log`                                                                                             | `doctor`                                  | List the authenticated doctor's curated self activity timeline.                                         |
| `GET`    | `/api/doctors/me/profile-change-requests`                                                                                  | `doctor`                                  | List the authenticated doctor's own profile change requests.                                            |
| `GET`    | `/api/doctors/me/profile-change-requests/:requestId`                                                                       | `doctor`                                  | Return one authenticated doctor's own profile change request.                                           |
| `POST`   | `/api/doctors/:doctorId/patients/:patientId/access-requests`                                                               | `doctor`                                  | Create or reuse a doctor-scoped profile access request.                                                 |
| `GET`    | `/api/doctors/:doctorId/patients/:patientId/access-requests/:requestId/details`                                            | `doctor`                                  | Return full-profile-compatible details for an approved or otherwise accessible request.                 |
| `GET`    | `/api/patient/access-requests`                                                                                             | `patient`                                 | List incoming access requests for the authenticated patient.                                            |
| `PATCH`  | `/api/patient/access-requests/:requestId`                                                                                  | `patient`                                 | Approve or deny a patient access request.                                                               |
| `POST`   | `/api/access-requests/:doctorId/patients/:patientId`                                                                       | `doctor`                                  | Compatibility create route for profile access requests.                                                 |
| `GET`    | `/api/access-requests`                                                                                                     | `patient \| doctor \| admin`              | List access requests by role scope.                                                                     |
| `GET`    | `/api/access-requests/:id`                                                                                                 | `patient \| doctor \| admin`              | Return safe metadata details for one access request.                                                    |
| `PATCH`  | `/api/access-requests/:id/approve`                                                                                         | `patient`                                 | Approve an access request through the legacy route.                                                     |
| `PATCH`  | `/api/access-requests/:id/reject`                                                                                          | `patient`                                 | Reject an access request through the legacy route.                                                      |
| `GET`    | `/api/access-requests/:id/details`                                                                                         | `doctor`                                  | Compatibility details route for approved access data.                                                   |
| `GET`    | `/api/doctors/:doctorId/patients/:patientId`                                                                               | `doctor`                                  | Return the full linked-patient profile when access rules pass.                                          |
| `POST`   | `/api/patients/:patientId/files/upload`                                                                                    | `patient \| doctor \| secretary`          | Upload and attach one patient file. Admin access is forbidden.                                          |
| `GET`    | `/api/patients/:patientId/files`                                                                                           | `patient \| doctor \| secretary`          | List patient files. Admin access is forbidden.                                                          |
| `GET`    | `/api/patients/:patientId/files/:fileId`                                                                                   | `patient \| doctor \| secretary`          | Get one patient file metadata record. Admin access is forbidden.                                        |
| `GET`    | `/api/patients/:patientId/files/:fileId/download`                                                                          | `patient \| doctor \| secretary`          | Download or presign one patient file. Admin access is forbidden.                                        |
| `DELETE` | `/api/patients/:patientId/files/:fileId`                                                                                   | `patient \| doctor \| secretary`          | Soft-delete one patient file. Admin access is forbidden.                                                |
| `GET`    | `/api/doctors/:doctorId/patients/:patientId/files/:fileId/download-url`                                                    | `doctor`                                  | Doctor-scoped download URL alias for patient files.                                                     |
| `POST`   | `/api/patient/files/initiate`                                                                                              | `patient`                                 | Legacy initiate step for patient-owned file upload.                                                     |
| `POST`   | `/api/patient/files/complete`                                                                                              | `patient`                                 | Legacy complete step for patient-owned file upload.                                                     |
| `POST`   | `/api/patient/files`                                                                                                       | `patient`                                 | Legacy save endpoint for patient-owned files.                                                           |
| `POST`   | `/api/complaints`                                                                                                          | `patient`                                 | Create one complaint with optional `PatientFile` attachment references and initial `submitted` status.  |
| `GET`    | `/api/complaints/me`                                                                                                       | `patient`                                 | List the authenticated patient's own complaints with current status.                                    |
| `GET`    | `/api/complaints`                                                                                                          | `admin`                                   | List all complaints for admin review with status/type/patient/date/search filters.                      |
| `GET`    | `/api/complaints/:id`                                                                                                      | `patient \| admin`                        | Get one complaint detail with role-aware payload shaping.                                               |
| `PATCH`  | `/api/complaints/:id/status`                                                                                               | `admin`                                   | Update complaint lifecycle status and optionally persist/send one-way admin response text.              |
| `GET`    | `/api/patient/medical-records`                                                                                             | `patient`                                 | List the authenticated patient's medical records.                                                       |
| `GET`    | `/api/patient/medical-records/:recordId`                                                                                   | `patient`                                 | Get one patient-owned medical record.                                                                   |
| `POST`   | `/api/documents/generate`                                                                                                  | `patient \| doctor \| secretary`          | Generate and immediately download a PDF for `order`, `imaging_order`, `prescription`, or `diagnosis`.   |
| `POST`   | `/api/doctors/:doctorId/patients/:patientId/medical-history`                                                               | `doctor`                                  | Legacy create route for a doctor-authored medical record.                                               |
| `GET`    | `/api/doctors/:doctorId/patients/:patientId/medical-records`                                                               | `doctor`                                  | List a linked patient's medical records.                                                                |
| `POST`   | `/api/doctors/:doctorId/patients/:patientId/medical-records`                                                               | `doctor`                                  | Create a medical record for a linked patient.                                                           |
| `GET`    | `/api/doctors/:doctorId/patients/:patientId/medical-records/:recordId`                                                     | `doctor`                                  | Get one medical record for a linked patient.                                                            |
| `PATCH`  | `/api/doctors/:doctorId/patients/:patientId/medical-records/:recordId`                                                     | `doctor`                                  | Update a doctor-authored medical record.                                                                |
| `GET`    | `/api/doctors/:doctorId/patients/:patientId/medical-history/:recordId`                                                     | `doctor`                                  | Legacy direct medical-record read route.                                                                |
| `GET`    | `/api/patient/encounters`                                                                                                  | `patient`                                 | List the authenticated patient's own encounters.                                                        |
| `GET`    | `/api/patient/encounters/:encounterId`                                                                                     | `patient`                                 | Get one patient-owned encounter.                                                                        |
| `GET`    | `/api/patient/encounters/:encounterId/prescriptions`                                                                       | `patient`                                 | List finalized prescriptions for one patient-owned encounter.                                           |
| `GET`    | `/api/doctors/:doctorId/encounters`                                                                                        | `doctor`                                  | List all encounters owned by the authenticated doctor with optional patient/status/date filters.        |
| `GET`    | `/api/doctors/:doctorId/patients/:patientId/encounters`                                                                    | `doctor`                                  | List encounters for a linked patient.                                                                   |
| `POST`   | `/api/doctors/:doctorId/patients/:patientId/encounters`                                                                    | `doctor`                                  | Create an encounter for a linked patient with optional appointment linkage.                             |
| `GET`    | `/api/doctors/:doctorId/patients/:patientId/encounters/:encounterId`                                                       | `doctor`                                  | Get one encounter for a linked patient.                                                                 |
| `PATCH`  | `/api/doctors/:doctorId/patients/:patientId/encounters/:encounterId`                                                       | `doctor`                                  | Update editable encounter metadata.                                                                     |
| `POST`   | `/api/doctors/:doctorId/patients/:patientId/encounters/:encounterId/close`                                                 | `doctor`                                  | Close an encounter when no draft prescriptions or draft encounter orders remain.                        |
| `GET`    | `/api/patient/prescriptions`                                                                                               | `patient`                                 | List finalized prescriptions visible to the authenticated patient.                                      |
| `GET`    | `/api/patient/prescriptions/:prescriptionId`                                                                               | `patient`                                 | Get one finalized patient-owned prescription.                                                           |
| `GET`    | `/api/doctors/:doctorId/patients/:patientId/encounters/:encounterId/prescriptions`                                         | `doctor`                                  | List prescriptions attached to an encounter.                                                            |
| `POST`   | `/api/doctors/:doctorId/patients/:patientId/encounters/:encounterId/prescriptions`                                         | `doctor`                                  | Create a draft prescription inside an encounter.                                                        |
| `GET`    | `/api/doctors/:doctorId/patients/:patientId/encounters/:encounterId/prescriptions/:prescriptionId`                         | `doctor`                                  | Get one encounter-bound prescription.                                                                   |
| `PATCH`  | `/api/doctors/:doctorId/patients/:patientId/encounters/:encounterId/prescriptions/:prescriptionId`                         | `doctor`                                  | Update prescription-level draft fields.                                                                 |
| `POST`   | `/api/doctors/:doctorId/patients/:patientId/encounters/:encounterId/prescriptions/:prescriptionId/items`                   | `doctor`                                  | Add one prescription item.                                                                              |
| `PATCH`  | `/api/doctors/:doctorId/patients/:patientId/encounters/:encounterId/prescriptions/:prescriptionId/items/:itemId`           | `doctor`                                  | Update one prescription item.                                                                           |
| `DELETE` | `/api/doctors/:doctorId/patients/:patientId/encounters/:encounterId/prescriptions/:prescriptionId/items/:itemId`           | `doctor`                                  | Delete one prescription item from a draft prescription.                                                 |
| `POST`   | `/api/doctors/:doctorId/patients/:patientId/encounters/:encounterId/prescriptions/:prescriptionId/items/:itemId/duplicate` | `doctor`                                  | Duplicate one prescription item inside the same prescription.                                           |
| `POST`   | `/api/doctors/:doctorId/patients/:patientId/encounters/:encounterId/prescriptions/:prescriptionId/finalize`                | `doctor`                                  | Finalize a prescription and sync it into patient medications.                                           |
| `GET`    | `/api/doctors/:doctorId/patients/:patientId/encounters/:encounterId/prescriptions/:prescriptionId/preview`                 | `doctor`                                  | Preview a prescription before finalize/PDF steps.                                                       |
| `GET`    | `/api/doctors/:doctorId/patients/:patientId/encounters/:encounterId/orders`                                                | `doctor`                                  | List encounter-linked draft or finalized orders.                                                        |
| `POST`   | `/api/doctors/:doctorId/patients/:patientId/encounters/:encounterId/orders/lab`                                            | `doctor`                                  | Create a draft lab order linked to an encounter.                                                        |
| `POST`   | `/api/doctors/:doctorId/patients/:patientId/encounters/:encounterId/orders/imaging`                                        | `doctor`                                  | Create a draft imaging order linked to an encounter.                                                    |
| `POST`   | `/api/doctors/:doctorId/patients/:patientId/encounters/:encounterId/orders/procedures`                                     | `doctor`                                  | Create a draft procedure order linked to an encounter.                                                  |
| `POST`   | `/api/doctors/:doctorId/patients/:patientId/encounters/:encounterId/orders/referrals`                                      | `doctor`                                  | Create a draft referral order linked to an encounter.                                                   |
| `GET`    | `/api/doctors/:doctorId/patients/:patientId/encounters/:encounterId/orders/:orderId`                                       | `doctor`                                  | Get one encounter-linked order.                                                                         |
| `PATCH`  | `/api/doctors/:doctorId/patients/:patientId/encounters/:encounterId/orders/:orderId`                                       | `doctor`                                  | Update draft encounter-order fields.                                                                    |
| `POST`   | `/api/doctors/:doctorId/patients/:patientId/encounters/:encounterId/orders/:orderId/items`                                 | `doctor`                                  | Add one encounter-order item.                                                                           |
| `PATCH`  | `/api/doctors/:doctorId/patients/:patientId/encounters/:encounterId/orders/:orderId/items/:itemId`                         | `doctor`                                  | Update one encounter-order item.                                                                        |
| `DELETE` | `/api/doctors/:doctorId/patients/:patientId/encounters/:encounterId/orders/:orderId/items/:itemId`                         | `doctor`                                  | Delete one draft encounter-order item.                                                                  |
| `POST`   | `/api/doctors/:doctorId/patients/:patientId/encounters/:encounterId/orders/:orderId/finalize`                              | `doctor`                                  | Finalize a draft encounter order into the official order lifecycle.                                     |
| `GET`    | `/api/doctors/:doctorId/patients/:patientId/encounters/:encounterId/orders/:orderId/preview`                               | `doctor`                                  | Preview an encounter order before finalize/PDF steps.                                                   |
| `GET`    | `/api/doctors/library/recent`                                                                                              | `doctor`                                  | List recently used doctor library items.                                                                |
| `GET`    | `/api/doctors/library/items`                                                                                               | `doctor`                                  | List doctor-owned library items.                                                                        |
| `POST`   | `/api/doctors/library/items`                                                                                               | `doctor`                                  | Create a doctor-owned library item.                                                                     |
| `GET`    | `/api/doctors/library/items/:itemId`                                                                                       | `doctor`                                  | Get one doctor-owned library item.                                                                      |
| `PATCH`  | `/api/doctors/library/items/:itemId`                                                                                       | `doctor`                                  | Update one doctor-owned library item.                                                                   |
| `DELETE` | `/api/doctors/library/items/:itemId`                                                                                       | `doctor`                                  | Soft-delete one doctor-owned library item.                                                              |
| `PATCH`  | `/api/doctors/library/items/:itemId/favorite`                                                                              | `doctor`                                  | Toggle favorite state for one doctor-owned library item.                                                |
| `PATCH`  | `/api/services/:id/favorite`                                                                                               | `patient`                                 | Toggle saved-service state for the authenticated patient.                                               |
| `GET`    | `/api/patient/saved-services`                                                                                              | `patient`                                 | List the authenticated patient’s saved services with search/filter support.                             |
| `GET`    | `/api/doctors/templates`                                                                                                   | `doctor`                                  | List doctor-owned templates.                                                                            |
| `POST`   | `/api/doctors/templates`                                                                                                   | `doctor`                                  | Create a doctor-owned template.                                                                         |
| `GET`    | `/api/doctors/templates/:templateId`                                                                                       | `doctor`                                  | Get one doctor-owned template.                                                                          |
| `PATCH`  | `/api/doctors/templates/:templateId`                                                                                       | `doctor`                                  | Update one doctor-owned template.                                                                       |
| `DELETE` | `/api/doctors/templates/:templateId`                                                                                       | `doctor`                                  | Soft-delete one doctor-owned template.                                                                  |
| `POST`   | `/api/doctors/templates/:templateId/apply`                                                                                 | `doctor`                                  | Apply a template and return hydrated draft payload data.                                                |
| `GET`    | `/api/patient/encounters/:encounterId/documents`                                                                           | `patient`                                 | List encounter documents shared with the authenticated patient.                                         |
| `GET`    | `/api/patient/documents/:documentId`                                                                                       | `patient`                                 | Get one patient-visible encounter document.                                                             |
| `GET`    | `/api/doctors/:doctorId/patients/:patientId/encounters/:encounterId/documents`                                             | `doctor`                                  | List documents linked to an encounter.                                                                  |
| `POST`   | `/api/doctors/:doctorId/patients/:patientId/encounters/:encounterId/documents/link`                                        | `doctor`                                  | Link an existing patient file or generate-and-link a supported PDF to an encounter.                     |
| `POST`   | `/api/doctors/:doctorId/patients/:patientId/encounters/:encounterId/documents/:documentId/share`                           | `doctor`                                  | Share an encounter document with the patient.                                                           |
| `POST`   | `/api/doctors/orders`                                                                                                      | `doctor`                                  | Compatibility create endpoint (legacy and canonical typed body accepted, `results` rejected on create). |
| `POST`   | `/api/doctors/orders/lab`                                                                                                  | `doctor`                                  | Create a `LAB_ORDER`.                                                                                   |
| `POST`   | `/api/doctors/orders/imaging`                                                                                              | `doctor`                                  | Create an `IMAGING_ORDER`.                                                                              |
| `POST`   | `/api/doctors/orders/procedures`                                                                                           | `doctor`                                  | Create a `PROCEDURE_ORDER`.                                                                             |
| `POST`   | `/api/doctors/orders/referrals`                                                                                            | `doctor`                                  | Create a `REFERRAL_ORDER`.                                                                              |
| `GET`    | `/api/doctors/orders`                                                                                                      | `doctor`                                  | List orders owned by the authenticated doctor.                                                          |
| `GET`    | `/api/doctors/orders/:orderId`                                                                                             | `doctor`                                  | Get full order details for a doctor-owned order.                                                        |
| `PATCH`  | `/api/doctors/orders/:orderId`                                                                                             | `doctor`                                  | Update editable fields for a non-terminal order.                                                        |
| `PATCH`  | `/api/doctors/orders/:orderId/cancel`                                                                                      | `doctor`                                  | Cancel a doctor-owned order.                                                                            |
| `PATCH`  | `/api/doctors/orders/:orderId/status`                                                                                      | `doctor`                                  | Update an order status with transition checks.                                                          |
| `POST`   | `/api/doctors/orders/:orderId/results`                                                                                     | `doctor`                                  | Append structured results to an order (`ACCEPTED`/`IN_PROGRESS` only; transition-checked finalization). |
| `GET`    | `/api/doctors/order-catalog/lab-tests`                                                                                     | `doctor`                                  | Browse active/visible lab catalog items.                                                                |
| `GET`    | `/api/doctors/order-catalog/lab-tests/:id`                                                                                 | `doctor`                                  | Get one active/visible lab catalog item.                                                                |
| `GET`    | `/api/doctors/order-catalog/imaging`                                                                                       | `doctor`                                  | Browse active/visible imaging catalog items.                                                            |
| `GET`    | `/api/doctors/order-catalog/imaging/:id`                                                                                   | `doctor`                                  | Get one active/visible imaging catalog item.                                                            |
| `GET`    | `/api/doctors/order-catalog/procedures`                                                                                    | `doctor`                                  | Browse active/visible procedure catalog items.                                                          |
| `GET`    | `/api/doctors/order-catalog/procedures/:id`                                                                                | `doctor`                                  | Get one active/visible procedure catalog item.                                                          |
| `POST`   | `/api/doctors/order-favorites`                                                                                             | `doctor`                                  | Add a doctor catalog favorite (`LAB`, `IMAGING`, `PROCEDURE`).                                          |
| `GET`    | `/api/doctors/order-favorites`                                                                                             | `doctor`                                  | List doctor catalog favorites with optional `section` filter and pagination.                            |
| `DELETE` | `/api/doctors/order-favorites/:favoriteId`                                                                                 | `doctor`                                  | Remove a doctor catalog favorite.                                                                       |
| `GET`    | `/api/medical-library/tests`                                                                                               | `admin`, `doctor`, `patient`, `secretary` | Browse active/visible lab tests for the app medical-library "Tests" section with search/filter/A-Z.     |
| `GET`    | `/api/medical-library/tests/:id`                                                                                           | `admin`, `doctor`, `patient`, `secretary` | Get one active/visible lab test for the app medical-library "Tests" section.                            |
| `GET`    | `/api/admin/order-catalog/lab-tests`                                                                                       | `admin`, `data_entry`                     | List lab catalog items for admin management.                                                            |
| `GET`    | `/api/admin/order-catalog/lab-tests/:id`                                                                                   | `admin`, `data_entry`                     | Get one lab catalog item for admin management.                                                          |
| `POST`   | `/api/admin/order-catalog/lab-tests`                                                                                       | `admin`, `data_entry`                     | Create a lab catalog item.                                                                              |
| `PATCH`  | `/api/admin/order-catalog/lab-tests/:id`                                                                                   | `admin`, `data_entry`                     | Update a lab catalog item (including active/visible flags).                                             |
| `GET`    | `/api/admin/order-catalog/imaging`                                                                                         | `admin`, `data_entry`                     | List imaging catalog items for admin management.                                                        |
| `GET`    | `/api/admin/order-catalog/imaging/:id`                                                                                     | `admin`, `data_entry`                     | Get one imaging catalog item for admin management.                                                      |
| `POST`   | `/api/admin/order-catalog/imaging`                                                                                         | `admin`, `data_entry`                     | Create an imaging catalog item.                                                                         |
| `PATCH`  | `/api/admin/order-catalog/imaging/:id`                                                                                     | `admin`, `data_entry`                     | Update an imaging catalog item (including active/visible flags).                                        |
| `GET`    | `/api/admin/order-catalog/procedures`                                                                                      | `admin`, `data_entry`                     | List procedure catalog items for admin management.                                                      |
| `GET`    | `/api/admin/order-catalog/procedures/:id`                                                                                  | `admin`, `data_entry`                     | Get one procedure catalog item for admin management.                                                    |
| `POST`   | `/api/admin/order-catalog/procedures`                                                                                      | `admin`, `data_entry`                     | Create a procedure catalog item.                                                                        |
| `PATCH`  | `/api/admin/order-catalog/procedures/:id`                                                                                  | `admin`, `data_entry`                     | Update a procedure catalog item (including active/visible flags).                                       |
| `GET`    | `/api/patient/orders`                                                                                                      | `patient`                                 | List patient orders with typed and legacy compatibility fields.                                         |
| `GET`    | `/api/patient/orders/:orderId`                                                                                             | `patient`                                 | Get full order details for a patient-owned order.                                                       |
