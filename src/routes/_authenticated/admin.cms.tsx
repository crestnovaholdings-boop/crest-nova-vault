import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useSuspenseQuery, useQueryClient, queryOptions } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { listCms, updateCms } from "@/lib/banking.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, FileText } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/cms")({
  component: () => <Suspense fallback={<Loader2 className="h-6 w-6 animate-spin" />}><Page /></Suspense>,
});

function Page() {
  const qc = useQueryClient();
  const fn = useServerFn(listCms);
  const updateFn = useServerFn(updateCms);
  const { data } = useSuspenseQuery(queryOptions({ queryKey: ["admin-cms"], queryFn: () => fn() }));
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const save = async (key: string) => {
    try {
      const value = JSON.parse(drafts[key] ?? JSON.stringify((data.find(d => d.key === key)?.value ?? {}), null, 2));
      await updateFn({ data: { key, value } });
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["admin-cms"] });
    } catch (e) { toast.error("Invalid JSON: " + (e as Error).message); }
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-display flex items-center gap-2"><FileText className="h-5 w-5 text-gold" /> Site content</h1><p className="text-sm text-muted-foreground">Edit JSON blocks for the public website.</p></div>
      <div className="space-y-4">
        {data.map(c => (
          <Card key={c.key}>
            <CardHeader className="pb-2"><CardTitle className="text-base font-mono text-sm">{c.key}</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Textarea rows={10} className="font-mono text-xs" defaultValue={JSON.stringify(c.value, null, 2)} onChange={(e) => setDrafts(d => ({ ...d, [c.key]: e.target.value }))} />
              <Button onClick={() => save(c.key)} className="bg-gradient-hero">Save</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
