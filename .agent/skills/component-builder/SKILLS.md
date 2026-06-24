# Skill: Component Builder

## Purpose

Use this skill whenever you need to build, scaffold, or significantly refactor a UI component in TalentLoop. It ensures every component is consistent with the design system, fully typed, accessible, and handles all required UI states.

---

## When to Use This Skill

- Creating any new component in `components/`
- Rebuilding an existing component from scratch
- Adding a new UI state (loading, empty, error) to a component
- Creating a page-level component that composes smaller ones
- Building form components with React Hook Form + Zod

---

## Pre-Build Checklist

Before writing any code, answer these questions:

1. **Server or Client component?** Default to Server. Use `"use client"` only if the component needs event handlers, hooks, or browser APIs.
2. **Does this component exist in shadcn/ui?** If yes, use it as the base — don't rebuild from scratch.
3. **What props does it need?** Define the `type Props` first, before writing JSX.
4. **What states must it handle?** At minimum: default, loading, empty (if it renders a list), error (if it fetches data).
5. **What is the smallest screen this must work on?** Always 375px. Start mobile, then add responsive classes.

---

## Component File Template

```tsx
// components/[feature]/ComponentName.tsx
"use client" // Only if needed

import { type ComponentProps } from "react";
// ... other imports

// 1. Type your props explicitly
type Props = {
  // required props first
  id: string;
  title: string;
  // optional props last
  className?: string;
  onAction?: (id: string) => void;
};

// 2. Export a named function (not default export)
export function ComponentName({ id, title, className, onAction }: Props) {
  // 3. Early returns for loading/error/empty states

  return (
    <div className={cn("base-classes", className)}>
      {/* content */}
    </div>
  );
}
```

Key rules:
- **Named exports only.** No `export default`.
- **`cn()` utility** (from `@/lib/utils`) for conditional class merging.
- **Never hardcode color hex values** — always reference `var(--tl-*)` from `tokens/design-tokens.css`.

---

## Building Each Component Type

### Match Card

Renders a single user match in the feed.

Required elements:
- Avatar (with initials fallback)
- Name + location
- Reputation level badge (color-coded)
- Skills offered (chip list, max 3 visible + "+N more")
- Match score percentage
- "Propose Trade" button

```tsx
export function MatchCard({ match, onPropose }: MatchCardProps) {
  return (
    <div
      className="rounded-xl p-4 transition-shadow hover:shadow-md"
      style={{
        border: `1px solid var(--tl-color-neutral-variant)`,
        backgroundColor: `var(--tl-color-neutral)`,
      }}
    >
      <div className="flex items-start gap-3">
        <UserAvatar user={match.user} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3
              className="text-base font-semibold truncate"
              style={{ color: `var(--tl-color-neutral-on-neutral)` }}
            >
              {match.user.name}
            </h3>
            <ReputationBadge level={match.user.reputationLevel} />
          </div>
          <p className="text-sm" style={{ color: `var(--tl-color-neutral-variant-on-neutral-variant)` }}>
            {match.user.location}
          </p>
        </div>
      </div>
      <SkillChipList skills={match.user.offeredSkills} maxVisible={3} className="mt-3" />
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm font-medium" style={{ color: `var(--tl-color-primary)` }}>
          {match.score}% match
        </span>
        <Button size="sm" onClick={() => onPropose(match.user.id)}>
          Propose Trade
        </Button>
      </div>
    </div>
  );
}
```

### Trade Status Badge

```tsx
const statusConfig: Record<TradeStatus, { label: string; bg: string; color: string }> = {
  Draft: { label: "Draft", bg: "var(--tl-color-neutral)", color: "var(--tl-color-neutral-variant-on-neutral-variant)" },
  Proposed: { label: "Proposed", bg: "var(--tl-color-primary-primary-container)", color: "var(--tl-color-primary)" },
  Accepted: { label: "Accepted", bg: "var(--tl-color-tertiary-tertiary-container)", color: "var(--tl-color-tertiary)" },
  "In Progress": { label: "In Progress", bg: "var(--tl-color-primary-primary-container)", color: "var(--tl-color-primary)" },
  "Awaiting Confirmation": { label: "Awaiting Confirmation", bg: "var(--tl-color-warning-warning-container)", color: "var(--tl-color-warning)" },
  Completed: { label: "Completed", bg: "var(--tl-color-success-success-container)", color: "var(--tl-color-success)" },
  Disputed: { label: "Disputed", bg: "var(--tl-color-error-error-container)", color: "var(--tl-color-error)" },
  Cancelled: { label: "Cancelled", bg: "var(--tl-color-neutral)", color: "var(--tl-color-neutral-variant)" },
};

export function TradeStatusBadge({ status }: { status: TradeStatus }) {
  const config = statusConfig[status];
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: config.bg, color: config.color }}
    >
      {config.label}
    </span>
  );
}
```

