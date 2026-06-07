# InviteSheet Backend

REST API for the InviteSheet SaaS platform — manage events, guest lists, RSVP sheets, SMS invitations, and Excel exports.

## Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express 4.22
- **Language:** TypeScript (strict mode)
- **Database:** MongoDB + Mongoose 8
- **Validation:** Zod 3
- **Auth:** JWT (access + refresh tokens) with bcrypt
- **Real-time:** Socket.IO 4
- **SMS:** Fast2SMS Quick SMS API
- **Email:** Nodemailer (SMTP)
- **File Storage:** Cloudinary
- **Monitoring:** Sentry + Winston
- **Excel:** ExcelJS

## Quick Start

### 1. Prerequisites

- Node.js >= 18
- MongoDB (local or Atlas)
- Fast2SMS API key
- Cloudinary account
- SMTP credentials (e.g., Resend)

### 2. Install

```bash
cd backend
npm install
```

### 3. Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your actual values. At minimum:
- `MONGODB_URI` — your MongoDB connection string
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — generate with `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- `ENCRYPTION_KEY` — generate with same command
- `SMTP_*` — your email provider credentials
- `CLOUDINARY_*` — your Cloudinary credentials
- `FAST2SMS_API_KEY` — your Fast2SMS API key
- `FAST2SMS_DRY_RUN=true` — set to `false` to actually send SMS

### 4. Run Development Server

```bash
npm run dev
```

Server starts on `http://localhost:5000`.

### 5. Verify

```bash
curl http://localhost:5000/health
# → {"success":true,"data":{"status":"ok"}}
```

## API Endpoints

| Method | Path | Auth | Description |
|:-------|:-----|:-----|:------------|
| GET | /health | No | Health check |
| GET | /ready | No | Database readiness |
| POST | /api/v1/auth/register | No | Register new account |
| POST | /api/v1/auth/verify-otp | No | Verify email OTP |
| POST | /api/v1/auth/resend-otp | No | Resend OTP |
| POST | /api/v1/auth/login | No | Login |
| POST | /api/v1/auth/logout | Yes | Logout |
| POST | /api/v1/auth/refresh | No | Refresh access token |
| POST | /api/v1/auth/forgot-password | No | Request password reset |
| POST | /api/v1/auth/reset-password | No | Reset password with OTP |
| POST | /api/v1/auth/onboarding | Yes | Setup company profile |
| GET | /api/v1/users/me | Yes | Get profile |
| PATCH | /api/v1/users/me | Yes | Update profile |
| PATCH | /api/v1/users/me/password | Yes | Change password |
| GET | /api/v1/users/me/export | Yes | Export user data |
| DELETE | /api/v1/users/me | Yes | Delete account |
| PATCH | /api/v1/company | Yes | Update company |
| GET | /api/v1/events | Yes | List events |
| POST | /api/v1/events | Yes | Create event |
| GET | /api/v1/events/:id | Yes | Get event |
| PATCH | /api/v1/events/:id | Yes | Update event |
| DELETE | /api/v1/events/:id | Yes | Delete event |
| GET | /api/v1/events/:id/sheets | Yes | List sheets |
| POST | /api/v1/events/:id/sheets | Yes | Create sheet |
| PATCH | /api/v1/events/:id/sheets/:sid | Yes | Update sheet |
| DELETE | /api/v1/events/:id/sheets/:sid | Yes | Delete sheet |
| POST | .../guests/bulk | Yes | Bulk replace/upsert guests |
| PATCH | .../guests/bulk-checkin | Yes | Bulk check-in |
| DELETE | .../guests/bulk | Yes | Bulk delete guests |
| PATCH | .../guests/:gid | Yes | Update guest |
| DELETE | .../guests/:gid | Yes | Delete guest |
| GET | /api/v1/events/:id/sms/preview | Yes | Preview SMS |
| POST | /api/v1/events/:id/sms | Yes | Send SMS |
| GET | /api/v1/events/:id/export | Yes | Export event .xlsx |

## Postman

Import `postman/collection.json` and `postman/environment.json` into Postman for quick testing.

## Scripts

```bash
npm run dev        # Start dev server (tsx watch)
npm run build      # Compile TypeScript
npm run start      # Run compiled JS
npm run typecheck  # Type-check without emitting
```

## License

Private — All rights reserved.
