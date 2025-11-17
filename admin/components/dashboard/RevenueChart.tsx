import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Import necessary modules to fetch real data
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
        const response = await analyticsAPI.getRevenueData();
        setData(response.data.revenueByMonth || []);
      } catch (error) {
        console.error('Error fetching revenue data:', error);
        // Fallback to empty array in case of error
        setData([]);
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

export function RevenueChart() {
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