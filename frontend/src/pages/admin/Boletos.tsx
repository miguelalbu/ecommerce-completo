// src/pages/admin/Boletos.tsx
import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBoletos, createBoleto, updateBoleto, deleteBoleto } from '@/services/apiService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pencil, Trash2, Plus, FileText, CheckCircle, Camera, AlertTriangle, Clock } from 'lucide-react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';

// --- Bancos brasileiros ---
const BANCOS: Record<string, string> = {
  '001': 'Banco do Brasil',
  '033': 'Santander',
  '041': 'Banrisul',
  '077': 'Banco Inter',
  '104': 'Caixa Econômica Federal',
  '237': 'Bradesco',
  '260': 'Nubank',
  '341': 'Itaú',
  '422': 'Banco Safra',
  '745': 'Citibank',
};

// --- Parser de código de barras / linha digitável ---
function parseBoleto(code: string): { dataVencimento: string | null; valor: number | null; banco: string | null } {
  const digits = code.replace(/\D/g, '');
  let dataVencimento: string | null = null;
  let valor: number | null = null;
  let banco: string | null = null;

  const calcData = (fator: string): string | null => {
    const n = parseInt(fator, 10);
    if (!n || n === 0) return null;
    const base = new Date('1997-10-07');
    base.setDate(base.getDate() + n);
    return base.toISOString().slice(0, 10);
  };

  if (digits.length === 44) {
    banco = BANCOS[digits.slice(0, 3)] ?? `Banco ${digits.slice(0, 3)}`;
    dataVencimento = calcData(digits.slice(5, 9));
    valor = parseInt(digits.slice(9, 19), 10) / 100;
  } else if (digits.length === 47) {
    banco = BANCOS[digits.slice(0, 3)] ?? `Banco ${digits.slice(0, 3)}`;
    dataVencimento = calcData(digits.slice(33, 37));
    valor = parseInt(digits.slice(37, 47), 10) / 100;
  }

  return { dataVencimento, valor, banco };
}

// --- Scanner de câmera ---
const BarcodeScanner = ({ onScan, onClose }: { onScan: (code: string) => void; onClose: () => void }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    scannerRef.current = new Html5QrcodeScanner(
      'boleto-scanner',
      {
        fps: 10,
        qrbox: { width: 400, height: 130 },
        formatsToSupport: [Html5QrcodeSupportedFormats.ITF],
      },
      false
    );

    scannerRef.current.render(
      (decodedText) => {
        scannerRef.current?.clear().catch(() => {});
        onScan(decodedText);
      },
      () => {}
    );

    return () => {
      scannerRef.current?.clear().catch(() => {});
    };
  }, [onScan]);

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-3">
        Aponte a câmera para o <strong>código de barras</strong> do boleto.
      </p>
      <div id="boleto-scanner" className="rounded-lg overflow-hidden" />
      <Button variant="outline" className="mt-3 w-full" onClick={onClose}>Cancelar</Button>
    </div>
  );
};

// --- Tipos ---
type Boleto = {
  id: string;
  descricao: string;
  valor: number;
  dataVencimento: string;
  codigoBarras: string | null;
  linhaDigitavel: string | null;
  status: string;
  statusEfetivo: string;
  banco: string | null;
  observacao: string | null;
  dataPagamento: string | null;
  criadoPor: string;
};

const emptyForm = {
  descricao: '',
  valor: '',
  dataVencimento: '',
  codigoBarras: '',
  linhaDigitavel: '',
  banco: '',
  observacao: '',
};

const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
const fmtDate = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('pt-BR');

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  PENDENTE: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
  VENCIDO: { label: 'Vencido', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle },
  PAGO: { label: 'Pago', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
};

