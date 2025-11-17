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
import { Car, Search, Download, Plus } from 'lucide-react';
import { DataTable } from '@/components/tables/DataTable';
import { Driver as DriverType } from '@/types/driver';
import { driversAPI } from '@/lib/api/drivers';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';


export default function DriversPage() {
  const [drivers, setDrivers] = useState<DriverType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [totalDrivers, setTotalDrivers] = useState(0);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await driversAPI.getAll({
          page: 1,
          limit: 50,
          search: searchTerm,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          verificationStatus: verificationFilter !== 'all' ? verificationFilter : undefined
        });
        setDrivers(response.data.drivers || []);
        setTotalDrivers(response.data.total || 0);
      } catch (error) {
        console.error('Error fetching drivers:', error);
        setDrivers([]);
        setTotalDrivers(0);
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
  }, [searchTerm, statusFilter, verificationFilter]);

  // Define columns for the data table
  const columns = [
    {
      accessorKey: 'name',
      header: 'الاسم',
      cell: (row: DriverType) => (
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center">
            {row.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium">{row.name}</div>
            <div className="text-sm text-muted-foreground">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'الهاتف',
    },
    {
      accessorKey: 'vehicleType',
      header: 'نوع المركبة',
    },
    {
      accessorKey: 'vehicleNumber',
      header: 'رقم المركبة',
    },
    {
      accessorKey: 'rating',
      header: 'التقييم',
      cell: (row: DriverType) => (
        <div className="flex items-center">
          <span className="font-medium">{row.rating}</span>
          <span className="text-muted-foreground mr-1">★</span>
        </div>
      ),
    },
    {
      accessorKey: 'totalOrders',
      header: 'إجمالي الطلبات',
      cell: (row: DriverType) => (
        <span className="font-medium">{row.totalOrders}</span>
      ),
    },
    {
      accessorKey: 'totalEarnings',
      header: 'إجمالي الأرباح',
      cell: (row: DriverType) => (
        <span className="font-medium">{row.totalEarnings} ج.م</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'الحالة',
      cell: (row: DriverType) => (
        <Badge 
          variant={row.status === 'available' ? 'default' : 
                   row.status === 'busy' ? 'secondary' : 'destructive'}
        >
          {row.status === 'available' ? 'متاح' : 
           row.status === 'busy' ? 'مشغول' : 'غير متاح'}
        </Badge>
      ),
    },
    {
      accessorKey: 'verificationStatus',
      header: 'حالة التحقق',
      cell: (row: DriverType) => (
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
      cell: (row: DriverType) => (
        <div className="flex space-x-2 space-x-reverse">
          <Button variant="outline" size="sm">
            عرض
          </Button>
          <Button variant="outline" size="sm">
            {row.verificationStatus === 'approved' ? 'حظر' : 'إلغاء الحظر'}
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
          <h1 className="text-2xl font-bold">إدارة السائقين</h1>
          <p className="text-muted-foreground">إدارة حسابات السائقين وبياناتهم</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 ml-2" />
            تصدير CSV
          </Button>
          <Button>
            <Plus className="h-4 w-4 ml-2" />
            إضافة سائق
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>قائمة السائقين</CardTitle>
          <Badge variant="secondary">{totalDrivers} سائق</Badge>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث عن سائق..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="حالة السائق" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="available">متاح</SelectItem>
                <SelectItem value="busy">مشغول</SelectItem>
                <SelectItem value="offline">غير متاح</SelectItem>
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
            data={drivers}
            columns={columns}
            onRowClick={(driver) => console.log('View driver:', (driver as DriverType).id)}
          />
        </CardContent>
      </Card>
    </div>
  );
}