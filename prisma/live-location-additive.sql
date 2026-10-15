-- EXOWN Live Location Phase 2B: Additive Production Migration
-- This script creates ONLY the new live-location objects.
-- It does NOT alter, modify, drop, or lock any existing application tables.

-- 1. Create Enum
CREATE TYPE "LiveLocationStatus" AS ENUM ('ACTIVE', 'STOPPED', 'EXPIRED');

-- 2. Create LiveLocationSession Table
CREATE TABLE "LiveLocationSession" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "stoppedAt" TIMESTAMP(3),
    "status" "LiveLocationStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "LiveLocationSession_pkey" PRIMARY KEY ("id")
);

-- 3. Create Indexes
CREATE INDEX "LiveLocationSession_conversationId_status_idx" ON "LiveLocationSession"("conversationId", "status");
CREATE INDEX "LiveLocationSession_sellerId_status_idx" ON "LiveLocationSession"("sellerId", "status");
CREATE INDEX "LiveLocationSession_buyerId_status_idx" ON "LiveLocationSession"("buyerId", "status");
CREATE INDEX "LiveLocationSession_productId_status_idx" ON "LiveLocationSession"("productId", "status");

-- 4. Add Foreign Keys (pointing to existing User and Product tables)
ALTER TABLE "LiveLocationSession"
    ADD CONSTRAINT "LiveLocationSession_sellerId_fkey"
    FOREIGN KEY ("sellerId") REFERENCES "User"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "LiveLocationSession"
    ADD CONSTRAINT "LiveLocationSession_buyerId_fkey"
    FOREIGN KEY ("buyerId") REFERENCES "User"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "LiveLocationSession"
    ADD CONSTRAINT "LiveLocationSession_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "Product"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
