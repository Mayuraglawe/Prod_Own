# Next.js Dashboard UI (`apps/dashboard`) — Development & Governance Guidelines

This document provides application-specific execution boundaries, patterns, security, and verification rules for `apps/dashboard`.

---

## 1. Scope & Execution Boundaries (Preventing Runaway Changes)

- **Primary Responsibility**: Client-side web dashboard UI for project management, error stack trace visualization, and alert configuration.
- **Forbidden Scope Extensions**:
  - Do **NOT** include `apps/dashboard` in the core runtime `docker-compose.yml` stack (it runs separately via `pnpm dev:web`).
  - Do **NOT** introduce heavy client-side session recording / DOM canvas replay libraries.
  - Do **NOT** perform direct database connection calls from Client Components; interact via API routes or server actions.

---

## 2. Architecture & Pattern Compliance

- **Framework & Styling**: Next.js 15 App Router (`app/`), Tailwind CSS, and shadcn/ui components (`components/ui`).
- **Aesthetics & Design System**:
  - Curated, dark-mode friendly color palettes (HSL-tailored).
  - Modern Google Fonts typography (Inter/Outfit).
  - Subtle micro-animations and smooth transitions.
  - Zero generic default styles or unstyled HTML elements.
- **API Communication**: Fetch backend endpoints exposed by `apps/api` using `env.APP_URL` and structured tenant headers (`x-tenant-id`).

---

## 3. Security & Safety Rules

- **Client Secret Protection**: Never expose private API keys (`RAZORPAY_KEY_SECRET`) in client bundles or public Next.js environment variables.
- **XSS & Content Sanitization**: Escape and sanitize raw error stack trace HTML output before rendering trace details in UI components.
- **Tenant Context**: Scope dashboard views by active `tenantId`.

---

## 4. Verification & Self-Correction Loop

- **Package Validation Commands**:
  ```bash
  pnpm --filter @prod-own/web dev
  pnpm --filter @prod-own/web build
  pnpm typecheck
  ```
- **Verification Scenarios**:
  - Verify layout responsiveness across Desktop (1440px), Tablet (768px), and Mobile (375px) breakpoints.
  - Ensure build passes without Next.js compilation or hydration errors (`pnpm dev:web`).

---

## 5. File Modification & Output Format

- Organize routes under `app/` ([layout.tsx](file:///e:/Prod_Own/apps/web/app/layout.tsx), [page.tsx](file:///e:/Prod_Own/apps/web/app/page.tsx)), UI components under `components/`, and utilities under `lib/`.
- Maintain clean TypeScript types for props and state.
- Use clickable `file:///` links for code symbol references.

---

## 6. Operational Rules Summary

1. Build visually impressive, modern UI with dark mode support and smooth animations.
2. Keep Next.js dashboard isolated from the Docker runtime stack.
3. Validate client code with `pnpm --filter @prod-own/web build` and `pnpm typecheck`.
4. Never log or leak backend secret keys in client-side code.
