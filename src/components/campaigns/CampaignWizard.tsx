import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Users, Upload, X, Image, Loader2 } from 'lucide-react';
import { useCreateCampaign, useCalculateAudience, CreateCampaignData } from '@/hooks/useCampaigns';
import { useUnits } from '@/hooks/useUnits';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type MessageType = Database['public']['Enums']['message_type'];
type UnitScope = Database['public']['Enums']['unit_scope'];

interface CampaignWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCampaignCreated?: (campaignId: string) => void;
}

interface FormData {
  title: string;
  message_type: MessageType;
  unit_scope: UnitScope;
  selected_units: string[];
  content_text: string;
  media_url: string;
  scheduled_at: string;
}

const initialFormData: FormData = {
  title: '',
  message_type: 'marketing',
  unit_scope: 'all_units',
  selected_units: [],
  content_text: '',
  media_url: '',
  scheduled_at: '',
};

export function CampaignWizard({ open, onOpenChange, onCampaignCreated }: CampaignWizardProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [audiencePreview, setAudiencePreview] = useState<{ total: number } | null>(null);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  const { data: units } = useUnits();
  const createCampaign = useCreateCampaign();
  const calculateAudience = useCalculateAudience();

  const resetWizard = () => {
    setStep(1);
    setFormData(initialFormData);
    setAudiencePreview(null);
    setIsUploadingMedia(false);
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) resetWizard();
    onOpenChange(isOpen);
  };

  const handleUnitToggle = (unitId: string) => {
    setFormData(prev => ({
      ...prev,
      selected_units: prev.selected_units.includes(unitId)
        ? prev.selected_units.filter(id => id !== unitId)
        : [...prev.selected_units, unitId],
    }));
  };

  const handleCalculateAudience = async () => {
    const result = await calculateAudience.mutateAsync({
      unitScope: formData.unit_scope,
      unitIds: formData.selected_units,
    });
    setAudiencePreview(result);
  };

  const handleCreate = async (sendImmediately: boolean = false) => {
    if (!formData.title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }
    if (!formData.content_text.trim()) {
      toast.error('Conteúdo é obrigatório');
      return;
    }

    try {
      const campaign = await createCampaign.mutateAsync({
        title: formData.title,
        message_type: formData.message_type,
        unit_scope: formData.unit_scope,
        content_text: formData.content_text,
        media_url: formData.media_url || undefined,
        scheduled_at: formData.scheduled_at || undefined,
        unit_ids: formData.selected_units,
      });

      handleClose(false);
      
      if (sendImmediately && campaign) {
        onCampaignCreated?.(campaign.id);
      }
    } catch (error) {
      // Error already handled by hook
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return formData.title.trim().length > 0;
      case 2: return formData.unit_scope === 'all_units' || formData.selected_units.length > 0;
      case 3: return formData.content_text.trim().length > 0;
      default: return true;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Campanha - Etapa {step} de 4</DialogTitle>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-4">
          {[1, 2, 3, 4].map(s => (
            <div 
              key={s} 
              className={`h-2 flex-1 rounded-full transition-colors ${s <= step ? 'bg-primary' : 'bg-muted'}`} 
            />
          ))}
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Informações Básicas</h3>
            <div className="space-y-2">
              <Label>Título da Campanha *</Label>
              <Input 
                value={formData.title} 
                onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                placeholder="Ex: Promoção de Verão 2026"
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Mensagem</Label>
              <Select 
                value={formData.message_type} 
                onValueChange={(v: MessageType) => setFormData(p => ({ ...p, message_type: v }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="utility">Utilitária</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Step 2: Segmentation */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Segmentação</h3>
            <div className="space-y-2">
              <Label>Escopo de Unidades</Label>
              <Select 
                value={formData.unit_scope} 
                onValueChange={(v: UnitScope) => setFormData(p => ({ ...p, unit_scope: v, selected_units: [] }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_units">Todas as Unidades</SelectItem>
                  <SelectItem value="single_unit">Unidade Única</SelectItem>
                  <SelectItem value="selected_units">Unidades Selecionadas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(formData.unit_scope === 'single_unit' || formData.unit_scope === 'selected_units') && (
              <div className="space-y-2">
                <Label>Selecione {formData.unit_scope === 'single_unit' ? 'a unidade' : 'as unidades'}</Label>
                <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto p-2 border rounded-lg">
                  {units?.filter(u => u.is_active).map(unit => (
                    <div 
                      key={unit.id}
                      className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer border transition-colors ${
                        formData.selected_units.includes(unit.id) 
                          ? 'bg-primary/10 border-primary' 
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => {
                        if (formData.unit_scope === 'single_unit') {
                          setFormData(p => ({ ...p, selected_units: [unit.id] }));
                        } else {
                          handleUnitToggle(unit.id);
                        }
                      }}
                    >
                      <Checkbox checked={formData.selected_units.includes(unit.id)} />
                      <div>
                        <p className="font-medium">{unit.name}</p>
                        <p className="text-sm text-muted-foreground">{unit.city}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {formData.selected_units.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {formData.selected_units.length} unidade(s) selecionada(s)
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Content */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Conteúdo da Mensagem</h3>
            <div className="space-y-2">
              <Label>Texto da Mensagem *</Label>
              <Textarea 
                value={formData.content_text}
                onChange={e => setFormData(p => ({ ...p, content_text: e.target.value }))}
                placeholder="Digite o conteúdo da sua mensagem..."
                rows={6}
              />
              <p className="text-xs text-muted-foreground">{formData.content_text.length} caracteres</p>
            </div>
            <div className="space-y-2">
              <Label>Imagem / Mídia (opcional)</Label>
              {formData.media_url ? (
                <div className="relative rounded-lg border border-border overflow-hidden">
                  <img 
                    src={formData.media_url} 
                    alt="Mídia da campanha" 
                    className="w-full h-40 object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7"
                    onClick={() => setFormData(p => ({ ...p, media_url: '' }))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors">
                  {isUploadingMedia ? (
                    <>
                      <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                      <span className="text-sm text-muted-foreground">Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Image className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Clique para enviar uma imagem</span>
                      <span className="text-xs text-muted-foreground">JPEG, PNG, WebP até 5MB</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    disabled={isUploadingMedia}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      
                      if (file.size > 5 * 1024 * 1024) {
                        toast.error('Arquivo muito grande. Máximo: 5MB');
                        return;
                      }
                      
                      setIsUploadingMedia(true);
                      try {
                        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
                        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
                        
                        const { data, error } = await supabase.storage
                          .from('campaign-media')
                          .upload(fileName, file, { cacheControl: '3600', upsert: false });
                        
                        if (error) throw error;
                        
                        const { data: signedData } = await supabase.storage
                          .from('campaign-media')
                          .createSignedUrl(data.path, 3600);
                        
                        setFormData(p => ({ ...p, media_url: signedData?.signedUrl || data.path }));
                        toast.success('Imagem enviada!');
                      } catch (err) {
                        toast.error('Erro ao enviar imagem');
                        console.error(err);
                      } finally {
                        setIsUploadingMedia(false);
                        e.target.value = '';
                      }
                    }}
                  />
                </label>
              )}
            </div>

            {formData.content_text && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Prévia</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-3 rounded-lg whitespace-pre-wrap text-sm">
                    {formData.content_text}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Step 4: Schedule & Confirm */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Agendamento e Confirmação</h3>
            <div className="space-y-2">
              <Label>Agendamento (opcional)</Label>
              <Input 
                type="datetime-local"
                value={formData.scheduled_at}
                onChange={e => setFormData(p => ({ ...p, scheduled_at: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">Deixe em branco para disparo imediato</p>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Prévia do Público
                </CardTitle>
              </CardHeader>
              <CardContent>
                {audiencePreview ? (
                  <div>
                    <p className="text-2xl font-bold text-primary">{audiencePreview.total} contatos</p>
                    <p className="text-sm text-muted-foreground">receberão esta campanha</p>
                  </div>
                ) : (
                  <Button variant="outline" onClick={handleCalculateAudience} disabled={calculateAudience.isPending}>
                    {calculateAudience.isPending ? 'Calculando...' : 'Calcular Público'}
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Resumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Título:</span>
                  <span>{formData.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo:</span>
                  <span className="capitalize">{formData.message_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Escopo:</span>
                  <span>
                    {formData.unit_scope === 'all_units' ? 'Todas as Unidades' : `${formData.selected_units.length} unidade(s)`}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <DialogFooter className="flex justify-between">
          <div>
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(s => s - 1)}>
                <ChevronLeft className="h-4 w-4 mr-1" />Voltar
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {step < 4 ? (
              <Button onClick={() => setStep(s => s + 1)} disabled={!canProceed()}>
                Próximo<ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => handleCreate(false)}
                  disabled={createCampaign.isPending}
                >
                  Salvar Rascunho
                </Button>
                <Button 
                  onClick={() => handleCreate(true)}
                  disabled={createCampaign.isPending}
                >
                  {createCampaign.isPending ? 'Criando...' : 'Criar e Disparar'}
                </Button>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
