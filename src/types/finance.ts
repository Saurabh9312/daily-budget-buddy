export interface BankAccount {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  accountId: string;
  date: string;
  createdAt: string;
}

export interface MonthlyData {
  month: string;
  year: number;
  income: number;
  expense: number;
  net: number;
}
