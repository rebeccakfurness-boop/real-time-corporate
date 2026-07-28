'use client';

import { LogOut } from 'lucide-react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { signOutAction } from '@/app/(actions)/sign-out';

export function SignOutButton() {
  return (
    <DropdownMenuItem onSelect={() => signOutAction()} className="text-destructive focus:text-destructive">
      <LogOut className="h-4 w-4" />
      Sign out
    </DropdownMenuItem>
  );
}
