const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getLogs = async (req, res) => {
  const { usuarioId, entidade, page = '1', limit = '50' } = req.query;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const where = {
    ...(usuarioId && { usuarioId }),
    ...(entidade && { entidade }),
  };

  try {
    const [logs, total] = await Promise.all([
      prisma.log.findMany({
        where,
        orderBy: { criadoEm: 'desc' },
        skip,
        take: limitNum,
        include: { usuario: { select: { id: true, nome: true, funcao: true } } },
      }),
      prisma.log.count({ where }),
    ]);

    res.json({ logs, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
  } catch (error) {
    console.error('Erro ao buscar logs:', error);
    res.status(500).json({ message: 'Erro ao buscar logs.' });
  }
};

exports.getUsuariosComLogs = async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      where: { logs: { some: {} } },
      select: { id: true, nome: true, funcao: true },
      orderBy: { nome: 'asc' },
    });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar usuários.' });
  }
};
