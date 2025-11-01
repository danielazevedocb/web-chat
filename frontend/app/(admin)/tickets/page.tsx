'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText, MoreVertical, Plus, Search, Edit } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

const ticketSchema = z.object({
  titulo: z.string().min(2, 'Título deve ter pelo menos 2 caracteres'),
  status: z.enum(['ABERTO', 'EM_ANDAMENTO', 'AGUARDANDO', 'RESOLVIDO', 'FECHADO']),
  prioridade: z.enum(['BAIXA', 'MEDIA', 'ALTA', 'URGENTE']),
  clienteId: z.string().min(1, 'Cliente é obrigatório'),
  agenteId: z.string().optional(),
});

type TicketForm = z.infer<typeof ticketSchema>;

interface Ticket {
  id: string;
  titulo?: string;
  status: 'ABERTO' | 'EM_ANDAMENTO' | 'AGUARDANDO' | 'RESOLVIDO' | 'FECHADO';
  prioridade: 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';
  cliente: {
    id: string;
    nome: string;
    email?: string;
  };
  agente?: {
    id: string;
    nome: string;
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

export default function TicketsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TicketForm>({
    resolver: zodResolver(ticketSchema),
  });

  const empresaId = user?.empresaId;

  const fetchTickets = async () => {
    if (!empresaId) return;
    try {
      const response = await api.get(`/api/tickets?empresaId=${empresaId}`);
      setTickets(response.data);
    } catch (error: any) {
      toast.error('Erro ao carregar tickets');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClientes = async () => {
    if (!empresaId) return;
    try {
      const response = await api.get(`/api/clientes?empresaId=${empresaId}`);
      setClientes(response.data);
    } catch (error: any) {
      console.error(error);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const response = await api.get('/api/usuarios');
      setUsuarios(response.data.filter((u: any) => u.empresaId === empresaId));
    } catch (error: any) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (empresaId) {
      fetchTickets();
      fetchClientes();
      fetchUsuarios();
    }
  }, [empresaId]);

  const onSubmit = async (data: TicketForm) => {
    if (!empresaId) return;
    try {
      const payload = {
        ...data,
        empresaId,
        canal: 'SISTEMA',
      };

      if (selectedTicket) {
        await api.patch(`/api/tickets/${selectedTicket.id}`, payload);
        toast.success('Ticket atualizado com sucesso!');
      } else {
        await api.post('/api/tickets', payload);
        toast.success('Ticket criado com sucesso!');
      }
      setIsDialogOpen(false);
      reset();
      setSelectedTicket(null);
      fetchTickets();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao salvar ticket');
    }
  };

  const handleEdit = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    reset({
      titulo: ticket.titulo || '',
      status: ticket.status,
      prioridade: ticket.prioridade,
      clienteId: ticket.cliente.id,
      agenteId: ticket.agente?.id || '',
    });
    setIsDialogOpen(true);
  };

  const handleNew = () => {
    setSelectedTicket(null);
    reset({
      status: 'ABERTO',
      prioridade: 'MEDIA',
    });
    setIsDialogOpen(true);
  };

  const filteredTickets = tickets.filter((ticket) =>
    ticket.titulo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.cliente.nome.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!empresaId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Empresa não identificada.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie os tickets de atendimento
          </p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Ticket
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Tickets</CardTitle>
              <CardDescription>
                {filteredTickets.length} ticket(s) encontrado(s)
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar tickets..."
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
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum ticket encontrado</h3>
              <p className="mt-1 text-sm text-gray-500">
                Comece criando um novo ticket.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Título
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
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
                      Criado em
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {ticket.titulo || 'Sem título'}
                        </div>
                        {ticket._count && (
                          <div className="text-sm text-gray-500">
                            {ticket._count.mensagens} mensagem(ns)
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{ticket.cliente.nome}</div>
                        {ticket.cliente.email && (
                          <div className="text-sm text-gray-500">{ticket.cliente.email}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {ticket.agente ? (
                          <div className="text-sm text-gray-900">{ticket.agente.nome}</div>
                        ) : (
                          <span className="text-sm text-gray-400">Não atribuído</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={statusColors[ticket.status]}>
                          {ticket.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={prioridadeColors[ticket.prioridade]}>
                          {ticket.prioridade}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {format(new Date(ticket.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(ticket)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTicket ? 'Editar Ticket' : 'Novo Ticket'}
            </DialogTitle>
            <DialogDescription>
              {selectedTicket
                ? 'Atualize as informações do ticket'
                : 'Preencha os dados para criar um novo ticket'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                {...register('titulo')}
                placeholder="Título do ticket"
              />
              {errors.titulo && (
                <p className="text-sm text-red-500 mt-1">{errors.titulo.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clienteId">Cliente *</Label>
                <select
                  id="clienteId"
                  {...register('clienteId')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Selecione um cliente</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </option>
                  ))}
                </select>
                {errors.clienteId && (
                  <p className="text-sm text-red-500 mt-1">{errors.clienteId.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="agenteId">Agente</Label>
                <select
                  id="agenteId"
                  {...register('agenteId')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Não atribuído</option>
                  {usuarios
                    .filter((u) => u.role === 'AGENTE')
                    .map((usuario) => (
                      <option key={usuario.id} value={usuario.id}>
                        {usuario.nome}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status *</Label>
                <select
                  id="status"
                  {...register('status')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="ABERTO">Aberto</option>
                  <option value="EM_ANDAMENTO">Em Andamento</option>
                  <option value="AGUARDANDO">Aguardando</option>
                  <option value="RESOLVIDO">Resolvido</option>
                  <option value="FECHADO">Fechado</option>
                </select>
                {errors.status && (
                  <p className="text-sm text-red-500 mt-1">{errors.status.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="prioridade">Prioridade *</Label>
                <select
                  id="prioridade"
                  {...register('prioridade')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="BAIXA">Baixa</option>
                  <option value="MEDIA">Média</option>
                  <option value="ALTA">Alta</option>
                  <option value="URGENTE">Urgente</option>
                </select>
                {errors.prioridade && (
                  <p className="text-sm text-red-500 mt-1">{errors.prioridade.message}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  reset();
                  setSelectedTicket(null);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : selectedTicket ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

