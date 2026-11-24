# ExOwn section databases

## Runtime databases

- **Main ExOwn PostgreSQL** (`DATABASE_URL`, `DIRECT_URL`): marketplace data and Housing + Roommates models (`HousingListing`, `RoommateProfile`, `RoommateInterest`).
- **LPU News PostgreSQL** (`LPU_NEWS_DATABASE_URL`, `LPU_NEWS_DIRECT_URL`): independent `LpuNewsArticle` records.
- **Tickets PostgreSQL** (`TICKETS_DATABASE_URL`, `TICKETS_DIRECT_URL`): independent `TicketListing` records. Schema: `prisma/tickets/schema.prisma`.

Housing and Roommates currently share the main ExOwn database; they are separate domain tables, not separate database instances. Tickets and LPU News are intended to be isolated from the main marketplace.

## Setup

Set database connection variables in local development and in the correct Vercel environment (Preview and Production separately). Do not copy production connection strings into Preview. Generate and apply each independent schema only to its intended database:

```bash
npm run db:news:generate
npm run db:news:push
npm run db:tickets:generate
npm run db:tickets:push
```

The main schema is generated with `npm run db:generate:main`; apply it only to the intended database using the existing Prisma workflow.

## Safe insert/read smoke test

Configure three isolated test databases: `EXOWN_TEST_DATABASE_URL`, `LPU_NEWS_TEST_DATABASE_URL`, and `TICKETS_TEST_DATABASE_URL`. Prepare them with their corresponding schemas and seed the LPU campus in the main test database. Then run:

```bash
npm run db:sections:smoke
```

The smoke test creates a temporary Housing listing, Roommate profile, LPU News article, and Ticket listing; reads each back; and rolls each transaction back. It refuses to run when a required test connection is missing or when a test URL points to the configured production database. It never falls back to production connection variables.

Test records are non-public: Housing is `PENDING`, Roommates is `DRAFT`, News is unpublished, and Tickets is `PENDING` with `isTestRecord=true`.
