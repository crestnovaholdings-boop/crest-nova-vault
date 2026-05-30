import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useSuspenseQuery, useQueryClient, queryOptions } from "@tanstack/react-query";
import { Suspense } from "react";
import { getMyNotifications, markNotificationRead } from "@/lib/banking.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fmtDate } from "@/lib/format";
import { Loader2, Bell, Check } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/notifications")({
  component: () => <Suspense fallback={<Loader2 className="h-6 w-6 animate-spin" />}><Page /></Suspense>,
});

function Page() {
  const qc = useQueryClient();
  const fn = useServerFn(getMyNotifications);
  const markFn = useServerFn(markNotificationRead);
  const { data } = useSuspenseQuery(queryOptions({ queryKey: ["my-notifications"], queryFn: () => fn() }));

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-display flex items-center gap-2"><Bell className="h-5 w-5 text-gold" /> Notifications</h1></div>
      <div className="space-y-2">
        {data.length === 0 ? <Card><CardContent className="text-center py-8 text-sm text-muted-foreground">No notifications</CardContent></Card> :
          data.map(n => (
            <Card key={n.id} className={n.read ? "opacity-60" : ""}>
              <CardContent className="flex justify-between items-start py-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{n.title}</span>
                    <Badge variant="outline" className="text-[10px]">{n.type}</Badge>
                  </div>
                  {n.body && <p className="text-sm text-muted-foreground mt-1">{n.body}</p>}
                  <p className="text-xs text-muted-foreground mt-2">{fmtDate(n.created_at)}</p>
                </div>
                {!n.read && (
                  <Button variant="ghost" size="sm" onClick={async () => { await markFn({ data: { id: n.id } }); qc.invalidateQueries({ queryKey: ["my-notifications"] }); qc.invalidateQueries({ queryKey: ["my-dashboard"] }); }}>
                    <Check className="h-4 w-4" /> Mark read
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        }
      </div>
    </div>
  );
}
