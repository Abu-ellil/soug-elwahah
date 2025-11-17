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
import { User, Car, FileText, Check, X, Eye, Download } from 'lucide-react';
import { Driver as DriverType, DriverDocument } from '@/types/driver';
import { driversAPI } from '@/lib/api/drivers';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

// Mock data - will be replaced with actual API calls
const mockPendingDrivers: DriverType[] = [
  {
    id: '3',
    name: 'خالد حسن',
    email: 'khaled@example.com',
    phone: '01000002',
    vehicleType: 'توك توك',
    vehicleNumber: 'د ر م 9012',
    rating: 0, // New driver
    totalOrders: 0,
    totalEarnings: 0,
    status: 'offline',
    verificationStatus: 'pending',
    documents: [
      {
        id: 'dd1',
        driverId: '3',
        type: 'national_id',
        fileName: 'الهوية_الوطنية.pdf',
        filePath: '/docs/national_id.pdf',
        uploadedAt: '2023-03-10T09:15:00Z',
      },
      {
        id: 'dd2',
        driverId: '3',
        type: 'driving_license',
        fileName: 'رخصة_القيادة.pdf',
        filePath: '/docs/driving_license.pdf',
        uploadedAt: '2023-03-10T09:15:00Z',
      },
    ],
    acceptanceRate: 0,
    completionRate: 0,
    createdAt: '2023-03-10T09:15:00Z',
  },
  {
    id: '6',
    name: 'سارة أحمد',
    email: 'sara@example.com',
    phone: '010005',
    vehicleType: 'موتوسيكل',
    vehicleNumber: 'ف ك ل 5566',
    rating: 0, // New driver
    totalOrders: 0,
    totalEarnings: 0,
    status: 'offline',
    verificationStatus: 'pending',
    documents: [
      {
        id: 'dd3',
        driverId: '6',
        type: 'national_id',
        fileName: 'الهوية_الوطنية.pdf',
        filePath: '/docs/national_id2.pdf',
        uploadedAt: '2023-04-15T14:30:00Z',
      },
      {
        id: 'dd4',
        driverId: '6',
        type: 'driving_license',
        fileName: 'رخصة_القيادة.pdf',
        filePath: '/docs/driving_license2.pdf',
        uploadedAt: '2023-04-15T14:30:00Z',
      },
    ],
    acceptanceRate: 0,
    completionRate: 0,
    createdAt: '2023-04-15T14:30:00Z',
  },
];

export default function PendingDriversPage() {
  const [drivers, setDrivers] = useState<DriverType[]>(mockPendingDrivers);
  const [loading, setLoading] = useState(true);
 const [totalDrivers, setTotalDrivers] = useState(0);
  const [rejectionReason, setRejectionReason] = useState('');
  const [driverToReject, setDriverToReject] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setDrivers(mockPendingDrivers);
      setTotalDrivers(mockPendingDrivers.length);
      setLoading(false);
    }, 10);
  }, []);

  const handleApprove = async (driverId: string) => {
    try {
      // Simulate API call
      console.log(`Approving driver: ${driverId}`);
      // Update the driver status in the UI
      setDrivers(drivers.map(driver => 
        driver.id === driverId ? { ...driver, verificationStatus: 'approved' } : driver
      ));
    } catch (error) {
      console.error('Error approving driver:', error);
    }
 };

  const handleReject = async (driverId: string) => {
    try {
      // Simulate API call with reason
      console.log(`Rejecting driver: ${driverId} with reason: ${rejectionReason}`);
      // Update the driver status in the UI
      setDrivers(drivers.map(driver => 
        driver.id === driverId ? { ...driver, verificationStatus: 'rejected' } : driver
      ));
      // Reset the dialog
      setDriverToReject(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting driver:', error);
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'national_id': return 'الهوية الوطنية';
      case 'driving_license': return 'رخصة القيادة';
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
          <h1 className="text-2xl font-bold">السائقين المعلقين</h1>
          <p className="text-muted-foreground">السائقين المنتظرين الموافقة</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>قائمة السائقين المعلقين</CardTitle>
          <Badge variant="secondary">{totalDrivers} سائق</Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {drivers.map((driver) => (
              <Card key={driver.id} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Driver Info */}
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{driver.name}</h3>
                    <p className="text-sm text-muted-foreground mb-1"><span className="font-medium">البريد الإلكتروني:</span> {driver.email}</p>
                    <p className="text-sm text-muted-foreground mb-1"><span className="font-medium">الهاتف:</span> {driver.phone}</p>
                  </div>

                  {/* Vehicle Info */}
                  <div>
                    <h4 className="font-medium mb-2">معلومات المركبة</h4>
                    <p className="text-sm text-muted-foreground mb-1"><span className="font-medium">نوع المركبة:</span> {driver.vehicleType}</p>
                    <p className="text-sm text-muted-foreground mb-1"><span className="font-medium">رقم المركبة:</span> {driver.vehicleNumber}</p>
                  </div>

                  {/* Documents Section */}
                  <div>
                    <h4 className="font-medium mb-2">المستندات</h4>
                    <div className="space-y-2">
                      {driver.documents?.map((doc) => (
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
                    onClick={() => setDriverToReject(driver.id)}
                  >
                    <X className="h-4 w-4 ml-2" />
                    رفض
                  </Button>
                  <Button 
                    variant="default" 
                    onClick={() => handleApprove(driver.id)}
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
      <Dialog open={!!driverToReject} onOpenChange={() => setDriverToReject(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>سبب الرفض</DialogTitle>
            <DialogDescription>
              يرجى إدخال سبب رفض السائق
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
                setDriverToReject(null);
                setRejectionReason('');
              }}
            >
              إلغاء
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => driverToReject && handleReject(driverToReject)}
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