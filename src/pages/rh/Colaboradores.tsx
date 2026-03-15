import { useState } from 'react';
import { Plus, Search, MoreVertical, Trash2, Edit2 } from 'lucide-react';
import { PageWrapper } from '@/components/marketing/PageWrapper';
import { BlurFade } from '@/components/ui/blur-fade';
import { PremiumGlassCard } from '@/components/dashboard/PremiumGlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useEmployees, useDeleteEmployee } from '@/hooks/useEmployees';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Colaboradores() {
  const { tenant } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const { data: employees = [], isLoading } = useEmployees(tenant?.id);
  const { mutate: deleteEmployee } = useDeleteEmployee();

  const filteredEmployees = employees.filter(emp =>
    emp.full_name.toLowerCase().includes(search.toLowerCase()) ||
    emp.position?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja deletar este colaborador?')) {
      deleteEmployee(
        { id, tenantId: tenant?.id || '' },
        {
          onSuccess: () => toast.success('Colaborador removido'),
          onError: () => toast.error('Erro ao remover colaborador'),
        }
      );
    }
  };

  return (
    <PageWrapper
      title="Colaboradores"
      subtitle="Gestão de funcionários"
      actions={
        <Button 
          onClick={() => navigate('/app/rh/colaboradores/novo')}
          className="bg-gradient-to-r from-blue-500 to-blue-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Colaborador
        </Button>
      }
    >
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou cargo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filteredEmployees.length === 0 ? (
        <PremiumGlassCard className="p-12 text-center">
          <p className="text-muted-foreground mb-4">Nenhum colaborador encontrado</p>
          <Button 
            onClick={() => navigate('/app/rh/colaboradores/novo')}
          >
            Adicionar Primeiro Colaborador
          </Button>
        </PremiumGlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((employee, idx) => (
            <BlurFade key={employee.id} delay={0.05 * idx}>
              <PremiumGlassCard 
                className="p-6 cursor-pointer hover:border-blue-400 transition-colors group"
                onClick={() => navigate(`/app/rh/colaboradores/${employee.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{employee.full_name}</h3>
                    <p className="text-sm text-muted-foreground">{employee.position}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/app/rh/colaboradores/${employee.id}/editar`);
                        }}
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(employee.id);
                        }}
                        className="text-red-500"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Deletar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Departamento:</span>
                    <span className="font-medium">{employee.department || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      employee.status === 'active' 
                        ? 'bg-green-500/20 text-green-600' 
                        : 'bg-yellow-500/20 text-yellow-600'
                    }`}>
                      {employee.status === 'active' ? 'Ativo' : 'Afastado'}
                    </span>
                  </div>
                </div>
              </PremiumGlassCard>
            </BlurFade>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
