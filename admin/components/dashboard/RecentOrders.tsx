import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Order, OrderStatus } from '@/types/order';

interface RecentOrdersProps {
  orders: Order[];
}

// Helper function to get status badge variant
const getStatusVariant = (status: OrderStatus) => {
 switch (status) {
    case 'pending':
      return 'secondary';
    case 'accepted':
    case 'confirmed':
    case 'picked_up':
    case 'in_transit':
      return 'default';
    case 'delivered':
      return 'secondary'; // Using secondary since 'success' is not available
    case 'cancelled':
    case 'refunded':
      return 'destructive';
    default:
      return 'secondary';
  }
};

// Helper function to get status text
const getStatusText = (status: OrderStatus) => {
 switch (status) {
    case 'pending': return 'معلق';
    case 'accepted': return 'مقبول';
    case 'confirmed': return 'مؤكد';
    case 'picked_up': return 'تم الاستلام';
    case 'in_transit': return 'في الطريق';
    case 'delivered': return 'تم التوصيل';
    case 'cancelled': return 'ملغي';
    case 'refunded': return 'مسترجع';
    default: return status;
  }
};

export function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>رقم الطلب</TableHead>
          <TableHead>العميل</TableHead>
          <TableHead>المحل</TableHead>
          <TableHead>السائق</TableHead>
          <TableHead>المبلغ</TableHead>
          <TableHead>الحالة</TableHead>
          <TableHead>التاريخ</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium">{order.id}</TableCell>
            <TableCell>{order.userName}</TableCell>
            <TableCell>{order.storeName}</TableCell>
            <TableCell>{order.driverName || '-'}</TableCell>
            <TableCell>{order.total} ج.م</TableCell>
            <TableCell>
              <Badge variant={getStatusVariant(order.status)}>
                {getStatusText(order.status)}
              </Badge>
            </TableCell>
            <TableCell>{new Date(order.createdAt).toLocaleDateString('ar-EG')}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}