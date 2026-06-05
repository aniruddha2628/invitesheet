# InviteSheet — Product Requirements Document (Complete)

### RSVP Management SaaS for Indian Event Companies

> **Version:** 1.1
> **Status:** Authoritative — Sections 1–13 (all fixes applied)
> **Audience:** Solo developers, AI coding assistants (Cursor, Copilot, Claude Code), full-stack engineers
> **Purpose:** Single-source-of-truth technical PRD for InviteSheet. All seven issues identified in the review have been resolved. Do not use any earlier partial documents — use only this file.

**Fixes applied in this version:**
1. Folder structure unified to `server/` + `apps/web/` across all 13 sections
2. Jest `setupFilesAfterFramework` typo fixed to `setupFilesAfterEnv` in both backend and frontend configs
3. AWS S3 env vars removed; file storage decision locked as **memory-only for MVP** (Cloudinary in future phase)
4. Port unified to **4000** everywhere (backend, env examples, Postman, CI)
5. Version Safety Rule reminder added to prompts 11.3 through 11.7
6. Document scope clarified: this is a TRD (Technical Requirements Document). Product-level content for non-technical stakeholders is intentionally out of scope
7. Room View fully specified as a standalone screen in Section 7.11

---

## ⚠️ Version Safety Rule (Read Before Writing Any Code)

> **Never copy version numbers from this document (or from memory) into `package.json`.** Docs go stale; pinning old versions ships vulnerabilities.

### For humans

