# Ecommerce SaaS - Plataforma E-commerce Completa

Projeto fullstack moderno e escalável de e-commerce SaaS com backend Node.js + Express + Prisma e frontend React + TypeScript + Vite. Solução completa para gerenciamento de lojas online, produtos, pedidos e clientes.

## 📋 Visão Geral

Este repositório contém uma plataforma de e-commerce profissional pensada para ser usada como base SaaS. A aplicação oferece funcionalidades completas de um e-commerce moderno com painel administrativo robusto.

**Principais características:**
- ✅ Autenticação de Usuários (Admin) e Clientes com JWT
- ✅ Gerenciamento completo de Produtos, Categorias e Lojas
- ✅ Sistema de Pedidos com rastreamento
- ✅ Carrinho de compras e Checkout
- ✅ Cupons e Descontos
- ✅ Gerenciamento de Clientes e Endereços
- ✅ Painel Administrativo (Dashboard, Produtos, Pedidos, Cupons, etc.)
- ✅ Upload de Imagens de Produtos
- ✅ Envio de Emails (Nodemailer)
- ✅ Banco de Dados relacional com Prisma ORM
- ✅ Validações com Zod
- ✅ UI moderna com Shadcn/ui e Tailwind CSS
- ✅ Componentes Radix UI (acessibilidade nativa)
- ✅ Docker + Docker Compose para containerização


## 🛠️ Stack Tecnológico

### Backend
- **Node.js** (runtime JavaScript)
- **Express.js** (framework web)
- **Prisma** (ORM - Object Relational Mapping)
- **PostgreSQL** / **SQLite** (bancos de dados)
- **bcryptjs** (hash e criptografia de senhas)
- **jsonwebtoken** (JWT para autenticação)
- **multer** (upload de arquivos)
- **nodemailer** (envio de emails)
- **zod** (validação de dados)
- **cors** (middleware CORS)
- **dotenv** (variáveis de ambiente)

### Frontend
- **React 18** (framework UI)
- **TypeScript** (tipagem estática)
- **Vite** (bundler moderno)
- **Tailwind CSS** (CSS utility-first)
- **Shadcn/ui** (componentes prontos)
- **Radix UI** (components primitivos acessíveis)
- **React Query** (state management de dados remotos)
- **React Hook Form** (gerenciamento de formulários)
- **Zod** (validação de schema)
- **Lucide Icons** (ícones)

### DevOps & Infrastructure
- **Docker** (containerização)
- **Docker Compose** (orquestração local)
- **Prisma Migrations** (versionamento de banco de dados)


## 📁 Estrutura do Projeto

