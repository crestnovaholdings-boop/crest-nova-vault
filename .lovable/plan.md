# Cloning Crest Nova Holdings — Full Rebuild Guide

A complete recipe to recreate this project (frontend, backend, data, config, deployment) in a brand-new project or environment.

## 1. What exists today

**Stack:** TanStack Start v1 (React 19, Vite 7, SSR) + Tailwind v4 + shadcn/ui + Framer Motion + Recharts + TanStack Query, backend on Lovable Cloud (Supabase), deployable to Cloudflare Workers.

**Public site routes:** `/` (long-form landing: hero, stats, feature grids, private-banking split, global footprint banner, in-branch section, flagship HQ, CTA), `/about`, `/services`, `/banking`, `/loans`, `/security`, `/contact` (formsubmit.co + map).

**Auth routes:** `/login`, `/register` (4-step stepper: Personal → Address → Financial → Credentials), `/forgot-password`, `/reset-password`. Email verification is off (auto-confirm). Google OAuth via the Lovable broker.

**User dashboard `/app/*`:** overview (charts + balances), accounts, transfers, withdrawals, deposits (proof upload), beneficiaries, transactions, notifications, profile.

**Admin console `/admin/*`:** KPI overview, users (status/KYC control), approvals queue, all-transactions ledger, manual entry, CMS JSON editor, activity log. Admin access is verified server-side (`verifyAdmin`) plus RLS; no service-role key is used anywhere.

**Shared shell:** `Navbar`, `Footer`, floating WhatsApp + back-to-top (bottom-left), Tawk.to live chat, light-mode-by-default theme provider.

**Contact details baked into the UI:** phone `+1 (229) 689-9274` (also the WhatsApp link).

## 2. Clone order (do these in sequence)

### Step 1 — Copy the codebase
Copy the whole repo except generated/environment files: skip `node_modules`, `.env`, `src/routeTree.gen.ts` (regenerated on dev start), and `supabase/config.toml` (regenerated with the new project ref). Keep `src/`, `supabase/migrations/`, `package.json`, `vite.config.ts`, `wrangler.jsonc`, `tsconfig.json`, `components.json`, lint/format configs.

Do **not** hand-copy `src/integrations/supabase/client.ts`, `client.server.ts`, `auth-middleware.ts`, `auth-attacher.ts`, `types.ts` — these are regenerated when Cloud is enabled on the new project. Note that `client.ts` currently carries hardcoded public URL/anon-key fallbacks for Cloudflare; the clone needs the *new* project's values there instead.

### Step 2 — Enable Cloud on the clone
Turn on Lovable Cloud so a fresh Supabase project, `.env`, and the integration files are generated.

### Step 3 — Recreate the schema
Apply the 7 existing migrations in `supabase/migrations/`, in filename order, byte-for-byte through the migration tool. They create:

- **Enums:** `app_role`, `account_type`, `account_status`, `kyc_status`, `txn_type`, `txn_status`
- **Tables:** `profiles`, `user_roles`, `accounts`, `beneficiaries`, `transactions`, `notifications`, `cms_content`, `admin_activity_log` — each with GRANTs, RLS enabled, and policies (owner-scoped + `has_role(auth.uid(),'admin')`)
- **Functions:** `has_role` (SECURITY DEFINER), `handle_new_user` trigger (creates profile + a `1000…`-prefixed USD checking account + `user` role + welcome notification, and auto-grants `admin` to a hardcoded email), `apply_transaction` / `reject_transaction` (SECURITY DEFINER, internal admin check, `EXECUTE` granted to `authenticated`)
- **Later migrations add:** extended KYC profile columns (DOB, tax_id_last4, city, state_region, postal_code, occupation, employment_status, annual_income, source_of_funds), the security-hardening policy rewrites, and explicit FKs `transactions.user_id → profiles.id` and `accounts.user_id → profiles.id` (required so the admin joins resolve)

**Change before applying:** the admin auto-grant email inside `handle_new_user` is hardcoded to `info@crestnovaholdings.com`. Set it to the clone's admin address, or drop that block and grant the role manually.

