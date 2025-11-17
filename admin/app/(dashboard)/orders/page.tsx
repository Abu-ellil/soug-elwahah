'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ShoppingCart, Search, Download, Calendar } from 'lucide-react';
import { DataTable } from '@/components/tables/DataTable';
import { Order as OrderType } from '@/types/order';
import { ordersAPI } from '@/lib/api/orders';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

// Mock data - will be replaced with actual API calls
const mockOrders: OrderType[] = [
  {
    id: 'ORD-001',
    userId: '1',
    userName: 'أحمد محمد',
    userPhone: '010000',
    storeId: '1',
    storeName: 'متجر العزيز',
    driverId: '1',
    driverName: 'محمد علي',
    driverPhone: '010000',
    items: [],
    subtotal: 100,
    deliveryFee: 20,
    total: 120,
    status: 'delivered',
    paymentMethod: 'cash',
    deliveryAddress: 'القاهرة، شارع النزهة',
    deliveryCoordinates: { lat: 30.0444, lng: 31.2357 },
    createdAt: '2023-05-15T10:30:00Z',
    updatedAt: '2023-05-15T12:30:00Z',
    completedAt: '2023-05-15T12:30:00Z',
  },
  {
    id: 'ORD-002',
    userId: '2',
    userName: 'فاطمة خالد',
    userPhone: '01000001',
    storeId: '2',
    storeName: 'سوبر ماركت النصر',
    driverId: '2',
    driverName: 'أيمن سعيد',
    driverPhone: '01001',
    items: [],
    subtotal: 200,
    deliveryFee: 25,
    total: 25,
    status: 'in_transit',
    paymentMethod: 'cash',
    deliveryAddress: 'الإسكندرية، شارع الجمهورية',
    deliveryCoordinates: { lat: 31.2001, lng: 29.9187 },
    createdAt: '2023-05-15T09:15:00Z',
    updatedAt: '2023-05-15T11:45:00Z',
  },
  {
    id: 'ORD-003',
    userId: '3',
    userName: 'محمود أحمد',
    userPhone: '0100002',
    storeId: '3',
    storeName: 'بقالة الفهد',
    driverId: '3',
    driverName: 'خالد حسن',
    driverPhone: '0100002',
    items: [],
    subtotal: 65,
    deliveryFee: 20,
    total: 85,
    status: 'pending',
    paymentMethod: 'cash',
    deliveryAddress: 'الجيزة، شارع الهرم',
    deliveryCoordinates: { lat: 30.0131, lng: 31.2089 },
    createdAt: '2023-05-14T14:20:00Z',
    updatedAt: '2023-05-14T14:20:00Z',
  },
  {
    id: 'ORD-004',
    userId: '4',
    userName: 'سارة إبراهيم',
    userPhone: '0100003',
    storeId: '4',
    storeName: 'محل السعادة',
    driverId: '4',
    driverName: 'محمود طاهر',
    driverPhone: '01000003',
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
    completedAt: '2023-05-14T18:30:00Z',
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
    driverPhone: '01000004',
    items: [],
    subtotal: 75,
    deliveryFee: 20,
    total: 95,
    status: 'confirmed',
    paymentMethod: 'cash',
    deliveryAddress: 'الإسكندرية، شارع النيل',
    deliveryCoordinates: { lat: 31.2001, lng: 29.9187 },
    createdAt: '2023-05-14T11:30:00Z',
    updatedAt: '2023-05-14T13:15:00Z',
  },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderType[]>(mockOrders);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setOrders(mockOrders);
      setTotalOrders(mockOrders.length);
      setLoading(false);
    }, 10);
  }, []);

  // Define columns for the data table
  const columns = [
    {
      accessorKey: 'id',
      header: 'رقم الطلب',
    },
    {
      accessorKey: 'userName',
      header: 'العميل',
      cell: (row: OrderType) => (
        <div>
          <div className="font-medium">{row.userName}</div>
          <div className="text-sm text-muted-foreground">{row.userPhone}</div>
        </div>
      ),
    },
    {
      accessorKey: 'storeName',
      header: 'المتجر',
    },
    {
      accessorKey: 'driverName',
      header: 'السائق',
      cell: (row: OrderType) => (
        <div>
          {row.driverName ? (
            <>
              <div className="font-medium">{row.driverName}</div>
              <div className="text-sm text-muted-foreground">{row.driverPhone}</div>
            </>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'total',
      header: 'المبلغ',
      cell: (row: OrderType) => (
        <span className="font-medium">{row.total} ج.م</span>
      ),
    },
    {
      accessorKey: 'paymentMethod',
      header: 'وسيلة الدفع',
      cell: (row: OrderType) => (
        <Badge variant="outline">
          {row.paymentMethod === 'cash' ? 'نقدًا' : 
           row.paymentMethod === 'card' ? 'بطاقة' : 'محفظة'}
        </Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: 'الحالة',
      cell: (row: OrderType) => {
        let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';
        if (['pending', 'confirmed'].includes(row.status)) variant = 'secondary';
        if (['delivered'].includes(row.status)) variant = 'default';
        if (['cancelled', 'refunded'].includes(row.status)) variant = 'destructive';
        
        let statusText = '';
        switch (row.status) {
          case 'pending': statusText = 'معلق'; break;
          case 'accepted': statusText = 'مقبول'; break;
          case 'confirmed': statusText = 'مؤكد'; break;
          case 'picked_up': statusText = 'تم الاستلام'; break;
          case 'in_transit': statusText = 'في الطريق'; break;
          case 'delivered': statusText = 'تم التوصيل'; break;
          case 'cancelled': statusText = 'ملغي'; break;
          case 'refunded': statusText = 'مسترجع'; break;
        }
        
        return (
          <Badge variant={variant}>
            {statusText}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'التاريخ',
      cell: (row: OrderType) => (
        new Date(row.createdAt).toLocaleDateString('ar-EG')
      ),
    },
    {
      accessorKey: 'id', // dummy key for actions column
      header: 'الإجراءات',
      cell: (row: OrderType) => (
        <div className="flex space-x-2 space-x-reverse">
          <Button variant="outline" size="sm">
            عرض
          </Button>
          <Button variant="outline" size="sm">
            تتبع
          </Button>
        </div>
      ),
    },
  ];

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
          <h1 className="text-2xl font-bold">إدارة الطلبات</h1>
          <p className="text-muted-foreground">إدارة طلبات التوصيل وحالتها</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 ml-2" />
            تصدير CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>قائمة الطلبات</CardTitle>
          <Badge variant="secondary">{totalOrders} طلب</Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث عن طلب..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="حالة الطلب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="pending">معلق</SelectItem>
                <SelectItem value="accepted">مقبول</SelectItem>
                <SelectItem value="confirmed">مؤكد</SelectItem>
                <SelectItem value="picked_up">تم الاستلام</SelectItem>
                <SelectItem value="in_transit">في الطريق</SelectItem>
                <SelectItem value="delivered">تم التوصيل</SelectItem>
                <SelectItem value="cancelled">ملغي</SelectItem>
                <SelectItem value="refunded">مسترجع</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex space-x-2 space-x-reverse">
              <div className="relative flex-1">
                <Calendar className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="pr-10"
                  placeholder="من"
                />
              </div>
              <div className="relative flex-1">
                <Calendar className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="pr-10"
                  placeholder="إلى"
                />
              </div>
            </div>
          </div>

          <DataTable
            data={orders}
            columns={columns}
            onRowClick={(order) => console.log('View order:', (order as OrderType).id)}
          />
        </CardContent>
      </Card>
    </div>
  );
}