```
ecommerce-saas/
├── backend/                          # Servidor Express + Prisma
│   ├── src/
│   │   ├── server.js                # Arquivo principal do servidor
│   │   ├── controllers/              # Lógica de negócio
│   │   │   ├── userController.js    # Gerenciamento de usuários
│   │   │   ├── customerController.js # Gerenciamento de clientes
│   │   │   ├── productController.js  # Gerenciamento de produtos
│   │   │   ├── categoryController.js # Gerenciamento de categorias
│   │   │   ├── orderController.js    # Gerenciamento de pedidos
│   │   │   ├── checkoutController.js # Lógica de checkout
│   │   │   ├── cupomController.js    # Gerenciamento de cupons
│   │   │   ├── lojaController.js     # Gerenciamento de lojas
│   │   │   ├── dashboardController.js# Dados do dashboard
│   │   │   └── passwordResetController.js # Reset de senha
│   │   ├── routes/                   # Definição de rotas
│   │   │   ├── authRoutes.js        # Autenticação
│   │   │   ├── userRoutes.js        # Rotas de usuário
│   │   │   ├── customerRoutes.js    # Rotas de cliente
│   │   │   ├── productRoutes.js     # Rotas de produto
│   │   │   ├── categoryRoutes.js    # Rotas de categoria
│   │   │   ├── orderRoutes.js       # Rotas de pedido
│   │   │   ├── checkoutRoutes.js    # Rotas de checkout
│   │   │   ├── cupomRoutes.js       # Rotas de cupom
│   │   │   ├── lojaRoutes.js        # Rotas de loja
│   │   │   ├── shopRoutes.js        # Rotas da loja (público)
│   │   │   ├── dashboardRoutes.js   # Rotas do dashboard
│   │   │   └── userManagementRoutes.js # Gerenciamento de usuários
│   │   ├── middleware/               # Middlewares
│   │   │   ├── authMiddleware.js    # Validação de JWT
│   │   │   └── validate.js          # Validação de dados
│   │   ├── services/
│   │   │   └── emailService.js      # Serviço de envio de emails
│   │   ├── validators/
│   │   │   └── userValidators.js    # Schemas Zod para usuários
│   │   └── uploads/                  # Imagens enviadas pelos usuários
│   ├── prisma/
│   │   ├── schema.prisma            # Definição do banco de dados
│   │   ├── migrations/              # Histórico de migrações
│   │   └── migration_lock.toml      # Lock de migrações
│   └── package.json                  # Dependências e scripts
│
├── frontend/                         # App React + Vite + TypeScript
│   ├── src/
│   │   ├── main.tsx                 # Ponto de entrada
│   │   ├── App.tsx                  # Componente raiz
│   │   ├── index.css                # Estilos globais
│   │   ├── components/
│   │   │   ├── Header.tsx           # Cabeçalho/Navbar
│   │   │   ├── Footer.tsx           # Rodapé
│   │   │   ├── ProductCard.tsx      # Card de produto
│   │   │   ├── ProtectedRoute.tsx   # Rotas protegidas
│   │   │   ├── admin/               # Componentes admin
│   │   │   │   ├── AdminLayout.tsx
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Products.tsx
│   │   │   │   ├── ProductForm.tsx
│   │   │   │   ├── Categories.tsx
│   │   │   │   ├── Orders.tsx
│   │   │   │   ├── OrderDetail.tsx
│   │   │   │   ├── Stores.tsx
│   │   │   │   ├── Users.tsx
│   │   │   │   ├── AdminUsers.tsx
│   │   │   │   ├── Coupons.tsx
│   │   │   │   └── OrdersForm.tsx
│   │   │   └── ui/                  # Componentes Shadcn/ui
│   │   ├── pages/
│   │   │   ├── Home.tsx             # Página inicial
│   │   │   ├── Catalog.tsx          # Catalogo de produtos
│   │   │   ├── ProductDetail.tsx    # Detalhe do produto
│   │   │   ├── Cart.tsx             # Carrinho de compras
│   │   │   ├── Checkout.tsx         # Checkout
│   │   │   ├── OrderConfirmation.tsx # Confirmação de pedido
│   │   │   ├── AuthPage.tsx         # Login de cliente
│   │   │   ├── Profile.tsx          # Perfil do cliente
│   │   │   ├── myOrders.tsx         # Meus pedidos
│   │   │   ├── ClientOrderDetail.tsx # Detalhe do pedido (cliente)
│   │   │   ├── ForgotPassword.tsx   # Esqueceu senha
│   │   │   ├── ResetPassword.tsx    # Reset de senha
│   │   │   ├── NotFound.tsx         # 404
│   │   │   └── admin/               # Páginas admin (usam componentes)
│   │   ├── context/                 # Context API (estado global)
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── services/                # Serviços (API calls, etc)
│   │   ├── lib/                     # Utilitários e helpers
│   │   └── assets/                  # Imagens, fontes, etc
│   ├── public/                       # Arquivos estáticos
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── components.json              # Config Shadcn/ui
│
├── docker-compose.yml               # Configuração Docker
├── package.json                     # Scripts da raiz do projeto
└── README.md                        # Este arquivo
```


## 🗄️ Modelos de Dados (Schema Prisma)

### Usuário (Admin)
- `id`, `nome`, `email`, `senhaHash`, `funcao`, `ativo`, `criadoEm`, `resetToken`, `resetTokenExpiry`

### Cliente
- `id`, `nome`, `sobrenome`, `email`, `cpf`, `telefone`, `dataNascimento`, `genero`, `senhaHash`, `criadoEm`, `resetToken`, `resetTokenExpiry`
- **Relações:** `pedidos`, `enderecos`

### Endereco
- `id`, `rua`, `numero`, `complemento`, `bairro`, `cidade`, `estado`, `cep`, `principal`
- **Relações:** `cliente` (FK)

