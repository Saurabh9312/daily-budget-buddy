import { useState } from 'react';
import { Plus, Trash2, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BankAccount } from '@/types/finance';

interface AccountManagerProps {
  accounts: BankAccount[];
  addAccount: (name: string, balance: number) => Promise<any> | void;
  deleteAccount: (id: string) => void;
  getAccountBalance: (id: string) => number;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
}

export default function AccountManager({ accounts, addAccount, deleteAccount, getAccountBalance }: AccountManagerProps) {
  const [newName, setNewName] = useState('');
  const [initialBalance, setInitialBalance] = useState('');

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    addAccount(trimmed, Number(initialBalance) || 0);
    setNewName('');
    setInitialBalance('');
  };

  return (
    <div className="glass-card p-5 space-y-4">
      <h3 className="text-lg font-heading font-semibold flex items-center gap-2">
        <Building2 className="w-5 h-5 text-primary" /> Bank Accounts
      </h3>
      <div className="flex gap-2">
        <Input
          placeholder="Account name (e.g. SBI)"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          className="bg-secondary border-border flex-1"
        />
        <Input
          placeholder="Initial Bal"
          type="number"
          value={initialBalance}
          onChange={e => setInitialBalance(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          className="bg-secondary border-border w-24"
        />
        <Button onClick={handleAdd} size="sm" className="shrink-0">
          <Plus className="w-4 h-4 mr-1" /> Add
        </Button>
      </div>
      {accounts.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No accounts yet. Add one above!</p>
      ) : (
        <div className="space-y-2">
          {accounts.map(acc => {
            const bal = getAccountBalance(acc.id);
            return (
              <div key={acc.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border/50 group gap-3 sm:gap-0">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: acc.color }} />
                  <span className="font-medium">{acc.name}</span>
                </div>
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3">
                  <span className={`font-heading font-semibold ${bal >= 0 ? 'text-income' : 'text-expense'}`}>
                    {formatCurrency(bal)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteAccount(acc.id)}
                    className="opacity-100 md:opacity-0 md:group-hover:opacity-100 text-muted-foreground hover:text-expense transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
