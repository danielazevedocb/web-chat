'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageSquare, Search, Eye } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

interface Conversa {
  id: string;
  titulo?: string;
  status: 'ABERTO' | 'EM_ANDAMENTO' | 'AGUARDANDO' | 'RESOLVIDO' | 'FECHADO';
  prioridade: 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';
  canal: string;
  cliente: {
    id: string;
    nome: string;
    email?: string;
    avatar?: string;
  };
  agente?: {
    id: string;
    nome: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
  _count?: {
    mensagens: number;
  };
}

const statusColors = {
  ABERTO: 'bg-blue-100 text-blue-800',
  EM_ANDAMENTO: 'bg-yellow-100 text-yellow-800',
  AGUARDANDO: 'bg-orange-100 text-orange-800',
  RESOLVIDO: 'bg-green-100 text-green-800',
  FECHADO: 'bg-gray-100 text-gray-800',
};

const prioridadeColors = {
  BAIXA: 'bg-gray-100 text-gray-800',
  MEDIA: 'bg-blue-100 text-blue-800',
  ALTA: 'bg-orange-100 text-orange-800',
  URGENTE: 'bg-red-100 text-red-800',
};

export default function ConversasPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchConversas = async () => {
    try {
      const response = await api.get('/api/chats');
      setConversas(response.data);
    } catch (error: any) {
      toast.error('Erro ao carregar conversas');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConversas();
  }, []);

  const filteredConversas = conversas.filter((conversa) =>
    conversa.titulo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conversa.cliente.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conversa.cliente.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleView = (id: string) => {
    router.push(`/chat/${id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Conversas</h1>
          <p className="mt-1 text-sm text-gray-500">
            Visualize e gerencie todas as conversas
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Conversas</CardTitle>
              <CardDescription>
                {filteredConversas.length} conversa(s) encontrada(s)
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar conversas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredConversas.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma conversa encontrada</h3>
              <p className="mt-1 text-sm text-gray-500">
                Não há conversas disponíveis no momento.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Canal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Agente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prioridade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mensagens
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Última Atualização
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredConversas.map((conversa) => (
                    <tr key={conversa.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {conversa.cliente.avatar ? (
                              <img
                                className="h-10 w-10 rounded-full"
                                src={conversa.cliente.avatar}
                                alt={conversa.cliente.nome}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <MessageSquare className="h-5 w-5 text-primary" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {conversa.cliente.nome}
                            </div>
                            {conversa.cliente.email && (
                              <div className="text-sm text-gray-500">{conversa.cliente.email}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{conversa.canal}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {conversa.agente ? (
                          <div className="text-sm text-gray-900">{conversa.agente.nome}</div>
                        ) : (
                          <span className="text-sm text-gray-400">Não atribuído</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={statusColors[conversa.status]}>
                          {conversa.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={prioridadeColors[conversa.prioridade]}>
                          {conversa.prioridade}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {conversa._count?.mensagens || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {format(new Date(conversa.updatedAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(conversa.id)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

