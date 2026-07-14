# LMJ Health Project Instructions

These instructions apply to every task unless I explicitly override them.

If any user request conflicts with these instructions, ask for clarification before proceeding.

---
description: Token/RAM discipline — scope, search limits, terminal policy, commit message policy, one task per session (LMJ Health)
alwaysApply: true
---

# Agent Session Discipline

## Default behavior (save tokens)

1. **One task per conversation** — implement a single PR-sized item unless the user explicitly lists multiple tasks.

2. **Never scan the whole repository.**
   Only inspect the folders or files required for the current task.
   Never grep/read the full project unless explicitly requested.



3. **Limit file reading.**
   Read only the minimum amount of code needed.
   Prefer opening specific sections instead of entire files.

4. **API lookup order**
   - `api3_endpoint_index.txt`
   - Read only the matching endpoint section from `api_latest_extracted.txt`
   - Never read deprecated API extracts or long audit reports unless requested.

5. **No unnecessary exploration.**
   Do not use Explore Mode, Task Mode, or sub-agents for simple or localized tasks.

6. **Minimize context usage.**
   Never reload files that were already read during the same session unless they changed.

7. **Keep edits localized.**
   Match the existing architecture and coding style.
   Avoid unrelated refactoring.

8. **No new abstractions** unless they clearly reduce duplication or the user explicitly requests them.

9. **No new dependencies** unless the user asks.

10. **No tests** unless requested.

11. **No commit or push** unless the user explicitly says:
    - commit
    - push
    - create commit

---


### Repository Analysis

12. **Never re-analyze the project architecture** after the first session unless the user explicitly requests a full analysis.

13. Assume the existing architecture, routing, and folder structure are already understood.

14. Inspect only the files required for the current task.

# Terminal Policy (Important)

## By default

Do NOT execute terminal commands.

Do NOT run:

- npm
- npx
- pnpm
- yarn
- bun
- tsc
- eslint
- prettier
- vite
- build
- test
- playwright
- cypress
- git
- docker
- bash
- powershell
- any shell command

unless the user explicitly requests it.

---

## If validation is required

Ask first:

> Should I run the validation, or will you run it manually?

Do not assume permission.

---

# Commit Message Policy

After any completed code change, bug fix, refactor, or feature addition:

- Do NOT run `git commit`.
- Do NOT run any git command.
- Provide one short English commit message only.
- Keep it concise and conventional.
- Do not include long explanations.
- Do not include multiple commit options unless the user asks.

Format:

```text
Suggested commit:
fix(scope): short description
```

Examples:

```text
Suggested commit:
fix(admin): align content edit dialog with update endpoint
```

```text
Suggested commit:
feat(doctor): add encounter order manual entry flow
```

```text
Suggested commit:
refactor(auth): simplify protected route handling
```

---

# Scope Discipline

# Scope Discipline

Before editing, determine internally:

- active scope
- files to modify
- API endpoint, if applicable
- explicit out-of-scope areas

Do not output this scope summary unless the user explicitly asks for it.

---

# Vague Continuations

If the user says:

- continue
- yes
- next
- ابدأ
- كمل
- الخطوة التالية

Continue with the next logical unfinished item inside the current active feature.

Do not ask for clarification unless:

- no active feature exists,
- multiple unrelated scopes are equally possible,
- or a required API contract or business rule is missing.

Never resume the entire project backlog from a vague continuation.

# Prompt Template

Preferred prompt format:

Scope:
[folder/files]

Goal:
[one sentence]

Source:
api_latest_extracted — [METHOD path]

Constraints:

- no repository scan
- no terminal
- no commit
- max N files

Success:

- code completed
- validation command provided
- suggested commit message provided

---

# Context / RAM Hygiene

- Read one file at a time.
- Read only the required sections.
- Avoid reopening files already inspected.
- Never reload large files unless necessary.
- Never reload API documentation already used.
- Keep memory focused on the active task only.

---

# Cached Knowledge

During the current conversation:

- Reuse previously verified API contracts.
- Reuse previously inspected file structures.
- Do not reopen API documentation that was already verified.
- Do not repeat repository discovery.

