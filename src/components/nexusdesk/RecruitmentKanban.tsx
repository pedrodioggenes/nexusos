import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sparkles, Calendar, ChevronRight, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUpdateHWCandidateStatus } from "@/hooks/useHWCandidates";

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

const KANBAN_STAGES = [
  { key: 'triagem', label: 'Triagem', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  { key: 'entrevista', label: 'Entrevista', color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
  { key: 'avaliacao', label: 'Avaliação', color: '#EAB308', bg: 'rgba(234,179,8,0.12)' },
  { key: 'proposta', label: 'Proposta', color: '#F97316', bg: 'rgba(249,115,22,0.12)' },
  { key: 'contratado', label: 'Contratado', color: '#22C55E', bg: 'rgba(34,197,94,0.12)' },
];

interface Props {
  candidates: CandidateItem[];
  tenantId: string;
  onScheduleInterview: (candidate: CandidateItem) => void;
  onViewCandidate: (candidate: CandidateItem) => void;
}

export function RecruitmentKanban({ candidates, tenantId, onScheduleInterview, onViewCandidate }: Props) {
  const updateStatus = useUpdateHWCandidateStatus();
  const [dragging, setDragging] = useState<string | null>(null);

  const getStageForCandidate = (c: CandidateItem) => {
    if (c.kanbanStage) return c.kanbanStage;
    // Map legacy status to kanban stage
    switch (c.status) {
      case 'novo': return 'triagem';
      case 'em_analise': return 'entrevista';
      case 'aprovado': return 'contratado';
      case 'reprovado': return 'triagem';
      default: return 'triagem';
    }
  };

  const handleDrop = (stageKey: string, candidateId: string) => {
    setDragging(null);
    // Map kanban stage back to status for DB
    const statusMap: Record<string, string> = {
      triagem: 'novo',
      entrevista: 'em_analise',
      avaliacao: 'em_analise',
      proposta: 'em_analise',
      contratado: 'aprovado',
    };
    updateStatus.mutate({ id: candidateId, status: statusMap[stageKey] || 'novo', tenantId });
  };

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 px-1" style={{ minHeight: 400 }}>
      {KANBAN_STAGES.map((stage) => {
        const stageCandidates = candidates.filter(c => getStageForCandidate(c) === stage.key);
        return (
          <div
            key={stage.key}
            className="flex-shrink-0 w-[220px] rounded-xl p-3"
            style={{ backgroundColor: '#0F0F10', border: '1px solid #27272A' }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const id = e.dataTransfer.getData('candidateId');
              if (id) handleDrop(stage.key, id);
            }}
          >
            {/* Column header */}
            <div className="flex items-center gap-2 mb-3">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: stage.color }} />
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: stage.color }}>
                {stage.label}
              </span>
              <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: stage.bg, color: stage.color }}>
                {stageCandidates.length}
              </span>
            </div>

            {/* Cards */}
            <div className="space-y-2">
              <AnimatePresence>
                {stageCandidates.map((c) => (
                  <motion.div
                    key={c.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    draggable
                    onDragStart={(e: any) => {
                      setDragging(c.id);
                      e.dataTransfer?.setData('candidateId', c.id);
                    }}
                    onDragEnd={() => setDragging(null)}
                    className={`rounded-lg p-3 cursor-grab active:cursor-grabbing transition-all ${
                      dragging === c.id ? 'opacity-50 scale-95' : ''
                    }`}
                    style={{ backgroundColor: '#18181B', border: '1px solid #27272A' }}
                  >
                    <div className="flex items-start gap-2">
                      <Avatar className="h-7 w-7 shrink-0">
                        <AvatarFallback className="text-[10px] font-semibold" style={{ backgroundColor: '#27272A', color: '#A1A1AA' }}>
                          {c.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate" style={{ color: '#FAFAFA' }}>{c.name}</p>
                        <p className="text-[10px] truncate" style={{ color: '#52525B' }}>{c.position}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 mt-2 flex-wrap">
                      {c.aiRecommended && (
                        <span className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full"
                          style={{ backgroundColor: 'rgba(194,65,12,0.15)', color: '#EA580C' }}>
                          <Sparkles className="h-2.5 w-2.5" /> IA
                        </span>
                      )}
                      {(c.rating || 0) > 0 && (
                        <span className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full"
                          style={{ backgroundColor: 'rgba(234,179,8,0.15)', color: '#EAB308' }}>
                          <Star className="h-2.5 w-2.5" /> {c.rating}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-1 mt-2">
                      {stage.key === 'triagem' && (
                        <Button
                          variant="ghost" size="sm"
                          className="h-6 text-[10px] px-2 hover:bg-zinc-700 flex-1"
                          style={{ color: '#8B5CF6' }}
                          onClick={() => onScheduleInterview(c)}
                        >
                          <Calendar className="h-3 w-3 mr-1" /> Agendar
                        </Button>
                      )}
                      <Button
                        variant="ghost" size="sm"
                        className="h-6 text-[10px] px-2 hover:bg-zinc-700"
                        style={{ color: '#71717A' }}
                        onClick={() => onViewCandidate(c)}
                      >
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </div>
  );
}
