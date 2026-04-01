require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const { PrismaClient } = require('@prisma/client');
const swaggerSpec = require('./config/swagger');

const prisma = new PrismaClient();

const userRoutes = require('./routes/userRoutes');
const shopRoutes = require('./routes/shopRoutes');
const customerRoutes = require('./routes/customerRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userManagementeRoutes = require('./routes/userManagementRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');
const authRoutes = require('./routes/authRoutes');
const lojaRoutes = require('./routes/lojaRoutes');
const cupomRoutes = require('./routes/cupomRoutes');
const gastosRoutes = require('./routes/gastosRoutes');
const boletosRoutes = require('./routes/boletosRoutes');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Swagger UI (apenas em desenvolvimento)
if (process.env.NODE_ENV !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      persistAuthorization: true, // Mantém o token JWT ao recarregar a página
    },
  }));
}

app.get('/', (req, res) => {
  res.json({ message: 'E-commerce API is up and running! 🚀 Visit /api-docs for API documentation' });
});

app.get('/api/health', async (req, res) => {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      uptime: process.uptime(),
      db: 'ok',
      latency_ms: Date.now() - start,
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(503).json({
      status: 'error',
      uptime: process.uptime(),
      db: 'unreachable',
      latency_ms: Date.now() - start,
      timestamp: new Date().toISOString(),
    });
  }
});

app.use('/api/users', userRoutes); // API Users route
app.use('/api/shop', shopRoutes); // API Shop route
app.use('/api/customers', customerRoutes); // API Customers route
app.use('/api/dashboard', dashboardRoutes); // API Dashboard route
app.use('/api/orders', orderRoutes); // API Orders route
app.use('/api/user-management', userManagementeRoutes); // API User Management route
app.use('/api/checkout', checkoutRoutes); // API Checkout route
app.use('/api/auth', authRoutes);         // API Auth (forgot/reset password)
app.use('/api/lojas', lojaRoutes);        // API Lojas route
app.use('/api/cupons', cupomRoutes);      // API Cupons route
app.use('/api/gastos', gastosRoutes);     // API Gastos route
app.use('/api/boletos', boletosRoutes);   // API Boletos route

app.listen(PORT, () => {
  console.log(`🚀 Server running on port http://localhost:${PORT}`);
});