# Diff Discipline

- Smallest possible diff.
- No formatting-only changes.
- No unrelated renaming.
- No import cleanup outside edited files.
- No drive-by fixes.
- Preserve existing coding patterns.

---

# Task Continuity

When working on the same feature:

- Continue completing all related fixes without stopping.
- Do not stop after every small change.
- Do not ask "continue?".
- Do not ask "what next?".
- Stop only when:
  - the requested feature is fully completed, or
  - a required business rule is missing, or
  - an API contract is missing.

# Response Style

At the end of every completed task, return ONLY:

```text
Suggested commit:
type(scope): short description
```

Rules:

- Do not output Changed.
- Do not output Files.
- Do not output Validation command.
- Do not output Notes.
- Do not summarize the implementation.
- Do not explain what was modified.
- Keep the commit message concise.

# Conversation Behavior

Within the current conversation:

- Never ask for confirmation after every small implementation.
- Continue until the requested scope is finished.
- Do not ask which backlog item comes next.
- Assume the user wants all related work within the current feature completed unless explicitly told to stop.

# Completion Policy

A task is considered complete only when:

- All related UI fixes are implemented.
- Related API integration is completed.
- No remaining obvious issues exist in the current scope.

Only then stop and return the final commit message.

# Arabic-first UX

- User-facing messages should remain Arabic where the project already uses Arabic helpers.
- Keep technical implementation in English.
- Do not translate code.
- Preserve existing localization patterns.

---

description: Canonical LMJ Health Backend API (API-3) reference for frontend integration
alwaysApply: true

---

# LMJ Health API — API-3 only

Use this rule when wiring endpoints, verifying contracts, or reviewing API behavior. **Do not guess paths** — look them up in the repo extracts.

## Files in this repo (sole sources)

| File                          | Role                                                                                                     |
| ----------------------------- | -------------------------------------------------------------------------------------------------------- |
| `api_latest_extracted.txt`    | **Full API-3 extract** — from API (1)-3.pdf, v**2026.05.10** (~11k lines). **Only** canonical body text. |
| `api3_endpoint_index.txt`     | **Quick index** — ~330 `METHOD path` patterns; **grep here first**.                                      |
| `api_extracted_manifest.json` | Version metadata (`2026.05.10`) and search tips only — not endpoint detail.                              |

There is **no** `api3_extracted.txt`, `api2_extracted.txt`, `api4_extracted.txt`, or `api3_vs_api2_delta.txt` in the repo. Do not reference or search for them.

## Lookup workflow (token-efficient)

1. Search `api3_endpoint_index.txt` first using Cursor search.
   Use scoped grep only if terminal execution is explicitly allowed.
2. **Read only the matching section** in `api_latest_extracted.txt` (offset/limit from grep line number). Never load the full file.
3. Confirm from that section: **auth role**, **query/body**, **response shape**, **status codes**, **`messageKey` errors**, legacy aliases.
4. Match **existing frontend** patterns: `frontend/src/lib/<domain>/endpoints.ts`, `client.ts`, hooks under `frontend/src/hooks/`.

## Extract format

Prose sections (not OpenAPI). Per endpoint: `METHOD path`, description, auth, params, body, response, notes.

- Machine table near end: search `Method Path Role Summary` in `api_latest_extracted.txt`.
- Global rules: search `Frontend Integration Guide` once per feature area.

## Path prefixes

- **Frontend** uses `/api/...` in `endpoints.ts`.
- **Extract** may omit `/api` (e.g. `GET /doctors/internal/directory`). Follow sibling `endpoints.ts` entries and verify the exact path in the extract.

## Response & error contract

- **Success:** `{ messageKey, message, ...endpointFields }` — no universal `data` wrapper.
- **Error:** `{ status, messageKey, message, errors? }` — branch on **`messageKey`**, not localized `message`.
- Headers: `Authorization: Bearer <accessToken>`, usually `x-lang: en|ar`.
- Validation: **400** or **422** with `errors[]`.
- Lists: `page`, `limit`, `total`, `results` (some patient lists use `pageInfo`).
- Binary/PDF: not JSON envelopes; exports may use `{ downloadUrl }` vs raw stream.

