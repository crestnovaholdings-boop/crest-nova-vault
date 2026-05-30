import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Suspense } from "react";
import { listActivityLog } from "@/lib/banking.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fmtDate } from "@/lib/format";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/activity")({
  component: () => <Suspense fallback={<Loader2 className="h-6 w-6 animate-spin" />}><Page /></Suspense>,
});

function Page() {
  const fn = useServerFn(listActivityLog);
  const { data } = useSuspenseQuery(queryOptions({ queryKey: ["admin-activity"], queryFn: () => fn() }));
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-display">Activity log</h1></div>
      <Card><CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader><TableRow><TableHead>When</TableHead><TableHead>Admin</TableHead><TableHead>Action</TableHead><TableHead>Target</TableHead><TableHead>Details</TableHead></TableRow></TableHeader>
          <TableBody>
            {data.map(l => (
              <TableRow key={l.id}>
                <TableCell className="text-xs">{fmtDate(l.created_at)}</TableCell>
                <TableCell className="font-mono text-xs">{l.admin_id.slice(0, 8)}</TableCell>
                <TableCell>{l.action}</TableCell>
                <TableCell className="text-xs">{l.target_type} {l.target_id?.slice(0, 8) ?? ""}</TableCell>
                <TableCell className="text-xs font-mono max-w-md truncate">{l.details ? JSON.stringify(l.details) : "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}
