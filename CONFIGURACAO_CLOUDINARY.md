# Configuração Cloudinary Implementada

## ✅ Status: Configurado e Pronto para Uso

### Configuração

Adicione as credenciais do Cloudinary no arquivo `.env` do backend:

```env
CLOUDINARY_CLOUD_NAME="seu-cloud-name"
CLOUDINARY_API_KEY="sua-api-key"
CLOUDINARY_API_SECRET="seu-api-secret"
```

**⚠️ IMPORTANTE**: Não commite credenciais reais no repositório! Use variáveis de ambiente.

## 🚀 Como Funciona Agora

### Upload de Arquivos

Quando um usuário faz upload de um arquivo:

1. **Upload Inicial**: Arquivo é salvo localmente em `./uploads/`
2. **Upload para Cloud**: O sistema tenta fazer upload automático para Cloudinary
3. **Thumbnails**: Para imagens, thumbnails são gerados automaticamente
4. **URLs**: URLs do Cloudinary são armazenadas no banco de dados
5. **Fallback**: Se Cloudinary falhar, usa URL local

### Vantagens

- ✅ **CDN Automático**: Arquivos servidos via CDN global do Cloudinary
- ✅ **Otimização**: Compressão automática de imagens
- ✅ **Thumbnails**: Geração automática de thumbnails
- ✅ **Escalabilidade**: Armazenamento ilimitado e escalável
- ✅ **Performance**: Entrega rápida via CDN

## 📁 Tipos de Arquivo Suportados

### Imagens
- JPEG, PNG, GIF, WebP
- Thumbnails gerados automaticamente
- Otimização automática

### Documentos
- PDF, DOC, DOCX, TXT

### Áudio
- MP3, WAV

### Vídeo
- MP4, WebM

## 🎯 Como Testar

### 1. Iniciar o Servidor

```bash
cd atendimento-backend
npm run start:dev
```

### 2. Fazer Upload de Arquivo

```bash
curl -X POST http://localhost:3001/api/arquivos/upload \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -F "file=@/caminho/para/imagem.jpg" \
  -F "conversaId=ID_DA_CONVERSA"
```

### 3. Verificar Logs

Você verá no console:
```
Cloudinary configurado com sucesso
Arquivo enviado para Cloudinary: https://res.cloudinary.com/...
```

## 📊 Estrutura dos Arquivos

### Armazenamento Local
- Localização: `./uploads/`
- Formato: UUID + extensão original
- Exemplo: `a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg`

### Armazenamento Cloudinary
- Folder: `chat-attachments/`
- URL: `https://res.cloudinary.com para/chat-attachments/arquivo.jpg`
- Thumbnail: `https://res.cloudinary.com/.../w_200,h_200,c_fill/arquivo.jpg`

## ⚙️ Configuração no Código

### Service: `cloud-storage.service.ts`

```typescript
// Configuração automática do Cloudinary
private initializeCloudinary() {
  const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
  const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
  const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({...});
    this.isConfigured = true;
  }
}
```

### Controller: `arquivos.controller.ts`

```typescript
// Upload automático para Cloudinary
if (this.cloudStorageService.isReady()) {
  const uploadResult = await this.cloudStorageService.uploadBuffer(
    fileBuffer,
    file.original好笑name,
    'chat-attachments',
    {
      resourceType: 'image',
      generateThumbnail: true,
    }
  );
  
  url = uploadResult.url;
  thumbnailUrl = uploadResult.thumbnailUrl;
}
```

## 🛡️ Segurança

- ✅ Validação de tipos MIME
- ✅ Limite de tamanho (10MB)
- ✅ Nomes únicos gerados com UUID
- ✅ Autenticação JWT obrigatória
- ✅ Rate limiting (10 uploads/hora)

## 💰 Custos (Plano Gratuito)

### Cloudinary Free Tier
- ✅ **25GB** de armazenamento
- ✅ **25GB** de transferência/mês
- ✅ **Transformações**: 25 horas/mês
- ✅ Suporte a todos os formatos

### Quando Atingir o Limite
- Upgrade para plano pago conforme necessário
- Ou usar apenas storage local

## 🔧 Manutenção

### Limpar Arquivos Locais

```bash
# Listar arquivos antigos
find ./uploads -type f -mtime +30

# Deletar arquivos antigos
find ./uploads -type f -mtime +30 -delete
```

### Verificar Uso no Cloudinary

1. Acesse: https://cloudinary.com/console
2. Dashboard > Media Library
3. Veja estatísticas de uso

## 📝 Próximos Passos

1. ✅ Testar upload de imagens
2. ✅ Verificar geração de thumbnails
3. ⏳ Implementar delete de arquivos no cloud
4. ⏳ Adicionar compressão automática
5. ⏳ Implementar cache de thumbnails

## 🐛 Troubleshooting

### Erro: "Cloudinary não configurado"

**Solução**: Verifique se as variáveis de ambiente estão no `.env`:
```env
CLOUDINARY_CLOUD_NAME="seu-cloud-name"
CLOUDINARY_API_KEY="sua-api-key"
CLOUDINARY_API_SECRET="seu-api-secret"
```

### Erro: "Upload failed"

**Solução**: 
1. Verifique credenciais no dashboard Cloudinary
2. Verifique limite de plano gratuito
3. Verifique conexão com internet

### Arquivo não aparece no Cloudinary

**Solução**:
1. Verifique logs do servidor
2. Verifique se o arquivo foi enviado localmente
3. Verifique permissões do folder "chat-attachments"

---

**Status**: ✅ Cloudinary configurado e operacional
**Última Atualização**: 2024
