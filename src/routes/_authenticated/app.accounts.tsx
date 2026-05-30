import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Suspense } from "react";
import { getMyAccounts } from "@/lib/banking.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fmtMoney } from "@/lib/format";
import { Loader2, CreditCard } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/accounts")({ component: () => <Suspense fallback={<Loader2 className="h-6 w-6 animate-spin" />}><AccountsInner /></Suspense> });

function AccountsInner() {
  const fn = useServerFn(getMyAccounts);
  const { data } = useSuspenseQuery(queryOptions({ queryKey: ["my-accounts"], queryFn: () => fn() }));
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-display">Accounts</h1><p className="text-sm text-muted-foreground">All your Crest Nova accounts in one place.</p></div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.map((a) => (
          <Card key={a.id} className="overflow-hidden">
            <div className="bg-gradient-hero p-5 text-white">
              <div className="flex justify-between items-start">
                <CreditCard className="h-5 w-5 text-gold" />
                <Badge className="bg-white/10 text-white border-0 capitalize">{a.type}</Badge>
              </div>
              <div className="mt-6 font-mono text-sm tracking-wider">{a.account_number.replace(/(.{4})/g, "$1 ").trim()}</div>
              <div className="mt-1 text-xs text-white/60">{a.currency} • {a.status}</div>
            </div>
            <CardContent className="pt-4">
              <div className="text-xs text-muted-foreground">Available balance</div>
              <div className="text-2xl font-display">{fmtMoney(a.available_balance, a.currency)}</div>
              <div className="text-xs text-muted-foreground mt-2">Ledger: {fmtMoney(a.balance, a.currency)}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
