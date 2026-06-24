# Skill: DB Migration Runner

## Purpose

Use this skill whenever you need to create, modify, or run database migrations for TalentLoop. It ensures all schema changes are safe, reversible where possible, and consistent with the data model defined in the PRD.

---

## When to Use This Skill

- Adding a new table to `prisma/schema.prisma`
- Adding, renaming, or removing a column
- Adding or changing indexes or unique constraints
- Seeding the database with initial data (e.g. Skills Directory)
- Resetting the database in development
- Troubleshooting migration drift

---

## The TalentLoop Data Model at a Glance

All tables and their relationships (reference `.agent/rules/architecture.md` for full column definitions):

```
users
  └── user_skills (user_id FK, skill_id FK) ── skills
  └── trade_proposals (sender_id FK, receiver_id FK)
        └── trades (proposal_id FK, user_a_id FK, user_b_id FK)
              └── messages (trade_id FK, sender_id FK)
              └── reviews (trade_id FK, reviewer_id FK, reviewee_id FK)
              └── disputes (trade_id FK, complainant_id FK, resolved_by FK)
  └── talent_point_transactions (user_id FK, trade_id FK)
  └── notifications (user_id FK)
```

---

## Step 1 — Edit the Prisma Schema

All schema changes go in `prisma/schema.prisma`. Never modify the database directly.

### Full Schema Reference

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // Required for Neon serverless
}

model User {
  id                    String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  email                 String   @unique @db.VarChar(255)
  passwordHash          String   @db.VarChar(255)
  name                  String   @db.VarChar(100)
  avatarUrl             String?
  location              String?  @db.VarChar(100)
  bio                   String?  @db.VarChar(300)
  availability          String?  @db.VarChar(20)
  portfolioUrl1         String?
  portfolioUrl2         String?
  portfolioUrl3         String?
  trustScore            Decimal  @default(0) @db.Decimal(5, 2)
  reputationLevel       String   @default("Beginner") @db.VarChar(20)
  talentPointsBalance   Int      @default(0)
  emailVerified         Boolean  @default(false)
  isSuspended           Boolean  @default(false)
  isAdmin               Boolean  @default(false)
  onboardingComplete    Boolean  @default(false)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  userSkills                UserSkill[]
  sentProposals             TradeProposal[]        @relation("SentProposals")
  receivedProposals         TradeProposal[]        @relation("ReceivedProposals")
  tradesAsUserA             Trade[]                @relation("TradeUserA")
  tradesAsUserB             Trade[]                @relation("TradeUserB")
  sentMessages              Message[]
  reviewsGiven              Review[]               @relation("ReviewsGiven")
  reviewsReceived           Review[]               @relation("ReviewsReceived")
  disputes                  Dispute[]              @relation("DisputeComplainant")
  resolvedDisputes          Dispute[]              @relation("DisputeResolver")
  talentPointTransactions   TalentPointTransaction[]
  notifications             Notification[]

  @@map("users")
}

model Skill {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name        String   @unique @db.VarChar(100)
  category    String   @db.VarChar(50)
  description String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())

  userSkills           UserSkill[]
  senderProposals      TradeProposal[] @relation("SenderSkill")
  receiverProposals    TradeProposal[] @relation("ReceiverSkill")

  @@map("skills")
}

model UserSkill {
  id              String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId          String   @db.Uuid
  skillId         String   @db.Uuid
  type            String   @db.VarChar(10) // "OFFERED" | "NEEDED"
  experienceLevel String?  @db.VarChar(20)
  createdAt       DateTime @default(now())

  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  skill Skill @relation(fields: [skillId], references: [id])

  @@unique([userId, skillId, type])
  @@index([userId])
  @@index([skillId])
  @@map("user_skills")
}

model TradeProposal {
  id                    String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  senderId              String    @db.Uuid
  receiverId            String    @db.Uuid
  senderSkillId         String    @db.Uuid
  receiverSkillId       String    @db.Uuid
  senderDeliverables    String
  receiverDeliverables  String
  timelineDays          Int
  acceptanceDeadline    DateTime
  optionalNote          String?
  status                String    @default("Proposed") @db.VarChar(20)
  parentProposalId      String?   @db.Uuid
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  sender          User          @relation("SentProposals", fields: [senderId], references: [id])
  receiver        User          @relation("ReceivedProposals", fields: [receiverId], references: [id])
  senderSkill     Skill         @relation("SenderSkill", fields: [senderSkillId], references: [id])
  receiverSkill   Skill         @relation("ReceiverSkill", fields: [receiverSkillId], references: [id])
  parentProposal  TradeProposal? @relation("CounterProposals", fields: [parentProposalId], references: [id])
  counterProposals TradeProposal[] @relation("CounterProposals")
  trade           Trade?

  @@map("trade_proposals")
}

model Trade {
  id                        String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  proposalId                String    @unique @db.Uuid
  userAId                   String    @db.Uuid
  userBId                   String    @db.Uuid
  status                    String    @db.VarChar(30)
  agreementSnapshot         Json?
  userAAgreementConfirmed   Boolean   @default(false)
  userBAgreementConfirmed   Boolean   @default(false)
  userADeliveryConfirmed    Boolean   @default(false)
  userBDeliveryConfirmed    Boolean   @default(false)
  deadline                  DateTime?
  completedAt               DateTime?
  createdAt                 DateTime  @default(now())
  updatedAt                 DateTime  @updatedAt

  proposal  TradeProposal @relation(fields: [proposalId], references: [id])
  userA     User          @relation("TradeUserA", fields: [userAId], references: [id])
  userB     User          @relation("TradeUserB", fields: [userBId], references: [id])
  messages  Message[]
  reviews   Review[]
  disputes  Dispute[]
  talentPointTransactions TalentPointTransaction[]

  @@index([status])
  @@map("trades")
}

