I will implement the requested changes while strictly adhering to the "No UI/Structure Modification" rule for user-facing parts.

### **1. Admin Configuration & Access Control**
*   **Define Admin Credentials**: Store the strict admin email (`Genibimentalhealth13@gmail.com`) in a constant.
*   **Update Login Flow (`Login.tsx`)**: 
    *   Intercept the post-login redirection.
    *   Check if the logged-in user's email matches the Admin email.
    *   **If Admin**: Redirect to `/admin`.
    *   **If User**: Redirect to `/` (User Dashboard).
    *   **Strict Access**: Ensure no other account can access `/admin`.

### **2. Routing & Navigation (`App.tsx`)**
*   **Create Admin Route Protection**: Implement an `AdminOnly` wrapper component that verifies the user's email.
*   **Add Admin Dashboard Route**: Map `/admin` to a new `AdminDashboard` component.
*   **Secure Referrals**: 
    *   Remove the `/referrals` route from general access.
    *   Remove the "Referrals" card from the user's `Dashboard.tsx`.
    *   Move the Referral functionality to be accessible **only** within the Admin Dashboard.

### **3. Admin Dashboard Implementation (`src/pages/AdminDashboard.tsx`)**
I will create a new, comprehensive Admin Dashboard with the following sections:
*   **User Sign-ups**: View a list of all registered users (powered by a new user-sync mechanism).
*   **Appointments**: 
    *   View all bookings from the `appointments` collection.
    *   Interface to "Assign/Provide solutions" (update status/notes).
*   **Library Management**: 
    *   Form to upload new materials (Title, Type, Link, Content).
    *   Manage existing resources.
*   **Referrals**: The content previously in the user's referral section will be relocated here.

### **4. User Features & Data Logic**
*   **User Sync (`AuthContext.tsx`)**: Add a listener to automatically save/update user details (email, timestamp) to a `users` Firestore collection upon login/signup, enabling the Admin to view the user list.
*   **Appointments (`Appointments.tsx`)**: 
    *   Connect to `appointments` Firestore collection (already largely in place).
    *   **Update**: Show the specific automated message upon successful booking: *"Appointment has been booked. Your request is being processed and you will be contacted."*
*   **Library (`Library.tsx`)**: 
    *   Ensure it fetches real data from Firestore.
    *   **Seed Content**: I will include a mechanism (or one-time setup) to populate the library with the 4 required articles/titles, specifically the "Mental Health Awareness" article with the exact provided text.
*   **Mood Tracker (`MoodTracker.tsx`)**: 
    *   **Analysis Logic**: Implement an automatic analysis function that generates a result string based on the user's mood inputs (Score + Intensity + Direction) and saves it with the entry.

### **5. Data Sanitization**
*   **Remove Dummy Data**: Clear the contents of `src/lib/demoData.ts` and ensure the app relies solely on Firestore data.

### **6. Execution Plan**
1.  **Setup**: Create admin constants and sanitise demo data.
2.  **Auth**: Modify `Login.tsx` and `AuthContext.tsx` for admin redirection and user tracking.
3.  **Routing**: Update `App.tsx` and `Dashboard.tsx` to hide Referrals and add Admin routes.
4.  **Features**: Update `Appointments.tsx` (messaging) and `MoodTracker.tsx` (analysis).
5.  **Admin Page**: Build `AdminDashboard.tsx` with all management capabilities.
6.  **Library**: Populate the required initial content.
