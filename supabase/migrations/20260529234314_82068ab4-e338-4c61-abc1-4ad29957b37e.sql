
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.account_type AS ENUM ('savings', 'checking', 'business');
CREATE TYPE public.account_status AS ENUM ('active', 'frozen', 'suspended', 'closed');
CREATE TYPE public.kyc_status AS ENUM ('pending', 'approved', 'rejected', 'not_submitted');
CREATE TYPE public.txn_type AS ENUM ('deposit', 'withdrawal', 'transfer', 'credit', 'debit', 'bonus', 'adjustment');
CREATE TYPE public.txn_status AS ENUM ('pending', 'approved', 'rejected', 'reversed');

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  country TEXT,
  address TEXT,
  avatar_url TEXT,
  kyc_status public.kyc_status NOT NULL DEFAULT 'not_submitted',
  account_status public.account_status NOT NULL DEFAULT 'active',
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- ============ ACCOUNTS ============
CREATE TABLE public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_number TEXT NOT NULL UNIQUE,
  currency TEXT NOT NULL DEFAULT 'USD',
  balance NUMERIC(18,2) NOT NULL DEFAULT 0,
  available_balance NUMERIC(18,2) NOT NULL DEFAULT 0,
  type public.account_type NOT NULL DEFAULT 'checking',
  status public.account_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.accounts TO authenticated;
GRANT ALL ON public.accounts TO service_role;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- ============ BENEFICIARIES ============
CREATE TABLE public.beneficiaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  swift TEXT,
  iban TEXT,
  country TEXT,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.beneficiaries TO authenticated;
GRANT ALL ON public.beneficiaries TO service_role;
ALTER TABLE public.beneficiaries ENABLE ROW LEVEL SECURITY;

-- ============ TRANSACTIONS ============
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type public.txn_type NOT NULL,
  amount NUMERIC(18,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status public.txn_status NOT NULL DEFAULT 'pending',
  reference TEXT NOT NULL DEFAULT ('TXN-' || upper(substring(gen_random_uuid()::text, 1, 10))),
  description TEXT,
  beneficiary_id UUID REFERENCES public.beneficiaries(id) ON DELETE SET NULL,
  proof_url TEXT,
  admin_note TEXT,
  created_by TEXT NOT NULL DEFAULT 'user',
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- ============ NOTIFICATIONS ============
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  type TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============ CMS ============
CREATE TABLE public.cms_content (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);
GRANT SELECT ON public.cms_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cms_content TO authenticated;
GRANT ALL ON public.cms_content TO service_role;
ALTER TABLE public.cms_content ENABLE ROW LEVEL SECURITY;

-- ============ ADMIN ACTIVITY LOG ============
CREATE TABLE public.admin_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  details JSONB,
  ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.admin_activity_log TO authenticated;
GRANT ALL ON public.admin_activity_log TO service_role;
ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;

-- ============ RLS POLICIES ============

-- profiles
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete profile" ON public.profiles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- user_roles
CREATE POLICY "Users view own role" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- accounts
CREATE POLICY "Users view own accounts" ON public.accounts FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage accounts" ON public.accounts FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- beneficiaries
CREATE POLICY "Users manage own beneficiaries" ON public.beneficiaries FOR ALL TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')) WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- transactions
CREATE POLICY "Users view own transactions" ON public.transactions FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users create own pending transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND status = 'pending');
CREATE POLICY "Admins manage transactions" ON public.transactions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- notifications
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins manage notifications" ON public.notifications FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- cms public read
CREATE POLICY "Anyone reads cms" ON public.cms_content FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage cms" ON public.cms_content FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- admin activity log
CREATE POLICY "Admins view activity log" ON public.admin_activity_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert activity log" ON public.admin_activity_log FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') AND admin_id = auth.uid());

