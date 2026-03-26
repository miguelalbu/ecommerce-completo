import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Store } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLojas, createLoja, updateLoja, deleteLoja } from "@/services/apiService";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type Loja = {
  id: string;
  nome: string;
  endereco: string | null;
  telefone: string | null;
  ativo: boolean;
};

const emptyForm = { nome: '', endereco: '', telefone: '' };

const Stores = () => {
  const { token, isAdminGlobal } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [lojaToDelete, setLojaToDelete] = useState<Loja | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLoja, setEditingLoja] = useState<Loja | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: lojas, isLoading } = useQuery<Loja[]>({
    queryKey: ['lojas'],
    queryFn: getLojas,
    enabled: !!token,
  });

  const createMutation = useMutation({
    mutationFn: () => createLoja(form, token!),
    onSuccess: () => {
      toast({ title: "Loja criada com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ['lojas'] });
      handleCloseDialog();
    },
    onError: (err: Error) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: () => updateLoja(editingLoja!.id, form, token!),
    onSuccess: () => {
      toast({ title: "Loja atualizada com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ['lojas'] });
      handleCloseDialog();
    },
    onError: (err: Error) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteLoja(id, token!),
    onSuccess: () => {
      toast({ title: "Loja removida com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ['lojas'] });
    },
    onError: (err: Error) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
    onSettled: () => setLojaToDelete(null),
  });

  const handleOpenCreate = () => {
    setEditingLoja(null);
    setForm(emptyForm);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (loja: Loja) => {
    setEditingLoja(loja);
    setForm({ nome: loja.nome, endereco: loja.endereco || '', telefone: loja.telefone || '' });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingLoja(null);
    setForm(emptyForm);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim()) return;
    editingLoja ? updateMutation.mutate() : createMutation.mutate();
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isLoading) return <div>Carregando lojas...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Gerenciar Lojas</h1>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Loja
        </Button>
      </div>

      <div className="space-y-4">
        {lojas && lojas.length > 0 ? (
          lojas.map((loja) => (
            <Card key={loja.id} className="animate-fade-in">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-secondary text-secondary-foreground">
                    <Store className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-lg">{loja.nome}</h3>
                      <Badge variant={loja.ativo ? "default" : "secondary"}>
                        {loja.ativo ? "Ativa" : "Inativa"}
                      </Badge>
                    </div>
                    <div className="flex gap-6 text-sm text-muted-foreground">
                      {loja.endereco && <span>📍 {loja.endereco}</span>}
                      {loja.telefone && <span>📞 {loja.telefone}</span>}
                      {!loja.endereco && !loja.telefone && <span>Sem informações adicionais</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleOpenEdit(loja)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    {isAdminGlobal && (
                      <Button variant="outline" size="icon" onClick={() => setLojaToDelete(loja)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <Store className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">Nenhuma loja cadastrada ainda.</p>
            <Button variant="outline" onClick={handleOpenCreate}>Cadastrar primeira loja</Button>
          </div>
        )}
      </div>

      {/* Dialog Criar / Editar */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingLoja ? 'Editar Loja' : 'Nova Loja'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <Label htmlFor="nome">Nome da Loja *</Label>
              <Input
                id="nome"
                value={form.nome}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                placeholder="Ex: Luar — Camaragibe Centro"
                required
              />
            </div>
            <div>
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={form.endereco}
                onChange={(e) => setForm((f) => ({ ...f, endereco: e.target.value }))}
                placeholder="Ex: Rua das Flores, 123"
              />
            </div>
            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={form.telefone}
                onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
                placeholder="Ex: (81) 99999-0000"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancelar</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Salvando...' : (editingLoja ? 'Salvar Alterações' : 'Criar Loja')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Confirmar Exclusão */}
      <AlertDialog open={!!lojaToDelete} onOpenChange={() => setLojaToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover loja?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso irá remover a loja <span className="font-bold">"{lojaToDelete?.nome}"</span>.
              Pedidos vinculados a ela não serão afetados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={() => lojaToDelete && deleteMutation.mutate(lojaToDelete.id)}
            >
              {deleteMutation.isPending ? 'Removendo...' : 'Remover'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Stores;
