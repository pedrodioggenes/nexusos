import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Shield, ShieldCheck, ShieldAlert, ShieldX,
  ToggleLeft, ToggleRight, ExternalLink,
  AlertCircle, AlertTriangle, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useAlertRules, useToggleAlertRule, type AlertRule } from "@/hooks/useAlertRules";
import { Empty } from "@/components/ui/empty";

const severityConfig = {
  critical: { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10", label: "Crítico" },
  warning: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10", label: "Atenção" },
  info: { icon: Info, color: "text-blue-500", bg: "bg-blue-500/10", label: "Info" },
};

export function AlertRulesPanel() {
  const { data: rules = [], isLoading } = useAlertRules();
  const toggleRule = useToggleAlertRule();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="h-5 w-5 border-2 border-app-gestao/30 border-t-app-gestao rounded-full animate-spin" />
      </div>
    );
  }

  if (rules.length === 0) {
    return (
      <Empty
        icon={<Shield className="h-8 w-8" />}
        title="Nenhuma regra configurada"
        description="Regras de alerta serão criadas automaticamente ao inicializar o sistema."
      />
    );
  }

  const enabledCount = rules.filter(r => r.enabled).length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>{enabledCount} de {rules.length} regras ativas</span>
        </div>
      </div>

      {/* Rules List */}
      <div className="space-y-2">
        {rules.map((rule, index) => {
          const config = severityConfig[rule.severity as keyof typeof severityConfig] || severityConfig.info;
          const Icon = config.icon;

          return (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className={cn(
                "rounded-xl border border-border bg-card p-4 transition-all",
                !rule.enabled && "opacity-60"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center shrink-0", config.bg)}>
                  <Icon className={cn("h-5 w-5", config.color)} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge variant="outline" className={cn("text-[10px]", config.color)}>
                      {config.label}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {rule.rule_key}
                    </Badge>
                  </div>

                  <h3 className="font-medium text-sm">{rule.name}</h3>
                  {rule.description && (
                    <p className="text-xs text-muted-foreground mt-1">{rule.description}</p>
                  )}

                  {rule.action_link && (
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
                      <ExternalLink className="h-3 w-3" />
                      <span className="truncate">{rule.action_link}</span>
                    </div>
                  )}
                </div>

                <Switch
                  checked={rule.enabled}
                  onCheckedChange={(checked) => toggleRule.mutate({ id: rule.id, enabled: checked })}
                  className="shrink-0"
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
