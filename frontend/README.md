# Sistema de Atendimento Multi-Empresa - Frontend

Frontend do sistema de atendimento ao cliente com suporte multi-empresa, integração com IA, chat em tempo real e dashboards administrativos.

## 🚀 Tecnologias

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Styling**: Tailwind CSS
- **Estado**: React Query + Context API
- **Formulários**: React Hook Form + Zod
- **Real-time**: Socket.io Client
- **Ícones**: Lucide React
- **Notificações**: React Hot Toast
- **Gráficos**: Recharts
- **Calendário**: React Big Calendar

## 📋 Pré-requisitos

- Node.js 18+
- Backend do sistema rodando
- MongoDB Atlas configurado

## 🛠️ Instalação

### 1. Instalar dependências

```bash
cd atendimento-frontend
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` com suas configurações:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# App Configuration
NEXT_PUBLIC_APP_NAME="Sistema de Atendimento Multi-Empresa"
NEXT_PUBLIC_APP_VERSION="1.0.0"
```

### 3. Executar o servidor de desenvolvimento

```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3000`

## 🏗️ Estrutura do Projeto

```
atendimento-frontend/
├── app/                    # App Router do Next.js
│   ├── (admin)/           # Páginas administrativas
│   │   ├── dashboard/     # Dashboard principal
│   │   ├── empresas/      # Gestão de empresas
│   │   ├── usuarios/      # Gestão de usuários
│   │   ├── clientes/      # Gestão de clientes
│   │   ├── conversas/     # Visualização de conversas
│   │   ├── tickets/       # Sistema de tickets
│   │   ├── agendamentos/  # Sistema de agendamentos
│   │   ├── ia/            # Configuração da IA
│   │   └── relatorios/    # Relatórios e métricas
│   ├── (agente)/          # Páginas do agente
│   │   ├── atendimento/   # Interface de chat
│   │   ├── tickets/       # Kanban de tickets
│   │   ├── agendamentos/  # Calendário de agendamentos
│   │   └── metricas/      # Métricas pessoais
│   ├── login/             # Página de login
│   ├── register/          # Página de cadastro
│   ├── layout.tsx         # Layout raiz
│   └── page.tsx           # Página inicial
├── components/            # Componentes reutilizáveis
│   ├── layout/            # Componentes de layout
│   ├── ui/                # Componentes de UI
│   ├── forms/             # Componentes de formulário
│   └── charts/            # Componentes de gráficos
├── contexts/              # Contextos React
│   ├── AuthContext.tsx    # Contexto de autenticação
│   └── SocketContext.tsx  # Contexto do Socket.io
├── hooks/                 # Custom hooks
├── lib/                   # Utilitários e configurações
├── styles/                # Estilos globais
└── types/                 # Tipos TypeScript
```

## 🎨 Componentes Principais

### Layout

- **Sidebar**: Navegação lateral com menu responsivo
- **Header**: Cabeçalho com busca, notificações e perfil
- **AdminLayout**: Layout para páginas administrativas
- **AgenteLayout**: Layout para páginas do agente

### UI Components

- **Button**: Botões com variantes e estados
- **Input**: Campos de entrada com validação
- **Card**: Cards para exibição de conteúdo
- **Modal**: Modais para ações e confirmações
- **Table**: Tabelas com paginação e filtros
- **Badge**: Badges para status e prioridades

### Chat Components

- **ChatInterface**: Interface principal do chat
- **MessageList**: Lista de mensagens com scroll infinito
- **MessageInput**: Input para envio de mensagens
- **FileUpload**: Upload de arquivos com preview
- **TypingIndicator**: Indicador de digitação
- **OnlineStatus**: Status online dos usuários

### Dashboard Components

- **MetricsCard**: Cards de métricas
- **Chart**: Gráficos com Recharts
- **ActivityFeed**: Feed de atividades
- **QuickActions**: Ações rápidas

## 🔐 Autenticação

O sistema usa JWT para autenticação com os seguintes roles:

- **SUPER_ADMIN**: Acesso total ao sistema
- **ADMIN**: Acesso administrativo da empresa
- **AGENTE**: Acesso às funcionalidades de atendimento

### Fluxo de Autenticação

1. Login com email e senha
2. Recebimento do JWT token
3. Armazenamento no localStorage
4. Redirecionamento baseado no role
5. Proteção de rotas com middleware

## 📱 Responsividade

O sistema é totalmente responsivo com breakpoints:

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Recursos Mobile

- Menu hambúrguer na sidebar
- Interface de chat otimizada para touch
- Swipe gestures para navegação
- Notificações push (futuro)

## 🔄 Real-time

### Socket.io Events

**Cliente → Servidor:**

- `join_conversa`: Entrar em uma conversa
- `leave_conversa`: Sair de uma conversa
- `send_message`: Enviar mensagem
- `typing_start`: Começar a digitar
- `typing_stop`: Parar de digitar
- `mark_read`: Marcar mensagem como lida

**Servidor → Cliente:**

- `message_received`: Nova mensagem recebida
- `message_sent`: Mensagem enviada com sucesso
- `user_typing`: Usuário está digitando
- `user_stopped_typing`: Usuário parou de digitar
- `conversa_updated`: Conversa atualizada
- `user_online`: Usuário ficou online
- `user_offline`: Usuário ficou offline

## 📊 Dashboards

### Dashboard Administrativo

- **Métricas Gerais**: Usuários, clientes, conversas
- **Performance IA**: Mensagens processadas, taxa de resolução
- **Atividade Recente**: Feed de eventos em tempo real
- **Gráficos**: Conversas por status, performance por período

### Dashboard do Agente

- **Conversas Ativas**: Lista de conversas em andamento
- **Tickets**: Kanban board com drag & drop
- **Agendamentos**: Calendário com eventos
- **Métricas Pessoais**: Performance individual

## 🎯 Funcionalidades

### Chat em Tempo Real

- Mensagens instantâneas
- Indicadores de digitação
- Status online/offline
- Upload de arquivos
- Preview de mídia
- Histórico de conversas

### Sistema de Tickets

- Criação automática/manual
- Prioridades e status
- Atribuição de agentes
- SLA e métricas
- Kanban board

### Agendamentos

- Calendário interativo
- Validação de conflitos
- Notificações automáticas
- Integração com chat

### IA Integrada

- Respostas automáticas
- Sugestões para agentes
- Análise de sentimento
- Configuração de prompts

### Upload de Arquivos

- Suporte a múltiplos tipos
- Preview de imagens/vídeos
- Player de áudio
- Validação de tamanho

## 🚀 Deploy

### Vercel (Recomendado)

1. Conectar repositório ao Vercel
2. Configurar variáveis de ambiente
3. Deploy automático

### Outras Opções

- **Netlify**: Deploy estático
- **Railway**: Deploy full-stack
- **AWS Amplify**: Deploy com CI/CD

### Variáveis de Ambiente para Produção

```env
NEXT_PUBLIC_API_URL=https://api.seudominio.com
NEXT_PUBLIC_SOCKET_URL=https://api.seudominio.com
NEXT_PUBLIC_APP_NAME="Sistema de Atendimento"
```

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Servidor de produção
npm run lint         # Executar ESLint
npm run type-check   # Verificar tipos TypeScript
```

## 📈 Performance

### Otimizações Implementadas

- **Code Splitting**: Carregamento sob demanda
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: Análise de tamanho
- **Caching**: React Query para cache de dados
- **Lazy Loading**: Componentes carregados sob demanda

### Métricas de Performance

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3.5s

## 🧪 Testes

### Estrutura de Testes

```bash
# Testes unitários
npm run test

# Testes de integração
npm run test:integration

# Testes E2E
npm run test:e2e

# Coverage
npm run test:coverage
```

## 📝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto é privado e proprietário.

## 🆘 Suporte

Para dúvidas ou problemas:

1. Consulte a documentação
2. Verifique os issues existentes
3. Entre em contato com a equipe
4. Abra um novo issue se necessário
