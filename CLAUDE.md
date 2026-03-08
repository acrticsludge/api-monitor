# Pulse — API Monitor

## What It Is

A lightweight uptime and response monitoring tool for developers. Users register API endpoints, Pulse pings them on a schedule, and alerts them by email when something goes down or recovers.

---

## Tech Stack

| Layer            | Tech                                           |
| ---------------- | ---------------------------------------------- |
| Frontend         | Next.js (App Router, TypeScript, Tailwind CSS) |
| Backend/Worker   | Node.js + Express + node-cron                  |
| Database         | Supabase (Postgres + Auth + RLS)               |
| Email Alerts     | Resend (V2 — pending domain setup)             |
| Payments         | Lemon Squeezy (V2)                             |
| Frontend Hosting | Vercel (pending deployment)                    |
| Worker Hosting   | Railway (V2)                                   |

---

## Database Schema

### `monitors`

```sql
id                      UUID PRIMARY KEY
user_id                 UUID REFERENCES auth.users
name                    TEXT
url                     TEXT
method                  TEXT DEFAULT 'GET'
expected_status_code    INT DEFAULT 200
check_interval_minutes  INT DEFAULT 5
is_active               BOOLEAN DEFAULT true
webhook_url             TEXT nullable
created_at              TIMESTAMPTZ DEFAULT now()
```

### `pings`

```sql
id                UUID PRIMARY KEY
monitor_id        UUID REFERENCES monitors
status            TEXT -- 'up' | 'down'
response_time_ms  INT
status_code       INT
checked_at        TIMESTAMPTZ DEFAULT now()
```

### `alerts`

```sql
id          UUID PRIMARY KEY
monitor_id  UUID REFERENCES monitors
type        TEXT -- 'down' | 'recovered'
sent_at     TIMESTAMPTZ DEFAULT now()
```

RLS is enabled on all tables. Users can only read/write their own data.

Public read policies for status page:

```sql
CREATE POLICY "Public read active monitors"
ON monitors FOR SELECT
USING (is_active = true);

CREATE POLICY "Public read pings"
ON pings FOR SELECT
USING (true);
```

---

## Design System

**Fonts:** Syne (headings, buttons) + DM Mono (data, labels, inputs, monospaced content)
**Load fonts via:** Google Fonts link tag in each page

```
https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@400;500;600;700;800&display=swap
```

**Background:** `#080808`
**Surface:** `#0f0f0f`, `#111111`
**Border:** `white/[0.06]` default, `white/[0.12]` hover
**Accent:** `#00ff87` (green) — CTAs, status up, focus rings, glows
**Error:** `red-300` for text on dark backgrounds
**Warning:** `yellow-400`
**Muted text:** `neutral-500`, `neutral-600` — labels, secondary info
**Body text:** `neutral-300`, `neutral-400` — readable secondary text
**Primary text:** `white`, `neutral-200` — headings, important values

All inputs:

```
bg-[#0a0a0a] border border-white/[0.1] rounded-xl
focus:border-[#00ff87]/50 focus:ring-2 focus:ring-[#00ff87]/10
placeholder-neutral-600 text-white font-family DM Mono
```

All primary buttons:

```
bg-[#00ff87] hover:bg-[#00f080] text-black font-bold uppercase tracking-wide rounded-xl
shadow-[0_0_20px_rgba(0,255,135,0.2)] hover:shadow-[0_0_28px_rgba(0,255,135,0.35)]
```

Cards/panels top accent line:

```
absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00ff87]/40 to-transparent
```

Page fade-in animation (client components only):

```tsx
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
<div
  className="transition-all duration-700"
  style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(16px)' }}
>
```

Loading spinner:

```tsx
<svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
  <circle
    className="opacity-25"
    cx="12"
    cy="12"
    r="10"
    stroke="currentColor"
    strokeWidth="4"
  />
  <path
    className="opacity-75"
    fill="currentColor"
    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
  />
</svg>
```

Response time color coding:

```typescript
function responseTimeColor(ms: number | null): string {
  if (ms === null) return "text-neutral-600";
  if (ms < 300) return "text-[#00ff87]";
  if (ms < 1000) return "text-yellow-400";
  return "text-red-400";
}
```

Status badge with pinging dot (UP):

```tsx
<span className="relative flex w-1.5 h-1.5">
  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff87] opacity-50" />
  <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-[#00ff87]" />
</span>
```

---

## Pages

### `/login`

- Email + password sign in via Supabase Auth
- Fade-in animation on mount
- Link to `/signup`
- Redirects to `/dashboard` on success

