
-- 1) user_roles: prevent self-grant. Replace permissive ALL with explicit admin-only writes.
DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
CREATE POLICY "Admins insert roles" ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update roles" ON public.user_roles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete roles" ON public.user_roles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 2) profiles: add INSERT policy (own row only, or admin)
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- 3) transactions: ensure account belongs to user
DROP POLICY IF EXISTS "Users create own pending transactions" ON public.transactions;
CREATE POLICY "Users create own pending transactions" ON public.transactions FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND status = 'pending'::txn_status
    AND EXISTS (SELECT 1 FROM public.accounts a WHERE a.id = account_id AND a.user_id = auth.uid())
  );

-- 4) Storage: add UPDATE/DELETE policies scoped to owner folder for kyc-docs and payment-proofs
CREATE POLICY "Users update own kyc docs" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'kyc-docs' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'kyc-docs' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own kyc docs" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'kyc-docs' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Admins manage kyc docs" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'kyc-docs' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'kyc-docs' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users update own payment proofs" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'payment-proofs' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'payment-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own payment proofs" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'payment-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Admins manage payment proofs" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'payment-proofs' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'payment-proofs' AND public.has_role(auth.uid(), 'admin'));

-- 5) cms-banners: keep public read for individual objects, but it's already public.
-- To prevent broad listing while still allowing direct object access, no extra select policy needed beyond existing.
-- We add admin-only write/delete policies for cms-banners.
CREATE POLICY "Admins manage cms banners" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'cms-banners' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'cms-banners' AND public.has_role(auth.uid(), 'admin'));

-- 6) Revoke EXECUTE on privileged SECURITY DEFINER functions from authenticated/anon.
REVOKE EXECUTE ON FUNCTION public.apply_transaction(uuid, uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.reject_transaction(uuid, uuid, text) FROM PUBLIC, anon, authenticated;
-- handle_new_user is invoked by trigger; revoke too.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
-- has_role must remain callable by authenticated for RLS policy evaluation.
