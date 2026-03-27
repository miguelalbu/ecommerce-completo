// /src/pages/admin/ProductForm.tsx

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from "@/components/ui/switch";
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategories, getMarcas, createProduct, getProductById, updateProduct, BACKEND_URL } from '@/services/apiService';
import { useAuth } from '@/context/AuthContext';

type Category = { id: string; nome: string; slug?: string; subcategorias?: { id: string; nome: string }[] };
type Marca = { id: string; nome: string; slug: string };
type ProductData = {
    id: string;
    nome: string;
    descricao: string | null;
    preco: number | string;
    precoCompra: number | string | null;
    estoque: number | string;
    categoriaId: string;
    marcaId: string | null;
    subcategoriaId: string | null;
    volume: number | null;
    unidade: string | null;
    isFeatured: boolean | null;
    showInCatalog: boolean;
    imageUrl: string | null;
    categoria: Category;
};

const ProductForm = () => {
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;

    const navigate = useNavigate();
    const { toast } = useToast();
    const { token } = useAuth();
    const queryClient = useQueryClient();

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [purchasePrice, setPurchasePrice] = useState('');
    const [stock, setStock] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [marcaId, setMarcaId] = useState('none');
    const [subcategoriaId, setSubcategoriaId] = useState('none');
    const [volume, setVolume] = useState('');
    const [unidade, setUnidade] = useState('none');
    const [isFeatured, setIsFeatured] = useState(false);
    const [showInCatalog, setShowInCatalog] = useState(true);

    const { data: categories, isLoading: isLoadingCategories } = useQuery<Category[]>({
        queryKey: ['categories'],
        queryFn: getCategories,
        enabled: !!token,
    });

    const { data: marcas, isLoading: isLoadingMarcas } = useQuery<Marca[]>({
        queryKey: ['marcas'],
        queryFn: getMarcas,
        enabled: !!token,
    });

    const { data: productData, isLoading: isLoadingProduct } = useQuery<ProductData>({
        queryKey: ['product', id],
        queryFn: () => getProductById(id!),
        enabled: isEditMode && !!token,
    });

    const selectedCategory = categories?.find(c => c.id === categoryId);
    const subcategorias = selectedCategory?.subcategorias || [];

    useEffect(() => {
        if (isEditMode && productData) {
            setName(productData.nome);
            setDescription(productData.descricao || '');
            setPrice(String(productData.preco));
            setPurchasePrice(productData.precoCompra != null ? String(productData.precoCompra) : '');
            setStock(String(productData.estoque));
            setCategoryId(productData.categoriaId);
            setMarcaId(productData.marcaId || 'none');
            setSubcategoriaId(productData.subcategoriaId || 'none');
            setVolume(productData.volume != null ? String(productData.volume) : '');
            setUnidade(productData.unidade || 'none');
            setIsFeatured(productData.isFeatured || false);
            setShowInCatalog(productData.showInCatalog ?? true);
            if (productData.imageUrl) {
                setImagePreview(`${BACKEND_URL}/${productData.imageUrl}`);
            }
        }
    }, [isEditMode, productData]);

    // Reset subcategoria when category changes
    useEffect(() => {
        if (!isEditMode) setSubcategoriaId('none');
    }, [categoryId]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        } else {
            if (!isEditMode || !productData?.imageUrl) {
                setImagePreview(null);
            }
        }
    };

    const mutation = useMutation({
        mutationFn: (formData: FormData) => {
            if (!token) throw new Error("Autenticação necessária.");
            return isEditMode ? updateProduct(id!, formData, token) : createProduct(formData, token);
        },
        onSuccess: () => {
            toast({ title: "Sucesso!", description: `Produto ${isEditMode ? 'atualizado' : 'criado'} com sucesso.` });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            navigate('/admin/products');
        },
        onError: (error: Error) => {
            toast({ title: "Erro", description: error.message || `Falha ao ${isEditMode ? 'atualizar' : 'criar'} produto.`, variant: "destructive" });
        }
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!token) {
            toast({ title: "Erro", description: "Você precisa estar logado.", variant: "destructive" });
            return;
        }

        if (!categoryId) {
            toast({ title: "Erro", description: "Selecione uma categoria.", variant: "destructive" });
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('price', price);
        if (purchasePrice) formData.append('purchasePrice', purchasePrice);
        formData.append('stock', stock);
        formData.append('categoryId', categoryId);
        if (marcaId && marcaId !== 'none') formData.append('marcaId', marcaId);
        if (subcategoriaId && subcategoriaId !== 'none') formData.append('subcategoriaId', subcategoriaId);
        if (volume) formData.append('volume', volume);
        if (unidade && unidade !== 'none') formData.append('unidade', unidade);
        formData.append('isFeatured', String(isFeatured));
        formData.append('showInCatalog', String(showInCatalog));

        if (imageFile) {
            formData.append('image', imageFile);
        } else if (!isEditMode) {
            toast({ title: "Erro", description: "Por favor, selecione uma imagem.", variant: "destructive" });
            return;
        }

        mutation.mutate(formData);
    };

    if (isLoadingProduct) return <div>Carregando produto...</div>;

    return (
        <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-6">{isEditMode ? 'Editar Produto' : 'Novo Produto'}</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Detalhes do Produto</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="name">Nome do Produto *</Label>
                                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                            </div>
                            <div>
                                <Label htmlFor="categoryId">Categoria *</Label>
                                <Select value={categoryId} onValueChange={setCategoryId} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione uma categoria" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {isLoadingCategories ? <SelectItem value="loading" disabled>Carregando...</SelectItem> :
                                            categories?.map((cat) => <SelectItem key={cat.id} value={cat.id}>{cat.nome}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            {subcategorias.length > 0 && (
                                <div>
                                    <Label htmlFor="subcategoriaId">Subcategoria</Label>
                                    <Select value={subcategoriaId} onValueChange={setSubcategoriaId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione uma subcategoria (opcional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Nenhuma</SelectItem>
                                            {subcategorias.map((sub) => (
                                                <SelectItem key={sub.id} value={sub.id}>{sub.nome}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div>
                                <Label htmlFor="marcaId">Marca</Label>
                                <Select value={marcaId} onValueChange={setMarcaId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione uma marca (opcional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Sem marca</SelectItem>
                                        {isLoadingMarcas ? <SelectItem value="loading" disabled>Carregando...</SelectItem> :
                                            marcas?.map((m) => <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="price">Preço de Venda *</Label>
                                <Input id="price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
                            </div>
                            <div>
                                <Label htmlFor="purchasePrice">Preço de Compra</Label>
                                <Input id="purchasePrice" type="number" step="0.01" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} placeholder="Opcional" />
                            </div>
                            <div>
                                <Label htmlFor="stock">Estoque *</Label>
                                <Input id="stock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} required />
                            </div>
                            <div>
                                <Label htmlFor="volume">Volume / Quantidade</Label>
                                <div className="flex gap-2">
                                    <Input id="volume" type="number" value={volume} onChange={(e) => setVolume(e.target.value)} placeholder="Ex: 100" />
                                    <Select value={unidade} onValueChange={setUnidade}>
                                        <SelectTrigger className="w-28">
                                            <SelectValue placeholder="Unid." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">—</SelectItem>
                                            <SelectItem value="ml">ml</SelectItem>
                                            <SelectItem value="g">g</SelectItem>
                                            <SelectItem value="oz">oz</SelectItem>
                                            <SelectItem value="un">un</SelectItem>
                                            <SelectItem value="kg">kg</SelectItem>
                                            <SelectItem value="L">L</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="description">Descrição</Label>
                            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
                        </div>

                        <div>
                            <Label htmlFor="image">Imagem do Produto {isEditMode ? '(Opcional: selecione para substituir)' : '*'}</Label>
                            <Input id="image" type="file" onChange={handleImageChange} accept="image/*" required={!isEditMode} />
                            {imagePreview && <img src={imagePreview} alt="Pré-visualização" className="mt-4 w-32 h-32 object-cover rounded" />}
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                            <Switch id="showInCatalog" checked={showInCatalog} onCheckedChange={setShowInCatalog} />
                            <Label htmlFor="showInCatalog">Exibir no catálogo online</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch id="isFeatured" checked={isFeatured} onCheckedChange={setIsFeatured} />
                            <Label htmlFor="isFeatured">Marcar como Produto em Destaque</Label>
                        </div>

                        <div className="flex justify-end gap-4 pt-4">
                            <Button type="button" variant="outline" onClick={() => navigate('/admin/products')}>Cancelar</Button>
                            <Button type="submit" disabled={mutation.isPending}>
                                {mutation.isPending ? 'Salvando...' : (isEditMode ? 'Salvar Alterações' : 'Salvar Produto')}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default ProductForm;
