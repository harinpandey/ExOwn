import { PrismaClient as MainPrismaClient } from "@prisma/client";
import { PrismaClient as NewsPrismaClient } from "../src/generated/lpu-news-client";
import { PrismaClient as TicketsPrismaClient } from "../src/generated/tickets-client";

const required = [
  "EXOWN_TEST_DATABASE_URL",
  "LPU_NEWS_TEST_DATABASE_URL",
  "TICKETS_TEST_DATABASE_URL",
] as const;

const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(
    "Section database smoke test blocked. Configure isolated test databases first:",
    missing.join(", ")
  );
  process.exit(1);
}

function fingerprint(value: string) {
  try {
    const url = new URL(value);
    return `${url.hostname.toLowerCase()}${url.pathname.replace(/\/$/, "")}`;
  } catch {
    return value;
  }
}

const testUrls = {
  main: process.env.EXOWN_TEST_DATABASE_URL!,
  news: process.env.LPU_NEWS_TEST_DATABASE_URL!,
  tickets: process.env.TICKETS_TEST_DATABASE_URL!,
};

const productionUrls = {
  main: process.env.DATABASE_URL,
  news: process.env.LPU_NEWS_DATABASE_URL,
  tickets: process.env.TICKETS_DATABASE_URL,
};

for (const key of Object.keys(testUrls) as Array<keyof typeof testUrls>) {
  const production = productionUrls[key];
  if (production && fingerprint(testUrls[key]) === fingerprint(production)) {
    console.error(`Refusing to run: ${key} test database points to the production database.`);
    process.exit(1);
  }
}

const main = new MainPrismaClient({ datasources: { db: { url: testUrls.main } } });
const news = new NewsPrismaClient({ datasources: { db: { url: testUrls.news } } });
const tickets = new TicketsPrismaClient({ datasources: { db: { url: testUrls.tickets } } });

const rollbackMessage = "__EXOWN_SECTION_DB_SMOKE_ROLLBACK__";

async function insertReadRollback(client: any, work: (tx: any) => Promise<void>) {
  try {
    await client.$transaction(async (tx: any) => {
      await work(tx);
      throw new Error(rollbackMessage);
    });
  } catch (error) {
    if (!(error instanceof Error) || error.message !== rollbackMessage) throw error;
  }
}

async function run() {
  await insertReadRollback(main, async (tx) => {
    const campus = await tx.campus.findFirst({
      where: {
        OR: [
          { slug: { contains: "lpu", mode: "insensitive" } },
          { name: { contains: "Lovely Professional University", mode: "insensitive" } },
        ],
      },
    });
    if (!campus) throw new Error("Test database needs the LPU campus seed before housing/roommate tests.");

    const user = await tx.user.create({
      data: {
        email: `section-db-smoke-${Date.now()}@exown.invalid`,
        name: "ExOwn temporary database smoke test",
      },
    });

    const housing = await tx.housingListing.create({
      data: {
        ownerId: user.id,
        campusId: campus.id,
        title: "[SMOKE TEST] Temporary PG listing",
        description: "Temporary test record. This transaction is rolled back.",
        type: "PG",
        status: "PENDING",
        monthlyRent: 1,
        address: "Test-only address",
        maxOccupants: 1,
      },
    });

    const roommate = await tx.roommateProfile.create({
      data: {
        userId: user.id,
        campusId: campus.id,
        bio: "[SMOKE TEST] Temporary roommate profile; transaction is rolled back.",
        status: "DRAFT",
        visibility: "PRIVATE",
      },
    });

    const [housingRead, roommateRead] = await Promise.all([
      tx.housingListing.findUnique({ where: { id: housing.id } }),
      tx.roommateProfile.findUnique({ where: { id: roommate.id } }),
    ]);
    if (!housingRead || !roommateRead) throw new Error("Housing/roommate insert-read check failed.");
  });
  console.log("PASS: main database housing + roommate insert/read (rolled back)");

  await insertReadRollback(news, async (tx) => {
    const slug = `smoke-test-${Date.now()}`;
    const article = await tx.lpuNewsArticle.create({
      data: {
        title: "[SMOKE TEST] Temporary LPU News record",
        slug,
        excerpt: "Temporary database test record; not a real campus announcement.",
        content: "This temporary record verifies LPU News insert/read connectivity and is rolled back.",
        category: "CAMPUS",
        campusSlug: "lpu",
        isPublished: false,
      },
    });
    const readBack = await tx.lpuNewsArticle.findUnique({ where: { id: article.id } });
    if (!readBack || readBack.isPublished) throw new Error("LPU News insert-read check failed.");
  });
  console.log("PASS: LPU News insert/read (rolled back)");

  await insertReadRollback(tickets, async (tx) => {
    const ticket = await tx.ticketListing.create({
      data: {
        sellerUid: "exown-db-smoke-test",
        campusSlug: "lpu",
        category: "TRAIN",
        title: "[SMOKE TEST] Temporary train ticket",
        description: "Temporary database test record; not a real ticket.",
        price: 1,
        status: "PENDING",
        isTestRecord: true,
        origin: "Test origin",
        destination: "Test destination",
      },
    });
    const readBack = await tx.ticketListing.findUnique({ where: { id: ticket.id } });
    if (!readBack || !readBack.isTestRecord || readBack.status !== "PENDING") {
      throw new Error("Ticket insert-read check failed.");
    }
  });
  console.log("PASS: Tickets insert/read (rolled back)");
}

run()
  .catch((error) => {
    console.error("Section database smoke test failed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await Promise.allSettled([main.$disconnect(), news.$disconnect(), tickets.$disconnect()]);
  });
