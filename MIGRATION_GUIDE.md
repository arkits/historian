# Better Auth Migration Guide for Production

## Overview

This guide helps you migrate your production database from basic auth (username/password with argon2) to Better Auth while preserving existing user accounts.

## Migration Strategy

The migration is split into two phases:

### Phase 1: Add Better Auth Schema (Run Immediately)
- Adds new Better Auth tables and columns
- Migrates existing user data automatically
- Keeps legacy fields for backwards compatibility

### Phase 2: Cleanup Legacy Fields (Run After User Migration)
- Removes old username/passwordHash fields
- Only run after ALL users have migrated to Better Auth

## Pre-Migration Checklist

- [ ] **Backup your production database**
- [ ] Test migration on staging environment first
- [ ] Ensure Better Auth package is installed (`better-auth@^1.3.34`)
- [ ] Review changes in `apps/backend/src/lib/auth.ts`
- [ ] Update frontend to use Better Auth client

## Step-by-Step Migration

### Step 1: Backup Database

```bash
# PostgreSQL example
pg_dump -h localhost -U your_user -d historian > historian_backup_$(date +%Y%m%d_%H%M%S).sql
```

### Step 2: Apply Phase 1 Migration

```bash
cd apps/backend
npx prisma migrate deploy
```

This migration will:
1. Add Better Auth columns to User table (`name`, `email`, `emailVerified`, etc.)
2. Migrate existing users:
   - `email` = `username@migrated.local`
   - `name` = `username`
3. Create Better Auth tables (Session, Account, Verification)
4. Drop old Session table
5. Keep legacy `username` and `passwordHash` fields (now optional)

### Step 3: Verify Migration

```bash
# Check that users were migrated
psql -d historian -c "SELECT id, username, email, name FROM \"User\" LIMIT 5;"

# Should show users with @migrated.local emails
```

### Step 4: User Migration Process

After deployment, existing users need to migrate to Better Auth:

#### Option A: Forced Password Reset
Send emails to all users asking them to:
1. Visit the password reset page
2. Enter their current username as the email (e.g., `john@migrated.local`)
3. Follow the email link to set a new password
4. Update their email to a valid address in account settings

#### Option B: One-Time Password Migration Script
Create a script to migrate password hashes to Better Auth Account table:

```sql
-- Copy password hashes to Better Auth Account table
INSERT INTO "Account" ("id", "userId", "accountId", "providerId", "password", "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  u."id",
  u."email",
  'credential',
  u."passwordHash",  -- Better Auth uses different hashing, so users must reset
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "User" u
WHERE u."passwordHash" IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM "Account" a
  WHERE a."userId" = u."id" AND a."providerId" = 'credential'
);
```

**Note:** Better Auth uses a different password hashing algorithm. Users will need to reset passwords regardless.

### Step 5: Monitor Migration Progress

```sql
-- Check how many users still have @migrated.local emails
SELECT COUNT(*) as unmigrated_users
FROM "User"
WHERE "email" LIKE '%@migrated.local';

-- Check how many users have Better Auth accounts
SELECT COUNT(*) as migrated_users
FROM "Account"
WHERE "providerId" = 'credential';
```

### Step 6: Update User Emails (Send notification)

Email all users with migration instructions:

```
Subject: Action Required: Update Your Account

We've upgraded our authentication system for better security.

Please:
1. Log in with your username and current password
2. Update your email address in account settings
3. Set a new password (optional but recommended)

If you have trouble logging in, use the password reset feature with your username@migrated.local email.
```

### Step 7: Apply Phase 2 Cleanup (After 100% Migration)

**ONLY run this after verifying all users have migrated:**

```bash
# Verify no users have @migrated.local emails
psql -d historian -c "SELECT COUNT(*) FROM \"User\" WHERE email LIKE '%@migrated.local';"
# Should return 0

# Rename the cleanup migration to apply it
cd apps/backend/prisma/migrations
mv 99999999999999_cleanup_legacy_auth_fields $(date +%Y%m%d%H%M%S)_cleanup_legacy_auth_fields

# Apply cleanup migration
npx prisma migrate deploy
```

## Rollback Procedure

If issues occur during Phase 1 migration:

```bash
# Restore from backup
psql -d historian < historian_backup_YYYYMMDD_HHMMSS.sql

# Revert code changes
git revert <commit-hash>
```

## Troubleshooting

### Users can't log in after migration

**Cause:** Better Auth uses different password hashing than argon2.

**Solution:** Users must use password reset flow to create a new Better Auth password.

### Duplicate email errors

**Cause:** Multiple users with same username.

**Solution:** Before migration, ensure usernames are unique:
```sql
SELECT "username", COUNT(*)
FROM "User"
GROUP BY "username"
HAVING COUNT(*) > 1;
```

### Old sessions don't work

**Cause:** Session table was recreated.

**Solution:** Expected behavior. Users will need to log in again.

## What Changed

### Backend Changes
- ✅ `apps/backend/src/lib/auth.ts` - Better Auth configuration
- ✅ `apps/backend/src/lib/controllers/auth.ts` - Middleware for Better Auth
- ✅ `apps/backend/src/main.ts` - Better Auth route handler
- ❌ Removed: `userSignUp`, `userLogin`, `userLogout` functions

### Frontend Changes
- ✅ `apps/frontend/src/auth-client.ts` - Better Auth React client
- ✅ `apps/frontend/pages/login/index.tsx` - Uses Better Auth signIn
- ✅ `apps/frontend/pages/register/index.tsx` - Uses Better Auth signUp

### Database Changes
- ✅ New tables: `Account`, `Verification`
- ✅ Modified: `Session` table (completely recreated)
- ✅ Modified: `User` table (added Better Auth fields)
- ⏳ Pending: Remove `username`, `passwordHash`, `preferences` (Phase 2)

## Testing

Before deploying to production, test on staging:

```bash
# 1. Create test user with old auth (if possible)
# 2. Run Phase 1 migration
# 3. Verify user can reset password
# 4. Verify user can update email
# 5. Verify new registrations work
# 6. Verify login works with new password
```

## Support

If users encounter issues:
1. Direct them to password reset flow
2. They can use `username@migrated.local` as email
3. After reset, they can update to their real email

## Timeline Recommendation

- **Week 1:** Deploy Phase 1 migration
- **Week 1-4:** Send user migration emails
- **Week 4:** Send final reminder email
- **Week 5:** Verify 100% migration complete
- **Week 6:** Apply Phase 2 cleanup migration

## Security Notes

- Better Auth uses modern password hashing (likely bcrypt or argon2id)
- Sessions are now token-based with better security
- Email verification can be enabled in `apps/backend/src/lib/auth.ts`
- Old password hashes are NOT automatically migrated (security best practice)
