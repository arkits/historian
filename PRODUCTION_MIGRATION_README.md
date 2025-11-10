# Production Migration: Basic Auth → Better Auth

## 📦 What's Included

This migration package includes everything you need to safely migrate your production database from basic auth to Better Auth while preserving all existing user accounts.

### Migration Files

1. **`apps/backend/prisma/migrations/20251103163711_migrate_to_better_auth/migration.sql`**
   - Phase 1 migration (run immediately after deployment)
   - Adds Better Auth schema
   - Migrates existing users automatically
   - Safe to run - preserves all data

2. **`apps/backend/prisma/migrations/99999999999999_cleanup_legacy_auth_fields/migration.sql`**
   - Phase 2 cleanup (run after all users migrated)
   - Removes legacy fields (username, passwordHash, preferences)
   - ⚠️ Do NOT run until migration is 100% complete

### Documentation

- **`MIGRATION_QUICK_START.md`** - Quick deployment guide (START HERE)
- **`MIGRATION_GUIDE.md`** - Complete detailed documentation
- **`apps/backend/scripts/check-migration-status.sql`** - Monitor migration progress
- **`apps/backend/scripts/migrate-user-email.sql`** - Help users update emails

## 🚀 Quick Start

### 1. Read This First
```bash
cat MIGRATION_QUICK_START.md
```

### 2. Backup Database
```bash
pg_dump -h $DB_HOST -U $DB_USER -d historian > backup_$(date +%Y%m%d).sql
```

### 3. Deploy
```bash
git pull
npm install
cd apps/backend
npx prisma migrate deploy
```

### 4. Monitor
```bash
psql -d historian -f apps/backend/scripts/check-migration-status.sql
```

## 📋 Migration Checklist

### Pre-Deployment
- [ ] Read `MIGRATION_GUIDE.md`
- [ ] Test migration on staging environment
- [ ] Backup production database
- [ ] Schedule deployment during low-traffic period
- [ ] Prepare user communication email

### Deployment
- [ ] Deploy code with Better Auth
- [ ] Run `npx prisma migrate deploy`
- [ ] Verify migration succeeded
- [ ] Send user notification emails
- [ ] Monitor error logs

### Post-Deployment (Weeks 1-4)
- [ ] Monitor user logins
- [ ] Assist users with password resets
- [ ] Run status checks weekly
- [ ] Track migration progress

### Cleanup (Week 5+)
- [ ] Verify 100% users migrated
- [ ] Run Phase 2 cleanup migration
- [ ] Remove TODO from schema.prisma

## 📊 What Happens to Users

### Existing Users (Before Migration)
```
username: "johndoe"
passwordHash: "$argon2id$v=19$m=65536..."
```

### After Phase 1 Migration
```
username: "johndoe"           (preserved)
passwordHash: "$argon2id..."  (preserved)
email: "johndoe@migrated.local"  (auto-generated)
name: "johndoe"               (copied from username)
```

### After User Updates Account
```
email: "john@example.com"     (user updated)
name: "John Doe"              (user updated)
Account: [Better Auth password hash]
```

### After Phase 2 Cleanup
```
email: "john@example.com"
name: "John Doe"
username: [REMOVED]
passwordHash: [REMOVED]
```

## 🔍 Key Features

### Data Safety
- ✅ Zero data loss - all users preserved
- ✅ Zero downtime - migration runs in seconds
- ✅ Reversible - can rollback if needed
- ✅ Legacy fields kept during transition

### User Experience
- ✅ Existing users can reset password
- ✅ New users use Better Auth immediately
- ✅ Gradual migration (no forced cutoff)
- ✅ Clear instructions for users

### Better Auth Benefits
- ✅ Modern authentication framework
- ✅ Better security (session tokens)
- ✅ Email verification support
- ✅ OAuth provider support
- ✅ Active maintenance and updates

## ⚠️ Important Notes

### DO
- ✅ Backup database before migration
- ✅ Test on staging first
- ✅ Monitor migration progress
- ✅ Communicate with users
- ✅ Wait for 100% migration before Phase 2

### DON'T
- ❌ Skip the backup step
- ❌ Run Phase 2 before users migrate
- ❌ Modify migration files
- ❌ Deploy during peak hours
- ❌ Force users to migrate immediately

## 📈 Success Metrics

Track these to know when migration is complete:

```sql
-- Should decrease to 0
SELECT COUNT(*) FROM "User" WHERE email LIKE '%@migrated.local';

-- Should increase to match total users
SELECT COUNT(*) FROM "Account" WHERE "providerId" = 'credential';

-- Should equal 0 before Phase 2
SELECT COUNT(*) FROM "User"
WHERE email LIKE '%@migrated.local' OR "passwordHash" IS NOT NULL;
```

## 🆘 Support

### Common Issues

**"I can't log in"**
→ Use password reset with `username@migrated.local`

**"Migration failed"**
→ Check error logs, may need to rollback

**"Users complaining about emails"**
→ Normal - they need to update in settings

### Rollback Procedure

```bash
# Restore database
psql -d historian < backup_YYYYMMDD.sql

# Revert code
git revert HEAD
npm install
# Restart application
```

## 📚 Additional Resources

- **Better Auth Docs**: https://www.better-auth.com/docs
- **Prisma Migrations**: https://www.prisma.io/docs/concepts/components/prisma-migrate

## 🎯 Timeline

- **Week 0:** Deploy Phase 1 migration
- **Week 1-4:** User migration period
- **Week 5:** Verify completion
- **Week 6+:** Run Phase 2 cleanup

## ✅ Final Checklist Before Phase 2

Run this query - should return 0:
```sql
SELECT COUNT(*) FROM "User" WHERE email LIKE '%@migrated.local';
```

If it returns 0, you're ready for Phase 2!

---

**Questions?** See `MIGRATION_GUIDE.md` for detailed documentation.
