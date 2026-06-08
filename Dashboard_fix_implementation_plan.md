# Remove Hardcoded/Mock Data from Dashboard & Settings

Replace all hardcoded analytics, user info, and mock events with real data from the backend API.

## Proposed Changes

### Backend — New Dashboard Stats Endpoint

#### [MODIFY] [user.service.ts](file:///c:/Users/Lenovo/Searches/Downloads/invitesheet_saas/backend/src/modules/users/user.service.ts)

Add a `getDashboardStats()` function that returns:
- `totalEvents`, `activeEvents`, `totalGuestsManaged` — from existing Event/Guest models
- `messagesSent` — since the SMS service doesn't persist send history, we'll return `0` for now (placeholder-safe: it's an honest zero, not a fake `1247`). We can add an `SmsLog` model later to track actual sends.

#### [MODIFY] [user.controller.ts](file:///c:/Users/Lenovo/Searches/Downloads/invitesheet_saas/backend/src/modules/users/user.controller.ts)

Add handler `getDashboardStatsHandler` → `GET /api/v1/users/me/dashboard-stats`.

#### [MODIFY] [user.routes.ts](file:///c:/Users/Lenovo/Searches/Downloads/invitesheet_saas/backend/src/modules/users/user.routes.ts)

Register the new route.

---

### Frontend — Dashboard

#### [MODIFY] [Dashboard.tsx](file:///c:/Users/Lenovo/Searches/Downloads/invitesheet_saas/src/app/screens/Dashboard.tsx)

| Issue | Fix |
|---|---|
| `DEFAULT_EVENTS` (3 fake events) | Initialize `events` as `[]`. Add `loading` + `error` state. Show skeleton/spinner while loading. |
| `whatsappMessagesSent: 1247` | Rename to `messagesSent`. Fetch from new `/users/me/dashboard-stats` endpoint. Label becomes **"Messages Sent"**. Icon stays `MessageSquare`. |
| `Topbar` hardcoded user/company/role | Fetch `/users/me` on mount, pass real `fullName`, `company.name`, `role` into `Topbar`. |
| `Sidebar` hardcoded "2 of 2 events used" | Use `planLimits` from `/users/me` response to show real `currentEventCount / maxEvents`. |
| Avatar `seed=priya` | Use user's `fullName` as DiceBear seed so each user gets a unique avatar. |
| Silent `.catch(() => undefined)` | Set an `error` state and show an error alert. |

---

### Frontend — Settings (bonus — same pattern)

#### [MODIFY] [Settings.tsx](file:///c:/Users/Lenovo/Searches/Downloads/invitesheet_saas/src/app/screens/Settings.tsx)

| Issue | Fix |
|---|---|
| Hardcoded profile defaults on line 16 | Change defaults to empty strings (the `useEffect` already fetches real data). |
| Hardcoded company defaults on line 17 | Same — empty string defaults. |
| `Plan & usage` section "Free" / "2 / 2" hardcoded | Use `plan` and `planLimits` from the `/users/me` response. |

---

## Verification Plan

### Manual Verification
- Start the backend and frontend dev servers
- Log in and check that the Dashboard shows real data (no mock events visible for a fresh account)
- Verify the Topbar shows the logged-in user's name and company
- Verify the Sidebar shows the real plan usage
- Verify the "Messages Sent" stat card shows `0` (not `1,247`)
- Verify that if the API call fails (e.g. network off), an error message is shown instead of fake data
