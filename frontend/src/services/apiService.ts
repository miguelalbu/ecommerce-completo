// /src/services/apiService.ts

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
const BASE_URL = `${BACKEND_URL}/api`;

// --- HELPER DE RESPOSTA ---
const handleResponse = async (response: Response) => {
  const data = await response.json();
  if (!response.ok) {
    const message = data.message || `Erro ${response.status}`;
    throw new Error(message);
  }
  return data;
};

// --- AUTENTICAÇÃO ---

export const adminLogin = async (email, password) => {
  const response = await fetch(`${BASE_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(response);
};

export const customerLogin = async (email, password) => {
  const response = await fetch(`${BASE_URL}/customers/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(response);
};

type RegisterData = {
  name: string;
  sobrenome: string;
  email: string;
  password: string;
  cpf: string;
  telefone: string;
  dataNascimento: string;
  genero: string;
};

// Registro de clientes (Customer)
export const customerRegister = async (data: RegisterData) => {
  const response = await fetch(`${BASE_URL}/customers/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const forgotPassword = async (email: string) => {
  const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return handleResponse(response);
};

export const resetPassword = async (token: string, type: string, password: string) => {
  const response = await fetch(`${BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, type, password }),
  });
  return handleResponse(response);
};

// --- DASHBOARD ---

export const getDashboardSummary = async (token: string) => {
  const response = await fetch(`${BASE_URL}/dashboard/summary`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};

// --- PRODUTOS E CATEGORIAS ---

export const getProducts = async (
  searchTerm?: string,
  categoryId?: string,
  sortBy?: string,
  featuredOnly?: boolean,
  includeHidden?: boolean,
  marcaId?: string,
  subcategoriaId?: string
) => {
  const params = new URLSearchParams();
  if (searchTerm) params.append('search', searchTerm);
  if (categoryId && categoryId !== 'all') params.append('categoryId', categoryId);
  if (sortBy) params.append('sortBy', sortBy);
  if (featuredOnly) params.append('featuredOnly', 'true');
  if (includeHidden) params.append('includeHidden', 'true');
  if (marcaId && marcaId !== 'all') params.append('marcaId', marcaId);
  if (subcategoriaId && subcategoriaId !== 'all') params.append('subcategoriaId', subcategoriaId);

  const response = await fetch(`${BASE_URL}/shop/products?${params.toString()}`);
  return handleResponse(response);
};

export const getProductById = async (id: string) => {
  const response = await fetch(`${BASE_URL}/shop/products/${id}`);
  return handleResponse(response);
};

// Cria produto com FormData (imagem + texto)
export const createProduct = async (productData: FormData, token: string) => {
  const response = await fetch(`${BASE_URL}/shop/products`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: productData,
  });
  return handleResponse(response);
};

export const updateProduct = async (id: string, productData: FormData, token: string) => {
  const response = await fetch(`${BASE_URL}/shop/products/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: productData,
  });
  return handleResponse(response);
};

export const deleteProduct = async (id: string, token: string) => {
  const response = await fetch(`${BASE_URL}/shop/products/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const data = await response.json();
    const message = data.message || `Erro ${response.status}`;
    throw new Error(message);
  }
  return true;
};

// --- LOJAS ---

export const getLojas = async () => {
  const response = await fetch(`${BASE_URL}/lojas`);
  return handleResponse(response);
};

export const createLoja = async (data: { nome: string; endereco?: string; telefone?: string }, token: string) => {
  const response = await fetch(`${BASE_URL}/lojas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const updateLoja = async (id: string, data: { nome?: string; endereco?: string; telefone?: string; ativo?: boolean }, token: string) => {
  const response = await fetch(`${BASE_URL}/lojas/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteLoja = async (id: string, token: string) => {
  const response = await fetch(`${BASE_URL}/lojas/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Erro ao deletar loja');
  }
  return true;
};

export const getCategories = async () => {
  const response = await fetch(`${BASE_URL}/shop/categories`);
  return handleResponse(response);
};

export const createCategory = async (name: string, token: string) => {
  const response = await fetch(`${BASE_URL}/shop/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });
  return handleResponse(response);
};

export const deleteCategory = async (id: string, token: string) => {
  const response = await fetch(`${BASE_URL}/shop/categories/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Erro ao deletar');
  }
  return true;
};

// --- PEDIDOS (ORDERS) ---

export const getMyOrders = async (token: string) => {
  // Nota: Seu backend precisa ter uma rota que filtre pelo ID do usuário do token
  // Geralmente é a mesma rota GET /orders, mas o backend filtra se não for admin.
  // Ou uma rota específica GET /orders/my-orders
  const response = await fetch(`${BASE_URL}/orders/my-orders`, { 
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return handleResponse(response);
};

export const getOrders = async (token: string) => {
  const response = await fetch(`${BASE_URL}/orders`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};

export const getOrderById = async (id: string, token: string) => {
  const response = await fetch(`${BASE_URL}/orders/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return handleResponse(response);
};

// [NOVO] Criação de pedido via Admin
export const createOrder = async (orderData: any, token: string) => {
  const response = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(orderData),
  });
  return handleResponse(response);
};

