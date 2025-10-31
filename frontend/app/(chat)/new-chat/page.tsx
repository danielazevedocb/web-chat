'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { MessageCircle } from 'lucide-react';

const newChatSchema = z.object({
  userEmail: z.string().email('Email inválido'),
  name: z.string().optional(),
  initialMessage: z.string().optional(),
});

type NewChatForm = z.infer<typeof newChatSchema>;

export default function NewChatPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewChatForm>({
    resolver: zodResolver(newChatSchema),
  });

  const onSubmit = async (data: NewChatForm) => {
    setIsLoading(true);
    try {
      const response = await api.post('/api/chats', {
        userEmail: data.userEmail,
        initialMessage: data.initialMessage,
      });

      toast.success('Conversa criada com sucesso!');
      router.push(`/chat/${response.data.id}`);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Erro ao criar conversa',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Top Section - Illustration */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageCircle className="w-16 h-16 text-primary/30" />
            </div>
          </div>
          <p className="text-muted-foreground">
            Mantenha contato com seus amigos e familiares em tempo real
          </p>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Criar nova conversa</CardTitle>
            <CardDescription>
              Inicie uma conversa com outro usuário
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome (opcional)</Label>
                <Input
                  id="name"
                  placeholder="Nome do contato"
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="userEmail">Email *</Label>
                <Input
                  id="userEmail"
                  type="email"
                  placeholder="email@exemplo.com"
                  {...register('userEmail')}
                />
                {errors.userEmail && (
                  <p className="text-sm text-destructive">
                    {errors.userEmail.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="initialMessage">Mensagem (opcional)</Label>
                <Textarea
                  id="initialMessage"
                  placeholder="Digite uma mensagem inicial..."
                  rows={4}
                  {...register('initialMessage')}
                />
                {errors.initialMessage && (
                  <p className="text-sm text-destructive">
                    {errors.initialMessage.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Criando...' : 'Iniciar conversa'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

