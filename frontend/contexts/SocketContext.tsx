'use client';

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinConversa: (conversaId: string) => void;
  leaveConversa: (conversaId: string) => void;
  sendMessage: (data: any) => void;
  startTyping: (conversaId: string) => void;
  stopTyping: (conversaId: string) => void;
  markMessagesAsRead: (conversaId: string, agenteId: string) => void;
  updateConversaStatus: (
    conversaId: string,
    status: string,
    agenteId?: string,
  ) => void;
  updateConversaPrioridade: (conversaId: string, prioridade: string) => void;
  generateIAResponse: (
    conversaId: string,
    mensagem: string,
    empresaId: string,
  ) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { token, user } = useAuth();

  useEffect(() => {
    if (token && user) {
      const newSocket = io(
        process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001',
        {
          auth: {
            token,
          },
          transports: ['websocket'],
        },
      );

      newSocket.on('connect', () => {
        console.log('Conectado ao servidor Socket.io');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Desconectado do servidor Socket.io');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Erro de conexão:', error);
        setIsConnected(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [token, user]);

  const joinConversa = (conversaId: string) => {
    if (socket) {
      socket.emit('join_conversa', { conversaId });
    }
  };

  const leaveConversa = (conversaId: string) => {
    if (socket) {
      socket.emit('leave_conversa', { conversaId });
    }
  };

  const sendMessage = (data: any) => {
    if (socket) {
      socket.emit('send_message', data);
    }
  };

  const startTyping = (conversaId: string) => {
    if (socket) {
      socket.emit('typing_start', { conversaId, usuarioId: user?.id });
    }
  };

  const stopTyping = (conversaId: string) => {
    if (socket) {
      socket.emit('typing_stop', { conversaId, usuarioId: user?.id });
    }
  };

  const markMessagesAsRead = (conversaId: string, agenteId: string) => {
    if (socket) {
      socket.emit('mark_read', { conversaId, agenteId });
    }
  };

  const updateConversaStatus = (
    conversaId: string,
    status: string,
    agenteId?: string,
  ) => {
    if (socket) {
      socket.emit('update_conversa_status', { conversaId, status, agenteId });
    }
  };

  const updateConversaPrioridade = (conversaId: string, prioridade: string) => {
    if (socket) {
      socket.emit('update_conversa_prioridade', { conversaId, prioridade });
    }
  };

  const generateIAResponse = (
    conversaId: string,
    mensagem: string,
    empresaId: string,
  ) => {
    if (socket) {
      socket.emit('generate_ia_response', { conversaId, mensagem, empresaId });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinConversa,
        leaveConversa,
        sendMessage,
        startTyping,
        stopTyping,
        markMessagesAsRead,
        updateConversaStatus,
        updateConversaPrioridade,
        generateIAResponse,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket deve ser usado dentro de um SocketProvider');
  }
  return context;
}
