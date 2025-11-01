// Enums correspondentes ao schema Prisma
export type StatusConversa = 'ABERTO' | 'EM_ANDAMENTO' | 'AGUARDANDO' | 'RESOLVIDO' | 'FECHADO';
export type Prioridade = 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';
export type TipoMensagem = 'TEXTO' | 'IMAGEM' | 'AUDIO' | 'VIDEO' | 'DOCUMENTO' | 'STICKER' | 'LOCALIZACAO' | 'CONTATO';
export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'AGENTE';

export interface Conversa {
  id: string;
  titulo?: string;
  status: StatusConversa;
  prioridade: Prioridade;
  canal: string;
  identificadorCanal?: string;
  sla?: number;
  tempoResposta?: number;
  satisfacao?: number;
  observacoes?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  fechadaEm?: string;
  empresaId: string;
  clienteId: string;
  agenteId?: string;
  cliente: Cliente;
  agente?: Usuario;
  mensagens?: Mensagem[];
  arquivos?: Arquivo[];
  lastMessage?: Mensagem;
  unreadCount?: number;
}

export interface Mensagem {
  id: string;
  conteudo?: string;
  tipo: TipoMensagem;
  remetente: 'cliente' | 'agente';
  isIA: boolean;
  isLida: boolean;
  arquivoUrl?: string;
  arquivoTipo?: string;
  createdAt: string;
  updatedAt: string;
  conversaId: string;
  agenteId?: string;
  agente?: Usuario;
  sender?: {
    id: string;
    nome: string;
    email: string;
    avatar?: string;
  };
}

export interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  avatar?: string;
  empresaId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  avatar?: string;
  role: Role;
  empresaId?: string;
  ativo: boolean;
  ultimoLogin?: string;
  createdAt: string;
  updatedAt: string;
  empresa?: {
    id: string;
    nome: string;
    slug: string;
  };
}

export interface Arquivo {
  id: string;
  nome: string;
  tipo: string;
  url: string;
  tamanho: number;
  mensagemId?: string;
  conversaId?: string;
  createdAt: string;
}

export interface ChatMetrics {
  totalConversas: number;
  conversasAbertas: number;
  conversasFechadas: number;
  tempoMedioResposta: number;
  satisfacaoMedia: number;
  mensagensIA: number;
  taxaResolucaoIA: number;
}

export interface SocketMessage {
  id: string;
  conversaId: string;
  conteudo: string;
  tipo: string;
  remetente: string;
  isIA: boolean;
  agenteId?: string;
  createdAt: string;
}

export interface TypingData {
  conversaId: string;
  usuarioId: string;
}

export interface ChatFilters {
  status?: string;
  prioridade?: string;
  canal?: string;
  agenteId?: string;
  dataInicio?: string;
  dataFim?: string;
  search?: string;
}
