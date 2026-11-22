# ExOwn passwordless email sign-in setup

This change is additive: Google sign-in, the existing Firebase ID-token-to-HttpOnly-session flow, user sync, and logout are unchanged. Email-link sign-in uses the same Firebase Auth instance and the same server-session endpoint.

## Required Firebase Console configuration

Before enabling this feature in production:

1. Open Firebase Console and select the existing ExOwn Production Firebase project.
2. Go to **Authentication → Sign-in method**.
3. Open **Email/Password** and enable **Email link (passwordless sign-in)**. Do not disable Google.
4. Go to **Authentication → Settings → Authorized domains** and confirm `ex-own.vercel.app` is authorized. Keep the existing Firebase auth domain authorized as well.
5. Check the **Authentication → Templates → Email address verification / Sign-in** email template and make sure the sender/template is appropriate for ExOwn.
6. Save and test with a non-admin test account first.

The login page sends a Firebase sign-in link to the entered email. The user should open the link in the same browser/device where they requested it; if local email storage is unavailable, the page asks them to re-enter the same email address.

## Email/password sign-in configuration

The redesigned login page also offers email + password sign-in, account creation, and password reset through **Firebase Authentication**.

1. In **Authentication → Sign-in method → Email/Password**, enable the **Email/Password** provider (password sign-in). Keep the separate **Email link (passwordless sign-in)** toggle enabled if you want to retain the email-link option.
2. Passwords are sent directly to Firebase Authentication over its SDK flow. ExOwn's application database does not receive or store the user's password; Firebase Auth validates the credential and returns the authenticated Firebase user.
3. Email/password users can create an account from the login page. Existing users can sign in, and **Forgot password?** sends Firebase's reset email.
4. A Google-only account should continue using Google unless the user separately establishes an email/password credential through Firebase's supported flow. The page does not silently link providers or change existing credentials.

## Existing Google accounts and account safety

- Google sign-in remains available and its current popup/redirect fallback is unchanged.
- Keep Firebase's **one account per email address** setting enabled.
- If Firebase reports that an email already uses another provider, the page directs the user to sign in with their existing provider (Google). Do not manually merge accounts or map database users by unverified email.
- Test a Google account first, then request an email link for a separate test account. Also test an email address that already has a Google account to confirm Firebase's provider-collision behavior in this project.

## Admin and moderator MFA

This UI change does not turn on MFA or change account-level Firebase settings. Protect the Google accounts used by ExOwn admins/moderators with Google's 2-Step Verification immediately.

If ExOwn later adopts Firebase TOTP MFA for app-level enforcement, first confirm the project is upgraded to the required Firebase Authentication / Identity Platform configuration, enable TOTP, and test recovery and enrollment for a separate admin account. Do not require MFA for all students until that rollout and account-recovery path are tested.

## Rollout checklist

- [ ] Enable Email link (passwordless) in Firebase Console without disabling Google.
- [ ] Confirm `ex-own.vercel.app` is an authorized domain.
- [ ] Deploy to a preview first.
- [ ] Verify Google sign-in, email-link sign-in, server session creation, user sync, logout, and redirect return.
- [ ] Verify an existing Google account is not silently duplicated.
- [ ] Promote only after the preview tests pass.
