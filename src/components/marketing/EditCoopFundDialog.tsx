import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CoopFund, useUpdateCoopFund } from '@/hooks/useCoopFunds';
import { Wallet, FileCheck, AlertTriangle } from 'lucide-react';

interface EditCoopFundDialogProps {
  fund: CoopFund | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
  }).format(value);
};

const statusOptions = [
  { value: 'active', label: 'Ativo' },
  { value: 'pending_proof', label: 'Aguardando Comprovação' },
  { value: 'completed', label: 'Concluído' },
  { value: 'expired', label: 'Expirado' },
];

export function EditCoopFundDialog({ fund, open, onOpenChange }: EditCoopFundDialogProps) {
  const updateFund = useUpdateCoopFund();
  
  const [formData, setFormData] = useState({
    negotiated_amount: '',
    executed_amount: '',
    proven_amount: '',
    status: 'active',
    notes: '',
    contract_reference: '',
  });

  useEffect(() => {
    if (fund) {
      setFormData({
        negotiated_amount: fund.negotiated_amount?.toString() || '0',
        executed_amount: fund.executed_amount?.toString() || '0',
        proven_amount: fund.proven_amount?.toString() || '0',
        status: fund.status || 'active',
        notes: fund.notes || '',
        contract_reference: fund.contract_reference || '',
      });
    }
  }, [fund, open]);

  if (!fund) return null;

  const negotiated = parseFloat(formData.negotiated_amount) || 0;
  const executed = parseFloat(formData.executed_amount) || 0;
  const proven = parseFloat(formData.proven_amount) || 0;
  
  const utilizationRate = negotiated > 0 ? (executed / negotiated) * 100 : 0;
  const proofRate = executed > 0 ? (proven / executed) * 100 : 0;
  const pendingProof = executed - proven;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await updateFund.mutateAsync({
      id: fund.id,
      negotiated_amount: negotiated,
      executed_amount: executed,
      proven_amount: proven,
      status: formData.status as CoopFund['status'],
      notes: formData.notes || null,
      contract_reference: formData.contract_reference || null,
      utilization_rate: utilizationRate,
      pending_proof_amount: pendingProof > 0 ? pendingProof : 0,
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Editar Verba Cooperada
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Supplier Info */}
          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{fund.supplier?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {fund.quarter ? `Q${fund.quarter}` : 'Anual'} {fund.year}
                  </p>
                </div>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Amounts */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="negotiated_amount">Negociado</Label>
              <Input
                id="negotiated_amount"
                type="number"
                step="0.01"
                value={formData.negotiated_amount}
                onChange={(e) => setFormData({ ...formData, negotiated_amount: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="executed_amount">Executado</Label>
              <Input
                id="executed_amount"
                type="number"
                step="0.01"
                value={formData.executed_amount}
                onChange={(e) => setFormData({ ...formData, executed_amount: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proven_amount">Comprovado</Label>
              <Input
                id="proven_amount"
                type="number"
                step="0.01"
                value={formData.proven_amount}
                onChange={(e) => setFormData({ ...formData, proven_amount: e.target.value })}
              />
            </div>
          </div>

          {/* Progress Indicators */}
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Taxa de Utilização</span>
                <span className="font-medium">{utilizationRate.toFixed(1)}%</span>
              </div>
              <Progress value={Math.min(utilizationRate, 100)} className="h-2" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <FileCheck className="h-3 w-3" />
                  Taxa de Comprovação
                </span>
                <span className="font-medium">{proofRate.toFixed(1)}%</span>
              </div>
              <Progress value={Math.min(proofRate, 100)} className="h-2" />
            </div>

            {pendingProof > 0 && (
              <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-500/10 px-3 py-2 rounded-lg">
                <AlertTriangle className="h-4 w-4" />
                <span>Pendente de comprovação: {formatCurrency(pendingProof)}</span>
              </div>
            )}
          </div>

          {/* Contract Reference */}
          <div className="space-y-2">
            <Label htmlFor="contract_reference">Referência do Contrato</Label>
            <Input
              id="contract_reference"
              value={formData.contract_reference}
              onChange={(e) => setFormData({ ...formData, contract_reference: e.target.value })}
              placeholder="Ex: CONTRATO-2025-001"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notas sobre a verba..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateFund.isPending}>
              {updateFund.isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
