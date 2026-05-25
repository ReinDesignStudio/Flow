# Flow Friends-Test Launch Guide

Use this for the first public website test before App Store or Google Play.

## 1. Supabase Checklist

Open Supabase, then go to Authentication > URL Configuration.

For local testing:

- Site URL: `http://127.0.0.1:4173`
- Redirect URLs: `http://127.0.0.1:4173/**`

After the website is deployed, update these:

- Site URL: `https://your-flow-site.netlify.app`
- Redirect URLs:
  - `https://your-flow-site.netlify.app/**`
  - `http://127.0.0.1:4173/**`

Then create a fresh test account. Old confirmation emails may still point to old redirect settings.

## 2. Database Checklist

In Supabase SQL Editor, run:

`supabase-schema.sql`

This creates the profile, category, and expense tables with owner-only security policies.

## 3. Netlify Deploy

1. Go to Netlify.
2. Create a new site.
3. Deploy this project folder.
4. After Netlify gives you a URL, copy it.
5. Put that URL into Supabase Authentication > URL Configuration.
6. Sign up with a new test email.

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