### Step 4 — Recreate storage
Create three buckets: `kyc-docs` (private), `payment-proofs` (private), `cms-banners` (public), plus owner-only read/insert/update/delete policies on the two private buckets. Re-upload any objects that must carry over.

### Step 5 — Migrate the cloud data
Order matters because of FKs and the signup trigger.

1. **Auth users first.** `auth.users` rows cannot be copied by SQL. For each user, create the account in the clone (Auth Admin API or manual invite) and record the **old id → new id** mapping. The `handle_new_user` trigger fires and auto-creates a profile + account + role + notification for each one.
2. **Export the source data** from the current project, one CSV/JSON per table: `profiles`, `user_roles`, `accounts`, `beneficiaries`, `transactions`, `notifications`, `cms_content`, `admin_activity_log`.
3. **Import with remapped ids.** Because the trigger already made a profile/account row per user: `UPDATE` profiles (names, phone, address, KYC/status, the extended KYC fields) rather than inserting; either update the trigger-created account or delete it and insert the originals verbatim (keep original `accounts.id` so `transactions.account_id` still resolves). Then insert `beneficiaries`, `transactions` (preserve `reference`, `status`, `created_at`, `processed_at`, remap `approved_by`), `notifications`, `cms_content` (straight copy), `admin_activity_log` (optional; historical audit trail).
4. **Roles:** insert `user_roles` rows for every admin in the clone; verify each user has exactly the roles they had before.
5. **Verify:** row counts per table match, `sum(accounts.balance)` matches, no orphan `transactions.account_id`/`user_id`, every user has ≥1 role.

If the source is a live production site, freeze admin approvals during the export so balances do not drift mid-migration.

### Step 6 — Auth configuration on the clone
- Email confirmation **off** (auto-confirm signups).
- Google provider enabled and configured (needed the same day sign-in goes live, or it errors "Unsupported provider").
- Site URL + redirect URLs set to the clone's preview and production origins.
- Password reset redirect pointed at the clone's `/reset-password`.

### Step 7 — Third-party bits to re-point
- **Tawk.to** — `src/components/site/tawkto.tsx` embeds a property-specific widget id; swap for the clone's own property.
- **formsubmit.co** — the contact form posts to a specific email endpoint; update it and re-confirm the address.
- **Phone/WhatsApp** — update in `contact.tsx`, `register.tsx`, `floating-buttons.tsx`, and the footer if the clone uses a different number.
- **Images** — the marketing photos are remote URLs; keep them or re-host.
- **Branding** — bank name, copy, and SEO `head()` titles/descriptions appear in every route file; update all of them.

### Step 8 — Deployment
- Publish from Lovable, or push to GitHub and build on Cloudflare Workers.
- Cloudflare needs the build-time `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID` for the clone plus the server-side `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY`. **No service-role key is required** — every admin operation runs as the signed-in admin under RLS.

### Step 9 — Acceptance checks on the clone
Sign up a fresh user → lands in `/app` with an auto-created account, no email step. Request a transfer → appears in admin approvals. Admin approves → user balance updates and a notification arrives. Admin manual entry → stays pending until approved. Non-admin hitting `/admin` → redirected to `/app`. Landing pages render in light mode with images, chat widget, and left-side floating buttons. Contact form delivers.

## 3. Technical notes

- **Design system:** OKLCH tokens in `src/styles.css` (navy primary, gold accent) with glassmorphism utilities; components use semantic tokens only, so the palette can be reskinned by editing tokens alone.
- **Server boundary:** all backend logic lives in `src/lib/banking.functions.ts` as `createServerFn` handlers with `requireSupabaseAuth`; there are no Supabase edge functions to migrate.
- **Auth gate:** `src/routes/_authenticated.tsx` (client-only gate) plus a server-side `verifyAdmin()` in `_authenticated/admin.tsx`'s `beforeLoad`.
- **Known constraint:** the live database was unreachable while writing this plan, so exact row counts and current CMS keys are not listed here — Step 5's export will enumerate them.

## 4. Effort shape

Code copy + Cloud enable + migrations: fast and mechanical. The real work is Step 5 (auth user recreation and id remapping) and Step 7 (third-party re-pointing). Budget most of the time there.
