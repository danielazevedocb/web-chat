export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  AGENTE = 'AGENTE',
}

export enum StatusConversa {
  ABERTO = 'ABERTO',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  AGUARDANDO = 'AGUARDANDO',
  RESOLVIDO = 'RESOLVIDO',
  FECHADO = 'FECHADO',
}

export enum Prioridade {
  BAIXA = 'BAIXA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
  URGENTE = 'URGENTE',
}

export enum StatusAgendamento {
  AGENDADO = 'AGENDADO',
  CONFIRMADO = 'CONFIRMADO',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  CONCLUIDO = 'CONCLUIDO',
  CANCELADO = 'CANCELADO',
  REAGENDADO = 'REAGENDADO',
}

export enum TipoMensagem {
  TEXTO = 'TEXTO',
  IMAGEM = 'IMAGEM',
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO',
  DOCUMENTO = 'DOCUMENTO',
  STICKER = 'STICKER',
  LOCALIZACAO = 'LOCALIZACAO',
  CONTATO = 'CONTATO',
}

export enum TipoArquivo {
  IMAGEM = 'IMAGEM',
  DOCUMENTO = 'DOCUMENTO',
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO',
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  empresaId?: string;
  iat?: number;
  exp?: number;
}

export interface RequestWithUser extends Request {
  user: JwtPayload;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface WebhookPayload {
  event: string;
  data: any;
  timestamp: string;
  signature?: string;
}

export interface IAResponse {
  message: string;
  confidence: number;
  intent?: string;
  entities?: any[];
}

export interface ChatMessage {
  id: string;
  conteudo: string;
  tipo: TipoMensagem;
  remetente: string;
  isIA: boolean;
  isLida: boolean;
  createdAt: Date;
  arquivos?: Arquivo[];
}

export interface Arquivo {
  id: string;
  nome: string;
  url: string;
  tipo: TipoArquivo;
  tamanho: number;
  mimeType: string;
  thumbnail?: string;
}

export interface ConversaSummary {
  id: string;
  titulo?: string;
  status: StatusConversa;
  prioridade: Prioridade;
  canal: string;
  cliente: {
    id: string;
    nome: string;
    avatar?: string;
  };
  agente?: {
    id: string;
    nome: string;
    avatar?: string;
  };
  ultimaMensagem?: {
    conteudo: string;
    createdAt: Date;
    remetente: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardMetrics {
  totalConversas: number;
  conversasAbertas: number;
  conversasFechadas: number;
  tempoMedioResposta: number;
  satisfacaoMedia: number;
  mensagensIA: number;
  taxaResolucaoIA: number;
  agentesAtivos: number;
  cargaTrabalhoMedia: number;
}
