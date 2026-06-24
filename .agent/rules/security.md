---
trigger: always_on
---

# Security Rules — TalentLoop MVP

## Non-Negotiables

These rules are never bypassed, regardless of context:

1. **No secrets in code.** All credentials, API keys, and tokens live in environment variables only.
2. **No raw SQL with user input.** Use Prisma parameterised queries exclusively.
3. **No unauthenticated access to protected data.** Every API route checks the session first.
4. **No user-supplied data rendered unescaped.** React escapes JSX by default — never use `dangerouslySetInnerHTML`.
5. **No admin routes accessible to non-admin users.** Role is checked server-side on every admin route.

---

## Authentication

### Session Management
- NextAuth.js v5 with **database session strategy** (no JWTs for MVP).
- Session validation on every server-side data fetch and API route:
  ```ts
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  ```
- Sessions expire after 30 days of inactivity.
- On logout, the session record is deleted from the database immediately.

### Password Security
- bcrypt hashing with cost factor **12**.
- Minimum password requirements (enforced both client-side and server-side via Zod):
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one number
- Passwords are never logged, stored in plaintext, or returned in API responses.
- Comparison uses `bcrypt.compare()` — never manual string comparison.

### Email Verification
- New accounts are created with `email_verified: false`.
- Verification token: `crypto.randomBytes(32).toString("hex")` — stored hashed in DB.
- Verification link expires in **60 minutes**.
- Unverified accounts cannot access the dashboard, onboarding, or any authenticated endpoint.
- Check in middleware:
  ```ts
  if (!session.user.emailVerified) redirect("/verify-email");
  ```

### Password Reset
- Reset token: `crypto.randomBytes(32).toString("hex")` — stored hashed.
- Reset links expire in **60 minutes**.
- Token is invalidated immediately after first use.
- Old password is not required (link proves identity).

---

## Rate Limiting

Implemented via Upstash Redis + `@upstash/ratelimit` (or in-memory Map for MVP if Redis is not yet set up). Apply at the API route level before any logic runs.

| Endpoint | Limit | Window |
|----------|-------|--------|
| `POST /api/auth/register` | 10 requests | per hour per IP |
| `POST /api/auth/login` | 5 requests | per 15 minutes per IP |
| `POST /api/proposals` | 20 requests | per day per user |
| `POST /api/auth/reset-password` | 3 requests | per hour per email |
| `POST /api/disputes` | 5 requests | per day per user |

- After 5 failed login attempts, lock the account for 15 minutes and send an alert email.
- Rate limit responses return `429 Too Many Requests` with a `Retry-After` header.

---

## Input Validation

- **Every** API route that accepts a body validates it with a Zod schema **before** any database access.
- **Every** form validates client-side via React Hook Form + Zod resolver, and server-side again in the API route. Never trust client-only validation.
- String lengths are enforced at both the Zod layer and the database schema level.
- UUID format is validated before any DB lookup by ID:
  ```ts
  z.string().uuid("Invalid ID format")
  ```
- Enum values are validated against the allowed list:
  ```ts
  z.enum(["OFFERED", "NEEDED"])
  ```

### Key Length Limits
| Field | Max Length |
|-------|-----------|
| Bio | 300 chars |
| Deliverables | 500 chars |
| Optional note | 300 chars |
| Completion criteria | 300 chars |
| Review text | 500 chars |
| Message body | 1000 chars |
| Dispute detail | 300 chars |
| Admin notes | No limit (admin only) |

---

## Authorisation (What Users Can Access)

### Ownership Checks
Before any PATCH/DELETE on a resource, verify the requesting user owns it:
```ts
const trade = await db.trade.findUnique({ where: { id: tradeId } });
if (!trade || (trade.userAId !== session.user.id && trade.userBId !== session.user.id)) {
  return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
}
```

### Role-Based Rules
| Action | Who Can Do It |
|--------|--------------|
| View own profile | Self |
| View any public profile | Any authenticated user |
| Edit profile | Self only |
| Send proposal | Any verified, non-suspended user |
| Accept/decline proposal | Receiver only |
| Confirm trade agreement | Both parties (each their own) |
| Mark delivery complete | Each party for their own delivery |
| Raise dispute | Both parties, on active trades only |
| Resolve dispute | Admin only |
| Suspend/unsuspend user | Admin only |
| Add/edit/deactivate skills | Admin only |
| View admin dashboard | Admin only |

### Trade Data Isolation
- Message threads are only accessible to the two users in that trade.
- Trade agreement snapshots are only visible to both parties and admins.
- Dispute evidence is only visible to the complainant, the other party, and admins.

---

## File Upload Security

- Validate MIME type and file extension server-side before accepting uploads.
- Allowed types: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`, `application/zip`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`.
- Maximum file size enforced before upload: **10MB** for attachments, **5MB** for profile photos.
- Files are uploaded directly to Cloudinary (unsigned preset). Never proxy large files through the Next.js server.
- Cloudinary URLs stored in the DB are the only reference. The original file is not processed server-side.
- Do not serve user-uploaded files from your own domain.

---

## Data Privacy

- **Passwords** are never returned in any API response or logged anywhere.
- **Email addresses** are not exposed on public profiles (only to the user themselves in settings).
- **Session tokens** are stored in HTTP-only, Secure, SameSite=Lax cookies.
- **Sensitive fields** (password_hash, is_suspended, admin_notes, dispute evidence) are never included in public-facing API responses. Use Prisma's `select` or `omit` to exclude them explicitly:
  ```ts
  await db.user.findUnique({
    where: { id },
    select: { id: true, name: true, avatarUrl: true, trustScore: true /* ... */ }
    // Never include: passwordHash, emailVerified (internal), isSuspended
  });
  ```
- **Trade agreement snapshots** are stored as JSONB and are immutable once both parties confirm. Do not allow any update path to this field after confirmation.

---

## Suspended User Handling

When `is_suspended = true`:
- User cannot log in (checked in NextAuth `authorize` callback).
- If a session exists and the user is suspended mid-session, middleware redirects to `/suspended`.
- All active proposals and trades for the suspended user are automatically cancelled.
- Affected counterparties receive notifications.

---

## Admin Security

- Admin role is stored in the `users` table as a boolean `is_admin` field (not a separate roles table for MVP).
- Admin routes are protected in `(admin)/layout.tsx`:
  ```ts
  if (!session?.user?.isAdmin) redirect("/dashboard");
  ```
- Admin API routes (`/api/admin/...`) check `isAdmin` on every request.
- Admin actions (suspension, dispute resolution) are logged with `resolved_by` and `resolved_at` timestamps.
- Admin credentials must use a strong unique password. No shared admin accounts.

---

## Security Headers

Configure in `next.config.ts`:
```ts
headers: [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: "default-src 'self'; img-src 'self' res.cloudinary.com; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  }
]
```

---

## Error Handling (Security Perspective)

- Never expose stack traces, Prisma error messages, or internal paths in API responses.
- Use generic error messages for auth failures: `"Invalid email or password"` — never specify which is wrong.
- All unhandled errors are caught, logged to Sentry, and returned as `500 Internal Server Error` with no detail.
- Cron job endpoints return `401` for missing or invalid `CRON_SECRET` without executing any logic.