### Categoria
- `id`, `nome`, `slug`
- **Relações:** `produtos`, `subcategorias`

### Subcategoria
- `id`, `nome`, `slug`, `categoriaId`
- **Relações:** `categoria` (FK), `produtos`

### Marca
- `id`, `nome`, `slug`
- **Relações:** `produtos`

### Produto
- `id`, `nome`, `descricao`, `preco`, `precoCompra`, `estoque`, `ativo`, `showInCatalog`, `imageUrl`, `isFeatured`, `criadoEm`, `volume`, `unidade`
- **Relações:** `categoria` (FK), `subcategoria` (FK, opcional), `marca` (FK, opcional), `itens` (ItemPedido)

### Loja
- `id`, `nome`, `endereco`, `telefone`, `ativo`, `criadoEm`
- **Relações:** `pedidos`

### Cupom
- `id`, `codigo`, `tipo` (PERCENTUAL/VALOR), `valor`, `minimo`, `usosMaximos`, `usosAtuais`, `ativo`, `dataExpiracao`, `criadoEm`
- **Relações:** `pedidos`

### Pedido
- `id`, `valor_total`, `desconto`, `status`, `criadoEm`, `cliente_nome`, `codigoRastreio`, `observacao`
- **Relações:** `cliente` (FK), `loja` (FK), `cupom` (FK), `itens` (ItemPedido)

### ItemPedido
- `id`, `quantidade`, `precoNoMomentoDaCompra`
- **Relações:** `pedido` (FK), `produto` (FK)


## 📌 API Endpoints Principais

### Autenticação
- `POST /api/auth/login` - Login de usuário/admin
- `POST /api/auth/register` - Registrar novo cliente
- `POST /api/password-reset/request` - Solicitar reset de senha
- `POST /api/password-reset/reset` - Resetar senha

### Usuários (Admin)
- `GET /api/users` - Listar usuários
- `POST /api/users` - Criar usuário
- `PUT /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Deletar usuário

### Clientes
- `GET /api/customers` - Listar clientes
- `GET /api/customers/:id` - Detalhe do cliente
- `PUT /api/customers/:id` - Atualizar dados do cliente
- `POST /api/customers/:id/addresses` - Adicionar endereço
- `PUT /api/customers/:id/addresses/:addressId` - Atualizar endereço
- `DELETE /api/customers/:id/addresses/:addressId` - Deletar endereço

### Produtos
- `GET /api/products` - Listar produtos (públicos)
- `GET /api/products/:id` - Detalhe do produto
- `POST /api/products` - Criar produto (admin)
- `PUT /api/products/:id` - Atualizar produto (admin)
- `DELETE /api/products/:id` - Deletar produto (admin)
- `POST /api/products/:id/image` - Upload de imagem

### Categorias
- `GET /api/categories` - Listar categorias
- `POST /api/categories` - Criar categoria (admin)
- `PUT /api/categories/:id` - Atualizar categoria (admin)
- `DELETE /api/categories/:id` - Deletar categoria (admin)

### Pedidos
- `GET /api/orders` - Listar pedidos (admin)
- `GET /api/orders/:id` - Detalhe do pedido
- `PUT /api/orders/:id` - Atualizar pedido
- `POST /api/orders/:id/tracking` - Atualizar rastreamento

### Checkout
- `POST /api/checkout` - Processar checkout

### Cupons
- `GET /api/coupons` - Listar cupons
- `POST /api/coupons` - Criar cupom (admin)
- `PUT /api/coupons/:id` - Atualizar cupom (admin)
- `DELETE /api/coupons/:id` - Deletar cupom (admin)
- `POST /api/coupons/validate` - Validar cupom

### Lojas
- `GET /api/lojas` - Listar lojas
- `POST /api/lojas` - Criar loja (admin)
- `PUT /api/lojas/:id` - Atualizar loja (admin)
- `DELETE /api/lojas/:id` - Deletar loja (admin)

### Shop (Público)
- `GET /api/shop/products` - Produtos disponíveis
- `GET /api/shop/featured` - Produtos em destaque
- `GET /api/shop/categories` - Categorias com produtos

### Dashboard
- `GET /api/dashboard/stats` - Estatísticas gerais
- `GET /api/dashboard/sales` - Dados de vendas
- `GET /api/dashboard/orders` - Status de pedidos


## 🔧 Pré-requisitos

- **Node.js** >= 18.x
- **npm** ou **pnpm** (npm recomendado)
- **Git**
- **PostgreSQL** 12+ (para produção) ou **SQLite** (para desenvolvimento)
- **Docker** e **Docker Compose** (opcional, para ambiente containerizado)


## 🌍 Variáveis de Ambiente

### Backend - `backend/.env`

```bash
# Banco de Dados
DATABASE_URL="postgresql://username:password@localhost:5432/ecommerce_db"
# OU para SQLite (desenvolvimento):
# DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="sua-chave-secreta-muito-longa-e-aleatoria-min-32-chars"

