import { useState } from 'react';
import { Wallet } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { useFinanceStore } from '@/hooks/useFinanceStore';
import Dashboard from '@/components/Dashboard';
import AccountManager from '@/components/AccountManager';
import TransactionForm from '@/components/TransactionForm';
import TransactionList from '@/components/TransactionList';
import MonthlyChart from '@/components/MonthlyChart';
import { Transaction } from '@/types/finance';

const Index = () => {
  const store = useFinanceStore();
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-heading font-bold tracking-tight">MoneyTrack</h1>
              <p className="text-xs text-muted-foreground">Smart finance management</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <Dashboard
          balance={store.balance}
          totalIncome={store.totalIncome}
          totalExpense={store.totalExpense}
          currentMonthData={store.currentMonthData}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <TransactionForm
              key={editingTx?.id || 'new'}
              accounts={store.accounts}
              onSubmit={store.addTransaction}
              editingTx={editingTx}
              onCancelEdit={() => setEditingTx(null)}
              onUpdate={store.updateTransaction}
            />
            <AccountManager
              accounts={store.accounts}
              addAccount={store.addAccount}
              deleteAccount={store.deleteAccount}
              getAccountBalance={store.getAccountBalance}
            />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <MonthlyChart data={store.monthlyData} />
            <TransactionList
              transactions={store.transactions}
              accounts={store.accounts}
              onEdit={setEditingTx}
              onDelete={store.deleteTransaction}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
