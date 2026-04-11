.PHONY: help up down build rebuild clean logs logs-backend logs-frontend logs-db restart restart-backend restart-frontend db-migrate db-reset backend frontend db bash-backend bash-frontend bash-db test lint format ps stop create-env

# =============== CONFIGURAÇÃO ===============
DOCKER_COMPOSE := docker-compose
BACKEND := ecommerce_backend
FRONTEND := ecommerce_frontend
DB := ecommerce_postgres
PROJECT_NAME := ecommerce-saas

# =============== CORES PARA OUTPUT ===============
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

# =============== HELP ===============
help:
	@echo "$(BLUE)╔══════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(BLUE)║       E-Commerce SaaS - Docker Makefile Commands            ║$(NC)"
	@echo "$(BLUE)╚══════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(GREEN)📦 INICIALIZAÇÃO E PARADA:$(NC)"
	@echo "  make up                 - Inicia todos os containers (PostgreSQL, Backend, Frontend)"
	@echo "  make down               - Para todos os containers"
	@echo "  make restart            - Reinicia todos os containers"
	@echo ""
	@echo "$(GREEN)🏗️  BUILD E CRIAÇÃO:$(NC)"
	@echo "  make build              - Constrói todas as imagens Docker"
	@echo "  make rebuild            - Remove e reconstrói todas as imagens"
	@echo "  make create-env         - Cria arquivo .env a partir do .env.example"
	@echo ""
	@echo "$(GREEN)🎯 SERVIÇOS INDIVIDUAIS:$(NC)"
	@echo "  make backend            - Inicia apenas o Backend"
	@echo "  make frontend           - Inicia apenas o Frontend"
	@echo "  make db                 - Inicia apenas o PostgreSQL"
	@echo "  make restart-backend    - Reinicia o Backend"
	@echo "  make restart-frontend   - Reinicia o Frontend"
	@echo ""
	@echo "$(GREEN)📊 LOGS E MONITORAMENTO:$(NC)"
	@echo "  make logs               - Exibe logs de todos os containers"
	@echo "  make logs-backend       - Exibe logs do Backend"
	@echo "  make logs-frontend      - Exibe logs do Frontend"
	@echo "  make logs-db            - Exibe logs do PostgreSQL"
	@echo "  make ps                 - Lista os containers em execução"
	@echo ""
	@echo "$(GREEN)🗄️  BANCO DE DADOS:$(NC)"
	@echo "  make db-migrate         - Executa migrations do Prisma"
	@echo "  make db-reset           - Reseta o banco de dados (cuidado!)"
	@echo "  make bash-db            - Acessa o shell do PostgreSQL"
	@echo ""
	@echo "$(GREEN)💻 ACESSO AOS CONTAINERS:$(NC)"
	@echo "  make bash-backend       - Acessa o shell do Backend"
	@echo "  make bash-frontend      - Acessa o shell do Frontend"
	@echo ""
	@echo "$(GREEN)🧹 LIMPEZA:$(NC)"
	@echo "  make clean              - Remove volumes e containers ($(RED)⚠️  DADOS SERÃO PERDIDOS$(NC))"
	@echo "  make clean-all          - Remove tudo (images, volumes, containers)"
	@echo ""
	@echo "$(GREEN)✅ UTILITÁRIOS:$(NC)"
	@echo "  make test               - Executa testes do Backend"
	@echo "  make lint               - Executa linters"
	@echo "  make format             - Formata código"
	@echo "  make stop               - Para todos os containers (igual a 'down')"
	@echo ""

# =============== INICIALIZAÇÃO ===============
## Iniciar todos os containers
up:
	@echo "$(GREEN)🚀 Iniciando todos os containers...$(NC)"
	@if [ ! -f .env ]; then \
		echo "$(YELLOW)⚠️  Arquivo .env não encontrado. Criando a partir de .env.example...$(NC)"; \
		cp .env.example .env; \
	fi
	$(DOCKER_COMPOSE) up -d
	@echo "$(GREEN)✨ Todos os containers iniciados!$(NC)"
	@echo ""
	@echo "$(BLUE)URLs de acesso:$(NC)"
	@echo "  Backend:    http://localhost:3000"
	@echo "  Frontend:   http://localhost:3001"
	@echo "  API Docs:   http://localhost:3000/api-docs"
	@echo "  Banco:      localhost:5432"

## Parar todos os containers
down:
	@echo "$(YELLOW)⏹️  Parando todos os containers...$(NC)"
	$(DOCKER_COMPOSE) down
	@echo "$(GREEN)✓ Containers parados$(NC)"

## Reiniciar todos os containers
restart: down up
	@echo "$(GREEN)✓ Containers reiniciados$(NC)"

# =============== BUILD ===============
## Construir todas as imagens
build:
	@echo "$(BLUE)🔨 Construindo todas as imagens Docker...$(NC)"
	$(DOCKER_COMPOSE) build
	@echo "$(GREEN)✓ Build concluído$(NC)"

## Reconstruir todas as imagens (sem cache)
rebuild: clean build
	@echo "$(GREEN)✓ Reconstrução concluída$(NC)"

# =============== SERVIÇOS INDIVIDUAIS ===============
## Iniciar apenas Backend
backend:
	@echo "$(GREEN)🚀 Iniciando Backend...$(NC)"
	$(DOCKER_COMPOSE) up -d postgres-db backend
	@echo "$(GREEN)✓ Backend iniciado em http://localhost:3000$(NC)"

