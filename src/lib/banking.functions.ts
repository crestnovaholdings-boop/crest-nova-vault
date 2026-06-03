import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const requireAdmin = async (supabase: ReturnType<typeof import("@supabase/supabase-js").createClient>, userId: string) => {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error || !data) throw new Error("Forbidden");
};

const logAdmin = (
  supabase: ReturnType<typeof import("@supabase/supabase-js").createClient>,
  admin_id: string,
  action: string,
  target_type?: string,
  target_id?: string,
  details?: unknown,
) =>
  supabase.from("admin_activity_log").insert({
    admin_id, action, target_type: target_type ?? null, target_id: target_id ?? null,
    details: (details ?? null) as never,
  });

/* ============ USER ============ */

export const getMyDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ data: profile }, { data: accounts }, { data: recent }, { data: unread }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("accounts").select("*").eq("user_id", userId).order("created_at"),
      supabase.from("transactions").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(10),
      supabase.from("notifications").select("id").eq("user_id", userId).eq("read", false),
    ]);
    return {
      profile,
      accounts: accounts ?? [],
      recent: recent ?? [],
      unreadCount: unread?.length ?? 0,
    };
  });

export const getMyAccounts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("accounts").select("*").order("created_at");
    return data ?? [];
  });

export const getMyTransactions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("transactions").select("*").order("created_at", { ascending: false }).limit(200);
    return data ?? [];
  });

export const getMyBeneficiaries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("beneficiaries").select("*").order("created_at", { ascending: false });
    return data ?? [];
  });

export const getMyNotifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(100);
    return data ?? [];
  });

export const markNotificationRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    await context.supabase.from("notifications").update({ read: true }).eq("id", data.id);
    return { ok: true };
  });

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    full_name: z.string().min(1).max(120).optional(),
    phone: z.string().max(40).optional(),
    country: z.string().max(80).optional(),
    address: z.string().max(240).optional(),
  }))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("profiles").update(data).eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const addBeneficiary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    name: z.string().min(1).max(120),
    bank_name: z.string().min(1).max(120),
    account_number: z.string().min(3).max(40),
    currency: z.string().min(3).max(3).default("USD"),
    country: z.string().max(80).optional(),
    swift: z.string().max(20).optional(),
    iban: z.string().max(40).optional(),
  }))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("beneficiaries").insert({ ...data, user_id: context.userId });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteBeneficiary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    await context.supabase.from("beneficiaries").delete().eq("id", data.id);
    return { ok: true };
  });

const txnRequestSchema = z.object({
  account_id: z.string().uuid(),
  type: z.enum(["withdrawal", "transfer", "deposit"]),
  amount: z.number().positive().max(10_000_000),
  currency: z.string().min(3).max(3),
  description: z.string().max(240).optional(),
  beneficiary_id: z.string().uuid().optional(),
  proof_url: z.string().max(500).optional(),
});

export const requestTransaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(txnRequestSchema)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("transactions").insert({
      ...data,
      user_id: context.userId,
      status: "pending",
      created_by: "user",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ============ ADMIN ============ */

export const verifyAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    return { isAdmin: !!data };
  });

/* ============ REGISTRATION PROFILE COMPLETION ============ */

const completeProfileSchema = z.object({
  date_of_birth: z.string().optional().nullable(),
  tax_id_last4: z.string().regex(/^\d{4}$/).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  address: z.string().max(200).optional().nullable(),
  city: z.string().max(80).optional().nullable(),
  state_region: z.string().max(80).optional().nullable(),
  postal_code: z.string().max(20).optional().nullable(),
  country: z.string().max(80).optional().nullable(),
  occupation: z.string().max(120).optional().nullable(),
  employment_status: z.string().max(40).optional().nullable(),
  annual_income: z.string().max(40).optional().nullable(),
  source_of_funds: z.string().max(40).optional().nullable(),
});

// Called right after sign-up; user is authenticated and writes their own profile via RLS.
// First-write only: refuses to overwrite once tax_id_last4 is already set.
export const completeRegistrationProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => completeProfileSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: existing } = await supabase
      .from("profiles")
      .select("tax_id_last4")
      .eq("id", userId)
      .maybeSingle();
    if (!existing) throw new Error("Profile not found");
    if (existing.tax_id_last4) throw new Error("Profile already completed");
    const { error } = await supabase
      .from("profiles")
      .update(data)
      .eq("id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });


export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    await requireAdmin(supabase, context.userId);
    const [users, accounts, txns, pending] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("accounts").select("balance, currency"),
      supabase.from("transactions").select("id, amount, currency, status, type, created_at").order("created_at", { ascending: false }).limit(30),
      supabase.from("transactions").select("id", { count: "exact", head: true }).eq("status", "pending"),
    ]);
    const totalBalance = (accounts.data ?? []).reduce((s, a) => s + Number(a.balance ?? 0), 0);
    return {
      userCount: users.count ?? 0,
      pendingCount: pending.count ?? 0,
      totalBalance,
      recent: txns.data ?? [],
    };
  });

