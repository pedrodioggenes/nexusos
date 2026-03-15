import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LinkToContext } from "./LinkToContext";
import { Sparkles, Send, RotateCcw } from "lucide-react";
import { AI_QUERY_TEMPLATES, type AIQueryTemplate } from "@/data/dominio/inteligencia-mock";
import ReactMarkdown from "react-markdown";

export function AskAIBox() {
  const [selectedQuery, setSelectedQuery] = useState<AIQueryTemplate | null>(null);
  const [customInput, setCustomInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const handleQuickQuestion = (template: AIQueryTemplate) => {
    setIsThinking(true);
    setSelectedQuery(null);
    // Simulate AI thinking
    setTimeout(() => {
      setSelectedQuery(template);
      setIsThinking(false);
    }, 800);
  };

  const handleCustomQuestion = () => {
    if (!customInput.trim()) return;
    setIsThinking(true);
    setSelectedQuery(null);
    setTimeout(() => {
      setSelectedQuery({
        id: "custom",
        label: customInput,
        question: customInput,
        answer: "Sem dado suficiente para responder essa pergunta com precisão.\n\nSugestões para obter a resposta:\n- Verifique os dashboards de **Vendas** e **Financeiro** para dados consolidados\n- Consulte **Produtos > Catálogo** para informações específicas de SKU\n- Use os **Alertas** para identificar problemas ativos",
        sources: [
          { label: "Dashboard Executivo", route: "/app/dominio" },
          { label: "Catálogo SKU", route: "/app/dominio/produtos/catalogo" },
        ],
      });
      setIsThinking(false);
      setCustomInput("");
    }, 1200);
  };

  const handleReset = () => {
    setSelectedQuery(null);
    setCustomInput("");
  };

  return (
    <div className="space-y-4">
      {/* Quick question buttons */}
      <div className="flex flex-wrap gap-2">
        {AI_QUERY_TEMPLATES.map((t) => (
          <Button
            key={t.id}
            variant="outline"
            size="sm"
            className="text-xs gap-1.5"
            onClick={() => handleQuickQuestion(t)}
            disabled={isThinking}
          >
            <Sparkles className="h-3 w-3" />
            {t.label}
          </Button>
        ))}
      </div>

      {/* Custom input */}
      <div className="flex gap-2">
        <Input
          placeholder="Faça uma pergunta sobre os dados da rede..."
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCustomQuestion()}
          className="text-sm"
        />
        <Button size="icon" onClick={handleCustomQuestion} disabled={isThinking || !customInput.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Thinking indicator */}
      {isThinking && (
        <Card className="p-4 border-app-ia/30 bg-app-ia/5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-app-ia animate-pulse" />
            <span className="text-sm text-muted-foreground">Analisando dados da rede...</span>
          </div>
        </Card>
      )}

      {/* Answer */}
      {selectedQuery && (
        <Card className="p-5 border-app-ia/30 bg-app-ia/5">
          <div className="space-y-4">
            {/* Question */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-app-ia" />
                <span className="text-sm font-semibold">{selectedQuery.question}</span>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleReset}>
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Answer content */}
            <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed">
              <ReactMarkdown>{selectedQuery.answer}</ReactMarkdown>
            </div>

            {/* Sources */}
            {selectedQuery.sources.length > 0 && (
              <div className="pt-2 border-t border-border/50">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-2">Fontes internas</p>
                <div className="flex flex-wrap gap-2">
                  {selectedQuery.sources.map((s, i) => (
                    <LinkToContext key={i} label={s.label} to={s.route} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
