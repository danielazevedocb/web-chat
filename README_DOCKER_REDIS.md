# Configuração Redis com Docker

## 🚀 Como Iniciar o Redis

### Opção 1: Docker Compose (Recomendado)

```bash
cd /home/danidev/projetos/web-chat
docker-compose up -d
```

### Opção 2: Docker Direto

```bash
docker run -d \
  --name atendimento-redis \
  -p 6379:6379 \
  -v redis-data:/data \
  redis:7-alpine \
  redis-server --appendonly yes
```

## ✅ Verificar se está rodando

```bash
docker ps | grep redis
```

Você deve ver algo como:
```
CONTAINER ID   IMAGE              COMMAND                  STATUS
abc123def456   redis:7-alpine    "docker-entrypoint.s…"   Up 2 seconds
```

## 🧪 Testar Conexão

```bash
# Instalar redis-cli se não tiver
sudo apt-get install redis-tools

# Testar conexão
redis-cli ping
# Resposta esperada: PONG
```

## 🛑 Parar o Redis

```bash
docker-compose down
```

ou

```bash
docker stop atendimento-redis
docker rm atendimento-redis
```

## 📊 Usar Redis CLI

```bash
# Conectar ao Redis
redis-cli

# Ver todas as chaves
KEYS *

# Ver valor de uma chave
GET nome-da-chave

# Limpar tudo (cuidado!)
FLUSHALL

# Sair
exit
```

## ⚙️ Configuração no Backend

Adicione ao `.env`:

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

## 🔧 Instalar Dependências NestJS

```bash
cd atendimento-backend
npm install cache-manager cache-manager-redis-store @nestjs/cache-manager
```

## 📝 Próximos Passos

1. Redis está rodando ✅
2. Instalar dependências ⏳
3. Configurar no AppModule ⏳
4. Implementar cache ⏳

---

**Status:** Redis pronto para uso
