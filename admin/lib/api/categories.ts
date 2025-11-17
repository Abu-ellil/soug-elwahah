import { apiClient } from './client';
import { Category } from '../../types/store';

interface CategoriesResponse {
  success: boolean;
  message: string;
 data: {
    categories: Category[];
    total: number;
    page: number;
    limit: number;
  };
}

interface CategoryResponse {
  success: boolean;
  message: string;
  data: {
    category: Category;
  };
}

interface CreateCategoryPayload {
  name: {
    ar: string;
    en: string;
  };
  icon: string;
  color: string;
  order: number;
  status: 'active' | 'inactive';
}

interface UpdateCategoryPayload {
  name?: {
    ar: string;
    en: string;
  };
  icon?: string;
  color?: string;
  order?: number;
  status?: 'active' | 'inactive';
}

export const categoriesAPI = {
 getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    
    const queryString = queryParams.toString();
    const endpoint = `/admin/categories${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<CategoriesResponse>(endpoint);
  },

  getById: async (id: string) => {
    return apiClient.get<CategoryResponse>(`/admin/categories/${id}`);
  },

  create: async (payload: CreateCategoryPayload) => {
    return apiClient.post<CategoryResponse>('/admin/categories', payload);
  },

  update: async (id: string, payload: UpdateCategoryPayload) => {
    return apiClient.patch<CategoryResponse>(`/admin/categories/${id}`, payload);
  },

  delete: async (id: string) => {
    return apiClient.delete<CategoryResponse>(`/admin/categories/${id}`);
  },
};