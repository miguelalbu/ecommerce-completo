const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function registrarLog({ usuarioId, usuarioNome, acao, descricao, entidade, entidadeId }) {
  try {
    await prisma.log.create({
      data: {
        usuarioId,
        usuarioNome,
        acao,
        descricao,
        entidade,
        entidadeId: entidadeId || null,
      },
    });
  } catch (err) {
    console.error('Erro ao registrar log:', err);
  }
}

module.exports = { registrarLog };
