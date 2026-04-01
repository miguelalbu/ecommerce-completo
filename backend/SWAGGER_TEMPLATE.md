# Guia de Swagger - Padrões do Projeto

## Regras Gerais

- O `swagger.js` define `security: [{ BearerAuth: [] }]` **globalmente** — todas as rotas aparecem com cadeado por padrão.
- Rotas **públicas** (sem middleware `protect`) devem sobrescrever com `security: []`.
- Rotas com auth **opcional** (ex: checkout com `getOptionalUser`) devem usar `security: [{ BearerAuth: [] }, {}]`.
- Use sempre `responses` com pelo menos `'200'`/`'201'`, `'400'`, `'401'`, `'403'`, `'404'` onde aplicável.

---

## Tags do Projeto

| Tag | Rota base |
|---|---|
| `Users` | `/api/users` |
| `Authentication` | `/api/auth` |
| `Customers` | `/api/customers` |
| `Shop - Categorias` | `/api/shop/categories` |
| `Shop - Marcas` | `/api/shop/marcas` |
| `Shop - Produtos` | `/api/shop/products` |
| `Orders` | `/api/orders` |
| `Checkout` | `/api/checkout` |
| `Dashboard` | `/api/dashboard` |
| `User Management` | `/api/user-management` |
| `Lojas` | `/api/lojas` |
| `Cupons` | `/api/cupons` |
| `Gastos` | `/api/gastos` |
| `Boletos` | `/api/boletos` |

---

## Padrões por Tipo de Rota

### 1. POST público (login, registro, forgot-password)

```javascript
/**
 * @swagger
 * /api/customers/login:
 *   post:
 *     summary: Login de cliente
 *     description: Autentica o cliente e retorna um token JWT
 *     tags:
 *       - Customers
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: cliente@email.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: senha123
 *     responses:
 *       '200':
 *         description: Login bem-sucedido, retorna token JWT
 *       '400':
 *         description: Dados inválidos
 *       '401':
 *         description: Email ou senha incorretos
 */
router.post('/login', validate(loginCustomerSchema), customerController.loginCustomer);
```

---

### 2. GET público (listagens abertas)

```javascript
/**
 * @swagger
 * /api/shop/products:
 *   get:
 *     summary: Listar todos os produtos
 *     tags:
 *       - Shop - Produtos
 *     security: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         example: 20
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por categoria
 *     responses:
 *       '200':
 *         description: Lista de produtos
 */
router.get('/products', productController.getAllProducts);
```

---

### 3. GET protegido com parâmetro de URL (ADMIN)

```javascript
/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Obter detalhes do pedido
 *     description: Retorna um pedido pelo ID. ADMIN vê qualquer pedido; CUSTOMER vê apenas os seus
 *     tags:
 *       - Orders
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: clxyz1234abcd
 *     responses:
 *       '200':
 *         description: Detalhes do pedido
 *       '401':
 *         description: Não autenticado
 *       '403':
 *         description: Sem permissão para ver este pedido
 *       '404':
 *         description: Pedido não encontrado
 */
router.get('/:id', protect, orderController.getOrderById);
```

---

### 4. POST protegido com body JSON (ADMIN)

```javascript
/**
 * @swagger
 * /api/cupons:
 *   post:
 *     summary: Criar novo cupom
 *     tags:
 *       - Cupons
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - discount
 *               - discount_type
 *             properties:
 *               code:
 *                 type: string
 *                 example: PROMO10
 *               discount:
 *                 type: number
 *                 example: 10
 *               discount_type:
 *                 type: string
 *                 enum: [percentage, fixed]
 *                 example: percentage
 *     responses:
 *       '201':
 *         description: Cupom criado com sucesso
 *       '400':
 *         description: Dados inválidos
 *       '401':
 *         description: Não autenticado
 *       '403':
 *         description: Sem permissão (requer ADMIN)
 */
router.post('/', protect, authorize('ADMIN'), cupomController.createCupom);
```

---

### 5. PUT protegido com parâmetro de URL e body

