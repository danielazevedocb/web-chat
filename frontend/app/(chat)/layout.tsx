'use client';

import { ChatLayout } from '@/components/chat/ChatLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';

export default function ChatLayoutWrapper({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { 
    isConnected, 
    onNewMessage, 
    onUserOnline,
    onUserOffline,
    offNewMessage, 
    offUserOnline,
    offUserOffline,
  } = useSocket();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: chats = [] } = useQuery(
    ['chats', searchQuery],
    async () => {
      const params = searchQuery ? { search: searchQuery } : {};
      const response = await api.get('/api/chats', { params });
      return response.data;
    },
    {
      enabled: isAuthenticated,
      refetchInterval: 30000, // Refetch a cada 30 segundos
    }
  );

  // Listen for new messages and user status changes
  useEffect(() => {
    if (!isConnected) return;

    const handleNewMessage = () => {
      queryClient.invalidateQueries(['chats']);
    };

    const handleUserOnline = () => {
      queryClient.invalidateQueries(['chats']);
    };

    const handleUserOffline = () => {
      queryClient.invalidateQueries(['chats']);
    };

    onNewMessage(handleNewMessage);
    onUserOnline(handleUserOnline);
    onUserOffline(handleUserOffline);

    return () => {
      offNewMessage();
      offUserOnline();
      offUserOffline();
    };
  }, [isConnected, onNewMessage, onUserOnline, onUserOffline, offNewMessage, offUserOnline, offUserOffline, queryClient]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ChatLayout chats={chats} searchQuery={searchQuery} onSearchChange={setSearchQuery}>
      {children}
    </ChatLayout>
  );
}
