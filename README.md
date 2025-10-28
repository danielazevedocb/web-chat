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
- **Banco de Dados**: MongoDB Atlas
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

- Node.js 18+
- MongoDB Atlas (conta gratuita disponível)
- Conta OpenAI (para API)
- Conta Cloudinary ou AWS S3 (para upload de arquivos)
- Docker e Docker Compose (opcional)

## 🚀 Instalação Rápida

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd web-chat
```

### 2. Configurar o Backend

```bash
cd backend
npm install

# Copiar arquivo de ambiente
cp .env.example .env

# Editar o .env com suas credenciais
# MongoDB Atlas, OpenAI API Key, Cloudinary, etc.
```

### 3. Configurar o Banco de Dados

```bash
# Gerar o cliente Prisma
npx prisma generate

# Executar migrations
npx prisma db push

# Popular banco com dados iniciais
npm run seed
```

### 4. Configurar o Frontend

```bash
cd frontend
npm install

# Copiar arquivo de ambiente
cp .env.example .env

# Editar o .env com a URL do backend
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 5. Executar o Sistema

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

**Terminal 3 - Redis (opcional):**
```bash
docker-compose up redis
```

## 🌐 Acessos

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api

## 👤 Credenciais Padrão

Após executar o seed:

- **Admin**
  - Email: `admin@webchat.com`
  - Senha: `admin123`

- **Gerente**
  - Email: `gerente@webchat.com`
  - Senha: `gerente123`

- **Agente**
  - Email: `agente@webchat.com`
  - Senha: `agente123`

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
npm run seed           # Popular banco de dados
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

