# Cloudflare Pages Deployment

Use this when moving Flow from Vercel to Cloudflare Pages.

## Cloudflare Pages Settings

- Project name: `get-flow-tracker`
- Production branch: `main`
- Framework preset: `None`
- Build command: `exit 0`
- Build output directory: `.`

Cloudflare will serve the static files from the repository root.

## After The First Deploy

Cloudflare will give you a `pages.dev` URL, usually like:

`https://get-flow-tracker.pages.dev`

Add that URL to Supabase:

- Authentication > URL Configuration > Site URL:
  - `https://get-flow-tracker.pages.dev`
- Authentication > URL Configuration > Redirect URLs:
  - `https://get-flow-tracker.pages.dev/**`
  - `https://get-flow-tracker.vercel.app/**`
  - `http://localhost:4173/**`
  - `http://127.0.0.1:4173/**`

Add this origin to the Google OAuth client:

- Authorized JavaScript origins:
  - `https://get-flow-tracker.pages.dev`

Keep this Google redirect URI:

- Authorized redirect URIs:
  - `https://efdemttulvqaoyltdknz.supabase.co/auth/v1/callback`

## Notes

Do not add a catch-all `_redirects` file while Cloudflare is the live host. Cloudflare Pages also reads `_redirects`, so a Vercel redirect there would send Cloudflare visitors away from the Cloudflare app.
