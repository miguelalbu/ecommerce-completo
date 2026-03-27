import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMarcas, createMarca, updateMarca, deleteMarca } from '@/services/apiService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Pencil, Check, X } from 'lucide-react';

const Brands = () => {
  const [newBrandName, setNewBrandName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: marcas, isLoading } = useQuery({
    queryKey: ['marcas'],
    queryFn: getMarcas,
  });

  const createMutation = useMutation({
    mutationFn: (nome: string) => createMarca(nome, token!),
    onSuccess: () => {
      toast({ title: 'Sucesso!', description: 'Marca criada.' });
      setNewBrandName('');
      queryClient.invalidateQueries({ queryKey: ['marcas'] });
    },
    onError: (err: Error) => toast({ title: 'Erro', description: err.message, variant: 'destructive' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, nome }: { id: string; nome: string }) => updateMarca(id, nome, token!),
    onSuccess: () => {
      toast({ title: 'Sucesso!', description: 'Marca atualizada.' });
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ['marcas'] });
    },
    onError: (err: Error) => toast({ title: 'Erro', description: err.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteMarca(id, token!),
    onSuccess: () => {
      toast({ title: 'Sucesso!', description: 'Marca deletada.' });
      queryClient.invalidateQueries({ queryKey: ['marcas'] });
    },
    onError: (err: Error) => toast({ title: 'Erro', description: err.message, variant: 'destructive' }),
  });

  const startEdit = (id: string, nome: string) => {
    setEditingId(id);
    setEditingName(nome);
  };

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Gerenciar Marcas</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader><CardTitle>Nova Marca</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Nome da marca"
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && newBrandName.trim() && createMutation.mutate(newBrandName.trim())}
              />
              <Button onClick={() => newBrandName.trim() && createMutation.mutate(newBrandName.trim())} disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Criando...' : 'Criar'}
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Marcas Cadastradas</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <p>Carregando...</p> : (
              <ul className="space-y-2">
                {marcas?.map((marca) => (
                  <li key={marca.id} className="flex justify-between items-center p-2 border rounded gap-2">
                    {editingId === marca.id ? (
                      <>
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="h-8"
                          autoFocus
                        />
                        <Button variant="ghost" size="icon" onClick={() => updateMutation.mutate({ id: marca.id, nome: editingName })}>
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setEditingId(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div>
                          <span className="font-medium">{marca.nome}</span>
                          <span className="text-xs text-muted-foreground ml-2">/{marca.slug}</span>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => startEdit(marca.id, marca.nome)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(marca.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
                {marcas?.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma marca cadastrada.</p>}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Brands;
