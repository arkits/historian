# Testing Plan for Historian

## Overview

Comprehensive testing strategy for the Historian application to ensure reliability, security, and correctness across all critical components.

## Current State

- **Test Framework**: Vitest v3
- **Test Locations**: `tests/` directory
- **Existing Tests**:
  - `tests/auth.test.ts` - Authentication integration tests (5 tests)
  - `tests/dev-server.test.ts` - HTTP endpoint tests (9 tests)
- **Missing**: Unit tests, tRPC procedure tests, utility tests, extension tests

## Priority Levels

| Priority | Description                                              |
| -------- | -------------------------------------------------------- |
| **P0**   | Authentication, data access control, API key security    |
| **P1**   | Core business logic, tRPC procedures, history operations |
| **P2**   | Utility functions, edge cases, error handling            |
| **P3**   | UI components, extension code                            |

---

## P0: Critical Security & Auth Tests

### Authentication Flow Tests (`tests/unit/server/auth.test.ts`)

| Test                                     | Description               | Expected Result                |
| ---------------------------------------- | ------------------------- | ------------------------------ |
| `signUp_validInput_createsUser`          | Valid email/password/name | User created, session returned |
| `signUp_duplicateEmail_fails`            | Already registered email  | Error: email exists            |
| `signUp_invalidEmail_fails`              | Malformed email address   | Validation error               |
| `signUp_shortPassword_fails`             | Password < 8 characters   | Validation error               |
| `signIn_validCredentials_returnsSession` | Correct email/password    | Session token returned         |
| `signIn_invalidPassword_fails`           | Wrong password            | 401 Unauthorized               |
| `session_validToken_returnsUser`         | Valid bearer token        | User object returned           |
| `session_invalidToken_fails`             | Invalid/expired token     | 401 Unauthorized               |

### API Key Authentication Tests (`tests/unit/server/api-key.test.ts`)

| Test                                          | Description            | Expected Result              |
| --------------------------------------------- | ---------------------- | ---------------------------- |
| `createApiKey_returnsKey`                     | Create new API key     | Key object with hashed value |
| `authenticateRequest_validKey_returnsUserId`  | Valid X-API-Key header | User ID                      |
| `authenticateRequest_invalidKey_returnsNull`  | Invalid/expired key    | null                         |
| `authenticateRequest_inactiveKey_returnsNull` | Deactivated key        | null                         |
| `authenticateRequest_missingKey_returnsNull`  | No API key header      | null                         |

---

## P1: Core Business Logic Tests

### tRPC Router Tests (`tests/unit/server/router.test.ts`)

#### History Procedures

| Test                                       | Description                 | Expected Result          |
| ------------------------------------------ | --------------------------- | ------------------------ |
| `listHistory_noCursor_returnsItems`        | List history without cursor | First page of items      |
| `listHistory_withCursor_returnsNextPage`   | List history with cursor    | Items after cursor       |
| `listHistory_withTypeFilter_filtersByType` | Filter by type parameter    | Filtered results         |
| `createHistory_validInput_insertsRecord`   | Create history item         | Created record           |
| `importHistory_batchItems_insertsAll`      | Import array of items       | Count of imported        |
| `getHistoryById_exists_returnsItem`        | Valid ID                    | History item             |
| `getHistoryById_notExists_returnsNull`     | Invalid ID                  | null                     |
| `getHistoryById_wrongUser_returnsNull`     | Another user's ID           | null                     |
| `deleteHistory_wrongUser_noEffect`         | Another user's ID           | No deletion              |
| `clearAllHistory_deletesAll`               | User clears all             | All history deleted      |
| `getHistoryStats_returnsCounts`            | Query stats                 | Total and by-type counts |
| `getRecentVisits_returnsRecent`            | Get recent visits           | Recent items             |

#### API Key Procedures

| Test                              | Description        | Expected Result      |
| --------------------------------- | ------------------ | -------------------- |
| `listApiKeys_returnsUserKeys`     | List user's keys   | Array of API keys    |
| `createApiKey_returnsNewKey`      | Create new key     | Full key in response |
| `deleteApiKey_wrongUser_noEffect` | Another user's key | No deletion          |

### History Utilities Tests (`tests/unit/lib/history-utils.test.ts`)

| Test                                         | Description                        | Expected Result    |
| -------------------------------------------- | ---------------------------------- | ------------------ |
| `normalizeUrl_removesProtocol`               | `https://example.com/`             | `example.com`      |
| `normalizeUrl_preservesPath`                 | `https://example.com/path`         | `example.com/path` |
| `normalizeUrl_handlesInvalid`                | Invalid URL string                 | Same string        |
| `areItemsSimilar_sameUrl_returnsTrue`        | Same normalized URL                | true               |
| `areItemsSimilar_differentUrl_returnsFalse`  | Different URLs                     | false              |
| `areItemsSimilar_sameDomainPath_returnsTrue` | Same domain + path                 | true               |
| `areItemsSimilar_similarTitles_returnsTrue`  | Similar title strings (80%+ match) | true               |
| `areItemsSimilar_within5Minutes_returnsTrue` | <5 min time difference             | true               |
| `combineSimilarItems_similarGroup_merges`    | Group of similar items             | Combined item      |
| `formatTimeRange_minutes_formatsMinutes`     | 5-59 min                           | "5m"               |
| `formatTimeRange_hours_formatsHours`         | 1-24 hours                         | "3h"               |
| `formatTimeRange_days_formatsDays`           | >24 hours                          | "2d"               |

### Extension API Tests (`tests/unit/server/extension.test.ts`)

| Test                                     | Description           | Expected Result  |
| ---------------------------------------- | --------------------- | ---------------- |
| `handleImport_validRequest_importsItems` | Valid API key + items | Imported count   |
| `handleImport_noApiKey_returns401`       | Missing X-API-Key     | 401 Unauthorized |
| `handleImport_emptyItems_returnsZero`    | Empty items array     | { imported: 0 }  |

