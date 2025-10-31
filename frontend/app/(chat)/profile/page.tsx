'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, Lock, Save, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from 'react-query';
import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  bio: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, 'Senha atual é obrigatória'),
    newPassword: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string().min(6, 'Confirmação de senha é obrigatória'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    setValue: setProfileValue,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      bio: user?.bio || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const updateProfileMutation = useMutation(
    async (data: ProfileForm) => {
      const response = await api.patch('/api/users/me', data);
      return response.data;
    },
    {
      onSuccess: (data) => {
        queryClient.setQueryData('user', data);
        localStorage.setItem('user', JSON.stringify(data));
        toast.success('Perfil atualizado com sucesso!');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao atualizar perfil');
      },
    },
  );

  const changePasswordMutation = useMutation(
    async (data: { currentPassword: string; newPassword: string }) => {
      const response = await api.patch('/api/users/me/password', data);
      return response.data;
    },
    {
      onSuccess: () => {
        resetPassword();
        toast.success('Senha alterada com sucesso!');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao alterar senha');
      },
    },
  );

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await api.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const avatarUrl = `${process.env.NEXT_PUBLIC_API_URL}${uploadResponse.data.url}`;
      
      await updateProfileMutation.mutateAsync({
        name: user?.name || '',
        email: user?.email || '',
        bio: user?.bio || '',
        avatar: avatarUrl,
      } as any);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao fazer upload do avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const onProfileSubmit = async (data: ProfileForm) => {
    await updateProfileMutation.mutateAsync(data);
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    await changePasswordMutation.mutateAsync({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  };

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Meu Perfil</h1>
          <p className="text-muted-foreground">Gerencie suas informações pessoais</p>
        </div>

        {/* Avatar Section */}
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-2xl">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Camera className="h-4 w-4" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={isUploadingAvatar}
                />
              </label>
            </div>
            <div>
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-muted-foreground">{user.email}</p>
              {isUploadingAvatar && (
                <p className="text-sm text-muted-foreground">Enviando...</p>
              )}
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="rounded-lg border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Informações Pessoais</h2>
          </div>
          <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                {...registerProfile('name')}
                id="name"
                placeholder="Seu nome completo"
              />
              {profileErrors.name && (
                <p className="mt-1 text-sm text-destructive">
                  {profileErrors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                {...registerProfile('email')}
                id="email"
                type="email"
                placeholder="seu@email.com"
              />
              {profileErrors.email && (
                <p className="mt-1 text-sm text-destructive">
                  {profileErrors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                {...registerProfile('bio')}
                id="bio"
                placeholder="Conte um pouco sobre você..."
                rows={4}
              />
              {profileErrors.bio && (
                <p className="mt-1 text-sm text-destructive">
                  {profileErrors.bio.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={updateProfileMutation.isLoading}
            >
              {updateProfileMutation.isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </form>
        </div>

        <Separator />

        {/* Password Form */}
        <div className="rounded-lg border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Alterar Senha</h2>
          </div>
          <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Senha Atual</Label>
              <Input
                {...registerPassword('currentPassword')}
                id="currentPassword"
                type="password"
                placeholder="Sua senha atual"
              />
              {passwordErrors.currentPassword && (
                <p className="mt-1 text-sm text-destructive">
                  {passwordErrors.currentPassword.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="newPassword">Nova Senha</Label>
              <Input
                {...registerPassword('newPassword')}
                id="newPassword"
                type="password"
                placeholder="Sua nova senha"
              />
              {passwordErrors.newPassword && (
                <p className="mt-1 text-sm text-destructive">
                  {passwordErrors.newPassword.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <Input
                {...registerPassword('confirmPassword')}
                id="confirmPassword"
                type="password"
                placeholder="Confirme sua nova senha"
              />
              {passwordErrors.confirmPassword && (
                <p className="mt-1 text-sm text-destructive">
                  {passwordErrors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="outline"
              disabled={changePasswordMutation.isLoading}
            >
              {changePasswordMutation.isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-current"></div>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Alterar Senha
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

