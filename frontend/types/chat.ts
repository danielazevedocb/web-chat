export interface Conversa {
  id: string;
  titulo?: string;
  status: 'ABERTO' | 'EM_ANDAMENTO' | 'FECHADO';
  prioridade: 'ALTA' | 'MEDIA' | 'BAIXA';
  canal: 'whatsapp' | 'telegram' | 'webchat' | 'email';
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
  mensagens: Mensagem[];
  arquivos: Arquivo[];
}

export interface Mensagem {
  id: string;
  conteudo?: string;
  tipo: 'TEXTO' | 'ARQUIVO' | 'IMAGEM' | 'AUDIO' | 'VIDEO';
  remetente: 'cliente' | 'agente' | 'sistema' | 'ia';
  isIA: boolean;
  isLida: boolean;
  lidaEm?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  conversaId: string;
  agenteId?: string;
  agente?: Usuario;
  arquivos: Arquivo[];
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
  avatar?: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'AGENTE';
  empresaId?: string;
  isAtivo: boolean;
  createdAt: string;
  updatedAt: string;
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
