'use client';

import { Button } from '@/components/ui/button';
import { MessageCircle, Users } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex-1 flex items-center justify-center bg-muted/30">
      <div className="text-center space-y-6 px-4 max-w-md">
        {/* Illustration Placeholder */}
        <div className="flex justify-center">
          <div className="w-64 h-64 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageCircle className="w-32 h-32 text-primary/30" />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">
            Mantenha contato com seus amigos e familiares em tempo real
          </h1>
          <p className="text-muted-foreground">
            Comece uma nova conversa ou continue uma existente
          </p>
        </div>

        {/* CTA Button */}
        <Link href="/new-chat">
          <Button size="lg" className="gap-2">
            <Users className="h-5 w-5" />
            Iniciar conversa
          </Button>
        </Link>
      </div>
    </div>
  );
}