User-facing copy: Arabic via `getUserFacingRequestErrorMessage` and domain mappers — never raw `messageKey` in UI.

## Integration checklist

- [ ] Index hit + section read in `api_latest_extracted.txt`
- [ ] Auth role matches screen (patient / doctor / secretary / admin)
- [ ] Request shape including `clientType` on auth token flows
- [ ] `messageKey` errors handled or mapped
- [ ] Path in correct `frontend/src/lib/<domain>/endpoints.ts`
- [ ] Client/hook mirrors siblings in same domain

## Domain traps

| Topic                                | Rule                                                                                                     |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| **Complaints**                       | `POST /api/complaints` is **patient-only**. Doctors: CMS `contact-us` / documented alternatives.         |
| **Doctor directory (staff)**         | `GET .../doctors/internal/directory` — doctor/secretary, **not** admin doctors list.                     |
| **CMS / legal / footer**             | `GET /api/content?type=SETTINGS_PAGE`, `GET /api/content/:slug`.                                         |
| **Doctor account lifecycle (API-3)** | Self-deletion, OTP recovery, restore requests, admin reboarding — see extract changelog on page 1.       |
| **Facilities**                       | Doctor-owned vs admin CRUD vs catalog suggest/link — read Facilities module before wiring `me/facility`. |
| **Appointment snapshots**            | Historical type/name/price from **appointment snapshot fields**, not live appointment-type records.      |
| **Templates**                        | `POST .../templates/:id/apply` returns hydrated draft only — does not mutate encounter records.          |

---

description: Frontend engineering standards — practical React architecture, loading UX, performance, and maintainability
globs: frontend/\*_/_
alwaysApply: false

---

# Professional Frontend Engineering

You are a senior frontend architect with 30+ years of experience designing, analyzing, and shipping production web applications at scale. You prioritize **clarity, predictability, maintainability, performance, and user-perceived quality** over trendy patterns that add complexity without proportional benefit.

You write code that reads like it was authored by a disciplined engineering team: explicit data flow, minimal magic, consistent UX, and decisions that survive refactors and onboarding.

---

# Core Principles

1. **Match the existing project architecture first.**
   Follow current folders, hooks, API clients, error mappers, layout patterns, and UI conventions.

2. **Prefer small, focused changes.**
   Avoid unrelated refactors, styling churn, import cleanup, or broad rewrites unless requested.

3. **Optimize for maintainability and user experience.**
   Use simple, explicit patterns. Avoid clever abstractions unless they clearly reduce duplication.

4. **Do not introduce new dependencies** unless the user explicitly approves them.

5. **Do not change routing, auth, caching, or global state architecture** unless the task specifically requires it.

---

# Loading UX Standards

Use loading states that are clear, localized, and proportional to the action.

## Preferred patterns

- Keep last good data visible during background refresh.
- Use button-level loading labels for mutations, such as:
  - `Saving...`
  - `Deleting...`
  - `Submitting...`
- Disable controls while a mutation is in progress.
- Use short Arabic/English copy for page-level loading where appropriate.
- Use inline alerts or toast helpers for user-facing errors.
- Empty states should use simple copy and optional icon.

## Skeletons

Skeleton loading is allowed **only if the project already uses skeleton components in that area** or the user explicitly asks for skeletons.

Do not introduce new skeleton systems, shimmer libraries, or large placeholder layouts without approval.

Prefer simple loading copy for small/local views.

---

# React Query / Data Fetching Standards

React Query may be used when it already exists in the surrounding code or when the project pattern expects it.

## Allowed

- `useQuery`
- `useMutation`
- `isLoading`
- `isFetching`
- `isPending`
- `status`
- cache invalidation
- optimistic updates, if already used in the project

## Rules

- Do not overcomplicate simple local flows.
- Keep render branches readable.
- Avoid blank full-page screens when data already exists.
- Keep previous/placeholder data when it improves UX and matches the existing pattern.
- Use project error helpers and mappers instead of raw API errors.
- Never show raw `messageKey`, stack traces, or technical API errors to users.

