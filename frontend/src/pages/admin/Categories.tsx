import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategories, createCategory, deleteCategory, updateCategory, createSubcategoria, deleteSubcategoria } from '@/services/apiService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Trash2, ChevronDown, ChevronRight, Plus, Pencil, Check, X } from 'lucide-react';

const Categories = () => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState('');
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const [newSubName, setNewSubName] = useState<Record<string, string>>({});
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => createCategory(name, token!),
    onSuccess: () => {
      toast({ title: 'Sucesso!', description: 'Categoria criada.' });
      setNewCategoryName('');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err: Error) => toast({ title: 'Erro', description: err.message, variant: 'destructive' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updateCategory(id, name, token!),
    onSuccess: () => {
      toast({ title: 'Sucesso!', description: 'Categoria atualizada.' });
      setEditingCatId(null);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err: Error) => toast({ title: 'Erro', description: err.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id, token!),
    onSuccess: () => {
      toast({ title: 'Sucesso!', description: 'Categoria deletada.' });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err: Error) => toast({ title: 'Erro', description: err.message, variant: 'destructive' }),
  });

  const createSubMutation = useMutation({
    mutationFn: ({ categoriaId, nome }: { categoriaId: string; nome: string }) =>
      createSubcategoria(categoriaId, nome, token!),
    onSuccess: (_, { categoriaId }) => {
      toast({ title: 'Sucesso!', description: 'Subcategoria criada.' });
      setNewSubName(prev => ({ ...prev, [categoriaId]: '' }));
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err: Error) => toast({ title: 'Erro', description: err.message, variant: 'destructive' }),
  });

  const deleteSubMutation = useMutation({
    mutationFn: (id: string) => deleteSubcategoria(id, token!),
    onSuccess: () => {
      toast({ title: 'Sucesso!', description: 'Subcategoria deletada.' });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err: Error) => toast({ title: 'Erro', description: err.message, variant: 'destructive' }),
  });

  const toggleExpand = (id: string) => {
    setExpandedCats(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Gerenciar Categorias</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader><CardTitle>Nova Categoria</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Nome da categoria"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && newCategoryName.trim() && createMutation.mutate(newCategoryName.trim())}
              />
              <Button onClick={() => newCategoryName.trim() && createMutation.mutate(newCategoryName.trim())} disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Criando...' : 'Criar'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Categorias Existentes</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <p>Carregando...</p> : (
              <ul className="space-y-2">
                {categories?.map((cat) => (
                  <li key={cat.id} className="border rounded overflow-hidden">
                    <div className="flex items-center gap-2 p-2">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleExpand(cat.id)}>
                        {expandedCats.has(cat.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </Button>

                      {editingCatId === cat.id ? (
                        <>
                          <Input value={editingCatName} onChange={(e) => setEditingCatName(e.target.value)} className="h-7 flex-1" autoFocus />
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateMutation.mutate({ id: cat.id, name: editingCatName })}>
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingCatId(null)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <div className="flex-1">
                            <span className="font-medium">{cat.nome}</span>
                            {cat.slug && <span className="text-xs text-muted-foreground ml-2">/{cat.slug}</span>}
                          </div>
                          <span className="text-xs text-muted-foreground">{cat.subcategorias?.length || 0} sub</span>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingCatId(cat.id); setEditingCatName(cat.nome); }}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteMutation.mutate(cat.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>

                    {expandedCats.has(cat.id) && (
                      <div className="border-t bg-muted/30 p-3 space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase">Subcategorias</p>
                        <ul className="space-y-1">
                          {cat.subcategorias?.map((sub) => (
                            <li key={sub.id} className="flex items-center justify-between text-sm pl-2">
                              <span>{sub.nome}</span>
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteSubMutation.mutate(sub.id)}>
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            </li>
                          ))}
                          {(!cat.subcategorias || cat.subcategorias.length === 0) && (
                            <li className="text-xs text-muted-foreground">Nenhuma subcategoria</li>
                          )}
                        </ul>
                        <div className="flex gap-2 mt-2">
                          <Input
                            placeholder="Nova subcategoria"
                            className="h-8 text-sm"
                            value={newSubName[cat.id] || ''}
                            onChange={(e) => setNewSubName(prev => ({ ...prev, [cat.id]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && newSubName[cat.id]?.trim()) {
                                createSubMutation.mutate({ categoriaId: cat.id, nome: newSubName[cat.id].trim() });
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8"
                            onClick={() => newSubName[cat.id]?.trim() && createSubMutation.mutate({ categoriaId: cat.id, nome: newSubName[cat.id].trim() })}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Categories;
