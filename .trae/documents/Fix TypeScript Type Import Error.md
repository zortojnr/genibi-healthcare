# Fix TypeScript Build Error

1.  **Update Import in `src/pages/AdminDashboard.tsx`**:
    *   Locate line 5: `import { adminService, AuditLog } from '../services/adminService'`
    *   Change it to use `import type` for `AuditLog` to satisfy `verbatimModuleSyntax`.
    *   New import style: `import { adminService, type AuditLog } from '../services/adminService'` or split into two lines.

2.  **Verify**:
    *   Run `npm run build` (optional, if environment allows) or rely on static analysis since the fix is deterministic for TS1484.
