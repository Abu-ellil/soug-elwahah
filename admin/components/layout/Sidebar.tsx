'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Store, Car, ShoppingCart, Package, MapPin, BarChart3, Settings, Menu, X, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const sidebarItems = [
  { icon: Home, label: 'الرئيسية', href: '/' },
  { icon: Users, label: 'المستخدمين', href: '/users' },
  { icon: Store, label: 'المحلات', href: '/stores', hasSubmenu: true, submenu: [
    { label: 'جميع المتاجر', href: '/stores' },
    { label: 'المتاجر المعلقة', href: '/stores/pending' },
    { label: 'مالكي المتاجر', href: '/stores/owners' },
  ]},
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

  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});

  const toggleSubmenu = (href: string) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [href]: !prev[href]
    }));
  };

  const isActive = (href: string) => {
    if (pathname === href) return true;
    // Check if current path starts with the submenu item's href
    if (pathname.startsWith(href) && href !== '/') return true;
    return false;
  };

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
              const itemIsActive = isActive(item.href);
              const isSubmenuOpen = openSubmenus[item.href];
              
              return (
                <li key={item.href}>
                  {item.hasSubmenu ? (
                    <div>
                      <Button
                        variant={itemIsActive ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-between",
                          itemIsActive && "bg-primary text-primary-foreground"
                        )}
                        onClick={() => toggleSubmenu(item.href)}
                      >
                        <div className="flex items-center">
                          <Icon className="h-4 w-4 ml-2" />
                          {item.label}
                        </div>
                        {isSubmenuOpen ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      {isSubmenuOpen && (
                        <ul className="mr-6 mt-1 space-y-1 pr-2 border-r border-muted-foreground/30">
                          {item.submenu?.map((subItem) => {
                            const subIsActive = pathname === subItem.href;
                            return (
                              <li key={subItem.href}>
                                <Link href={subItem.href}>
                                  <Button
                                    variant={subIsActive ? "secondary" : "ghost"}
                                    className={cn(
                                      "w-full justify-start text-sm",
                                      subIsActive && "bg-primary text-primary-foreground"
                                    )}
                                  >
                                    {subItem.label}
                                  </Button>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <Link href={item.href}>
                      <Button
                        variant={itemIsActive ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start",
                          itemIsActive && "bg-primary text-primary-foreground"
                        )}
                      >
                        <Icon className="h-4 w-4 ml-2" />
                        {item.label}
                      </Button>
                    </Link>
                  )}
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
};
