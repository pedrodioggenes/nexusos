import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Eye, FileText, Sparkles, Loader2, LayoutGrid, List, Calendar, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useHWTenantId } from "@/hooks/useHWTenantId";
import { useHWCandidates } from "@/hooks/useHWCandidates";
import { useHWInterviews } from "@/hooks/useHWInterviews";
import { RecruitmentKanban } from "./RecruitmentKanban";
import { InterviewDialog } from "./InterviewDialog";

interface CandidateItem {
  id: string;
  name: string;
  initials: string;
  position: string;
  status: 'novo' | 'em_analise' | 'aprovado' | 'reprovado';
  submittedAt: string;
  aiRecommended: boolean;
  email: string;
  phone: string;
  kanbanStage?: string;
  rating?: number;
}

const MOCK_CANDIDATES: CandidateItem[] = [
  { id: '1', name: 'Maria Fernanda Costa', initials: 'MF', position: 'Operador(a) de Caixa', status: 'novo', submittedAt: '05/03/2026', aiRecommended: true, email: 'maria.f@email.com', phone: '(91) 98765-4321' },
  { id: '2', name: 'José Carlos Lima', initials: 'JC', position: 'Repositor', status: 'em_analise', submittedAt: '04/03/2026', aiRecommended: false, email: 'jose.lima@email.com', phone: '(91) 91234-5678' },
  { id: '3', name: 'Ana Beatriz Souza', initials: 'AB', position: 'Padeira', status: 'aprovado', submittedAt: '01/03/2026', aiRecommended: true, email: 'ana.b@email.com', phone: '(91) 99876-5432' },
  { id: '4', name: 'Pedro Henrique Santos', initials: 'PH', position: 'Açougueiro', status: 'novo', submittedAt: '03/03/2026', aiRecommended: false, email: 'pedro.h@email.com', phone: '(91) 98888-1234' },
  { id: '5', name: 'Larissa Oliveira', initials: 'LO', position: 'Operador(a) de Caixa', status: 'em_analise', submittedAt: '02/03/2026', aiRecommended: true, email: 'larissa.o@email.com', phone: '(91) 97777-5678' },
];

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  novo: { bg: 'rgba(59, 130, 246, 0.15)', text: '#3B82F6', label: 'Novo' },
  em_analise: { bg: 'rgba(234, 179, 8, 0.15)', text: '#EAB308', label: 'Em Análise' },
  aprovado: { bg: 'rgba(22, 163, 74, 0.15)', text: '#22C55E', label: 'Aprovado' },
  reprovado: { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', label: 'Reprovado' },
};

