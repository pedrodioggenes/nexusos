import { memo } from 'react';
import { ChevronDown, Check, Sparkles, Zap, Brain, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export type ThinkingMode = 'standard' | 'extended';

export type AIModel = 
  | 'gemini-flash' 
  | 'gemini-pro' 
  | 'gpt-5' 
  | 'gpt-5-mini'
  | 'gpt-5.2';

export interface ModelConfig {
  id: AIModel;
  label: string;
  shortLabel: string;
  description: string;
  provider: 'google' | 'openai';
  thinkingMode: ThinkingMode;
  apiModel: string;
  icon: typeof Zap;
  badge?: string;
}

export const AVAILABLE_MODELS: ModelConfig[] = [
  {
    id: 'gemini-flash',
    label: 'Gemini 3 Flash',
    shortLabel: 'Flash',
    description: 'Rápido e eficiente para tarefas gerais',
    provider: 'google',
    thinkingMode: 'standard',
    apiModel: 'google/gemini-3-flash-preview',
    icon: Zap,
  },
  {
    id: 'gemini-pro',
    label: 'Gemini 2.5 Pro',
    shortLabel: 'Pro',
    description: 'Pensamento profundo e raciocínio complexo',
    provider: 'google',
    thinkingMode: 'extended',
    apiModel: 'google/gemini-2.5-pro',
    icon: Brain,
    badge: 'Deep Think',
  },
  {
    id: 'gpt-5',
    label: 'GPT-5',
    shortLabel: 'GPT-5',
    description: 'Poderoso e preciso para análises detalhadas',
    provider: 'openai',
    thinkingMode: 'extended',
    apiModel: 'openai/gpt-5',
    icon: Sparkles,
  },
  {
    id: 'gpt-5-mini',
    label: 'GPT-5 Mini',
    shortLabel: 'Mini',
    description: 'Equilíbrio entre velocidade e qualidade',
    provider: 'openai',
    thinkingMode: 'standard',
    apiModel: 'openai/gpt-5-mini',
    icon: Cpu,
  },
  {
    id: 'gpt-5.2',
    label: 'GPT-5.2',
    shortLabel: 'GPT-5.2',
    description: 'Último modelo OpenAI com raciocínio avançado',
    provider: 'openai',
    thinkingMode: 'extended',
    apiModel: 'openai/gpt-5.2',
    icon: Sparkles,
    badge: 'Novo',
  },
];

interface ThinkingModeSelectorProps {
  value: ThinkingMode;
  onChange: (mode: ThinkingMode) => void;
  selectedModel?: AIModel;
  onModelChange?: (model: AIModel) => void;
  disabled?: boolean;
}

export const ThinkingModeSelector = memo(function ThinkingModeSelector({
  value,
  onChange,
  selectedModel = 'gemini-flash',
  onModelChange,
  disabled = false,
}: ThinkingModeSelectorProps) {
  const currentModel = AVAILABLE_MODELS.find(m => m.id === selectedModel) || AVAILABLE_MODELS[0];
  const Icon = currentModel.icon;

  const handleModelSelect = (modelId: string) => {
    const model = AVAILABLE_MODELS.find(m => m.id === modelId);
    if (model) {
      onModelChange?.(model.id);
      onChange(model.thinkingMode);
    }
  };

  const googleModels = AVAILABLE_MODELS.filter(m => m.provider === 'google');
  const openaiModels = AVAILABLE_MODELS.filter(m => m.provider === 'openai');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          disabled={disabled}
          className={cn(
            "h-8 gap-1.5 px-3 rounded-full text-[13px] font-normal transition-colors",
            "text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#27272A]/40"
          )}
        >
          <Icon className="h-3.5 w-3.5" />
          <span>{currentModel.label}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className="w-72 bg-[#0f0f10] border-[#3F3F46] p-1.5"
        sideOffset={8}
      >
        <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-[#71717A] px-3 py-1.5">
          Google Gemini
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup value={selectedModel} onValueChange={handleModelSelect}>
          {googleModels.map(model => {
            const ModelIcon = model.icon;
            return (
              <DropdownMenuRadioItem 
                key={model.id}
                value={model.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg cursor-pointer",
                  "hover:bg-[#27272A]/60 focus:bg-[#27272A]/60",
                  "data-[state=checked]:bg-[#27272A]/40"
                )}
              >
                <ModelIcon className="h-4 w-4 mt-0.5 text-[#4285F4]" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#FAFAFA]">{model.label}</span>
                    {model.badge && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#4285F4]/20 text-[#4285F4] font-medium">
                        {model.badge}
                      </span>
                    )}
                    {selectedModel === model.id && <Check className="h-3.5 w-3.5 text-[#EA580C]" />}
                  </div>
                  <p className="text-xs text-[#71717A] mt-0.5">{model.description}</p>
                </div>
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator className="bg-[#3F3F46]/50 my-1.5" />

        <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-[#71717A] px-3 py-1.5">
          OpenAI GPT
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup value={selectedModel} onValueChange={handleModelSelect}>
          {openaiModels.map(model => {
            const ModelIcon = model.icon;
            return (
              <DropdownMenuRadioItem 
                key={model.id}
                value={model.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg cursor-pointer",
                  "hover:bg-[#27272A]/60 focus:bg-[#27272A]/60",
                  "data-[state=checked]:bg-[#27272A]/40"
                )}
              >
                <ModelIcon className="h-4 w-4 mt-0.5 text-[#10a37f]" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#FAFAFA]">{model.label}</span>
                    {model.badge && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#10a37f]/20 text-[#10a37f] font-medium">
                        {model.badge}
                      </span>
                    )}
                    {selectedModel === model.id && <Check className="h-3.5 w-3.5 text-[#EA580C]" />}
                  </div>
                  <p className="text-xs text-[#71717A] mt-0.5">{model.description}</p>
                </div>
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

export default ThinkingModeSelector;