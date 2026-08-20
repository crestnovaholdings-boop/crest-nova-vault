# Clone prompt for a different Lovable account

Note first: a prompt rebuilds the **app** (code, design, schema, logic) identically, but it cannot carry over the **existing rows** in this project's database (users, balances, transactions) — a fresh build starts empty. If you need the live data too, the only exact route is Remix inside the same workspace, or an export/import of the tables afterwards. Everything else below is reproducible from the prompt.

Copy everything between the lines into the new account's first message.

---

Build a complete premium digital banking platform called **Crest Nova Holdings**. Use TanStack Start (React 19 + Vite, SSR), Tailwind v4, shadcn/ui, Framer Motion, Recharts, TanStack Query, and enable Lovable Cloud for the backend. Build the whole thing in one go — public marketing site, auth, user dashboard, and admin console.

**Design system.** Luxury private-bank aesthetic. Define OKLCH semantic tokens in the global stylesheet: deep navy primary, gold accent, soft neutral surfaces, plus glassmorphism utility classes (frosted translucent cards with blur and hairline borders). Never hardcode colours in components. Display serif-adjacent headings paired with a clean sans body. The site must load in **light mode by default** regardless of the OS setting, with a working light/dark toggle. Generous spacing, subtle scroll-reveal animations, animated number counters on stats.

**Public site.** A shared layout with sticky navbar (logo, nav links, theme toggle, Login and Open Account buttons), a rich footer, a Tawk.to live-chat widget, and floating WhatsApp + back-to-top buttons pinned to the **bottom-left**. Contact phone `+1 (229) 689-9274` everywhere, WhatsApp linking to the same number.

Pages, each with its own SEO title/description and a full-bleed hero header image with a dark gradient overlay:
- `/` — landing page: hero with headline and dual CTAs, animated stat counters, feature grid, a dashboard mockup preview, a private-banking split section (image beside copy), a full-width global-footprint banner, an in-branch experience section, a flagship-HQ section, testimonials, FAQ accordion, and a closing CTA band.
- `/about` — mission, values grid, milestones, stats, banking-hall image beside the mission copy.
- `/services` — detailed product grid (personal, business, wealth, cards, FX, treasury) plus a "real bankers" section with a photo.
- `/banking` — online/mobile banking features, benefits list beside a teller photo.
- `/loans` — loan types with indicative rates, eligibility, and a pre-qualification CTA beside a branch photo.
- `/security` — encryption, fraud monitoring, compliance and insurance pillars.
- `/contact` — contact form posting to formsubmit.co, office details, hours, and an embedded map.

Use tasteful stock photography of bank buildings, banking halls, tellers counting cash, and office meetings, reused across headers and side sections.

**Auth.** `/login`, `/register`, `/forgot-password`, `/reset-password` on a shared split-screen auth shell. Email/password plus Google sign-in. **Turn email verification off** — a new signup is confirmed instantly and lands straight in the dashboard. Register is a 4-step stepper with Zod validation at every step: Personal (full name, email, phone, date of birth), Address (street, city, state/region, postal code, country), Financial (occupation, employment status, annual income band, source of funds, last 4 of tax ID), Credentials (password + confirm + terms). Sensitive KYC fields must never be written into auth user metadata — persist them to the database through an authenticated server function immediately after signup.

**Database (Lovable Cloud).**

Enums: `app_role` (admin, user); `account_type` (savings, checking, business); `account_status` (active, frozen, suspended, closed); `kyc_status` (pending, approved, rejected, not_submitted); `txn_type` (deposit, withdrawal, transfer, credit, debit, bonus, adjustment); `txn_status` (pending, approved, rejected, reversed).

Tables (all in public, each with GRANTs, RLS enabled, and policies):
- `profiles` — id (PK, references the auth user), full_name, email, phone, country, address, city, state_region, postal_code, date_of_birth, tax_id_last4, occupation, employment_status, annual_income, source_of_funds, avatar_url, kyc_status, account_status, created_at, updated_at.
- `user_roles` — id, user_id, role (`app_role`), unique(user_id, role). Roles live **only** here, never on profiles.
- `accounts` — id, user_id, account_number (unique), currency default USD, balance and available_balance numeric(18,2), type, status, created_at.
- `beneficiaries` — id, user_id, name, bank_name, account_number, swift, iban, country, currency, created_at.
- `transactions` — id, account_id → accounts, user_id, type, amount numeric(18,2), currency, status default pending, auto-generated `TXN-XXXXXXXXXX` reference, description, beneficiary_id, proof_url, admin_note, created_by ('user' | 'admin'), approved_by, created_at, processed_at.
- `notifications` — id, user_id, title, body, type, read, created_at.
- `cms_content` — key (PK), value jsonb, updated_at, updated_by. Publicly readable, admin-writable.
- `admin_activity_log` — id, admin_id, action, target_type, target_id, details jsonb, ip, user_agent, created_at. Admin read/insert only.

