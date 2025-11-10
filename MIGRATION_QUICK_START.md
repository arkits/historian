# Better Auth Migration - Quick Start

## For Production Deployment

### ⚠️ BEFORE YOU START
1. **BACKUP YOUR DATABASE** - This is critical!
2. Test on staging first
3. Schedule during low-traffic hours

### 🚀 Deployment Steps

```bash
# 1. Backup database
pg_dump -h $DB_HOST -U $DB_USER -d historian > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Deploy code changes
git pull origin master  # or your branch with Better Auth

# 3. Install dependencies
npm install

# 4. Run migration
cd apps/backend
npx prisma migrate deploy

# 5. Restart application
pm2 restart historian-backend  # or your process manager
```

### 📊 Monitor Migration

```bash
# Check migration status
psql -d historian -f apps/backend/scripts/check-migration-status.sql
```

### 👥 What Happens to Existing Users

**Immediately after migration:**
- ✅ User accounts preserved
- ✅ History data intact
- ❌ Old sessions invalidated (users must login again)
- 📧 Email set to: `username@migrated.local`

**Users need to:**
1. Login with existing username and password (may fail due to different hashing)
2. If login fails, use "Forgot Password" with `username@migrated.local`
3. Set new password via email link
4. Update email to real address in account settings

### 📧 User Communication Template

**Subject:** System Upgrade - Please Update Your Account

```
Hi,

We've upgraded our authentication system for improved security.

ACTION REQUIRED:
1. Try logging in with your current credentials
2. If that doesn't work, click "Forgot Password"
3. Use your-username@migrated.local as the email
4. Check your email for password reset link
5. After logging in, update your email in account settings

Questions? Reply to this email.
```

### 🔍 Verify Migration Success

```sql
-- All these should pass:

-- 1. Check users migrated
SELECT COUNT(*) FROM "User" WHERE email IS NOT NULL;

-- 2. Check Better Auth tables exist
SELECT COUNT(*) FROM "Account";
SELECT COUNT(*) FROM "Verification";

-- 3. Check Session table recreated
SELECT COUNT(*) FROM "Session";
```

### ❌ Rollback (If Needed)

```bash
# Restore database backup
psql -d historian < backup_YYYYMMDD_HHMMSS.sql

# Revert code
git revert HEAD
npm install
pm2 restart historian-backend
```

### ⏱️ Timeline

- **Day 0:** Deploy migration
- **Day 1-7:** Monitor user logins, assist with issues
- **Day 7-30:** Users gradually migrate to Better Auth
- **Day 30+:** Check if ready for Phase 2 cleanup
- **Day 60:** Run Phase 2 cleanup (remove legacy fields)

### 🆘 Common Issues

**Issue:** User can't login with old password
**Fix:** Direct to password reset flow

**Issue:** Duplicate email error
**Fix:** Each user must have unique username (check before migration)

**Issue:** Session expired immediately
**Fix:** Expected - Session table was recreated. Users login again.

### 📈 Success Metrics

Track these to know when Phase 2 cleanup is safe:

```sql
-- Should reach 0 before Phase 2
SELECT COUNT(*) FROM "User" WHERE email LIKE '%@migrated.local';

-- Should match total users
SELECT COUNT(*) FROM "Account" WHERE "providerId" = 'credential';
```

### ✅ Phase 2 Cleanup (Run Later)

**ONLY when the above query returns 0:**

```bash
# Rename cleanup migration
cd apps/backend/prisma/migrations
mv 99999999999999_cleanup_legacy_auth_fields $(date +%Y%m%d%H%M%S)_cleanup_legacy_auth_fields

# Deploy
npx prisma migrate deploy
```

### 📚 Full Documentation

See `MIGRATION_GUIDE.md` for complete details.
