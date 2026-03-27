import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { getProducts, getCategories, getMarcas } from "@/services/apiService";

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedMarca, setSelectedMarca] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("featured");

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const { data: marcas } = useQuery({
    queryKey: ['marcas'],
    queryFn: getMarcas,
  });

  // Sync state from URL params on load
  useEffect(() => {
    const marcaSlug = searchParams.get('marca');
    const categoriaSlug = searchParams.get('categoria');

    if (marcaSlug && marcas) {
      const found = marcas.find(m => m.slug === marcaSlug);
      if (found) setSelectedMarca(found.id);
    }
    if (categoriaSlug && categories) {
      const found = categories.find(c => c.slug === categoriaSlug);
      if (found) setSelectedCategory(found.id);
    }
  }, [searchParams, marcas, categories]);

  const { data: products, isLoading: isLoadingProducts, error } = useQuery({
    queryKey: ['products', selectedCategory, selectedMarca, sortBy],
    queryFn: () => getProducts(undefined, selectedCategory, sortBy, false, false, selectedMarca),
  });

  const handleCategoryChange = (id: string) => {
    setSelectedCategory(id);
    setSelectedMarca("all");
    setSearchParams({});
  };

  const handleMarcaChange = (id: string) => {
    setSelectedMarca(id);
    setSelectedCategory("all");
    setSearchParams({});
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="bg-muted/30 py-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold mb-2">Catálogo</h1>
            <p className="text-muted-foreground">Explore nossa coleção completa de produtos</p>
          </div>
        </div>

        {/* FILTROS */}
        <div className="border-b bg-background sticky top-16 z-40">
          <div className="container mx-auto px-4 py-4 space-y-3">
            {/* Filtro por Categoria */}
            {categories && categories.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs font-semibold text-muted-foreground uppercase mr-1">Categoria:</span>
                <Button
                  variant={selectedCategory === "all" && selectedMarca === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setSelectedCategory("all"); setSelectedMarca("all"); setSearchParams({}); }}
                >
                  Todos
                </Button>
                {categories.map(cat => (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCategoryChange(cat.id)}
                  >
                    {cat.nome}
                  </Button>
                ))}
              </div>
            )}

            {/* Filtro por Marca */}
            {marcas && marcas.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs font-semibold text-muted-foreground uppercase mr-1">Marca:</span>
                <Button
                  variant={selectedMarca === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setSelectedMarca("all"); setSearchParams({}); }}
                >
                  Todas
                </Button>
                {marcas.map(marca => (
                  <Button
                    key={marca.id}
                    variant={selectedMarca === marca.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleMarcaChange(marca.id)}
                  >
                    {marca.nome}
                  </Button>
                ))}
              </div>
            )}

            <div className="flex justify-end">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Destaques</SelectItem>
                  <SelectItem value="price-asc">Menor Preço</SelectItem>
                  <SelectItem value="price-desc">Maior Preço</SelectItem>
                  <SelectItem value="name">Nome A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* GRID DE PRODUTOS */}
        <div className="container mx-auto px-4 py-12">
          {isLoadingProducts && <p className="text-center">Carregando produtos...</p>}
          {error && <p className="text-center text-destructive">Erro ao carregar produtos.</p>}

          {!isLoadingProducts && !error && (
            <>
              <div className="mb-6">
                <p className="text-muted-foreground">
                  {products?.length || 0} {products?.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products?.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.nome}
                    price={Number(product.preco)}
                    category={product.categoria.nome}
                    image={product.imageUrl}
                    stock={product.estoque}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Catalog;
