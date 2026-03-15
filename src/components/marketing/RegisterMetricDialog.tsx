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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  useMetricsCatalog,
  useCreateMetricRecord,
  getUnitLabel,
  getUnitPlaceholder,
  type MetricCatalogEntry,
} from '@/hooks/useMetricsCatalog';
import {
  BarChart3,
  Save,
  AlertTriangle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RegisterMetricDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RegisterMetricDialog({ open, onOpenChange }: RegisterMetricDialogProps) {
  const { toast } = useToast();
  const { data: catalog = [] } = useMetricsCatalog();
  const createRecord = useCreateMetricRecord();

  const activeMetrics = catalog.filter(m => m.is_active);

  const [selectedMetric, setSelectedMetric] = useState<MetricCatalogEntry | null>(null);
  const [value, setValue] = useState('');
  const [periodStart, setPeriodStart] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [periodEnd, setPeriodEnd] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
  );
  const [channel, setChannel] = useState('');
  const [unitId, setUnitId] = useState('');
  const [saving, setSaving] = useState(false);

  // Validation
  const numValue = parseFloat(value);
  const isValidValue = !isNaN(numValue);
  const isOutlier = selectedMetric && isValidValue && (
    (selectedMetric.unit === 'percent' && (numValue < -100 || numValue > 10000)) ||
    (selectedMetric.unit === 'currency' && numValue < 0) ||
    (selectedMetric.unit === 'count' && numValue < 0)
  );

  const handleSave = async () => {
    if (!selectedMetric || !isValidValue) return;

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const { data: userRole } = await supabase
        .from('user_roles')
        .select('tenant_id')
        .eq('user_id', user.id)
        .single();

      if (!userRole?.tenant_id) throw new Error('Tenant não encontrado');

      await createRecord.mutateAsync({
        tenant_id: userRole.tenant_id,
        catalog_id: selectedMetric.id,
        value: numValue,
        period_start: periodStart,
        period_end: periodEnd,
        channel: channel || undefined,
        unit_id: unitId || undefined,
        quality_flag: isOutlier ? 'outlier' : 'ok',
        created_by: user.id,
      });

      toast({ title: 'KPI registrado', description: `${selectedMetric.display_name_pt}: ${value}` });
      onOpenChange(false);
      resetForm();
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setSelectedMetric(null);
    setValue('');
    setChannel('');
    setUnitId('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-app-gestao" />
            Registrar KPI
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Metric selection */}
          <div className="space-y-2">
            <Label>Métrica</Label>
            <Select
              value={selectedMetric?.id || ''}
              onValueChange={(id) => {
                const m = activeMetrics.find(m => m.id === id);
                setSelectedMetric(m || null);
                setValue('');
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a métrica..." />
              </SelectTrigger>
              <SelectContent>
                {activeMetrics.map(m => (
                  <SelectItem key={m.id} value={m.id}>
                    <span className="flex items-center gap-2">
                      {m.display_name_pt}
                      <Badge variant="outline" className="text-[9px]">{getUnitLabel(m.unit)}</Badge>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Metric info */}
          {selectedMetric && (
            <div className="p-3 rounded-lg bg-muted/50 space-y-1">
              <p className="text-xs text-muted-foreground">{selectedMetric.description}</p>
              {selectedMetric.formula_hint && (
                <p className="text-[10px] text-muted-foreground/70 flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Fórmula: {selectedMetric.formula_hint}
                </p>
              )}
            </div>
          )}

          {/* Value */}
          <div className="space-y-2">
            <Label>Valor ({selectedMetric ? getUnitLabel(selectedMetric.unit) : ''})</Label>
            <Input
              type="number"
              placeholder={selectedMetric ? getUnitPlaceholder(selectedMetric.unit) : '0'}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={!selectedMetric}
            />
            {isOutlier && (
              <p className="text-xs text-yellow-600 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Valor fora do padrão — será marcado como outlier
              </p>
            )}
          </div>

          <Separator />

          {/* Period */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Início do Período</Label>
              <Input
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Fim do Período</Label>
              <Input
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
              />
            </div>
          </div>

          {/* Optional dimensions */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Dimensões (opcional)</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[10px]">Canal</Label>
                <Select value={channel} onValueChange={setChannel}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_channels">Todos</SelectItem>
                    <SelectItem value="Digital">Digital</SelectItem>
                    <SelectItem value="Trade Marketing">Trade Marketing</SelectItem>
                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                    <SelectItem value="PDV">PDV</SelectItem>
                    <SelectItem value="Mídia Offline">Mídia Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Submit */}
          <Button
            className="w-full"
            onClick={handleSave}
            disabled={!selectedMetric || !isValidValue || saving}
          >
            {saving ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Registrar KPI
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
