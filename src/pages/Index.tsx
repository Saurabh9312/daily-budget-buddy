import { useState, useEffect } from 'react';
import { Wallet, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/ThemeToggle';
import { useAuthStore } from '@/hooks/useAuthStore';
import { useFinanceStore } from '@/hooks/useFinanceStore';
import { useProfileStore } from '@/hooks/useProfileStore';
import Dashboard from '@/components/Dashboard';
import UserProfileModal from '@/components/UserProfileModal';
import AccountManager from '@/components/AccountManager';
import TransactionForm from '@/components/TransactionForm';
import TransactionList from '@/components/TransactionList';
import MonthlyChart from '@/components/MonthlyChart';
import { Transaction } from '@/types/finance';

const Index = () => {
  const store = useFinanceStore();
  const logout = useAuthStore(state => state.logout);
  const { fetchProfile } = useProfileStore();
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (store.loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

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
          <div className="flex items-center gap-2">
            <UserProfileModal />
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => logout()} aria-label="Log out">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
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