```javascript
/**
 * @swagger
 * /api/gastos/{id}:
 *   put:
 *     summary: Atualizar gasto
 *     tags:
 *       - Gastos
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: clxyz1234abcd
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               descricao:
 *                 type: string
 *               valor:
 *                 type: number
 *               categoria:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Gasto atualizado com sucesso
 *       '404':
 *         description: Gasto não encontrado
 *       '401':
 *         description: Não autenticado
 *       '403':
 *         description: Sem permissão (requer ADMIN)
 */
router.put('/:id', gastosController.updateGasto);
```

---

### 6. DELETE protegido

```javascript
/**
 * @swagger
 * /api/boletos/{id}:
 *   delete:
 *     summary: Deletar boleto
 *     tags:
 *       - Boletos
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: clxyz1234abcd
 *     responses:
 *       '200':
 *         description: Boleto deletado com sucesso
 *       '404':
 *         description: Boleto não encontrado
 *       '401':
 *         description: Não autenticado
 *       '403':
 *         description: Sem permissão (requer ADMIN)
 */
router.delete('/:id', boletosController.deleteBoleto);
```

---

### 7. Upload de arquivo (multipart/form-data)

```javascript
/**
 * @swagger
 * /api/shop/products:
 *   post:
 *     summary: Criar produto
 *     tags:
 *       - Shop - Produtos
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 example: Camiseta Polo
 *               price:
 *                 type: number
 *                 example: 89.90
 *               stock:
 *                 type: integer
 *                 example: 50
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Imagem do produto
 *     responses:
 *       '201':
 *         description: Produto criado com sucesso
 *       '400':
 *         description: Dados inválidos
 *       '401':
 *         description: Não autenticado
 *       '403':
 *         description: Sem permissão (requer ADMIN)
 */
router.post('/products', protect, authorize('ADMIN'), upload.single('image'), productController.createProduct);
```

---

### 8. Auth opcional (CUSTOMER ou anônimo)

```javascript
/**
 * @swagger
 * /api/checkout:
 *   post:
 *     summary: Processar pedido (checkout)
 *     description: Pode ser acessado sem token (convidado) ou com token JWT de CUSTOMER
 *     tags:
 *       - Checkout
 *     security:
 *       - BearerAuth: []
 *       - {}
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cartItems
 *               - isPickup
 *             properties:
 *               cartItems:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *               isPickup:
 *                 type: boolean
 *                 example: false
 *               address:
 *                 type: object
 *                 description: Obrigatório quando isPickup=false
 *                 properties:
 *                   rua:
 *                     type: string
 *                   numero:
 *                     type: string
 *                   bairro:
 *                     type: string
 *                   cidade:
 *                     type: string
 *                   estado:
 *                     type: string
 *                     example: PE
 *                   cep:
 *                     type: string
 *                     example: "50000000"
 *     responses:
 *       '201':
 *         description: Pedido criado com sucesso
 *       '400':
 *         description: Dados inválidos
 *       '401':
 *         description: Token inválido (quando fornecido)
 */
router.post('/', getOptionalUser, validate(checkoutSchema), checkoutController.placeOrder);
```

---

## Roles do Projeto

| Role | Acesso |
|---|---|
| `ADMIN_GLOBAL` | Acesso total |
| `ADMIN` | Gerencia loja, produtos, pedidos, usuários |
| `GERENTE` | Visualiza dashboard e logs |
| `CUSTOMER` | Área do cliente (perfil, endereços, pedidos próprios) |
| Sem token | Apenas rotas públicas e checkout como convidado |

---

## Testando Localmente

1. Inicie o servidor em modo dev: `npm run dev`
2. Acesse: `http://localhost:3000/api-docs`
3. Clique em **Authorize** e informe: `Bearer <seu_token_jwt>`
4. Use **Try it out** para testar os endpoints
5. Rotas sem cadeado são públicas — não precisam de token

> **Atenção:** O Swagger UI só é servido quando `NODE_ENV !== 'production'`.
