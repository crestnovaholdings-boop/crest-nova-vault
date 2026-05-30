import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useSuspenseQuery, useQueryClient, queryOptions } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { listUsers, updateUserStatus } from "@/lib/banking.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fmtDate } from "@/lib/format";
import { Loader2, Search } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: () => <Suspense fallback={<Loader2 className="h-6 w-6 animate-spin" />}><Page /></Suspense>,
});

function Page() {
  const qc = useQueryClient();
  const fn = useServerFn(listUsers);
  const updateFn = useServerFn(updateUserStatus);
  const { data } = useSuspenseQuery(queryOptions({ queryKey: ["admin-users"], queryFn: () => fn() }));
  const [q, setQ] = useState("");
  const filtered = data.filter(u => !q || (u.full_name ?? "").toLowerCase().includes(q.toLowerCase()) || (u.email ?? "").toLowerCase().includes(q.toLowerCase()));

  const update = async (id: string, field: "account_status" | "kyc_status", value: string) => {
    try { await updateFn({ data: { id, [field]: value } as never }); toast.success("Updated"); qc.invalidateQueries({ queryKey: ["admin-users"] }); }
    catch (e) { toast.error((e as Error).message); }
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-display">Users</h1></div>
      <div className="relative max-w-sm"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or email" className="pl-9" /></div>
      <Card><CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Joined</TableHead><TableHead>Account</TableHead><TableHead>KYC</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {filtered.map(u => (
              <TableRow key={u.id}>
                <TableCell>{u.full_name ?? "—"}</TableCell>
                <TableCell className="text-xs">{u.email}</TableCell>
                <TableCell className="text-xs">{fmtDate(u.created_at)}</TableCell>
                <TableCell><Badge variant="outline">{u.account_status}</Badge></TableCell>
                <TableCell><Badge variant="outline">{u.kyc_status}</Badge></TableCell>
                <TableCell className="flex gap-2">
                  <Select onValueChange={(v) => update(u.id, "account_status", v)}>
                    <SelectTrigger className="h-8 w-32"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>{["active", "frozen", "suspended", "closed"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                  <Button size="sm" variant="outline" onClick={() => update(u.id, "kyc_status", "approved")}>Approve KYC</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}
