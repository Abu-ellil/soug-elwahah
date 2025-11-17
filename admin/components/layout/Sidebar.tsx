'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Store, Car, ShoppingCart, Package, MapPin, BarChart3, Settings, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const sidebarItems = [
  { icon: Home, label: 'الرئيسية', href: '/' },
  { icon: Users, label: 'المستخدمين', href: '/users' },
  { icon: Store, label: 'المحلات', href: '/stores' },
  { icon: Car, label: 'السائقين', href: '/drivers' },
  { icon: ShoppingCart, label: 'الطلبات', href: '/orders' },
  { icon: Package, label: 'المنتجات', href: '/products' },
 { icon: MapPin, label: 'القرى', href: '/villages' },
  { icon: BarChart3, label: 'الإحصائيات', href: '/analytics' },
  { icon: Settings, label: 'الإعدادات', href: '/settings' },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden p-4 flex justify-between items-center border-b">
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
        <h1 className="text-xl font-bold">لوحة التحكم</h1>
      </div>

      {/* Sidebar */}
      <div 
        className={cn(
          'fixed md:static inset-y-0 left-0 z-50 w-64 bg-card shadow-lg transform transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-primary">نظام التوصيل</h1>
          <p className="text-sm text-muted-foreground">لوحة التحكم الإدارية</p>
        </div>
        
        <nav className="p-2">
          <ul className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <li key={item.href}>
                  <Link href={item.href}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start",
                        isActive && "bg-primary text-primary-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4 ml-2" />
                      {item.label}
                    </Button>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
}