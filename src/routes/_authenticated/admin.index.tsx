import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Suspense } from "react";
import { getAdminOverview } from "@/lib/banking.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fmtMoney, fmtDate, statusColor } from "@/lib/format";
import { Loader2, Users, Wallet, Clock, Activity } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: () => <Suspense fallback={<Loader2 className="h-6 w-6 animate-spin" />}><Page /></Suspense>,
});

function Page() {
  const fn = useServerFn(getAdminOverview);
  const { data } = useSuspenseQuery(queryOptions({ queryKey: ["admin-overview"], queryFn: () => fn() }));
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-display">Admin overview</h1><p className="text-sm text-muted-foreground">Operational snapshot.</p></div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2"><Users className="h-3 w-3" /> Users</CardTitle></CardHeader><CardContent><div className="text-3xl font-display">{data.userCount}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2"><Wallet className="h-3 w-3" /> Custody (USD-equiv)</CardTitle></CardHeader><CardContent><div className="text-3xl font-display">{fmtMoney(data.totalBalance)}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2"><Clock className="h-3 w-3" /> Pending approvals</CardTitle></CardHeader><CardContent><div className="text-3xl font-display">{data.pendingCount}</div></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4" /> Recent transactions</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {data.recent.map(t => (
                <TableRow key={t.id}>
                  <TableCell className="text-xs">{fmtDate(t.created_at)}</TableCell>
                  <TableCell className="capitalize">{t.type}</TableCell>
                  <TableCell className="text-right font-medium">{fmtMoney(t.amount, t.currency)}</TableCell>
                  <TableCell><Badge variant="outline" className={statusColor(t.status)}>{t.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
