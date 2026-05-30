import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Wallet, ArrowLeftRight, ArrowDownToLine, ArrowUpFromLine, Users, Receipt, Bell, UserCog, LogOut, Shield, Sun, Moon } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";

const items = [
  { to: "/app", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/app/accounts", label: "Accounts", icon: Wallet },
  { to: "/app/transfers", label: "Transfers", icon: ArrowLeftRight },
  { to: "/app/withdrawals", label: "Withdrawals", icon: ArrowUpFromLine },
  { to: "/app/deposits", label: "Deposits", icon: ArrowDownToLine },
  { to: "/app/beneficiaries", label: "Beneficiaries", icon: Users },
  { to: "/app/transactions", label: "Transactions", icon: Receipt },
  { to: "/app/notifications", label: "Notifications", icon: Bell },
  { to: "/app/profile", label: "Profile", icon: UserCog },
] as const;

export function UserSidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { signOut, isAdmin } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const isActive = (to: string, exact?: boolean) => exact ? path === to : path === to || path.startsWith(to + "/");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <Link to="/" className="flex items-center gap-2 px-2 py-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center shrink-0">
            <span className="text-gold font-display font-bold text-sm">C</span>
          </div>
          <div className="leading-tight group-data-[collapsible=icon]:hidden">
            <div className="font-display text-sm">Crest Nova</div>
            <div className="text-[9px] tracking-widest uppercase text-muted-foreground">Holdings</div>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Banking</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((i) => (
                <SidebarMenuItem key={i.to}>
                  <SidebarMenuButton asChild isActive={isActive(i.to, i.exact)} tooltip={i.label}>
                    <Link to={i.to}><i.icon /> <span>{i.label}</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Admin panel">
                    <Link to="/admin"><Shield /> <span>Admin panel</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
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
