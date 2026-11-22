-- ExOwn: additive migration for seller-controlled phone sharing and seller reviews
-- Apply to the ExOwn Neon database only after taking a backup.
-- Creates only the two new tables and their indexes/foreign keys.
-- Does not alter or drop existing application data.

CREATE TABLE "PhoneShare" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "PhoneShare_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PhoneShare_productId_buyerId_key"
    ON "PhoneShare"("productId", "buyerId");
CREATE INDEX "PhoneShare_sellerId_buyerId_idx"
    ON "PhoneShare"("sellerId", "buyerId");

ALTER TABLE "PhoneShare"
    ADD CONSTRAINT "PhoneShare_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "Product"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PhoneShare"
    ADD CONSTRAINT "PhoneShare_sellerId_fkey"
    FOREIGN KEY ("sellerId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PhoneShare"
    ADD CONSTRAINT "PhoneShare_buyerId_fkey"
    FOREIGN KEY ("buyerId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "SellerReview" (
    "id" TEXT NOT NULL,
    "transactionRecordId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SellerReview_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SellerReview_transactionRecordId_key"
    ON "SellerReview"("transactionRecordId");
CREATE INDEX "SellerReview_sellerId_createdAt_idx"
    ON "SellerReview"("sellerId", "createdAt");
CREATE INDEX "SellerReview_authorId_idx"
    ON "SellerReview"("authorId");

ALTER TABLE "SellerReview"
    ADD CONSTRAINT "SellerReview_transactionRecordId_fkey"
    FOREIGN KEY ("transactionRecordId") REFERENCES "TransactionRecord"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SellerReview"
    ADD CONSTRAINT "SellerReview_authorId_fkey"
    FOREIGN KEY ("authorId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SellerReview"
    ADD CONSTRAINT "SellerReview_sellerId_fkey"
    FOREIGN KEY ("sellerId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
