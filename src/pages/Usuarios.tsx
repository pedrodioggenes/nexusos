import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useUsers, useUpdateUserRole } from '@/hooks/useUsers';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { Database } from '@/integrations/supabase/types';
import { Shield, User as UserIcon } from 'lucide-react';

type AppRole = Database['public']['Enums']['app_role'];

const roleLabels: Record<AppRole, string> = {
  admin: 'Administrador',
  operador: 'Operador',
  leitura: 'Apenas Leitura',
};

const roleColors: Record<AppRole, string> = {
  admin: 'bg-primary text-primary-foreground',
  operador: 'bg-blue-500 text-white',
  leitura: 'bg-muted text-muted-foreground',
};

export default function Usuarios() {
  const { data: users, isLoading } = useUsers();
  const updateUserRole = useUpdateUserRole();
  const { user: currentUser } = useAuth();
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, newRole: AppRole) => {
    setUpdatingUserId(userId);
    await updateUserRole.mutateAsync({ userId, role: newRole });
    setUpdatingUserId(null);
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader 
        title="Usuários" 
        description="Gerencie usuários e suas permissões no sistema"
      />

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>Membro desde</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map(user => {
              const isCurrentUser = user.user_id === currentUser?.id;
              
              return (
                <TableRow key={user.id} className={isCurrentUser ? 'bg-primary/5' : ''}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        {user.role === 'admin' ? (
                          <Shield className="h-5 w-5 text-primary" />
                        ) : (
                          <UserIcon className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {user.profiles?.full_name || 'Sem nome'}
                          {isCurrentUser && (
                            <Badge variant="outline" className="ml-2 text-xs">Você</Badge>
                          )}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.profiles?.email || 'N/A'}</TableCell>
                  <TableCell>
                    <Select 
                      value={user.role} 
                      onValueChange={(v: AppRole) => handleRoleChange(user.user_id, v)}
                      disabled={isCurrentUser || updatingUserId === user.user_id}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue>
                          <Badge className={roleColors[user.role]}>
                            {roleLabels[user.role]}
                          </Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">
                          <div className="flex items-center gap-2">
                            <Badge className={roleColors.admin}>Administrador</Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value="operador">
                          <div className="flex items-center gap-2">
                            <Badge className={roleColors.operador}>Operador</Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value="leitura">
                          <div className="flex items-center gap-2">
                            <Badge className={roleColors.leitura}>Apenas Leitura</Badge>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {isCurrentUser && (
                      <p className="text-xs text-muted-foreground mt-1">Você não pode alterar seu próprio perfil</p>
                    )}
                  </TableCell>
                  <TableCell>{format(new Date(user.created_at), 'dd/MM/yyyy')}</TableCell>
                </TableRow>
              );
            })}
            {isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="text-center">Carregando...</TableCell>
              </TableRow>
            )}
            {!isLoading && (!users || users.length === 0) && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Nenhum usuário encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="bg-muted/50 rounded-lg p-4">
        <h3 className="font-semibold mb-2">Sobre os Perfis</h3>
        <div className="grid gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Badge className={roleColors.admin}>Administrador</Badge>
            <span className="text-muted-foreground">Acesso total ao sistema, incluindo gestão de usuários</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={roleColors.operador}>Operador</Badge>
            <span className="text-muted-foreground">Gerencia campanhas, contatos e relatórios</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={roleColors.leitura}>Apenas Leitura</Badge>
            <span className="text-muted-foreground">Visualiza dashboard e relatórios apenas</span>
          </div>
        </div>
      </div>
    </div>
  );
}
