# SubTrack

**Know where you signed up. See what renews next.**

SubTrack brings your subscriptions into one place, organized by the accounts and email addresses you actually use. Keep track of costs, upcoming renewals, and the services you want to keep or cancel.

## Try SubTrack

### [Open SubTrack →](https://sub-track-eosin.vercel.app/)

Use it directly in your browser. No download or local setup is required to use the hosted app.

## Get started

1. **Create your SubTrack login.** Sign up with your email and password, confirm your email, and complete the initial setup.
2. **Add your subscription accounts.** Create groups such as Personal, Work, or School and add the email addresses you use for those services. Your SubTrack login email can also be one of these addresses.
3. **Add your subscriptions.** Enter the service, price, billing cycle, next renewal date, and the account it belongs to.
4. **Review before the next payment.** Check your dashboard and timeline, then mark subscriptions Keep, Undecided, or Cancel as you decide what to do next.

Subscriptions are entered manually. SubTrack does not scan your inbox or cancel services on your behalf; complete any cancellation with the service provider.

## What you can do

- Organize subscriptions across several accounts and email addresses.
- Track subscription costs, billing cycles, renewals, and trial dates.
- Review spending summaries, a renewal timeline, and subscription insights.
- Filter subscriptions by your Keep, Undecided, and Cancel decisions.
- Save your subscriptions and settings to your signed-in profile.
- Personalize your profile with an uploaded and cropped photo.
- Use light or dark mode.

## Keep SubTrack close

- **Desktop Chrome:** Open the live site, then choose **⋮ → Cast, save, and share → Install page as app**.
- **iPhone Safari:** Open the live site, tap **Share → Add to Home Screen**, and enable **Open as Web App** if offered.

Menu labels vary by browser version. These options open the web app from your desktop or home screen; an internet connection is still required.

## About this project

Designed and developed by [Claire Lin](https://github.com/clairehayashi) as an independent product design and full-stack development project.

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, React Router, Zustand, CSS Modules |
| Backend | Node.js, Express, Zod |
| Authentication and data | Supabase Auth, PostgreSQL, Storage |
| Hosting | Vercel |

The repository contains two applications: [`subtrack/`](./subtrack) for the frontend and [`backend/`](./backend) for the API. They deploy separately from this repository.

## Local development

For everyday use, open the [hosted app](https://sub-track-eosin.vercel.app/). The steps below are for developers running their own copy.

**Prerequisites:** Node.js 22 or later, npm, and your own configured Supabase project. A complete database bootstrap is not yet included in this repository; a new Supabase project needs the required schema, functions, ownership policies, and avatar storage before the application can run end to end. See [backend requirements](./backend/README.md#database-and-storage-requirements).

### 1. Get the source

```bash
git clone https://github.com/clairehayashi/SubTrack.git
cd SubTrack
```

### 2. Configure the environment

Copy `backend/.env.example` to `backend/.env` and fill in your own Supabase values:

```dotenv
PORT=3001
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_OR_PUBLISHABLE_KEY
FRONTEND_URL=http://localhost:5173
```

Create `subtrack/.env.local` using the same Supabase project:

```dotenv
VITE_API_URL=http://localhost:3001/api
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_OR_PUBLISHABLE_KEY
VITE_AUTH_PREVIEW=false
VITE_DESIGN_PREVIEW=false
```

In Supabase Auth URL Configuration, add these local redirect URLs:

```text
http://localhost:5173/auth/callback
http://localhost:5173/auth?mode=reset-confirm
```

Use the public anon/publishable key for these clients. Keep service-role keys, secret keys, passwords, and real environment files out of the repository.

### 3. Run both applications

In one terminal:

```bash
cd backend
npm ci
npm run dev
```

In a second terminal, starting from the repository root:

```bash
cd subtrack
npm ci
npm run dev
```

Open the frontend at `http://localhost:5173`. The API health check is `http://localhost:3001/api/health`.

## Feedback

Found a problem or have a suggestion? [Open an issue](https://github.com/clairehayashi/SubTrack/issues) with the steps you took, what you expected, and what happened. Remove personal information and credentials from screenshots or logs.
