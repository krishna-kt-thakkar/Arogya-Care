# AarogyaCare — Auth & Login System Fix (Root Cause Found)
### Prepared for: Antigravity (AI Coding Agent)
### Project: AarogyaCare — github.com/krishna-kt-thakkar/Arogya-Care
### Live: https://arogya-care-rho.vercel.app/
### This file addresses ONE specific critical bug family: the entire authentication system (login, signup, OTP, Google Sign-In, forgot password) is wired to silently fall back to fake local "mock" users whenever anything goes wrong — which is why it looks broken from the outside even though real Supabase code exists underneath.

---

## 0. THE ROOT CAUSE (read this first — it explains every symptom reported)

In `src/contexts/AuthContext.tsx`, every single auth function (`login`, `signup`, `sendOtp`, `verifyOtp`, `resetPassword`, `signInWithGoogle`) follows this exact pattern:

```
try {
  if (hasSupabaseConfig) {
    // call real Supabase function
    return { success: true };
  }
} catch (error) {
  console.warn('Real X failed, using fallback simulation:', error?.message);
}
// Simulate successful X anyway
const mockUser = { id: 'mock-' + Date.now(), ... };
sessionStorage.setItem('arogya_guest_mode', JSON.stringify(mockUser));
setUser(mockUser);
return { success: true };
```

This means: if the real Supabase call fails for ANY reason at all (missing environment variables on Vercel, wrong Supabase project settings, network hiccup, rate limit, wrong OAuth config, anything) — the app does **not** show the user an error. It silently invents a fake user that only exists in that one browser tab's `sessionStorage`, and tells the UI "success: true" as if everything worked. This is why:

- OTP "doesn't arrive" but the app still says "OTP sent, check your inbox" (the real send failed silently, fallback claimed success)
- Signing up again with the same email doesn't say "account exists" — it just makes a new fake mock user each time, so it looks like duplicate signup is "allowed" but nothing is actually being saved to the real database
- Data doesn't persist between sessions/devices — because a `mock-` user's ID changes every single time (`'mock-' + Date.now()`), it is never the same user twice, so nothing can be tied back to a real account
- `signInWithGoogle` specifically is even more broken — see section 2, it never even attempts the real Google OAuth at all

**This is the single most important fix in the whole project.** Once this fallback pattern is removed and real errors are surfaced instead, most of the reported symptoms become visible, debuggable, and fixable — right now they're being actively hidden by "fake success" responses.

---

## 1. FIX: Remove all mock/fallback logic from `AuthContext.tsx`, surface real errors instead

**File:** `src/contexts/AuthContext.tsx`

For every one of `login`, `signup`, `sendOtp`, `verifyOtp`, `resetPassword`:

