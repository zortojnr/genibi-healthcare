# Secure Admin System Implementation Plan

This plan upgrades the existing admin implementation to a robust, secure, and feature-rich system as requested.

## 1. Architecture & Security
We will transition from a simple "hardcoded email" check to a **Role-Based Access Control (RBAC)** system using Firestore and Firebase Auth.

- **Authentication**: Leverage Firebase Auth (Bcrypt-based) for secure credential storage.
- **Authorization**: Store admin roles in a secure `admins` collection or as a `role` field on users.
- **Audit Logging**: Create a centralized `audit_logs` collection to track all administrative actions.
- **Service Layer**: Encapsulate all admin logic in `src/services/adminService.ts` to simulate a clean API structure and facilitate testing.

## 2. Implementation Steps

### Phase 1: Foundation & Service Layer
1.  **Install Testing Framework**: Add `vitest` to enable unit testing for critical functionality.
2.  **Create Admin Service**: Implement `src/services/adminService.ts` with methods:
    -   `loginAdmin(email, password)`
    -   `logAudit(action, details)`
    -   `getUsers()`, `assignMedication()`, `manageAdmins()`
3.  **Unit Tests**: Write `src/services/adminService.test.ts` to verify security logic.

### Phase 2: Dedicated Admin Route & Login
1.  **Create `src/pages/AdminLogin.tsx`**: A dedicated, secure login interface separate from the main user login.
2.  **Update `src/App.tsx`**:
    -   Route `/admin` to `AdminLogin` (if unauthenticated).
    -   Route `/admin/dashboard` to `AdminDashboard` (protected by `AdminRoute`).
3.  **Enhance `AdminRoute`**: Update to check for **admin role** in Firestore rather than just a hardcoded email.

### Phase 3: Enhanced Admin Dashboard
Update `src/pages/AdminDashboard.tsx` to include:
1.  **Audit Logs Tab**: Display login timestamps and activity logs from `audit_logs`.
2.  **Admin Management Tab**: Interface to invite/add new admins (by updating user roles).
3.  **Integration**: Refactor existing tabs (Users, Appointments, Library) to use the new `adminService` and trigger audit logs automatically.

### Phase 4: Security & Deployment
1.  **Firestore Rules**: Create a `firestore.rules` file documenting the RBAC policies (e.g., only admins can read/write `medications` or `audit_logs`).
2.  **Documentation**: Add inline documentation for all API endpoints in `adminService.ts`.

## 3. Verification
-   **Automated**: Run `npm test` to execute unit tests.
-   **Manual**: Verify admin login flow, audit log creation, and permission denial for non-admins.
