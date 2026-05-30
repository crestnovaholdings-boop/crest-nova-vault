import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { UserSidebar } from "@/components/dashboard/user-sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/_authenticated/app")({
  head: () => ({ meta: [{ title: "Dashboard — Crest Nova Holdings" }] }),
  component: AppShell,
});

function AppShell() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (!loading && !session) navigate({ to: "/login", replace: true }); }, [session, loading, navigate]);

  return (
    <SidebarProvider>
      <UserSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <div className="font-display text-sm">My Banking</div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 bg-muted/30 min-h-[calc(100vh-3.5rem)]">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
