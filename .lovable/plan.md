## Short answer

No — the service role key is **not** required for the admin panel. It currently bypasses RLS for convenience, but the same operations can run as the signed-in admin user if we add RLS policies that grant admins access using the existing `has_role(auth.uid(), 'admin')` function.

## Plan

### 1. Database migration: add admin RLS policies

Add `admin`-scoped policies (using `public.has_role(auth.uid(), 'admin')`) on every table the admin panel touches, so an authenticated admin user can perform the same reads/writes the service role currently does:

- `profiles` — admin SELECT/UPDATE all rows
- `accounts` — admin SELECT all rows
- `transactions` — admin SELECT/UPDATE all rows
- `user_roles` — admin SELECT all rows
- `notifications` — admin INSERT (so `apply_transaction` / `reject_transaction` notifications still work; those are SECURITY DEFINER so already fine, but covers any direct inserts)
- `cms_content` — admin SELECT/INSERT/UPDATE
- `admin_activity_log` — admin SELECT/INSERT

Also ensure the RPCs `apply_transaction` and `reject_transaction` (already `SECURITY DEFINER`) can be called by authenticated admins — grant `EXECUTE` to `authenticated` if not already, and add an internal `has_role` check at the top of each so non-admins can't call them.

### 2. Rewrite `src/lib/banking.functions.ts`

- Drop `supabaseAdmin` import entirely.
- Replace every `supabaseAdmin.from(...)` call inside admin server functions with `context.supabase` (the user-scoped client from `requireSupabaseAuth`). RLS will enforce admin access.
- Keep `requireAdmin(userId)` as a defense-in-depth check using `context.supabase` reading `user_roles`.
- `completeRegistrationProfile`: this is the one tricky case — it runs right after sign-up before the user has any custom claims and writes to `profiles`. Convert it to require auth (`requireSupabaseAuth`) and write via `context.supabase`; the existing self-update RLS policy on `profiles` already covers `auth.uid() = id`. Remove the write-once `tax_id_last4` guard from the server (RLS + a CHECK or trigger can enforce it) or keep it as an app-level check via `context.supabase`.
- `verifyAdmin`: use `context.supabase` to read `user_roles`.

### 3. Update `src/integrations/supabase/client.server.ts` usage

No code change to the file itself (auto-generated), but after step 2 nothing in the project imports it anymore. The `SUPABASE_SERVICE_ROLE_KEY` env var becomes unused and can be left unset in Cloudflare.

### 4. Verify

- Log in as admin → admin panel loads, lists users/transactions, approve/reject works.
- Log in as regular user → `/admin` redirects to `/app` (existing `beforeLoad` guard still works because `verifyAdmin` now runs as the user).
- Sign up a new user → registration completes and profile fields persist.

## Technical notes

- The `handle_new_user` trigger is `SECURITY DEFINER` so it still runs on signup without RLS issues.
- `apply_transaction` / `reject_transaction` are `SECURITY DEFINER` — they bypass RLS when updating balances and inserting notifications, so step 1's notification policy is only needed if any direct inserts happen.
- No frontend route or component changes needed beyond what the rewritten server fns return.
- Result: Cloudflare deployment needs **zero** secrets. Everything runs with the public anon key + the user's bearer token.

Want me to proceed?