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
import { User, Search, Download, Plus, Check, X } from 'lucide-react';
import { DataTable } from '@/components/tables/DataTable';
import { User as UserType } from '@/types/user';
import { usersAPI } from '@/lib/api/users';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ActionDropdown } from '@/components/shared/ActionDropdown';
import { ConfirmModal } from '@/components/modals/ConfirmModal';

interface StoreOwner {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  totalOrders: number;
  totalSpent: number;
  status: 'active' | 'inactive';
  registeredAt: string;
  isActive: boolean;
 storeId?: {
    _id: string;
    name: string;
 };
  verificationStatus: 'pending' | 'approved' | 'rejected';
}

export default function StoreOwnersPage() {
  const [storeOwners, setStoreOwners] = useState<StoreOwner[]>([]);
  const [loading, setLoading] = useState(true);
 const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [totalStoreOwners, setTotalStoreOwners] = useState(0);
  const [selectedStoreOwner, setSelectedStoreOwner] = useState<StoreOwner | null>(null);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
 const [actionType, setActionType] = useState<'activate' | 'deactivate'>('activate');

  const handleUpdateStatus = async () => {
    if (!selectedStoreOwner) return;
    
    try {
      await usersAPI.updateStatus(selectedStoreOwner.id, 'store', actionType === 'activate');
      // Refresh the store owners list
      const response = await usersAPI.getAllStoreOwners({
        page: 1,
        limit: 50,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        verificationStatus: verificationFilter !== 'all' ? verificationFilter : undefined
      });
      setStoreOwners(response.data.storeOwners || []);
      setTotalStoreOwners(response.data.total || 0);
      
      if (actionType === 'activate') {
        setShowActivateModal(false);
      } else {
        setShowDeactivateModal(false);
      }
      
      setSelectedStoreOwner(null);
    } catch (error) {
      console.error(`Error ${actionType === 'activate' ? 'activating' : 'deactivating'} store owner:`, error);
    }
 };

  useEffect(() => {
    const fetchStoreOwners = async () => {
      try {
        const response = await usersAPI.getAllStoreOwners({
          page: 1,
          limit: 50,
          search: searchTerm,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          verificationStatus: verificationFilter !== 'all' ? verificationFilter : undefined
        });
        setStoreOwners(response.data.storeOwners || []);
        setTotalStoreOwners(response.data.total || 0);
      } catch (error) {
        console.error('Error fetching store owners:', error);
        setStoreOwners([]);
        setTotalStoreOwners(0);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreOwners();
  }, [searchTerm, statusFilter, verificationFilter]);

  // Define columns for the data table
  const columns = [
    {
      accessorKey: 'name',
      header: 'اسم المالك',
      cell: (row: StoreOwner) => (
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center">
            {row.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium">{row.name}</div>
            <div className="text-sm text-muted-foreground">{row.email || row.phone}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'الهاتف',
    },
    {
      accessorKey: 'storeId',
      header: 'المتجر المرتبط',
      cell: (row: StoreOwner) => (
        <span>{row.storeId?.name || 'لا يوجد'}</span>
      ),
    },
    {
      accessorKey: 'verificationStatus',
      header: 'حالة التحقق',
      cell: (row: StoreOwner) => (
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
      accessorKey: 'isActive',
      header: 'الحالة',
      cell: (row: StoreOwner) => (
        <Badge 
          variant={row.isActive ? 'default' : 'secondary'}
        >
          {row.isActive ? 'نشط' : 'غير نشط'}
        </Badge>
      ),
    },
    {
      accessorKey: 'id', // dummy key for actions column
      header: 'الإجراءات',
      cell: (row: StoreOwner) => (
        <ActionDropdown
          actions={[
            {
              label: row.isActive ? 'إلغاء التفعيل' : 'تفعيل',
              onClick: () => {
                setSelectedStoreOwner(row);
                if (row.isActive) {
                  setActionType('deactivate');
                  setShowDeactivateModal(true);
                } else {
                  setActionType('activate');
                  setShowActivateModal(true);
                }
              },
              variant: row.isActive ? 'destructive' as const : 'default' as const,
            },
          ]}
        />
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
          <h1 className="text-2xl font-bold">إدارة مالكي المتاجر</h1>
          <p className="text-muted-foreground">إدارة حسابات مالكي المتاجر وبياناتهم</p>
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
          <CardTitle>قائمة مالكي المتاجر</CardTitle>
          <Badge variant="secondary">{totalStoreOwners} مالك متجر</Badge>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث عن مالك متجر..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="حالة الحساب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="inactive">غير نشط</SelectItem>
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
            data={storeOwners}
            columns={columns}
            onRowClick={(storeOwner) => {
              // يمكن إضافة وظيفة لعرض تفاصيل مالك المتجر
            }}
          />
        </CardContent>
      </Card>

      {/* Activation Confirmation Modal */}
      <ConfirmModal
        isOpen={showActivateModal}
        onClose={() => {
          setShowActivateModal(false);
          setSelectedStoreOwner(null);
        }}
        onConfirm={handleUpdateStatus}
        title="تفعيل مالك المتجر"
        description={`هل أنت متأكد أنك تريد تفعيل حساب مالك المتجر "${selectedStoreOwner?.name}"؟`}
        confirmText="تفعيل"
        cancelText="إلغاء"
        variant="info"
      />

      {/* Deactivation Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeactivateModal}
        onClose={() => {
          setShowDeactivateModal(false);
          setSelectedStoreOwner(null);
        }}
        onConfirm={handleUpdateStatus}
        title="إلغاء تفعيل مالك المتجر"
        description={`هل أنت متأكد أنك تريد إلغاء تفعيل حساب مالك المتجر "${selectedStoreOwner?.name}"؟`}
        confirmText="إلغاء التفعيل"
        cancelText="إلغاء"
        variant="danger"
      />
    </div>
  );
}
