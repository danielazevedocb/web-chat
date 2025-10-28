import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // Redirecionar baseado no role
  if (session.user?.role) {
    switch (session.user.role) {
      case 'SUPER_ADMIN':
        redirect('/admin/dashboard');
      case 'ADMIN':
        redirect('/admin/dashboard');
      case 'AGENTE':
        redirect('/agente/atendimento');
      default:
        redirect('/login');
    }
  }

  redirect('/login');
}
