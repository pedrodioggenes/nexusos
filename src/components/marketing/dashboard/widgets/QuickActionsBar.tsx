import { useNavigate } from "react-router-dom";
import {
  Plus, FileText, Calendar, Inbox, Play, ClipboardList, DollarSign, ShoppingBag
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuickAction {
  icon: typeof Plus;
  label: string;
  path: string;
}

const ACTIONS: QuickAction[] = [
  { icon: Inbox, label: "Nova Demanda", path: "/app/marketing/demandas/nova" },
  { icon: Calendar, label: "Calendário", path: "/app/marketing/planejamento" },
  { icon: DollarSign, label: "Financeiro", path: "/app/marketing/financeiro" },
  { icon: Play, label: "Demandas", path: "/app/marketing/demandas" },
  { icon: ShoppingBag, label: "Ações Comerciais", path: "/app/marketing/acoes" },
  { icon: ClipboardList, label: "Operação", path: "/app/marketing/operacao" },
];

export function QuickActionsBar() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-wrap gap-1.5 overflow-x-auto">
      {ACTIONS.map(a => {
        const Icon = a.icon;
        return (
          <Button
            key={a.path}
            variant="outline"
            size="sm"
            className="h-7 text-[11px] gap-1.5 hover:bg-primary/5 hover:border-primary/30"
            onClick={() => navigate(a.path)}
          >
            <Icon className="h-3 w-3" />
            {a.label}
          </Button>
        );
      })}
    </div>
  );
}