---

## P2: Utility & Infrastructure Tests

### Utility Functions Tests (`tests/unit/lib/utils.test.ts`)

| Test                              | Description           | Expected Result     |
| --------------------------------- | --------------------- | ------------------- |
| `cn_multipleInputs_mergesClasses` | Multiple class values | Merged class string |
| `cn_emptyInputs_returnsEmpty`     | No inputs             | Empty string        |

### API URL Utilities Tests (`tests/unit/lib/api-url.test.ts`)

| Test                                      | Description            | Expected Result    |
| ----------------------------------------- | ---------------------- | ------------------ |
| `getApiBaseUrl_productionEnv_returnsProd` | Production environment | Production API URL |
| `getApiUrl_withBase_returnsFullUrl`       | Base URL + path        | Full URL           |

### Handler & Context Tests (`tests/unit/server/handler.test.ts`)

| Test                                       | Description    | Expected Result      |
| ------------------------------------------ | -------------- | -------------------- |
| `createContext_withHeaders_returnsContext` | Valid headers  | Context with headers |
| `addCorsHeaders_allowedOrigin_setsHeaders` | Allowed origin | CORS headers added   |

---

## P3: Integration Tests

### API Integration Tests (`tests/integration/api.test.ts`)

| Test                               | Description                | Assertion                |
| ---------------------------------- | -------------------------- | ------------------------ |
| `healthEndpoint_returns200`        | GET /health                | Status 200, healthy body |
| `authSignUp_returnsUserAndToken`   | POST /auth/sign-up/email   | 200, user object, token  |
| `trpcListHistory_returnsPaginated` | POST /api/trpc/listHistory | Paginated results        |

### History Flow Integration (`tests/integration/history-flow.test.ts`)

Complete lifecycle test: Create history → List with pagination → Filter by date → Get stats → Delete → Clear all

---

## Extension Code Tests

### Content Script Tests (`tests/unit/extension/content.test.ts`)

| Test                                  | Description         | Expected Result  |
| ------------------------------------- | ------------------- | ---------------- |
| `isIgnored_chromeUrls_returnsTrue`    | chrome:// URLs      | true             |
| `isIgnored_normalUrls_returnsFalse`   | `https://example.com` | false            |
| `getPageMetadata_extractsMetaTags`    | HTML with meta tags | Extracted values |
| `shouldTrack_ignoredUrl_returnsFalse` | Ignored URL         | false            |

### Background Script Tests (`tests/unit/extension/background.test.ts`)

| Test                                   | Description      | Expected Result    |
| -------------------------------------- | ---------------- | ------------------ |
| `generateVisitId_consistentOutput`     | Same input twice | Same ID            |
| `syncWithServer_noConfig_returnsError` | Missing API key  | { success: false } |
| `updateBadge_showsCount`               | 5 pending visits | Badge shows "5"    |

---

## Test Setup & Fixtures

### `tests/setup/test-db.ts`

```typescript
export async function createTestPool(): Promise<Pool>;
export async function runMigrations(db: Database): Promise<void>;
export async function seedTestData(db: Database, userId: string): Promise<void>;
export async function cleanupTestData(db: Database): Promise<void>;
```

### `tests/setup/test-helpers.ts`

```typescript
export async function createTestSession(db: Database): Promise<{
  user: User;
  session: Session;
  token: string;
}>;
export async function createTestClient(): Promise<{
  signUp: (email: string, password: string) => Promise<Response>;
  signIn: (email: string, password: string) => Promise<Response>;
  request: (path: string, options?: RequestInit) => Promise<Response>;
}>;
export function createTestApiKey(userId: string): string;
```

---

## Coverage Goals

| Category           | Target Coverage |
| ------------------ | --------------- |
| Router procedures  | 100%            |
| Auth logic         | 100%            |
| History utilities  | 95%             |
| Extension handlers | 90%             |
| Utility functions  | 100%            |
| **Overall**        | **85%**         |

---

## Implementation Order

### Phase 1: Foundation

1. [ ] Create `tests/setup/test-db.ts` - Test database utilities
2. [ ] Create `tests/setup/test-helpers.ts` - Test helper functions
3. [ ] Update `vitest.config.ts` - Add coverage configuration
4. [ ] Create `tests/unit/lib/utils.test.ts` - Utility tests

### Phase 2: Core Business Logic

5. [ ] Create `tests/unit/lib/history-utils.test.ts` - History utility tests
6. [ ] Create `tests/unit/lib/api-url.test.ts` - API URL tests
7. [ ] Create `tests/unit/server/extension.test.ts` - Extension API tests
8. [ ] Create `tests/unit/server/handler.test.ts` - Handler tests

### Phase 3: Router & Auth

9. [ ] Create `tests/unit/server/api-key.test.ts` - API key auth tests
10. [ ] Create `tests/unit/server/router.test.ts` - Router procedure tests
11. [ ] Enhance `tests/auth.test.ts` - Add more auth edge cases

### Phase 4: Integration & Extension

12. [ ] Create `tests/integration/api.test.ts` - HTTP integration tests
13. [ ] Create `tests/integration/history-flow.test.ts` - Full flow tests
14. [ ] Create `tests/unit/extension/content.test.ts` - Content script tests
15. [ ] Create `tests/unit/extension/background.test.ts` - Background script tests

---

## Running Tests

```bash
# Run all tests
bun test

# Run with coverage
bun test --coverage

# Run specific test file
bun test tests/unit/server/router.test.ts

# Run in watch mode
bun test tests/unit --watch

# Run integration tests (requires running server)
bun test tests/integration
```
