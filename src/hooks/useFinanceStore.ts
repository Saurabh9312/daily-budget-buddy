import { useState, useCallback, useMemo, useEffect } from 'react';
import { useAuthStore } from './useAuthStore';
import { BankAccount, Transaction, MonthlyData } from '@/types/finance';

const API_BASE = 'http://127.0.0.1:8000/api';

const ACCOUNT_COLORS = [
  'hsl(160, 84%, 40%)',
  'hsl(220, 80%, 55%)',
  'hsl(280, 70%, 55%)',
  'hsl(35, 90%, 55%)',
  'hsl(340, 75%, 55%)',
  'hsl(180, 70%, 45%)',
];

export function useFinanceStore() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const token = useAuthStore(state => state.token);
  const getHeaders = useCallback(() => {
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }, [token]);

  useEffect(() => {
    async function fetchData() {
      if (!token) return;
      try {
        const [accRes, txRes] = await Promise.all([
          fetch(`${API_BASE}/accounts/`, { headers: getHeaders() }),
          fetch(`${API_BASE}/transactions/`, { headers: getHeaders() })
        ]);
        if (accRes.ok && txRes.ok) {
          const accData = await accRes.json();
          const txData = await txRes.json();
          setAccounts(accData);
          setTransactions(txData);
        }
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [getHeaders, token]);

  const addAccount = useCallback(async (name: string) => {
    const color = ACCOUNT_COLORS[accounts.length % ACCOUNT_COLORS.length];
    try {
      const res = await fetch(`${API_BASE}/accounts/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name, color }),
      });
      const account = await res.json();
      setAccounts(prev => [account, ...prev]);
      return account;
    } catch (err) {
      console.error('Failed to add account', err);
    }
  }, [accounts.length]);

  const deleteAccount = useCallback(async (id: string) => {
    try {
      await fetch(`${API_BASE}/accounts/${id}/`, { method: 'DELETE', headers: getHeaders() });
      setAccounts(prev => prev.filter(a => a.id !== id));
      setTransactions(prev => prev.filter(t => t.accountId !== id));
    } catch (err) {
      console.error('Failed to delete account', err);
    }
  }, []);

  const addTransaction = useCallback(async (tx: Omit<Transaction, 'id' | 'createdAt'>) => {
    try {
      const res = await fetch(`${API_BASE}/transactions/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          ...tx,
        }),
      });
      const transaction = await res.json();
      setTransactions(prev => [transaction, ...prev]);
    } catch (err) {
      console.error('Failed to add transaction', err);
    }
  }, []);

  const updateTransaction = useCallback(async (id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => {
    const existing = transactions.find(t => t.id === id);
    if (!existing) return;
    try {
      const res = await fetch(`${API_BASE}/transactions/${id}/`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ ...existing, ...updates }),
      });
      const updatedTx = await res.json();
      setTransactions(prev => prev.map(t => t.id === id ? updatedTx : t));
    } catch (err) {
      console.error('Failed to update transaction', err);
    }
  }, [transactions]);

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      await fetch(`${API_BASE}/transactions/${id}/`, { method: 'DELETE', headers: getHeaders() });
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Failed to delete transaction', err);
    }
  }, []);

  const totalIncome = useMemo(() =>
    transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0),
    [transactions]
  );

  const totalExpense = useMemo(() =>
    transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0),
    [transactions]
  );

  const balance = totalIncome - totalExpense;

  const getAccountBalance = useCallback((accountId: string) => {
    return transactions
      .filter(t => t.accountId === accountId)
      .reduce((s, t) => s + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)), 0);
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
      if (t.type === 'income') entry.income += Number(t.amount);
      else entry.expense += Number(t.amount);
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
    accounts, transactions, loading,
    addAccount, deleteAccount,
    addTransaction, updateTransaction, deleteTransaction,
    totalIncome, totalExpense, balance,
    getAccountBalance, monthlyData, currentMonthData,
  };
}
