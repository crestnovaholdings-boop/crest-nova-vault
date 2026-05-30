import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useSuspenseQuery, useQueryClient, queryOptions } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { getMyAccounts, requestTransaction } from "@/lib/banking.functions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowDownToLine, Upload } from "lucide-react";
import { fmtMoney } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/app/deposits")({
  component: () => <Suspense fallback={<Loader2 className="h-6 w-6 animate-spin" />}><Page /></Suspense>,
});

const schema = z.object({
  account_id: z.string().uuid(),
  amount: z.coerce.number().positive(),
  description: z.string().max(240).optional(),
});

function Page() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const accountsFn = useServerFn(getMyAccounts);
  const reqFn = useServerFn(requestTransaction);
  const { data: accounts } = useSuspenseQuery(queryOptions({ queryKey: ["my-accounts"], queryFn: () => accountsFn() }));
  const [loading, setLoading] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { account_id: "", amount: 0, description: "" } });

  const onSubmit = async (v: z.infer<typeof schema>) => {
    const acct = accounts.find(a => a.id === v.account_id);
    if (!acct) return toast.error("Choose an account");
    if (!user) return;
    setLoading(true);
    try {
      let proof_url: string | undefined;
      if (proofFile) {
        const path = `${user.id}/${Date.now()}-${proofFile.name}`;
        const { error: upErr } = await supabase.storage.from("payment-proofs").upload(path, proofFile);
        if (upErr) throw upErr;
        proof_url = path;
      }
      await reqFn({ data: { ...v, type: "deposit", currency: acct.currency, proof_url } });
      toast.success("Deposit submitted for verification");
      form.reset(); setProofFile(null);
      qc.invalidateQueries({ queryKey: ["my-dashboard"] });
    } catch (e) { toast.error((e as Error).message); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div><h1 className="text-2xl font-display flex items-center gap-2"><ArrowDownToLine className="h-5 w-5 text-gold" /> Make a deposit</h1><p className="text-sm text-muted-foreground">Send funds to our settlement account and upload your proof of payment.</p></div>
      <Card className="bg-muted/30">
        <CardHeader><CardTitle className="text-sm">Wire instructions</CardTitle></CardHeader>
        <CardContent className="text-xs space-y-1 font-mono">
          <div>Beneficiary: Crest Nova Holdings</div>
          <div>Bank: First National Crest</div>
          <div>SWIFT: CRESTNUS33</div>
          <div>Account: 1000-0042-1985</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Deposit details</CardTitle><CardDescription>Funds credited once your proof is verified.</CardDescription></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="account_id" render={({ field }) => (
                <FormItem><FormLabel>Deposit into</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select an account" /></SelectTrigger></FormControl>
                    <SelectContent>{accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.account_number} • {fmtMoney(a.balance, a.currency)}</SelectItem>)}</SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="amount" render={({ field }) => (
                <FormItem><FormLabel>Amount</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Reference / note</FormLabel><FormControl><Textarea rows={2} {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2"><Upload className="h-4 w-4" /> Proof of payment</label>
                <Input type="file" accept="image/*,application/pdf" onChange={(e) => setProofFile(e.target.files?.[0] ?? null)} />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-gradient-hero">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit deposit"}</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
