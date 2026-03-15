import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { FinanceiroSidebar } from "./FinanceiroSidebar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, DollarSign, Menu, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppUserMenu } from "./AppUserMenu";
import { useAccessControl } from "@/hooks/useAccessControl";

export function FinanceiroLayout() {
  const { user, loading, signOut, isNosAdmin, isSupplier } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() =>
    localStorage.getItem("financeiro-sidebar-collapsed") === "true"
  );
  const isMobile = useIsMobile();
  const { canAccessPortal } = useAccessControl();

  useEffect(() => {
    localStorage.setItem("financeiro-sidebar-collapsed", String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  if (!loading && !user) return <Navigate to="/auth" replace />;
  if (!loading && isNosAdmin()) return <Navigate to="/auth" replace />;
  if (!loading && isSupplier()) return <Navigate to="/portal" replace />;

  const handleSignOut = async () => { await signOut(); navigate("/"); };
  const handleThemeToggle = () => setTheme(theme === "dark" ? "light" : "dark");
  const displayName = user?.email?.split("@")[0] || "Usuário";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="h-[100dvh] w-full flex flex-col overflow-hidden bg-background">
      <header className={cn(
        "shrink-0 flex items-center justify-between gap-3 px-3 h-12 relative z-40",
        "bg-card border-b border-border"
      )}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {isMobile && (
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 relative z-50 touch-manipulation">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[260px] p-0 border-r border-border bg-card">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-app-financeiro/10 flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-app-financeiro" />
                    </div>
                    <span className="font-semibold text-app-financeiro">Financeiro</span>
                  </div>
                </div>
                <ScrollArea className="h-[calc(100dvh-65px)]">
                  <div className="py-4">
                    <FinanceiroSidebar
                      onNavigate={() => setSidebarOpen(false)}
                      onSignOut={handleSignOut}
                      onThemeToggle={handleThemeToggle}
                      currentTheme={theme}
                    />
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>
          )}
          {canAccessPortal && (
            <Button variant="ghost" size="icon" onClick={() => navigate("/portal")} className="h-9 w-9 shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-app-financeiro/10 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-app-financeiro" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-semibold text-foreground leading-tight">Financeiro</h1>
              <p className="text-[10px] text-muted-foreground">Inteligência Financeira</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <NotificationCenter />
          <AppUserMenu user={user} onSignOut={handleSignOut} accentClass="app-financeiro" />
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden min-h-0">
        {!isMobile && (
          <TooltipProvider delayDuration={0}>
            <aside className={cn(
              "relative flex flex-col shrink-0 transition-all duration-300 ease-in-out",
              "bg-card border-r border-border",
              sidebarCollapsed ? "w-14" : "w-56"
            )}>
              <div className="absolute -right-4 top-2 z-20">
                <Button
                  variant="ghost" size="icon"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="h-6 w-6 rounded-full border bg-background shadow-sm hover:bg-muted transition-colors"
                >
                  {sidebarCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
                </Button>
              </div>
              <ScrollArea className="flex-1 py-4 overflow-hidden">
                <FinanceiroSidebar
                  onSignOut={handleSignOut}
                  collapsed={sidebarCollapsed}
                  onThemeToggle={handleThemeToggle}
                  currentTheme={theme}
                />
              </ScrollArea>
            </aside>
          </TooltipProvider>
        )}

        <ScrollArea className="flex-1">
          <main className="p-3 md:p-4 max-w-7xl mx-auto overflow-x-hidden">
            <Outlet />
          </main>
        </ScrollArea>
      </div>
    </div>
  );
}
