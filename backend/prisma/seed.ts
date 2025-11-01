import { PrismaClient, Role, Plano, StatusConversa, Prioridade, Canal, TipoMensagem, StatusAgendamento, TipoAgendamento } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar empresa de exemplo
  const empresa = await prisma.empresa.upsert({
    where: { slug: 'empresa-exemplo' },
    update: {},
    create: {
      nome: 'Empresa Exemplo',
      slug: 'empresa-exemplo',
      descricao: 'Empresa de exemplo para demonstração do sistema',
      email: 'contato@empresaexemplo.com',
      telefone: '+55 11 99999-9999',
      plano: Plano.PREMIUM,
      limiteUsuarios: 50,
      limiteConversas: 1000,
      corPrimaria: '#3B82F6',
      corSecundaria: '#1E40AF',
    },
  });

  console.log('✅ Empresa criada:', empresa.nome);

  // Criar usuário super admin
  const senhaHash = await bcrypt.hash('admin123', 10);
  const superAdmin = await prisma.usuario.upsert({
    where: { email: 'admin@sistema.com' },
    update: {},
    create: {
      nome: 'Super Administrador',
      email: 'admin@sistema.com',
      senha: senhaHash,
      role: Role.SUPER_ADMIN,
      telefone: '+55 11 99999-9999',
    },
  });

  console.log('✅ Super Admin criado:', superAdmin.email);

  // Criar usuário admin da empresa
  const adminEmpresa = await prisma.usuario.upsert({
    where: { email: 'admin@empresaexemplo.com' },
    update: {},
    create: {
      nome: 'Administrador da Empresa',
      email: 'admin@empresaexemplo.com',
      senha: senhaHash,
      role: Role.ADMIN,
      telefone: '+55 11 99999-9998',
      empresaId: empresa.id,
    },
  });

  console.log('✅ Admin da empresa criado:', adminEmpresa.email);

  // Criar agentes
  const agente1 = await prisma.usuario.upsert({
    where: { email: 'agente1@empresaexemplo.com' },
    update: {},
    create: {
      nome: 'João Silva',
      email: 'agente1@empresaexemplo.com',
      senha: senhaHash,
      role: Role.AGENTE,
      telefone: '+55 11 99999-9997',
      empresaId: empresa.id,
    },
  });

  const agente2 = await prisma.usuario.upsert({
    where: { email: 'agente2@empresaexemplo.com' },
    update: {},
    create: {
      nome: 'Maria Santos',
      email: 'agente2@empresaexemplo.com',
      senha: senhaHash,
      role: Role.AGENTE,
      telefone: '+55 11 99999-9996',
      empresaId: empresa.id,
    },
  });

  console.log('✅ Agentes criados:', agente1.nome, 'e', agente2.nome);

  // Criar clientes de exemplo
  const cliente1 = await prisma.cliente.create({
    data: {
      nome: 'Carlos Oliveira',
      email: 'carlos@email.com',
      telefone: '+55 11 99999-9995',
      empresaId: empresa.id,
      tags: ['VIP', 'FREQUENTE'],
    },
  });

  const cliente2 = await prisma.cliente.create({
    data: {
      nome: 'Ana Costa',
      email: 'ana@email.com',
      telefone: '+55 11 99999-9994',
      empresaId: empresa.id,
      tags: ['NOVO'],
    },
  });

  console.log('✅ Clientes criados:', cliente1.nome, 'e', cliente2.nome);

  // Criar configuração de IA
  const configIA = await prisma.configuracaoIA.upsert({
    where: { empresaId: empresa.id },
    update: {},
    create: {
      empresaId: empresa.id,
      promptBase: `Você é um assistente virtual da empresa ${empresa.nome}.

Contexto da empresa: ${empresa.descricao}

Instruções:
- Seja sempre educado e prestativo
- Responda de forma clara e objetiva
- Se não souber algo, ofereça transferir para um atendente humano
- Use um tom profissional mas amigável
- Seja breve nas respostas

Responda à mensagem do cliente:`,
      modelo: 'gpt-4',
      temperatura: 0.7,
      maxTokens: 1000,
      modoAutomatico: false,
      idioma: 'pt-BR',
      personalidade: 'Profissional e amigável',
      faq: [
        'Como posso agendar um atendimento?',
        'Quais são os horários de funcionamento?',
        'Como posso cancelar um agendamento?',
        'Quais métodos de pagamento vocês aceitam?',
      ],
      palavrasChave: ['agendamento', 'cancelar', 'horário', 'pagamento', 'preço'],
    },
  });

  console.log('✅ Configuração de IA criada');

  // Criar conversas de exemplo
  const conversa1 = await prisma.conversa.create({
    data: {
      titulo: 'Dúvida sobre agendamento',
      status: StatusConversa.ABERTO,
      prioridade: Prioridade.MEDIA,
      canal: Canal.whatsapp,
      identificadorCanal: '+5511999999995',
      empresaId: empresa.id,
      clienteId: cliente1.id,
      agenteId: agente1.id,
    },
  });

  const conversa2 = await prisma.conversa.create({
    data: {
      titulo: 'Reclamação sobre atendimento',
      status: StatusConversa.EM_ANDAMENTO,
      prioridade: Prioridade.ALTA,
      canal: Canal.webchat,
      empresaId: empresa.id,
      clienteId: cliente2.id,
      agenteId: agente2.id,
    },
  });

  console.log('✅ Conversas de exemplo criadas');

  // Criar mensagens de exemplo
  await prisma.mensagem.createMany({
    data: [
      {
        conversaId: conversa1.id,
        conteudo: 'Olá! Gostaria de agendar uma consulta para amanhã.',
        tipo: TipoMensagem.TEXTO,
        remetente: 'cliente',
        agenteId: agente1.id,
      },
      {
        conversaId: conversa1.id,
        conteudo: 'Olá Carlos! Claro, posso ajudar você com o agendamento. Que horário seria melhor para você?',
        tipo: TipoMensagem.TEXTO,
        remetente: 'agente',
        agenteId: agente1.id,
      },
      {
        conversaId: conversa2.id,
        conteudo: 'Estou muito insatisfeito com o atendimento de ontem.',
        tipo: TipoMensagem.TEXTO,
        remetente: 'cliente',
        agenteId: agente2.id,
      },
    ],
  });

  console.log('✅ Mensagens de exemplo criadas');

  // Criar agendamentos de exemplo
  await prisma.agendamento.createMany({
    data: [
      {
        titulo: 'Consulta com Carlos',
        descricao: 'Consulta de rotina',
        dataHora: new Date(Date.now() + 24 * 60 * 60 * 1000), // Amanhã
        duracao: 60,
        status: StatusAgendamento.AGENDADO,
        tipo: TipoAgendamento.consulta,
        empresaId: empresa.id,
        clienteId: cliente1.id,
        agenteId: agente1.id,
      },
      {
        titulo: 'Reunião com Ana',
        descricao: 'Discussão sobre reclamação',
        dataHora: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Depois de amanhã
        duracao: 30,
        status: StatusAgendamento.AGENDADO,
        tipo: TipoAgendamento.reuniao,
        empresaId: empresa.id,
        clienteId: cliente2.id,
        agenteId: agente2.id,
      },
    ],
  });

  console.log('✅ Agendamentos de exemplo criados');

  console.log('🎉 Seed concluído com sucesso!');
  console.log('\n📋 Dados criados:');
  console.log('- Empresa:', empresa.nome);
  console.log('- Super Admin:', superAdmin.email, '(senha: admin123)');
  console.log('- Admin:', adminEmpresa.email, '(senha: admin123)');
  console.log('- Agentes:', agente1.email, 'e', agente2.email, '(senha: admin123)');
  console.log('- Clientes:', cliente1.nome, 'e', cliente2.nome);
  console.log('- Configuração de IA configurada');
  console.log('- Conversas e mensagens de exemplo');
  console.log('- Agendamentos de exemplo');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
