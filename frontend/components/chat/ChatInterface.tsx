'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { Filter, MessageSquare, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import ChatHeader from './ChatHeader';
import ConversationList from './ConversationList';
import MessageInput from './MessageInput';
import MessageList from './MessageList';
import TypingIndicator from './TypingIndicator';

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

export default function ChatInterface() {
  const { user } = useAuth();
  const {
    socket,
    joinConversa,
    leaveConversa,
    sendMessage,
    startTyping,
    stopTyping,
  } = useSocket();
  const queryClient = useQueryClient();

  const [selectedConversa, setSelectedConversa] = useState<Conversa | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('TODOS');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  // Buscar conversas
  const { data: conversas, isLoading: loadingConversas } = useQuery(
    ['conversas', user?.empresaId],
    async () => {
      const response = await fetch(
        `/api/chat/conversas?empresaId=${user?.empresaId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        },
      );
      if (!response.ok) throw new Error('Erro ao carregar conversas');
      return response.json();
    },
    {
      enabled: !!user?.empresaId,
      refetchInterval: 30000, // Refetch a cada 30 segundos
    },
  );

  // Buscar mensagens da conversa selecionada
  const { data: mensagens, isLoading: loadingMensagens } = useQuery(
    ['mensagens', selectedConversa?.id],
    async () => {
      if (!selectedConversa?.id) return [];
      const response = await fetch(
        `/api/chat/conversas/${selectedConversa.id}/mensagens`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        },
      );
      if (!response.ok) throw new Error('Erro ao carregar mensagens');
      return response.json();
    },
    {
      enabled: !!selectedConversa?.id,
    },
  );

  // Mutation para enviar mensagem
  const sendMessageMutation = useMutation(
    async (data: { conversaId: string; conteudo: string; tipo?: string }) => {
      const response = await fetch('/api/chat/mensagens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...data,
          remetente: 'agente',
          agenteId: user?.id,
        }),
      });
      if (!response.ok) throw new Error('Erro ao enviar mensagem');
      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['mensagens', selectedConversa?.id]);
        queryClient.invalidateQueries(['conversas', user?.empresaId]);
      },
      onError: (error) => {
        toast.error('Erro ao enviar mensagem');
        console.error(error);
      },
    },
  );

  // Mutation para gerar resposta com IA
  const generateIAResponseMutation = useMutation(
    async (data: { conversaId: string; mensagem: string }) => {
      const response = await fetch('/api/ia/generate-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          empresaId: user?.empresaId,
          mensagem: data.mensagem,
          conversaId: data.conversaId,
        }),
      });
      if (!response.ok) throw new Error('Erro ao gerar resposta da IA');
      return response.json();
    },
    {
      onSuccess: (response) => {
        // Enviar resposta da IA como mensagem
        sendMessageMutation.mutate({
          conversaId: selectedConversa?.id || '',
          conteudo: response.resposta,
          tipo: 'TEXTO',
        });
        toast.success('Resposta da IA gerada com sucesso');
      },
      onError: (error) => {
        toast.error('Erro ao gerar resposta da IA');
        console.error(error);
      },
    },
  );

  // Filtrar conversas
  const filteredConversas =
    conversas?.filter((conversa: Conversa) => {
      const matchesSearch =
        conversa.cliente.nome
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        conversa.cliente.email
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        conversa.titulo?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterStatus === 'TODOS' || conversa.status === filterStatus;

      return matchesSearch && matchesFilter;
    }) || [];

  // Selecionar primeira conversa se nenhuma estiver selecionada
  useEffect(() => {
    if (conversas && conversas.length > 0 && !selectedConversa) {
      setSelectedConversa(conversas[0]);
    }
  }, [conversas, selectedConversa]);

  // Entrar na conversa selecionada
  useEffect(() => {
    if (selectedConversa && socket) {
      joinConversa(selectedConversa.id);
      return () => {
        leaveConversa(selectedConversa.id);
      };
    }
  }, [selectedConversa, socket, joinConversa, leaveConversa]);

  // Configurar listeners do socket
  useEffect(() => {
    if (!socket) return;

    const handleMessageReceived = (mensagem: any) => {
      queryClient.invalidateQueries(['mensagens', mensagem.conversaId]);
      queryClient.invalidateQueries(['conversas', user?.empresaId]);

      // Mostrar notificação se a mensagem não é do usuário atual
      if (mensagem.remetente !== 'agente') {
        toast.success(`Nova mensagem de ${mensagem.remetente}`);
      }
    };

    const handleUserTyping = (data: any) => {
      setTypingUsers((prev) => [
        ...prev.filter((id) => id !== data.usuarioId),
        data.usuarioId,
      ]);
    };

    const handleUserStoppedTyping = (data: any) => {
      setTypingUsers((prev) => prev.filter((id) => id !== data.usuarioId));
    };

    socket.on('message_received', handleMessageReceived);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stopped_typing', handleUserStoppedTyping);

    return () => {
      socket.off('message_received', handleMessageReceived);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stopped_typing', handleUserStoppedTyping);
    };
  }, [socket, queryClient, user?.empresaId]);

  const handleSendMessage = (conteudo: string, tipo: string = 'TEXTO') => {
    if (!selectedConversa || !conteudo.trim()) return;

    sendMessageMutation.mutate({
      conversaId: selectedConversa.id,
      conteudo,
      tipo,
    });

    // Enviar via socket também
    sendMessage({
      conversaId: selectedConversa.id,
      conteudo,
      tipo,
      remetente: 'agente',
      agenteId: user?.id,
    });
  };

  const handleGenerateIAResponse = () => {
    if (!selectedConversa || !mensagens || mensagens.length === 0) return;

    const ultimaMensagemCliente = mensagens
      .filter((msg: any) => msg.remetente === 'cliente')
      .pop();

    if (ultimaMensagemCliente) {
      generateIAResponseMutation.mutate({
        conversaId: selectedConversa.id,
        mensagem: ultimaMensagemCliente.conteudo,
      });
    }
  };

  const handleTypingStart = () => {
    if (selectedConversa) {
      startTyping(selectedConversa.id);
      setIsTyping(true);
    }
  };

  const handleTypingStop = () => {
    if (selectedConversa) {
      stopTyping(selectedConversa.id);
      setIsTyping(false);
    }
  };

  if (loadingConversas) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-200px)] bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Lista de Conversas */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        {/* Header da Lista */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Conversas</h3>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Search className="h-4 w-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Filter className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar conversas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Filtros */}
          <div className="mt-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="TODOS">Todas as conversas</option>
              <option value="ABERTO">Abertas</option>
              <option value="EM_ANDAMENTO">Em andamento</option>
              <option value="FECHADO">Fechadas</option>
            </select>
          </div>
        </div>

        {/* Lista de Conversas */}
        <div className="flex-1 overflow-y-auto">
          <ConversationList
            conversas={filteredConversas}
            selectedConversa={selectedConversa}
            onSelectConversa={setSelectedConversa}
          />
        </div>
      </div>

      {/* Área de Chat */}
      <div className="flex-1 flex flex-col">
        {selectedConversa ? (
          <>
            {/* Header do Chat */}
            <ChatHeader
              conversa={selectedConversa}
              onGenerateIA={handleGenerateIAResponse}
              isGeneratingIA={generateIAResponseMutation.isLoading}
            />

            {/* Lista de Mensagens */}
            <div className="flex-1 overflow-y-auto">
              <MessageList
                mensagens={mensagens || []}
                isLoading={loadingMensagens}
                conversa={selectedConversa}
              />
              {typingUsers.length > 0 && (
                <TypingIndicator users={typingUsers} />
              )}
            </div>

            {/* Input de Mensagem */}
            <div className="border-t border-gray-200 p-4">
              <MessageInput
                onSendMessage={handleSendMessage}
                onTypingStart={handleTypingStart}
                onTypingStop={handleTypingStop}
                isSending={sendMessageMutation.isLoading}
                disabled={!selectedConversa}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Selecione uma conversa</p>
              <p className="text-sm">
                Escolha uma conversa da lista para começar o atendimento
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
