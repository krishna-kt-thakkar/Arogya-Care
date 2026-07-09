# AROGYA CARE — Complete Supabase + Vercel Setup Guide

Follow each step in order. Do not skip any step.

---

## STEP 1: Run the Database Migration in Supabase

1. Open your Supabase project dashboard: https://supabase.com/dashboard/project/ivxnmcgogpbgwfncxhiz
2. Click **SQL Editor** in the left sidebar.
3. Click **New Query**.
4. Open the file `supabase/migrations/20250630092101_plain_wind.sql` from your project folder.
5. Copy the ENTIRE content of that SQL file and paste it into the SQL Editor.
6. Click **Run** (the green play button).
7. Confirm it says "Success. No rows returned" — this means all 11 tables, RLS policies, indexes, and triggers were created.

If you see errors like "relation already exists", that is fine — the tables were already created previously. The `IF NOT EXISTS` clauses handle this.

---

## STEP 2: Configure Email Authentication (OTP + Signup Confirmation)

1. In Supabase Dashboard, go to **Authentication** (left sidebar) → **Providers**.
2. Make sure **Email** provider is enabled (it should be by default).
3. Go to **Authentication** → **Email Templates** → Click on **Magic Link**.
4. Replace the email body template with this:

```
<h2>Your AROGYA CARE Verification Code</h2>
<p>Hello,</p>
<p>Your one-time verification code is:</p>
<h1 style="font-size: 36px; letter-spacing: 8px; text-align: center; background: #f0f0f0; padding: 16px; border-radius: 8px;">{{ .Token }}</h1>
<p>This code expires in 60 minutes.</p>
<p>If you did not request this code, you can safely ignore this email.</p>
```

5. Click **Save**.
6. Do the same for the **Confirm signup** template — edit it to include a clear confirmation link:

```
<h2>Welcome to AROGYA CARE</h2>
<p>Hello,</p>
<p>Thank you for signing up. Please confirm your email address by clicking the button below:</p>
<a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Confirm Email</a>
<p>If you did not create an account, you can safely ignore this email.</p>
```

7. Click **Save**.
8. Edit the **Reset Password** template similarly:

```
<h2>AROGYA CARE Password Reset</h2>
<p>Hello,</p>
<p>You requested a password reset. Click the button below to set a new password:</p>
<a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
<p>If you did not request this, you can safely ignore this email.</p>
```

9. Click **Save**.

---

## STEP 3: Configure URL Settings

1. In Supabase Dashboard, go to **Authentication** → **URL Configuration**.
2. Set **Site URL** to: `https://arogya-care-rho.vercel.app`
3. Under **Redirect URLs**, add ALL of these (click Add URL for each):
   - `https://arogya-care-rho.vercel.app`
   - `https://arogya-care-rho.vercel.app/dashboard`
   - `http://localhost:5173`
   - `http://localhost:5174`
4. Click **Save**.

---

## STEP 4: Configure Google Sign-In (OAuth)

### Part A — Google Cloud Console

1. Go to: https://console.cloud.google.com/
2. Create a new project (or use an existing one).
3. Go to **APIs & Services** → **OAuth consent screen**.
   - Choose **External** user type.
   - Fill in App name: `AROGYA CARE`
   - User support email: your email
   - Developer contact: your email
   - Click **Save and Continue** through all steps.
4. Go to **APIs & Services** → **Credentials** → Click **Create Credentials** → **OAuth 2.0 Client ID**.
   - Application type: **Web application**
   - Name: `AROGYA CARE`
   - Authorized JavaScript origins: Add `https://arogya-care-rho.vercel.app`
   - Authorized redirect URIs: Add `https://ivxnmcgogpbgwfncxhiz.supabase.co/auth/v1/callback`
   - Click **Create**.
5. Copy the **Client ID** and **Client Secret** that appear.

### Part B — Supabase Dashboard

1. Go to Supabase Dashboard → **Authentication** → **Providers** → **Google**.
2. Toggle it **ON**.
3. Paste the **Client ID** from Google Cloud.
4. Paste the **Client Secret** from Google Cloud.
5. Click **Save**.

---

## STEP 5: Set Environment Variables on Vercel

1. Go to: https://vercel.com/ → Your project (`arogya-care-rho`) → **Settings** → **Environment Variables**.
2. Add these variables (copy the exact values from your local `.env` file):

| Key | Value |
|-----|-------|
| `VITE_SUPABASE_URL` | `https://ivxnmcgogpbgwfncxhiz.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | (your anon key from .env) |
| `VITE_DEEPSEEK_API_KEY` | (your key from .env) |
| `VITE_OPENAI_API_KEY` | (your key from .env) |
| `VITE_ELEVENLABS_API_KEY` | (your key from .env) |
| `GOMAPS_API_KEY` | (your key from .env) |

3. Make sure each variable is set for **All Environments** (Production, Preview, Development).
4. Click **Save**.

---

## STEP 6: Redeploy on Vercel

After adding the environment variables, Vercel does NOT automatically use them on the existing deployment. You must trigger a fresh deploy:

1. Go to your Vercel project dashboard.
2. Go to **Deployments** tab.
3. Find the latest deployment, click the three dots menu → **Redeploy**.
4. Or alternatively, push any small commit from your terminal:
   ```
   git commit --allow-empty -m "trigger vercel redeploy"
   git push origin main
   ```

---

## STEP 7: Verify Everything Works

After the redeploy completes (usually 30-60 seconds):

1. Open https://arogya-care-rho.vercel.app/ in your browser.
2. Open the browser console (F12 → Console tab).
3. Check that there is NO warning saying "Supabase environment variables are missing or invalid."
4. Test each auth flow:
   - **Sign Up**: Enter a real email + password → you should receive a confirmation email at that address.
   - **Log In**: Use the confirmed email + password → should land on dashboard.
   - **Wrong Password**: Enter intentionally wrong password → should show "Wrong email or password."
   - **OTP Sign In**: Enter email → should receive email with 6-digit code → enter code → lands on dashboard.
   - **Forgot Password**: Enter email → should receive reset email.
   - **Google Sign-In**: Click the button → should redirect to Google account chooser → pick account → lands on dashboard.
   - **Guest Mode**: Click "Continue as Guest" → should land on dashboard (data won't persist between sessions, which is expected).

---

## Security Notes

- Your `.env` file is gitignored and never pushed to GitHub — this is correct.
- All database tables have Row Level Security (RLS) enabled — users can only read/write their own data.
- Each user's health tracking data (water, steps, sleep, BMI, medications, habits, journal) is tied to their `auth.users.id` and persists across sessions/devices.
