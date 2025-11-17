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


export default function StoresPage() {
  const [stores, setStores] = useState<StoreType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [totalStores, setTotalStores] = useState(0);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await storesAPI.getAll({
          page: 1,
          limit: 50,
          search: searchTerm,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          verificationStatus: verificationFilter !== 'all' ? verificationFilter : undefined
        });
        setStores(response.data.stores || []);
        setTotalStores(response.data.total || 0);
      } catch (error) {
        console.error('Error fetching stores:', error);
        setStores([]);
        setTotalStores(0);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [searchTerm, statusFilter, verificationFilter]);

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