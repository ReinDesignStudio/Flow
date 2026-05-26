# Flow Friends-Test Launch Guide

Use this for the first public website test before App Store or Google Play.

## 1. Supabase Checklist

Open Supabase, then go to Authentication > URL Configuration.

For local testing:

- Site URL: `http://127.0.0.1:4173`
- Redirect URLs: `http://127.0.0.1:4173/**`

After the website is deployed, update these:

- Site URL: `https://your-flow-site.pages.dev`
- Redirect URLs:
  - `https://your-flow-site.pages.dev/**`
  - `http://127.0.0.1:4173/**`

Then create a fresh test account. Old confirmation emails may still point to old redirect settings.

## 2. Database Checklist

In Supabase SQL Editor, run:

`supabase-schema.sql`

This creates the profile, category, and expense tables with owner-only security policies.

## 3. Cloudflare Pages Deploy

1. Go to Cloudflare Dashboard > Workers & Pages.
2. Create a Pages project.
3. Connect the GitHub repository: `ReinDesignStudio/Flow`.
4. Use these build settings:
   - Framework preset: `None`
   - Build command: `exit 0`
   - Build output directory: `.`
   - Root directory: leave blank
5. Deploy the `main` branch.
6. After Cloudflare gives you a `pages.dev` URL, copy it.
7. Put that URL into Supabase Authentication > URL Configuration.
8. Sign up with a new test email.

## 4. Phone Test

Test these before sharing with friends:

- Sign up
- Confirm email
- Sign in
- Save an expense
- Edit and delete an expense
- Add a category
- Open Insights
- Install to Home Screen on iPhone
- Install app on Android Chrome
- Turn off Wi-Fi, save an expense, then reconnect

## 5. Beta Warning

For the first friends test, ask each tester to use their own phone/browser. Do not test multiple user accounts on the same device until account-scoped local storage is finished.
