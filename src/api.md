# InviteSheet — Backend API Specification

> **Version:** 1.0  
> **Base URL:** `http://localhost:5000/api/v1` (dev) · `https://api.invitesheet.com/api/v1` (prod)  
> **Auth:** Access JWT in `Authorization: Bearer <token>` header (15 min TTL). Refresh token in `HttpOnly; Secure; SameSite=Strict` cookie (7 day TTL).  
> **Response envelope:** All responses follow `{ success: true, data: {...} }` or `{ success: false, error: { code, message, fields? } }`.

---

## Table of Contents

1. [System Endpoints](#1-system-endpoints)
2. [Auth Module](#2-auth-module)
3. [User Module](#3-user-module)
4. [Company Module](#4-company-module)
5. [Events Module](#5-events-module)
6. [Sheets Module](#6-sheets-module)
7. [Guests Module](#7-guests-module)
8. [SMS Module](#8-sms-module)
9. [Export Module](#9-export-module)
10. [Data Models](#10-data-models)
11. [Error Codes Reference](#11-error-codes-reference)
12. [Rate Limit Summary](#12-rate-limit-summary)

---

## 1. System Endpoints

### GET /health

**Description:** Liveness check — returns 200 if the process is up. No DB call.  
**Auth required:** No

#### Response — 200 OK
```json
{
  "success": true,
  "data": { "status": "ok" }
}
```

---

### GET /ready

**Description:** Readiness check — returns 200 only if MongoDB is connected.  
**Auth required:** No

#### Response — 200 OK
```json
{
  "success": true,
  "data": { "status": "ready", "db": "connected" }
}
```

#### Response — 503 Service Unavailable
```json
{
  "success": false,
  "error": { "code": "SERVICE_UNAVAILABLE", "message": "Database not connected" }
}
```

---

## 2. Auth Module

### POST /auth/register

**Description:** Create a new user account. Sends a 6-digit OTP to the provided email for verification.  
**Auth required:** No

#### Request
```json
{
  "companyName": "Sharma Events",
  "fullName": "Rahul Sharma",
  "email": "rahul@sharmaevents.com",
  "phone": "9876543210",
  "password": "SecurePass@1"
}
```

**Validation rules:**
- `companyName`: string, 2–100 chars
- `fullName`: string, 2–100 chars
- `email`: valid email format
- `phone`: 10-digit Indian mobile, starts with 6–9 (`/^[6-9]\d{9}$/`)
- `password`: min 8 chars, at least 1 uppercase, 1 number, 1 special character

#### Response — 201 Created
```json
{
  "success": true,
  "data": {
    "message": "OTP sent to rahul@sharmaevents.com",
    "email": "rahul@sharmaevents.com"
  }
}
```

#### Response — 409 Conflict
```json
{
  "success": false,
  "error": { "code": "CONFLICT", "message": "An account with this email already exists" }
}
```

#### Response — 400 Validation Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "fields": {
      "phone": ["Must be a 10-digit Indian mobile number"],
      "password": ["Must contain at least one uppercase letter"]
    }
  }
}
```

#### Business rules
- Email must be unique across all users.
- OTP is 6 digits, expires in 10 minutes.
- OTP should be hashed before storage (bcrypt or SHA-256 + salt).
- Phone must be a valid Indian mobile number format.
- Do NOT confirm whether an email is already registered in the error message body to prevent enumeration (use generic message for public-facing version if needed; here we allow it for B2B UX).

---

### POST /auth/verify-otp

**Description:** Verify the email OTP sent during registration. On success, marks the user as verified and logs them in.  
**Auth required:** No

#### Request
```json
{
  "email": "rahul@sharmaevents.com",
  "code": "482910"
}
```

#### Response — 200 OK
```json
{
  "success": true,
  "data": {
    "accessToken": "<jwt>",
    "user": {
      "_id": "64a1b2c3d4e5f6a7b8c9d0e1",
      "fullName": "Rahul Sharma",
      "email": "rahul@sharmaevents.com",
      "phone": "9876543210",
      "isVerified": true,
      "onboardingComplete": false,
      "plan": "free",
      "role": "owner"
    }
  }
}
```
Refresh token set as `HttpOnly` cookie.

#### Response — 400 Invalid OTP
```json
{
  "success": false,
  "error": { "code": "INVALID_OTP", "message": "Incorrect OTP. 2 attempts remaining." }
}
```

#### Response — 400 OTP Expired
```json
{
  "success": false,
  "error": { "code": "OTP_EXPIRED", "message": "OTP has expired. Please request a new one." }
}
```

#### Business rules
- OTP expires after 10 minutes.
- After 3 failed attempts, invalidate the OTP and require a resend.
- After successful verification, navigate frontend to `/onboarding`.

---

### POST /auth/resend-otp

**Description:** Resend a new OTP to the email. Frontend enforces 30-second cooldown client-side; server enforces minimum 30-second gap server-side.  
**Auth required:** No

#### Request
```json
{
  "email": "rahul@sharmaevents.com"
}
```

#### Response — 200 OK
```json
{
  "success": true,
  "data": { "message": "New OTP sent to rahul@sharmaevents.com" }
}
```

#### Response — 429 Too Many Requests
```json
{
  "success": false,
  "error": { "code": "RATE_LIMIT_EXCEEDED", "message": "Please wait 30 seconds before requesting a new OTP." }
}
```

---

### POST /auth/login

**Description:** Authenticate with email and password. Returns access token and sets refresh cookie.  
**Auth required:** No

#### Request
```json
{
  "email": "rahul@sharmaevents.com",
  "password": "SecurePass@1"
}
```

#### Response — 200 OK
```json
{
  "success": true,
  "data": {
    "accessToken": "<jwt>",
    "user": {
      "_id": "64a1b2c3d4e5f6a7b8c9d0e1",
      "fullName": "Rahul Sharma",
      "email": "rahul@sharmaevents.com",
      "phone": "9876543210",
      "isVerified": true,
      "onboardingComplete": true,
      "plan": "free",
      "role": "owner",
      "company": {
        "_id": "64a1b2c3d4e5f6a7b8c9d0e2",
        "name": "Sharma Events",
        "city": "Mumbai",
        "whatsappNumber": "9876543210",
        "logoUrl": "https://..."
      }
    }
  }
}
```
Refresh token set as `HttpOnly; Secure; SameSite=Strict` cookie named `refreshToken`.

#### Response — 401 Unauthorized
```json
{
  "success": false,
  "error": { "code": "INVALID_CREDENTIALS", "message": "Invalid email or password." }
}
```

#### Response — 401 Email Not Verified
```json
{
  "success": false,
  "error": { "code": "EMAIL_NOT_VERIFIED", "message": "Please verify your email before logging in." }
}
```

#### Response — 403 Account Locked
```json
{
  "success": false,
  "error": { "code": "ACCOUNT_LOCKED", "message": "Account locked due to too many failed attempts. Try again in 15 minutes." }
}
```

#### Business rules
- Track failed login attempts per email using a TTL-indexed `LoginAttempt` collection.
- Lock account after 5 failed attempts for 15 minutes.
- Reset attempt counter on successful login.
- Never reveal which field (email vs password) was wrong.

---

### POST /auth/forgot-password

**Description:** Send a 6-digit password reset OTP to the email address.  
**Auth required:** No

#### Request
```json
{
  "email": "rahul@sharmaevents.com"
}
```

#### Response — 200 OK
```json
{
  "success": true,
  "data": { "message": "Reset code sent to your email if an account exists." }
}
```

**Note:** Always return 200 regardless of whether the email exists (prevents enumeration).

#### Business rules
- OTP expires in 15 minutes.
- Rate-limit this endpoint strictly: max 3 requests per email per hour.

---

### POST /auth/reset-password

**Description:** Reset password using the OTP received via email.  
**Auth required:** No

#### Request
```json
{
  "email": "rahul@sharmaevents.com",
  "code": "739201",
  "password": "NewSecurePass@2",
  "confirmPassword": "NewSecurePass@2"
}
```

#### Response — 200 OK
```json
{
  "success": true,
  "data": { "message": "Password reset successfully. You can now log in." }
}
```

#### Response — 400 Validation Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "fields": { "confirmPassword": ["Passwords do not match"] }
  }
}
```

#### Response — 400 Invalid/Expired OTP
```json
{
  "success": false,
  "error": { "code": "INVALID_OTP", "message": "Reset code is invalid or has expired." }
}
```

#### Business rules
- On success, invalidate all existing refresh tokens for that user (force re-login).
- Password must pass same strength rules as registration.

---

### POST /auth/refresh

**Description:** Use the HttpOnly refresh cookie to get a new access token. Implements refresh token rotation.  
**Auth required:** No (uses HttpOnly cookie)

#### Response — 200 OK
```json
{
  "success": true,
  "data": { "accessToken": "<new_jwt>" }
}
```
New refresh token cookie is set and old one is invalidated.

#### Response — 401 Unauthorized
```json
{
  "success": false,
  "error": { "code": "REFRESH_TOKEN_INVALID", "message": "Session expired. Please log in again." }
}
```

#### Business rules
- Old refresh token is hashed with bcrypt before DB storage.
- On reuse of an already-rotated token, revoke ALL tokens for that user (breach signal).

---

### POST /auth/logout

**Description:** Log out the current session. Clears the refresh cookie and invalidates the refresh token in DB.  
**Auth required:** Yes

#### Response — 200 OK
```json
{
  "success": true,
  "data": { "message": "Logged out successfully." }
}
```

---

### GET /auth/google

**Description:** Initiates Google OAuth 2.0 flow. Redirects to Google consent screen.  
**Auth required:** No  
**Note:** Only available when `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in env.

---

### GET /auth/google/callback

**Description:** Google OAuth callback. On success, creates/matches user account, issues tokens, and redirects to frontend.  
**Auth required:** No

Redirects to: `{CLIENT_URL}/auth/callback?token=<accessToken>`  
Frontend must immediately read the token from the URL param, store it in memory (`tokenStore`), then clear it from the URL using `history.replaceState`.

---

## 3. User Module

### GET /users/me

**Description:** Get the authenticated user's full profile including company.  
**Auth required:** Yes

#### Response — 200 OK
```json
{
  "success": true,
  "data": {
    "_id": "64a1b2c3d4e5f6a7b8c9d0e1",
    "fullName": "Rahul Sharma",
    "email": "rahul@sharmaevents.com",
    "phone": "9876543210",
    "isVerified": true,
    "onboardingComplete": true,
    "plan": "free",
    "planLimits": {
      "maxEvents": 2,
      "currentEventCount": 1
    },
    "role": "owner",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "company": {
      "_id": "64a1b2c3d4e5f6a7b8c9d0e2",
      "name": "Sharma Events",
      "city": "Mumbai",
      "whatsappNumber": "9876543210",
      "logoUrl": "https://..."
    }
  }
}
```

---

### PATCH /users/me

**Description:** Update the authenticated user's profile (name and phone only; email is read-only).  
**Auth required:** Yes

#### Request
```json
{
  "fullName": "Rahul K. Sharma",
  "phone": "9876540000"
}
```

#### Response — 200 OK
```json
{
  "success": true,
  "data": {
    "_id": "64a1b2c3d4e5f6a7b8c9d0e1",
    "fullName": "Rahul K. Sharma",
    "email": "rahul@sharmaevents.com",
    "phone": "9876540000"
  }
}
```

---

### PATCH /users/me/password

**Description:** Change the authenticated user's password. Requires current password for verification.  
**Auth required:** Yes

#### Request
```json
{
  "current": "OldSecurePass@1",
  "next": "NewSecurePass@2",
  "confirm": "NewSecurePass@2"
}
```

#### Response — 200 OK
```json
{
  "success": true,
  "data": { "message": "Password updated successfully." }
}
```

#### Response — 400 Wrong Current Password
```json
{
  "success": false,
  "error": { "code": "INVALID_CREDENTIALS", "message": "Current password is incorrect." }
}
```

#### Business rules
- On success, invalidate all other active refresh tokens for this user (force re-login on other devices).

---

### POST /auth/onboarding

**Description:** Complete the company setup step during onboarding. Marks `onboardingComplete: true` on the user.  
**Auth required:** Yes

#### Request
`Content-Type: multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Company name, 2–100 chars |
| `city` | string | Yes | City name |
| `whatsapp` | string | Yes | 10-digit Indian mobile |
| `logo` | file | No | PNG or JPG, max 2 MB |

#### Response — 200 OK
```json
{
  "success": true,
  "data": {
    "company": {
      "_id": "64a1b2c3d4e5f6a7b8c9d0e2",
      "name": "Sharma Events",
      "city": "Mumbai",
      "whatsappNumber": "9876543210",
      "logoUrl": "https://cdn.invitesheet.com/logos/abc123.jpg"
    },
    "onboardingComplete": true
  }
}
```

#### Business rules
- If company already exists for user, update it. If not, create it.
- Logo stored in cloud storage (S3/Cloudinary). Return a CDN URL.
- `onboardingComplete` flag controls the initial redirect on login.

---

### GET /users/me/export

**Description:** Export all data for the authenticated user (GDPR/DPDP data portability).  
**Auth required:** Yes

#### Response — 200 OK
```json
{
  "success": true,
  "data": {
    "user": { "_id": "...", "fullName": "...", "email": "...", "phone": "...", "createdAt": "..." },
    "company": { "name": "...", "city": "...", "whatsappNumber": "..." },
    "events": [
      {
        "_id": "...",
        "name": "...",
        "sheets": [
          {
            "name": "Groom Side",
            "guests": [ { "name": "...", "contact": "...", "status": "...", "checkIn": false } ]
          }
        ]
      }
    ]
  }
}
```

---

### DELETE /users/me

**Description:** Permanently delete the user account, company, all events, and all guest data.  
**Auth required:** Yes

#### Request
```json
{
  "confirmText": "DELETE MY ACCOUNT"
}
```

#### Response — 200 OK
```json
{
  "success": true,
  "data": { "message": "Account permanently deleted." }
}
```

#### Response — 400 Confirm Text Mismatch
```json
{
  "success": false,
  "error": { "code": "CONFIRM_TEXT_MISMATCH", "message": "Confirmation text does not match." }
}
```

#### Business rules
- Hard-delete: user, company, all events, all sheets, all guests.
- Revoke all active refresh tokens immediately.
- This action is irreversible. The `confirmText` check is the only safeguard.

---

## 4. Company Module

### PATCH /company

**Description:** Update the authenticated user's company profile.  
**Auth required:** Yes  
**Minimum role:** owner

#### Request
`Content-Type: multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | No | Company name, 2–100 chars |
| `city` | string | No | City name |
| `whatsappNumber` | string | No | 10-digit Indian mobile |
| `logo` | file | No | PNG or JPG, max 2 MB |

#### Response — 200 OK
```json
{
  "success": true,
  "data": {
    "_id": "64a1b2c3d4e5f6a7b8c9d0e2",
    "name": "Sharma Events Pvt Ltd",
    "city": "Mumbai",
    "whatsappNumber": "9876540000",
    "logoUrl": "https://cdn.invitesheet.com/logos/xyz456.jpg"
  }
}
```

---

## 5. Events Module

### GET /events

**Description:** List all events for the authenticated user with summary stats.  
**Auth required:** Yes

#### Query params
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `status` | `upcoming\|active\|past\|all` | `all` | Filter by computed status |
| `page` | number | `1` | Page number |
| `limit` | number | `20` | Items per page |

#### Response — 200 OK
```json
{
  "success": true,
  "data": [
    {
      "_id": "64a1b2c3d4e5f6a7b8c9d0e3",
      "name": "Sharma-Gupta Wedding",
      "location": "The Leela Palace, Mumbai",
      "eventType": "Wedding",
      "startDate": "2024-11-15",
      "endDate": "2024-11-17",
      "status": "upcoming",
      "sheetCount": 3,
      "totalGuests": 487,
      "checkedIn": 0,
      "notComing": 12,
      "idsPending": 45
    }
  ],
  "pagination": {
    "total": 2,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

#### Business rules
- Status is computed: `startDate <= today <= endDate` → `active`; `startDate > today` → `upcoming`; `endDate < today` → `past`.
- `totalGuests`, `checkedIn`, `notComing`, `idsPending` are aggregated across all sheets.

---

### POST /events

**Description:** Create a new event. Automatically creates default sheets based on event type.  
**Auth required:** Yes

#### Request
```json
{
  "name": "Patel-Shah Wedding",
  "location": "Taj Hotel, Ahmedabad",
  "eventType": "Wedding",
  "startDate": "2024-12-20",
  "endDate": "2024-12-22",
  "defaultColumns": ["pax", "arrival", "departure", "idType", "travel", "status"]
}
```

**Field reference:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | Yes | 2+ chars |
| `location` | string | Yes | 2+ chars |
| `eventType` | `Wedding\|Corporate\|Social\|Other` | Yes | — |
| `startDate` | string (ISO `YYYY-MM-DD`) | Yes | — |
| `endDate` | string (ISO `YYYY-MM-DD`) | Yes | Must be >= `startDate` |
| `defaultColumns` | string[] | No | Subset of optional column keys |

#### Response — 201 Created
```json
{
  "success": true,
  "data": {
    "_id": "64a1b2c3d4e5f6a7b8c9d0e3",
    "name": "Patel-Shah Wedding",
    "location": "Taj Hotel, Ahmedabad",
    "eventType": "Wedding",
    "startDate": "2024-12-20",
    "endDate": "2024-12-22",
    "defaultColumns": ["pax", "arrival", "departure"],
    "userId": "64a1b2c3d4e5f6a7b8c9d0e1",
    "sheets": [
      { "_id": "...", "name": "Groom Side", "order": 0 },
      { "_id": "...", "name": "Bride Side", "order": 1 },
      { "_id": "...", "name": "Friends", "order": 2 }
    ],
    "createdAt": "2024-11-01T10:00:00.000Z"
  }
}
```

#### Response — 403 Plan Limit
```json
{
  "success": false,
  "error": { "code": "PLAN_LIMIT_REACHED", "message": "Free plan allows a maximum of 2 events. Please upgrade to create more." }
}
```

#### Business rules
- **Wedding** event type → auto-create 3 sheets: `Groom Side`, `Bride Side`, `Friends`.
- **Corporate / Social / Other** → auto-create 1 sheet: `Sheet1`.
- Free plan: maximum 2 events per user. Return 403 before creation if limit is reached.
- `defaultColumns` is stored on the event and applied as visible columns on all new sheets.

---

### GET /events/:eventId

**Description:** Get a single event with its sheet list and aggregate stats.  
**Auth required:** Yes

#### Response — 200 OK
```json
{
  "success": true,
  "data": {
    "_id": "64a1b2c3d4e5f6a7b8c9d0e3",
    "name": "Patel-Shah Wedding",
    "location": "Taj Hotel, Ahmedabad",
    "eventType": "Wedding",
    "startDate": "2024-12-20",
    "endDate": "2024-12-22",
    "status": "upcoming",
    "defaultColumns": ["pax", "arrival", "departure"],
    "sheets": [
      {
        "_id": "...",
        "name": "Groom Side",
        "order": 0,
        "guestCount": 140,
        "checkedIn": 0
      }
    ],
    "totalGuests": 487,
    "checkedIn": 0,
    "notComing": 12,
    "idsPending": 45
  }
}
```

---

### PATCH /events/:eventId

**Description:** Update event details (name, location, dates, type). Does NOT change sheets.  
**Auth required:** Yes

#### Request
```json
{
  "name": "Patel-Shah Wedding 2024",
  "location": "ITC Grand, Ahmedabad",
  "startDate": "2024-12-21",
  "endDate": "2024-12-23"
}
```

All fields are optional. Only provided fields are updated.

#### Response — 200 OK
```json
{
  "success": true,
  "data": { "_id": "...", "name": "Patel-Shah Wedding 2024", "..." : "..." }
}
```

#### Response — 400 Invalid Date
```json
{
  "success": false,
  "error": { "code": "INVALID_REQUEST", "message": "End date must be on or after start date." }
}
```

---

### DELETE /events/:eventId

**Description:** Soft-delete an event and all its sheets and guests.  
**Auth required:** Yes

#### Response — 200 OK
```json
{
  "success": true,
  "data": { "message": "Event deleted." }
}
```

---

## 6. Sheets Module

### GET /events/:eventId/sheets

**Description:** Get all (non-hidden) sheets for an event with their full guest data.  
**Auth required:** Yes

#### Query params
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `includeHidden` | boolean | `false` | Include hidden sheets |

#### Response — 200 OK
```json
{
  "success": true,
  "data": [
    {
      "_id": "64a1b2c3d4e5f6a7b8c9d0f1",
      "name": "Groom Side",
      "order": 0,
      "isHidden": false,
      "columnConfig": {
        "visibleColumns": ["name", "contact", "checkIn", "status", "pax", "arrival", "departure"],
        "columnOrder": ["name", "contact", "checkIn", "status", "pax", "arrival", "departure"],
        "customColumns": []
      },
      "guests": [
        {
          "_id": "64a1b2c3d4e5f6a7b8c9d0f2",
          "srNo": 1,
          "name": "Amitabh Bachchan",
          "contact": "9876543210",
          "checkIn": false,
          "status": "Confirmed",
          "idType": "Aadhaar",
          "pax": 2,
          "roomNo": "101",
          "travel": "By Flight",
          "arrival": "2024-12-20",
          "departure": "2024-12-23",
          "comments": "VIP guest",
          "isHidden": false
        }
      ]
    }
  ]
}
```

---

### POST /events/:eventId/sheets

**Description:** Create a new sheet tab inside an event.  
**Auth required:** Yes

#### Request
```json
{
  "name": "Extended Family"
}
```

#### Response — 201 Created
```json
{
  "success": true,
  "data": {
    "_id": "64a1b2c3d4e5f6a7b8c9d0f3",
    "name": "Extended Family",
    "order": 3,
    "isHidden": false,
    "columnConfig": {
      "visibleColumns": ["name", "contact", "checkIn"],
      "columnOrder": ["name", "contact", "checkIn"],
      "customColumns": []
    },
    "guests": []
  }
}
```

#### Response — 409 Conflict
```json
{
  "success": false,
  "error": { "code": "CONFLICT", "message": "A sheet with this name already exists in this event." }
}
```

---

### PATCH /events/:eventId/sheets/:sheetId

**Description:** Update a sheet's metadata (name, visibility, column config, order).  
**Auth required:** Yes

#### Request
```json
{
  "name": "Bride's Family",
  "isHidden": false,
  "columnConfig": {
    "visibleColumns": ["name", "contact", "checkIn", "status", "pax"],
    "columnOrder": ["name", "contact", "checkIn", "status", "pax"],
    "customColumns": [
      { "key": "custom_gift", "label": "Gift Received", "type": "text" }
    ]
  }
}
```

#### Response — 200 OK
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Bride's Family",
    "isHidden": false,
    "columnConfig": { "..." : "..." }
  }
}
```

---

### PATCH /events/:eventId/sheets/reorder

**Description:** Reorder all sheets at once by providing the new ordered list of sheet IDs.  
**Auth required:** Yes

#### Request
```json
{
  "sheetIds": [
    "64a1b2c3d4e5f6a7b8c9d0f1",
    "64a1b2c3d4e5f6a7b8c9d0f3",
    "64a1b2c3d4e5f6a7b8c9d0f2"
  ]
}
```

#### Response — 200 OK
```json
{
  "success": true,
  "data": { "message": "Sheets reordered." }
}
```

---

### DELETE /events/:eventId/sheets/:sheetId

**Description:** Delete a sheet and all its guests. Cannot delete the last sheet of an event.  
**Auth required:** Yes

#### Response — 200 OK
```json
{
  "success": true,
  "data": { "message": "Sheet deleted." }
}
```

#### Response — 400 Cannot Delete Last Sheet
```json
{
  "success": false,
  "error": { "code": "INVALID_REQUEST", "message": "Cannot delete the last sheet of an event." }
}
```

---

## 7. Guests Module

### POST /events/:eventId/sheets/:sheetId/guests

**Description:** Add a new guest row to a sheet.  
**Auth required:** Yes

#### Request
```json
{
  "name": "Priya Chopra",
  "contact": "9123456780",
  "checkIn": false,
  "status": "Confirmed",
  "idType": "Pending",
  "pax": 1,
  "roomNo": "",
  "travel": "Not Decided",
  "arrival": "",
  "departure": "",
  "comments": ""
}
```

**Allowed values:**

| Field | Allowed values |
|-------|---------------|
| `status` | `Confirmed`, `Not Coming`, `VIP`, `Dont Call`, `Wrong Number`, `Pending` |
| `idType` | `Aadhaar`, `Passport`, `Voter ID`, `Driving Licence`, `Other`, `Pending` |
| `travel` | `By Train`, `By Flight`, `By Car`, `By Bus`, `Not Decided` |

#### Response — 201 Created
```json
{
  "success": true,
  "data": {
    "_id": "64a1b2c3d4e5f6a7b8c9d0f4",
    "srNo": 142,
    "name": "Priya Chopra",
    "contact": "9123456780",
    "checkIn": false,
    "status": "Confirmed",
    "idType": "Pending",
    "pax": 1,
    "roomNo": "",
    "travel": "Not Decided",
    "arrival": "",
    "departure": "",
    "comments": "",
    "isHidden": false,
    "createdAt": "2024-11-01T10:00:00.000Z"
  }
}
```

---

### PATCH /events/:eventId/sheets/:sheetId/guests/:guestId

**Description:** Update one or more fields of a single guest row.  
**Auth required:** Yes

#### Request
Any subset of guest fields:
```json
{
  "checkIn": true,
  "roomNo": "204",
  "status": "VIP"
}
```

#### Response — 200 OK
```json
{
  "success": true,
  "data": {
    "_id": "64a1b2c3d4e5f6a7b8c9d0f4",
    "checkIn": true,
    "roomNo": "204",
    "status": "VIP"
  }
}
```

---

### POST /events/:eventId/sheets/:sheetId/guests/bulk

**Description:** Bulk create or update multiple guest rows. Used for Ctrl+V paste from Excel and full sheet saves.  
**Auth required:** Yes

#### Request
```json
{
  "operation": "upsert",
  "guests": [
    {
      "name": "Guest A",
      "contact": "9000000001",
      "status": "Confirmed",
      "pax": 2
    },
    {
      "name": "Guest B",
      "contact": "9000000002",
      "status": "Pending",
      "pax": 1
    }
  ]
}
```

`operation` values:
- `upsert` — insert new, update existing (match by `_id` if provided)
- `replace` — delete all existing guests in the sheet, then insert the provided list

#### Response — 200 OK
```json
{
  "success": true,
  "data": {
    "created": 48,
    "updated": 12,
    "total": 60
  }
}
```

#### Business rules
- When `_id` is absent, treat as a new guest (insert).
- When `_id` is present, update the existing guest.
- `replace` operation should be used cautiously and is designed for full sheet imports.

---

### DELETE /events/:eventId/sheets/:sheetId/guests/:guestId

**Description:** Delete a single guest row.  
**Auth required:** Yes

#### Response — 200 OK
```json
{
  "success": true,
  "data": { "message": "Guest deleted." }
}
```

---

### DELETE /events/:eventId/sheets/:sheetId/guests/bulk

**Description:** Delete multiple guest rows by ID array.  
**Auth required:** Yes

#### Request
```json
{
  "guestIds": [
    "64a1b2c3d4e5f6a7b8c9d0f4",
    "64a1b2c3d4e5f6a7b8c9d0f5"
  ]
}
```

#### Response — 200 OK
```json
{
  "success": true,
  "data": { "deleted": 2 }
}
```

---

### PATCH /events/:eventId/sheets/:sheetId/guests/bulk-checkin

**Description:** Toggle check-in status for multiple guests at once (e.g., bulk check-in all guests in a room).  
**Auth required:** Yes

#### Request
```json
{
  "guestIds": ["64a1b2c3d4e5f6a7b8c9d0f4", "64a1b2c3d4e5f6a7b8c9d0f5"],
  "checkIn": true
}
```

#### Response — 200 OK
```json
{
  "success": true,
  "data": { "updated": 2 }
}
```

---

## 8. SMS Module

### POST /events/:eventId/sms

**Description:** Send bulk SMS/WhatsApp messages to a filtered group of guests.  
**Auth required:** Yes

#### Request
```json
{
  "recipientType": "not-checked-in",
  "message": "Dear {name}, your check-in is pending. Please arrive at the venue. - Sharma Events",
  "selectedGuestIds": []
}
```

**`recipientType` values:**

| Value | Description |
|-------|-------------|
| `all-sheets` | All guests across all sheets |
| `sheet:{sheetId}` | All guests in a specific sheet |
| `selected-rows` | Only the guests listed in `selectedGuestIds` |
| `not-checked-in` | Guests where `checkIn === false` |
| `ids-not-received` | Guests where `idType === "Pending"` |
| `not-coming` | Guests where `status === "Not Coming"` |
| `vip-guests` | Guests where `status === "VIP"` |

#### Response — 200 OK
```json
{
  "success": true,
  "data": {
    "sent": 142,
    "failed": 3,
    "skipped": 8,
    "failedNames": ["Rajan Mehta", "Seema Patel", "Unknown Guest"]
  }
}
```

**Response field notes:**
- `sent` — SMS delivered successfully.
- `failed` — SMS provider returned an error for these numbers.
- `skipped` — Guest had no `contact` number (cannot attempt delivery).
- `failedNames` — Display names of failed recipients for the result screen.

#### Business rules
- SMS character counting: 160 chars = 1 SMS; each additional message = 153 chars per SMS.
- Template variable `{name}` is replaced with the guest's name before sending.
- If `contact` is blank or null, the guest is moved to `skipped`, not `failed`.
- Rate-limit this endpoint: max 5 bulk sends per event per hour.

---

### GET /events/:eventId/sms/preview

**Description:** Preview recipient count and validate before actually sending. Identical params to POST but returns count only.  
**Auth required:** Yes

#### Request (query params)
`?recipientType=not-checked-in`

#### Response — 200 OK
```json
{
  "success": true,
  "data": {
    "totalRecipients": 153,
    "validNumbers": 145,
    "skipped": 8,
    "estimatedSmsCount": 145
  }
}
```

---

## 9. Export Module

### GET /events/:eventId/export

**Description:** Export all sheets and guest data for an event as an Excel file (.xlsx).  
**Auth required:** Yes

#### Response — 200 OK
```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="Patel-Shah-Wedding-export.xlsx"

[Binary Excel file]
```

Each sheet tab in the event becomes a worksheet tab in the Excel file. Column headers match the event's `defaultColumns` plus any custom columns.

---

## 10. Data Models

### User
```typescript
{
  _id: ObjectId;
  fullName: string;
  email: string;                   // unique, lowercase
  phone: string;                   // 10-digit Indian mobile
  passwordHash: string;            // bcrypt, cost 10+; absent for OAuth-only accounts
  isVerified: boolean;             // email OTP confirmed
  onboardingComplete: boolean;     // company setup done
  plan: "free" | "pro";
  role: "owner";                   // single-user plan for V1
  company: ObjectId | null;        // ref: Company
  googleId?: string;               // if Google OAuth used
  refreshTokenHash?: string;       // hashed current refresh token
  loginAttempts: number;           // failed login counter
  lockedUntil?: Date;              // TTL: account lock expiry
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date;
}
```

### Company
```typescript
{
  _id: ObjectId;
  userId: ObjectId;                // owner ref
  name: string;
  city: string;
  whatsappNumber: string;          // 10-digit Indian mobile
  logoUrl?: string;                // CDN URL
  createdAt: Date;
  updatedAt: Date;
}
```

### Event
```typescript
{
  _id: ObjectId;
  userId: ObjectId;
  name: string;
  location: string;
  eventType: "Wedding" | "Corporate" | "Social" | "Other";
  startDate: Date;
  endDate: Date;
  defaultColumns: string[];        // e.g. ["pax","arrival","departure","idType","travel","status"]
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Sheet
```typescript
{
  _id: ObjectId;
  eventId: ObjectId;
  userId: ObjectId;
  name: string;
  order: number;                   // display order among tabs
  isHidden: boolean;
  columnConfig: {
    visibleColumns: string[];
    columnOrder: string[];
    customColumns: Array<{
      key: string;                 // e.g. "custom_gift"
      label: string;              // display name
      type: "text" | "dropdown";
      dropdownOptions?: string[];
      multiSelect?: boolean;
    }>;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### Guest
```typescript
{
  _id: ObjectId;
  sheetId: ObjectId;
  eventId: ObjectId;
  userId: ObjectId;
  name: string;
  contact: string;                 // phone number (no strict format — allow international)
  checkIn: boolean;
  status: "Confirmed" | "Not Coming" | "VIP" | "Dont Call" | "Wrong Number" | "Pending";
  idType: "Aadhaar" | "Passport" | "Voter ID" | "Driving Licence" | "Other" | "Pending";
  pax: number;                     // number of people this guest represents
  roomNo: string;
  travel: "By Train" | "By Flight" | "By Car" | "By Bus" | "Not Decided";
  arrival: string;                 // ISO date string or empty
  departure: string;               // ISO date string or empty
  comments: string;
  isHidden: boolean;
  customFields: Record<string, string>;  // values for customColumns
  createdAt: Date;
  updatedAt: Date;
}
```

### OTPRecord (TTL collection)
```typescript
{
  _id: ObjectId;
  email: string;
  otpHash: string;                 // hashed OTP
  type: "email_verify" | "password_reset";
  attempts: number;
  expiresAt: Date;                 // TTL index on this field
}
```

### LoginAttempt (TTL collection)
```typescript
{
  _id: ObjectId;
  email: string;
  failedAt: Date;
  expiresAt: Date;                 // TTL index: auto-clears after 15 min
}
```

---

## 11. Error Codes Reference

| HTTP | Code | When to use |
|------|------|-------------|
| 400 | `VALIDATION_ERROR` | Zod validation failed — includes `fields` object |
| 400 | `INVALID_REQUEST` | Logically invalid (e.g. end date before start) |
| 400 | `INVALID_OTP` | OTP is wrong or already used |
| 400 | `OTP_EXPIRED` | OTP TTL has passed |
| 400 | `CONFIRM_TEXT_MISMATCH` | Account deletion confirmation text wrong |
| 401 | `UNAUTHORIZED` | No token provided |
| 401 | `TOKEN_EXPIRED` | Access token expired — frontend should call `/auth/refresh` |
| 401 | `TOKEN_INVALID` | Token tampered or signed with wrong secret |
| 401 | `REFRESH_TOKEN_INVALID` | Refresh cookie missing, expired, or already rotated |
| 401 | `INVALID_CREDENTIALS` | Wrong email/password or wrong current password |
| 401 | `EMAIL_NOT_VERIFIED` | Login attempted before OTP verification |
| 403 | `FORBIDDEN` | Authenticated but insufficient role/ownership |
| 403 | `ACCOUNT_LOCKED` | Too many failed logins |
| 403 | `PLAN_LIMIT_REACHED` | Free plan event limit hit |
| 404 | `NOT_FOUND` | Resource not found or belongs to another user |
| 409 | `CONFLICT` | Duplicate unique resource (email, sheet name) |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests in window |
| 500 | `INTERNAL_ERROR` | Unhandled server error — check Sentry |
| 503 | `SERVICE_UNAVAILABLE` | DB not connected (readiness check only) |

---

## 12. Rate Limit Summary

| Route group | Window | Max requests | Notes |
|-------------|--------|-------------|-------|
| `POST /auth/login` | 1 min | 10 | Skip on success |
| `POST /auth/register` | 1 min | 5 | — |
| `POST /auth/forgot-password` | 1 hour | 3 per email | — |
| `POST /auth/resend-otp` | 30 sec | 1 per email | Enforced server-side |
| `POST /auth/refresh` | 1 min | 20 | — |
| `POST /events/:id/sms` | 1 hour | 5 per event | Prevent SMS abuse |
| `/api/*` (global) | 1 min | 100 | All authenticated routes |
| `/health`, `/ready` | Excluded | — | Never rate-limit liveness checks |

---

*Last updated: 2026-06-05 · Matches InviteSheet frontend v1.0 (post-onboarding-refactor)*
