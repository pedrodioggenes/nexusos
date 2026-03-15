import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { MarketingSidebar } from "./MarketingSidebar";
import { Button } from "@/components/ui/button";

import { ArrowLeft, LayoutDashboard, Menu, ChevronLeft, ChevronRight, Users } from "lucide-react";
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

/**
 * Marketing Layout - Clean SaaS Design
 * Inspired by modern analytics dashboards
 */
export function MarketingLayout() {
  const { user, loading, signOut, role, isNosAdmin, isSupplier, isAgency } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('marketing-sidebar-collapsed') === 'true';
  });
  const isMobile = useIsMobile();
  const { canAccessPortal } = useAccessControl();

  // Persist sidebar collapsed state
  useEffect(() => {
    localStorage.setItem('marketing-sidebar-collapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Auth guards handled by AccessGate wrapper — only check loading
  if (!loading && !user) return <Navigate to="/auth" replace />;

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const agencyUser = isAgency();

  const handleThemeToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Display name logic
  const displayName = user?.email?.split('@')[0] || 'Usuário';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="h-[100dvh] w-full flex flex-col overflow-hidden bg-background">
      {/* Header - Clean and minimal */}
      <header className={cn(
        "shrink-0 flex items-center justify-between gap-3 px-3 h-12 relative z-40",
        "bg-card border-b border-border"
      )}>
        {/* Left: Navigation + Logo */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Mobile: Menu trigger */}
          {isMobile && (
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 shrink-0 relative z-50 touch-manipulation"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent 
                side="left" 
                className="w-[260px] p-0 border-r border-border bg-card"
              >
                <div className="p-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-app-gestao/10 flex items-center justify-center">
                      <LayoutDashboard className="h-4 w-4 text-app-gestao" />
                    </div>
                    <span className="font-semibold text-app-gestao">Marketing</span>
                  </div>
                </div>
                <ScrollArea className="h-[calc(100dvh-65px)]">
                  <div className="py-4">
                    <MarketingSidebar 
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

          {/* Back Button - hidden if user can't access portal */}
          {canAccessPortal && !agencyUser && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/portal")}
              className="h-9 w-9 shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}

          {/* Module Logo */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-app-gestao/10 flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4 text-app-gestao" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-semibold text-foreground leading-tight">Marketing</h1>
              <p className="text-[10px] text-muted-foreground">Gestão de Marketing</p>
            </div>
          </div>

        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <NotificationCenter />
          <AppUserMenu user={user} onSignOut={handleSignOut} accentClass="app-gestao" />
        </div>
      </header>

      {/* Container: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <TooltipProvider delayDuration={0}>
            <aside className={cn(
              "relative flex flex-col shrink-0 transition-all duration-300 ease-in-out",
              "bg-card border-r border-border",
              sidebarCollapsed ? "w-14" : "w-56"
            )}>
              {/* Toggle Button - isolated from ScrollArea */}
              <div className="absolute -right-4 top-2 z-20">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="h-6 w-6 rounded-full border bg-background shadow-sm hover:bg-muted transition-colors"
                >
                  {sidebarCollapsed ? (
                    <ChevronRight className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronLeft className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>

              <ScrollArea className="flex-1 py-4 overflow-hidden">
                <MarketingSidebar 
                  onSignOut={handleSignOut} 
                  collapsed={sidebarCollapsed}
                  onThemeToggle={handleThemeToggle}
                  currentTheme={theme}
                />
              </ScrollArea>
            </aside>
          </TooltipProvider>
        )}

        {/* Main Content */}
        <ScrollArea className="flex-1" orientation="both">
          <main className="p-3 md:p-4 max-w-7xl mx-auto w-full min-w-0">
            <Outlet />
          </main>
        </ScrollArea>
      </div>
    </div>
  );
}