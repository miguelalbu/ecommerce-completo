import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Package, ShoppingBag, LogOut, Menu, X, Store, Tag, Users, Ticket, ShieldCheck, Boxes, ScrollText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const AdminLayout = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { userRole } = useAuth();

  type AdminRole = 'ADMIN' | 'ADMIN_GLOBAL' | 'GERENTE' | 'VENDEDOR';

  const ALL_MENU_ITEMS = [
    { path: "/admin/dashboard",   label: "Dashboard",       icon: LayoutDashboard, roles: ['ADMIN', 'ADMIN_GLOBAL'] },
    { path: "/admin/products",    label: "Produtos",        icon: Package,         roles: ['ADMIN', 'ADMIN_GLOBAL', 'GERENTE', 'VENDEDOR'] },
    { path: "/admin/orders",      label: "Pedidos",         icon: ShoppingBag,     roles: ['ADMIN', 'ADMIN_GLOBAL', 'GERENTE', 'VENDEDOR'] },
    { path: "/admin/categories",  label: "Categorias",      icon: Tag,             roles: ['ADMIN', 'ADMIN_GLOBAL', 'GERENTE'] },
    { path: "/admin/brands",      label: "Marcas",          icon: Boxes,           roles: ['ADMIN', 'ADMIN_GLOBAL', 'GERENTE'] },
    { path: "/admin/stores",      label: "Lojas",           icon: Store,           roles: ['ADMIN', 'ADMIN_GLOBAL', 'GERENTE'] },
    { path: "/admin/coupons",     label: "Cupons",          icon: Ticket,          roles: ['ADMIN', 'ADMIN_GLOBAL', 'GERENTE'] },
    { path: "/admin/users",       label: "Usuários",        icon: Users,           roles: ['ADMIN', 'ADMIN_GLOBAL'] },
    { path: "/admin/admin-users", label: "Administradores", icon: ShieldCheck,     roles: ['ADMIN', 'ADMIN_GLOBAL'] },
    { path: "/admin/logs",        label: "Logs",            icon: ScrollText,      roles: ['ADMIN', 'ADMIN_GLOBAL', 'GERENTE'] },
  ];

  const menuItems = ALL_MENU_ITEMS.filter(
    (item) => userRole && (item.roles as AdminRole[]).includes(userRole as AdminRole)
  );

  // Função auxiliar para renderizar o conteúdo da Sidebar
  // Isso evita repetir código para a versão Mobile e Desktop
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="mb-8 p-6 pb-0">
        <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
                <span className="text-xl font-bold">Luar Cosméticos</span>
            </div>
            {/* Botão de fechar (Aparece só no mobile dentro do menu) */}
            <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden" 
                onClick={() => setIsSidebarOpen(false)}
            >
                <X className="h-5 w-5" />
            </Button>
        </div>
        <p className="text-sm text-secondary-foreground/70">Painel Admin</p>
      </div>

      <nav className="flex-1 space-y-2 px-4">
        {menuItems.map((item) => (
          <Link 
            key={item.path} 
            to={item.path}
            onClick={() => setIsSidebarOpen(false)} // Fecha o menu ao clicar no link (mobile)
          >
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start mb-1",
                location.pathname === item.path &&
                  "bg-secondary-foreground/10 text-secondary-foreground font-semibold"
              )}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <Button variant="ghost" className="w-full justify-start" asChild>
            <Link to="/">
            <LogOut className="mr-2 h-4 w-4" />
            Sair
            </Link>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      
      {/* --- 1. Header Mobile (Só aparece em telas pequenas) --- */}
      <div className="md:hidden bg-secondary text-secondary-foreground p-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <span className="font-bold text-lg">Luar Cosméticos</span>
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSidebarOpen(true)}
            className="hover:bg-secondary-foreground/10"
        >
            <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* --- 2. Sidebar Desktop (Fixa, escondida no mobile) --- */}
      <aside className="hidden md:flex w-64 bg-secondary text-secondary-foreground flex-col fixed inset-y-0 z-50">
        <SidebarContent />
      </aside>

      {/* --- 3. Sidebar Mobile (Drawer deslizante) --- */}
      {/* Fundo escuro (Overlay) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Menu deslizante */}
      <aside className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-secondary text-secondary-foreground transition-transform duration-300 ease-in-out md:hidden",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent />
      </aside>

      {/* --- 4. Conteúdo Principal --- */}
      {/* md:ml-64 empurra o conteúdo para a direita no desktop para não ficar embaixo do menu fixo */}
      <main className="flex-1 p-4 md:p-8 overflow-auto md:ml-64 transition-all duration-300">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;