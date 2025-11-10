-- Manual User Email Update Script
-- Use this to help individual users update their migrated email addresses

-- USAGE:
-- Replace 'old_username' and 'new_email@example.com' with actual values
-- Run this for users who contact support to update their email

-- Example:
-- UPDATE "User"
-- SET
--   "email" = 'john.doe@example.com',
--   "updatedAt" = CURRENT_TIMESTAMP
-- WHERE "email" = 'johndoe@migrated.local';

-- Step 1: Find the user (SEARCH FIRST)
SELECT
  "id",
  "username",
  "email",
  "name",
  "createdAt"
FROM "User"
WHERE "username" = 'USERNAME_HERE'  -- Replace with actual username
   OR "email" LIKE '%@migrated.local'
LIMIT 10;

-- Step 2: Update email for specific user (AFTER CONFIRMING USER)
-- UPDATE "User"
-- SET
--   "email" = 'NEW_EMAIL_HERE',  -- Replace with actual email
--   "updatedAt" = CURRENT_TIMESTAMP
-- WHERE "id" = 'USER_ID_HERE';  -- Replace with user ID from step 1

-- Step 3: Verify update
-- SELECT "id", "email", "name", "updatedAt"
-- FROM "User"
-- WHERE "id" = 'USER_ID_HERE';

-- Batch update example (if you have a CSV of username -> email mappings)
-- UPDATE "User" u
-- SET
--   "email" = m.new_email,
--   "updatedAt" = CURRENT_TIMESTAMP
-- FROM (VALUES
--   ('username1', 'user1@example.com'),
--   ('username2', 'user2@example.com')
--   -- Add more mappings here
-- ) AS m(username, new_email)
-- WHERE u."username" = m.username;
