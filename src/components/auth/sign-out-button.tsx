'use client';

import { handleSignOut } from '@/lib/auth-actions';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function SignOutButton() {
  return (
    <form action={handleSignOut}>
       <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-2 font-mono">
          <LogOut className="h-4 w-4" />
          DISCONNECT
       </Button>
    </form>
  );
}
