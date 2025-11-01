# 🚀 Instruções de Configuração - Sistema de Atendimento Multi-Empresa

## 📋 Pré-requisitos

- Node.js 18+ instalado
- PostgreSQL 16+ (ou usar Docker Compose para iniciar localmente)
- Conta OpenAI (opcional, para IA)

## 🔧 Configuração do Backend

### 1. Instalar dependências

```bash
cd atendimento-backend
npm install
```

### 2. Configurar variáveis de ambiente

O arquivo `.env` deve ser configurado com a conexão do PostgreSQL. Você pode editar as seguintes variáveis se necessário:

- `JWT_SECRET`: Chave secreta para JWT (mude em produção)
- `JWT_REFRESH_SECRET`: Chave secreta para refresh token (mude em produção)
- `OPENAI_API_KEY`: Sua chave da OpenAI (opcional)

### 3. Configurar banco de dados

```bash
# Executar script de configuração automática
node setup-database.js

# OU executar manualmente:
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
```

### 4. Executar o servidor

```bash
npm run start:dev
```

O servidor estará rodando em `http://localhost:3001`

## 🎨 Configuração do Frontend

### 1. Instalar dependências

```bash
cd atendimento-frontend
npm install
```

### 2. Executar o servidor

```bash
npm run dev
```

O frontend estará rodando em `http://localhost:3000`

## 🔑 Dados de Teste

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

## 🧪 Testando o Sistema

1. Acesse `http://localhost:3000`
2. Use um dos usuários de teste
3. Você será redirecionado baseado no seu role:
   - **Super Admin/Admin**: Dashboard administrativo
   - **Agente**: Interface de chat

## 🔧 Configuração da IA (Opcional)

Para usar a funcionalidade de IA:

1. Acesse [OpenAI Platform](https://platform.openai.com/)
2. Crie uma conta ou faça login
3. Vá para "API Keys"
4. Crie uma nova chave
5. Adicione a chave no arquivo `.env` do backend:
   ```env
   OPENAI_API_KEY="sk-sua-chave-aqui"
   ```
6. Reinicie o servidor backend

## 📱 Funcionalidades Disponíveis

### ✅ Implementadas

- ✅ Autenticação JWT com roles
- ✅ Sistema multi-tenancy
- ✅ CRUD de empresas, usuários e clientes
- ✅ Dashboard administrativo
- ✅ Interface de login responsiva
- ✅ **Interface completa de chat** com real-time
- ✅ **Histórico de mensagens**
- ✅ **Integração com IA**
- ✅ Socket.io para real-time
- ✅ Upload de arquivos (estrutura)

### 🚧 Em Desenvolvimento

- 🚧 Sistema de tickets com Kanban
- 🚧 Calendário de agendamentos
- 🚧 Dashboards de agentes
- 🚧 Integração com WhatsApp/Telegram
- 🚧 Workflows do n8n

## 🐛 Solução de Problemas

### Problema: Erro de conexão com PostgreSQL

**Solução:**

1. Verifique se a string de conexão está correta no `.env`
2. Confirme se o PostgreSQL está rodando (docker-compose up -d postgres)
3. Verifique se as credenciais estão corretas
4. Confirme se o banco de dados foi criado

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

## 🚀 Próximos Passos

Para continuar o desenvolvimento:

1. **Implementar sistema de tickets com Kanban**
2. **Criar calendário de agendamentos**
3. **Configurar n8n e workflows**
4. **Integrar WhatsApp e Telegram**
5. **Implementar testes automatizados**
6. **Configurar deploy em produção**

## 📞 Suporte

Se encontrar problemas:

1. **Verifique os logs** do servidor backend
2. **Consulte a documentação** nos READMEs
3. **Verifique as variáveis de ambiente**
4. **Confirme se todos os serviços estão rodando**

---

🎉 **Sistema pronto para uso!** A interface de chat está completamente funcional com todas as funcionalidades implementadas.
