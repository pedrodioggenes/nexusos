import { BlurFade } from "@/components/ui/blur-fade";
import { Card } from "@/components/ui/card";
import { Package, ClipboardList, AlertTriangle, CalendarClock, TrendingUp, CheckCircle } from "lucide-react";

/**
 * Reposição Dashboard
 * Visão operacional de reposição e gôndolas
 */
export default function ReposicaoIndex() {
  return (
    <div className="space-y-6">
      <BlurFade delay={0}>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard Reposição</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Controle de gôndolas e tarefas operacionais
          </p>
        </div>
      </BlurFade>

      {/* KPI Cards */}
      <BlurFade delay={0.1}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-module-reposicao/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-module-reposicao" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">0</p>
                <p className="text-xs text-muted-foreground">Gôndolas</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <ClipboardList className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">0</p>
                <p className="text-xs text-muted-foreground">Tarefas Hoje</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">0</p>
                <p className="text-xs text-muted-foreground">Rupturas</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <CalendarClock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">0</p>
                <p className="text-xs text-muted-foreground">Próx. Vencimento</p>
              </div>
            </div>
          </Card>
        </div>
      </BlurFade>

      {/* Content Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <BlurFade delay={0.2}>
          <Card className="p-6 bg-card border-border">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Rupturas Ativas
            </h3>
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">Nenhuma ruptura registrada</p>
            </div>
          </Card>
        </BlurFade>

        <BlurFade delay={0.3}>
          <Card className="p-6 bg-card border-border">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-module-reposicao" />
              Tarefas Concluídas Hoje
            </h3>
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">Nenhuma tarefa concluída</p>
            </div>
          </Card>
        </BlurFade>
      </div>

      {/* Info Banner */}
      <BlurFade delay={0.4}>
        <Card className="p-6 bg-module-reposicao/5 border-module-reposicao/20">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-module-reposicao/10 flex items-center justify-center shrink-0">
              <Package className="h-6 w-6 text-module-reposicao" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Bem-vindo ao Reposição</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Controle gôndolas, gerencie tarefas de reposição, monitore rupturas e validades.
                Cadastre suas lojas e gôndolas para começar a operar.
              </p>
            </div>
          </div>
        </Card>
      </BlurFade>
    </div>
  );
}
