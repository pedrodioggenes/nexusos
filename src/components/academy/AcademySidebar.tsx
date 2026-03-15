import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAccessControl } from "@/hooks/useAccessControl";
import {
  Home,
  BookOpen,
  Award,
  Heart,
  TrendingUp,
  Users,
  Briefcase,
  Compass,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

type ActiveSection = "home" | "my-courses" | "certificates" | "favorites";
type ActiveTrack = "vendas" | "lideranca" | "operacional" | "onboarding" | null;

interface AcademySidebarProps {
  activeSection?: ActiveSection;
  activeTrack?: ActiveTrack;
  onSectionChange?: (section: ActiveSection) => void;
  onTrackChange?: (track: ActiveTrack) => void;
}

interface NavItem {
  id: ActiveSection;
  label: string;
  icon: React.ReactNode;
}

interface TrackItem {
  id: ActiveTrack;
  label: string;
  icon: React.ReactNode;
}

const navigationItems: NavItem[] = [
  { id: "home", label: "Início", icon: <Home className="h-4 w-4" /> },
  { id: "my-courses", label: "Meus Cursos", icon: <BookOpen className="h-4 w-4" /> },
  { id: "certificates", label: "Certificados", icon: <Award className="h-4 w-4" /> },
  { id: "favorites", label: "Favoritos", icon: <Heart className="h-4 w-4" /> },
];

const trackItems: TrackItem[] = [
  { id: "vendas", label: "Vendas", icon: <TrendingUp className="h-4 w-4" /> },
  { id: "lideranca", label: "Liderança", icon: <Users className="h-4 w-4" /> },
  { id: "operacional", label: "Operacional", icon: <Briefcase className="h-4 w-4" /> },
  { id: "onboarding", label: "Onboarding", icon: <Compass className="h-4 w-4" /> },
];

function SidebarContent({
  activeSection = "home",
  activeTrack = null,
  onSectionChange,
  onTrackChange,
  onClose,
}: AcademySidebarProps & { onClose?: () => void }) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { canAccessPortal } = useAccessControl();

  const displayName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuário";
  const email = user?.email || "usuario@empresa.com";
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleNavClick = (item: NavItem) => {
    onSectionChange?.(item.id);
    onClose?.();
  };

  const handleTrackClick = (track: TrackItem) => {
    onTrackChange?.(track.id);
    onClose?.();
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="h-full flex flex-col bg-secondary">
      {/* Logo Header */}
      <div className="h-14 flex items-center gap-3 px-5 shrink-0 border-b border-border">
        {canAccessPortal && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-muted text-muted-foreground"
            onClick={() => navigate("/portal")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        <span className="text-base font-bold tracking-tight font-display text-foreground">
          Academy
        </span>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        {/* Main Navigation */}
        <div className="mb-6">
          <span className="text-[10px] uppercase tracking-wider font-medium px-2 mb-2 block text-muted-foreground/60">
            Navegação
          </span>
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-primary" />
                  )}
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <Separator className="bg-border my-4" />

        {/* Tracks */}
        <div>
          <span className="text-[10px] uppercase tracking-wider font-medium px-2 mb-2 block text-muted-foreground/60">
            Trilhas
          </span>
          <nav className="space-y-1">
            {trackItems.map((track) => {
              const isActive = activeTrack === track.id;
              return (
                <button
                  key={track.id}
                  onClick={() => handleTrackClick(track)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {track.icon}
                  <span>{track.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* User Footer */}
      <div className="shrink-0 p-4 border-t border-border/50">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-9 w-9 ring-1 ring-border">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="text-xs font-semibold bg-muted text-muted-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-foreground">
              {displayName}
            </p>
            <p className="text-xs truncate text-muted-foreground/60">
              {email}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 h-8 text-xs rounded-lg text-muted-foreground hover:bg-muted"
          >
            <Settings className="h-3.5 w-3.5 mr-1.5" />
            Configurações
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-muted"
            onClick={handleLogout}
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AcademySidebar(props: AcademySidebarProps) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  if (isMobile) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 h-10 w-10 rounded-xl lg:hidden bg-secondary border border-border text-muted-foreground"
          onClick={() => setIsOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent
            side="left"
            className="w-[280px] p-0 bg-secondary border-border"
          >
            <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
            <SidebarContent {...props} onClose={() => setIsOpen(false)} />
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <aside className="w-[220px] shrink-0 h-full hidden lg:block bg-secondary border-r border-border">
      <SidebarContent {...props} />
    </aside>
  );
}