model Message {
  id             String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tradeId        String   @db.Uuid
  senderId       String   @db.Uuid
  content        String?
  attachmentUrl  String?
  attachmentName String?  @db.VarChar(255)
  isRead         Boolean  @default(false)
  createdAt      DateTime @default(now())

  trade  Trade @relation(fields: [tradeId], references: [id], onDelete: Cascade)
  sender User  @relation(fields: [senderId], references: [id])

  @@index([tradeId])
  @@map("messages")
}

model Review {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tradeId     String   @db.Uuid
  reviewerId  String   @db.Uuid
  revieweeId  String   @db.Uuid
  rating      Int
  reviewText  String?
  isPublished Boolean  @default(false)
  createdAt   DateTime @default(now())

  trade    Trade @relation(fields: [tradeId], references: [id])
  reviewer User  @relation("ReviewsGiven", fields: [reviewerId], references: [id])
  reviewee User  @relation("ReviewsReceived", fields: [revieweeId], references: [id])

  @@unique([tradeId, reviewerId])
  @@map("reviews")
}

model Dispute {
  id            String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tradeId       String    @db.Uuid
  complainantId String    @db.Uuid
  reason        String    @db.VarChar(50)
  reasonDetail  String?
  evidenceUrls  String[]
  status        String    @default("Open") @db.VarChar(20)
  resolution    String?   @db.VarChar(30)
  adminNotes    String?
  resolvedBy    String?   @db.Uuid
  resolvedAt    DateTime?
  createdAt     DateTime  @default(now())

  trade       Trade  @relation(fields: [tradeId], references: [id])
  complainant User   @relation("DisputeComplainant", fields: [complainantId], references: [id])
  resolver    User?  @relation("DisputeResolver", fields: [resolvedBy], references: [id])

  @@map("disputes")
}

model TalentPointTransaction {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId    String   @db.Uuid
  tradeId   String   @db.Uuid
  points    Int
  type      String   @db.VarChar(20) // "earned" | "spent" | "reversed"
  createdAt DateTime @default(now())

  user  User  @relation(fields: [userId], references: [id])
  trade Trade @relation(fields: [tradeId], references: [id])

  @@map("talent_point_transactions")
}

model Notification {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId    String   @db.Uuid
  type      String   @db.VarChar(50)
  title     String   @db.VarChar(100)
  body      String
  link      String?
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("notifications")
}
```

---

## Step 2 — Run the Migration

### Development (safe to use)
```bash
npx prisma migrate dev --name <descriptive-name>
```
- Use descriptive names: `add-user-table`, `add-trade-status-index`, `add-is-admin-to-users`
- This creates a new file in `prisma/migrations/` and applies it.
- Always run this in development before committing.

### Production
```bash
npx prisma migrate deploy
```
- Run as part of your Vercel deployment pipeline (add to `package.json` build script):
  ```json
  "build": "prisma migrate deploy && next build"
  ```
- Never run `migrate dev` in production.

### Reset (development only — destroys all data)
```bash
npx prisma migrate reset
```
⚠️ **Destructive.** Only use in development. Confirm with user before running.

### Generate Prisma Client (after any schema change)
```bash
npx prisma generate
```
Run this if TypeScript types are out of sync with the schema.

---

## Step 3 — Seed the Database

The seed file lives at `prisma/seed.ts`. Run with:
```bash
npx prisma db seed
```

Configure in `package.json`:
```json
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
}
```

### Required Seed Data (Skills Directory)

The Skills Directory must be seeded on first deployment. The seed creates all skills across 9 categories: Design, Development, Marketing, Writing, Business, Legal, Finance, Education, Video Production. Minimum 3–5 skills per category.

```ts
// prisma/seed.ts (partial example)
const skills = [
  { name: "Graphic Design", category: "Design", description: "Visual communication through typography, imagery, and layout." },
  { name: "UI/UX Design", category: "Design", description: "User interface and experience design for digital products." },
  { name: "Web Development", category: "Development", description: "Building websites and web applications." },
  // ... all skills from PRD Section 4.4
];

async function main() {
  for (const skill of skills) {
    await db.skill.upsert({
      where: { name: skill.name },
      update: {},
      create: skill,
    });
  }
}
```

---

## Safety Rules

- **Never run `migrate reset` in production.** It drops all tables and data.
- **Never manually edit migration SQL files** after they have been applied.
- **Always review the generated SQL** before applying in production:
  ```bash
  npx prisma migrate diff --from-schema-datasource prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma --script
  ```
- **Column renames are destructive.** Prisma will drop the old column and create a new one. Use a two-step approach (add new → migrate data → drop old) if data must be preserved.
- **The `agreementSnapshot` JSONB field is immutable** once both trade parties have confirmed. Enforce this in the API layer — never allow an `UPDATE` to this field after confirmation.
- **Foreign key constraints are enforced at the DB level.** Do not remove `onDelete: Cascade` or `Restrict` without understanding the data impact.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `P3006 Migration failed` | Check the SQL output in the error. Likely a constraint violation. Fix data first, then retry. |
| `P1001 Can't reach database` | Check `DATABASE_URL` in `.env.local`. For Neon, ensure `DIRECT_URL` is also set. |
| Types out of sync after schema change | Run `npx prisma generate` |
| Migration drift (prod differs from dev) | Run `npx prisma migrate status` to see which migrations haven't been applied |
| `Unique constraint failed` during seed | Use `upsert` instead of `create` in seed file |