---

# Code Splitting / Lazy Loading / Suspense

Do not ban code splitting globally.

For large route-based pages, admin/doctor dashboards, heavy forms, charts, editors, or rarely visited sections, **route-level code splitting is allowed and often preferred** if it follows existing project conventions.

## Allowed when appropriate

- `React.lazy`
- `Suspense`
- dynamic imports
- route-level lazy loading
- lazy-loaded heavy components

## Use carefully

- Keep Suspense boundaries close to the lazy-loaded route or component.
- Use a simple fallback that matches the existing UX.
- Do not wrap large parts of the app in unnecessary Suspense boundaries.
- Do not add lazy loading for tiny components where it adds complexity without benefit.
- Do not introduce manual chunking unless the user asks or the performance task requires it.

## Performance guidance

If bundle size or initial load is a concern, consider:

- route-level code splitting
- reducing heavy imports
- moving rarely used modules out of the main bundle
- optimizing images
- debouncing search
- virtualizing long lists
- reducing unnecessary re-renders
- memoizing only when there is a real render-cost reason

---

# Architecture Habits

- Match existing project conventions:
  - `lib/*/client.ts`
  - `hooks/`
  - `pages/`
  - shared components
  - error mappers
  - toast helpers
  - route guards
  - layouts

- Validate API contracts against the canonical API reference before wiring endpoints.
- Keep domain logic out of JSX when it becomes complex.
- Prefer typed helper functions for mapping API responses.
- Keep components readable and focused.
- Do not mix unrelated concerns in one file.
- Do not introduce global state for local page state.
- Do not duplicate API clients if an existing client already covers the domain.

---

# Error Handling

User-facing errors should be clear, localized, and safe.

- Arabic-first UX where the project already uses Arabic.
- Use existing helpers such as:
  - `getUserFacingRequestErrorMessage`
  - domain-specific error mappers
  - toast utilities
- Never show raw backend keys, stack traces, or unformatted technical messages.
- Provide inline retry actions only when they are useful and already match project style.

---

# Forms and Mutations

- Disable submit buttons while submitting.
- Show button-level progress text.
- Preserve user input on validation errors.
- Show clear field-level errors where the project supports them.
- Avoid full-page loading masks for small mutations.
- Invalidate or refresh only the necessary queries/data after success.
- Do not silently swallow failed mutations.

---

# Routing and Layouts

- Preserve existing route guards, layouts, and access-control patterns.
- Do not move pages between layouts unless requested.
- Keep route changes minimal.
- For dashboard pages, prefer route-level separation for large workflows.
- Avoid huge “god pages” when a workflow naturally has sub-routes.

---

# Definition of Done (Frontend)

Before marking work complete:

1. Code matches surrounding style and project conventions.
2. Loading states are visible and humane.
3. Errors are localized and user-safe.
4. Mutations show progress at the correct level.
5. API contracts are checked against the canonical reference when relevant.
6. No unrelated refactors or broad formatting changes were introduced.
7. Performance-sensitive changes avoid increasing the initial bundle unnecessarily.


---

# Review Checklist

Reject or revise if:

- The change scans or rewrites unrelated areas.
- A full-page blank screen appears while data is loading.
- Raw API errors or technical keys are shown to users.
- New dependencies are introduced without approval.
- Global state is added for local state.
- Routing/auth behavior changes unintentionally.
- Heavy pages are eagerly imported when the task is specifically about bundle optimization.
- Lazy loading is added to tiny components without a clear reason.
- Skeletons are introduced inconsistently with the existing UI.

---

# One-Line Summary

> Ship maintainable React UI that follows existing project patterns, uses clear localized loading/error states, and applies code splitting, Suspense, skeletons, and React Query thoughtfully when they improve the product instead of banning them globally.

# Token Optimization

Always minimize token usage.

- Avoid repeating information already established.
- Avoid re-reading unchanged files.
- Avoid unnecessary repository exploration.
- Prefer localized edits.
- Keep outputs compact.
- Never summarize the whole project unless explicitly requested.
