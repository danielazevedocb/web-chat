'use client';

import {
  AlertCircle,
  Bot,
  Check,
  CheckCheck,
  Clock,
  Download,
  Eye,
  EyeOff,
  FileText,
  Image,
  MessageSquare,
  Music,
  User,
  Video,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Mensagem {
  id: string;
  conteudo: string;
  tipo: string;
  remetente: string;
  isIA: boolean;
  isLida: boolean;
  lidaEm?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  agente?: {
    id: string;
    nome: string;
    email: string;
    avatar?: string;
  };
  arquivos?: {
    id: string;
    nome: string;
    tipo: string;
    url: string;
    tamanho: number;
  }[];
}

interface Conversa {
  id: string;
  titulo?: string;
  status: string;
  prioridade: string;
  canal: string;
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

interface MessageListProps {
  mensagens: Mensagem[];
  isLoading: boolean;
  conversa: Conversa;
}

export default function MessageList({
  mensagens,
  isLoading,
  conversa,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showTimestamps, setShowTimestamps] = useState(false);

  // Auto scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoje';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ontem';
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  const getMessageIcon = (remetente: string, isIA: boolean) => {
    if (isIA) {
      return <Bot className="h-4 w-4 text-blue-500" />;
    }

    switch (remetente) {
      case 'agente':
        return <User className="h-4 w-4 text-green-500" />;
      case 'cliente':
        return <User className="h-4 w-4 text-gray-500" />;
      case 'sistema':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getMessageStatus = (mensagem: Mensagem) => {
    if (mensagem.remetente === 'agente') {
      if (mensagem.isLida) {
        return <CheckCheck className="h-4 w-4 text-blue-500" />;
      } else {
        return <Check className="h-4 w-4 text-gray-400" />;
      }
    }
    return null;
  };

  const getFileIcon = (tipo: string) => {
    switch (tipo) {
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'audio':
        return <Music className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderMessageContent = (mensagem: Mensagem) => {
    if (
      mensagem.tipo === 'ARQUIVO' &&
      mensagem.arquivos &&
      mensagem.arquivos.length > 0
    ) {
      return (
        <div className="space-y-2">
          {mensagem.arquivos.map((arquivo) => (
            <div
              key={arquivo.id}
              className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex-shrink-0">{getFileIcon(arquivo.tipo)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {arquivo.nome}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(arquivo.tamanho)}
                </p>
              </div>
              <div className="flex-shrink-0">
                <a
                  href={arquivo.url}
                  download={arquivo.nome}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <Download className="h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
          {mensagem.conteudo && (
            <p className="text-sm text-gray-700">{mensagem.conteudo}</p>
          )}
        </div>
      );
    }

    return (
      <p className="text-sm text-gray-700 whitespace-pre-wrap">
        {mensagem.conteudo}
      </p>
    );
  };

  const renderDateSeparator = (date: string, index: number) => {
    const prevMessage = index > 0 ? mensagens[index - 1] : null;
    const currentDate = formatDate(date);
    const prevDate = prevMessage ? formatDate(prevMessage.createdAt) : null;

    if (currentDate !== prevDate) {
      return (
        <div className="flex items-center justify-center my-4">
          <div className="flex items-center space-x-2">
            <div className="h-px bg-gray-300 flex-1"></div>
            <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
              {currentDate}
            </span>
            <div className="h-px bg-gray-300 flex-1"></div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (mensagens.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">Nenhuma mensagem ainda</p>
          <p className="text-xs">Inicie uma conversa com o cliente</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* Header com informações da conversa */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
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
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                {conversa.cliente.nome}
              </h3>
              <p className="text-xs text-gray-500">
                {conversa.cliente.email} • {conversa.canal}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowTimestamps(!showTimestamps)}
              className="p-2 text-gray-400 hover:text-gray-600"
              title={showTimestamps ? 'Ocultar horários' : 'Mostrar horários'}
            >
              {showTimestamps ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Lista de mensagens */}
      {mensagens.map((mensagem, index) => {
        const isFromAgent = mensagem.remetente === 'agente';
        const isFromIA = mensagem.isIA;
        const isFromSystem = mensagem.remetente === 'sistema';

        return (
          <div key={mensagem.id}>
            {renderDateSeparator(mensagem.createdAt, index)}

            <div
              className={`flex ${
                isFromAgent ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${
                  isFromAgent ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                {/* Avatar */}
                {!isFromAgent && (
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                      {isFromIA ? (
                        <Bot className="h-4 w-4 text-blue-500" />
                      ) : (
                        <User className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                  </div>
                )}

                {/* Mensagem */}
                <div
                  className={`rounded-lg p-3 ${
                    isFromAgent
                      ? 'bg-primary-600 text-white'
                      : isFromIA
                      ? 'bg-blue-50 text-blue-900 border border-blue-200'
                      : isFromSystem
                      ? 'bg-yellow-50 text-yellow-900 border border-yellow-200'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  {/* Conteúdo da mensagem */}
                  <div className="mb-1">{renderMessageContent(mensagem)}</div>

                  {/* Timestamp e status */}
                  <div
                    className={`flex items-center space-x-1 text-xs ${
                      isFromAgent ? 'text-primary-100' : 'text-gray-500'
                    }`}
                  >
                    {showTimestamps && (
                      <>
                        <Clock className="h-3 w-3" />
                        <span>{formatTime(mensagem.createdAt)}</span>
                      </>
                    )}

                    {isFromAgent && (
                      <div className="ml-2">{getMessageStatus(mensagem)}</div>
                    )}
                  </div>

                  {/* Indicador de IA */}
                  {isFromIA && (
                    <div className="flex items-center space-x-1 mt-1 text-xs text-blue-600">
                      <Bot className="h-3 w-3" />
                      <span>Resposta gerada por IA</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <div ref={messagesEndRef} />
    </div>
  );
}
