'use client';

import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinChat: (chatId: string) => void;
  leaveChat: (chatId: string) => void;
  sendMessage: (data: {
    chatId: string;
    content?: string;
    type: 'TEXT' | 'IMAGE' | 'AUDIO' | 'VIDEO' | 'FILE' | 'EMOJI';
    fileUrl?: string;
    fileSize?: number;
    mimeType?: string;
    replyToId?: string;
  }) => void;
  startTyping: (chatId: string) => void;
  stopTyping: (chatId: string) => void;
  markMessageAsRead: (messageId: string) => void;
  onMessage: (callback: (message: any) => void) => void;
  onTyping: (callback: (data: { userId: string; chatId: string }) => void) => void;
  onStopTyping: (callback: (data: { userId: string; chatId: string }) => void) => void;
  onUserOnline: (callback: (data: { userId: string }) => void) => void;
  onUserOffline: (callback: (data: { userId: string }) => void) => void;
  onMessageRead: (callback: (data: { messageId: string; userId: string }) => void) => void;
  onNewMessage: (callback: (data: { chatId: string; message: any }) => void) => void;
  offMessage: () => void;
  offTyping: () => void;
  offStopTyping: () => void;
  offUserOnline: () => void;
  offUserOffline: () => void;
  offMessageRead: () => void;
  offNewMessage: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { token, user } = useAuth();

  useEffect(() => {
    if (token && user) {
      const newSocket = io(
        `${process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'}/chat`,
        {
          auth: {
            userId: user.id,
            token,
          },
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 5,
        },
      );

      newSocket.on('connect', () => {
        console.log('✅ Conectado ao servidor Socket.io');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('❌ Desconectado do servidor Socket.io');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ Erro de conexão:', error);
        setIsConnected(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [token, user]);

  const joinChat = useCallback((chatId: string) => {
    if (socket) {
      socket.emit('join-chat', { chatId });
    }
  }, [socket]);

  const leaveChat = useCallback((chatId: string) => {
    if (socket) {
      socket.emit('leave-chat', { chatId });
    }
  }, [socket]);

  const sendMessage = useCallback((data: {
    chatId: string;
    content?: string;
    type: 'TEXT' | 'IMAGE' | 'AUDIO' | 'VIDEO' | 'FILE' | 'EMOJI';
    fileUrl?: string;
    fileSize?: number;
    mimeType?: string;
    replyToId?: string;
  }) => {
    if (socket && user) {
      socket.emit('send-message', {
        ...data,
        userId: user.id,
      });
    }
  }, [socket, user]);

  const startTyping = useCallback((chatId: string) => {
    if (socket && user) {
      socket.emit('typing', { chatId, userId: user.id });
    }
  }, [socket, user]);

  const stopTyping = useCallback((chatId: string) => {
    if (socket && user) {
      socket.emit('stop-typing', { chatId, userId: user.id });
    }
  }, [socket, user]);

  const markMessageAsRead = useCallback((messageId: string) => {
    if (socket && user) {
      socket.emit('message-read', { messageId, userId: user.id });
    }
  }, [socket, user]);

  const onMessage = useCallback((callback: (message: any) => void) => {
    if (socket) {
      socket.on('message', callback);
    }
  }, [socket]);

  const onTyping = useCallback((callback: (data: { userId: string; chatId: string }) => void) => {
    if (socket) {
      socket.on('typing', callback);
    }
  }, [socket]);

  const onStopTyping = useCallback((callback: (data: { userId: string; chatId: string }) => void) => {
    if (socket) {
      socket.on('stop-typing', callback);
    }
  }, [socket]);

  const onUserOnline = useCallback((callback: (data: { userId: string }) => void) => {
    if (socket) {
      socket.on('user-online', callback);
    }
  }, [socket]);

  const onUserOffline = useCallback((callback: (data: { userId: string }) => void) => {
    if (socket) {
      socket.on('user-offline', callback);
    }
  }, [socket]);

  const onMessageRead = useCallback((callback: (data: { messageId: string; userId: string }) => void) => {
    if (socket) {
      socket.on('message-read', callback);
    }
  }, [socket]);

  const onNewMessage = useCallback((callback: (data: { chatId: string; message: any }) => void) => {
    if (socket) {
      socket.on('new-message', callback);
    }
  }, [socket]);

  const offMessage = useCallback(() => {
    if (socket) {
      socket.off('message');
    }
  }, [socket]);

  const offTyping = useCallback(() => {
    if (socket) {
      socket.off('typing');
    }
  }, [socket]);

  const offStopTyping = useCallback(() => {
    if (socket) {
      socket.off('stop-typing');
    }
  }, [socket]);

  const offUserOnline = useCallback(() => {
    if (socket) {
      socket.off('user-online');
    }
  }, [socket]);

  const offUserOffline = useCallback(() => {
    if (socket) {
      socket.off('user-offline');
    }
  }, [socket]);

  const offMessageRead = useCallback(() => {
    if (socket) {
      socket.off('message-read');
    }
  }, [socket]);

  const offNewMessage = useCallback(() => {
    if (socket) {
      socket.off('new-message');
    }
  }, [socket]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinChat,
        leaveChat,
        sendMessage,
        startTyping,
        stopTyping,
        markMessageAsRead,
        onMessage,
        onTyping,
        onStopTyping,
        onUserOnline,
        onUserOffline,
        onMessageRead,
        onNewMessage,
        offMessage,
        offTyping,
        offStopTyping,
        offUserOnline,
        offUserOffline,
        offMessageRead,
        offNewMessage,
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
