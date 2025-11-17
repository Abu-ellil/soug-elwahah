'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { Category } from '@/types/store';
import { categoriesAPI } from '@/lib/api/categories';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

// Mock data - will be replaced with actual API calls
const mockCategories: Category[] = [
  {
    id: '1',
    name: { ar: 'أرز', en: 'Rice' },
    icon: '🍚',
    color: '#3B82F6',
    order: 1,
    status: 'active',
    totalStores: 24,
  },
  {
    id: '2',
    name: { ar: 'زيوت', en: 'Oils' },
    icon: '🧴',
    color: '#8B5CF6',
    order: 2,
    status: 'active',
    totalStores: 18,
  },
  {
    id: '3',
    name: { ar: 'سكريات', en: 'Sweets' },
    icon: '🍬',
    color: '#10B981',
    order: 3,
    status: 'active',
    totalStores: 15,
  },
  {
    id: '4',
    name: { ar: 'شاي', en: 'Tea' },
    icon: '☕',
    color: '#F59E0B',
    order: 4,
    status: 'inactive',
    totalStores: 8,
  },
  {
    id: '5',
    name: { ar: 'ألبان', en: 'Dairy' },
    icon: '🥛',
    color: '#EF4444',
    order: 5,
    status: 'active',
    totalStores: 12,
  },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
 const [loading, setLoading] = useState(true);
 const [totalCategories, setTotalCategories] = useState(0);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCategories(mockCategories);
      setTotalCategories(mockCategories.length);
      setLoading(false);
    }, 10);
  }, []);

  const handleAddCategory = () => {
    console.log('Add new category');
  };

  const handleEditCategory = (id: string) => {
    console.log('Edit category:', id);
  };

  const handleDeleteCategory = (id: string) => {
    console.log('Delete category:', id);
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
          <h1 className="text-2xl font-bold">إدارة التصنيفات</h1>
          <p className="text-muted-foreground">إدارة تصنيفات المنتجات</p>
        </div>
        <Button onClick={handleAddCategory}>
          <Plus className="h-4 w-4 ml-2" />
          إضافة تصنيف
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>قائمة التصنيفات</CardTitle>
          <Badge variant="secondary">{totalCategories} تصنيف</Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div 
                key={category.id} 
                className="border rounded-lg p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                    style={{ backgroundColor: `${category.color}20`, color: category.color }}
                  >
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="font-medium">{category.name.ar}</h3>
                    <p className="text-sm text-muted-foreground">{category.name.en}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {category.totalStores} متجر
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditCategory(category.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}