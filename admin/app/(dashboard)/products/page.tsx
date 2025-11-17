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
import { Package, Search, Download, Plus } from 'lucide-react';
import { DataTable } from '@/components/tables/DataTable';
import { Product as ProductType } from '@/types/order';
import { productsAPI } from '@/lib/api/products';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

// Mock data - will be replaced with actual API calls
const mockProducts: ProductType[] = [
 {
    id: '1',
    storeId: '1',
    name: 'أرز أبيض',
    description: 'أرز أبيض عالي الجودة',
    image: '/placeholder-product.jpg',
    price: 15,
    category: 'أرز',
    availability: 'available',
    totalSold: 124,
    createdAt: '2023-01-15T10:30:00Z',
  },
  {
    id: '2',
    storeId: '1',
    name: 'زيت طعام',
    description: 'زيت دوار الشمس 1 لتر',
    image: '/placeholder-product.jpg',
    price: 20,
    category: 'زيوت',
    availability: 'available',
    totalSold: 89,
    createdAt: '2023-02-20T14:45:00Z',
  },
  {
    id: '3',
    storeId: '2',
    name: 'سكر أبيض',
    description: 'سكر أبيض ناعم 1 كجم',
    image: '/placeholder-product.jpg',
    price: 12,
    category: 'سكريات',
    availability: 'out_of_stock',
    totalSold: 56,
    createdAt: '2023-03-10T09:15:00Z',
 },
  {
    id: '4',
    storeId: '3',
    name: 'شاي أخضر',
    description: 'شاي أخضر 50 كيس',
    image: '/placeholder-product.jpg',
    price: 8,
    category: 'شاي',
    availability: 'available',
    totalSold: 201,
    createdAt: '2023-04-05T16:20:00Z',
  },
  {
    id: '5',
    storeId: '4',
    name: 'حليب بودرة',
    description: 'حليب بودرة كامل الدسم 400 جم',
    image: '/placeholder-product.jpg',
    price: 35,
    category: 'ألبان',
    availability: 'available',
    totalSold: 76,
    createdAt: '2023-05-12T11:30:00Z',
  },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductType[]>(mockProducts);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProducts(mockProducts);
      setTotalProducts(mockProducts.length);
      setLoading(false);
    }, 10);
  }, []);

  // Define columns for the data table
  const columns = [
    {
      accessorKey: 'name',
      header: 'الاسم',
      cell: (row: ProductType) => (
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="bg-primary text-primary-foreground rounded-md w-10 h-10 flex items-center justify-center">
            {row.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium">{row.name}</div>
            <div className="text-sm text-muted-foreground">{row.description}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'storeId',
      header: 'المتجر',
      cell: (row: ProductType) => (
        <span>متجر {row.storeId}</span>
      ),
    },
    {
      accessorKey: 'category',
      header: 'التصنيف',
    },
    {
      accessorKey: 'price',
      header: 'السعر',
      cell: (row: ProductType) => (
        <span className="font-medium">{row.price} ج.م</span>
      ),
    },
    {
      accessorKey: 'availability',
      header: 'التوفر',
      cell: (row: ProductType) => (
        <Badge 
          variant={row.availability === 'available' ? 'default' : 'destructive'}
        >
          {row.availability === 'available' ? 'متوفر' : 'غير متوفر'}
        </Badge>
      ),
    },
    {
      accessorKey: 'totalSold',
      header: 'إجمالي المبيعات',
      cell: (row: ProductType) => (
        <span className="font-medium">{row.totalSold}</span>
      ),
    },
    {
      accessorKey: 'id', // dummy key for actions column
      header: 'الإجراءات',
      cell: (row: ProductType) => (
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
          <h1 className="text-2xl font-bold">إدارة المنتجات</h1>
          <p className="text-muted-foreground">إدارة منتجات المتاجر</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 ml-2" />
            تصدير CSV
          </Button>
          <Button>
            <Plus className="h-4 w-4 ml-2" />
            إضافة منتج
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>قائمة المنتجات</CardTitle>
          <Badge variant="secondary">{totalProducts} منتج</Badge>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث عن منتج..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="التصنيف" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع التصنيفات</SelectItem>
                <SelectItem value="arz">أرز</SelectItem>
                <SelectItem value="zuyut">زيوت</SelectItem>
                <SelectItem value="sukariyat">سكريات</SelectItem>
                <SelectItem value="shay">شاي</SelectItem>
                <SelectItem value="alban">ألبان</SelectItem>
              </SelectContent>
            </Select>
            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="التوفر" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="available">متوفر</SelectItem>
                <SelectItem value="out_of_stock">غير متوفر</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DataTable
            data={products}
            columns={columns}
            onRowClick={(product) => console.log('View product:', (product as ProductType).id)}
          />
        </CardContent>
      </Card>
    </div>
  );
}