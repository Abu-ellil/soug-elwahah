import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onActionClick?: () => void;
}

export function EmptyState({ title, description, actionText, onActionClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="bg-muted rounded-full p-4 mb-4">
        <Package className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      {actionText && onActionClick && (
        <Button onClick={onActionClick}>
          {actionText}
        </Button>
      )}
    </div>
  );
}