export function HWRecruitmentView() {
  const { data: tenantId } = useHWTenantId();
  const { data: dbCandidates, isLoading } = useHWCandidates(tenantId || undefined);
  const { data: interviews } = useHWInterviews(tenantId || undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [positionFilter, setPositionFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [interviewDialog, setInterviewDialog] = useState<{ open: boolean; candidate: CandidateItem | null }>({ open: false, candidate: null });

  const candidates: CandidateItem[] = dbCandidates && dbCandidates.length > 0 ? dbCandidates : MOCK_CANDIDATES;
  const positions = [...new Set(candidates.map(c => c.position))];

  const filtered = candidates.filter(c => {
    if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (positionFilter !== 'all' && c.position !== positionFilter) return false;
    return true;
  });

  const counts = {
    total: candidates.length,
    novo: candidates.filter(c => c.status === 'novo').length,
    em_analise: candidates.filter(c => c.status === 'em_analise').length,
    aprovado: candidates.filter(c => c.status === 'aprovado').length,
  };

  const upcomingInterviews = (interviews || [])
    .filter(i => new Date(i.scheduledAt) > new Date() && i.result === 'pending')
    .slice(0, 3);

  return (
    <div className="h-full overflow-y-auto">
      <div className={viewMode === 'kanban' ? 'px-3 sm:px-4 py-4' : 'max-w-2xl mx-auto px-3 sm:px-4 py-4'}>
        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label: 'Total', value: counts.total, color: '#A1A1AA' },
            { label: 'Novos', value: counts.novo, color: '#3B82F6' },
            { label: 'Em Análise', value: counts.em_analise, color: '#EAB308' },
            { label: 'Contratados', value: counts.aprovado, color: '#22C55E' },
          ].map((s, i) => (
            <div key={i} className="rounded-xl p-3 text-center" style={{ backgroundColor: '#18181B', border: '1px solid #27272A' }}>
              <p className="text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[10px] font-medium" style={{ color: '#52525B' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Upcoming interviews banner */}
        {upcomingInterviews.length > 0 && (
          <div className="rounded-xl p-3 mb-4" style={{ backgroundColor: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-3.5 w-3.5" style={{ color: '#8B5CF6' }} />
              <span className="text-xs font-semibold" style={{ color: '#8B5CF6' }}>Próximas Entrevistas</span>
            </div>
            <div className="space-y-1">
              {upcomingInterviews.map(iv => (
                <div key={iv.id} className="flex items-center gap-2 text-[11px]">
                  <span style={{ color: '#D4D4D8' }}>{iv.candidateName}</span>
                  <span style={{ color: '#52525B' }}>•</span>
                  <span style={{ color: '#71717A' }}>
                    {new Date(iv.scheduledAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(139,92,246,0.15)', color: '#8B5CF6' }}>
                    {iv.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search + filters + view toggle */}
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#52525B' }} />
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar candidato..."
              className="pl-9" style={{ backgroundColor: '#27272A', borderColor: '#3F3F46', color: '#FAFAFA' }} />
          </div>
          <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid #3F3F46' }}>
            <Button
              variant="ghost" size="icon"
              className={`h-9 w-9 rounded-none ${viewMode === 'kanban' ? 'bg-zinc-700' : ''}`}
              style={{ color: viewMode === 'kanban' ? '#FAFAFA' : '#52525B' }}
              onClick={() => setViewMode('kanban')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost" size="icon"
              className={`h-9 w-9 rounded-none ${viewMode === 'list' ? 'bg-zinc-700' : ''}`}
              style={{ color: viewMode === 'list' ? '#FAFAFA' : '#52525B' }}
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {viewMode === 'list' && (
          <div className="flex gap-2 mb-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-8 text-xs" style={{ backgroundColor: '#27272A', borderColor: '#3F3F46', color: '#A1A1AA' }}>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: '#18181B', borderColor: '#27272A' }}>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="novo">Novo</SelectItem>
                <SelectItem value="em_analise">Em Análise</SelectItem>
                <SelectItem value="aprovado">Aprovado</SelectItem>
                <SelectItem value="reprovado">Reprovado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={positionFilter} onValueChange={setPositionFilter}>
              <SelectTrigger className="w-[160px] h-8 text-xs" style={{ backgroundColor: '#27272A', borderColor: '#3F3F46', color: '#A1A1AA' }}>
                <SelectValue placeholder="Vaga" />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: '#18181B', borderColor: '#27272A' }}>
                <SelectItem value="all">Todas as vagas</SelectItem>
                {positions.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" style={{ color: '#52525B' }} /></div>
        ) : viewMode === 'kanban' ? (
          <RecruitmentKanban
            candidates={filtered}
            tenantId={tenantId || ''}
            onScheduleInterview={(c) => setInterviewDialog({ open: true, candidate: c })}
            onViewCandidate={() => {}}
          />
        ) : (
          <div className="space-y-2">
            {filtered.map((candidate, i) => {
              const s = STATUS_STYLES[candidate.status];
              return (
                <motion.div key={candidate.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="rounded-xl p-4 transition-colors hover:bg-zinc-800/30" style={{ backgroundColor: '#18181B', border: '1px solid #27272A' }}>
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="text-xs font-semibold" style={{ backgroundColor: '#27272A', color: '#A1A1AA' }}>{candidate.initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium" style={{ color: '#FAFAFA' }}>{candidate.name}</p>
                        {candidate.aiRecommended && (
                          <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium"
                            style={{ backgroundColor: 'rgba(194, 65, 12, 0.15)', color: '#EA580C' }}>
                            <Sparkles className="h-3 w-3" /> Recomendado pela IA
                          </span>
                        )}
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: '#71717A' }}>{candidate.position}</p>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className="text-[10px]" style={{ color: '#52525B' }}>Enviado: {candidate.submittedAt}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: s.bg, color: s.text }}>{s.label}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-zinc-700" style={{ color: '#8B5CF6' }}
                        title="Agendar entrevista" onClick={() => setInterviewDialog({ open: true, candidate })}>
                        <Calendar className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-zinc-700" style={{ color: '#71717A' }} title="Ver currículo">
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-zinc-700" style={{ color: '#71717A' }} title="Visualizar">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Interview scheduling dialog */}
      {interviewDialog.candidate && (
        <InterviewDialog
          open={interviewDialog.open}
          onOpenChange={(open) => setInterviewDialog({ open, candidate: open ? interviewDialog.candidate : null })}
          tenantId={tenantId || ''}
          candidateId={interviewDialog.candidate.id}
          candidateName={interviewDialog.candidate.name}
        />
      )}
    </div>
  );
}
