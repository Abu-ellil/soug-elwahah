import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number; // percentage
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
}

export function StatsCard({ title, value, change, icon: Icon, color = 'primary' }: StatsCardProps) {
  const colorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
    info: 'text-info',
  };

  const iconColor = colorClasses[color as keyof typeof colorClasses] || colorClasses.primary;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <p className="text-xs text-muted-foreground mt-1">
            {change >= 0 ? (
              <span className="text-success flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" /> 
                {change.toFixed(1)}%
              </span>
            ) : (
              <span className="text-danger flex items-center">
                <TrendingDown className="h-3 w-3 mr-1" /> 
                {Math.abs(change).toFixed(1)}%
              </span>
            )}
            <span className="mr-1">مقارنة بالشهر الماضي</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}