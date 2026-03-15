import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Copy, Pencil, Trash2, FileText, Image, Video, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { WhatsAppPreview } from '@/components/whatsapp/WhatsAppPreview';

interface Template {
  id: string;
  name: string;
  category: 'marketing' | 'utility' | 'transactional';
  content: string;
  mediaType: 'none' | 'image' | 'video';
  mediaUrl?: string;
  variables: string[];
  createdAt: Date;
  usageCount: number;
}

// Mock data
const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'Boas-vindas Cliente',
    category: 'utility',
    content: 'Olá {{nome}}! 👋 Seja bem-vindo(a)! Estamos felizes em ter você conosco. Aproveite nossas ofertas exclusivas.',
    mediaType: 'none',
    variables: ['nome'],
    createdAt: new Date('2026-01-10'),
    usageCount: 45,
  },
  {
    id: '2',
    name: 'Promoção Semanal',
    category: 'marketing',
    content: '🔥 OFERTA ESPECIAL! {{produto}} com {{desconto}}% OFF! Válido até {{data}}. Aproveite! 🛒',
    mediaType: 'image',
    mediaUrl: 'https://placehold.co/600x400',
    variables: ['produto', 'desconto', 'data'],
    createdAt: new Date('2026-01-05'),
    usageCount: 128,
  },
  {
    id: '3',
    name: 'Lembrete de Compra',
    category: 'utility',
    content: 'Ei {{nome}}, sentimos sua falta! 🛍️ Volte e confira as novidades. Temos {{quantidade}} produtos novos esperando por você!',
    mediaType: 'none',
    variables: ['nome', 'quantidade'],
    createdAt: new Date('2026-01-01'),
    usageCount: 67,
  },
];

const categoryColors = {
  marketing: 'bg-accent/20 text-accent',
  utility: 'bg-blue-500/20 text-blue-500',
  transactional: 'bg-success/20 text-success',
};

const categoryLabels = {
  marketing: 'Marketing',
  utility: 'Utilitária',
  transactional: 'Transacional',
};

// Sample values for preview
const sampleVariables: Record<string, string> = {
  nome: 'Maria',
  produto: 'Café Premium',
  desconto: '30',
  data: '25/01',
  quantidade: '15',
};

