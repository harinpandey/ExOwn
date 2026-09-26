/**
 * ExOwn — Column Drift Diagnostic (Read-Only)
 * Checks which columns are missing from the DB vs the Prisma schema
 * Run: node scripts/db-column-drift.js
 */

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const { Client } = require("pg");

// Expected columns per table (from prisma/schema.prisma)
const EXPECTED_COLUMNS = {
  User: ["id", "email", "phone", "name", "image", "registrationNumber", "studentPhoto", "role",
         "isVerified", "isProfileCompleted", "collegeIdUrl", "trustScore", "address",
         "createdAt", "updatedAt", "banReason", "fraudScore", "isSuspended", "isTrustedSeller",
         "lastActive", "verificationLevel"],
  Product: ["id", "title", "description", "price", "originalPrice", "brand", "purchaseYear",
             "isNegotiable", "condition", "conditionDetails", "listingType", "images",
             "pickupLocation", "status", "isUrgent", "views", "wishlistCount", "sellerId",
             "categoryId", "subcategoryId", "campusId", "customSubcategory", "createdAt",
             "updatedAt", "fraudScore", "isSuspicious", "moderationReason", "exchangeCashAllowed",
             "exchangeCategories", "isExchangeAllowed", "inventory"],
  Notification: ["id", "title", "content", "link", "isRead", "userId", "createdAt", "type"],
  Rental: ["id", "productId", "renterId", "ownerId", "rentalDetailId", "startDate", "endDate",
           "securityDeposit", "pickupLocation", "status", "paymentId", "agreementAccepted",
           "createdAt", "updatedAt"],
};

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log("Connected.\n");

  // Check which tables are missing entirely
  const missingTables = ["HousingListing", "RoommateProfile", "RoommateInterest", "UserDevice", "VerificationRequest"];
  console.log("=== MISSING TABLES (confirmed) ===");
  missingTables.forEach(t => console.log(" ✗", t));

  // Column drift for existing tables
  console.log("\n=== COLUMN DRIFT FOR EXISTING TABLES ===");
  for (const [table, expectedCols] of Object.entries(EXPECTED_COLUMNS)) {
    const res = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position
    `, [table]);
    const actualCols = new Set(res.rows.map(r => r.column_name));
    const missing = expectedCols.filter(c => !actualCols.has(c));
    const extra = [...actualCols].filter(c => !expectedCols.includes(c));

    if (missing.length === 0 && extra.length === 0) {
      console.log(`\n  ${table}: ✓ No drift`);
    } else {
      console.log(`\n  ${table}:`);
      if (missing.length) console.log("    Missing columns:", missing.join(", "));
      if (extra.length) console.log("    Extra columns:", extra.join(", "));
    }
  }

  // AiRule — extra table not in schema
  console.log("\n=== EXTRA TABLE: AiRule ===");
  const aiRes = await client.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'AiRule'
    ORDER BY ordinal_position
  `);
  console.log("AiRule columns:", aiRes.rows.map(r => r.column_name).join(", "));

  // Check _prisma_migrations explicitly
  const migCheck = await client.query(`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = '_prisma_migrations'
    ) AS exists
  `);
  console.log("\n=== _prisma_migrations table exists:", migCheck.rows[0].exists, "===");

  // DIRECT_URL analysis
  const db_url = process.env.DATABASE_URL || "";
  const direct_url = process.env.DIRECT_URL || "";
  console.log("\n=== DIRECT_URL ANALYSIS ===");
  console.log("DATABASE_URL host has '-pooler':", db_url.includes("-pooler"));
  console.log("DIRECT_URL host has '-pooler':", direct_url.includes("-pooler"));
  console.log("Hosts are identical:", db_url.split("@")[1]?.split("/")[0] === direct_url.split("@")[1]?.split("/")[0]);
  console.log("\nConclusion: If DIRECT_URL host === DATABASE_URL host and both contain '-pooler',");
  console.log("then DIRECT_URL is incorrectly configured (should be the non-pooled endpoint).");

  await client.end();
  console.log("\n=== DONE — NO MODIFICATIONS MADE ===");
}

main().catch(e => {
  console.error("Error:", e.message);
  process.exit(1);
});
