'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { leaderNavItems, employeeNavItems } from './nav-items';
import { can, type Permission } from '@/lib/rbac';
import type { PlatformRole } from '@prisma/client';

export function AppSidebar({
  variant,
  title,
  role,
}: {
  variant: 'leader' | 'employee';
  title: string;
  role: PlatformRole;
}) {
  const pathname = usePathname();
  const items = (variant === 'leader' ? leaderNavItems : employeeNavItems).filter(
    (item) => !item.permission || can(role, item.permission as Permission)
  );

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card/50 md:flex">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-none">chnnl</p>
          <p className="text-[11px] leading-none text-muted-foreground">{title}</p>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
