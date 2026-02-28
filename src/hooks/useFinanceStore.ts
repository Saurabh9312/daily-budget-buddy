import { useState, useCallback, useMemo } from 'react';
import { BankAccount, Transaction, MonthlyData } from '@/types/finance';

const ACCOUNTS_KEY = 'finance_accounts';
const TRANSACTIONS_KEY = 'finance_transactions';

const ACCOUNT_COLORS = [
  'hsl(160, 84%, 40%)',
  'hsl(220, 80%, 55%)',
  'hsl(280, 70%, 55%)',
  'hsl(35, 90%, 55%)',
  'hsl(340, 75%, 55%)',
  'hsl(180, 70%, 45%)',
];

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function useFinanceStore() {
  const [accounts, setAccounts] = useState<BankAccount[]>(() =>
    loadFromStorage(ACCOUNTS_KEY, [])
  );
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    loadFromStorage(TRANSACTIONS_KEY, [])
  );

  const addAccount = useCallback((name: string) => {
    const account: BankAccount = {
      id: crypto.randomUUID(),
      name,
      color: ACCOUNT_COLORS[accounts.length % ACCOUNT_COLORS.length],
      createdAt: new Date().toISOString(),
    };
    setAccounts(prev => {
      const next = [...prev, account];
      saveToStorage(ACCOUNTS_KEY, next);
      return next;
    });
    return account;
  }, [accounts.length]);

  const deleteAccount = useCallback((id: string) => {
    setAccounts(prev => {
      const next = prev.filter(a => a.id !== id);
      saveToStorage(ACCOUNTS_KEY, next);
      return next;
    });
    setTransactions(prev => {
      const next = prev.filter(t => t.accountId !== id);
      saveToStorage(TRANSACTIONS_KEY, next);
      return next;
    });
  }, []);

  const addTransaction = useCallback((tx: Omit<Transaction, 'id' | 'createdAt'>) => {
    const transaction: Transaction = {
      ...tx,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setTransactions(prev => {
      const next = [transaction, ...prev];
      saveToStorage(TRANSACTIONS_KEY, next);
      return next;
    });
  }, []);

  const updateTransaction = useCallback((id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => {
    setTransactions(prev => {
      const next = prev.map(t => t.id === id ? { ...t, ...updates } : t);
      saveToStorage(TRANSACTIONS_KEY, next);
      return next;
    });
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => {
      const next = prev.filter(t => t.id !== id);
      saveToStorage(TRANSACTIONS_KEY, next);
      return next;
    });
  }, []);

  const totalIncome = useMemo(() =>
    transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    [transactions]
  );

  const totalExpense = useMemo(() =>
    transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    [transactions]
  );

  const balance = totalIncome - totalExpense;

  const getAccountBalance = useCallback((accountId: string) => {
    return transactions
      .filter(t => t.accountId === accountId)
      .reduce((s, t) => s + (t.type === 'income' ? t.amount : -t.amount), 0);
  }, [transactions]);

  const monthlyData = useMemo((): MonthlyData[] => {
    const map = new Map<string, MonthlyData>();
    transactions.forEach(t => {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      if (!map.has(key)) {
        map.set(key, { month: monthNames[d.getMonth()], year: d.getFullYear(), income: 0, expense: 0, net: 0 });
      }
      const entry = map.get(key)!;
      if (t.type === 'income') entry.income += t.amount;
      else entry.expense += t.amount;
      entry.net = entry.income - entry.expense;
    });
    return Array.from(map.values()).sort((a, b) => {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return (a.year - b.year) || (monthNames.indexOf(a.month) - monthNames.indexOf(b.month));
    });
  }, [transactions]);

  const currentMonthData = useMemo(() => {
    const now = new Date();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthlyData.find(m => m.month === monthNames[now.getMonth()] && m.year === now.getFullYear())
      || { month: monthNames[now.getMonth()], year: now.getFullYear(), income: 0, expense: 0, net: 0 };
  }, [monthlyData]);

  return {
    accounts, transactions,
    addAccount, deleteAccount,
    addTransaction, updateTransaction, deleteTransaction,
    totalIncome, totalExpense, balance,
    getAccountBalance, monthlyData, currentMonthData,
  };
}
