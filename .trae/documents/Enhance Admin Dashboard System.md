# Admin Dashboard Enhancement Plan

The user requests a comprehensive upgrade to the admin dashboard functionality while explicitly preserving the regular user experience. The request covers extensive backend and frontend features including RBAC, User Tracking, Appointment/Medication/Library management updates, and enhanced Security/Audit logging.

Since this is a client-side Firebase application (Vite + React), many "backend" requirements (like server-side session duration tracking, IP logging with geolocation, RESTful API documentation) must be adapted to Firebase Functions or client-side implementations where appropriate, or acknowledged as limitations of the current architecture.

## Strategy

I will break this down into manageable chunks, prioritizing the Admin Dashboard enhancements and the Service Layer logic that supports them. I will **not** modify the regular user routes (`/login`, `/dashboard`, etc.) except where necessary to support the new data structures (e.g., reading the new medication assignments).

### Phase 1: Service Layer Enhancements (`src/services/adminService.ts`)
1.  **RBAC & Permissions**:
    *   Extend `AdminUser` type to support granular permissions (e.g., `canManageUsers`, `canManageContent`).
    *   Add methods for updating user roles and permissions.
2.  **Audit Logging**:
    *   Enhance `logAudit` to support "reason" and "previousState" fields.
3.  **Data Management**:
    *   Add methods for the new Medication features (complex regimens, interaction checking placeholder).
    *   Add methods for E-Library version control (storing versions in a sub-collection).

### Phase 2: Admin Dashboard UI Overhaul (`src/pages/AdminDashboard.tsx`)
1.  **Architecture**:
    *   Refactor the monolithic `AdminDashboard` into smaller components: `UserManagement`, `ContentManagement`, `AuditLogViewer`, `AnalyticsWidget`.
2.  **User Management**:
    *   Implement the "Permission Matrix" visualization using a grid of checkboxes for roles.
    *   Add bulk operation buttons (though implementation might be single-item iteration for now).
3.  **Medication Management**:
    *   Update the form to support the new fields (signatures, refill thresholds).
4.  **Analytics**:
    *   Add a "Real-time Analytics" tab with charts (using a library like `recharts` if available, or simple CSS bars if not) showing user logins, appointment stats, etc.

### Phase 3: Security & Monitoring
1.  **Session Timeout**:
    *   Implement a hook `useIdleTimer` in the Admin Dashboard to auto-logout after 15 minutes of inactivity.
2.  **Access Control**:
    *   Ensure the `AdminRoute` wrapper strictly enforces the new granular permissions if implemented, or at least the base `admin` role.

### Phase 4: Data Structure Updates (Firestore)
*   **Users**: Add `permissions: string[]`, `lastActivity: timestamp`, `sessionDuration: number`.
*   **Medications**: Add `refillThreshold: number`, `prescribedBy: string`, `signature: string`.
*   **Resources**: Add `versions: array`, `metadata: object`.

## Detailed Implementation Steps

1.  **Modify `adminService.ts`**:
    *   Add `updateUserPermissions(uid, permissions)`.
    *   Add `logAudit` enhancement.
    *   Add `getAnalytics()` stub.

2.  **Refactor `AdminDashboard.tsx`**:
    *   Create a new directory `src/pages/admin/` to house sub-components.
    *   Move the current tabs into separate files:
        *   `src/pages/admin/UserManagement.tsx`
        *   `src/pages/admin/AuditLogs.tsx`
        *   `src/pages/admin/ContentManager.tsx`
    *   Implement the new "Analytics" dashboard as the default view.

3.  **Implement New Features**:
    *   **Drag-and-Drop**: Use `dnd-kit` or simple HTML5 DnD for function assignment if requested, though a checkbox matrix is more standard for permissions. I will stick to a robust UI first.
    *   **Notification System**: Since we lack a backend for SMS/Email, I will simulate this by creating "Notification" documents in a collection that a future Cloud Function could trigger off of.

4.  **Verification**:
    *   Verify regular user login works unchanged.
    *   Verify admin can see new tabs and data.
    *   Test audit logging for new actions.

**Constraint Checklist & Confidence Score**:
1. User Function Assignment? Yes.
2. Backend Functionality? Adapted for Firebase.
3. Admin Interface Design? Yes.
4. Security? Yes.
5. Technical Implementation? Yes.
Confidence Score: 5/5

## Plan
1.  **Service Layer**: Update `adminService.ts` with extended types and methods.
2.  **Components**: Create `src/components/admin` folder and extract/enhance tabs.
3.  **Main Dashboard**: Reassemble `AdminDashboard.tsx` with the new components and analytics view.
4.  **Security**: Add idle timeout hook.
