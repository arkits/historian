-- Migration Status Check Script
-- Run this to monitor your Better Auth migration progress

-- 1. Total users in system
SELECT 'Total Users' as metric, COUNT(*) as count
FROM "User";

-- 2. Users still with @migrated.local emails (need to update email)
SELECT 'Users with temp emails' as metric, COUNT(*) as count
FROM "User"
WHERE "email" LIKE '%@migrated.local';

-- 3. Users with valid emails
SELECT 'Users with valid emails' as metric, COUNT(*) as count
FROM "User"
WHERE "email" NOT LIKE '%@migrated.local' AND "email" != '';

-- 4. Users with Better Auth accounts (have set new password)
SELECT 'Users with Better Auth accounts' as metric, COUNT(*) as count
FROM "Account"
WHERE "providerId" = 'credential';

-- 5. Users still with only legacy password
SELECT 'Users with only legacy password' as metric, COUNT(*) as count
FROM "User" u
WHERE u."passwordHash" IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM "Account" a
  WHERE a."userId" = u."id" AND a."providerId" = 'credential'
);

-- 6. Active sessions
SELECT 'Active sessions' as metric, COUNT(*) as count
FROM "Session"
WHERE "expiresAt" > CURRENT_TIMESTAMP;

-- 7. Recent registrations (last 7 days)
SELECT 'New users (last 7 days)' as metric, COUNT(*) as count
FROM "User"
WHERE "createdAt" > CURRENT_TIMESTAMP - INTERVAL '7 days';

-- 8. Sample of users needing migration
SELECT
  'Sample unmigrated users' as info,
  "username" as old_username,
  "email" as current_email,
  "name",
  "createdAt"
FROM "User"
WHERE "email" LIKE '%@migrated.local'
LIMIT 5;

-- 9. Check if ready for Phase 2 cleanup
SELECT
  CASE
    WHEN COUNT(*) = 0 THEN '✅ READY for Phase 2 cleanup migration'
    ELSE '❌ NOT READY - ' || COUNT(*) || ' users still need to migrate'
  END as phase_2_status
FROM "User"
WHERE "email" LIKE '%@migrated.local' OR "passwordHash" IS NOT NULL;
