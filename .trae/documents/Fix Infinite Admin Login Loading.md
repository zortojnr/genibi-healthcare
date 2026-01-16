# Fix Infinite Loading on Admin Login

The user is reporting an "infinite loading" issue on the admin login page. This typically happens when an asynchronous operation (like an API call or Firebase method) hangs or fails without properly resetting the loading state in a `finally` block, or if an error is caught but not handled in a way that stops the UI spinner.

## Diagnosis
Looking at the current code in `src/pages/AdminLogin.tsx`:
```typescript
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault()
  setError('')
  setLoading(true)

  try {
    await adminService.login(email, password)
    navigate('/admin/dashboard')
  } catch (err: any) {
    console.error(err)
    setError(err.message || 'Failed to login')
  } finally {
    setLoading(false)
  }
}
```
The `finally { setLoading(false) }` block **is already present**. However, if `adminService.login` hangs indefinitely (e.g., due to a Firebase network issue, an unawaited promise that never resolves, or a misconfigured `signInWithEmailAndPassword` that doesn't timeout), the `finally` block might not be reached immediately, or the UI might be stuck waiting.

**Crucially**, the user's prompt implies a scenario where a *backend API route* (`POST /api/admin/login`) is involved, but the current implementation uses **client-side Firebase Auth** directly via `adminService.login`.

If the user is expecting a server-side API route flow (as per their "REQUIRED FIX" description mentioning `app/api/admin/login/route.ts`), there is a **mismatch**. The current codebase is a Client-Side Rendered (CSR) Vite app using Firebase directly, not a Next.js app with server routes.

**However**, assuming the user *wants* the existing Firebase implementation to be robust:
The issue might be that `signInWithEmailAndPassword` is hanging (network) or the Firestore check `getDoc` is hanging.

**Wait**, the user's prompt explicitly provides "REQUIRED FIX" code snippets that look like **Next.js App Router** code (`export async function POST(req)...`).
*   **Conflict**: This project is a **Vite + React** SPA (Single Page Application), not Next.js. We cannot simply paste Next.js server route code into a Vite app.
*   **Resolution**: I must adapt the *principles* of the fix (robust error handling, guaranteed response/timeout) to the current **Vite + Firebase** architecture. I cannot create `app/api/admin/login/route.ts` because Vite doesn't run server-side API routes like Next.js does (unless using Vercel Functions, but the current architecture is client-side Firebase).

**Hypothesis**: The user might be confused about the tech stack or wants me to simulate the robustness.
**Actual Issue**: In `adminService.ts`, if `signInWithEmailAndPassword` succeeds but the subsequent `getDoc` or `updateDoc` hangs (e.g., Firestore rules issue, offline mode), the login hangs.

**Plan**:
1.  **Enforce Timeout**: Wrap the `adminService.login` call in a timeout race to ensure it fails if it takes too long (>10s).
2.  **Verify `finally` execution**: The `finally` block in `AdminLogin.tsx` is correct, but we can make it safer.
3.  **Address the "Backend Request" confusion**: I will explain that since this is a Vite app, we are using Firebase directly, but I will ensure the *Service Layer* behaves reliably like the requested backend endpoint.

## Implementation Steps

1.  **Modify `src/pages/AdminLogin.tsx`**:
    *   Keep the `finally` block (it's already there).
    *   Add a specific check for `!email || !password` before setting loading to true, to fail fast.

2.  **Modify `src/services/adminService.ts`**:
    *   Add a timeout to the `login` function. If Firebase takes > 15 seconds, throw a "Request timed out" error.
    *   Ensure all awaits are properly caught.

3.  **Clarification**: Since I cannot "Fix missing or broken API endpoints" in the way a Next.js app works (because they don't exist in Vite), I will optimize the client-side service to be bulletproof.

**Refined Plan based on "Infinite Verifying"**:
The most common cause for "infinite verifying" in this specific codebase is likely a **Firestore Permission/Network issue** where the `await getDoc(...)` promise stays pending forever if the client is offline or rules block it silently.

I will implement a timeout wrapper for the login logic.

**Wait**, looking at the user input again:
> "Backend request is not completing properly"
> "Backend MUST always return a response"

If the user *deployed* this to Vercel and expects an API route, they might be trying to hit an endpoint that doesn't exist. But the current `AdminLogin.tsx` calls `adminService.login` which calls Firebase directly. It does **not** call `fetch('/api/admin/login')`.
**So the user's provided code snippet (using `fetch`) is NOT what is currently in the codebase.**

**Decision**: I must stick to the **existing architecture** (Firebase Client SDK) but make it robust. I will **not** convert the app to use `fetch` against a non-existent API route unless I also create a Vercel Serverless Function for it. Given the context, fixing the client-side service is the correct path for a Vite app.

**However**, if the user *insists* on the code they provided (using `fetch`), I would need to create a Vercel Function (`api/admin/login.ts`).
**But** the `adminService` is already integrated throughout the app. Switching to an API route for just login would be inconsistent.
**I will assume the goal is "Make Login Work and Stop Hanging" rather than "Switch to Server-Side Auth".**

I will implement a timeout in `adminService.login` to prevent infinite hanging.

**Wait**, if I look at the `AdminLogin.tsx` file content I just read, it **does** use `adminService.login`. It does **not** use `fetch`.
The user's prompt says: "Frontend MUST stop loading... `finally { setLoading(false) }`".
My read of `AdminLogin.tsx` shows:
```typescript
    } finally {
      setLoading(false)
    }
```
It is ALREADY there.
So why is it hanging?
It hangs if `adminService.login` **never returns and never throws**.
This happens if a Promise inside it is stuck.
In `adminService.ts`:
```typescript
    // Check if user has admin role in DB
    const userDoc = await getDoc(doc(db, ADMIN_COLLECTION, cred.user.uid))
```
If Firestore is unreachable or having issues, `getDoc` can hang if not configured with a timeout.

**Fix**: Add a timeout to the `login` method in `adminService.ts`.

## Steps
1.  Update `src/services/adminService.ts`:
    *   Wrap the logic in a `Promise.race` with a timeout.
2.  Update `src/pages/AdminLogin.tsx`:
    *   Ensure the `finally` block is robust (it looks fine, but I'll double check imports).
    *   Maybe add a "timeout" state if it takes too long? No, the service timeout will handle that.
