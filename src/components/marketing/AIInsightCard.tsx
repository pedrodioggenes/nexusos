import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  X, 
  ChevronRight, 
  Lightbulb,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useDismissInsight, useGenerateInsight, useLatestInsight, type AIInsight } from "@/hooks/useAIInsights";
import { InsightHistoryDialog } from "./InsightHistoryDialog";
import { getInsightConfig, type ModuleColor, type InsightType } from "@/lib/insight-config";

const colorClasses: Record<ModuleColor, {
  border: string;
  borderActive: string;
  bg: string;
  bgActive: string;
  iconBg: string;
  iconBgActive: string;
  text: string;
  button: string;
  hoverBorder: string;
}> = {
  gestao: {
    border: 'border-app-gestao/20',
    borderActive: 'border-app-gestao/30',
    bg: 'from-app-gestao/5 to-transparent',
    bgActive: 'from-app-gestao/10 via-app-gestao/5 to-transparent',
    iconBg: 'bg-app-gestao/10',
    iconBgActive: 'bg-app-gestao/20',
    text: 'text-app-gestao',
    button: 'bg-app-gestao hover:bg-app-gestao/90',
    hoverBorder: 'hover:bg-app-gestao/10 hover:border-app-gestao/50',
  },
  ofertas: {
    border: 'border-app-ofertas/20',
    borderActive: 'border-app-ofertas/30',
    bg: 'from-app-ofertas/5 to-transparent',
    bgActive: 'from-app-ofertas/10 via-app-ofertas/5 to-transparent',
    iconBg: 'bg-app-ofertas/10',
    iconBgActive: 'bg-app-ofertas/20',
    text: 'text-app-ofertas',
    button: 'bg-app-ofertas hover:bg-app-ofertas/90',
    hoverBorder: 'hover:bg-app-ofertas/10 hover:border-app-ofertas/50',
  },
  trade: {
    border: 'border-app-trade/20',
    borderActive: 'border-app-trade/30',
    bg: 'from-app-trade/5 to-transparent',
    bgActive: 'from-app-trade/10 via-app-trade/5 to-transparent',
    iconBg: 'bg-app-trade/10',
    iconBgActive: 'bg-app-trade/20',
    text: 'text-app-trade',
    button: 'bg-app-trade hover:bg-app-trade/90',
    hoverBorder: 'hover:bg-app-trade/10 hover:border-app-trade/50',
  },
  ia: {
    border: 'border-app-ia/20',
    borderActive: 'border-app-ia/30',
    bg: 'from-app-ia/5 to-transparent',
    bgActive: 'from-app-ia/10 via-app-ia/5 to-transparent',
    iconBg: 'bg-app-ia/10',
    iconBgActive: 'bg-app-ia/20',
    text: 'text-app-ia',
    button: 'bg-app-ia hover:bg-app-ia/90',
    hoverBorder: 'hover:bg-app-ia/10 hover:border-app-ia/50',
  },
};

interface Suggestion {
  id: string;
  text: string;
  action_type: string;
  route?: string;
}

interface AIInsightCardProps {
  type: InsightType;
  contextData?: Record<string, unknown>;
  prompt?: string;
  className?: string;
  moduleColor?: ModuleColor;
  onActionClick?: (action: string, route?: string) => void;
  showHistory?: boolean;
}