// [NOVO] Atualização de pedido via Admin
export const updateOrder = async (id: string, orderData: any, token: string) => {
  const response = await fetch(`${BASE_URL}/orders/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(orderData),
  });
  return handleResponse(response);
};

// Checkout Público/Cliente (Geralmente cria o pedido pelo lado do cliente)
export const placeOrder = async (checkoutData: any, token?: string | null) => {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}/checkout`, {
    method: 'POST',
    headers,
    body: JSON.stringify(checkoutData),
  });
  return handleResponse(response);
};

// --- USUÁRIOS E CLIENTES (ADMIN MANAGEMENT) ---

export const createAdminUser = async (
  data: { name: string; email: string; password: string; funcao: string },
  token: string
) => {
  const response = await fetch(`${BASE_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

// Retorna usuários administrativos/staff
export const getUsers = async (token: string) => {
  const response = await fetch(`${BASE_URL}/user-management`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return handleResponse(response);
};

// [NOVO] Retorna lista de CLIENTES para o dropdown de vendas
export const getCustomers = async (token: string) => {
  // Assumindo que existe uma rota GET para listar clientes, similar à de delete
  const response = await fetch(`${BASE_URL}/user-management/customers`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return handleResponse(response);
};

export const deleteUser = async (id: string, token: string) => {
  const response = await fetch(`${BASE_URL}/user-management/users/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Erro ao deletar');
  }
  return true;
};

export const deleteCustomer = async (id: string, token: string) => {
  const response = await fetch(`${BASE_URL}/user-management/customers/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Erro ao deletar');
  }
  return true;
};

// --- DADOS DO PERFIL DO CLIENTE ---

export const getProfile = async (token: string) => {
  const response = await fetch(`${BASE_URL}/customers/profile`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return handleResponse(response);
};

export const getAddresses = async (token: string) => {
  const response = await fetch(`${BASE_URL}/customers/addresses`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return handleResponse(response);
};

export const updateProfile = async (data: any, token: string) => {
  const response = await fetch(`${BASE_URL}/customers/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteAddress = async (id: string, token: string) => {
  const response = await fetch(`${BASE_URL}/customers/addresses/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Erro ao remover endereço.');
  }
  return true;
};

export const setPrincipalAddress = async (id: string, token: string) => {
  const response = await fetch(`${BASE_URL}/customers/addresses/${id}/principal`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return handleResponse(response);
};

// --- CUPONS ---

export const getCupons = async (token: string) => {
  const response = await fetch(`${BASE_URL}/cupons`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return handleResponse(response);
};

export const createCupom = async (data: any, token: string) => {
  const response = await fetch(`${BASE_URL}/cupons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const updateCupom = async (id: string, data: any, token: string) => {
  const response = await fetch(`${BASE_URL}/cupons/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteCupom = async (id: string, token: string) => {
  const response = await fetch(`${BASE_URL}/cupons/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Erro ao deletar cupom');
  }
  return true;
};

export const validateCupom = async (codigo: string, total: number) => {
  const response = await fetch(`${BASE_URL}/cupons/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codigo, total }),
  });
  return handleResponse(response);
};

export const addAddress = async (addressData: any, token: string) => {
  const response = await fetch(`${BASE_URL}/customers/addresses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(addressData),
  });
  return handleResponse(response);
};

// --- MARCAS ---

export const getMarcas = async () => {
  const response = await fetch(`${BASE_URL}/shop/marcas`);
  return handleResponse(response);
};

export const createMarca = async (nome: string, token: string) => {
  const response = await fetch(`${BASE_URL}/shop/marcas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ nome }),
  });
  return handleResponse(response);
};

export const updateMarca = async (id: string, nome: string, token: string) => {
  const response = await fetch(`${BASE_URL}/shop/marcas/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ nome }),
  });
  return handleResponse(response);
};

export const deleteMarca = async (id: string, token: string) => {
  const response = await fetch(`${BASE_URL}/shop/marcas/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Erro ao deletar marca');
  }
  return true;
};

// --- SUBCATEGORIAS ---

export const createSubcategoria = async (categoriaId: string, nome: string, token: string) => {
  const response = await fetch(`${BASE_URL}/shop/categories/${categoriaId}/subcategorias`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ nome }),
  });
  return handleResponse(response);
};

export const deleteSubcategoria = async (id: string, token: string) => {
  const response = await fetch(`${BASE_URL}/shop/subcategorias/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Erro ao deletar subcategoria');
  }
  return true;
};

export const updateCategory = async (id: string, name: string, token: string) => {
  const response = await fetch(`${BASE_URL}/shop/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ name }),
  });
  return handleResponse(response);
};