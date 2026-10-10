# Quick Start: New Username/Password Authentication

## What Changed?
✅ **Old**: GitHub OAuth login  
✅ **New**: Username + Password login with admin approval system

## Setup in 3 Steps

### 1️⃣ Run SQL in Supabase (2 minutes)
Go to: **Supabase Dashboard → SQL Editor**

Copy everything from `auth_setup.sql` and paste it. Click "Run".

**What it creates:**
- `profiles` table (stores username, approval status)
- `pending_signups` table (tracks new registrations)
- Security rules so users can only see their own data
- Auto-profile creation when users sign up

### 2️⃣ Create Your Admin Account (2 minutes)

#### Option A: Quick Method
1. Visit your Victory Tracker app
2. Click "S'inscrire" (Sign up)
3. Create account: username=`admin`, email=`your@email.com`, password=`YourPassword123!`
4. Go to Supabase → SQL Editor, run this:

```sql
-- Find your admin user ID
SELECT id FROM auth.users WHERE email = 'your@email.com';

-- Copy the ID and paste it here (replace YOUR_ID_HERE)
UPDATE public.profiles 
SET is_admin = true, approved = true 
WHERE id = 'YOUR_ID_HERE';
```

#### Option B: Via Email (if you have Supabase invite)
1. Use Supabase Dashboard Auth tab to create user
2. Then run the SQL update above

### 3️⃣ Deploy Updated App (1 minute)
The `index.html` is already updated with:
- Login/signup forms
- Admin panel
- Approval workflow

Just push to GitHub or redeploy to Vercel.

---

## Test It Works

### ✅ Test 1: Sign Up New User
1. Visit app, click "S'inscrire"
2. Register with any username/email/password
3. Should see: **"Inscription enregistrée! En attente d'approbation du compte."**

### ✅ Test 2: Approve User
1. Log in as admin
2. Click **"Admin"** button (appears if you're admin)
3. See pending signups
4. Click **"Approuver"** button

### ✅ Test 3: New User Can Login
1. Log out
2. Log in as the newly approved user
3. Should see app dashboard

---

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| "Admin" button not showing | You're not admin. Run SQL UPDATE to set `is_admin = true` |
| User can't login after signup | They need admin approval. Check Admin panel |
| SQL errors when running script | Make sure you're in SQL Editor, not in a different tool |
| Signup form says "username already exists" | Username is taken, pick a different one |

---

## What Users See

### Before Approval ❌
```
Login screen → Try to login → 
"Votre compte attend l'approbation d'un administrateur"
```

### After Approval ✅
```
Login screen → Login → 
See dashboard with victory tracker
```

---

## Next Time Someone Wants to Join

1. They go to app → "S'inscrire" → Fill form
2. You see their request in Admin panel
3. You click "Approuver"
4. They can login

That's it! No more GitHub OAuth complications.

---

## Questions?

See **AUTH_SETUP_GUIDE.md** for detailed information on:
- How the system works under the hood
- Security features
- Advanced customization
- Troubleshooting

---

## Files Updated This Session

```
index.html ........................ New login/signup/admin UI
auth_setup.sql .................... Database schema & security rules
AUTH_SETUP_GUIDE.md ............... Detailed technical guide (this file)
QUICK_START.md .................... Quick reference (this file)
```
