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
import { Store, Search, Download, Plus } from 'lucide-react';
import { DataTable } from '@/components/tables/DataTable';
import { Store as StoreType } from '@/types/store';
import { storesAPI } from '@/lib/api/stores';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

// Mock data - will be replaced with actual API calls
const mockStores: StoreType[] = [
  {
    id: '1',
    name: 'متجر العزيز',
    ownerId: '1',
    ownerName: 'أحمد محمد',
    ownerPhone: '01000000',
    category: 'بقالة',
    image: '/placeholder-store.jpg',
    rating: 4.5,
    totalOrders: 124,
    status: 'open',
    verificationStatus: 'approved',
    address: 'القاهرة، شارع النزهة',
    coordinates: { lat: 30.0444, lng: 31.2357 },
    workingHours: { open: '08:00', close: '22:00' },
    totalProducts: 45,
    totalRevenue: 12500,
    createdAt: '2023-01-15T10:30:00Z',
  },
  {
    id: '2',
    name: 'سوبر ماركت النصر',
    ownerId: '2',
    ownerName: 'فاطمة خالد',
    ownerPhone: '01000001',
    category: 'سوبر ماركت',
    image: '/placeholder-store.jpg',
    rating: 4.2,
    totalOrders: 89,
    status: 'open',
    verificationStatus: 'approved',
    address: 'الإسكندرية، شارع الجمهورية',
    coordinates: { lat: 31.2001, lng: 29.9187 },
    workingHours: { open: '07:00', close: '23:00' },
    totalProducts: 78,
    totalRevenue: 980,
    createdAt: '2023-02-20T14:45:00Z',
 },
  {
    id: '3',
    name: 'بقالة الفهد',
    ownerId: '3',
    ownerName: 'محمود أحمد',
    ownerPhone: '010000002',
    category: 'بقالة',
    image: '/placeholder-store.jpg',
    rating: 3.8,
    totalOrders: 56,
    status: 'closed',
    verificationStatus: 'pending',
    address: 'الجيزة، شارع الهرم',
    coordinates: { lat: 30.0131, lng: 31.2089 },
    workingHours: { open: '09:00', close: '21:00' },
    totalProducts: 32,
    totalRevenue: 4200,
    createdAt: '2023-03-10T09:15:00Z',
  },
  {
    id: '4',
    name: 'محل السعادة',
    ownerId: '4',
    ownerName: 'سارة إبراهيم',
    ownerPhone: '0100003',
    category: 'محل عام',
    image: '/placeholder-store.jpg',
    rating: 4.7,
    totalOrders: 201,
    status: 'open',
    verificationStatus: 'approved',
    address: 'القاهرة، شارع التحرير',
    coordinates: { lat: 30.0444, lng: 31.2357 },
    workingHours: { open: '08:30', close: '22:30' },
    totalProducts: 67,
    totalRevenue: 18500,
    createdAt: '2023-04-05T16:20:00Z',
  },
  {
    id: '5',
    name: 'محل الزهرة',
    ownerId: '5',
    ownerName: 'نور الدين',
    ownerPhone: '01000004',
    category: 'حلويات',
    image: '/placeholder-store.jpg',
    rating: 4.9,
    totalOrders: 76,
    status: 'suspended',
    verificationStatus: 'rejected',
    address: 'الإسكندرية، شارع النيل',
    coordinates: { lat: 31.2001, lng: 29.9187 },
    workingHours: { open: '08:00', close: '20:00' },
    totalProducts: 41,
    totalRevenue: 6500,
    createdAt: '2023-05-12T11:30:00Z',
  },
];

export default function StoresPage() {
  const [stores, setStores] = useState<StoreType[]>(mockStores);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [totalStores, setTotalStores] = useState(0);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStores(mockStores);
      setTotalStores(mockStores.length);
      setLoading(false);
    }, 10);
  }, []);

  // Define columns for the data table
  const columns = [
    {
      accessorKey: 'name',
      header: 'اسم المتجر',
      cell: (row: StoreType) => (
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="bg-primary text-primary-foreground rounded-md w-10 h-10 flex items-center justify-center">
            {row.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium">{row.name}</div>
            <div className="text-sm text-muted-foreground">{row.category}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'ownerName',
      header: 'اسم المالك',
    },
    {
      accessorKey: 'ownerPhone',
      header: 'هاتف المالك',
    },
    {
      accessorKey: 'rating',
      header: 'التقييم',
      cell: (row: StoreType) => (
        <div className="flex items-center">
          <span className="font-medium">{row.rating}</span>
          <span className="text-muted-foreground mr-1">★</span>
        </div>
      ),
    },
    {
      accessorKey: 'totalOrders',
      header: 'إجمالي الطلبات',
      cell: (row: StoreType) => (
        <span className="font-medium">{row.totalOrders}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'الحالة',
      cell: (row: StoreType) => (
        <Badge 
          variant={row.status === 'open' ? 'default' : row.status === 'closed' ? 'secondary' : 'destructive'}
        >
          {row.status === 'open' ? 'مفتوح' : row.status === 'closed' ? 'مغلق' : 'معلق'}
        </Badge>
      ),
    },
    {
      accessorKey: 'verificationStatus',
      header: 'حالة التحقق',
      cell: (row: StoreType) => (
        <Badge 
          variant={row.verificationStatus === 'approved' ? 'default' : 
                   row.verificationStatus === 'pending' ? 'secondary' : 'destructive'}
        >
          {row.verificationStatus === 'approved' ? 'تم التحقق' : 
           row.verificationStatus === 'pending' ? 'في الانتظار' : 'مرفوض'}
        </Badge>
      ),
    },
    {
      accessorKey: 'id', // dummy key for actions column
      header: 'الإجراءات',
      cell: (row: StoreType) => (
        <div className="flex space-x-2 space-x-reverse">
          <Button variant="outline" size="sm">
            عرض
          </Button>
          <Button variant="outline" size="sm">
            تعديل
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
          <h1 className="text-2xl font-bold">إدارة المتاجر</h1>
          <p className="text-muted-foreground">إدارة حسابات المتاجر وبياناتهم</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 ml-2" />
            تصدير CSV
          </Button>
          <Button>
            <Plus className="h-4 w-4 ml-2" />
            إضافة متجر
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>قائمة المتاجر</CardTitle>
          <Badge variant="secondary">{totalStores} متجر</Badge>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث عن متجر..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="حالة المتجر" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="open">مفتوح</SelectItem>
                <SelectItem value="closed">مغلق</SelectItem>
                <SelectItem value="suspended">معلق</SelectItem>
              </SelectContent>
            </Select>
            <Select value={verificationFilter} onValueChange={setVerificationFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="حالة التحقق" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="approved">تم التحقق</SelectItem>
                <SelectItem value="pending">في الانتظار</SelectItem>
                <SelectItem value="rejected">مرفوض</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DataTable
            data={stores}
            columns={columns}
            onRowClick={(store) => console.log('View store:', (store as StoreType).id)}
          />
        </CardContent>
      </Card>
    </div>
  );
}