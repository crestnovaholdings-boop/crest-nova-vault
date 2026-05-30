import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useSuspenseQuery, useQueryClient, queryOptions } from "@tanstack/react-query";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getMyDashboard, updateProfile } from "@/lib/banking.functions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, UserCog, KeyRound } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/profile")({
  component: () => <Suspense fallback={<Loader2 className="h-6 w-6 animate-spin" />}><Page /></Suspense>,
});

const schema = z.object({
  full_name: z.string().min(1).optional(),
  phone: z.string().optional(),
  country: z.string().optional(),
  address: z.string().optional(),
});

function Page() {
  const qc = useQueryClient();
  const fn = useServerFn(getMyDashboard);
  const updateFn = useServerFn(updateProfile);
  const { data } = useSuspenseQuery(queryOptions({ queryKey: ["my-dashboard"], queryFn: () => fn() }));
  const [loading, setLoading] = useState(false);
  const [pw, setPw] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { full_name: "", phone: "", country: "", address: "" },
  });

  useEffect(() => {
    if (data.profile) form.reset({
      full_name: data.profile.full_name ?? "", phone: data.profile.phone ?? "",
      country: data.profile.country ?? "", address: data.profile.address ?? "",
    });
  }, [data.profile, form]);

  const onSubmit = async (v: z.infer<typeof schema>) => {
    setLoading(true);
    try { await updateFn({ data: v }); toast.success("Profile updated"); qc.invalidateQueries({ queryKey: ["my-dashboard"] }); }
    catch (e) { toast.error((e as Error).message); } finally { setLoading(false); }
  };

  const onPasswordChange = async () => {
    if (pw.length < 8) return toast.error("At least 8 characters");
    setPwLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setPwLoading(false);
    if (error) return toast.error(error.message);
    setPw(""); toast.success("Password changed");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div><h1 className="text-2xl font-display flex items-center gap-2"><UserCog className="h-5 w-5 text-gold" /> Profile & security</h1></div>
      <Card>
        <CardHeader><CardTitle className="text-base">Personal information</CardTitle><CardDescription>{data.profile?.email}</CardDescription></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="full_name" render={({ field }) => (<FormItem><FormLabel>Full name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <div className="grid md:grid-cols-2 gap-4">
                <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="country" render={({ field }) => (<FormItem><FormLabel>Country</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
              <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <Button type="submit" disabled={loading} className="bg-gradient-hero">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><KeyRound className="h-4 w-4" /> Change password</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Input type="password" placeholder="New password" value={pw} onChange={(e) => setPw(e.target.value)} />
          <Button onClick={onPasswordChange} disabled={pwLoading} className="bg-gradient-hero">{pwLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update password"}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
