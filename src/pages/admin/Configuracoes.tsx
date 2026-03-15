import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Bell, MessageSquare, Shield, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function Configuracoes() {
  const [settings, setSettings] = useState({
    companyName: '',
    notifyOnCampaign: true,
    notifyOnOptOut: true,
    dailyDigest: false,
    messageFooter: '',
    rateLimit: '100',
    requireApproval: false,
  });

  const handleSave = () => {
    toast.success('Configurações salvas');
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Configurações" description="Configure parâmetros gerais do sistema" />

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general"><Settings className="h-4 w-4 mr-2" />Geral</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="h-4 w-4 mr-2" />Notificações</TabsTrigger>
          <TabsTrigger value="messages"><MessageSquare className="h-4 w-4 mr-2" />Mensagens</TabsTrigger>
          <TabsTrigger value="security"><Shield className="h-4 w-4 mr-2" />Segurança</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configurações Gerais</CardTitle>
              <CardDescription>Informações básicas do workspace</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nome da Empresa</Label>
                <Input value={settings.companyName} onChange={e => setSettings(p => ({ ...p, companyName: e.target.value }))} />
              </div>
              <Button onClick={handleSave}><Save className="h-4 w-4 mr-2" />Salvar</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notificações</CardTitle>
              <CardDescription>Configure quando receber notificações</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Campanhas Enviadas</p>
                  <p className="text-xs text-muted-foreground">Notificar quando uma campanha for enviada</p>
                </div>
                <Switch checked={settings.notifyOnCampaign} onCheckedChange={v => setSettings(p => ({ ...p, notifyOnCampaign: v }))} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Opt-outs</p>
                  <p className="text-xs text-muted-foreground">Notificar quando um contato fizer opt-out</p>
                </div>
                <Switch checked={settings.notifyOnOptOut} onCheckedChange={v => setSettings(p => ({ ...p, notifyOnOptOut: v }))} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Resumo Diário</p>
                  <p className="text-xs text-muted-foreground">Receber resumo diário por email</p>
                </div>
                <Switch checked={settings.dailyDigest} onCheckedChange={v => setSettings(p => ({ ...p, dailyDigest: v }))} />
              </div>
              <Button onClick={handleSave}><Save className="h-4 w-4 mr-2" />Salvar</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configurações de Mensagens</CardTitle>
              <CardDescription>Personalize suas mensagens</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Rodapé Padrão</Label>
                <Input value={settings.messageFooter} onChange={e => setSettings(p => ({ ...p, messageFooter: e.target.value }))} />
                <p className="text-xs text-muted-foreground">Adicionado ao final de todas as mensagens</p>
              </div>
              <div className="space-y-2">
                <Label>Limite de Envio/Minuto</Label>
                <Input type="number" value={settings.rateLimit} onChange={e => setSettings(p => ({ ...p, rateLimit: e.target.value }))} />
              </div>
              <Button onClick={handleSave}><Save className="h-4 w-4 mr-2" />Salvar</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Segurança</CardTitle>
              <CardDescription>Configurações de segurança e aprovação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Aprovação de Campanhas</p>
                  <p className="text-xs text-muted-foreground">Exigir aprovação de admin para enviar campanhas</p>
                </div>
                <Switch checked={settings.requireApproval} onCheckedChange={v => setSettings(p => ({ ...p, requireApproval: v }))} />
              </div>
              <Button onClick={handleSave}><Save className="h-4 w-4 mr-2" />Salvar</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
