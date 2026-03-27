import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth, UserRole } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import ProductForm from "./pages/admin/ProductForm";
import Orders from "./pages/admin/Orders";
import Categories from "./pages/admin/Categories";
import Brands from "./pages/admin/Brands";
import Users from "./pages/admin/Users";
import AdminUsers from "./pages/admin/AdminUsers";
import OrderDetail from "./pages/admin/OrderDetail";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from './pages/Profile';
import OrdersForm from './pages/admin/OrdersForm';
import Stores from './pages/admin/Stores';
import Coupons from './pages/admin/Coupons';
import MyOrders from "./pages/myOrders";
import ClientOrderDetail from "./pages/ClientOrderDetail";

// Redireciona para /admin/orders se o cargo não tiver permissão para a rota
const RequireAdminRole = ({ roles }: { roles: UserRole[] }) => {
  const { userRole, isLoading } = useAuth();
  if (isLoading) return null;
  if (!userRole || !roles.includes(userRole)) {
    return <Navigate to="/admin/orders" replace />;
  }
  return <Outlet />;
};

const ADMIN_ROLES: UserRole[] = ['ADMIN', 'ADMIN_GLOBAL'];
const MANAGER_ROLES: UserRole[] = ['ADMIN', 'ADMIN_GLOBAL', 'GERENTE'];
const ALL_STAFF: UserRole[] = ['ADMIN', 'ADMIN_GLOBAL', 'GERENTE', 'VENDEDOR'];

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Routes>
              {/* Rota de Perfil (Protegida) */}
              <Route element={<ProtectedRoute />}>
                <Route path="/profile" element={<Profile />} />
              </Route>

              {/* Rotas da Loja (Públicas) */}
              <Route path="/" element={<Home />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
              <Route path="/my-orders" element={<MyOrders />} />
              <Route path="/my-orders/:id" element={<ClientOrderDetail />} />

              {/* Rotas de Autenticação */}
              <Route path="/login" element={<AuthPage />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Painel Administrativo */}
              <Route path="/admin" element={<AdminLayout />}>
                {/* Disponível para todos os cargos admin */}
                <Route element={<RequireAdminRole roles={ALL_STAFF} />}>
                  <Route path="products" element={<Products />} />
                  <Route path="products/new" element={<ProductForm />} />
                  <Route path="products/edit/:id" element={<ProductForm />} />
                  <Route path="orders" element={<Orders />} />
                  <Route path="orders/new" element={<OrdersForm />} />
                  <Route path="orders/:id" element={<OrderDetail />} />
                </Route>

                {/* Disponível para Gerente e Admin Global */}
                <Route element={<RequireAdminRole roles={MANAGER_ROLES} />}>
                  <Route path="categories" element={<Categories />} />
                  <Route path="brands" element={<Brands />} />
                  <Route path="stores" element={<Stores />} />
                  <Route path="coupons" element={<Coupons />} />
                </Route>

                {/* Disponível apenas para Admin Global */}
                <Route element={<RequireAdminRole roles={ADMIN_ROLES} />}>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="users" element={<Users />} />
                  <Route path="admin-users" element={<AdminUsers />} />
                </Route>
              </Route>

              {/* Rota "Não Encontrado" */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
