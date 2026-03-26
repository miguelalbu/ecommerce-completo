import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export type AdminRole = 'ADMIN' | 'ADMIN_GLOBAL' | 'GERENTE' | 'VENDEDOR';
export type UserRole = AdminRole | 'CUSTOMER';

interface AuthContextType {
  token: string | null;
  userRole: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdminGlobal: boolean;
  login: (token: string) => void;
  logout: () => void;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true); 
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        setUserRole(payload.role); // Extrai 'ADMIN' ou 'CUSTOMER'
      } catch (e) {
        console.error("Token salvo é inválido:", e);
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    try {
      const payload = JSON.parse(atob(newToken.split('.')[1]));
      setUserRole(payload.role);
    } catch (e) {
      console.error("Token recebido no login é inválido:", e);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUserRole(null);
    navigate('/');
  };


  const value = {
    token,
    userRole,
    isAuthenticated: !!token,
    isLoading,
    isAdminGlobal: userRole === 'ADMIN' || userRole === 'ADMIN_GLOBAL',
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};