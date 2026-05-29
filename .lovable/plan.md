# Crest Nova Holdings — Build Plan

A premium online banking platform: marketing site + authenticated user dashboard + admin panel, with admin-controlled approvals for all money movement. Backed by Lovable Cloud (auth + Postgres + RLS + storage).

## 1. Backend foundation (Lovable Cloud)

Enable Cloud, then a single migration creates:

- Enums: `app_role` (admin, user), `txn_type` (deposit, withdrawal, transfer, credit, debit, bonus, adjustment), `txn_status` (pending, approved, rejected), `account_status`, `account_type`, `kyc_status`.
- Tables: `profiles`, `user_roles`, `accounts`, `beneficiaries`, `transactions`, `notifications`, `cms_content`, `admin_activity_log`.
- `has_role(uid, role)` SECURITY DEFINER function.
- RLS on every table: users see only their own rows; admins see all via `has_role`.
- GRANTs to `authenticated` and `service_role` on every public table.
- Trigger on `auth.users` insert → creates `profiles` row + default USD checking account; if email = `info@crestnovaholdings.com`, also inserts admin row in `user_roles`.
- Storage buckets: `kyc-docs` (private), `payment-proofs` (private), `cms-banners` (public) with appropriate policies.
- Seed `cms_content` with default hero/services/testimonials/faqs/loans/fx-rates blocks.

## 2. Design system

- Tokens in `src/styles.css` (oklch): navy primary `#0A2540`, gold accent `#C9A961`, light-gray surface, semantic success/danger, gradients (navy→navy-glow, gold sheen), elegant shadow.
- Fonts: Inter (body) + Playfair Display (display) loaded in `__root.tsx`.
- Global primitives: `Navbar` (sticky transparent→solid), `Footer`, `FloatingWhatsApp`, `BackToTop`, `ThemeToggle`, `Sonner` toaster.
- Framer Motion for reveals/counters; Embla for carousels; Recharts for charts.
- Strict semantic tokens — no raw color classes.

## 3. Public site (separate TanStack routes, per-route SEO)

`/`, `/about`, `/services`, `/banking`, `/loans`, `/security`, `/contact` — each with its own `head()` (title, description, og:*). JSON-LD on `/`.

- Home: gradient hero, dual CTAs, animated dashboard mockup with floating cards, animated stat counters; Services grid (8); Why-Us (6); Banking features; Loans (4); Testimonials (Embla, 8 unique randomuser.me portraits, no repeats); Security strip; FAQ accordion (8); CTA band.
- About, Services, Banking, Loans, Security — dedicated pages reusing sections with unique copy/imagery.
- Contact: react-hook-form + Zod, posts to `https://formsubmit.co/info@crestnovaholdings.com` with `_subject`, `_captcha=false`, `_next`; map iframe; phone/address placeholders.
- Floating WhatsApp + back-to-top on every public page.
- Hero/about/security imagery generated via imagegen.

## 4. Auth

Routes: `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-otp` (UI), `/two-factor` (UI).

- Split-screen glass layout (navy gradient + illustration).
- Supabase email/password + Google (via Lovable broker + `configure_social_auth`).
- `onAuthStateChange` listener registered at root before any `getUser` call; cache invalidation on auth change.
- `emailRedirectTo` on signup and `redirectTo` on password reset wired to `/reset-password`.

## 5. User dashboard — `/_authenticated/app/*`

Layout: shadcn collapsible Sidebar + top bar (notifications popover, currency switcher, profile menu, theme toggle).

Pages: Overview (total balance across currencies via FX table from `cms_content`, per-account cards, recent txns, balance trend area chart, spending donut), Accounts (list + open-account request), Transfers, Withdrawals, Deposits (with proof upload to `payment-proofs`), Beneficiaries (CRUD), Transactions (search/filter/paginate), Notifications, Profile/Security (edit profile, change password, 2FA toggle UI).

All write actions call `createServerFn` handlers guarded by `requireSupabaseAuth` that insert `pending` rows — balances are never mutated from user flows.

## 6. Admin dashboard — `/_authenticated/admin/*`

`_admin` pathless layout: `beforeLoad` calls server fn checking `has_role(uid,'admin')`; non-admins redirected to `/app`.

Pages: Overview (KPIs + area/bar charts), Users (table, drawer, freeze/suspend/activate/delete, KYC approve, signed-URL doc viewer), Transactions (full ledger, filters, note, reverse), Pending Approvals (tabbed: Transfers/Withdrawals/Deposits — approve atomically updates balance + status + notifies user), Manual Transaction (deposit/credit/debit/bonus/adjustment applied immediately), CMS (edit hero/services/testimonials/FAQs/loans/banner upload/FX rates), Security (activity log, role mgmt UI).

Every admin write writes to `admin_activity_log`.

## 7. Server functions

- User: `getMyAccounts`, `getMyTransactions`, `requestTransaction`, `addBeneficiary`, `deleteBeneficiary`, `uploadProof`, `markNotificationRead`, `updateProfile`, `changePassword`.
- Admin (each re-checks `has_role` inside the handler in addition to middleware): `listUsers`, `updateUserStatus`, `deleteUser`, `listPendingTransactions`, `approveTransaction`, `rejectTransaction`, `createManualTransaction`, `reverseTransaction`, `updateCmsContent`, `getAdminMetrics`, `listActivityLog`.
- Balance updates happen inside a single Postgres RPC (called by approve/manual/reverse) so update + status + notification are atomic.

## 8. Technical decisions

- TanStack Start file-based routing; route groups `_authenticated/app/*` and `_authenticated/admin/*`.
- TanStack Query (`ensureQueryData` in loaders under `_authenticated`, `useSuspenseQuery` in components). `defaultPreloadStaleTime: 0` already set.
- Zod + react-hook-form for every form.
- shadcn primitives throughout.
- WhatsApp/phone/address use placeholder `+1 (555) 000-0000` with TODO comments for swap.

## 9. Build order (single iteration)

1. Enable Cloud + run schema migration + seed CMS + configure Google OAuth.
2. Tokens, fonts, global primitives (Navbar, Footer, WhatsApp, BackToTop, ThemeToggle).
3. Public routes + contact form + testimonials + generated imagery.
4. Auth pages + Supabase wiring + `_authenticated` and `_admin` guards.
5. User dashboard pages + user server fns.
6. Admin dashboard pages + admin server fns + CMS + activity log.
7. QA mobile + desktop, fix overflow/contrast.

## 10. Out of scope

Real KYC provider, real OTP/SMS, real FX feed, real 2FA — all UI-complete with mock/manual data. Expect minor follow-up polish after first build given scope.