import { Badge } from '@/components/ui/badge';
import { OrderStatus } from '@/types/order';
import { User } from '@/types/user';
import { Driver } from '@/types/driver';
import { Store } from '@/types/store';

interface StatusBadgeProps {
  status: OrderStatus | User['status'] | Driver['status'] | Store['status'] | Store['verificationStatus'] | Driver['verificationStatus'];
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const getStatusVariant = () => {
    switch (status) {
      // Order statuses
      case 'pending':
      case 'accepted':
      case 'confirmed':
      case 'picked_up':
      case 'in_transit':
        return 'secondary';
      case 'delivered':
        return 'default';
      case 'cancelled':
      case 'refunded':
        return 'destructive';
      
      // User/Driver/Store statuses
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      
      // Verification statuses
      case 'approved':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      
      // Driver statuses
      case 'available':
        return 'default';
      case 'busy':
        return 'secondary';
      case 'offline':
        return 'outline';
      
      // Store statuses
      case 'open':
        return 'default';
      case 'closed':
        return 'secondary';
      case 'suspended':
        return 'destructive';
      
      default:
        return 'secondary';
    }
  };

  const getStatusText = () => {
    switch (status) {
      // Order statuses
      case 'pending': return 'معلق';
      case 'accepted': return 'مقبول';
      case 'confirmed': return 'مؤكد';
      case 'picked_up': return 'تم الاستلام';
      case 'in_transit': return 'في الطريق';
      case 'delivered': return 'تم التوصيل';
      case 'cancelled': return 'ملغي';
      case 'refunded': return 'مسترجع';
      
      // User/Driver/Store statuses
      case 'active': return 'نشط';
      case 'inactive': return 'غير نشط';
      
      // Verification statuses
      case 'approved': return 'تم التحقق';
      case 'pending': return 'في الانتظار';
      case 'rejected': return 'مرفوض';
      
      // Driver statuses
      case 'available': return 'متاح';
      case 'busy': return 'مشغول';
      case 'offline': return 'غير متاح';
      
      // Store statuses
      case 'open': return 'مفتوح';
      case 'closed': return 'مغلق';
      case 'suspended': return 'معلق';
      
      default: return status;
    }
  };

  return (
    <Badge variant={getStatusVariant() as any} className={size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-lg' : ''}>
      {getStatusText()}
    </Badge>
  );
}