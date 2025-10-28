'use client';

import {
  AlertCircle,
  CheckCircle,
  Clock,
  MessageSquare,
  MoreVertical,
  Star,
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
  mensagens: {
    id: string;
    conteudo: string;
    tipo: string;
    remetente: string;
    isIA: boolean;
    isLida: boolean;
    createdAt: string;
  }[];
}

interface ConversationListProps {
  conversas: Conversa[];
  selectedConversa: Conversa | null;
  onSelectConversa: (conversa: Conversa) => void;
}

export default function ConversationList({
  conversas,
  selectedConversa,
  onSelectConversa,
}: ConversationListProps) {
  const [hoveredConversa, setHoveredConversa] = useState<string | null>(null);

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
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) {
      return 'Agora';
    } else if (diffInHours < 24) {
      return `${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d`;
    }
  };

  const getUnreadCount = (conversa: Conversa) => {
    return conversa.mensagens.filter(
      (msg) => msg.remetente !== 'agente' && !msg.isLida,
    ).length;
  };

  const getLastMessage = (conversa: Conversa) => {
    if (conversa.mensagens.length === 0) return 'Nenhuma mensagem';

    const lastMessage = conversa.mensagens[conversa.mensagens.length - 1];
    const preview =
      lastMessage.conteudo.length > 50
        ? `${lastMessage.conteudo.substring(0, 50)}...`
        : lastMessage.conteudo;

    return preview;
  };

  if (conversas.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">Nenhuma conversa encontrada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1 p-2">
      {conversas.map((conversa) => {
        const isSelected = selectedConversa?.id === conversa.id;
        const isHovered = hoveredConversa === conversa.id;
        const unreadCount = getUnreadCount(conversa);
        const hasUnread = unreadCount > 0;

        return (
          <div
            key={conversa.id}
            className={`
              relative p-3 rounded-lg cursor-pointer transition-all duration-200
              ${
                isSelected
                  ? 'bg-primary-50 border-l-4 border-primary-500 shadow-sm'
                  : 'hover:bg-gray-50'
              }
              ${hasUnread ? 'bg-blue-50' : ''}
            `}
            onClick={() => onSelectConversa(conversa)}
            onMouseEnter={() => setHoveredConversa(conversa.id)}
            onMouseLeave={() => setHoveredConversa(null)}
          >
            <div className="flex items-start space-x-3">
              {/* Avatar do Cliente */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                    {conversa.cliente.avatar ? (
                      <img
                        src={conversa.cliente.avatar}
                        alt={conversa.cliente.nome}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-primary-600 font-medium text-sm">
                        {conversa.cliente.nome.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Indicador de canal */}
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs">
                    {getCanalIcon(conversa.canal)}
                  </div>
                </div>
              </div>

              {/* Conteúdo da Conversa */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <h4
                      className={`text-sm font-medium truncate ${
                        hasUnread
                          ? 'text-gray-900 font-semibold'
                          : 'text-gray-900'
                      }`}
                    >
                      {conversa.cliente.nome}
                    </h4>

                    {/* Status */}
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        conversa.status,
                      )}`}
                    >
                      {conversa.status}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Tempo */}
                    <span className="text-xs text-gray-500">
                      {formatTime(conversa.updatedAt)}
                    </span>

                    {/* Menu de ações */}
                    {(isHovered || isSelected) && (
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Última mensagem */}
                <p
                  className={`text-sm truncate mt-1 ${
                    hasUnread ? 'text-gray-900 font-medium' : 'text-gray-500'
                  }`}
                >
                  {getLastMessage(conversa)}
                </p>

                {/* Tags e Prioridade */}
                <div className="flex items-center space-x-2 mt-2">
                  {/* Prioridade */}
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                      conversa.prioridade,
                    )}`}
                  >
                    {conversa.prioridade}
                  </span>

                  {/* Tags */}
                  {conversa.tags.slice(0, 2).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {tag}
                    </span>
                  ))}

                  {conversa.tags.length > 2 && (
                    <span className="text-xs text-gray-500">
                      +{conversa.tags.length - 2}
                    </span>
                  )}
                </div>

                {/* Métricas */}
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  {conversa.tempoResposta && (
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{conversa.tempoResposta}min</span>
                    </div>
                  )}

                  {conversa.satisfacao && (
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3" />
                      <span>{conversa.satisfacao}/5</span>
                    </div>
                  )}

                  {conversa.sla && (
                    <div className="flex items-center space-x-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>SLA: {conversa.sla}min</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Indicador de mensagens não lidas */}
              {hasUnread && (
                <div className="flex-shrink-0">
                  <div className="h-5 w-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center font-medium">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
