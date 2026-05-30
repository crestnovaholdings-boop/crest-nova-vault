import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMyDashboard } from "@/lib/banking.functions";
import { fmtMoney, fmtDate, statusColor } from "@/lib/format";
import { Wallet, TrendingUp, Bell, CreditCard, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from "recharts";

export const Route = createFileRoute("/_authenticated/app/")({
  component: Overview,
});

function Overview() {
  return <Suspense fallback={<Loader2 className="h-6 w-6 animate-spin" />}><OverviewInner /></Suspense>;
}

function OverviewInner() {
  const fn = useServerFn(getMyDashboard);
  const { data } = useSuspenseQuery(queryOptions({ queryKey: ["my-dashboard"], queryFn: () => fn() }));

  const totalByCurrency = data.accounts.reduce<Record<string, number>>((acc, a) => {
    acc[a.currency] = (acc[a.currency] ?? 0) + Number(a.balance);
    return acc;
  }, {});

  const trend = data.recent.slice(0, 12).reverse().map((t, i) => ({
    name: i.toString(),
    v: Number(t.amount) * (["deposit", "credit", "bonus"].includes(t.type) ? 1 : -1),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display">Welcome back, {data.profile?.full_name ?? "Client"}</h1>
        <p className="text-sm text-muted-foreground">Here's a snapshot of your portfolio today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Object.entries(totalByCurrency).map(([cur, sum]) => (
          <Card key={cur} className="bg-gradient-hero text-white border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-wider text-white/70 flex items-center gap-2"><Wallet className="h-3 w-3" /> Total {cur}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-display">{fmtMoney(sum, cur)}</div>
              <div className="text-xs text-white/60 mt-1">Across {data.accounts.filter(a => a.currency === cur).length} account(s)</div>
            </CardContent>
          </Card>
        ))}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2"><Bell className="h-3 w-3" /> Notifications</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-display">{data.unreadCount}</div><div className="text-xs text-muted-foreground mt-1">Unread alerts</div></CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Recent activity</CardTitle></CardHeader>
          <CardContent className="h-64">
            {trend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend}>
                  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} /><stop offset="100%" stopColor="var(--primary)" stopOpacity={0} /></linearGradient></defs>
                  <XAxis dataKey="name" hide /><Tooltip formatter={(v: number) => fmtMoney(v)} />
                  <Area type="monotone" dataKey="v" stroke="var(--primary)" fill="url(#g)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No activity yet</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><CreditCard className="h-4 w-4" /> Your accounts</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {data.accounts.map((a) => (
              <div key={a.id} className="flex justify-between items-center p-3 rounded-md border bg-card">
                <div>
                  <div className="text-xs text-muted-foreground capitalize">{a.type} • {a.currency}</div>
                  <div className="font-mono text-xs">{a.account_number}</div>
                </div>
                <div className="text-right">
                  <div className="font-display text-lg">{fmtMoney(a.balance, a.currency)}</div>
                  <Badge variant="outline" className="text-[10px]">{a.status}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Latest transactions</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Reference</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {data.recent.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No transactions yet</TableCell></TableRow>
              ) : data.recent.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="text-xs">{fmtDate(t.created_at)}</TableCell>
                  <TableCell className="capitalize">{t.type}</TableCell>
                  <TableCell className="font-mono text-xs">{t.reference}</TableCell>
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
