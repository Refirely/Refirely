# ReFirely Security Specification

## 1. Data Invariants
- Each user root profile `/users/{userId}` belongs strictly to the authenticated user whose `request.auth.uid == userId`.
- Users cannot read, list, or tamper with other users' profiles, saved User IDs, or private journal data.
- The `role` field on a user profile is restricted to `'member'` or `'admin'` (with bootstrapped admin verification for `ganesh.indireddy@gmail.com`).
- Each custom User ID account in `/users/{userId}/savedAccounts/{accountId}` is strictly owned by `userId == request.auth.uid`, validated by `isValidSavedAccount(userId, accountId, incoming())`.
- Each country journal entry in `/users/{userId}/journalEntries/{countryId}` is completely private to `userId`.
- Journal entries must have a valid `countryId`, `countryName`, and `interestLevel` adhering to allowlisted values (`Top Contender`, `Strong Interest`, `Moderate Interest`, `Casual Exploration`, `Ruled Out`).
- `privateNotes` length cannot exceed 5000 characters to prevent wallet/storage denial-of-service attacks.
- Subcollection document queries are protected by checking ownership on the path (`userId == request.auth.uid`).

## 2. The Dirty Dozen Payloads (Targeting Exploits)
1. **Unauthenticated Read**: Attempting to read `/users/victim_123` without auth token -> Denied.
2. **Cross-Tenant Profile Read**: User `alice_123` attempting to read `/users/bob_456` -> Denied.
3. **Ghost Collection Crawl**: Attempting to `list` all `/users` -> Denied.
4. **Role Escalation**: Non-admin user setting `role: "admin"` during an update to an existing profile -> Denied (`role == existing().role || isBootstrappedAdmin()`).
5. **ID Poisoning Attack**: Submitting a 2KB malicious document path `/users/victim_123/savedAccounts/{malicious_long_id}` -> Denied (`isValidId()`).
6. **Saved Account Hijacking**: User `alice_123` attempting to write to `/users/bob_456/savedAccounts/usr-custom` -> Denied (`isOwner(userId)`).
7. **Orphaned Saved Account**: Writing a saved account where `incoming().userId != userId` or `incoming().id != accountId` -> Denied.
8. **Invalid Interest Level Enum**: Setting `interestLevel: "Supreme Favorite Overlord"` -> Denied.
9. **Denial of Wallet Storage Exhaustion**: Submitting `privateNotes` containing 500,000 characters -> Denied (`size() <= 5000`).
10. **Tampered Country ID on Update**: Attempting to mutate `countryId` in a journal entry -> Denied (`incoming().countryId == existing().countryId`).
11. **Malicious Path Traversal**: Requesting `/users/{userId}/journalEntries/../../root` -> Denied by regex check.
12. **Cross-Tenant Journal Deletion**: User `attacker_666` sending a delete request to `/users/alice_123/journalEntries/spain` -> Denied.
