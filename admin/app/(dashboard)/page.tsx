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

// Mock data - will be replaced with actual API calls
const mockStats = {
  totalOrders: 1242,
  totalRevenue: 324500,
 totalUsers: 5280,
  activeDrivers: 124,
};

const mockOrders: Order[] = [
  { 
    id: 'ORD-001', 
    userId: '1', 
    userName: 'أحمد محمد', 
    userPhone: '010000000',
    storeId: '1', 
    storeName: 'متجر العزيز', 
    driverId: '1',
    driverName: 'محمد علي',
    driverPhone: '01000001',
    items: [],
    subtotal: 100,
    deliveryFee: 20,
    total: 120, 
    status: 'delivered', 
    paymentMethod: 'cash',
    deliveryAddress: 'القاهرة',
    deliveryCoordinates: { lat: 30, lng: 31 },
    createdAt: '2023-05-15T10:30:00Z',
    updatedAt: '2023-05-15T12:30:00Z',
    completedAt: '2023-05-15T12:30:00Z'
  },
  { 
    id: 'ORD-02', 
    userId: '2', 
    userName: 'فاطمة خالد', 
    userPhone: '01000002',
    storeId: '2', 
    storeName: 'سوبر ماركت النصر', 
    driverId: '2',
    driverName: 'أيمن سعيد',
    driverPhone: '010000002',
    items: [],
    subtotal: 200,
    deliveryFee: 40,
    total: 240, 
    status: 'in_transit', 
    paymentMethod: 'cash',
    deliveryAddress: 'الإسكندرية',
    deliveryCoordinates: { lat: 31, lng: 29 },
    createdAt: '2023-05-15T09:15:00Z',
    updatedAt: '2023-05-15T11:45:00Z'
  },
  { 
    id: 'ORD-003', 
    userId: '3', 
    userName: 'محمود أحمد', 
    userPhone: '01000003',
    storeId: '3', 
    storeName: 'بقالة الفهد', 
    driverId: '3',
    driverName: 'خالد حسن',
    driverPhone: '01000000003',
    items: [],
    subtotal: 65,
    deliveryFee: 20,
    total: 85, 
    status: 'pending', 
    paymentMethod: 'cash',
    deliveryAddress: 'الجيزة',
    deliveryCoordinates: { lat: 30, lng: 31 },
    createdAt: '2023-05-14T14:20:00Z',
    updatedAt: '2023-05-14T14:20:00Z'
  },
  { 
    id: 'ORD-004', 
    userId: '4', 
    userName: 'سارة إبراهيم', 
    userPhone: '01000004',
    storeId: '4', 
    storeName: 'محل السعادة', 
    driverId: '4',
    driverName: 'محمود طاهر',
    driverPhone: '010000004',
    items: [],
    subtotal: 150,
    deliveryFee: 30,
    total: 180, 
    status: 'delivered', 
    paymentMethod: 'cash',
    deliveryAddress: 'القاهرة',
    deliveryCoordinates: { lat: 30, lng: 31 },
    createdAt: '2023-05-14T16:45:00Z',
    updatedAt: '2023-05-14T18:30:00Z',
    completedAt: '2023-05-14T18:30:00Z'
  },
  { 
    id: 'ORD-005', 
    userId: '5', 
    userName: 'نور الدين', 
    userPhone: '010000005',
    storeId: '5', 
    storeName: 'محل الزهرة', 
    driverId: '5',
    driverName: 'أحمد مصطفى',
    driverPhone: '010000005',
    items: [],
    subtotal: 75,
    deliveryFee: 20,
    total: 95, 
    status: 'confirmed', 
    paymentMethod: 'cash',
    deliveryAddress: 'الإسكندرية',
    deliveryCoordinates: { lat: 31, lng: 29 },
    createdAt: '2023-05-14T11:30:00Z',
    updatedAt: '2023-05-14T13:15:00Z'
  },
];

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