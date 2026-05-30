import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { ShieldCheck, LayoutDashboard, Users, Receipt, CheckCheck, PlusCircle, FileText, ArrowLeft, LogOut, Sun, Moon } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";

const items = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/approvals", label: "Approvals", icon: CheckCheck },
  { to: "/admin/transactions", label: "All transactions", icon: Receipt },
  { to: "/admin/manual", label: "Manual entry", icon: PlusCircle },
  { to: "/admin/cms", label: "Site content", icon: FileText },
  { to: "/admin/activity", label: "Activity log", icon: ShieldCheck },
] as const;

export function AdminSidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const isActive = (to: string, exact?: boolean) => exact ? path === to : path === to || path.startsWith(to + "/");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <Link to="/admin" className="flex items-center gap-2 px-2 py-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center shrink-0">
            <ShieldCheck className="h-4 w-4 text-gold" />
          </div>
          <div className="leading-tight group-data-[collapsible=icon]:hidden">
            <div className="font-display text-sm">Admin</div>
            <div className="text-[9px] tracking-widest uppercase text-muted-foreground">Crest Nova</div>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Control center</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((i) => (
                <SidebarMenuItem key={i.to}>
                  <SidebarMenuButton asChild isActive={isActive(i.to, ("exact" in i ? i.exact : false))} tooltip={i.label}>
                    <Link to={i.to}><i.icon /> <span>{i.label}</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Back to my banking">
                  <Link to="/app"><ArrowLeft /> <span>My banking</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t">
        <div className="flex items-center gap-1 px-1 group-data-[collapsible=icon]:flex-col">
          <Button variant="ghost" size="icon" onClick={toggle} className="h-8 w-8">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 justify-start gap-2 group-data-[collapsible=icon]:hidden"
            onClick={async () => { await signOut(); navigate({ to: "/" }); }}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
