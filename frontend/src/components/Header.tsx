import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, LogIn, UserPlus, MoreVertical, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useQuery } from "@tanstack/react-query";
import { getMarcas } from "@/services/apiService";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const { isAuthenticated, userRole, logout } = useAuth();
  const { totalItems } = useCart();

  const { data: marcas } = useQuery({
    queryKey: ['marcas'],
    queryFn: getMarcas,
  });

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold">
          Luar Cosméticos
        </Link>

        {/* --- NAVEGAÇÃO DESKTOP --- */}
        <nav className="hidden md:flex items-center gap-1">
          <Link to="/" className="text-sm font-medium hover:text-primary px-3 py-2">Página Inicial</Link>
          <Link to="/catalog" className="text-sm font-medium hover:text-primary px-3 py-2">Catálogo</Link>

          {/* Marcas Dropdown */}
          {marcas && marcas.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-sm font-medium gap-1 px-3">
                  Marcas <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem asChild>
                  <Link to="/catalog">Todas as Marcas</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {marcas.map((marca) => (
                  <DropdownMenuItem key={marca.id} asChild>
                    <Link to={`/catalog?marca=${marca.slug}`}>{marca.nome}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>

        {/* Ícones de Ação */}
        <div className="flex items-center gap-2 md:gap-4">

          {/* Carrinho */}
          <Link to="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>

          {/* --- PERFIL DESKTOP --- */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {userRole === 'ADMIN' ? (
                    <DropdownMenuItem asChild>
                      <Link to="/admin/dashboard">Painel Admin</Link>
                    </DropdownMenuItem>
                  ) : (
                    <>
                      <DropdownMenuItem asChild><Link to="/profile">Meu Perfil</Link></DropdownMenuItem>
                      <DropdownMenuItem asChild><Link to="/my-orders">Meus Pedidos</Link></DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer">Sair</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <Link to="/login"><LogIn className="mr-2 h-4 w-4" /> Entrar</Link>
                </Button>
                <Button asChild>
                  <Link to="/login"><UserPlus className="mr-2 h-4 w-4" /> Cadastre-se</Link>
                </Button>
              </div>
            )}
          </div>

          {/* --- MENU MOBILE --- */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Menu</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link to="/">Página Inicial</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/catalog">Catálogo</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/cart">Carrinho ({totalItems})</Link></DropdownMenuItem>

                {marcas && marcas.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Marcas</DropdownMenuLabel>
                    {marcas.map((marca) => (
                      <DropdownMenuItem key={marca.id} asChild>
                        <Link to={`/catalog?marca=${marca.slug}`}>{marca.nome}</Link>
                      </DropdownMenuItem>
                    ))}
                  </>
                )}

                <DropdownMenuSeparator />
                {isAuthenticated ? (
                  <>
                    <DropdownMenuLabel>Conta</DropdownMenuLabel>
                    {userRole === 'ADMIN' ? (
                      <DropdownMenuItem asChild className="text-primary font-medium">
                        <Link to="/admin/dashboard">Painel Admin</Link>
                      </DropdownMenuItem>
                    ) : (
                      <>
                        <DropdownMenuItem asChild><Link to="/profile">Meu Perfil</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link to="/my-orders">Meus Pedidos</Link></DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-red-600">Sair</DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild><Link to="/login">Entrar</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link to="/login">Cadastrar-se</Link></DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};
