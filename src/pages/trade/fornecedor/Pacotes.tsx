import { Package, Calendar, CheckCircle, Clock, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

export default function FornecedorPacotes() {
  const navigate = useNavigate();

  const packages = [
    { 
      id: '1', 
      name: 'Campanha Verão 2026', 
      status: 'active',
      periodStart: '01/01/2026',
      periodEnd: '28/02/2026',
      totalItems: 15,
      completedItems: 12,
      pendingItems: 3
    },
    { 
      id: '2', 
      name: 'Ativação de Marca', 
      status: 'active',
      periodStart: '15/01/2026',
      periodEnd: '15/03/2026',
      totalItems: 8,
      completedItems: 3,
      pendingItems: 5
    },
    { 
      id: '3', 
      name: 'Páscoa 2026', 
      status: 'upcoming',
      periodStart: '01/03/2026',
      periodEnd: '20/04/2026',
      totalItems: 12,
      completedItems: 0,
      pendingItems: 12
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader 
        title="Meus Pacotes" 
        description="Pacotes de trade marketing atribuídos"
      />

      <div className="space-y-3">
        {packages.map((pkg) => (
          <Card 
            key={pkg.id} 
            className="card-base hover:border-success/30 transition-colors cursor-pointer"
            onClick={() => navigate('/trade/fornecedor/checklist')}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                    <Package className="h-5 w-5 text-success" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium text-foreground truncate">{pkg.name}</h3>
                      <Badge 
                        variant="outline" 
                        className={`text-[9px] shrink-0 ${
                          pkg.status === 'active' ? 'border-success/30 text-success' :
                          'border-muted text-muted-foreground'
                        }`}
                      >
                        {pkg.status === 'active' ? 'Ativo' : 'Em breve'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {pkg.periodStart} - {pkg.periodEnd}
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[10px] mb-1">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-medium text-foreground">
                          {pkg.completedItems}/{pkg.totalItems}
                        </span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-success rounded-full transition-all" 
                          style={{ width: `${(pkg.completedItems / pkg.totalItems) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <CheckCircle className="h-3 w-3 text-success" />
                      {pkg.completedItems} aprovados
                    </div>
                    {pkg.pendingItems > 0 && (
                      <div className="flex items-center gap-1 text-[10px] text-warning mt-0.5">
                        <Clock className="h-3 w-3" />
                        {pkg.pendingItems} pendentes
                      </div>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
