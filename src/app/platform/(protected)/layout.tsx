import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ShieldAlert, Building2, KeyRound, LogOut } from 'lucide-react';
import { getPlatformSession } from '@/lib/platform/session';
import { getStaffById } from '@/lib/platform';
import { platformSignOutAction } from '../actions';

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const session = await getPlatformSession();
  if (!session) redirect('/platform/sign-in');
  const staff = await getStaffById(session.staffId);
  if (!staff) redirect('/platform/sign-in');

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-warning/30 bg-warning/5 md:flex">
        <div className="flex h-14 items-center gap-2 border-b border-warning/30 px-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-warning text-warning-foreground">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-none">Realtime Platform</p>
            <p className="text-[11px] leading-none text-muted-foreground">Staff console</p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-3">
          <Link href="/platform/dashboard" className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-warning/10 hover:text-foreground">
            <Building2 className="h-4 w-4" /> Organisations
          </Link>
          <Link href="/platform/break-glass" className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-warning/10 hover:text-foreground">
            <KeyRound className="h-4 w-4" /> Break-glass unlocks
          </Link>
        </nav>
        <div className="border-t border-warning/30 p-3">
          <p className="px-3 text-xs font-medium">{staff.name}</p>
          <p className="px-3 text-xs text-muted-foreground">{staff.role.replaceAll('_', ' ')}</p>
          <form action={platformSignOutAction}>
            <button type="submit" className="mt-2 flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:bg-warning/10 hover:text-foreground">
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto scrollbar-thin p-4 md:p-6">{children}</main>
    </div>
  );
}
