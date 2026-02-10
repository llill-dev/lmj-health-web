# lmj-health-web
Frontend application for the LMJ Health medical platform, built with Next.js and Tailwind CSS, supporting multi-role dashboards (patients, doctors, admins) with medical-grade UX and security.
Emad Alsmadi, [2/10/2026 7:20 PM]
Frontend application for the LMJ Health medical platform, built with Next.js and Tailwind CSS, supporting multi-role dashboards (patients, doctors, admins) with medical-grade UX and security.

Emad Alsmadi, [2/10/2026 7:21 PM]
# LMJ Health – Frontend Application

A production-grade frontend application for LMJ Health, a modern digital healthcare platform designed to support patients, doctors, administrators, secretaries, and data-entry users through a secure and scalable web interface.

This repository contains the frontend codebase only, built with a strong focus on:
- Medical-grade UX
- Role-based access control
- Data privacy and security
- Scalability and maintainability

---

## 🏥 Project Overview

LMJ Health is a multi-role medical platform that enables:
- Patient profile and medical record access
- Doctor onboarding and verification
- Appointment scheduling and availability management
- Consultation tickets and follow-up communication
- Administrative governance and approvals
- Dynamic healthcare service directories
- Location-based doctor discovery (geospatial search)

The frontend is designed to act as a secure presentation layer on top of a centralized backend API, strictly respecting permission boundaries and medical data sensitivity.

---

## 🧱 Tech Stack

- Framework: Next.js (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- UI Components: shadcn/ui + Radix UI
- State & Data Fetching: TanStack Query (React Query)
- Forms & Validation: react-hook-form + Zod
- Authentication: JWT via httpOnly cookies
- Routing & Access Control: Middleware-based protection

---

## 🧠 Architectural Principles

This frontend follows a governance-first architecture, designed specifically for healthcare systems:

- Clear separation of concerns (pages, components, services, hooks)
- Role-based routing and conditional rendering
- No business logic leakage into UI layers
- Predictable state management for medical workflows
- Audit-aware UI patterns for sensitive actions

---

## 👥 Supported User Roles

- Patients – Access personal health data, appointments, and consultations
- Doctors – Manage schedules, patients, medical records, and consultations
- Secretaries – Operate under delegated doctor permissions
- Administrators – Approvals, oversight, and platform governance
- Data-entry Users – Maintain service catalogs and operational data

Each role has isolated UI flows and permission-aware interfaces.

---

## 🔐 Security & Privacy Considerations

- No sensitive data stored in localStorage
- Role and permission checks enforced at routing and UI level
- API access secured via backend-issued JWT cookies
- Geolocation and medical data handled with strict boundaries
- Designed to align with healthcare data protection best practices

---

## 🚀 Getting Started

`bash
npm install
npm run dev
