# Stage 1: Build
FROM node:22-alpine AS builder

RUN apk update && apk upgrade --no-cache

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# Vite bake env vars no bundle durante o build — devem ser ARG/ENV, não variáveis de runtime
ARG VITE_BACKEND_URL=http://localhost:3000
ARG VITE_WHATSAPP_NUMBER=55
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_WHATSAPP_NUMBER=$VITE_WHATSAPP_NUMBER

RUN npm run build

# Stage 2: Runtime
FROM node:22-alpine

RUN apk update && apk upgrade --no-cache

WORKDIR /app

RUN apk add --no-cache dumb-init
RUN npm install -g serve

COPY --from=builder /app/dist ./dist

EXPOSE 3001

ENTRYPOINT ["dumb-init", "--"]

CMD ["serve", "-s", "dist", "-l", "3001"]