export default function Templates() {
  const [templates, setTemplates] = useState<Template[]>(mockTemplates);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'marketing' as Template['category'],
    content: '',
    mediaType: 'none' as Template['mediaType'],
    mediaUrl: '',
  });

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
                          t.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const extractVariables = (content: string): string[] => {
    const regex = /\{\{(\w+)\}\}/g;
    const matches = content.matchAll(regex);
    return [...new Set([...matches].map(m => m[1]))];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.content.trim()) {
      toast.error('Nome e conteúdo são obrigatórios');
      return;
    }

    const variables = extractVariables(formData.content);
    
    if (editingTemplate) {
      setTemplates(prev => prev.map(t => 
        t.id === editingTemplate.id 
          ? { ...t, ...formData, variables, mediaUrl: formData.mediaType !== 'none' ? formData.mediaUrl : undefined }
          : t
      ));
      toast.success('Template atualizado');
    } else {
      const newTemplate: Template = {
        id: crypto.randomUUID(),
        ...formData,
        variables,
        mediaUrl: formData.mediaType !== 'none' ? formData.mediaUrl : undefined,
        createdAt: new Date(),
        usageCount: 0,
      };
      setTemplates(prev => [newTemplate, ...prev]);
      toast.success('Template criado');
    }

    resetForm();
    setIsCreateOpen(false);
  };

  const handleDelete = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    toast.success('Template excluído');
  };

  const handleCopy = (template: Template) => {
    navigator.clipboard.writeText(template.content);
    toast.success('Conteúdo copiado');
  };

  const openEdit = (template: Template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      category: template.category,
      content: template.content,
      mediaType: template.mediaType,
      mediaUrl: template.mediaUrl || '',
    });
    setIsCreateOpen(true);
  };

  const resetForm = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      category: 'marketing',
      content: '',
      mediaType: 'none',
      mediaUrl: '',
    });
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Templates"
        description="Gerencie templates de mensagens reutilizáveis"
        actions={
          <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-2" />Novo Template</Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>{editingTemplate ? 'Editar Template' : 'Novo Template'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Form Section */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Nome do Template</Label>
                      <Input 
                        value={formData.name} 
                        onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                        placeholder="Ex: Boas-vindas Cliente"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <Select value={formData.category} onValueChange={(v: Template['category']) => setFormData(p => ({ ...p, category: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="utility">Utilitária</SelectItem>
                          <SelectItem value="transactional">Transacional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Conteúdo</Label>
                      <Textarea 
                        value={formData.content}
                        onChange={e => setFormData(p => ({ ...p, content: e.target.value }))}
                        placeholder="Use {{variavel}} para campos dinâmicos"
                        rows={5}
                      />
                      <p className="text-xs text-muted-foreground">
                        Variáveis detectadas: {extractVariables(formData.content).join(', ') || 'Nenhuma'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo de Mídia</Label>
                      <Select value={formData.mediaType} onValueChange={(v: Template['mediaType']) => setFormData(p => ({ ...p, mediaType: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Sem mídia</SelectItem>
                          <SelectItem value="image">Imagem</SelectItem>
                          <SelectItem value="video">Vídeo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {formData.mediaType !== 'none' && (
                      <div className="space-y-2">
                        <Label>URL da Mídia</Label>
                        <Input 
                          value={formData.mediaUrl}
                          onChange={e => setFormData(p => ({ ...p, mediaUrl: e.target.value }))}
                          placeholder="https://..."
                        />
                      </div>
                    )}
                  </div>

                  {/* Preview Section */}
                  <div className="flex flex-col items-center justify-center bg-muted/30 rounded-xl p-4">
                    <WhatsAppPreview 
                      content={formData.content}
                      mediaType={formData.mediaType}
                      mediaUrl={formData.mediaUrl}
                      variables={sampleVariables}
                    />
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <Button type="submit">{editingTemplate ? 'Salvar' : 'Criar Template'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar templates..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Categoria" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
            <SelectItem value="utility">Utilitária</SelectItem>
            <SelectItem value="transactional">Transacional</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map(template => (
          <Card key={template.id} className="group hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {template.mediaType === 'image' && <Image className="h-4 w-4 text-muted-foreground" />}
                  {template.mediaType === 'video' && <Video className="h-4 w-4 text-muted-foreground" />}
                  {template.mediaType === 'none' && <FileText className="h-4 w-4 text-muted-foreground" />}
                  <CardTitle className="text-sm">{template.name}</CardTitle>
                </div>
                <Badge className={categoryColors[template.category]}>
                  {categoryLabels[template.category]}
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Usado {template.usageCount} vezes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-muted/50 rounded-lg p-3 text-sm whitespace-pre-wrap line-clamp-4">
                {template.content}
              </div>
              {template.variables.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {template.variables.map(v => (
                    <Badge key={v} variant="outline" className="text-xs">
                      {`{{${v}}}`}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm" onClick={() => setPreviewTemplate(template)}>
                  <Smartphone className="h-3.5 w-3.5 mr-1" />Prévia
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleCopy(template)}>
                  <Copy className="h-3.5 w-3.5 mr-1" />Copiar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => openEdit(template)}>
                  <Pencil className="h-3.5 w-3.5 mr-1" />Editar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(template.id)} className="text-destructive hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum template encontrado</p>
            <Button variant="link" onClick={() => setIsCreateOpen(true)}>Criar primeiro template</Button>
          </CardContent>
        </Card>
      )}

      {/* WhatsApp Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-md bg-muted/50 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-center">Prévia WhatsApp</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center py-4">
            {previewTemplate && (
              <WhatsAppPreview 
                content={previewTemplate.content}
                mediaType={previewTemplate.mediaType}
                mediaUrl={previewTemplate.mediaUrl}
                variables={sampleVariables}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
