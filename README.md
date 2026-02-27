# GDG Discord Scheduler Bot

A meeting scheduling system that integrates a Discord Bot with a web application, similar to When2Meet. Users create meetings via Discord Slash Commands, and team members select available time slots through an interactive web-based time grid with heatmap visualization.

## Features

- **Meeting Creation** -- Create scheduling events via the `/scheduler meeting` Discord command with a modal form
- **Time Slot Selection** -- Drag-to-select time grid (08:00-22:00) with mouse, touch, and keyboard support
- **Heatmap Visualization** -- Real-time overlay showing how many participants are available per slot
- **Dashboard** -- Personal meeting list split into active and past meetings, with summary stats
- **Meeting Search** -- Browse all meetings with name/ID filtering
- **Dark / Light Theme** -- Toggle persisted via localStorage
- **Discord OAuth2 Authentication** -- No separate registration required; sign in with your Discord account

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16.1.6 (App Router) |
| Language | TypeScript 5 (strict mode) |
| UI | React 19.2.3, Tailwind CSS v4 |
| Database | Supabase (PostgreSQL) |
| Bot | discord.js 14 (REST only), tweetnacl (Ed25519) |
| Auth | Discord OAuth2, httpOnly cookie session |
| Icons | @tabler/icons-react |
| Animation | motion (Framer Motion) |
| Deployment | Vercel (app), Supabase Cloud (database) |
| CI | GitHub Actions (lint, type-check, build) |

## Architecture

```
Discord                       Vercel (Next.js)              Supabase
-------                       ----------------              --------
/scheduler meeting   --->  POST /api/discord/interactions
                              handleModalSubmit()  -------> INSERT meetings
                              returns Embed + OAuth2 link

User clicks link     --->  GET /api/auth/discord
                           GET /api/auth/callback  -------> set cookie
                           redirect to /meeting/[id]

User selects slots   --->  POST /api/meetings/[id]/respond -> UPSERT responses
```

## Prerequisites

