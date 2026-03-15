import { useNavigate } from "react-router-dom";
import { Megaphone, ArrowRight, AlertCircle, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassBentoCard, GlassBentoContent, GlassBentoHeader, GlassBentoTitle } from "@/components/ui/glass-bento";
import { cn } from "@/lib/utils";

interface Props {
  active: number;
  pendingApproval: number;
  withoutROI: number;
  total: number;
  className?: string;
}

export function CampaignHealthWidget({ active, pendingApproval, withoutROI, total, className }: Props) {
  const navigate = useNavigate();

  const hasIssues = pendingApproval > 0 || withoutROI > 0;

  return (
    <GlassBentoCard className={cn("h-full", className)} glowColor="rgba(var(--app-gestao-rgb, 200,170,80), 0.1)">
      <GlassBentoContent>
        <GlassBentoHeader
          icon={<Megaphone className="h-4 w-4 text-app-gestao" />}
          action={
            <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1" onClick={() => navigate('/app/marketing/campanhas')}>
              Ver todas <ArrowRight className="h-3 w-3" />
            </Button>
          }
        >
          <GlassBentoTitle>Saúde das Campanhas</GlassBentoTitle>
        </GlassBentoHeader>

        {total === 0 ? (
          <div className="py-6 text-center">
            <Megaphone className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Nenhuma campanha cadastrada</p>
            <Button variant="outline" size="sm" className="mt-2 h-7 text-[11px]" onClick={() => navigate('/app/marketing/campanhas')}>
              Criar campanha
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 rounded-lg bg-primary/5">
                <p className="text-xl font-bold text-foreground">{active}</p>
                <p className="text-[10px] text-muted-foreground">Ativas</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted/30">
                <p className="text-xl font-bold text-foreground">{pendingApproval}</p>
                <p className="text-[10px] text-muted-foreground">P/ Aprovar</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted/30">
                <p className="text-xl font-bold text-foreground">{total}</p>
                <p className="text-[10px] text-muted-foreground">Total</p>
              </div>
            </div>

            {withoutROI > 0 && (
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-orange-500/5 border border-orange-500/20">
                <TrendingUp className="h-3 w-3 text-orange-500" />
                <span className="text-[10px] text-orange-600">{withoutROI} campanha(s) ativa(s) sem ROI registrado</span>
              </div>
            )}

            {pendingApproval > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="w-full h-7 text-[11px]"
                onClick={() => navigate('/app/marketing/campanhas')}
              >
                Aprovar {pendingApproval} campanha(s) pendente(s)
              </Button>
            )}
          </div>
        )}
      </GlassBentoContent>
    </GlassBentoCard>
  );
}
