# TypeScript Fix & Vercel Deployment Plan

The user is experiencing Vercel build failures due to TypeScript errors: unused variables (TS6133) and missing Node.js types (TS2503). The goal is to clean up the code, install necessary types, configure the compiler, and verify the build locally before redeploying.

## Diagnosis
1.  **Unused Variables (TS6133)**:
    *   `AuditLogsViewer.tsx`: The `loading` state is defined but never used in the render.
    *   `AdminDashboard.tsx`: The user reported an unused import `useAuth`, though my read showed it is used in `useIdleTimeout`. However, I need to check for *other* unused imports or variables (like `loading` in `AdminDashboard` or `newAdminEmail` if the legacy tabs were removed).
2.  **Missing Node Types (TS2503)**:
    *   The code uses `NodeJS.Timeout` in `AdminDashboard.tsx` (for the idle timer).
    *   `package.json` *does* list `@types/node`, but it might not be included in `tsconfig.app.json`'s `types` array, or the install might be stale.
    *   `tsconfig.app.json` currently has `"types": ["vite/client"]`. It needs `"node"` added or `compilerOptions.types` expanded.

## Implementation Steps

1.  **Fix `AuditLogsViewer.tsx`**:
    *   Use the `loading` state to show a loading indicator (e.g., `<div className="text-center">Loading logs...</div>`) or remove it if truly unnecessary. Given the user's preference ("use it properly"), I will add a loading UI.

2.  **Fix `AdminDashboard.tsx`**:
    *   Verify usage of `useAuth`. If it's used in `useIdleTimeout` (which calls `adminService.logout` but imports `useAuth`?), wait, `useIdleTimeout` uses `adminService.logout`. `AdminDashboard` imports `useAuth` but might not use it directly in the component body. I will check line 4: `import { useAuth } from '../contexts/AuthContext'`.
    *   Remove unused imports/variables.

3.  **Install & Configure Node Types**:
    *   Run `npm install --save-dev @types/node` (just to be safe/ensure latest).
    *   Update `tsconfig.app.json`: Add `"node"` to the `types` array: `"types": ["vite/client", "node"]`.

4.  **Local Verification**:
    *   Run `npm run build` locally to confirm no TS errors.

5.  **Push & Redeploy**:
    *   Commit changes.
    *   Push to GitHub (which triggers Vercel).

## Detailed Changes

*   **`src/components/admin/AuditLogsViewer.tsx`**:
    ```tsx
    if (loading) return <div className="p-4 text-center text-slate-500">Loading audit logs...</div>
    ```
*   **`src/pages/AdminDashboard.tsx`**:
    *   Remove `import { useAuth } ...` if `useAuth` is not called. (My read shows it is imported but not used; `useIdleTimeout` doesn't use it, `AdminDashboard` doesn't use it).
*   **`tsconfig.app.json`**:
    *   Update `compilerOptions.types` to `["vite/client", "node"]`.

## Plan
1.  Modify `AuditLogsViewer.tsx` to use `loading`.
2.  Modify `AdminDashboard.tsx` to remove unused `useAuth`.
3.  Install `@types/node` and update `tsconfig.app.json`.
4.  Run `npm run build` to verify.
5.  Commit and push.
