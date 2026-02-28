import { useState } from 'react';
import { Plus, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BankAccount, Transaction } from '@/types/finance';

interface TransactionFormProps {
  accounts: BankAccount[];
  onSubmit: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  editingTx?: Transaction | null;
  onCancelEdit?: () => void;
  onUpdate?: (id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => void;
}

export default function TransactionForm({ accounts, onSubmit, editingTx, onCancelEdit, onUpdate }: TransactionFormProps) {
  const today = new Date().toISOString().split('T')[0];
  const [type, setType] = useState<'income' | 'expense'>(editingTx?.type || 'expense');
  const [amount, setAmount] = useState(editingTx?.amount.toString() || '');
  const [description, setDescription] = useState(editingTx?.description || '');
  const [accountId, setAccountId] = useState(editingTx?.accountId || '');
  const [date, setDate] = useState(editingTx?.date || today);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || !accountId || !date) return;

    if (editingTx && onUpdate) {
      onUpdate(editingTx.id, { type, amount: parsedAmount, description, accountId, date });
      onCancelEdit?.();
    } else {
      onSubmit({ type, amount: parsedAmount, description, accountId, date });
    }
    setAmount('');
    setDescription('');
    if (!editingTx) setDate(today);
  };

  return (
    <div className="glass-card p-5 space-y-4">
      <h3 className="text-lg font-heading font-semibold">
        {editingTx ? 'Edit Transaction' : 'Add Transaction'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <Button
            type="button"
            variant={type === 'income' ? 'default' : 'outline'}
            onClick={() => setType('income')}
            className={`flex-1 ${type === 'income' ? 'bg-income text-income-foreground hover:bg-income/90' : ''}`}
          >
            <ArrowDownLeft className="w-4 h-4 mr-1" /> Income
          </Button>
          <Button
            type="button"
            variant={type === 'expense' ? 'default' : 'outline'}
            onClick={() => setType('expense')}
            className={`flex-1 ${type === 'expense' ? 'bg-expense text-expense-foreground hover:bg-expense/90' : ''}`}
          >
            <ArrowUpRight className="w-4 h-4 mr-1" /> Expense
          </Button>
        </div>

        <Input
          type="number"
          placeholder="Amount (₹)"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          min="0.01"
          step="0.01"
          required
          className="bg-secondary border-border"
        />

        <Select value={accountId} onValueChange={setAccountId} required>
          <SelectTrigger className="bg-secondary border-border">
            <SelectValue placeholder="Select account" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map(a => (
              <SelectItem key={a.id} value={a.id}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: a.color }} />
                  {a.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          required
          className="bg-secondary border-border"
        />

        <Input
          placeholder="Description (optional)"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="bg-secondary border-border"
        />

        <div className="flex gap-2">
          <Button type="submit" className="flex-1">
            <Plus className="w-4 h-4 mr-1" /> {editingTx ? 'Update' : 'Add'}
          </Button>
          {editingTx && (
            <Button type="button" variant="outline" onClick={onCancelEdit}>Cancel</Button>
          )}
        </div>
      </form>
    </div>
  );
}
