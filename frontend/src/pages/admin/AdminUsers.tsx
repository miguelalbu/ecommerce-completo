// /src/pages/admin/AdminUsers.tsx

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, createAdminUser, deleteUser } from '@/services/apiService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, UserCircle, ShieldCheck, UserCog, BadgePercent } from 'lucide-react';

type AdminUser = {
  id: string;
  nome: string;
  email: string;
  funcao: string;
  criadoEm: string;
};

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin Global',
  ADMIN_GLOBAL: 'Admin Global',
  GERENTE: 'Gerente',
  VENDEDOR: 'Vendedor',
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-800 border-purple-200',
  ADMIN_GLOBAL: 'bg-purple-100 text-purple-800 border-purple-200',
  GERENTE: 'bg-blue-100 text-blue-800 border-blue-200',
  VENDEDOR: 'bg-green-100 text-green-800 border-green-200',
};

const ROLE_ICONS: Record<string, React.ReactNode> = {
  ADMIN: <ShieldCheck className="h-4 w-4" />,
  ADMIN_GLOBAL: <ShieldCheck className="h-4 w-4" />,
  GERENTE: <UserCog className="h-4 w-4" />,
  VENDEDOR: <BadgePercent className="h-4 w-4" />,
};

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('pt-BR');

const ROLE_DESCRIPTIONS: Record<string, string[]> = {
  ADMIN_GLOBAL: [
    'Acesso total ao sistema',
    'Criar e gerenciar administradores',
    'Dashboard e análises',
    'Produtos, pedidos, categorias, lojas, cupons',
  ],
  GERENTE: [
    'Registrar vendas',
    'Consultar / editar / apagar produtos',
    'Consultar / editar / apagar categorias',
    'Criar e deletar cupons',
    'Criar e editar lojas',
    'Ver lista de pedidos',
  ],
  VENDEDOR: [
    'Registrar vendas',
    'Ver / editar / apagar produtos',
    'Ver lista de pedidos',
  ],
};

const AdminUsers = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', funcao: 'VENDEDOR' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers(token!),
    enabled: !!token,
  });

  const admins: AdminUser[] = data?.admins ?? [];

  const createMutation = useMutation({
    mutationFn: (values: typeof form) => createAdminUser(values, token!),
    onSuccess: () => {
      toast({ title: 'Conta criada!', description: `${form.name} foi adicionado(a) com sucesso.` });
      setForm({ name: '', email: '', password: '', funcao: 'VENDEDOR' });
      setFormErrors({});
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err: Error) => {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUser(id, token!),
    onSuccess: () => {
      toast({ title: 'Usuário removido.' });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err: Error) => {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    },
    onSettled: () => setUserToDelete(null),
  });

  const validate = () => {
    const errors: Record<string, string> = {};
    if (form.name.trim().length < 3) errors.name = 'Mínimo 3 caracteres.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'E-mail inválido.';
    if (form.password.length < 6) errors.password = 'Mínimo 6 caracteres.';
    if (!['ADMIN_GLOBAL', 'GERENTE', 'VENDEDOR'].includes(form.funcao)) errors.funcao = 'Cargo inválido.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) createMutation.mutate(form);
  };

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Administradores</h1>

      <Tabs defaultValue="lista">
        <TabsList className="mb-6">
          <TabsTrigger value="lista">Lista de Administradores</TabsTrigger>
          <TabsTrigger value="criar">Criar Novo</TabsTrigger>
          <TabsTrigger value="cargos">Cargos e Permissões</TabsTrigger>
        </TabsList>

        {/* ── ABA: LISTA ── */}
        <TabsContent value="lista">
          <Card>
            <CardHeader>
              <CardTitle>Administradores Cadastrados ({admins.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0 md:p-6">
              {isLoading ? (
                <p className="p-6 text-muted-foreground">Carregando...</p>
              ) : admins.length === 0 ? (
                <p className="p-6 text-muted-foreground">Nenhum administrador encontrado.</p>
              ) : (
                <ul className="divide-y">
                  {admins.map((user) => (
                    <li key={user.id} className="flex items-center gap-3 p-4">
                      <div className="flex items-center justify-center w-9 h-9 rounded-full bg-muted flex-shrink-0">
                        <UserCircle className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{user.nome}</span>
                          <span
                            className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${ROLE_COLORS[user.funcao] ?? 'bg-gray-100 text-gray-700'}`}
                          >
                            {ROLE_ICONS[user.funcao]}
                            {ROLE_LABELS[user.funcao] ?? user.funcao}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Cadastro: {formatDate(user.criadoEm)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex-shrink-0"
                        onClick={() => setUserToDelete(user)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── ABA: CRIAR ── */}
        <TabsContent value="criar">
          <Card className="max-w-lg">
            <CardHeader>
              <CardTitle>Nova Conta de Administrador</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="João Silva"
                    className={formErrors.name ? 'border-red-500' : ''}
                  />
                  {formErrors.name && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="joao@exemplo.com"
                    className={formErrors.email ? 'border-red-500' : ''}
                  />
                  {formErrors.email && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Mínimo 6 caracteres"
                    className={formErrors.password ? 'border-red-500' : ''}
                  />
                  {formErrors.password && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.password}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="funcao">Cargo</Label>
                  <Select
                    value={form.funcao}
                    onValueChange={(value) => setForm({ ...form, funcao: value })}
                  >
                    <SelectTrigger className={formErrors.funcao ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecione o cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN_GLOBAL">
                        <span className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-purple-600" />
                          Admin Global
                        </span>
                      </SelectItem>
                      <SelectItem value="GERENTE">
                        <span className="flex items-center gap-2">
                          <UserCog className="h-4 w-4 text-blue-600" />
                          Gerente
                        </span>
                      </SelectItem>
                      <SelectItem value="VENDEDOR">
                        <span className="flex items-center gap-2">
                          <BadgePercent className="h-4 w-4 text-green-600" />
                          Vendedor
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.funcao && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.funcao}</p>
                  )}

                  {/* Resumo de permissões do cargo selecionado */}
                  {ROLE_DESCRIPTIONS[form.funcao] && (
                    <div className="mt-3 p-3 rounded-lg bg-muted text-xs space-y-1">
                      <p className="font-medium text-muted-foreground mb-1">Permissões do cargo:</p>
                      {ROLE_DESCRIPTIONS[form.funcao].map((perm) => (
                        <p key={perm} className="flex items-start gap-1.5">
                          <span className="text-green-600 mt-0.5">✓</span>
                          {perm}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Criando...' : 'Criar Conta'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── ABA: CARGOS ── */}
        <TabsContent value="cargos">
          <div className="grid gap-4 md:grid-cols-3">
            {(['ADMIN_GLOBAL', 'GERENTE', 'VENDEDOR'] as const).map((role) => (
              <Card key={role}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-full border font-semibold ${ROLE_COLORS[role]}`}
                    >
                      {ROLE_ICONS[role]}
                      {ROLE_LABELS[role]}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {ROLE_DESCRIPTIONS[role].map((perm) => (
                      <li key={perm} className="flex items-start gap-2 text-sm">
                        <span className="text-green-600 mt-0.5 flex-shrink-0">✓</span>
                        <span>{perm}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Confirmação de remoção */}
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover administrador?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso irá remover permanentemente a conta de{' '}
              <span className="font-bold">{userToDelete?.nome}</span> ({userToDelete?.email}).
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => userToDelete && deleteMutation.mutate(userToDelete.id)}
              className="bg-destructive hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Removendo...' : 'Remover'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsers;
