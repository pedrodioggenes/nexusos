import { FileText, Plus, Search, Filter, Calendar, Building2, DollarSign, CheckCircle, Clock } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { StatCard } from '@/components/ui/stat-card';

interface Contract {
  id: string;
  name: string;
  supplier: string;
  supplierId: string;
  type: 'anual' | 'trimestral' | 'mensal' | 'campanha';
  status: 'active' | 'pending' | 'expired' | 'draft';
  totalValue: number;
  startDate: string;
  endDate: string;
  createdAt: string;
}

const mockContracts: Contract[] = [
  { id: '1', name: 'Contrato Anual 2026', supplier: 'Nestlé', supplierId: 'nestle-001', type: 'anual', status: 'active', totalValue: 500000, startDate: '2026-01-01', endDate: '2026-12-31', createdAt: '2025-12-15' },
  { id: '2', name: 'Campanha Verão', supplier: 'Coca-Cola', supplierId: 'coca-001', type: 'campanha', status: 'active', totalValue: 150000, startDate: '2026-01-15', endDate: '2026-03-31', createdAt: '2026-01-10' },
  { id: '3', name: 'Contrato Trimestral Q1', supplier: 'P&G', supplierId: 'pg-001', type: 'trimestral', status: 'pending', totalValue: 200000, startDate: '2026-01-01', endDate: '2026-03-31', createdAt: '2025-12-20' },
  { id: '4', name: 'Contrato 2025', supplier: 'Unilever', supplierId: 'unilever-001', type: 'anual', status: 'expired', totalValue: 350000, startDate: '2025-01-01', endDate: '2025-12-31', createdAt: '2024-12-15' },
  { id: '5', name: 'Contrato Mensal Jan', supplier: 'Ambev', supplierId: 'ambev-001', type: 'mensal', status: 'active', totalValue: 80000, startDate: '2026-01-01', endDate: '2026-01-31', createdAt: '2025-12-28' },
];

const getStatusConfig = (status: Contract['status']) => {
  switch (status) {
    case 'active':
      return { label: 'Ativo', color: 'border-success/30 text-success bg-success/10' };
    case 'pending':
      return { label: 'Pendente', color: 'border-warning/30 text-warning bg-warning/10' };
    case 'expired':
      return { label: 'Expirado', color: 'border-muted text-muted-foreground bg-muted' };
    case 'draft':
      return { label: 'Rascunho', color: 'border-border text-muted-foreground bg-muted' };
    default:
      return { label: status, color: 'border-border text-muted-foreground bg-muted' };
  }
};

const getTypeLabel = (type: Contract['type']) => {
  switch (type) {
    case 'anual':
      return 'Anual';
    case 'trimestral':
      return 'Trimestral';
    case 'mensal':
      return 'Mensal';
    case 'campanha':
      return 'Campanha';
    default:
      return type;
  }
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export default function ContratosTrade() {
  const [search, setSearch] = useState('');

  const filteredContracts = mockContracts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.supplier.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: mockContracts.length,
    active: mockContracts.filter(c => c.status === 'active').length,
    pending: mockContracts.filter(c => c.status === 'pending').length,
    totalValue: mockContracts.filter(c => c.status === 'active').reduce((sum, c) => sum + c.totalValue, 0),
  };

  return (
    <div className="space-y-4">
      <PageHeader 
        title="Contratos" 
        description="Gestão de contratos com fornecedores"
        actions={
          <Button size="sm" className="h-8 text-xs gap-1.5 bg-module-trade hover:bg-module-trade/90">
            <Plus className="h-3.5 w-3.5" />
            Novo Contrato
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          title="Total"
          value={stats.total}
          icon={<FileText className="h-4 w-4" />}
          variant="accent"
        />
        <StatCard
          title="Ativos"
          value={stats.active}
          icon={<CheckCircle className="h-4 w-4" />}
          variant="success"
        />
        <StatCard
          title="Pendentes"
          value={stats.pending}
          icon={<Clock className="h-4 w-4" />}
        />
        <StatCard
          title="Valor Ativo"
          value={formatCurrency(stats.totalValue)}
          icon={<DollarSign className="h-4 w-4" />}
          variant="accent"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input 
            placeholder="Buscar contratos..." 
            className="h-8 pl-8 text-xs"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
          <Filter className="h-3.5 w-3.5" />
          Filtros
        </Button>
      </div>

      {/* Contracts List */}
      <div className="space-y-2">
        {filteredContracts.map((contract) => {
          const statusConfig = getStatusConfig(contract.status);

          return (
            <Card key={contract.id} className="card-base hover:border-module-trade/30 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-module-trade/20 to-module-trade/10 flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-module-trade" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-medium text-foreground truncate">{contract.name}</h3>
                        <Badge variant="outline" className={`text-[9px] shrink-0 ${statusConfig.color}`}>
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {contract.supplier}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(contract.startDate).toLocaleDateString('pt-BR')} - {new Date(contract.endDate).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-module-trade">{formatCurrency(contract.totalValue)}</p>
                    <Badge variant="outline" className="text-[9px] mt-1">{getTypeLabel(contract.type)}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredContracts.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum contrato encontrado</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
