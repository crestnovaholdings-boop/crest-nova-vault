
## What's happening

Two symptoms, one root cause: your self-hosted Cloudflare build doesn't have the Supabase env vars baked in.

1. **"Missing env variables" in console** → `src/integrations/supabase/client.ts` reads `import.meta.env.VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. Vite inlines these **at build time**. If they're missing during `bun run build` on Cloudflare, the client throws on first use.
2. **"Page not found" after login** → the login handler calls `supabase.auth.signInWithPassword`, which throws because the Supabase client can't initialize without those env vars. The redirect to `/app` then renders against a crashed auth context, surfacing as 404/blank.

I checked: `.env` is **tracked in git** and not ignored, but Cloudflare's build pipeline does **not** automatically load committed `.env` files unless you tell it to — and even when it does, secrets should live in the Cloudflare dashboard, not in the repo.

## Fix (one-time setup)

### 1. Add the build-time env vars in Cloudflare

In the Cloudflare dashboard → your Workers/Pages project → **Settings → Variables and Secrets → Build-time variables** (or **Environment variables** for Pages), add for the **Production** environment:

```
VITE_SUPABASE_URL              = https://irigretbbszpjnadlpxp.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY  = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyaWdyZXRiYnN6cGpuYWRscHhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwODI3MzgsImV4cCI6MjA5NTY1ODczOH0.nG64lFdLzUzGcF5LiYtQUbUAyfYuj8ADOsGjRH08quw
VITE_SUPABASE_PROJECT_ID       = irigretbbszpjnadlpxp
```

These must be **build-time** (not just runtime) because Vite replaces `import.meta.env.VITE_*` during the build, not at request time. The publishable/anon key is safe to expose — it's already public.

### 2. Add the runtime (server-side) vars as Worker secrets

For `requireSupabaseAuth` and `supabaseAdmin` (server functions running in the Worker), add as **Worker secrets / runtime variables**:

```
SUPABASE_URL                   = https://irigretbbszpjnadlpxp.supabase.co
SUPABASE_PUBLISHABLE_KEY       = (same anon key as above)
SUPABASE_SERVICE_ROLE_KEY      = (from Lovable Cloud → Backend → API keys; service_role)
```

Mark `SUPABASE_SERVICE_ROLE_KEY` as an **encrypted secret** — never commit it.

### 3. Trigger a fresh build

Push an empty commit or click **Retry deployment** in Cloudflare so the new env values are picked up. The deploy from before the variables existed is permanently broken — no amount of redeploying the same artifact will fix it.

### 4. Verify

After deploy:
- Open the site, check console: no "missing env variable" error.
- Log in → should land on `/app` (or `/admin`) cleanly.

## Why not just commit `.env`?

It's already tracked, but:
- The service role key must **never** sit in git.
- Cloudflare-managed env vars are the standard mechanism and survive repo rewrites, branch switches, and preview vs production differences.
- Keeps your Lovable preview and Cloudflare prod from drifting.

## Notes

No code changes needed — the app is wired correctly. This is purely deployment configuration on Cloudflare's side. Once set, you won't need to repeat it unless you rotate keys.
