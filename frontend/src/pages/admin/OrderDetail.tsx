// src/pages/admin/OrderDetails.tsx

import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; // Importei Mutation/Client
import { getOrderById, updateOrder } from '@/services/apiService'; // Importe updateOrder
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast'; // Import Toast
import { 
    ArrowLeft, MapPin, Store, Truck, User, 
    CheckCircle, XCircle, Clock, Package 
} from 'lucide-react';

const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit' });

const getStatusConfig = (status: string) => {
  const s = status ? status.toUpperCase() : "";
  switch (s) {
    case 'PAID': return { label: 'PAGO', color: 'bg-green-600' };
    case 'PENDING': return { label: 'PENDENTE', color: 'bg-red-500' };
    case 'PROCESSANDO': return { label: 'PROCESSANDO', color: 'bg-yellow-500 text-black' };
    case 'SHIPPED': return { label: 'ENVIADO', color: 'bg-blue-500' };
    case 'DELIVERED': return { label: 'ENTREGUE', color: 'bg-emerald-600' };
    case 'CANCELED': return { label: 'CANCELADO', color: 'bg-gray-500' };
    default: return { label: s, color: 'bg-gray-400' };
  }
};

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { token, isAdminGlobal } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrderById(id!, token!),
    enabled: !!id && !!token,
  });

  // Mutação para trocar status
  const updateStatusMutation = useMutation({
    mutationFn: (newStatus: string) => updateOrder(id!, { status: newStatus }, token!),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['order', id] });
        toast({ title: "Status atualizado com sucesso!" });
    },
    onError: () => toast({ title: "Erro ao atualizar status", variant: "destructive" })
  });

  if (isLoading) return <div className="p-8 text-center">Carregando...</div>;
  if (!order) return <div className="p-8 text-center">Pedido não encontrado.</div>;

  const statusInfo = getStatusConfig(order.status);
  
  // Lógica para detectar se é Retirada ou Entrega baseada na observação (que salvamos no checkout)
  const isPickup = order.observacao?.includes("[RETIRADA");
  const deliveryInfo = order.observacao || "Sem informações de entrega registradas.";

  return (
    <div className="animate-in fade-in duration-500 max-w-6xl mx-auto">
        {/* Topo */}
        <div className="flex items-start gap-3 mb-6">
            <Button variant="outline" size="icon" asChild className="flex-shrink-0 mt-1">
                <Link to="/admin/orders"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <div>
                <h1 className="text-xl md:text-2xl font-bold flex flex-wrap items-center gap-2">
                    Pedido #{order.id.substring(0, 8).toUpperCase()}
                    <Badge className={`${statusInfo.color} border-none`}>{statusInfo.label}</Badge>
                </h1>
                <p className="text-sm text-muted-foreground">Realizado em: {formatDate(order.criadoEm)}</p>
            </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
            {/* Coluna Esquerda: Itens e Ações */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* AÇÕES RÁPIDAS — visível apenas para Admin Global */}
                {isAdminGlobal && (
                <Card className="bg-muted/20">
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-bold uppercase text-muted-foreground">Gerenciar Pedido</CardTitle></CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200" onClick={() => updateStatusMutation.mutate('PAID')}>
                            <CheckCircle className="mr-2 h-4 w-4" /> Marcar Pago
                        </Button>
                        <Button size="sm" variant="outline" className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200" onClick={() => updateStatusMutation.mutate('SHIPPED')}>
                            <Truck className="mr-2 h-4 w-4" /> Marcar Enviado
                        </Button>
                        <Button size="sm" variant="outline" className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200" onClick={() => updateStatusMutation.mutate('DELIVERED')}>
                            <Package className="mr-2 h-4 w-4" /> Marcar Entregue
                        </Button>
                        <Button size="sm" variant="outline" className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200" onClick={() => updateStatusMutation.mutate('CANCELED')}>
                            <XCircle className="mr-2 h-4 w-4" /> Cancelar
                        </Button>
                    </CardContent>
                </Card>
                )}

                {/* TABELA DE ITENS */}
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
                                {order.itens && order.itens.length > 0 ? (
                                    order.itens.map((item: any) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.produto?.nome || "Produto Indisponível"}</TableCell>
                                            <TableCell>{item.quantidade}</TableCell>
                                            <TableCell>{formatCurrency(Number(item.precoNoMomentoDaCompra || item.precoUnitario))}</TableCell>
                                            <TableCell className="text-right font-bold">{formatCurrency(Number(item.precoNoMomentoDaCompra || item.precoUnitario) * item.quantidade)}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground">Nenhum item encontrado.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Coluna Direita: Informações de Entrega e Cliente */}
            <div className="space-y-6">
                {/* CARD DE ENTREGA / RETIRADA (DESTAQUE) */}
                <Card className={`border-l-4 ${isPickup ? 'border-l-purple-500' : 'border-l-blue-500'}`}>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            {isPickup ? <Store className="text-purple-600" /> : <Truck className="text-blue-600" />}
                            {isPickup ? "Retirada em Loja" : "Entrega em Domicílio"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-muted/40 p-3 rounded-md text-sm">
                            <p className="font-medium mb-1">Detalhes:</p>
                            {/* Mostra a string formatada que salvamos no checkout */}
                            <p className="text-gray-700 whitespace-pre-wrap">{deliveryInfo}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Resumo Financeiro */}
                <Card>
                    <CardHeader><CardTitle>Financeiro</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between text-sm"><span>Subtotal</span> <span>{formatCurrency(Number(order.valor_total))}</span></div>
                        <div className="flex justify-between text-sm"><span>Frete</span> <span>R$ 0,00</span></div>
                        <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
                            <span>Total</span> <span className="text-emerald-600">{formatCurrency(Number(order.valor_total))}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Dados do Cliente */}
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-4 w-4" /> Cliente</CardTitle></CardHeader>
                    <CardContent className="text-sm space-y-2">
                        {order.cliente ? (
                            <>
                                <p><span className="font-semibold">Nome:</span> {order.cliente.nome} {order.cliente.sobrenome}</p>
                                <p><span className="font-semibold">Email:</span> <a href={`mailto:${order.cliente.email}`} className="text-blue-600 hover:underline">{order.cliente.email}</a></p>
                                <p><span className="font-semibold">Tel:</span> {order.cliente.telefone || '-'}</p>
                            </>
                        ) : (
                            <div className="text-muted-foreground italic">
                                Cliente não cadastrado (Venda Balcão ou Convidado).
                                <br/>Nome informado: <span className="font-medium text-foreground">{order.cliente_nome}</span>
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