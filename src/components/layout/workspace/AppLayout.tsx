import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut, Menu } from "lucide-react";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAccessControl } from "@/hooks/useAccessControl";
import { LucideIcon } from "lucide-react";

interface AppLayoutProps {
  appName: string;
  appDescription: string;
  appIcon: LucideIcon;
  sidebar: ReactNode;
  accentColor?: 'accent' | 'primary' | 'violet' | 'blue';
}

/**
 * Unified App Layout
 * Apple Dark aesthetic with configurable brand color accents
 */
export function AppLayout({ 
  appName, 
  appDescription, 
  appIcon: AppIcon,
  sidebar,
  accentColor = 'primary'
}: AppLayoutProps) {
  const { user, loading, signOut, role, isNosAdmin, isSupplier } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const { canAccessPortal } = useAccessControl();
  // Accent color classes based on module
  const accentClasses = {
    accent: {
      bg: 'bg-accent/10',
      text: 'text-accent',
      border: 'border-accent/20',
    },
    primary: {
      bg: 'bg-primary/10',
      text: 'text-primary',
      border: 'border-primary/20',
    },
    violet: {
      bg: 'bg-violet-500/10',
      text: 'text-violet-500',
      border: 'border-violet-500/20',
    },
    blue: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-500',
      border: 'border-blue-500/20',
    },
  };

  const accent = accentClasses[accentColor];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className={`h-5 w-5 border-2 border-muted ${accent.text} border-t-current rounded-full animate-spin`} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (isNosAdmin()) {
    return <Navigate to="/auth" replace />;
  }

  if (isSupplier()) {
    return <Navigate to="/app/trade/fornecedor" replace />;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const SidebarHeader = () => (
    <div className="flex items-center gap-2.5">
      <div className={`h-8 w-8 rounded-lg ${accent.bg} flex items-center justify-center shrink-0`}>
        <AppIcon className={`h-3.5 w-3.5 ${accent.text}`} />
      </div>
      <div className="min-w-0">
        <h2 className={`font-semibold text-xs tracking-tight ${accent.text}`}>
          {appName}
        </h2>
        <p className="text-[11px] text-muted-foreground">
          {appDescription}
        </p>
      </div>
    </div>
  );

  const SidebarContent = () => (
    <>
      {/* Back to modules */}
      {canAccessPortal && (
        <div className="px-3 py-3 border-b border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              navigate("/portal");
              setSidebarOpen(false);
            }}
            className="w-full justify-start items-center gap-2.5 px-2.5 rounded-md text-muted-foreground hover:text-foreground h-8 text-[13px]"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            Voltar aos Aplicativos
          </Button>
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="px-3 py-4">
          {sidebar}
        </nav>
      </ScrollArea>
    </>
  );

  const SidebarFooter = () => (
    <div className="px-3 py-2.5 border-t border-border">
      <div className="flex items-center gap-2.5">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground truncate">
            {user?.email}
          </p>
          <p className="text-[11px] text-muted-foreground/60 capitalize">
            {role || "usuário"}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <NotificationCenter />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-[100dvh] flex flex-col md:flex-row w-full bg-background overflow-hidden">
      {/* Mobile Header */}
      {isMobile && (
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border px-3 py-2.5 flex items-center gap-2.5 shrink-0">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 touch-manipulation" onClick={(e) => e.stopPropagation()}>
                <Menu className="h-4.5 w-4.5" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 bg-background border-border">
              <div className="flex flex-col h-full">
                <div className="px-3 py-3 border-b border-border">
                  <SidebarHeader />
                </div>
                <SidebarContent />
                <SidebarFooter />
              </div>
            </SheetContent>
          </Sheet>
          
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className={`h-7 w-7 rounded-lg ${accent.bg} flex items-center justify-center shrink-0`}>
              <AppIcon className={`h-3.5 w-3.5 ${accent.text}`} />
            </div>
            <span className={`font-semibold text-xs truncate ${accent.text}`}>
              {appName}
            </span>
          </div>
          
          <div className="flex items-center gap-1.5 shrink-0">
            <NotificationCenter />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </header>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className="w-60 bg-background flex flex-col border-r border-border shrink-0">
          <div className="px-3 py-3 border-b border-border">
            <SidebarHeader />
          </div>
          <SidebarContent />
          <SidebarFooter />
        </aside>
      )}

      {/* Main Content */}
      <ScrollArea className="flex-1">
        <main className="p-3 md:p-4 overflow-x-hidden">
          <Outlet />
        </main>
      </ScrollArea>
    </div>
  );
}
