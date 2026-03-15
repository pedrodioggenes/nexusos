import { GitBranch, Users, Briefcase, Clock, LayoutGrid } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';
import { Progress } from '@/components/ui/progress';

const MOCK_PROJECTS = [
  {
    name: 'Campanha Verão 2026',
    type: 'Campanha',
    members: [
      { name: 'Ana Souza', role: 'Social Media', hours: 20 },
      { name: 'Carlos Lima', role: 'Designer', hours: 30 },
      { name: 'Mariana Alves', role: 'Videomaker', hours: 25 },
    ],
  },
  {
    name: 'Rebranding Loja Centro',
    type: 'Projeto',
    members: [
      { name: 'Carlos Lima', role: 'Designer', hours: 15 },
      { name: 'Rafael Costa', role: 'Tráfego', hours: 10 },
    ],
  },
  {
    name: 'Conteúdo Semanal Redes',
    type: 'Rotina',
    members: [
      { name: 'Ana Souza', role: 'Social Media', hours: 15 },
      { name: 'Mariana Alves', role: 'Videomaker', hours: 10 },
    ],
  },
];

const TYPE_COLORS: Record<string, string> = {
  Campanha: 'bg-module-gestao/20 text-module-gestao',
  Projeto: 'bg-blue-500/20 text-blue-400',
  Rotina: 'bg-emerald-500/20 text-emerald-400',
};

export default function Alocacao() {
  const totalProjects = MOCK_PROJECTS.length;
  const totalAllocations = MOCK_PROJECTS.reduce((s, p) => s + p.members.length, 0);
  const uniqueMembers = new Set(MOCK_PROJECTS.flatMap(p => p.members.map(m => m.name))).size;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alocação"
        description="Distribuição de membros por projeto e campanha — quem está alocado em quê"
      />

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <LayoutGrid className="h-4 w-4" />
              <span className="text-xs">Projetos Ativos</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{totalProjects}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-module-gestao mb-1">
              <Users className="h-4 w-4" />
              <span className="text-xs">Membros Alocados</span>
            </div>
            <p className="text-2xl font-bold text-module-gestao">{uniqueMembers}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <GitBranch className="h-4 w-4" />
              <span className="text-xs">Alocações</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{totalAllocations}</p>
          </CardContent>
        </Card>
      </div>

      {/* Project Cards */}
      <div className="space-y-4">
        {MOCK_PROJECTS.map((project) => {
          const totalHours = project.members.reduce((s, m) => s + m.hours, 0);
          return (
            <Card key={project.name} className="bg-card/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-module-gestao" />
                    {project.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={TYPE_COLORS[project.type]}>{project.type}</Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {totalHours}h/sem
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {project.members.map((member) => (
                    <div key={member.name} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30">
                      <div>
                        <p className="text-sm font-medium text-foreground">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">{member.hours}h</p>
                        <p className="text-xs text-muted-foreground">/semana</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
