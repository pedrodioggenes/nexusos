import { LogOut, Settings, ChevronUp, Award, Sun, Moon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface UserProfileFooterProps {
  name: string;
  email?: string;
  role?: string;
  avatar?: string;
  onSignOut?: () => void;
  onSettings?: () => void;
  onThemeToggle?: () => void;
  currentTheme?: string;
  collapsed?: boolean;
  className?: string;
}

export function UserProfileFooter({
  name,
  email,
  role = "Membro",
  avatar,
  onSignOut,
  onSettings,
  onThemeToggle,
  currentTheme,
  collapsed = false,
  className,
}: UserProfileFooterProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Collapsed mode - just avatar with dropdown
  if (collapsed) {
    return (
      <div className={cn("flex justify-center", className)}>
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-10 w-10 rounded-full p-0 hover:bg-muted/50"
                >
                  <Avatar className="h-8 w-8">
                    {avatar && <AvatarImage src={avatar} alt={name} />}
                    <AvatarFallback className="text-xs bg-app-gestao/20 text-app-gestao font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="right">
              <div>
                <p className="font-medium">{name}</p>
                <p className="text-xs text-muted-foreground">{role}</p>
              </div>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end" side="right" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{name}</p>
              {email && <p className="text-xs text-muted-foreground">{email}</p>}
            </div>
            <DropdownMenuSeparator />
            
            {/* Theme Toggle */}
            {onThemeToggle && (
              <DropdownMenuItem onClick={onThemeToggle}>
                {currentTheme === "dark" ? (
                  <>
                    <Sun className="h-4 w-4 mr-2" />
                    Modo Claro
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4 mr-2" />
                    Modo Escuro
                  </>
                )}
              </DropdownMenuItem>
            )}
            
            {onSettings && (
              <DropdownMenuItem onClick={onSettings}>
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </DropdownMenuItem>
            )}
            {onSignOut && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onSignOut} className="text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  // Expanded mode - full layout
  return (
    <div className={cn("space-y-3", className)}>
      {/* Achievement/Notification Card */}
      <div className="p-3 rounded-lg bg-app-gestao/10 border border-app-gestao/20">
        <div className="flex items-center gap-2 mb-1">
          <Award className="h-4 w-4 text-app-gestao" />
          <span className="text-xs font-medium text-app-gestao">Pro Member</span>
        </div>
        <p className="text-[10px] text-muted-foreground">
          3 tarefas concluídas hoje
        </p>
      </div>

      {/* User Profile */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-start p-2 h-auto hover:bg-muted/50"
          >
            <div className="flex items-center gap-3 w-full">
              <Avatar className="h-9 w-9">
                {avatar && <AvatarImage src={avatar} alt={name} />}
                <AvatarFallback className="text-xs bg-module-gestao/20 text-module-gestao font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{role}</p>
              </div>
              <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {email && (
            <>
              <div className="px-2 py-1.5">
                <p className="text-xs text-muted-foreground">{email}</p>
              </div>
              <DropdownMenuSeparator />
            </>
          )}
          
          {/* Theme Toggle */}
          {onThemeToggle && (
            <DropdownMenuItem onClick={onThemeToggle}>
              {currentTheme === "dark" ? (
                <>
                  <Sun className="h-4 w-4 mr-2" />
                  Modo Claro
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 mr-2" />
                  Modo Escuro
                </>
              )}
            </DropdownMenuItem>
          )}
          
          {onSettings && (
            <DropdownMenuItem onClick={onSettings}>
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </DropdownMenuItem>
          )}
          {onSignOut && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onSignOut} className="text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}