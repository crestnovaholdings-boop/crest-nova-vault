import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useSuspenseQuery, useQueryClient, queryOptions } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { listPendingTransactions, approveTransaction, rejectTransaction } from "@/lib/banking.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fmtMoney, fmtDate } from "@/lib/format";
import { Loader2, Check, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/approvals")({
  component: () => <Suspense fallback={<Loader2 className="h-6 w-6 animate-spin" />}><Page /></Suspense>,
});

function Page() {
  const qc = useQueryClient();
  const fn = useServerFn(listPendingTransactions);
  const approveFn = useServerFn(approveTransaction);
  const rejectFn = useServerFn(rejectTransaction);
  const { data } = useSuspenseQuery(queryOptions({ queryKey: ["admin-pending"], queryFn: () => fn() }));
  const [notes, setNotes] = useState<Record<string, string>>({});

  const invalidate = () => { qc.invalidateQueries({ queryKey: ["admin-pending"] }); qc.invalidateQueries({ queryKey: ["admin-overview"] }); };
  const approve = async (id: string) => { try { await approveFn({ data: { id, note: notes[id] } }); toast.success("Approved"); invalidate(); } catch (e) { toast.error((e as Error).message); } };
  const reject = async (id: string) => { try { await rejectFn({ data: { id, note: notes[id] } }); toast.success("Rejected"); invalidate(); } catch (e) { toast.error((e as Error).message); } };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-display">Pending approvals</h1><p className="text-sm text-muted-foreground">{data.length} item(s) awaiting decision.</p></div>
      <Card><CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>User</TableHead><TableHead>Type</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Ref</TableHead><TableHead>Note</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
          <TableBody>
            {data.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No pending items</TableCell></TableRow> :
              data.map((t) => {
                const profile = (t as unknown as { profiles?: { full_name?: string; email?: string } }).profiles;
                return (
                  <TableRow key={t.id}>
                    <TableCell className="text-xs">{fmtDate(t.created_at)}</TableCell>
                    <TableCell className="text-xs">{profile?.full_name ?? profile?.email ?? t.user_id.slice(0, 8)}</TableCell>
                    <TableCell className="capitalize">{t.type}</TableCell>
                    <TableCell className="text-right font-medium">{fmtMoney(t.amount, t.currency)}</TableCell>
                    <TableCell className="font-mono text-xs">{t.reference}</TableCell>
                    <TableCell><Input className="h-8 w-40" placeholder="Admin note" value={notes[t.id] ?? ""} onChange={(e) => setNotes(n => ({ ...n, [t.id]: e.target.value }))} /></TableCell>
                    <TableCell className="flex gap-2">
                      <Button size="sm" onClick={() => approve(t.id)} className="bg-success hover:bg-success/90"><Check className="h-3 w-3" /></Button>
                      <Button size="sm" variant="destructive" onClick={() => reject(t.id)}><X className="h-3 w-3" /></Button>
                    </TableCell>
                  </TableRow>
                );
              })
            }
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}
