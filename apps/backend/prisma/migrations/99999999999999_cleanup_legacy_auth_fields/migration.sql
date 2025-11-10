-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
-- WARNING: DO NOT RUN THIS MIGRATION UNTIL ALL USERS HAVE MIGRATED
-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
--
-- This migration removes legacy authentication fields from the User table.
-- Before running this migration, ensure:
-- 1. All users have valid email addresses (not @migrated.local)
-- 2. All users have reset their passwords using Better Auth
-- 3. You have a backup of your database
--
-- To verify users are ready:
-- SELECT COUNT(*) FROM "User" WHERE "email" LIKE '%@migrated.local';
-- (This should return 0)
--
-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

-- Remove legacy auth fields
ALTER TABLE "User" DROP COLUMN IF EXISTS "username";
ALTER TABLE "User" DROP COLUMN IF EXISTS "passwordHash";
ALTER TABLE "User" DROP COLUMN IF EXISTS "preferences";
