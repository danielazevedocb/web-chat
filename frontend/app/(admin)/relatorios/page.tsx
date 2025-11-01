'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Users, MessageSquare, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import api from '@/lib/api';

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

export default function RelatoriosPage() {
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
      refetchInterval: 60000, // Atualizar a cada minuto
    },
  );

  if (!user?.empresaId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Empresa não identificada.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
        <p className="mt-1 text-sm text-gray-500">
          Análise detalhada de métricas e desempenho
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Métricas Gerais
              </CardTitle>
              <CardDescription>Visão geral do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Total de Usuários</span>
                  </div>
                  <span className="text-lg font-semibold">{metrics?.totalUsuarios || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Total de Clientes</span>
                  </div>
                  <span className="text-lg font-semibold">{metrics?.totalClientes || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Total de Conversas</span>
                  </div>
                  <span className="text-lg font-semibold">{metrics?.totalConversas || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-green-400" />
                    <span className="text-sm text-gray-600">Conversas Abertas</span>
                  </div>
                  <span className="text-lg font-semibold text-green-600">
                    {metrics?.conversasAbertas || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Conversas Fechadas</span>
                  </div>
                  <span className="text-lg font-semibold">{metrics?.conversasFechadas || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Desempenho
              </CardTitle>
              <CardDescription>Métricas de performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Tempo Médio de Resposta</span>
                  </div>
                  <span className="text-lg font-semibold">
                    {metrics?.tempoMedioResposta ? `${metrics.tempoMedioResposta} min` : '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Satisfação Média</span>
                  </div>
                  <span className="text-lg font-semibold">
                    {metrics?.satisfacaoMedia ? `${metrics.satisfacaoMedia}/5` : '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Agentes Ativos</span>
                  </div>
                  <span className="text-lg font-semibold">{metrics?.agentesAtivos || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Inteligência Artificial
              </CardTitle>
              <CardDescription>Métricas de uso da IA</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Mensagens Geradas pela IA</span>
                  <span className="text-lg font-semibold">{metrics?.mensagensIA || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Taxa de Resolução pela IA</span>
                  <span className="text-lg font-semibold">
                    {metrics?.taxaResolucaoIA ? `${metrics.taxaResolucaoIA}%` : '0%'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Agendamentos
              </CardTitle>
              <CardDescription>Estatísticas de agendamentos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total de Agendamentos</span>
                  <span className="text-lg font-semibold">{metrics?.totalAgendamentos || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Agendamentos Hoje</span>
                  <span className="text-lg font-semibold text-blue-600">
                    {metrics?.agendamentosHoje || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

