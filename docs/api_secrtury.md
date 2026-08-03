{
  "openapi": "3.1.0",
  "info": {
    "title": "LMJ Health Backend API - Secretary API",
    "version": "2026.04.30",
    "summary": "Role-sensitive healthcare API for LMJ Health mobile and web clients.",
    "description": "Machine-readable OpenAPI contract for the LMJ Health backend. The API is mounted under /api and uses localized JSON success/error envelopes from src/app.js. Successful JSON responses return storage-key shaped profile `photoUrl` values as short-lived signed download URLs, with the original object key in `photoKey` and the TTL in `photoUrlExpiresIn`.\n\nFiltered endpoint view for the secretary role. Public and shared authenticated endpoints are included."
  },
  "servers": [
    {
      "url": "/",
      "description": "Current host"
    }
  ],
  "security": [
    {
      "bearerAuth": []
    }
  ],
  "tags": [
    {
      "name": "Health"
    },
    {
      "name": "Auth"
    },
    {
      "name": "Doctors"
    },
    {
      "name": "Secretaries"
    },
    {
      "name": "Appointments"
    },
    {
      "name": "Appointment Types"
    },
    {
      "name": "Slots"
    },
    {
      "name": "Waitlist"
    },
    {
      "name": "Devices"
    },
    {
      "name": "Notifications"
    },
    {
      "name": "Patient Files"
    },
    {
      "name": "Documents"
    },
    {
      "name": "Billing"
    },
    {
      "name": "Facilities"
    },
    {
      "name": "Services"
    },
    {
      "name": "Content"
    },
    {
      "name": "Medical Library"
    },
    {
      "name": "Meta"
    },
    {
      "name": "Upload"
    },
    {
      "name": "Test"
    }
  ],
  "paths": {
    "/api/appointments": {
      "get": {
        "tags": [
          "Appointments"
        ],
        "summary": "View Appointments",
        "description": "View Appointments\n\nRequires a bearer access token.\n\nAllowed roles: admin, doctor, secretary, patient.\n\nAdditional account-state, ownership, assignment, or delegated-access guards may apply before the controller runs.\n\nDoctors see appointments scoped by Appointment.doctor, so patient-booked appointments are visible to the assigned doctor after booking. Admin, doctor, and secretary list responses populate patient.userId.fullName alongside publicId for display. Response appointment objects include nullable encounter summaries as encounter. Linked encounter summaries contain only _id, status, origin, startedAt, and closedAt; encounter notes are intentionally omitted.\n\nValidation: query: page, limit, status, date, dateFrom, dateTo.\n\nSource route file: src/routes/appointment.js.",
        "operationId": "get_api_appointments",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          },
          {
            "name": "page",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer",
              "minimum": 1
            }
          },
          {
            "name": "limit",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer",
              "minimum": 1,
              "maximum": 100
            }
          },
          {
            "name": "status",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "scheduled",
                "rescheduled",
                "completed",
                "cancelled",
                "no-show"
              ]
            }
          },
          {
            "name": "date",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "format": "date"
            }
          },
          {
            "name": "dateFrom",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "format": "date"
            }
          },
          {
            "name": "dateTo",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "format": "date"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Paged appointment list. Admin, doctor, and secretary appointment items include patient publicId and patient.userId.fullName. Each appointment includes a nullable compact encounter summary without encounter notes.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AppointmentListResponse"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-roles": [
          "admin",
          "doctor",
          "secretary",
          "patient"
        ],
        "x-source-route": "src/routes/appointment.js",
        "x-controller": "viewAppointments",
        "x-middlewares": [
          "default",
          "middleware",
          "enforcePatientReadAccess",
          "loadUserModelsGuard",
          "viewAppointments"
        ]
      }
    },
    "/api/appointments/{appointmentId}": {
      "get": {
        "tags": [
          "Appointments"
        ],
        "summary": "Get Appointment Details",
        "description": "Get Appointment Details\n\nRequires a bearer access token.\n\nAllowed roles: admin, doctor, secretary, patient.\n\nAdditional account-state, ownership, assignment, or delegated-access guards may apply before the controller runs.\n\nThe returned appointment includes nullable encounter. When linked, the summary contains only _id, status, origin, startedAt, and closedAt; encounter notes are intentionally omitted.\n\nValidation: params: appointmentId.\n\nSource route file: src/routes/appointment.js.",
        "operationId": "get_api_appointments_appointmentId",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          },
          {
            "name": "appointmentId",
            "in": "path",
            "required": true,
            "schema": {
              "$ref": "#/components/schemas/ObjectId"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Appointment detail with linked files and nullable compact encounter summary without encounter notes.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AppointmentDetailResponse"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-roles": [
          "admin",
          "doctor",
          "secretary",
          "patient"
        ],
        "x-source-route": "src/routes/appointment.js",
        "x-controller": "getAppointmentDetails",
        "x-middlewares": [
          "default",
          "middleware",
          "enforcePatientReadAccess",
          "loadUserModelsGuard",
          "getAppointmentDetails"
        ]
      }
    },
    "/api/appointments/{appointmentId}/cancel": {
      "patch": {
        "tags": [
          "Appointments"
        ],
        "summary": "Cancel Appointment",
        "description": "Cancel Appointment\n\nRequires a bearer access token.\n\nAllowed roles: patient, doctor, secretary.\n\nAdditional account-state, ownership, assignment, or delegated-access guards may apply before the controller runs.\n\nValidation: params: appointmentId; body: reason.\n\nSource route file: src/routes/appointment.js.",
        "operationId": "patch_api_appointments_appointmentId_cancel",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          },
          {
            "name": "appointmentId",
            "in": "path",
            "required": true,
            "schema": {
              "$ref": "#/components/schemas/ObjectId"
            }
          }
        ],
        "requestBody": {
          "required": false,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "additionalProperties": true,
                "properties": {
                  "reason": {
                    "type": "string",
                    "maxLength": 300
                  }
                }
              },
              "example": {
                "reason": "string"
              }
            }
          }
        },
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-roles": [
          "patient",
          "doctor",
          "secretary"
        ],
        "x-source-route": "src/routes/appointment.js",
        "x-controller": "cancelAppointment",
        "x-middlewares": [
          "default",
          "middleware",
          "enforcePatientActiveStatus",
          "loadUserModelsGuard",
          "cancelAppointment"
        ]
      }
    },
    "/api/appointments/{appointmentId}/files": {
      "get": {
        "tags": [
          "Appointments"
        ],
        "summary": "List Appointment Files",
        "description": "List Appointment Files\n\nRequires a bearer access token.\n\nAllowed roles: admin, doctor, secretary, patient.\n\nAdditional account-state, ownership, assignment, or delegated-access guards may apply before the controller runs.\n\nValidation: params: appointmentId; query: category, subcategory, mimeCategory, clinicalContext, sourceModule, uploadedByRole, visibilityScope, tags, serviceDateFrom, serviceDateTo, sortBy, sortOrder.\n\nSource route file: src/routes/appointment.js.",
        "operationId": "get_api_appointments_appointmentId_files",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          },
          {
            "name": "appointmentId",
            "in": "path",
            "required": true,
            "schema": {
              "$ref": "#/components/schemas/ObjectId"
            }
          },
          {
            "name": "category",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "lab_result",
                "radiology",
                "prescription",
                "medical_report",
                "discharge_summary",
                "referral",
                "consent_form",
                "insurance_document",
                "identity_document",
                "appointment_attachment",
                "clinical_photo",
                "invoice",
                "other"
              ]
            }
          },
          {
            "name": "subcategory",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "minLength": 1,
              "maxLength": 64
            }
          },
          {
            "name": "mimeCategory",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "image",
                "pdf",
                "document",
                "spreadsheet",
                "other"
              ]
            }
          },
          {
            "name": "clinicalContext",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "general_record",
                "appointment",
                "complaint",
                "order",
                "consultation",
                "admission",
                "discharge"
              ]
            }
          },
          {
            "name": "sourceModule",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "patient_files",
                "appointment_files",
                "orders",
                "complaints",
                "legacy_patient_flow",
                "generated_report"
              ]
            }
          },
          {
            "name": "uploadedByRole",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "patient",
                "doctor",
                "admin",
                "secretary",
                "system"
              ]
            }
          },
          {
            "name": "visibilityScope",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "patient_and_assigned_doctor",
                "patient_only",
                "clinical_staff_only",
                "internal_only"
              ]
            }
          },
          {
            "name": "tags",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "minLength": 1,
              "maxLength": 512
            }
          },
          {
            "name": "serviceDateFrom",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "format": "date"
            }
          },
          {
            "name": "serviceDateTo",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "format": "date"
            }
          },
          {
            "name": "sortBy",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "createdAt",
                "serviceDate",
                "fileName",
                "documentCategory",
                "uploadedByRole"
              ]
            }
          },
          {
            "name": "sortOrder",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "asc",
                "desc"
              ]
            }
          }
        ],
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-roles": [
          "admin",
          "doctor",
          "secretary",
          "patient"
        ],
        "x-source-route": "src/routes/appointment.js",
        "x-controller": "listAppointmentFiles",
        "x-middlewares": [
          "default",
          "middleware",
          "enforcePatientReadAccess",
          "loadUserModelsGuard",
          "listAppointmentFiles"
        ]
      },
      "post": {
        "tags": [
          "Appointments"
        ],
        "summary": "Upload Appointment File",
        "description": "Upload Appointment File\n\nRequires a bearer access token.\n\nAllowed roles: admin, doctor, secretary, patient.\n\nAdditional account-state, ownership, assignment, or delegated-access guards may apply before the controller runs.\n\nConsumes multipart/form-data for file upload.\n\nValidation: params: appointmentId.\n\nSource route file: src/routes/appointment.js.",
        "operationId": "post_api_appointments_appointmentId_files",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          },
          {
            "name": "appointmentId",
            "in": "path",
            "required": true,
            "schema": {
              "$ref": "#/components/schemas/ObjectId"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "multipart/form-data": {
              "schema": {
                "$ref": "#/components/schemas/MultipartUploadRequest"
              },
              "encoding": {
                "file": {
                  "contentType": "image/jpeg, image/png, application/pdf, application/octet-stream"
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "201": {
            "$ref": "#/components/responses/CreatedEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-roles": [
          "admin",
          "doctor",
          "secretary",
          "patient"
        ],
        "x-source-route": "src/routes/appointment.js",
        "x-controller": "uploadAppointmentFile",
        "x-middlewares": [
          "default",
          "middleware",
          "enforcePatientActiveStatus",
          "loadUserModelsGuard",
          "uploadAppointmentFile"
        ]
      }
    },
    "/api/appointments/{appointmentId}/files/{fileId}": {
      "get": {
        "tags": [
          "Appointments"
        ],
        "summary": "Get Appointment File",
        "description": "Get Appointment File\n\nRequires a bearer access token.\n\nAllowed roles: admin, doctor, secretary, patient.\n\nAdditional account-state, ownership, assignment, or delegated-access guards may apply before the controller runs.\n\nValidation: params: appointmentId, fileId.\n\nSource route file: src/routes/appointment.js.",
        "operationId": "get_api_appointments_appointmentId_files_fileId",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          },
          {
            "name": "appointmentId",
            "in": "path",
            "required": true,
            "schema": {
              "$ref": "#/components/schemas/ObjectId"
            }
          },
          {
            "name": "fileId",
            "in": "path",
            "required": true,
            "schema": {
              "$ref": "#/components/schemas/ObjectId"
            }
          }
        ],
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-roles": [
          "admin",
          "doctor",
          "secretary",
          "patient"
        ],
        "x-source-route": "src/routes/appointment.js",
        "x-controller": "getAppointmentFile",
        "x-middlewares": [
          "default",
          "middleware",
          "enforcePatientReadAccess",
          "loadUserModelsGuard",
          "getAppointmentFile"
        ]
      },
      "delete": {
        "tags": [
          "Appointments"
        ],
        "summary": "Unlink Appointment File",
        "description": "Unlink Appointment File\n\nRequires a bearer access token.\n\nAllowed roles: admin, doctor, secretary, patient.\n\nAdditional account-state, ownership, assignment, or delegated-access guards may apply before the controller runs.\n\nValidation: params: appointmentId, fileId.\n\nSource route file: src/routes/appointment.js.",
        "operationId": "delete_api_appointments_appointmentId_files_fileId",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          },
          {
            "name": "appointmentId",
            "in": "path",
            "required": true,
            "schema": {
              "$ref": "#/components/schemas/ObjectId"
            }
          },
          {
            "name": "fileId",
            "in": "path",
            "required": true,
            "schema": {
              "$ref": "#/components/schemas/ObjectId"
            }
          }
        ],
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-roles": [
          "admin",
          "doctor",
          "secretary",
          "patient"
        ],
        "x-source-route": "src/routes/appointment.js",
        "x-controller": "unlinkAppointmentFile",
        "x-middlewares": [
          "default",
          "middleware",
          "enforcePatientActiveStatus",
          "loadUserModelsGuard",
          "unlinkAppointmentFile"
        ]
      }
    },
    "/api/appointments/{appointmentId}/files/{fileId}/download": {
      "get": {
        "tags": [
          "Appointments"
        ],
        "summary": "Download Appointment File",
        "description": "Download Appointment File\n\nRequires a bearer access token.\n\nAllowed roles: admin, doctor, secretary, patient.\n\nAdditional account-state, ownership, assignment, or delegated-access guards may apply before the controller runs.\n\nValidation: params: appointmentId, fileId; query: mode.\n\nSource route file: src/routes/appointment.js.",
        "operationId": "get_api_appointments_appointmentId_files_fileId_download",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          },
          {
            "name": "appointmentId",
            "in": "path",
            "required": true,
            "schema": {
              "$ref": "#/components/schemas/ObjectId"
            }
          },
          {
            "name": "fileId",
            "in": "path",
            "required": true,
            "schema": {
              "$ref": "#/components/schemas/ObjectId"
            }
          },
          {
            "name": "mode",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "url",
                "stream"
              ]
            }
          }
        ],
        "responses": {
          "200": {
            "$ref": "#/components/responses/DownloadUrl"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-roles": [
          "admin",
          "doctor",
          "secretary",
          "patient"
        ],
        "x-source-route": "src/routes/appointment.js",
        "x-controller": "downloadAppointmentFile",
        "x-middlewares": [
          "default",
          "middleware",
          "enforcePatientReadAccess",
          "loadUserModelsGuard",
          "downloadAppointmentFile"
        ]
      }
    },
    "/api/appointments/{appointmentId}/reschedule": {
      "patch": {
        "tags": [
          "Appointments"
        ],
        "summary": "Reschedule Appointment",
        "description": "Reschedule Appointment\n\nRequires a bearer access token.\n\nAllowed roles: patient, doctor, secretary.\n\nAdditional account-state, ownership, assignment, or delegated-access guards may apply before the controller runs.\n\nValidation: params: appointmentId; body: date, startTime, appointmentTypeId, reason.\n\nSource route file: src/routes/appointment.js.",
        "operationId": "patch_api_appointments_appointmentId_reschedule",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          },
          {
            "name": "appointmentId",
            "in": "path",
            "required": true,
            "schema": {
              "$ref": "#/components/schemas/ObjectId"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "additionalProperties": true,
                "properties": {
                  "date": {
                    "type": "string",
                    "format": "date"
                  },
                  "startTime": {
                    "type": "string",
                    "pattern": "^\\d{2}:\\d{2}$",
                    "example": "09:30"
                  },
                  "appointmentTypeId": {
                    "$ref": "#/components/schemas/ObjectId"
                  },
                  "reason": {
                    "type": "string",
                    "maxLength": 300
                  }
                },
                "required": [
                  "date",
                  "startTime"
                ]
              },
              "example": {
                "date": "2026-04-30",
                "startTime": "09:30",
                "appointmentTypeId": "64f0c0000000000000000001",
                "reason": "string"
              }
            }
          }
        },
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-roles": [
          "patient",
          "doctor",
          "secretary"
        ],
        "x-source-route": "src/routes/appointment.js",
        "x-controller": "rescheduleAppointment",
        "x-middlewares": [
          "default",
          "middleware",
          "enforcePatientActiveStatus",
          "loadUserModelsGuard",
          "rescheduleAppointment"
        ]
      }
    },
    "/api/appointments/book": {
      "post": {
        "tags": [
          "Appointments"
        ],
        "summary": "Book Appointment",
        "description": "Book Appointment\n\nRequires a bearer access token.\n\nAllowed roles: patient, secretary, doctor.\n\nAdditional account-state, ownership, assignment, or delegated-access guards may apply before the controller runs.\n\nAfter the Appointment is created, booking idempotently links the doctor and patient with atomic add-to-set updates for Doctor.patients, Doctor.appointments, Patient.visitedDoctors, and Patient.appointments.\n\nValidation: body: doctorId, patientId, date, startTime, appointmentTypeId, notes.\n\nSource route file: src/routes/appointment.js.",
        "operationId": "post_api_appointments_book",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "additionalProperties": true,
                "properties": {
                  "doctorId": {
                    "$ref": "#/components/schemas/ObjectId"
                  },
                  "patientId": {
                    "$ref": "#/components/schemas/ObjectId"
                  },
                  "date": {
                    "type": "string",
                    "format": "date"
                  },
                  "startTime": {
                    "type": "string",
                    "pattern": "^\\d{2}:\\d{2}$",
                    "example": "09:30"
                  },
                  "appointmentTypeId": {
                    "$ref": "#/components/schemas/ObjectId"
                  },
                  "notes": {
                    "type": "string"
                  }
                },
                "required": [
                  "doctorId",
                  "date",
                  "startTime"
                ]
              },
              "example": {
                "doctorId": "64f0c0000000000000000001",
                "patientId": "64f0c0000000000000000001",
                "date": "2026-04-30",
                "startTime": "09:30",
                "appointmentTypeId": "64f0c0000000000000000001",
                "notes": "string"
              }
            }
          }
        },
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "201": {
            "$ref": "#/components/responses/CreatedEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-roles": [
          "patient",
          "secretary",
          "doctor"
        ],
        "x-source-route": "src/routes/appointment.js",
        "x-controller": "bookAppointment",
        "x-middlewares": [
          "default",
          "middleware",
          "enforcePatientActiveStatus",
          "patientBookingGuard",
          "secretaryBookingGuard",
          "doctorBookingGuard",
          "bookAppointment"
        ]
      }
    },
    "/api/auth/claim-account/request": {
      "post": {
        "tags": [
          "Auth"
        ],
        "summary": "Request Claim Account",
        "description": "Request Claim Account\n\nPublic endpoint; no bearer token is required.\n\nNo role restriction is declared for this route.\n\nValidation: body: channel, email, phone.\n\nSource route file: src/routes/auth.js.",
        "operationId": "post_api_auth_claim_account_request",
        "security": [],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "additionalProperties": true,
                "properties": {
                  "channel": {
                    "type": "string",
                    "enum": [
                      "email",
                      "whatsapp"
                    ]
                  },
                  "email": {
                    "type": "string",
                    "format": "email"
                  },
                  "phone": {
                    "type": "string"
                  }
                },
                "required": [
                  "channel"
                ]
              },
              "example": {
                "channel": "email",
                "email": "patient@example.com",
                "phone": "+963944000000"
              }
            }
          }
        },
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "201": {
            "$ref": "#/components/responses/CreatedEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/auth.js",
        "x-controller": "requestClaimAccount",
        "x-middlewares": [
          "middleware",
          "default",
          "requestClaimAccount"
        ]
      }
    },
    "/api/auth/claim-account/verify": {
      "post": {
        "tags": [
          "Auth"
        ],
        "summary": "Verify Claim Account",
        "description": "Verify Claim Account\n\nPublic endpoint; no bearer token is required.\n\nNo role restriction is declared for this route.\n\nValidation: body: channel, email, phone, clientType, otp, password.\n\nSource route file: src/routes/auth.js.",
        "operationId": "post_api_auth_claim_account_verify",
        "security": [],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "additionalProperties": true,
                "properties": {
                  "channel": {
                    "type": "string",
                    "enum": [
                      "email",
                      "whatsapp"
                    ]
                  },
                  "email": {
                    "type": "string",
                    "format": "email"
                  },
                  "phone": {
                    "type": "string"
                  },
                  "clientType": {
                    "type": "string",
                    "enum": [
                      "patient_mobile",
                      "doctor_mobile",
                      "web"
                    ]
                  },
                  "otp": {
                    "type": "string",
                    "minLength": 6,
                    "maxLength": 6
                  },
                  "password": {
                    "type": "string",
                    "minLength": 6
                  }
                },
                "required": [
                  "channel",
                  "otp",
                  "password"
                ]
              },
              "example": {
                "channel": "email",
                "email": "patient@example.com",
                "phone": "+963944000000",
                "clientType": "patient_mobile",
                "otp": "string",
                "password": "StrongPass123!"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Temporary account activation response. When the account is activated, the payload includes a session-backed access token, refresh token, and refresh expiry.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AuthTokenEnvelope"
                },
                "examples": {
                  "authTokens": {
                    "$ref": "#/components/examples/AuthTokens"
                  }
                }
              }
            }
          },
          "201": {
            "description": "Temporary account activation response. When the account is activated, the payload includes a session-backed access token, refresh token, and refresh expiry.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AuthTokenEnvelope"
                },
                "examples": {
                  "authTokens": {
                    "$ref": "#/components/examples/AuthTokens"
                  }
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/auth.js",
        "x-controller": "verifyClaimAccount",
        "x-middlewares": [
          "middleware",
          "default",
          "verifyClaimAccount"
        ]
      }
    },
    "/api/auth/login": {
      "post": {
        "tags": [
          "Auth"
        ],
        "summary": "Login",
        "description": "Login\n\nPublic endpoint; no bearer token is required.\n\nNo role restriction is declared for this route.\n\nValidation: body: email, phone, clientType, password.\n\nSource route file: src/routes/auth.js.",
        "operationId": "post_api_auth_login",
        "security": [],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "additionalProperties": true,
                "properties": {
                  "email": {
                    "type": "string",
                    "format": "email"
                  },
                  "phone": {
                    "type": "string"
                  },
                  "clientType": {
                    "type": "string",
                    "enum": [
                      "patient_mobile",
                      "doctor_mobile",
                      "web"
                    ]
                  },
                  "password": {
                    "type": "string",
                    "minLength": 6
                  }
                },
                "required": [
                  "password"
                ]
              },
              "example": {
                "email": "patient@example.com",
                "phone": "+963944000000",
                "clientType": "patient_mobile",
                "password": "StrongPass123!"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Login response with a short-lived access token, refresh token, and refresh expiry.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AuthTokenEnvelope"
                },
                "examples": {
                  "authTokens": {
                    "$ref": "#/components/examples/AuthTokens"
                  }
                }
              }
            }
          },
          "201": {
            "description": "Login response with a short-lived access token, refresh token, and refresh expiry.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AuthTokenEnvelope"
                },
                "examples": {
                  "authTokens": {
                    "$ref": "#/components/examples/AuthTokens"
                  }
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/auth.js",
        "x-controller": "login",
        "x-middlewares": [
          "middleware",
          "default",
          "login"
        ]
      }
    },
    "/api/auth/logout": {
      "post": {
        "tags": [
          "Auth"
        ],
        "summary": "Logout Current Session",
        "description": "Logout Current Session\n\nRequires a bearer access token.\n\nNo role restriction is declared for this route.\n\nValidation: no explicit express-validator fields.\n\nSource route file: src/routes/auth.js.",
        "operationId": "post_api_auth_logout",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          }
        ],
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "201": {
            "$ref": "#/components/responses/CreatedEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/auth.js",
        "x-controller": "logoutCurrentSession",
        "x-middlewares": [
          "default",
          "logoutCurrentSession"
        ]
      }
    },
    "/api/auth/logout-all": {
      "post": {
        "tags": [
          "Auth"
        ],
        "summary": "Logout All Devices",
        "description": "Logout All Devices\n\nRequires a bearer access token.\n\nNo role restriction is declared for this route.\n\nValidation: no explicit express-validator fields.\n\nSource route file: src/routes/auth.js.",
        "operationId": "post_api_auth_logout_all",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          }
        ],
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "201": {
            "$ref": "#/components/responses/CreatedEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/auth.js",
        "x-controller": "logoutAllDevices",
        "x-middlewares": [
          "default",
          "logoutAllDevices"
        ]
      }
    },
    "/api/auth/new-password": {
      "post": {
        "tags": [
          "Auth"
        ],
        "summary": "Set New Password",
        "description": "Set New Password\n\nPublic endpoint; no bearer token is required.\n\nNo role restriction is declared for this route.\n\nValidation: body: token, password.\n\nSource route file: src/routes/auth.js.",
        "operationId": "post_api_auth_new_password",
        "security": [],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "additionalProperties": true,
                "properties": {
                  "token": {
                    "type": "string"
                  },
                  "password": {
                    "type": "string",
                    "minLength": 6
                  }
                },
                "required": [
                  "token",
                  "password"
                ]
              },
              "example": {
                "token": "string",
                "password": "StrongPass123!"
              }
            }
          }
        },
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "201": {
            "$ref": "#/components/responses/CreatedEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/auth.js",
        "x-controller": "setNewPassword",
        "x-middlewares": [
          "middleware",
          "default",
          "setNewPassword"
        ]
      }
    },
    "/api/auth/refresh": {
      "post": {
        "tags": [
          "Auth"
        ],
        "summary": "Refresh Session",
        "description": "Refresh Session\n\nPublic endpoint; no bearer token is required.\n\nNo role restriction is declared for this route.\n\nValidation: body: refreshToken.\n\nSource route file: src/routes/auth.js.",
        "operationId": "post_api_auth_refresh",
        "security": [],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "additionalProperties": true,
                "properties": {
                  "refreshToken": {
                    "type": "string"
                  }
                },
                "required": [
                  "refreshToken"
                ]
              },
              "example": {
                "refreshToken": "string"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Refresh-token rotation response. Use the returned access token as the bearer token and replace the stored refresh token with the returned value.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AuthTokenEnvelope"
                },
                "examples": {
                  "authTokens": {
                    "$ref": "#/components/examples/AuthTokens"
                  }
                }
              }
            }
          },
          "201": {
            "description": "Refresh-token rotation response. Use the returned access token as the bearer token and replace the stored refresh token with the returned value.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AuthTokenEnvelope"
                },
                "examples": {
                  "authTokens": {
                    "$ref": "#/components/examples/AuthTokens"
                  }
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/auth.js",
        "x-controller": "refreshSession",
        "x-middlewares": [
          "middleware",
          "default",
          "refreshSession"
        ]
      }
    },
    "/api/auth/resend-otp": {
      "post": {
        "tags": [
          "Auth"
        ],
        "summary": "Resend Signup Otp",
        "description": "Resend Signup Otp\n\nPublic endpoint; no bearer token is required.\n\nNo role restriction is declared for this route.\n\nValidation: body: channel, email, phone.\n\nSource route file: src/routes/auth.js.",
        "operationId": "post_api_auth_resend_otp",
        "security": [],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "additionalProperties": true,
                "properties": {
                  "channel": {
                    "type": "string",
                    "enum": [
                      "email",
                      "whatsapp"
                    ]
                  },
                  "email": {
                    "type": "string",
                    "format": "email"
                  },
                  "phone": {
                    "type": "string"
                  }
                },
                "required": [
                  "channel"
                ]
              },
              "example": {
                "channel": "email",
                "email": "patient@example.com",
                "phone": "+963944000000"
              }
            }
          }
        },
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "201": {
            "$ref": "#/components/responses/CreatedEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/auth.js",
        "x-controller": "resendSignupOtp",
        "x-middlewares": [
          "middleware",
          "default",
          "resendSignupOtp"
        ]
      }
    },
    "/api/auth/resend-reset-otp": {
      "post": {
        "tags": [
          "Auth"
        ],
        "summary": "Request Password Reset",
        "description": "Request Password Reset\n\nPublic endpoint; no bearer token is required.\n\nNo role restriction is declared for this route.\n\nValidation: body: email, phone, channel.\n\nSource route file: src/routes/auth.js.",
        "operationId": "post_api_auth_resend_reset_otp",
        "security": [],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "additionalProperties": true,
                "properties": {
                  "email": {
                    "type": "string",
                    "format": "email"
                  },
                  "phone": {
                    "type": "string"
                  },
                  "channel": {
                    "type": "string",
                    "enum": [
                      "email",
                      "whatsapp"
                    ]
                  }
                },
                "required": [
                  "channel"
                ]
              },
              "example": {
                "email": "patient@example.com",
                "phone": "+963944000000",
                "channel": "email"
              }
            }
          }
        },
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "201": {
            "$ref": "#/components/responses/CreatedEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/auth.js",
        "x-controller": "requestPasswordReset",
        "x-middlewares": [
          "middleware",
          "default",
          "requestPasswordReset"
        ]
      }
    },
    "/api/auth/resend-signup-otp": {
      "post": {
        "tags": [
          "Auth"
        ],
        "summary": "Resend Signup Otp",
        "description": "Resend Signup Otp\n\nPublic endpoint; no bearer token is required.\n\nNo role restriction is declared for this route.\n\nValidation: body: channel, email, phone.\n\nSource route file: src/routes/auth.js.",
        "operationId": "post_api_auth_resend_signup_otp",
        "security": [],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "additionalProperties": true,
                "properties": {
                  "channel": {
                    "type": "string",
                    "enum": [
                      "email",
                      "whatsapp"
                    ]
                  },
                  "email": {
                    "type": "string",
                    "format": "email"
                  },
                  "phone": {
                    "type": "string"
                  }
                },
                "required": [
                  "channel"
                ]
              },
              "example": {
                "channel": "email",
                "email": "patient@example.com",
                "phone": "+963944000000"
              }
            }
          }
        },
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "201": {
            "$ref": "#/components/responses/CreatedEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/auth.js",
        "x-controller": "resendSignupOtp",
        "x-middlewares": [
          "middleware",
          "default",
          "resendSignupOtp"
        ]
      }
    },
    "/api/auth/reset-password": {
      "post": {
        "tags": [
          "Auth"
        ],
        "summary": "Request Password Reset",
        "description": "Request Password Reset\n\nPublic endpoint; no bearer token is required.\n\nNo role restriction is declared for this route.\n\nValidation: body: email, phone, channel.\n\nSource route file: src/routes/auth.js.",
        "operationId": "post_api_auth_reset_password",
        "security": [],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "additionalProperties": true,
                "properties": {
                  "email": {
                    "type": "string",
                    "format": "email"
                  },
                  "phone": {
                    "type": "string"
                  },
                  "channel": {
                    "type": "string",
                    "enum": [
                      "email",
                      "whatsapp"
                    ]
                  }
                },
                "required": [
                  "channel"
                ]
              },
              "example": {
                "email": "patient@example.com",
                "phone": "+963944000000",
                "channel": "email"
              }
            }
          }
        },
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "201": {
            "$ref": "#/components/responses/CreatedEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/auth.js",
        "x-controller": "requestPasswordReset",
        "x-middlewares": [
          "middleware",
          "default",
          "requestPasswordReset"
        ]
      }
    },
    "/api/auth/signup": {
      "post": {
        "tags": [
          "Auth"
        ],
        "summary": "Sign Up",
        "description": "Sign Up\n\nPublic endpoint; no bearer token is required.\n\nNo role restriction is declared for this route.\n\nValidation: body: fullName, email, phone, channel, password, gender, dateOfBirth, address, role, specialization, specializationKey, customSpecializationText, medicalLicenseNumber, bio, education, clinicAddress, locationCity, locationCountry, consultationTypes, consultationTypes.*, clinicLat, clinicLng.\n\nSource route file: src/routes/auth.js.",
        "operationId": "post_api_auth_signup",
        "security": [],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "additionalProperties": true,
                "properties": {
                  "fullName": {
                    "type": "string"
                  },
                  "email": {
                    "type": "string",
                    "format": "email"
                  },
                  "phone": {
                    "type": "string"
                  },
                  "channel": {
                    "type": "string",
                    "enum": [
                      "email",
                      "whatsapp"
                    ]
                  },
                  "password": {
                    "type": "string",
                    "minLength": 6
                  },
                  "gender": {
                    "type": "string"
                  },
                  "dateOfBirth": {
                    "type": "string",
                    "format": "date"
                  },
                  "address": {
                    "type": "string"
                  },
                  "role": {
                    "type": "string",
                    "enum": [
                      "patient",
                      "doctor"
                    ]
                  },
                  "specialization": {
                    "type": "string"
                  },
                  "specializationKey": {
                    "type": "string",
                    "maxLength": 60
                  },
                  "customSpecializationText": {
                    "type": "string",
                    "maxLength": 120
                  },
                  "medicalLicenseNumber": {
                    "type": "string"
                  },
                  "bio": {
                    "type": "string"
                  },
                  "education": {
                    "type": "string"
                  },
                  "clinicAddress": {
                    "type": "string"
                  },
                  "locationCity": {
                    "type": "string"
                  },
                  "locationCountry": {
                    "type": "string"
                  },
                  "consultationTypes": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "additionalProperties": true
                    }
                  },
                  "clinicLat": {
                    "type": "number",
                    "minimum": -90,
                    "maximum": 90
                  },
                  "clinicLng": {
                    "type": "number",
                    "minimum": -180,
                    "maximum": 180
                  }
                },
                "required": [
                  "fullName",
                  "email",
                  "phone",
                  "channel",
                  "password",
                  "gender",
                  "dateOfBirth",
                  "address",
                  "role",
                  "medicalLicenseNumber",
                  "bio",
                  "education",
                  "clinicAddress"
                ]
              },
              "example": {
                "fullName": "string",
                "email": "patient@example.com",
                "phone": "+963944000000",
                "channel": "email",
                "password": "StrongPass123!",
                "gender": "string",
                "dateOfBirth": "2026-04-30",
                "address": "string",
                "role": "patient",
                "specialization": "string",
                "specializationKey": "string",
                "customSpecializationText": "string",
                "medicalLicenseNumber": "string",
                "bio": "string",
                "education": "string",
                "clinicAddress": "string",
                "locationCity": "string",
                "locationCountry": "string",
                "consultationTypes": [
                  "string"
                ],
                "clinicLat": -90,
                "clinicLng": -180
              }
            }
          }
        },
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "201": {
            "$ref": "#/components/responses/CreatedEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/auth.js",
        "x-controller": "signUp",
        "x-middlewares": [
          "middleware",
          "default",
          "signUp"
        ]
      }
    },
    "/api/auth/verify-otp": {
      "post": {
        "tags": [
          "Auth"
        ],
        "summary": "Verify Signup Otp",
        "description": "Verify Signup Otp\n\nPublic endpoint; no bearer token is required.\n\nNo role restriction is declared for this route.\n\nValidation: body: channel, email, phone, clientType, otp.\n\nSource route file: src/routes/auth.js.",
        "operationId": "post_api_auth_verify_otp",
        "security": [],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "additionalProperties": true,
                "properties": {
                  "channel": {
                    "type": "string",
                    "enum": [
                      "email",
                      "whatsapp"
                    ]
                  },
                  "email": {
                    "type": "string",
                    "format": "email"
                  },
                  "phone": {
                    "type": "string"
                  },
                  "clientType": {
                    "type": "string",
                    "enum": [
                      "patient_mobile",
                      "doctor_mobile",
                      "web"
                    ]
                  },
                  "otp": {
                    "type": "string",
                    "minLength": 6,
                    "maxLength": 6
                  }
                },
                "required": [
                  "channel",
                  "email",
                  "phone",
                  "otp"
                ]
              },
              "example": {
                "channel": "email",
                "email": "patient@example.com",
                "phone": "+963944000000",
                "clientType": "patient_mobile",
                "otp": "string"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Signup verification response. Approved accounts receive a session-backed access token, refresh token, and refresh expiry; doctors pending admin approval do not receive tokens.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AuthTokenEnvelope"
                },
                "examples": {
                  "authTokens": {
                    "$ref": "#/components/examples/AuthTokens"
                  }
                }
              }
            }
          },
          "201": {
            "description": "Signup verification response. Approved accounts receive a session-backed access token, refresh token, and refresh expiry; doctors pending admin approval do not receive tokens.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AuthTokenEnvelope"
                },
                "examples": {
                  "authTokens": {
                    "$ref": "#/components/examples/AuthTokens"
                  }
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/auth.js",
        "x-controller": "verifySignupOtp",
        "x-middlewares": [
          "middleware",
          "default",
          "verifySignupOtp"
        ]
      }
    },
    "/api/auth/verify-reset-otp": {
      "post": {
        "tags": [
          "Auth"
        ],
        "summary": "Verify Reset Otp",
        "description": "Verify Reset Otp\n\nPublic endpoint; no bearer token is required.\n\nNo role restriction is declared for this route.\n\nValidation: body: email, phone, otp.\n\nSource route file: src/routes/auth.js.",
        "operationId": "post_api_auth_verify_reset_otp",
        "security": [],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "additionalProperties": true,
                "properties": {
                  "email": {
                    "type": "string",
                    "format": "email"
                  },
                  "phone": {
                    "type": "string"
                  },
                  "otp": {
                    "type": "string",
                    "minLength": 6,
                    "maxLength": 6
                  }
                },
                "required": [
                  "otp"
                ]
              },
              "example": {
                "email": "patient@example.com",
                "phone": "+963944000000",
                "otp": "string"
              }
            }
          }
        },
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "201": {
            "$ref": "#/components/responses/CreatedEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/auth.js",
        "x-controller": "verifyResetOtp",
        "x-middlewares": [
          "middleware",
          "default",
          "verifyResetOtp"
        ]
      }
    },
    "/api/billing/dashboard": {
      "get": {
        "tags": [
          "Billing"
        ],
        "summary": "Get Billing Dashboard",
        "description": "Get Billing Dashboard\n\nRequires a bearer access token.\n\nNo role restriction is declared for this route.\n\nValidation: query: period, periodAnchor, groupBy, currency, dateFrom, dateTo, status, method, category.\n\nSource route file: src/routes/billing.js.",
        "operationId": "get_api_billing_dashboard",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          },
          {
            "name": "period",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "week",
                "month",
                "quarter",
                "year",
                "custom"
              ]
            }
          },
          {
            "name": "periodAnchor",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "format": "date-time"
            }
          },
          {
            "name": "groupBy",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "day",
                "week",
                "month",
                "quarter",
                "year"
              ]
            }
          },
          {
            "name": "currency",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "USD",
                "EUR",
                "GBP",
                "CAD",
                "AUD",
                "CHF",
                "JPY",
                "CNY",
                "INR",
                "SYP",
                "AED",
                "SAR",
                "QAR",
                "KWD",
                "JOD",
                "EGP",
                "TRY"
              ]
            }
          },
          {
            "name": "dateFrom",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "format": "date"
            }
          },
          {
            "name": "dateTo",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "format": "date"
            }
          },
          {
            "name": "status",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "draft",
                "issued",
                "partial",
                "paid",
                "overdue",
                "cancelled"
              ]
            }
          },
          {
            "name": "method",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "cash",
                "card",
                "bank_transfer",
                "insurance"
              ]
            }
          },
          {
            "name": "category",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/billing.js",
        "x-controller": "getBillingDashboard",
        "x-middlewares": [
          "default",
          "AsyncFunction",
          "normalizeBillingReportCurrencyQuery",
          "middleware",
          "getBillingDashboard"
        ]
      }
    },
    "/api/billing/expenses": {
      "get": {
        "tags": [
          "Billing"
        ],
        "summary": "List Expenses",
        "description": "List Expenses\n\nRequires a bearer access token.\n\nNo role restriction is declared for this route.\n\nValidation: query: category, search, page, limit, dateFrom, dateTo.\n\nSource route file: src/routes/billing.js.",
        "operationId": "get_api_billing_expenses",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          },
          {
            "name": "category",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "search",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "page",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer",
              "minimum": 1
            }
          },
          {
            "name": "limit",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer",
              "minimum": 1,
              "maximum": 100
            }
          },
          {
            "name": "dateFrom",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "format": "date"
            }
          },
          {
            "name": "dateTo",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "format": "date"
            }
          }
        ],
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/billing.js",
        "x-controller": "listExpenses",
        "x-middlewares": [
          "default",
          "AsyncFunction",
          "middleware",
          "listExpenses"
        ]
      },
      "post": {
        "tags": [
          "Billing"
        ],
        "summary": "Create Expense",
        "description": "Create Expense\n\nRequires a bearer access token.\n\nNo role restriction is declared for this route.\n\nValidation: body: category, amount, expenseDate, description.\n\nSource route file: src/routes/billing.js.",
        "operationId": "post_api_billing_expenses",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "additionalProperties": true,
                "properties": {
                  "category": {
                    "type": "string"
                  },
                  "amount": {
                    "type": "number",
                    "exclusiveMinimum": 0
                  },
                  "expenseDate": {
                    "type": "string",
                    "format": "date"
                  },
                  "description": {
                    "type": "string"
                  }
                },
                "required": [
                  "category"
                ]
              },
              "example": {
                "category": "string",
                "amount": 100,
                "expenseDate": "2026-04-30",
                "description": "string"
              }
            }
          }
        },
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "201": {
            "$ref": "#/components/responses/CreatedEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/billing.js",
        "x-controller": "createExpense",
        "x-middlewares": [
          "default",
          "AsyncFunction",
          "middleware",
          "createExpense"
        ]
      }
    },
    "/api/billing/invoices": {
      "get": {
        "tags": [
          "Billing"
        ],
        "summary": "List Invoices",
        "description": "List Invoices\n\nRequires a bearer access token.\n\nNo role restriction is declared for this route.\n\nValidation: query: status, sourceType, page, limit, patientId, dateFrom, dateTo.\n\nSource route file: src/routes/billing.js.",
        "operationId": "get_api_billing_invoices",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          },
          {
            "name": "status",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "draft",
                "issued",
                "partial",
                "paid",
                "overdue",
                "cancelled"
              ]
            }
          },
          {
            "name": "sourceType",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "manual",
                "visit"
              ]
            }
          },
          {
            "name": "page",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer",
              "minimum": 1
            }
          },
          {
            "name": "limit",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer",
              "minimum": 1,
              "maximum": 100
            }
          },
          {
            "name": "patientId",
            "in": "query",
            "required": false,
            "schema": {
              "$ref": "#/components/schemas/ObjectId"
            }
          },
          {
            "name": "dateFrom",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "format": "date"
            }
          },
          {
            "name": "dateTo",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "format": "date"
            }
          }
        ],
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/billing.js",
        "x-controller": "listInvoices",
        "x-middlewares": [
          "default",
          "AsyncFunction",
          "middleware",
          "listInvoices"
        ]
      },
      "post": {
        "tags": [
          "Billing"
        ],
        "summary": "Create Invoice",
        "description": "Create Invoice\n\nRequires a bearer access token.\n\nNo role restriction is declared for this route.\n\nValidation: body: status, sourceType, patientId, appointmentId, items, items.*.serviceNameSnapshot, items.*.billingServiceId, items.*.appointmentTypeId, items.*.quantity, items.*.unitPrice, discountPercent, dueAt, notes.\n\nSource route file: src/routes/billing.js.",
        "operationId": "post_api_billing_invoices",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          }
        ],
        "requestBody": {
          "required": false,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "additionalProperties": true,
                "properties": {
                  "status": {
                    "type": "string",
                    "enum": [
                      "draft",
                      "issued"
                    ]
                  },
                  "sourceType": {
                    "type": "string",
                    "enum": [
                      "manual",
                      "visit"
                    ]
                  },
                  "patientId": {
                    "$ref": "#/components/schemas/ObjectId"
                  },
                  "appointmentId": {
                    "$ref": "#/components/schemas/ObjectId"
                  },
                  "items": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "additionalProperties": true
                    }
                  },
                  "discountPercent": {
                    "type": "number",
                    "minimum": 0
                  },
                  "dueAt": {
                    "type": "string",
                    "format": "date-time"
                  },
                  "notes": {
                    "type": "string"
                  }
                }
              },
              "example": {
                "status": "draft",
                "sourceType": "manual",
                "patientId": "64f0c0000000000000000001",
                "appointmentId": "64f0c0000000000000000001",
                "items": [
                  "string"
                ],
                "discountPercent": 0,
                "dueAt": "2026-04-30T09:30:00.000Z",
                "notes": "string"
              }
            }
          }
        },
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "201": {
            "$ref": "#/components/responses/CreatedEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/billing.js",
        "x-controller": "createInvoice",
        "x-middlewares": [
          "default",
          "AsyncFunction",
          "middleware",
          "createInvoice"
        ]
      }
    },
    "/api/billing/invoices/{invoiceId}": {
      "get": {
        "tags": [
          "Billing"
        ],
        "summary": "Get Invoice Details",
        "description": "Get Invoice Details\n\nRequires a bearer access token.\n\nNo role restriction is declared for this route.\n\nValidation: params: invoiceId.\n\nSource route file: src/routes/billing.js.",
        "operationId": "get_api_billing_invoices_invoiceId",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          },
          {
            "name": "invoiceId",
            "in": "path",
            "required": true,
            "schema": {
              "$ref": "#/components/schemas/ObjectId"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Invoice detail with item snapshots, payment refund state, and refund rows.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/BillingInvoiceDetailEnvelope"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/billing.js",
        "x-controller": "getInvoiceDetails",
        "x-middlewares": [
          "default",
          "AsyncFunction",
          "middleware",
          "getInvoiceDetails"
        ]
      },
      "put": {
        "tags": [
          "Billing"
        ],
        "summary": "Update Invoice",
        "description": "Update Invoice\n\nRequires a bearer access token.\n\nNo role restriction is declared for this route.\n\nValidation: params: invoiceId; body: sourceType, patientId, appointmentId, items, items.*.serviceNameSnapshot, items.*.billingServiceId, items.*.appointmentTypeId, items.*.quantity, items.*.unitPrice, discountPercent, dueAt, notes.\n\nSource route file: src/routes/billing.js.",
        "operationId": "put_api_billing_invoices_invoiceId",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          },
          {
            "name": "invoiceId",
            "in": "path",
            "required": true,
            "schema": {
              "$ref": "#/components/schemas/ObjectId"
            }
          }
        ],
        "requestBody": {
          "required": false,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "additionalProperties": true,
                "properties": {
                  "sourceType": {
                    "type": "string",
                    "enum": [
                      "manual",
                      "visit"
                    ]
                  },
                  "patientId": {
                    "$ref": "#/components/schemas/ObjectId"
                  },
                  "appointmentId": {
                    "$ref": "#/components/schemas/ObjectId"
                  },
                  "items": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "additionalProperties": true
                    }
                  },
                  "discountPercent": {
                    "type": "number",
                    "minimum": 0
                  },
                  "dueAt": {
                    "type": "string",
                    "format": "date-time"
                  },
                  "notes": {
                    "type": "string"
                  }
                }
              },
              "example": {
                "sourceType": "manual",
                "patientId": "64f0c0000000000000000001",
                "appointmentId": "64f0c0000000000000000001",
                "items": [
                  "string"
                ],
                "discountPercent": 0,
                "dueAt": "2026-04-30T09:30:00.000Z",
                "notes": "string"
              }
            }
          }
        },
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/billing.js",
        "x-controller": "updateInvoice",
        "x-middlewares": [
          "default",
          "AsyncFunction",
          "middleware",
          "updateInvoice"
        ]
      }
    },
    "/api/billing/invoices/{invoiceId}/cancel": {
      "post": {
        "tags": [
          "Billing"
        ],
        "summary": "Cancel Invoice",
        "description": "Cancel Invoice\n\nRequires a bearer access token.\n\nNo role restriction is declared for this route.\n\nValidation: params: invoiceId; body: reason.\n\nSource route file: src/routes/billing.js.",
        "operationId": "post_api_billing_invoices_invoiceId_cancel",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          },
          {
            "name": "invoiceId",
            "in": "path",
            "required": true,
            "schema": {
              "$ref": "#/components/schemas/ObjectId"
            }
          }
        ],
        "requestBody": {
          "required": false,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "additionalProperties": true,
                "properties": {
                  "reason": {
                    "type": "string"
                  }
                }
              },
              "example": {
                "reason": "string"
              }
            }
          }
        },
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "201": {
            "$ref": "#/components/responses/CreatedEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/billing.js",
        "x-controller": "cancelInvoice",
        "x-middlewares": [
          "default",
          "AsyncFunction",
          "middleware",
          "cancelInvoice"
        ]
      }
    },
    "/api/billing/invoices/{invoiceId}/issue": {
      "post": {
        "tags": [
          "Billing"
        ],
        "summary": "Issue Invoice",
        "description": "Issue Invoice\n\nRequires a bearer access token.\n\nNo role restriction is declared for this route.\n\nValidation: params: invoiceId; body: dueAt.\n\nSource route file: src/routes/billing.js.",
        "operationId": "post_api_billing_invoices_invoiceId_issue",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          },
          {
            "name": "invoiceId",
            "in": "path",
            "required": true,
            "schema": {
              "$ref": "#/components/schemas/ObjectId"
            }
          }
        ],
        "requestBody": {
          "required": false,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "additionalProperties": true,
                "properties": {
                  "dueAt": {
                    "type": "string",
                    "format": "date-time"
                  }
                }
              },
              "example": {
                "dueAt": "2026-04-30T09:30:00.000Z"
              }
            }
          }
        },
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "201": {
            "$ref": "#/components/responses/CreatedEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/billing.js",
        "x-controller": "issueInvoice",
        "x-middlewares": [
          "default",
          "AsyncFunction",
          "middleware",
          "issueInvoice"
        ]
      }
    },
    "/api/billing/invoices/prefill/visit/{appointmentId}": {
      "get": {
        "tags": [
          "Billing"
        ],
        "summary": "Get Visit Invoice Prefill",
        "description": "Get Visit Invoice Prefill\n\nRequires a bearer access token.\n\nNo role restriction is declared for this route.\n\nValidation: params: appointmentId.\n\nSource route file: src/routes/billing.js.",
        "operationId": "get_api_billing_invoices_prefill_visit_appointmentId",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          },
          {
            "name": "appointmentId",
            "in": "path",
            "required": true,
            "schema": {
              "$ref": "#/components/schemas/ObjectId"
            }
          }
        ],
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/billing.js",
        "x-controller": "getVisitInvoicePrefill",
        "x-middlewares": [
          "default",
          "AsyncFunction",
          "middleware",
          "getVisitInvoicePrefill"
        ]
      }
    },
    "/api/billing/payments": {
      "get": {
        "tags": [
          "Billing"
        ],
        "summary": "List Payments",
        "description": "List Payments\n\nRequires a bearer access token.\n\nNo role restriction is declared for this route.\n\nValidation: query: invoiceId, method, page, limit, dateFrom, dateTo.\n\nSource route file: src/routes/billing.js.",
        "operationId": "get_api_billing_payments",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          },
          {
            "name": "invoiceId",
            "in": "query",
            "required": false,
            "schema": {
              "$ref": "#/components/schemas/ObjectId"
            }
          },
          {
            "name": "method",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "cash",
                "card",
                "bank_transfer",
                "insurance"
              ]
            }
          },
          {
            "name": "page",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer",
              "minimum": 1
            }
          },
          {
            "name": "limit",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer",
              "minimum": 1,
              "maximum": 100
            }
          },
          {
            "name": "dateFrom",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "format": "date"
            }
          },
          {
            "name": "dateTo",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "format": "date"
            }
          }
        ],
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/billing.js",
        "x-controller": "listPayments",
        "x-middlewares": [
          "default",
          "AsyncFunction",
          "middleware",
          "listPayments"
        ]
      },
      "post": {
        "tags": [
          "Billing"
        ],
        "summary": "Create Payment",
        "description": "Create Payment\n\nRequires a bearer access token.\n\nNo role restriction is declared for this route.\n\nValidation: body: invoiceId, amount, method, paidAt, note.\n\nSource route file: src/routes/billing.js.",
        "operationId": "post_api_billing_payments",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          }
        ],
        "requestBody": {
          "required": false,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "additionalProperties": true,
                "properties": {
                  "invoiceId": {
                    "$ref": "#/components/schemas/ObjectId"
                  },
                  "amount": {
                    "type": "number",
                    "exclusiveMinimum": 0
                  },
                  "method": {
                    "type": "string",
                    "enum": [
                      "cash",
                      "card",
                      "bank_transfer",
                      "insurance"
                    ]
                  },
                  "paidAt": {
                    "type": "string",
                    "format": "date-time"
                  },
                  "note": {
                    "type": "string"
                  }
                }
              },
              "example": {
                "invoiceId": "64f0c0000000000000000001",
                "amount": 100,
                "method": "cash",
                "paidAt": "2026-04-30T09:30:00.000Z",
                "note": "string"
              }
            }
          }
        },
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "201": {
            "$ref": "#/components/responses/CreatedEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/billing.js",
        "x-controller": "createPayment",
        "x-middlewares": [
          "default",
          "AsyncFunction",
          "middleware",
          "createPayment"
        ]
      }
    },
    "/api/billing/refunds": {
      "post": {
        "tags": [
          "Billing"
        ],
        "summary": "Create Refund",
        "description": "Create Refund\n\nRequires a bearer access token.\n\nNo role restriction is declared for this route.\n\nValidation: body: paymentId, amount, reason, refundedAt.\n\nSource route file: src/routes/billing.js.",
        "operationId": "post_api_billing_refunds",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "additionalProperties": true,
                "properties": {
                  "paymentId": {
                    "$ref": "#/components/schemas/ObjectId"
                  },
                  "amount": {
                    "type": "number",
                    "exclusiveMinimum": 0
                  },
                  "reason": {
                    "type": "string"
                  },
                  "refundedAt": {
                    "type": "string",
                    "format": "date-time"
                  }
                },
                "required": [
                  "reason"
                ]
              },
              "example": {
                "paymentId": "64f0c0000000000000000001",
                "amount": 100,
                "reason": "string",
                "refundedAt": "2026-04-30T09:30:00.000Z"
              }
            }
          }
        },
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "201": {
            "$ref": "#/components/responses/CreatedEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/billing.js",
        "x-controller": "createRefund",
        "x-middlewares": [
          "default",
          "AsyncFunction",
          "middleware",
          "createRefund"
        ]
      }
    },
    "/api/billing/reports": {
      "get": {
        "tags": [
          "Billing"
        ],
        "summary": "Get Billing Report",
        "description": "Get Billing Report\n\nRequires a bearer access token.\n\nNo role restriction is declared for this route.\n\nValidation: query: period, periodAnchor, groupBy, currency, dateFrom, dateTo, status, method, category.\n\nSource route file: src/routes/billing.js.",
        "operationId": "get_api_billing_reports",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          },
          {
            "name": "period",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "week",
                "month",
                "quarter",
                "year",
                "custom"
              ]
            }
          },
          {
            "name": "periodAnchor",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "format": "date-time"
            }
          },
          {
            "name": "groupBy",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "day",
                "week",
                "month",
                "quarter",
                "year"
              ]
            }
          },
          {
            "name": "currency",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "USD",
                "EUR",
                "GBP",
                "CAD",
                "AUD",
                "CHF",
                "JPY",
                "CNY",
                "INR",
                "SYP",
                "AED",
                "SAR",
                "QAR",
                "KWD",
                "JOD",
                "EGP",
                "TRY"
              ]
            }
          },
          {
            "name": "dateFrom",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "format": "date"
            }
          },
          {
            "name": "dateTo",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "format": "date"
            }
          },
          {
            "name": "status",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "draft",
                "issued",
                "partial",
                "paid",
                "overdue",
                "cancelled"
              ]
            }
          },
          {
            "name": "method",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "cash",
                "card",
                "bank_transfer",
                "insurance"
              ]
            }
          },
          {
            "name": "category",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/billing.js",
        "x-controller": "getBillingReport",
        "x-middlewares": [
          "default",
          "AsyncFunction",
          "normalizeBillingReportCurrencyQuery",
          "middleware",
          "getBillingReport"
        ]
      }
    },
    "/api/billing/reports/export.pdf": {
      "get": {
        "tags": [
          "Billing"
        ],
        "summary": "Async Function",
        "description": "Async Function\n\nRequires a bearer access token.\n\nNo role restriction is declared for this route.\n\nGenerates the billing report PDF, stores it in file storage, and returns a short-lived signed download URL.\n\nValidation: query: period, periodAnchor, groupBy, currency, dateFrom, dateTo, status, method, category.\n\nSource route file: src/routes/billing.js.",
        "operationId": "get_api_billing_reports_export_pdf",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          },
          {
            "name": "period",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "week",
                "month",
                "quarter",
                "year",
                "custom"
              ]
            }
          },
          {
            "name": "periodAnchor",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "format": "date-time"
            }
          },
          {
            "name": "groupBy",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "day",
                "week",
                "month",
                "quarter",
                "year"
              ]
            }
          },
          {
            "name": "currency",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "USD",
                "EUR",
                "GBP",
                "CAD",
                "AUD",
                "CHF",
                "JPY",
                "CNY",
                "INR",
                "SYP",
                "AED",
                "SAR",
                "QAR",
                "KWD",
                "JOD",
                "EGP",
                "TRY"
              ]
            }
          },
          {
            "name": "dateFrom",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "format": "date"
            }
          },
          {
            "name": "dateTo",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "format": "date"
            }
          },
          {
            "name": "status",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "draft",
                "issued",
                "partial",
                "paid",
                "overdue",
                "cancelled"
              ]
            }
          },
          {
            "name": "method",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "cash",
                "card",
                "bank_transfer",
                "insurance"
              ]
            }
          },
          {
            "name": "category",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "$ref": "#/components/responses/DownloadUrl"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/billing.js",
        "x-controller": "AsyncFunction",
        "x-middlewares": [
          "default",
          "AsyncFunction",
          "normalizeBillingReportCurrencyQuery",
          "middleware"
        ]
      }
    },
    "/api/billing/services": {
      "get": {
        "tags": [
          "Billing"
        ],
        "summary": "List Billing Services",
        "description": "List Billing Services\n\nRequires a bearer access token.\n\nNo role restriction is declared for this route.\n\nValidation: query: includeInactive, search, page, limit.\n\nSource route file: src/routes/billing.js.",
        "operationId": "get_api_billing_services",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          },
          {
            "name": "includeInactive",
            "in": "query",
            "required": false,
            "schema": {
              "type": "boolean"
            }
          },
          {
            "name": "search",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "page",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer",
              "minimum": 1
            }
          },
          {
            "name": "limit",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer",
              "minimum": 1,
              "maximum": 100
            }
          }
        ],
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/billing.js",
        "x-controller": "listBillingServices",
        "x-middlewares": [
          "default",
          "AsyncFunction",
          "middleware",
          "listBillingServices"
        ]
      },
      "post": {
        "tags": [
          "Billing"
        ],
        "summary": "Create Billing Service",
        "description": "Create Billing Service\n\nRequires a bearer access token.\n\nNo role restriction is declared for this route.\n\nValidation: body: name, defaultPrice, durationMinutes, description, appointmentTypeId, isActive.\n\nSource route file: src/routes/billing.js.",
        "operationId": "post_api_billing_services",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "additionalProperties": true,
                "properties": {
                  "name": {
                    "type": "string"
                  },
                  "defaultPrice": {
                    "type": "number",
                    "exclusiveMinimum": 0
                  },
                  "durationMinutes": {
                    "type": "integer",
                    "minimum": 1
                  },
                  "description": {
                    "type": "string"
                  },
                  "appointmentTypeId": {
                    "$ref": "#/components/schemas/ObjectId"
                  },
                  "isActive": {
                    "type": "boolean"
                  }
                },
                "required": [
                  "name"
                ]
              },
              "example": {
                "name": "string",
                "defaultPrice": 100,
                "durationMinutes": 1,
                "description": "string",
                "appointmentTypeId": "64f0c0000000000000000001",
                "isActive": true
              }
            }
          }
        },
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "201": {
            "$ref": "#/components/responses/CreatedEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/billing.js",
        "x-controller": "createBillingService",
        "x-middlewares": [
          "default",
          "AsyncFunction",
          "middleware",
          "createBillingService"
        ]
      }
    },
    "/api/billing/services/{serviceId}": {
      "get": {
        "tags": [
          "Billing"
        ],
        "summary": "Get Billing Service Details",
        "description": "Get Billing Service Details\n\nRequires a bearer access token.\n\nNo role restriction is declared for this route.\n\nValidation: params: serviceId.\n\nSource route file: src/routes/billing.js.",
        "operationId": "get_api_billing_services_serviceId",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          },
          {
            "name": "serviceId",
            "in": "path",
            "required": true,
            "schema": {
              "$ref": "#/components/schemas/ObjectId"
            }
          }
        ],
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/billing.js",
        "x-controller": "getBillingServiceDetails",
        "x-middlewares": [
          "default",
          "AsyncFunction",
          "middleware",
          "getBillingServiceDetails"
        ]
      },
      "put": {
        "tags": [
          "Billing"
        ],
        "summary": "Update Billing Service",
        "description": "Update Billing Service\n\nRequires a bearer access token.\n\nNo role restriction is declared for this route.\n\nValidation: params: serviceId; body: name, defaultPrice, durationMinutes, description, appointmentTypeId, isActive.\n\nSource route file: src/routes/billing.js.",
        "operationId": "put_api_billing_services_serviceId",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          },
          {
            "name": "serviceId",
            "in": "path",
            "required": true,
            "schema": {
              "$ref": "#/components/schemas/ObjectId"
            }
          }
        ],
        "requestBody": {
          "required": false,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "additionalProperties": true,
                "properties": {
                  "name": {
                    "type": "string"
                  },
                  "defaultPrice": {
                    "type": "number",
                    "exclusiveMinimum": 0
                  },
                  "durationMinutes": {
                    "type": "integer",
                    "minimum": 1
                  },
                  "description": {
                    "type": "string"
                  },
                  "appointmentTypeId": {
                    "$ref": "#/components/schemas/ObjectId"
                  },
                  "isActive": {
                    "type": "boolean"
                  }
                }
              },
              "example": {
                "name": "string",
                "defaultPrice": 100,
                "durationMinutes": 1,
                "description": "string",
                "appointmentTypeId": "64f0c0000000000000000001",
                "isActive": true
              }
            }
          }
        },
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/billing.js",
        "x-controller": "updateBillingService",
        "x-middlewares": [
          "default",
          "AsyncFunction",
          "middleware",
          "updateBillingService"
        ]
      },
      "delete": {
        "tags": [
          "Billing"
        ],
        "summary": "Delete Billing Service",
        "description": "Delete Billing Service\n\nRequires a bearer access token.\n\nNo role restriction is declared for this route.\n\nValidation: params: serviceId.\n\nSource route file: src/routes/billing.js.",
        "operationId": "delete_api_billing_services_serviceId",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          },
          {
            "name": "serviceId",
            "in": "path",
            "required": true,
            "schema": {
              "$ref": "#/components/schemas/ObjectId"
            }
          }
        ],
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/billing.js",
        "x-controller": "deleteBillingService",
        "x-middlewares": [
          "default",
          "AsyncFunction",
          "middleware",
          "deleteBillingService"
        ]
      }
    },
    "/api/billing/settings": {
      "get": {
        "tags": [
          "Billing"
        ],
        "summary": "Get Billing Settings",
        "description": "Get Billing Settings\n\nRequires a bearer access token.\n\nNo role restriction is declared for this route.\n\nValidation: no explicit express-validator fields.\n\nSource route file: src/routes/billing.js.",
        "operationId": "get_api_billing_settings",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          }
        ],
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/billing.js",
        "x-controller": "getBillingSettings",
        "x-middlewares": [
          "default",
          "AsyncFunction",
          "getBillingSettings"
        ]
      },
      "put": {
        "tags": [
          "Billing"
        ],
        "summary": "Update Billing Settings",
        "description": "Update Billing Settings\n\nRequires a bearer access token.\n\nNo role restriction is declared for this route.\n\nValidation: body: currency, taxEnabled, defaultTaxPercent, discountPresets, discountPresets.*, allowedPaymentMethods, allowedPaymentMethods.*, defaultInvoiceDueHours, unpaidAlertAfterHours, expenseCategories, expenseCategories.*.\n\nSource route file: src/routes/billing.js.",
        "operationId": "put_api_billing_settings",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          }
        ],
        "requestBody": {
          "required": false,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "additionalProperties": true,
                "properties": {
                  "currency": {
                    "type": "string",
                    "enum": [
                      "USD",
                      "EUR",
                      "GBP",
                      "CAD",
                      "AUD",
                      "CHF",
                      "JPY",
                      "CNY",
                      "INR",
                      "SYP",
                      "AED",
                      "SAR",
                      "QAR",
                      "KWD",
                      "JOD",
                      "EGP",
                      "TRY"
                    ]
                  },
                  "taxEnabled": {
                    "type": "boolean"
                  },
                  "defaultTaxPercent": {
                    "type": "number",
                    "minimum": 0
                  },
                  "discountPresets": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "additionalProperties": true
                    }
                  },
                  "allowedPaymentMethods": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "additionalProperties": true
                    }
                  },
                  "defaultInvoiceDueHours": {
                    "type": "integer",
                    "minimum": 1
                  },
                  "unpaidAlertAfterHours": {
                    "type": "integer",
                    "minimum": 1
                  },
                  "expenseCategories": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "additionalProperties": true
                    }
                  }
                }
              },
              "example": {
                "currency": "USD",
                "taxEnabled": true,
                "defaultTaxPercent": 0,
                "discountPresets": [
                  "string"
                ],
                "allowedPaymentMethods": [
                  "string"
                ],
                "defaultInvoiceDueHours": 1,
                "unpaidAlertAfterHours": 1,
                "expenseCategories": [
                  "string"
                ]
              }
            }
          }
        },
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/billing.js",
        "x-controller": "updateBillingSettings",
        "x-middlewares": [
          "default",
          "AsyncFunction",
          "middleware",
          "updateBillingSettings"
        ]
      }
    },
    "/api/content": {
      "get": {
        "tags": [
          "Content"
        ],
        "summary": "App List Content Items",
        "description": "App List Content Items\n\nRequires a bearer access token.\n\nAllowed roles: admin, doctor, patient, secretary.\n\nAdditional account-state, ownership, assignment, or delegated-access guards may apply before the controller runs.\n\nValidation: query: type, language, az, startsWith, search, tags, page, limit, cursor.\n\nSource route file: src/routes/content.js.",
        "operationId": "get_api_content",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          },
          {
            "name": "type",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "CONDITION",
                "SYMPTOM",
                "MEDICATION",
                "GENERAL_ADVICE",
                "NEWS",
                "SETTINGS_PAGE"
              ]
            }
          },
          {
            "name": "language",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "ar",
                "en"
              ]
            }
          },
          {
            "name": "az",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "minLength": 1,
              "maxLength": 1
            }
          },
          {
            "name": "startsWith",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "minLength": 1,
              "maxLength": 1
            }
          },
          {
            "name": "search",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "tags",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "page",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer",
              "minimum": 1
            }
          },
          {
            "name": "limit",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer",
              "minimum": 1,
              "maximum": 100
            }
          },
          {
            "name": "cursor",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-roles": [
          "admin",
          "doctor",
          "patient",
          "secretary"
        ],
        "x-source-route": "src/routes/content.js",
        "x-controller": "appListContentItems",
        "x-middlewares": [
          "default",
          "middleware",
          "enforcePatientReadAccess",
          "appListContentItems"
        ]
      }
    },
    "/api/content/{slug}": {
      "get": {
        "tags": [
          "Content"
        ],
        "summary": "App Get Content By Slug",
        "description": "App Get Content By Slug\n\nRequires a bearer access token.\n\nAllowed roles: admin, doctor, patient, secretary.\n\nAdditional account-state, ownership, assignment, or delegated-access guards may apply before the controller runs.\n\nValidation: params: slug; query: language.\n\nSource route file: src/routes/content.js.",
        "operationId": "get_api_content_slug",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          },
          {
            "name": "slug",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "language",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "ar",
                "en"
              ]
            }
          }
        ],
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-roles": [
          "admin",
          "doctor",
          "patient",
          "secretary"
        ],
        "x-source-route": "src/routes/content.js",
        "x-controller": "appGetContentBySlug",
        "x-middlewares": [
          "default",
          "middleware",
          "enforcePatientReadAccess",
          "appGetContentBySlug"
        ]
      }
    },
    "/api/content/search": {
      "get": {
        "tags": [
          "Content"
        ],
        "summary": "App Search Content",
        "description": "App Search Content\n\nRequires a bearer access token.\n\nAllowed roles: admin, doctor, patient, secretary.\n\nAdditional account-state, ownership, assignment, or delegated-access guards may apply before the controller runs.\n\nValidation: query: q, type, language, page, limit.\n\nSource route file: src/routes/content.js.",
        "operationId": "get_api_content_search",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          },
          {
            "name": "q",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "type",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "CONDITION",
                "SYMPTOM",
                "MEDICATION",
                "GENERAL_ADVICE",
                "NEWS",
                "SETTINGS_PAGE"
              ]
            }
          },
          {
            "name": "language",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "ar",
                "en"
              ]
            }
          },
          {
            "name": "page",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer",
              "minimum": 1
            }
          },
          {
            "name": "limit",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer",
              "minimum": 1,
              "maximum": 100
            }
          }
        ],
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-roles": [
          "admin",
          "doctor",
          "patient",
          "secretary"
        ],
        "x-source-route": "src/routes/content.js",
        "x-controller": "appSearchContent",
        "x-middlewares": [
          "default",
          "middleware",
          "enforcePatientReadAccess",
          "appSearchContent"
        ]
      }
    },
    "/api/devices/register": {
      "post": {
        "tags": [
          "Devices"
        ],
        "summary": "Register Device",
        "description": "Register Device\n\nRequires a bearer access token.\n\nNo role restriction is declared for this route.\n\nAdditional account-state, ownership, assignment, or delegated-access guards may apply before the controller runs.\n\nValidation: body: deviceToken, deviceType.\n\nSource route file: src/routes/device.js.",
        "operationId": "post_api_devices_register",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "additionalProperties": true,
                "properties": {
                  "deviceToken": {
                    "type": "string"
                  },
                  "deviceType": {
                    "type": "string",
                    "enum": [
                      "android",
                      "ios",
                      "web"
                    ]
                  }
                },
                "required": [
                  "deviceToken",
                  "deviceType"
                ]
              },
              "example": {
                "deviceToken": "string",
                "deviceType": "android"
              }
            }
          }
        },
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "201": {
            "$ref": "#/components/responses/CreatedEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/device.js",
        "x-controller": "registerDevice",
        "x-middlewares": [
          "default",
          "enforcePatientReadAccess",
          "middleware",
          "registerDevice"
        ]
      }
    },
    "/api/devices/unregister": {
      "post": {
        "tags": [
          "Devices"
        ],
        "summary": "Unregister Device",
        "description": "Unregister Device\n\nRequires a bearer access token.\n\nNo role restriction is declared for this route.\n\nAdditional account-state, ownership, assignment, or delegated-access guards may apply before the controller runs.\n\nValidation: body: deviceToken.\n\nSource route file: src/routes/device.js.",
        "operationId": "post_api_devices_unregister",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "additionalProperties": true,
                "properties": {
                  "deviceToken": {
                    "type": "string"
                  }
                },
                "required": [
                  "deviceToken"
                ]
              },
              "example": {
                "deviceToken": "string"
              }
            }
          }
        },
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "201": {
            "$ref": "#/components/responses/CreatedEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/device.js",
        "x-controller": "unregisterDevice",
        "x-middlewares": [
          "default",
          "enforcePatientReadAccess",
          "middleware",
          "unregisterDevice"
        ]
      }
    },
    "/api/doctors/{doctorId}/appointment-types": {
      "get": {
        "tags": [
          "Appointment Types"
        ],
        "summary": "List Doctor Appointment Types",
        "description": "List Doctor Appointment Types\n\nRequires a bearer access token.\n\nAllowed roles: doctor, secretary, admin.\n\nValidation: params: doctorId; query: includeInactive.\n\nSource route file: src/routes/appointmentType.js.",
        "operationId": "get_api_doctors_doctorId_appointment_types",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          },
          {
            "name": "doctorId",
            "in": "path",
            "required": true,
            "schema": {
              "$ref": "#/components/schemas/ObjectId"
            }
          },
          {
            "name": "includeInactive",
            "in": "query",
            "required": false,
            "schema": {
              "type": "boolean"
            }
          }
        ],
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-roles": [
          "doctor",
          "secretary",
          "admin"
        ],
        "x-source-route": "src/routes/appointmentType.js",
        "x-controller": "listDoctorAppointmentTypes",
        "x-middlewares": [
          "default",
          "middleware",
          "AsyncFunction",
          "listDoctorAppointmentTypes"
        ]
      }
    },
    "/api/doctors/{doctorId}/appointment-types/{appointmentTypeId}": {
      "get": {
        "tags": [
          "Appointment Types"
        ],
        "summary": "Get Doctor Appointment Type Details",
        "description": "Get Doctor Appointment Type Details\n\nRequires a bearer access token.\n\nAllowed roles: doctor, secretary, admin.\n\nValidation: params: doctorId, appointmentTypeId.\n\nSource route file: src/routes/appointmentType.js.",
        "operationId": "get_api_doctors_doctorId_appointment_types_appointmentTypeId",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          },
          {
            "name": "doctorId",
            "in": "path",
            "required": true,
            "schema": {
              "$ref": "#/components/schemas/ObjectId"
            }
          },
          {
            "name": "appointmentTypeId",
            "in": "path",
            "required": true,
            "schema": {
              "$ref": "#/components/schemas/ObjectId"
            }
          }
        ],
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-roles": [
          "doctor",
          "secretary",
          "admin"
        ],
        "x-source-route": "src/routes/appointmentType.js",
        "x-controller": "getDoctorAppointmentTypeDetails",
        "x-middlewares": [
          "default",
          "middleware",
          "AsyncFunction",
          "getDoctorAppointmentTypeDetails"
        ]
      }
    },
    "/api/doctors/{doctorId}/appointment-types/available": {
      "get": {
        "tags": [
          "Appointment Types"
        ],
        "summary": "List Available Doctor Appointment Types",
        "description": "List Available Doctor Appointment Types\n\nRequires a bearer access token.\n\nAllowed roles: patient, doctor, secretary, admin.\n\nValidation: params: doctorId.\n\nSource route file: src/routes/appointmentType.js.",
        "operationId": "get_api_doctors_doctorId_appointment_types_available",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          },
          {
            "name": "doctorId",
            "in": "path",
            "required": true,
            "schema": {
              "$ref": "#/components/schemas/ObjectId"
            }
          }
        ],
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-roles": [
          "patient",
          "doctor",
          "secretary",
          "admin"
        ],
        "x-source-route": "src/routes/appointmentType.js",
        "x-controller": "listAvailableDoctorAppointmentTypes",
        "x-middlewares": [
          "default",
          "middleware",
          "enforcePatientActiveStatus",
          "AsyncFunction",
          "listAvailableDoctorAppointmentTypes"
        ]
      }
    },
    "/api/doctors/{doctorId}/reviews": {
      "get": {
        "tags": [
          "Doctors"
        ],
        "summary": "List Doctor Reviews",
        "description": "List Doctor Reviews\n\nPublic endpoint; no bearer token is required.\n\nNo role restriction is declared for this route.\n\nValidation: params: doctorId; query: page, limit.\n\nSource route file: src/routes/doctor.js.",
        "operationId": "get_api_doctors_doctorId_reviews",
        "security": [],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          },
          {
            "name": "doctorId",
            "in": "path",
            "required": true,
            "schema": {
              "$ref": "#/components/schemas/ObjectId"
            }
          },
          {
            "name": "page",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer",
              "minimum": 1
            }
          },
          {
            "name": "limit",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer",
              "minimum": 1,
              "maximum": 100
            }
          }
        ],
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/doctor.js",
        "x-controller": "listDoctorReviews",
        "x-middlewares": [
          "middleware",
          "default",
          "listDoctorReviews"
        ]
      }
    },
    "/api/doctors/{doctorId}/schedule": {
      "get": {
        "tags": [
          "Slots"
        ],
        "summary": "Get Doctor Weekly Schedule",
        "description": "Get Doctor Weekly Schedule\n\nRequires a bearer access token.\n\nAllowed roles: doctor, secretary.\n\nAdditional account-state, ownership, assignment, or delegated-access guards may apply before the controller runs.\n\nValidation: no explicit express-validator fields.\n\nSource route file: src/routes/slot.js.",
        "operationId": "get_api_doctors_doctorId_schedule",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          },
          {
            "name": "doctorId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-roles": [
          "doctor",
          "secretary"
        ],
        "x-source-route": "src/routes/slot.js",
        "x-controller": "getDoctorWeeklySchedule",
        "x-middlewares": [
          "default",
          "middleware",
          "doctorScheduleGuard",
          "getDoctorWeeklySchedule"
        ]
      }
    },
    "/api/doctors/{doctorId}/slots": {
      "get": {
        "tags": [
          "Slots"
        ],
        "summary": "Get Doctor Daily Schedule",
        "description": "Get Doctor Daily Schedule\n\nRequires a bearer access token.\n\nAllowed roles: patient, doctor, secretary.\n\nValidation: params: doctorId; query: date, type, page, limit.\n\nSource route file: src/routes/slot.js.",
        "operationId": "get_api_doctors_doctorId_slots",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          },
          {
            "name": "doctorId",
            "in": "path",
            "required": true,
            "schema": {
              "$ref": "#/components/schemas/ObjectId"
            }
          },
          {
            "name": "date",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string",
              "format": "date"
            }
          },
          {
            "name": "type",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "free",
                "booked",
                "all"
              ]
            }
          },
          {
            "name": "page",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer",
              "minimum": 1
            }
          },
          {
            "name": "limit",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer",
              "minimum": 1
            }
          }
        ],
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-roles": [
          "patient",
          "doctor",
          "secretary"
        ],
        "x-source-route": "src/routes/slot.js",
        "x-controller": "getDoctorDailySchedule",
        "x-middlewares": [
          "default",
          "middleware",
          "enforcePatientActiveStatus",
          "AsyncFunction",
          "getDoctorDailySchedule"
        ]
      }
    },
    "/api/doctors/account-deletion/recovery/start": {
      "post": {
        "tags": [
          "Doctors"
        ],
        "summary": "Start Doctor Recovery Otp",
        "description": "Start Doctor Recovery Otp\n\nPublic endpoint; no bearer token is required.\n\nNo role restriction is declared for this route.\n\nValidation: body: channel, email, phone.\n\nSource route file: src/routes/doctor.js.",
        "operationId": "post_api_doctors_account_deletion_recovery_start",
        "security": [],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "additionalProperties": true,
                "properties": {
                  "channel": {
                    "type": "string",
                    "enum": [
                      "email",
                      "whatsapp"
                    ]
                  },
                  "email": {
                    "type": "string",
                    "format": "email"
                  },
                  "phone": {
                    "type": "string"
                  }
                },
                "required": [
                  "channel"
                ]
              },
              "example": {
                "channel": "email",
                "email": "patient@example.com",
                "phone": "+963944000000"
              }
            }
          }
        },
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "201": {
            "$ref": "#/components/responses/CreatedEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/doctor.js",
        "x-controller": "startDoctorRecoveryOtp",
        "x-middlewares": [
          "middleware",
          "default",
          "startDoctorRecoveryOtp"
        ]
      }
    },
    "/api/doctors/account-deletion/recovery/verify": {
      "post": {
        "tags": [
          "Doctors"
        ],
        "summary": "Verify Doctor Recovery Otp",
        "description": "Verify Doctor Recovery Otp\n\nPublic endpoint; no bearer token is required.\n\nNo role restriction is declared for this route.\n\nValidation: body: channel, email, phone, otp.\n\nSource route file: src/routes/doctor.js.",
        "operationId": "post_api_doctors_account_deletion_recovery_verify",
        "security": [],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "additionalProperties": true,
                "properties": {
                  "channel": {
                    "type": "string",
                    "enum": [
                      "email",
                      "whatsapp"
                    ]
                  },
                  "email": {
                    "type": "string",
                    "format": "email"
                  },
                  "phone": {
                    "type": "string"
                  },
                  "otp": {
                    "type": "string",
                    "minLength": 6,
                    "maxLength": 6
                  }
                },
                "required": [
                  "channel",
                  "otp"
                ]
              },
              "example": {
                "channel": "email",
                "email": "patient@example.com",
                "phone": "+963944000000",
                "otp": "string"
              }
            }
          }
        },
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "201": {
            "$ref": "#/components/responses/CreatedEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/doctor.js",
        "x-controller": "verifyDoctorRecoveryOtp",
        "x-middlewares": [
          "middleware",
          "default",
          "verifyDoctorRecoveryOtp"
        ]
      }
    },
    "/api/doctors/account-deletion/restore-request/start": {
      "post": {
        "tags": [
          "Doctors"
        ],
        "summary": "Start Doctor Restore Request Otp",
        "description": "Start Doctor Restore Request Otp\n\nPublic endpoint; no bearer token is required.\n\nNo role restriction is declared for this route.\n\nValidation: body: channel, email, phone.\n\nSource route file: src/routes/doctor.js.",
        "operationId": "post_api_doctors_account_deletion_restore_request_start",
        "security": [],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "additionalProperties": true,
                "properties": {
                  "channel": {
                    "type": "string",
                    "enum": [
                      "email",
                      "whatsapp"
                    ]
                  },
                  "email": {
                    "type": "string",
                    "format": "email"
                  },
                  "phone": {
                    "type": "string"
                  }
                },
                "required": [
                  "channel"
                ]
              },
              "example": {
                "channel": "email",
                "email": "patient@example.com",
                "phone": "+963944000000"
              }
            }
          }
        },
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "201": {
            "$ref": "#/components/responses/CreatedEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/doctor.js",
        "x-controller": "startDoctorRestoreRequestOtp",
        "x-middlewares": [
          "middleware",
          "default",
          "startDoctorRestoreRequestOtp"
        ]
      }
    },
    "/api/doctors/account-deletion/restore-request/verify": {
      "post": {
        "tags": [
          "Doctors"
        ],
        "summary": "Verify Doctor Restore Request Otp",
        "description": "Verify Doctor Restore Request Otp\n\nPublic endpoint; no bearer token is required.\n\nNo role restriction is declared for this route.\n\nValidation: body: channel, email, phone, otp, reason.\n\nSource route file: src/routes/doctor.js.",
        "operationId": "post_api_doctors_account_deletion_restore_request_verify",
        "security": [],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "additionalProperties": true,
                "properties": {
                  "channel": {
                    "type": "string",
                    "enum": [
                      "email",
                      "whatsapp"
                    ]
                  },
                  "email": {
                    "type": "string",
                    "format": "email"
                  },
                  "phone": {
                    "type": "string"
                  },
                  "otp": {
                    "type": "string",
                    "minLength": 6,
                    "maxLength": 6
                  },
                  "reason": {
                    "type": "string",
                    "maxLength": 500
                  }
                },
                "required": [
                  "channel",
                  "otp"
                ]
              },
              "example": {
                "channel": "email",
                "email": "patient@example.com",
                "phone": "+963944000000",
                "otp": "string",
                "reason": "string"
              }
            }
          }
        },
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "201": {
            "$ref": "#/components/responses/CreatedEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/doctor.js",
        "x-controller": "verifyDoctorRestoreRequestOtp",
        "x-middlewares": [
          "middleware",
          "default",
          "verifyDoctorRestoreRequestOtp"
        ]
      }
    },
    "/api/doctors/internal/directory": {
      "get": {
        "tags": [
          "Doctors"
        ],
        "summary": "Internal Doctor Directory",
        "description": "Internal Doctor Directory\n\nRequires a bearer access token.\n\nAllowed roles: doctor, secretary.\n\nValidation: query: search, specialization, city, country, consultationType, minRating, page, limit, lat, lng, radiusKm.\n\nSource route file: src/routes/doctor.js.",
        "operationId": "get_api_doctors_internal_directory",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          },
          {
            "name": "search",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "specialization",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "city",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "country",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "consultationType",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "online",
                "offline"
              ]
            }
          },
          {
            "name": "minRating",
            "in": "query",
            "required": false,
            "schema": {
              "type": "number",
              "minimum": 0,
              "maximum": 5
            }
          },
          {
            "name": "page",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer",
              "minimum": 1
            }
          },
          {
            "name": "limit",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer",
              "minimum": 1,
              "maximum": 100
            }
          },
          {
            "name": "lat",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "lng",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "radiusKm",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-roles": [
          "doctor",
          "secretary"
        ],
        "x-source-route": "src/routes/doctor.js",
        "x-controller": "internalDoctorDirectory",
        "x-middlewares": [
          "default",
          "middleware",
          "internalDoctorDirectory"
        ]
      }
    },
    "/api/doctors/patients": {
      "get": {
        "tags": [
          "Doctors"
        ],
        "summary": "Get Own Patients",
        "description": "Get Own Patients\n\nRequires a bearer access token.\n\nAllowed roles: doctor, secretary.\n\nAdditional account-state, ownership, assignment, or delegated-access guards may apply before the controller runs.\n\nPatients are returned from the explicit doctor-patient link and from appointment history fallback, so patients with booked appointments remain discoverable in the doctor dashboard.\n\nValidation: query: name, search, diagnosis, account_status, from, to, page, limit.\n\nSource route file: src/routes/doctor.js.",
        "operationId": "get_api_doctors_patients",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          },
          {
            "name": "name",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "search",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "diagnosis",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "account_status",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "active",
                "temporary",
                "suspended",
                "locked",
                "all"
              ]
            }
          },
          {
            "name": "from",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "format": "date-time"
            }
          },
          {
            "name": "to",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "format": "date-time"
            }
          },
          {
            "name": "page",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer",
              "minimum": 1
            }
          },
          {
            "name": "limit",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer",
              "minimum": 1,
              "maximum": 100
            }
          },
          {
            "name": "account_status",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "active",
                "temporary",
                "suspended",
                "locked",
                "all"
              ]
            }
          }
        ],
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-roles": [
          "doctor",
          "secretary"
        ],
        "x-source-route": "src/routes/doctor.js",
        "x-controller": "getOwnPatients",
        "x-middlewares": [
          "default",
          "middleware",
          "loadUserModelsGuard",
          "AsyncFunction",
          "getOwnPatients"
        ]
      }
    },
    "/api/doctors/patients/temp": {
      "post": {
        "tags": [
          "Doctors"
        ],
        "summary": "Create Temporary Patient",
        "description": "Create Temporary Patient\n\nRequires a bearer access token.\n\nAllowed roles: doctor, secretary.\n\nAdditional account-state, ownership, assignment, or delegated-access guards may apply before the controller runs.\n\nValidation: body: fullName, email, phone, channel.\n\nSource route file: src/routes/doctor.js.",
        "operationId": "post_api_doctors_patients_temp",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "additionalProperties": true,
                "properties": {
                  "fullName": {
                    "type": "string"
                  },
                  "email": {
                    "type": "string",
                    "format": "email"
                  },
                  "phone": {
                    "type": "string"
                  },
                  "channel": {
                    "type": "string",
                    "enum": [
                      "email",
                      "whatsapp",
                      "none"
                    ]
                  }
                },
                "required": [
                  "fullName",
                  "email",
                  "phone"
                ]
              },
              "example": {
                "fullName": "string",
                "email": "patient@example.com",
                "phone": "+963944000000",
                "channel": "email"
              }
            }
          }
        },
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "201": {
            "$ref": "#/components/responses/CreatedEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-roles": [
          "doctor",
          "secretary"
        ],
        "x-source-route": "src/routes/doctor.js",
        "x-controller": "createTemporaryPatient",
        "x-middlewares": [
          "default",
          "middleware",
          "loadUserModelsGuard",
          "AsyncFunction",
          "createTemporaryPatient"
        ]
      }
    },
    "/api/documents/generate": {
      "post": {
        "tags": [
          "Documents"
        ],
        "summary": "Async Function",
        "description": "Async Function\n\nRequires a bearer access token.\n\nAllowed roles: patient, doctor, secretary.\n\nAdditional account-state, ownership, assignment, or delegated-access guards may apply before the controller runs.\n\nReturns a binary PDF response.\n\nValidation: body: sourceType, sourceId.\n\nSource route file: src/routes/documents.js.",
        "operationId": "post_api_documents_generate",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "additionalProperties": true,
                "properties": {
                  "sourceType": {
                    "type": "string",
                    "enum": [
                      "order",
                      "imaging_order",
                      "prescription",
                      "diagnosis"
                    ]
                  },
                  "sourceId": {
                    "$ref": "#/components/schemas/ObjectId"
                  }
                },
                "required": [
                  "sourceType",
                  "sourceId"
                ]
              },
              "example": {
                "sourceType": "order",
                "sourceId": "64f0c0000000000000000001"
              }
            }
          }
        },
        "responses": {
          "200": {
            "$ref": "#/components/responses/PdfBinary"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-roles": [
          "patient",
          "doctor",
          "secretary"
        ],
        "x-source-route": "src/routes/documents.js",
        "x-controller": "AsyncFunction",
        "x-middlewares": [
          "default",
          "middleware",
          "loadUserModelsGuard",
          "enforcePatientActiveStatus",
          "AsyncFunction"
        ]
      }
    },
    "/api/facilities/types": {
      "get": {
        "tags": [
          "Facilities"
        ],
        "summary": "List Facility Types Handler",
        "description": "List Facility Types Handler\n\nPublic endpoint; no bearer token is required.\n\nNo role restriction is declared for this route.\n\nValidation: no explicit express-validator fields.\n\nSource route file: src/routes/facility.js.",
        "operationId": "get_api_facilities_types",
        "security": [],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          }
        ],
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/facility.js",
        "x-controller": "listFacilityTypesHandler",
        "x-middlewares": [
          "listFacilityTypesHandler"
        ]
      }
    },
    "/api/health": {
      "get": {
        "tags": [
          "Health"
        ],
        "summary": "Send Readiness Status",
        "description": "Send Readiness Status\n\nPublic endpoint; no bearer token is required.\n\nNo role restriction is declared for this route.\n\nValidation: no explicit express-validator fields.\n\nSource route file: src/routes/index.js.",
        "operationId": "get_api_health",
        "security": [],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          }
        ],
        "responses": {
          "200": {
            "$ref": "#/components/responses/Health"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/index.js",
        "x-controller": "sendReadinessStatus",
        "x-middlewares": [
          "sendReadinessStatus"
        ]
      }
    },
    "/api/health/live": {
      "get": {
        "tags": [
          "Health"
        ],
        "summary": "Get Liveness Status",
        "description": "Get Liveness Status\n\nPublic endpoint; no bearer token is required.\n\nNo role restriction is declared for this route.\n\nValidation: no explicit express-validator fields.\n\nSource route file: src/routes/index.js.",
        "operationId": "get_api_health_live",
        "security": [],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          }
        ],
        "responses": {
          "200": {
            "$ref": "#/components/responses/Health"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/index.js",
        "x-controller": "getLivenessStatus",
        "x-middlewares": [
          "getLivenessStatus"
        ]
      }
    },
    "/api/health/ready": {
      "get": {
        "tags": [
          "Health"
        ],
        "summary": "Send Readiness Status",
        "description": "Send Readiness Status\n\nPublic endpoint; no bearer token is required.\n\nNo role restriction is declared for this route.\n\nValidation: no explicit express-validator fields.\n\nSource route file: src/routes/index.js.",
        "operationId": "get_api_health_ready",
        "security": [],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          }
        ],
        "responses": {
          "200": {
            "$ref": "#/components/responses/Health"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/index.js",
        "x-controller": "sendReadinessStatus",
        "x-middlewares": [
          "sendReadinessStatus"
        ]
      }
    },
    "/api/medical-library/tests": {
      "get": {
        "tags": [
          "Medical Library"
        ],
        "summary": "App List Medical Library Tests",
        "description": "App List Medical Library Tests\n\nRequires a bearer access token.\n\nAllowed roles: admin, doctor, patient, secretary.\n\nAdditional account-state, ownership, assignment, or delegated-access guards may apply before the controller runs.\n\nValidation: query: search, q, category, priorityLevel, az, startsWith, page, limit, sort.\n\nSource route file: src/routes/medicalLibrary.js.",
        "operationId": "get_api_medical_library_tests",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          },
          {
            "name": "search",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "q",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "category",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "priorityLevel",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "low",
                "normal",
                "high",
                "critical"
              ]
            }
          },
          {
            "name": "az",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "minLength": 1,
              "maxLength": 1
            }
          },
          {
            "name": "startsWith",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "minLength": 1,
              "maxLength": 1
            }
          },
          {
            "name": "page",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer",
              "minimum": 1
            }
          },
          {
            "name": "limit",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer",
              "minimum": 1,
              "maximum": 100
            }
          },
          {
            "name": "sort",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-roles": [
          "admin",
          "doctor",
          "patient",
          "secretary"
        ],
        "x-source-route": "src/routes/medicalLibrary.js",
        "x-controller": "appListMedicalLibraryTests",
        "x-middlewares": [
          "default",
          "middleware",
          "enforcePatientReadAccess",
          "appListMedicalLibraryTests"
        ]
      }
    },
    "/api/medical-library/tests/{id}": {
      "get": {
        "tags": [
          "Medical Library"
        ],
        "summary": "App Get Medical Library Test",
        "description": "App Get Medical Library Test\n\nRequires a bearer access token.\n\nAllowed roles: admin, doctor, patient, secretary.\n\nAdditional account-state, ownership, assignment, or delegated-access guards may apply before the controller runs.\n\nValidation: params: id.\n\nSource route file: src/routes/medicalLibrary.js.",
        "operationId": "get_api_medical_library_tests_id",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          },
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "$ref": "#/components/schemas/ObjectId"
            }
          }
        ],
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-roles": [
          "admin",
          "doctor",
          "patient",
          "secretary"
        ],
        "x-source-route": "src/routes/medicalLibrary.js",
        "x-controller": "appGetMedicalLibraryTest",
        "x-middlewares": [
          "default",
          "middleware",
          "enforcePatientReadAccess",
          "appGetMedicalLibraryTest"
        ]
      }
    },
    "/api/meta/doctor-specializations": {
      "get": {
        "tags": [
          "Meta"
        ],
        "summary": "Get Doctor Specializations",
        "description": "Get Doctor Specializations\n\nPublic endpoint; no bearer token is required.\n\nNo role restriction is declared for this route.\n\nValidation: no explicit express-validator fields.\n\nSource route file: src/routes/meta.js.",
        "operationId": "get_api_meta_doctor_specializations",
        "security": [],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          }
        ],
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/meta.js",
        "x-controller": "getDoctorSpecializations",
        "x-middlewares": [
          "getDoctorSpecializations"
        ]
      }
    },
    "/api/meta/health-profile-options": {
      "get": {
        "tags": [
          "Meta"
        ],
        "summary": "Get Health Profile Options",
        "description": "Get Health Profile Options\n\nRequires a bearer access token.\n\nAllowed roles: admin, doctor, patient, secretary, data_entry.\n\nValidation: no explicit express-validator fields.\n\nSource route file: src/routes/meta.js.",
        "operationId": "get_api_meta_health_profile_options",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          }
        ],
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-roles": [
          "admin",
          "doctor",
          "patient",
          "secretary",
          "data_entry"
        ],
        "x-source-route": "src/routes/meta.js",
        "x-controller": "getHealthProfileOptions",
        "x-middlewares": [
          "default",
          "middleware",
          "getHealthProfileOptions"
        ]
      }
    },
    "/api/new-test1": {
      "get": {
        "tags": [
          "Test"
        ],
        "summary": "Get New Test",
        "description": "Get New Test\n\nPublic endpoint; no bearer token is required.\n\nNo role restriction is declared for this route.\n\nValidation: no explicit express-validator fields.\n\nSource route file: src/routes/newTest.js.",
        "operationId": "get_api_new_test1",
        "security": [],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          }
        ],
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/newTest.js",
        "x-controller": "getNewTest",
        "x-middlewares": [
          "getNewTest"
        ]
      }
    },
    "/api/notifications": {
      "get": {
        "tags": [
          "Notifications"
        ],
        "summary": "List Notifications",
        "description": "List Notifications\n\nRequires a bearer access token.\n\nNo role restriction is declared for this route.\n\nAdditional account-state, ownership, assignment, or delegated-access guards may apply before the controller runs.\n\nValidation: query: page, limit, unread_only.\n\nSource route file: src/routes/notification.js.",
        "operationId": "get_api_notifications",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          },
          {
            "name": "page",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer",
              "minimum": 1
            }
          },
          {
            "name": "limit",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer",
              "minimum": 1,
              "maximum": 100
            }
          },
          {
            "name": "unread_only",
            "in": "query",
            "required": false,
            "schema": {
              "type": "boolean"
            }
          }
        ],
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/notification.js",
        "x-controller": "listNotifications",
        "x-middlewares": [
          "default",
          "enforcePatientReadAccess",
          "middleware",
          "listNotifications"
        ]
      }
    },
    "/api/notifications/{id}/read": {
      "patch": {
        "tags": [
          "Notifications"
        ],
        "summary": "Mark Notification Read",
        "description": "Mark Notification Read\n\nRequires a bearer access token.\n\nNo role restriction is declared for this route.\n\nValidation: params: id.\n\nSource route file: src/routes/notification.js.",
        "operationId": "patch_api_notifications_id_read",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          },
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "$ref": "#/components/schemas/ObjectId"
            }
          }
        ],
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/notification.js",
        "x-controller": "markNotificationRead",
        "x-middlewares": [
          "default",
          "enforcePatientActiveStatus",
          "middleware",
          "markNotificationRead"
        ]
      }
    },
    "/api/notifications/read-all": {
      "patch": {
        "tags": [
          "Notifications"
        ],
        "summary": "Mark All Notifications Read",
        "description": "Mark All Notifications Read\n\nRequires a bearer access token.\n\nNo role restriction is declared for this route.\n\nValidation: no explicit express-validator fields.\n\nSource route file: src/routes/notification.js.",
        "operationId": "patch_api_notifications_read_all",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          }
        ],
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/notification.js",
        "x-controller": "markAllNotificationsRead",
        "x-middlewares": [
          "default",
          "enforcePatientActiveStatus",
          "markAllNotificationsRead"
        ]
      }
    },
    "/api/notifications/test": {
      "post": {
        "tags": [
          "Notifications"
        ],
        "summary": "Send Test Notification",
        "description": "Send Test Notification\n\nRequires a bearer access token.\n\nNo role restriction is declared for this route.\n\nValidation: body: type, titleKey, bodyKey, titleArgs, bodyArgs, title, body, data.\n\nSource route file: src/routes/notification.js.",
        "operationId": "post_api_notifications_test",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          }
        ],
        "requestBody": {
          "required": false,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "additionalProperties": true,
                "properties": {
                  "type": {
                    "type": "string"
                  },
                  "titleKey": {
                    "type": "string"
                  },
                  "bodyKey": {
                    "type": "string"
                  },
                  "titleArgs": {
                    "type": "string"
                  },
                  "bodyArgs": {
                    "type": "string"
                  },
                  "title": {
                    "type": "string"
                  },
                  "body": {
                    "type": "string"
                  },
                  "data": {
                    "type": "string"
                  }
                }
              },
              "example": {
                "type": "string",
                "titleKey": "string",
                "bodyKey": "string",
                "titleArgs": "string",
                "bodyArgs": "string",
                "title": "string",
                "body": "string",
                "data": "string"
              }
            }
          }
        },
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "201": {
            "$ref": "#/components/responses/CreatedEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/notification.js",
        "x-controller": "sendTestNotification",
        "x-middlewares": [
          "default",
          "enforcePatientActiveStatus",
          "middleware",
          "sendTestNotification"
        ]
      }
    },
    "/api/notifications/test/status": {
      "get": {
        "tags": [
          "Notifications"
        ],
        "summary": "Get Test Notification Status",
        "description": "Get Test Notification Status\n\nRequires a bearer access token.\n\nNo role restriction is declared for this route.\n\nValidation: no explicit express-validator fields.\n\nSource route file: src/routes/notification.js.",
        "operationId": "get_api_notifications_test_status",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          }
        ],
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/notification.js",
        "x-controller": "getTestNotificationStatus",
        "x-middlewares": [
          "default",
          "enforcePatientActiveStatus",
          "getTestNotificationStatus"
        ]
      }
    },
    "/api/patients/{patientId}/files": {
      "get": {
        "tags": [
          "Patient Files"
        ],
        "summary": "List Patient Files",
        "description": "List Patient Files\n\nRequires a bearer access token.\n\nAllowed roles: patient, doctor, secretary.\n\nAdditional account-state, ownership, assignment, or delegated-access guards may apply before the controller runs.\n\nValidation: params: patientId; query: page, limit, archived, search, category, subcategory, mimeCategory, clinicalContext, sourceModule, uploadedByRole, visibilityScope, appointmentId, tags, serviceDateFrom, serviceDateTo, sortBy, sortOrder.\n\nSource route file: src/routes/patientFiles.js.",
        "operationId": "get_api_patients_patientId_files",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          },
          {
            "name": "patientId",
            "in": "path",
            "required": true,
            "schema": {
              "$ref": "#/components/schemas/ObjectId"
            }
          },
          {
            "name": "page",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer",
              "minimum": 1
            }
          },
          {
            "name": "limit",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer",
              "minimum": 1,
              "maximum": 100
            }
          },
          {
            "name": "archived",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "true",
                "false"
              ]
            }
          },
          {
            "name": "search",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "category",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "lab_result",
                "radiology",
                "prescription",
                "medical_report",
                "discharge_summary",
                "referral",
                "consent_form",
                "insurance_document",
                "identity_document",
                "appointment_attachment",
                "clinical_photo",
                "invoice",
                "other"
              ]
            }
          },
          {
            "name": "subcategory",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "minLength": 1,
              "maxLength": 64
            }
          },
          {
            "name": "mimeCategory",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "image",
                "pdf",
                "document",
                "spreadsheet",
                "other"
              ]
            }
          },
          {
            "name": "clinicalContext",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "general_record",
                "appointment",
                "complaint",
                "order",
                "consultation",
                "admission",
                "discharge"
              ]
            }
          },
          {
            "name": "sourceModule",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "patient_files",
                "appointment_files",
                "orders",
                "complaints",
                "legacy_patient_flow",
                "generated_report"
              ]
            }
          },
          {
            "name": "uploadedByRole",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "patient",
                "doctor",
                "admin",
                "secretary",
                "system"
              ]
            }
          },
          {
            "name": "visibilityScope",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "patient_and_assigned_doctor",
                "patient_only",
                "clinical_staff_only",
                "internal_only"
              ]
            }
          },
          {
            "name": "appointmentId",
            "in": "query",
            "required": false,
            "schema": {
              "$ref": "#/components/schemas/ObjectId"
            }
          },
          {
            "name": "tags",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "minLength": 1,
              "maxLength": 512
            }
          },
          {
            "name": "serviceDateFrom",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "format": "date"
            }
          },
          {
            "name": "serviceDateTo",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "format": "date"
            }
          },
          {
            "name": "sortBy",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "createdAt",
                "serviceDate",
                "fileName",
                "documentCategory",
                "uploadedByRole"
              ]
            }
          },
          {
            "name": "sortOrder",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "asc",
                "desc"
              ]
            }
          }
        ],
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-roles": [
          "patient",
          "doctor",
          "secretary"
        ],
        "x-source-route": "src/routes/patientFiles.js",
        "x-controller": "listPatientFiles",
        "x-middlewares": [
          "default",
          "middleware",
          "enforcePatientReadAccess",
          "listPatientFiles"
        ]
      }
    },
    "/api/patients/{patientId}/files/{fileId}": {
      "get": {
        "tags": [
          "Patient Files"
        ],
        "summary": "Get Patient File",
        "description": "Get Patient File\n\nRequires a bearer access token.\n\nAllowed roles: patient, doctor, secretary.\n\nAdditional account-state, ownership, assignment, or delegated-access guards may apply before the controller runs.\n\nValidation: params: patientId, fileId.\n\nSource route file: src/routes/patientFiles.js.",
        "operationId": "get_api_patients_patientId_files_fileId",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          },
          {
            "name": "patientId",
            "in": "path",
            "required": true,
            "schema": {
              "$ref": "#/components/schemas/ObjectId"
            }
          },
          {
            "name": "fileId",
            "in": "path",
            "required": true,
            "schema": {
              "$ref": "#/components/schemas/ObjectId"
            }
          }
        ],
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-roles": [
          "patient",
          "doctor",
          "secretary"
        ],
        "x-source-route": "src/routes/patientFiles.js",
        "x-controller": "getPatientFile",
        "x-middlewares": [
          "default",
          "middleware",
          "enforcePatientReadAccess",
          "getPatientFile"
        ]
      },
      "delete": {
        "tags": [
          "Patient Files"
        ],
        "summary": "Delete Patient File",
        "description": "Delete Patient File\n\nRequires a bearer access token.\n\nAllowed roles: patient, doctor, secretary.\n\nValidation: params: patientId, fileId.\n\nSource route file: src/routes/patientFiles.js.",
        "operationId": "delete_api_patients_patientId_files_fileId",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          },
          {
            "name": "patientId",
            "in": "path",
            "required": true,
            "schema": {
              "$ref": "#/components/schemas/ObjectId"
            }
          },
          {
            "name": "fileId",
            "in": "path",
            "required": true,
            "schema": {
              "$ref": "#/components/schemas/ObjectId"
            }
          }
        ],
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-roles": [
          "patient",
          "doctor",
          "secretary"
        ],
        "x-source-route": "src/routes/patientFiles.js",
        "x-controller": "deletePatientFile",
        "x-middlewares": [
          "default",
          "middleware",
          "enforcePatientActiveStatus",
          "deletePatientFile"
        ]
      }
    },
    "/api/patients/{patientId}/files/{fileId}/download": {
      "get": {
        "tags": [
          "Patient Files"
        ],
        "summary": "Download Patient File",
        "description": "Download Patient File\n\nRequires a bearer access token.\n\nAllowed roles: patient, doctor, secretary.\n\nAdditional account-state, ownership, assignment, or delegated-access guards may apply before the controller runs.\n\nValidation: params: patientId, fileId; query: mode.\n\nSource route file: src/routes/patientFiles.js.",
        "operationId": "get_api_patients_patientId_files_fileId_download",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          },
          {
            "name": "patientId",
            "in": "path",
            "required": true,
            "schema": {
              "$ref": "#/components/schemas/ObjectId"
            }
          },
          {
            "name": "fileId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "mode",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "url",
                "stream"
              ]
            }
          }
        ],
        "responses": {
          "200": {
            "$ref": "#/components/responses/DownloadUrl"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-roles": [
          "patient",
          "doctor",
          "secretary"
        ],
        "x-source-route": "src/routes/patientFiles.js",
        "x-controller": "downloadPatientFile",
        "x-middlewares": [
          "default",
          "middleware",
          "enforcePatientReadAccess",
          "downloadPatientFile"
        ]
      }
    },
    "/api/patients/{patientId}/files/download": {
      "get": {
        "tags": [
          "Patient Files"
        ],
        "summary": "Download Patient File",
        "description": "Download Patient File\n\nRequires a bearer access token.\n\nAllowed roles: patient, doctor, secretary.\n\nAdditional account-state, ownership, assignment, or delegated-access guards may apply before the controller runs.\n\nValidation: params: patientId; query: ref, mode.\n\nSource route file: src/routes/patientFiles.js.",
        "operationId": "get_api_patients_patientId_files_download",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          },
          {
            "name": "patientId",
            "in": "path",
            "required": true,
            "schema": {
              "$ref": "#/components/schemas/ObjectId"
            }
          },
          {
            "name": "ref",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "mode",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "url",
                "stream"
              ]
            }
          }
        ],
        "responses": {
          "200": {
            "$ref": "#/components/responses/DownloadUrl"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-roles": [
          "patient",
          "doctor",
          "secretary"
        ],
        "x-source-route": "src/routes/patientFiles.js",
        "x-controller": "downloadPatientFile",
        "x-middlewares": [
          "default",
          "middleware",
          "enforcePatientReadAccess",
          "downloadPatientFile"
        ]
      }
    },
    "/api/patients/{patientId}/files/upload": {
      "post": {
        "tags": [
          "Patient Files"
        ],
        "summary": "Upload And Attach Patient File",
        "description": "Upload And Attach Patient File\n\nRequires a bearer access token.\n\nAllowed roles: patient, doctor, secretary.\n\nConsumes multipart/form-data for file upload.\n\nValidation: params: patientId.\n\nSource route file: src/routes/patientFiles.js.",
        "operationId": "post_api_patients_patientId_files_upload",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          },
          {
            "name": "patientId",
            "in": "path",
            "required": true,
            "schema": {
              "$ref": "#/components/schemas/ObjectId"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "multipart/form-data": {
              "schema": {
                "$ref": "#/components/schemas/MultipartUploadRequest"
              },
              "encoding": {
                "file": {
                  "contentType": "image/jpeg, image/png, application/pdf, application/octet-stream"
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "201": {
            "$ref": "#/components/responses/CreatedEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-roles": [
          "patient",
          "doctor",
          "secretary"
        ],
        "x-source-route": "src/routes/patientFiles.js",
        "x-controller": "uploadAndAttachPatientFile",
        "x-middlewares": [
          "default",
          "middleware",
          "enforcePatientActiveStatus",
          "uploadAndAttachPatientFile"
        ]
      }
    },
    "/api/secretaries/me/doctor": {
      "get": {
        "tags": [
          "Secretaries"
        ],
        "summary": "Get Assigned Doctor For Secretary",
        "description": "Get Assigned Doctor For Secretary\n\nRequires a bearer access token.\n\nAllowed roles: secretary.\n\nAdditional account-state, ownership, assignment, or delegated-access guards may apply before the controller runs.\n\nThe secretary.permissions array is the authoritative delegated-permission set for the authenticated secretary. An empty array means the secretary has no delegated permissions and clients must not replace it with default permissions.\n\nValidation: no explicit express-validator fields.\n\nSource route file: src/routes/secretary.js.",
        "operationId": "get_api_secretaries_me_doctor",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          }
        ],
        "responses": {
          "200": {
            "description": "The authenticated secretary profile, its exact delegated permissions, and the assigned approved doctor.",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/SecretaryAssignedDoctorResponse"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-roles": [
          "secretary"
        ],
        "x-source-route": "src/routes/secretary.js",
        "x-controller": "getAssignedDoctorForSecretary",
        "x-middlewares": [
          "default",
          "middleware",
          "getAssignedDoctorForSecretary"
        ]
      }
    },
    "/api/services": {
      "get": {
        "tags": [
          "Services"
        ],
        "summary": "List Services",
        "description": "List Services\n\nPublic endpoint; no bearer token is required.\n\nNo role restriction is declared for this route.\n\nValidation: query: type, includeSchema, search, name, city, country, filters, sortBy, sortOrder, cursor, page, limit, lat, lng, radiusKm.\n\nSource route file: src/routes/services.js.",
        "operationId": "get_api_services",
        "security": [],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          },
          {
            "name": "type",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "includeSchema",
            "in": "query",
            "required": false,
            "schema": {
              "type": "boolean"
            }
          },
          {
            "name": "search",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "name",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "city",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "country",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "filters",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "sortBy",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "sortOrder",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "asc",
                "desc"
              ]
            }
          },
          {
            "name": "cursor",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "page",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer",
              "minimum": 1
            }
          },
          {
            "name": "limit",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer",
              "minimum": 1,
              "maximum": 100
            }
          },
          {
            "name": "lat",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "lng",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "radiusKm",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/services.js",
        "x-controller": "listServices",
        "x-middlewares": [
          "middleware",
          "default",
          "listServices"
        ]
      }
    },
    "/api/services/{id}": {
      "get": {
        "tags": [
          "Services"
        ],
        "summary": "Get Service",
        "description": "Get Service\n\nPublic endpoint; no bearer token is required.\n\nNo role restriction is declared for this route.\n\nValidation: params: id; query: includeSchema.\n\nSource route file: src/routes/services.js.",
        "operationId": "get_api_services_id",
        "security": [],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          },
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "$ref": "#/components/schemas/ObjectId"
            }
          },
          {
            "name": "includeSchema",
            "in": "query",
            "required": false,
            "schema": {
              "type": "boolean"
            }
          }
        ],
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/services.js",
        "x-controller": "getService",
        "x-middlewares": [
          "middleware",
          "default",
          "getService"
        ]
      }
    },
    "/api/services/types": {
      "get": {
        "tags": [
          "Services"
        ],
        "summary": "Public List Service Types",
        "description": "Public List Service Types\n\nPublic endpoint; no bearer token is required.\n\nNo role restriction is declared for this route.\n\nValidation: no explicit express-validator fields.\n\nSource route file: src/routes/services.js.",
        "operationId": "get_api_services_types",
        "security": [],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          }
        ],
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/services.js",
        "x-controller": "publicListServiceTypes",
        "x-middlewares": [
          "publicListServiceTypes"
        ]
      }
    },
    "/api/upload": {
      "post": {
        "tags": [
          "Upload"
        ],
        "summary": "Upload Single File",
        "description": "Upload Single File\n\nPublic endpoint; no bearer token is required.\n\nNo role restriction is declared for this route.\n\nConsumes multipart/form-data for file upload.\n\nValidation: no explicit express-validator fields.\n\nSource route file: src/routes/upload.js.",
        "operationId": "post_api_upload",
        "security": [],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "multipart/form-data": {
              "schema": {
                "$ref": "#/components/schemas/MultipartUploadRequest"
              },
              "encoding": {
                "file": {
                  "contentType": "image/jpeg, image/png, application/pdf, application/octet-stream"
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "201": {
            "$ref": "#/components/responses/CreatedEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/upload.js",
        "x-controller": "uploadSingleFile",
        "x-middlewares": [
          "uploadSingleFile"
        ]
      }
    },
    "/api/upload/{objectName}": {
      "delete": {
        "tags": [
          "Upload"
        ],
        "summary": "Delete Uploaded File",
        "description": "Delete Uploaded File\n\nPublic endpoint; no bearer token is required.\n\nNo role restriction is declared for this route.\n\nValidation: no explicit express-validator fields.\n\nSource route file: src/routes/upload.js.",
        "operationId": "delete_api_upload_objectName",
        "security": [],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          },
          {
            "name": "objectName",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-source-route": "src/routes/upload.js",
        "x-controller": "deleteUploadedFile",
        "x-middlewares": [
          "deleteUploadedFile"
        ]
      }
    },
    "/api/waitlist": {
      "get": {
        "tags": [
          "Waitlist"
        ],
        "summary": "List Doctor Waitlist",
        "description": "List Doctor Waitlist\n\nRequires a bearer access token.\n\nAllowed roles: doctor, secretary.\n\nAdditional account-state, ownership, assignment, or delegated-access guards may apply before the controller runs.\n\nValidation: query: doctorId, q, page, limit, status, urgencyLevel, date, dateFrom, dateTo.\n\nSource route file: src/routes/waitlist.js.",
        "operationId": "get_api_waitlist",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          },
          {
            "name": "doctorId",
            "in": "query",
            "required": false,
            "schema": {
              "$ref": "#/components/schemas/ObjectId"
            }
          },
          {
            "name": "q",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "page",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer",
              "minimum": 1
            }
          },
          {
            "name": "limit",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer",
              "minimum": 1,
              "maximum": 100
            }
          },
          {
            "name": "status",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "urgencyLevel",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "date",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "format": "date"
            }
          },
          {
            "name": "dateFrom",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "format": "date"
            }
          },
          {
            "name": "dateTo",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "format": "date"
            }
          }
        ],
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-roles": [
          "doctor",
          "secretary"
        ],
        "x-source-route": "src/routes/waitlist.js",
        "x-controller": "listDoctorWaitlist",
        "x-middlewares": [
          "default",
          "middleware",
          "loadUserModelsGuard",
          "AsyncFunction",
          "listDoctorWaitlist"
        ]
      },
      "post": {
        "tags": [
          "Waitlist"
        ],
        "summary": "Create Waitlist Request",
        "description": "Create Waitlist Request\n\nRequires a bearer access token.\n\nAllowed roles: patient, secretary.\n\nAdditional account-state, ownership, assignment, or delegated-access guards may apply before the controller runs.\n\nValidation: body: doctorId, patientId, preferredDateFrom, preferredDateTo, preferredTimeWindows, urgencyLevel, reason, contactPreference.\n\nSource route file: src/routes/waitlist.js.",
        "operationId": "post_api_waitlist",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "additionalProperties": true,
                "properties": {
                  "doctorId": {
                    "$ref": "#/components/schemas/ObjectId"
                  },
                  "patientId": {
                    "$ref": "#/components/schemas/ObjectId"
                  },
                  "preferredDateFrom": {
                    "type": "string",
                    "format": "date"
                  },
                  "preferredDateTo": {
                    "type": "string",
                    "format": "date"
                  },
                  "preferredTimeWindows": {
                    "type": "string"
                  },
                  "urgencyLevel": {
                    "type": "string",
                    "enum": [
                      "low",
                      "medium",
                      "high"
                    ]
                  },
                  "reason": {
                    "type": "string",
                    "maxLength": 500
                  },
                  "contactPreference": {
                    "type": "string",
                    "enum": [
                      "call",
                      "sms",
                      "whatsapp",
                      "email"
                    ]
                  }
                },
                "required": [
                  "doctorId",
                  "preferredDateFrom",
                  "preferredDateTo",
                  "urgencyLevel",
                  "contactPreference"
                ]
              },
              "example": {
                "doctorId": "64f0c0000000000000000001",
                "patientId": "64f0c0000000000000000001",
                "preferredDateFrom": "2026-04-30",
                "preferredDateTo": "2026-04-30",
                "preferredTimeWindows": "09:30",
                "urgencyLevel": "low",
                "reason": "string",
                "contactPreference": "call"
              }
            }
          }
        },
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "201": {
            "$ref": "#/components/responses/CreatedEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-roles": [
          "patient",
          "secretary"
        ],
        "x-source-route": "src/routes/waitlist.js",
        "x-controller": "createWaitlistRequest",
        "x-middlewares": [
          "default",
          "middleware",
          "enforcePatientActiveStatus",
          "loadUserModelsGuard",
          "AsyncFunction",
          "createWaitlistRequest"
        ]
      }
    },
    "/api/waitlist/{id}": {
      "get": {
        "tags": [
          "Waitlist"
        ],
        "summary": "Get Waitlist Details",
        "description": "Get Waitlist Details\n\nRequires a bearer access token.\n\nAllowed roles: patient, doctor, secretary.\n\nAdditional account-state, ownership, assignment, or delegated-access guards may apply before the controller runs.\n\nValidation: params: id.\n\nSource route file: src/routes/waitlist.js.",
        "operationId": "get_api_waitlist_id",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          },
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "$ref": "#/components/schemas/ObjectId"
            }
          }
        ],
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-roles": [
          "patient",
          "doctor",
          "secretary"
        ],
        "x-source-route": "src/routes/waitlist.js",
        "x-controller": "getWaitlistDetails",
        "x-middlewares": [
          "default",
          "middleware",
          "enforcePatientReadAccess",
          "loadUserModelsGuard",
          "getWaitlistDetails"
        ]
      }
    },
    "/api/waitlist/{id}/book": {
      "post": {
        "tags": [
          "Waitlist"
        ],
        "summary": "Book From Waitlist",
        "description": "Book From Waitlist\n\nRequires a bearer access token.\n\nAllowed roles: doctor, secretary.\n\nAdditional account-state, ownership, assignment, or delegated-access guards may apply before the controller runs.\n\nValidation: params: id; body: date, startTime, appointmentTypeId, notes.\n\nSource route file: src/routes/waitlist.js.",
        "operationId": "post_api_waitlist_id_book",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          },
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "$ref": "#/components/schemas/ObjectId"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "additionalProperties": true,
                "properties": {
                  "date": {
                    "type": "string",
                    "format": "date"
                  },
                  "startTime": {
                    "type": "string"
                  },
                  "appointmentTypeId": {
                    "$ref": "#/components/schemas/ObjectId"
                  },
                  "notes": {
                    "type": "string",
                    "maxLength": 500
                  }
                },
                "required": [
                  "date",
                  "startTime"
                ]
              },
              "example": {
                "date": "2026-04-30",
                "startTime": "09:30",
                "appointmentTypeId": "64f0c0000000000000000001",
                "notes": "string"
              }
            }
          }
        },
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "201": {
            "$ref": "#/components/responses/CreatedEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-roles": [
          "doctor",
          "secretary"
        ],
        "x-source-route": "src/routes/waitlist.js",
        "x-controller": "bookFromWaitlist",
        "x-middlewares": [
          "default",
          "middleware",
          "loadUserModelsGuard",
          "AsyncFunction",
          "bookFromWaitlist"
        ]
      }
    },
    "/api/waitlist/{id}/close": {
      "patch": {
        "tags": [
          "Waitlist"
        ],
        "summary": "Close Waitlist Request",
        "description": "Close Waitlist Request\n\nRequires a bearer access token.\n\nAllowed roles: doctor, secretary.\n\nAdditional account-state, ownership, assignment, or delegated-access guards may apply before the controller runs.\n\nValidation: params: id; body: closedReason.\n\nSource route file: src/routes/waitlist.js.",
        "operationId": "patch_api_waitlist_id_close",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          },
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "$ref": "#/components/schemas/ObjectId"
            }
          }
        ],
        "requestBody": {
          "required": false,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "additionalProperties": true,
                "properties": {
                  "closedReason": {
                    "type": "string",
                    "maxLength": 300
                  }
                }
              },
              "example": {
                "closedReason": "string"
              }
            }
          }
        },
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-roles": [
          "doctor",
          "secretary"
        ],
        "x-source-route": "src/routes/waitlist.js",
        "x-controller": "closeWaitlistRequest",
        "x-middlewares": [
          "default",
          "middleware",
          "loadUserModelsGuard",
          "AsyncFunction",
          "closeWaitlistRequest"
        ]
      }
    },
    "/api/waitlist/{id}/contacted": {
      "patch": {
        "tags": [
          "Waitlist"
        ],
        "summary": "Mark Waitlist Contacted",
        "description": "Mark Waitlist Contacted\n\nRequires a bearer access token.\n\nAllowed roles: doctor, secretary.\n\nAdditional account-state, ownership, assignment, or delegated-access guards may apply before the controller runs.\n\nValidation: params: id; body: note.\n\nSource route file: src/routes/waitlist.js.",
        "operationId": "patch_api_waitlist_id_contacted",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          },
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "$ref": "#/components/schemas/ObjectId"
            }
          }
        ],
        "requestBody": {
          "required": false,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "additionalProperties": true,
                "properties": {
                  "note": {
                    "type": "string",
                    "maxLength": 1000
                  }
                }
              },
              "example": {
                "note": "string"
              }
            }
          }
        },
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-roles": [
          "doctor",
          "secretary"
        ],
        "x-source-route": "src/routes/waitlist.js",
        "x-controller": "markWaitlistContacted",
        "x-middlewares": [
          "default",
          "middleware",
          "loadUserModelsGuard",
          "AsyncFunction",
          "markWaitlistContacted"
        ]
      }
    },
    "/api/waitlist/suggestions": {
      "get": {
        "tags": [
          "Waitlist"
        ],
        "summary": "Get Waitlist Suggestions",
        "description": "Get Waitlist Suggestions\n\nRequires a bearer access token.\n\nAllowed roles: doctor, secretary.\n\nAdditional account-state, ownership, assignment, or delegated-access guards may apply before the controller runs.\n\nValidation: query: doctorId, date, type, startTime.\n\nSource route file: src/routes/waitlist.js.",
        "operationId": "get_api_waitlist_suggestions",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/XLang"
          },
          {
            "name": "doctorId",
            "in": "query",
            "required": false,
            "schema": {
              "$ref": "#/components/schemas/ObjectId"
            }
          },
          {
            "name": "date",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string",
              "format": "date"
            }
          },
          {
            "name": "type",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "freeSlots",
                "slotCandidates"
              ]
            }
          },
          {
            "name": "startTime",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "$ref": "#/components/responses/SuccessEnvelope"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "422": {
            "$ref": "#/components/responses/ValidationError"
          }
        },
        "x-roles": [
          "doctor",
          "secretary"
        ],
        "x-source-route": "src/routes/waitlist.js",
        "x-controller": "getWaitlistSuggestions",
        "x-middlewares": [
          "default",
          "middleware",
          "loadUserModelsGuard",
          "AsyncFunction",
          "getWaitlistSuggestions"
        ]
      }
    }
  },
  "components": {
    "securitySchemes": {
      "bearerAuth": {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT",
        "description": "Short-lived access JWT issued by LMJ Health authentication endpoints. Refresh tokens are not valid bearer tokens and must be sent only to POST /api/auth/refresh."
      }
    },
    "parameters": {
      "XLang": {
        "name": "x-lang",
        "in": "header",
        "required": false,
        "description": "Response language. Unsupported values fall back to the default language.",
        "schema": {
          "type": "string",
          "enum": [
            "en",
            "ar"
          ],
          "default": "en"
        }
      },
      "Page": {
        "name": "page",
        "in": "query",
        "required": false,
        "schema": {
          "type": "integer",
          "minimum": 1,
          "default": 1
        }
      },
      "Limit": {
        "name": "limit",
        "in": "query",
        "required": false,
        "schema": {
          "type": "integer",
          "minimum": 1,
          "maximum": 100,
          "default": 20
        }
      },
      "IncludeAllLangs": {
        "name": "includeAllLangs",
        "in": "query",
        "required": false,
        "description": "Return all localized language values where supported by the module.",
        "schema": {
          "type": "boolean",
          "default": false
        }
      }
    },
    "requestBodies": {
      "GenericJson": {
        "required": false,
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/GenericJsonRequest"
            }
          }
        }
      },
      "MultipartUpload": {
        "required": true,
        "content": {
          "multipart/form-data": {
            "schema": {
              "$ref": "#/components/schemas/MultipartUploadRequest"
            },
            "encoding": {
              "file": {
                "contentType": "image/jpeg, image/png, application/pdf, application/octet-stream"
              }
            }
          }
        }
      },
      "PdfGeneration": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/PdfGenerationRequest"
            },
            "example": {
              "type": "prescription",
              "sourceId": "64f0c0000000000000000001",
              "lang": "en"
            }
          }
        }
      }
    },
    "responses": {
      "SuccessEnvelope": {
        "description": "Successful JSON response. src/app.js adds localized message fields.",
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/SuccessEnvelope"
            },
            "examples": {
              "success": {
                "$ref": "#/components/examples/SuccessEnvelope"
              }
            }
          }
        }
      },
      "CreatedEnvelope": {
        "description": "Resource or action created successfully.",
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/SuccessEnvelope"
            },
            "examples": {
              "created": {
                "$ref": "#/components/examples/CreatedEnvelope"
              }
            }
          }
        }
      },
      "Health": {
        "description": "Health check response.",
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/HealthStatus"
            }
          }
        }
      },
      "DownloadUrl": {
        "description": "Presigned download URL response.",
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/DownloadUrlEnvelope"
            },
            "examples": {
              "downloadUrl": {
                "$ref": "#/components/examples/DownloadUrl"
              }
            }
          }
        }
      },
      "PdfBinary": {
        "description": "Binary PDF document.",
        "headers": {
          "Content-Disposition": {
            "schema": {
              "type": "string"
            },
            "description": "Attachment filename when returned by the endpoint."
          }
        },
        "content": {
          "application/pdf": {
            "schema": {
              "type": "string",
              "format": "binary"
            }
          }
        }
      },
      "BadRequest": {
        "description": "Malformed request or unsupported input.",
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/ErrorEnvelope"
            },
            "examples": {
              "error": {
                "$ref": "#/components/examples/ErrorEnvelope"
              }
            }
          }
        }
      },
      "Unauthorized": {
        "description": "Missing, malformed, expired, or invalid bearer token.",
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/ErrorEnvelope"
            }
          }
        }
      },
      "Forbidden": {
        "description": "Authenticated user does not have the required role, scope, assignment, or account state.",
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/ErrorEnvelope"
            }
          }
        }
      },
      "NotFound": {
        "description": "Route or resource was not found.",
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/ErrorEnvelope"
            }
          }
        }
      },
      "ValidationError": {
        "description": "express-validator rejected params, query, body, or multipart metadata.",
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/ErrorEnvelope"
            },
            "examples": {
              "validation": {
                "$ref": "#/components/examples/ErrorEnvelope"
              }
            }
          }
        }
      },
      "ServerError": {
        "description": "Unexpected server error.",
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/ErrorEnvelope"
            }
          }
        }
      }
    },
    "schemas": {
      "ObjectId": {
        "type": "string",
        "pattern": "^[a-fA-F0-9]{24}$",
        "example": "64f0c0000000000000000001"
      },
      "LocalizedString": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "en": {
            "type": "string",
            "example": "Cardiology"
          },
          "ar": {
            "type": "string",
            "example": "Cardiology"
          }
        },
        "required": [
          "en",
          "ar"
        ]
      },
      "TimestampFields": {
        "type": "object",
        "properties": {
          "createdAt": {
            "type": "string",
            "format": "date-time"
          },
          "updatedAt": {
            "type": "string",
            "format": "date-time"
          }
        }
      },
      "LocalizedInput": {
        "oneOf": [
          {
            "type": "string",
            "minLength": 1
          },
          {
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "en": {
                "type": "string",
                "minLength": 1
              },
              "ar": {
                "type": "string",
                "minLength": 1
              }
            },
            "minProperties": 1
          }
        ]
      },
      "ContentTemplateField": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "key": {
            "type": "string",
            "pattern": "^[A-Za-z][A-Za-z0-9_]*$",
            "example": "scientificNumber",
            "description": "Technical key. Arabic display text belongs in label, not key."
          },
          "label": {
            "$ref": "#/components/schemas/LocalizedInput"
          },
          "type": {
            "type": "string",
            "enum": [
              "string",
              "number",
              "boolean",
              "array",
              "object"
            ]
          },
          "required": {
            "type": "boolean"
          },
          "enum": {
            "type": "array",
            "items": {}
          },
          "min": {
            "type": "number"
          },
          "max": {
            "type": "number"
          },
          "regex": {
            "type": "string"
          },
          "isPublic": {
            "type": "boolean"
          }
        },
        "required": [
          "key",
          "label",
          "type"
        ]
      },
      "ContentTemplateCreateRequest": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "name": {
            "$ref": "#/components/schemas/LocalizedInput"
          },
          "slug": {
            "type": "string",
            "description": "Optional. The backend normalizes this to a lowercase URL slug."
          },
          "parentType": {
            "type": "string",
            "enum": [
              "CONDITION",
              "SYMPTOM",
              "MEDICATION",
              "GENERAL_ADVICE"
            ]
          },
          "fields": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/ContentTemplateField"
            }
          },
          "isActive": {
            "type": "boolean"
          },
          "uiHints": {
            "type": "object",
            "additionalProperties": true
          }
        },
        "required": [
          "name",
          "parentType"
        ]
      },
      "ContentTemplateUpdateRequest": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "name": {
            "$ref": "#/components/schemas/LocalizedInput"
          },
          "slug": {
            "type": "string",
            "description": "Optional. The backend normalizes this to a lowercase URL slug."
          },
          "parentType": {
            "type": "string",
            "enum": [
              "CONDITION",
              "SYMPTOM",
              "MEDICATION",
              "GENERAL_ADVICE"
            ]
          },
          "fields": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/ContentTemplateField"
            }
          },
          "isActive": {
            "type": "boolean"
          },
          "uiHints": {
            "type": "object",
            "additionalProperties": true
          }
        }
      },
      "AdminAccessRequestDoctorSummary": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "_id": {
            "$ref": "#/components/schemas/ObjectId"
          },
          "userId": {
            "oneOf": [
              {
                "$ref": "#/components/schemas/ObjectId"
              },
              {
                "type": "null"
              }
            ]
          },
          "fullName": {
            "oneOf": [
              {
                "type": "string"
              },
              {
                "type": "null"
              }
            ]
          },
          "specialization": {
            "oneOf": [
              {
                "type": "string"
              },
              {
                "type": "null"
              }
            ]
          },
          "email": {
            "oneOf": [
              {
                "type": "string",
                "format": "email"
              },
              {
                "type": "null"
              }
            ]
          },
          "phone": {
            "oneOf": [
              {
                "type": "string"
              },
              {
                "type": "null"
              }
            ]
          },
          "photoUrl": {
            "oneOf": [
              {
                "type": "string"
              },
              {
                "type": "null"
              }
            ]
          }
        }
      },
      "AdminAccessRequestPatientSummary": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "_id": {
            "$ref": "#/components/schemas/ObjectId"
          },
          "userId": {
            "oneOf": [
              {
                "$ref": "#/components/schemas/ObjectId"
              },
              {
                "type": "null"
              }
            ]
          },
          "publicId": {
            "oneOf": [
              {
                "type": "string"
              },
              {
                "type": "null"
              }
            ]
          },
          "fullName": {
            "oneOf": [
              {
                "type": "string"
              },
              {
                "type": "null"
              }
            ]
          },
          "email": {
            "oneOf": [
              {
                "type": "string",
                "format": "email"
              },
              {
                "type": "null"
              }
            ]
          },
          "phone": {
            "oneOf": [
              {
                "type": "string"
              },
              {
                "type": "null"
              }
            ]
          },
          "photoUrl": {
            "oneOf": [
              {
                "type": "string"
              },
              {
                "type": "null"
              }
            ]
          }
        }
      },
      "AdminAccessRequest": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "_id": {
            "$ref": "#/components/schemas/ObjectId"
          },
          "status": {
            "type": "string",
            "enum": [
              "pending",
              "approved",
              "denied",
              "expired"
            ]
          },
          "scope": {
            "type": "string",
            "example": "PROFILE"
          },
          "reason": {
            "oneOf": [
              {
                "type": "string"
              },
              {
                "type": "null"
              }
            ]
          },
          "createdAt": {
            "type": "string",
            "format": "date-time"
          },
          "updatedAt": {
            "type": "string",
            "format": "date-time"
          },
          "decidedAt": {
            "oneOf": [
              {
                "type": "string",
                "format": "date-time"
              },
              {
                "type": "null"
              }
            ]
          },
          "expiresAt": {
            "oneOf": [
              {
                "type": "string",
                "format": "date-time"
              },
              {
                "type": "null"
              }
            ]
          },
          "requestedItems": {
            "type": "array",
            "items": {}
          },
          "doctor": {
            "oneOf": [
              {
                "$ref": "#/components/schemas/AdminAccessRequestDoctorSummary"
              },
              {
                "type": "null"
              }
            ]
          },
          "patient": {
            "oneOf": [
              {
                "$ref": "#/components/schemas/AdminAccessRequestPatientSummary"
              },
              {
                "type": "null"
              }
            ]
          }
        }
      },
      "AdminAccessRequestListResponse": {
        "allOf": [
          {
            "$ref": "#/components/schemas/SuccessEnvelope"
          },
          {
            "type": "object",
            "additionalProperties": true,
            "properties": {
              "page": {
                "type": "integer"
              },
              "limit": {
                "type": "integer"
              },
              "total": {
                "type": "integer"
              },
              "results": {
                "type": "integer"
              },
              "requests": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/AdminAccessRequest"
                }
              }
            },
            "required": [
              "page",
              "limit",
              "total",
              "results",
              "requests"
            ]
          }
        ]
      },
      "AdminAccessRequestDetailsResponse": {
        "allOf": [
          {
            "$ref": "#/components/schemas/SuccessEnvelope"
          },
          {
            "type": "object",
            "additionalProperties": true,
            "properties": {
              "request": {
                "$ref": "#/components/schemas/AdminAccessRequest"
              }
            },
            "required": [
              "request"
            ]
          }
        ]
      },
      "UserRole": {
        "type": "string",
        "enum": [
          "patient",
          "doctor",
          "secretary",
          "admin",
          "data_entry"
        ]
      },
      "SuccessEnvelope": {
        "type": "object",
        "additionalProperties": true,
        "properties": {
          "messageKey": {
            "type": "string",
            "example": "success.ok"
          },
          "message": {
            "type": "string",
            "example": "OK"
          },
          "messageArgs": {
            "type": "object",
            "additionalProperties": true
          },
          "messageText": {
            "type": "string",
            "description": "Present when a module already returns a non-string message field."
          }
        },
        "required": [
          "messageKey",
          "message"
        ]
      },
      "ErrorEnvelope": {
        "type": "object",
        "additionalProperties": true,
        "properties": {
          "status": {
            "type": "integer",
            "minimum": 400,
            "maximum": 599,
            "example": 422
          },
          "messageKey": {
            "type": "string",
            "example": "errors.validationFailed"
          },
          "message": {
            "type": "string",
            "example": "Validation failed"
          },
          "errors": {
            "oneOf": [
              {
                "type": "null"
              },
              {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/ValidationIssue"
                }
              },
              {
                "type": "object",
                "additionalProperties": true
              }
            ]
          }
        },
        "required": [
          "status",
          "messageKey",
          "message",
          "errors"
        ]
      },
      "ValidationIssue": {
        "type": "object",
        "additionalProperties": true,
        "properties": {
          "type": {
            "type": "string",
            "example": "field"
          },
          "value": {
            "description": "Rejected value when express-validator exposes it."
          },
          "msg": {
            "type": "string",
            "example": "Invalid value"
          },
          "messageKey": {
            "type": "string",
            "example": "errors.validation.invalid"
          },
          "path": {
            "type": "string",
            "example": "email"
          },
          "location": {
            "type": "string",
            "enum": [
              "body",
              "query",
              "params",
              "headers",
              "cookies"
            ]
          }
        }
      },
      "Pagination": {
        "type": "object",
        "additionalProperties": true,
        "properties": {
          "page": {
            "type": "integer",
            "minimum": 1,
            "example": 1
          },
          "limit": {
            "type": "integer",
            "minimum": 1,
            "example": 20
          },
          "total": {
            "type": "integer",
            "minimum": 0,
            "example": 125
          },
          "totalPages": {
            "type": "integer",
            "minimum": 0,
            "example": 7
          }
        }
      },
      "PagedEnvelope": {
        "allOf": [
          {
            "$ref": "#/components/schemas/SuccessEnvelope"
          },
          {
            "type": "object",
            "properties": {
              "data": {
                "type": "array",
                "items": {
                  "type": "object",
                  "additionalProperties": true
                }
              },
              "pagination": {
                "$ref": "#/components/schemas/Pagination"
              }
            }
          }
        ]
      },
      "ManagedServiceTypeSummary": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "id": {
            "$ref": "#/components/schemas/ObjectId"
          },
          "name": {
            "oneOf": [
              {
                "type": "string"
              },
              {
                "$ref": "#/components/schemas/LocalizedString"
              }
            ]
          },
          "slug": {
            "type": "string"
          },
          "schemaVersion": {
            "type": "integer",
            "minimum": 1
          },
          "isActive": {
            "type": "boolean"
          }
        },
        "required": [
          "id",
          "name",
          "slug",
          "schemaVersion",
          "isActive"
        ]
      },
      "ManagedServiceProvider": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "id": {
            "$ref": "#/components/schemas/ObjectId"
          },
          "serviceType": {
            "$ref": "#/components/schemas/ManagedServiceTypeSummary"
          },
          "name": {
            "oneOf": [
              {
                "type": "string"
              },
              {
                "type": "null"
              }
            ]
          },
          "city": {
            "oneOf": [
              {
                "type": "string"
              },
              {
                "type": "null"
              }
            ]
          },
          "country": {
            "oneOf": [
              {
                "type": "string"
              },
              {
                "type": "null"
              }
            ]
          },
          "aliases": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "data": {
            "type": "object",
            "description": "Complete schema-driven provider data, including fields not public in the catalog.",
            "additionalProperties": true
          },
          "status": {
            "type": "string",
            "enum": [
              "draft",
              "active",
              "inactive"
            ]
          },
          "schemaVersionAtWrite": {
            "type": "integer",
            "minimum": 1
          },
          "createdBy": {
            "oneOf": [
              {
                "$ref": "#/components/schemas/ObjectId"
              },
              {
                "type": "null"
              }
            ]
          },
          "updatedBy": {
            "oneOf": [
              {
                "$ref": "#/components/schemas/ObjectId"
              },
              {
                "type": "null"
              }
            ]
          },
          "approvedBy": {
            "oneOf": [
              {
                "$ref": "#/components/schemas/ObjectId"
              },
              {
                "type": "null"
              }
            ]
          },
          "approvedAt": {
            "oneOf": [
              {
                "type": "string",
                "format": "date-time"
              },
              {
                "type": "null"
              }
            ]
          },
          "createdAt": {
            "type": "string",
            "format": "date-time"
          },
          "updatedAt": {
            "type": "string",
            "format": "date-time"
          }
        },
        "required": [
          "id",
          "serviceType",
          "aliases",
          "data",
          "status",
          "schemaVersionAtWrite"
        ]
      },
      "ManagedServiceProviderListResponse": {
        "allOf": [
          {
            "$ref": "#/components/schemas/SuccessEnvelope"
          },
          {
            "type": "object",
            "properties": {
              "page": {
                "type": "integer",
                "minimum": 1
              },
              "limit": {
                "type": "integer",
                "minimum": 1,
                "maximum": 100
              },
              "total": {
                "type": "integer",
                "minimum": 0
              },
              "results": {
                "type": "integer",
                "minimum": 0
              },
              "providers": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/ManagedServiceProvider"
                }
              }
            }
          }
        ]
      },
      "ManagedServiceProviderDetailResponse": {
        "allOf": [
          {
            "$ref": "#/components/schemas/SuccessEnvelope"
          },
          {
            "type": "object",
            "properties": {
              "provider": {
                "$ref": "#/components/schemas/ManagedServiceProvider"
              },
              "serviceType": {
                "type": "object",
                "description": "Full localized service-type definition, including dynamic field metadata.",
                "additionalProperties": true
              }
            }
          }
        ]
      },
      "HealthStatus": {
        "allOf": [
          {
            "$ref": "#/components/schemas/SuccessEnvelope"
          },
          {
            "type": "object",
            "properties": {
              "status": {
                "type": "string",
                "example": "ok"
              },
              "uptime": {
                "type": "number",
                "example": 123.4
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              }
            }
          }
        ]
      },
      "AuthUser": {
        "type": "object",
        "additionalProperties": true,
        "properties": {
          "id": {
            "$ref": "#/components/schemas/ObjectId"
          },
          "role": {
            "$ref": "#/components/schemas/UserRole"
          },
          "fullName": {
            "type": "string"
          },
          "email": {
            "type": "string",
            "format": "email"
          },
          "phone": {
            "type": "string"
          }
        }
      },
      "AuthTokenEnvelope": {
        "allOf": [
          {
            "$ref": "#/components/schemas/SuccessEnvelope"
          },
          {
            "type": "object",
            "properties": {
              "accessToken": {
                "type": "string",
                "description": "Short-lived JWT used as the Authorization bearer token."
              },
              "refreshToken": {
                "type": "string",
                "description": "Long-lived refresh JWT used only with POST /api/auth/refresh."
              },
              "refreshExpiresAt": {
                "type": "string",
                "format": "date-time",
                "description": "Absolute expiry time for the current refresh token."
              },
              "user": {
                "$ref": "#/components/schemas/AuthUser"
              },
              "actorIds": {
                "type": "object",
                "additionalProperties": true,
                "properties": {
                  "patientId": {
                    "oneOf": [
                      {
                        "$ref": "#/components/schemas/ObjectId"
                      },
                      {
                        "type": "null"
                      }
                    ]
                  },
                  "doctorId": {
                    "oneOf": [
                      {
                        "$ref": "#/components/schemas/ObjectId"
                      },
                      {
                        "type": "null"
                      }
                    ]
                  },
                  "secretaryId": {
                    "oneOf": [
                      {
                        "$ref": "#/components/schemas/ObjectId"
                      },
                      {
                        "type": "null"
                      }
                    ]
                  },
                  "assignedDoctorId": {
                    "oneOf": [
                      {
                        "$ref": "#/components/schemas/ObjectId"
                      },
                      {
                        "type": "null"
                      }
                    ]
                  }
                }
              }
            },
            "required": [
              "accessToken",
              "refreshToken",
              "refreshExpiresAt"
            ]
          }
        ]
      },
      "GenericResource": {
        "type": "object",
        "additionalProperties": true,
        "properties": {
          "id": {
            "$ref": "#/components/schemas/ObjectId"
          },
          "_id": {
            "$ref": "#/components/schemas/ObjectId"
          },
          "createdAt": {
            "type": "string",
            "format": "date-time"
          },
          "updatedAt": {
            "type": "string",
            "format": "date-time"
          }
        }
      },
      "GenericJsonRequest": {
        "type": "object",
        "additionalProperties": true,
        "description": "Route-specific JSON body generated from express-validator metadata."
      },
      "BillingCurrencyCode": {
        "type": "string",
        "enum": [
          "USD",
          "EUR",
          "GBP",
          "CAD",
          "AUD",
          "CHF",
          "JPY",
          "CNY",
          "INR",
          "SYP",
          "AED",
          "SAR",
          "QAR",
          "KWD",
          "JOD",
          "EGP",
          "TRY"
        ],
        "example": "USD"
      },
      "BillingCurrency": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "code": {
            "$ref": "#/components/schemas/BillingCurrencyCode"
          },
          "name": {
            "type": "string",
            "example": "US Dollar"
          },
          "symbol": {
            "type": "string",
            "example": "$"
          },
          "isDefault": {
            "type": "boolean",
            "example": true
          }
        },
        "required": [
          "code",
          "name",
          "symbol",
          "isDefault"
        ]
      },
      "BillingSettings": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "currency": {
            "$ref": "#/components/schemas/BillingCurrencyCode"
          },
          "taxEnabled": {
            "type": "boolean",
            "example": false
          },
          "defaultTaxPercent": {
            "type": "number",
            "minimum": 0,
            "example": 0
          },
          "discountPresets": {
            "type": "array",
            "items": {
              "type": "number",
              "minimum": 0
            },
            "example": [
              0,
              10,
              20,
              30
            ]
          },
          "allowedPaymentMethods": {
            "type": "array",
            "items": {
              "type": "string",
              "enum": [
                "cash",
                "card",
                "bank_transfer",
                "insurance"
              ]
            },
            "example": [
              "cash",
              "card",
              "bank_transfer",
              "insurance"
            ]
          },
          "defaultInvoiceDueHours": {
            "type": "integer",
            "minimum": 1,
            "example": 24
          },
          "unpaidAlertAfterHours": {
            "type": "integer",
            "minimum": 1,
            "example": 24
          },
          "expenseCategories": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "example": []
          },
          "updatedAt": {
            "oneOf": [
              {
                "type": "string",
                "format": "date-time"
              },
              {
                "type": "null"
              }
            ],
            "example": "2026-04-16T10:00:00.000Z"
          }
        },
        "required": [
          "currency",
          "taxEnabled",
          "defaultTaxPercent",
          "discountPresets",
          "allowedPaymentMethods",
          "defaultInvoiceDueHours",
          "unpaidAlertAfterHours",
          "expenseCategories",
          "updatedAt"
        ]
      },
      "BillingSettingsResponse": {
        "allOf": [
          {
            "$ref": "#/components/schemas/SuccessEnvelope"
          },
          {
            "type": "object",
            "additionalProperties": true,
            "properties": {
              "settings": {
                "$ref": "#/components/schemas/BillingSettings"
              },
              "supportedCurrencies": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/BillingCurrency"
                }
              },
              "defaultCurrency": {
                "$ref": "#/components/schemas/BillingCurrencyCode"
              }
            },
            "required": [
              "settings",
              "supportedCurrencies",
              "defaultCurrency"
            ]
          }
        ]
      },
      "BillingSettingsUpdateRequest": {
        "type": "object",
        "additionalProperties": true,
        "properties": {
          "currency": {
            "$ref": "#/components/schemas/BillingCurrencyCode"
          },
          "taxEnabled": {
            "type": "boolean"
          },
          "defaultTaxPercent": {
            "type": "number",
            "minimum": 0
          },
          "discountPresets": {
            "type": "array",
            "items": {
              "type": "number",
              "minimum": 0
            }
          },
          "allowedPaymentMethods": {
            "type": "array",
            "items": {
              "type": "string",
              "enum": [
                "cash",
                "card",
                "bank_transfer",
                "insurance"
              ]
            }
          },
          "defaultInvoiceDueHours": {
            "type": "integer",
            "minimum": 1
          },
          "unpaidAlertAfterHours": {
            "type": "integer",
            "minimum": 1
          },
          "expenseCategories": {
            "type": "array",
            "items": {
              "type": "string"
            }
          }
        }
      },
      "BillingMoneySummary": {
        "type": "object",
        "additionalProperties": true,
        "properties": {
          "income": {
            "type": "number",
            "example": 1250
          },
          "expenses": {
            "type": "number",
            "example": 180
          },
          "refunds": {
            "type": "number",
            "example": 50
          },
          "profit": {
            "type": "number",
            "example": 1020
          }
        }
      },
      "BillingReportSummaryByCurrency": {
        "allOf": [
          {
            "$ref": "#/components/schemas/BillingMoneySummary"
          },
          {
            "type": "object",
            "additionalProperties": true,
            "properties": {
              "currency": {
                "$ref": "#/components/schemas/BillingCurrencyCode"
              }
            },
            "required": [
              "currency"
            ]
          }
        ]
      },
      "BillingMoneyBreakdownRow": {
        "type": "object",
        "additionalProperties": true,
        "properties": {
          "label": {
            "type": "string",
            "example": "cash"
          },
          "currency": {
            "$ref": "#/components/schemas/BillingCurrencyCode"
          },
          "count": {
            "type": "number",
            "example": 4
          },
          "amount": {
            "type": "number",
            "example": 800
          }
        }
      },
      "BillingReportPeriod": {
        "type": "string",
        "enum": [
          "week",
          "month",
          "quarter",
          "year",
          "custom"
        ]
      },
      "BillingReportGroupBy": {
        "type": "string",
        "enum": [
          "day",
          "week",
          "month",
          "quarter",
          "year"
        ]
      },
      "BillingReportTrendBucket": {
        "type": "object",
        "additionalProperties": true,
        "properties": {
          "key": {
            "type": "string",
            "example": "2026-01"
          },
          "label": {
            "type": "string",
            "example": "Jan 2026"
          },
          "dateFrom": {
            "type": "string",
            "format": "date-time"
          },
          "dateTo": {
            "type": "string",
            "format": "date-time"
          },
          "currency": {
            "oneOf": [
              {
                "$ref": "#/components/schemas/BillingCurrencyCode"
              },
              {
                "type": "null"
              }
            ]
          },
          "currencies": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/BillingCurrencyCode"
            }
          },
          "mixedCurrencies": {
            "type": "boolean"
          },
          "summary": {
            "$ref": "#/components/schemas/BillingMoneySummary"
          },
          "summaryByCurrency": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/BillingReportSummaryByCurrency"
            }
          },
          "counts": {
            "type": "object",
            "additionalProperties": true,
            "properties": {
              "invoices": {
                "type": "integer",
                "minimum": 0
              },
              "payments": {
                "type": "integer",
                "minimum": 0
              },
              "refunds": {
                "type": "integer",
                "minimum": 0
              },
              "expenses": {
                "type": "integer",
                "minimum": 0
              }
            }
          }
        }
      },
      "BillingReportTrends": {
        "type": "object",
        "additionalProperties": true,
        "properties": {
          "period": {
            "oneOf": [
              {
                "$ref": "#/components/schemas/BillingReportPeriod"
              },
              {
                "type": "null"
              }
            ]
          },
          "periodAnchor": {
            "type": [
              "string",
              "null"
            ],
            "format": "date"
          },
          "groupBy": {
            "$ref": "#/components/schemas/BillingReportGroupBy"
          },
          "dateFrom": {
            "type": "string",
            "format": "date-time"
          },
          "dateTo": {
            "type": "string",
            "format": "date-time"
          },
          "buckets": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/BillingReportTrendBucket"
            }
          }
        }
      },
      "BillingExpense": {
        "type": "object",
        "additionalProperties": true,
        "properties": {
          "id": {
            "$ref": "#/components/schemas/ObjectId"
          },
          "number": {
            "type": "string",
            "example": "EXP-20260416-0001"
          },
          "category": {
            "type": "string",
            "example": "Supplies"
          },
          "amount": {
            "type": "number",
            "example": 45
          },
          "currency": {
            "$ref": "#/components/schemas/BillingCurrencyCode"
          },
          "expenseDate": {
            "type": "string",
            "format": "date-time"
          },
          "description": {
            "type": [
              "string",
              "null"
            ]
          },
          "createdAt": {
            "type": [
              "string",
              "null"
            ],
            "format": "date-time"
          }
        }
      },
      "BillingReport": {
        "type": "object",
        "additionalProperties": true,
        "properties": {
          "currency": {
            "oneOf": [
              {
                "$ref": "#/components/schemas/BillingCurrencyCode"
              },
              {
                "type": "null"
              }
            ]
          },
          "currencies": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/BillingCurrencyCode"
            }
          },
          "mixedCurrencies": {
            "type": "boolean"
          },
          "summaryCurrencyScope": {
            "type": "string",
            "enum": [
              "single",
              "mixed"
            ]
          },
          "exchangeRateApplied": {
            "type": "boolean",
            "description": "Always false; billing reports do not perform FX conversion."
          },
          "summary": {
            "$ref": "#/components/schemas/BillingMoneySummary"
          },
          "summaryByCurrency": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/BillingReportSummaryByCurrency"
            }
          },
          "trends": {
            "oneOf": [
              {
                "$ref": "#/components/schemas/BillingReportTrends"
              },
              {
                "type": "null"
              }
            ]
          },
          "breakdowns": {
            "type": "object",
            "additionalProperties": true,
            "properties": {
              "paymentsByMethod": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/BillingMoneyBreakdownRow"
                }
              },
              "invoiceTotalsByStatus": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/BillingMoneyBreakdownRow"
                }
              },
              "billedAmountByService": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/BillingMoneyBreakdownRow"
                }
              },
              "revenueByBillingService": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/BillingMoneyBreakdownRow"
                }
              },
              "expensesByCategory": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/BillingMoneyBreakdownRow"
                }
              },
              "overdueSummary": {
                "type": "object",
                "additionalProperties": true
              },
              "outstandingSummary": {
                "type": "object",
                "additionalProperties": true
              }
            }
          },
          "tables": {
            "type": "object",
            "additionalProperties": true
          }
        }
      },
      "BillingReportResponse": {
        "allOf": [
          {
            "$ref": "#/components/schemas/SuccessEnvelope"
          },
          {
            "type": "object",
            "additionalProperties": true,
            "properties": {
              "report": {
                "$ref": "#/components/schemas/BillingReport"
              }
            },
            "required": [
              "report"
            ]
          }
        ]
      },
      "BillingDashboard": {
        "type": "object",
        "additionalProperties": true,
        "properties": {
          "currency": {
            "oneOf": [
              {
                "$ref": "#/components/schemas/BillingCurrencyCode"
              },
              {
                "type": "null"
              }
            ]
          },
          "currencies": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/BillingCurrencyCode"
            }
          },
          "mixedCurrencies": {
            "type": "boolean"
          },
          "summaryCurrencyScope": {
            "type": "string",
            "enum": [
              "single",
              "mixed"
            ]
          },
          "exchangeRateApplied": {
            "type": "boolean"
          },
          "summary": {
            "$ref": "#/components/schemas/BillingMoneySummary"
          },
          "summaryByCurrency": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/BillingReportSummaryByCurrency"
            }
          },
          "trends": {
            "oneOf": [
              {
                "$ref": "#/components/schemas/BillingReportTrends"
              },
              {
                "type": "null"
              }
            ]
          },
          "charts": {
            "type": "object",
            "additionalProperties": true
          }
        }
      },
      "BillingDashboardResponse": {
        "allOf": [
          {
            "$ref": "#/components/schemas/SuccessEnvelope"
          },
          {
            "type": "object",
            "additionalProperties": true,
            "properties": {
              "dashboard": {
                "$ref": "#/components/schemas/BillingDashboard"
              }
            },
            "required": [
              "dashboard"
            ]
          }
        ]
      },
      "MultipartUploadRequest": {
        "type": "object",
        "additionalProperties": true,
        "properties": {
          "file": {
            "type": "string",
            "format": "binary",
            "description": "Uploaded file stream."
          },
          "title": {
            "type": "string"
          },
          "name": {
            "type": "string"
          },
          "category": {
            "type": "string"
          },
          "documentType": {
            "type": "string"
          },
          "description": {
            "type": "string"
          },
          "classification": {
            "type": "string"
          },
          "pdfMeta": {
            "type": "string",
            "description": "JSON-encoded PDF metadata where supported by the endpoint."
          }
        },
        "required": [
          "file"
        ]
      },
      "UploadedFile": {
        "type": "object",
        "additionalProperties": true,
        "properties": {
          "objectName": {
            "type": "string"
          },
          "key": {
            "type": "string"
          },
          "url": {
            "type": "string"
          },
          "mime": {
            "type": "string"
          },
          "mimeType": {
            "type": "string"
          },
          "size": {
            "type": "integer"
          },
          "sizeBytes": {
            "type": "integer"
          },
          "etag": {
            "type": "string"
          }
        }
      },
      "DownloadUrlEnvelope": {
        "allOf": [
          {
            "$ref": "#/components/schemas/SuccessEnvelope"
          },
          {
            "type": "object",
            "properties": {
              "key": {
                "type": "string",
                "description": "Storage object key when returned by the service."
              },
              "url": {
                "type": "string",
                "format": "uri",
                "description": "Compatibility alias for downloadUrl."
              },
              "downloadUrl": {
                "type": "string",
                "format": "uri"
              },
              "expiresIn": {
                "type": "integer",
                "description": "URL lifetime in seconds when returned by the service."
              },
              "fileName": {
                "type": "string"
              },
              "contentType": {
                "type": "string"
              },
              "file": {
                "$ref": "#/components/schemas/PatientFile"
              }
            }
          }
        ]
      },
      "PatientFile": {
        "type": "object",
        "additionalProperties": true,
        "properties": {
          "id": {
            "$ref": "#/components/schemas/ObjectId"
          },
          "patientId": {
            "$ref": "#/components/schemas/ObjectId"
          },
          "fileName": {
            "type": "string"
          },
          "originalName": {
            "type": "string"
          },
          "title": {
            "type": "string"
          },
          "mimeType": {
            "type": "string"
          },
          "mimeCategory": {
            "type": "string"
          },
          "previewType": {
            "type": "string"
          },
          "sizeBytes": {
            "type": "integer"
          },
          "classification": {
            "type": "string"
          },
          "uploadedByRole": {
            "$ref": "#/components/schemas/UserRole"
          },
          "uploadedAt": {
            "type": "string",
            "format": "date-time"
          }
        }
      },
      "Appointment": {
        "type": "object",
        "additionalProperties": true,
        "properties": {
          "id": {
            "$ref": "#/components/schemas/ObjectId"
          },
          "doctorId": {
            "$ref": "#/components/schemas/ObjectId"
          },
          "patientId": {
            "$ref": "#/components/schemas/ObjectId"
          },
          "patient": {
            "oneOf": [
              {
                "type": "object",
                "additionalProperties": true,
                "properties": {
                  "_id": {
                    "$ref": "#/components/schemas/ObjectId"
                  },
                  "publicId": {
                    "type": "string"
                  },
                  "userId": {
                    "type": "object",
                    "additionalProperties": true,
                    "properties": {
                      "_id": {
                        "$ref": "#/components/schemas/ObjectId"
                      },
                      "fullName": {
                        "type": "string"
                      }
                    }
                  }
                }
              },
              {
                "$ref": "#/components/schemas/ObjectId"
              }
            ],
            "description": "Admin, doctor, and secretary list responses include publicId and userId.fullName."
          },
          "date": {
            "type": "string",
            "format": "date"
          },
          "startTime": {
            "type": "string",
            "example": "09:30"
          },
          "status": {
            "type": "string"
          },
          "appointmentTypeId": {
            "$ref": "#/components/schemas/ObjectId"
          },
          "appointmentTypeName": {
            "type": "string"
          },
          "appointmentTypePrice": {
            "type": "number"
          },
          "encounter": {
            "oneOf": [
              {
                "$ref": "#/components/schemas/AppointmentEncounterSummary"
              },
              {
                "type": "null"
              }
            ],
            "description": "Compact linked encounter summary for appointment retrieval responses. Encounter clinical notes are intentionally omitted."
          }
        }
      },
      "AppointmentEncounterSummary": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "_id": {
            "$ref": "#/components/schemas/ObjectId"
          },
          "status": {
            "type": "string",
            "enum": [
              "open",
              "closed"
            ]
          },
          "origin": {
            "type": "string",
            "enum": [
              "appointment",
              "walk_in",
              "manual",
              "follow_up"
            ]
          },
          "startedAt": {
            "type": "string",
            "format": "date-time"
          },
          "closedAt": {
            "oneOf": [
              {
                "type": "string",
                "format": "date-time"
              },
              {
                "type": "null"
              }
            ]
          }
        },
        "required": [
          "_id",
          "status",
          "origin",
          "startedAt",
          "closedAt"
        ]
      },
      "AppointmentListResponse": {
        "allOf": [
          {
            "$ref": "#/components/schemas/SuccessEnvelope"
          },
          {
            "type": "object",
            "additionalProperties": true,
            "properties": {
              "page": {
                "type": "integer",
                "minimum": 1
              },
              "limit": {
                "type": "integer",
                "minimum": 1
              },
              "total": {
                "type": "integer",
                "minimum": 0
              },
              "results": {
                "type": "integer",
                "minimum": 0
              },
              "appointments": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/Appointment"
                }
              }
            },
            "required": [
              "page",
              "limit",
              "total",
              "results",
              "appointments"
            ]
          }
        ]
      },
      "AppointmentDetailResponse": {
        "allOf": [
          {
            "$ref": "#/components/schemas/SuccessEnvelope"
          },
          {
            "type": "object",
            "additionalProperties": true,
            "properties": {
              "appointment": {
                "$ref": "#/components/schemas/Appointment"
              },
              "files": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/PatientFile"
                }
              }
            },
            "required": [
              "appointment",
              "files"
            ]
          }
        ]
      },
      "Encounter": {
        "type": "object",
        "additionalProperties": true,
        "properties": {
          "_id": {
            "$ref": "#/components/schemas/ObjectId"
          },
          "id": {
            "$ref": "#/components/schemas/ObjectId"
          },
          "patientId": {
            "$ref": "#/components/schemas/ObjectId"
          },
          "patient": {
            "type": "object",
            "additionalProperties": true
          },
          "doctorId": {
            "$ref": "#/components/schemas/ObjectId"
          },
          "doctor": {
            "type": "object",
            "additionalProperties": true
          },
          "appointmentId": {
            "$ref": "#/components/schemas/ObjectId"
          },
          "appointment": {
            "type": "object",
            "nullable": true,
            "additionalProperties": true
          },
          "origin": {
            "type": "string",
            "enum": [
              "appointment",
              "walk_in",
              "manual",
              "follow_up"
            ]
          },
          "status": {
            "type": "string",
            "enum": [
              "open",
              "closed"
            ]
          },
          "startedAt": {
            "type": "string",
            "format": "date-time"
          },
          "closedAt": {
            "type": "string",
            "nullable": true,
            "format": "date-time"
          },
          "notes": {
            "type": "string"
          },
          "createdAt": {
            "type": "string",
            "format": "date-time"
          },
          "updatedAt": {
            "type": "string",
            "format": "date-time"
          }
        }
      },
      "EncounterListResponse": {
        "allOf": [
          {
            "$ref": "#/components/schemas/SuccessEnvelope"
          },
          {
            "type": "object",
            "additionalProperties": true,
            "properties": {
              "page": {
                "type": "integer",
                "minimum": 1
              },
              "limit": {
                "type": "integer",
                "minimum": 1
              },
              "total": {
                "type": "integer",
                "minimum": 0
              },
              "results": {
                "type": "integer",
                "minimum": 0
              },
              "encounters": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/Encounter"
                }
              }
            },
            "required": [
              "page",
              "limit",
              "total",
              "results",
              "encounters"
            ]
          }
        ]
      },
      "Prescription": {
        "type": "object",
        "additionalProperties": true,
        "properties": {
          "id": {
            "$ref": "#/components/schemas/ObjectId"
          },
          "patientId": {
            "$ref": "#/components/schemas/ObjectId"
          },
          "doctorId": {
            "$ref": "#/components/schemas/ObjectId"
          },
          "encounterId": {
            "$ref": "#/components/schemas/ObjectId"
          },
          "medications": {
            "type": "array",
            "items": {
              "type": "object",
              "additionalProperties": true
            }
          }
        }
      },
      "Order": {
        "type": "object",
        "additionalProperties": true,
        "properties": {
          "id": {
            "$ref": "#/components/schemas/ObjectId"
          },
          "type": {
            "type": "string",
            "enum": [
              "LAB_ORDER",
              "IMAGING_ORDER",
              "PROCEDURE_ORDER",
              "REFERRAL_ORDER"
            ]
          },
          "status": {
            "type": "string"
          },
          "patientId": {
            "$ref": "#/components/schemas/ObjectId"
          },
          "doctorId": {
            "$ref": "#/components/schemas/ObjectId"
          },
          "encounterId": {
            "$ref": "#/components/schemas/ObjectId"
          }
        }
      },
      "Facility": {
        "type": "object",
        "additionalProperties": true,
        "properties": {
          "id": {
            "$ref": "#/components/schemas/ObjectId"
          },
          "name": {
            "type": "string"
          },
          "city": {
            "type": "string"
          },
          "country": {
            "type": "string"
          },
          "type": {
            "type": "string"
          },
          "attributes": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "status": {
            "type": "string"
          }
        }
      },
      "BillingRefundStatus": {
        "type": "string",
        "enum": [
          "not_refunded",
          "partially_refunded",
          "refunded"
        ]
      },
      "BillingPatientSummary": {
        "type": "object",
        "additionalProperties": true,
        "properties": {
          "id": {
            "$ref": "#/components/schemas/ObjectId"
          },
          "publicId": {
            "type": "string"
          },
          "fullName": {
            "type": "string"
          }
        }
      },
      "BillingInvoiceItem": {
        "type": "object",
        "additionalProperties": true,
        "properties": {
          "id": {
            "$ref": "#/components/schemas/ObjectId"
          },
          "billingServiceId": {
            "$ref": "#/components/schemas/ObjectId"
          },
          "appointmentTypeId": {
            "$ref": "#/components/schemas/ObjectId"
          },
          "serviceNameSnapshot": {
            "type": "string"
          },
          "description": {
            "type": "string"
          },
          "quantity": {
            "type": "number"
          },
          "unitPrice": {
            "type": "number"
          },
          "lineTotal": {
            "type": "number"
          }
        }
      },
      "BillingInvoicePayment": {
        "type": "object",
        "additionalProperties": true,
        "properties": {
          "id": {
            "$ref": "#/components/schemas/ObjectId"
          },
          "number": {
            "type": "string"
          },
          "amount": {
            "type": "number"
          },
          "refundedAmount": {
            "type": "number"
          },
          "refundableAmount": {
            "type": "number"
          },
          "refundStatus": {
            "$ref": "#/components/schemas/BillingRefundStatus"
          },
          "method": {
            "type": "string",
            "enum": [
              "cash",
              "card",
              "bank_transfer",
              "insurance"
            ]
          },
          "paidAt": {
            "type": "string",
            "format": "date-time"
          },
          "note": {
            "type": "string"
          },
          "createdAt": {
            "type": "string",
            "format": "date-time"
          }
        }
      },
      "BillingInvoiceRefund": {
        "type": "object",
        "additionalProperties": true,
        "properties": {
          "id": {
            "$ref": "#/components/schemas/ObjectId"
          },
          "number": {
            "type": "string"
          },
          "paymentId": {
            "$ref": "#/components/schemas/ObjectId"
          },
          "amount": {
            "type": "number"
          },
          "reason": {
            "type": "string"
          },
          "refundedAt": {
            "type": "string",
            "format": "date-time"
          },
          "createdAt": {
            "type": "string",
            "format": "date-time"
          }
        }
      },
      "BillingInvoice": {
        "type": "object",
        "additionalProperties": true,
        "properties": {
          "id": {
            "$ref": "#/components/schemas/ObjectId"
          },
          "number": {
            "type": "string"
          },
          "sourceType": {
            "type": "string",
            "enum": [
              "manual",
              "visit"
            ]
          },
          "status": {
            "type": "string",
            "enum": [
              "draft",
              "issued",
              "partial",
              "paid",
              "overdue",
              "cancelled"
            ]
          },
          "refundStatus": {
            "$ref": "#/components/schemas/BillingRefundStatus"
          },
          "patient": {
            "$ref": "#/components/schemas/BillingPatientSummary"
          },
          "appointmentId": {
            "$ref": "#/components/schemas/ObjectId"
          },
          "currency": {
            "type": "string"
          },
          "taxEnabled": {
            "type": "boolean"
          },
          "taxPercent": {
            "type": "number"
          },
          "discountPercent": {
            "type": "number"
          },
          "subtotal": {
            "type": "number"
          },
          "discountAmount": {
            "type": "number"
          },
          "taxableBase": {
            "type": "number"
          },
          "taxAmount": {
            "type": "number"
          },
          "total": {
            "type": "number"
          },
          "grossPaid": {
            "type": "number"
          },
          "totalRefunded": {
            "type": "number"
          },
          "netPaid": {
            "type": "number"
          },
          "remaining": {
            "type": "number"
          },
          "issuedAt": {
            "type": "string",
            "format": "date-time"
          },
          "dueAt": {
            "type": "string",
            "format": "date-time"
          },
          "cancelledAt": {
            "type": "string",
            "format": "date-time"
          },
          "cancelledReason": {
            "type": "string"
          },
          "notes": {
            "type": "string"
          },
          "items": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/BillingInvoiceItem"
            }
          },
          "payments": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/BillingInvoicePayment"
            }
          },
          "refunds": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/BillingInvoiceRefund"
            }
          },
          "createdAt": {
            "type": "string",
            "format": "date-time"
          },
          "updatedAt": {
            "type": "string",
            "format": "date-time"
          }
        }
      },
      "BillingInvoiceDetailEnvelope": {
        "allOf": [
          {
            "$ref": "#/components/schemas/SuccessEnvelope"
          },
          {
            "type": "object",
            "properties": {
              "invoice": {
                "$ref": "#/components/schemas/BillingInvoice"
              }
            }
          }
        ]
      },
      "SecretaryPermission": {
        "type": "string",
        "enum": [
          "appointments:book",
          "appointments:view",
          "appointments:edit",
          "appointments:cancel",
          "waitlist:create",
          "waitlist:view",
          "waitlist:manage",
          "waitlist:book",
          "patients:view",
          "patients:edit",
          "patients:temporary:create",
          "patients:files:view",
          "patients:files:upload",
          "schedule:view",
          "billing:dashboard:view",
          "billing:invoices:view",
          "billing:invoices:manage",
          "billing:payments:view",
          "billing:payments:manage",
          "billing:refunds:view",
          "billing:refunds:manage",
          "billing:expenses:view",
          "billing:expenses:manage",
          "billing:reports:view",
          "billing:reports:export",
          "billing:settings:view",
          "billing:settings:manage",
          "billing:services:view",
          "billing:services:manage"
        ]
      },
      "SecretarySelfSummary": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "_id",
          "permissions",
          "assignedDoctor"
        ],
        "properties": {
          "_id": {
            "$ref": "#/components/schemas/ObjectId"
          },
          "permissions": {
            "type": "array",
            "description": "Exact permissions delegated to the authenticated secretary.",
            "items": {
              "$ref": "#/components/schemas/SecretaryPermission"
            }
          },
          "assignedDoctor": {
            "$ref": "#/components/schemas/ObjectId"
          }
        }
      },
      "SecretaryAssignedDoctorUserSummary": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "_id"
        ],
        "properties": {
          "_id": {
            "$ref": "#/components/schemas/ObjectId"
          },
          "fullName": {
            "type": "string"
          },
          "email": {
            "type": "string",
            "format": "email"
          },
          "phone": {
            "type": "string"
          },
          "gender": {
            "type": "string"
          },
          "photoUrl": {
            "type": "string"
          }
        }
      },
      "SecretaryAssignedDoctorSummary": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "_id",
          "consultationTypes",
          "averageRating",
          "totalReviews",
          "isApproved",
          "user"
        ],
        "properties": {
          "_id": {
            "$ref": "#/components/schemas/ObjectId"
          },
          "specialization": {
            "type": "string"
          },
          "medicalLicenseNumber": {
            "type": "string"
          },
          "locationCity": {
            "type": "string"
          },
          "locationCountry": {
            "type": "string"
          },
          "consultationTypes": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "consultationFee": {
            "type": "number"
          },
          "averageRating": {
            "type": "number"
          },
          "totalReviews": {
            "type": "integer"
          },
          "approvalStatus": {
            "type": "string"
          },
          "isApproved": {
            "type": "boolean"
          },
          "user": {
            "allOf": [
              {
                "$ref": "#/components/schemas/SecretaryAssignedDoctorUserSummary"
              }
            ],
            "nullable": true
          }
        }
      },
      "SecretaryAssignedDoctorResponse": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "secretary",
          "doctor"
        ],
        "properties": {
          "secretary": {
            "$ref": "#/components/schemas/SecretarySelfSummary"
          },
          "doctor": {
            "$ref": "#/components/schemas/SecretaryAssignedDoctorSummary"
          }
        }
      },
      "PdfGenerationRequest": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "type": {
            "type": "string",
            "enum": [
              "order",
              "prescription",
              "diagnosis"
            ]
          },
          "sourceId": {
            "$ref": "#/components/schemas/ObjectId"
          },
          "lang": {
            "type": "string",
            "enum": [
              "en",
              "ar"
            ]
          }
        },
        "required": [
          "type",
          "sourceId"
        ]
      }
    },
    "examples": {
      "SuccessEnvelope": {
        "summary": "Localized success envelope",
        "value": {
          "messageKey": "success.ok",
          "message": "OK"
        }
      },
      "CreatedEnvelope": {
        "summary": "Created resource envelope",
        "value": {
          "messageKey": "success.created",
          "message": "Created",
          "data": {
            "id": "64f0c0000000000000000001"
          }
        }
      },
      "ErrorEnvelope": {
        "summary": "Localized error envelope",
        "value": {
          "status": 422,
          "messageKey": "errors.validationFailed",
          "message": "Validation failed",
          "errors": [
            {
              "type": "field",
              "path": "email",
              "location": "body",
              "msg": "Invalid email"
            }
          ]
        }
      },
      "AuthTokens": {
        "summary": "Session-backed auth token payload",
        "value": {
          "messageKey": "success.auth.login",
          "message": "Login successful",
          "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access...",
          "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          "refreshExpiresAt": "2026-06-17T10:00:00.000Z",
          "user": {
            "id": "64f0c0000000000000000001",
            "role": "patient",
            "fullName": "Patient Example"
          },
          "actorIds": {
            "patientId": "64f0c0000000000000000001",
            "doctorId": null,
            "secretaryId": null,
            "assignedDoctorId": null
          }
        }
      },
      "DownloadUrl": {
        "summary": "Presigned download URL response",
        "value": {
          "messageKey": "success.files.downloadUrlGenerated",
          "message": "Download URL generated",
          "key": "files/example/report.pdf",
          "url": "https://files.example.test/presigned",
          "downloadUrl": "https://files.example.test/presigned",
          "expiresIn": 900,
          "fileName": "report.pdf",
          "contentType": "application/pdf"
        }
      },
      "MultipartUpload": {
        "summary": "Multipart file upload",
        "value": {
          "file": "<binary>",
          "title": "Lab report",
          "category": "lab_report",
          "description": "Uploaded from mobile app"
        }
      },
      "PdfBinary": {
        "summary": "Binary PDF response",
        "value": "<binary PDF bytes>"
      }
    }
  },
  "x-doc-audience": {
    "slug": "secretary",
    "role": "secretary",
    "publicOnly": false
  }
}
