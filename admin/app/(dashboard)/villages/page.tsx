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
import { MapPin, Search, Download, Plus } from 'lucide-react';
import { DataTable } from '@/components/tables/DataTable';
import { Village } from '@/types/driver';
import { villagesAPI } from '@/lib/api/villages';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

// Mock data - will be replaced with actual API calls
const mockVillages: Village[] = [
  {
    id: '1',
    name: 'قرية النصر',
    coordinates: { lat: 30.0444, lng: 31.2357 },
    totalStores: 24,
    totalUsers: 1240,
    totalDrivers: 15,
  },
  {
    id: '2',
    name: 'قرية السلام',
    coordinates: { lat: 31.2001, lng: 29.9187 },
    totalStores: 18,
    totalUsers: 890,
    totalDrivers: 12,
  },
  {
    id: '3',
    name: 'قرية الفتح',
    coordinates: { lat: 30.0131, lng: 31.2089 },
    totalStores: 15,
    totalUsers: 750,
    totalDrivers: 8,
  },
  {
    id: '4',
    name: 'قرية الامل',
    coordinates: { lat: 30.0444, lng: 31.2357 },
    totalStores: 32,
    totalUsers: 1850,
    totalDrivers: 2,
  },
 {
    id: '5',
    name: 'قرية التقدم',
    coordinates: { lat: 31.2001, lng: 29.9187 },
    totalStores: 12,
    totalUsers: 650,
    totalDrivers: 7,
  },
];

export default function VillagesPage() {
  const [villages, setVillages] = useState<Village[]>(mockVillages);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalVillages, setTotalVillages] = useState(0);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setVillages(mockVillages);
      setTotalVillages(mockVillages.length);
      setLoading(false);
    }, 10);
  }, []);

  // Define columns for the data table
  const columns = [
    {
      accessorKey: 'name',
      header: 'اسم القرية',
    },
    {
      accessorKey: 'coordinates',
      header: 'الإحداثيات',
      cell: (row: Village) => (
        <span>{row.coordinates.lat}, {row.coordinates.lng}</span>
      ),
    },
    {
      accessorKey: 'totalStores',
      header: 'إجمالي المتاجر',
      cell: (row: Village) => (
        <span className="font-medium">{row.totalStores}</span>
      ),
    },
    {
      accessorKey: 'totalUsers',
      header: 'إجمالي المستخدمين',
      cell: (row: Village) => (
        <span className="font-medium">{row.totalUsers}</span>
      ),
    },
    {
      accessorKey: 'totalDrivers',
      header: 'إجمالي السائقين',
      cell: (row: Village) => (
        <span className="font-medium">{row.totalDrivers}</span>
      ),
    },
    {
      accessorKey: 'id', // dummy key for actions column
      header: 'الإجراءات',
      cell: (row: Village) => (
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
          <h1 className="text-2xl font-bold">إدارة القرى</h1>
          <p className="text-muted-foreground">إدارة قرى التوصيل</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 ml-2" />
            تصدير CSV
          </Button>
          <Button>
            <Plus className="h-4 w-4 ml-2" />
            إضافة قرية
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>قائمة القرى</CardTitle>
          <Badge variant="secondary">{totalVillages} قرية</Badge>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث عن قرية..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
          </div>

          <DataTable
            data={villages}
            columns={columns}
            onRowClick={(village) => console.log('View village:', (village as Village).id)}
          />
        </CardContent>
      </Card>
    </div>
  );
}