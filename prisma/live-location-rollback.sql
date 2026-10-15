-- EXOWN Live Location Phase 2B: Rollback Script
-- WARNING: USE ONLY IF THE LIVE-LOCATION FEATURE IS BEING REMOVED.
-- This script drops ONLY the live-location table, its constraints, indexes, and enum.
-- It does NOT drop, alter, or modify any existing application tables or data.

-- 1. Drop Table and Constraints
DROP TABLE IF EXISTS "LiveLocationSession" CASCADE;

-- 2. Drop Enum Type
DROP TYPE IF EXISTS "LiveLocationStatus";
