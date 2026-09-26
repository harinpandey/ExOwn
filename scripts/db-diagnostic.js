/**
 * ExOwn — Safe Read-Only Database Diagnostic Script
 * 
 * DOES NOT modify any data.
 * Queries information_schema and row counts only.
 * Run with: node scripts/db-diagnostic.js
 */

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const { Client } = require("pg");

const DATABASE_URL = process.env.DATABASE_URL;
const DIRECT_URL = process.env.DIRECT_URL;

if (!DATABASE_URL) {
  console.error("[diagnostic] ERROR: DATABASE_URL is not set. Cannot connect to database.");
  process.exit(1);
}

// Safely extract host/dbname from URL without printing credentials
function safeDbInfo(url) {
  try {
    const u = new URL(url);
    return {
      host: u.hostname,
      port: u.port || "5432",
      database: u.pathname.replace("/", "").split("?")[0],
      hasUser: Boolean(u.username),
      hasPassword: Boolean(u.password),
    };
  } catch {
    return { error: "Could not parse URL" };
  }
}

const dbInfo = safeDbInfo(DATABASE_URL);
const directInfo = DIRECT_URL ? safeDbInfo(DIRECT_URL) : null;

console.log("\n=== DATABASE CONNECTION METADATA (no credentials) ===");
console.log("Provider        : PostgreSQL (Neon)");
console.log("Host            :", dbInfo.host);
console.log("Port            :", dbInfo.port);
console.log("Database name   :", dbInfo.database);
console.log("Has user        :", dbInfo.hasUser);
console.log("Has password    :", dbInfo.hasPassword);

if (directInfo) {
  console.log("\nDIRECT_URL configured:", true);
  console.log("Direct host     :", directInfo.host);
  console.log("Same host?      :", directInfo.host === dbInfo.host);
} else {
  console.log("\nDIRECT_URL configured:", false);
}

// Determine if this looks like a Neon pooled URL
const isPooled = dbInfo.host && (dbInfo.host.includes("-pooler") || DATABASE_URL.includes("pgbouncer=true"));
console.log("Appears pooled  :", isPooled);

// ─── Tables we expect from prisma/schema.prisma ───
const EXPECTED_TABLES = [
  "User", "Profile", "Product", "Category", "Subcategory",
  "Campus", "City", "State", "Country",
  "HousingListing", "RoommateProfile", "RoommateInterest",
  "Rental", "RentalDetail", "Notification", "Message",
  "Order", "OrderItem", "Payment", "Subscription",
  "ExchangeOffer", "Offer", "Report", "Wishlist",
  "Cart", "CartItem", "BuyingRequest", "UserDevice",
  "ListingBoost", "UserActivity", "ActivityLog",
  "TransactionRecord", "ServiceDetail", "QuoteRequest",
  "VerificationRequest", "Ad",
  "_prisma_migrations",  // Migration history table (if ever used)
];

async function main() {
  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  
  try {
    await client.connect();
    console.log("\n=== CONNECTION: SUCCESS ===\n");

    // 1. PostgreSQL version
    const versionRes = await client.query("SELECT version()");
    console.log("PG Version:", versionRes.rows[0].version.split(" ").slice(0, 2).join(" "));

    // 2. Current schema/search_path
    const schemaRes = await client.query("SELECT current_schema()");
    console.log("Current schema:", schemaRes.rows[0].current_schema);

    // 3. Check all tables in the public schema
    const tablesRes = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    const existingTables = new Set(tablesRes.rows.map(r => r.table_name));
    const existingList = [...existingTables].sort();

    console.log("\n=== TABLES IN PRODUCTION DATABASE ===");
    console.log("Total tables found:", existingList.length);
    console.log("Tables:", existingList.join(", "));

    // 4. Compare against expected
    console.log("\n=== SCHEMA DRIFT REPORT ===");

    const missing = EXPECTED_TABLES.filter(t => !existingTables.has(t));
    const extra = existingList.filter(t => !EXPECTED_TABLES.includes(t) && t !== "_prisma_migrations");

    if (missing.length === 0) {
      console.log("MISSING TABLES  : None — all expected tables exist");
    } else {
      console.log("MISSING TABLES  :");
      missing.forEach(t => console.log("  ✗", t));
    }

    if (extra.length > 0) {
      console.log("EXTRA TABLES    :");
      extra.forEach(t => console.log("  +", t));
    } else {
      console.log("EXTRA TABLES    : None");
    }

    // 5. Migration table check
    const hasMigTable = existingTables.has("_prisma_migrations");
    console.log("\n=== MIGRATION HISTORY ===");
    if (hasMigTable) {
      const migRes = await client.query(
        "SELECT migration_name, finished_at, applied_steps_count FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 5"
      );
      console.log("_prisma_migrations exists: YES");
      console.log("Recent migrations:", migRes.rows.length ? JSON.stringify(migRes.rows, null, 2) : "None found");
    } else {
      console.log("_prisma_migrations exists: NO");
      console.log("Conclusion: Schema was applied using `prisma db push` (no migration history)");
    }

    // 6. Row counts — read-only, no data exposed
    console.log("\n=== DATA PRESERVATION COUNTS ===");
    const countTables = [
      "User", "Profile", "Product", "Category", "Campus",
      "HousingListing", "RoommateProfile", "Rental", "Notification",
      "Message", "Order", "Payment",
    ];

    for (const table of countTables) {
      if (existingTables.has(table)) {
        try {
          const r = await client.query(`SELECT COUNT(*) AS cnt FROM "${table}"`);
          console.log(`  ${table.padEnd(20)}: ${r.rows[0].cnt} rows`);
        } catch (e) {
          console.log(`  ${table.padEnd(20)}: ERROR — ${e.message}`);
        }
      } else {
        console.log(`  ${table.padEnd(20)}: TABLE DOES NOT EXIST`);
      }
    }

    // 7. Column-level drift for critical tables (only check if table exists)
    if (existingTables.has("User")) {
      console.log("\n=== COLUMN CHECK: User table ===");
      const colRes = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'User'
        ORDER BY ordinal_position
      `);
      console.log("User columns:", colRes.rows.map(r => r.column_name).join(", "));
    }

    if (existingTables.has("Product")) {
      console.log("\n=== COLUMN CHECK: Product table ===");
      const colRes = await client.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'Product'
        ORDER BY ordinal_position
      `);
      console.log("Product columns:", colRes.rows.map(r => r.column_name).join(", "));
    }

    console.log("\n=== DIAGNOSTIC COMPLETE — NO MODIFICATIONS MADE ===");

  } catch (err) {
    console.error("\n[diagnostic] CONNECTION FAILED:", err.message);
    console.error("[diagnostic] Error code:", err.code);
    if (err.code === "ENOTFOUND") {
      console.error("[diagnostic] DNS resolution failed — host not reachable");
    }
    if (err.message?.includes("SSL")) {
      console.error("[diagnostic] SSL handshake issue");
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
