'use client';

import { User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { admin, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
  };

  if (!admin) return null;

  return (
    <header className="border-b bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 space-x-reverse">
          <h2 className="text-xl font-semibold">لوحة التحكم</h2>
        </div>
        
        <div className="flex items-center space-x-4 space-x-reverse">
          {/* Notification icon could go here */}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={admin.avatar} alt={admin.name} />
                  <AvatarFallback>
                    {admin.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex flex-col space-y-2 p-2">
                <p className="text-sm font-medium leading-none">{admin.name}</p>
                <p className="text-xs text-muted-foreground">{admin.email}</p>
              </div>
              <DropdownMenuItem onClick={handleLogout} className="flex items-center">
                <LogOut className="ml-2 h-4 w-4" />
                <span>تسجيل الخروج</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}