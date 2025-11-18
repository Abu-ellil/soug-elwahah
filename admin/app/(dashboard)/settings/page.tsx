'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Settings as SettingsIcon, Save, Upload } from 'lucide-react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { settingsAPI } from '@/lib/api/settings';

// Define the Settings type based on the API response structure
interface Settings {
  appName: string;
  logo: string;
  supportEmail: string;
  supportPhone: string;
  defaultDeliveryFee: number;
  maxDeliveryRadius: number;
  deliveryTimeEstimates: {
    min: number;
    max: number;
  };
  enableCash: boolean;
  enableCard: boolean;
  enableWallet: boolean;
  commissionRate: number;
  firebaseConfig: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  maintenanceMode: boolean;
  apiRateLimit: number;
}

// Mock settings data
const initialSettings = {
  appName: 'نظام توصيل القرى',
  logo: '',
  supportEmail: 'support@delivery.com',
  supportPhone: '01000000000',
  defaultDeliveryFee: 20,
  maxDeliveryRadius: 10,
  deliveryTimeEstimates: {
    min: 30,
    max: 60,
  },
  enableCash: true,
 enableCard: true,
  enableWallet: false,
  commissionRate: 10,
  firebaseConfig: {
    apiKey: 'AIzaSy...',
    authDomain: 'project.firebaseapp.com',
    projectId: 'project-id',
    storageBucket: 'project.appspot.com',
    messagingSenderId: '123456789',
    appId: '1:123456789:web:abc123',
  },
  maintenanceMode: false,
  apiRateLimit: 100,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await settingsAPI.getSettings();
        // Ensure all nested properties exist by merging with initial settings
        const mergedSettings = {
          ...initialSettings,
          ...response.data.settings,
          deliveryTimeEstimates: {
            ...initialSettings.deliveryTimeEstimates,
            ...response.data.settings?.deliveryTimeEstimates
          },
          firebaseConfig: {
            ...initialSettings.firebaseConfig,
            ...response.data.settings?.firebaseConfig
          }
        };
        setSettings(mergedSettings);
      } catch (error) {
        console.error('Error fetching settings:', error);
        // Set default settings in case of error
        setSettings(initialSettings);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleInputChange = (field: keyof Settings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (
    parentField: 'deliveryTimeEstimates' | 'firebaseConfig',
    field: string,
    value: any
  ) => {
    setSettings(prev => ({
      ...prev,
      [parentField]: {
        ...(prev[parentField] || (parentField === 'deliveryTimeEstimates'
          ? initialSettings.deliveryTimeEstimates
          : initialSettings.firebaseConfig)),
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
      setSaving(true);
      try {
        // Prepare settings to ensure proper structure when sending to API
        const settingsToSend = {
          ...settings,
          deliveryTimeEstimates: {
            min: settings.deliveryTimeEstimates?.min ?? initialSettings.deliveryTimeEstimates.min,
            max: settings.deliveryTimeEstimates?.max ?? initialSettings.deliveryTimeEstimates.max
          },
          firebaseConfig: {
            ...initialSettings.firebaseConfig,
            ...settings.firebaseConfig
          }
        };
        const response = await settingsAPI.updateSettings(settingsToSend);
        console.log('Settings saved:', response);
      } catch (error) {
        console.error('Error saving settings:', error);
      } finally {
        setSaving(false);
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
      <div>
        <h1 className="text-2xl font-bold">الإعدادات</h1>
        <p className="text-muted-foreground">إدارة إعدادات النظام</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>لوحة الإعدادات</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">العامة</TabsTrigger>
              <TabsTrigger value="delivery">التوصيل</TabsTrigger>
              <TabsTrigger value="payment">الدفع</TabsTrigger>
              <TabsTrigger value="system">النظام</TabsTrigger>
            </TabsList>
            
            {/* General Settings Tab */}
            <TabsContent value="general" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="appName">اسم التطبيق</Label>
                  <Input
                    id="appName"
                    value={settings.appName ?? initialSettings.appName}
                    onChange={(e) => handleInputChange('appName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="supportEmail">بريد الدعم</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={settings.supportEmail ?? initialSettings.supportEmail}
                    onChange={(e) => handleInputChange('supportEmail', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="supportPhone">هاتف الدعم</Label>
                  <Input
                    id="supportPhone"
                    value={settings.supportPhone ?? initialSettings.supportPhone}
                    onChange={(e) => handleInputChange('supportPhone', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="logo">الشعار</Label>
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 ml-2" />
                      تحميل
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Delivery Settings Tab */}
            <TabsContent value="delivery" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="defaultDeliveryFee">رسوم التوصيل الافتراضية (ج.م)</Label>
                  <Input
                    id="defaultDeliveryFee"
                    type="number"
                    value={settings.defaultDeliveryFee ?? initialSettings.defaultDeliveryFee}
                    onChange={(e) => handleInputChange('defaultDeliveryFee', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="maxDeliveryRadius">أقصى مدى توصيل (كم)</Label>
                  <Input
                    id="maxDeliveryRadius"
                    type="number"
                    value={settings.maxDeliveryRadius ?? initialSettings.maxDeliveryRadius}
                    onChange={(e) => handleInputChange('maxDeliveryRadius', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="deliveryTimeMin">الحد الأدنى لوقت التوصيل (دقيقة)</Label>
                  <Input
                    id="deliveryTimeMin"
                    type="number"
                    value={settings.deliveryTimeEstimates?.min ?? initialSettings.deliveryTimeEstimates.min}
                    onChange={(e) => handleNestedInputChange('deliveryTimeEstimates', 'min', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="deliveryTimeMax">الحد الأقصى لوقت التوصيل (دقيقة)</Label>
                  <Input
                    id="deliveryTimeMax"
                    type="number"
                    value={settings.deliveryTimeEstimates?.max ?? initialSettings.deliveryTimeEstimates.max}
                    onChange={(e) => handleNestedInputChange('deliveryTimeEstimates', 'max', Number(e.target.value))}
                  />
                </div>
              </div>
            </TabsContent>
            
            {/* Payment Settings Tab */}
            <TabsContent value="payment" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableCash">الدفع نقدًا</Label>
                  <Switch
                    id="enableCash"
                    checked={settings.enableCash ?? initialSettings.enableCash}
                    onCheckedChange={(checked) => handleInputChange('enableCash', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableCard">الدفع بالبطاقة</Label>
                  <Switch
                    id="enableCard"
                    checked={settings.enableCard ?? initialSettings.enableCard}
                    onCheckedChange={(checked) => handleInputChange('enableCard', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableWallet">الدفع بالمحفظة</Label>
                  <Switch
                    id="enableWallet"
                    checked={settings.enableWallet ?? initialSettings.enableWallet}
                    onCheckedChange={(checked) => handleInputChange('enableWallet', checked)}
                  />
                </div>
                <div>
                  <Label htmlFor="commissionRate">نسبة العمولة (%)</Label>
                  <Input
                    id="commissionRate"
                    type="number"
                    value={settings.commissionRate ?? initialSettings.commissionRate}
                    onChange={(e) => handleInputChange('commissionRate', Number(e.target.value))}
                  />
                </div>
              </div>
            </TabsContent>
            
            {/* System Settings Tab */}
            <TabsContent value="system" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="maintenanceMode">وضع الصيانة</Label>
                  <Switch
                    id="maintenanceMode"
                    checked={settings.maintenanceMode ?? initialSettings.maintenanceMode}
                    onCheckedChange={(checked) => handleInputChange('maintenanceMode', checked)}
                  />
                </div>
                <div>
                  <Label htmlFor="apiRateLimit">حد طلبات API</Label>
                  <Input
                    id="apiRateLimit"
                    type="number"
                    value={settings.apiRateLimit ?? initialSettings.apiRateLimit}
                    onChange={(e) => handleInputChange('apiRateLimit', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="firebaseApiKey">Firebase API Key</Label>
                  <Input
                    id="firebaseApiKey"
                    type="password"
                    value={settings.firebaseConfig?.apiKey ?? initialSettings.firebaseConfig.apiKey}
                    onChange={(e) => handleNestedInputChange('firebaseConfig', 'apiKey', e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end mt-6">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <LoadingSpinner size="sm" className="ml-2" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 ml-2" />
                  حفظ الإعدادات
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}