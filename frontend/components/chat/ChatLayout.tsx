'use client';

import { ReactNode } from 'react';
import { ChatSidebar } from './ChatSidebar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useState } from 'react';

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

interface ChatLayoutProps {
  children: ReactNode;
  chats: Chat[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function ChatLayout({
  children,
  chats,
  searchQuery,
  onSearchChange,
}: ChatLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-72 lg:w-80 flex-shrink-0">
        <ChatSidebar
          chats={chats}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
        />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden fixed top-4 left-4 z-50 bg-background/80 backdrop-blur-sm"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0 sm:w-96">
          <ChatSidebar
            chats={chats}
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {children}
      </main>
    </div>
  );
}

