# Username/Password Authentication Setup Guide

## Overview
This guide explains how to set up the new username/password authentication system with admin approval for the Victory Tracker app.

## System Architecture

### Tables Structure
- **auth.users** (Supabase built-in): Stores email and password for authentication
- **public.profiles**: Stores username, approval status, and admin flag
- **public.pending_signups**: Tracks signup requests awaiting admin approval

### Authentication Flow
1. User signs up with username, email, and password
2. A pending signup request is created
3. An admin approves the user via admin panel
4. User can then log in with email and password
5. User account is checked for approval status on login

## Setup Instructions

### Step 1: Run the SQL Setup Script
Go to your Supabase Dashboard → SQL Editor and run the `auth_setup.sql` file:

```bash
# Execute all SQL from auth_setup.sql
```

**What this does:**
- Creates `profiles` table linked to auth.users
- Creates `pending_signups` table for admin workflow
- Sets up Row Level Security (RLS) policies
- Creates a trigger to auto-create user profiles

### Step 2: Create an Admin Account (First Time Setup)

After running the SQL, manually create your first admin account:

```sql
-- 1. Create auth user (this would normally come from signup, but we need an admin first)
-- You'll need to do this via Supabase Auth UI or through a script

-- 2. Then update the profiles table to make them admin:
UPDATE public.profiles 
SET is_admin = true, approved = true 
WHERE username = 'your_admin_username';
```

**Alternative:** Use Supabase Auth UI to create your first account, then:
```sql
-- Find your user ID from auth.users
SELECT id, email FROM auth.users;

-- Update profiles to set as admin
UPDATE public.profiles 
SET is_admin = true, approved = true 
WHERE id = 'YOUR_USER_ID_HERE';
```

### Step 3: Deploy the Updated Frontend
The new `index.html` already includes:
- Username/password login and signup forms
- Admin panel for approving users
- Automatic approval check on login

Just redeploy to GitHub Pages or Vercel.

## User Workflows

### New User Registration
1. Click "S'inscrire" (Sign up)
2. Enter username, email, and password
3. System creates a pending signup request
4. User sees: "Inscription enregistrée! En attente d'approbation du compte."
5. User cannot log in until admin approves

### Admin Approval Process
1. Admin logs in (must have `is_admin = true`)
2. Admin panel shows "🔐 Tableau de bord administrateur"
3. Admin sees list of pending signups
4. Admin can:
   - **Approuver** (Approve): User can now log in
   - **Rejeter** (Reject): User signup is rejected with optional reason

### User Login
1. Click "Se connecter" (Log in)
2. Enter email and password
3. If approved: Redirected to app
4. If not approved: See "Votre compte attend l'approbation d'un administrateur"

## Database Structure Details

### profiles table
```sql
- id (UUID): Foreign key to auth.users
- username (TEXT UNIQUE): User's chosen username
- approved (BOOLEAN): Admin approval status
- is_admin (BOOLEAN): Admin privileges
- created_at (TIMESTAMP): Account creation time
- updated_at (TIMESTAMP): Last update time
```

### pending_signups table
```sql
- id (UUID): Unique identifier
- username (TEXT UNIQUE): Requested username
- email (TEXT UNIQUE): User's email
- created_at (TIMESTAMP): Signup request time
- reviewed_at (TIMESTAMP): When admin reviewed
- approved (BOOLEAN): Approval decision
- rejection_reason (TEXT): Why signup was rejected
```

## Security Features

### Row Level Security (RLS)
- Users can only view/edit their own profiles
- Admins can view and edit all profiles
- Pending signups are only visible to admins
- Users cannot change their own approved/admin status

### Password Management
- Passwords stored securely by Supabase Auth
- Password reset via email (built-in Supabase feature)
- No passwords stored in profiles table

## Testing the System

### Test 1: User Registration Flow
1. Go to app, click "S'inscrire"
2. Fill in: username=testuser, email=test@example.com, password=TestPass123!
3. Verify message: "Inscription enregistrée! En attente d'approbation du compte."
4. Try to login with test@example.com → Should fail (not approved)

### Test 2: Admin Approval
1. Log in as admin account
2. Click "Admin" button (should appear for admins)
3. See testuser's pending signup
4. Click "Approuver"
5. Verify user now appears as approved

### Test 3: User Login After Approval
1. Log out
2. Log in with test@example.com + TestPass123!
3. Should see app page with "Bienvenue, testuser!"

### Test 4: Admin Rejection
1. Sign up another test user (testuser2)
2. As admin, click "Rejeter"
3. Add rejection reason: "Duplicate account"
4. Verify testuser2 cannot log in

## Troubleshooting

### Error: "must be owner of table users"
This occurred when trying to modify auth.users. **Solution:** Use only the public.profiles table and let Supabase Auth handle auth.users. ✅ Fixed in auth_setup.sql

### User creates account but can't log in
**Check:** Is the user approved in profiles table?
```sql
SELECT username, approved FROM public.profiles WHERE username = 'testuser';
```
If `approved = false`, admin needs to approve via admin panel.

### Admin panel doesn't appear
**Check:** Is user an admin?
```sql
SELECT username, is_admin FROM public.profiles WHERE id = auth.uid();
```
If `is_admin = false`, update manually:
```sql
UPDATE public.profiles SET is_admin = true WHERE username = 'admin_username';
```

### RLS Policy Errors
If you see "new row violates row-level security policy":
- Verify user is logged in (has auth.uid())
- Check that user exists in profiles table
- Verify RLS policies match your use case

## Next Steps

### Optional: Custom Email Templates
Supabase can send welcome emails when accounts are approved. Set up email templates in Supabase Dashboard → Authentication → Email Templates

### Optional: Enhanced Admin Panel
You could extend the admin panel to:
- View all users and their stats
- Disable/suspend accounts
- View user activity logs
- Assign/remove admin privileges

### Optional: Email Confirmation
Add email verification before approval:
```sql
ALTER TABLE pending_signups ADD COLUMN email_verified BOOLEAN DEFAULT false;
```

## Key Files Updated

- **index.html**: New login/signup forms, admin panel, approval checks
- **auth_setup.sql**: Database schema and RLS policies
- **src/main.js**: Will be replaced with proper module version

All authentication logic is now in the frontend with secure backend validation via Supabase RLS policies.
