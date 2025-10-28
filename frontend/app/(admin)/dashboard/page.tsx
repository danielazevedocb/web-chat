'use client';

import { useAuth } from '@/contexts/AuthContext';
import {
  AlertCircle,
  Bot,
  Calendar,
  CheckCircle,
  Clock,
  MessageSquare,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useQuery } from 'react-query';

interface DashboardMetrics {
  totalUsuarios: number;
  totalClientes: number;
  totalConversas: number;
  conversasAbertas: number;
  conversasFechadas: number;
  totalAgendamentos: number;
  agendamentosHoje: number;
  agentesAtivos: number;
  tempoMedioResposta: number;
  satisfacaoMedia: number;
  mensagensIA: number;
  taxaResolucaoIA: number;
}

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: metrics, isLoading } = useQuery<DashboardMetrics>(
    'dashboard-metrics',
    async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/metricas/${user?.empresaId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        },
      );
      if (!response.ok) throw new Error('Erro ao carregar métricas');
      return response.json();
    },
    {
      enabled: !!user?.empresaId,
      refetchInterval: 30000, // Atualizar a cada 30 segundos
    },
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const stats = [
    {
      name: 'Total de Usuários',
      value: metrics?.totalUsuarios || 0,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive',
    },
    {
      name: 'Total de Clientes',
      value: metrics?.totalClientes || 0,
      icon: Users,
      color: 'bg-green-500',
      change: '+8%',
      changeType: 'positive',
    },
    {
      name: 'Conversas Abertas',
      value: metrics?.conversasAbertas || 0,
      icon: MessageSquare,
      color: 'bg-yellow-500',
      change: '+5%',
      changeType: 'positive',
    },
    {
      name: 'Conversas Fechadas',
      value: metrics?.conversasFechadas || 0,
      icon: CheckCircle,
      color: 'bg-green-500',
      change: '+15%',
      changeType: 'positive',
    },
    {
      name: 'Agendamentos Hoje',
      value: metrics?.agendamentosHoje || 0,
      icon: Calendar,
      color: 'bg-purple-500',
      change: '+3%',
      changeType: 'positive',
    },
    {
      name: 'Agentes Ativos',
      value: metrics?.agentesAtivos || 0,
      icon: Users,
      color: 'bg-indigo-500',
      change: '+2%',
      changeType: 'positive',
    },
    {
      name: 'Tempo Médio Resposta',
      value: `${metrics?.tempoMedioResposta || 0} min`,
      icon: Clock,
      color: 'bg-orange-500',
      change: '-10%',
      changeType: 'negative',
    },
    {
      name: 'Satisfação Média',
      value: `${metrics?.satisfacaoMedia || 0}/5`,
      icon: TrendingUp,
      color: 'bg-pink-500',
      change: '+5%',
      changeType: 'positive',
    },
    {
      name: 'Mensagens IA',
      value: metrics?.mensagensIA || 0,
      icon: Bot,
      color: 'bg-cyan-500',
      change: '+25%',
      changeType: 'positive',
    },
    {
      name: 'Taxa Resolução IA',
      value: `${metrics?.taxaResolucaoIA || 0}%`,
      icon: Bot,
      color: 'bg-teal-500',
      change: '+8%',
      changeType: 'positive',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Visão geral do sistema de atendimento
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-md ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      <div
                        className={`ml-2 flex items-baseline text-sm font-semibold ${
                          stat.changeType === 'positive'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Conversas por Status */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">
              Conversas por Status
            </h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Abertas</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {metrics?.conversasAbertas || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Fechadas</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {metrics?.conversasFechadas || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Em Andamento</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {(metrics?.conversasAbertas || 0) -
                    (metrics?.conversasFechadas || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance IA */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">
              Performance da IA
            </h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Mensagens Processadas
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {metrics?.mensagensIA || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Taxa de Resolução</span>
                <span className="text-sm font-medium text-gray-900">
                  {metrics?.taxaResolucaoIA || 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Satisfação Média</span>
                <span className="text-sm font-medium text-gray-900">
                  {metrics?.satisfacaoMedia || 0}/5
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">
            Atividade Recente
          </h3>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  Nova conversa resolvida pela IA
                </p>
                <p className="text-xs text-gray-500">há 2 minutos</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  Nova mensagem recebida no WhatsApp
                </p>
                <p className="text-xs text-gray-500">há 5 minutos</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  Ticket com prioridade alta criado
                </p>
                <p className="text-xs text-gray-500">há 10 minutos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
