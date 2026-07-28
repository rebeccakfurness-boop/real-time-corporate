import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { isLeaderRole } from '@/lib/rbac';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppTopbar } from '@/components/layout/app-topbar';
import { ROLE_LABELS } from '@/lib/labels';

export default async function LeaderLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || !isLeaderRole(session.user.role)) redirect('/sign-in');

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar variant="leader" title="Leader Dashboard" role={session.user.role} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppTopbar userName={session.user.name} roleLabel={ROLE_LABELS[session.user.role] ?? session.user.role} />
        <main className="flex-1 overflow-y-auto scrollbar-thin p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
