import { memo, useState, useCallback, useEffect } from 'react';
import { 
  BarChart3, Target, ShoppingCart, Package, Users, Briefcase, Code, Check,
  Store, DollarSign, Warehouse, GraduationCap, HeartHandshake, ShoppingBag
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface Integration {
  id: string;
  icon: React.ElementType;
  label: string;
  color: string;
  description: string;
  toolGroup: string;
}

const INTEGRATIONS: Integration[] = [
  { id: 'dominio', icon: Briefcase, label: 'Domínio', color: '#fb923c', description: 'BI executivo, KPIs e dashboards consolidados', toolGroup: 'erp' },
  { id: 'financeiro', icon: DollarSign, label: 'Financeiro', color: '#f59e0b', description: 'DRE, margens, CCC/NCG e alertas financeiros', toolGroup: 'financeiro' },
  { id: 'loja', icon: Store, label: 'Loja', color: '#ef4444', description: 'Rentabilidade/m², precificação, perdas e IPC', toolGroup: 'loja' },
  { id: 'marketing', icon: BarChart3, label: 'Marketing', color: '#60a5fa', description: 'Orçamentos, KPIs e planejamento de marketing', toolGroup: 'marketing' },
  { id: 'trade', icon: ShoppingCart, label: 'Trade', color: '#34d399', description: 'Acordos comerciais e comprovações de PDV', toolGroup: 'trade' },
  { id: 'ofertas', icon: Package, label: 'Ofertas', color: '#fbbf24', description: 'Campanhas de WhatsApp e contatos', toolGroup: 'ofertas' },
  { id: 'compras', icon: ShoppingBag, label: 'Compras', color: '#65a30d', description: 'Pedidos de compra, saving e negociações', toolGroup: 'compras' },
  { id: 'cd', icon: Warehouse, label: 'CD', color: '#06b6d4', description: 'WMS: estoque, recebimento, picking e expedição', toolGroup: 'cd' },
  { id: 'rh', icon: Users, label: 'RH', color: '#a78bfa', description: 'Headcount, turnover, absenteísmo e treinamentos', toolGroup: 'rh' },
  { id: 'cliente', icon: HeartHandshake, label: 'Cliente', color: '#ec4899', description: 'NPS, reclamações e segmentação de clientes', toolGroup: 'cliente' },
  { id: 'academy', icon: GraduationCap, label: 'Academy', color: '#8b5cf6', description: 'Trilhas de aprendizagem e certificações', toolGroup: 'academy' },
  { id: 'pmo', icon: Code, label: 'Tech', color: '#22d3ee', description: 'Incidentes de TI, SLA e infraestrutura', toolGroup: 'tech' },
];

const STORAGE_KEY = 'nexusia-connected-tools';

function loadConnected(): string[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveConnected(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

interface IntegrationsBarProps {
  onConnectionsChange?: (connectedIds: string[], toolGroups: string[]) => void;
}

export const IntegrationsBar = memo(function IntegrationsBar({ onConnectionsChange }: IntegrationsBarProps) {
  const [connected, setConnected] = useState<string[]>(loadConnected);

  useEffect(() => {
    const toolGroups = INTEGRATIONS
      .filter(i => connected.includes(i.id))
      .map(i => i.toolGroup);
    onConnectionsChange?.(connected, toolGroups);
  }, [connected, onConnectionsChange]);

  const toggleConnection = useCallback((integration: Integration) => {
    setConnected(prev => {
      const isConnected = prev.includes(integration.id);
      const next = isConnected 
        ? prev.filter(id => id !== integration.id) 
        : [...prev, integration.id];
      saveConnected(next);
      
      if (isConnected) {
        toast.info(`${integration.label} desconectado`, {
          description: 'A NexusIA não terá mais acesso a esses dados.',
        });
      } else {
        toast.success(`${integration.label} conectado!`, {
          description: integration.description,
        });
      }
      
      return next;
    });
  }, []);

  const connectAll = useCallback(() => {
    const allIds = INTEGRATIONS.map(i => i.id);
    setConnected(allIds);
    saveConnected(allIds);
    toast.success('Todos os aplicativos conectados!', { description: `${INTEGRATIONS.length} ferramentas ativas` });
  }, []);

  const noneConnected = connected.length === 0;
  const allConnected = connected.length === INTEGRATIONS.length;

  return (
    <div className="flex flex-col items-center gap-2 mt-4">
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <span className="text-[11px] text-[#71717A] mr-1">
          {noneConnected 
            ? 'Conecte suas ferramentas à NexusIA' 
            : `${connected.length}/${INTEGRATIONS.length} app${connected.length > 1 ? 's' : ''}`
          }
        </span>
        <div className="flex items-center gap-1 flex-wrap justify-center">
          {INTEGRATIONS.map((item) => {
            const isConnected = connected.includes(item.id);
            return (
              <TooltipProvider key={item.id} delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      onClick={() => toggleConnection(item)}
                      className={cn(
                        "h-7 w-7 rounded-lg flex items-center justify-center transition-all duration-200 relative",
                        isConnected 
                          ? "bg-[#27272A]/60" 
                          : "hover:bg-[#27272A]/40 opacity-50 hover:opacity-100"
                      )}
                      style={isConnected ? { boxShadow: `0 0 0 1px ${item.color}40` } : undefined}
                    >
                      <item.icon 
                        className="h-3.5 w-3.5 transition-colors" 
                        style={{ color: isConnected ? item.color : `${item.color}80` }} 
                      />
                      {isConnected && (
                        <div 
                          className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: item.color }}
                        >
                          <Check className="h-1.5 w-1.5 text-white" strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-[#27272A] text-[#FAFAFA] border-[#3F3F46] text-xs max-w-[200px]">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-[#A1A1AA] mt-0.5">{item.description}</div>
                    <div className="text-[10px] mt-1" style={{ color: isConnected ? '#34d399' : '#71717A' }}>
                      {isConnected ? '✓ Conectado — clique para desconectar' : 'Clique para conectar'}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
          {!allConnected && (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={connectAll}
                    className="h-7 px-2 rounded-lg flex items-center justify-center text-[10px] font-medium text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#27272A]/40 transition-all ml-1"
                  >
                    Todos
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-[#27272A] text-[#FAFAFA] border-[#3F3F46] text-xs">
                  Conectar todos os aplicativos
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </div>
  );
});

export { INTEGRATIONS };
export default IntegrationsBar;