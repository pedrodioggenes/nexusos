import { useState } from "react";
import { BookOpen, Plus, FileText, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePMOTrainingSessions, useCreateTrainingSession, usePMOPlaybooks, useCreatePlaybook } from "@/hooks/usePMO";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PMOCapacitacao = () => {
  const { data: sessions = [] } = usePMOTrainingSessions();
  const { data: playbooks = [] } = usePMOPlaybooks();
  const createSession = useCreateTrainingSession();
  const createPlaybook = useCreatePlaybook();

  const [sessionOpen, setSessionOpen] = useState(false);
  const [playbookOpen, setPlaybookOpen] = useState(false);
  const [sessionForm, setSessionForm] = useState({ topic: "", audience: "", objectives: "", session_date: "", post_tasks: "" });
  const [playbookForm, setPlaybookForm] = useState({ title: "", description: "", category: "" });

  const handleCreateSession = async () => {
    if (!sessionForm.topic) return;
    await createSession.mutateAsync(sessionForm);
    setSessionOpen(false);
    setSessionForm({ topic: "", audience: "", objectives: "", session_date: "", post_tasks: "" });
  };

  const handleCreatePlaybook = async () => {
    if (!playbookForm.title) return;
    await createPlaybook.mutateAsync({ ...playbookForm, status: "published" });
    setPlaybookOpen(false);
    setPlaybookForm({ title: "", description: "", category: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-app-pmo/10 flex items-center justify-center">
          <BookOpen className="h-5 w-5 text-app-pmo" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Capacitação & Pairing</h1>
          <p className="text-sm text-muted-foreground">Sessões de treinamento e playbooks</p>
        </div>
      </div>

      <Tabs defaultValue="sessions">
        <TabsList>
          <TabsTrigger value="sessions" className="text-xs"><GraduationCap className="h-3.5 w-3.5 mr-1" /> Sessões</TabsTrigger>
          <TabsTrigger value="playbooks" className="text-xs"><FileText className="h-3.5 w-3.5 mr-1" /> Playbooks</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setSessionOpen(true)} className="bg-app-pmo hover:bg-app-pmo/90 text-white">
              <Plus className="h-4 w-4 mr-1" /> Agendar Sessão
            </Button>
          </div>
          {sessions.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">Nenhuma sessão registrada. Agende a primeira capacitação.</CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sessions.map(s => (
                <Card key={s.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{s.topic}</p>
                        <p className="text-xs text-muted-foreground">{s.session_date || "Sem data"}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px]">{s.audience || "Geral"}</Badge>
                    </div>
                    {s.objectives && <p className="text-xs text-muted-foreground mt-1">{s.objectives}</p>}
                    {s.post_tasks && <p className="text-xs text-app-pmo mt-1">Tarefas pós: {s.post_tasks}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="playbooks" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setPlaybookOpen(true)} className="bg-app-pmo hover:bg-app-pmo/90 text-white">
              <Plus className="h-4 w-4 mr-1" /> Publicar Playbook
            </Button>
          </div>
          {playbooks.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">Nenhum playbook publicado. Crie templates para a operação.</CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {playbooks.map(p => (
                <Card key={p.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-app-pmo" />
                      <p className="text-sm font-semibold text-foreground">{p.title}</p>
                    </div>
                    {p.category && <Badge variant="outline" className="text-[10px] mb-1">{p.category}</Badge>}
                    {p.description && <p className="text-xs text-muted-foreground mt-1">{p.description}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Session Dialog */}
      <Dialog open={sessionOpen} onOpenChange={setSessionOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Agendar Sessão</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Tema *</Label><Input value={sessionForm.topic} onChange={e => setSessionForm(p => ({ ...p, topic: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Público</Label><Input value={sessionForm.audience} onChange={e => setSessionForm(p => ({ ...p, audience: e.target.value }))} placeholder="Ex: Time Trade" /></div>
              <div><Label>Data</Label><Input type="date" value={sessionForm.session_date} onChange={e => setSessionForm(p => ({ ...p, session_date: e.target.value }))} /></div>
            </div>
            <div><Label>Objetivos</Label><Textarea value={sessionForm.objectives} onChange={e => setSessionForm(p => ({ ...p, objectives: e.target.value }))} rows={2} /></div>
            <div><Label>Tarefas Pós-Sessão</Label><Input value={sessionForm.post_tasks} onChange={e => setSessionForm(p => ({ ...p, post_tasks: e.target.value }))} /></div>
            <Button onClick={handleCreateSession} disabled={!sessionForm.topic || createSession.isPending} className="w-full bg-app-pmo hover:bg-app-pmo/90 text-white">Agendar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Playbook Dialog */}
      <Dialog open={playbookOpen} onOpenChange={setPlaybookOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Publicar Playbook</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Título *</Label><Input value={playbookForm.title} onChange={e => setPlaybookForm(p => ({ ...p, title: e.target.value }))} /></div>
            <div><Label>Categoria</Label><Input value={playbookForm.category} onChange={e => setPlaybookForm(p => ({ ...p, category: e.target.value }))} placeholder="Ex: Processo, Template" /></div>
            <div><Label>Descrição</Label><Textarea value={playbookForm.description} onChange={e => setPlaybookForm(p => ({ ...p, description: e.target.value }))} rows={3} /></div>
            <Button onClick={handleCreatePlaybook} disabled={!playbookForm.title || createPlaybook.isPending} className="w-full bg-app-pmo hover:bg-app-pmo/90 text-white">Publicar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PMOCapacitacao;
