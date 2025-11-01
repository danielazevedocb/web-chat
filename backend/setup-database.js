#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Configurando banco de dados PostgreSQL (web-chat)...\n');

try {
  // Gerar cliente Prisma
  console.log('📦 Gerando cliente Prisma...');
  execSync('npm run prisma:generate', { stdio: 'inherit' });

  // Aplicar schema ao banco
  console.log('🗄️ Aplicando schema ao banco de dados...');
  execSync('npm run prisma:push', { stdio: 'inherit' });

  // Popular banco com dados iniciais
  console.log('🌱 Populando banco com dados iniciais...');
  execSync('npm run prisma:seed', { stdio: 'inherit' });

  console.log('\n✅ Banco de dados PostgreSQL (web-chat) configurado com sucesso!');
  console.log('🎉 Você pode agora executar o servidor com: npm run start:dev');
} catch (error) {
  console.error('\n❌ Erro ao configurar banco de dados:', error.message);
  process.exit(1);
}
