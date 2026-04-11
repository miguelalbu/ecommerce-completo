# Stage 1: Build
FROM node:22-alpine AS builder

RUN apk update && apk upgrade --no-cache

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

# Gera o Prisma Client dentro do builder
COPY prisma ./prisma
RUN npx prisma generate

# Copia apenas o source (não o .env nem uploads)
COPY src ./src

# Stage 2: Runtime (imagem final menor)
FROM node:22-alpine

RUN apk update && apk upgrade --no-cache

WORKDIR /app

RUN apk add --no-cache dumb-init

# Copia apenas o necessário do builder (inclui o prisma client gerado)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src
COPY package.json ./

# Diretório de uploads (persistido via volume no compose)
RUN mkdir -p uploads

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]

# Aplica o schema no banco e inicia o servidor
CMD ["sh", "-c", "npx prisma db push --skip-generate && node src/server.js"]
