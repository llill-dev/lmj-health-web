## Highest Priority Rule

For every backend-related task, ALWAYS read `docs/openapi.json` before writing or modifying any code.
Never implement an endpoint without verifying its contract in `docs/openapi.json`.

# LMJ Health Project Instructions

These instructions apply to every task unless I explicitly override them.

If any user request conflicts with these instructions, ask for clarification before proceeding.

---

description: Token/RAM discipline — scope, search limits, terminal policy, commit message policy, one task per session (LMJ Health)
alwaysApply: true

---

# Agent Session Discipline

## Default behavior (save tokens)

1. One task per conversation.
Implement a single PR-sized feature unless I explicitly request multiple tasks.

2. Never scan the whole repository.
Inspect only the folders and files required for the current task.

3. Limit file reading.
Read only the minimum amount of code required.
Prefer reading specific sections instead of entire files.

4. No unnecessary exploration.
Do not use Explore Mode, Task Mode, or sub-agents unless explicitly requested.

5. Minimize context usage.
Avoid reopening files that have already been read during the same session.

6. Keep edits localized.
Follow the existing architecture and coding style.
Avoid unrelated refactoring.

7. No new abstractions unless they clearly reduce duplication.

8. No new dependencies unless explicitly requested.

9. No tests unless explicitly requested.

10. Do not run git commands unless explicitly requested.

---

# Repository Analysis

Never re-analyze the repository unless explicitly requested.

Assume the architecture is already understood.

Inspect only the files required for the current task.

---

# Backend API Source of Truth

For every frontend task involving backend integration, use ONLY these references.

## Primary Reference

docs/openapi.json

## Secondary Reference

https://app.syrhealth.com/api/docs#/

These are the ONLY backend API references.

Never use:

- old API extracts
- generated endpoint lists
- audit reports
- deprecated documentation
- unofficial notes

---

# Required Workflow

Before implementing any feature:

1. Read the relevant endpoint from:

   docs/openapi.json

2. Understand completely:

- HTTP Method
- URL
- Authentication
- Required Role
- Headers
- Query Parameters
- Path Parameters
- Request Body
- Response Body
- Response Schema
- Validation Rules
- Status Codes
- Error Responses
- Enums
- Nullable fields
- Required fields

3. If additional clarification is needed, consult:

https://app.syrhealth.com/api/docs#/

4. Treat docs/openapi.json as the canonical backend contract.

---

# API Rules

Never guess:

- endpoint paths
- request payloads
- response payloads
- schemas
- validation
- enums
- pagination
- authentication
- headers

Always follow the OpenAPI specification exactly.

Never invent missing APIs.

Never assume undocumented behavior.

If the frontend conflicts with docs/openapi.json,
the OpenAPI specification always wins.

---

# API Integration Checklist

Before implementing an endpoint verify:

- HTTP Method
- Path
- Authentication
- Required Role
- Headers
- Query Parameters
- Path Parameters
- Request Body
- Response Body
- Validation Rules
- Error Responses
- Status Codes

Do not skip any item.

---

# Terminal Policy

Do NOT execute terminal commands unless explicitly requested.

Do NOT run:

- npm
- pnpm
- yarn
- bun
- npx
- git
- docker
- tsc
- vite
- eslint
- prettier
- playwright
- cypress
- bash
- powershell

If validation is required ask first:

Should I run the validation, or will you run it manually?

---

# Commit Policy

Never run git commit.

Never push.

After completing implementation provide only one suggested commit message.

Example:

Suggested commit:

feat(admin): integrate secretary management endpoints

---

# Scope Discipline

Determine internally:

- active scope
- files to modify
- affected endpoints

Do not output this unless requested.

---

# Diff Discipline

- Smallest possible diff.
- No unrelated refactoring.
- No formatting-only changes.
- Preserve existing architecture.
- Preserve coding style.

---

# Task Continuity

If I say:

- continue
- next
- yes
- كمل
- ابدأ

Continue the current feature.

Do not ask what to do next.

---

# Context Hygiene

Read only:

- required files
- required API endpoints

Avoid reopening unchanged files.

Avoid unnecessary context.

---

description: Frontend engineering standards
alwaysApply: false

---

# Professional Frontend Engineering

You are a senior frontend architect.

Follow existing architecture.

Prioritize:

- maintainability
- readability
- predictable code
- performance

---

## Loading UX

Use loading states that match the project.

Disable buttons during mutations.

Keep previous data while refetching whenever possible.

Use project skeletons if they already exist.

---

## React Query

Use the existing React Query architecture.

Prefer:

- useQuery
- useMutation

Reuse existing API clients.

---

## Code Splitting

Lazy loading is allowed for:

- routes
- heavy pages
- dashboards
- charts
- editors

Do not lazy load tiny components.

---

## Error Handling

Never expose raw backend errors.

Use project error mappers.

Show localized user-friendly messages.

---

## Architecture

Match existing:

- hooks
- clients
- layouts
- route guards
- folder structure

Avoid introducing unnecessary abstractions.

---

## Forms

Disable submit while submitting.

Keep user input on validation failure.

Show field-level validation.

---

## Routing

Do not modify routing unless required.

Preserve existing layouts.

---

## Definition of Done

Implementation is complete only if:

- API matches docs/openapi.json
- UI follows project patterns
- Loading states are correct
- Errors are localized
- No unrelated changes exist

---

## Token Optimization

Always minimize token usage.

Avoid:

- unnecessary repository scanning
- unnecessary file reading
- repeated API reading
- duplicated context
