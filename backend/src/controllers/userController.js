const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

exports.createUser = async (req, res) => {
  const { name, email, password, funcao } = req.body;

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.usuario.create({
      data: {
        nome: name,
        email: email,
        senhaHash: passwordHash,
        funcao: funcao || 'VENDEDOR',
      },
    });

    const { senhaHash: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);

  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'This email is already in use.' });
    }
    res.status(500).json({ message: 'Error creating user.', error });
  }
};

// Função para autenticar um usuário (Login)
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Encontrar o usuário pelo email
    const user = await prisma.usuario.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // 2. Comparar a senha enviada com a senha criptografada no banco
    const isPasswordCorrect = await bcrypt.compare(password, user.senhaHash);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Senha inválida.' });
    }

    // 3. Se tudo estiver correto, criar e assinar um Token JWT
    const token = jwt.sign(
      { id: user.id, role: user.funcao },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    // 4. Enviar o token de volta para o cliente
    res.json({ message: 'Login bem-sucedido!', token });

  } catch (error) {
    res.status(500).json({ message: 'Erro ao fazer login.', error });
  }
};