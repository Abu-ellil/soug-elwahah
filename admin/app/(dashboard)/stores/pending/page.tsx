'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Store, User, FileText, Check, X, Eye, Download } from 'lucide-react';
import { Store as StoreType, StoreDocument } from '@/types/store';
import { storesAPI } from '@/lib/api/stores';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

// Mock data - will be replaced with actual API calls
const mockPendingStores: StoreType[] = [
  {
    id: '3',
    name: 'بقالة الفهد',
    ownerId: '3',
    ownerName: 'محمود أحمد',
    ownerPhone: '01000002',
    category: 'بقالة',
    image: '/placeholder-store.jpg',
    rating: 0, // New store
    totalOrders: 0,
    status: 'closed',
    verificationStatus: 'pending',
    address: 'الجيزة، شارع الهرم',
    coordinates: { lat: 30.0131, lng: 31.2089 },
    workingHours: { open: '09:00', close: '21:00' },
    documents: [
      {
        id: 'd1',
        storeId: '3',
        type: 'commercial_register',
        fileName: 'السجل_التجاري.pdf',
        filePath: '/docs/commercial_register.pdf',
        uploadedAt: '2023-03-10T09:15:00Z',
      },
      {
        id: 'd2',
        storeId: '3',
        type: 'tax_card',
        fileName: 'البطاقة_الضريبية.pdf',
        filePath: '/docs/tax_card.pdf',
        uploadedAt: '2023-03-10T09:15:00Z',
      },
      {
        id: 'd3',
        storeId: '3',
        type: 'owner_id',
        fileName: 'الهوية_المالك.pdf',
        filePath: '/docs/owner_id.pdf',
        uploadedAt: '2023-03-10T09:15:00Z',
      },
    ],
    totalProducts: 0,
    totalRevenue: 0,
    createdAt: '2023-03-10T09:15:00Z',
  },
  {
    id: '6',
    name: 'محل الزعفران',
    ownerId: '6',
    ownerName: 'رانيا محمد',
    ownerPhone: '010000005',
    category: 'بقالة',
    image: '/placeholder-store.jpg',
    rating: 0, // New store
    totalOrders: 0,
    status: 'closed',
    verificationStatus: 'pending',
    address: 'القاهرة، شارع رمسيس',
    coordinates: { lat: 30.0444, lng: 31.2357 },
    workingHours: { open: '08:00', close: '2:00' },
    documents: [
      {
        id: 'd4',
        storeId: '6',
        type: 'commercial_register',
        fileName: 'السجل_التجاري.pdf',
        filePath: '/docs/commercial_register2.pdf',
        uploadedAt: '2023-04-15T14:30:00Z',
      },
      {
        id: 'd5',
        storeId: '6',
        type: 'tax_card',
        fileName: 'البطاقة_الضريبية.pdf',
        filePath: '/docs/tax_card2.pdf',
        uploadedAt: '2023-04-15T14:30:00Z',
      },
      {
        id: 'd6',
        storeId: '6',
        type: 'owner_id',
        fileName: 'الهوية_المالك.pdf',
        filePath: '/docs/owner_id2.pdf',
        uploadedAt: '2023-04-15T14:30:00Z',
      },
    ],
    totalProducts: 0,
    totalRevenue: 0,
    createdAt: '2023-04-15T14:30:00Z',
  },
];

export default function PendingStoresPage() {
  const [stores, setStores] = useState<StoreType[]>(mockPendingStores);
  const [loading, setLoading] = useState(true);
  const [totalStores, setTotalStores] = useState(0);
  const [rejectionReason, setRejectionReason] = useState('');
  const [storeToReject, setStoreToReject] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStores(mockPendingStores);
      setTotalStores(mockPendingStores.length);
      setLoading(false);
    }, 10);
  }, []);

  const handleApprove = async (storeId: string) => {
    try {
      // Simulate API call
      console.log(`Approving store: ${storeId}`);
      // Update the store status in the UI
      setStores(stores.map(store => 
        store.id === storeId ? { ...store, verificationStatus: 'approved' } : store
      ));
    } catch (error) {
      console.error('Error approving store:', error);
    }
  };

  const handleReject = async (storeId: string) => {
    try {
      // Simulate API call with reason
      console.log(`Rejecting store: ${storeId} with reason: ${rejectionReason}`);
      // Update the store status in the UI
      setStores(stores.map(store => 
        store.id === storeId ? { ...store, verificationStatus: 'rejected' } : store
      ));
      // Reset the dialog
      setStoreToReject(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting store:', error);
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'commercial_register': return 'السجل التجاري';
      case 'tax_card': return 'البطاقة الضريبية';
      case 'owner_id': return 'الهوية الشخصية';
      default: return type;
    }
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
          <h1 className="text-2xl font-bold">المتاجر المعلقة</h1>
          <p className="text-muted-foreground">المتاجر المنتظرة الموافقة</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>قائمة المتاجر المعلقة</CardTitle>
          <Badge variant="secondary">{totalStores} متجر</Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {stores.map((store) => (
              <Card key={store.id} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Store Info */}
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{store.name}</h3>
                    <p className="text-sm text-muted-foreground mb-1"><span className="font-medium">الفئة:</span> {store.category}</p>
                    <p className="text-sm text-muted-foreground mb-1"><span className="font-medium">العنوان:</span> {store.address}</p>
                    <p className="text-sm text-muted-foreground mb-1"><span className="font-medium">ساعات العمل:</span> {store.workingHours.open} - {store.workingHours.close}</p>
                  </div>

                  {/* Owner Info */}
                  <div>
                    <h4 className="font-medium mb-2">معلومات المالك</h4>
                    <p className="text-sm text-muted-foreground mb-1"><span className="font-medium">الاسم:</span> {store.ownerName}</p>
                    <p className="text-sm text-muted-foreground mb-1"><span className="font-medium">الهاتف:</span> {store.ownerPhone}</p>
                  </div>

                  {/* Documents Section */}
                  <div>
                    <h4 className="font-medium mb-2">المستندات</h4>
                    <div className="space-y-2">
                      {store.documents?.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm">{getDocumentTypeLabel(doc.type)}</span>
                          </div>
                          <div className="flex space-x-2 space-x-reverse">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                  <DialogTitle>عرض المستند</DialogTitle>
                                  <DialogDescription>
                                    {getDocumentTypeLabel(doc.type)}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="flex items-center space-x-2 space-x-reverse">
                                  <p className="text-sm">عرض محتوى المستند هنا...</p>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 space-x-reverse mt-6">
                  <Button 
                    variant="destructive" 
                    onClick={() => setStoreToReject(store.id)}
                  >
                    <X className="h-4 w-4 ml-2" />
                    رفض
                  </Button>
                  <Button 
                    variant="default" 
                    onClick={() => handleApprove(store.id)}
                  >
                    <Check className="h-4 w-4 ml-2" />
                    قبول
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rejection Dialog */}
      <Dialog open={!!storeToReject} onOpenChange={() => setStoreToReject(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>سبب الرفض</DialogTitle>
            <DialogDescription>
              يرجى إدخال سبب رفض المتجر
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-2 border rounded"
              rows={4}
              placeholder="أدخل سبب الرفض..."
            />
          </div>
          <div className="flex justify-end space-x-2 space-x-reverse">
            <Button 
              variant="outline" 
              onClick={() => {
                setStoreToReject(null);
                setRejectionReason('');
              }}
            >
              إلغاء
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => storeToReject && handleReject(storeToReject)}
              disabled={!rejectionReason.trim()}
            >
              تأكيد الرفض
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}