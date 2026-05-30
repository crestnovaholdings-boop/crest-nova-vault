import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import { listAllTransactions } from "@/lib/banking.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fmtMoney, fmtDate, statusColor } from "@/lib/format";
import { Loader2, Search } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/transactions")({
  component: () => <Suspense fallback={<Loader2 className="h-6 w-6 animate-spin" />}><Page /></Suspense>,
});

function Page() {
  const fn = useServerFn(listAllTransactions);
  const { data } = useSuspenseQuery(queryOptions({ queryKey: ["admin-all-txns"], queryFn: () => fn() }));
  const [q, setQ] = useState("");
  const filtered = data.filter(t => !q || t.reference.toLowerCase().includes(q.toLowerCase()) || t.type.includes(q.toLowerCase()) || t.status.includes(q.toLowerCase()));

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-display">All transactions</h1></div>
      <div className="relative max-w-sm"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search reference, type, status" className="pl-9" /></div>
      <Card><CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>User</TableHead><TableHead>Type</TableHead><TableHead>Ref</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>
            {filtered.map(t => {
              const profile = (t as unknown as { profiles?: { full_name?: string; email?: string } }).profiles;
              return (
                <TableRow key={t.id}>
                  <TableCell className="text-xs">{fmtDate(t.created_at)}</TableCell>
                  <TableCell className="text-xs">{profile?.full_name ?? profile?.email ?? t.user_id.slice(0, 8)}</TableCell>
                  <TableCell className="capitalize">{t.type}</TableCell>
                  <TableCell className="font-mono text-xs">{t.reference}</TableCell>
                  <TableCell className="text-right font-medium">{fmtMoney(t.amount, t.currency)}</TableCell>
                  <TableCell><Badge variant="outline" className={statusColor(t.status)}>{t.status}</Badge></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}
