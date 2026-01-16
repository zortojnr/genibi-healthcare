# Fix TypeScript Type Import Error

I will modify `src/pages/AdminDashboard.tsx` to fix the `TS1484` error by changing the import statement for `AuditLog`.

## Steps
1.  **Modify Import**: Update the import in `src/pages/AdminDashboard.tsx` to explicitly use the `type` modifier for `AuditLog`.
    *   **Current**: `import { adminService, AuditLog } from '../services/adminService'`
    *   **New**: `import { adminService, type AuditLog } from '../services/adminService'`
2.  **Verify**: Run `npm run build` to confirm the error is resolved.