1. Open [npmjs.com](https://www.npmjs.com/) for each package — confirm **latest stable** and check the **Security / Advisories** tab.
2. Prefer the **newest patched release** on a supported major line — not an old pin from a blog post or tutorial.
3. After every install run: `npm audit` — fix all **high/critical** before committing.

```bash
npm show <package-name> version          # latest published version
npm view <package-name> time.modified    # how recently "latest" was published
npm audit                                # audit the installed dependency tree
```

### For AI assistants (mandatory — no exceptions)

Before writing or editing **`package.json`**, **`package-lock.json`**, or recommending any install command:

1. **Web search** each non-trivial dependency before writing it. Example queries:
   - `"npm <package-name> latest version 2025"`
   - `"<package-name> CVE"` or `"<package-name> npm security advisory"`
   - For Node.js: `"Node.js LTS current release"` — always align with **Active LTS**, never EOL.
2. Cross-check with **`npm show <pkg> version`** in the terminal when the shell is available.
3. If search surfaces an **unpatched CVE on `latest`**, search again for a patched version or choose an alternative.
4. **State what you verified** in your reply — e.g. `"searched + npm show next version → using ^15.x.y"`.
5. Use **`^` ranges** in `package.json` for application dependencies.

**Package names to verify — no versions listed here intentionally:**

| Package (verify each) | What to search / check |
|-----------------------|------------------------|
| `next` | Latest stable; App Router compatibility; breaking changes in major |
| `react`, `react-dom` | Must match Next.js peer dependency range exactly |
| `typescript` | Latest stable; Next.js TypeScript version compatibility |
| `express` | Latest stable major line; Node.js compatibility matrix |
| `mongoose` | Latest stable; compatibility with MongoDB Atlas driver |
| `zod` | Latest stable; note if v4 is stable — verify before adopting |
| `jsonwebtoken` | npm latest + advisory search — this package has had historical CVEs |
| `bcryptjs` | Latest stable; zero native deps |
| `helmet` | Latest stable + advisory; CSP defaults change across majors |
| `cors` | Latest stable |
| `express-rate-limit` | Latest stable; API changed between v6 and v7 — verify |
| `express-mongo-sanitize` | Latest stable |
| `socket.io` | Latest stable; match `socket.io-client` version exactly |
| `ag-grid-react`, `ag-grid-community` | Must match versions exactly |
| `@tanstack/react-query` | Latest stable; v4 vs v5 API is different — verify |
| `axios` | Latest stable + advisory |
| `react-hook-form` | Latest stable |
| `@sentry/nextjs` | Latest stable; Next.js integration version alignment |
| `nodemailer` | Latest stable |
| `winston` | Latest stable |
| `node-cron` | Latest stable |
| `papaparse` | Latest stable (CSV parsing) |
| `xlsx` (SheetJS) | Latest from `https://cdn.sheetjs.com` — **NOT from npm** (the npm package is abandoned) |

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [Repository Structure](#2-repository-structure)
3. [Environment Variables](#3-environment-variables)
4. [Backend Architecture](#4-backend-architecture)
5. [API Documentation Standard](#5-api-documentation-standard)
6. [Backend Security Checklist](#6-backend-security-checklist)
7. [Frontend Architecture](#7-frontend-architecture)
8. [Frontend Security Checklist](#8-frontend-security-checklist)
9. [AI Workflow, CI & Git Hygiene](#9-ai-workflow-ci--git-hygiene)
10. [Postman & Testing Guide](#10-postman--testing-guide)
11. [Master Prompts](#11-master-prompts)
12. [Domain Add-On Prompts](#12-domain-add-on-prompts)
13. [Document Maintenance](#13-document-maintenance)

---

## 1. Tech Stack

InviteSheet is a full-stack TypeScript monorepo. The frontend is a Next.js App Router application. The backend is a standalone Express API. AG Grid Community Edition powers the spreadsheet-like RSVP interface. Socket.io provides real-time multi-staff sync during live events.

> **Note on Next.js + Express split:** Next.js handles all frontend rendering and routing. Express runs as a separate backend service (not Next.js API routes) so the API can be independently scaled, deployed to Render/Railway, and consumed by future mobile clients.

---

### 1.1 Runtime & Language

| Layer | Choice | Notes |
|-------|--------|-------|
| **Runtime** | Node.js | Web search current **Active LTS** — never hardcode an LTS number. Check [nodejs.org](https://nodejs.org/en/download) |
| **Language** | TypeScript | Strict mode required everywhere — `"strict": true` in all `tsconfig.json` files. No `any` unless explicitly typed with a comment explaining why |
| **Package manager** | npm | Use `npm ci` in CI — never `npm install` in automated pipelines |

---

### 1.2 Frontend

| Layer | Choice | Notes |
|-------|--------|-------|
| **Framework** | Next.js (App Router) | All pages use the App Router. No Pages Router. `"use client"` only where strictly necessary |
| **UI library** | React | Must match Next.js peer dependency range exactly |
| **Spreadsheet grid** | AG Grid Community + React | Core RSVP UI. Community Edition is free. Virtual row rendering handles 1,000+ guests. |
| **Routing** | Next.js App Router file-based routing | Protected routes enforced via middleware (`middleware.ts`) |
| **Server state** | TanStack Query (React Query) | All API calls go through TanStack Query hooks |
| **HTTP client** | Axios | One shared instance with `withCredentials: true` and a refresh interceptor. Separate `refreshClient` instance with no interceptors |
| **Forms** | React Hook Form + Zod | Every form uses RHF + Zod resolver |
| **HTML sanitize** | DOMPurify | Applied to any user-generated content rendered as HTML |
| **Real-time client** | socket.io-client | Connects to Express Socket.io server. JWT auth guard on connection |
| **File parsing** | PapaParse (CSV) + SheetJS (XLSX) | Client-side parsing before upload. SheetJS must be sourced from `cdn.sheetjs.com` — the npm package is abandoned |
| **Styling** | Tailwind CSS | Utility-first. AG Grid uses `ag-theme-alpine` with InviteSheet brand color overrides |
| **Icons** | lucide-react | Consistent icon set. Verify latest version |

---

### 1.3 Backend

| Layer | Choice | Notes |
|-------|--------|-------|
| **Framework** | Express | Standalone API server — NOT Next.js API routes. Runs on port **4000** |
| **Database** | MongoDB Atlas | Cloud-hosted. M0 free tier for dev; M10+ for production |
| **ODM** | Mongoose | Schema-driven. All models in `server/src/modules/<resource>/<resource>.model.ts` |
| **Validation** | Zod | Validates all request bodies, query params, path params, and environment variables |
| **Auth** | Email/Password + Google OAuth | Passport.js strategies. Google OAuth only initialised when `GOOGLE_CLIENT_ID` env vars are present |
| **JWT** | jsonwebtoken | Access token: 15 min. Refresh token: 7 days in `HttpOnly; Secure; SameSite=Strict` cookie |
| **Password hashing** | bcryptjs | Cost factor ≥ 10 |
| **Security headers** | helmet | Enabled on all routes. CSP tuned for Next.js frontend |
| **CORS** | cors | Explicit origin allowlist from env — never `*` with credentials |
| **Rate limiting** | express-rate-limit | Per-route limits. Strict on `/auth/*` routes |
| **NoSQL injection** | express-mongo-sanitize | Strips `$` and `.` from `req.body`, `req.query`, `req.params` |
| **Real-time** | socket.io | Room-based: each event sheet is a room |
| **Job scheduling** | node-cron | Background jobs: OTP cleanup, soft-delete TTL enforcement |
| **Email** | nodemailer | SMTP via Resend. OTP emails, password reset |
| **Logging** | winston | Structured JSON logging in production. **Never log** passwords, tokens, Aadhaar numbers, phone numbers, or raw PII |
| **Monitoring** | @sentry/nextjs (frontend) + @sentry/node (backend) | Error tracking. Configure `beforeSend` to scrub guest PII |
| **Encryption** | Node.js `crypto` (AES-256-GCM) | For encrypting sensitive data at rest. Key from `ENCRYPTION_KEY` env var |
| **File upload** | multer (memoryStorage) | Files processed in memory — **never written to disk**. MVP: memory-only. Cloudinary in future phase for logo uploads |

---

### 1.4 Domain-Specific: AG Grid Configuration

| AG Grid Feature | InviteSheet Usage |
|-----------------|-------------------|
| **Column Definitions** | Dynamically generated from the event's column schema in MongoDB |
| **Virtual Row Rendering** | Handles 200 pre-loaded rows and 1,000+ imported guests without DOM degradation |
| **Custom Cell Renderers** | Check-In Toggle, Guest Status badge chips, ID Type badge |
| **Custom Cell Editors** | Dropdown columns use `agSelectCellEditor`. Check-In Toggle: click/tap only |
| **Row Selection** | Multi-row selection for bulk operations |
| **Keyboard Navigation** | Arrow keys, Tab, Enter, F2, Escape — matches Excel behaviour exactly |
| **Fill Handle** | Enabled for text and number columns |
| **Column Resize** | Drag header edge to resize. Double-click to auto-fit |
| **Column Reorder** | Drag headers to reorder. Saved to backend on drop |
| **Right-click Context Menu** | Insert Row Above, Insert Row Below, Delete Row, Copy, Paste |
| **Clipboard** | Ctrl+C/Ctrl+V — AG Grid parses tab-delimited clipboard text into rows |
| **Locked Columns** | Guest Name and Contact Number: `lockVisible: true`, `suppressMovable: true`. Check-In: `editable: false` |

---

### 1.5 Deployment

| Layer | Service | Notes |
|-------|---------|-------|
| **Frontend** | Vercel | Next.js native deployment. Set all `NEXT_PUBLIC_*` env vars in Vercel dashboard |
| **Backend** | Render or Railway | Express API as a Web Service. `npm ci && npm run build && npm start`. Port: **4000** |
| **Database** | MongoDB Atlas | M0 free tier for dev. Add Render/Railway outbound IP range to Atlas IP allowlist |
| **Email** | Resend | Best deliverability for Indian domains. Verify sending domain in Resend dashboard |
| **File Storage** | Memory-only for MVP | Files processed in-memory and discarded. Cloudinary integration planned for Phase 2 (logo uploads) |

---

### 1.6 Token Lifetime Standard

| Token | Lifetime | Storage | Transport |
|-------|----------|---------|-----------|
| Access JWT | 15 minutes | In-memory only — `tokenStore.ts` (never `localStorage`) | `Authorization: Bearer <token>` header |
| Refresh Token | 7 days | `HttpOnly; Secure; SameSite=Strict` cookie | Sent automatically to `/api/v1/auth/refresh` |
| OTP (password reset) | 10 minutes | Hashed with bcrypt in MongoDB. TTL index auto-deletes | Delivered via email — 6-digit numeric |
| Socket.io auth | Matches access token | Not stored — validated on connection handshake | `io({ auth: { token } })` |

---

### 1.7 Environment Variable Naming

| Runtime | Client-visible prefix | Server-only |
|---------|-----------------------|-------------|
| Next.js frontend | `NEXT_PUBLIC_` | Any var without prefix |
| Express backend | None — all vars are server-only | All vars |

> **Critical:** The blueprint template uses `VITE_*` prefix. InviteSheet uses Next.js. All frontend env vars must use `NEXT_PUBLIC_*`. Never use `VITE_*`.

---

## 2. Repository Structure

InviteSheet is a monorepo. **The canonical structure is `server/` for the Express backend and `apps/web/` for the Next.js frontend.** This is the only correct structure — ignore any earlier documents that reference `backend/` or `frontend/`.

```
InviteSheet/                              # Monorepo root
├── apps/
│   └── web/                             # Next.js 14 App Router frontend
│       ├── app/
│       │   ├── (auth)/                  # Route group — no layout chrome
│       │   │   ├── register/page.tsx
│       │   │   ├── login/page.tsx
│       │   │   ├── forgot-password/page.tsx
│       │   │   └── reset-password/page.tsx
│       │   ├── (app)/                   # Route group — full app shell
│       │   │   ├── layout.tsx           # App shell: sidebar + topnav + RequireAuth
│       │   │   ├── dashboard/page.tsx
│       │   │   ├── events/
│       │   │   │   ├── page.tsx
│       │   │   │   └── [eventId]/sheets/[sheetId]/page.tsx
│       │   │   ├── team/page.tsx
│       │   │   ├── settings/page.tsx
│       │   │   └── notifications/page.tsx
│       │   ├── layout.tsx               # Root layout — AuthProvider + QueryProvider
│       │   └── globals.css
│       ├── components/
│       │   ├── ui/                      # Button, Input, Modal, Toast, Badge, Spinner
│       │   ├── layout/                  # Sidebar, TopNav, AppShell
│       │   └── shared/                  # ConfirmModal, EmptyState, PageLoader
│       ├── features/
│       │   ├── auth/
│       │   │   ├── components/          # RegisterForm, LoginForm, ForgotPasswordForm, ResetPasswordForm, OtpInput
│       │   │   ├── hooks/useAuth.ts
│       │   │   └── api.ts
│       │   ├── dashboard/
│       │   │   ├── components/          # StatCard, EventCard, EventCardMenu, EmptyDashboard
│       │   │   └── api.ts
│       │   ├── events/
│       │   │   ├── components/          # CreateEventModal, EditEventModal, DeleteEventModal, ColumnSelectStep, FileUploadStep
│       │   │   └── api.ts
│       │   ├── rsvp/
│       │   │   ├── components/          # RSVPScreen, CounterBar, SheetTabs, AddColumnModal, EditDropdownModal, SmartBanner, RoomView, RoomCard
│       │   │   ├── hooks/               # useCounters, useRSVPSocket, useGridConfig, useGuestFilter
│       │   │   └── api.ts
│       │   └── onboarding/
│       │       ├── components/          # OnboardingModal, Step1Welcome, Step2CompanySetup, Step3CreateEvent, Step4AllSet
│       │       └── api.ts
│       ├── lib/
│       │   ├── api/
│       │   │   ├── client.ts            # Axios instance + interceptors
│       │   │   └── refreshClient.ts     # Separate Axios for /auth/refresh
│       │   ├── auth/
│       │   │   ├── AuthProvider.tsx     # Session bootstrap + context
│       │   │   ├── tokenStore.ts        # In-memory token store (never localStorage)
│       │   │   └── RequireAuth.tsx      # Route guard component
│       │   ├── socket/
│       │   │   ├── socketClient.ts      # Socket.io client singleton
│       │   │   └── socketEvents.ts      # Typed event name constants
│       │   └── utils/
│       │       ├── formatters.ts
│       │       ├── validators.ts        # Zod schemas for forms
│       │       ├── apiError.ts          # parseApiError() normaliser
│       │       └── cn.ts               # clsx + tailwind-merge
│       ├── providers/
│       │   └── QueryProvider.tsx
│       ├── types/
│       │   ├── api.ts
│       │   ├── guest.ts
│       │   ├── event.ts
│       │   └── column.ts
│       ├── .env.example
│       ├── next.config.ts
│       ├── tailwind.config.ts
│       ├── jest.config.ts
│       └── package.json
│
├── server/                              # Express REST API + Socket.io
│   ├── src/
│   │   ├── server.ts                    # Entry: DB → cron → Socket.io → listen
│   │   ├── app.ts                       # Express app: middleware stack + route mounts
│   │   ├── config/
│   │   │   ├── env.ts                   # Zod-validated env — process.exit(1) on bad config
│   │   │   ├── db.ts                    # mongoose.connect + graceful disconnect
│   │   │   └── passport.ts             # Google OAuth (only if GOOGLE_ vars present)
│   │   ├── middleware/
│   │   │   ├── requireAuth.ts          # JWT verify → attach req.user
│   │   │   ├── validate.ts             # Zod schema factory → 400 on failure
│   │   │   ├── roleGuard.ts            # Role enforcement: owner | admin | member
│   │   │   └── errorHandler.ts         # Central error handler
│   │   ├── modules/
│   │   │   ├── auth/                   # routes, controller, service, schema, refreshToken.model
│   │   │   ├── users/                  # routes, controller, service, model, schema
│   │   │   ├── companies/              # routes, controller, service, model, schema
│   │   │   ├── events/                 # routes, controller, service, model, schema
│   │   │   ├── sheets/                 # routes, controller, service, model, schema
│   │   │   ├── guests/                 # routes, controller, service, model, schema
│   │   │   ├── columns/                # routes, controller, service, schema (no separate collection)
│   │   │   └── team/                   # routes, controller, service, schema
│   │   ├── services/
│   │   │   ├── email.service.ts        # Nodemailer wrapper
│   │   │   └── cron.service.ts         # node-cron background jobs
│   │   ├── sockets/
│   │   │   ├── index.ts                # Socket.io init + JWT auth middleware
│   │   │   └── handlers/               # guestHandlers, presenceHandlers
│   │   ├── utils/
│   │   │   ├── jwt.ts                  # signAccessToken, signRefreshToken, verifyToken
│   │   │   ├── encryption.ts           # AES-256-GCM encrypt/decrypt
│   │   │   ├── ownershipCheck.ts       # assertOwnership() — always 404, never 403
│   │   │   ├── tokenCompare.ts         # crypto.timingSafeEqual wrapper
│   │   │   └── AppError.ts             # Custom error class with statusCode + code
│   │   └── types/
│   │       └── express.d.ts            # Augment Express Request with req.user
│   ├── postman/
│   │   ├── InviteSheet.postman_collection.json
│   │   ├── InviteSheet.postman_environment.json
│   │   └── fixtures/
│   │       └── test_guests.xlsx        # 5 sample rows — committed
│   ├── src/__tests__/
│   │   ├── auth.test.ts
│   │   ├── events.test.ts
│   │   ├── guests.test.ts
│   │   └── helpers/
│   │       ├── testDb.ts               # MongoMemoryServer setup
│   │       ├── testAuth.ts             # createTestUser helper
│   │       ├── globalSetup.ts
│   │       └── globalTeardown.ts
│   ├── .env.example
│   ├── jest.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── docs/
│   └── InviteSheet_PRD_Complete.md    # This file — single source of truth
├── .github/
│   └── workflows/
│       └── ci.yml
├── .gitignore                          # Root — covers server/ and apps/web/
├── .cursorignore
└── README.md
```

**Rules — never break these:**

- Never commit `.env`, `node_modules`, `.next/`, `dist/`, or `build/`
- Always commit `.env.example` with placeholder values and comments
- One source of truth for env validation: `server/src/config/env.ts` (backend), `apps/web/src/lib/env.ts` (frontend)
- TypeScript strict mode always on — no `any` without an explicit typed comment

---

## 3. Environment Variables

### 3.1 Backend `.env.example`

```env
# server/.env.example
# Copy to server/.env and fill in real values. NEVER commit server/.env.

# ── Server ────────────────────────────────────────────────────────────────────
NODE_ENV=development
PORT=4000

# ── Database ──────────────────────────────────────────────────────────────────
MONGODB_URI=mongodb://localhost:27017/invitesheet_dev
# Production: mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/invitesheet

# ── JWT ───────────────────────────────────────────────────────────────────────
# Generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_ACCESS_SECRET=replace_with_64_char_hex_minimum
JWT_REFRESH_SECRET=replace_with_different_64_char_hex
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ── Google OAuth (optional — remove block if not using) ───────────────────────
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:4000/api/v1/auth/google/callback

# ── URLs ──────────────────────────────────────────────────────────────────────
CLIENT_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# ── Encryption ────────────────────────────────────────────────────────────────
# Generate: openssl rand -hex 32   (must be exactly 64 hex chars)
ENCRYPTION_KEY=replace_with_exactly_64_hex_characters

# ── Email / SMTP ──────────────────────────────────────────────────────────────
# Recommended: Resend (best deliverability for Indian domains)
# Omit all SMTP_ vars to disable email sending (OTP will log to console in dev)
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=resend
SMTP_PASS=your_resend_api_key
EMAIL_FROM=InviteSheet <noreply@yourdomain.com>

# ── OTP ───────────────────────────────────────────────────────────────────────
OTP_EXPIRES_IN_MINUTES=10
OTP_MAX_ATTEMPTS=3

# ── Account Lockout ───────────────────────────────────────────────────────────
LOGIN_MAX_ATTEMPTS=5
LOGIN_LOCK_DURATION_MINUTES=15

# ── Rate Limiting ─────────────────────────────────────────────────────────────
RATE_LIMIT_GLOBAL_MAX=100
RATE_LIMIT_GLOBAL_WINDOW_MS=60000
RATE_LIMIT_AUTH_MAX=10
RATE_LIMIT_AUTH_WINDOW_MS=60000

# ── Monitoring ────────────────────────────────────────────────────────────────
SENTRY_DSN=https://your_sentry_dsn_here
SENTRY_ENVIRONMENT=development

# ── Plan Limits ───────────────────────────────────────────────────────────────
FREE_PLAN_EVENT_LIMIT=2
FREE_PLAN_GUEST_LIMIT=200

# ── Socket.io ─────────────────────────────────────────────────────────────────
# Defaults to CORS_ORIGINS if not set
SOCKET_CORS_ORIGINS=
```

> **No AWS or S3 vars** — InviteSheet MVP uses in-memory file processing only. Cloudinary will be added in Phase 2 for logo uploads.

---

### 3.2 Frontend `.env.example`

```env
# apps/web/.env.example
# Copy to apps/web/.env.local and fill in real values. NEVER commit .env.local.

# ── API ───────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000

# ── Socket.io ─────────────────────────────────────────────────────────────────
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000

# ── App ───────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ── Feature Flags ─────────────────────────────────────────────────────────────
NEXT_PUBLIC_ENABLE_REAL_TIME=true

# ── Sentry (optional) ─────────────────────────────────────────────────────────
NEXT_PUBLIC_SENTRY_DSN=

# ── AG Grid Enterprise (optional) ────────────────────────────────────────────
# Leave blank to use Community Edition (free). Only set if you have purchased a license.
NEXT_PUBLIC_AG_GRID_LICENSE_KEY=
```

---

### 3.3 Backend Zod Env Validation

```typescript
// server/src/config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  // ── Server ──────────────────────────────────────────────────────────────────
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().transform(Number).default('4000'),

  // ── Database ────────────────────────────────────────────────────────────────
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

  // ── JWT ─────────────────────────────────────────────────────────────────────
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // ── Google OAuth (optional) ─────────────────────────────────────────────────
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().url().optional(),

  // ── URLs ────────────────────────────────────────────────────────────────────
  CLIENT_URL: z.string().url('CLIENT_URL must be a valid URL'),
  CORS_ORIGINS: z.string().min(1, 'CORS_ORIGINS is required'),

  // ── Encryption ──────────────────────────────────────────────────────────────
  ENCRYPTION_KEY: z.string().length(64, 'ENCRYPTION_KEY must be exactly 64 hex chars (32 bytes)'),

  // ── Email ───────────────────────────────────────────────────────────────────
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_SECURE: z.string().transform(v => v === 'true').optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().optional(),

  // ── OTP ─────────────────────────────────────────────────────────────────────
  OTP_EXPIRES_IN_MINUTES: z.string().transform(Number).default('10'),
  OTP_MAX_ATTEMPTS: z.string().transform(Number).default('3'),

  // ── Account Lockout ─────────────────────────────────────────────────────────
  LOGIN_MAX_ATTEMPTS: z.string().transform(Number).default('5'),
  LOGIN_LOCK_DURATION_MINUTES: z.string().transform(Number).default('15'),

  // ── Rate Limiting ───────────────────────────────────────────────────────────
  RATE_LIMIT_GLOBAL_MAX: z.string().transform(Number).default('100'),
  RATE_LIMIT_GLOBAL_WINDOW_MS: z.string().transform(Number).default('60000'),
  RATE_LIMIT_AUTH_MAX: z.string().transform(Number).default('10'),
  RATE_LIMIT_AUTH_WINDOW_MS: z.string().transform(Number).default('60000'),

  // ── Monitoring ──────────────────────────────────────────────────────────────
  SENTRY_DSN: z.string().optional(),
  SENTRY_ENVIRONMENT: z.string().default('development'),

  // ── Plan Limits ─────────────────────────────────────────────────────────────
  FREE_PLAN_EVENT_LIMIT: z.string().transform(Number).default('2'),
  FREE_PLAN_GUEST_LIMIT: z.string().transform(Number).default('200'),

  // ── Socket.io ───────────────────────────────────────────────────────────────
  SOCKET_CORS_ORIGINS: z.string().optional(),

  // NOTE: No AWS/S3 vars — InviteSheet MVP uses memory-only file processing.
  // Cloudinary will be added in Phase 2 for logo uploads.
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('');
  console.error('❌  InviteSheet backend failed to start — invalid environment variables:');
  console.error('');
  const errors = parsed.error.flatten().fieldErrors;
  Object.entries(errors).forEach(([field, messages]) => {
    console.error(`   ${field}: ${(messages ?? []).join(', ')}`);
  });
  console.error('');
  console.error('   Fix the above in your .env file and restart the server.');
  console.error('   See server/.env.example for required format and instructions.');
  console.error('');
  process.exit(1);
}

export const env = parsed.data;
export const isDev  = env.NODE_ENV === 'development';
export const isProd = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
export const corsOrigins = env.CORS_ORIGINS.split(',').map(o => o.trim());
```

---

### 3.4 Frontend Zod Env Validation

```typescript
// apps/web/src/lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url('NEXT_PUBLIC_API_BASE_URL must be a valid URL'),
  NEXT_PUBLIC_SOCKET_URL: z.string().url('NEXT_PUBLIC_SOCKET_URL must be a valid URL'),
  NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL must be a valid URL'),
  NEXT_PUBLIC_ENABLE_REAL_TIME: z
    .string()
    .transform(v => v === 'true')
    .default('true'),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_AG_GRID_LICENSE_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_API_BASE_URL:       process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_SOCKET_URL:         process.env.NEXT_PUBLIC_SOCKET_URL,
  NEXT_PUBLIC_APP_URL:            process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_ENABLE_REAL_TIME:   process.env.NEXT_PUBLIC_ENABLE_REAL_TIME,
  NEXT_PUBLIC_SENTRY_DSN:         process.env.NEXT_PUBLIC_SENTRY_DSN,
  NEXT_PUBLIC_AG_GRID_LICENSE_KEY: process.env.NEXT_PUBLIC_AG_GRID_LICENSE_KEY,
});

if (!parsed.success) {
  const errors = parsed.error.flatten().fieldErrors;
  const message = Object.entries(errors)
    .map(([field, msgs]) => `${field}: ${(msgs ?? []).join(', ')}`)
    .join('\n');
  throw new Error(`❌ InviteSheet frontend — invalid environment variables:\n\n${message}\n\nCheck your .env.local file.`);
}

export const env = parsed.data;
```

---

### 3.5 Environment Variables Reference Table

| Variable | Runtime | Required | Default | Purpose |
|----------|---------|----------|---------|---------|
| `NODE_ENV` | Backend | Yes | — | `development` / `production` / `test` |
| `PORT` | Backend | No | `4000` | Express listen port |
| `MONGODB_URI` | Backend | Yes | — | MongoDB Atlas connection string |
| `JWT_ACCESS_SECRET` | Backend | Yes | — | Signs access JWTs — min 32 chars |
| `JWT_REFRESH_SECRET` | Backend | Yes | — | Signs refresh JWTs — must differ from access |
| `JWT_ACCESS_EXPIRES_IN` | Backend | No | `15m` | Access token lifetime |
| `JWT_REFRESH_EXPIRES_IN` | Backend | No | `7d` | Refresh token lifetime |
| `GOOGLE_CLIENT_ID` | Backend | No | — | Google OAuth — omit to disable |
| `GOOGLE_CLIENT_SECRET` | Backend | No | — | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | Backend | No | — | OAuth redirect URI |
| `CLIENT_URL` | Backend | Yes | — | Frontend URL — used in CORS and email links |
| `CORS_ORIGINS` | Backend | Yes | — | Comma-separated allowed origins |
| `ENCRYPTION_KEY` | Backend | Yes | — | AES-256-GCM key — exactly 64 hex chars |
| `SMTP_HOST` | Backend | No | — | Omit to disable email sending |
| `SMTP_PORT` | Backend | No | — | 465 for SSL, 587 for STARTTLS |
| `SMTP_SECURE` | Backend | No | — | `true` for port 465 |
| `SMTP_USER` | Backend | No | — | SMTP username / API key identifier |
| `SMTP_PASS` | Backend | No | — | SMTP password / API key |
| `EMAIL_FROM` | Backend | No | — | Sender display name and address |
| `OTP_EXPIRES_IN_MINUTES` | Backend | No | `10` | OTP validity window |
| `OTP_MAX_ATTEMPTS` | Backend | No | `3` | Max wrong OTP attempts |
| `LOGIN_MAX_ATTEMPTS` | Backend | No | `5` | Failed logins before account lock |
| `LOGIN_LOCK_DURATION_MINUTES` | Backend | No | `15` | Lock duration in minutes |
| `RATE_LIMIT_GLOBAL_MAX` | Backend | No | `100` | Max requests/window on `/api` |
| `RATE_LIMIT_GLOBAL_WINDOW_MS` | Backend | No | `60000` | Global rate limit window |
| `RATE_LIMIT_AUTH_MAX` | Backend | No | `10` | Max requests/window on `/auth` |
| `RATE_LIMIT_AUTH_WINDOW_MS` | Backend | No | `60000` | Auth rate limit window |
| `SENTRY_DSN` | Backend | No | — | Sentry DSN — omit to disable |
| `SENTRY_ENVIRONMENT` | Backend | No | `development` | Sentry environment tag |
| `FREE_PLAN_EVENT_LIMIT` | Backend | No | `2` | Max events on free plan |
| `FREE_PLAN_GUEST_LIMIT` | Backend | No | `200` | Max guests per event on free plan |
| `SOCKET_CORS_ORIGINS` | Backend | No | — | Socket.io CORS — defaults to `CORS_ORIGINS` |
| `NEXT_PUBLIC_API_BASE_URL` | Frontend | Yes | — | Express API base URL |
| `NEXT_PUBLIC_SOCKET_URL` | Frontend | Yes | — | Socket.io server URL |
| `NEXT_PUBLIC_APP_URL` | Frontend | Yes | — | Frontend own URL |
| `NEXT_PUBLIC_ENABLE_REAL_TIME` | Frontend | No | `true` | Toggle Socket.io on/off |
| `NEXT_PUBLIC_SENTRY_DSN` | Frontend | No | — | Sentry client-side DSN |
| `NEXT_PUBLIC_AG_GRID_LICENSE_KEY` | Frontend | No | — | AG Grid Enterprise license |

---

### 3.6 Secret Generation Commands

```bash
# JWT Access Secret (64 bytes minimum)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# JWT Refresh Secret — must be different from Access Secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Encryption Key — must be exactly 32 bytes = 64 hex chars
openssl rand -hex 32

# Verify length before using:
echo -n "your_encryption_key_here" | wc -c   # must print 64
```

---

### 3.7 Environment-Specific Notes

**Development (`NODE_ENV=development`)**
- `MONGODB_URI` points to local MongoDB or a dedicated dev Atlas cluster
- `CLIENT_URL` is `http://localhost:3000` (Next.js dev server)
- `PORT` is `4000`
- Sentry DSN can be omitted — errors log to console
- Email: use Mailtrap or Ethereal — never real emails to real addresses in dev

**Production (`NODE_ENV=production`)**
- `MONGODB_URI` uses Atlas with TLS (the `+srv` URI format)
- `CLIENT_URL` and `CORS_ORIGINS` must be your production domain only — no `localhost`
- `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` freshly generated — never copied from dev
- All env vars set in Render/Railway dashboard — not in any committed file

**Test (`NODE_ENV=test`)**
- `MONGODB_URI` points to a separate test database wiped before each test run
- `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` can be short static strings for test speed
- Real email sending must be disabled — mock `email.service.ts` in test setup

---

## 4. Backend Architecture

### 4.1 Middleware Stack Order (app.ts)

Every request passes through this chain in order. Order is non-negotiable.

```typescript
// server/src/app.ts
import * as Sentry       from '@sentry/node';
import express           from 'express';
import helmet            from 'helmet';
import cors              from 'cors';
import mongoSanitize     from 'express-mongo-sanitize';
import rateLimit         from 'express-rate-limit';
import morgan            from 'morgan';
import cookieParser      from 'cookie-parser';
import { env, isDev, corsOrigins } from './config/env';
import { router }        from './routes';
import { errorHandler }  from './middleware/errorHandler';

export const app = express();

// 1. Sentry request handler — must be first
Sentry.init({ dsn: env.SENTRY_DSN, environment: env.SENTRY_ENVIRONMENT,
  beforeSend(event) {
    // Scrub PII from Sentry events — see Section 13 for full scrub list
    const SCRUB = ['contactNumber','phone','passwordHash','tokenHash','otpHash','email','guestName','accessToken','refreshToken'];
    SCRUB.forEach(k => {
      if (event.extra?.[k]) event.extra[k] = '[REDACTED]';
      if (event.request?.data && typeof event.request.data === 'object' && k in (event.request.data as object))
        (event.request.data as Record<string, unknown>)[k] = '[REDACTED]';
    });
    return event;
  },
});
app.use(Sentry.Handlers.requestHandler());

// 2. Security headers
app.use(helmet());

// 3. CORS — explicit origin list only, never '*' with credentials
app.use(cors({ origin: corsOrigins, credentials: true, methods: ['GET','POST','PATCH','DELETE','OPTIONS'] }));

// 4. Cookie + body parsing
app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// 5. NoSQL injection prevention
app.use(mongoSanitize());

// 6. HTTP request logging (dev only)
if (isDev) app.use(morgan('dev'));

// 7. Health & readiness — mounted BEFORE rate limiter so they are never throttled
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.get('/ready', async (_req, res) => {
  const mongoose = await import('mongoose');
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({ status: ready ? 'ready' : 'unavailable' });
});

// 8. Global rate limit — 100 req / min per IP on all /api routes
const globalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_GLOBAL_WINDOW_MS,
  max: env.RATE_LIMIT_GLOBAL_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests. Please slow down.' } },
});
app.use('/api', globalLimiter);

// 9. Strict auth-route rate limit — 10 req / min, skip successful requests
const authLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_AUTH_WINDOW_MS,
  max: env.RATE_LIMIT_AUTH_MAX,
  skipSuccessfulRequests: true,
  message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many attempts. Please wait before trying again.' } },
});
app.use('/api/v1/auth', authLimiter);

// 10. Application routes
app.use('/api/v1', router);

// 11. Sentry error handler (before our error handler)
app.use(Sentry.Handlers.errorHandler());

// 12. Central error handler — always last
app.use(errorHandler);
```

---

### 4.2 Standard Response Shapes

All API responses across the entire project follow these shapes exactly. Define them once, use them everywhere.

```typescript
// All success responses:
{ "success": true, "data": { ...resource } }

// Paginated success:
{ "success": true, "data": [...], "pagination": { "total": 100, "page": 1, "limit": 20, "totalPages": 5 } }

// All error responses:
{ "success": false, "error": { "code": "ERROR_CODE", "message": "Human readable description" } }

// Validation errors (only):
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "Validation failed", "fields": { "email": ["Invalid email"] } } }
```

---

### 4.3 Ownership Check Pattern

Use `assertOwnership()` in **every** controller that receives a resource ID. This is the primary IDOR prevention mechanism.

```typescript
// server/src/utils/ownershipCheck.ts
import { Model, Types } from 'mongoose';
import { AppError } from './AppError';

export async function assertOwnership<T>(
  ModelClass: Model<T>,
  resourceId: string,
  companyId: string,
): Promise<T> {
  const doc = await ModelClass.findOne({
    _id: new Types.ObjectId(resourceId),
    companyId: new Types.ObjectId(companyId),
    isDeleted: false,
  });
  if (!doc) {
    // Always 404 — never 403. Do not confirm the resource exists.
    throw new AppError('NOT_FOUND', 404, 'Resource not found');
  }
  return doc;
}
```

---

### 4.4 Data Models (Mongoose Schemas)

#### 4.4.1 User Model

```typescript
// server/src/modules/users/user.model.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUser extends Document {
  companyId       : Types.ObjectId;
  fullName        : string;
  email           : string;
  phone           : string;
  passwordHash    : string | null;
  googleId        : string | null;
  role            : 'owner' | 'admin' | 'member';
  isEmailVerified : boolean;
  onboardingStep  : number;
  loginAttempts   : number;
  lockUntil       : Date | null;
  isDeleted       : boolean;
  deletedAt       : Date | null;
}

const userSchema = new Schema<IUser>({
  companyId       : { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  fullName        : { type: String, required: true, trim: true },
  email           : { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone           : { type: String, required: true },
  passwordHash    : { type: String, default: null, select: false },
  googleId        : { type: String, default: null, sparse: true },
  role            : { type: String, enum: ['owner','admin','member'], default: 'owner' },
  isEmailVerified : { type: Boolean, default: false },
  onboardingStep  : { type: Number, default: 0 },
  loginAttempts   : { type: Number, default: 0 },
  lockUntil       : { type: Date, default: null },
  isDeleted       : { type: Boolean, default: false },
  deletedAt       : { type: Date, default: null },
}, { timestamps: true });

userSchema.index({ email: 1 });
userSchema.index({ companyId: 1 });
export const User = mongoose.model<IUser>('User', userSchema);
```

#### 4.4.2 Company Model

```typescript
// server/src/modules/companies/company.model.ts
export interface ICompany extends Document {
  ownerId         : Types.ObjectId;
  companyName     : string;
  logoUrl         : string | null;
  whatsappNumber  : string | null;
  city            : string | null;
  plan            : 'free' | 'pro';
  eventsUsed      : number;
  onboardingComplete : boolean;
}
```

#### 4.4.3 Event Model

```typescript
// server/src/modules/events/event.model.ts
export interface IEvent extends Document {
  companyId  : Types.ObjectId;
  name       : string;
  location   : string;
  eventType  : 'Wedding' | 'Corporate' | 'Social' | 'Other';
  startDate  : Date;
  endDate    : Date;
  isDeleted  : boolean;
  deletedAt  : Date | null;
}
```

#### 4.4.4 Sheet Model (Column Definitions embedded)

```typescript
// server/src/modules/sheets/sheet.model.ts
export interface IColumnDefinition {
  _id           : Types.ObjectId;
  name          : string;
  type          : 'text' | 'number' | 'date' | 'dropdown' | 'checkin';
  isLocked      : boolean;        // Guest Name, Contact Number, Check-In
  isMandatory   : boolean;        // Cannot be deselected during event creation
  dropdownOptions : string[];
  width         : number;         // px, persisted so grid remembers column widths
  order         : number;
}

export interface ISheet extends Document {
  eventId           : Types.ObjectId;
  companyId         : Types.ObjectId;
  name              : string;
  tabColor          : string | null;
  columnDefinitions : IColumnDefinition[];
  position          : number;
  isDeleted         : boolean;
  deletedAt         : Date | null;
}
```

#### 4.4.5 Guest Model

```typescript
// server/src/modules/guests/guest.model.ts
export interface IGuest extends Document {
  sheetId     : Types.ObjectId;
  eventId     : Types.ObjectId;
  companyId   : Types.ObjectId;
  rowIndex    : number;           // Display order
  // Core locked fields — always present
  guestName   : string;
  contactNumber : string;
  isCheckedIn : boolean;
  checkedInAt : Date | null;
  guestStatus : string | null;    // Confirmed / Not Coming / VIP / Dont Call / Wrong Number / Pending
  // Standard optional fields
  idType      : string | null;    // Aadhaar / Passport / Voter ID / Driving Licence / Other / Pending
  travelPlan  : string | null;    // By Car / By Train / By Flight / By Bus / Not Decided
  noOfPax     : number | null;
  noOfKids    : number | null;
  roomNumber  : string | null;
  arrivalDate : Date | null;
  departureDate : Date | null;
  comments    : string | null;
  // Dynamic columns stored as columnId → value map
  data        : Map<string, string | number | boolean | null>;
  isDeleted   : boolean;
  deletedAt   : Date | null;
}

// Indexes for counter computation performance
guestSchema.index({ sheetId: 1, isDeleted: 1 });
guestSchema.index({ sheetId: 1, isCheckedIn: 1, isDeleted: 1 });
guestSchema.index({ sheetId: 1, guestStatus: 1, isDeleted: 1 });
guestSchema.index({ sheetId: 1, idType: 1, isDeleted: 1 });
guestSchema.index({ guestName: 'text' });  // Full-text search — non-sensitive field only
```

---

### 4.5 Error Code Master Reference

| HTTP | Code | When to use |
|------|------|-------------|
| 400 | `VALIDATION_ERROR` | Zod schema failed — includes `fields` map |
| 400 | `INVALID_REQUEST` | Logically invalid (e.g. endDate before startDate) |
| 400 | `CONFIRM_TEXT_MISMATCH` | Destructive action confirmation text wrong |
| 400 | `INVALID_FILE_TYPE` | File upload is not .xlsx, .xls, or .csv |
| 400 | `FILE_TOO_LARGE` | File exceeds 5 MB limit |
| 400 | `EMPTY_FILE` | File parsed but zero data rows found |
| 400 | `MISSING_GUEST_NAME_COLUMN` | Import file has no mappable guestName column |
| 400 | `INVALID_OTP` | Submitted OTP does not match (includes attempt count) |
| 400 | `TOO_MANY_OTP_ATTEMPTS` | Exceeded OTP attempt limit |
| 401 | `UNAUTHORIZED` | No token provided |
| 401 | `TOKEN_EXPIRED` | Access token expired — client should refresh |
| 401 | `TOKEN_INVALID` | Token tampered or wrong secret |
| 401 | `REFRESH_TOKEN_INVALID` | Refresh token not found or already rotated |
| 401 | `OTP_EXPIRED` | OTP TTL has passed |
| 401 | `ACCOUNT_LOCKED` | Too many failed login attempts |
| 403 | `FORBIDDEN` | Authenticated but wrong role |
| 403 | `PLAN_LIMIT_REACHED` | Free plan event or guest limit hit |
| 403 | `COLUMN_LOCKED` | Attempt to delete a locked column |
| 404 | `NOT_FOUND` | Resource not found or wrong company |
| 409 | `CONFLICT` | Duplicate resource (email, column key, etc.) |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests in window |
| 500 | `INTERNAL_ERROR` | Unhandled server error — check Sentry |

---

### 4.6 Socket.io Architecture

#### 4.6.1 Connection and Auth Guard

```typescript
// server/src/sockets/index.ts
import { Server } from 'socket.io';
import http from 'http';
import { verifyToken } from '../utils/jwt';
import { corsOrigins, env } from '../config/env';

export function initSockets(server: http.Server) {
  const io = new Server(server, {
    cors: { origin: env.SOCKET_CORS_ORIGINS?.split(',') ?? corsOrigins, credentials: true },
    transports: ['websocket', 'polling'],
  });

  // JWT auth guard — validates token BEFORE any room join
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('UNAUTHORIZED'));
    try {
      const payload = verifyToken(token);
      socket.data.userId = payload.sub;
      socket.data.companyId = payload.companyId;
      next();
    } catch {
      next(new Error('TOKEN_INVALID'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('client:join_sheet', ({ sheetId }) => {
      socket.join(`sheet:${sheetId}`);
    });
    socket.on('client:leave_sheet', ({ sheetId }) => {
      socket.leave(`sheet:${sheetId}`);
    });
    // See Section 12.4 for guest event handlers and presence awareness
  });

  return io;
}
```

#### 4.6.2 Socket Event Catalogue

| Event | Direction | Payload | Trigger |
|-------|-----------|---------|---------|
| `client:join_sheet` | Client → Server | `{ sheetId }` | User opens RSVP screen |
| `client:leave_sheet` | Client → Server | `{ sheetId }` | User navigates away |
| `client:cell_edit` | Client → Server | `{ guestId, field, value }` | Cell value changes |
| `client:toggle_checkin` | Client → Server | `{ guestId, isCheckedIn }` | Check-in toggle |
| `server:row_added` | Server → Client | `{ guest: IGuest }` | New guest row |
| `server:row_updated` | Server → Client | `{ guestId, field, value, sourceSocketId }` | Cell saved |
| `server:row_deleted` | Server → Client | `{ guestId }` | Row soft-deleted |
| `server:checkin_updated` | Server → Client | `{ guestId, isCheckedIn, checkedInAt }` | Toggle saved |
| `server:counters_updated` | Server → Client | `{ counters: ICounter }` | Any counter-affecting change |
| `server:column_added` | Server → Client | `{ column: IColumnDefinition }` | Column created |
| `server:column_updated` | Server → Client | `{ column: IColumnDefinition }` | Column renamed or options edited |
| `server:column_deleted` | Server → Client | `{ columnId }` | Column deleted |
| `server:presence_joined` | Server → Client (room) | `{ userId, fullName, activeCount }` | Staff member opens sheet |
| `server:presence_left` | Server → Client (room) | `{ userId, activeCount }` | Staff member closes sheet |
| `server:presence_list` | Server → Client (sender only) | `{ members }` | On join — who else is here |
| `server:bulk_import_complete` | Server → Client (room) | `{ imported, sheetId }` | Import finished |
| `server:error` | Server → Client (sender) | `{ code, message }` | Any socket handler error |

---

### 4.7 Counter Computation (Aggregation Pipeline)

Counters are **never** computed by fetching all guest documents into JS memory. Always use a single MongoDB aggregation.

```typescript
// server/src/modules/guests/guest.service.ts

export interface ICounter {
  total: number; checkedIn: number; notArrived: number;
  notComing: number; idsPending: number; idsReceived: number; vip: number;
}

export async function computeCounters(sheetId: string): Promise<ICounter> {
  const result = await Guest.aggregate([
    { $match: { sheetId: new Types.ObjectId(sheetId), isDeleted: false, guestName: { $nin: [null, ''] } } },
    { $group: {
      _id: null,
      total:       { $sum: 1 },
      checkedIn:   { $sum: { $cond: ['$isCheckedIn', 1, 0] } },
      notComing:   { $sum: { $cond: [{ $eq: ['$guestStatus', 'Not Coming'] }, 1, 0] } },
      idsPending:  { $sum: { $cond: [{ $or: [{ $in: ['$idType', [null, '', 'Pending']] }] }, 1, 0] } },
      idsReceived: { $sum: { $cond: [{ $and: [{ $ne: ['$idType', null] }, { $ne: ['$idType', ''] }, { $ne: ['$idType', 'Pending'] }] }, 1, 0] } },
      vip:         { $sum: { $cond: [{ $eq: ['$guestStatus', 'VIP'] }, 1, 0] } },
    }},
    { $addFields: { notArrived: { $max: [0, { $subtract: ['$total', { $add: ['$checkedIn', '$notComing'] }] }] } } },
    { $project: { _id: 0, total: 1, checkedIn: 1, notArrived: 1, notComing: 1, idsPending: 1, idsReceived: 1, vip: 1 } },
  ]);
  return result[0] ?? { total:0, checkedIn:0, notArrived:0, notComing:0, idsPending:0, idsReceived:0, vip:0 };
}
```

**Emit after every counter-affecting operation:**

```typescript
const counters = await computeCounters(sheetId);
io.to(`sheet:${sheetId}`).emit('server:counters_updated', { counters });
```

---

### 4.8 Background Jobs (Cron)

```typescript
// server/src/services/cron.service.ts
import cron from 'node-cron';

export function startCronJobs() {
  // Every 5 min: delete expired OTPs (TTL index handles this too — belt + suspenders)
  cron.schedule('*/5 * * * *', cleanupExpiredOtps);

  // Daily at 2 AM IST: hard-delete soft-deleted data older than 30 days
  cron.schedule('0 20 * * *', cleanupSoftDeletedData); // 20:00 UTC = 01:30 IST
}
```

---

<!-- ============================================================
     REPLACEMENT FOR SECTION 5 IN InviteSheet_PRD_Complete.md
     Replace everything from "## 5. API Documentation Standard"
     down to (but NOT including) "## 6. Backend Security Checklist"
     ============================================================ -->

## 5. API Documentation Standard

Every endpoint is documented with a full request body, all possible response shapes, exact field names, and business rules. This section is the canonical reference — the Postman collection, the Socket.io handlers, and the frontend API hooks must all match what is written here.

**Base URL:** `/api/v1`  
**Auth header:** `Authorization: Bearer <accessToken>` (required on all authenticated endpoints)  
**Content-Type:** `application/json` (all request bodies)

---

### 5.1 Auth Module (`/api/v1/auth`)

---

#### POST /api/v1/auth/register

**Description:** Create a new user account and linked company. Sends a 6-digit OTP to the provided email. Does NOT issue tokens — tokens are issued only after email verification.  
**Auth required:** No  
**Rate limit:** Auth limiter (10 req/min)

**Request body:**
```json
{
  "companyName":     "Planet Events",         // Required. 2–100 chars.
  "fullName":        "Shruti Mehta",          // Required. 2–100 chars.
  "email":           "shruti@planetevents.com",// Required. Valid email. Must be unique.
  "phone":           "9820123456",            // Required. 10 digits, starts 6–9 (Indian mobile).
  "password":        "SecurePass@123",        // Required. Min 8 chars, 1 uppercase, 1 number, 1 special char.
  "confirmPassword": "SecurePass@123"         // Required. Must match password exactly.
}
```

**Response — 201 Created:**
```json
{
  "success": true,
  "data": {
    "userId":  "64a1b2c3d4e5f6a7b8c9d0e1",
    "email":   "shruti@planetevents.com",
    "message": "OTP sent to your email. Please verify to complete registration."
  }
}
```

**Response — 400 VALIDATION_ERROR** (missing/malformed fields):
```json
{
  "success": false,
  "error": {
    "code":    "VALIDATION_ERROR",
    "message": "Validation failed",
    "fields": {
      "phone":           ["Enter a valid 10-digit Indian mobile number"],
      "confirmPassword": ["Passwords do not match"]
    }
  }
}
```

**Response — 409 CONFLICT** (email already registered):
```json
{
  "success": false,
  "error": {
    "code":    "CONFLICT",
    "message": "An account with this email already exists."
  }
}
```

**Business rules:**
- Phone is stored internally as `+91XXXXXXXXXX` — the `+91` prefix is added server-side; the user submits 10 digits only.
- A `Company` document is created atomically alongside the `User` in the same async block. If company creation fails, the user is rolled back.
- OTP: 6 digits, generated with `crypto.randomInt(100000, 999999)`, bcrypt-hashed before storage, expires in `OTP_EXPIRES_IN_MINUTES` (default 10 min).
- Do NOT return tokens here. Tokens are only issued after `/auth/verify-email` succeeds.
- `onboardingStep` is set to `0` on creation.

---

#### POST /api/v1/auth/verify-email

**Description:** Submit the 6-digit OTP to verify email ownership. On success, issues access token and sets refresh cookie.  
**Auth required:** No  
**Rate limit:** Auth limiter

**Request body:**
```json
{
  "email": "shruti@planetevents.com", // Required.
  "otp":   "482931"                   // Required. 6 numeric digits.
}
```

**Response — 200 OK:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "user": {
      "_id":              "64a1b2c3d4e5f6a7b8c9d0e1",
      "fullName":         "Shruti Mehta",
      "email":            "shruti@planetevents.com",
      "role":             "owner",
      "isEmailVerified":  true,
      "onboardingStep":   1
    },
    "company": {
      "_id":         "64a1b2c3d4e5f6a7b8c9d0e2",
      "companyName": "Planet Events",
      "plan":        "free",
      "eventsUsed":  0
    }
  }
}
```
**Set-Cookie:** `refreshToken=<rawToken>; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth/refresh; Max-Age=604800`

**Response — 400 INVALID_OTP** (wrong OTP, attempts remaining):
```json
{
  "success": false,
  "error": {
    "code":    "INVALID_OTP",
    "message": "Incorrect OTP. 2 attempts remaining."
  }
}
```

**Response — 400 TOO_MANY_OTP_ATTEMPTS:**
```json
{
  "success": false,
  "error": {
    "code":    "TOO_MANY_OTP_ATTEMPTS",
    "message": "OTP locked after too many wrong attempts. Please request a new OTP."
  }
}
```

**Response — 401 OTP_EXPIRED:**
```json
{
  "success": false,
  "error": {
    "code":    "OTP_EXPIRED",
    "message": "OTP has expired. Please request a new one."
  }
}
```

**Business rules:**
- Wrong OTP increments `attempts` counter on the OTP document. When `attempts >= OTP_MAX_ATTEMPTS` (default 3), return `TOO_MANY_OTP_ATTEMPTS` and mark OTP unusable.
- Correct OTP: set `User.isEmailVerified = true`, `onboardingStep = 1`, mark OTP `usedAt = new Date()`.
- Issue access token (15 min) and refresh token (7 days). Refresh token is raw 32 bytes from `crypto.randomBytes(32)`, bcrypt-hashed before storage in `RefreshToken` collection.
- Access token payload: `{ sub: userId, companyId, role }`.

---

#### POST /api/v1/auth/login

**Description:** Authenticate with email and password. Returns access token; sets refresh cookie.  
**Auth required:** No  
**Rate limit:** Auth limiter (10 req/min, `skipSuccessfulRequests: true`)

**Request body:**
```json
{
  "email":    "shruti@planetevents.com",
  "password": "SecurePass@123"
}
```

**Response — 200 OK:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "user": {
      "_id":            "64a1b2c3d4e5f6a7b8c9d0e1",
      "fullName":       "Shruti Mehta",
      "email":          "shruti@planetevents.com",
      "role":           "owner",
      "onboardingStep": 4
    },
    "company": {
      "_id":         "64a1b2c3d4e5f6a7b8c9d0e2",
      "companyName": "Planet Events",
      "plan":        "free",
      "eventsUsed":  1
    }
  }
}
```
**Set-Cookie:** `refreshToken=<rawToken>; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth/refresh; Max-Age=604800`

**Response — 401 UNAUTHORIZED** (wrong credentials OR non-existent email — same message for both):
```json
{
  "success": false,
  "error": {
    "code":    "UNAUTHORIZED",
    "message": "Invalid email or password."
  }
}
```

**Response — 401 ACCOUNT_LOCKED:**
```json
{
  "success": false,
  "error": {
    "code":    "ACCOUNT_LOCKED",
    "message": "Account locked after too many failed attempts. Try again in 12 minutes."
  }
}
```

**Business rules:**
- Check `lockUntil` first. If `lockUntil > Date.now()`, return `ACCOUNT_LOCKED` immediately — do not compare password.
- If password is wrong: increment `loginAttempts`. When `loginAttempts >= LOGIN_MAX_ATTEMPTS` (default 5): set `lockUntil = Date.now() + LOGIN_LOCK_DURATION_MINUTES * 60000`.
- If password is correct: reset `loginAttempts = 0`, `lockUntil = null`, issue tokens.
- Error message is **identical** whether the email does not exist or the password is wrong — prevents user enumeration.
- User must have `isEmailVerified = true`. If not verified, return `UNAUTHORIZED` with message "Please verify your email before logging in."

---

#### POST /api/v1/auth/refresh

**Description:** Exchange the refresh token cookie for a new access token. Rotates the refresh token — the old one is revoked.  
**Auth required:** No (reads `refreshToken` HttpOnly cookie automatically)  
**Rate limit:** Global limiter only

**Request body:** None.

**Response — 200 OK:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9..."
  }
}
```
**Set-Cookie:** new `refreshToken` cookie (old one revoked in DB)

**Response — 401 REFRESH_TOKEN_INVALID** (token not found, revoked, or expired):
```json
{
  "success": false,
  "error": {
    "code":    "REFRESH_TOKEN_INVALID",
    "message": "Session expired. Please log in again."
  }
}
```

**Response — 401 REFRESH_TOKEN_INVALID** (reuse detected — all sessions revoked):
```json
{
  "success": false,
  "error": {
    "code":    "REFRESH_TOKEN_INVALID",
    "message": "Session invalidated due to suspicious activity. Please log in again."
  }
}
```

**Business rules:**
- Read raw token from cookie. Find matching `RefreshToken` document using `bcrypt.compare()` against stored hashes.
- If a **previously revoked** token is submitted: this is a breach signal. Immediately call `RefreshToken.updateMany({ userId }, { isRevoked: true })` to revoke ALL sessions for that user. Return `REFRESH_TOKEN_INVALID`.
- If token is valid: mark old token `isRevoked = true`, create new `RefreshToken` document, return new access token + set new cookie.
- Never use `===` for token comparison — always `crypto.timingSafeEqual()` indirectly via bcrypt.

---

#### POST /api/v1/auth/logout

**Description:** Revoke the current refresh token and clear the cookie.  
**Auth required:** Yes  
**Rate limit:** Global limiter

**Request body:** None.

**Response — 200 OK:**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully."
  }
}
```
**Set-Cookie:** `refreshToken=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Strict`

**Business rules:**
- Read refresh token from cookie; find and mark `isRevoked: true` in `RefreshToken` collection.
- If cookie is missing or token not found: still return 200 — logout is always successful from the client's perspective.

---

#### POST /api/v1/auth/forgot-password

**Description:** Send a password-reset OTP to the registered email. Returns the same response whether the email exists or not — prevents email enumeration.  
**Auth required:** No  
**Rate limit:** Auth limiter

**Request body:**
```json
{
  "email": "shruti@planetevents.com" // Required. Valid email format.
}
```

**Response — 200 OK** (always — even if email not found):
```json
{
  "success": true,
  "data": {
    "message": "If this email is registered, a password reset OTP has been sent."
  }
}
```

**Business rules:**
- If email exists: invalidate any previous unused OTP for `purpose: 'password_reset'` for that email, generate new 6-digit OTP, bcrypt-hash, store, send email.
- If email does not exist: do nothing server-side, return identical 200 response.
- OTP expires in `OTP_EXPIRES_IN_MINUTES` (default 10 min).

---

#### POST /api/v1/auth/reset-password

**Description:** Verify the password-reset OTP and set a new password. Revokes all existing refresh tokens on success.  
**Auth required:** No  
**Rate limit:** Auth limiter

**Request body:**
```json
{
  "email":           "shruti@planetevents.com",
  "otp":             "293847",
  "newPassword":     "NewSecure@456",
  "confirmPassword": "NewSecure@456"
}
```

**Response — 200 OK:**
```json
{
  "success": true,
  "data": {
    "message": "Password reset successful. Please log in with your new password."
  }
}
```

**Response — 400 INVALID_OTP / TOO_MANY_OTP_ATTEMPTS / OTP_EXPIRED:** (same shapes as verify-email)

**Response — 400 VALIDATION_ERROR** (passwords don't match):
```json
{
  "success": false,
  "error": {
    "code":    "VALIDATION_ERROR",
    "message": "Validation failed",
    "fields": { "confirmPassword": ["Passwords do not match"] }
  }
}
```

**Business rules:**
- Find OTP by `email + purpose:'password_reset'`, not yet used, not expired.
- Wrong OTP increments attempts; 3 wrong attempts locks OTP (same as verify-email).
- On success: hash new password with bcrypt (cost 10+), update `User.passwordHash`, mark OTP `usedAt`, then `RefreshToken.updateMany({ userId }, { isRevoked: true })` to force re-login on all devices.

---

#### POST /api/v1/auth/resend-otp

**Description:** Resend the OTP for email verification or password reset.  
**Auth required:** No  
**Rate limit:** Auth limiter + per-email 1 resend per 30 seconds (enforced by checking OTP `createdAt`)

**Request body:**
```json
{
  "email":   "shruti@planetevents.com",
  "purpose": "email_verify"             // Required. "email_verify" | "password_reset"
}
```

**Response — 200 OK:**
```json
{
  "success": true,
  "data": {
    "message": "OTP resent. Please check your email."
  }
}
```

**Response — 429 RATE_LIMIT_EXCEEDED** (resend too soon):
```json
{
  "success": false,
  "error": {
    "code":    "RATE_LIMIT_EXCEEDED",
    "message": "Please wait 30 seconds before requesting another OTP."
  }
}
```

**Business rules:**
- Check if the most recent OTP for this email+purpose was created less than 30 seconds ago. If yes, return 429.
- If no existing OTP or it expired: create a fresh one and send.
- Invalidate the previous OTP (set `usedAt = new Date()`) before creating the new one.
- Always return 200 even if email not registered (anti-enumeration).

---

### 5.2 User Module (`/api/v1/users`)

All endpoints in this module require authentication.

---

#### GET /api/v1/users/me

**Description:** Returns the authenticated user's profile. Never returns `passwordHash`.  
**Auth required:** Yes

**Response — 200 OK:**
```json
{
  "success": true,
  "data": {
    "_id":             "64a1b2c3d4e5f6a7b8c9d0e1",
    "fullName":        "Shruti Mehta",
    "email":           "shruti@planetevents.com",
    "phone":           "+919820123456",
    "role":            "owner",
    "isEmailVerified": true,
    "onboardingStep":  4,
    "createdAt":       "2025-01-15T10:30:00.000Z"
  }
}
```

---

#### PATCH /api/v1/users/me

**Description:** Update user profile fields. All fields are optional — only send what changes.  
**Auth required:** Yes

**Request body:**
```json
{
  "fullName": "Shruti Shah",     // Optional. 2–100 chars.
  "phone":    "9820654321"      // Optional. 10-digit Indian format.
}
```

**Response — 200 OK:** Returns updated user object (same shape as GET /users/me).

**Response — 400 VALIDATION_ERROR:** Field-level errors if phone format is invalid.

---

#### PATCH /api/v1/users/me/password

**Description:** Change password. Revokes all refresh tokens on success (forces re-login on all devices).  
**Auth required:** Yes

**Request body:**
```json
{
  "currentPassword": "OldPass@123",  // Required.
  "newPassword":     "NewPass@456",  // Required. Same strength rules as registration.
  "confirmPassword": "NewPass@456"   // Required. Must match newPassword.
}
```

**Response — 200 OK:**
```json
{
  "success": true,
  "data": {
    "message": "Password changed. Please log in again on all devices."
  }
}
```

**Response — 401 UNAUTHORIZED** (wrong currentPassword):
```json
{
  "success": false,
  "error": {
    "code":    "UNAUTHORIZED",
    "message": "Current password is incorrect."
  }
}
```

**Business rules:**
- Verify `currentPassword` against stored hash using bcrypt.
- Hash `newPassword` with bcrypt (cost 10+).
- Call `RefreshToken.updateMany({ userId }, { isRevoked: true })` after saving new password.

---

#### PATCH /api/v1/users/me/onboarding

**Description:** Save the current onboarding step so the modal can resume from the correct step on next login.  
**Auth required:** Yes

**Request body:**
```json
{
  "step": 2  // Required. Integer 0–4. Cannot go backwards (step must be >= current onboardingStep).
}
```

**Response — 200 OK:**
```json
{
  "success": true,
  "data": {
    "onboardingStep": 2
  }
}
```

**Response — 400 INVALID_REQUEST** (step goes backwards):
```json
{
  "success": false,
  "error": {
    "code":    "INVALID_REQUEST",
    "message": "Onboarding step cannot go backwards."
  }
}
```

**Business rules:**
- Step 4 = onboarding complete. When step reaches 4, also set `Company.onboardingComplete = true`.
- Validate step is a number 0–4.

---

#### DELETE /api/v1/users/me

**Description:** Soft-delete the user's own account. Cascades to their company, all events, all sheets, and all guests.  
**Auth required:** Yes  
**Minimum role:** owner

**Request body:**
```json
{
  "confirmText": "DELETE MY ACCOUNT"  // Required. Must match exactly — case-sensitive, no trim.
}
```

**Response — 200 OK:**
```json
{
  "success": true,
  "data": {
    "message": "Account scheduled for deletion."
  }
}
```

**Response — 400 CONFIRM_TEXT_MISMATCH:**
```json
{
  "success": false,
  "error": {
    "code":    "CONFIRM_TEXT_MISMATCH",
    "message": "Confirmation text did not match. Type exactly: DELETE MY ACCOUNT"
  }
}
```

**Business rules:**
- Set `isDeleted: true` + `deletedAt: new Date()` on: User, Company, all Events for that company, all Sheets for those events, all Guests for those sheets.
- Revoke all refresh tokens.
- Clear the refresh cookie in the response.
- A background cron job hard-deletes soft-deleted data older than 30 days.

---

#### GET /api/v1/users/me/export

**Description:** GDPR data portability export. Returns all data associated with the user and their company as a JSON download.  
**Auth required:** Yes  
**Rate limit:** 1 request per 24 hours per user

**Response — 200 OK:**
```json
{
  "success": true,
  "data": {
    "exportedAt": "2025-01-15T10:30:00.000Z",
    "user": { "_id": "...", "fullName": "...", "email": "...", "phone": "..." },
    "company": { "_id": "...", "companyName": "...", "plan": "..." },
    "events": [
      {
        "_id":  "...",
        "name": "Ritika & Yash Wedding",
        "sheets": [
          {
            "_id":    "...",
            "name":   "Guest List",
            "guests": [ { "guestName": "Rahul Sharma", "contactNumber": "+919820001234" } ]
          }
        ]
      }
    ]
  }
}
```

**Business rules:**
- Do not include `passwordHash`, `tokenHash`, or `otpHash` in the export.
- Response header: `Content-Disposition: attachment; filename="invitesheet-export-<date>.json"`.

---

### 5.3 Company Module (`/api/v1/companies`)

All endpoints require authentication.

---

#### GET /api/v1/companies/me

**Description:** Returns the authenticated user's company profile.  
**Auth required:** Yes

**Response — 200 OK:**
```json
{
  "success": true,
  "data": {
    "_id":              "64a1b2c3d4e5f6a7b8c9d0e2",
    "companyName":      "Planet Events",
    "logoUrl":          null,
    "whatsappNumber":   "+919820123456",
    "city":             "Mumbai",
    "plan":             "free",
    "eventsUsed":       1,
    "onboardingComplete": false
  }
}
```

---

#### PATCH /api/v1/companies/me

**Description:** Update company profile. All fields optional.  
**Auth required:** Yes. Minimum role: `owner` or `admin`.

**Request body:**
```json
{
  "companyName":    "Planet Events Pvt Ltd",  // Optional. 2–100 chars.
  "whatsappNumber": "9820123456",             // Optional. 10-digit Indian format.
  "city":           "Pune"                   // Optional. Max 100 chars.
}
```

**Response — 200 OK:** Returns updated company object (same shape as GET /companies/me).

---

#### GET /api/v1/companies/me/stats

**Description:** Returns aggregated statistics for the company dashboard Quick Stats bar.  
**Auth required:** Yes

**Response — 200 OK:**
```json
{
  "success": true,
  "data": {
    "totalEvents":         12,
    "activeEvents":         3,
    "totalGuestsManaged": 1240,
    "whatsappMessagesSent": 890
  }
}
```

---

### 5.4 Event Module (`/api/v1/events`)

All endpoints require authentication. All endpoints enforce `assertOwnership` by filtering on `companyId`.

---

#### POST /api/v1/events

**Description:** Create a new event. Also creates a default sheet named "Guest List" with the 3 locked columns (Guest Name, Contact Number, Check-In Toggle) pre-seeded.  
**Auth required:** Yes

**Request body:**
```json
{
  "name":      "Ritika & Yash Wedding",  // Required. 2–150 chars.
  "location":  "Taj Lands End, Mumbai",   // Required. 2–200 chars.
  "eventType": "Wedding",                 // Required. "Wedding" | "Corporate" | "Social" | "Other"
  "startDate": "2025-11-15",             // Required. ISO 8601 date string (YYYY-MM-DD).
  "endDate":   "2025-11-17"             // Required. Must be >= startDate.
}
```

**Response — 201 Created:**
```json
{
  "success": true,
  "data": {
    "_id":          "64a1b2c3d4e5f6a7b8c9d0e3",
    "name":         "Ritika & Yash Wedding",
    "location":     "Taj Lands End, Mumbai",
    "eventType":    "Wedding",
    "startDate":    "2025-11-15T00:00:00.000Z",
    "endDate":      "2025-11-17T00:00:00.000Z",
    "status":       "upcoming",
    "defaultSheetId": "64a1b2c3d4e5f6a7b8c9d0e4"
  }
}
```

**Response — 400 INVALID_REQUEST** (endDate before startDate):
```json
{
  "success": false,
  "error": {
    "code":    "INVALID_REQUEST",
    "message": "End date cannot be before start date."
  }
}
```

**Response — 403 PLAN_LIMIT_REACHED:**
```json
{
  "success": false,
  "error": {
    "code":    "PLAN_LIMIT_REACHED",
    "message": "You have reached the free plan limit of 2 events. Upgrade to Pro to create unlimited events."
  }
}
```

**Business rules:**
- Check `company.eventsUsed >= FREE_PLAN_EVENT_LIMIT` before creating. Return 403 if exceeded.
- On success, increment `company.eventsUsed` by 1.
- Auto-create a Sheet named "Guest List" with `position: 0` and 3 locked `columnDefinitions` embedded: Guest Name (text, isLocked: true), Contact Number (text, isLocked: true), Check-In (checkin type, isLocked: true).
- `status` is computed: `upcoming` if `startDate > today`, `active` if `startDate <= today <= endDate`, `past` if `endDate < today`.

---

#### GET /api/v1/events

**Description:** Paginated list of all events for the company, with per-event guest counter summary.  
**Auth required:** Yes

**Query params:**
```
?status=active|past|upcoming|all    Default: all
?page=1                              Default: 1
?limit=20                            Default: 20. Max: 100.
```

**Response — 200 OK:**
```json
{
  "success": true,
  "data": [
    {
      "_id":       "64a1b2c3d4e5f6a7b8c9d0e3",
      "name":      "Ritika & Yash Wedding",
      "location":  "Taj Lands End, Mumbai",
      "eventType": "Wedding",
      "startDate": "2025-11-15T00:00:00.000Z",
      "endDate":   "2025-11-17T00:00:00.000Z",
      "status":    "active",
      "sheetCount": 2,
      "counters": {
        "totalGuests": 124,
        "checkedIn":    45,
        "notComing":     3,
        "idsPending":   12
      }
    }
  ],
  "pagination": {
    "total":      12,
    "page":        1,
    "limit":      20,
    "totalPages":  1
  }
}
```

**Business rules:**
- `counters` on the list view aggregate across ALL sheets of the event (not per-sheet).
- Filter by `companyId` — users can only see their own company's events.
- Soft-deleted events (`isDeleted: true`) are never returned.

---

#### GET /api/v1/events/:eventId

**Description:** Single event with all sheet tabs.  
**Auth required:** Yes

**Response — 200 OK:**
```json
{
  "success": true,
  "data": {
    "_id":       "64a1b2c3d4e5f6a7b8c9d0e3",
    "name":      "Ritika & Yash Wedding",
    "location":  "Taj Lands End, Mumbai",
    "eventType": "Wedding",
    "startDate": "2025-11-15T00:00:00.000Z",
    "endDate":   "2025-11-17T00:00:00.000Z",
    "status":    "active",
    "sheets": [
      { "_id": "64a1b2c3d4e5f6a7b8c9d0e4", "name": "Guest List",  "position": 0, "tabColor": null, "guestCount": 124 },
      { "_id": "64a1b2c3d4e5f6a7b8c9d0e5", "name": "VIP Guests",  "position": 1, "tabColor": "#7C3AED", "guestCount": 18 }
    ]
  }
}
```

**Response — 404 NOT_FOUND:**
```json
{
  "success": false,
  "error": { "code": "NOT_FOUND", "message": "Event not found." }
}
```

---

#### PATCH /api/v1/events/:eventId

**Description:** Update event details. All fields optional.  
**Auth required:** Yes

**Request body:**
```json
{
  "name":      "Ritika & Yash Wedding — Updated",  // Optional.
  "location":  "The Leela, Mumbai",                // Optional.
  "eventType": "Wedding",                          // Optional.
  "startDate": "2025-11-15",                       // Optional.
  "endDate":   "2025-11-18"                        // Optional. Must be >= startDate.
}
```

**Response — 200 OK:** Returns updated event (same shape as GET /events/:eventId without the sheets array).

---

#### DELETE /api/v1/events/:eventId

**Description:** Soft-delete an event and all its sheets and guests.  
**Auth required:** Yes. Minimum role: `owner` or `admin`.

**Response — 200 OK:**
```json
{
  "success": true,
  "data": {
    "message": "Event deleted successfully."
  }
}
```

**Business rules:**
- Sets `isDeleted: true` + `deletedAt: new Date()` on: the Event, all child Sheets, all child Guests.
- Decrements `company.eventsUsed` by 1.
- Emits `server:counters_updated` to any open socket rooms for sheets of this event.

---

### 5.5 Sheet Module (`/api/v1/events/:eventId/sheets`)

All endpoints require authentication and assert that `eventId` belongs to the request user's company.

---

#### GET /api/v1/events/:eventId/sheets

**Description:** Returns all sheet tabs for an event, including their full column definitions.  
**Auth required:** Yes

**Response — 200 OK:**
```json
{
  "success": true,
  "data": [
    {
      "_id":      "64a1b2c3d4e5f6a7b8c9d0e4",
      "name":     "Guest List",
      "position": 0,
      "tabColor": null,
      "guestCount": 124,
      "columnDefinitions": [
        {
          "_id":           "col_001",
          "name":          "Guest Name",
          "type":          "text",
          "isLocked":      true,
          "isMandatory":   true,
          "dropdownOptions": [],
          "width":         200,
          "order":         0
        },
        {
          "_id":           "col_002",
          "name":          "Contact Number",
          "type":          "text",
          "isLocked":      true,
          "isMandatory":   true,
          "dropdownOptions": [],
          "width":         160,
          "order":         1
        },
        {
          "_id":           "col_003",
          "name":          "ID Type",
          "type":          "dropdown",
          "isLocked":      false,
          "isMandatory":   false,
          "dropdownOptions": ["Aadhaar","Passport","Voter ID","Driving Licence","Other","Pending"],
          "width":         140,
          "order":         2
        },
        {
          "_id":           "col_004",
          "name":          "Check In",
          "type":          "checkin",
          "isLocked":      true,
          "isMandatory":   true,
          "dropdownOptions": [],
          "width":         110,
          "order":         3
        }
      ]
    }
  ]
}
```

---

#### POST /api/v1/events/:eventId/sheets

**Description:** Create a new sheet tab for an event. Guest Name, Contact Number, and Check-In Toggle are always created regardless of `selectedColumns`.  
**Auth required:** Yes

**Request body:**
```json
{
  "name":            "VIP Guests",                        // Required. 1–60 chars.
  "tabColor":        "#7C3AED",                          // Optional. Hex color. Null = default gray.
  "selectedColumns": ["noOfPax","idType","travelPlan"]   // Optional. Identifiers for standard optional columns.
}
```

Valid `selectedColumns` identifiers: `noOfPax`, `noOfKids`, `roomNumber`, `travelPlan`, `idType`, `arrivalDate`, `departureDate`, `guestStatus`, `comments`.

**Response — 201 Created:**
```json
{
  "success": true,
  "data": {
    "_id":      "64a1b2c3d4e5f6a7b8c9d0e5",
    "name":     "VIP Guests",
    "position": 1,
    "tabColor": "#7C3AED",
    "eventId":  "64a1b2c3d4e5f6a7b8c9d0e3",
    "columnDefinitions": [ /* full column array, locked columns always first */ ]
  }
}
```

**Business rules:**
- Column order: Guest Name (0) → Contact Number (1) → selected optional columns (2, 3, …) → Check-In Toggle (always last).
- `position` is set to `max(existing sheet positions) + 1`.
- Default `dropdownOptions` are seeded for `idType` (Aadhaar, Passport, Voter ID, Driving Licence, Other, Pending), `travelPlan` (By Car, By Train, By Flight, By Bus, Not Decided), and `guestStatus` (Confirmed, Not Coming, VIP, Dont Call, Wrong Number, Pending).

---

#### PATCH /api/v1/events/:eventId/sheets/:sheetId

**Description:** Rename a sheet or change its tab color.  
**Auth required:** Yes

**Request body:**
```json
{
  "name":     "VIPs",       // Optional.
  "tabColor": "#16A34A"    // Optional. Pass null to reset to default.
}
```

**Response — 200 OK:** Returns updated sheet (same shape as the array item in GET /sheets, without `guestCount`).

---

#### DELETE /api/v1/events/:eventId/sheets/:sheetId

**Description:** Soft-delete a sheet and all its guests. Cannot delete the last remaining sheet on an event.  
**Auth required:** Yes. Minimum role: `owner` or `admin`.

**Response — 200 OK:**
```json
{
  "success": true,
  "data": { "message": "Sheet deleted." }
}
```

**Response — 400 INVALID_REQUEST** (last sheet):
```json
{
  "success": false,
  "error": {
    "code":    "INVALID_REQUEST",
    "message": "Cannot delete the last sheet on an event. Events must have at least one sheet."
  }
}
```

---

#### PATCH /api/v1/events/:eventId/sheets/reorder

**Description:** Change the display order of sheet tabs.  
**Auth required:** Yes

**Request body:**
```json
{
  "sheetIds": ["64a1b2c3...e4", "64a1b2c3...e5", "64a1b2c3...e6"]
  // Array of all sheetIds in the new desired order. Must include ALL sheet IDs for this event.
}
```

**Response — 200 OK:**
```json
{
  "success": true,
  "data": { "message": "Sheets reordered." }
}
```

**Response — 400 INVALID_REQUEST** (array missing some sheet IDs):
```json
{
  "success": false,
  "error": {
    "code":    "INVALID_REQUEST",
    "message": "sheetIds must include all sheet IDs for this event."
  }
}
```

---

### 5.6 Column Module (`/api/v1/sheets/:sheetId/columns`)

Column definitions are **embedded inside the Sheet document** — they are not a separate MongoDB collection. These endpoints read and write to `Sheet.columnDefinitions[]`. All endpoints assert that `sheetId` belongs to the request user's company.

---

#### GET /api/v1/sheets/:sheetId/columns

**Description:** Returns all column definitions for a sheet, sorted by `order`.  
**Auth required:** Yes

**Response — 200 OK:**
```json
{
  "success": true,
  "data": [
    {
      "_id":            "col_001",
      "name":           "Guest Name",
      "type":           "text",
      "isLocked":       true,
      "isMandatory":    true,
      "dropdownOptions": [],
      "width":          200,
      "order":          0
    },
    {
      "_id":            "col_003",
      "name":           "ID Type",
      "type":           "dropdown",
      "isLocked":       false,
      "isMandatory":    false,
      "dropdownOptions": ["Aadhaar","Passport","Voter ID","Driving Licence","Other","Pending"],
      "width":          140,
      "order":          2
    }
  ]
}
```

---

#### POST /api/v1/sheets/:sheetId/columns

**Description:** Add a new column to a sheet. Column is appended after existing columns (before Check-In Toggle, which is always last).  
**Auth required:** Yes

**Request body:**
```json
{
  "name":            "Meal Preference",              // Required. 1–60 chars. Must be unique within the sheet.
  "type":            "dropdown",                     // Required. "text" | "number" | "date" | "dropdown" | "checkin"
  "dropdownOptions": ["Veg", "Non-Veg", "Jain"]    // Required only when type is "dropdown".
}
```

**Response — 201 Created:**
```json
{
  "success": true,
  "data": {
    "_id":            "col_007",
    "name":           "Meal Preference",
    "type":           "dropdown",
    "isLocked":       false,
    "isMandatory":    false,
    "dropdownOptions": ["Veg", "Non-Veg", "Jain"],
    "width":          160,
    "order":          5
  }
}
```

**Response — 409 CONFLICT** (column name already exists in this sheet):
```json
{
  "success": false,
  "error": {
    "code":    "CONFLICT",
    "message": "A column named 'Meal Preference' already exists in this sheet."
  }
}
```

**Business rules:**
- Column `type` cannot be changed after creation. To change type: delete column and create a new one.
- The new column's `order` is inserted at `max(existing orders) - 1` — always just before the Check-In Toggle column.
- Emits `server:column_added` to the sheet's socket room.

---

#### PATCH /api/v1/sheets/:sheetId/columns/:columnId

**Description:** Update a column — rename it, edit dropdown options, update display width, or change its order position. Cannot change `type`.  
**Auth required:** Yes

**Request body:**
```json
{
  "name":            "Meal Choice",                      // Optional. Cannot rename locked columns.
  "dropdownOptions": ["Veg","Non-Veg","Jain","Vegan"],  // Optional. Only for dropdown type. Replaces full options array.
  "width":           180,                               // Optional. Pixel width. Min 60, max 600.
  "order":           3                                  // Optional. New position. Other columns shift automatically.
}
```

**Response — 200 OK:**
```json
{
  "success": true,
  "data": {
    "_id":            "col_007",
    "name":           "Meal Choice",
    "type":           "dropdown",
    "isLocked":       false,
    "dropdownOptions": ["Veg","Non-Veg","Jain","Vegan"],
    "width":          180,
    "order":          3
  }
}
```

**Response — 400 INVALID_REQUEST** (attempt to rename a locked column):
```json
{
  "success": false,
  "error": {
    "code":    "INVALID_REQUEST",
    "message": "Locked columns (Guest Name, Contact Number, Check-In) cannot be renamed."
  }
}
```

**Business rules:**
- If `order` is provided, recalculate `order` values for all other columns in the sheet to maintain a contiguous sequence without gaps.
- Emits `server:column_updated` to the sheet's socket room after any change.

---

#### DELETE /api/v1/sheets/:sheetId/columns/:columnId

**Description:** Soft-delete a custom column. Locked columns cannot be deleted.  
**Auth required:** Yes

**Response — 200 OK:**
```json
{
  "success": true,
  "data": { "message": "Column deleted." }
}
```

**Response — 403 COLUMN_LOCKED:**
```json
{
  "success": false,
  "error": {
    "code":    "COLUMN_LOCKED",
    "message": "This column is locked and cannot be deleted."
  }
}
```

**Business rules:**
- Remove the `columnDefinition` subdocument from `Sheet.columnDefinitions[]`.
- Use `Guest.updateMany({ sheetId }, { $unset: { ['data.' + columnId]: '' } })` to remove the corresponding data field from all guest documents in this sheet.
- Emits `server:column_deleted` (with `{ columnId }`) to the sheet's socket room.

---

### 5.7 Guest Module (`/api/v1/sheets/:sheetId/guests`)

All endpoints require authentication and assert that `sheetId` belongs to the request user's company.

---

#### GET /api/v1/sheets/:sheetId/guests

**Description:** Paginated list of guests for a sheet. Initial page load for AG Grid.  
**Auth required:** Yes

**Query params:**
```
?page=1              Default: 1
?limit=100           Default: 100. Max: 500.
?search=Sharma       Searches guestName (text index). URL-encoded.
?filter=checkedIn    Filter shortcut: checkedIn | notArrived | notComing | idsPending | idsReceived | vip
```

**Response — 200 OK:**
```json
{
  "success": true,
  "data": [
    {
      "_id":           "64a1b2c3d4e5f6a7b8c9d0f1",
      "rowIndex":      0,
      "guestName":     "Rahul Sharma",
      "contactNumber": "+919820001234",
      "isCheckedIn":   false,
      "checkedInAt":   null,
      "guestStatus":   "Confirmed",
      "idType":        "Aadhaar",
      "travelPlan":    "By Flight",
      "noOfPax":       2,
      "noOfKids":      0,
      "roomNumber":    "301",
      "arrivalDate":   "2025-11-15T14:00:00.000Z",
      "departureDate": "2025-11-17T11:00:00.000Z",
      "comments":      null,
      "data": {
        "col_007": "Veg"
      }
    }
  ],
  "pagination": {
    "total": 124, "page": 1, "limit": 100, "totalPages": 2
  }
}
```

**Business rules:**
- `data` map contains values for custom columns, keyed by `columnId`.
- Standard optional fields (`idType`, `travelPlan`, etc.) are top-level fields on the Guest document — not in the `data` map.
- `filter` param maps to: `checkedIn → isCheckedIn:true`, `notArrived → isCheckedIn:false + guestStatus:{$ne:'Not Coming'}`, `notComing → guestStatus:'Not Coming'`, `idsPending → idType:{$in:[null,'','Pending']}`, `idsReceived → idType:{$nin:[null,'','Pending']}`, `vip → guestStatus:'VIP'`.
- Never return `isDeleted: true` guests.

---

#### POST /api/v1/sheets/:sheetId/guests

**Description:** Add a single guest row. Used when staff types directly into the grid.  
**Auth required:** Yes

**Request body:**
```json
{
  "guestName":     "Priya Joshi",   // Optional. Can be blank for an empty row.
  "contactNumber": "9821000111",    // Optional.
  "guestStatus":   "Confirmed",     // Optional.
  "idType":        "Pending",       // Optional.
  "travelPlan":    "By Train",      // Optional.
  "noOfPax":       1,               // Optional.
  "noOfKids":      0,               // Optional.
  "roomNumber":    "302",           // Optional.
  "arrivalDate":   "2025-11-16",    // Optional. ISO date.
  "departureDate": "2025-11-17",    // Optional. ISO date.
  "comments":      null,            // Optional.
  "data":          { "col_007": "Non-Veg" }  // Optional. Custom column values.
}
```

**Response — 201 Created:** Full guest document (same shape as GET /guests list item).

**Response — 409 CONFLICT** (duplicate contact number in this sheet):
```json
{
  "success": false,
  "error": {
    "code":    "CONFLICT",
    "message": "A guest with contact number 9821000111 already exists in this sheet."
  }
}
```

**Business rules:**
- `rowIndex` is assigned server-side as `max(existing rowIndex in sheet) + 1`. Never trusted from the request body.
- Normalise `contactNumber`: strip spaces and dashes; if 10 digits starting 6–9, prepend `+91`.
- After insert: `computeCounters(sheetId)` → emit `server:row_added` + `server:counters_updated` to socket room.

---

#### PATCH /api/v1/sheets/:sheetId/guests/:guestId

**Description:** Update one or more fields on a guest row. Partial update — only send fields that changed.  
**Auth required:** Yes

**Request body:**
```json
{
  "guestName":   "Priya Joshi Patel",  // Optional. Any top-level guest field.
  "idType":      "Aadhaar",            // Optional. Changing idType updates denormalised field.
  "guestStatus": "VIP",               // Optional. Changing guestStatus updates denormalised field.
  "data": {
    "col_007": "Jain"                  // Optional. Custom column values by columnId.
  }
}
```

**Response — 200 OK:** Returns full updated guest document.

**Business rules:**
- `rowIndex` is NOT updatable via this endpoint.
- If `idType` or `guestStatus` changes, update the top-level denormalised field so counter aggregation queries remain fast.
- After update: `computeCounters(sheetId)` → emit `server:row_updated` (with `sourceSocketId`) + `server:counters_updated` to socket room.
- The socket event includes `sourceSocketId: socket.id` so the editing client can skip applying its own update.

---

#### DELETE /api/v1/sheets/:sheetId/guests/:guestId

**Description:** Soft-delete a guest row.  
**Auth required:** Yes

**Response — 200 OK:**
```json
{
  "success": true,
  "data": { "message": "Guest deleted." }
}
```

**Business rules:**
- Sets `isDeleted: true` + `deletedAt: new Date()`.
- After delete: `computeCounters(sheetId)` → emit `server:row_deleted` + `server:counters_updated` to socket room.

---

#### PATCH /api/v1/sheets/:sheetId/guests/:guestId/checkin

**Description:** Toggle check-in status for a single guest. This is the REST fallback for the Socket.io `client:toggle_checkin` event. Use the Socket.io path for real-time; this endpoint handles offline/reconnection scenarios.  
**Auth required:** Yes

**Request body:**
```json
{
  "isCheckedIn": true  // Required. Boolean.
}
```

**Response — 200 OK:**
```json
{
  "success": true,
  "data": {
    "guest": {
      "_id":         "64a1b2c3d4e5f6a7b8c9d0f1",
      "isCheckedIn": true,
      "checkedInAt": "2025-11-15T10:30:00.000Z"
    },
    "counters": {
      "total": 124, "checkedIn": 46, "notArrived": 75,
      "notComing": 3, "idsPending": 12, "idsReceived": 112, "vip": 8
    }
  }
}
```

**Response — 200 OK with warning** (guest is marked "Not Coming" but check-in forced through):
```json
{
  "success": true,
  "data": {
    "guest":    { "_id": "...", "isCheckedIn": true, "checkedInAt": "..." },
    "counters": { "total": 124, "checkedIn": 46, "notArrived": 75, "notComing": 3, "idsPending": 12, "idsReceived": 112, "vip": 8 }
  },
  "warning": {
    "code":    "NOT_COMING_CHECKIN",
    "message": "This guest is marked as Not Coming. Check-in recorded."
  }
}
```

**Business rules:**
- `checkedInAt` is set server-side to `new Date()` when `isCheckedIn` becomes `true`. Never trusted from the request body.
- `checkedInBy` is set to the authenticated `userId`.
- After update: `computeCounters(sheetId)` → emit `server:checkin_updated` + `server:counters_updated` to socket room.

---

#### PATCH /api/v1/sheets/:sheetId/checkin/room

**Description:** Bulk check-in all guests in a room (or only the unchecked ones). Used by Room View.  
**Auth required:** Yes

**Request body:**
```json
{
  "roomNumber": "301",        // Required.
  "mode":       "remaining"   // Required. "all" = check in every guest. "remaining" = only unchecked guests.
}
```

**Response — 200 OK:**
```json
{
  "success": true,
  "data": {
    "checkedInCount": 2,
    "guestIds":       ["64a1b2c3...f1", "64a1b2c3...f2"],
    "counters": {
      "total": 124, "checkedIn": 48, "notArrived": 73,
      "notComing": 3, "idsPending": 12, "idsReceived": 112, "vip": 8
    }
  }
}
```

**Response — 200 OK** (no guests found for that room):
```json
{
  "success": true,
  "data": {
    "checkedInCount": 0,
    "guestIds":       [],
    "counters":       { /* unchanged counter values */ }
  }
}
```

**Business rules:**
- Find all non-deleted guests in this sheet where `roomNumber === req.body.roomNumber`.
- `mode: "all"` → update all of them. `mode: "remaining"` → update only those where `isCheckedIn === false`.
- Set `checkedInAt = new Date()` and `checkedInBy = req.user._id` for each updated guest.
- Emit `server:checkin_updated` once per updated guest + one final `server:counters_updated` to socket room.

---

#### GET /api/v1/sheets/:sheetId/guests/counters

**Description:** Returns all 7 live counter values for the counter bar. Called once on page load; Socket.io keeps values current after that.  
**Auth required:** Yes

**Response — 200 OK:**
```json
{
  "success": true,
  "data": {
    "total":       124,
    "checkedIn":    45,
    "notArrived":   76,
    "notComing":     3,
    "idsPending":   12,
    "idsReceived": 112,
    "vip":           8
  }
}
```

**Business rules:**
- Computed using a single MongoDB `$aggregate` pipeline (see Section 4.7). Never fetch all documents into memory.
- `notArrived = max(0, total - checkedIn - notComing)` — computed in the `$addFields` stage.
- VIP guests are counted in both `vip` and whichever check-in counter applies (overlap is intentional).

---

#### POST /api/v1/sheets/:sheetId/guests/import

**Description:** Bulk import guests from a .xlsx, .xls, or .csv file.  
**Auth required:** Yes  
**Content-Type:** `multipart/form-data`  
**Field name:** `guestFile`  
**Max file size:** 5 MB

**Response — 201 Created:**
```json
{
  "success": true,
  "data": {
    "imported":           142,
    "skipped":              3,
    "duplicates": [
      { "row": 4, "contactNumber": "9820001234", "reason": "duplicate_in_file" }
    ],
    "existingDuplicates": [
      { "row": 12, "contactNumber": "9821005678", "reason": "already_in_sheet" }
    ],
    "newColumnsCreated": ["Meal Preference", "Bus Number"]
  }
}
```

**Response — 400 INVALID_FILE_TYPE:**
```json
{
  "success": false,
  "error": {
    "code":    "INVALID_FILE_TYPE",
    "message": "Only .xlsx, .xls, and .csv files are accepted."
  }
}
```

**Response — 400 EMPTY_FILE:**
```json
{
  "success": false,
  "error": {
    "code":    "EMPTY_FILE",
    "message": "The uploaded file contains no data rows."
  }
}
```

**Response — 400 MISSING_GUEST_NAME_COLUMN:**
```json
{
  "success": false,
  "error": {
    "code":    "MISSING_GUEST_NAME_COLUMN",
    "message": "Could not detect a guest name column in your file. Ensure a column named 'Guest Name', 'Name', or 'Full Name' is present."
  }
}
```

**Business rules:**
- File is processed in memory (multer `memoryStorage`). Never written to disk.
- Parse with SheetJS (from cdn.sheetjs.com — NOT the npm package, which is abandoned) for xlsx/xls; PapaParse for csv.
- First row = headers. Normalise headers: trim + lowercase for matching.
- Header mapping (case-insensitive): "guest name" / "name" / "full name" → `guestName`; "contact" / "mobile" / "phone" → `contactNumber`; "room" / "room no" → `roomNumber`; "id type" / "id proof" → `idType`; "travel" / "travel plan" → `travelPlan`; "status" → `guestStatus`; unknown headers → create new text column.
- Always ensure Check-In Toggle column exists after import.
- After bulk insert: emit `server:bulk_import_complete` + `server:counters_updated` to socket room.

---

#### GET /api/v1/sheets/:sheetId/export

**Description:** Download the full guest list as an .xlsx file.  
**Auth required:** Yes  
**Rate limit:** 10 exports per hour per company

**Query params:**
```
?format=xlsx    Default: xlsx. (csv planned for future)
```

**Response — 200 OK:**  
Stream directly to response with headers:
```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="Ritika_Yash_Wedding_GuestList_2025-11-15.xlsx"
```

**Business rules:**
- Row 1 = column headers in sheet order (all active, non-deleted columns).
- Always include: Check-In status (Yes/No) and Check-In timestamp as the last two columns, regardless of whether Check-In Toggle is last in column definitions.
- Excluded fields: `_id`, `companyId`, `eventId`, `sheetId`, `__v`, `isDeleted`, `deletedAt`, `rowIndex`.
- Stream the workbook directly — do not buffer the entire file in server memory before sending.

---

### 5.8 Error Code Master Reference

| HTTP | Code | When to use |
|------|------|-------------|
| 400 | `VALIDATION_ERROR` | Zod schema validation failed — always includes `fields` map |
| 400 | `INVALID_REQUEST` | Logically invalid (endDate before startDate; delete last sheet; onboarding step backwards) |
| 400 | `CONFIRM_TEXT_MISMATCH` | DELETE /users/me confirmation text wrong |
| 400 | `INVALID_FILE_TYPE` | Upload is not .xlsx, .xls, or .csv |
| 400 | `FILE_TOO_LARGE` | File exceeds 5 MB |
| 400 | `EMPTY_FILE` | File parsed, zero data rows |
| 400 | `MISSING_GUEST_NAME_COLUMN` | Import file has no detectable guest name column |
| 400 | `INVALID_OTP` | Submitted OTP does not match — includes remaining attempts in message |
| 400 | `TOO_MANY_OTP_ATTEMPTS` | OTP attempt count >= `OTP_MAX_ATTEMPTS` |
| 401 | `UNAUTHORIZED` | No token provided, or credentials wrong on login |
| 401 | `TOKEN_EXPIRED` | Access token expired — client must call `/auth/refresh` |
| 401 | `TOKEN_INVALID` | Token tampered or signed with wrong secret |
| 401 | `REFRESH_TOKEN_INVALID` | Refresh token not found, revoked, or reuse detected |
| 401 | `OTP_EXPIRED` | OTP TTL has passed |
| 401 | `ACCOUNT_LOCKED` | Too many failed login attempts — includes `unlockAt` time in message |
| 403 | `FORBIDDEN` | Authenticated but insufficient role |
| 403 | `PLAN_LIMIT_REACHED` | Free plan event or guest limit reached |
| 403 | `COLUMN_LOCKED` | Attempt to delete or rename a locked column |
| 404 | `NOT_FOUND` | Resource not found OR does not belong to this company (always 404, never 403 — prevents enumeration) |
| 409 | `CONFLICT` | Duplicate unique field (email on register; contact number on guest add; column name on column create) |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests in window |
| 500 | `INTERNAL_ERROR` | Unhandled server error — check Sentry |

## 6. Backend Security Checklist

Run through every item before every production deployment. P0 items are hard gates — the deployment does not proceed if any P0 item fails.

### 6.1 Environment & Configuration

| Priority | Check | Verify |
|----------|-------|--------|
| P0 | All secrets in `.env` — zero secrets hardcoded in source | `grep -r "secret\|password\|key" --include="*.ts" server/src/` — must match only `env.` references |
| P0 | `.env` in `.gitignore` — only `.env.example` committed | `git check-ignore -v server/.env` |
| P0 | Zod env validation crashes on bad config | Remove a required var, run `npm run dev` — must exit with descriptive error |
| P0 | `JWT_ACCESS_SECRET` ≠ `JWT_REFRESH_SECRET`, each ≥ 64 hex chars | Compare values; check length |
| P0 | `ENCRYPTION_KEY` is exactly 64 hex chars | `echo -n "$ENCRYPTION_KEY" \| wc -c` → must be 64 |
| P0 | No AWS/S3 env vars in schema — MVP is memory-only | `grep -i "aws\|s3_bucket" server/src/config/env.ts` → must return empty |
| P1 | MongoDB Atlas uses restricted DB user (not root) | Atlas console → Database Access → readWrite role only |
| P1 | Atlas IP allowlist contains only production server IPs | Atlas → Network Access → no `0.0.0.0/0` in production |
| P1 | `PORT=4000` in all environments | Check `.env.example`, Postman `baseUrl`, CI pipeline |

### 6.2 Authentication

| Priority | Check | Verify |
|----------|-------|--------|
| P0 | Access tokens 15 min TTL — in `Authorization` header only, never URL or cookie | Network tab: check request headers |
| P0 | Refresh cookie has `HttpOnly; Secure; SameSite=Strict` | DevTools → Application → Cookies |
| P0 | Refresh tokens hashed with bcrypt before DB storage | MongoDB Compass: `refreshTokens[].tokenHash` must be `$2b$` string |
| P0 | Token rotation: reused revoked token triggers full session revocation | Test: replay used refresh cookie — verify `refreshTokens` array cleared |
| P0 | `passwordHash` has `select: false` in Mongoose schema | Check User model — `passwordHash: { select: false }` |
| P0 | Passwords hashed with bcrypt cost factor ≥ 10 | Code review: `bcrypt.hash(password, 10)` |
| P1 | Account lockout after 5 failed logins — 15 min lock | Send 6 wrong passwords in succession — 6th returns `ACCOUNT_LOCKED` |
| P1 | Forgot-password returns identical response for any email | Test with registered and unregistered emails — responses must be byte-identical |
| P1 | `crypto.timingSafeEqual()` used for all token comparisons — no `===` | Code review: `grep -r "=== " server/src/utils/tokenCompare.ts` → must be empty |

### 6.3 API Security

| Priority | Check | Verify |
|----------|-------|--------|
| P0 | `helmet()` enabled — all security headers present | `curl -I https://api.yourdomain.com/health \| grep -i "x-frame\|x-content\|strict-transport"` |
| P0 | `express-mongo-sanitize()` in chain — NoSQL injection blocked | `POST { "email": { "$gt": "" } }` to `/auth/login` — must not return a user |
| P0 | `assertOwnership()` in every controller that receives an `:id` param | Code review: every `router.get('/:id')`, `router.patch('/:id')`, `router.delete('/:id')` has matching `assertOwnership()` |
| P0 | IDOR: resource from another company returns 404 | Use Company A token, request Company B event ID → must return 404 NOT_FOUND |
| P0 | `express.json({ limit: '10kb' })` — large body rejected | POST body > 10 KB → must return 413 |
| P1 | Rate limit: 10 req/min on auth routes (strict) | Send 11 POST `/auth/login` in 60s → 11th returns 429 |
| P1 | Zod validation on every route that accepts body/query/params | Send missing required fields to every POST/PATCH → must return 400 VALIDATION_ERROR |
| P1 | File upload: type validated server-side (not just client) | Upload `.pdf` renamed to `.xlsx` → must return 400 INVALID_FILE_TYPE |
| P1 | Free plan limit enforced server-side (not just UI gate) | Create 3rd event via API on free plan → must return 403 PLAN_LIMIT_REACHED |
| P2 | Socket.io events validated with Zod before touching DB | Code review: every `socket.on()` handler calls `schema.safeParse(data)` |

### 6.4 Data & Privacy

| Priority | Check | Verify |
|----------|-------|--------|
| P0 | `passwordHash` never in any API response | GET `/users/me` — verify field absent |
| P0 | `tokenHash` fields never in any API response | Check all API responses involving RefreshToken |
| P0 | DELETE `/users/me` requires exact confirmation text | Wrong text → 400 CONFIRM_TEXT_MISMATCH |
| P1 | GET `/users/me/export` exists for GDPR compliance | Call endpoint — must return all user + guest data |
| P1 | TTL index on OTP collection (10 min) | MongoDB Compass → Indexes on OTP collection |
| P1 | `checkedInAt` set server-side — never trusted from client | Code review: `checkedInAt = new Date()` in service, not from `req.body` |
| P2 | Full-text search index only on `guestName` (non-sensitive) | `guestSchema.index({ guestName: 'text' })` — not contactNumber, idType |

### 6.5 Logging & Monitoring

| Priority | Check | Verify |
|----------|-------|--------|
| P0 | Winston in production — no `console.log` in production paths | `grep -r "console.log" server/src/` — must return empty or dev-only paths |
| P0 | No PII in any log line | Trigger login, check logs — must not contain phone, email, token values |
| P0 | `npm audit --audit-level=high` returns zero vulnerabilities | Run command — must exit code 0 |
| P0 | Sentry `beforeSend` hook scrubs PII before events are transmitted | Check `server/src/app.ts` Sentry init — SCRUB_KEYS list present |
| P1 | Sentry configured and receiving errors | Intentionally throw error in dev — verify it appears in Sentry dashboard |
| P1 | `/health` returns 200, excluded from rate limits | `curl http://localhost:4000/health` — must respond in < 100ms even under load |
| P1 | All cron jobs wrapped in `try/catch` — never crash the process | Code review: every `cron.schedule()` callback has `try/catch` |

### 6.6 Socket.io Security

| Priority | Check | Verify |
|----------|-------|--------|
| P0 | JWT auth guard on every connection — no unauthenticated socket access | Connect without token → must disconnect immediately with UNAUTHORIZED |
| P0 | Sheet room membership requires ownership — users cannot join other companies' sheets | Connect as Company A, emit `join_sheet` with Company B sheetId → server must silently ignore or validate |
| P1 | `server:counters_updated` emitted to room only — never `io.emit()` | Code review: all Socket.io emits after data changes use `io.to(`sheet:${sheetId}`)` |

### 6.7 Infrastructure & Deployment

| Priority | Check | Verify |
|----------|-------|--------|
| P0 | HTTPS enforced in production — no HTTP traffic | `curl http://api.yourdomain.com` — must redirect to HTTPS |
| P0 | `npm ci` in CI — not `npm install` | Check `.github/workflows/ci.yml` |
| P0 | TypeScript strict mode on | `npx tsc --noEmit` exits with 0 errors |
| P1 | `.cursorignore` at repo root | File exists with `.env*`, `node_modules/`, `dist/` entries |
| P1 | Dependabot enabled | GitHub → Settings → Security → Dependabot alerts enabled |
| P2 | `PORT=4000` consistent across `.env.example`, Postman `baseUrl`, CI pipeline env | Check all three — must match |

---

## 7. Frontend Architecture

### 7.1 Axios Client Setup

Two Axios instances are required. Mixing them causes infinite retry loops.

```typescript
// apps/web/src/lib/api/client.ts
import axios, { AxiosInstance } from 'axios';
import { tokenStore } from '../auth/tokenStore';
import { refreshClient } from './refreshClient';

export const client: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL + '/api/v1',
  withCredentials: true,
  timeout: 10_000,
});

client.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let refreshQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (
      error.response?.status === 401 &&
      error.response?.data?.error?.code === 'TOKEN_EXPIRED' &&
      !original._retry
    ) {
      original._retry = true;
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return client(original);
        });
      }
      isRefreshing = true;
      try {
        const { data } = await refreshClient.post<{ data: { accessToken: string } }>('/auth/refresh');
        const newToken = data.data.accessToken;
        tokenStore.set(newToken);
        refreshQueue.forEach((p) => p.resolve(newToken));
        refreshQueue = [];
        original.headers.Authorization = `Bearer ${newToken}`;
        return client(original);
      } catch (refreshError) {
        refreshQueue.forEach((p) => p.reject(refreshError));
        refreshQueue = [];
        tokenStore.clear();
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
```

```typescript
// apps/web/src/lib/api/refreshClient.ts
// ⚠️ No interceptors — adding them creates infinite loops
import axios from 'axios';
export const refreshClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL + '/api/v1',
  withCredentials: true,
});
```

```typescript
// apps/web/src/lib/auth/tokenStore.ts
// Access token in memory ONLY — never localStorage or sessionStorage
let _token: string | null = null;
export const tokenStore = {
  get: (): string | null => _token,
  set: (t: string): void => { _token = t; },
  clear: (): void => { _token = null; },
};
```

---

### 7.2 Auth Provider Pattern

```typescript
// apps/web/src/lib/auth/AuthProvider.tsx
'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { client } from '../api/client';
import { refreshClient } from '../api/refreshClient';
import { tokenStore } from './tokenStore';

interface AuthContextValue {
  user: IUser | null;
  loading: boolean;
  setUser: (user: IUser | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: refreshData } = await refreshClient.post<{ data: { accessToken: string } }>('/auth/refresh');
        tokenStore.set(refreshData.data.accessToken);
        const { data: meData } = await client.get<{ data: IUser }>('/users/me');
        setUser(meData.data);
      } catch {
        tokenStore.clear();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const logout = async (): Promise<void> => {
    try { await client.post('/auth/logout'); } finally {
      tokenStore.clear();
      setUser(null);
      window.location.href = '/login';
    }
  };

  if (loading) return <PageLoader />;
  return <AuthContext.Provider value={{ user, loading, setUser, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
```

---

### 7.3 Socket.io Client

```typescript
// apps/web/src/lib/socket/socketClient.ts
import { io, Socket } from 'socket.io-client';
import { tokenStore } from '../auth/tokenStore';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket || !socket.connected) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      autoConnect: false,
      withCredentials: true,
      auth: (cb) => { cb({ token: tokenStore.get() }); },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10_000,
    });
  }
  return socket;
}

export function disconnectSocket(): void {
  if (socket) { socket.disconnect(); socket = null; }
}
```

```typescript
// apps/web/src/lib/socket/socketEvents.ts
export const SOCKET_EVENTS = {
  JOIN_SHEET:          'client:join_sheet',
  LEAVE_SHEET:         'client:leave_sheet',
  CELL_EDIT:           'client:cell_edit',
  TOGGLE_CHECKIN:      'client:toggle_checkin',
  ROW_ADDED:           'server:row_added',
  ROW_UPDATED:         'server:row_updated',
  ROW_DELETED:         'server:row_deleted',
  CHECKIN_UPDATED:     'server:checkin_updated',
  COUNTERS_UPDATED:    'server:counters_updated',
  COLUMN_ADDED:        'server:column_added',
  COLUMN_UPDATED:      'server:column_updated',
  COLUMN_DELETED:      'server:column_deleted',
  PRESENCE_JOINED:     'server:presence_joined',
  PRESENCE_LEFT:       'server:presence_left',
  PRESENCE_LIST:       'server:presence_list',
  BULK_IMPORT_COMPLETE: 'server:bulk_import_complete',
  ERROR:               'server:error',
} as const;
```

---

### 7.4 AG Grid Configuration Hook

```typescript
// apps/web/src/features/rsvp/hooks/useGridConfig.ts
import { useMemo, useCallback } from 'react';
import type { ColDef, GridOptions, CellValueChangedEvent, GetRowIdParams } from 'ag-grid-community';

export function useGridConfig({ sheetId, columns }: { sheetId: string; columns: IColumn[] }) {
  const columnDefs = useMemo<ColDef[]>(() => {
    return columns.map((col): ColDef => {
      const base: ColDef = {
        field: col.isLocked ? col.name.toLowerCase().replace(/\s/g, '') : `data.${col._id}`,
        headerName: col.name,
        width: col.width ?? 160,
        resizable: true,
        sortable: true,
        filter: true,
        suppressMovable: col.isLocked,
        lockPosition: col.isLocked,
      };

      switch (col.type) {
        case 'checkin':
          return { ...base, field: 'isCheckedIn', headerName: 'Check In', width: 110,
            cellRenderer: CheckInCellRenderer, editable: false };
        case 'dropdown':
          return { ...base, editable: true, cellEditor: DropdownCellEditor,
            cellEditorParams: { options: col.dropdownOptions ?? [], columnId: col._id, sheetId },
            cellRenderer: col.name === 'Guest Status' ? StatusBadgeCellRenderer : undefined };
        case 'date':
          return { ...base, editable: true, cellEditor: 'agDateCellEditor',
            valueFormatter: (p) => p.value ? new Date(p.value).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '' };
        case 'number':
          return { ...base, editable: true, type: 'numericColumn', cellEditor: 'agNumberCellEditor' };
        default:
          return { ...base, editable: !col.isLocked, cellEditor: 'agTextCellEditor' };
      }
    });
  }, [columns, sheetId]);

  const gridOptions: GridOptions<IGuest> = {
    rowSelection: 'multiple',
    suppressRowClickSelection: true,
    animateRows: true,
    stopEditingWhenCellsLoseFocus: true,
    undoRedoCellEditing: true,
    undoRedoCellEditingLimit: 50,
    enableFillHandle: true,
    fillHandleDirection: 'y',
    rowHeight: 40,
    headerHeight: 40,
    rowModelType: 'clientSide',
    defaultColDef: { minWidth: 80, resizable: true, sortable: true, filter: true, editable: true },
  };

  const getRowId = useCallback((params: GetRowIdParams<IGuest>) => params.data._id, []);

  return { columnDefs, gridOptions, getRowId };
}
```

---

### 7.5 Counter Bar State Machine

The counter bar sources values from two places:
1. **Initial load:** `GET /sheets/:sheetId/guests/counters` — called once on mount
2. **Live updates:** `server:counters_updated` Socket.io event — replaces state in-place

**Counter click filter rules:**
- Clicking **Total** always clears all active filters
- Multiple counter clicks stack with AND logic
- AG Grid external filter (`isExternalFilterPresent` + `doesExternalFilterPass`) handles row visibility
- Filter state persists during cell edits
- Filter state clears when switching sheet tabs
- Escape key clears all active filters and search simultaneously
- Performance: CounterBar re-renders must **not** cause AG Grid to re-render — use `React.memo`

**Counter logic (computed server-side):**

| Counter | Color | Logic |
|---------|-------|-------|
| Total Guests | Dark gray | All rows where `guestName` is not empty |
| Checked In | Green | `isCheckedIn = true` |
| Not Arrived | Gray | `guestName` exists + `isCheckedIn = false` + `guestStatus ≠ 'Not Coming'` |
| Not Coming | Red | `guestStatus = 'Not Coming'` |
| IDs Pending | Amber | `idType = null` OR `idType = 'Pending'` |
| IDs Received | Blue | `idType` has any value except null or 'Pending' |
| VIP | Purple | `guestStatus = 'VIP'` |

> VIP guests counted in both VIP and their check-in state (overlap is intentional).
> Performance requirement: counter update ≤ 300ms from action commit to visible change.

---

### 7.6 Room View (Standalone Screen)

Room View is a separate view toggled from the RSVP screen. It groups guests by their `roomNumber` field and optimises for hotel-reception check-in on tablets.

#### 7.6.1 Layout

The Room View is toggled by a `[ 👤 Guest View ] [ 🏨 Room View ]` pill switch above the counter bar. The same counter bar remains visible. The AG Grid is replaced by a card grid.

```
┌─────────────────────────────────────────────────────────┐
│  [ Counter Bar — identical to Guest View ]              │
│  [ 🔍 Search ]  [ 👤 Guest View | 🏨 Room View ]       │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────────────┐  ┌──────────────────────┐ │
│  │ Room 301  •  2 Pax       │  │ Room 302  •  1 Pax   │ │
│  │ ⏳ Not Arrived           │  │ ✅ Fully Checked In  │ │
│  │  👤 Rahul Sharma         │  │  👤 Anita Verma      │ │
│  │     9820001234           │  │     9822009012       │ │
│  │     ✅ Aadhaar           │  │     ✅ Driving Lic.  │ │
│  │     [ Toggle OFF ]       │  │     [ Toggle ON ]    │ │
│  │  👤 Priya Joshi          │  │  [ ✅ All Checked In]│ │
│  │     9821005678           │  └──────────────────────┘ │
│  │     ✅ Passport          │                           │
│  │     [ Toggle OFF ]       │  ┌──────────────────────┐ │
│  │  [ ✅ Check In Room ]    │  │ 🏠 No Room Assigned  │ │
│  └──────────────────────────┘  │  (guests w/o room)   │ │
│                                └──────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

#### 7.6.2 Room Card Contents

**Card Header:**
- Room number (bold, large)
- Total pax count ("2 Pax")
- Status badge: `✅ Fully Checked In` (green) | `⚡ Partially Checked In` (yellow) | `⏳ Not Arrived` (gray) | `⚠️ ID Pending` (orange, shown alongside check-in status)

**Per-Guest Row inside card:**
- Guest Name
- Mobile Number (display only — never in logs)
- ID Status: ✅ Aadhaar / ✅ Passport / ⏳ Pending
- Individual check-in toggle

**Card Footer:**
- State 1 — Not Arrived: `[ ✅ Check In Room ]` (primary green) → checks in all guests simultaneously
- State 2 — Partially Checked In: `[ ✅ Check In Remaining ]` (yellow) → checks in only unchecked guests
- State 3 — Fully Checked In: `[ ✅ All Checked In ]` (grayed out, disabled)

#### 7.6.3 Sorting Order

1. Not Arrived rooms (most action needed) — first
2. Partially Checked In rooms — second
3. Fully Checked In rooms — last

Within each group: sorted by Room Number ascending.

User can change sort: Room Number (default) | Check-In Status | ID Pending status.

#### 7.6.4 Search Behaviour

- Search by Room Number: type "301" → Room 301 card appears
- Search by Guest Name: type "Rahul" → Room 301 card appears with Rahul's row highlighted
- Search by Mobile Number: type "9820" → matching room cards appear
- No results: "No rooms found matching '999'" + "Try searching by guest name"

#### 7.6.5 Special Cases

- **Guest with no room assigned:** Shown in a special card at the bottom labelled "🏠 No Room Assigned". Can still be individually checked in.
- **Multiple guests same room:** All shown in one card. "Check In Room" checks in all simultaneously. Individual toggles still available.
- **Not Coming guest being checked in:** Modal warning — "This guest is marked Not Coming. Check in anyway?" Two buttons: "Yes, Check In" / "Cancel".

#### 7.6.6 Room View — What Is NOT Shown

| Hidden element | Reason |
|---------------|--------|
| Travel Plan | Not relevant at reception check-in |
| Arrival/Departure dates | Staff is already at event |
| Comments | Distracts from check-in focus |
| Custom columns | Keep view clean |
| Export / WhatsApp buttons | Not needed at check-in |
| Add Guest button | Not needed at check-in |

#### 7.6.7 Room View — Real-Time Sync

Room View and Guest View share the same underlying Socket.io room and data. A check-in in Room View reflects instantly in Guest View and vice versa. Counter bar updates apply in both views within 300ms.

#### 7.6.8 Room View — Mobile/Tablet Behaviour

- Room cards stack vertically at full width
- Room card header tappable — expands/collapses guest list
- "Check In Room" button — min 44px height tap target
- Individual toggles — min 44px tap target
- Designed to work on a tablet at hotel reception (landscape preferred)

---

### 7.7 Form Validation Pattern

```typescript
// apps/web/src/lib/utils/validators.ts
import { z } from 'zod';

const indianPhone = z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number');
const strongPassword = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character');

export const registerSchema = z.object({
  companyName:     z.string().min(2).max(100),
  fullName:        z.string().min(2).max(100),
  email:           z.string().email('Enter a valid email address'),
  phone:           indianPhone,
  password:        strongPassword,
  confirmPassword: z.string(),
  agreeToTerms:    z.literal(true, { errorMap: () => ({ message: 'You must agree to the Terms of Service' }) }),
}).refine(d => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

export const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export const createEventSchema = z.object({
  name:      z.string().min(2).max(120),
  location:  z.string().min(2).max(200),
  eventType: z.enum(['Wedding', 'Corporate', 'Social', 'Other']),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
}).refine(d => new Date(d.endDate) >= new Date(d.startDate), { message: 'End date cannot be before start date', path: ['endDate'] });
```

---

## 8. Frontend Security Checklist

### 8.1 Token & Session Security

| Priority | Check |
|----------|-------|
| P0 | Access token in **memory only** — `grep -r "localStorage" apps/web/src/lib/auth/` → must return empty |
| P0 | Refresh token is HttpOnly cookie — JavaScript cannot read it |
| P0 | Single-flight refresh queue prevents duplicate refresh calls |
| P0 | On failed refresh: clear token store + hard redirect to `/login` |
| P1 | On logout: `window.location.href = '/login'` (hard redirect, not router.push) |
| P1 | No sensitive data (tokens, passwords, PII) in `console.log` — strip in production |

### 8.2 XSS Prevention

| Priority | Check |
|----------|-------|
| P0 | `DOMPurify.sanitize()` wraps every `dangerouslySetInnerHTML` usage |
| P0 | All user-generated content rendered as React text nodes (JSX `{}`) — not raw HTML |
| P1 | URLs from user input validated before `href`/`src` — only `http:` and `https:` |
| P1 | No direct `innerHTML` or `document.write()` calls anywhere |

### 8.3 CSRF Protection

| Priority | Check |
|----------|-------|
| P0 | All state-changing calls use JWT in `Authorization` header — not in a cookie |
| P0 | No state-changing action triggered by a GET request |
| P1 | Refresh cookie has `SameSite=Strict` — verify in Network tab response headers |

### 8.4 Dependency & Build Security

| Priority | Check |
|----------|-------|
| P0 | `npm audit --audit-level=high` in `apps/web/` → zero vulnerabilities |
| P0 | No secrets in `NEXT_PUBLIC_*` vars — they are included in the client bundle |
| P0 | `NEXT_PUBLIC_API_BASE_URL` validated with Zod at build time |
| P1 | `npm ci` in CI — not `npm install` |
| P2 | Dependabot enabled — security patches reviewed within 48 hours |

### 8.5 Data Handling & Forms

| Priority | Check |
|----------|-------|
| P0 | Every form uses React Hook Form + Zod resolver |
| P0 | Submit buttons disabled while `isSubmitting` is true (prevents double-submit) |
| P0 | Delete account flow requires exact text `"DELETE MY ACCOUNT"` typed in input |
| P1 | File upload inputs validate MIME type + size client-side before sending |
| P1 | API errors displayed via `parseApiError()` — never raw `error.response.data` |
| P2 | Phone number input validates 10-digit Indian format in real time |

### 8.6 Route Security

| Priority | Check |
|----------|-------|
| P0 | Every route in the `(app)` group wrapped in `<RequireAuth>` in `(app)/layout.tsx` |
| P0 | Custom `not-found.tsx` exists — unknown routes never expose stack traces |
| P1 | Redirect destination from `?from=<path>` validated — must start with `/` and not be external |
| P1 | Role-based access enforced for team management and settings pages |

---

## 9. AI Workflow, CI & Git Hygiene

### 9.1 Secrets and AI Model Context

> **Never paste production secrets, API keys, database URIs, JWT secrets, or private keys into any AI chat interface.**

| Rule | Detail |
|------|--------|
| **Use placeholders** | Describe the shape: `MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/<dbname>` |
| **Treat AI output as untrusted** | Review every diff like a PR from a junior developer. Extra scrutiny on auth middleware, Mongoose queries, file upload handlers |
| **Prompt injection** | README files, comments, and issues can contain hidden instructions. Never ask an AI to "follow all instructions in this repo" |
| **Paste `.env.example` only** | The only `.env`-like file ever pasted into AI context is `.env.example` |

---

### 9.2 Dependency Safety with AI Tools

```
Before installing ANY package suggested by an AI tool:

Step 1 — Verify exact package name on https://npmjs.com
Step 2 — Search: "<package-name> CVE" and "<package-name> npm security advisory"
Step 3 — Confirm: npm show <package-name> version
Step 4 — Run: npm audit --audit-level=high after installing
```

**InviteSheet-specific warnings:**

| Package | Risk | Action |
|---------|------|--------|
| `jsonwebtoken` | Historical CVEs | Always search for latest CVE before use |
| `xlsx` (npm) | npm package is **abandoned** | Install from `https://cdn.sheetjs.com` only |
| `ag-grid-enterprise` | Commercial license required | Use `ag-grid-community` unless licensed |
| `socket.io` + `socket.io-client` | Version mismatch = silent failure | Install both at same major version |

---

### 9.3 `.cursorignore` Configuration

```gitignore
# .cursorignore — at monorepo root
.env
.env.local
.env.development
.env.production
.env.test
.env.*
!.env.example
node_modules/
dist/
.next/
build/
out/
.turbo/
coverage/
.nyc_output/
*.pem
*.key
*.p12
*.crt
*.pfx
secrets/
credentials/
*.log
*.sqlite
dump.rdb
.DS_Store
Thumbs.db
```

---

### 9.4 CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: InviteSheet CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  backend:
    name: Backend — Type, Lint, Audit, Test
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: server      # ← correct path
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js (Active LTS)
        uses: actions/setup-node@v4
        with:
          node-version: 'lts/*'
          cache: 'npm'
          cache-dependency-path: server/package-lock.json
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npx eslint . --ext .ts --max-warnings 0
      - run: npm audit --audit-level=high
      - run: npm test -- --passWithNoTests
        env:
          NODE_ENV: test

  frontend:
    name: Frontend — Type, Lint, Audit, Build
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: apps/web    # ← correct path
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js (Active LTS)
        uses: actions/setup-node@v4
        with:
          node-version: 'lts/*'
          cache: 'npm'
          cache-dependency-path: apps/web/package-lock.json
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npx next lint --max-warnings 0
      - run: npm audit --audit-level=high
      - run: npm run build
        env:
          NEXT_PUBLIC_API_BASE_URL: ${{ secrets.NEXT_PUBLIC_API_BASE_URL }}

  secret-scan:
    name: Secret Scanning
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Scan for secrets with gitleaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

### 9.5 Git Branch and PR Hygiene

```
Branch naming:
  feat/<description>        New feature
  fix/<description>         Bug fix
  chore/<description>       Dependency update, config change
  security/<description>    Security-focused change

PR rules:
  ✅ Every PR must pass full CI before merge
  ✅ PRs touching auth, tokens, or guest data must include: "Security impact: <explain>"
  ❌ Never merge PRs with failing security audit
  ❌ No force-pushing to main
  ❌ No @ts-ignore or eslint-disable without written explanation + linked issue
```

---

## 10. Postman & Testing Guide

### 10.1 Collection Setup

```
server/
└── postman/
    ├── InviteSheet.postman_collection.json
    ├── InviteSheet.postman_environment.json
    └── fixtures/
        └── test_guests.xlsx   # 5 sample rows — committed to Git
```

**Import steps:**
1. Postman → Import → drag both JSON files
2. Select `InviteSheet Local` environment
3. Set manually: `baseUrl = http://localhost:4000`, `testEmail`, `testPassword`
4. All other vars (`userId`, `eventId`, `sheetId`, `guestId`) auto-set by test scripts

---

### 10.2 Collection Pre-Request Script

```javascript
// Collection root — Pre-request Script
const tokenExpiry = pm.environment.get('tokenExpiry');
const now = Date.now();
const sixtySecondsMs = 60 * 1000;

if (tokenExpiry && now >= (parseInt(tokenExpiry) - sixtySecondsMs)) {
  pm.sendRequest({
    url: pm.environment.get('baseUrl') + '/api/v1/auth/refresh',
    method: 'POST',
    header: { 'Content-Type': 'application/json' },
  }, function (err, res) {
    if (!err && res.code === 200) {
      const json = res.json();
      if (json.data?.accessToken) {
        pm.environment.set('accessToken', json.data.accessToken);
        pm.environment.set('tokenExpiry', Date.now() + (14 * 60 * 1000));
      }
    }
  });
}
```

---

### 10.3 Standard Test Script Template

```javascript
pm.test("Status code is correct", () => pm.response.to.have.status(200));
pm.test("Response has success: true", () => {
  const json = pm.response.json();
  pm.expect(json).to.have.property('success', true);
  pm.expect(json).to.have.property('data');
});
pm.test("Response time is below 1000ms", () => pm.expect(pm.response.responseTime).to.be.below(1000));

const json = pm.response.json();
if (json.data?._id)         pm.environment.set('resourceId', json.data._id);
if (json.data?.accessToken) {
  pm.environment.set('accessToken', json.data.accessToken);
  pm.environment.set('tokenExpiry', Date.now() + (14 * 60 * 1000));
}
```

---

### 10.4 Complete Run Order

#### Folder 1 — Auth

| # | Method | Endpoint | What script saves |
|---|--------|----------|-------------------|
| 1 | POST | `/auth/register` | `userId`, `testEmail` |
| 2 | POST | `/auth/verify-email` | `accessToken`, `tokenExpiry` |
| 3 | POST | `/auth/login` | `accessToken`, `tokenExpiry` |
| 4 | GET | `/users/me` | Verifies auth end-to-end |
| 5 | POST | `/auth/refresh` | New `accessToken` |
| 6 | POST | `/auth/forgot-password` | Nothing (anti-enumeration) |
| 7 | POST | `/auth/reset-password` | Verifies flow |
| 8 | POST | `/auth/login` (post-reset) | `accessToken` |
| 9 | POST | `/auth/logout` | Verifies cookie cleared |
| 10 | GET | `/users/me` (post-logout) | Expects 401 |

#### Folder 2 — Users & Company

| # | Method | Endpoint | Notes |
|---|--------|----------|-------|
| 11 | POST | `/auth/login` | Re-login |
| 12 | GET | `/users/me` | Verify profile |
| 13 | PATCH | `/users/me` | Update `fullName` |
| 14 | PATCH | `/users/me/onboarding` | `step: 2` |
| 15 | GET | `/companies/me` | Verify company |
| 16 | PATCH | `/companies/me` | Update `city` |

#### Folder 3 — Events

| # | Method | Endpoint | Notes |
|---|--------|----------|-------|
| 17 | POST | `/events` | Creates Event 1. Saves `eventId`. |
| 18 | GET | `/events` | List. Expects 1 result. |
| 19 | GET | `/events/:eventId` | Saves `sheetId` from first sheet. |
| 20 | PATCH | `/events/:eventId` | Update name. |
| 21 | POST | `/events` | Creates Event 2. Saves `eventId2`. |
| 22 | POST | `/events` | Expects 403 PLAN_LIMIT_REACHED. |

#### Folder 4 — Sheets

| # | Method | Endpoint | Notes |
|---|--------|----------|-------|
| 23 | GET | `/events/:eventId/sheets` | Expects 1 default sheet. |
| 24 | POST | `/events/:eventId/sheets` | Create "VIP Guests". Saves `sheetId2`. |
| 25 | PATCH | `/events/:eventId/sheets/:sheetId2` | Rename to "VIPs". |
| 26 | DELETE | `/events/:eventId/sheets/:sheetId2` | Delete VIP sheet. |
| 27 | DELETE | `/events/:eventId/sheets/:sheetId` | Expects 400 — cannot delete last sheet. |

#### Folder 5 — Columns

| # | Method | Endpoint | Notes |
|---|--------|----------|-------|
| 28 | GET | `/sheets/:sheetId/columns` | Saves `columnId`. |
| 29 | POST | `/sheets/:sheetId/columns` | "Meal Preference" dropdown. Saves `customColumnId`. |
| 30 | PATCH | `/sheets/:sheetId/columns/:customColumnId` | Add "Vegan" option. |
| 31 | PATCH | `/sheets/:sheetId/columns/reorder` | Reorder columns. |
| 32 | DELETE | `/sheets/:sheetId/columns/:columnId` (locked) | Expects 403 COLUMN_LOCKED. |
| 33 | DELETE | `/sheets/:sheetId/columns/:customColumnId` | Soft-deletes custom column. |

#### Folder 6 — Guests

| # | Method | Endpoint | Notes |
|---|--------|----------|-------|
| 34 | POST | `/sheets/:sheetId/guests/import` | Upload `test_guests.xlsx`. Saves `guestId`. |
| 35 | GET | `/sheets/:sheetId/guests` | Expects 4 rows (1 duplicate skipped). |
| 36 | GET | `/sheets/:sheetId/guests?search=Sharma` | Filter by name. |
| 37 | GET | `/sheets/:sheetId/guests?filter=idsPending` | Counter filter. |
| 38 | GET | `/sheets/:sheetId/guests/counters` | Verify all 7 counters. |
| 39 | POST | `/sheets/:sheetId/guests` | Add row manually. |
| 40 | PATCH | `/sheets/:sheetId/guests/:guestId` | Update guest name. |
| 41 | DELETE | `/sheets/:sheetId/guests/:guestId` | Soft-delete. |
| 42 | GET | `/sheets/:sheetId/guests/counters` | Total decremented by 1. |

#### Folder 7 — Check-In

| # | Method | Endpoint | Notes |
|---|--------|----------|-------|
| 43 | PATCH | `/sheets/:sheetId/guests/:guestId/checkin` | `{ isCheckedIn: true }`. Verify counters. |
| 44 | GET | `/sheets/:sheetId/guests/counters` | `checkedIn` ↑, `notArrived` ↓. |
| 45 | PATCH | `/sheets/:sheetId/guests/:guestId/checkin` | `{ isCheckedIn: false }`. Undo. |
| 46 | PATCH | `/sheets/:sheetId/checkin/room` | `{ roomNumber: "301", mode: "all" }`. |
| 47 | GET | `/sheets/:sheetId/guests/counters` | Bulk check-in reflected. |

#### Folder 8 — Error Scenarios

| # | Test | Expected |
|---|------|----------|
| 48 | Remove Authorization header | 401 UNAUTHORIZED |
| 49 | Use expired token | 401 TOKEN_EXPIRED |
| 50 | Member token on owner-only endpoint | 403 FORBIDDEN |
| 51 | Valid token, another company's `eventId` | 404 NOT_FOUND |
| 52 | POST /events — no `name` field | 400 VALIDATION_ERROR with `fields.name` |
| 53 | POST /events — `endDate` before `startDate` | 400 INVALID_REQUEST |
| 54 | POST /auth/register — existing email | 409 CONFLICT |
| 55 | 11 requests to POST /auth/login in 60s | 429 RATE_LIMIT_EXCEEDED on 11th |
| 56 | POST /auth/verify-email — `otp: "000000"` | 400 INVALID_OTP with attempt count |
| 57 | DELETE /users/me — wrong `confirmText` | 400 CONFIRM_TEXT_MISMATCH |
| 58 | POST /events — 3rd event on free plan | 403 PLAN_LIMIT_REACHED |

---

### 10.5 Test Data Fixture

```
server/postman/fixtures/test_guests.xlsx
```

| Guest Name | Contact Number | ID Type | Room Number | Travel Plan |
|------------|---------------|---------|-------------|-------------|
| Rahul Sharma | 9820001234 | Aadhaar | 301 | By Flight |
| Priya Joshi | 9821005678 | Passport | 301 | By Train |
| Anita Verma | 9822009012 | Pending | 302 | By Car |
| Suresh Nair | **9820001234** | Aadhaar | 303 | By Flight |
| Meera Pillai | 9825003456 | Driving Licence | 302 | Not Decided |

> Row 4 (Suresh Nair) shares a contact with Row 1. Import test must assert `skipped: 1` and `duplicates` contains one entry.

---

### 10.6 Jest Configuration (Backend)

```typescript
// server/jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  preset:              'ts-jest',
  testEnvironment:     'node',
  globalSetup:         './src/__tests__/helpers/globalSetup.ts',
  globalTeardown:      './src/__tests__/helpers/globalTeardown.ts',
  setupFilesAfterEnv:  ['./src/__tests__/helpers/setupAfterFramework.ts'],  // ← FIXED (was setupFilesAfterFramework)
  testPathPattern:     '/__tests__/',
  coverageDirectory:   'coverage',
  collectCoverageFrom: [
    'src/modules/**/*.service.ts',
    'src/utils/**/*.ts',
    '!src/**/*.model.ts',
    '!src/config/**',
  ],
  coverageThresholds: {
    global: { statements: 60, branches: 50, functions: 60, lines: 60 },
  },
};

export default config;
```

---

### 10.7 Jest Configuration (Frontend)

```typescript
// apps/web/jest.config.ts
import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

const config: Config = {
  testEnvironment:     'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],   // ← FIXED (was setupFilesAfterFramework)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

export default createJestConfig(config);
```

```typescript
// apps/web/jest.setup.ts
import '@testing-library/jest-dom';

// Mock socket.io-client — prevents real WebSocket connections in tests
jest.mock('socket.io-client', () => ({
  io: jest.fn(() => ({
    on: jest.fn(), off: jest.fn(), emit: jest.fn(),
    disconnect: jest.fn(), connected: true,
  })),
}));

// Mock AG Grid — prevents canvas errors in jsdom
jest.mock('ag-grid-react', () => ({
  AgGridReact: jest.fn(() => null),
}));
```

---

## 11. Master Prompts

**How to use:** Open your AI coding tool with the InviteSheet monorepo as workspace. Copy the relevant prompt. Fill in any `<PLACEHOLDER>` values. Paste into the AI chat. Review every diff before accepting.

---

### 11.1 Full-Stack Bootstrap Prompt

```
You are building InviteSheet — a production-ready RSVP management SaaS for Indian event companies.

── Version Safety Rule (MANDATORY) ──────────────────────────────────────────
Before writing any package.json, web search each dependency:
  "npm <package-name> latest version"
  "<package-name> CVE" or "<package-name> npm security advisory"
Confirm with: npm show <package> version
State what you verified in your reply. Never invent or copy version numbers from memory.
Use ^ ranges. Never pin to old versions.

── Project Overview ──────────────────────────────────────────────────────────
InviteSheet replaces Excel and Google Sheets for event companies managing wedding
and corporate event RSVPs. Core screen is a spreadsheet-like AG Grid interface
with live check-in counters.

── Tech Stack ────────────────────────────────────────────────────────────────
Frontend:  Next.js (App Router), React, TypeScript, AG Grid Community, TanStack Query,
           Axios, React Hook Form, Zod, Tailwind CSS, socket.io-client
Backend:   Node.js, Express, TypeScript, MongoDB Atlas, Mongoose, Zod,
           jsonwebtoken, bcryptjs, helmet, cors, express-rate-limit,
           express-mongo-sanitize, socket.io, nodemailer, winston, node-cron

── Monorepo Structure ────────────────────────────────────────────────────────
/
├── apps/web/        # Next.js 14 App Router frontend
├── server/          # Express REST API + Socket.io
├── docs/
├── .gitignore
├── .cursorignore
└── README.md

── PORT ──────────────────────────────────────────────────────────────────────
Backend Express server runs on PORT=4000 everywhere:
  server/.env.example: PORT=4000
  apps/web/.env.example: NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
  Postman baseUrl: http://localhost:4000
  CI pipeline env: PORT=4000

── File Storage ──────────────────────────────────────────────────────────────
MVP uses memory-only file processing (multer memoryStorage).
No S3, no AWS, no Cloudinary at MVP.
Do NOT add AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, or S3_BUCKET_NAME
to the Zod env schema or .env.example.

── Deliverables ─────────────────────────────────────────────────────────────
1. Root .gitignore + .cursorignore
2. server/.env.example — all vars from Section 3 (no AWS vars)
3. apps/web/.env.example — all NEXT_PUBLIC_* vars
4. server/src/config/env.ts — Zod validation, process.exit(1) on bad config, PORT defaults to 4000
5. apps/web/src/lib/env.ts — Zod validation for NEXT_PUBLIC_* vars
6. server/src/app.ts — middleware chain: Sentry → helmet → cors → json(10kb) → mongoSanitize
   → morgan(dev) → /health → /ready → globalRateLimit → authRateLimit → routes
   → Sentry error → errorHandler
7. server/src/server.ts — HTTP server + Socket.io + mongoose + listen
8. server/tsconfig.json — strict: true, noUncheckedIndexedAccess: true
9. apps/web/next.config.ts + tailwind.config.ts
10. README.md — local setup, CI instructions
11. .github/workflows/ci.yml — uses working-directory: server and working-directory: apps/web

── Security Requirements ─────────────────────────────────────────────────────
- Zod crashes on startup if config is bad — process.exit(1)
- cors() uses explicit origin list — never wildcard *
- express.json({ limit: '10kb' })
- /health and /ready mounted BEFORE rate limiter
- No console.log in production — winston only
- TypeScript strict mode — no `any` without typed comment

── What NOT to build yet ────────────────────────────────────────────────────
Do NOT implement business logic — no auth routes, models, or React components.
This prompt is scaffold only.
```

---

### 11.2 Backend Auth Module Prompt

```
Implement the complete Auth module for InviteSheet's Express backend.

── Version Safety Rule (MANDATORY) ──────────────────────────────────────────
Before writing package.json changes: web search each package for latest + CVE.
State what you verified. Never hardcode version numbers from memory.

── Context ───────────────────────────────────────────────────────────────────
Stack: Express + TypeScript + MongoDB/Mongoose + Zod + jsonwebtoken + bcryptjs + nodemailer
Code location: server/src/modules/auth/
PORT: 4000
File storage: memory-only (no S3 vars in env schema)

── Files to Create ───────────────────────────────────────────────────────────
server/src/modules/auth/auth.routes.ts
server/src/modules/auth/auth.controller.ts
server/src/modules/auth/auth.service.ts
server/src/modules/auth/auth.schema.ts
server/src/modules/auth/refreshToken.model.ts
server/src/modules/auth/otp.model.ts
server/src/modules/users/user.model.ts
server/src/modules/companies/company.model.ts
server/src/utils/jwt.ts
server/src/utils/tokenCompare.ts
server/src/utils/ownershipCheck.ts
server/src/utils/AppError.ts
server/src/services/email.service.ts

── Endpoints to Implement ────────────────────────────────────────────────────
POST /api/v1/auth/register     → create User + Company → send OTP → return 201 (no tokens yet)
POST /api/v1/auth/verify-email → validate OTP → issue accessToken + refresh cookie → return 200
POST /api/v1/auth/login        → validate password → check lockout → issue tokens → return 200
POST /api/v1/auth/refresh      → verify refresh cookie → rotate token → return new accessToken
POST /api/v1/auth/logout       → revoke refresh token → clear cookie → return 200
POST /api/v1/auth/forgot-password → send OTP → always return same 200 response (anti-enumeration)
POST /api/v1/auth/reset-password  → verify OTP → set new password → revoke all refresh tokens
POST /api/v1/auth/resend-otp   → rate limited 1 per 30s per email

── Security Requirements ─────────────────────────────────────────────────────
- bcryptjs cost factor 10 for passwords and refresh token hashes
- Refresh tokens: hashed before storage, rotated on every /refresh call
- Token reuse: if revoked token submitted → clear ALL refreshTokens for user (breach detection)
- Account lockout: 5 failed logins → 15 min lock (configurable via env)
- OTP: 6 digits, crypto.randomInt(100000, 999999), bcrypt hash in DB, 10 min TTL, max 3 attempts
- crypto.timingSafeEqual() for all token comparisons — no ===
- Access token: 15 min, in JSON response body only (never cookie)
- Refresh token: 7 days, HttpOnly; Secure; SameSite=Strict cookie
- All errors follow: { success: false, error: { code, message } }
- All successes follow: { success: true, data: { ... } }
- assertOwnership() pattern: always 404, never 403 (prevents resource enumeration)
```

---

### 11.3 Backend RSVP Core Module Prompt

```
Implement the Events, Sheets, Columns, and Guests modules for InviteSheet.

── Version Safety Rule (MANDATORY) ──────────────────────────────────────────
Before writing any package.json changes: web search each dependency for latest
stable version and CVE status. Confirm with npm show <pkg> version.
State what you verified. Never hardcode versions from memory.

── Context ───────────────────────────────────────────────────────────────────
Stack: Express + TypeScript + MongoDB/Mongoose + Zod + Socket.io + multer
Auth: requireAuth middleware already implemented (from Section 11.2)
PORT: 4000
File storage: multer memoryStorage — files are NEVER written to disk.
              No S3, no AWS. Process buffer in memory and discard.

── Modules to Implement ─────────────────────────────────────────────────────
server/src/modules/events/   — event.model.ts, event.routes.ts, event.controller.ts, event.service.ts, event.schema.ts
server/src/modules/sheets/   — sheet.model.ts, sheet.routes.ts, sheet.controller.ts, sheet.service.ts
server/src/modules/columns/  — column.routes.ts, column.controller.ts, column.service.ts (columns embedded in Sheet)
server/src/modules/guests/   — guest.model.ts, guest.routes.ts, guest.controller.ts, guest.service.ts

── Business Rules ────────────────────────────────────────────────────────────
Events:
  - Free plan: max 2 events (FREE_PLAN_EVENT_LIMIT env var)
  - Creating event: also create a default Sheet + 3 locked columns (Guest Name, Contact Number, Check-In Toggle)
  - Delete event: soft-delete event + all sheets + all guests. Decrement company.eventsUsed.
  - assertOwnership() on every /:id endpoint.

Sheets:
  - Column definitions embedded in Sheet document (not a separate collection)
  - Cannot delete last sheet of an event (return 400 INVALID_REQUEST)
  - Check-In Toggle column is ALWAYS present — cannot be deleted

Columns:
  - Locked columns (Guest Name, Contact Number, Check-In): return 403 COLUMN_LOCKED on delete attempt
  - Cannot change column type after creation
  - Deleting a column: also $unset that data field from all guest documents in the sheet

Guests:
  - rowIndex auto-assigned as max(rowIndex)+1 — never trusted from client
  - computeCounters() uses single MongoDB aggregation — never fetch all docs into JS memory
  - Emit server:counters_updated to Socket.io room after: checkin toggle, cell update affecting idType/guestStatus, row add/delete, bulk import
  - Import: multer memoryStorage, max 5MB, .xlsx/.xls/.csv only
    Parse buffer with SheetJS (xlsx) or PapaParse. Never write to disk.
    Return { imported, skipped, duplicates[], existingDuplicates[], newColumnsCreated[] }
  - Bulk room check-in: PATCH /sheets/:sheetId/checkin/room { roomNumber, mode: "all"|"remaining" }

── Security ──────────────────────────────────────────────────────────────────
- assertOwnership() in every controller receiving an :id param
- All queries include companyId filter — no cross-company data access possible
- isDeleted: false on all queries
- File upload: validate MIME type server-side (not just extension rename attack)
- filterModel keys from AG Grid requests: whitelist before applying to MongoDB query
```

---

### 11.4 Frontend Auth & Layout Prompt

```
Implement the Next.js frontend auth screens and app shell for InviteSheet.

── Version Safety Rule (MANDATORY) ──────────────────────────────────────────
Before writing any package.json changes: web search each dependency for latest
stable version and CVE status. Confirm with npm show <pkg> version.
State what you verified. Never hardcode versions from memory.

── Context ───────────────────────────────────────────────────────────────────
Stack: Next.js 14 App Router, React, TypeScript, Tailwind CSS, React Hook Form, Zod, Axios
API base URL: NEXT_PUBLIC_API_BASE_URL (env var, defaults to http://localhost:4000)
Auth pattern: access token in memory (tokenStore.ts), refresh token in HttpOnly cookie

── Files to Implement ───────────────────────────────────────────────────────
apps/web/src/lib/auth/AuthProvider.tsx     — session bootstrap + context
apps/web/src/lib/auth/tokenStore.ts        — in-memory token store (never localStorage)
apps/web/src/lib/auth/RequireAuth.tsx      — route guard
apps/web/src/lib/api/client.ts             — Axios with single-flight refresh interceptor
apps/web/src/lib/api/refreshClient.ts      — separate Axios, NO interceptors
apps/web/src/lib/utils/validators.ts       — Zod schemas: register, login, forgotPassword, resetPassword
apps/web/src/features/auth/components/RegisterForm.tsx
apps/web/src/features/auth/components/LoginForm.tsx
apps/web/src/features/auth/components/ForgotPasswordForm.tsx
apps/web/src/features/auth/components/ResetPasswordForm.tsx
apps/web/src/features/auth/components/OtpInput.tsx   — 6-box OTP with auto-advance + paste support
apps/web/src/app/(auth)/register/page.tsx
apps/web/src/app/(auth)/login/page.tsx
apps/web/src/app/(auth)/forgot-password/page.tsx
apps/web/src/app/(auth)/reset-password/page.tsx
apps/web/src/app/(app)/layout.tsx          — app shell with RequireAuth
apps/web/src/components/layout/Sidebar.tsx
apps/web/src/components/layout/TopNav.tsx

── Security Requirements ─────────────────────────────────────────────────────
- tokenStore.ts: ONLY in-memory storage. Never write to localStorage or sessionStorage.
- refreshClient.ts: NO interceptors (adding them causes infinite refresh loops)
- Single-flight refresh: isRefreshing flag + refreshQueue array prevent duplicate refresh calls
- On failed refresh: clear tokenStore + window.location.href = '/login' (hard redirect)
- All forms: React Hook Form + Zod resolver + mode: 'onChange'
- Submit buttons disabled when !isValid || isSubmitting
- Indian phone validation: /^[6-9]\d{9}$/ (10 digits, starts 6-9)
- Password strength: Weak / Medium / Strong indicator on register form
- OTP boxes: auto-advance on digit entry, backspace jumps back, paste fills all 6 boxes

── Design spec (Register page layout) ───────────────────────────────────────
Two column: left = dark navy branding panel (#0F172A), right = form
Left: InviteSheet logo + headline "Manage every guest, every event — effortlessly"
      3 bullet points + subtle grid pattern background + social proof testimonial
Right: "Create your account" heading + all 6 form fields + terms checkbox + submit button
Mobile: single column, left panel hidden, logo appears at top of form
```

---

### 11.5 AG Grid RSVP Screen Prompt

```
Implement the Live RSVP Screen for InviteSheet — the AG Grid spreadsheet interface.

── Version Safety Rule (MANDATORY) ──────────────────────────────────────────
Before writing any package.json changes: web search each dependency for latest
stable version and CVE status. Confirm with npm show <pkg> version.
State what you verified. Never hardcode versions from memory.

── Context ───────────────────────────────────────────────────────────────────
Stack: Next.js App Router, AG Grid Community, TanStack Query, socket.io-client, TypeScript
Screen location: apps/web/src/app/(app)/events/[eventId]/sheets/[sheetId]/page.tsx
Auth: user is authenticated (session already bootstrapped by AuthProvider)

── Components to Implement ──────────────────────────────────────────────────
apps/web/src/features/rsvp/components/RSVPScreen.tsx        — main container
apps/web/src/features/rsvp/components/CounterBar.tsx        — sticky 7-counter strip
apps/web/src/features/rsvp/components/SheetTabs.tsx         — bottom tab strip
apps/web/src/features/rsvp/components/AddColumnModal.tsx    — 2-tab add column modal
apps/web/src/features/rsvp/components/EditDropdownModal.tsx
apps/web/src/features/rsvp/components/SmartBanner.tsx       — post-import column suggestion
apps/web/src/features/rsvp/components/RoomView.tsx          — room-wise check-in view
apps/web/src/features/rsvp/components/RoomCard.tsx          — per-room card
apps/web/src/features/rsvp/hooks/useGridConfig.ts           — AG Grid ColDef builder
apps/web/src/features/rsvp/hooks/useRSVPSocket.ts           — Socket.io subscriptions
apps/web/src/features/rsvp/hooks/useCounters.ts             — counter state machine
apps/web/src/features/rsvp/hooks/useGuestFilter.ts          — counter-click filters

── AG Grid Configuration Requirements ───────────────────────────────────────
- Column definitions built from server-side IColumn[] array
- Column types: 'text' → agTextCellEditor, 'number' → agNumberCellEditor,
  'date' → agDateCellEditor, 'dropdown' → custom DropdownCellEditor,
  'checkin' → custom CheckInCellRenderer (toggle, not keyboard-editable)
- Locked columns (Guest Name, Contact Number): suppressMovable: true, lockPosition: true
- enableFillHandle: true, fillHandleDirection: 'y'
- undoRedoCellEditing: true, undoRedoCellEditingLimit: 50
- onCellValueChanged: emit socket event CELL_EDIT → fallback to REST if socket disconnected
- getRowId: (params) => params.data._id — stable identity, no unnecessary re-renders

── Counter Bar Requirements ──────────────────────────────────────────────────
7 counters: Total (gray), Checked In (green), Not Arrived (gray), Not Coming (red),
            IDs Pending (amber), IDs Received (blue), VIP (purple)
- Initial values: REST GET /sheets/:sheetId/guests/counters on mount
- Live updates: server:counters_updated Socket.io event (replaces state in-place)
- Click Total: clears all active filters
- Click any other counter: toggle filter, stack with AND logic
- AG Grid external filter: isExternalFilterPresent + doesExternalFilterPass
- CounterBar uses React.memo — must NOT cause AG Grid to re-render
- Performance: counter update ≤ 300ms from action to visible

── Room View Requirements ────────────────────────────────────────────────────
- Toggle switch: [ 👤 Guest View | 🏨 Room View ]
- Group guests by roomNumber field
- Room card: header (room number, pax count, status badge) + per-guest rows + footer button
- Card footer states: "Check In Room" / "Check In Remaining" / "All Checked In" (disabled)
- Sorting: Not Arrived first, Partially Checked In second, Fully Checked In last
- Special "No Room Assigned" card at bottom for guests without roomNumber
- Real-time sync: same Socket.io room as Guest View
- Not Coming warning modal before checking in a Not Coming guest
- Mobile/tablet optimised: min 44px tap targets

── Socket.io Requirements ────────────────────────────────────────────────────
- Connect lazily via getSocket() singleton — not on page mount
- Join sheet room on RSVP screen mount: emit client:join_sheet { sheetId }
- Leave room on unmount: emit client:leave_sheet { sheetId }
- Handle: server:row_added, server:row_updated, server:row_deleted,
          server:checkin_updated, server:counters_updated,
          server:column_added, server:column_deleted
- Apply row changes via gridApi.applyTransaction() — do NOT re-fetch all guests
- sourceSocketId: skip applying server:row_updated if socket.id === event.sourceSocketId
- On reconnect: re-emit client:join_sheet + invalidate TanStack Query cache
- Disconnection banner: "⚠️ Connection lost — changes may not sync. Reconnecting..."
- After 5 failed reconnects: modal "Unable to reconnect" with "Refresh Page" button
```

---

### 11.6 Socket.io Real-Time Layer Prompt

```
Implement the complete Socket.io backend layer for InviteSheet.

── Version Safety Rule (MANDATORY) ──────────────────────────────────────────
Before writing any package.json changes: web search each dependency for latest
stable version and CVE status. Confirm with npm show <pkg> version.
State what you verified. Never hardcode versions from memory.

── Context ───────────────────────────────────────────────────────────────────
Stack: Node.js, Express, TypeScript, socket.io, Mongoose, Zod
Location: server/src/sockets/

── Files to Implement ────────────────────────────────────────────────────────
server/src/sockets/index.ts              — init + JWT auth middleware
server/src/sockets/handlers/guestHandlers.ts    — cell edit, checkin, row add/delete
server/src/sockets/handlers/presenceHandlers.ts — join/leave presence awareness

── Backend Socket Requirements ──────────────────────────────────────────────
Auth Guard (io.use):
  - Validate token from socket.handshake.auth.token using verifyToken()
  - Attach payload.sub to socket.data.userId and payload.companyId to socket.data.companyId
  - Return next(new Error('UNAUTHORIZED')) if missing or invalid

Room Architecture:
  - client:join_sheet  → socket.join(`sheet:${sheetId}`)
  - client:leave_sheet → socket.leave(`sheet:${sheetId}`)
  - Each sheet is one room. Multiple staff join same room during live events.

Zod validation on EVERY incoming socket event payload — no exceptions:
  const result = schema.safeParse(data);
  if (!result.success) return socket.emit('server:error', { code: 'VALIDATION_ERROR', message: '...' });

Ownership check: verify sheetId belongs to socket.data.companyId before processing

Emit pattern for cell updates — include sourceSocketId:
  io.to(`sheet:${sheetId}`).emit('server:row_updated', { guestId, field, value, sourceSocketId: socket.id });

After every counter-affecting change: computeCounters(sheetId) → emit server:counters_updated

Presence awareness (presenceHandlers.ts):
  Map<sheetId, Set<{ userId, fullName, socketId }>> in memory (never persisted to DB)
  On join: add to map → emit server:presence_joined to room → emit server:presence_list to joiner
  On leave/disconnect: remove from map → emit server:presence_left to room

Per-socket rate limiting (guestHandlers.ts):
  client:cell_edit:       max 30 per 10 seconds
  client:toggle_checkin:  max 20 per 5 seconds
  client:row_add:         max 10 per 60 seconds
  client:row_delete:      max 10 per 60 seconds
  On limit: emit server:error { code: 'RATE_LIMIT_EXCEEDED' } to sender only. Never disconnect.

Error handling:
  All socket handlers wrapped in try/catch
  Errors emit server:error to sender only — never crash the handler
  Log with winston.error in production — never console.error
  Never log guestName, phone, or any PII in socket error messages
```

---

### 11.7 Security Hardening Prompt

```
Audit and harden InviteSheet for production deployment.

── Version Safety Rule (MANDATORY) ──────────────────────────────────────────
Before writing any package.json changes: web search each dependency for latest
stable version and CVE status. Confirm with npm show <pkg> version.
State what you verified. Never hardcode versions from memory.

── Context ───────────────────────────────────────────────────────────────────
Full stack: Next.js frontend (apps/web/) + Express backend (server/), both TypeScript.
PORT: 4000. File storage: memory-only (no S3/AWS vars).

── Backend Hardening Checklist ──────────────────────────────────────────────
1. Middleware order in server/src/app.ts:
   Sentry → helmet → cors → json(10kb) → mongoSanitize → morgan(dev) →
   GET /health → GET /ready → globalRateLimiter → authRateLimiter → routes →
   Sentry error → errorHandler
   Verify /health and /ready are mounted BEFORE the rate limiter.

2. assertOwnership() in EVERY controller that receives an :id param.
   Search: router.get('/:id'), router.patch('/:id'), router.delete('/:id').
   Each must have assertOwnership() with the resource's companyId.

3. passwordHash has select: false on Mongoose schema.
   Verify it never appears in any API response.

4. No === comparison on any secret, token, OTP, or password.
   Replace all with crypto.timingSafeEqual() via tokenCompare.ts.

5. Refresh token reuse: when revoked token submitted, clear ALL refreshTokens for user.

6. Rate limits: global (100/min on /api), strict auth (10/min on /auth).
   /health and /ready mounted BEFORE global rate limiter.

7. express-mongo-sanitize in chain. Verify no raw user input reaches MongoDB.

8. express.json({ limit: '10kb' }) — verify this is in the chain.

9. CORS: corsOrigins from env split — never wildcard *.

10. All Socket.io handlers: try/catch + Zod payload validation. No exceptions.

11. Winston logging: NODE_ENV=production → JSON format only.
    No console.log. No PII (email, phone, name, token values) in any log line.

12. Sentry beforeSend scrubs: contactNumber, phone, passwordHash, tokenHash,
    otpHash, email, guestName, accessToken, refreshToken → '[REDACTED]'

13. npm audit on server/ and apps/web/. Zero high or critical.

14. No AWS/S3 env vars — confirm env.ts schema has no AWS fields.
    If found: remove them. MVP is memory-only.

── Frontend Hardening Checklist ─────────────────────────────────────────────
15. tokenStore.ts: grep for localStorage and sessionStorage — must return empty.

16. Single-flight refresh: isRefreshing flag + refreshQueue in client.ts — verify logic correct.

17. DOMPurify on every dangerouslySetInnerHTML — grep and check each occurrence.

18. No console.log of tokens or sensitive data. Remove all in production.

19. NEXT_PUBLIC_* vars validated with Zod in apps/web/src/lib/env.ts.

20. Next.js middleware.ts protects all /dashboard, /events, /team, /settings routes.

21. All forms: React Hook Form + Zod resolver. Submit buttons disabled during isSubmitting.

── Pre-Deployment Commands ───────────────────────────────────────────────────
# Backend
cd server
npx tsc --noEmit
npx eslint . --ext .ts --max-warnings 0
npm test -- --passWithNoTests
npm audit --audit-level=high

# Frontend
cd apps/web
npx tsc --noEmit
npx next lint --max-warnings 0
npm audit --audit-level=high
npm run build

# Git safety check — must return empty
git diff --cached --name-only | grep -E '\.env|\.key|\.pem|secret'
git ls-files | grep '\.env$'
```

---

## 12. Domain Add-On Prompts

Append these to the master prompt they extend. Implement one at a time — test before moving to the next.

### 12.1 Guest Import Pipeline Add-On

**Append to:** Section 11.3

```
── Domain Add-On: Guest Import Pipeline ─────────────────────────────────────

Tech Stack:
  File parsing: SheetJS (xlsx) — from cdn.sheetjs.com, NOT from npm. The npm package is abandoned.
  CSV fallback: PapaParse
  File storage: multer memoryStorage — NEVER written to disk

Import flow (implement in this exact order):
1. multer accepts single file ('guestFile'). Reject non-.xlsx/.xls/.csv with 400 INVALID_FILE_TYPE. Max 5MB.
2. Parse buffer: xlsx.read(buffer, {type:'buffer'}) for xlsx/xls; PapaParse for csv. First row = headers.
3. Header normalisation — map to canonical names (case-insensitive):
   'guest name' → guestName, 'name' → guestName, 'full name' → guestName
   'contact' → contactNumber, 'mobile' → contactNumber, 'phone' → contactNumber
   'id type' → idType, 'id proof' → idType
   'travel' → travelPlan, 'travel plan' → travelPlan
   'room' → roomNumber, 'room no' → roomNumber, 'room number' → roomNumber
   'pax' → noOfPax, 'no of pax' → noOfPax
   'kids' → noOfKids, 'no of kids' → noOfKids
   'arrival' → arrivalDate, 'arrival date' → arrivalDate, 'check in' → arrivalDate
   'checkout' → departureDate, 'departure date' → departureDate
   'remarks' → comments, 'notes' → comments, 'status' → guestStatus
   Unknown headers → create new Column of type 'text' for that header

4. Validate + normalise values per column type:
   contactNumber: strip spaces/dashes. 10 digits starting 6-9 → prepend '+91'.
   idType: match to ['Aadhaar','Passport','Voter ID','Driving Licence','Other','Pending'] (case-insensitive). No match → 'Pending'.
   travelPlan: match to ['By Car','By Train','By Flight','By Bus','Not Decided']. No match → 'Not Decided'.
   guestStatus: match to ['Confirmed','Not Coming','VIP','Dont Call','Wrong Number','Pending']. No match → 'Pending'.
   noOfPax: parseInt. NaN or negative → default 1.
   dates: Date.parse(). Invalid → store as raw string in data Map.

5. Intra-file duplicate detection: Set<contactNumber>. Duplicate in file → add to duplicates[], skip.
6. vs-DB duplicate detection: Guest.find({ sheetId, contactNumber: { $in: [...] } }). Return in existingDuplicates[].
7. Assign rowIndex: max(existing rowIndex) + 1 for first new row, then increment.
8. Guest.insertMany(docs, { ordered: false }). Continue on error.
9. Ensure Check-In column exists. If not → create it as last column.
10. Emit server:bulk_import_complete to sheet room via Socket.io.

Return 201: { success: true, data: { imported, skipped, duplicates[], existingDuplicates[], newColumnsCreated[] } }

Error responses:
  400 INVALID_FILE_TYPE, FILE_TOO_LARGE, EMPTY_FILE, MISSING_GUEST_NAME_COLUMN, IMPORT_FAILED
```

---

### 12.2 Live Counter Sync Add-On

**Append to:** Section 11.5 and 11.6

```
── Domain Add-On: Live Counter Sync ─────────────────────────────────────────

Emit server:counters_updated after EVERY one of these:
  PATCH /guests/:guestId/checkin
  PATCH /guests/:guestId (when idType or guestStatus changes)
  PATCH /sheets/:sheetId/checkin/room
  POST  /sheets/:sheetId/guests
  DELETE /guests/:guestId
  POST  /sheets/:sheetId/guests/import

Do NOT emit after: column operations, event updates, sheet tab changes.

Counter computation: ALWAYS use single MongoDB aggregation (see Section 4.7).
Never compute by fetching all docs into JS memory.

Frontend counter state:
  Source of truth: server-emitted counters (not derived from guest row cache)
  Initial load: REST GET /sheets/:sheetId/guests/counters
  Live updates: server:counters_updated Socket.io event

Performance contract:
  Counter update ≤ 300ms from action to visible CounterBar change.
  CounterBar: React.memo — must NOT trigger AG Grid re-render.
  AG Grid applyTransaction() must not be triggered by counter updates.
```

---

### 12.3 WhatsApp Integration Add-On

**Append to:** Section 11.3

```
── Domain Add-On: WhatsApp Bulk Invitations ─────────────────────────────────

⚠️ Version Safety Rule: Before writing any package, web search:
  "whatsapp business api node.js latest 2025"
  "meta graph api node sdk npm"
Verify no critical advisories. State what you found.

New env vars (add to server/.env.example and Zod schema as optional):
  WHATSAPP_ACCESS_TOKEN=your_meta_access_token
  WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
  WHATSAPP_INVITE_TEMPLATE_NAME=event_invitation
  WHATSAPP_WEBHOOK_SECRET=your_webhook_verification_token

Implementation:
  server/src/services/whatsapp.service.ts
  server/src/modules/whatsapp/whatsapp.routes.ts
  server/src/modules/whatsapp/whatsapp.controller.ts
  server/src/modules/whatsapp/whatsappLog.model.ts

Endpoints:
  POST /api/v1/sheets/:sheetId/whatsapp/send-bulk
    Body: { guestIds: string[] } — max 50 per call
    Use Promise.allSettled — do not abort on one failure
    Rate limit: 5 bulk sends per company per hour (keyGenerator: companyId)

  GET /api/v1/sheets/:sheetId/whatsapp/logs
    Returns WhatsAppLog docs. Paginated. Does NOT expose phone numbers in response.

  POST /api/v1/whatsapp/webhook (no auth — Meta verification only)
    Verify X-Hub-Signature-256 header. Return 200 immediately. Process async.

Security:
  NEVER log phone numbers — not in winston, not in Sentry
  assertOwnership() for every guestId in bulk send list
  Webhook must verify HMAC-SHA256 signature — reject unsigned webhooks with 403
```

---

### 12.4 Multi-Staff Real-Time Collaboration Add-On

**Append to:** Section 11.6

```
── Domain Add-On: Multi-Staff Real-Time Collaboration ───────────────────────

Presence awareness (server/src/sockets/handlers/presenceHandlers.ts):
  Store in memory: Map<sheetId, Set<{ userId, fullName, socketId }>> — never in MongoDB.
  On join:
    1. Add to map
    2. Emit server:presence_joined to ROOM: { userId, fullName, activeCount }
    3. Emit server:presence_list to JOINER ONLY: { members: [...] }
  On leave or disconnect:
    1. Remove from map
    2. Emit server:presence_left to room: { userId, activeCount }

Conflict resolution: last-write-wins. No OT or CRDT needed for RSVP data.

Optimistic update pattern:
  1. User edits cell → AG Grid commits value immediately
  2. onCellValueChanged → socket.emit client:cell_edit
  3. Server saves → emits server:row_updated with sourceSocketId
  4. OTHER clients apply via applyTransaction
  5. EDITING CLIENT skips: if (socket.id === event.sourceSocketId) return

Reconnection behaviour:
  On socket reconnect: re-emit client:join_sheet with current sheetId
  After rejoining: invalidateQueries for guestKeys.all(sheetId)
  Show toast: "Connection restored" (auto-dismiss 3 seconds)
  On disconnect: show non-blocking banner "⚠️ Connection lost — Reconnecting..."
  After 5 failed reconnects: modal "Unable to reconnect" → "Refresh Page" button

Per-socket rate limits:
  client:cell_edit:       max 30 per 10 seconds
  client:toggle_checkin:  max 20 per 5 seconds
  client:row_add:         max 10 per 60 seconds
  client:row_delete:      max 10 per 60 seconds
  On limit: emit server:error to sender only. Never disconnect.
```

---

### 12.5 Event Export & Reporting Add-On

**Append to:** Section 11.3

```
── Domain Add-On: Event Export & Reporting ──────────────────────────────────

⚠️ Version Safety Rule: Before writing any export package:
  "exceljs npm latest version 2025"
  "exceljs CVE"
Verify no critical advisories. State what you found.

Endpoint:
  GET /api/v1/sheets/:sheetId/export
  Query: ?format=xlsx (default) or ?format=csv
  Auth: Yes. assertOwnership on sheetId.

Implementation:
  server/src/modules/guests/export.service.ts

Export flow:
  1. Fetch all non-deleted guests for sheetId (no pagination — full export)
  2. Fetch sheet.columnDefinitions to build header row
  3. Build workbook: row 1 = headers, rows 2+ = guest data
  4. Stream response directly (do not buffer entire file in memory):
     res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
     res.setHeader('Content-Disposition', `attachment; filename="${eventName}_guests_${date}.xlsx"`)
  5. Pipe workbook stream to res

Included columns: all active (non-deleted) columns in sheet order.
Always included regardless of column selection: Check-In status + Check-In timestamp.
Excluded from export: companyId, eventId, sheetId, __v, isDeleted, deletedAt.

Rate limiting: 10 exports per hour per company (prevents abuse on large sheets).
```

---

### 12.6 Onboarding Flow Add-On

**Append to:** Section 11.4

```
── Domain Add-On: Onboarding Flow ───────────────────────────────────────────

4-step guided modal shown on first login after registration (when onboardingDone = false).

Components:
  apps/web/src/features/onboarding/components/OnboardingModal.tsx — step wrapper
  apps/web/src/features/onboarding/components/Step1Welcome.tsx
  apps/web/src/features/onboarding/components/Step2CompanySetup.tsx
  apps/web/src/features/onboarding/components/Step3CreateEvent.tsx
  apps/web/src/features/onboarding/components/Step4AllSet.tsx

Step 1 — Welcome:
  InviteSheet logo, "Welcome to InviteSheet, [Company Name]! 👋"
  3 icons: 📋 Create event, 👥 Manage guests, 💬 Send WhatsApp invitations
  "Let's Go →" button + "Skip for now" link

Step 2 — Company Setup:
  Fields: Company Logo (optional file upload — preview only, no upload to server at MVP),
          Company Name (pre-filled), WhatsApp Business Number, City/Location
  PATCH /api/v1/companies/me on save + PATCH /users/me/onboarding { step: 2 }

Step 3 — Create First Event:
  Fields: Event Name, Event Location, Event Type dropdown, Start Date, End Date
  POST /api/v1/events on save + PATCH /users/me/onboarding { step: 3 }

Step 4 — All Set:
  Checkmark animation, "You're all set! 🎉"
  Two buttons: "Import Guest List" (file upload modal) | "Add Guests Manually"
  PATCH /users/me/onboarding { step: 4, data: { onboardingDone: true } }

Behaviour:
  Progress bar: "Step X of 4" at top of modal
  If user closes modal mid-flow → save current step → resume on next login
  If user clicks "Skip for now" on Step 1 → show "Complete Setup" banner on dashboard
  Once onboardingDone = true → modal never shown again
```

---

### 12.7 Event Creation Flow Add-On

**Append to:** Section 11.3 and 11.4

```
── Domain Add-On: Event Creation Flow ───────────────────────────────────────

Multi-step create event modal with two paths:

Path A — File Upload:
  Step 1: Basic event details (name, location, type, start date, end date)
  Step 2: Drag & drop zone for .xlsx, .xls, .csv
    - Show file name + size + detected columns preview after selection
    - "Import & Create Event →" button
    - After import: SmartBanner shown on RSVP screen (one-time only):
      "Your guest list has been imported! We noticed some useful columns are missing
       — would you like to add them?" Checkbox list of missing default columns.

Path B — Start Fresh:
  Step 1: Basic event details
  Step 2: "Do you have an existing guest list?" → user picks "Start Fresh"
  Step 3: Column selection checklist
    Always selected (locked): Guest Name, Contact Number, Check-In Toggle
    Checked by default (optional): No. of Pax, No. of Kids, Room Number,
      Travel Plan, ID Type, Arrival Date, Departure Date, Guest Status, Comments
    User can deselect optionals
    "+ Add Custom Column" link → mini modal (column name + type)
  Success state: animated checkmark → "Event Created Successfully!" → "Open RSVP Sheet"

Backend:
  POST /api/v1/events creates event + one default Sheet + locked columns
  POST /api/v1/events/:eventId/sheets — subsequent sheets follow same column selection flow
  Column order: Guest Name (1st), Contact Number (2nd), then selected columns, Check-In Toggle (last)

Dropdown specifications (default options — user can add more inline from RSVP screen):
  ID Type:      [Aadhaar, Passport, Voter ID, Driving Licence, Other, Pending]
  Travel Plan:  [By Car, By Train, By Flight, By Bus, Not Decided]
  Guest Status: [Confirmed, Not Coming, VIP, Dont Call, Wrong Number, Pending]
```

---

## 13. Document Maintenance

### 13.1 Scope Clarification

> **This document is a Technical Requirements Document (TRD).** It is intentionally scoped to engineering and implementation concerns. Product-level content for non-technical stakeholders — user journey maps, feature priority lists, success metrics, go-to-market strategy, pricing model, competitive positioning — lives in the InviteSheet product research documents and is not captured here.
>
> If you need to present InviteSheet to an investor, client, or non-technical co-founder, use the product research documents, not this PRD.

---

### 13.2 When to Update This File

| Change Type | Section(s) to Update |
|-------------|---------------------|
| New integration (email provider, WhatsApp provider switch) | Section 3 (env vars), Section 12 (relevant add-on) |
| Auth strategy change (add MFA, Passkeys, SSO) | Sections 6, 8, 11.2, 11.7 |
| New MongoDB collection or schema field added/removed | Section 4.4, Section 5 (API response shapes) |
| AG Grid version upgrade (major — breaking API changes) | Section 1.4, Section 7.4, Section 11.5 |
| Socket.io event renamed or added | Sections 4.6.2, 7.3, 11.6 |
| CI/CD pipeline changes | Section 9.4 |
| New public endpoint (no `requireAuth`) | Sections 4.1, 6.3 (rate limit coverage) |
| File storage decision changes (Cloudinary added) | Sections 1.3, 1.5, 3 (new env vars), 11.1, 11.3 |
| Plan structure change (new tier, different limits) | Section 3 (`FREE_PLAN_*` vars), Section 11.3 |
| New domain feature | New sub-section under Section 12 |
| CVE published | Do NOT add version pins here. Rotate secrets if affected, upgrade, document in changelog |

---

### 13.3 Security Review Triggers

Re-run **both** security checklists (Sections 6 and 8) before deploying whenever:

| Trigger | Why |
|---------|-----|
| Any change to cookie `domain`, `SameSite`, or `Secure` attributes | CSRF or cross-subdomain cookie theft risk |
| Any change to `CORS_ORIGINS` or `cors()` config | Incorrect CORS allows credentials from malicious origins |
| Any change to OAuth redirect URIs | Unregistered URIs enable OAuth redirect attack |
| Any new public endpoint (no `requireAuth`) | Must have explicit rate limiting |
| Any change to JWT signing keys | All existing access tokens immediately invalid |
| Any change to how `refreshToken` cookie is set | Session hijacking risk if flags are weakened |
| Any change to User, RefreshToken, or OTP Mongoose schemas | Auth correctness and token storage integrity |
| Upgrading `jsonwebtoken`, `bcryptjs`, `helmet`, `cors`, `express-rate-limit` | Historical CVEs — re-verify after every major upgrade |
| Adding any field to an API response that touches the Guest collection | Guest data contains Aadhaar numbers, passport numbers, phone numbers — any accidental exposure is a DPDP Act violation |

---

### 13.4 InviteSheet-Specific Compliance (DPDP Act 2023)

InviteSheet operates in India and processes personal data of Indian residents.

**Roles under the DPDP Act:**
- Guests (name, phone, ID docs) = **data principals**
- Event company using InviteSheet = **data fiduciary** (must have lawful basis for collecting guest data)
- InviteSheet as SaaS provider = **data processor**

**Technical obligations:**
- `GET /users/me/export` must also export all `Guest` documents under the company's events
- `DELETE /companies/:id/guest-data` endpoint (owner only) — permanently deletes all Guest documents for a company
- TTL index on Guest collection recommended for events older than `GUEST_DATA_RETENTION_DAYS` (default 365)

**PII — never in any log, Sentry breadcrumb, or API error response:**

```
Guest.contactNumber     phone numbers
Guest.guestName         personal name (alone)
Guest.idType + guestName together   identity correlation
User.email              (except internal admin tooling)
User.phone
OTP raw values
RefreshToken raw values
WHATSAPP_ACCESS_TOKEN value
```

**Sentry beforeSend scrubbing (already in Section 4.1 app.ts):**

```typescript
const SCRUB_KEYS = [
  'contactNumber', 'phone', 'passwordHash', 'tokenHash',
  'otpHash', 'email', 'guestName', 'accessToken', 'refreshToken',
];
```

---

### 13.5 Document Version History

| Version | Date | Changed By | Summary |
|---------|------|------------|---------|
| 1.0 | *(initial release)* | Founding team | Sections 1–13 initial draft across multiple files |
| 1.1 | *(this release)* | Technical review | **7 fixes applied:** folder structure unified to `server/`+`apps/web/`; Jest `setupFilesAfterEnv` typo fixed in both configs; AWS/S3 vars removed (MVP is memory-only); PORT unified to 4000; Version Safety Rule added to prompts 11.3–11.7; document scope clarified as TRD; Room View fully specified in Section 7.11 |

> **Versioning rule:** Increment **Minor** for content additions. Increment **Major** for architectural changes (framework swap, auth overhaul, database change). Do not version individual section edits.

---

### 13.6 AI Assistant Final Reminder

When any AI coding assistant (Cursor, Claude Code, GitHub Copilot) uses this document as context:

1. **⚠️ Version Safety Rule — no exceptions.** Web search every dependency. Confirm with `npm show <pkg> version`. State what you verified. Never write package.json with version numbers from memory or from this document.

2. **Folder structure is `server/` and `apps/web/`.** Never scaffold `backend/` or `frontend/`. If you see those names in earlier context, ignore them and use this document.

3. **PORT is 4000 everywhere.** `server/.env.example`, `apps/web/.env.example` (`NEXT_PUBLIC_API_BASE_URL`), Postman `baseUrl`, CI pipeline.

4. **No AWS/S3 env vars.** MVP file storage is memory-only (multer memoryStorage). Do not add `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, or `S3_BUCKET_NAME` to any file.

5. **Jest config key is `setupFilesAfterEnv`** — not `setupFilesAfterFramework`. Both backend and frontend configs use `setupFilesAfterEnv`.

6. **Guest data is PII under Indian DPDP Act 2023.** Before writing any code that touches the Guest collection (import, export, Socket.io events, logging): cross-reference Section 13.4. Never log `contactNumber`, `guestName`, or ID document fields.

7. **Err toward the more restrictive security option** and document why in a code comment. `// Security: using 404 instead of 403 to prevent IDOR` is the expected pattern throughout the codebase.

---

*© InviteSheet — Confidential. Internal development document.*

*This file (InviteSheet_PRD_Complete.md) is the single authoritative PRD v1.1. All earlier partial documents (Sections 1–3, 4–6, 7–9, 10–11, 12–13) are superseded by this file.*
