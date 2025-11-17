import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Mock data for the chart
const data = [
  { name: 'يناير', revenue: 4000 },
  { name: 'فبراير', revenue: 3000 },
  { name: 'مارس', revenue: 2000 },
  { name: 'أبريل', revenue: 2780 },
  { name: 'مايو', revenue: 1890 },
  { name: 'يونيو', revenue: 2390 },
  { name: 'يوليو', revenue: 3490 },
];

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