const diasParaVencer = (dataVencimento: string): number => {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const venc = new Date(dataVencimento + 'T12:00:00');
  return Math.round((venc.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
};

const Boletos = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [editingBoleto, setEditingBoleto] = useState<Boleto | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [boletoToDelete, setBoletoToDelete] = useState<Boleto | null>(null);
  const [filtroStatus, setFiltroStatus] = useState('todos');

  const { data: boletos = [], isLoading } = useQuery({
    queryKey: ['boletos'],
    queryFn: () => getBoletos(token!),
    enabled: !!token,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => createBoleto(data, token!),
    onSuccess: () => {
      toast({ title: 'Boleto cadastrado!' });
      queryClient.invalidateQueries({ queryKey: ['boletos'] });
      setDialogOpen(false);
    },
    onError: (err: Error) => toast({ title: 'Erro', description: err.message, variant: 'destructive' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateBoleto(id, data, token!),
    onSuccess: () => {
      toast({ title: 'Boleto atualizado!' });
      queryClient.invalidateQueries({ queryKey: ['boletos'] });
      setDialogOpen(false);
    },
    onError: (err: Error) => toast({ title: 'Erro', description: err.message, variant: 'destructive' }),
  });

  const pagarMutation = useMutation({
    mutationFn: (id: string) => updateBoleto(id, { status: 'PAGO' }, token!),
    onSuccess: () => {
      toast({ title: 'Boleto marcado como pago!' });
      queryClient.invalidateQueries({ queryKey: ['boletos'] });
    },
    onError: (err: Error) => toast({ title: 'Erro', description: err.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBoleto(id, token!),
    onSuccess: () => {
      toast({ title: 'Boleto removido.' });
      queryClient.invalidateQueries({ queryKey: ['boletos'] });
    },
    onError: (err: Error) => toast({ title: 'Erro', description: err.message, variant: 'destructive' }),
    onSettled: () => setBoletoToDelete(null),
  });

  const openCreate = () => {
    setEditingBoleto(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (b: Boleto) => {
    setEditingBoleto(b);
    setForm({
      descricao: b.descricao,
      valor: String(b.valor),
      dataVencimento: b.dataVencimento.slice(0, 10),
      codigoBarras: b.codigoBarras ?? '',
      linhaDigitavel: b.linhaDigitavel ?? '',
      banco: b.banco ?? '',
      observacao: b.observacao ?? '',
    });
    setDialogOpen(true);
  };

  const handleScan = (code: string) => {
    setScannerOpen(false);
    const parsed = parseBoleto(code);
    setForm((f) => ({
      ...f,
      codigoBarras: code.replace(/\D/g, '').length === 44 ? code.replace(/\D/g, '') : f.codigoBarras,
      linhaDigitavel: code.replace(/\D/g, '').length === 47 ? code.replace(/\D/g, '') : f.linhaDigitavel,
      dataVencimento: parsed.dataVencimento ?? f.dataVencimento,
      valor: parsed.valor !== null ? String(parsed.valor) : f.valor,
      banco: parsed.banco ?? f.banco,
    }));
    setDialogOpen(true);
    toast({ title: 'Código lido!', description: 'Verifique e confirme os dados preenchidos automaticamente.' });
  };

  const handleSave = () => {
    if (!form.descricao.trim() || !form.valor || !form.dataVencimento) {
      toast({ title: 'Preencha todos os campos obrigatórios.', variant: 'destructive' });
      return;
    }
    const payload = {
      descricao: form.descricao,
      valor: parseFloat(form.valor),
      dataVencimento: form.dataVencimento,
      codigoBarras: form.codigoBarras || null,
      linhaDigitavel: form.linhaDigitavel || null,
      banco: form.banco || null,
      observacao: form.observacao || null,
    };
    if (editingBoleto) {
      updateMutation.mutate({ id: editingBoleto.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const boletosExibidos = boletos.filter((b: Boleto) => {
    if (filtroStatus === 'todos') return true;
    return b.statusEfetivo === filtroStatus.toUpperCase();
  });

  const contadores = boletos.reduce((acc: Record<string, number>, b: Boleto) => {
    acc[b.statusEfetivo] = (acc[b.statusEfetivo] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalPendente = boletos
    .filter((b: Boleto) => b.statusEfetivo === 'PENDENTE' || b.statusEfetivo === 'VENCIDO')
    .reduce((sum: number, b: Boleto) => sum + Number(b.valor), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Boletos</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setScannerOpen(true)} className="flex items-center gap-2">
            <Camera className="h-4 w-4" /> Escanear Boleto
          </Button>
          <Button onClick={openCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Novo Boleto
          </Button>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">A pagar (pendente + vencido)</p>
            <p className="text-2xl font-bold text-yellow-600">{fmt(totalPendente)}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Vencidos</p>
            <p className="text-2xl font-bold text-red-600">{contadores['VENCIDO'] ?? 0} boleto(s)</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Pagos</p>
            <p className="text-2xl font-bold text-green-600">{contadores['PAGO'] ?? 0} boleto(s)</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtro por status */}
      <Tabs value={filtroStatus} onValueChange={setFiltroStatus} className="mb-4">
        <TabsList>
          <TabsTrigger value="todos">Todos ({boletos.length})</TabsTrigger>
          <TabsTrigger value="pendente">Pendentes ({contadores['PENDENTE'] ?? 0})</TabsTrigger>
          <TabsTrigger value="vencido">Vencidos ({contadores['VENCIDO'] ?? 0})</TabsTrigger>
          <TabsTrigger value="pago">Pagos ({contadores['PAGO'] ?? 0})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Lista */}
      <Card>
        <CardHeader><CardTitle>Lista de Boletos</CardTitle></CardHeader>
        <CardContent className="p-0 md:p-6">
          {isLoading ? (
            <p className="p-6">Carregando...</p>
          ) : boletosExibidos.length === 0 ? (
            <p className="p-6 text-muted-foreground">Nenhum boleto encontrado.</p>
          ) : (
            <ul className="divide-y">
              {boletosExibidos.map((b: Boleto) => {
                const cfg = statusConfig[b.statusEfetivo] ?? statusConfig.PENDENTE;
                const StatusIcon = cfg.icon;
                const dias = b.statusEfetivo !== 'PAGO' ? diasParaVencer(b.dataVencimento.slice(0, 10)) : null;

                return (
                  <li key={b.id} className={`flex items-start gap-3 p-4 ${b.statusEfetivo === 'VENCIDO' ? 'bg-red-50/50' : ''}`}>
                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-muted flex-shrink-0 mt-0.5">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-medium text-sm">{b.descricao}</span>
                        <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${cfg.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {cfg.label}
                        </span>
                        {dias !== null && dias <= 7 && dias >= 0 && (
                          <Badge variant="outline" className="text-xs border-orange-300 text-orange-600">
                            Vence em {dias} dia{dias !== 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        <p>Vencimento: {fmtDate(b.dataVencimento.slice(0, 10))}</p>
                        {b.banco && <p>Banco: {b.banco}</p>}
                        {b.dataPagamento && <p>Pago em: {fmtDate(b.dataPagamento.slice(0, 10))}</p>}
                        {b.observacao && <p className="italic">{b.observacao}</p>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className="font-bold text-base">{fmt(Number(b.valor))}</span>
                      <div className="flex gap-1 flex-wrap justify-end">
                        {b.statusEfetivo !== 'PAGO' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 border-green-300 hover:bg-green-50 h-7 text-xs"
                            onClick={() => pagarMutation.mutate(b.id)}
                            disabled={pagarMutation.isPending}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" /> Pago
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(b)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setBoletoToDelete(b)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Dialog Scanner */}
      <Dialog open={scannerOpen} onOpenChange={setScannerOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" /> Escanear Código de Barras
            </DialogTitle>
          </DialogHeader>
          {scannerOpen && (
            <BarcodeScanner onScan={handleScan} onClose={() => setScannerOpen(false)} />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Criar/Editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingBoleto ? 'Editar Boleto' : 'Novo Boleto'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Descrição *</Label>
              <Input
                value={form.descricao}
                onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                placeholder="Ex: Aluguel do galpão"
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
                <Label>Vencimento *</Label>
                <Input
                  type="date"
                  value={form.dataVencimento}
                  onChange={(e) => setForm((f) => ({ ...f, dataVencimento: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label>Banco</Label>
              <Input
                value={form.banco}
                onChange={(e) => setForm((f) => ({ ...f, banco: e.target.value }))}
                placeholder="Ex: Bradesco"
              />
            </div>
            <div>
              <Label>Código de Barras (44 dígitos)</Label>
              <Input
                value={form.codigoBarras}
                onChange={(e) => setForm((f) => ({ ...f, codigoBarras: e.target.value.replace(/\D/g, '') }))}
                placeholder="00000000000000000000000000000000000000000000"
                maxLength={44}
                className="font-mono text-xs"
              />
            </div>
            <div>
              <Label>Linha Digitável (47 dígitos)</Label>
              <Input
                value={form.linhaDigitavel}
                onChange={(e) => setForm((f) => ({ ...f, linhaDigitavel: e.target.value.replace(/\D/g, '') }))}
                placeholder="00000000000000000000000000000000000000000000000"
                maxLength={47}
                className="font-mono text-xs"
              />
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
      <AlertDialog open={!!boletoToDelete} onOpenChange={() => setBoletoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover boleto?</AlertDialogTitle>
            <AlertDialogDescription>
              O boleto <span className="font-bold">"{boletoToDelete?.descricao}"</span> será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => boletoToDelete && deleteMutation.mutate(boletoToDelete.id)}
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

export default Boletos;
