'use client';

import { MessageList } from '@/components/chat/MessageList';
import { MessageInput } from '@/components/chat/MessageInput';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '@/lib/api';
import { useParams } from 'next/navigation';
import { Video, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

export default function ChatPage() {
  const params = useParams();
  const chatId = params.id as string;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { 
    joinChat, 
    leaveChat, 
    sendMessage: sendSocketMessage,
    startTyping,
    stopTyping,
    onMessage,
    onTyping,
    onStopTyping,
    onNewMessage,
    offMessage,
    offTyping,
    offStopTyping,
    offNewMessage,
    isConnected,
  } = useSocket();
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  // Fetch chat details
  const { data: chat } = useQuery(
    ['chat', chatId],
    async () => {
      const response = await api.get(`/api/chats/${chatId}`);
      return response.data;
    },
    { enabled: !!chatId }
  );

  // Fetch messages
  const { data: messages = [] } = useQuery(
    ['messages', chatId],
    async () => {
      const response = await api.get(`/api/chats/${chatId}/messages`);
      return response.data;
    },
    {
      enabled: !!chatId,
    }
  );

  // Send message mutation
  const sendMessageMutation = useMutation(
    async (data: { content?: string; type: string; fileUrl?: string; fileSize?: number; mimeType?: string }) => {
      const response = await api.post(`/api/chats/${chatId}/messages`, {
        chatId,
        ...data,
      });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['messages', chatId]);
        queryClient.invalidateQueries(['chats']);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao enviar mensagem');
      },
    }
  );

  // Join chat room when component mounts
  useEffect(() => {
    if (chatId && isConnected) {
      joinChat(chatId);
      return () => {
        leaveChat(chatId);
      };
    }
  }, [chatId, isConnected, joinChat, leaveChat]);

  // Socket event listeners
  useEffect(() => {
    if (!isConnected) return;

    const handleMessage = (message: any) => {
      // Update messages query cache
      queryClient.setQueryData(['messages', chatId], (old: any[] = []) => {
        // Check if message already exists
        if (old.some((m) => m.id === message.id)) {
          return old;
        }
        return [...old, message];
      });

      // Update chats list
      queryClient.invalidateQueries(['chats']);

      // Mark as read if it's our message or scroll to bottom
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    };

    const handleTyping = (data: { userId: string; chatId: string }) => {
      if (data.chatId === chatId && data.userId !== user?.id) {
        setTypingUsers((prev) => new Set(prev).add(data.userId));
      }
    };

    const handleStopTyping = (data: { userId: string; chatId: string }) => {
      if (data.chatId === chatId) {
        setTypingUsers((prev) => {
          const next = new Set(prev);
          next.delete(data.userId);
          return next;
        });
      }
    };

    const handleNewMessage = (data: { chatId: string; message: any }) => {
      // Update chats list when new message arrives
      queryClient.invalidateQueries(['chats']);
    };

    onMessage(handleMessage);
    onTyping(handleTyping);
    onStopTyping(handleStopTyping);
    onNewMessage(handleNewMessage);

    return () => {
      offMessage();
      offTyping();
      offStopTyping();
      offNewMessage();
    };
  }, [
    chatId,
    user?.id,
    isConnected,
    onMessage,
    onTyping,
    onStopTyping,
    onNewMessage,
    offMessage,
    offTyping,
    offStopTyping,
    offNewMessage,
    queryClient,
  ]);

  // Mark as read when viewing chat
  useEffect(() => {
    if (chatId && user) {
      api.put(`/api/chats/${chatId}/messages/read`).catch(() => {
        // Ignore errors
      });
    }
  }, [chatId, user]);

  const handleSend = (
    content: string,
    type: 'TEXT' | 'IMAGE' | 'AUDIO' | 'VIDEO' | 'FILE' | 'EMOJI',
    options?: { fileUrl?: string; fileSize?: number; mimeType?: string }
  ) => {
    const messageData = {
      chatId,
      content: type === 'TEXT' ? content : undefined,
      type,
      fileUrl: options?.fileUrl || (type !== 'TEXT' ? content : undefined),
      fileSize: options?.fileSize,
      mimeType: options?.mimeType,
    };

    // Send via socket for real-time
    sendSocketMessage(messageData);

    // Also send via API for persistence
    sendMessageMutation.mutate({
      content: messageData.content,
      type: messageData.type,
      fileUrl: messageData.fileUrl,
      fileSize: messageData.fileSize,
      mimeType: messageData.mimeType,
    });
  };

  const handleTyping = () => {
    if (isConnected && chatId) {
      startTyping(chatId);
    }
  };

  const handleStopTyping = () => {
    if (isConnected && chatId) {
      stopTyping(chatId);
    }
  };

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const otherUser = chat.otherUser;
  const displayName = chat.name || otherUser?.name || 'Usuário';

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border p-4 bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={otherUser?.avatar} />
              <AvatarFallback>
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold">{displayName}</h2>
                {otherUser?.isOnline && (
                  <Badge variant="outline" className="text-xs">
                    Online
                  </Badge>
                )}
              </div>
              {typingUsers.size > 0 && (
                <p className="text-xs text-muted-foreground italic">
                  {otherUser?.name} está digitando...
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Video className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <MessageList
          ref={scrollRef}
          messages={messages}
          currentUserId={user?.id || ''}
        />
      </div>

      {/* Input */}
      <MessageInput
        onSend={handleSend}
        onTyping={handleTyping}
        onStopTyping={handleStopTyping}
        disabled={sendMessageMutation.isLoading || !isConnected}
      />
    </div>
  );
}

