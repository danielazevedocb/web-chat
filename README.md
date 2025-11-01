# 🚀 Sistema de Atendimento Multi-Empresa com IA

Sistema completo de atendimento ao cliente com suporte multi-empresa, integração com IA (OpenAI), chat em tempo real, sistema de tickets e agendamentos.

## ✨ Funcionalidades Principais

- 💬 **Chat em Tempo Real** com WebSockets (Socket.io)
- 🤖 **IA Integrada** (OpenAI GPT-4) para respostas automatizadas
- 🏢 **Multi-Empresa** com isolamento completo de dados
- 🎫 **Sistema de Tickets** para gerenciamento de atendimentos
- 📅 **Agendamentos** com integração de calendário
- 👥 **Gerenciamento de Usuários** com diferentes níveis de permissão
- 📊 **Dashboard Administrativo** com métricas e relatórios
- 📁 **Upload de Arquivos** com Cloudinary/AWS S3
- 🔐 **Autenticação JWT** com NextAuth.js

## 🛠️ Stack Tecnológica

### Backend
- **Framework**: NestJS
- **Linguagem**: TypeScript
- **ORM**: Prisma
- **Banco de Dados**: PostgreSQL
- **Real-time**: Socket.io
- **IA**: OpenAI API
- **Storage**: Cloudinary

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Styling**: Tailwind CSS
- **Estado**: React Query + Context API
- **Formulários**: React Hook Form + Zod
- **Real-time**: Socket.io Client
- **Autenticação**: NextAuth.js

### Infraestrutura
- **Containerização**: Docker & Docker Compose
- **Cache**: Redis
- **CI/CD**: GitHub Actions (opcional)

## 📋 Pré-requisitos

- Docker e Docker Compose (recomendado)
- Node.js 18+ (se rodar localmente)
- PostgreSQL (se rodar localmente)
- Redis (se rodar localmente)
- Conta OpenAI (opcional, para API)
- Conta Cloudinary (opcional, para upload de arquivos)

## 🚀 Instalação Rápida

### Opção 1: Executar com Docker (Recomendado)

```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd web-chat

# 2. Configurar variáveis de ambiente (opcional)
# Copie backend/.env.example para backend/.env e configure conforme necessário

# 3. Iniciar todos os serviços
docker-compose up -d

# 4. Configurar banco de dados
docker-compose exec backend npm run prisma:generate
docker-compose exec backend npm run prisma:push
docker-compose exec backend npm run prisma:seed

# 5. Acessar a aplicação
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
# Swagger: http://localhost:3001/api/docs
```

### Opção 2: Executar Localmente

#### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd web-chat
```

#### 2. Configurar o Backend

```bash
cd backend
npm install

# Copiar arquivo de ambiente
cp .env.example .env

# Editar o .env com suas credenciais
# PostgreSQL, OpenAI API Key, Cloudinary, etc.
```

#### 3. Configurar o Banco de Dados

```bash
# Gerar o cliente Prisma
npm run prisma:generate

# Executar migrations
npm run prisma:push

# Popular banco com dados iniciais
npm run prisma:seed
```

#### 4. Configurar o Frontend

```bash
cd ../frontend
npm install

# Copiar arquivo de ambiente
cp .env.example .env.local

# Editar o .env.local com a URL do backend
NEXT_PUBLIC_API_URL=http://localhost:3001
```

#### 5. Executar o Sistema

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - Redis (opcional, via Docker):**
```bash
docker-compose up redis
```

## 🌐 Acessos

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation (Swagger)**: http://localhost:3001/api/docs
- **Health Check**: http://localhost:3001/api/health

## 👤 Credenciais Padrão

Após executar o seed:

- **Super Administrador**
  - Email: `admin@sistema.com`
  - Senha: `admin123`

- **Administrador da Empresa**
  - Email: `admin@empresaexemplo.com`
  - Senha: `admin123`

- **Agentes**
  - Email: `agente1@empresaexemplo.com`
  - Senha: `admin123`
  - Email: `agente2@empresaexemplo.com`
  - Senha: `admin123`

## 📖 Documentação Adicional

- [Guia de Execução](./EXECUTAR_PROJETO.md)
- [Configuração do Cloudinary](./CONFIGURACAO_CLOUDINARY.md)
- [Documentação Docker + Redis](./README_DOCKER_REDIS.md)
- [Setup de Instalação](./SETUP_INSTRUCTIONS.md)

## 📁 Estrutura do Projeto

```
web-chat/
├── backend/              # API NestJS
│   ├── src/
│   │   ├── modules/      # Módulos da aplicação
│   │   ├── auth/         # Autenticação JWT
│   │   ├── chat/         # Chat WebSocket
│   │   ├── ia/           # Integração OpenAI
│   │   └── ...
│   ├── prisma/           # Schema do banco de dados
│   └── ...
├── frontend/             # Aplicação Next.js
│   ├── app/              # App Router
│   ├── components/       # Componentes React
│   ├── contexts/         # Context API
│   ├── lib/              # Utilitários
│   └── ...
├── shared/               # Tipos compartilhados
├── docker-compose.yml    # Configuração Docker
└── README.md            # Este arquivo
```

## 🔧 Comandos Úteis

### Backend
```bash
npm run start:dev      # Desenvolvimento
npm run build          # Build para produção
npm run start:prod     # Executar produção
npm run prisma:generate # Gerar Prisma Client
npm run prisma:push    # Aplicar schema ao banco
npm run prisma:seed    # Popular banco de dados
npm run prisma:studio  # Abrir Prisma Studio
```

### Docker
```bash
docker-compose up -d              # Iniciar todos os serviços
docker-compose down               # Parar todos os serviços
docker-compose logs -f backend    # Ver logs do backend
docker-compose logs -f frontend   # Ver logs do frontend
docker-compose restart backend    # Reiniciar backend
```

### Frontend
```bash
npm run dev            # Desenvolvimento
npm run build          # Build para produção
npm run start          # Executar produção
```

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Desenvolvido por

Sistema de Atendimento Multi-Empresa com IA