### `/signup`

- Email + password registration
- Fade-in animation on mount
- Confirmation screen after signup with pinging checkmark animation
- Link to `/login`

### `/dashboard`

- Sticky header: logo, user email, logout
- Hero: "Your Monitors" heading + subtitle showing endpoint count
- Stat cards: Total, Online, Down, Pending
- Uptime bar with percentage + "Current session" label
- Share status page section: URL + copy button (client component)
- Monitors table (desktop) / card list (mobile)
- Pause/Resume + Delete per row (hover on desktop, always on mobile)
- Monitor name links to `/dashboard/monitors/[id]`
- Add Monitor button opens fixed centered modal (AddMonitorForm)

### `/dashboard/monitors/[id]`

- Back to dashboard in header
- Monitor name, URL, paused badge if inactive
- Check Now button (CheckNowButton client component)
- Stat cards: Uptime %, Current Status, Last Response, Avg Response
- Details grid: Method, Expected Status, Interval, Added, Webhook status
- Uptime bar with ping count
- Ping history table (last 20 pings)
- Incidents / alert history with empty "All clear" state

### `/status/[userId]`

- Public page, no auth required
- Overall system status banner
- All active monitors with name, status, uptime %
- Auto-refreshes every 60 seconds
- Branded with Pulse

---

## Free Tier Limits

- Max 5 monitors per user
- Min 5 minute check interval
- Enforced in both frontend (AddMonitorForm) and server actions

---

## Worker Architecture

```
Node.js process (Railway — V2)
  └── Express server → GET / health check
  └── node-cron (every 5 min)
        └── fetch all active monitors from Supabase
        └── Promise.all → ping each monitor with axios
              └── write result to pings table
              └── compare last 2 pings for status change
                    └── if changed:
                          └── insert to alerts table
                          └── POST to webhook_url if set
                          └── send Resend email (V2 — pending domain)
```

Worker uses `SUPABASE_SERVICE_ROLE_KEY` — never expose to frontend.

---

## Environment Variables

### Worker (`worker/.env`)

```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
PORT=3001
```

### Frontend (`frontend/.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

---

## Folder Structure

```
/
├── worker/
│   ├── index.js               ← cron + ping + alert + webhook logic
│   ├── package.json
│   └── .env
└── frontend/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx                ← redirects to /dashboard or /login
    │   ├── login/
    │   │   └── page.tsx
    │   ├── signup/
    │   │   └── page.tsx
    │   ├── dashboard/
    │   │   ├── page.tsx            ← server component
    │   │   ├── actions.ts          ← addMonitor, deleteMonitor, toggleMonitor
    │   │   ├── AddMonitorForm.tsx  ← client component modal
    │   │   └── monitors/
    │   │       └── [id]/
    │   │           ├── page.tsx            ← server component
    │   │           └── CheckNowButton.tsx  ← client component
    │   ├── status/
    │   │   └── [userId]/
    │   │       └── page.tsx        ← public status page
    │   ├── auth/
    │   │   └── actions.ts          ← logout server action
    │   └── lib/
    │       ├── supabase.ts         ← browser client
    │       └── supabase-server.ts  ← server client
    ├── middleware.ts
    └── .env.local
```

---

## Build Status

- [x] Supabase schema (monitors, pings, alerts + RLS)
- [x] Worker ping logic + cron
- [x] Worker alert detection + DB insert
- [x] Worker webhook POST on status change
- [x] Supabase browser + server clients
- [x] Middleware for route protection
- [x] Login page
- [x] Signup page
- [x] Dashboard page
- [x] AddMonitorForm modal (with free tier limit + slots remaining)
- [x] Monitor detail page
- [x] CheckNowButton (manual ping)
- [x] Server actions: addMonitor, deleteMonitor, toggleMonitor, logout
- [x] API route: POST /api/monitors/[id]/ping
- [x] webhook_url column added to DB
- [x] Webhook URL field in AddMonitorForm
- [x] Public status page /status/[userId]
- [x] Share status page link + copy button on dashboard
- [x] Method to Login using Google
- [x] Deploy worker to Railway
- [x] Deploy frontend to Vercel
- [x] last 7-day Uptime display
- [x] Docs page
- [ ] Resend email alerts (pending domain setup) (V2)
- [ ] Lemon Squeezy integration (V2)
- [ ] SSL certificate expiry monitor (V2)
- [ ] 30/90 day ping history retention (V2)
- [ ] CSV export (V2)
- [ ] Account page (V2)
