---
name: postgresql-drizzle
description: Use when working with PostgreSQL database, writing queries, defining schemas, running migrations, or using Drizzle ORM. Activate for any database-related task: table definitions, relations, queries, indexes, or DB setup.
---

## PostgreSQL + Drizzle ORM in this project

Drizzle ORM provides a typesafe query builder with schema-as-code and automatic migrations.

## Schema definition

```ts
// src/db/schema.ts
import { pgTable, serial, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const users = pgTable('users', {
  id:        serial('id').primaryKey(),
  email:     text('email').notNull().unique(),
  name:      text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const projects = pgTable('projects', {
  id:      serial('id').primaryKey(),
  name:    text('name').notNull(),
  userId:  integer('user_id').notNull().references(() => users.id),
})

export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
}))
```

## DB client setup

```ts
// src/db/index.ts
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
export const db = drizzle(pool, { schema })
```

## Querying

```ts
import { db } from '@/db'
import { users, projects } from '@/db/schema'
import { eq, and, desc } from 'drizzle-orm'

// Select
const user = await db.query.users.findFirst({ where: eq(users.id, 1) })

// Insert
const [newUser] = await db.insert(users).values({ email, name }).returning()

// Update
await db.update(users).set({ name: 'New Name' }).where(eq(users.id, 1))

// Delete
await db.delete(users).where(eq(users.id, 1))

// Join via relations
const userWithProjects = await db.query.users.findFirst({
  where: eq(users.id, 1),
  with: { projects: true },
})
```

## Migrations

```bash
# Generate migration after schema changes
npx drizzle-kit generate:pg

# Apply migrations
npx drizzle-kit push:pg
```

Config in `drizzle.config.ts`:
```ts
export default { schema: './src/db/schema.ts', out: './drizzle', driver: 'pg' }
```

## Gotchas

- `DATABASE_URL` must be in env — format: `postgresql://user:pass@localhost:5435/dbname`
- Always call `.returning()` after insert/update to get the affected row back.
- Use `drizzle-kit push:pg` only in dev — use proper migration files (`generate` + `migrate`) in production.
- Relations in Drizzle are query-time only — they don't create DB foreign keys unless you use `.references()` on the column.
