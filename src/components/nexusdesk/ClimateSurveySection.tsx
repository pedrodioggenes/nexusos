import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useHWTenantId } from "@/hooks/useHWTenantId";
import { useHWClimateSurveys, useCreateClimateSurvey, useSubmitClimateResponse } from "@/hooks/useHWClimateSurveys";
import { useHWProfile } from "@/hooks/useHWProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { BarChart3, Plus, Loader2, CheckCircle2, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export function ClimateSurveySection() {
  const { user } = useAuth();
  const { data: tenantId } = useHWTenantId();
  const { profile } = useHWProfile();
  const { data: surveys, isLoading } = useHWClimateSurveys(tenantId || undefined, user?.id);
  const createSurvey = useCreateClimateSurvey();
  const submitResponse = useSubmitClimateResponse();
  const [showCreate, setShowCreate] = useState(false);
  const [showRespond, setShowRespond] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newQuestions, setNewQuestions] = useState<string[]>(["", "", ""]);
  const [answers, setAnswers] = useState<Record<string, number | string>>({});

  const canCreate = profile === 'diretor' || profile === 'chefe' || profile === 'secretaria';
  const currentSurvey = surveys?.find(s => s.id === showRespond);

  const handleCreateSurvey = () => {
    if (!user?.id || !tenantId || !newTitle.trim()) return;
    const questions = newQuestions.filter(q => q.trim()).map((q, i) => ({ id: `q${i}`, text: q.trim(), type: "rating" as const }));
    if (questions.length === 0) { toast.error("Adicione pelo menos uma pergunta"); return; }
    createSurvey.mutate(
      { tenant_id: tenantId, created_by: user.id, title: newTitle.trim(), questions },
      {
        onSuccess: () => {
          toast.success("Pesquisa criada!");
          setShowCreate(false);
          setNewTitle("");
          setNewQuestions(["", "", ""]);
        },
      }
    );
  };

  const handleSubmitResponse = () => {
    if (!user?.id || !tenantId || !showRespond || !currentSurvey) return;
    submitResponse.mutate(
      { survey_id: showRespond, tenant_id: tenantId, user_id: user.id, answers, is_anonymous: currentSurvey.is_anonymous },
      {
        onSuccess: () => {
          toast.success("Resposta enviada!");
          setShowRespond(null);
          setAnswers({});
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" style={{ color: '#A855F7' }} />
          <h2 className="text-sm font-bold" style={{ color: '#FAFAFA' }}>Pesquisa de Clima</h2>
        </div>
        {canCreate && (
          <Button size="sm" className="h-8 text-xs gap-1.5 rounded-lg" style={{ backgroundColor: '#C2410C', color: '#FFFFFF' }}
            onClick={() => setShowCreate(true)}>
            <Plus className="h-3 w-3" /> Nova Pesquisa
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin" style={{ color: '#52525B' }} /></div>
      ) : !surveys?.length ? (
        <div className="text-center py-8 rounded-xl" style={{ backgroundColor: '#18181B', border: '1px solid #27272A' }}>
          <BarChart3 className="h-8 w-8 mx-auto mb-2" style={{ color: '#3F3F46' }} />
          <p className="text-xs" style={{ color: '#71717A' }}>Nenhuma pesquisa de clima ativa.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {surveys.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl p-4" style={{ backgroundColor: '#18181B', border: '1px solid #27272A' }}>
              <div className="flex items-center gap-2 mb-2">
                {s.is_anonymous && <Lock className="h-3 w-3" style={{ color: '#A855F7' }} />}
                <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#A855F7' }}>
                  {s.is_anonymous ? 'Anônima' : 'Identificada'}
                </span>
                <span className="text-[10px] ml-auto" style={{ color: '#52525B' }}>
                  {s.response_count} resposta{(s.response_count || 0) !== 1 ? 's' : ''}
                </span>
              </div>
              <h3 className="text-sm font-semibold" style={{ color: '#FAFAFA' }}>{s.title}</h3>
              {s.description && <p className="text-xs mt-1" style={{ color: '#A1A1AA' }}>{s.description}</p>}
              <p className="text-[10px] mt-1" style={{ color: '#52525B' }}>{s.questions.length} perguntas</p>
              <div className="mt-3">
                {s.user_responded ? (
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: '#22C55E' }}>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Você já respondeu
                  </div>
                ) : (
                  <Button size="sm" onClick={() => { setShowRespond(s.id); setAnswers({}); }}
                    className="h-7 text-xs rounded-lg" style={{ backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#A855F7', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                    Responder
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Survey Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-md" style={{ backgroundColor: '#18181B', borderColor: '#27272A' }}>
          <DialogHeader><DialogTitle style={{ color: '#FAFAFA' }}>Nova Pesquisa de Clima</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Título da pesquisa"
              style={{ backgroundColor: '#27272A', borderColor: '#3F3F46', color: '#FAFAFA' }} />
            <div>
              <label className="text-xs font-medium mb-2 block" style={{ color: '#A1A1AA' }}>Perguntas (escala 1-5)</label>
              {newQuestions.map((q, i) => (
                <Input key={i} value={q} onChange={e => { const nq = [...newQuestions]; nq[i] = e.target.value; setNewQuestions(nq); }}
                  placeholder={`Pergunta ${i + 1}`} className="mb-2"
                  style={{ backgroundColor: '#27272A', borderColor: '#3F3F46', color: '#FAFAFA' }} />
              ))}
              <Button variant="ghost" size="sm" onClick={() => setNewQuestions([...newQuestions, ""])}
                className="text-xs" style={{ color: '#A855F7' }}>+ Adicionar pergunta</Button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateSurvey} disabled={!newTitle.trim() || createSurvey.isPending}
              className="w-full" style={{ backgroundColor: '#C2410C', color: '#FFFFFF' }}>
              Criar Pesquisa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Respond Dialog */}
      <Dialog open={!!showRespond} onOpenChange={(open) => { if (!open) setShowRespond(null); }}>
        <DialogContent className="sm:max-w-md" style={{ backgroundColor: '#18181B', borderColor: '#27272A' }}>
          <DialogHeader><DialogTitle style={{ color: '#FAFAFA' }}>{currentSurvey?.title}</DialogTitle></DialogHeader>
          {currentSurvey?.is_anonymous && (
            <div className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)', color: '#A855F7' }}>
              <Lock className="h-3 w-3" /> Resposta anônima — sua identidade não será registrada
            </div>
          )}
          <div className="space-y-5 max-h-[50vh] overflow-y-auto">
            {currentSurvey?.questions.map(q => (
              <div key={q.id}>
                <p className="text-xs font-medium mb-2" style={{ color: '#D4D4D8' }}>{q.text}</p>
                <div className="flex items-center gap-3">
                  <span className="text-[10px]" style={{ color: '#52525B' }}>1</span>
                  <Slider min={1} max={5} step={1} value={[Number(answers[q.id]) || 3]}
                    onValueChange={([v]) => setAnswers(prev => ({ ...prev, [q.id]: v }))}
                    className="flex-1" />
                  <span className="text-[10px]" style={{ color: '#52525B' }}>5</span>
                  <span className="text-xs font-bold w-6 text-center" style={{ color: '#A855F7' }}>{answers[q.id] || 3}</span>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={handleSubmitResponse} disabled={submitResponse.isPending}
              className="w-full" style={{ backgroundColor: '#C2410C', color: '#FFFFFF' }}>
              {submitResponse.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Enviar Respostas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
