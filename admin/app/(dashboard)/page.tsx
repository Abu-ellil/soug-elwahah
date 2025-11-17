'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RecentOrders } from '@/components/dashboard/RecentOrders';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { TopStores } from '@/components/dashboard/TopStores';
import { Package, ShoppingCart, Users, Car } from 'lucide-react';
import { Order } from '@/types/order';
import { dashboardAPI } from '@/lib/api/dashboard';
import { ordersAPI } from '@/lib/api/orders';


interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  activeDrivers: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({ totalOrders: 0, totalRevenue: 0, totalUsers: 0, activeDrivers: 0 });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const fetchDashboardData = async () => {
        try {
          // Fetch dashboard statistics
          const statsResponse = await dashboardAPI.getStats();
          setStats(statsResponse);
          
          // Fetch recent orders
                  const ordersResponse = await ordersAPI.getAll({ limit: 5 }); // Get last 5 orders as recent
                  setRecentOrders(ordersResponse.data?.orders || []);
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
          // Set empty defaults in case of error
          setStats({ totalOrders: 0, totalRevenue: 0, totalUsers: 0, activeDrivers: 0 });
          setRecentOrders([]);
        } finally {
          setLoading(false);
        }
      };
  
      fetchDashboardData();
    }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">الرئيسية</h1>
        <p className="text-muted-foreground">مرحبًا بك في لوحة التحكم الإدارية</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="إجمالي الطلبات" 
          value={stats.totalOrders.toLocaleString()} 
          change={5.2} 
          icon={ShoppingCart} 
          color="primary"
        />
        <StatsCard 
          title="إجمالي الإيرادات" 
          value={`ج.م ${stats.totalRevenue.toLocaleString()}`} 
          change={8.7} 
          icon={Package} 
          color="success"
        />
        <StatsCard 
          title="عدد المستخدمين" 
          value={stats.totalUsers.toLocaleString()} 
          change={3.1} 
          icon={Users} 
          color="info"
        />
        <StatsCard 
          title="السائقين النشطين" 
          value={stats.activeDrivers.toLocaleString()} 
          change={2.4} 
          icon={Car} 
          color="warning"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>إحصائيات الإيرادات</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>أفضل 5 متاجر</CardTitle>
          </CardHeader>
          <CardContent>
            <TopStores />
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>أحدث الطلبات</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentOrders orders={recentOrders} />
        </CardContent>
      </Card>
    </div>
  );
}