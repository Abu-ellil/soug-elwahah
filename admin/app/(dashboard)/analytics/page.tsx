'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ShoppingCart, Package, Users, Store, Car } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { TopStores } from '@/components/dashboard/TopStores';
import { RecentOrders } from '@/components/dashboard/RecentOrders';
import { Order } from '@/types/order';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { analyticsAPI } from '@/lib/api/analytics';

// Mock data - will be replaced with actual API calls
const mockStats = {
  totalOrders: 1242,
  totalRevenue: 324500,
 totalUsers: 5280,
 totalStores: 124,
  totalDrivers: 245,
};

const mockOrders: Order[] = [
  { 
    id: 'ORD-001', 
    userId: '1', 
    userName: 'أحمد محمد', 
    userPhone: '010000',
    storeId: '1', 
    storeName: 'متجر العزيز', 
    driverId: '1',
    driverName: 'محمد علي',
    driverPhone: '0100',
    items: [],
    subtotal: 100,
    deliveryFee: 20,
    total: 120, 
    status: 'delivered', 
    paymentMethod: 'cash',
    deliveryAddress: 'القاهرة، شارع النزهة',
    deliveryCoordinates: { lat: 30.044, lng: 31.2357 },
    createdAt: '2023-05-15T10:30:00Z',
    updatedAt: '2023-05-15T12:30:00Z',
    completedAt: '2023-05-15T12:30:00Z'
  },
  { 
    id: 'ORD-02', 
    userId: '2', 
    userName: 'فاطمة خالد', 
    userPhone: '010001',
    storeId: '2', 
    storeName: 'سوبر ماركت النصر', 
    driverId: '2',
    driverName: 'أيمن سعيد',
    driverPhone: '0101',
    items: [],
    subtotal: 200,
    deliveryFee: 25,
    total: 225, 
    status: 'in_transit', 
    paymentMethod: 'cash',
    deliveryAddress: 'الإسكندرية، شارع الجمهورية',
    deliveryCoordinates: { lat: 31.2001, lng: 29.9187 },
    createdAt: '2023-05-15T09:15:00Z',
    updatedAt: '2023-05-15T11:45:00Z'
  },
  { 
    id: 'ORD-003', 
    userId: '3', 
    userName: 'محمود أحمد', 
    userPhone: '010002',
    storeId: '3', 
    storeName: 'بقالة الفهد', 
    driverId: '3',
    driverName: 'خالد حسن',
    driverPhone: '010002',
    items: [],
    subtotal: 65,
    deliveryFee: 20,
    total: 85, 
    status: 'pending', 
    paymentMethod: 'cash',
    deliveryAddress: 'الجيزة، شارع الهرم',
    deliveryCoordinates: { lat: 30.0131, lng: 31.2089 },
    createdAt: '2023-05-14T14:20:00Z',
    updatedAt: '2023-05-14T14:20:00Z'
  },
  { 
    id: 'ORD-004', 
    userId: '4', 
    userName: 'سارة إبراهيم', 
    userPhone: '010003',
    storeId: '4', 
    storeName: 'محل السعادة', 
    driverId: '4',
    driverName: 'محمود طاهر',
    driverPhone: '010003',
    items: [],
    subtotal: 150,
    deliveryFee: 30,
    total: 180, 
    status: 'delivered', 
    paymentMethod: 'cash',
    deliveryAddress: 'القاهرة، شارع التحرير',
    deliveryCoordinates: { lat: 30.0444, lng: 31.2357 },
    createdAt: '2023-05-14T16:45:00Z',
    updatedAt: '2023-05-14T18:30:00Z',
    completedAt: '2023-05-14T18:30:00Z'
  },
  { 
    id: 'ORD-005', 
    userId: '5', 
    userName: 'نور الدين', 
    userPhone: '010000004',
    storeId: '5', 
    storeName: 'محل الزهرة', 
    driverId: '5',
    driverName: 'أحمد مصطفى',
    driverPhone: '010004',
    items: [],
    subtotal: 75,
    deliveryFee: 20,
    total: 95, 
    status: 'confirmed', 
    paymentMethod: 'cash',
    deliveryAddress: 'الإسكندرية، شارع النيل',
    deliveryCoordinates: { lat: 31.2001, lng: 29.9187 },
    createdAt: '2023-05-14T11:30:00Z',
    updatedAt: '2023-05-14T13:15:00Z'
  },
];

// Define the type for stats based on the AnalyticsResponse data structure
interface AnalyticsStats {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalStores: number;
  totalDrivers: number;
  revenueByDate?: {
    date: string;
    revenue: number;
  }[];
  ordersByStatus?: {
    status: string;
    count: number;
  }[];
  topStores?: {
    storeId: string;
    storeName: string;
    orders: number;
  }[];
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<AnalyticsStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    totalStores: 0,
    totalDrivers: 0
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
 });

  useEffect(() => {
      const fetchAnalyticsData = async () => {
        try {
          const params = {
            dateFrom: dateRange.from || undefined,
            dateTo: dateRange.to || undefined
          };
          const response = await analyticsAPI.getDashboardStats(params);
          if (response.success) {
            setStats(response.data);
            // For orders, we need to fetch separately
            // TODO: Add API call to fetch recent orders for analytics page
            setOrders([]);
          } else {
            console.error('Failed to fetch analytics data:', response.message);
          }
        } catch (error) {
          console.error('Error fetching analytics data:', error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchAnalyticsData();
    }, [dateRange]);

  const handleDateRangeChange = () => {
    // Simulate API call with new date range
    console.log('Fetching analytics for date range:', dateRange);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">الإحصائيات</h1>
          <p className="text-muted-foreground">تحليل بيانات النظام</p>
        </div>
        <div className="flex items-center space-x-2 space-x-reverse">
          <div className="flex items-center space-x-2 space-x-reverse">
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
              className="border rounded p-2"
            />
            <span>إلى</span>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
              className="border rounded p-2"
            />
          </div>
          <Button onClick={handleDateRangeChange}>
            <Calendar className="h-4 w-4 ml-2" />
            تطبيق
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
          title="إجمالي المستخدمين" 
          value={stats.totalUsers.toLocaleString()} 
          change={3.1} 
          icon={Users} 
          color="info"
        />
        <StatsCard 
          title="إجمالي المتاجر" 
          value={stats.totalStores.toLocaleString()} 
          change={2.4} 
          icon={Store} 
          color="warning"
        />
        <StatsCard 
          title="إجمالي السائقين" 
          value={stats.totalDrivers.toLocaleString()} 
          change={1.8} 
          icon={Car} 
          color="secondary"
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
          <RecentOrders orders={orders} />
        </CardContent>
      </Card>
    </div>
  );
}