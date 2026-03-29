// src/pages/admin/Gastos.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getGastos, getResumoGastos, createGasto, updateGasto, deleteGasto } from '@/services/apiService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Pencil, Trash2, Plus, TrendingDown, Filter } from 'lucide-react';

const CATEGORIAS = [
  { value: 'ALUGUEL', label: 'Aluguel' },
  { value: 'FORNECEDOR', label: 'Fornecedor' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'SALARIO', label: 'Salário' },
  { value: 'IMPOSTO', label: 'Imposto' },
  { value: 'SERVICO', label: 'Serviço' },
  { value: 'EQUIPAMENTO', label: 'Equipamento' },
  { value: 'OUTRO', label: 'Outro' },
];

const CATEGORIA_CORES: Record<string, string> = {
  ALUGUEL: 'bg-blue-100 text-blue-700',
  FORNECEDOR: 'bg-orange-100 text-orange-700',
  MARKETING: 'bg-purple-100 text-purple-700',
  SALARIO: 'bg-green-100 text-green-700',
  IMPOSTO: 'bg-red-100 text-red-700',
  SERVICO: 'bg-yellow-100 text-yellow-700',
  EQUIPAMENTO: 'bg-cyan-100 text-cyan-700',
  OUTRO: 'bg-gray-100 text-gray-700',
};

type Gasto = {
  id: string;
  descricao: string;
  valor: number;
  categoria: string;
  data: string;
  observacao: string | null;
  criadoPor: string;
  criadoEm: string;
};

const emptyForm = {
  descricao: '',
  valor: '',
  categoria: 'OUTRO',
  data: new Date().toISOString().slice(0, 10),
  observacao: '',
};

const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
const fmtDate = (d: string) => new Date(d).toLocaleDateString('pt-BR');

const hoje = new Date();
const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().slice(0, 10);
const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().slice(0, 10);

