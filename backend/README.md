# Sistema de Atendimento Multi-Empresa com IA

Sistema completo de atendimento ao cliente com suporte multi-empresa, integração com IA (OpenAI), chat em tempo real, sistema de tickets e agendamentos.

## 🚀 Tecnologias

- **Backend**: NestJS + Prisma + MongoDB Atlas
- **Frontend**: Next.js + TypeScript + Tailwind CSS
- **Automação**: n8n
- **IA**: OpenAI (GPT-4)
- **Real-time**: Socket.io
- **Storage**: AWS S3 / Cloudinary

## 📋 Pré-requisitos

- Node.js 18+
- MongoDB Atlas (conta gratuita)
- Conta OpenAI (para API)
- Conta AWS ou Cloudinary (para upload de arquivos)

## 🛠️ Configuração do Backend

### 1. Instalar dependências

```bash
cd atendimento-backend
npm install
```

### 2. Configurar MongoDB Atlas

1. Acesse [MongoDB Atlas](https://cloud.mongodb.com/)
2. Crie uma conta gratuita
3. Crie um novo cluster (M0 - Free)
4. Configure o acesso de rede (0.0.0.0/0 para desenvolvimento)
5. Crie um usuário de banco de dados
6. Copie a string de conexão

### 3. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Database
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/atendimento?retryWrites=true&w=majority"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="24h"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"
JWT_REFRESH_EXPIRES_IN="7d"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"

# App Configuration
NODE_ENV="development"
PORT=3001
CORS_ORIGIN="http://localhost:3000"
```

### 4. Configurar Prisma

```bash
# Gerar cliente Prisma
npm run prisma:generate

# Aplicar schema ao banco
npm run prisma:push

# Popular banco com dados iniciais
npm run prisma:seed
```

### 5. Executar o servidor

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

O servidor estará rodando em `http://localhost:3001`

## 📊 Dados Iniciais

Após executar o seed, você terá:

- **Super Admin**: `admin@sistema.com` (senha: `admin123`)
- **Admin da Empresa**: `admin@empresaexemplo.com` (senha: `admin123`)
- **Agentes**: `agente1@empresaexemplo.com` e `agente2@empresaexemplo.com` (senha: `admin123`)
- **Empresa de exemplo** com configuração de IA
- **Clientes, conversas e agendamentos** de exemplo

## 🔗 Endpoints Principais

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `POST /api/auth/refresh` - Renovar token

### Empresas
- `GET /api/empresas` - Listar empresas
- `POST /api/empresas` - Criar empresa
- `PUT /api/empresas/:id` - Atualizar empresa

### Usuários
- `GET /api/usuarios` - Listar usuários
- `POST /api/usuarios` - Criar usuário
- `PUT /api/usuarios/:id` - Atualizar usuário

### Chat
- `GET /api/chat/conversas` - Listar conversas
- `POST /api/chat/mensagens` - Enviar mensagem
- `GET /api/chat/conversas/:id/mensagens` - Histórico de mensagens

### Tickets
- `GET /api/tickets` - Listar tickets
- `POST /api/tickets` - Criar ticket
- `PUT /api/tickets/:id` - Atualizar ticket

### Agendamentos
- `GET /api/agendamentos` - Listar agendamentos
- `POST /api/agendamentos` - Criar agendamento
- `PUT /api/agendamentos/:id` - Atualizar agendamento

### IA
- `POST /api/ia/responder` - Gerar resposta da IA
- `PUT /api/ia/configuracao` - Atualizar configuração da IA

### Arquivos
- `POST /api/arquivos/upload` - Upload de arquivo
- `GET /api/arquivos/:id` - Download de arquivo

### Dashboard
- `GET /api/dashboard/metricas` - Métricas do dashboard

## 🔌 WebSocket (Socket.io)

O sistema usa Socket.io para comunicação em tempo real:

### Eventos do Cliente
- `join_conversa` - Entrar em uma conversa
- `leave_conversa` - Sair de uma conversa
- `send_message` - Enviar mensagem
- `typing_start` - Começar a digitar
- `typing_stop` - Parar de digitar
- `mark_read` - Marcar mensagem como lida

### Eventos do Servidor
- `message_received` - Nova mensagem recebida
- `message_sent` - Mensagem enviada com sucesso
- `user_typing` - Usuário está digitando
- `user_stopped_typing` - Usuário parou de digitar
- `conversa_updated` - Conversa atualizada
- `user_online` - Usuário ficou online
- `user_offline` - Usuário ficou offline

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run start:dev          # Servidor em modo desenvolvimento
npm run start:debug        # Servidor em modo debug

# Build e Produção
npm run build              # Build do projeto
npm run start:prod         # Executar em produção

# Prisma
npm run prisma:generate    # Gerar cliente Prisma
npm run prisma:push        # Aplicar schema ao banco
npm run prisma:migrate     # Executar migrações
npm run prisma:studio      # Abrir Prisma Studio
npm run prisma:seed        # Popular banco com dados iniciais

# Testes
npm run test               # Executar testes
npm run test:watch         # Testes em modo watch
npm run test:cov           # Testes com coverage
npm run test:e2e           # Testes end-to-end

# Qualidade de código
npm run lint               # Executar ESLint
npm run format             # Formatar código com Prettier
```

## 📁 Estrutura do Projeto

```
atendimento-backend/
├── prisma/
│   ├── schema.prisma      # Schema do banco de dados
│   └── seed.ts           # Dados iniciais
├── src/
│   ├── modules/          # Módulos do NestJS
│   │   ├── auth/         # Autenticação e autorização
│   │   ├── empresas/     # Gestão de empresas
│   │   ├── usuarios/     # Gestão de usuários
│   │   ├── clientes/     # Gestão de clientes
│   │   ├── chat/         # Chat em tempo real
│   │   ├── tickets/      # Sistema de tickets
│   │   ├── agendamentos/ # Sistema de agendamentos
│   │   ├── ia/           # Integração com OpenAI
│   │   ├── arquivos/     # Upload de arquivos
│   │   ├── integracoes/  # Webhooks e integrações
│   │   └── dashboard/     # Métricas e relatórios
│   ├── common/           # Utilitários compartilhados
│   ├── config/           # Configurações
│   └── main.ts           # Arquivo principal
├── .env.example          # Exemplo de variáveis de ambiente
├── package.json          # Dependências e scripts
└── tsconfig.json         # Configuração do TypeScript
```

## 🔐 Segurança

- JWT com refresh tokens
- Rate limiting por IP e empresa
- Validação de entrada com class-validator
- Sanitização de dados
- CORS configurado
- Helmet.js para headers de segurança
- Criptografia de senhas com bcrypt

## 📈 Performance

- Redis para cache (opcional)
- Paginação em todas as listas
- Lazy loading de mensagens
- Compressão de respostas
- Índices otimizados no MongoDB

## 🚀 Deploy

### Opções de Deploy

1. **Railway** (Recomendado)
2. **Render**
3. **AWS ECS**
4. **DigitalOcean App Platform**

### Variáveis de Ambiente para Produção

Certifique-se de configurar todas as variáveis necessárias no ambiente de produção, especialmente:
- `DATABASE_URL`
- `JWT_SECRET` e `JWT_REFRESH_SECRET`
- `OPENAI_API_KEY`
- `CORS_ORIGIN`

## 📞 Suporte

Para dúvidas ou problemas, consulte a documentação ou entre em contato com a equipe de desenvolvimento.

## 📄 Licença

Este projeto é privado e proprietário.
