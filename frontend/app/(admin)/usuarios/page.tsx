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
import { Users, MoreVertical, Plus, Search, Trash2, Edit, Power } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import api from '@/lib/api';

const usuarioSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').optional(),
  telefone: z.string().optional(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'AGENTE']),
  empresaId: z.string().optional(),
  ativo: z.boolean().optional(),
});

type UsuarioForm = z.infer<typeof usuarioSchema>;

interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  avatar?: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'AGENTE';
  empresaId?: string;
  empresa?: {
    id: string;
    nome: string;
  };
  ativo: boolean;
  ultimoLogin?: string;
  createdAt: string;
}

export default function UsuariosPage() {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UsuarioForm>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: {
      ativo: true,
    },
  });

  const fetchUsuarios = async () => {
    try {
      const response = await api.get('/api/usuarios');
      setUsuarios(response.data);
    } catch (error: any) {
      toast.error('Erro ao carregar usuários');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmpresas = async () => {
    try {
      const response = await api.get('/api/empresas');
      setEmpresas(response.data);
    } catch (error: any) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') {
      fetchUsuarios();
      if (user?.role === 'SUPER_ADMIN') {
        fetchEmpresas();
      }
    }
  }, [user]);

  const onSubmit = async (data: UsuarioForm) => {
    try {
      const payload = { ...data };
      if (!selectedUsuario || !data.senha) {
        delete payload.senha;
      }
      
      if (selectedUsuario) {
        await api.patch(`/api/usuarios/${selectedUsuario.id}`, payload);
        toast.success('Usuário atualizado com sucesso!');
      } else {
        if (!data.senha) {
          toast.error('Senha é obrigatória para novos usuários');
          return;
        }
        await api.post('/api/usuarios', payload);
        toast.success('Usuário criado com sucesso!');
      }
      setIsDialogOpen(false);
      reset();
      setSelectedUsuario(null);
      fetchUsuarios();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao salvar usuário');
    }
  };

  const handleEdit = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    reset({
      nome: usuario.nome,
      email: usuario.email,
      telefone: usuario.telefone || '',
      role: usuario.role,
      empresaId: usuario.empresaId || '',
      ativo: usuario.ativo,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
    try {
      await api.delete(`/api/usuarios/${id}`);
      toast.success('Usuário excluído com sucesso!');
      fetchUsuarios();
    } catch (error: any) {
      toast.error('Erro ao excluir usuário');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await api.patch(`/api/usuarios/${id}/toggle-status`);
      toast.success('Status atualizado com sucesso!');
      fetchUsuarios();
    } catch (error: any) {
      toast.error('Erro ao atualizar status');
    }
  };

  const handleNew = () => {
    setSelectedUsuario(null);
    reset({
      ativo: true,
      role: 'AGENTE',
    });
    setIsDialogOpen(true);
  };

  const filteredUsuarios = usuarios.filter((usuario) =>
    usuario.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    usuario.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const userRole = user?.role;
  const canManage = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';

  if (!canManage) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Você não tem permissão para acessar esta página.</p>
      </div>
    );
  }

  const roleLabels = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN: 'Administrador',
    AGENTE: 'Agente',
  };

  const roleColors = {
    SUPER_ADMIN: 'bg-purple-100 text-purple-800',
    ADMIN: 'bg-blue-100 text-blue-800',
    AGENTE: 'bg-green-100 text-green-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie os usuários do sistema
          </p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Usuários</CardTitle>
              <CardDescription>
                {filteredUsuarios.length} usuário(s) encontrado(s)
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar usuários..."
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
          ) : filteredUsuarios.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum usuário encontrado</h3>
              <p className="mt-1 text-sm text-gray-500">
                Comece criando um novo usuário.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Função
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Empresa
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
                  {filteredUsuarios.map((usuario) => (
                    <tr key={usuario.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {usuario.avatar ? (
                              <img
                                className="h-10 w-10 rounded-full"
                                src={usuario.avatar}
                                alt={usuario.nome}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Users className="h-5 w-5 text-primary" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{usuario.nome}</div>
                            {usuario.telefone && (
                              <div className="text-sm text-gray-500">{usuario.telefone}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{usuario.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={roleColors[usuario.role]}>
                          {roleLabels[usuario.role]}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {usuario.empresa?.nome || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={usuario.ativo ? 'default' : 'destructive'}>
                          {usuario.ativo ? 'Ativo' : 'Inativo'}
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
                            <DropdownMenuItem onClick={() => handleEdit(usuario)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(usuario.id)}>
                              <Power className="h-4 w-4 mr-2" />
                              {usuario.ativo ? 'Desativar' : 'Ativar'}
                            </DropdownMenuItem>
                            {userRole === 'SUPER_ADMIN' && (
                              <DropdownMenuItem
                                onClick={() => handleDelete(usuario.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            )}
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
              {selectedUsuario ? 'Editar Usuário' : 'Novo Usuário'}
            </DialogTitle>
            <DialogDescription>
              {selectedUsuario
                ? 'Atualize as informações do usuário'
                : 'Preencha os dados para criar um novo usuário'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  {...register('nome')}
                  placeholder="Nome completo"
                />
                {errors.nome && (
                  <p className="text-sm text-red-500 mt-1">{errors.nome.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="email@exemplo.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                )}
              </div>
            </div>
            {(!selectedUsuario || watch('senha')) && (
              <div>
                <Label htmlFor="senha">
                  Senha {selectedUsuario ? '(deixe em branco para manter)' : '*'}
                </Label>
                <Input
                  id="senha"
                  type="password"
                  {...register('senha')}
                  placeholder="Mínimo 6 caracteres"
                />
                {errors.senha && (
                  <p className="text-sm text-red-500 mt-1">{errors.senha.message}</p>
                )}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  {...register('telefone')}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div>
                <Label htmlFor="role">Função *</Label>
                <select
                  id="role"
                  {...register('role')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="AGENTE">Agente</option>
                  <option value="ADMIN">Administrador</option>
                  {userRole === 'SUPER_ADMIN' && (
                    <option value="SUPER_ADMIN">Super Admin</option>
                  )}
                </select>
                {errors.role && (
                  <p className="text-sm text-red-500 mt-1">{errors.role.message}</p>
                )}
              </div>
            </div>
            {userRole === 'SUPER_ADMIN' && empresas.length > 0 && (
              <div>
                <Label htmlFor="empresaId">Empresa</Label>
                <select
                  id="empresaId"
                  {...register('empresaId')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Selecione uma empresa</option>
                  {empresas.map((empresa) => (
                    <option key={empresa.id} value={empresa.id}>
                      {empresa.nome}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="ativo"
                {...register('ativo')}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="ativo" className="cursor-pointer">
                Usuário ativo
              </Label>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  reset();
                  setSelectedUsuario(null);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : selectedUsuario ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

