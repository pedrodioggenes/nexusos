import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarChart3, Plus, X } from "lucide-react";

interface PollComposerProps {
  onPollData: (data: { question: string; options: string[] } | null) => void;
}

export function PollComposer({ onPollData }: PollComposerProps) {
  const [active, setActive] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);

  const handleToggle = () => {
    if (active) {
      setActive(false);
      onPollData(null);
      setQuestion("");
      setOptions(["", ""]);
    } else {
      setActive(true);
    }
  };

  const addOption = () => {
    if (options.length < 6) setOptions([...options, ""]);
  };

  const removeOption = (idx: number) => {
    if (options.length <= 2) return;
    const next = options.filter((_, i) => i !== idx);
    setOptions(next);
    updateParent(question, next);
  };

  const updateOption = (idx: number, val: string) => {
    const next = [...options];
    next[idx] = val;
    setOptions(next);
    updateParent(question, next);
  };

  const updateQuestion = (q: string) => {
    setQuestion(q);
    updateParent(q, options);
  };

  const updateParent = (q: string, opts: string[]) => {
    const validOpts = opts.filter(o => o.trim());
    if (q.trim() && validOpts.length >= 2) {
      onPollData({ question: q.trim(), options: validOpts });
    } else {
      onPollData(null);
    }
  };

  if (!active) {
    return (
      <Button variant="ghost" size="sm" onClick={handleToggle} className="text-festval-stone">
        <BarChart3 className="h-4 w-4 mr-1" /> Enquete
      </Button>
    );
  }

  return (
    <div className="space-y-2 p-3 rounded-lg" style={{ backgroundColor: 'hsl(var(--festval-border))', border: '1px solid hsl(var(--festval-surface-elevated))' }}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold flex items-center gap-1.5 text-festval-ivory">
          <BarChart3 className="h-3.5 w-3.5" style={{ color: '#3B82F6' }} /> Enquete Rápida
        </span>
        <button onClick={handleToggle}>
          <X className="h-3.5 w-3.5 text-festval-stone" />
        </button>
      </div>

      <Input
        value={question}
        onChange={(e) => updateQuestion(e.target.value)}
        placeholder="Pergunta da enquete..."
        className="h-8 text-xs"
        style={{ backgroundColor: 'hsl(var(--festval-graphite))', borderColor: 'hsl(var(--festval-border))', color: 'hsl(var(--festval-ivory))' }}
      />

      {options.map((opt, i) => (
        <div key={i} className="flex gap-1.5">
          <Input
            value={opt}
            onChange={(e) => updateOption(i, e.target.value)}
            placeholder={`Opção ${i + 1}`}
            className="h-7 text-xs flex-1"
            style={{ backgroundColor: 'hsl(var(--festval-graphite))', borderColor: 'hsl(var(--festval-border))', color: 'hsl(var(--festval-ivory))' }}
          />
          {options.length > 2 && (
            <button onClick={() => removeOption(i)} className="shrink-0">
              <X className="h-3 w-3 text-festval-stone" />
            </button>
          )}
        </div>
      ))}

      {options.length < 6 && (
        <button onClick={addOption} className="text-[10px] flex items-center gap-1 hover:underline" style={{ color: '#3B82F6' }}>
          <Plus className="h-3 w-3" /> Adicionar opção
        </button>
      )}
    </div>
  );
}
