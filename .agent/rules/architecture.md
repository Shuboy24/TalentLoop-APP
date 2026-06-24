---
trigger: always_on
---

# Architecture Rules — TalentLoop MVP

## Framework & Routing

- **Next.js 14 App Router** is the only routing system. Never use the Pages Router.
- Route groups use parentheses: `(auth)`, `(dashboard)`, `(onboarding)`, `(admin)`.
- Layout files (`layout.tsx`) handle shared UI and auth guards per route group.
- Server Components are the default. Add `"use client"` only when needed (event handlers, hooks, browser APIs).
- `loading.tsx` and `error.tsx` must exist for every major route segment.

## Folder Structure

```
app/
  (auth)/
    sign-up/page.tsx
    login/page.tsx
    verify-email/page.tsx
    reset-password/page.tsx
  (onboarding)/
    layout.tsx              # Redirect to dashboard if onboarding_complete
    step/[step]/page.tsx    # Steps 1–5
  (dashboard)/
    layout.tsx              # Redirect to onboarding if !onboarding_complete
    page.tsx                # Match feed (home)
    profile/
      page.tsx              # Own profile
      [userId]/page.tsx     # Other user's profile
    trades/
      page.tsx              # Trade tracker
      [tradeId]/page.tsx    # Single trade view + messaging
    notifications/page.tsx
    settings/page.tsx
  (admin)/
    layout.tsx              # Admin role guard
    page.tsx                # Admin overview
    users/page.tsx
    trades/page.tsx
    disputes/page.tsx
    skills/page.tsx
  api/
    auth/[...nextauth]/route.ts
    users/
    trades/
    proposals/
    matches/
    messages/
    reviews/
    disputes/
    skills/
    notifications/
    admin/
components/
  ui/                       # shadcn/ui primitives only
  auth/
  onboarding/
  profile/
  matches/
  trades/
  messaging/
  admin/
  shared/                   # Buttons, cards, badges used across features
lib/
  auth.ts                   # NextAuth config
  db.ts                     # Prisma client singleton
  cloudinary.ts             # Upload helpers
  resend.ts                 # Email send helpers
  matching.ts               # Match score algorithm
  trust-score.ts            # Trust score calculation
  talent-points.ts          # Points logic
  validations/              # Zod schemas (one file per domain)
hooks/
  use-trade.ts
  use-matches.ts
  use-notifications.ts
  use-messages.ts
prisma/
  schema.prisma
  migrations/
  seed.ts
types/
  index.ts                  # Shared TypeScript types
tokens/
  design-tokens.css          # Design tokens (source of truth) — auto-generated
  design-tokens.json         # Figma-exported token definitions
  convert-tokens.js          # Token converter script (generates design-tokens.css)
```

## API Route Conventions

- All API routes live in `app/api/`.
- Every route returns a consistent JSON envelope:
  ```ts
  { success: true, data: T }
  { success: false, error: string }
  ```
- HTTP methods map semantically: GET (read), POST (create), PATCH (update), DELETE (remove).
- Authentication is validated server-side on every protected route using `getServerSession()`.
- Zod schemas validate all incoming request bodies before any DB access.
- Never return raw Prisma errors to the client. Catch and map to safe messages.

## Database Layer

- **Prisma** is the only ORM. No raw SQL with user-interpolated input.
- The Prisma client is a singleton in `lib/db.ts`:
  ```ts
  import { PrismaClient } from "@prisma/client";
  const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
  export const db = globalForPrisma.prisma ?? new PrismaClient();
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
  ```
- All schema changes go through `prisma migrate dev`. Never manually edit the database.
- Required indexes: `users.email`, `user_skills.user_id`, `user_skills.skill_id`, `trades.status`, `messages.trade_id`.
- All tables must have `created_at` and `updated_at` (use `@updatedAt` in Prisma schema).

## Authentication

- **NextAuth.js v5** with CredentialsProvider (email + password).
- Sessions are server-side (database strategy). No JWTs for MVP.
- Email verification is required before platform access. Check `email_verified` on every protected route.
- Password hashing: bcrypt with cost factor 12.
- Session check pattern in Server Components:
  ```ts
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  ```

## Matching Algorithm

Located in `lib/matching.ts`. Formula:
```
score = (skillCompatibility × 0.40) + (mutualNeed × 0.30) + (reputation × 0.20) + (availability × 0.10)
```
- Results cached for 24 hours or invalidated on profile/skill update.
- Max 20 results per feed page.
- Exclude: suspended users, incomplete profiles, users with active trades or pending proposals with current user.
- Run server-side only. Never expose raw match scores in the client without rounding to integer percentage.

## Trust Score Calculation

Located in `lib/trust-score.ts`. Formula:
```ts
const completedScore = Math.min(completedTrades / 20, 1.0);
const ratingScore = averageRating / 5;
const profileScore = profileCompleteness / 100;
const trustScore = (completedScore * 0.50) + (ratingScore * 0.30) + (profileScore * 0.20);
return Math.round(trustScore * 100 * 100) / 100; // stored as 0–100
```
Recalculated on: trade completion, review publication, profile update.

## File Uploads

- All file uploads go through **Cloudinary**.
- Profile photos: images only, max 5MB.
- Message attachments: PDF, PNG, JPG, DOCX, ZIP — max 10MB per file.
- Upload from client using Cloudinary's unsigned upload preset. Store only the returned URL in the DB.
- Never store files on the Next.js server filesystem.

## Email

- All transactional emails sent via **Resend** using `lib/resend.ts`.
- Email templates are React Email components in `emails/` directory.
- In-app notifications are always sent regardless of user email preferences.
- Users can opt out of email notifications per category in settings.

## Background Jobs / Scheduled Tasks

For MVP, scheduled logic (proposal expiry, review publication at 72h, notification reminders) uses **Vercel Cron Jobs** defined in `vercel.json`. Each cron job hits a protected internal API route (`/api/cron/[job-name]`) secured by a `CRON_SECRET` header check.

## Environment Variables

```
DATABASE_URL
DIRECT_URL           # Required for Neon serverless (bypasses connection pooler)
NEXTAUTH_SECRET
NEXTAUTH_URL
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
RESEND_API_KEY
NEXT_PUBLIC_POSTHOG_KEY
SENTRY_DSN
CRON_SECRET
```
Never hardcode any of these. All go in `.env.local` (gitignored).

## Performance Targets

| Metric | Target |
|--------|--------|
| Initial page load | < 3s on 4G mobile |
| API response p95 | < 500ms |
| Match feed generation | < 2s |
| Uptime | ≥ 99.5% |
| Lighthouse Performance | ≥ 85 |
| Lighthouse Accessibility | ≥ 90 |