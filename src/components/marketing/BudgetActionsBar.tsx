import { Plus, Minus, Calendar, ChevronDown, Wallet, ArrowRightLeft, DollarSign, FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MarketingBudgetCategory } from '@/hooks/useMarketingBudgets';

interface BudgetActionsBarProps {
  categories: MarketingBudgetCategory[];
  selectedPeriod: string;
  onEditAnnualBudget: () => void;
  onAddExtraBudget: () => void;
  onTransferBudget: () => void;
  onRegisterExpense: (category: MarketingBudgetCategory) => void;
  onCreateCategory: () => void;
  onPeriodChange: (period: string) => void;
}

const periods = [
  { value: 'month', label: 'Este Mês' },
  { value: 'quarter', label: 'Este Trimestre' },
  { value: 'semester', label: 'Este Semestre' },
  { value: 'year', label: 'Este Ano' },
  { value: 'last-year', label: 'Ano Anterior' },
];

export function BudgetActionsBar({
  categories,
  selectedPeriod,
  onEditAnnualBudget,
  onAddExtraBudget,
  onTransferBudget,
  onRegisterExpense,
  onCreateCategory,
  onPeriodChange,
}: BudgetActionsBarProps) {
  const selectedPeriodLabel = periods.find(p => p.value === selectedPeriod)?.label || 'Este Ano';

  return (
    <div className="flex flex-wrap items-center gap-1.5 py-1.5 px-2 md:px-3 rounded-lg bg-card/30 border border-border/50 backdrop-blur-sm">
      {/* Dropdown Receitas */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1 md:gap-1.5 h-7 text-[12px] md:text-[13px] hover:border-chart-success/50 hover:text-chart-success transition-colors px-2 md:px-3">
            <Plus className="h-3 w-3 md:h-3.5 md:w-3.5 text-chart-success" />
            <span className="hidden xs:inline">Receitas</span>
            <span className="xs:hidden">+</span>
            <ChevronDown className="h-2.5 w-2.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 bg-popover border-border">
          <DropdownMenuItem onClick={onEditAnnualBudget} className="gap-2 cursor-pointer">
            <Wallet className="h-4 w-4 text-app-gestao" />
            <div>
              <p className="font-medium">Orçamento Anual</p>
              <p className="text-xs text-muted-foreground">Definir ou editar budget total</p>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onAddExtraBudget} className="gap-2 cursor-pointer">
            <DollarSign className="h-4 w-4 text-chart-success" />
            <div>
              <p className="font-medium">Verba Extraordinária</p>
              <p className="text-xs text-muted-foreground">Adicionar aporte extra</p>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onTransferBudget} className="gap-2 cursor-pointer">
            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">Transferência</p>
              <p className="text-xs text-muted-foreground">Mover entre categorias</p>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dropdown Gastos */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1 md:gap-1.5 h-7 text-[12px] md:text-[13px] hover:border-chart-warning/50 hover:text-chart-warning transition-colors px-2 md:px-3">
            <Minus className="h-3 w-3 md:h-3.5 md:w-3.5 text-chart-warning" />
            <span className="hidden xs:inline">Gastos</span>
            <span className="xs:hidden">-</span>
            <ChevronDown className="h-2.5 w-2.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 bg-popover border-border max-h-[300px] overflow-y-auto">
          {categories.length === 0 ? (
            <div className="px-3 py-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">Nenhuma categoria criada</p>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={onCreateCategory}
                className="gap-1.5 hover:border-app-gestao/50"
              >
                <Plus className="h-3 w-3" />
                Criar Categoria
              </Button>
            </div>
          ) : (
            <>
              {categories.map((cat) => (
                <DropdownMenuItem 
                  key={cat.id} 
                  onClick={() => onRegisterExpense(cat)}
                  className="gap-2 cursor-pointer"
                >
                  <div 
                    className="h-3 w-3 rounded-full" 
                    style={{ backgroundColor: cat.color?.startsWith('bg-') ? undefined : cat.color || undefined }}
                  />
                  <span className="font-medium">{cat.name}</span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onCreateCategory} className="gap-2 cursor-pointer text-app-gestao">
                <FolderPlus className="h-4 w-4" />
                Nova Categoria de Gasto
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dropdown Período - aligned to the right */}
      <div className="flex-1" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1 md:gap-1.5 h-7 text-[11px] md:text-[13px] text-muted-foreground hover:text-foreground transition-colors px-2 md:px-3">
            <Calendar className="h-3 w-3 md:h-3.5 md:w-3.5" />
            <span className="hidden sm:inline">{selectedPeriodLabel}</span>
            <span className="sm:hidden">{periods.find(p => p.value === selectedPeriod)?.label.split(' ')[1] || 'Ano'}</span>
            <ChevronDown className="h-2.5 w-2.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40 bg-popover border-border">
          {periods.map((period) => (
            <DropdownMenuItem 
              key={period.value}
              onClick={() => onPeriodChange(period.value)}
              className={`cursor-pointer ${selectedPeriod === period.value ? 'bg-muted font-medium' : ''}`}
            >
              {period.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
