# Dark Mode Verification and Fix Plan

The current dark mode implementation seems mostly robust, but a comprehensive review is needed to ensure consistency across all screens, especially in initial loading states, auth screens, and dashboard components.

## Identified Issues & Fixes

1.  **Auth Screens (`Login.tsx`, `Register.tsx`, `AdminLogin.tsx`)**:
    *   **Issue**: These screens use hardcoded light-themed backgrounds (`bg-gradient-to-br from-slate-50 to-slate-100`) and text colors (`text-slate-700`, `bg-white`). They lack `dark:` classes, meaning they will remain dazzlingly bright even when the rest of the app is in dark mode.
    *   **Fix**: Update container backgrounds to `dark:from-slate-900 dark:to-slate-800`, cards to `dark:bg-slate-800 dark:border-slate-700`, and text to `dark:text-white` or `dark:text-slate-300`.

2.  **Dashboard (`Dashboard.tsx`)**:
    *   **Issue**: Generally good, but the "Welcome" card uses `bg-white/70` which might look washed out against a dark background if not paired with a sufficiently dark alternative.
    *   **Fix**: Ensure `dark:bg-slate-800/70` provides enough contrast.

3.  **Admin Dashboard (`AdminDashboard.tsx`)**:
    *   **Issue**: While updated recently, we need to double-check table headers, inputs, and modals for consistent dark styling (e.g., ensuring inputs have dark backgrounds so text is readable).

4.  **Global Transitions**:
    *   **Issue**: Theme transitions can be jarring if `transition-colors` is missing on major containers.
    *   **Fix**: Add `transition-colors duration-300` to the root `div` in `App.tsx` or individual page wrappers.

## Implementation Steps

1.  **Update `Login.tsx` & `Register.tsx`**: Apply comprehensive dark mode classes to the main container, card, inputs, and text.
2.  **Update `AdminLogin.tsx`**: Ensure it matches the dark theme aesthetic (it likely already does, but verification is key).
3.  **Review `Dashboard.tsx`**: Refine contrast for the quote section and feature cards in dark mode.
4.  **Verify Inputs**: Ensure all form inputs across the app have `dark:bg-slate-700 dark:text-white dark:border-slate-600` to prevent "white input on dark background" or "dark text on dark input" issues.

## Verification Strategy
*   Manually check the preview URL after applying changes.
*   Simulate mobile view to check responsiveness of dark mode elements.
