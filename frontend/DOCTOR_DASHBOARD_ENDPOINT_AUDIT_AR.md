# Doctor Dashboard API Coverage Audit

## Scope

This audit is intentionally limited to the **doctor dashboard page only**:

- Route: `/doctor/dashboard`
- Page: `frontend/src/pages/doctor/dashboard/DoctorDashboardPage.tsx`
- Main shell: `frontend/src/components/doctor/dashboard/home-doctor.tsx`
- Dashboard widgets directly rendered there

Excluded on purpose:

- Patient dashboard
- Other doctor portal pages such as patients, appointments, records, encounters, profile settings, billing screens
- Admin scope

## Executive Summary

- Total dashboard capability clusters reviewed: `7`
- Status counts:
  - Complete: `7`
  - Partial: `0`
  - Missing: `0`
  - N/A: `0`
- The doctor dashboard is now mostly backend-driven.
- Core live integrations now in place:
  - `/api/doctors/home/snapshot`
  - `/api/doctors/analytics/summary`
  - `/api/doctors/analytics/diagnosis`
  - `/api/appointments`
  - `/api/doctors/patients`
  - `/api/doctors/internal/directory`
- No patient-dashboard work is included in this report.

## Coverage Matrix

| Domain | Method | Path | Roles | Status | Frontend evidence | Notes |
|---|---|---|---|---|---|---|
| Dashboard snapshot | `GET` | `/api/doctors/home/snapshot` | doctor | Complete | `src/lib/doctor/homeSnapshot.ts`, `src/hooks/doctor/useDoctorHomeSnapshot.ts`, `src/components/doctor/dashboard/home-doctor.tsx` | Drives KPI cards and summary widgets |
| Dashboard summary analytics | `GET` | `/api/doctors/analytics/summary` | doctor | Complete | `src/lib/doctor/endpoints.ts`, `src/hooks/doctor/useDashboardStats.ts`, `src/components/doctor/dashboard/home-doctor.tsx` | Replaced old mock stats |
| Diagnosis analytics | `GET` | `/api/doctors/analytics/diagnosis` | doctor | Complete | `src/hooks/doctor/useDoctorDiagnosisAnalytics.ts`, `src/components/doctor/dashboard/diagnosis-analytics-section.tsx`, `src/lib/doctor/endpoints.ts` | Live diagnosis widget present |
| Today appointments | `GET` | `/api/appointments` | doctor | Complete | `src/hooks/doctor/useDoctorAppointmentsApi.ts`, `src/lib/doctor/client.ts`, `src/components/doctor/dashboard/home-doctor.tsx` | Mock fallback removed from dashboard |
| Quick patient search | `GET` | `/api/doctors/patients` | doctor | Complete | `src/hooks/doctor/useDashboardPatientsSearch.ts`, `src/hooks/doctor/useDoctorPatients.ts`, `src/lib/doctor/client.ts` | Live search table/card |
| Self rating | `GET` | `/api/doctors/internal/directory` | doctor, secretary | Complete | `src/hooks/doctor/useDoctorSelfRating.ts`, `src/components/doctor/dashboard/home-doctor.tsx` | Used to render live rating |
| Active consultation + waitlist summary | `GET` | `/api/doctors/home/snapshot` plus consultation/waitlist domains | doctor | Complete | `src/lib/doctor/homeSnapshotMappers.ts`, `src/components/doctor/dashboard/active-consultations-section.tsx`, `src/components/doctor/dashboard/consultations-waiting-section.tsx` | Deep-links to consultations (`?ticket=`) and waitlist (`?request=`) |

## Detailed Gap Backlog

### Resolved (2026-06)

- **Active consultation widget** — CTA deep-links to `/doctor/online-consultations?ticket=…`
- **Waitlist widget** — CTA deep-links to `/doctor/waitlist?request=…` with row highlight
- **Dashboard errors** — standardized via `getUserFacingRequestErrorMessage` in `home-doctor.tsx`

## Quick Wins

1. ~~Add dashboard CTA for active consultation resume.~~ Done
2. ~~Add dashboard CTA for nearest waitlist item.~~ Done
3. ~~Standardize dashboard error copy to use the shared request error formatter.~~ Done

## Current State Conclusion

The doctor dashboard is no longer mock-driven in its main data paths.

What is now live:

- snapshot
- summary stats
- diagnosis analytics
- today appointments
- patient quick search
- self rating

What remains partially integrated:

- None on the dashboard page itself.

So the most accurate current label is:

- **Doctor dashboard: complete for API-3 snapshot-driven widgets**
