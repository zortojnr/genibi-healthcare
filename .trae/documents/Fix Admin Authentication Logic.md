# Admin Authentication Fix Plan

The current issue is that the admin login flow is correctly authenticating with Firebase, but the subsequent authorization check fails because it relies on a case-sensitive email comparison or a database role that might not be set for the specific email `Genibimentalhealth13@gmail.com`.

The user has explicitly requested to **enforce admin access strictly by email** for this specific address, bypassing database role checks if the email matches.

## Implementation Steps

1.  **Verify/Update `src/lib/admin.ts`**:
    *   Ensure `ADMIN_EMAIL` is set to `Genibimentalhealth13@gmail.com`.

2.  **Update `src/services/adminService.ts`**:
    *   Modify the `login` method to:
        *   Normalize the input email and `ADMIN_EMAIL` to lowercase for comparison.
        *   **Bypass** the Firestore role check if the email matches the hardcoded admin email.
        *   Only perform the Firestore role check if the email *does not* match.
        *   Ensure the `User` object is returned correctly if authorized.

3.  **Update `src/App.tsx` (AdminRoute)**:
    *   Modify the `checkAdmin` logic inside `AdminRoute` to:
        *   Normalize `user.email` and `ADMIN_EMAIL` to lowercase.
        *   Grant access immediately if they match (short-circuit the database check).
        *   Keep the database check as a fallback for other potential admins (if any).

4.  **Verification**:
    *   The fix ensures that logging in with `Genibimentalhealth13@gmail.com` (case-insensitive) will always succeed and redirect to the dashboard, regardless of what is stored in the Firestore `users` collection.

## Files to Modify
*   `src/services/adminService.ts`
*   `src/App.tsx`
*   `src/lib/admin.ts` (Check only)
