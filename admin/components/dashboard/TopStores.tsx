'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { analyticsAPI } from '@/lib/api/analytics';

// Define the type for chart data
interface StoreData {
  name: string;
  orders: number;
}

export function TopStores() {
  const [data, setData] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopStoresData = async () => {
          try {
            // Fetch real analytics data from the API which includes top stores
            const response = await analyticsAPI.getDashboardStats();
            // Transform the top stores data to match the chart format
            const transformedData = response.data.topStores?.map(store => ({
              name: store.storeName,
              orders: store.orders
            })) || [];
            setData(transformedData);
          } catch (error) {
            console.error('Error fetching top stores data:', error);
            // Fallback to sample data in case of error
                         setData([
                           { name: 'المحل 1', orders: 400 },
                           { name: 'المحل 2', orders: 300 },
                           { name: 'المحل 3', orders: 200 },
                           { name: 'المحل 4', orders: 278 },
                           { name: 'المحل 5', orders: 189 },
                         ]);
          } finally {
            setLoading(false);
          }
        };

    fetchTopStoresData();
  }, []);

  if (loading) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip
            formatter={(value) => [`${value} طلب`, 'عدد الطلبات']}
            labelFormatter={(label) => `المحل: ${label}`}
          />
          <Legend />
          <Bar dataKey="orders" fill="#8B5CF6" name="عدد الطلبات" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}