1. Delete the `catch` block's fallback-to-mock-user logic entirely. Replace it with: catch the real error, extract `error.message`, and `return { success: false, error: error.message || 'Something went wrong. Please try again.' }`.
2. Delete the `sessionStorage.setItem('arogya_guest_mode', ...)` calls from inside these functions — `arogya_guest_mode` should be reserved *only* for the explicit, user-initiated `continueAsGuest()` function (that one is fine as-is, since it's an intentional feature, not a silent fallback).
3. Remove the `hasSupabaseConfig` conditional branching inside these functions — if Supabase isn't configured, that is itself a real error worth surfacing (`"Service temporarily unavailable — please try again shortly"`), not a reason to fake success.
4. Specifically for `signup`: Supabase's real `signUp` call returns a specific error when the email already exists (error message typically contains "already registered" or the user object comes back with an empty `identities` array for an existing-but-unconfirmed account). Detect this case and return a clear, distinct message: `{ success: false, error: 'An account with this email already exists. Please log in instead.' }` — and in `LandingPage.tsx`, when this specific error is received, automatically switch `authMode` to `'login'` and pre-fill the email field, rather than leaving the user stuck on the signup form.

**Acceptance criteria:** Every auth action either genuinely succeeds against the real Supabase backend, or shows a real, specific, honest error message. No code path silently fabricates a user.

---

## 2. FIX: Google Sign-In is 100% fake — wire it to the real Supabase OAuth call

**File:** `src/contexts/AuthContext.tsx`

Current code for `signInWithGoogle`:
```
const signInWithGoogle = async (): Promise<boolean> => {
  // Instantly simulate a successful Google user login
  console.log('Simulating Google Sign-in...');
  const mockUser = { id: 'google-mock-' + Date.now(), name: 'Google User', email: 'google-user@gmail.com', ... };
  sessionStorage.setItem('arogya_guest_mode', JSON.stringify(mockUser));
  setUser(mockUser);
  return true;
};
```
This **never calls Google or Supabase at all** — it's entirely hardcoded to fake a login as a fixed dummy "google-user@gmail.com" identity, no matter who clicks it or what Google account they have. Meanwhile, the *real* implementation already exists correctly in `src/hooks/useSupabaseAuth.ts`:
```
const signInWithGoogle = async () => {
  return await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin }
  })
}
```
This real function is imported into `AuthContext.tsx` as `supabaseSignInWithGoogle` but is **never actually called anywhere** — dead code.

**Fix steps:**
1. Replace the fake `signInWithGoogle` in `AuthContext.tsx` with a call to the real `supabaseSignInWithGoogle()`. Since OAuth is a full-page redirect flow (the browser navigates away to Google's login screen and back), this function should just trigger the redirect and return `true` if the redirect call itself didn't error — the actual "did the user end up logged in" outcome is detected separately, after redirect, by the existing `onAuthStateChange` listener in `useSupabaseAuth.ts` (already correctly wired to update `user` state).
2. In `LandingPage.tsx`'s `handleGoogleSignIn`, remove any expectation of an immediate synchronous "success" — after triggering `signInWithGoogle()`, the browser will navigate away entirely, so there's nothing more to do in that handler except show a loading state before redirect. The `navigate('/dashboard')` for the Google flow should happen automatically once the user lands back on the app and `AuthContext`'s `useEffect` (which watches `supabaseUser`) detects a real logged-in user — add a `useEffect` in `LandingPage.tsx` (or better, in a top-level route guard) that calls `navigate('/dashboard')` whenever `user` becomes truthy, so it works uniformly for every auth method (password login, OTP, Google) instead of each handler manually calling `navigate` after its own success.
3. **Supabase Dashboard configuration required (not code) — tell me to check this:** Google OAuth must be enabled under Supabase project → Authentication → Providers → Google, with a valid Google Cloud OAuth Client ID/Secret entered, and the exact Supabase callback URL (`https://<project-ref>.supabase.co/auth/v1/callback`) added to the Google Cloud Console's "Authorized redirect URIs." Additionally, the production URL (`https://arogya-care-rho.vercel.app`) must be added to Supabase's Authentication → URL Configuration → "Redirect URLs" allow-list, or Supabase will reject the redirect after Google login with an error. If this dashboard config is missing, the button will correctly show a real error now (instead of silently faking success), which will make this misconfiguration visible and fixable.

**Acceptance criteria:** Clicking "Sign In with Google" redirects to Google's real account chooser, and after choosing an account, redirects back to AarogyaCare fully logged in as that real Google account — and this identity persists correctly in Supabase, tied to that Google email, on every future login.

---

## 3. FIX: OTP not arriving — two separate causes to check

**Cause A — code:** Once section 1's fix is applied, `sendOtp` will show a real error if the send genuinely fails, instead of pretending success. Test again after that fix and see what real error (if any) appears.

**Cause B — Supabase Dashboard email template (not code — tell me to check this directly):** Supabase's default "Magic Link" email template only contains a clickable magic-link button, **not a 6-digit numeric code**, unless the template has been explicitly edited to include the `{{ .Token }}` variable. Since this app's UI expects the user to type a 6-digit code (`otpCode` state, 6 separate digit inputs), the Supabase Dashboard → Authentication → Email Templates → "Magic Link" template must be edited to display `{{ .Token }}` prominently in the email body (e.g. "Your verification code is: {{ .Token }}"), otherwise users will receive an email with only a link and no visible code to type in, which looks exactly like "OTP is not arriving" even though technically an email was sent.

**Also remove this dangerous fallback in `verifyOtp`:**
```
// Simulator: Accept any 6-digit code to allow testing
const mockUser = { id: 'mock-' + Date.now(), ... };
setUser(mockUser);
return { success: true };
```
This currently means **any random 6 digits typed in will successfully "verify" and log someone in** if the real verification throws for any reason — this is both a functional bug and a security hole. Remove it entirely per section 1's fix (real errors only, no fallback).

**Acceptance criteria:** A user requesting an OTP receives a real email within a normal delay containing an actual visible 6-digit code (not just a link), and entering an incorrect code is genuinely rejected with a real error.

---

## 4. FIX: Add "I'm not a robot" verification (CAPTCHA)

Supabase Auth has native built-in support for hCaptcha (and Cloudflare Turnstile) bot protection — this doesn't need a custom-built captcha.

**Fix steps:**
1. Sign up for a free hCaptcha site key at hcaptcha.com (or use Cloudflare Turnstile, also natively supported), and enable it under Supabase Dashboard → Authentication → Settings → "Enable CAPTCHA protection," entering the secret key there.
2. In the frontend, add the hCaptcha React widget (`@hcaptcha/react-hcaptcha` npm package) to the login and signup forms in `LandingPage.tsx`, rendered just above the submit button.
3. On successful captcha completion, it returns a `captchaToken` — pass this token into the Supabase calls in `useSupabaseAuth.ts` via the `options.captchaToken` field on `signUp`, `signInWithPassword`, and `signInWithOtp` calls.
4. Disable the submit button until the captcha is completed, with a small helper text ("Please verify you're not a robot") if someone tries to submit before completing it.

**Acceptance criteria:** Login and signup forms show a visible "I'm not a robot" style challenge before allowing submission, and Supabase actually validates the token server-side (confirm this by temporarily entering a wrong/expired token and confirming Supabase rejects it).

---

## 5. FIX: "Continue" / navigation not happening after login actions

Once the mock-fallback logic (section 1) is removed and Google Sign-In (section 2) properly triggers a redirect-based flow, add ONE centralized navigation effect instead of scattering `navigate('/dashboard')` calls across every individual handler:

In whatever top-level component wraps the app's routes (or in `LandingPage.tsx` itself), add:
```
useEffect(() => {
  if (user && !isLoading) {
    navigate('/dashboard', { replace: true });
  }
}, [user, isLoading]);
```
This guarantees that **no matter which auth method succeeds** (password login, OTP verification, Google OAuth redirect-back, forgot-password-then-login), the moment `AuthContext`'s `user` state becomes truthy, the app moves to the dashboard automatically — this directly fixes the "theme login page mein hai par aage continue nahi hota" symptom, since right now some paths (notably Google) never call `navigate` at all after setting the user.

**Acceptance criteria:** Every successful auth path (password, OTP, Google) reliably lands the user on `/dashboard` with no manual retry or refresh needed.

---

## 6. FIX: Browser/device "Back" button doesn't behave inside the auth portal

**Problem:** `authMode` (`'login' | 'signup' | 'otp-send' | 'otp-verify' | 'forgot' | 'email-sent'`) is plain React state, not reflected in the URL. In-app "← Back" links inside each auth view already exist and work (confirmed in code for OTP verify, OTP send, and forgot-password views), but the device/browser back button doesn't step backward through these modes — it just leaves the page entirely, which feels broken on mobile where people rely on the hardware/gesture back button.

**Fix steps:**
1. Reflect `authMode` in the URL using a query parameter (e.g. `/?mode=otp-send`, `/?mode=forgot`) via `useSearchParams` from `react-router-dom`, updating it every time `switchAuthTo()` is called, and reading the initial mode from the URL on mount.
2. This automatically makes the browser/device back button step backward through auth modes correctly, since each mode change becomes a real history entry.
3. Keep the existing in-app "← Back" buttons as-is (they're well implemented already) — just also push/replace the URL alongside `setAuthMode` calls.

**Acceptance criteria:** Pressing the phone's back gesture or the browser's back button while on the OTP/forgot-password screens returns to the previous auth step, not out of the app entirely.

---

## 7. FIX: Ensure same-email accounts always resolve to login, never create duplicates

This is largely fixed by section 1 (removing the mock fallback that fabricated a new `mock-<timestamp>` user on every attempt), but confirm explicitly:

1. After section 1's fix, attempting to sign up with an email that already has a real Supabase account should return Supabase's real "already registered" style error — surface this to the UI as described in section 1, point 4, and auto-switch to login mode with the email pre-filled.
2. Verify Supabase Dashboard → Authentication → Settings → "Confirm email" behavior: if a user signed up but never confirmed their email, and tries to sign up again with the same email, Supabase's behavior differs slightly (it may resend confirmation instead of erroring) — handle this case too: if `data.user` exists but `data.session` is null AND this is a repeat signup attempt, show "We've re-sent your confirmation email — please check your inbox," rather than treating it as a fresh signup.
3. Confirm the `user_profiles` table insert in `useSupabaseAuth.ts`'s `signUp` function uses `user_id` as a unique/foreign key correctly tied to `auth.users.id` (already looks correct in the code) so that once real duplicate-signup handling is in place, there is truly one profile row per real account, and all tracker data (`water_intake`, `steps_tracking`, etc., all already keyed by `user_id` in `useHealthData.ts`) reliably reappears on every future login by that same email.

**Acceptance criteria:** Signing up twice with the same email never creates two separate identities — the second attempt is clearly told to log in instead, and logging in afterward shows all previously saved tracker data for that account.

---

## 8. VERCEL ENVIRONMENT VARIABLES — CHECK THIS SEPARATELY FROM CODE

Since `.env` is (correctly) gitignored and not committed to GitHub, Vercel does **not** automatically know your Supabase keys — they must be entered manually in the Vercel project dashboard.

**Action (not code — do this directly in Vercel, then redeploy):**
1. Go to the Vercel project for `arogya-care-rho` → Settings → Environment Variables.
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (and any other `VITE_...` keys the app uses — OpenAI/DeepSeek/ElevenLabs/Maps keys if those features are meant to work live) with their real current values (freshly rotated ones, per the earlier security fix-plan doc — never the old leaked ones).
3. Redeploy after adding env vars — Vercel does not retroactively apply new env vars to an already-built deployment; a fresh deploy is required.
4. Confirm by opening the browser console on the live site after redeploy — the `console.warn('⚠️ Supabase environment variables are missing or invalid.')` message from `src/lib/supabase.ts` should no longer appear if configured correctly.

**This single step may resolve a large portion of the reported symptoms on its own**, since a missing/invalid env var on Vercel is exactly the condition that triggers every one of the silent mock-fallbacks described above.

---

## 9. TEST SEQUENCE — RUN THIS FULL CHECKLIST AFTER ALL FIXES ABOVE

1. Open browser console on the live site — confirm no Supabase config warning.
2. Sign up with a brand-new real email + password → confirm a real confirmation email arrives (or session starts immediately if email confirmation is disabled) → confirm error states show correctly for a weak password or invalid email format.
3. Try signing up again with that exact same email → confirm it clearly says the account exists and offers to log in, not a silent new fake account.
4. Log in with that same email + correct password → lands on dashboard automatically.
5. Log in with an intentionally wrong password → see a real, specific error (not a silent fake login).
6. Request OTP with a real email → receive a real email with a visible 6-digit code within a reasonable time → enter it correctly → lands on dashboard. Then repeat and enter a deliberately wrong code → confirm it's genuinely rejected.
7. Click "Forgot Password" → receive a real reset email → complete the reset flow → log in with the new password.
8. Click "Sign In with Google" → confirms real Google account chooser appears → pick an account → lands back on dashboard as that real Google identity.
9. Use the phone's back gesture / browser back button while on the OTP screen → confirms it steps back to the previous auth screen instead of exiting.
10. Log out, log back in with the same original email → confirm all previously logged tracker data (water/steps/sleep/etc.) is still there, proving it's tied to a real persistent account and not a `mock-` session that reset.

Only once every item above passes for real should this be considered fixed and demo-ready.
