---
trigger: always_on
---

# Code Style Rules — TalentLoop MVP

## TypeScript

- **Strict mode is on.** `tsconfig.json` must include `"strict": true`. Never disable it.
- No `any`. Use `unknown` for truly unknown types and narrow them explicitly.
- No `as` type assertions unless absolutely unavoidable — and never to silence an error.
- Prefer `type` for object shapes and unions. Use `interface` only when you need `extends` or declaration merging.
- All function parameters and return types are explicitly typed.
- Use `satisfies` over `as` when matching a type against a schema.
- Enums are not used. Use `const` objects with `as const` and derive the union type:
  ```ts
  export const TradeStatus = {
    DRAFT: "Draft",
    PROPOSED: "Proposed",
    ACCEPTED: "Accepted",
    IN_PROGRESS: "In Progress",
    AWAITING_CONFIRMATION: "Awaiting Confirmation",
    COMPLETED: "Completed",
    DISPUTED: "Disputed",
    CANCELLED: "Cancelled",
  } as const;
  export type TradeStatus = (typeof TradeStatus)[keyof typeof TradeStatus];
  ```

## Naming Conventions

| Entity | Convention | Example |
|--------|-----------|---------|
| Files (components) | PascalCase | `TradeCard.tsx` |
| Files (utilities) | kebab-case | `trust-score.ts` |
| React components | PascalCase | `MatchFeed` |
| Functions | camelCase | `calculateMatchScore` |
| Variables | camelCase | `tradeProposal` |
| Constants | UPPER_SNAKE_CASE | `MAX_PROPOSAL_DAYS` |
| Types / Interfaces | PascalCase | `TradeProposal` |
| Database columns | snake_case (Prisma maps to camelCase) | `created_at` → `createdAt` |
| API route segments | kebab-case | `/api/trade-proposals/`, `/api/proposals/` |
| CSS classes | Tailwind utility classes only | `text-sm font-medium` |

## React Component Rules

- Functional components only. No class components.
- One component per file. File name matches component name.
- Props are typed with explicit `type Props = { ... }` above the component.
- Destructure props in the function signature.
- Keep components small. If a component exceeds ~150 lines, split it.
- Extract repeated JSX into sub-components. Extract repeated logic into hooks.
- No inline functions in JSX for expensive operations — memoize with `useCallback`.
- `"use client"` goes at the very top of the file, before imports.
- Use the `cn()` utility (`@/lib/utils.ts`) for conditional class merging with Tailwind.

```tsx
// Good
type Props = {
  trade: Trade;
  onConfirm: (id: string) => void;
};

export function TradeCard({ trade, onConfirm }: Props) {
  return (
    <div className="rounded-lg border p-4">
      {/* ... */}
    </div>
  );
}
```

## Server vs Client Components

- Default to **Server Components**. Add `"use client"` only for:
  - Event handlers (onClick, onChange, onSubmit)
  - React hooks (useState, useEffect, useCallback, etc.)
  - Browser-only APIs (localStorage, window, etc.)
  - Real-time polling
- Never fetch data in Client Components if it can be done in a Server Component.
- Pass data down from Server Components to Client Components as props.

## Forms

- All forms use **React Hook Form** + **Zod**.
- Zod schemas live in `lib/validations/[domain].ts`.
- Use `zodResolver` from `@hookform/resolvers/zod`.
- Inline validation errors are shown per field on blur and on submit attempt.
- Submit buttons show a loading spinner during async submission.
- Forms are reset to clean state after successful submission.

```ts
// lib/validations/proposal.ts
export const createProposalSchema = z.object({
  senderSkillId: z.string().uuid(),
  receiverSkillId: z.string().uuid(),
  senderDeliverables: z.string().min(10).max(500),
  receiverDeliverables: z.string().min(10).max(500),
  timelineDays: z.number().int().min(1).max(90),
  acceptanceDeadline: z.date().min(new Date()),
  optionalNote: z.string().max(300).optional(),
});
```

## API Routes

- Route handlers export named functions: `GET`, `POST`, `PATCH`, `DELETE`.
- Always validate the session before any database operation.
- Parse and validate the request body with a Zod schema before use.
- Return consistent envelopes:
  ```ts
  return NextResponse.json({ success: true, data: result });
  return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  ```
- Never leak Prisma error details to the response. Log internally, return generic message.

## Error Handling

- Use try/catch in all async functions.
- Server-side errors are logged to Sentry: `Sentry.captureException(error)`.
- Client-side async errors surface as toast notifications (not console.error only).
- Form submission errors display inline, not as alerts.
- Loading, empty, and error states are required for every list view.

## Imports

- Absolute imports using `@/` alias (configured in `tsconfig.json`).
- Import order (enforced via ESLint): React → Next.js → third-party → internal (`@/`) → relative.
- No barrel files (`index.ts` re-exporting everything) except in `types/` and `lib/validations/`.

## Comments & Documentation

- Code should be self-documenting through naming. Avoid obvious comments.
- JSDoc comments on all exported utility functions:
  ```ts
  /**
   * Calculates the match score between two users.
   * @returns A score between 0 and 1
   */
  ```
- Complex business logic (matching algorithm, trust score) must have an inline comment explaining the formula.
- TODO comments include a ticket or issue reference: `// TODO: [TRADE-42] Replace polling with WebSockets in Phase 2`

## Testing

- Unit tests for: matching algorithm, trust score calculation, Zod schemas, utility functions.
- Integration tests for: critical API routes (auth, proposals, trades, disputes).
- Use **Vitest** for unit tests and **Playwright** for E2E (deferred to post-MVP).
- Test files are co-located with the module: `lib/matching.test.ts`.
- Test naming: `describe("calculateMatchScore") → it("returns 0 when no skills overlap")`.
- Minimum coverage targets for MVP: 80% on `lib/` utilities.

## Linting & Formatting

- **ESLint** with `eslint-config-next` + custom rules.
- **Prettier** for formatting. Config in `.prettierrc`.
- Husky pre-commit hook runs `lint-staged` (ESLint + Prettier on staged files).
- No code is merged with linting errors. Warnings are reviewed before PR merge.

## Constants & Magic Numbers

- No magic numbers or strings in component or logic code.
- All constants live in `lib/constants.ts`:
  ```ts
  export const MAX_SKILLS_PER_USER = 5;
  export const PROPOSAL_EXPIRY_DAYS = 7;
  export const REVIEW_WINDOW_HOURS = 72;
  export const MATCH_FEED_PAGE_SIZE = 20;
  export const PASSWORD_MIN_LENGTH = 8;
  export const MAX_ATTACHMENT_SIZE_MB = 10;
  export const MAX_MESSAGE_LENGTH = 1000;
  export const TRUST_SCORE_NORMALISATION_TRADES = 20;
  ```