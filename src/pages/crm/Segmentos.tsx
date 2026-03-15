import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Users, Filter, Pencil, Trash2, Copy, Tag } from 'lucide-react';
import { toast } from 'sonner';

interface SegmentRule {
  field: string;
  operator: string;
  value: string;
}

interface Segment {
  id: string;
  name: string;
  description: string;
  rules: SegmentRule[];
  contactCount: number;
  createdAt: Date;
  lastUsed?: Date;
}

const mockSegments: Segment[] = [
  {
    id: '1',
    name: 'Clientes VIP',
    description: 'Clientes com mais de 10 compras',
    rules: [{ field: 'purchases', operator: 'greater_than', value: '10' }],
    contactCount: 245,
    createdAt: new Date('2026-01-01'),
    lastUsed: new Date('2026-01-15'),
  },
  {
    id: '2',
    name: 'Belém e Região',
    description: 'Contatos da região de Belém',
    rules: [{ field: 'city', operator: 'equals', value: 'Belém' }],
    contactCount: 1890,
    createdAt: new Date('2025-12-15'),
    lastUsed: new Date('2026-01-10'),
  },
  {
    id: '3',
    name: 'Inativos 30 dias',
    description: 'Sem interação nos últimos 30 dias',
    rules: [{ field: 'last_interaction', operator: 'older_than', value: '30' }],
    contactCount: 567,
    createdAt: new Date('2025-11-20'),
  },
  {
    id: '4',
    name: 'Novos Cadastros',
    description: 'Cadastrados nos últimos 7 dias',
    rules: [{ field: 'created_at', operator: 'newer_than', value: '7' }],
    contactCount: 89,
    createdAt: new Date('2026-01-10'),
    lastUsed: new Date('2026-01-17'),
  },
];

const fieldOptions = [
  { value: 'city', label: 'Cidade' },
  { value: 'status', label: 'Status' },
  { value: 'created_at', label: 'Data de Cadastro' },
  { value: 'last_interaction', label: 'Última Interação' },
  { value: 'unit', label: 'Unidade' },
  { value: 'purchases', label: 'Número de Compras' },
];

const operatorOptions: Record<string, { value: string; label: string }[]> = {
  city: [{ value: 'equals', label: 'É igual a' }, { value: 'not_equals', label: 'Não é igual a' }],
  status: [{ value: 'equals', label: 'É igual a' }],
  created_at: [{ value: 'newer_than', label: 'Nos últimos X dias' }, { value: 'older_than', label: 'Há mais de X dias' }],
  last_interaction: [{ value: 'newer_than', label: 'Nos últimos X dias' }, { value: 'older_than', label: 'Há mais de X dias' }],
  unit: [{ value: 'equals', label: 'É igual a' }, { value: 'not_equals', label: 'Não é igual a' }],
  purchases: [{ value: 'greater_than', label: 'Maior que' }, { value: 'less_than', label: 'Menor que' }],
};

export default function Segmentos() {
  const [segments, setSegments] = useState<Segment[]>(mockSegments);
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSegment, setEditingSegment] = useState<Segment | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rules: [{ field: 'city', operator: 'equals', value: '' }] as SegmentRule[],
  });

  const filteredSegments = segments.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    if (editingSegment) {
      setSegments(prev => prev.map(s => 
        s.id === editingSegment.id 
          ? { ...s, ...formData }
          : s
      ));
      toast.success('Segmento atualizado');
    } else {
      const newSegment: Segment = {
        id: crypto.randomUUID(),
        ...formData,
        contactCount: Math.floor(Math.random() * 500) + 50, // Simulated
        createdAt: new Date(),
      };
      setSegments(prev => [newSegment, ...prev]);
      toast.success('Segmento criado');
    }

    resetForm();
    setIsCreateOpen(false);
  };

  const handleDelete = (id: string) => {
    setSegments(prev => prev.filter(s => s.id !== id));
    toast.success('Segmento excluído');
  };

  const handleDuplicate = (segment: Segment) => {
    const newSegment: Segment = {
      ...segment,
      id: crypto.randomUUID(),
      name: `${segment.name} (cópia)`,
      createdAt: new Date(),
      lastUsed: undefined,
    };
    setSegments(prev => [newSegment, ...prev]);
    toast.success('Segmento duplicado');
  };

  const openEdit = (segment: Segment) => {
    setEditingSegment(segment);
    setFormData({
      name: segment.name,
      description: segment.description,
      rules: segment.rules,
    });
    setIsCreateOpen(true);
  };

  const resetForm = () => {
    setEditingSegment(null);
    setFormData({
      name: '',
      description: '',
      rules: [{ field: 'city', operator: 'equals', value: '' }],
    });
  };

  const addRule = () => {
    setFormData(prev => ({
      ...prev,
      rules: [...prev.rules, { field: 'city', operator: 'equals', value: '' }],
    }));
  };

  const removeRule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index),
    }));
  };

  const updateRule = (index: number, updates: Partial<SegmentRule>) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.map((rule, i) => i === index ? { ...rule, ...updates } : rule),
    }));
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Segmentos"
        description="Crie segmentos de contatos para campanhas direcionadas"
        actions={
          <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-2" />Novo Segmento</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingSegment ? 'Editar Segmento' : 'Novo Segmento'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome do Segmento</Label>
                  <Input 
                    value={formData.name} 
                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                    placeholder="Ex: Clientes VIP"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Input 
                    value={formData.description}
                    onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                    placeholder="Breve descrição do segmento"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Regras</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addRule}>
                      <Plus className="h-3.5 w-3.5 mr-1" />Adicionar
                    </Button>
                  </div>
                  {formData.rules.map((rule, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <Select value={rule.field} onValueChange={v => updateRule(index, { field: v, operator: operatorOptions[v]?.[0]?.value || 'equals' })}>
                        <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {fieldOptions.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={rule.operator} onValueChange={v => updateRule(index, { operator: v })}>
                        <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {(operatorOptions[rule.field] || []).map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input 
                        value={rule.value}
                        onChange={e => updateRule(index, { value: e.target.value })}
                        placeholder="Valor"
                        className="flex-1"
                      />
                      {formData.rules.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeRule(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <DialogFooter>
                  <Button type="submit">{editingSegment ? 'Salvar' : 'Criar Segmento'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar segmentos..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      {/* Segments Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSegments.map(segment => (
          <Card key={segment.id} className="group hover:border-accent/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-accent" />
                  <CardTitle className="text-sm">{segment.name}</CardTitle>
                </div>
                <Badge variant="outline" className="font-normal">
                  <Users className="h-3 w-3 mr-1" />
                  {segment.contactCount}
                </Badge>
              </div>
              <CardDescription className="text-xs">{segment.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-1">
                {segment.rules.map((rule, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    <Filter className="h-2.5 w-2.5 mr-1" />
                    {fieldOptions.find(f => f.value === rule.field)?.label}: {rule.value}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm" onClick={() => handleDuplicate(segment)}>
                  <Copy className="h-3.5 w-3.5 mr-1" />Duplicar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => openEdit(segment)}>
                  <Pencil className="h-3.5 w-3.5 mr-1" />Editar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(segment.id)} className="text-destructive hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSegments.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Tag className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum segmento encontrado</p>
            <Button variant="link" onClick={() => setIsCreateOpen(true)}>Criar primeiro segmento</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
