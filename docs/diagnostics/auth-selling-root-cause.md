# ExOwn authentication and selling diagnostics

This note records code-level defects identified during review. It is not a production configuration diagnosis.

## Confirmed user sync defect
In `src/actions/user.ts`, `syncUser` only enters the create attempt inside the `if (existingUser)` block, after updating an existing record. A genuinely new account leaves `user` undefined and fails when the function logs `user.id`. The create-vs-update branches should be mutually exclusive, with a unique-constraint race fallback that re-reads the existing user.

## Confirmed selling identity mismatch risk
In `src/lib/auth.ts`, `requireSameUser` resolves a Firebase identity to a database user and returns:
- `uid`: database `User.id`
- `firebaseUid`: original Firebase UID

The product creation action was reviewed as trusting the caller's `sellerId` after checking `requireSameUser(data.sellerId)`. The sell page sends Firebase `user.uid`. For legacy accounts resolved by verified email where database ID differs from Firebase UID, the product FK can use the wrong ID. The action should use the authenticated user's resolved database `uid` after authorization, and use that canonical ID for product creation and activity logging.

## Authentication diagnostics
`src/lib/auth.ts` rejects ID tokens when `decoded.aud` differs from `FIREBASE_PROJECT_ID`. The session route returns 401 `Invalid token` when token verification returns null. This can result from Firebase project mismatch, expired/revoked token, or other Admin SDK verification failures. The precise production cause requires Vercel runtime logs and checking that the client Firebase project and Admin service-account project are the same. Do not publish secrets.

## Duplicate session requests
`src/context/AuthContext.tsx` registers both `onAuthStateChanged` and `onIdTokenChanged`, and both call `ensureServerSession`. This can create redundant session-cookie POSTs and rate-limit pressure. Login code also has its own session creation path and should be reviewed before consolidating.

## Safety
No user rows, listings, migrations, or database data should be deleted or reset as part of these fixes.
