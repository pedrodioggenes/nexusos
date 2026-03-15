import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { TradeSidebarSupplier } from "./TradeSidebarSupplier";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Building2, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { AppUserMenu } from "./AppUserMenu";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";

/**
 * Trade Supplier Layout
 * Simplified portal for suppliers
 * Uses semantic tokens for consistent theming
 */
export function TradeSupplierLayout() {
  const { user, loading, signOut, supplier, isNosAdmin, isInternal } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  // Non-blocking: redirect only when loading is complete
  if (!loading && !user) return <Navigate to="/auth" replace />;
  if (!loading && isNosAdmin()) return <Navigate to="/auth" replace />;
  if (!loading && isInternal()) return <Navigate to="/app/trade" replace />;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="h-[100dvh] flex flex-col w-full bg-background overflow-hidden">
      {/* Header Horizontal - Sempre visível */}
      <header className="h-12 border-b border-border bg-card flex items-center px-3 md:px-4 shrink-0 relative z-40">
        {/* Esquerda: Menu Mobile + Logo */}
        <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
          {/* Menu trigger - Mobile only */}
          {isMobile && (
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 shrink-0 relative z-50 touch-manipulation"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-48 p-0 bg-card border-border">
                <ScrollArea className="h-full">
                  <nav className="px-2 py-3">
                    <TradeSidebarSupplier onNavigate={() => setSidebarOpen(false)} />
                  </nav>
                </ScrollArea>
              </SheetContent>
            </Sheet>
          )}

          {/* Logo do aplicativo */}
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-xl bg-app-trade/10 flex items-center justify-center shrink-0">
              <ShoppingCart className="h-3.5 w-3.5 text-app-trade" />
            </div>
            <div className="min-w-0">
              <h1 className="font-semibold text-app-trade text-xs truncate">Trade</h1>
              <p className="text-[9px] text-muted-foreground hidden sm:block">Portal do Fornecedor</p>
            </div>
          </div>

          {/* Supplier Info */}
          {supplier && (
            <>
              <div className="h-5 w-px bg-border hidden sm:block" />
              <div className="hidden sm:flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-app-trade shrink-0" />
                <span className="text-[10px] font-medium text-foreground truncate max-w-32">
                  {supplier.name}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Direita: AppUserMenu + Notifications */}
        <div className="flex items-center gap-2 shrink-0">
          <NotificationCenter />
          <AppUserMenu user={user} onSignOut={handleSignOut} accentClass="app-trade" />
        </div>
      </header>

      {/* Container principal com Sidebar + Conteúdo */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Desktop only */}
        {!isMobile && (
          <aside className="w-44 bg-card flex flex-col border-r border-border shrink-0">
            <ScrollArea className="flex-1">
              <nav className="px-2 py-3">
                <TradeSidebarSupplier />
              </nav>
            </ScrollArea>
          </aside>
        )}

        {/* Main Content */}
        <ScrollArea className="flex-1">
          <main className="p-3 md:p-4 overflow-x-hidden">
            <Outlet />
          </main>
        </ScrollArea>
      </div>
    </div>
  );
}