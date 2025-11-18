import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
 Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Store as StoreType } from '@/types/store';

interface EditStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: StoreType | null;
  onSave: (id: string, updates: Partial<StoreType>) => void;
}

export function EditStoreModal({ 
  isOpen, 
  onClose, 
  store, 
  onSave 
}: EditStoreModalProps) {
  const [formData, setFormData] = useState<Partial<StoreType>>({
    name: '',
    ownerName: '',
    ownerPhone: '',
    category: '',
    status: 'open',
    address: '',
    workingHours: { open: '08:00', close: '22:00' },
  });

  useEffect(() => {
    if (store) {
      setFormData({
        name: store.name,
        ownerName: store.ownerName,
        ownerPhone: store.ownerPhone,
        category: store.category,
        status: store.status,
        address: store.address,
        workingHours: store.workingHours,
      });
    } else {
      setFormData({
        name: '',
        ownerName: '',
        ownerPhone: '',
        category: '',
        status: 'open',
        address: '',
        workingHours: { open: '08:00', close: '22:00' },
      });
    }
  }, [store]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
 };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleWorkingHoursChange = (type: 'open' | 'close', value: string) => {
    setFormData(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [type]: value
      } as { open: string; close: string }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (store) {
      onSave(store.id, formData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>تعديل المتجر</DialogTitle>
          <DialogDescription>
            قم بتحديث معلومات المتجر أدناه
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                اسم المتجر
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ownerName" className="text-right">
                اسم المالك
              </Label>
              <Input
                id="ownerName"
                name="ownerName"
                value={formData.ownerName || ''}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ownerPhone" className="text-right">
                هاتف المالك
              </Label>
              <Input
                id="ownerPhone"
                name="ownerPhone"
                value={formData.ownerPhone || ''}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                الفئة
              </Label>
              <Input
                id="category"
                name="category"
                value={formData.category || ''}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                العنوان
              </Label>
              <Input
                id="address"
                name="address"
                value={formData.address || ''}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                الحالة
              </Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">مفتوح</SelectItem>
                  <SelectItem value="closed">مغلق</SelectItem>
                  <SelectItem value="suspended">معلق</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="workingHoursOpen" className="text-right">
                وقت الفتح
              </Label>
              <Input
                id="workingHoursOpen"
                type="time"
                value={formData.workingHours?.open || '08:00'}
                onChange={(e) => handleWorkingHoursChange('open', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="workingHoursClose" className="text-right">
                وقت الإغلاق
              </Label>
              <Input
                id="workingHoursClose"
                type="time"
                value={formData.workingHours?.close || '22:00'}
                onChange={(e) => handleWorkingHoursChange('close', e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">حفظ التغييرات</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
