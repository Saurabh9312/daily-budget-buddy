import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { MonthlyData } from '@/types/finance';

interface MonthlyChartProps {
  data: MonthlyData[];
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export default function MonthlyChart({ data }: MonthlyChartProps) {
  const chartData = data.slice(-6).map(d => ({
    name: `${d.month} ${d.year}`,
    Income: d.income,
    Expense: d.expense,
  }));

  return (
    <div className="glass-card p-5 space-y-4">
      <h3 className="text-lg font-heading font-semibold">Monthly Overview</h3>
      {chartData.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Add transactions to see monthly data.</p>
      ) : (
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
              <XAxis dataKey="name" tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(222, 44%, 9%)', border: '1px solid hsl(222, 30%, 18%)', borderRadius: '8px', color: 'hsl(210, 40%, 96%)' }}
                formatter={(value: number) => [formatCurrency(value)]}
              />
              <Bar dataKey="Income" fill="hsl(160, 84%, 40%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Expense" fill="hsl(0, 72%, 55%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