# Servidor
PORT=3000
NODE_ENV="development"

# Email (Nodemailer)
EMAIL_HOST="smtp.seudominio.com"
EMAIL_PORT=587
EMAIL_USER="seu-email@seudominio.com"
EMAIL_PASSWORD="sua-senha-email"
EMAIL_FROM="noreply@seudominio.com"

# Opcional: Configurações adicionais
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=5242880  # 5MB em bytes
```

### Frontend - `frontend/.env.local`

```bash
# API Backend
VITE_API_URL="http://localhost:3000/api"

# Ambiente
VITE_ENV="development"

# Opcional: Outras variáveis
VITE_APP_TITLE="Ecommerce SaaS"
```

**⚠️ Dica:** Crie um arquivo `.env.example` com as chaves sem valores para referência dos desenvolvedores.


## ⚙️ Instalação e Configuração

### 1. Clonar o repositório

```bash
git clone https://github.com/seu-usuario/ecommerce-saas.git
cd ecommerce-saas
```

### 2. Instalar dependências

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd ../frontend
npm install
```

### 3. Configurar Variáveis de Ambiente

**Backend:**
```bash
# Volte para backend se saiu
cd ../backend
cp .env.example .env
# Edite o arquivo .env com suas credenciais
```

**Frontend:**
```bash
cd ../frontend
cp .env.example .env.local
# Edite o arquivo .env.local com a URL da API
```

### 4. Inicializar o Banco de Dados

```bash
# No diretório backend
cd backend

# Gerar o Prisma Client
npx prisma generate

# Criar e executar migrations
npx prisma migrate dev --name init

# (Opcional) Popular com dados de exemplo
npx prisma db seed  # Se houver arquivo seed.js
```

**Para SQLite (desenvolvimento rápido):**
```bash
# No arquivo .env, altere para:
DATABASE_URL="file:./dev.db"

# Depois execute:
npx prisma migrate dev --name init
```


## 🚀 Executando em Desenvolvimento

### Opção 1: Sem Docker (Recomendado para Dev)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Servidor rodando em http://localhost:3000
# Health check: http://localhost:3000/api/health
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Aplicação rodando em http://localhost:5173
```

### Opção 2: Com Docker Compose

```bash
# Na raiz do projeto
docker-compose up -d

# Verificar logs
docker-compose logs -f

# Parar serviços
docker-compose down

# Parar e remover volumes (cuidado!)
docker-compose down -v
```

O seu ambiente estará pronto:
- **Frontend:** http://localhost:3000 (ou conforme configurado)
- **Backend API:** http://localhost:3000/api
- **PostgreSQL:** localhost:5432


## 🏗️ Build para Produção

### Backend

```bash
cd backend

# Instalar dependências de produção
npm install --only=production

# Executar migrations no banco de produção
npx prisma migrate deploy

# Iniciar servidor
npm start
# Ou usar PM2 para gerenciamento de processo
pm2 start src/server.js --name "ecommerce-api"
```

### Frontend

```bash
cd frontend

# Build otimizado
npm run build

