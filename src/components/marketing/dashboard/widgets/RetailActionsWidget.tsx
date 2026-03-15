import { ShoppingBag, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassBentoCard, GlassBentoContent, GlassBentoHeader, GlassBentoTitle } from "@/components/ui/glass-bento";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Props {
  running: number;
  planned: number;
  total: number;
  className?: string;
}

export function RetailActionsWidget({ running, planned, total, className }: Props) {
  const navigate = useNavigate();

  return (
    <GlassBentoCard className={cn("h-full", className)} glowColor="rgba(var(--app-gestao-rgb, 200,170,80), 0.1)">
      <GlassBentoContent>
        <GlassBentoHeader
          icon={<ShoppingBag className="h-4 w-4 text-app-gestao" />}
          action={
            <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1" onClick={() => navigate('/app/marketing/acoes-comerciais')}>
              Ver todas <ArrowRight className="h-3 w-3" />
            </Button>
          }
        >
          <GlassBentoTitle>Ações Comerciais</GlassBentoTitle>
        </GlassBentoHeader>

        {total === 0 ? (
          <div className="py-6 text-center">
            <ShoppingBag className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Nenhuma ação comercial cadastrada</p>
            <Button variant="outline" size="sm" className="mt-2 h-7 text-[11px]" onClick={() => navigate('/app/marketing/acoes-comerciais')}>
              Criar ação
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2.5 rounded-lg bg-primary/5">
              <p className="text-xl font-bold text-foreground">{running}</p>
              <p className="text-[10px] text-muted-foreground">Em Execução</p>
            </div>
            <div className="text-center p-2.5 rounded-lg bg-muted/30">
              <p className="text-xl font-bold text-foreground">{planned}</p>
              <p className="text-[10px] text-muted-foreground">Planejadas</p>
            </div>
            <div className="text-center p-2.5 rounded-lg bg-muted/30">
              <p className="text-xl font-bold text-foreground">{total}</p>
              <p className="text-[10px] text-muted-foreground">Total</p>
            </div>
          </div>
        )}
      </GlassBentoContent>
    </GlassBentoCard>
  );
}
