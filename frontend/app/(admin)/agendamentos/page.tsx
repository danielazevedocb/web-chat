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
import { Calendar, MoreVertical, Plus, Search, Edit } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

const agendamentoSchema = z.object({
  titulo: z.string().min(2, 'Título deve ter pelo menos 2 caracteres'),
  descricao: z.string().optional(),
  dataHora: z.string().min(1, 'Data e hora são obrigatórias'),
  duracao: z.number().min(15, 'Duração mínima é 15 minutos'),
  status: z.enum(['AGENDADO', 'CONFIRMADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO', 'REAGENDADO']),
  tipo: z.string().optional(),
  clienteId: z.string().min(1, 'Cliente é obrigatório'),
  agenteId: z.string().optional(),
});

type AgendamentoForm = z.infer<typeof agendamentoSchema>;

interface Agendamento {
  id: string;
  titulo: string;
  descricao?: string;
  dataHora: string;
  duracao: number;
  status: 'AGENDADO' | 'CONFIRMADO' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO' | 'REAGENDADO';
  tipo?: string;
  cliente: {
    id: string;
    nome: string;
  };
  agente?: {
    id: string;
    nome: string;
  };
  createdAt: string;
}

const statusColors = {
  AGENDADO: 'bg-blue-100 text-blue-800',
  CONFIRMADO: 'bg-green-100 text-green-800',
  EM_ANDAMENTO: 'bg-yellow-100 text-yellow-800',
  CONCLUIDO: 'bg-gray-100 text-gray-800',
  CANCELADO: 'bg-red-100 text-red-800',
  REAGENDADO: 'bg-orange-100 text-orange-800',
};

export default function AgendamentosPage() {
  const { user } = useAuth();
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState<Agendamento | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AgendamentoForm>({
    resolver: zodResolver(agendamentoSchema),
  });

  const empresaId = user?.empresaId;

  const fetchAgendamentos = async () => {
    if (!empresaId) return;
    try {
      const response = await api.get(`/api/agendamentos?empresaId=${empresaId}`);
      setAgendamentos(response.data);
    } catch (error: any) {
      toast.error('Erro ao carregar agendamentos');
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
      fetchAgendamentos();
      fetchClientes();
      fetchUsuarios();
    }
  }, [empresaId]);

  const onSubmit = async (data: AgendamentoForm) => {
    if (!empresaId) return;
    try {
      const payload = {
        ...data,
        empresaId,
        dataHora: new Date(data.dataHora).toISOString(),
      };

      if (selectedAgendamento) {
        await api.patch(`/api/agendamentos/${selectedAgendamento.id}`, payload);
        toast.success('Agendamento atualizado com sucesso!');
      } else {
        await api.post('/api/agendamentos', payload);
        toast.success('Agendamento criado com sucesso!');
      }
      setIsDialogOpen(false);
      reset();
      setSelectedAgendamento(null);
      fetchAgendamentos();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao salvar agendamento');
    }
  };

  const handleEdit = (agendamento: Agendamento) => {
    setSelectedAgendamento(agendamento);
    const dataHora = new Date(agendamento.dataHora);
    const formattedDate = `${dataHora.toISOString().slice(0, 16)}`;
    reset({
      titulo: agendamento.titulo,
      descricao: agendamento.descricao || '',
      dataHora: formattedDate,
      duracao: agendamento.duracao,
      status: agendamento.status,
      tipo: agendamento.tipo || '',
      clienteId: agendamento.cliente.id,
      agenteId: agendamento.agente?.id || '',
    });
    setIsDialogOpen(true);
  };

  const handleNew = () => {
    setSelectedAgendamento(null);
    reset({
      status: 'AGENDADO',
      duracao: 30,
    });
    setIsDialogOpen(true);
  };

  const filteredAgendamentos = agendamentos.filter((agendamento) =>
    agendamento.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agendamento.cliente.nome.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h1 className="text-2xl font-bold text-gray-900">Agendamentos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie os agendamentos de atendimento
          </p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Agendamentos</CardTitle>
              <CardDescription>
                {filteredAgendamentos.length} agendamento(s) encontrado(s)
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar agendamentos..."
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
          ) : filteredAgendamentos.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum agendamento encontrado</h3>
              <p className="mt-1 text-sm text-gray-500">
                Comece criando um novo agendamento.
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
                      Data/Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duração
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAgendamentos.map((agendamento) => (
                    <tr key={agendamento.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{agendamento.titulo}</div>
                        {agendamento.descricao && (
                          <div className="text-sm text-gray-500">{agendamento.descricao}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{agendamento.cliente.nome}</div>
                        {agendamento.agente && (
                          <div className="text-sm text-gray-500">Agente: {agendamento.agente.nome}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {format(new Date(agendamento.dataHora), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{agendamento.duracao} min</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={statusColors[agendamento.status]}>
                          {agendamento.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(agendamento)}>
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
              {selectedAgendamento ? 'Editar Agendamento' : 'Novo Agendamento'}
            </DialogTitle>
            <DialogDescription>
              {selectedAgendamento
                ? 'Atualize as informações do agendamento'
                : 'Preencha os dados para criar um novo agendamento'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                {...register('titulo')}
                placeholder="Título do agendamento"
              />
              {errors.titulo && (
                <p className="text-sm text-red-500 mt-1">{errors.titulo.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                {...register('descricao')}
                placeholder="Descrição do agendamento"
                rows={3}
              />
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
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="dataHora">Data e Hora *</Label>
                <Input
                  id="dataHora"
                  type="datetime-local"
                  {...register('dataHora')}
                />
                {errors.dataHora && (
                  <p className="text-sm text-red-500 mt-1">{errors.dataHora.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="duracao">Duração (min) *</Label>
                <Input
                  id="duracao"
                  type="number"
                  {...register('duracao', { valueAsNumber: true })}
                  placeholder="30"
                />
                {errors.duracao && (
                  <p className="text-sm text-red-500 mt-1">{errors.duracao.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="status">Status *</Label>
                <select
                  id="status"
                  {...register('status')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="AGENDADO">Agendado</option>
                  <option value="CONFIRMADO">Confirmado</option>
                  <option value="EM_ANDAMENTO">Em Andamento</option>
                  <option value="CONCLUIDO">Concluído</option>
                  <option value="CANCELADO">Cancelado</option>
                  <option value="REAGENDADO">Reagendado</option>
                </select>
                {errors.status && (
                  <p className="text-sm text-red-500 mt-1">{errors.status.message}</p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="tipo">Tipo</Label>
              <Input
                id="tipo"
                {...register('tipo')}
                placeholder="Tipo de atendimento"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  reset();
                  setSelectedAgendamento(null);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : selectedAgendamento ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