# Verificar preview do build
npm run preview
```

Após o build, a pasta `dist/` conterá os arquivos estáticos. Você pode servir com:
- **Nginx** (recomendado)
- **Apache**
- **Node.js** (via express.static)
- **Vercel**, **Netlify** ou outro Jamstack hosting


## 🔐 Autenticação e Autorização

### JWT (JSON Web Tokens)

Tokens são enviados no header:
```bash
Authorization: Bearer <token>
```

**Tipos de usuários:**
- `ADMIN_GLOBAL` - Acesso total ao sistema
- Outros roles podem ser criados conforme necessidade

### Fluxo de Autenticação

1. Usuário/Cliente faz login com email e senha
2. Servidor valida credenciais e retorna JWT
3. Cliente armazena token (localStorage/sessionStorage/cookie)
4. Cliente envia token em requisições autenticadas
5. Middleware valida token e autoriza acesso

### Reset de Senha

1. Cliente solicita reset via email
2. Sistema gera token único com expiração (ex: 1 hora)
3. Email com link de reset é enviado
4. Cliente acessa link e define nova senha
5. Token é invalidado após uso


## 📦 Gerenciamento de Produtos

### Upload de Imagens

- Use o endpoint `POST /api/products/:id/image`
- Formato: `multipart/form-data` com arquivo
- Extensões suportadas: `.jpg`, `.jpeg`, `.png`, `.webp`
- Tamanho máximo: Configurável (padrão 5MB)
- Imagens são armazenadas em `backend/uploads/`
- URL pública: `http://localhost:3000/uploads/<filename>`

### Campos de Produto

- `nome` - Nome do produto (obrigatório)
- `descricao` - Descrição detalhada
- `preco` - Preço de venda
- `precoCompra` - Preço de compra (opcional, para cálculo de margem)
- `estoque` - Quantidade em estoque
- `categoria` - Categoria associada (FK, obrigatório)
- `subcategoria` - Subcategoria associada (FK, opcional)
- `marca` - Marca associada (FK, opcional)
- `volume` - Volume/quantidade numérica (ex: `100`)
- `unidade` - Unidade de medida (`ml`, `g`, `oz`, `un`, `kg`, `L`)
- `imageUrl` - URL da imagem
- `isFeatured` - Marcar como em destaque
- `showInCatalog` - Mostrar no catálogo
- `ativo` - Ativar/desativar produto


## 🏷️ Categorias, Subcategorias e Marcas

### Visão geral

O sistema de organização de produtos é composto por três níveis independentes que podem ser combinados livremente:

| Nível | Obrigatório no Produto | Exemplo |
|---|---|---|
| Categoria | Sim | Perfumaria, Maquiagem |
| Subcategoria | Não | Árabes, Importados, Base |
| Marca | Não | Natura, Truss, O Boticário |

---

### Categoria

Agrupamento principal. Todo produto pertence a exatamente uma categoria.

- Slug gerado automaticamente ao criar (ex: "Cuidados com a Pele" → `cuidados-com-a-pele`)
- Categorias existentes podem ser renomeadas — o slug é atualizado junto
- Não é possível deletar uma categoria que tenha produtos associados
- Gerenciado em **Admin → Categorias**

---

### Subcategoria

Divisão dentro de uma categoria. Vínculo opcional no produto.

- Cada subcategoria pertence a uma categoria pai
- O slug é gerado automaticamente
- No formulário de produto, o campo de subcategoria **só aparece** quando a categoria selecionada possui subcategorias cadastradas
- Para gerenciar: em **Admin → Categorias**, clique na seta `▶` da categoria para expandir e adicionar/remover subcategorias

**Exemplos:**
```
Perfumaria
├── Árabes
├── Importados
└── Nacionais

Maquiagem
├── Base
├── Batom
└── Sombra
```

---

### Marca

Entidade independente de categoria. Um produto de qualquer categoria pode pertencer a qualquer marca.

- Slug gerado automaticamente (ex: "O Boticário" → `o-boticario`)
- Marcas aparecem no **Header** como dropdown de navegação rápida
- Clicar numa marca no Header abre o catálogo já filtrado por ela
- Marcas podem ser renomeadas com edição inline na página de gerenciamento
- Gerenciado em **Admin → Marcas**

---

### Volume e Unidade

Campos opcionais para descrever a quantidade do produto:

- `volume` — número inteiro (ex: `100`)
- `unidade` — seleção entre `ml`, `g`, `oz`, `un`, `kg`, `L`

Exemplo de exibição: `100 ml`, `300 g`, `1 L`

---

### Fluxo de cadastro de produto

