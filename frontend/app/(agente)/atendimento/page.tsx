'use client';

import ChatInterface from '@/components/chat/ChatInterface';

export default function AtendimentoPage() {
  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Atendimento ao Cliente
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie suas conversas e forneça suporte aos clientes
          </p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <ChatInterface />
      </div>
    </div>
  );
}
