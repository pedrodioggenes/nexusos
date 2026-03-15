import { useState, useEffect } from "react";
import { SlidersHorizontal, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { usePMOSettings, useUpsertPMOSettings } from "@/hooks/usePMO";

const PMOConfig = () => {
  const { data: settings, isLoading } = usePMOSettings();
  const upsertSettings = useUpsertPMOSettings();

  const [form, setForm] = useState({
    sprint_cadence: "2_weeks",
    semaphore_rules: "",
  });

  useEffect(() => {
    if (settings) {
      setForm({
        sprint_cadence: String(settings.sprint_cadence ?? "2_weeks"),
        semaphore_rules: settings.semaphore_rules ? JSON.stringify(settings.semaphore_rules, null, 2) : "",
      });
    }
  }, [settings]);

  const handleSave = () => {
    const payload: Record<string, unknown> = {
      sprint_cadence: form.sprint_cadence,
    };
    if (form.semaphore_rules) {
      try { payload.semaphore_rules = JSON.parse(form.semaphore_rules); } catch { payload.semaphore_rules = { raw: form.semaphore_rules }; }
    }
    upsertSettings.mutate(payload);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-app-pmo/10 flex items-center justify-center">
          <SlidersHorizontal className="h-5 w-5 text-app-pmo" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Configurações</h1>
          <p className="text-sm text-muted-foreground">Cadência de sprints, semáforo e templates</p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground text-sm">Carregando...</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border">
            <CardHeader><CardTitle className="text-sm">Cadência de Sprints</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Duração</Label>
                <Select value={form.sprint_cadence} onValueChange={v => setForm(p => ({ ...p, sprint_cadence: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1_week">1 semana</SelectItem>
                    <SelectItem value="2_weeks">2 semanas</SelectItem>
                    <SelectItem value="1_month">1 mês</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader><CardTitle className="text-sm">Regras de Semáforo</CardTitle></CardHeader>
            <CardContent>
              <Label className="text-xs text-muted-foreground">JSON com regras (green/yellow/red thresholds)</Label>
              <Textarea
                value={form.semaphore_rules}
                onChange={e => setForm(p => ({ ...p, semaphore_rules: e.target.value }))}
                rows={6}
                className="font-mono text-xs mt-1"
                placeholder='{"green": {"min_completion": 80}, "yellow": {"min_completion": 50}, "red": {"min_completion": 0}}'
              />
            </CardContent>
          </Card>

          <div className="lg:col-span-2 flex justify-end">
            <Button onClick={handleSave} disabled={upsertSettings.isPending} className="bg-app-pmo hover:bg-app-pmo/90 text-white">
              <Save className="h-4 w-4 mr-1" />Salvar Configurações
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PMOConfig;
