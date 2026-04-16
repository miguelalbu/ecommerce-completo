// src/pages/admin/OrderDetail.tsx
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrderById, updateOrder, editOrderItems, getProducts } from '@/services/apiService';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft, Store, Truck, User, Phone,
  CheckCircle, XCircle, Package, ChefHat, ClipboardCheck,
  Pencil, Trash2, Save, X, Search, CreditCard,
} from 'lucide-react';

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const PAYMENT_LABELS: Record<string, string> = {
  PIX: 'PIX',
  CARTAO_CREDITO: 'Cartão de Crédito',
  CARTAO_DEBITO: 'Cartão de Débito',
  DINHEIRO: 'Dinheiro',
};

type StatusConfig = { label: string; color: string };

const STATUS_CONFIG: Record<string, StatusConfig> = {
  PENDENTE:   { label: 'Pendente',    color: 'bg-yellow-400 text-yellow-900' },
  CONFIRMADO: { label: 'Confirmado',  color: 'bg-blue-500 text-white' },
  EM_PREPARO: { label: 'Em Preparo',  color: 'bg-orange-400 text-white' },
  PRONTO:     { label: 'Pronto',      color: 'bg-purple-500 text-white' },
  ENTREGUE:   { label: 'Entregue',    color: 'bg-emerald-600 text-white' },
  CANCELADO:  { label: 'Cancelado',   color: 'bg-gray-500 text-white' },
};

const getStatusConfig = (status: string): StatusConfig =>
  STATUS_CONFIG[status?.toUpperCase()] ?? { label: status, color: 'bg-gray-400 text-white' };

