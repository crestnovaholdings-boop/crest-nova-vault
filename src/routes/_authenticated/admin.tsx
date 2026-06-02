import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/dashboard/admin-sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Crest Nova Holdings" }] }),
  component: AdminShell,
});

function AdminShell() {
  const { session, loading, isAdmin, rolesLoaded } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (loading) return;
    if (!session) { navigate({ to: "/login", replace: true }); return; }
    if (!rolesLoaded) return;
    if (!isAdmin) navigate({ to: "/app", replace: true });
  }, [session, loading, isAdmin, rolesLoaded, navigate]);

  if (loading || !session || !rolesLoaded || !isAdmin) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <div className="font-display text-sm">Admin Console</div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 bg-muted/30 min-h-[calc(100vh-3.5rem)]">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
