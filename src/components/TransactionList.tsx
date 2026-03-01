import { useState, useMemo, useEffect } from 'react';
import { Pencil, Trash2, ArrowDownLeft, ArrowUpRight, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BankAccount, Transaction } from '@/types/finance';

interface TransactionListProps {
  transactions: Transaction[];
  accounts: BankAccount[];
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
  fetchPaginatedTransactions?: (page: number, limit: number, type: string, accountId: string) => Promise<{ count: number, results: Transaction[] }>;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
}

export default function TransactionList({ transactions, accounts, onEdit, onDelete, fetchPaginatedTransactions }: TransactionListProps) {
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterAccount, setFilterAccount] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedData, setPaginatedData] = useState<Transaction[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, filterAccount]);

  useEffect(() => {
    if (fetchPaginatedTransactions) {
      setIsLoading(true);
      fetchPaginatedTransactions(currentPage, ITEMS_PER_PAGE, filterType, filterAccount)
        .then(data => {
          setPaginatedData(data.results || []);
          setTotalItems(data.count || 0);
        })
        .finally(() => setIsLoading(false));
    }
  }, [currentPage, filterType, filterAccount, transactions, fetchPaginatedTransactions]);

  const accountMap = useMemo(() => {
    const map: Record<string, BankAccount> = {};
    accounts.forEach(a => { map[a.id] = a; });
    return map;
  }, [accounts]);

  const renderData = fetchPaginatedTransactions ? paginatedData : transactions;
  const totalPages = fetchPaginatedTransactions ? Math.ceil(totalItems / ITEMS_PER_PAGE) : 1;

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-heading font-semibold">
          Transactions {fetchPaginatedTransactions ? `(${totalItems})` : ''}
        </h3>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={filterType} onValueChange={(v) => setFilterType(v as 'all' | 'income' | 'expense')}>
            <SelectTrigger className="w-[120px] bg-secondary border-border h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterAccount} onValueChange={setFilterAccount}>
            <SelectTrigger className="w-[140px] bg-secondary border-border h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accounts</SelectItem>
              {accounts.map(a => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <span className="animate-spin w-6 h-6 border-b-2 border-primary rounded-full"></span>
        </div>
      ) : renderData.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No transactions found.</p>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2 pr-1">
            {renderData.map(tx => {
              const acc = accountMap[tx.accountId];
              return (
                <div key={tx.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/30 group hover:bg-secondary/50 transition-colors gap-3 sm:gap-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-lg ${tx.type === 'income' ? 'bg-income/10' : 'bg-expense/10'}`}>
                      {tx.type === 'income'
                        ? <ArrowDownLeft className="w-4 h-4 text-income" />
                        : <ArrowUpRight className="w-4 h-4 text-expense" />
                      }
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">
                        {tx.description || (tx.type === 'income' ? 'Income' : 'Expense')}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        {acc && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: acc.color }} />
                              {acc.name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2 shrink-0">
                    <span className={`font-heading font-semibold ${tx.type === 'income' ? 'text-income' : 'text-expense'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </span>
                    <div className="flex opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" onClick={() => onEdit(tx)} className="text-muted-foreground hover:text-foreground">
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onDelete(tx.id)} className="text-muted-foreground hover:text-expense">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
