import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Mock data for top stores
const data = [
  { name: 'المحل 1', orders: 400 },
  { name: 'المحل 2', orders: 300 },
  { name: 'المحل 3', orders: 200 },
  { name: 'المحل 4', orders: 278 },
  { name: 'المحل 5', orders: 189 },
];

export function TopStores() {
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