// Próximos status possíveis a partir do atual
const NEXT_ACTIONS: Record<string, { status: string; label: string; icon: React.ReactNode; className: string }[]> = {
  PENDENTE: [
    { status: 'CONFIRMADO', label: 'Confirmar Venda', icon: <CheckCircle className="h-4 w-4" />, className: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200' },
    { status: 'CANCELADO',  label: 'Cancelar',        icon: <XCircle className="h-4 w-4" />,    className: 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200' },
  ],
  CONFIRMADO: [
    { status: 'EM_PREPARO', label: 'Em Preparo',  icon: <ChefHat className="h-4 w-4" />,        className: 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200' },
    { status: 'CANCELADO',  label: 'Cancelar',    icon: <XCircle className="h-4 w-4" />,        className: 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200' },
  ],
  EM_PREPARO: [
    { status: 'PRONTO',    label: 'Marcar Pronto',    icon: <ClipboardCheck className="h-4 w-4" />, className: 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200' },
    { status: 'CANCELADO', label: 'Cancelar',         icon: <XCircle className="h-4 w-4" />,        className: 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200' },
  ],
  PRONTO: [
    { status: 'ENTREGUE',  label: 'Marcar Entregue',  icon: <Package className="h-4 w-4" />,        className: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200' },
    { status: 'CANCELADO', label: 'Cancelar',         icon: <XCircle className="h-4 w-4" />,        className: 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200' },
  ],
  ENTREGUE:  [],
  CANCELADO: [],
};

type EditItem = { produtoId: string; nome: string; quantidade: number; precoUnitario: number };

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [editMode, setEditMode] = useState(false);
  const [editItems, setEditItems] = useState<EditItem[]>([]);
  const [editDesconto, setEditDesconto] = useState('');
  const [editPayment, setEditPayment] = useState('');
  const [productSearch, setProductSearch] = useState('');

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrderById(id!, token!),
    enabled: !!id && !!token,
  });

  const { data: productsData, isLoading: isLoadingProducts, isError: isErrorProducts } = useQuery({
    queryKey: ['products-search', productSearch],
    queryFn: () => getProducts(productSearch, undefined, undefined, undefined, true),
    enabled: editMode && productSearch.length >= 2,
    staleTime: 0,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (newStatus: string) => updateOrder(id!, { status: newStatus }, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      toast({ title: 'Status atualizado!' });
    },
    onError: (e: Error) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });

  const editItemsMutation = useMutation({
    mutationFn: () =>
      editOrderItems(
        id!,
        {
          items: editItems.map(i => ({ produtoId: i.produtoId, quantidade: i.quantidade, precoUnitario: i.precoUnitario })),
          desconto: editDesconto ? parseFloat(editDesconto) : 0,
          forma_pagamento: editPayment || undefined,
        },
        token!
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      toast({ title: 'Pedido atualizado!' });
      setEditMode(false);
    },
    onError: (e: Error) => toast({ title: 'Erro ao salvar', description: e.message, variant: 'destructive' }),
  });

  const startEdit = () => {
    if (!order) return;
    setEditItems(
      order.itens.map((i: any) => ({
        produtoId: i.produtoId,
        nome: i.produto?.nome ?? 'Produto',
        quantidade: i.quantidade,
        precoUnitario: Number(i.precoNoMomentoDaCompra),
      }))
    );
    setEditDesconto(order.desconto ? String(Number(order.desconto)) : '');
    setEditPayment(order.forma_pagamento ?? '');
    setEditMode(true);
    setProductSearch('');
  };

  const cancelEdit = () => {
    setEditMode(false);
    setProductSearch('');
  };

  const updateQty = (idx: number, delta: number) => {
    setEditItems(items =>
      items.map((item, i) =>
        i === idx ? { ...item, quantidade: Math.max(1, item.quantidade + delta) } : item
      )
    );
  };

  const removeItem = (idx: number) => {
    setEditItems(items => items.filter((_, i) => i !== idx));
  };

  const addProduct = (product: any) => {
    const exists = editItems.findIndex(i => i.produtoId === product.id);
    if (exists >= 0) {
      setEditItems(items =>
        items.map((item, i) => i === exists ? { ...item, quantidade: item.quantidade + 1 } : item)
      );
    } else {
      setEditItems(items => [
        ...items,
        { produtoId: product.id, nome: product.nome, quantidade: 1, precoUnitario: Number(product.preco) },
      ]);
    }
    setProductSearch('');
  };

  const editTotal = editItems.reduce((s, i) => s + i.precoUnitario * i.quantidade, 0)
    - (parseFloat(editDesconto) || 0);

  if (isLoading) return <div className="p-8 text-center">Carregando...</div>;
  if (!order) return <div className="p-8 text-center text-red-500">Pedido não encontrado.</div>;

  const statusInfo = getStatusConfig(order.status);
  const nextActions = NEXT_ACTIONS[order.status?.toUpperCase()] ?? [];
  const isPickup = order.observacao?.includes('[RETIRADA');
  const canEdit = ['PENDENTE', 'CONFIRMADO'].includes(order.status?.toUpperCase());

  return (
    <div className="animate-in fade-in duration-500 max-w-6xl mx-auto">
      {/* Topo */}
      <div className="flex items-start gap-3 mb-6">
        <Button variant="outline" size="icon" asChild className="flex-shrink-0 mt-1">
          <Link to="/admin/orders"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-xl md:text-2xl font-bold flex flex-wrap items-center gap-2">
            Pedido #{order.id.substring(0, 8).toUpperCase()}
            <Badge className={`${statusInfo.color} border-none`}>{statusInfo.label}</Badge>
          </h1>
          <p className="text-sm text-muted-foreground">Criado em: {fmtDate(order.criadoEm)}</p>
        </div>
        {canEdit && !editMode && (
          <Button variant="outline" size="sm" onClick={startEdit} className="gap-1.5">
            <Pencil className="h-4 w-4" /> Editar Pedido
          </Button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
        {/* Coluna Esquerda */}
        <div className="lg:col-span-2 space-y-6">

          {/* Ações de Status */}
          {nextActions.length > 0 && !editMode && (
            <Card className="bg-muted/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold uppercase text-muted-foreground">Atualizar Status</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {nextActions.map(action => (
                  <Button
                    key={action.status}
                    size="sm"
                    variant="outline"
                    className={action.className}
                    disabled={updateStatusMutation.isPending}
                    onClick={() => updateStatusMutation.mutate(action.status)}
                  >
                    {action.icon}
                    <span className="ml-1.5">{action.label}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Modo Edição */}
          {editMode ? (
            <Card className="border-primary/40 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Editando Pedido</span>
                  <Button variant="ghost" size="icon" onClick={cancelEdit}><X className="h-4 w-4" /></Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Busca de produto */}
                <div className="relative">
                  <Label className="mb-1 block">Adicionar produto</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      placeholder="Buscar produto pelo nome..."
                      value={productSearch}
                      onChange={e => setProductSearch(e.target.value)}
                    />
                  </div>
                  {productSearch.length >= 2 && (
                    <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {isLoadingProducts ? (
                        <p className="px-3 py-2 text-sm text-muted-foreground">Buscando...</p>
                      ) : isErrorProducts ? (
                        <p className="px-3 py-2 text-sm text-red-500">Erro ao buscar produtos.</p>
                      ) : Array.isArray(productsData) && productsData.length > 0 ? (
                        productsData.map((p: any) => (
                          <button
                            key={p.id}
                            type="button"
                            className="w-full text-left px-3 py-2 hover:bg-accent text-sm flex justify-between"
                            onClick={() => addProduct(p)}
                          >
                            <span>{p.nome}</span>
                            <span className="text-muted-foreground">{fmt(Number(p.preco))}</span>
                          </button>
                        ))
                      ) : (
                        <p className="px-3 py-2 text-sm text-muted-foreground">Nenhum produto encontrado.</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Itens editáveis */}
                <div className="space-y-2">
                  {editItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white border rounded-md px-3 py-2">
                      <span className="flex-1 text-sm font-medium truncate">{item.nome}</span>
                      <span className="text-xs text-muted-foreground w-20 text-right">{fmt(item.precoUnitario)}</span>
                      <div className="flex items-center gap-1">
                        <Button type="button" size="icon" variant="outline" className="h-6 w-6 text-xs" onClick={() => updateQty(idx, -1)}>−</Button>
                        <span className="w-6 text-center text-sm">{item.quantidade}</span>
                        <Button type="button" size="icon" variant="outline" className="h-6 w-6 text-xs" onClick={() => updateQty(idx, 1)}>+</Button>
                      </div>
                      <span className="text-sm font-semibold w-20 text-right">{fmt(item.precoUnitario * item.quantidade)}</span>
                      <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:text-red-700" onClick={() => removeItem(idx)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                  {editItems.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">Nenhum item. Adicione produtos acima.</p>
                  )}
                </div>

                {/* Desconto e pagamento */}
                <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t">
                  <div>
                    <Label className="mb-1 block">Desconto (R$)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0,00"
                      value={editDesconto}
                      onChange={e => setEditDesconto(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="mb-1 block">Forma de Pagamento</Label>
                    <Select value={editPayment} onValueChange={setEditPayment}>
                      <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(PAYMENT_LABELS).map(([v, l]) => (
                          <SelectItem key={v} value={v}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="font-bold text-lg">Total: {fmt(Math.max(0, editTotal))}</span>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={cancelEdit}>Cancelar</Button>
                    <Button
                      onClick={() => editItemsMutation.mutate()}
                      disabled={editItemsMutation.isPending || editItems.length === 0}
                      className="gap-1.5"
                    >
                      <Save className="h-4 w-4" />
                      {editItemsMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Tabela de Itens (modo visualização) */
            <Card>
              <CardHeader><CardTitle>Itens do Pedido</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead>Qtd.</TableHead>
                        <TableHead>Preço Unit.</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.itens?.length > 0 ? (
                        order.itens.map((item: any) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.produto?.nome ?? 'Produto Indisponível'}</TableCell>
                            <TableCell>{item.quantidade}</TableCell>
                            <TableCell>{fmt(Number(item.precoNoMomentoDaCompra))}</TableCell>
                            <TableCell className="text-right font-bold">
                              {fmt(Number(item.precoNoMomentoDaCompra) * item.quantidade)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                            Nenhum item encontrado.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Coluna Direita */}
        <div className="space-y-4">
          {/* Entrega */}
          <Card className={`border-l-4 ${isPickup ? 'border-l-purple-500' : 'border-l-blue-500'}`}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                {isPickup ? <Store className="text-purple-600 h-5 w-5" /> : <Truck className="text-blue-600 h-5 w-5" />}
                {isPickup ? 'Retirada em Loja' : 'Entrega em Domicílio'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/40 p-3 rounded-md text-sm">
                <p className="text-gray-700 whitespace-pre-wrap">{order.observacao ?? '—'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Financeiro */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Financeiro</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{fmt(Number(order.valor_total) + Number(order.desconto ?? 0))}</span>
              </div>
              {order.desconto && Number(order.desconto) > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Desconto {order.cupom && `(${order.cupom.codigo})`}</span>
                  <span>−{fmt(Number(order.desconto))}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base pt-2 border-t">
                <span>Total</span>
                <span className="text-emerald-600">{fmt(Number(order.valor_total))}</span>
              </div>
              {order.forma_pagamento && (
                <div className="flex items-center gap-1.5 pt-2 text-muted-foreground">
                  <CreditCard className="h-4 w-4" />
                  <span>{PAYMENT_LABELS[order.forma_pagamento] ?? order.forma_pagamento}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cliente */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" /> Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1.5">
              {order.cliente ? (
                <>
                  <p><span className="font-semibold">Nome:</span> {order.cliente.nome} {order.cliente.sobrenome}</p>
                  <p><span className="font-semibold">Email:</span> {order.cliente.email}</p>
                  {order.cliente.telefone && (
                    <p className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" />
                      {order.cliente.telefone}
                    </p>
                  )}
                </>
              ) : (
                <div className="space-y-1 text-muted-foreground">
                  <p>Convidado / Balcão</p>
                  {order.cliente_nome && (
                    <p className="font-medium text-foreground">{order.cliente_nome}</p>
                  )}
                  {order.cliente_telefone && (
                    <p className="flex items-center gap-1 text-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      {order.cliente_telefone}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
