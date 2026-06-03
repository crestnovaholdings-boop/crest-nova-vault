import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useSuspenseQuery, useQueryClient, queryOptions } from "@tanstack/react-query";
import { Suspense, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { listUsers, getUserDetail, createManualTransaction } from "@/lib/banking.functions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, PlusCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fmtMoney } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/manual")({
  component: () => <Suspense fallback={<Loader2 className="h-6 w-6 animate-spin" />}><Page /></Suspense>,
});

const schema = z.object({
  user_id: z.string().uuid(),
  account_id: z.string().uuid(),
  type: z.enum(["deposit", "credit", "debit", "bonus", "adjustment"]),
  amount: z.coerce.number().positive(),
  currency: z.string().length(3),
  description: z.string().max(240).optional(),
});

function Page() {
  const qc = useQueryClient();
  const usersFn = useServerFn(listUsers);
  const detailFn = useServerFn(getUserDetail);
  const createFn = useServerFn(createManualTransaction);
  const { data: users } = useSuspenseQuery(queryOptions({ queryKey: ["admin-users"], queryFn: () => usersFn() }));
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { user_id: "", account_id: "", type: "credit", amount: 0, currency: "USD", description: "" } });
  const userId = form.watch("user_id");

  const detail = useQuery({ queryKey: ["admin-user-detail", userId], queryFn: () => detailFn({ data: { id: userId } }), enabled: !!userId });
  const accounts = useMemo(() => detail.data?.accounts ?? [], [detail.data]);

  const onSubmit = async (v: z.infer<typeof schema>) => {
    setLoading(true);
    try { await createFn({ data: v }); toast.success("Submitted for approval"); form.reset(); qc.invalidateQueries({ queryKey: ["admin-overview"] }); qc.invalidateQueries({ queryKey: ["admin-pending-txns"] }); qc.invalidateQueries({ queryKey: ["admin-all-txns"] }); }
    catch (e) { toast.error((e as Error).message); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div><h1 className="text-2xl font-display flex items-center gap-2"><PlusCircle className="h-5 w-5 text-gold" /> Manual transaction</h1><p className="text-sm text-muted-foreground">Creates a pending entry. Approve it from the Approvals page to update the user's balance.</p></div>
      <Card>
        <CardHeader><CardTitle className="text-base">New manual entry</CardTitle><CardDescription>Use for credits, debits, bonuses, and adjustments.</CardDescription></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="user_id" render={({ field }) => (
                <FormItem><FormLabel>User</FormLabel>
                  <Select onValueChange={(v) => { field.onChange(v); form.setValue("account_id", ""); }} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select user" /></SelectTrigger></FormControl>
                    <SelectContent>{users.map(u => <SelectItem key={u.id} value={u.id}>{u.full_name ?? u.email}</SelectItem>)}</SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="account_id" render={({ field }) => (
                <FormItem><FormLabel>Account</FormLabel>
                  <Select onValueChange={(v) => { field.onChange(v); const a = accounts.find(x => x.id === v); if (a) form.setValue("currency", a.currency); }} value={field.value} disabled={!userId}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger></FormControl>
                    <SelectContent>{accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.account_number} • {fmtMoney(a.balance, a.currency)}</SelectItem>)}</SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="type" render={({ field }) => (
                  <FormItem><FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>{["deposit", "credit", "debit", "bonus", "adjustment"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select><FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="amount" render={({ field }) => (<FormItem><FormLabel>Amount</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
              <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea rows={2} {...field} /></FormControl><FormMessage /></FormItem>)} />
              <Button type="submit" disabled={loading} className="w-full bg-gradient-hero">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post transaction"}</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
