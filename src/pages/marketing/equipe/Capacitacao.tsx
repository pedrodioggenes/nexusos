import { GraduationCap, Award, BookOpen, Calendar, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';
import { Progress } from '@/components/ui/progress';

const MOCK_TRAININGS = [
  { title: 'Meta Ads Avançado', member: 'Rafael Costa', status: 'concluido', progress: 100, deadline: '2026-01-15' },
  { title: 'Design System Figma', member: 'Carlos Lima', status: 'em_andamento', progress: 65, deadline: '2026-03-01' },
  { title: 'Copywriting para Varejo', member: 'Ana Souza', status: 'em_andamento', progress: 40, deadline: '2026-03-15' },
  { title: 'Edição Premiere Pro', member: 'Mariana Alves', status: 'planejado', progress: 0, deadline: '2026-04-01' },
  { title: 'Analytics & Data Studio', member: 'Rafael Costa', status: 'em_andamento', progress: 80, deadline: '2026-02-28' },
];

const MOCK_CERTS = [
  { title: 'Google Ads Certified', member: 'Rafael Costa', date: '2025-11-10', expiry: '2026-11-10' },
  { title: 'Meta Blueprint', member: 'Ana Souza', date: '2025-09-20', expiry: '2026-09-20' },
  { title: 'HubSpot Inbound', member: 'Ana Souza', date: '2025-06-15', expiry: '2026-06-15' },
];

const STATUS_CFG: Record<string, { label: string; color: string }> = {
  concluido: { label: 'Concluído', color: 'bg-emerald-500/20 text-emerald-400' },
  em_andamento: { label: 'Em Andamento', color: 'bg-blue-500/20 text-blue-400' },
  planejado: { label: 'Planejado', color: 'bg-muted text-muted-foreground' },
};

export default function Capacitacao() {
  const completed = MOCK_TRAININGS.filter(t => t.status === 'concluido').length;
  const inProgress = MOCK_TRAININGS.filter(t => t.status === 'em_andamento').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Capacitação"
        description="Treinamentos, certificações e planos de desenvolvimento por membro"
      />

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <BookOpen className="h-4 w-4" />
              <span className="text-xs">Treinamentos</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{MOCK_TRAININGS.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-blue-400 mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-xs">Em Andamento</span>
            </div>
            <p className="text-2xl font-bold text-blue-400">{inProgress}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-emerald-400 mb-1">
              <CheckCircle className="h-4 w-4" />
              <span className="text-xs">Concluídos</span>
            </div>
            <p className="text-2xl font-bold text-emerald-400">{completed}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-amber-400 mb-1">
              <Award className="h-4 w-4" />
              <span className="text-xs">Certificações</span>
            </div>
            <p className="text-2xl font-bold text-amber-400">{MOCK_CERTS.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trainings */}
        <div className="lg:col-span-2">
          <Card className="bg-card/50">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-module-gestao" />
                Treinamentos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {MOCK_TRAININGS.map((t) => {
                const cfg = STATUS_CFG[t.status];
                return (
                  <div key={t.title + t.member} className="p-3 rounded-lg bg-muted/30 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{t.title}</p>
                        <p className="text-xs text-muted-foreground">{t.member}</p>
                      </div>
                      <Badge className={cfg.color}>{cfg.label}</Badge>
                    </div>
                    <Progress value={t.progress} className="h-1.5" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{t.progress}% concluído</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Prazo: {new Date(t.deadline).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Certifications */}
        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-400" />
              Certificações Ativas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {MOCK_CERTS.map((c) => (
              <div key={c.title + c.member} className="p-3 rounded-lg bg-muted/30">
                <p className="text-sm font-medium text-foreground">{c.title}</p>
                <p className="text-xs text-muted-foreground">{c.member}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Válido até {new Date(c.expiry).toLocaleDateString('pt-BR')}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
