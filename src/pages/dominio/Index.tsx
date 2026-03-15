import { BlurFade } from "@/components/ui/blur-fade";
import { Card } from "@/components/ui/card";
import { Crown, Wallet, Users, TrendingUp, TrendingDown, Bell, Brain, ArrowUpRight } from "lucide-react";

/**
 * Domínio Dashboard - Executive View
 * Visão consolidada para diretores e donos
 */
export default function DominioIndex() {
  return (
    <div className="space-y-6">
      <BlurFade delay={0}>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Visão Executiva</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Indicadores consolidados para tomada de decisão
          </p>
        </div>
      </BlurFade>

      {/* KPI Cards */}
      <BlurFade delay={0.1}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-card border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Faturamento Mensal</p>
                <p className="text-2xl font-bold text-foreground mt-1">R$ 0</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">--</span>
                </div>
              </div>
               <div className="h-10 w-10 rounded-lg bg-app-dominio/10 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-app-dominio" />
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Headcount</p>
                <p className="text-2xl font-bold text-foreground mt-1">0</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">--</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">ROI Marketing</p>
                <p className="text-2xl font-bold text-foreground mt-1">--</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Sem dados</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Alertas</p>
                <p className="text-2xl font-bold text-foreground mt-1">0</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-muted-foreground">Críticos</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Bell className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </Card>
        </div>
      </BlurFade>

      {/* Content Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <BlurFade delay={0.2}>
          <Card className="p-6 bg-card border-border md:col-span-2">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-app-dominio" />
              Tendências
            </h3>
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">Dados insuficientes para gráficos</p>
              <p className="text-xs text-muted-foreground mt-1">
                Aguardando métricas dos aplicativos
              </p>
            </div>
          </Card>
        </BlurFade>

        <BlurFade delay={0.3}>
          <Card className="p-6 bg-card border-border">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Bell className="h-4 w-4 text-amber-500" />
              Alertas Estratégicos
            </h3>
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">Nenhum alerta</p>
            </div>
          </Card>
        </BlurFade>
      </div>

      {/* AI Insights Section */}
      <BlurFade delay={0.4}>
        <Card className="p-6 bg-gradient-to-br from-app-dominio/5 to-purple-500/5 border-app-dominio/20">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-app-dominio/10 flex items-center justify-center shrink-0">
              <Brain className="h-6 w-6 text-app-dominio" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                Insights da IA
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-app-dominio/10 text-app-dominio font-medium">
                  Em breve
                </span>
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                A inteligência artificial analisará seus dados para identificar oportunidades, 
                riscos e recomendações estratégicas para o negócio.
              </p>
            </div>
          </div>
        </Card>
      </BlurFade>

      {/* Welcome Banner */}
      <BlurFade delay={0.5}>
        <Card className="p-6 bg-app-dominio/5 border-app-dominio/20">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-app-dominio/10 flex items-center justify-center shrink-0">
              <Crown className="h-6 w-6 text-app-dominio" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Bem-vindo ao Domínio</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Sua central de comando executivo. Aqui você terá visão consolidada de todos os aplicativos,
                alertas estratégicos, análises preditivas e relatórios personalizados para tomada de decisão.
              </p>
            </div>
          </div>
        </Card>
      </BlurFade>
    </div>
  );
}
