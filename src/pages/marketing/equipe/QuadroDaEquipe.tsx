import { Users, UserCheck, Clock, AlertTriangle, Briefcase, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';
import { Progress } from '@/components/ui/progress';

const MOCK_MEMBERS = [
  { name: 'Ana Souza', role: 'Social Media', status: 'disponivel', workload: 75, projects: 3 },
  { name: 'Carlos Lima', role: 'Designer', status: 'disponivel', workload: 90, projects: 4 },
  { name: 'Juliana Mendes', role: 'Copywriter', status: 'ferias', workload: 0, projects: 0 },
  { name: 'Rafael Costa', role: 'Tráfego', status: 'disponivel', workload: 60, projects: 2 },
  { name: 'Mariana Alves', role: 'Videomaker', status: 'disponivel', workload: 85, projects: 3 },
  { name: 'Pedro Santos', role: 'Designer', status: 'afastado', workload: 0, projects: 0 },
];

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  disponivel: { label: 'Disponível', color: 'bg-emerald-500/20 text-emerald-400' },
  ferias: { label: 'Férias', color: 'bg-blue-500/20 text-blue-400' },
  afastado: { label: 'Afastado', color: 'bg-amber-500/20 text-amber-400' },
};

export default function QuadroDaEquipe() {
  const available = MOCK_MEMBERS.filter(m => m.status === 'disponivel').length;
  const away = MOCK_MEMBERS.filter(m => m.status !== 'disponivel').length;
  const avgWorkload = Math.round(
    MOCK_MEMBERS.filter(m => m.status === 'disponivel').reduce((s, m) => s + m.workload, 0) / available
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quadro da Equipe"
        description="Visão geral dos membros do time de marketing — funções, cargas e disponibilidade"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="h-4 w-4" />
              <span className="text-xs">Total</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{MOCK_MEMBERS.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-emerald-400 mb-1">
              <UserCheck className="h-4 w-4" />
              <span className="text-xs">Disponíveis</span>
            </div>
            <p className="text-2xl font-bold text-emerald-400">{available}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-amber-400 mb-1">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs">Ausentes</span>
            </div>
            <p className="text-2xl font-bold text-amber-400">{away}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-app-gestao mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-xs">Carga Média</span>
            </div>
            <p className="text-2xl font-bold text-app-gestao">{avgWorkload}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_MEMBERS.map((member) => {
          const statusCfg = STATUS_CONFIG[member.status];
          return (
            <Card key={member.name} className="bg-card/50 hover:bg-card/80 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{member.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Briefcase className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{member.role}</span>
                    </div>
                  </div>
                  <Badge className={statusCfg.color}>{statusCfg.label}</Badge>
                </div>
                {member.status === 'disponivel' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Carga de trabalho</span>
                      <span className="font-medium text-foreground">{member.workload}%</span>
                    </div>
                    <Progress value={member.workload} className="h-1.5" />
                    <div className="flex items-center gap-1 mt-1">
                      <Shield className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{member.projects} projetos ativos</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