## Iniciar apenas Frontend
frontend:
	@echo "$(GREEN)🚀 Iniciando Frontend...$(NC)"
	$(DOCKER_COMPOSE) up -d frontend
	@echo "$(GREEN)✓ Frontend iniciado em http://localhost:3001$(NC)"

## Iniciar apenas Banco de Dados
db:
	@echo "$(GREEN)🚀 Iniciando Banco de Dados...$(NC)"
	$(DOCKER_COMPOSE) up -d postgres-db
	@echo "$(GREEN)✓ Banco de Dados iniciado em localhost:5432$(NC)"

## Reiniciar Backend
restart-backend:
	@echo "$(YELLOW)♻️  Reiniciando Backend...$(NC)"
	$(DOCKER_COMPOSE) restart backend
	@echo "$(GREEN)✓ Backend reiniciado$(NC)"

## Reiniciar Frontend
restart-frontend:
	@echo "$(YELLOW)♻️  Reiniciando Frontend...$(NC)"
	$(DOCKER_COMPOSE) restart frontend
	@echo "$(GREEN)✓ Frontend reiniciado$(NC)"

# =============== LOGS ===============
## Ver logs de todos os containers
logs:
	$(DOCKER_COMPOSE) logs -f

## Ver logs do Backend
logs-backend:
	$(DOCKER_COMPOSE) logs -f backend

## Ver logs do Frontend
logs-frontend:
	$(DOCKER_COMPOSE) logs -f frontend

## Ver logs do PostgreSQL
logs-db:
	$(DOCKER_COMPOSE) logs -f postgres-db

# =============== BANCO DE DADOS ===============
## Executar migrations do Prisma
db-migrate:
	@echo "$(BLUE)🔄 Executando migrations...$(NC)"
	$(DOCKER_COMPOSE) exec backend npx prisma migrate deploy
	@echo "$(GREEN)✓ Migrations aplicadas$(NC)"

## Resetar banco de dados
db-reset:
	@echo "$(RED)⚠️  CUIDADO: Você está prestes a resetterar o banco de dados!$(NC)"
	@echo "$(RED)Todos os dados serão perdidos.$(NC)"
	@read -p "Digite '$(PROJECT_NAME)' para confirmar: " confirm; \
	if [ "$$confirm" = "$(PROJECT_NAME)" ]; then \
		echo "$(YELLOW)Resetando banco de dados...$(NC)"; \
		$(DOCKER_COMPOSE) exec backend npx prisma migrate reset --force; \
		echo "$(GREEN)✓ Banco de dados resetado$(NC)"; \
	else \
		echo "$(YELLOW)Operação cancelada$(NC)"; \
	fi

# =============== ACESSO AOS CONTAINERS ===============
## Acessar shell do Backend
bash-backend:
	$(DOCKER_COMPOSE) exec backend sh

## Acessar shell do Frontend
bash-frontend:
	$(DOCKER_COMPOSE) exec frontend sh

## Acessar PostgreSQL via psql
bash-db:
	$(DOCKER_COMPOSE) exec postgres-db psql -U $${POSTGRES_USER} -d $${POSTGRES_DB}

# =============== STATUS ===============
## Listar containers em execução
ps:
	@echo "$(BLUE)📦 Containers em execução:$(NC)"
	$(DOCKER_COMPOSE) ps

## Parar todos os containers (alias para down)
stop: down

# =============== LIMPEZA ===============
## Remover volumes e containers (dados serão perdidos)
clean:
	@echo "$(RED)🧹 Removendo containers e volumes...$(NC)"
	$(DOCKER_COMPOSE) down -v
	@echo "$(GREEN)✓ Limpeza concluída$(NC)"

## Remover tudo (containers, images, volumes)
clean-all: clean
	@echo "$(RED)🧹 Removendo todas as imagens...$(NC)"
	docker rmi $$(docker images --filter "reference=$(PROJECT_NAME)*" -q) 2>/dev/null || true
	@echo "$(GREEN)✓ Limpeza completa concluída$(NC)"

# =============== ENVIRONMENT ===============
## Criar arquivo .env a partir de .env.example
create-env:
	@echo "$(BLUE)📝 Criando arquivo .env...$(NC)"
	@if [ -f .env ]; then \
		echo "$(YELLOW)⚠️  Arquivo .env já existe$(NC)"; \
		read -p "Deseja sobrescrever? (s/n): " overwrite; \
		if [ "$$overwrite" = "s" ]; then \
			cp .env.example .env; \
			echo "$(GREEN)✓ Arquivo .env criado$(NC)"; \
		else \
			echo "$(YELLOW)Operação cancelada$(NC)"; \
		fi; \
	else \
		cp .env.example .env; \
		echo "$(GREEN)✓ Arquivo .env criado$(NC)"; \
	fi

# =============== DESENVOLVIMENTO ===============
## Executar testes do Backend
test:
	@echo "$(BLUE)🧪 Executando testes...$(NC)"
	$(DOCKER_COMPOSE) exec backend npm test

## Executar linters
lint:
	@echo "$(BLUE)🔍 Executando linters...$(NC)"
	$(DOCKER_COMPOSE) exec backend npm run lint || echo "$(YELLOW)Nenhum lint configurado$(NC)"

## Formatar código
format:
	@echo "$(BLUE)✨ Formatando código...$(NC)"
	$(DOCKER_COMPOSE) exec backend npm run format || echo "$(YELLOW)Nenhum formatter configurado$(NC)"

# =============== PADRÃO ===============
.DEFAULT_GOAL := help
