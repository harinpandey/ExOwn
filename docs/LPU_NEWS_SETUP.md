# LPU News module setup

LPU News is intentionally isolated from the ExOwn marketplace database. It uses its own PostgreSQL database and a separate Prisma schema/client.

## 1. Create the News database

Create a separate Neon PostgreSQL project or database for LPU News. Do not reuse the ExOwn marketplace database URL.

Keep two connection strings where your provider supports them:

- `LPU_NEWS_DATABASE_URL`: pooled/runtime connection.
- `LPU_NEWS_DIRECT_URL`: direct/unpooled connection used by Prisma schema operations.

## 2. Configure environment variables

Add both variables to your local `.env` and to the ExOwn Vercel project for Development, Preview and Production.

```env
LPU_NEWS_DATABASE_URL="postgresql://.../lpu_news?sslmode=require"
LPU_NEWS_DIRECT_URL="postgresql://.../lpu_news?sslmode=require"
```

The two values must point to the dedicated LPU News database, not the marketplace database. Never commit real credentials.

The app can build before the News database is ready. In that case the LPU News pages show a setup state and the admin publish form remains disabled.

## 3. Create the News table

After the real connection strings are present locally, run:

```bash
npm install
npm run db:news:generate
npm run db:news:push
```

The News schema lives at `prisma/lpu-news/schema.prisma`; it creates the `LpuNewsArticle` table independently of the main `prisma/schema.prisma`.

## 4. Publish campus updates

Sign in with an ExOwn administrator account and open:

`/admin/lpu-news`

Add a headline, summary, full text and category. Drafts can be saved without a source. To publish immediately, provide both a source name and a valid HTTP/HTTPS source URL. The public feed only displays published records.

Public pages:

- `/lpu-news` — latest LPU updates and category filters.
- `/lpu-news/[slug]` — individual news article.
- Homepage — latest LPU News preview.

## 5. Current module boundaries

| Module | Data source / status |
|---|---|
| Marketplace | Existing ExOwn PostgreSQL database |
| Goods rentals | Existing ExOwn product/rental tables |
| PG & housing | Existing ExOwn housing tables |
| Roommates | Existing ExOwn roommate profile tables |
| LPU News | New, independent PostgreSQL database |
| Travel & tickets | Separate travel inventory/booking integration is planned; no live availability or ticket sales yet |

Travel/ticket inventory is not mixed with marketplace products. The current Travel page is a labelled placeholder until a dedicated provider, data source and booking flow are selected.
