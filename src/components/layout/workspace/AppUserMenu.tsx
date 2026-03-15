/**
 * AppUserMenu — Shared user avatar dropdown for all app layouts
 * Professional dropdown: profile, settings, theme toggle, portal link, logout
 */
import { useNavigate } from "react-router-dom";
import { User, Settings, Moon, Sun, ArrowLeft, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { useAccessControl } from "@/hooks/useAccessControl";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface AppUserMenuProps {
  user: SupabaseUser | null;
  onSignOut: () => void;
  /** Tailwind color class for the accent, e.g. "app-financeiro" */
  accentClass: string;
}

export function AppUserMenu({ user, onSignOut, accentClass }: AppUserMenuProps) {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { canAccessPortal, getAllowedHomeRoute } = useAccessControl();
  const { isAgency } = useAuth();
  const agencyUser = isAgency();
  const homeRoute = getAllowedHomeRoute();

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Usuário";
  const initials = displayName.slice(0, 2).toUpperCase();
  const avatarUrl = user?.user_metadata?.avatar_url;
  const isDark = theme === "dark";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-9 w-9 rounded-full p-0">
          <Avatar className="h-8 w-8">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
            <AvatarFallback className={`text-xs bg-${accentClass}/20 text-${accentClass} font-medium`}>
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {/* User info */}
        <div className="px-3 py-2.5">
          <div className="flex items-center gap-2.5">
            <Avatar className="h-9 w-9">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
              <AvatarFallback className={`text-xs bg-${accentClass}/20 text-${accentClass} font-medium`}>
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{displayName}</p>
              <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Actions */}
        {!agencyUser && (
          <DropdownMenuItem
            onClick={() => navigate(homeRoute)}
            className="gap-2.5 cursor-pointer text-xs py-2"
          >
            <User className="h-3.5 w-3.5" />
            Meu Perfil
          </DropdownMenuItem>
        )}

        {!agencyUser && (
          <DropdownMenuItem
            onClick={() => navigate(homeRoute)}
            className="gap-2.5 cursor-pointer text-xs py-2"
          >
            <Settings className="h-3.5 w-3.5" />
            Configurações
          </DropdownMenuItem>
        )}

        {/* Theme toggle */}
        <div className="flex items-center justify-between px-2 py-2">
          <div className="flex items-center gap-2.5">
            {isDark ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
            <span className="text-xs">Tema Escuro</span>
          </div>
          <Switch
            checked={isDark}
            onCheckedChange={() => setTheme(isDark ? "light" : "dark")}
            className="scale-75"
          />
        </div>

        {canAccessPortal && !agencyUser && (
          <>
            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => navigate("/portal")}
              className="gap-2.5 cursor-pointer text-xs py-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Voltar ao Portal
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={onSignOut}
          className="gap-2.5 cursor-pointer text-xs py-2 text-destructive focus:text-destructive"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
