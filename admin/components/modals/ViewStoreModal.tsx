'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Store } from '@/types/store';
import { Product } from '@/types/order';
import { useState, useEffect } from 'react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { DataTable } from '@/components/tables/DataTable';
import { productsAPI } from '@/lib/api/products';
import { storesAPI } from '@/lib/api/stores';
import { MapPin, Phone, Clock, Star, Package, DollarSign, Users, Check, X } from 'lucide-react';

interface ViewStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: Store | null;
}

export function ViewStoreModal({ isOpen, onClose, store }: ViewStoreModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingApprove, setLoadingApprove] = useState(false);
  const [loadingReject, setLoadingReject] = useState(false);

  useEffect(() => {
    if (isOpen && store) {
      fetchStoreProducts();
    }
  }, [isOpen, store]);

  const fetchStoreProducts = async () => {
    if (!store) return;
    
    setLoadingProducts(true);
    try {
      const response = await productsAPI.getAll({ storeId: store.id });
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching store products:', error);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleApprove = async () => {
    if (!store) return;
    setLoadingApprove(true);
    try {
      await storesAPI.approve(store.id);
      // Refresh the store data by closing and reopening the modal
      onClose();
    } catch (error) {
      console.error('Error approving store:', error);
    } finally {
      setLoadingApprove(false);
    }
  };

  const handleReject = async () => {
    if (!store) return;
    setLoadingReject(true);
    try {
      await storesAPI.reject(store.id, 'Rejected by admin'); // Default reason, could be made configurable
      // Refresh the store data by closing and reopening the modal
      onClose();
    } catch (error) {
      console.error('Error rejecting store:', error);
    } finally {
      setLoadingReject(false);
    }
  };

  const productColumns = [
    {
      accessorKey: 'name',
      header: 'اسم المنتج',
    },
    {
      accessorKey: 'price',
      header: 'السعر',
      cell: (row: Product) => (
        <span>{row.price} EGP</span>
      ),
    },
    {
      accessorKey: 'category',
      header: 'التصنيف',
    },
    {
      accessorKey: 'availability',
      header: 'التوفر',
      cell: (row: Product) => (
        <Badge 
          variant={row.availability === 'available' ? 'default' : 'destructive'}
        >
          {row.availability === 'available' ? 'متاح' : 'غير متوفر'}
        </Badge>
      ),
    },
  ];

  if (!store) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>عرض تفاصيل المتجر</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Store Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {store.image ? (
                  <img 
                    src={store.image} 
                    alt={store.name} 
                    className="w-10 h-10 rounded-md object-cover"
                  />
                ) : (
                  <div className="bg-primary text-primary-foreground rounded-md w-10 h-10 flex items-center justify-center">
                    {store.name.charAt(0).toUpperCase()}
                  </div>
                )}
                {store.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">المالك: {store.ownerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">هاتف المالك: {store.ownerPhone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">العنوان: {store.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  أوقات العمل: {store.workingHours.open} - {store.workingHours.close}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">التقييم: {store.rating} ★</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">إجمالي المنتجات: {store.totalProducts}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">إجمالي الإيرادات: {store.totalRevenue} EGP</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">إجمالي الطلبات: {store.totalOrders}</span>
              </div>
              <div className="flex gap-2">
                <Badge 
                  variant={store.status === 'open' ? 'default' : store.status === 'closed' ? 'secondary' : 'destructive'}
                >
                  {store.status === 'open' ? 'مفتوح' : store.status === 'closed' ? 'مغلق' : 'معلق'}
                </Badge>
                <Badge 
                  variant={store.verificationStatus === 'approved' ? 'default' : 
                           store.verificationStatus === 'pending' ? 'secondary' : 'destructive'}
                >
                  {store.verificationStatus === 'approved' ? 'تم التحقق' : 
                   store.verificationStatus === 'pending' ? 'في الانتظار' : 'مرفوض'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Products Tab */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>منتجات المتجر</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingProducts ? (
                <div className="flex items-center justify-center h-32">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <DataTable
                  data={products}
                  columns={productColumns}
                />
              )}
            </CardContent>
          </Card>
        </div>
        
        <DialogFooter className="flex justify-between">
          <div>
            {store.verificationStatus === 'pending' && (
              <div className="flex space-x-2 space-x-reverse">
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={loadingReject}
                >
                  {loadingReject ? 'جاري...' : (
                    <>
                      <X className="h-4 w-4 ml-2" />
                      رفض
                    </>
                  )}
                </Button>
                <Button
                  variant="default"
                  onClick={handleApprove}
                  disabled={loadingApprove}
                >
                  {loadingApprove ? 'جاري...' : (
                    <>
                      <Check className="h-4 w-4 ml-2" />
                      قبول
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
          <Button onClick={onClose}>إغلاق</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
