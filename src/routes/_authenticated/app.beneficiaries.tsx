import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useSuspenseQuery, useQueryClient, queryOptions } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { addBeneficiary, deleteBeneficiary, getMyBeneficiaries } from "@/lib/banking.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Plus, Trash2, Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/beneficiaries")({
  component: () => <Suspense fallback={<Loader2 className="h-6 w-6 animate-spin" />}><Page /></Suspense>,
});

const schema = z.object({
  name: z.string().min(1),
  bank_name: z.string().min(1),
  account_number: z.string().min(3),
  currency: z.string().length(3),
  country: z.string().optional(),
  swift: z.string().optional(),
  iban: z.string().optional(),
});

function Page() {
  const qc = useQueryClient();
  const listFn = useServerFn(getMyBeneficiaries);
  const addFn = useServerFn(addBeneficiary);
  const delFn = useServerFn(deleteBeneficiary);
  const { data } = useSuspenseQuery(queryOptions({ queryKey: ["my-beneficiaries"], queryFn: () => listFn() }));
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { name: "", bank_name: "", account_number: "", currency: "USD", country: "", swift: "", iban: "" } });

  const onAdd = async (v: z.infer<typeof schema>) => {
    setLoading(true);
    try { await addFn({ data: v }); toast.success("Beneficiary added"); setOpen(false); form.reset(); qc.invalidateQueries({ queryKey: ["my-beneficiaries"] }); }
    catch (e) { toast.error((e as Error).message); } finally { setLoading(false); }
  };
  const onDel = async (id: string) => { try { await delFn({ data: { id } }); toast.success("Removed"); qc.invalidateQueries({ queryKey: ["my-beneficiaries"] }); } catch (e) { toast.error((e as Error).message); } };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-display flex items-center gap-2"><Users className="h-5 w-5 text-gold" /> Beneficiaries</h1><p className="text-sm text-muted-foreground">Saved recipients for fast transfers.</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="bg-gradient-hero"><Plus className="h-4 w-4" /> Add</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New beneficiary</DialogTitle></DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onAdd)} className="space-y-3">
                <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Full name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="bank_name" render={({ field }) => (<FormItem><FormLabel>Bank</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="account_number" render={({ field }) => (<FormItem><FormLabel>Account number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="currency" render={({ field }) => (<FormItem><FormLabel>Currency</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="country" render={({ field }) => (<FormItem><FormLabel>Country</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="swift" render={({ field }) => (<FormItem><FormLabel>SWIFT</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="iban" render={({ field }) => (<FormItem><FormLabel>IBAN</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-gradient-hero">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.length === 0 ? <Card className="md:col-span-2 lg:col-span-3"><CardContent className="text-center py-12 text-sm text-muted-foreground">No beneficiaries yet</CardContent></Card> :
          data.map((b) => (
            <Card key={b.id}>
              <CardHeader className="pb-2"><CardTitle className="text-base flex justify-between items-start">{b.name}<Button variant="ghost" size="icon" onClick={() => onDel(b.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></CardTitle></CardHeader>
              <CardContent className="text-sm space-y-1">
                <div className="text-muted-foreground">{b.bank_name}</div>
                <div className="font-mono text-xs">{b.account_number}</div>
                <div className="text-xs">{b.currency} • {b.country ?? "—"}</div>
                {b.swift && <div className="text-xs text-muted-foreground">SWIFT: {b.swift}</div>}
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
