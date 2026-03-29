import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tags,
  Users,
  LogOut,
  X,
  ShieldCheck,
  TrendingDown,
  FileText,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  className?: string;
  onNavigate?: () => void; // Função para fechar o menu no mobile ao clicar
}

const AdminSidebar = ({ className = "", onNavigate }: SidebarProps) => {
  const location = useLocation();
  const { logout, isAdminGlobal } = useAuth();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Produtos', path: '/admin/products', icon: Package },
    { name: 'Pedidos', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Categorias', path: '/admin/categories', icon: Tags },
    { name: 'Gastos', path: '/admin/gastos', icon: TrendingDown },
    { name: 'Boletos', path: '/admin/boletos', icon: FileText },
    { name: 'Usuários', path: '/admin/users', icon: Users },
    ...(isAdminGlobal
      ? [{ name: 'Administradores', path: '/admin/admin-users', icon: ShieldCheck }]
      : []),
  ];

  return (
    <div className={`flex flex-col h-full bg-[#4A5D4F] text-white ${className}`}>
      {/* Cabeçalho do Menu */}
      <div className="p-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Luar Cosméticos</h1>
          <p className="text-xs text-gray-300">Painel Admin</p>
        </div>
        {/* Botão X só aparece se tiver a função onNavigate (modo mobile) */}
        {onNavigate && (
          <button onClick={onNavigate} className="md:hidden text-white hover:bg-white/10 p-1 rounded">
            <X size={24} />
          </button>
        )}
      </div>

      {/* Links de Navegação */}
      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavigate} // Fecha o menu ao clicar
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 
                ${active 
                  ? 'bg-white/20 text-white font-medium' 
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Rodapé do Menu (Logout) */}
      <div className="p-4 border-t border-white/10">
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-200 hover:bg-white/10 hover:text-red-100 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;