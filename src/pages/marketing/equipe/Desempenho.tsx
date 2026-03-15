import { TrendingUp, CheckCircle, Clock, AlertCircle, BarChart3, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { Progress } from '@/components/ui/progress';

const MOCK_PERFORMANCE = [
  { name: 'Ana Souza', role: 'Social Media', delivered: 24, onTime: 22, avgDays: 2.1, score: 92 },
  { name: 'Carlos Lima', role: 'Designer', delivered: 31, onTime: 27, avgDays: 3.4, score: 87 },
  { name: 'Rafael Costa', role: 'Tráfego', delivered: 18, onTime: 17, avgDays: 1.8, score: 94 },
  { name: 'Mariana Alves', role: 'Videomaker', delivered: 12, onTime: 10, avgDays: 5.2, score: 83 },
];

export default function Desempenho() {
  const totalDelivered = MOCK_PERFORMANCE.reduce((s, m) => s + m.delivered, 0);
  const totalOnTime = MOCK_PERFORMANCE.reduce((s, m) => s + m.onTime, 0);
  const avgScore = Math.round(MOCK_PERFORMANCE.reduce((s, m) => s + m.score, 0) / MOCK_PERFORMANCE.length);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Desempenho"
        description="Produtividade individual e do time — demandas entregues, prazos e volume"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <CheckCircle className="h-4 w-4" />
              <span className="text-xs">Entregas (mês)</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{totalDelivered}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-emerald-400 mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-xs">No Prazo</span>
            </div>
            <p className="text-2xl font-bold text-emerald-400">{Math.round((totalOnTime / totalDelivered) * 100)}%</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-module-gestao mb-1">
              <Zap className="h-4 w-4" />
              <span className="text-xs">Score Médio</span>
            </div>
            <p className="text-2xl font-bold text-module-gestao">{avgScore}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs">Membros Ativos</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{MOCK_PERFORMANCE.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Individual Performance */}
      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-module-gestao" />
            Desempenho Individual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {MOCK_PERFORMANCE.map((member) => (
              <div key={member.name} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <p className="text-sm font-medium text-foreground">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                    <span className="text-lg font-bold text-module-gestao">{member.score}</span>
                  </div>
                  <Progress value={member.score} className="h-1.5" />
                  <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                    <span>{member.delivered} entregas</span>
                    <span>{Math.round((member.onTime / member.delivered) * 100)}% no prazo</span>
                    <span>~{member.avgDays}d por demanda</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
