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
| Email Alerts     | Resend                                         |
| Payments         | Lemon Squeezy                                  |
| Frontend Hosting | Vercel                                         |
| Worker Hosting   | Railway                                        |

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

---

## Design System

**Fonts:** Syne (headings, buttons) + DM Mono (data, labels, inputs, monospaced content)
**Background:** `#080808`
**Surface:** `#0f0f0f`, `#111111`
**Border:** `white/[0.06]` default, `white/[0.12]` hover
**Accent:** `#00ff87` (green) — used for CTAs, status up, focus rings, glows
**Error:** `red-400`
**Warning:** `yellow-400`
**Muted text:** `neutral-500`, `neutral-600`
**Body text:** `neutral-300`, `white`

All inputs use:

```
bg-[#0a0a0a] border border-white/[0.08] rounded-lg
focus:border-[#00ff87]/40 focus:ring-1 focus:ring-[#00ff87]/20
```

All primary buttons use:

```
bg-[#00ff87] hover:bg-[#00e87a] text-black font-bold uppercase tracking-wide
shadow-[0_0_20px_rgba(0,255,135,0.2)] hover:shadow-[0_0_28px_rgba(0,255,135,0.35)]
```

Cards/panels use a top gradient line:

```
absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00ff87]/30 to-transparent
```

---

## Pages

### `/login`

- Email + password sign in via Supabase Auth
- Link to `/signup`
- Redirects to `/dashboard` on success

### `/signup`

- Email + password registration via Supabase Auth
- Shows confirmation screen after signup (check your email state)
- Link to `/login`

### `/dashboard` (main page)

- Sticky header with logo, user email, logout button
- Stat cards: Total, Online, Down, Pending
- Uptime percentage bar
- Monitors table (desktop) / card list (mobile)
- Add Monitor button opens a centered fixed modal
- Delete monitor per row

---

## Features — V1 (Build This First)

### Monitor Management

- [ ] Add monitor (name, url, method, expected status code, check interval)
- [ ] Delete monitor
- [ ] List all monitors with latest ping status
- [ ] Show response time and last checked time per monitor

### Worker (runs on Railway)

- [ ] Cron job every 5 minutes fetches all active monitors from Supabase
- [ ] Pings each endpoint with axios, records status + response time
- [ ] Writes result to `pings` table
- [ ] Detects status change (up→down or down→up) by comparing last 2 pings
- [ ] Sends email alert via Resend on status change
- [ ] Logs alert to `alerts` table

### Auth

- [ ] Sign up with email + password
- [ ] Sign in
- [ ] Sign out
- [ ] Protected routes via Next.js middleware
- [ ] Session handled by Supabase SSR client

### Free Tier Limits

- [ ] Max 5 monitors per user
- [ ] Check interval minimum 5 minutes
- [ ] Enforce limits in both frontend and server actions

---

## Features — V2 (After First Users)

### Monitor Detail Page `/dashboard/monitors/[id]`

- [ ] Ping history chart (response time over time)
- [ ] Uptime percentage (last 7 days, 30 days)
- [ ] Alert history log
- [ ] Pause / resume monitor toggle

### Paid Tier (via Lemon Squeezy)

- [ ] Unlimited monitors
- [ ] Check interval as low as 1 minute
- [ ] Multi-email alerts
- [ ] Webhook alerts (POST to user-defined URL on status change)
- [ ] CSV export of ping history

### Account Page `/account`

- [ ] Current plan (free / pro)
- [ ] Upgrade button (opens Lemon Squeezy checkout)
- [ ] Manage billing (Lemon Squeezy customer portal)
- [ ] Alert email settings

---

## Worker Architecture

```
Railway (always-on Node process)
  └── Express server (health check endpoint GET /)
  └── node-cron (runs every 5 min)
        └── fetch active monitors from Supabase
        └── Promise.all → ping each monitor
              └── write to pings table
              └── compare last 2 pings
                    └── if status changed → send Resend email + write to alerts table
```

Worker uses `SUPABASE_SERVICE_ROLE_KEY` (never expose to frontend).

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
│   ├── index.js          ← main worker entry, cron + ping logic
│   ├── package.json
│   └── .env
└── frontend/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx              ← redirects to /dashboard or /login
    │   ├── login/page.tsx
    │   ├── signup/page.tsx
    │   ├── dashboard/
    │   │   ├── page.tsx          ← main dashboard (server component)
    │   │   ├── actions.ts        ← addMonitor, deleteMonitor server actions
    │   │   └── AddMonitorForm.tsx ← client component modal
    │   ├── auth/
    │   │   └── actions.ts        ← logout server action
    │   └── lib/
    │       ├── supabase.ts       ← browser client
    │       └── supabase-server.ts ← server client
    ├── middleware.ts
    └── .env.local
```

---

## Current Status

- [x] Supabase schema created (monitors, pings, alerts + RLS)
- [x] Worker core ping logic written and tested
- [x] Worker writes to Supabase pings table
- [x] Frontend scaffolded with Next.js
- [x] Supabase browser + server clients set up
- [x] Middleware for route protection
- [x] Auth pages (login, signup) built
- [x] Dashboard page built
- [x] AddMonitorForm modal built
- [x] Server actions (addMonitor, deleteMonitor, logout) — complete
- [ ] Worker alert logic — complete
- [ ] Deploy worker to Railway
- [ ] Deploy frontend to Vercel
- [ ] Lemon Squeezy integration (V2)
- [ ] Monitor detail page with charts (V2)
