'use client';

import {
  AlertCircle,
  Archive,
  Bot,
  CheckCircle,
  Clock,
  MessageSquare,
  MoreVertical,
  Phone,
  Settings,
  Star,
  Tag,
  Trash2,
  Video,
} from 'lucide-react';
import { useState } from 'react';

interface Conversa {
  id: string;
  titulo?: string;
  status: string;
  prioridade: string;
  canal: string;
  sla?: number;
  tempoResposta?: number;
  satisfacao?: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  cliente: {
    id: string;
    nome: string;
    email: string;
    telefone?: string;
    avatar?: string;
  };
  agente?: {
    id: string;
    nome: string;
    email: string;
    avatar?: string;
  };
}

interface ChatHeaderProps {
  conversa: Conversa;
  onGenerateIA: () => void;
  isGeneratingIA: boolean;
}

export default function ChatHeader({
  conversa,
  onGenerateIA,
  isGeneratingIA,
}: ChatHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ABERTO':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'EM_ANDAMENTO':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'FECHADO':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ABERTO':
        return 'bg-yellow-100 text-yellow-800';
      case 'EM_ANDAMENTO':
        return 'bg-blue-100 text-blue-800';
      case 'FECHADO':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (prioridade: string) => {
    switch (prioridade) {
      case 'ALTA':
        return 'bg-red-100 text-red-800';
      case 'MEDIA':
        return 'bg-yellow-100 text-yellow-800';
      case 'BAIXA':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCanalIcon = (canal: string) => {
    switch (canal) {
      case 'whatsapp':
        return '📱';
      case 'telegram':
        return '✈️';
      case 'webchat':
        return '💬';
      case 'email':
        return '📧';
      default:
        return '💬';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleStatusChange = (newStatus: string) => {
    // Implementar mudança de status
    console.log('Mudando status para:', newStatus);
    setShowMenu(false);
  };

  const handlePriorityChange = (newPriority: string) => {
    // Implementar mudança de prioridade
    console.log('Mudando prioridade para:', newPriority);
    setShowMenu(false);
  };

  const handleArchive = () => {
    // Implementar arquivamento
    console.log('Arquivando conversa');
    setShowMenu(false);
  };

  const handleDelete = () => {
    // Implementar exclusão
    console.log('Excluindo conversa');
    setShowMenu(false);
  };

  const handleCall = () => {
    // Implementar chamada
    console.log('Iniciando chamada');
  };

  const handleVideoCall = () => {
    // Implementar videoconferência
    console.log('Iniciando videoconferência');
  };

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        {/* Informações do cliente */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
              {conversa.cliente.avatar ? (
                <img
                  src={conversa.cliente.avatar}
                  alt={conversa.cliente.nome}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <span className="text-primary-600 font-medium text-lg">
                  {conversa.cliente.nome.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* Indicador de status online */}
            <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-white"></div>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-semibold text-gray-900">
                {conversa.cliente.nome}
              </h2>

              {/* Status */}
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  conversa.status,
                )}`}
              >
                {getStatusIcon(conversa.status)}
                <span className="ml-1">{conversa.status}</span>
              </span>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>{conversa.cliente.email}</span>
              {conversa.cliente.telefone && (
                <>
                  <span>•</span>
                  <span>{conversa.cliente.telefone}</span>
                </>
              )}
              <span>•</span>
              <span>
                {getCanalIcon(conversa.canal)} {conversa.canal}
              </span>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center space-x-2">
          {/* Botão de IA */}
          <button
            onClick={onGenerateIA}
            disabled={isGeneratingIA}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Gerar resposta com IA"
          >
            <Bot className="h-4 w-4" />
            <span className="text-sm font-medium">
              {isGeneratingIA ? 'Gerando...' : 'IA'}
            </span>
          </button>

          {/* Chamada */}
          <button
            onClick={handleCall}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Ligar"
          >
            <Phone className="h-5 w-5" />
          </button>

          {/* Videoconferência */}
          <button
            onClick={handleVideoCall}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Videoconferência"
          >
            <Video className="h-5 w-5" />
          </button>

          {/* Menu de ações */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Mais opções"
            >
              <MoreVertical className="h-5 w-5" />
            </button>

            {/* Dropdown menu */}
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="py-1">
                  {/* Mudar status */}
                  <div className="px-3 py-2 text-sm text-gray-500 border-b border-gray-100">
                    Mudar Status
                  </div>
                  {['ABERTO', 'EM_ANDAMENTO', 'FECHADO'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                    >
                      {status}
                    </button>
                  ))}

                  {/* Mudar prioridade */}
                  <div className="px-3 py-2 text-sm text-gray-500 border-b border-gray-100">
                    Mudar Prioridade
                  </div>
                  {['ALTA', 'MEDIA', 'BAIXA'].map((prioridade) => (
                    <button
                      key={prioridade}
                      onClick={() => handlePriorityChange(prioridade)}
                      className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                    >
                      {prioridade}
                    </button>
                  ))}

                  {/* Ações */}
                  <div className="px-3 py-2 text-sm text-gray-500 border-b border-gray-100">
                    Ações
                  </div>
                  <button
                    onClick={() => setShowInfo(!showInfo)}
                    className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left flex items-center space-x-2"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Informações</span>
                  </button>
                  <button
                    onClick={handleArchive}
                    className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left flex items-center space-x-2"
                  >
                    <Archive className="h-4 w-4" />
                    <span>Arquivar</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 text-left flex items-center space-x-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Excluir</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Informações detalhadas */}
      {showInfo && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Status e Prioridade */}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Status
              </label>
              <div className="mt-1 flex items-center space-x-2">
                {getStatusIcon(conversa.status)}
                <span className="text-sm text-gray-900">{conversa.status}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Prioridade
              </label>
              <div className="mt-1">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                    conversa.prioridade,
                  )}`}
                >
                  {conversa.prioridade}
                </span>
              </div>
            </div>

            {/* Métricas */}
            {conversa.tempoResposta && (
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Tempo de Resposta
                </label>
                <div className="mt-1 text-sm text-gray-900">
                  {conversa.tempoResposta} min
                </div>
              </div>
            )}

            {conversa.satisfacao && (
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Satisfação
                </label>
                <div className="mt-1 flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-gray-900">
                    {conversa.satisfacao}/5
                  </span>
                </div>
              </div>
            )}

            {/* SLA */}
            {conversa.sla && (
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  SLA
                </label>
                <div className="mt-1 text-sm text-gray-900">
                  {conversa.sla} min
                </div>
              </div>
            )}

            {/* Data de criação */}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Criado em
              </label>
              <div className="mt-1 text-sm text-gray-900">
                {formatTime(conversa.createdAt)}
              </div>
            </div>

            {/* Última atualização */}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Atualizado em
              </label>
              <div className="mt-1 text-sm text-gray-900">
                {formatTime(conversa.updatedAt)}
              </div>
            </div>
          </div>

          {/* Tags */}
          {conversa.tags.length > 0 && (
            <div className="mt-4">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Tags
              </label>
              <div className="mt-1 flex flex-wrap gap-2">
                {conversa.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
