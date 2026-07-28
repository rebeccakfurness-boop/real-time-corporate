import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { isLeaderRole } from '@/lib/rbac';

export default async function RootPage() {
  const session = await auth();
  if (!session) redirect('/sign-in');
  redirect(isLeaderRole(session.user.role) ? '/leader/dashboard' : '/employee/home');
}