### Form Component Pattern

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  fieldName: z.string().min(1, "This field is required"),
});

type FormValues = z.infer<typeof schema>;

export function ExampleForm({ onSubmit }: { onSubmit: (data: FormValues) => Promise<void> }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label
          htmlFor="fieldName"
          className="block text-sm font-medium"
          style={{ color: "var(--tl-color-neutral-variant-on-neutral-variant)" }}
        >
          Label <span style={{ color: "var(--tl-color-error)" }}>*</span>
        </label>
        <input
          id="fieldName"
          {...register("fieldName")}
          className="mt-1 block w-full h-10 rounded-lg border px-3 text-sm focus:outline-none"
          style={{
            borderColor: "var(--tl-color-neutral-variant)",
            backgroundColor: "var(--tl-color-neutral)",
            color: "var(--tl-color-neutral-on-neutral)",
          }}
        />
        {errors.fieldName && (
          <p className="mt-1 text-sm" style={{ color: "var(--tl-color-error)" }}>
            {errors.fieldName.message}
          </p>
        )}
      </div>
      <Button type="submit" loading={isSubmitting} className="w-full">
        Submit
      </Button>
    </form>
  );
}
```

---

## Loading State Pattern (Skeleton)

Always build a skeleton version of list-item components:

```tsx
export function MatchCardSkeleton() {
  return (
    <div
      className="rounded-xl p-4 animate-pulse"
      style={{
        border: "1px solid var(--tl-color-neutral-variant)",
        backgroundColor: "var(--tl-color-neutral)",
      }}
    >
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-full" style={{ backgroundColor: "var(--tl-color-neutral-variant)" }} />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-1/2 rounded" style={{ backgroundColor: "var(--tl-color-neutral-variant)" }} />
          <div className="h-3 w-1/3 rounded" style={{ backgroundColor: "var(--tl-color-neutral-variant)" }} />
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <div className="h-5 w-16 rounded-full" style={{ backgroundColor: "var(--tl-color-neutral-variant)" }} />
        <div className="h-5 w-20 rounded-full" style={{ backgroundColor: "var(--tl-color-neutral-variant)" }} />
      </div>
      <div className="mt-4 flex justify-between items-center">
        <div className="h-4 w-16 rounded" style={{ backgroundColor: "var(--tl-color-neutral-variant)" }} />
        <div className="h-8 w-24 rounded-lg" style={{ backgroundColor: "var(--tl-color-neutral-variant)" }} />
      </div>
    </div>
  );
}
```

---

## Empty State Pattern

```tsx
import { Users } from "lucide-react";

export function EmptyMatchFeed() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div
        className="h-12 w-12 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: "var(--tl-color-primary-primary-container)" }}
      >
        <Users className="h-6 w-6" style={{ color: "var(--tl-color-primary)" }} />
      </div>
      <h3 className="text-lg font-semibold" style={{ color: "var(--tl-color-neutral-on-neutral)" }}>
        No matches yet
      </h3>
      <p className="mt-2 text-sm max-w-xs" style={{ color: "var(--tl-color-neutral-variant-on-neutral-variant)" }}>
        Add more skills to your profile to get matched with the right people.
      </p>
      <Button variant="outline" className="mt-4" href="/profile">
        Update your skills
      </Button>
    </div>
  );
}
```

---

## Accessibility Checklist

Before marking a component done:

- [ ] All interactive elements are keyboard reachable and operable
- [ ] Focus is visually visible on all focusable elements
- [ ] Images have meaningful `alt` text (or `alt=""` for decorative)
- [ ] Form inputs have associated `<label>` via `htmlFor`/`id`
- [ ] Error messages are linked to inputs via `aria-describedby`
- [ ] Loading states use `aria-busy="true"` on the loading container
- [ ] Dynamic content updates use `aria-live="polite"`
- [ ] Colour alone does not convey state — always pair with text or icon

---

## Post-Build Checklist

- [ ] Component renders correctly at 375px (mobile) width
- [ ] All states handled: default, loading, empty (for lists), error
- [ ] Props are fully typed (no `any`)
- [ ] Exported as named export
- [ ] Imported via `@/components/[feature]/ComponentName`
- [ ] No magic strings or hardcoded hex colors
- [ ] Accessible (keyboard nav + screen reader friendly)