const Gastos = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGasto, setEditingGasto] = useState<Gasto | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [gastoToDelete, setGastoToDelete] = useState<Gasto | null>(null);
  const [filtroCategoria, setFiltroCategoria] = useState('TODAS');
  const [filtroInicio, setFiltroInicio] = useState(primeiroDiaMes);
  const [filtroFim, setFiltroFim] = useState(ultimoDiaMes);

  const queryParams = {
    categoria: filtroCategoria !== 'TODAS' ? filtroCategoria : undefined,
    dataInicio: filtroInicio || undefined,
    dataFim: filtroFim || undefined,
  };

  const { data: gastos = [], isLoading } = useQuery({
    queryKey: ['gastos', queryParams],
    queryFn: () => getGastos(token!, queryParams),
    enabled: !!token,
  });

  const { data: resumo } = useQuery({
    queryKey: ['gastos-resumo', { dataInicio: filtroInicio, dataFim: filtroFim }],
    queryFn: () => getResumoGastos(token!, { dataInicio: filtroInicio, dataFim: filtroFim }),
    enabled: !!token,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => createGasto(data, token!),
    onSuccess: () => {
      toast({ title: 'Gasto registrado!' });
      queryClient.invalidateQueries({ queryKey: ['gastos'] });
      queryClient.invalidateQueries({ queryKey: ['gastos-resumo'] });
      setDialogOpen(false);
    },
    onError: (err: Error) => toast({ title: 'Erro', description: err.message, variant: 'destructive' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateGasto(id, data, token!),
    onSuccess: () => {
      toast({ title: 'Gasto atualizado!' });
      queryClient.invalidateQueries({ queryKey: ['gastos'] });
      queryClient.invalidateQueries({ queryKey: ['gastos-resumo'] });
      setDialogOpen(false);
    },
    onError: (err: Error) => toast({ title: 'Erro', description: err.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteGasto(id, token!),
    onSuccess: () => {
      toast({ title: 'Gasto removido.' });
      queryClient.invalidateQueries({ queryKey: ['gastos'] });
      queryClient.invalidateQueries({ queryKey: ['gastos-resumo'] });
    },
    onError: (err: Error) => toast({ title: 'Erro', description: err.message, variant: 'destructive' }),
    onSettled: () => setGastoToDelete(null),
  });

  const openCreate = () => {
    setEditingGasto(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (g: Gasto) => {
    setEditingGasto(g);
    setForm({
      descricao: g.descricao,
      valor: String(g.valor),
      categoria: g.categoria,
      data: g.data.slice(0, 10),
      observacao: g.observacao || '',
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.descricao.trim() || !form.valor || !form.data) {
      toast({ title: 'Preencha todos os campos obrigatórios.', variant: 'destructive' });
      return;
    }
    const payload = {
      descricao: form.descricao,
      valor: parseFloat(form.valor),
      categoria: form.categoria,
      data: form.data,
      observacao: form.observacao || null,
    };
    if (editingGasto) {
      updateMutation.mutate({ id: editingGasto.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const categLabel = (cat: string) => CATEGORIAS.find((c) => c.value === cat)?.label ?? cat;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Gastos & Investimentos</h1>
        <Button onClick={openCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Novo Gasto
        </Button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Total no período</p>
            <p className="text-2xl font-bold text-red-600">{fmt(resumo?.totalGeral ?? 0)}</p>
          </CardContent>
        </Card>
        {resumo?.porCategoria && Object.entries(resumo.porCategoria).map(([cat, val]) => (
          <Card key={cat}>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">{categLabel(cat)}</p>
              <p className="text-xl font-semibold">{fmt(val as number)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtros */}
      <Card className="mb-4">
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-3 items-end">
            <Filter className="h-4 w-4 text-muted-foreground mb-2" />
            <div>
              <Label className="text-xs">Categoria</Label>
              <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODAS">Todas</SelectItem>
                  {CATEGORIAS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">De</Label>
              <Input type="date" className="w-36" value={filtroInicio} onChange={(e) => setFiltroInicio(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Até</Label>
              <Input type="date" className="w-36" value={filtroFim} onChange={(e) => setFiltroFim(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      <Card>
        <CardHeader><CardTitle>Registros</CardTitle></CardHeader>
        <CardContent className="p-0 md:p-6">
          {isLoading ? (
            <p className="p-6">Carregando...</p>
          ) : gastos.length === 0 ? (
            <p className="p-6 text-muted-foreground">Nenhum gasto encontrado.</p>
          ) : (
            <ul className="divide-y">
              {gastos.map((g: Gasto) => (
                <li key={g.id} className="flex items-start gap-3 p-4">
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-red-100 flex-shrink-0 mt-0.5">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-medium text-sm">{g.descricao}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORIA_CORES[g.categoria] ?? 'bg-gray-100 text-gray-700'}`}>
                        {categLabel(g.categoria)}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      <p>{fmtDate(g.data)} &bull; Por: {g.criadoPor}</p>
                      {g.observacao && <p className="italic">{g.observacao}</p>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className="font-bold text-red-600">{fmt(Number(g.valor))}</span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(g)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setGastoToDelete(g)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Dialog Criar/Editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingGasto ? 'Editar Gasto' : 'Novo Gasto'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Descrição *</Label>
              <Input
                value={form.descricao}
                onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                placeholder="Ex: Compra de estoque"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Valor (R$) *</Label>
                <Input
                  type="number" min="0" step="0.01"
                  value={form.valor}
                  onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))}
                  placeholder="0,00"
                />
              </div>
              <div>
                <Label>Data *</Label>
                <Input
                  type="date"
                  value={form.data}
                  onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label>Categoria *</Label>
              <Select value={form.categoria} onValueChange={(v) => setForm((f) => ({ ...f, categoria: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIAS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Observação</Label>
              <Textarea
                value={form.observacao}
                onChange={(e) => setForm((f) => ({ ...f, observacao: e.target.value }))}
                placeholder="Detalhes adicionais..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog Exclusão */}
      <AlertDialog open={!!gastoToDelete} onOpenChange={() => setGastoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover gasto?</AlertDialogTitle>
            <AlertDialogDescription>
              O registro <span className="font-bold">"{gastoToDelete?.descricao}"</span> será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => gastoToDelete && deleteMutation.mutate(gastoToDelete.id)}
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

export default Gastos;