Add explicit foreign keys `transactions.user_id → profiles.id` and `accounts.user_id → profiles.id` so admin joins resolve.

Functions and triggers:
- `has_role(_user_id, _role)` — SQL, STABLE, SECURITY DEFINER, `search_path = public`. Every admin policy uses it, so policies never recurse.
- `handle_new_user()` — SECURITY DEFINER trigger on new auth users: creates the profile, creates a USD checking account with a `1000`-prefixed 14-digit number and zero balance, grants the `user` role, inserts a welcome notification, and auto-grants `admin` when the email matches a designated admin address.
- `apply_transaction(_txn_id, _admin_id, _note)` and `reject_transaction(...)` — SECURITY DEFINER, `EXECUTE` granted to authenticated, each starting with an internal `has_role(auth.uid(),'admin')` check. Approving atomically marks the transaction approved, adjusts the account balance and available balance in the correct direction for the type, stamps processed_at/approved_by, and inserts a user notification. Rejecting marks it rejected with the note and notifies the user.

RLS: users read and write only their own profiles, accounts, beneficiaries, transactions and notifications; admins get full access through `has_role`. Users may insert transactions only with `status = 'pending'` and only against an account they own. `cms_content` is readable by anyone.

Storage buckets: `kyc-docs` (private), `payment-proofs` (private), `cms-banners` (public), with owner-scoped policies on the private ones.

**Server layer.** All backend logic goes in typed server functions (`createServerFn`) guarded by the Supabase auth middleware — no edge functions. **Do not use the service-role key anywhere**; admin operations run as the signed-in admin and are enforced by RLS plus a server-side role check, so the deployment needs zero secrets.

**User dashboard `/app/*`** — collapsible sidebar shell:
- Overview: balance cards, a Recharts balance/activity chart, recent transactions, unread notification count, quick actions.
- Accounts: account cards with number, type, currency, balance, copy-to-clipboard.
- Transfers: send money to a saved beneficiary, creates a pending transaction.
- Withdrawals: withdrawal request form, creates a pending transaction.
- Deposits: deposit request with proof-of-payment file upload to the private bucket.
- Beneficiaries: add, list, delete.
- Transactions: filterable, searchable table with status badges.
- Notifications: list with mark-as-read.
- Profile: editable personal details plus read-only KYC status.

**Admin console `/admin/*`** — separate sidebar shell, reachable only by admins. The route must verify admin status **server-side** in `beforeLoad` and redirect non-admins to `/app`; never trust a client-side flag alone.
- Overview: KPI cards (total users, pending approvals, total balance) and recent activity.
- Users: searchable list, drill into a user's profile, accounts, transactions and roles; change account status and KYC status.
- Approvals: queue of every pending transaction with user and account details, Approve / Reject with an optional note. Approving is the only thing that moves a balance.
- Transactions: full ledger with filters.
- Manual entry: admin creates a deposit/credit/debit/bonus/adjustment for any user's account. It is inserted as **pending** and only affects the balance once approved in Approvals.
- CMS: JSON editor for `cms_content` keys.
- Activity: audit log of every admin action.

Log every admin action to `admin_activity_log`.

**Acceptance criteria.** A new signup lands in the dashboard with no email step and an auto-created account. A user transfer request appears in admin Approvals. Approving it updates the user's balance and sends them a notification. An admin manual entry stays pending until approved. A non-admin visiting `/admin` is redirected to `/app`. Every public page renders in light mode with its hero image, chat widget, and bottom-left floating buttons.

---

## After pasting the prompt

1. Replace the admin auto-grant email in `handle_new_user` with your own, then sign up with it to get the admin role.
2. Re-point the third-party bits to your own accounts: Tawk.to property id, formsubmit.co endpoint, phone/WhatsApp number if different.
3. Configure Google sign-in and set the site/redirect URLs.
4. If you also need this project's existing rows, export each table here and import them into the clone after recreating the auth users (ids will differ, so remap `user_id`/`account_id` on the way in).
