import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface ContextualSuggestionsProps {
  lastUserMessage?: { role: string; content: string };
  lastAssistantMessage?: { role: string; content: string };
  onSelect: (suggestion: string) => void;
  isDarkMode?: boolean;
}

const CONTEXTUAL_SUGGESTIONS: Record<string, string[]> = {
  stock: [
    "Quais produtos têm maior risco de ruptura?",
    "Compare estoque vs vendas da última semana",
    "Sugira reposições prioritárias",
  ],
  campaigns: [
    "Qual campanha teve melhor ROI?",
    "Sugira próxima campanha baseada nos dados",
    "Mostre taxa de abertura por segmento",
  ],
  budget: [
    "Onde há oportunidade de otimização?",
    "Compare execução por categoria",
    "Projete execução até fim do mês",
  ],
  trade: [
    "Quais comprovações estão pendentes?",
    "Mostre performance dos fornecedores",
    "Liste pacotes próximos do vencimento",
  ],
  analytics: [
    "Faça uma previsão para próxima semana",
    "Quais padrões você identifica nos dados?",
    "Gere um relatório comparativo mensal",
  ],
  default: [],
};

export function ContextualSuggestions({
  lastUserMessage,
  lastAssistantMessage,
  onSelect,
  isDarkMode,
}: ContextualSuggestionsProps) {
  const suggestions = useMemo(() => {
    // Prioritize user message for context, fallback to assistant
    const content = (lastUserMessage?.content || lastAssistantMessage?.content || '').toLowerCase();
    
    if (!content) return CONTEXTUAL_SUGGESTIONS.default;

    const rules = [
      { match: ['estoque', 'ruptura', 'inventário'], key: 'stock' },
      { match: ['campanha', 'marketing', 'whatsapp'], key: 'campaigns' },
      { match: ['orçamento', 'budget', 'verba'], key: 'budget' },
      { match: ['trade', 'fornecedor', 'comprovação'], key: 'trade' },
      { match: ['previsão', 'análise', 'tendência', 'relatório'], key: 'analytics' },
    ];

    const found = rules.find(r => r.match.some(k => content.includes(k)));
    return CONTEXTUAL_SUGGESTIONS[found?.key || 'default'];
  }, [lastUserMessage, lastAssistantMessage]);

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {suggestions.map((suggestion, index) => (
        <motion.button
          key={suggestion}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: index * 0.05 }}
          onClick={() => onSelect(suggestion)}
          className="px-3 py-1.5 text-sm rounded-full border transition-all duration-150 border-white/[0.08] text-white/50 hover:border-white/[0.15] hover:text-white/70 hover:bg-white/[0.04]"
        >
          {suggestion}
        </motion.button>
      ))}
    </div>
  );
}
