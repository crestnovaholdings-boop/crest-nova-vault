
CREATE OR REPLACE FUNCTION public.apply_transaction(_txn_id uuid, _admin_id uuid, _note text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  t public.transactions%ROWTYPE;
  delta NUMERIC(18,2);
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

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
$function$;

CREATE OR REPLACE FUNCTION public.reject_transaction(_txn_id uuid, _admin_id uuid, _note text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE t public.transactions%ROWTYPE;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

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
$function$;