export function AIInsightCard({
  type,
  contextData = {},
  prompt,
  className,
  moduleColor,
  onActionClick,
  showHistory = true,
}: AIInsightCardProps) {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [localInsight, setLocalInsight] = useState<AIInsight | null>(null);
  
  // Get config for this insight type
  const config = getInsightConfig(type);
  const effectiveModuleColor = moduleColor || config.moduleColor;
  const effectivePrompt = prompt || config.defaultPrompt;
  
  // Fetch the latest insight for this type
  const { data: fetchedInsight, isLoading } = useLatestInsight(type);
  const dismissInsight = useDismissInsight();
  const generateInsight = useGenerateInsight();
  
  const colors = colorClasses[effectiveModuleColor];

  // Use local insight if available, otherwise use fetched insight
  const insight = localInsight || fetchedInsight;

  // Clear local insight when component unmounts or type changes
  useEffect(() => {
    setLocalInsight(null);
  }, [type]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const newInsight = await generateInsight.mutateAsync({ 
        type, 
        contextData, 
        prompt: effectivePrompt 
      });
      // Set local insight immediately for instant UI feedback
      setLocalInsight(newInsight as AIInsight);
    } catch (error) {
      console.error('Failed to generate insight:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDismiss = () => {
    if (insight?.id) {
      dismissInsight.mutate(insight.id);
      setLocalInsight(null);
    }
  };

  const handleActionClick = (suggestion: Suggestion) => {
    if (suggestion.action_type === 'navigate' && suggestion.route) {
      navigate(suggestion.route);
    } else {
      onActionClick?.(suggestion.action_type, suggestion.route);
    }
  };

  const handleHistorySelect = (selectedInsight: AIInsight) => {
    setLocalInsight(selectedInsight);
  };

  // Parse suggestions from insight
  const suggestions: Suggestion[] = Array.isArray(insight?.suggestions) 
    ? (insight.suggestions as unknown as Suggestion[])
    : [];

  // Loading state
  if (isLoading) {
    return (
      <Card className={cn(
        "bg-gradient-to-br animate-pulse",
        colors.border,
        colors.bg,
        className
      )}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={cn("h-10 w-10 rounded-xl", colors.iconBg)} />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Se não há insight, mostrar botão para gerar
  if (!insight) {
    return (
      <Card className={cn(
        "bg-gradient-to-br",
        colors.border,
        colors.bg,
        className
      )}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", colors.iconBg)}>
                <Sparkles className={cn("h-5 w-5", colors.text)} />
              </div>
              <div>
                <h3 className="font-medium text-sm">Insights da NexusIA</h3>
                <p className="text-xs text-muted-foreground">
                  {config.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {showHistory && (
                <InsightHistoryDialog 
                  type={type} 
                  onSelectInsight={handleHistorySelect}
                />
              )}
              <Button
                size="sm"
                onClick={handleGenerate}
                disabled={isGenerating}
                className={cn("text-white gap-2", colors.button)}
              >
                {isGenerating ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                {isGenerating ? "Analisando..." : "Gerar Insight"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mostrar insight existente
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={insight.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        <Card className={cn(
          "bg-gradient-to-br overflow-hidden",
          colors.borderActive,
          colors.bgActive,
          className
        )}>
          <CardContent className="p-4 relative">
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", colors.iconBgActive)}>
                <Lightbulb className={cn("h-5 w-5", colors.text)} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-xs font-medium", colors.text)}>
                      Insight: {config.label}
                    </span>
                    {insight.confidence_score && (
                      <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {insight.confidence_score}% confiança
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {showHistory && (
                      <InsightHistoryDialog 
                        type={type} 
                        onSelectInsight={handleHistorySelect}
                        className="h-6 px-2 text-xs"
                      />
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                      onClick={handleDismiss}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <p className="text-sm text-foreground/90 leading-relaxed mb-3">
                  {insight.insight_text}
                </p>

                {/* Suggestions/Actions */}
                {suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion, idx) => (
                      <Button
                        key={suggestion.id || idx}
                        variant="outline"
                        size="sm"
                        className={cn("h-7 text-xs gap-1", colors.border, colors.hoverBorder)}
                        onClick={() => handleActionClick(suggestion)}
                      >
                        {suggestion.text}
                        {suggestion.action_type === 'navigate' ? (
                          <ExternalLink className="h-3 w-3" />
                        ) : (
                          <ChevronRight className="h-3 w-3" />
                        )}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Refresh button */}
            <div className="absolute bottom-2 right-2">
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-7 w-7 text-muted-foreground", `hover:${colors.text}`)}
                onClick={handleGenerate}
                disabled={isGenerating}
                title="Gerar novo insight"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", isGenerating && "animate-spin")} />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