```
Produto: "Perfume Árabe Oud"
  ├── Categoria:    Perfumaria         (obrigatório)
  ├── Subcategoria: Árabes             (opcional, aparece após escolher Perfumaria)
  ├── Marca:        —                  (opcional)
  ├── Volume:       100 ml
  └── Preço:        R$ 89,90

Produto: "Shampoo Equilibrium"
  ├── Categoria:    Produtos para Cabelo
  ├── Subcategoria: Shampoo
  ├── Marca:        Truss
  ├── Volume:       300 ml
  └── Preço:        R$ 59,90
```

---

### Filtros no Catálogo

A página `/catalog` exibe botões de filtro dinâmicos com base nas categorias e marcas cadastradas.

| Filtro | Comportamento |
|---|---|
| Categoria | Filtra produtos por categoria; reseta filtro de marca |
| Marca | Filtra produtos por marca; reseta filtro de categoria |
| Ordenação | Combina com qualquer filtro ativo |

**URLs compartilháveis** — ao clicar numa marca no Header, o cliente é levado para:
```
/catalog?marca=truss
/catalog?marca=natura
```

---

### API — Endpoints relacionados

```
GET    /api/shop/categories                          — lista categorias com subcategorias
POST   /api/shop/categories                          — criar categoria (admin)
PUT    /api/shop/categories/:id                      — renomear categoria (admin)
DELETE /api/shop/categories/:id                      — deletar categoria (admin)

POST   /api/shop/categories/:categoriaId/subcategorias — criar subcategoria (admin)
DELETE /api/shop/subcategorias/:id                   — deletar subcategoria (admin)

GET    /api/shop/marcas                              — lista todas as marcas (público)
POST   /api/shop/marcas                              — criar marca (admin)
PUT    /api/shop/marcas/:id                          — atualizar marca (admin)
DELETE /api/shop/marcas/:id                          — deletar marca (admin)

GET    /api/shop/products?marcaId=<id>               — filtrar produtos por marca
GET    /api/shop/products?categoryId=<id>            — filtrar produtos por categoria
GET    /api/shop/products?subcategoriaId=<id>        — filtrar por subcategoria
```

---

## 🛒 Fluxo de Compra

1. **Navegação** - Cliente explora catálogo
2. **Detalhes** - Cliente visualiza detalhes do produto
3. **Carrinho** - Cliente adiciona produtos ao carrinho
4. **Login** - Se não autenticado, fazer login
5. **Endereço** - Cliente informa/seleciona endereço de entrega
6. **Cupom** - Aplicar cupom de desconto (opcional)
7. **Confirmação** - Revisar pedido e confirmar
8. **Processamento** - Sistema processa o pedido
9. **Rastreamento** - Cliente pode rastrear pedido em "Meus Pedidos"


## 🎯 Painel Administrativo

O admin pode acessar funcionalidades completas:

- **Dashboard** - Visão geral com estatísticas
- **Produtos** - CRUD completo, upload de imagens, categoria, subcategoria, marca, volume e destaque
- **Categorias** - Criar/renomear categorias e gerenciar subcategorias (expansível)
- **Marcas** - Criar, editar e deletar marcas com slug automático
- **Pedidos** - Listar, visualizar detalhes, atualizar status, código de rastreamento
- **Clientes** - Listar clientes, visualizar histórico de pedidos
- **Cupons** - Criar, editar, desativar cupons promocionais
- **Lojas** - Gerenciar múltiplas lojas
- **Usuários Admin** - Criar e gerenciar outros administradores
- **Logs** - Registros de todas logs de administradores


## 📧 Sistema de Email

O projeto usa **Nodemailer** para envio de emails:

- **Password Reset** - Email com link para resetar senha
- **Order Confirmation** - Confirmação de pedido (em desenvolvimento)
- **Notificações** - Alertas customizáveis (em desenvolvimento)

Configurar SMTP no `.env` do backend (veja seção Variáveis de Ambiente).


## ✅ Validações

O projeto usa **Zod** para validação de dados:

- Validação de entrada em controllers
- Schemas definem estrutura esperada de dados
- Mensagens de erro descritivas
- Tipagem TypeScript integrada (frontend)

Exemplo de validação:
```javascript
// Backend
const schema = z.object({
  email: z.string().email("Email inválido"),
  senha: z.string().min(8, "Senha deve ter no mínimo 8 caracteres")
});

// Frontend (Zod + React Hook Form)
const form = useForm({
  resolver: zodResolver(schema)
});
```