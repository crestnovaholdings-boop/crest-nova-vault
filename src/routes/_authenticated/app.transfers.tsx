import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useSuspenseQuery, useQueryClient, queryOptions } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { getMyAccounts, getMyBeneficiaries, requestTransaction } from "@/lib/banking.functions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowLeftRight } from "lucide-react";
import { fmtMoney } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/app/transfers")({
  component: () => <Suspense fallback={<Loader2 className="h-6 w-6 animate-spin" />}><TransferInner /></Suspense>,
});

const schema = z.object({
  account_id: z.string().uuid(),
  beneficiary_id: z.string().uuid(),
  amount: z.coerce.number().positive(),
  description: z.string().max(240).optional(),
});

function TransferInner() {
  const qc = useQueryClient();
  const accountsFn = useServerFn(getMyAccounts);
  const benFn = useServerFn(getMyBeneficiaries);
  const reqFn = useServerFn(requestTransaction);
  const { data: accounts } = useSuspenseQuery(queryOptions({ queryKey: ["my-accounts"], queryFn: () => accountsFn() }));
  const { data: beneficiaries } = useSuspenseQuery(queryOptions({ queryKey: ["my-beneficiaries"], queryFn: () => benFn() }));
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { account_id: "", beneficiary_id: "", amount: 0, description: "" } });

  const onSubmit = async (v: z.infer<typeof schema>) => {
    const acct = accounts.find(a => a.id === v.account_id);
    if (!acct) return toast.error("Choose an account");
    setLoading(true);
    try {
      await reqFn({ data: { ...v, type: "transfer", currency: acct.currency } });
      toast.success("Transfer submitted for approval");
      form.reset();
      qc.invalidateQueries({ queryKey: ["my-dashboard"] });
    } catch (e) { toast.error((e as Error).message); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div><h1 className="text-2xl font-display flex items-center gap-2"><ArrowLeftRight className="h-5 w-5 text-gold" /> New transfer</h1><p className="text-sm text-muted-foreground">Send funds to a saved beneficiary. All transfers are reviewed for security.</p></div>
      <Card>
        <CardHeader><CardTitle className="text-base">Transfer details</CardTitle><CardDescription>Pending approval typically completes within 1 business day.</CardDescription></CardHeader>
        <CardContent>
          {beneficiaries.length === 0 ? (
            <div className="text-sm text-muted-foreground py-4">Add a beneficiary first from the Beneficiaries page.</div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="account_id" render={({ field }) => (
                  <FormItem><FormLabel>From account</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select an account" /></SelectTrigger></FormControl>
                      <SelectContent>{accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.account_number} • {fmtMoney(a.available_balance, a.currency)}</SelectItem>)}</SelectContent>
                    </Select><FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="beneficiary_id" render={({ field }) => (
                  <FormItem><FormLabel>To beneficiary</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select recipient" /></SelectTrigger></FormControl>
                      <SelectContent>{beneficiaries.map(b => <SelectItem key={b.id} value={b.id}>{b.name} • {b.bank_name}</SelectItem>)}</SelectContent>
                    </Select><FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="amount" render={({ field }) => (
                  <FormItem><FormLabel>Amount</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Note (optional)</FormLabel><FormControl><Textarea rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit" disabled={loading} className="w-full bg-gradient-hero">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit transfer"}</Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
