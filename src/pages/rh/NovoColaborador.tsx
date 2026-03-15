import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateEmployee } from '@/hooks/useEmployees';
import { PageWrapper } from '@/components/marketing/PageWrapper';
import { PremiumGlassCard } from '@/components/dashboard/PremiumGlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function NovoColaborador() {
  const navigate = useNavigate();
  const { tenant } = useAuth();
  const createEmployee = useCreateEmployee();

  const [form, setForm] = useState({
    full_name: '',
    position: '',
    department: '',
    hire_date: new Date().toISOString().split('T')[0],
    contact_email: '',
    contact_phone: '',
    cpf: '',
  });

  const setField = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant?.id) return;
    if (!form.full_name.trim()) {
      toast.error('Nome completo é obrigatório');
      return;
    }
    if (!form.hire_date) {
      toast.error('Data de admissão é obrigatória');
      return;
    }

    const employee = await createEmployee.mutateAsync({
      tenant_id: tenant.id,
      full_name: form.full_name.trim(),
      position: form.position.trim() || null,
      department: form.department.trim() || null,
      hire_date: form.hire_date,
      contact_email: form.contact_email.trim() || null,
      contact_phone: form.contact_phone.trim() || null,
      cpf: form.cpf.trim() || null,
      status: 'active',
    });

    toast.success('Colaborador cadastrado com sucesso!');
    navigate(`/app/rh/colaboradores/${employee.id}`);
  };

  return (
    <PageWrapper
      title="Novo Colaborador"
      subtitle="Cadastre um novo colaborador"
      icon={<UserPlus className="w-6 h-6" />}
    >
      <PremiumGlassCard className="p-6 max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="full_name">Nome Completo *</Label>
            <Input
              id="full_name"
              value={form.full_name}
              onChange={(e) => setField('full_name', e.target.value)}
              placeholder="Ex: João da Silva"
              required
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="position">Cargo</Label>
              <Input
                id="position"
                value={form.position}
                onChange={(e) => setField('position', e.target.value)}
                placeholder="Ex: Analista"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="department">Departamento</Label>
              <Input
                id="department"
                value={form.department}
                onChange={(e) => setField('department', e.target.value)}
                placeholder="Ex: Comercial"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="hire_date">Data de Admissão *</Label>
            <Input
              id="hire_date"
              type="date"
              value={form.hire_date}
              onChange={(e) => setField('hire_date', e.target.value)}
              required
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contact_email">E-mail</Label>
              <Input
                id="contact_email"
                type="email"
                value={form.contact_email}
                onChange={(e) => setField('contact_email', e.target.value)}
                placeholder="email@empresa.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="contact_phone">Telefone</Label>
              <Input
                id="contact_phone"
                value={form.contact_phone}
                onChange={(e) => setField('contact_phone', e.target.value)}
                placeholder="(11) 99999-9999"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              value={form.cpf}
              onChange={(e) => setField('cpf', e.target.value)}
              placeholder="000.000.000-00"
              className="mt-1"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/app/rh/colaboradores')}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createEmployee.isPending}
              className="bg-gradient-to-r from-blue-500 to-blue-600"
            >
              {createEmployee.isPending ? 'Salvando...' : 'Cadastrar Colaborador'}
            </Button>
          </div>
        </form>
      </PremiumGlassCard>
    </PageWrapper>
  );
}
