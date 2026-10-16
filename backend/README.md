# SubTrack Backend

Node.js + Express API server backed by Supabase (PostgreSQL + Auth).

---

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Wait for the project to finish provisioning.
3. Go to **Project Settings → API** and copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role** secret key → `SUPABASE_SERVICE_ROLE_KEY`

---

## 2. Database setup

Open the **SQL Editor** in your Supabase dashboard and run the following blocks in order.

### Tables

```sql
-- Subscriptions
create table subscriptions (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid references auth.users not null,
  name                    text not null,
  abbr                    text not null default '',
  logo_bg                 text not null default '#EEEDFE',
  logo_fg                 text not null default '#3C3489',
  category                text not null default 'Other',
  website                 text not null default '',
  currency                text not null default 'JPY',
  amount                  numeric not null default 0,
  cycle                   text not null default 'Monthly',
  next_billing_date       date,
  trial_end_date          date,
  account_email           text not null default '',
  account_type            text not null default '',
  payment                 text not null default '',
  card_4                  text not null default '',
  billed_via              text not null default 'Direct',
  cancellation_url        text not null default '',
  cancellation_notes      text not null default '',
  cancellation_difficulty text not null default 'Easy',
  status                  text not null default 'active',
  auto_renew              boolean not null default true,
  reminders               jsonb not null default '{"days7":true,"days3":true,"onDay":false}',
  notes                   text not null default '',
  created_at              timestamptz not null default now()
);

-- Account groups
create table account_groups (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users not null,
  label      text not null,
  color      text not null default '#6366F1',
  emails     jsonb not null default '[]',
  created_at timestamptz not null default now()
);

-- User settings (one row per user)
create table user_settings (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid references auth.users not null unique,
  display_name           text not null default '',
  default_currency       text not null default 'JPY',
  show_yearly_projection boolean not null default true,
  show_cancelled         boolean not null default false,
  monthly_budget_alert   numeric,
  reminders              jsonb not null default '{"days7":true,"days3":true,"onDay":false,"trialAlert":true}',
  created_at             timestamptz not null default now()
);
```

### Row Level Security

```sql
-- Enable RLS on all tables
alter table subscriptions  enable row level security;
alter table account_groups enable row level security;
alter table user_settings  enable row level security;

-- Subscriptions: users can only touch their own rows
create policy "own_subscriptions" on subscriptions
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Account groups: same
create policy "own_account_groups" on account_groups
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- User settings: same
create policy "own_user_settings" on user_settings
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
```

> The API server uses the **service role key**, which bypasses RLS on the server side.
> RLS policies are an additional safety net in case of direct database access.

---

## 3. Environment setup

Copy `.env.example` to `.env` and fill in your values:

```
PORT=3001
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret
FRONTEND_URL=http://localhost:5173
```

Never commit `.env`. It is already in `.gitignore`.

---

## 4. Run the server

```bash
cd backend
npm install
npm run dev     # development (restarts on file changes, Node 18.11+)
npm start       # production
```

The server listens on `http://localhost:3001` by default.

---

## 5. API reference

All routes except `GET /api/health` require an `Authorization: Bearer <token>` header.

| Method | Path                       | Description                        |
|--------|----------------------------|------------------------------------|
| GET    | /api/health                | Health check (no auth required)    |
| GET    | /api/subscriptions         | List all subscriptions for user    |
| POST   | /api/subscriptions         | Create a subscription              |
| PATCH  | /api/subscriptions/:id     | Update a subscription              |
| DELETE | /api/subscriptions/:id     | Delete a subscription              |
| GET    | /api/accounts              | List all account groups for user   |
| POST   | /api/accounts              | Create an account group            |
| PATCH  | /api/accounts/:id          | Update an account group            |
| DELETE | /api/accounts/:id          | Delete an account group            |
| GET    | /api/settings              | Get user settings (returns defaults if none exist) |
| PATCH  | /api/settings              | Upsert user settings               |

---

## 6. Connecting the React frontend

### Authentication

Auth is handled client-side with the Supabase JS SDK. The frontend calls
`supabase.auth.signUp()` / `supabase.auth.signInWithPassword()` directly —
the API server has no login or register routes.

After login, get the session token and pass it on every API request:

```js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

async function apiFetch(path, options = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  return fetch(`${import.meta.env.VITE_API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      ...options.headers,
    },
  })
}
```

Add to the React app's `.env`:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
VITE_API_URL=http://localhost:3001
```

### Field naming

The API uses **snake_case** (PostgreSQL convention). The frontend Zustand store
currently uses **camelCase**. When wiring them together, map fields at the
API call boundary — for example:

```js
// Sending to API
const payload = {
  next_billing_date: sub.nextBillingDate,
  account_type: sub.accountType,
  auto_renew: sub.autoRenew,
  // ...
}

// Reading from API
const sub = {
  nextBillingDate: row.next_billing_date,
  accountType: row.account_type,
  autoRenew: row.auto_renew,
  // ...
}
```
