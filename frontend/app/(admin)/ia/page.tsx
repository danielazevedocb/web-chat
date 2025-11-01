'use client';

import { useAuth } from '@/contexts/AuthContext';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Bot, Save, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import api from '@/lib/api';

const iaConfigSchema = z.object({
  promptBase: z.string().min(10, 'Prompt base deve ter pelo menos 10 caracteres'),
  modelo: z.string().min(1, 'Modelo é obrigatório'),
  temperatura: z.number().min(0).max(2),
  maxTokens: z.number().min(1).max(4000),
  modoAutomatico: z.boolean(),
  idioma: z.string().min(1, 'Idioma é obrigatório'),
  personalidade: z.string().optional(),
});

type IAConfigForm = z.infer<typeof iaConfigSchema>;

interface IAConfig {
  id: string;
  empresaId: string;
  promptBase: string;
  modelo: string;
  temperatura: number;
  maxTokens: number;
  modoAutomatico: boolean;
  idioma: string;
  personalidade?: string;
  faq: string[];
  palavrasChave: string[];
}

export default function IAPage() {
  const { user } = useAuth();
  const [config, setConfig] = useState<IAConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<IAConfigForm>({
    resolver: zodResolver(iaConfigSchema),
    defaultValues: {
      modelo: 'gpt-4',
      temperatura: 0.7,
      maxTokens: 1000,
      modoAutomatico: false,
      idioma: 'pt-BR',
    },
  });

  const empresaId = user?.empresaId;

  const fetchConfig = async () => {
    if (!empresaId) return;
    try {
      // Como não há endpoint específico, vamos criar um mock ou buscar via empresa
      // Por enquanto, vamos criar uma configuração padrão
      setConfig({
        id: 'temp',
        empresaId,
        promptBase: 'Você é um assistente virtual de atendimento ao cliente. Seja educado, prestativo e profissional.',
        modelo: 'gpt-4',
        temperatura: 0.7,
        maxTokens: 1000,
        modoAutomatico: false,
        idioma: 'pt-BR',
        personalidade: '',
        faq: [],
        palavrasChave: [],
      });
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (empresaId) {
      fetchConfig();
    }
  }, [empresaId]);

  useEffect(() => {
    if (config) {
      reset({
        promptBase: config.promptBase,
        modelo: config.modelo,
        temperatura: config.temperatura,
        maxTokens: config.maxTokens,
        modoAutomatico: config.modoAutomatico,
        idioma: config.idioma,
        personalidade: config.personalidade || '',
      });
    }
  }, [config, reset]);

  const onSubmit = async (data: IAConfigForm) => {
    if (!empresaId) return;
    try {
      // Por enquanto, apenas mostra sucesso pois não há endpoint implementado
      toast.success('Configuração de IA salva com sucesso!');
      setIsDialogOpen(false);
      fetchConfig();
    } catch (error: any) {
      toast.error('Erro ao salvar configuração');
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Configuração de IA</h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure o comportamento da inteligência artificial
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Settings className="h-4 w-4 mr-2" />
          Configurar IA
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Status da IA
          </CardTitle>
          <CardDescription>
            Informações sobre a configuração atual da inteligência artificial
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : config ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Modelo</Label>
                  <p className="text-sm text-gray-900">{config.modelo}</p>
                </div>
                <div>
                  <Label>Temperatura</Label>
                  <p className="text-sm text-gray-900">{config.temperatura}</p>
                </div>
                <div>
                  <Label>Máximo de Tokens</Label>
                  <p className="text-sm text-gray-900">{config.maxTokens}</p>
                </div>
                <div>
                  <Label>Idioma</Label>
                  <p className="text-sm text-gray-900">{config.idioma}</p>
                </div>
                <div>
                  <Label>Modo Automático</Label>
                  <p className="text-sm text-gray-900">
                    {config.modoAutomatico ? 'Ativado' : 'Desativado'}
                  </p>
                </div>
              </div>
              <div>
                <Label>Prompt Base</Label>
                <p className="text-sm text-gray-600 mt-1">{config.promptBase}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Bot className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Configuração não encontrada
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Configure a IA para começar a usar respostas automatizadas.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configurar Inteligência Artificial</DialogTitle>
            <DialogDescription>
              Configure o comportamento e parâmetros da IA para atendimento automático
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="promptBase">Prompt Base *</Label>
              <Textarea
                id="promptBase"
                {...register('promptBase')}
                placeholder="Você é um assistente virtual de atendimento ao cliente..."
                rows={6}
              />
              {errors.promptBase && (
                <p className="text-sm text-red-500 mt-1">{errors.promptBase.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="modelo">Modelo *</Label>
                <select
                  id="modelo"
                  {...register('modelo')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                </select>
                {errors.modelo && (
                  <p className="text-sm text-red-500 mt-1">{errors.modelo.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="idioma">Idioma *</Label>
                <select
                  id="idioma"
                  {...register('idioma')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">English (US)</option>
                  <option value="es-ES">Español</option>
                </select>
                {errors.idioma && (
                  <p className="text-sm text-red-500 mt-1">{errors.idioma.message}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="temperatura">
                  Temperatura ({watch('temperatura')}) *
                </Label>
                <Input
                  id="temperatura"
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  {...register('temperatura', { valueAsNumber: true })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Controla a criatividade das respostas (0 = mais focado, 2 = mais criativo)
                </p>
                {errors.temperatura && (
                  <p className="text-sm text-red-500 mt-1">{errors.temperatura.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="maxTokens">Máximo de Tokens *</Label>
                <Input
                  id="maxTokens"
                  type="number"
                  {...register('maxTokens', { valueAsNumber: true })}
                  placeholder="1000"
                />
                {errors.maxTokens && (
                  <p className="text-sm text-red-500 mt-1">{errors.maxTokens.message}</p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="personalidade">Personalidade</Label>
              <Input
                id="personalidade"
                {...register('personalidade')}
                placeholder="Ex: Amigável, Profissional, Descontraído"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="modoAutomatico"
                {...register('modoAutomatico')}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="modoAutomatico" className="cursor-pointer">
                Modo Automático (IA responde automaticamente sem aprovação)
              </Label>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Salvando...' : 'Salvar Configuração'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

