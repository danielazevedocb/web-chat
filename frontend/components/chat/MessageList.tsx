'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useEffect, useRef, forwardRef } from 'react';

interface Message {
  id: string;
  content?: string;
  type: 'TEXT' | 'IMAGE' | 'AUDIO' | 'VIDEO' | 'FILE' | 'EMOJI';
  fileUrl?: string;
  mimeType?: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  replyTo?: {
    id: string;
    content: string;
    sender: {
      name: string;
    };
  };
}

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}

export const MessageList = forwardRef<HTMLDivElement, MessageListProps>(
  ({ messages, currentUserId }, ref) => {
    const internalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const scrollElement = ref && 'current' in ref ? ref.current : internalRef.current;
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }, [messages, ref]);

    return (
      <div ref={ref || internalRef} className="flex-1 overflow-y-auto p-4">
      <div className="space-y-4">
        {messages.map((message) => {
          const isOwn = message.sender.id === currentUserId;
          const isImage = message.type === 'IMAGE' && message.fileUrl;
          const isVideo = message.type === 'VIDEO' && message.fileUrl;
          const isFile = message.type === 'FILE' && message.fileUrl;
          const isAudio = message.type === 'AUDIO' && message.fileUrl;

          return (
            <div
              key={message.id}
              className={cn(
                'flex gap-3',
                isOwn ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              {!isOwn && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={message.sender.avatar} />
                  <AvatarFallback>
                    {message.sender.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}

              <div
                className={cn(
                  'flex flex-col gap-1 max-w-[70%]',
                  isOwn ? 'items-end' : 'items-start'
                )}
              >
                {!isOwn && (
                  <span className="text-xs text-muted-foreground px-2">
                    {message.sender.name}
                  </span>
                )}

                {message.replyTo && (
                  <div className="text-xs text-muted-foreground px-2 mb-1 border-l-2 border-primary/30 pl-2">
                    Respondendo a {message.replyTo.sender.name}:{' '}
                    {message.replyTo.content}
                  </div>
                )}

                <div
                  className={cn(
                    'rounded-lg px-4 py-2',
                    isOwn
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  )}
                >
                  {isImage && (
                    <div className="mb-2">
                      <img
                        src={message.fileUrl}
                        alt="Imagem"
                        className="rounded-lg max-w-full h-auto max-h-64"
                      />
                    </div>
                  )}

                  {isVideo && (
                    <div className="mb-2">
                      <video
                        src={message.fileUrl}
                        controls
                        className="rounded-lg max-w-full h-auto"
                      />
                    </div>
                  )}

                  {isAudio && (
                    <div className="mb-2">
                      <audio src={message.fileUrl} controls className="w-full" />
                    </div>
                  )}

                  {isFile && (
                    <div className="mb-2">
                      <a
                        href={message.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm underline"
                      >
                        📎 Arquivo
                      </a>
                    </div>
                  )}

                  {message.content && (
                    <p className="whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  )}
                </div>

                <span className="text-xs text-muted-foreground px-2">
                  {format(new Date(message.createdAt), 'HH:mm', {
                    locale: ptBR,
                  })}
                </span>
              </div>
            </div>
          );
        })}
        </div>
      </div>
    );
  }
);

MessageList.displayName = 'MessageList';
