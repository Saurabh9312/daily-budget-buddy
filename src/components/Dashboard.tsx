import { TrendingUp, TrendingDown, Wallet, CalendarDays } from 'lucide-react';

interface DashboardProps {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  currentMonthData: { income: number; expense: number; net: number; month: string; year: number };
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
}

const StatCard = ({
  label, value, icon: Icon, variant,
}: {
  label: string; value: number; icon: React.ElementType;
  variant: 'balance' | 'income' | 'expense' | 'month';
}) => {
  const styles = {
    balance: 'border-primary/30 bg-primary/5',
    income: 'border-income/30 bg-income/5',
    expense: 'border-expense/30 bg-expense/5',
    month: 'border-muted-foreground/20 bg-muted/30',
  };
  const iconStyles = {
    balance: 'text-primary',
    income: 'text-income',
    expense: 'text-expense',
    month: 'text-muted-foreground',
  };

  return (
    <div className={`glass-card p-5 border ${styles[variant]} transition-all hover:scale-[1.02]`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground font-medium">{label}</span>
        <Icon className={`w-5 h-5 ${iconStyles[variant]}`} />
      </div>
      <p className={`text-2xl font-heading font-bold ${iconStyles[variant]}`}>
        {formatCurrency(value)}
      </p>
    </div>
  );
};

export default function Dashboard({ balance, totalIncome, totalExpense, currentMonthData }: DashboardProps) {
  const now = new Date();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-heading font-bold">Dashboard</h2>
        <span className="text-sm text-muted-foreground">
          {now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Balance" value={balance} icon={Wallet} variant="balance" />
        <StatCard label="Total Income" value={totalIncome} icon={TrendingUp} variant="income" />
        <StatCard label="Total Expenses" value={totalExpense} icon={TrendingDown} variant="expense" />
        <StatCard label={`${currentMonthData.month} ${currentMonthData.year} Net`} value={currentMonthData.net} icon={CalendarDays} variant="month" />
      </div>
    </div>
  );
}