export const listUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    await requireAdmin(supabase, context.userId);
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    return data ?? [];
  });

export const getUserDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    await requireAdmin(supabase, context.userId);
    const [{ data: profile }, { data: accounts }, { data: txns }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", data.id).maybeSingle(),
      supabase.from("accounts").select("*").eq("user_id", data.id),
      supabase.from("transactions").select("*").eq("user_id", data.id).order("created_at", { ascending: false }).limit(50),
      supabase.from("user_roles").select("role").eq("user_id", data.id),
    ]);
    return { profile, accounts: accounts ?? [], txns: txns ?? [], roles: roles ?? [] };
  });

export const updateUserStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    id: z.string().uuid(),
    account_status: z.enum(["active", "frozen", "suspended", "closed"]).optional(),
    kyc_status: z.enum(["not_submitted", "pending", "approved", "rejected"]).optional(),
  }))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    await requireAdmin(supabase, context.userId);
    const update: { account_status?: "active" | "frozen" | "suspended" | "closed"; kyc_status?: "not_submitted" | "pending" | "approved" | "rejected" } = {};
    if (data.account_status) update.account_status = data.account_status;
    if (data.kyc_status) update.kyc_status = data.kyc_status;
    const { error } = await supabase.from("profiles").update(update).eq("id", data.id);
    if (error) throw new Error(error.message);
    await logAdmin(supabase, context.userId, "update_user_status", "user", data.id, update);
    return { ok: true };
  });

export const listPendingTransactions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    await requireAdmin(supabase, context.userId);
    const { data } = await supabase
      .from("transactions").select("*, profiles:user_id(full_name,email), accounts:account_id(account_number,currency,balance)")
      .eq("status", "pending").order("created_at", { ascending: false });
    return data ?? [];
  });

export const listAllTransactions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    await requireAdmin(supabase, context.userId);
    const { data } = await supabase
      .from("transactions").select("*, profiles:user_id(full_name,email)")
      .order("created_at", { ascending: false }).limit(500);
    return data ?? [];
  });

export const approveTransaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid(), note: z.string().max(500).optional() }))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    await requireAdmin(supabase, context.userId);
    const { error } = await supabase.rpc("apply_transaction", {
      _txn_id: data.id, _admin_id: context.userId, _note: data.note,
    });
    if (error) throw new Error(error.message);
    await logAdmin(supabase, context.userId, "approve_transaction", "transaction", data.id);
    return { ok: true };
  });

export const rejectTransaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid(), note: z.string().max(500).optional() }))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    await requireAdmin(supabase, context.userId);
    const { error } = await supabase.rpc("reject_transaction", {
      _txn_id: data.id, _admin_id: context.userId, _note: data.note,
    });
    if (error) throw new Error(error.message);
    await logAdmin(supabase, context.userId, "reject_transaction", "transaction", data.id);
    return { ok: true };
  });

export const createManualTransaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    user_id: z.string().uuid(),
    account_id: z.string().uuid(),
    type: z.enum(["deposit", "credit", "debit", "bonus", "adjustment"]),
    amount: z.number().positive().max(100_000_000),
    currency: z.string().min(3).max(3),
    description: z.string().max(240).optional(),
  }))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    await requireAdmin(supabase, context.userId);
    const { data: inserted, error } = await supabase.from("transactions").insert({
      ...data, status: "pending", created_by: "admin",
    }).select("id").single();
    if (error || !inserted) throw new Error(error?.message ?? "insert failed");
    const { error: rpcErr } = await supabase.rpc("apply_transaction", {
      _txn_id: inserted.id, _admin_id: context.userId, _note: "Manual admin entry",
    });
    if (rpcErr) throw new Error(rpcErr.message);
    await logAdmin(supabase, context.userId, "manual_transaction", "transaction", inserted.id, data);
    return { ok: true };
  });

export const listCms = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    await requireAdmin(supabase, context.userId);
    const { data } = await supabase.from("cms_content").select("*").order("key");
    return data ?? [];
  });

export const updateCms = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ key: z.string().min(1).max(120), value: z.unknown() }))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    await requireAdmin(supabase, context.userId);
    const { error } = await supabase.from("cms_content").upsert({
      key: data.key, value: data.value as never, updated_by: context.userId, updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
    await logAdmin(supabase, context.userId, "update_cms", "cms", data.key);
    return { ok: true };
  });

export const listActivityLog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    await requireAdmin(supabase, context.userId);
    const { data } = await supabase.from("admin_activity_log").select("*").order("created_at", { ascending: false }).limit(200);
    return data ?? [];
  });
