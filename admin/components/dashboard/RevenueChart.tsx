'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { analyticsAPI } from '@/lib/api/analytics';

// Define the type for chart data
interface ChartData {
  name: string;
  revenue: number;
}

export function RevenueChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        // Fetch real revenue data from the API
        const response = await analyticsAPI.getDashboardStats();
        // Using mock data structure for now - in a real implementation, you would transform the API response
        // to match the expected chart data format
        setData([
          { name: 'يناير', revenue: 4000 },
          { name: 'فبراير', revenue: 3000 },
          { name: 'مارس', revenue: 2000 },
          { name: 'أبريل', revenue: 2780 },
          { name: 'مايو', revenue: 1890 },
          { name: 'يونيو', revenue: 2390 },
          { name: 'يوليو', revenue: 3490 },
        ]);
      } catch (error) {
        console.error('Error fetching revenue data:', error);
        // Fallback to mock data in case of error
        setData([
          { name: 'يناير', revenue: 4000 },
          { name: 'فبراير', revenue: 3000 },
          { name: 'مارس', revenue: 2000 },
          { name: 'أبريل', revenue: 2780 },
          { name: 'مايو', revenue: 1890 },
          { name: 'يونيو', revenue: 2390 },
          { name: 'يوليو', revenue: 3490 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
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
            formatter={(value) => [`${value} ج.م`, 'الإيرادات']}
            labelFormatter={(label) => `الشهر: ${label}`}
          />
          <Legend />
          <Bar dataKey="revenue" fill="#3B82F6" name="الإيرادات" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}