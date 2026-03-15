import { useNavigate } from "react-router-dom";
import { ShieldX, ArrowLeft, LifeBuoy, Home } from "lucide-react";
import { useAccessControl } from "@/hooks/useAccessControl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type AccessDeniedProps = {
  title?: string;
  description?: string;
  details?: string;
  backTo?: string;
};

export function AccessDenied({
  title = "Acesso negado",
  description = "Você não tem permissão para acessar esta área.",
  details,
  backTo,
}: AccessDeniedProps) {
  const navigate = useNavigate();
  const { getAllowedHomeRoute, canAccessPortal } = useAccessControl();
  const homeRoute = getAllowedHomeRoute();
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full">
        <CardContent className="flex flex-col items-center text-center py-12 px-6">
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="p-4 rounded-full bg-destructive/10">
              <ShieldX className="h-10 w-10 text-destructive" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-semibold text-foreground">{title}</h1>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>

          {details ? (
            <div className="w-full p-3 rounded-md bg-muted/50 text-xs text-muted-foreground text-left mb-6 font-mono">
              {details}
            </div>
          ) : null}

          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>

            <Button
              variant="default"
              className="flex-1"
              onClick={() => navigate(canAccessPortal ? "/portal" : homeRoute)}
            >
              <Home className="h-4 w-4 mr-2" />
              {canAccessPortal ? "Ir para o Portal" : "Ir para o Início"}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.open("mailto:suporte@araripe.me")}
              title="Contatar suporte"
            >
              <LifeBuoy className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