-- ============ TRIGGER: new user -> profile + account + maybe admin ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_account_no TEXT;
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)));

  v_account_no := '1000' || to_char(floor(random() * 10000000000)::bigint, 'FM0000000000');
  INSERT INTO public.accounts (user_id, account_number, currency, type, balance, available_balance)
  VALUES (NEW.id, v_account_no, 'USD', 'checking', 0, 0);

  -- default user role
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;

  -- admin email auto-grant
  IF lower(NEW.email) = 'info@crestnovaholdings.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  END IF;

  -- welcome notification
  INSERT INTO public.notifications (user_id, title, body, type)
  VALUES (NEW.id, 'Welcome to Crest Nova Holdings', 'Your account has been created successfully. A default USD account is ready for you.', 'success');

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ ATOMIC APPLY TRANSACTION ============
CREATE OR REPLACE FUNCTION public.apply_transaction(_txn_id UUID, _admin_id UUID, _note TEXT DEFAULT NULL)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  t public.transactions%ROWTYPE;
  delta NUMERIC(18,2);
BEGIN
  SELECT * INTO t FROM public.transactions WHERE id = _txn_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Transaction not found'; END IF;
  IF t.status <> 'pending' THEN RAISE EXCEPTION 'Transaction not pending'; END IF;

  delta := CASE
    WHEN t.type IN ('deposit','credit','bonus') THEN t.amount
    WHEN t.type IN ('withdrawal','transfer','debit') THEN -t.amount
    WHEN t.type = 'adjustment' THEN t.amount
    ELSE 0
  END;

  UPDATE public.accounts
  SET balance = balance + delta,
      available_balance = available_balance + delta
  WHERE id = t.account_id;

  UPDATE public.transactions
  SET status = 'approved',
      approved_by = _admin_id,
      processed_at = now(),
      admin_note = COALESCE(_note, admin_note)
  WHERE id = _txn_id;

  INSERT INTO public.notifications (user_id, title, body, type)
  VALUES (t.user_id, 'Transaction approved',
          'Your ' || t.type::text || ' of ' || t.currency || ' ' || t.amount || ' has been approved.', 'success');
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_transaction(_txn_id UUID, _admin_id UUID, _note TEXT DEFAULT NULL)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE t public.transactions%ROWTYPE;
BEGIN
  SELECT * INTO t FROM public.transactions WHERE id = _txn_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Transaction not found'; END IF;
  IF t.status <> 'pending' THEN RAISE EXCEPTION 'Transaction not pending'; END IF;

  UPDATE public.transactions
  SET status = 'rejected', approved_by = _admin_id, processed_at = now(),
      admin_note = COALESCE(_note, admin_note)
  WHERE id = _txn_id;

  INSERT INTO public.notifications (user_id, title, body, type)
  VALUES (t.user_id, 'Transaction rejected',
          'Your ' || t.type::text || ' of ' || t.currency || ' ' || t.amount || ' was rejected.' ||
          COALESCE(' Reason: ' || _note, ''), 'error');
END;
$$;

-- ============ STORAGE BUCKETS ============
INSERT INTO storage.buckets (id, name, public) VALUES
  ('kyc-docs','kyc-docs', false),
  ('payment-proofs','payment-proofs', false),
  ('cms-banners','cms-banners', true)
ON CONFLICT (id) DO NOTHING;

-- storage policies
CREATE POLICY "Users upload own kyc" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'kyc-docs' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users read own kyc" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'kyc-docs' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(), 'admin')));

CREATE POLICY "Users upload own proof" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'payment-proofs' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users read own proof" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'payment-proofs' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(), 'admin')));

CREATE POLICY "Public read banners" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'cms-banners');
CREATE POLICY "Admins manage banners" ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'cms-banners' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'cms-banners' AND public.has_role(auth.uid(), 'admin'));

-- ============ SEED CMS ============
INSERT INTO public.cms_content (key, value) VALUES
('hero', '{"title":"Banking redefined for the modern world","subtitle":"Premium digital banking with global reach, multi-currency accounts, and white-glove service.","cta_primary":"Open an Account","cta_secondary":"Online Banking"}'),
('fx_rates', '{"USD":1,"EUR":1.08,"GBP":1.27,"CAD":0.74,"AUD":0.66,"JPY":0.0067,"CHF":1.13}'),
('contact', '{"phone":"+1 (555) 000-0000","email":"info@crestnovaholdings.com","address":"1 Crest Plaza, New York, NY 10001","whatsapp":"+15550000000"}')
ON CONFLICT (key) DO NOTHING;
