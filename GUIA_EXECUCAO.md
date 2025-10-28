# 🚀 Sistema de Atendimento Multi-Empresa - Guia de Execução

Este guia te ajudará a executar o sistema completo de atendimento multi-empresa com IA.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js 18+** ([Download](https://nodejs.org/))
- **MongoDB Atlas** (conta gratuita)
- **Conta OpenAI** (para API)
- **Git** (para clonar o repositório)

## 🗄️ 1. Configuração do MongoDB Atlas

### Passo 1: Criar conta no MongoDB Atlas

1. Acesse [MongoDB Atlas](https://cloud.mongodb.com/)
2. Crie uma conta gratuita
3. Crie um novo projeto

### Passo 2: Criar cluster

1. Clique em "Build a Database"
2. Escolha o plano **M0 Sandbox (Free)**
3. Escolha uma região próxima ao Brasil
4. Nomeie seu cluster (ex: "atendimento-cluster")
5. Clique em "Create"

### Passo 3: Configurar acesso

1. Crie um usuário de banco de dados:
   - Username: `atendimento-user`
   - Password: `atendimento123` (ou uma senha forte)
2. Configure acesso de rede:
   - Adicione seu IP atual
   - Ou use `0.0.0.0/0` para desenvolvimento (não recomendado para produção)

### Passo 4: Obter string de conexão

1. Clique em "Connect" no seu cluster
2. Escolha "Connect your application"
3. Copie a string de conexão
4. Substitua `<password>` pela senha do usuário criado

**Exemplo de string de conexão:**

```
mongodb+srv://atendimento-user:atendimento123@atendimento-cluster.xxxxx.mongodb.net/atendimento?retryWrites=true&w=majority
```

## 🔧 2. Configuração do Backend

### Passo 1: Instalar dependências

```bash
cd atendimento-backend
npm install
```

### Passo 2: Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Database
DATABASE_URL="mongodb+srv://atendimento-user:atendimento123@atendimento-cluster.xxxxx.mongodb.net/atendimento?retryWrites=true&w=majority"

# JWT
JWT_SECRET="sua-chave-super-secreta-jwt-mude-em-producao"
JWT_EXPIRES_IN="24h"
JWT_REFRESH_SECRET="sua-chave-super-secreta-refresh-mude-em-producao"
JWT_REFRESH_EXPIRES_IN="7d"

# OpenAI
OPENAI_API_KEY="sua-chave-da-openai"

# App Configuration
NODE_ENV="development"
PORT=3001
CORS_ORIGIN="http://localhost:3000"
```

### Passo 3: Configurar Prisma

```bash
# Gerar cliente Prisma
npm run prisma:generate

# Aplicar schema ao banco
npm run prisma:push

# Popular banco com dados iniciais
npm run prisma:seed
```

### Passo 4: Executar o servidor

```bash
npm run start:dev
```

O servidor estará rodando em `http://localhost:3001`

## 🎨 3. Configuração do Frontend

### Passo 1: Instalar dependências

```bash
cd atendimento-frontend
npm install
```

### Passo 2: Configurar variáveis de ambiente

```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local`:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# App Configuration
NEXT_PUBLIC_APP_NAME="Sistema de Atendimento Multi-Empresa"
NEXT_PUBLIC_APP_VERSION="1.0.0"
```

### Passo 3: Executar o servidor

```bash
npm run dev
```

O frontend estará rodando em `http://localhost:3000`

## 🔑 4. Dados de Teste

Após executar o seed do banco, você terá os seguintes usuários:

### Super Administrador

- **Email**: `admin@sistema.com`
- **Senha**: `admin123`
- **Acesso**: Total ao sistema

### Administrador da Empresa

- **Email**: `admin@empresaexemplo.com`
- **Senha**: `admin123`
- **Acesso**: Administração da empresa

### Agentes

- **Email**: `agente1@empresaexemplo.com`
- **Senha**: `admin123`
- **Acesso**: Interface de atendimento

- **Email**: `agente2@empresaexemplo.com`
- **Senha**: `admin123`
- **Acesso**: Interface de atendimento

## 🧪 5. Testando o Sistema

### Passo 1: Fazer login

1. Acesse `http://localhost:3000`
2. Use um dos usuários de teste
3. Você será redirecionado baseado no seu role

### Passo 2: Explorar funcionalidades

**Como Super Admin:**

- Dashboard com métricas gerais
- Gestão de empresas
- Gestão de usuários
- Configurações do sistema

**Como Admin:**

- Dashboard da empresa
- Gestão de usuários da empresa
- Gestão de clientes
- Configuração da IA

**Como Agente:**

- Interface de chat
- Sistema de tickets
- Calendário de agendamentos
- Métricas pessoais

## 🔧 6. Configuração da IA (OpenAI)

### Passo 1: Obter chave da API

1. Acesse [OpenAI Platform](https://platform.openai.com/)
2. Crie uma conta ou faça login
3. Vá para "API Keys"
4. Crie uma nova chave
5. Copie a chave gerada

### Passo 2: Configurar no backend

1. Adicione a chave no arquivo `.env` do backend:

```env
OPENAI_API_KEY="sk-sua-chave-aqui"
```

2. Reinicie o servidor backend

### Passo 3: Testar a IA

1. Acesse o dashboard administrativo
2. Vá para "IA" no menu
3. Configure os prompts
4. Teste as respostas automáticas

## 📱 7. Funcionalidades Disponíveis

### ✅ Implementadas

- ✅ Autenticação JWT com roles
- ✅ Sistema multi-tenancy
- ✅ CRUD de empresas, usuários e clientes
- ✅ Dashboard administrativo
- ✅ Interface de login responsiva
- ✅ Estrutura base do chat
- ✅ Estrutura base dos tickets
- ✅ Estrutura base dos agendamentos
- ✅ Integração básica com OpenAI
- ✅ Upload de arquivos (estrutura)
- ✅ Socket.io para real-time

### 🚧 Em Desenvolvimento

- 🚧 Interface completa de chat
- 🚧 Sistema de tickets com Kanban
- 🚧 Calendário de agendamentos
- 🚧 Dashboards de agentes
- 🚧 Integração com WhatsApp/Telegram
- 🚧 Workflows do n8n

## 🐛 8. Solução de Problemas

### Problema: Erro de conexão com MongoDB

**Solução:**

1. Verifique se a string de conexão está correta
2. Confirme se o usuário tem permissões
3. Verifique se o IP está liberado no MongoDB Atlas

### Problema: Erro de CORS

**Solução:**

1. Verifique se `CORS_ORIGIN` está configurado corretamente
2. Confirme se o frontend está rodando na porta 3000

### Problema: Erro de autenticação

**Solução:**

1. Verifique se as chaves JWT estão configuradas
2. Confirme se o token está sendo enviado corretamente

### Problema: IA não responde

**Solução:**

1. Verifique se a chave da OpenAI está correta
2. Confirme se há créditos na conta OpenAI
3. Verifique os logs do servidor

## 📞 9. Suporte

Se encontrar problemas:

1. **Verifique os logs** do servidor backend
2. **Consulte a documentação** nos READMEs
3. **Verifique as variáveis de ambiente**
4. **Confirme se todos os serviços estão rodando**

## 🚀 10. Próximos Passos

Para continuar o desenvolvimento:

1. **Implementar interface de chat completa**
2. **Desenvolver sistema de tickets com Kanban**
3. **Criar calendário de agendamentos**
4. **Configurar n8n e workflows**
5. **Integrar WhatsApp e Telegram**
6. **Implementar testes automatizados**
7. **Configurar deploy em produção**

## 📊 11. Arquitetura do Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   MongoDB       │
│   (Next.js)     │◄──►│   (NestJS)      │◄──►│   Atlas         │
│   Port: 3000    │    │   Port: 3001    │    │   Cloud         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   Socket.io     │    │   OpenAI API    │
│   Real-time     │    │   IA Responses  │
└─────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐
│   n8n           │
│   Workflows     │
│   WhatsApp      │
│   Telegram      │
└─────────────────┘
```

## 🎯 12. Objetivos Alcançados

✅ **Sistema multi-empresa** com isolamento de dados
✅ **Autenticação robusta** com JWT e roles
✅ **Interface moderna** com Tailwind CSS
✅ **Real-time** com Socket.io
✅ **IA integrada** com OpenAI
✅ **Estrutura escalável** para crescimento
✅ **Documentação completa** para desenvolvimento

O sistema está pronto para desenvolvimento das funcionalidades específicas de atendimento!
