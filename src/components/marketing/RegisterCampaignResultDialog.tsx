import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  useCreateCampaignResult,
  useCampaignResults,
  type KpiSnapshot,
} from '@/hooks/useCampaignAttribution';
import {
  BarChart3,
  Save,
  TrendingUp,
  DollarSign,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RegisterCampaignResultDialogProps {
  campaignId: string;
  campaignName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const kpiFields = [
  { key: 'impressions', label: 'Impressões', unit: 'un.' },
  { key: 'clicks', label: 'Cliques', unit: 'un.' },
  { key: 'leads', label: 'Leads', unit: 'un.' },
  { key: 'conversions', label: 'Conversões', unit: 'un.' },
  { key: 'reach', label: 'Alcance', unit: 'un.' },
  { key: 'ctr', label: 'CTR', unit: '%' },
  { key: 'cpc', label: 'CPC', unit: 'R$' },
  { key: 'cpl', label: 'CPL', unit: 'R$' },
] as const;

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export function RegisterCampaignResultDialog({
  campaignId,
  campaignName,
  open,
  onOpenChange,
}: RegisterCampaignResultDialogProps) {
  const { toast } = useToast();
  const createResult = useCreateCampaignResult();
  const { data: existingResults = [] } = useCampaignResults(campaignId);

  const now = new Date();
  const [periodStart, setPeriodStart] = useState(
    new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  );
  const [periodEnd, setPeriodEnd] = useState(
    new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
  );
  const [investment, setInvestment] = useState('');
  const [revenue, setRevenue] = useState('');
  const [notes, setNotes] = useState('');
  const [kpiValues, setKpiValues] = useState<Record<string, string>>({});

  const invNum = parseFloat(investment) || 0;
  const revNum = parseFloat(revenue) || 0;
  const roi = invNum > 0 ? ((revNum - invNum) / invNum) * 100 : null;

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: role } = await supabase
        .from('user_roles')
        .select('tenant_id')
        .eq('user_id', user!.id)
        .single();

      const snapshot: KpiSnapshot = {};
      for (const [key, val] of Object.entries(kpiValues)) {
        const num = parseFloat(val);
        if (!isNaN(num)) snapshot[key] = num;
      }

      await createResult.mutateAsync({
        tenant_id: role!.tenant_id!,
        campaign_id: campaignId,
        period_start: periodStart,
        period_end: periodEnd,
        kpi_snapshot: snapshot,
        total_investment: invNum,
        total_revenue: revNum,
        notes: notes || undefined,
        created_by: user!.id,
      });

      toast({ title: 'Resultado registrado', description: `ROI: ${roi !== null ? roi.toFixed(1) + '%' : 'N/A'}` });
      onOpenChange(false);
    } catch {
      toast({ title: 'Erro', description: 'Falha ao registrar resultado', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-app-gestao" />
            Registrar Resultado
          </DialogTitle>
          <p className="text-xs text-muted-foreground">{campaignName}</p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Period */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Início</Label>
              <Input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Fim</Label>
              <Input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
            </div>
          </div>

          <Separator />

          {/* Financial */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs flex items-center gap-1">
                <DollarSign className="h-3 w-3" /> Investimento (R$)
              </Label>
              <Input
                type="number"
                placeholder="0.00"
                value={investment}
                onChange={(e) => setInvestment(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> Receita (R$)
              </Label>
              <Input
                type="number"
                placeholder="0.00"
                value={revenue}
                onChange={(e) => setRevenue(e.target.value)}
              />
            </div>
          </div>

          {/* ROI preview */}
          {roi !== null && (
            <div className={cn(
              'p-3 rounded-lg text-center',
              roi >= 0 ? 'bg-green-500/10' : 'bg-destructive/10'
            )}>
              <p className="text-xs text-muted-foreground">ROI Calculado</p>
              <p className={cn(
                'text-2xl font-bold',
                roi >= 0 ? 'text-green-600' : 'text-destructive'
              )}>
                {roi.toFixed(1)}%
              </p>
            </div>
          )}

          <Separator />

          {/* KPI Snapshot */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">
              KPIs do Período
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {kpiFields.map(field => (
                <div key={field.key} className="space-y-1">
                  <Label className="text-[10px]">{field.label} ({field.unit})</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    className="h-8 text-xs"
                    value={kpiValues[field.key] || ''}
                    onChange={(e) => setKpiValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <Label className="text-xs">Observações</Label>
            <Textarea
              placeholder="Notas sobre o período..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <Button
            className="w-full"
            onClick={handleSave}
            disabled={createResult.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            Registrar Resultado
          </Button>

          {/* Previous results */}
          {existingResults.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Resultados Anteriores ({existingResults.length})
                </h3>
                {existingResults.slice(0, 3).map(r => (
                  <div key={r.id} className="p-2 rounded-lg bg-muted/30 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span>{r.period_start} → {r.period_end}</span>
                    </div>
                    <Badge variant="outline" className={cn(
                      'text-[10px]',
                      (r.calculated_roi || 0) >= 0
                        ? 'bg-green-500/10 text-green-600'
                        : 'bg-destructive/10 text-destructive'
                    )}>
                      ROI: {r.calculated_roi?.toFixed(1) || 'N/A'}%
                    </Badge>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
