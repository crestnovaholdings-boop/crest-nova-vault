import { createFileRoute, Outlet, redirect, isRedirect } from "@tanstack/react-router";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/dashboard/admin-sidebar";
import { Separator } from "@/components/ui/separator";
import { verifyAdmin } from "@/lib/banking.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Crest Nova Holdings" }] }),
  beforeLoad: async () => {
    try {
      const { isAdmin } = await verifyAdmin();
      if (!isAdmin) throw redirect({ to: "/app", replace: true });
    } catch (e) {
      if (isRedirect(e)) throw e;
      throw redirect({ to: "/app", replace: true });
    }
  },
  component: AdminShell,
});

function AdminShell() {
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
