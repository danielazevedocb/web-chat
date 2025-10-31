'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LogOut, Plus, Search, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Chat {
  id: string;
  name: string;
  otherUser?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    isOnline: boolean;
  };
  lastMessage?: {
    content: string;
    createdAt: string;
    sender: {
      id: string;
      name: string;
    };
  };
  unreadCount: number;
  updatedAt: string;
}

interface ChatSidebarProps {
  chats: Chat[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function ChatSidebar({ chats, searchQuery, onSearchChange }: ChatSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="flex h-full flex-col bg-card border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">Q</span>
            </div>
            <span className="text-xl font-bold">QRP Talk</span>
          </div>
          <ThemeToggle />
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar conversas..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* New Chat Button */}
        <Link href="/new-chat">
          <Button className="w-full mt-3" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nova Conversa
          </Button>
        </Link>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {chats.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Nenhuma conversa encontrada
            </div>
          ) : (
            chats.map((chat) => {
              const isActive = pathname === `/chat/${chat.id}`;
              const otherUser = chat.otherUser;
              const displayName = chat.name || otherUser?.name || 'Usuário';
              const displayAvatar = otherUser?.avatar;

              return (
                <Link key={chat.id} href={`/chat/${chat.id}`}>
                  <div
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors',
                      isActive
                        ? 'bg-primary/10 border border-primary/20'
                        : 'hover:bg-muted'
                    )}
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={displayAvatar} alt={displayName} />
                        <AvatarFallback>
                          {displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {otherUser?.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-card rounded-full" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium truncate">{displayName}</p>
                        {chat.lastMessage && (
                          <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                            {format(new Date(chat.lastMessage.createdAt), 'HH:mm', {
                              locale: ptBR,
                            })}
                          </span>
                        )}
                      </div>
                      {chat.lastMessage && (
                        <p className="text-xs text-muted-foreground truncate">
                          {chat.lastMessage.sender.name}: {chat.lastMessage.content}
                        </p>
                      )}
                    </div>

                    {chat.unreadCount > 0 && (
                      <Badge variant="default" className="ml-auto">
                        {chat.unreadCount}
                      </Badge>
                    )}
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </ScrollArea>

      <Separator />

      {/* Footer - User Profile */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback>
              {user?.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/profile">
            <Button variant="ghost" size="sm" className="flex-1">
              <Settings className="h-4 w-4 mr-2" />
              Perfil
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

