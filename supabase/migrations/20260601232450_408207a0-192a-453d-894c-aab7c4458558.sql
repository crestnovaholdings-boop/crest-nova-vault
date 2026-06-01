
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS tax_id_last4 text,
  ADD COLUMN IF NOT EXISTS occupation text,
  ADD COLUMN IF NOT EXISTS employment_status text,
  ADD COLUMN IF NOT EXISTS annual_income text,
  ADD COLUMN IF NOT EXISTS source_of_funds text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS state_region text,
  ADD COLUMN IF NOT EXISTS postal_code text,
  ADD COLUMN IF NOT EXISTS preferred_account_type text,
  ADD COLUMN IF NOT EXISTS preferred_currency text,
  ADD COLUMN IF NOT EXISTS marketing_opt_in boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_account_no TEXT;
  v_meta jsonb := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  v_currency TEXT := COALESCE(NULLIF(v_meta->>'preferred_currency',''), 'USD');
  v_acct_type TEXT := COALESCE(NULLIF(v_meta->>'preferred_account_type',''), 'checking');
  v_dob DATE;
BEGIN
  BEGIN
    v_dob := NULLIF(v_meta->>'date_of_birth','')::date;
  EXCEPTION WHEN OTHERS THEN v_dob := NULL; END;

  INSERT INTO public.profiles (
    id, email, full_name, phone, country, address,
    date_of_birth, tax_id_last4, occupation, employment_status,
    annual_income, source_of_funds, city, state_region, postal_code,
    preferred_account_type, preferred_currency, marketing_opt_in
  ) VALUES (
    NEW.id, NEW.email,
    COALESCE(v_meta->>'full_name', split_part(NEW.email, '@', 1)),
    NULLIF(v_meta->>'phone',''),
    NULLIF(v_meta->>'country',''),
    NULLIF(v_meta->>'address',''),
    v_dob,
    NULLIF(v_meta->>'tax_id_last4',''),
    NULLIF(v_meta->>'occupation',''),
    NULLIF(v_meta->>'employment_status',''),
    NULLIF(v_meta->>'annual_income',''),
    NULLIF(v_meta->>'source_of_funds',''),
    NULLIF(v_meta->>'city',''),
    NULLIF(v_meta->>'state_region',''),
    NULLIF(v_meta->>'postal_code',''),
    v_acct_type,
    v_currency,
    COALESCE((v_meta->>'marketing_opt_in')::boolean, false)
  );

  v_account_no := '1000' || to_char(floor(random() * 10000000000)::bigint, 'FM0000000000');
  INSERT INTO public.accounts (user_id, account_number, currency, type, balance, available_balance)
  VALUES (NEW.id, v_account_no, v_currency,
          (CASE WHEN v_acct_type IN ('checking','savings','business') THEN v_acct_type ELSE 'checking' END)::account_type,
          0, 0);

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;

  IF lower(NEW.email) = 'info@crestnovaholdings.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  END IF;

  INSERT INTO public.notifications (user_id, title, body, type)
  VALUES (NEW.id, 'Welcome to Crest Nova Holdings',
          'Your account has been created successfully. Your ' || v_currency || ' ' || v_acct_type || ' account is ready.', 'success');

  RETURN NEW;
END;
$function$;