- Node.js 20+
- A [Discord Application](https://discord.com/developers/applications) with Bot and OAuth2 configured
- A [Supabase](https://supabase.com) project
- A [Vercel](https://vercel.com) account (for production deployment)

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/<your-org>/discord-scheduler-bot.git
cd discord-scheduler-bot
npm install
```

### 2. Set up the database

Open your Supabase project's SQL Editor and run the contents of `supabase/schema.sql`. This creates:

- `meetings` table (TEXT primary key)
- `meeting_responses` table (UUID primary key, FK to meetings)
- 4 indexes, 2 auto-`updated_at` triggers

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in the following values in `.env.local`:

| Variable | Description |
|----------|-------------|
| `DISCORD_APP_ID` | Discord Application ID |
| `DISCORD_PUBLIC_KEY` | Discord public key for Ed25519 signature verification |
| `DISCORD_CLIENT_SECRET` | Discord OAuth2 client secret |
| `DISCORD_REDIRECT_URI` | OAuth2 callback URL, e.g. `https://<domain>/api/auth/callback` |
| `NEXT_PUBLIC_APP_URL` | Your application's base URL |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (required -- used server-side to bypass RLS) |

For the command registration script only:

| Variable | Description |
|----------|-------------|
| `DISCORD_BOT_TOKEN` | Discord bot token |

### 4. Register Discord Slash Commands

```bash
npm run register
```

This registers the `/scheduler` command (with `meeting` and `dashboard` subcommands) globally on your Discord application.

### 5. Set Discord Interactions Endpoint

In the [Discord Developer Portal](https://discord.com/developers/applications), go to your application's **General Information** and set **Interactions Endpoint URL** to:

```
https://<your-domain>/api/discord/interactions
```

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
  app/
    page.tsx                        Landing page
    dashboard/page.tsx              Dashboard (requires auth)
    meetings/page.tsx               All meetings list (requires auth)
    settings/page.tsx               User settings (requires auth)
    meeting/[id]/                   Meeting detail with time grid
      _components/                  meeting-content, time-grid, etc.
      _hooks/                       use-meeting-data, use-time-grid, use-toast
      _utils/                       date-helpers
    api/
      auth/                         discord, callback, logout, me
      meetings/                     list/create, [id] detail, [id]/respond
      discord/interactions/          Webhook endpoint + handlers
  components/                       AuthGuard, Sidebar, ErrorBanner
  contexts/                         ThemeProvider, UserProvider
  hooks/                            useMeetings
  lib/                              auth, env, api-response, supabase client, discord utils
supabase/
  schema.sql                        Database DDL
scripts/
  register-commands.ts              Slash command registration
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/auth/discord` | No | Redirect to Discord OAuth2 |
| GET | `/api/auth/callback` | No | OAuth2 token exchange, set session cookie |
| POST | `/api/auth/logout` | No | Clear session cookie |
| GET | `/api/auth/me` | No | Return current user from cookie |
| GET | `/api/meetings` | Session | List meetings (paginated) |
| POST | `/api/meetings` | Session | Create a meeting |
| GET | `/api/meetings/[id]` | No | Meeting detail with all responses |
| POST | `/api/meetings/[id]/respond` | Session | Submit/update available time slots |
| POST | `/api/discord/interactions` | Ed25519 | Discord interaction webhook |

## Database Schema

**meetings**

| Column | Type | Notes |
|--------|------|-------|
| id | TEXT | PK, format `MTG-<base36 timestamp>` |
| name | TEXT | NOT NULL |
| description | TEXT | nullable |
| participants_count | INTEGER | default 0 |
| date_range_start | DATE | NOT NULL |
| date_range_end | DATE | NOT NULL |
| creator_discord_id | TEXT | NOT NULL |
| creator_username | TEXT | NOT NULL |
| guild_id | TEXT | nullable |
| channel_id | TEXT | nullable |
| created_at | TIMESTAMPTZ | auto |
| updated_at | TIMESTAMPTZ | auto (trigger) |

**meeting_responses**

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK, auto-generated |
| meeting_id | TEXT | FK -> meetings (CASCADE) |
| discord_id | TEXT | NOT NULL |
| username | TEXT | NOT NULL |
| avatar_hash | TEXT | nullable |
| available_slots | JSONB | `[{ "date": "YYYY-MM-DD", "hour": 8-22 }]` |
| created_at | TIMESTAMPTZ | auto |
| updated_at | TIMESTAMPTZ | auto (trigger) |

Unique constraint: `(meeting_id, discord_id)` -- one response per user per meeting.

## Discord Commands

| Command | Description |
|---------|-------------|
| `/scheduler meeting` | Opens a modal to create a new meeting (name, participants, date range, description) |
| `/scheduler dashboard` | Sends an ephemeral message with an OAuth2 link to the web dashboard |

## Authentication Flow

1. User clicks a Discord OAuth2 link (or visits `/api/auth/discord`)
2. After authorization, Discord redirects to `/api/auth/callback` with a code
3. The server exchanges the code for an access token, fetches the user profile
4. User info is stored in an httpOnly, secure, sameSite=lax cookie (`discord_user`, 7-day TTL)
5. API routes use `requireSession()` to enforce authentication
6. Frontend uses the `AuthGuard` component to gate protected pages

The OAuth2 `state` parameter is signed with HMAC-SHA256 (using `DISCORD_CLIENT_SECRET`) and includes a nonce and 10-minute expiry to prevent CSRF.

## Security

- **Discord webhook verification** -- Ed25519 signature check on every interaction request
- **HMAC-signed OAuth state** -- prevents CSRF and replay attacks
- **httpOnly session cookie** -- not accessible from client-side JavaScript
- **Server-side identity** -- `creator_discord_id` and `username` are always read from the session, never from the request body
- **server-only module** -- Supabase client uses the `server-only` package to prevent the service role key from leaking into client bundles
- **Lazy Supabase init** -- Proxy-based initialization avoids exposing env vars at build time

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `next dev` | Start development server (Turbopack) |
| `build` | `next build` | Production build |
| `start` | `next start` | Start production server |
| `lint` | `eslint` | Run ESLint checks |
| `register` | `npx tsx scripts/register-commands.ts` | Register Discord Slash Commands |

## Deployment

1. Push the repository to GitHub
2. Import the project in Vercel
3. Add all environment variables listed above in Vercel's project settings
4. Deploy -- Vercel will run `next build` automatically
5. Set the **Interactions Endpoint URL** in Discord Developer Portal to `https://<your-vercel-domain>/api/discord/interactions`
6. Run `npm run register` locally (once) to register slash commands

Make sure `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel -- without it, meeting creation from Discord will silently fail.

## Documentation

See [docs/PROJECT_SPECIFICATION.md](docs/PROJECT_SPECIFICATION.md) for the full project specification, including detailed architecture diagrams, API request/response formats, component hierarchy, design system variables, and security model analysis.

## License

This project is private and not published under an open-source license.
