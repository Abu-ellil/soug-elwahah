import { apiClient } from './client';
import { Product } from '../../types/order';

interface ProductsResponse {
  success: boolean;
  message: string;
 data: {
    products: Product[];
    total: number;
    page: number;
    limit: number;
  };
}

interface ProductResponse {
  success: boolean;
  message: string;
  data: {
    product: Product;
  };
}

interface UpdateProductPayload {
  availability?: 'available' | 'out_of_stock';
}

export const productsAPI = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; storeId?: string; categoryId?: string; availability?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.storeId) queryParams.append('storeId', params.storeId);
    if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
    if (params?.availability) queryParams.append('availability', params.availability);
    
    const queryString = queryParams.toString();
    const endpoint = `/admin/products${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<ProductsResponse>(endpoint);
  },

  getById: async (id: string) => {
    return apiClient.get<ProductResponse>(`/admin/products/${id}`);
  },

  update: async (id: string, payload: UpdateProductPayload) => {
    return apiClient.patch<ProductResponse>(`/admin/products/${id}`, payload);
  },

  delete: async (id: string) => {
    return apiClient.delete<ProductResponse>(`/admin/products/${id}`);
  },
};