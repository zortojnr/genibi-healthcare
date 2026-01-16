# Fix "Undefined App" Error in Admin Login

The error `Cannot read properties of undefined (reading 'app')` occurs because the Firebase `auth` instance is `undefined` when the environment variables are missing (which is common in a fresh clone or dev environment). The current `adminService.ts` tries to pass this `undefined` auth instance to Firebase methods, causing a crash.

## Plan

1.  **Enhance `adminService.ts`**:
    *   Add a check at the beginning of `login`, `logout`, and `logAudit` methods to verify if `auth` is defined.
    *   If `auth` is undefined, throw a clear, user-friendly error: "Firebase is not configured. Please check your environment variables."
2.  **Verify `firebase.ts`**:
    *   Ensure it correctly exports `isFirebaseEnabled` or simply rely on the `auth` check in the service.
3.  **Update `AdminLogin.tsx`**:
    *   Ensure the error state properly displays this configuration error to the user instead of crashing the UI.

This will prevent the white screen/console crash and instead show a helpful error message on the login form.
