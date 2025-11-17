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
import { Users, Search, Download, Plus } from 'lucide-react';
import { DataTable } from '@/components/tables/DataTable';
import { User } from '@/types/user';
import { usersAPI } from '@/lib/api/users';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

// Mock data - will be replaced with actual API calls
const mockUsers: User[] = [
  {
    id: '1',
    name: 'أحمد محمد',
    email: 'ahmed@example.com',
    phone: '0100000',
    totalOrders: 24,
    totalSpent: 1250,
    status: 'active',
    registeredAt: '2023-01-15T10:30:00Z',
 },
  {
    id: '2',
    name: 'فاطمة خالد',
    email: 'fatma@example.com',
    phone: '0100001',
    totalOrders: 18,
    totalSpent: 980,
    status: 'active',
    registeredAt: '2023-02-20T14:45:00Z',
 },
  {
    id: '3',
    name: 'محمود أحمد',
    email: 'mahmoud@example.com',
    phone: '01000002',
    totalOrders: 5,
    totalSpent: 320,
    status: 'inactive',
    registeredAt: '2023-03-10T09:15:00Z',
  },
  {
    id: '4',
    name: 'سارة إبراهيم',
    email: 'sara@example.com',
    phone: '01000003',
    totalOrders: 32,
    totalSpent: 2100,
    status: 'active',
    registeredAt: '2023-04-05T16:20:0Z',
  },
  {
    id: '5',
    name: 'نور الدين',
    email: 'noor@example.com',
    phone: '010000004',
    totalOrders: 12,
    totalSpent: 750,
    status: 'active',
    registeredAt: '2023-05-12T11:30:00Z',
 },
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setUsers(mockUsers);
      setTotalUsers(mockUsers.length);
      setLoading(false);
    }, 10);
  }, []);

  // Define columns for the data table
  const columns = [
    {
      accessorKey: 'name',
      header: 'الاسم',
      cell: (row: User) => (
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
      accessorKey: 'totalOrders',
      header: 'إجمالي الطلبات',
      cell: (row: User) => (
        <span className="font-medium">{row.totalOrders}</span>
      ),
    },
    {
      accessorKey: 'totalSpent',
      header: 'إجمالي الإنفاق',
      cell: (row: User) => (
        <span className="font-medium">{row.totalSpent} ج.م</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'الحالة',
      cell: (row: User) => (
        <Badge 
          variant={row.status === 'active' ? 'default' : 'secondary'}
        >
          {row.status === 'active' ? 'نشط' : 'غير نشط'}
        </Badge>
      ),
    },
    {
      accessorKey: 'registeredAt',
      header: 'تاريخ التسجيل',
      cell: (row: User) => (
        new Date(row.registeredAt).toLocaleDateString('ar-EG')
      ),
    },
    {
      accessorKey: 'id', // dummy key for actions column
      header: 'الإجراءات',
      cell: (row: User) => (
        <div className="flex space-x-2 space-x-reverse">
          <Button variant="outline" size="sm">
            عرض
          </Button>
          <Button variant="outline" size="sm">
            {row.status === 'active' ? 'حظر' : 'إلغاء الحظر'}
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
          <h1 className="text-2xl font-bold">إدارة المستخدمين</h1>
          <p className="text-muted-foreground">إدارة حسابات المستخدمين وبياناتهم</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 ml-2" />
            تصدير CSV
          </Button>
          <Button>
            <Plus className="h-4 w-4 ml-2" />
            إضافة مستخدم
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>قائمة المستخدمين</CardTitle>
          <Badge variant="secondary">{totalUsers} مستخدم</Badge>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث عن مستخدم..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="حالة المستخدم" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="inactive">غير نشط</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DataTable
            data={users}
            columns={columns}
            onRowClick={(user) => console.log('View user:', (user as User).id)}
          />
        </CardContent>
      </Card>
    </div>
  );
}